package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.*;
import com.example.demo.repository.EnseignantRepository;
import com.example.demo.repository.EtudiantRepository;
import com.example.demo.repository.GroupeRepository;
import com.example.demo.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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
    private final GroupeRepository groupeRepository;

    /**
     * Authentification utilisateur.
     * Si le compte a actif = false, retourne 403 Forbidden avec message explicite.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("Tentative de connexion pour l'email: {}", request.getEmail());

        String cleanEmail = request.getEmail().trim().toLowerCase();

        // 1. Recherche de l'utilisateur
        User user = userRepository.findByEmail(cleanEmail)
                .orElse(null);

        // 2. Vérification identifiants
        if (user == null || !user.getMotDePasse().equals(request.getMotDePasse())) {
            log.warn("Échec de connexion pour l'email: {}", cleanEmail);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Identifiants invalides. Vérifiez votre email et mot de passe."));
        }

        // 3. Vérification compte actif (En attente de validation admin)
        if (!Boolean.TRUE.equals(user.getActif())) {
            log.warn("Tentative de connexion sur un compte non validé: {}", cleanEmail);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message", "Votre compte est en attente d'approbation par l'administration. Veuillez patienter que l'administrateur valide votre inscription.",
                            "enAttente", true
                    ));
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

    /**
     * Inscription d'un nouvel utilisateur (Étudiant ou Enseignant).
     * Crée le compte avec actif = false pour arbitrage ultérieur par l'admin.
     */
    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        // 1. Vérification d'unicité de l'email
        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Cette adresse email institutionnelle est déjà enregistrée."));
        }

        // 2. Détermination du rôle
        Role role;
        try {
            role = Role.valueOf(request.getRole().trim().toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Rôle invalide. Choisissez ETUDIANT ou ENSEIGNANT."));
        }

        // 3. Création du compte User (actif = false par défaut)
        User user = User.builder()
                .nom(request.getNom().trim())
                .prenom(request.getPrenom().trim())
                .email(cleanEmail)
                .motDePasse(request.getMotDePasse().trim())
                .telephone(request.getTelephone() != null ? request.getTelephone().trim() : "")
                .role(role)
                .actif(false) // 🔒 En attente de validation admin !
                .build();

        User savedUser = userRepository.save(user);

        // 4. Création du profil associé
        if (role == Role.ETUDIANT) {
            Groupe groupe = null;
            if (request.getGroupeCode() != null && !request.getGroupeCode().isBlank()) {
                groupe = groupeRepository.findByCode(request.getGroupeCode().trim()).orElse(null);
            }
            if (groupe == null) {
                groupe = groupeRepository.findByCode("GI4-A").orElseGet(() ->
                        groupeRepository.findAll().stream().findFirst().orElse(null)
                );
            }

            String matricule = request.getMatricule() != null && !request.getMatricule().isBlank()
                    ? request.getMatricule().trim()
                    : "ETU-" + String.format("%03d", savedUser.getId());

            String cne = request.getCne() != null && !request.getCne().isBlank()
                    ? request.getCne().trim()
                    : "N" + (130000000L + savedUser.getId());

            Etudiant etudiant = Etudiant.builder()
                    .user(savedUser)
                    .matricule(matricule)
                    .cne(cne)
                    .groupe(groupe)
                    .build();
            etudiantRepository.save(etudiant);

        } else if (role == Role.ENSEIGNANT) {
            String matricule = request.getMatricule() != null && !request.getMatricule().isBlank()
                    ? request.getMatricule().trim()
                    : "ENS-" + String.format("%03d", savedUser.getId());

            String departement = request.getDepartement() != null && !request.getDepartement().isBlank()
                    ? request.getDepartement().trim()
                    : "Génie Informatique";

            Enseignant enseignant = Enseignant.builder()
                    .user(savedUser)
                    .matricule(matricule)
                    .departement(departement)
                    .specialite(request.getSpecialite() != null ? request.getSpecialite().trim() : "")
                    .build();
            enseignantRepository.save(enseignant);
        }

        log.info(" Demande d'inscription enregistrée : {} ({}) en attente d'approbation par admin.", cleanEmail, role);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Votre demande d'inscription a été transmise à l'administrateur. Votre compte sera activé dès validation.",
                "userId", savedUser.getId(),
                "email", savedUser.getEmail(),
                "role", role.name()
        ));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
