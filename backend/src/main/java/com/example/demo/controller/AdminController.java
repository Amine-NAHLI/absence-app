package com.example.demo.controller;

import com.example.demo.dto.DemandeInscriptionDTO;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserRepository userRepository;
    private final EtudiantRepository etudiantRepository;
    private final EnseignantRepository enseignantRepository;
    private final AbsenceRepository absenceRepository;

    /**
     * Liste toutes les demandes d'inscription en attente de validation (actif = false).
     */
    @GetMapping("/demandes-inscription")
    public ResponseEntity<List<DemandeInscriptionDTO>> getDemandesEnAttente() {
        List<User> pendingUsers = userRepository.findByActifFalseOrderByCreatedAtDesc();

        List<DemandeInscriptionDTO> dtos = pendingUsers.stream().map(user -> {
            DemandeInscriptionDTO.DemandeInscriptionDTOBuilder builder = DemandeInscriptionDTO.builder()
                    .userId(user.getId())
                    .nom(user.getNom())
                    .prenom(user.getPrenom())
                    .email(user.getEmail())
                    .telephone(user.getTelephone())
                    .role(user.getRole() != null ? user.getRole().name() : "INCONNU")
                    .dateCreation(user.getCreatedAt())
                    .actif(Boolean.TRUE.equals(user.getActif()));

            if (user.getRole() == Role.ETUDIANT) {
                etudiantRepository.findByUserId(user.getId()).ifPresent(e -> {
                    builder.matricule(e.getMatricule());
                    builder.cne(e.getCne());
                    if (e.getGroupe() != null) {
                        builder.groupeCode(e.getGroupe().getCode());
                    }
                });
            } else if (user.getRole() == Role.ENSEIGNANT) {
                enseignantRepository.findByUserId(user.getId()).ifPresent(prof -> {
                    builder.matricule(prof.getMatricule());
                    builder.departement(prof.getDepartement());
                    builder.specialite(prof.getSpecialite());
                });
            }

            return builder.build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * Accepter une demande d'inscription (activer le compte).
     */
    @PutMapping("/demandes-inscription/{userId}/accepter")
    @Transactional
    public ResponseEntity<?> accepterDemande(@PathVariable Long userId) {
        log.info("Approbation de l'inscription pour l'utilisateur ID: {}", userId);

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Utilisateur introuvable."));
        }

        User user = userOpt.get();
        user.setActif(true);
        userRepository.save(user);

        log.info("Compte activé avec succès pour {} (ID: {})", user.getEmail(), user.getId());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Compte activé avec succès. L'utilisateur peut désormais se connecter.",
                "userId", user.getId(),
                "email", user.getEmail()
        ));
    }

    /**
     * Refuser et supprimer une demande d'inscription.
     */
    @DeleteMapping("/demandes-inscription/{userId}/refuser")
    @Transactional
    public ResponseEntity<?> refuserDemande(@PathVariable Long userId) {
        log.info("Refus et suppression de la demande d'inscription pour l'utilisateur ID: {}", userId);

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Demande introuvable."));
        }

        User user = userOpt.get();

        // 1. Supprimer le profil rattaché
        if (user.getRole() == Role.ETUDIANT) {
            etudiantRepository.findByUserId(userId).ifPresent(etudiantRepository::delete);
        } else if (user.getRole() == Role.ENSEIGNANT) {
            enseignantRepository.findByUserId(userId).ifPresent(enseignantRepository::delete);
        }

        // 2. Supprimer l'utilisateur
        userRepository.delete(user);

        log.info("Demande supprimée définitivement pour {} (ID: {})", user.getEmail(), userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Demande d'inscription refusée et supprimée de la base de données."
        ));
    }

    /**
     * Statistiques globales du tableau de bord d'administration.
     */
    @GetMapping("/statistiques")
    public ResponseEntity<?> getAdminStats() {
        long totalEtudiants = etudiantRepository.count();
        long totalEnseignants = enseignantRepository.count();
        long totalAbsences = absenceRepository.count();
        long demandesEnAttente = userRepository.findByActifFalseOrderByCreatedAtDesc().size();

        return ResponseEntity.ok(Map.of(
                "totalEtudiants", totalEtudiants,
                "totalEnseignants", totalEnseignants,
                "totalAbsences", totalAbsences,
                "demandesEnAttente", demandesEnAttente,
                "tauxAssiduite", "93.4%"
        ));
    }
}
