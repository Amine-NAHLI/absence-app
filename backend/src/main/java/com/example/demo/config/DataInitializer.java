package com.example.demo.config;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GroupeRepository groupeRepository;
    private final MatiereRepository matiereRepository;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        log.info(" Initialisation du socle académique & compte administrateur unique (.env)...");

        // 1. Initialisation des Groupes de rattachement pour les inscriptions
        if (groupeRepository.findByCode("GI4-A").isEmpty()) {
            groupeRepository.save(Groupe.builder()
                    .code("GI4-A")
                    .nom("Génie Informatique 4ème Année - Groupe A")
                    .filiere("Génie Informatique")
                    .anneeScolaire("2026-2027")
                    .build());
            log.info(" Groupe GI4-A initialisé.");
        }

        if (groupeRepository.findByCode("GI4-B").isEmpty()) {
            groupeRepository.save(Groupe.builder()
                    .code("GI4-B")
                    .nom("Génie Informatique 4ème Année - Groupe B")
                    .filiere("Génie Informatique")
                    .anneeScolaire("2026-2027")
                    .build());
            log.info(" Groupe GI4-B initialisé.");
        }

        // 2. Initialisation de la Matière socle
        if (matiereRepository.findByCode("GL401").isEmpty()) {
            matiereRepository.save(Matiere.builder()
                    .code("GL401")
                    .nom("Génie Logiciel & Méthodes Agiles")
                    .coefficient(4)
                    .heuresTotal(45)
                    .build());
            log.info(" Module GL401 initialisé.");
        }

        // 3. Initialisation UNIQUE du compte Administrateur configuré dans le .env
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);
        if (adminOpt.isEmpty()) {
            userRepository.save(User.builder()
                    .nom("ADMIN")
                    .prenom("Direction")
                    .email(adminEmail)
                    .motDePasse(adminPassword)
                    .telephone("0600000000")
                    .role(Role.ADMIN)
                    .actif(true)
                    .build());
            log.info(" Compte Administrateur unique créé depuis le .env : {}", adminEmail);
        } else {
            // S'assurer que le mot de passe correspond à celui du .env
            User admin = adminOpt.get();
            admin.setMotDePasse(adminPassword);
            admin.setActif(true);
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info(" Compte Administrateur mis à jour depuis le .env : {}", adminEmail);
        }

        log.info(" AUCUN compte enseignant ou étudiant pré-configuré (Seeders supprimés).");
        log.info(" Les utilisateurs doivent désormais s'inscrire depuis l'application.");
        log.info(" L'administrateur ({}) arbitre et valide chaque demande.", adminEmail);
    }
}
