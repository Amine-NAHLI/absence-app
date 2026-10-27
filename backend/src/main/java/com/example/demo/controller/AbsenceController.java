package com.example.demo.controller;

import com.example.demo.dto.AbsenceResponseDTO;
import com.example.demo.dto.EnregistrerAppelRequest;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.*;
import com.example.demo.service.NotificationService;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/absences")
@RequiredArgsConstructor
@Slf4j
public class AbsenceController {

    private final AbsenceRepository absenceRepository;
    private final SeanceRepository seanceRepository;
    private final EnseignantRepository enseignantRepository;
    private final EtudiantRepository etudiantRepository;
    private final JustificatifRepository justificatifRepository;
    private final NotificationService notificationService;

    /**
     * US03 : Enregistrer l'absence d'un étudiant avec contrôle strict anti-doublon.
     */
    @PostMapping("/enregistrer-appel")
    @Transactional
    public ResponseEntity<?> enregistrerAppel(@Valid @RequestBody EnregistrerAppelRequest request) {
        log.info("Enregistrement de l'appel pour la séance ID: {} par l'enseignant ID: {}",
                request.getSeanceId(), request.getEnseignantId());

        Seance seance = seanceRepository.findById(request.getSeanceId())
                .orElse(null);
        if (seance == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Séance introuvable."));
        }

        Enseignant enseignant = enseignantRepository.findById(request.getEnseignantId())
                .orElse(null);
        if (enseignant == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Enseignant introuvable."));
        }

        int enregistres = 0;
        int misAJour = 0;

        if (request.getAbsents() != null) {
            for (EnregistrerAppelRequest.EtudiantPresenceItem item : request.getAbsents()) {
                Long etudiantId = item.getEtudiantId();
                TypePresence typePresence = item.getTypePresence() != null ? item.getTypePresence() : TypePresence.ABSENT;

                Optional<Etudiant> etudiantOpt = etudiantRepository.findById(etudiantId);
                if (etudiantOpt.isEmpty()) {
                    continue;
                }

                // 🛡️ CONTRÔLE ANTI-DOUBLON (Critère d'acceptation 3 de l'US03)
                Optional<Absence> existante = absenceRepository.findByEtudiantIdAndSeanceId(etudiantId, seance.getId());

                if (existante.isPresent()) {
                    // Si elle existe déjà, on met à jour le type sans créer de doublon
                    Absence a = existante.get();
                    a.setTypePresence(typePresence);
                    a.setDateMarquage(LocalDateTime.now());
                    absenceRepository.save(a);
                    misAJour++;
                } else {
                    // Nouvelle absence
                    Absence nouvelle = Absence.builder()
                            .etudiant(etudiantOpt.get())
                            .seance(seance)
                            .enseignant(enseignant)
                            .dateMarquage(LocalDateTime.now())
                            .typePresence(typePresence)
                            .dureeMinutes(90)
                            .statut(StatutAbsence.NON_JUSTIFIEE)
                            .build();
                    absenceRepository.save(nouvelle);
                    enregistres++;
                }

                // 🔔 US18 : Déclenchement de la notification WebSocket temps réel
                try {
                    notificationService.notifierAbsence(etudiantOpt.get(), seance, typePresence);
                } catch (Exception notifErr) {
                    log.warn("Erreur envoi notification WebSocket pour étudiant {}: {}", etudiantId, notifErr.getMessage());
                }
            }
        }

        log.info("Appel validé : {} nouvelles absences créées, {} mises à jour.", enregistres, misAJour);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Appel enregistré avec succès dans Neon PostgreSQL.",
                "totalEnregistres", enregistres,
                "totalMisAJour", misAJour
        ));
    }

    /**
     * Récupérer les identifiants des étudiants marqués absents pour une séance donnée.
     */
    @GetMapping("/seance/{seanceId}")
    public ResponseEntity<List<Long>> getAbsentsBySeance(@PathVariable Long seanceId) {
        List<Absence> absences = absenceRepository.findBySeanceId(seanceId);
        List<Long> absentIds = absences.stream()
                .filter(a -> a.getEtudiant() != null)
                .map(a -> a.getEtudiant().getId())
                .collect(Collectors.toList());
        return ResponseEntity.ok(absentIds);
    }

    /**
     * US04 : Consulter ses propres absences (Espace Étudiant).
     * Trié par date décroissante (de la plus récente à la plus ancienne).
     */
    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<List<AbsenceResponseDTO>> getAbsencesByEtudiant(@PathVariable Long etudiantId) {
        List<Absence> absences = absenceRepository.findByEtudiantIdOrderByDateMarquageDesc(etudiantId);

        List<AbsenceResponseDTO> dtos = absences.stream().map(a -> {
            Optional<Justificatif> justif = justificatifRepository.findByAbsenceId(a.getId());

            return AbsenceResponseDTO.builder()
                    .id(a.getId())
                    .seanceId(a.getSeance().getId())
                    .matiereCode(a.getSeance().getMatiere().getCode())
                    .matiereNom(a.getSeance().getMatiere().getNom())
                    .dateSeance(a.getSeance().getDateSeance())
                    .heureDebut(a.getSeance().getHeureDebut())
                    .heureFin(a.getSeance().getHeureFin())
                    .enseignantNom("Prof. " + a.getEnseignant().getUser().getNom() + " " + a.getEnseignant().getUser().getPrenom())
                    .salle(a.getSeance().getSalle())
                    .typePresence(a.getTypePresence())
                    .dureeMinutes(a.getDureeMinutes())
                    .statut(a.getStatut())
                    .dateMarquage(a.getDateMarquage())
                    .justificatifId(justif.map(Justificatif::getId).orElse(null))
                    .justificatifNom(justif.map(Justificatif::getNomFichier).orElse(null))
                    .justificatifStatut(justif.map(Justificatif::getStatut).orElse(null))
                    .motifRefus(justif.map(Justificatif::getMotifRefus).orElse(null))
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * US08 : Modifier / rectifier une absence unitaire en cas d'erreur de saisie.
     */
    @PutMapping("/{id}/rectifier")
    @Transactional
    public ResponseEntity<?> rectifierAbsence(
            @PathVariable Long id,
            @RequestParam(value = "typePresence", defaultValue = "ABSENT") TypePresence typePresence,
            @RequestParam(value = "annuler", defaultValue = "false") boolean annuler
    ) {
        log.info("Rectification de l'absence ID {}: typePresence={}, annuler={}", id, typePresence, annuler);

        Optional<Absence> absenceOpt = absenceRepository.findById(id);
        if (absenceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Absence introuvable."));
        }

        Absence absence = absenceOpt.get();

        if (annuler) {
            absenceRepository.delete(absence);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Absence annulée avec succès (l'étudiant est désormais noté présent)."
            ));
        }

        absence.setTypePresence(typePresence);
        absence.setDateMarquage(LocalDateTime.now());
        absenceRepository.save(absence);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Absence rectifiée avec succès.",
                "nouveauTypePresence", absence.getTypePresence().name()
        ));
    }

    /**
     * US10 : Consulter l'historique complet des absences par groupe, matière, enseignant et date.
     */
    @GetMapping("/historique")
    @Transactional(readOnly = true)
    public ResponseEntity<List<SeanceHistoriqueDTO>> getHistorique(
            @RequestParam(required = false) Long groupeId,
            @RequestParam(required = false) Long matiereId,
            @RequestParam(required = false) Long enseignantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin
    ) {
        log.info("Consultation de l'historique des absences - groupe: {}, matiere: {}, enseignant: {}", groupeId, matiereId, enseignantId);

        List<Seance> allSeances = seanceRepository.findAll();

        List<SeanceHistoriqueDTO> historique = allSeances.stream()
                .filter(s -> groupeId == null || (s.getGroupe() != null && s.getGroupe().getId().equals(groupeId)))
                .filter(s -> matiereId == null || (s.getMatiere() != null && s.getMatiere().getId().equals(matiereId)))
                .filter(s -> enseignantId == null || (s.getEnseignant() != null && s.getEnseignant().getId().equals(enseignantId)))
                .filter(s -> dateDebut == null || (s.getDateSeance() != null && !s.getDateSeance().isBefore(dateDebut)))
                .filter(s -> dateFin == null || (s.getDateSeance() != null && !s.getDateSeance().isAfter(dateFin)))
                .sorted((s1, s2) -> {
                    if (s1.getDateSeance() == null || s2.getDateSeance() == null) return 0;
                    int comp = s2.getDateSeance().compareTo(s1.getDateSeance());
                    if (comp != 0) return comp;
                    if (s1.getHeureDebut() == null || s2.getHeureDebut() == null) return 0;
                    return s2.getHeureDebut().compareTo(s1.getHeureDebut());
                })
                .map(s -> {
                    List<Absence> absences = absenceRepository.findBySeanceId(s.getId());
                    int effectif = (s.getGroupe() != null)
                            ? etudiantRepository.findByGroupeId(s.getGroupe().getId()).size()
                            : 0;

                    int nbAbsents = (int) absences.stream().filter(a -> a.getTypePresence() == TypePresence.ABSENT).count();
                    int nbRetards = (int) absences.stream().filter(a -> a.getTypePresence() == TypePresence.RETARD).count();
                    int totalNonPresents = absences.size();
                    int presents = Math.max(0, effectif - totalNonPresents);
                    double tauxPresence = effectif > 0 ? ((double) presents / effectif) * 100.0 : 100.0;
                    tauxPresence = Math.round(tauxPresence * 10.0) / 10.0;

                    String profNom = (s.getEnseignant() != null && s.getEnseignant().getUser() != null)
                            ? "Prof. " + s.getEnseignant().getUser().getPrenom() + " " + s.getEnseignant().getUser().getNom()
                            : "Enseignant";

                    List<SeanceHistoriqueDTO.AbsenceDetailItemDTO> details = absences.stream().map(a -> {
                        Optional<Justificatif> justif = justificatifRepository.findByAbsenceId(a.getId());
                        Etudiant etu = a.getEtudiant();
                        String nom = etu != null && etu.getUser() != null ? etu.getUser().getNom() : "";
                        String prenom = etu != null && etu.getUser() != null ? etu.getUser().getPrenom() : "";
                        String matricule = etu != null ? etu.getMatricule() : "";

                        return SeanceHistoriqueDTO.AbsenceDetailItemDTO.builder()
                                .absenceId(a.getId())
                                .etudiantId(etu != null ? etu.getId() : null)
                                .matricule(matricule)
                                .nom(nom)
                                .prenom(prenom)
                                .typePresence(a.getTypePresence() != null ? a.getTypePresence().name() : "ABSENT")
                                .statut(a.getStatut() != null ? a.getStatut().name() : "NON_JUSTIFIEE")
                                .dateMarquage(a.getDateMarquage() != null ? a.getDateMarquage().toString() : null)
                                .justificatifId(justif.map(Justificatif::getId).orElse(null))
                                .justificatifStatut(justif.map(j -> j.getStatut().name()).orElse(null))
                                .justificatifNom(justif.map(Justificatif::getNomFichier).orElse(null))
                                .motifRefus(justif.map(Justificatif::getMotifRefus).orElse(null))
                                .build();
                    }).collect(Collectors.toList());

                    return SeanceHistoriqueDTO.builder()
                            .seanceId(s.getId())
                            .dateSeance(s.getDateSeance())
                            .heureDebut(s.getHeureDebut())
                            .heureFin(s.getHeureFin())
                            .typeSeance(s.getTypeSeance())
                            .salle(s.getSalle())
                            .groupeId(s.getGroupe() != null ? s.getGroupe().getId() : null)
                            .groupeCode(s.getGroupe() != null ? s.getGroupe().getCode() : "")
                            .groupeNom(s.getGroupe() != null ? s.getGroupe().getNom() : "")
                            .matiereId(s.getMatiere() != null ? s.getMatiere().getId() : null)
                            .matiereCode(s.getMatiere() != null ? s.getMatiere().getCode() : "")
                            .matiereNom(s.getMatiere() != null ? s.getMatiere().getNom() : "")
                            .enseignantId(s.getEnseignant() != null ? s.getEnseignant().getId() : null)
                            .enseignantNom(profNom)
                            .totalEffectif(effectif)
                            .totalPresents(presents)
                            .totalAbsents(nbAbsents)
                            .totalRetards(nbRetards)
                            .tauxPresence(tauxPresence)
                            .detailsAbsents(details)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(historique);
    }

    /**
     * US11 : Consulter le taux d'absentéisme d'un étudiant avec alerte de seuil (> 20%).
     */
    @GetMapping({"/statistiques/etudiant/{id}/taux", "/etudiant/{id}/taux"})
    @Transactional(readOnly = true)
    public ResponseEntity<?> getTauxAbsenteismeEtudiant(@PathVariable Long id) {
        Optional<Etudiant> etuOpt = etudiantRepository.findById(id);
        if (etuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Étudiant introuvable."));
        }

        Etudiant etudiant = etuOpt.get();
        List<Absence> allStudentAbsences = absenceRepository.findByEtudiantId(id);

        Long groupeId = etudiant.getGroupe() != null ? etudiant.getGroupe().getId() : null;
        List<Seance> seancesGroupe = groupeId != null
                ? seanceRepository.findByGroupeId(groupeId)
                : List.of();

        int totalSeances = Math.max(seancesGroupe.size(), allStudentAbsences.size());
        if (totalSeances == 0) {
            totalSeances = 1; // Éviter division par zéro
        }

        int nbAbsents = (int) allStudentAbsences.stream().filter(a -> a.getTypePresence() == TypePresence.ABSENT).count();
        int nbRetards = (int) allStudentAbsences.stream().filter(a -> a.getTypePresence() == TypePresence.RETARD).count();
        int nonJustifiees = (int) allStudentAbsences.stream().filter(a -> a.getStatut() == StatutAbsence.NON_JUSTIFIEE || a.getStatut() == StatutAbsence.REFUSEE).count();
        int justifiees = (int) allStudentAbsences.stream().filter(a -> a.getStatut() == StatutAbsence.JUSTIFIEE).count();
        int enAttente = (int) allStudentAbsences.stream().filter(a -> a.getStatut() == StatutAbsence.EN_ATTENTE).count();

        // 3 retards = équivalent d'une absence dans le barème académique
        double absenceEquivalente = nbAbsents + (nbRetards / 3.0);
        double tauxAbsenteisme = (absenceEquivalente / totalSeances) * 100.0;
        tauxAbsenteisme = Math.min(100.0, Math.round(tauxAbsenteisme * 10.0) / 10.0);
        double tauxAssiduite = Math.max(0.0, Math.round((100.0 - tauxAbsenteisme) * 10.0) / 10.0);

        boolean seuilDepasse = tauxAbsenteisme > 20.0;
        String niveauAlerte;
        String messageAlerte;

        if (tauxAbsenteisme > 20.0) {
            niveauAlerte = "CRITIQUE";
            messageAlerte = "⚠️ Seuil critique de 20% dépassé (" + tauxAbsenteisme + "%). Convocable en commission de discipline pour élimination du module.";
        } else if (tauxAbsenteisme >= 10.0) {
            niveauAlerte = "ATTENTION";
            messageAlerte = "⚠️ Attention : Taux d'absence à " + tauxAbsenteisme + "%. Vous approchez du seuil critique d'exclusion (20%).";
        } else {
            niveauAlerte = "NORMAL";
            messageAlerte = "Assiduité conforme aux exigences pédagogiques (" + tauxAssiduite + "% de présence).";
        }

        // Répartition par matière
        Map<Long, List<Absence>> absencesByMatiere = allStudentAbsences.stream()
                .filter(a -> a.getSeance() != null && a.getSeance().getMatiere() != null)
                .collect(Collectors.groupingBy(a -> a.getSeance().getMatiere().getId()));

        List<TauxMatiereDTO> matieresStats = absencesByMatiere.entrySet().stream().map(entry -> {
            List<Absence> matAbsences = entry.getValue();
            Matiere mat = matAbsences.get(0).getSeance().getMatiere();
            long seancesMat = seancesGroupe.stream()
                    .filter(s -> s.getMatiere() != null && s.getMatiere().getId().equals(mat.getId()))
                    .count();
            int totalMatSeances = (int) Math.max(seancesMat, matAbsences.size());
            if (totalMatSeances == 0) totalMatSeances = 1;

            int mAbs = (int) matAbsences.stream().filter(a -> a.getTypePresence() == TypePresence.ABSENT).count();
            int mRet = (int) matAbsences.stream().filter(a -> a.getTypePresence() == TypePresence.RETARD).count();
            int mNonJust = (int) matAbsences.stream().filter(a -> a.getStatut() == StatutAbsence.NON_JUSTIFIEE || a.getStatut() == StatutAbsence.REFUSEE).count();
            int mJust = (int) matAbsences.stream().filter(a -> a.getStatut() == StatutAbsence.JUSTIFIEE).count();
            double mTaux = ((mAbs + (mRet / 3.0)) / totalMatSeances) * 100.0;
            mTaux = Math.round(mTaux * 10.0) / 10.0;

            return TauxMatiereDTO.builder()
                    .matiereId(mat.getId())
                    .matiereCode(mat.getCode())
                    .matiereNom(mat.getNom())
                    .totalSeances(totalMatSeances)
                    .absences(mAbs)
                    .retards(mRet)
                    .nonJustifiees(mNonJust)
                    .justifiees(mJust)
                    .tauxAbsence(mTaux)
                    .seuilDepasse(mTaux > 20.0)
                    .build();
        }).collect(Collectors.toList());

        TauxAbsenteismeDTO dto = TauxAbsenteismeDTO.builder()
                .etudiantId(etudiant.getId())
                .matricule(etudiant.getMatricule())
                .nom(etudiant.getUser() != null ? etudiant.getUser().getNom() : "")
                .prenom(etudiant.getUser() != null ? etudiant.getUser().getPrenom() : "")
                .groupeCode(etudiant.getGroupe() != null ? etudiant.getGroupe().getCode() : "")
                .groupeNom(etudiant.getGroupe() != null ? etudiant.getGroupe().getNom() : "")
                .totalSeances(totalSeances)
                .totalPresences(Math.max(0, totalSeances - (nbAbsents + nbRetards)))
                .totalAbsences(nbAbsents)
                .totalRetards(nbRetards)
                .absencesNonJustifiees(nonJustifiees)
                .absencesJustifiees(justifiees)
                .absencesEnAttente(enAttente)
                .heuresAbsenceTotal((nbAbsents * 1.5) + (nbRetards * 0.5))
                .tauxAssiduite(tauxAssiduite)
                .tauxAbsenteisme(tauxAbsenteisme)
                .seuilDepasse(seuilDepasse)
                .niveauAlerte(niveauAlerte)
                .messageAlerte(messageAlerte)
                .repartitionParMatiere(matieresStats)
                .build();

        return ResponseEntity.ok(dto);
    }
}
