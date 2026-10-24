package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
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
    private final JustificatifRepository justificatifRepository;
    private final SalleRepository salleRepository;
    private final MatiereRepository matiereRepository;
    private final GroupeRepository groupeRepository;

    // =========================================================================
    // 1. GESTION DES SALLES DE CLASSE
    // =========================================================================

    @GetMapping("/salles")
    public ResponseEntity<List<SalleDTO>> getSalles() {
        List<SalleDTO> dtos = salleRepository.findAll().stream().map(s -> SalleDTO.builder()
                .id(s.getId())
                .code(s.getCode())
                .nom(s.getNom())
                .capacite(s.getCapacite())
                .type(s.getType())
                .build()
        ).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/salles")
    @Transactional
    public ResponseEntity<?> createSalle(@Valid @RequestBody SalleDTO dto) {
        String cleanCode = dto.getCode().trim().toUpperCase();
        if (salleRepository.existsByCode(cleanCode)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Une salle avec le code " + cleanCode + " existe déjà."));
        }

        Salle salle = Salle.builder()
                .code(cleanCode)
                .nom(dto.getNom().trim())
                .capacite(dto.getCapacite())
                .type(dto.getType() != null && !dto.getType().isBlank() ? dto.getType().trim() : "SALLE_COURS")
                .build();

        Salle saved = salleRepository.save(salle);
        log.info("Salle créée avec succès par admin : {} ({})", saved.getCode(), saved.getNom());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Salle " + saved.getCode() + " créée avec succès.",
                "id", saved.getId()
        ));
    }

    @DeleteMapping("/salles/{id}")
    @Transactional
    public ResponseEntity<?> deleteSalle(@PathVariable Long id) {
        Optional<Salle> salleOpt = salleRepository.findById(id);
        if (salleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Salle introuvable."));
        }
        salleRepository.delete(salleOpt.get());
        log.info("Salle supprimée ID : {}", id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Salle supprimée avec succès."));
    }

    // =========================================================================
    // 2. GESTION DES MODULES / MATIÈRES
    // =========================================================================

    @GetMapping("/matieres")
    public ResponseEntity<List<MatiereDTO>> getMatieres() {
        List<MatiereDTO> dtos = matiereRepository.findAll().stream().map(m -> MatiereDTO.builder()
                .id(m.getId())
                .code(m.getCode())
                .nom(m.getNom())
                .coefficient(m.getCoefficient())
                .heuresTotal(m.getHeuresTotal())
                .build()
        ).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/matieres")
    @Transactional
    public ResponseEntity<?> createMatiere(@Valid @RequestBody MatiereDTO dto) {
        String cleanCode = dto.getCode().trim().toUpperCase();
        if (matiereRepository.existsByCode(cleanCode)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Un module avec le code " + cleanCode + " existe déjà."));
        }

        Matiere matiere = Matiere.builder()
                .code(cleanCode)
                .nom(dto.getNom().trim())
                .coefficient(dto.getCoefficient())
                .heuresTotal(dto.getHeuresTotal() != null ? dto.getHeuresTotal() : 45)
                .build();

        Matiere saved = matiereRepository.save(matiere);
        log.info("Module créé avec succès par admin : {} ({})", saved.getCode(), saved.getNom());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Module " + saved.getCode() + " créé avec succès.",
                "id", saved.getId()
        ));
    }

    @DeleteMapping("/matieres/{id}")
    @Transactional
    public ResponseEntity<?> deleteMatiere(@PathVariable Long id) {
        Optional<Matiere> matOpt = matiereRepository.findById(id);
        if (matOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Module introuvable."));
        }
        Matiere matiere = matOpt.get();

        // Détacher de tous les groupes associés avant suppression
        groupeRepository.findAll().forEach(g -> {
            if (g.getMatieres() != null && g.getMatieres().contains(matiere)) {
                g.getMatieres().remove(matiere);
                groupeRepository.save(g);
            }
        });

        matiereRepository.delete(matiere);
        log.info("Module supprimé ID : {}", id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Module supprimé avec succès."));
    }

    // =========================================================================
    // 3. GESTION DES CLASSES & ASSOCIATION AUX MODULES
    // =========================================================================

    @GetMapping("/groupes")
    @Transactional(readOnly = true)
    public ResponseEntity<List<GroupeResponseDTO>> getGroupes() {
        List<Groupe> groupes = groupeRepository.findAll();
        List<GroupeResponseDTO> dtos = groupes.stream().map(g -> {
            List<MatiereDTO> matieresList = g.getMatieres() != null ? g.getMatieres().stream().map(m -> MatiereDTO.builder()
                    .id(m.getId())
                    .code(m.getCode())
                    .nom(m.getNom())
                    .coefficient(m.getCoefficient())
                    .heuresTotal(m.getHeuresTotal())
                    .build()).collect(Collectors.toList()) : Collections.emptyList();

            long countEtudiants = etudiantRepository.findAll().stream()
                    .filter(e -> e.getGroupe() != null && e.getGroupe().getId().equals(g.getId()))
                    .count();

            return GroupeResponseDTO.builder()
                    .id(g.getId())
                    .code(g.getCode())
                    .nom(g.getNom())
                    .filiere(g.getFiliere())
                    .anneeScolaire(g.getAnneeScolaire())
                    .effectif((int) countEtudiants)
                    .matieres(matieresList)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/groupes")
    @Transactional
    public ResponseEntity<?> createGroupe(@Valid @RequestBody GroupeCreateRequest req) {
        String cleanCode = req.getCode().trim().toUpperCase();
        if (groupeRepository.existsByCode(cleanCode)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Une classe avec le code " + cleanCode + " existe déjà."));
        }

        Set<Matiere> matieresToAssociate = new HashSet<>();
        if (req.getMatiereIds() != null && !req.getMatiereIds().isEmpty()) {
            for (Long matId : req.getMatiereIds()) {
                matiereRepository.findById(matId).ifPresent(matieresToAssociate::add);
            }
        }

        Groupe groupe = Groupe.builder()
                .code(cleanCode)
                .nom(req.getNom().trim())
                .filiere(req.getFiliere() != null ? req.getFiliere().trim() : "Génie Informatique")
                .anneeScolaire(req.getAnneeScolaire() != null ? req.getAnneeScolaire().trim() : "2026-2027")
                .matieres(matieresToAssociate)
                .build();

        Groupe saved = groupeRepository.save(groupe);
        log.info("Classe créée avec succès par admin : {} avec {} module(s) associé(s)",
                saved.getCode(), matieresToAssociate.size());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Classe " + saved.getCode() + " créée avec succès avec ses modules associés.",
                "id", saved.getId(),
                "matieresAssociees", matieresToAssociate.size()
        ));
    }

    @DeleteMapping("/groupes/{id}")
    @Transactional
    public ResponseEntity<?> deleteGroupe(@PathVariable Long id) {
        Optional<Groupe> groupeOpt = groupeRepository.findById(id);
        if (groupeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Classe introuvable."));
        }

        Groupe groupe = groupeOpt.get();
        // Détacher les étudiants avant suppression
        etudiantRepository.findAll().stream()
                .filter(e -> e.getGroupe() != null && e.getGroupe().getId().equals(groupe.getId()))
                .forEach(e -> {
                    e.setGroupe(null);
                    etudiantRepository.save(e);
                });

        groupeRepository.delete(groupe);
        log.info("Classe supprimée ID : {}", id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Classe supprimée avec succès."));
    }

    // =========================================================================
    // 4. DEMANDES D'INSCRIPTION & STATISTIQUES
    // =========================================================================

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

        if (user.getRole() == Role.ETUDIANT) {
            etudiantRepository.findByUserId(userId).ifPresent(etudiantRepository::delete);
        } else if (user.getRole() == Role.ENSEIGNANT) {
            enseignantRepository.findByUserId(userId).ifPresent(enseignantRepository::delete);
        }

        userRepository.delete(user);
        log.info("Demande supprimée définitivement pour {} (ID: {})", user.getEmail(), userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Demande d'inscription refusée et supprimée."
        ));
    }

    @GetMapping("/statistiques")
    public ResponseEntity<?> getAdminStats() {
        long totalEtudiants = etudiantRepository.count();
        long totalEnseignants = enseignantRepository.count();
        long totalAbsences = absenceRepository.count();
        long totalClasses = groupeRepository.count();
        long totalModules = matiereRepository.count();
        long totalSalles = salleRepository.count();
        long demandesEnAttente = userRepository.findByActifFalseOrderByCreatedAtDesc().size();

        return ResponseEntity.ok(Map.of(
                "totalEtudiants", totalEtudiants,
                "totalEnseignants", totalEnseignants,
                "totalAbsences", totalAbsences,
                "totalClasses", totalClasses,
                "totalModules", totalModules,
                "totalSalles", totalSalles,
                "demandesEnAttente", demandesEnAttente,
                "tauxAssiduite", "95.0%"
        ));
    }

    /**
     * Purge complète pour repartir d'une base 100% vierge (seul l'admin .env est conservé).
     */
    @PostMapping("/purge-complete")
    @Transactional
    public ResponseEntity<?> purgeComplete() {
        log.warn("Exécution d'une purge complète de la base par l'administrateur !");

        justificatifRepository.deleteAll();
        absenceRepository.deleteAll();
        etudiantRepository.deleteAll();
        enseignantRepository.deleteAll();
        groupeRepository.deleteAll();
        matiereRepository.deleteAll();
        salleRepository.deleteAll();

        // Supprimer tous les utilisateurs SAUF l'administrateur
        userRepository.findAll().stream()
                .filter(u -> u.getRole() != Role.ADMIN)
                .forEach(userRepository::delete);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Base de données entièrement purgée. Prête pour une configuration de zéro par l'administrateur."
        ));
    }
}
