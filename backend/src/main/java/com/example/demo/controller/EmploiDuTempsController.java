package com.example.demo.controller;

import com.example.demo.dto.EmploiDuTempsDTO;
import com.example.demo.entity.Etudiant;
import com.example.demo.entity.Groupe;
import com.example.demo.entity.Matiere;
import com.example.demo.entity.Seance;
import com.example.demo.repository.EtudiantRepository;
import com.example.demo.repository.GroupeRepository;
import com.example.demo.repository.SeanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * US12 : Emploi du temps interactif de l'étudiant et des classes.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class EmploiDuTempsController {

    private final EtudiantRepository etudiantRepository;
    private final GroupeRepository groupeRepository;
    private final SeanceRepository seanceRepository;

    @GetMapping("/etudiants/{id}/emploi-du-temps")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getEmploiDuTempsByEtudiant(@PathVariable Long id) {
        log.info("Récupération de l'emploi du temps pour l'étudiant ID: {}", id);

        Optional<Etudiant> etuOpt = etudiantRepository.findById(id);
        if (etuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Étudiant introuvable."));
        }

        Etudiant etudiant = etuOpt.get();
        Groupe groupe = etudiant.getGroupe();

        if (groupe == null) {
            return ResponseEntity.ok(EmploiDuTempsDTO.builder()
                    .etudiantId(etudiant.getId())
                    .groupeId(null)
                    .groupeCode("NON_ASSIGNE")
                    .groupeNom("Aucune classe assignée")
                    .seances(Collections.emptyList())
                    .build());
        }

        return ResponseEntity.ok(buildEmploiDuTempsForGroupe(etudiant.getId(), groupe));
    }

    @GetMapping("/groupes/{groupeId}/emploi-du-temps")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getEmploiDuTempsByGroupe(@PathVariable Long groupeId) {
        Optional<Groupe> grpOpt = groupeRepository.findById(groupeId);
        if (grpOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Classe introuvable."));
        }
        return ResponseEntity.ok(buildEmploiDuTempsForGroupe(null, grpOpt.get()));
    }

    private EmploiDuTempsDTO buildEmploiDuTempsForGroupe(Long etudiantId, Groupe groupe) {
        List<Seance> seances = seanceRepository.findByGroupeIdOrderByDateSeanceDesc(groupe.getId());
        LocalTime nowTime = LocalTime.now();
        LocalDate today = LocalDate.now();

        List<EmploiDuTempsDTO.SeancePlanningDTO> planning = new ArrayList<>();

        // 1. Ajouter les séances réelles enregistrées en base
        for (Seance s : seances) {
            LocalDate date = s.getDateSeance() != null ? s.getDateSeance() : today;
            DayOfWeek dow = date.getDayOfWeek();
            String jourSemaine = dow.name();
            String jourLabel = dow.getDisplayName(TextStyle.FULL, Locale.FRENCH);
            jourLabel = jourLabel.substring(0, 1).toUpperCase() + jourLabel.substring(1);

            boolean isToday = date.equals(today);
            boolean enCours = isToday && s.getHeureDebut() != null && s.getHeureFin() != null
                    && !nowTime.isBefore(s.getHeureDebut()) && !nowTime.isAfter(s.getHeureFin());

            String profNom = (s.getEnseignant() != null && s.getEnseignant().getUser() != null)
                    ? "Prof. " + s.getEnseignant().getUser().getPrenom() + " " + s.getEnseignant().getUser().getNom()
                    : "Enseignant";

            String creneau = (s.getHeureDebut() != null && s.getHeureFin() != null)
                    ? s.getHeureDebut() + " — " + s.getHeureFin()
                    : "08:30 — 10:15";

            planning.add(EmploiDuTempsDTO.SeancePlanningDTO.builder()
                    .seanceId(s.getId())
                    .dateSeance(date)
                    .jourSemaine(jourSemaine)
                    .jourLabel(jourLabel)
                    .heureDebut(s.getHeureDebut() != null ? s.getHeureDebut() : LocalTime.of(8, 30))
                    .heureFin(s.getHeureFin() != null ? s.getHeureFin() : LocalTime.of(10, 15))
                    .creneauHoraire(creneau)
                    .typeSeance(s.getTypeSeance() != null ? s.getTypeSeance() : "COURS")
                    .salle(s.getSalle() != null ? s.getSalle() : "SALLE-01")
                    .matiereId(s.getMatiere() != null ? s.getMatiere().getId() : null)
                    .matiereCode(s.getMatiere() != null ? s.getMatiere().getCode() : "")
                    .matiereNom(s.getMatiere() != null ? s.getMatiere().getNom() : "")
                    .enseignantId(s.getEnseignant() != null ? s.getEnseignant().getId() : null)
                    .enseignantNom(profNom)
                    .statut(s.getStatut() != null ? s.getStatut() : (enCours ? "EN_COURS" : "PLANIFIEE"))
                    .estEnCours(enCours)
                    .build());
        }

        // 2. Si le groupe n'a pas encore de séances enregistrées mais a des matières associées,
        // générer une grille de cours modèle sur la semaine
        if (planning.isEmpty() && groupe.getMatieres() != null && !groupe.getMatieres().isEmpty()) {
            List<Matiere> matieres = new ArrayList<>(groupe.getMatieres());
            String[] jours = {"LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI"};
            String[] joursFr = {"Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"};
            String[][] creneaux = {
                    {"08:30", "10:15"},
                    {"10:30", "12:15"},
                    {"14:00", "15:45"},
                    {"16:00", "17:45"}
            };
            String[] salles = {"Labo 03", "Amphi A", "Salle 204", "Labo 05", "Salle 102"};
            String[] types = {"COURS", "TD", "TP", "COURS"};

            int matIdx = 0;
            for (int j = 0; j < jours.length; j++) {
                // 2 séances par jour
                for (int c = 0; c < 2; c++) {
                    Matiere m = matieres.get(matIdx % matieres.size());
                    matIdx++;

                    LocalTime hDeb = LocalTime.parse(creneaux[c][0]);
                    LocalTime hFin = LocalTime.parse(creneaux[c][1]);

                    planning.add(EmploiDuTempsDTO.SeancePlanningDTO.builder()
                            .seanceId((long) (1000 + j * 10 + c))
                            .dateSeance(today.plusDays(j))
                            .jourSemaine(jours[j])
                            .jourLabel(joursFr[j])
                            .heureDebut(hDeb)
                            .heureFin(hFin)
                            .creneauHoraire(creneaux[c][0] + " — " + creneaux[c][1])
                            .typeSeance(types[(j + c) % types.length])
                            .salle(salles[(j + c) % salles.length])
                            .matiereId(m.getId())
                            .matiereCode(m.getCode())
                            .matiereNom(m.getNom())
                            .enseignantId(1L)
                            .enseignantNom("Équipe Pédagogique UPF")
                            .statut("PLANIFIEE")
                            .estEnCours(false)
                            .build());
                }
            }
        }

        // Tri chronologique
        planning.sort((p1, p2) -> {
            if (p1.getDateSeance() == null || p2.getDateSeance() == null) return 0;
            int comp = p1.getDateSeance().compareTo(p2.getDateSeance());
            if (comp != 0) return comp;
            return p1.getHeureDebut().compareTo(p2.getHeureDebut());
        });

        return EmploiDuTempsDTO.builder()
                .etudiantId(etudiantId)
                .groupeId(groupe.getId())
                .groupeCode(groupe.getCode())
                .groupeNom(groupe.getNom())
                .filiere(groupe.getFiliere())
                .anneeScolaire(groupe.getAnneeScolaire())
                .seances(planning)
                .build();
    }
}
