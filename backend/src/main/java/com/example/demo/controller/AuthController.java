package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.EnseignantRepository;
import com.example.demo.repository.EtudiantRepository;
import com.example.demo.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final EtudiantRepository etudiantRepository;
    private final EnseignantRepository enseignantRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("Tentative de connexion pour l'email: {}", request.getEmail());

        // 1. Recherche de l'utilisateur
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElse(null);

        // 2. Vérification identifiants
        if (user == null || !user.getMotDePasse().equals(request.getMotDePasse())) {
            log.warn("Échec de connexion pour l'email: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Identifiants invalides. Vérifiez votre email et mot de passe."));
        }

        // 3. Vérification compte actif
        if (!Boolean.TRUE.equals(user.getActif())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Votre compte a été désactivé. Veuillez contacter l'administration."));
        }

        // 4. Construction de la réponse enrichie
        LoginResponse.LoginResponseBuilder builder = LoginResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole())
                .telephone(user.getTelephone())
                .token("session_" + UUID.randomUUID().toString().replace("-", ""));

        // Métadonnées selon le rôle
        if (user.getRole() == Role.ETUDIANT) {
            etudiantRepository.findByUserId(user.getId()).ifPresent(etudiant -> {
                builder.etudiantId(etudiant.getId());
                builder.matricule(etudiant.getMatricule());
                builder.cne(etudiant.getCne());
                if (etudiant.getGroupe() != null) {
                    builder.groupeId(etudiant.getGroupe().getId());
                    builder.groupeCode(etudiant.getGroupe().getCode());
                }
            });
        } else if (user.getRole() == Role.ENSEIGNANT) {
            enseignantRepository.findByUserId(user.getId()).ifPresent(prof -> {
                builder.enseignantId(prof.getId());
                builder.matricule(prof.getMatricule());
                builder.departement(prof.getDepartement());
            });
        }

        log.info("Connexion réussie pour {} (Rôle: {})", user.getEmail(), user.getRole());
        return ResponseEntity.ok(builder.build());
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
