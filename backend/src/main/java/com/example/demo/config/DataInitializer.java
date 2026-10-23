package com.example.demo.config;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GroupeRepository groupeRepository;
    private final EnseignantRepository enseignantRepository;
    private final EtudiantRepository etudiantRepository;
    private final MatiereRepository matiereRepository;
    private final SeanceRepository seanceRepository;
    private final AbsenceRepository absenceRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("ℹ️ Base de données déjà initialisée avec {} utilisateurs.", userRepository.count());
            return;
        }

        log.info("🚀 Initialisation du jeu de données de test dans Neon PostgreSQL...");

        // 1. Création du Groupe
        Groupe gi4A = groupeRepository.save(Groupe.builder()
                .code("GI4-A")
                .nom("Génie Informatique 4ème Année - Groupe A")
                .filiere("Génie Informatique")
                .anneeScolaire("2026-2027")
                .build());

        // 2. Création de la Matière
        Matiere gl = matiereRepository.save(Matiere.builder()
                .code("GL401")
                .nom("Génie Logiciel & Méthodes Agiles")
                .coefficient(4)
                .heuresTotal(45)
                .build());

        // 3. Création Administrateur
        userRepository.save(User.builder()
                .nom("ADMIN")
                .prenom("Principal")
                .email("admin@upf.ac.ma")
                .motDePasse("admin123")
                .telephone("0600000000")
                .role(Role.ADMIN)
                .actif(true)
                .build());

        // 4. Création de l'Enseignant
        User userProf = userRepository.save(User.builder()
                .nom("EL HASSANI")
                .prenom("Mohammed")
                .email("prof@upf.ac.ma")
                .motDePasse("123456")
                .telephone("0611223344")
                .role(Role.ENSEIGNANT)
                .actif(true)
                .build());

        Enseignant prof = enseignantRepository.save(Enseignant.builder()
                .user(userProf)
                .matricule("ENS-001")
                .departement("Informatique")
                .specialite("Génie Logiciel & Scrum")
                .build());

        // 5. Création des Étudiants de GI4-A
        User userAmine = userRepository.save(User.builder()
                .nom("NAHLI")
                .prenom("Amine")
                .email("etudiant@upf.ac.ma")
                .motDePasse("123456")
                .telephone("0655443322")
                .role(Role.ETUDIANT)
                .actif(true)
                .build());

        Etudiant etudiantAmine = etudiantRepository.save(Etudiant.builder()
                .user(userAmine)
                .matricule("ETU-001")
                .cne("N130001001")
                .groupe(gi4A)
                .build());

        User userAya = userRepository.save(User.builder()
                .nom("BOUHSINI")
                .prenom("Aya")
                .email("aya@upf.ac.ma")
                .motDePasse("123456")
                .telephone("0677889900")
                .role(Role.ETUDIANT)
                .actif(true)
                .build());

        etudiantRepository.save(Etudiant.builder()
                .user(userAya)
                .matricule("ETU-002")
                .cne("N130001002")
                .groupe(gi4A)
                .build());

        User userYassine = userRepository.save(User.builder()
                .nom("BENNANI")
                .prenom("Yassine")
                .email("yassine@upf.ac.ma")
                .motDePasse("123456")
                .role(Role.ETUDIANT)
                .actif(true)
                .build());

        etudiantRepository.save(Etudiant.builder()
                .user(userYassine)
                .matricule("ETU-003")
                .cne("N130001003")
                .groupe(gi4A)
                .build());

        User userSalma = userRepository.save(User.builder()
                .nom("IDRISSI")
                .prenom("Salma")
                .email("salma@upf.ac.ma")
                .motDePasse("123456")
                .role(Role.ETUDIANT)
                .actif(true)
                .build());

        etudiantRepository.save(Etudiant.builder()
                .user(userSalma)
                .matricule("ETU-004")
                .cne("N130001004")
                .groupe(gi4A)
                .build());

        // 6. Création d'une Séance de cours pour aujourd'hui
        Seance seanceAujourdhui = seanceRepository.save(Seance.builder()
                .dateSeance(LocalDate.now())
                .heureDebut(LocalTime.of(8, 30))
                .heureFin(LocalTime.of(10, 15))
                .typeSeance("TP")
                .salle("Labo Informatique 3")
                .matiere(gl)
                .enseignant(prof)
                .groupe(gi4A)
                .statut("PLANIFIEE")
                .build());

        // 7. Création d'une absence initiale de test pour Amine (pour tester l'écran US04)
        absenceRepository.save(Absence.builder()
                .etudiant(etudiantAmine)
                .seance(seanceAujourdhui)
                .enseignant(prof)
                .dateMarquage(LocalDateTime.now())
                .typePresence(TypePresence.ABSENT)
                .dureeMinutes(90)
                .statut(StatutAbsence.NON_JUSTIFIEE)
                .build());

        log.info("✅ Données de test initialisées avec succès dans Neon PostgreSQL !");
        log.info("------------------------------------------------------------------");
        log.info("🔑 COMPTES DE TEST DISPONIBLES :");
        log.info("   👨‍🏫 Enseignant : prof@upf.ac.ma / 123456");
        log.info("   👨‍🎓 Étudiant   : etudiant@upf.ac.ma / 123456 (Amine Nahli)");
        log.info("   👩‍🎓 Étudiante  : aya@upf.ac.ma / 123456 (Aya Bouhsini)");
        log.info("   👨‍💼 Admin      : admin@upf.ac.ma / admin123");
        log.info("------------------------------------------------------------------");
    }
}
