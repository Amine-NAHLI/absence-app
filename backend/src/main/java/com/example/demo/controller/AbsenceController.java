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
}
