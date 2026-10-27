package com.example.demo.controller;

import com.example.demo.dto.NotificationDTO;
import com.example.demo.entity.Etudiant;
import com.example.demo.repository.EtudiantRepository;
import com.example.demo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Endpoints REST pour la gestion et le suivi des notifications d'absence.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final EtudiantRepository etudiantRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
    }

    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByEtudiant(@PathVariable Long etudiantId) {
        Optional<Etudiant> etuOpt = etudiantRepository.findById(etudiantId);
        if (etuOpt.isEmpty() || etuOpt.get().getUser() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notificationService.getNotificationsByUser(etuOpt.get().getUser().getId()));
    }

    @GetMapping("/user/{userId}/non-lues/count")
    public ResponseEntity<Map<String, Long>> countNonLues(@PathVariable Long userId) {
        long count = notificationService.countNonLues(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/lire")
    public ResponseEntity<?> marquerCommeLue(@PathVariable Long id) {
        boolean ok = notificationService.marquerCommeLue(id);
        return ResponseEntity.ok(Map.of("success", ok));
    }

    @PutMapping("/user/{userId}/tout-lire")
    public ResponseEntity<?> marquerToutesCommeLues(@PathVariable Long userId) {
        notificationService.marquerToutesCommeLues(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
