package com.example.demo.controller;

import com.example.demo.dto.TauxAbsenteismeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * US11 : Endpoint dédié pour les statistiques étudiant.
 */
@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
public class StatistiquesController {

    private final AbsenceController absenceController;

    @GetMapping("/etudiant/{id}/taux")
    public ResponseEntity<?> getTauxEtudiant(@PathVariable Long id) {
        return absenceController.getTauxAbsenteismeEtudiant(id);
    }
}
