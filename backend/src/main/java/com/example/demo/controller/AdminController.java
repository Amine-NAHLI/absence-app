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
    private final SeanceRepository seanceRepository;

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

    /**
     * US16 : Mettre à jour une classe / groupe (code, nom, filière, année scolaire, matières associées).
     */
    @PutMapping("/groupes/{id}")
    @Transactional
    public ResponseEntity<?> updateGroupe(@PathVariable Long id, @Valid @RequestBody GroupeUpdateRequest req) {
        Optional<Groupe> grpOpt = groupeRepository.findById(id);
        if (grpOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Classe introuvable."));
        }

        Groupe groupe = grpOpt.get();
        String cleanCode = req.getCode().trim().toUpperCase();

        if (!cleanCode.equalsIgnoreCase(groupe.getCode()) && groupeRepository.existsByCode(cleanCode)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Une classe avec le code " + cleanCode + " existe déjà."));
        }

        groupe.setCode(cleanCode);
        groupe.setNom(req.getNom().trim());
        if (req.getFiliere() != null && !req.getFiliere().isBlank()) {
            groupe.setFiliere(req.getFiliere().trim());
        }
        if (req.getAnneeScolaire() != null && !req.getAnneeScolaire().isBlank()) {
            groupe.setAnneeScolaire(req.getAnneeScolaire().trim());
        }

        if (req.getMatiereIds() != null) {
            Set<Matiere> matieres = new HashSet<>();
            for (Long matId : req.getMatiereIds()) {
                matiereRepository.findById(matId).ifPresent(matieres::add);
            }
            groupe.setMatieres(matieres);
        }

        Groupe saved = groupeRepository.save(groupe);
        log.info("Classe ID: {} mise à jour avec succès : {}", id, saved.getCode());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Classe " + saved.getCode() + " mise à jour avec succès.",
                "id", saved.getId()
        ));
    }

    /**
     * US16 : Gérer les affectations de cours / matières d'une classe.
     */
    @PutMapping("/groupes/{id}/affectations")
    @Transactional
    public ResponseEntity<?> updateGroupeAffectations(@PathVariable Long id, @RequestBody Map<String, List<Long>> payload) {
        Optional<Groupe> grpOpt = groupeRepository.findById(id);
        if (grpOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Classe introuvable."));
        }

        Groupe groupe = grpOpt.get();
        List<Long> matiereIds = payload.get("matiereIds");
        Set<Matiere> matieres = new HashSet<>();

        if (matiereIds != null) {
            for (Long matId : matiereIds) {
                matiereRepository.findById(matId).ifPresent(matieres::add);
            }
        }

        groupe.setMatieres(matieres);
        groupeRepository.save(groupe);
        log.info("Affectations de matières mises à jour pour la classe {} ({} matières)", groupe.getCode(), matieres.size());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Affectations mises à jour (" + matieres.size() + " modules associés).",
                "matieresCount", matieres.size()
        ));
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

        long totalSeances = seanceRepository.count();
        double tauxAssiduiteVal = 95.0;
        if (totalEtudiants > 0 && totalSeances > 0) {
            double maxPossibles = totalEtudiants * totalSeances;
            double abs = (double) totalAbsences;
            tauxAssiduiteVal = Math.max(0.0, Math.min(100.0, ((maxPossibles - abs) / maxPossibles) * 100.0));
            tauxAssiduiteVal = Math.round(tauxAssiduiteVal * 10.0) / 10.0;
        }

        return ResponseEntity.ok(Map.of(
                "totalEtudiants", totalEtudiants,
                "totalEnseignants", totalEnseignants,
                "totalAbsences", totalAbsences,
                "totalClasses", totalClasses,
                "totalModules", totalModules,
                "totalSalles", totalSalles,
                "demandesEnAttente", demandesEnAttente,
                "tauxAssiduite", String.format(Locale.US, "%.1f%%", tauxAssiduiteVal)
        ));
    }

    /**
     * US17 : Consulter les statistiques globales d'absence sous forme décisionnelle graphique (BI).
     */
    @GetMapping("/analytics")
    @Transactional(readOnly = true)
    public ResponseEntity<AdminAnalyticsDTO> getAdminAnalytics() {
        log.info("Génération du rapport décisionnel BI d'assiduité");

        List<Etudiant> etudiants = etudiantRepository.findAll();
        List<Absence> absences = absenceRepository.findAll();
        List<Groupe> groupes = groupeRepository.findAll();
        List<Matiere> matieres = matiereRepository.findAll();
        List<Seance> seances = seanceRepository.findAll();
        List<Justificatif> justificatifs = justificatifRepository.findAll();

        long totalEtudiants = etudiants.size();
        long totalEnseignants = enseignantRepository.count();
        long totalClasses = groupes.size();
        long totalModules = matieres.size();
        long totalSalles = salleRepository.count();
        long totalSeances = seances.size();

        long totalAbs = absences.stream().filter(a -> a.getTypePresence() == TypePresence.ABSENT).count();
        long totalRetards = absences.stream().filter(a -> a.getTypePresence() == TypePresence.RETARD).count();

        // Taux global
        double totalPresencesPossibles = Math.max(1, totalEtudiants * Math.max(1, totalSeances));
        double tauxAbsenteisme = ((totalAbs + (totalRetards / 3.0)) / totalPresencesPossibles) * 100.0;
        tauxAbsenteisme = Math.min(100.0, Math.round(tauxAbsenteisme * 10.0) / 10.0);
        double tauxAssiduite = Math.max(0.0, Math.round((100.0 - tauxAbsenteisme) * 10.0) / 10.0);

        // Justificatifs
        long justifTotal = justificatifs.size();
        long justifEnAttente = justificatifs.stream().filter(j -> j.getStatut() == StatutJustificatif.EN_ATTENTE).count();
        long justifValides = justificatifs.stream().filter(j -> j.getStatut() == StatutJustificatif.ACCEPTE).count();
        long justifRefuses = justificatifs.stream().filter(j -> j.getStatut() == StatutJustificatif.REFUSE).count();

        // Répartition par Groupe
        List<AdminAnalyticsDTO.GroupeStatDTO> groupeStats = groupes.stream().map(g -> {
            int eff = (int) etudiants.stream().filter(e -> e.getGroupe() != null && e.getGroupe().getId().equals(g.getId())).count();
            long grpAbs = absences.stream()
                    .filter(a -> a.getEtudiant() != null && a.getEtudiant().getGroupe() != null && a.getEtudiant().getGroupe().getId().equals(g.getId()))
                    .count();
            long grpSeances = seances.stream().filter(s -> s.getGroupe() != null && s.getGroupe().getId().equals(g.getId())).count();
            double grpPossibles = Math.max(1, eff * Math.max(1, grpSeances));
            double gTauxAbs = Math.min(100.0, Math.round(((double) grpAbs / grpPossibles) * 1000.0) / 10.0);
            double gTauxAss = Math.max(0.0, Math.round((100.0 - gTauxAbs) * 10.0) / 10.0);

            return AdminAnalyticsDTO.GroupeStatDTO.builder()
                    .groupeId(g.getId())
                    .code(g.getCode())
                    .nom(g.getNom())
                    .filiere(g.getFiliere() != null ? g.getFiliere() : "Génie Informatique")
                    .effectif(eff)
                    .totalAbsences(grpAbs)
                    .tauxAssiduite(gTauxAss)
                    .tauxAbsenteisme(gTauxAbs)
                    .build();
        }).collect(Collectors.toList());

        // Répartition par Filière
        Map<String, List<AdminAnalyticsDTO.GroupeStatDTO>> byFiliere = groupeStats.stream()
                .collect(Collectors.groupingBy(g -> g.getFiliere() != null ? g.getFiliere() : "Génie Informatique"));

        List<AdminAnalyticsDTO.FiliereStatDTO> filiereStats = byFiliere.entrySet().stream().map(entry -> {
            String filiereNom = entry.getKey();
            List<AdminAnalyticsDTO.GroupeStatDTO> grps = entry.getValue();
            int effTot = grps.stream().mapToInt(AdminAnalyticsDTO.GroupeStatDTO::getEffectif).sum();
            long absTot = grps.stream().mapToLong(AdminAnalyticsDTO.GroupeStatDTO::getTotalAbsences).sum();
            double avgAbs = grps.isEmpty() ? 0.0 : grps.stream().mapToDouble(AdminAnalyticsDTO.GroupeStatDTO::getTauxAbsenteisme).average().orElse(0.0);
            avgAbs = Math.round(avgAbs * 10.0) / 10.0;

            return AdminAnalyticsDTO.FiliereStatDTO.builder()
                    .filiere(filiereNom)
                    .effectif(effTot)
                    .totalAbsences(absTot)
                    .tauxAbsenteisme(avgAbs)
                    .build();
        }).collect(Collectors.toList());

        // Répartition par Matière
        List<AdminAnalyticsDTO.MatiereStatDTO> matiereStats = matieres.stream().map(m -> {
            long matAbs = absences.stream()
                    .filter(a -> a.getSeance() != null && a.getSeance().getMatiere() != null && a.getSeance().getMatiere().getId().equals(m.getId()))
                    .count();
            long matSeances = seances.stream()
                    .filter(s -> s.getMatiere() != null && s.getMatiere().getId().equals(m.getId()))
                    .count();
            double mTaux = matSeances > 0 ? ((double) matAbs / (matSeances * Math.max(1, totalEtudiants))) * 100.0 : 0.0;
            mTaux = Math.min(100.0, Math.round(mTaux * 10.0) / 10.0);

            return AdminAnalyticsDTO.MatiereStatDTO.builder()
                    .matiereId(m.getId())
                    .code(m.getCode())
                    .nom(m.getNom())
                    .totalAbsences(matAbs)
                    .tauxAbsenteisme(mTaux)
                    .build();
        }).collect(Collectors.toList());

        // Étudiants en Alerte (> 20% ou le plus d'absences)
        List<AdminAnalyticsDTO.EtudiantAlerteItemDTO> etudiantsAlerte = etudiants.stream().map(e -> {
            long eAbs = absences.stream().filter(a -> a.getEtudiant() != null && a.getEtudiant().getId().equals(e.getId())).count();
            long seancesGrp = (e.getGroupe() != null)
                    ? seances.stream().filter(s -> s.getGroupe() != null && s.getGroupe().getId().equals(e.getGroupe().getId())).count()
                    : 0;
            double totalSeancesConsiderees = Math.max(1, Math.max(seancesGrp, eAbs));
            double eTaux = Math.min(100.0, Math.round(((double) eAbs / totalSeancesConsiderees) * 1000.0) / 10.0);

            String niveau = eTaux > 20.0 ? "CRITIQUE" : (eTaux >= 10.0 ? "ATTENTION" : "NORMAL");

            return AdminAnalyticsDTO.EtudiantAlerteItemDTO.builder()
                    .etudiantId(e.getId())
                    .matricule(e.getMatricule())
                    .nom(e.getUser() != null ? e.getUser().getNom() : "")
                    .prenom(e.getUser() != null ? e.getUser().getPrenom() : "")
                    .groupeCode(e.getGroupe() != null ? e.getGroupe().getCode() : "—")
                    .totalAbsences(eAbs)
                    .tauxAbsence(eTaux)
                    .niveauAlerte(niveau)
                    .build();
        })
        .filter(item -> item.getTotalAbsences() > 0 || item.getTauxAbsence() > 0)
        .sorted(Comparator.comparingDouble(AdminAnalyticsDTO.EtudiantAlerteItemDTO::getTauxAbsence).reversed())
        .collect(Collectors.toList());

        return ResponseEntity.ok(AdminAnalyticsDTO.builder()
                .totalEtudiants(totalEtudiants)
                .totalEnseignants(totalEnseignants)
                .totalClasses(totalClasses)
                .totalModules(totalModules)
                .totalSalles(totalSalles)
                .totalSeances(totalSeances)
                .totalPresences(Math.max(0, (long) totalPresencesPossibles - (totalAbs + totalRetards)))
                .totalAbsences(totalAbs)
                .totalRetards(totalRetards)
                .tauxAssiduiteGlobal(tauxAssiduite)
                .tauxAbsenteismeGlobal(tauxAbsenteisme)
                .justificatifsTotal(justifTotal)
                .justificatifsEnAttente(justifEnAttente)
                .justificatifsValides(justifValides)
                .justificatifsRefuses(justifRefuses)
                .repartitionParFiliere(filiereStats)
                .repartitionParGroupe(groupeStats)
                .repartitionParMatiere(matiereStats)
                .etudiantsEnAlerte(etudiantsAlerte)
                .build());
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

    // =========================================================================
    // 5. GESTION ET CONSULTATION DES ÉTUDIANTS & ENSEIGNANTS
    // =========================================================================

    /**
     * Liste exhaustive de tous les étudiants enregistrés dans l'établissement.
     */
    @GetMapping("/etudiants")
    @Transactional(readOnly = true)
    public ResponseEntity<List<EtudiantDTO>> getAllEtudiants() {
        List<Etudiant> etudiants = etudiantRepository.findAll();
        List<EtudiantDTO> dtos = etudiants.stream()
                .filter(e -> e.getUser() != null)
                .map(e -> EtudiantDTO.builder()
                        .id(e.getId())
                        .userId(e.getUser().getId())
                        .nom(e.getUser().getNom())
                        .prenom(e.getUser().getPrenom())
                        .email(e.getUser().getEmail())
                        .telephone(e.getUser().getTelephone())
                        .matricule(e.getMatricule())
                        .cne(e.getCne())
                        .photoUrl(e.getPhotoUrl())
                        .groupeCode(e.getGroupe() != null ? e.getGroupe().getCode() : null)
                        .groupeNom(e.getGroupe() != null ? e.getGroupe().getNom() : null)
                        .actif(Boolean.TRUE.equals(e.getUser().getActif()))
                        .build())
                .sorted(Comparator.comparing(EtudiantDTO::getNom, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * Suppression définitive d'un étudiant par l'administrateur.
     */
    @DeleteMapping("/etudiants/{id}")
    @Transactional
    public ResponseEntity<?> deleteEtudiant(@PathVariable Long id) {
        Optional<Etudiant> etuOpt = etudiantRepository.findById(id);
        if (etuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Étudiant introuvable."));
        }
        Etudiant etudiant = etuOpt.get();
        User user = etudiant.getUser();

        // 1. Supprimer d'abord les justificatifs déposés par cet étudiant
        justificatifRepository.findByEtudiantIdOrderByDateDepotDesc(etudiant.getId())
                .forEach(justificatifRepository::delete);

        // 2. Supprimer les absences enregistrées pour cet étudiant
        absenceRepository.findByEtudiantIdOrderByDateMarquageDesc(etudiant.getId())
                .forEach(absenceRepository::delete);

        // 3. Supprimer l'entité étudiant puis le compte utilisateur
        etudiantRepository.delete(etudiant);
        if (user != null) {
            userRepository.delete(user);
        }

        log.info("Étudiant ID: {} supprimé avec succès par l'administrateur", id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Étudiant supprimé avec succès."));
    }

    /**
     * US13 : Ajouter un nouvel étudiant par l'administration (avec matricule unique).
     */
    @PostMapping("/etudiants")
    @Transactional
    public ResponseEntity<?> createEtudiant(@Valid @RequestBody EtudiantCreateRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        String cleanMatricule = req.getMatricule().trim().toUpperCase();

        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Un compte avec l'adresse email " + cleanEmail + " existe déjà."));
        }

        if (etudiantRepository.findByMatricule(cleanMatricule).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Un étudiant avec le matricule " + cleanMatricule + " existe déjà."));
        }

        Groupe groupe = null;
        if (req.getGroupeId() != null) {
            groupe = groupeRepository.findById(req.getGroupeId()).orElse(null);
        }

        String password = (req.getMotDePasse() != null && !req.getMotDePasse().isBlank())
                ? req.getMotDePasse().trim()
                : "Etudiant123!";

        User user = User.builder()
                .nom(req.getNom().trim().toUpperCase())
                .prenom(req.getPrenom().trim())
                .email(cleanEmail)
                .telephone(req.getTelephone() != null ? req.getTelephone().trim() : null)
                .motDePasse(password)
                .role(Role.ETUDIANT)
                .actif(true)
                .build();

        User savedUser = userRepository.save(user);

        Etudiant etudiant = Etudiant.builder()
                .user(savedUser)
                .matricule(cleanMatricule)
                .cne(req.getCne() != null ? req.getCne().trim().toUpperCase() : null)
                .groupe(groupe)
                .build();

        Etudiant savedEtudiant = etudiantRepository.save(etudiant);
        log.info("Étudiant créé avec succès par admin : {} {} (Matricule: {})", savedUser.getNom(), savedUser.getPrenom(), savedEtudiant.getMatricule());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Étudiant " + savedUser.getPrenom() + " " + savedUser.getNom() + " créé avec succès.",
                "id", savedEtudiant.getId(),
                "matricule", savedEtudiant.getMatricule()
        ));
    }

    /**
     * US14 : Modifier les informations d'un étudiant (email, téléphone, classe, matricule, CNE).
     */
    @PutMapping("/etudiants/{id}")
    @Transactional
    public ResponseEntity<?> updateEtudiant(@PathVariable Long id, @Valid @RequestBody EtudiantUpdateRequest req) {
        Optional<Etudiant> etuOpt = etudiantRepository.findById(id);
        if (etuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Étudiant introuvable."));
        }

        Etudiant etudiant = etuOpt.get();
        User user = etudiant.getUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Compte utilisateur introuvable."));
        }

        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (!cleanEmail.equalsIgnoreCase(user.getEmail()) && userRepository.findByEmail(cleanEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Cette adresse email est déjà utilisée par un autre compte."));
        }

        String cleanMatricule = req.getMatricule() != null ? req.getMatricule().trim().toUpperCase() : etudiant.getMatricule();
        if (!cleanMatricule.equalsIgnoreCase(etudiant.getMatricule())) {
            Optional<Etudiant> existMat = etudiantRepository.findByMatricule(cleanMatricule);
            if (existMat.isPresent() && !existMat.get().getId().equals(etudiant.getId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("success", false, "message", "Ce matricule est déjà attribué à un autre étudiant."));
            }
        }

        user.setNom(req.getNom().trim().toUpperCase());
        user.setPrenom(req.getPrenom().trim());
        user.setEmail(cleanEmail);
        if (req.getTelephone() != null) user.setTelephone(req.getTelephone().trim());
        if (req.getActif() != null) user.setActif(req.getActif());
        userRepository.save(user);

        etudiant.setMatricule(cleanMatricule);
        if (req.getCne() != null) etudiant.setCne(req.getCne().trim().toUpperCase());
        if (req.getGroupeId() != null) {
            groupeRepository.findById(req.getGroupeId()).ifPresent(etudiant::setGroupe);
        }

        etudiantRepository.save(etudiant);
        log.info("Étudiant ID: {} mis à jour avec succès par l'administrateur", id);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Fiche de l'étudiant mise à jour avec succès.",
                "id", etudiant.getId()
        ));
    }

    /**
     * Liste exhaustive de tous les enseignants / professeurs de l'établissement.
     */
    @GetMapping("/enseignants")
    @Transactional(readOnly = true)
    public ResponseEntity<List<EnseignantDTO>> getAllEnseignants() {
        List<Enseignant> enseignants = enseignantRepository.findAll();
        List<EnseignantDTO> dtos = enseignants.stream()
                .filter(p -> p.getUser() != null)
                .map(p -> EnseignantDTO.builder()
                        .id(p.getId())
                        .userId(p.getUser().getId())
                        .nom(p.getUser().getNom())
                        .prenom(p.getUser().getPrenom())
                        .email(p.getUser().getEmail())
                        .telephone(p.getUser().getTelephone())
                        .matricule(p.getMatricule())
                        .departement(p.getDepartement())
                        .specialite(p.getSpecialite())
                        .actif(Boolean.TRUE.equals(p.getUser().getActif()))
                        .build())
                .sorted(Comparator.comparing(EnseignantDTO::getNom, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * US15 : Ajouter un enseignant par l'administration (département, matière/spécialité).
     */
    @PostMapping("/enseignants")
    @Transactional
    public ResponseEntity<?> createEnseignant(@Valid @RequestBody EnseignantCreateRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        String cleanMatricule = req.getMatricule().trim().toUpperCase();

        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Un compte avec l'adresse email " + cleanEmail + " existe déjà."));
        }

        if (enseignantRepository.findByMatricule(cleanMatricule).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Un enseignant avec le matricule " + cleanMatricule + " existe déjà."));
        }

        String password = (req.getMotDePasse() != null && !req.getMotDePasse().isBlank())
                ? req.getMotDePasse().trim()
                : "Prof123!";

        User user = User.builder()
                .nom(req.getNom().trim().toUpperCase())
                .prenom(req.getPrenom().trim())
                .email(cleanEmail)
                .telephone(req.getTelephone() != null ? req.getTelephone().trim() : null)
                .motDePasse(password)
                .role(Role.ENSEIGNANT)
                .actif(true)
                .build();

        User savedUser = userRepository.save(user);

        Enseignant enseignant = Enseignant.builder()
                .user(savedUser)
                .matricule(cleanMatricule)
                .departement(req.getDepartement() != null ? req.getDepartement().trim() : "Informatique")
                .specialite(req.getSpecialite() != null ? req.getSpecialite().trim() : "Génie Logiciel")
                .build();

        Enseignant savedProf = enseignantRepository.save(enseignant);
        log.info("Enseignant créé avec succès par admin : Prof. {} {} (Matricule: {})", savedUser.getNom(), savedUser.getPrenom(), savedProf.getMatricule());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Enseignant Prof. " + savedUser.getPrenom() + " " + savedUser.getNom() + " créé avec succès.",
                "id", savedProf.getId(),
                "matricule", savedProf.getMatricule()
        ));
    }

    /**
     * Mettre à jour la fiche d'un enseignant par l'administration.
     */
    @PutMapping("/enseignants/{id}")
    @Transactional
    public ResponseEntity<?> updateEnseignant(@PathVariable Long id, @Valid @RequestBody EnseignantUpdateRequest req) {
        Optional<Enseignant> profOpt = enseignantRepository.findById(id);
        if (profOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Enseignant introuvable."));
        }

        Enseignant enseignant = profOpt.get();
        User user = enseignant.getUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Compte utilisateur introuvable."));
        }

        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (!cleanEmail.equalsIgnoreCase(user.getEmail()) && userRepository.findByEmail(cleanEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Cette adresse email est déjà utilisée par un autre compte."));
        }

        String cleanMatricule = req.getMatricule() != null ? req.getMatricule().trim().toUpperCase() : enseignant.getMatricule();
        if (!cleanMatricule.equalsIgnoreCase(enseignant.getMatricule())) {
            Optional<Enseignant> existMat = enseignantRepository.findByMatricule(cleanMatricule);
            if (existMat.isPresent() && !existMat.get().getId().equals(enseignant.getId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("success", false, "message", "Ce matricule est déjà attribué à un autre enseignant."));
            }
        }

        user.setNom(req.getNom().trim().toUpperCase());
        user.setPrenom(req.getPrenom().trim());
        user.setEmail(cleanEmail);
        if (req.getTelephone() != null) user.setTelephone(req.getTelephone().trim());
        if (req.getActif() != null) user.setActif(req.getActif());
        userRepository.save(user);

        enseignant.setMatricule(cleanMatricule);
        if (req.getDepartement() != null) enseignant.setDepartement(req.getDepartement().trim());
        if (req.getSpecialite() != null) enseignant.setSpecialite(req.getSpecialite().trim());
        enseignantRepository.save(enseignant);

        log.info("Enseignant ID: {} mis à jour avec succès par l'administrateur", id);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Fiche de l'enseignant mise à jour avec succès.",
                "id", enseignant.getId()
        ));
    }

    /**
     * Suppression définitive d'un enseignant par l'administrateur.
     */
    @DeleteMapping("/enseignants/{id}")
    @Transactional
    public ResponseEntity<?> deleteEnseignant(@PathVariable Long id) {
        Optional<Enseignant> profOpt = enseignantRepository.findById(id);
        if (profOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Enseignant introuvable."));
        }
        Enseignant enseignant = profOpt.get();
        User user = enseignant.getUser();

        // 1. Détacher les absences marquées par cet enseignant
        absenceRepository.findAll().stream()
                .filter(a -> a.getEnseignant() != null && a.getEnseignant().getId().equals(enseignant.getId()))
                .forEach(a -> {
                    a.setEnseignant(null);
                    absenceRepository.save(a);
                });

        // 2. Supprimer l'enseignant puis son compte utilisateur
        enseignantRepository.delete(enseignant);
        if (user != null) {
            userRepository.delete(user);
        }

        log.info("Enseignant ID: {} supprimé avec succès par l'administrateur", id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Enseignant supprimé avec succès."));
    }
}
