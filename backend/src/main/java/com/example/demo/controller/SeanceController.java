package com.example.demo.controller;

import com.example.demo.dto.SeanceCreateRequest;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seances")
@RequiredArgsConstructor
@Slf4j
public class SeanceController {

    private final SeanceRepository seanceRepository;
    private final GroupeRepository groupeRepository;
    private final MatiereRepository matiereRepository;
    private final EnseignantRepository enseignantRepository;

    @GetMapping("/enseignant/{enseignantId}")
    public ResponseEntity<List<Seance>> getSeancesByEnseignant(@PathVariable Long enseignantId) {
        return ResponseEntity.ok(seanceRepository.findByEnseignantId(enseignantId));
    }

    @GetMapping("/enseignant/{enseignantId}/aujourdhui")
    public ResponseEntity<List<Seance>> getSeancesAujourdhui(@PathVariable Long enseignantId) {
        return ResponseEntity.ok(seanceRepository.findByEnseignantIdAndDateSeance(enseignantId, LocalDate.now()));
    }

    @GetMapping("/groupe/{groupeId}")
    public ResponseEntity<List<Seance>> getSeancesByGroupe(@PathVariable Long groupeId) {
        return ResponseEntity.ok(seanceRepository.findByGroupeId(groupeId));
    }

    /**
     * Démarrer ou réserver une séance en direct pour réaliser l'appel (US02 / US03).
     * Si la séance existe déjà pour cette classe, matière et créneau aujourd'hui, elle est réutilisée.
     */
    @PostMapping("/demarrer")
    @Transactional
    public ResponseEntity<?> demarrerSeance(@Valid @RequestBody SeanceCreateRequest req) {
        log.info("Démarrage séance pour Enseignant ID: {}, Classe ID: {}, Matière ID: {}, Salle: {}",
                req.getEnseignantId(), req.getGroupeId(), req.getMatiereId(), req.getSalle());

        Optional<Groupe> groupeOpt = groupeRepository.findById(req.getGroupeId());
        if (groupeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Classe / Groupe introuvable."));
        }

        Optional<Matiere> matiereOpt = matiereRepository.findById(req.getMatiereId());
        if (matiereOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Module d'enseignement introuvable."));
        }

        Optional<Enseignant> enseignantOpt = enseignantRepository.findById(req.getEnseignantId());
        if (enseignantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Enseignant introuvable."));
        }

        LocalDate date = req.getDateSeance() != null ? req.getDateSeance() : LocalDate.now();
        LocalTime heureDebut = LocalTime.of(8, 30);
        LocalTime heureFin = LocalTime.of(10, 15);

        if (req.getHeureDebut() != null && !req.getHeureDebut().isBlank()) {
            try {
                heureDebut = LocalTime.parse(req.getHeureDebut().trim(), DateTimeFormatter.ofPattern("HH:mm"));
            } catch (Exception ignored) {}
        }
        if (req.getHeureFin() != null && !req.getHeureFin().isBlank()) {
            try {
                heureFin = LocalTime.parse(req.getHeureFin().trim(), DateTimeFormatter.ofPattern("HH:mm"));
            } catch (Exception ignored) {}
        }

        // Vérifier si une séance identique existe déjà aujourd'hui
        List<Seance> existantes = seanceRepository.findByGroupeIdAndMatiereIdAndDateSeance(
                req.getGroupeId(), req.getMatiereId(), date);

        if (!existantes.isEmpty()) {
            Seance existing = existantes.get(0);
            if (req.getSalle() != null && !req.getSalle().isBlank()) {
                existing.setSalle(req.getSalle().trim());
                seanceRepository.save(existing);
            }
            log.info("Séance existante réutilisée ID: {}", existing.getId());
            return ResponseEntity.ok(existing);
        }

        String salleNom = (req.getSalle() != null && !req.getSalle().isBlank()) ? req.getSalle().trim() : "SALLE-01";
        String type = (req.getTypeSeance() != null && !req.getTypeSeance().isBlank()) ? req.getTypeSeance().trim() : "COURS";

        Seance seance = Seance.builder()
                .dateSeance(date)
                .heureDebut(heureDebut)
                .heureFin(heureFin)
                .typeSeance(type)
                .salle(salleNom)
                .groupe(groupeOpt.get())
                .matiere(matiereOpt.get())
                .enseignant(enseignantOpt.get())
                .statut("EN_COURS")
                .build();

        Seance saved = seanceRepository.save(seance);
        log.info("Séance créée avec succès ID: {} pour {} en {}", saved.getId(), saved.getGroupe().getCode(), saved.getSalle());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
