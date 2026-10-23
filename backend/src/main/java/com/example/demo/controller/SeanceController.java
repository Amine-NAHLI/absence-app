package com.example.demo.controller;

import com.example.demo.entity.Seance;
import com.example.demo.repository.SeanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/seances")
@RequiredArgsConstructor
public class SeanceController {

    private final SeanceRepository seanceRepository;

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
}
