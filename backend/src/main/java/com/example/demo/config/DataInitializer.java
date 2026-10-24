package com.example.demo.config;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AbsenceRepository absenceRepository;
    private final JustificatifRepository justificatifRepository;
    private final SeanceRepository seanceRepository;
    private final EtudiantRepository etudiantRepository;
    private final EnseignantRepository enseignantRepository;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        log.info(" Initialisation ZÉRO SEEDER : Seul le compte Administrateur (.env) est géré.");

        // 1. Initialisation UNIQUE du compte Administrateur configuré dans le .env
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
            User admin = adminOpt.get();
            admin.setMotDePasse(adminPassword);
            admin.setActif(true);
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info(" Compte Administrateur synchronisé depuis le .env : {}", adminEmail);
        }

        // 2. Nettoyage des anciens utilisateurs de test s'ils existent encore
        List<String> mockEmails = List.of(
                "prof@upf.ac.ma",
                "etudiant@upf.ac.ma",
                "aya@upf.ac.ma",
                "yassine@upf.ac.ma",
                "salma@upf.ac.ma"
        );

        boolean hasMockUsers = mockEmails.stream().anyMatch(email -> userRepository.findByEmail(email).isPresent());
        if (hasMockUsers) {
            log.info(" Purge des anciens enregistrements et comptes de test de la base Neon...");
            justificatifRepository.deleteAll();
            absenceRepository.deleteAll();
            seanceRepository.deleteAll();
            etudiantRepository.deleteAll();
            enseignantRepository.deleteAll();
            for (String email : mockEmails) {
                userRepository.findByEmail(email).ifPresent(userRepository::delete);
            }
            log.info(" Purge effectuée avec succès.");
        }

        log.info(" Système démarré sans aucun seeder pré-rempli.");
        log.info(" L'administrateur ({}) est maître de la création des Salles, Modules et Classes.", adminEmail);
    }
}
