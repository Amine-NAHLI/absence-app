package com.example.demo.controller;

import com.example.demo.dto.JustificatifDecisionRequest;
import com.example.demo.dto.JustificatifReviewDTO;
import com.example.demo.entity.*;
import com.example.demo.repository.AbsenceRepository;
import com.example.demo.repository.EnseignantRepository;
import com.example.demo.repository.EtudiantRepository;
import com.example.demo.repository.JustificatifRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/justificatifs")
@RequiredArgsConstructor
@Slf4j
public class JustificatifController {

    private final JustificatifRepository justificatifRepository;
    private final AbsenceRepository absenceRepository;
    private final EtudiantRepository etudiantRepository;
    private final EnseignantRepository enseignantRepository;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
    private static final String UPLOAD_DIR = "uploads/justificatifs";

    /**
     * US06 : Téléversement dématérialisé d'un justificatif d'absence (PDF, JPG, PNG <= 5 Mo).
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> uploadJustificatif(
            @RequestParam("file") MultipartFile file,
            @RequestParam("absenceId") Long absenceId,
            @RequestParam("etudiantId") Long etudiantId
    ) {
        log.info("Dépôt de justificatif reçu pour absence ID: {}, étudiant ID: {}", absenceId, etudiantId);

        // 1. Validation de présence
        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Le fichier est obligatoire."));
        }

        // 2. Contrôle de taille maximale : 5 Mo
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Le fichier dépasse la taille maximale autorisée de 5 Mo."));
        }

        // 3. Contrôle du type de fichier (PDF, JPG, PNG)
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String lowerName = originalFilename.toLowerCase();
        boolean isValidExtension = lowerName.endsWith(".pdf") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png");

        if (!isValidExtension) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Format non supporté. Seuls les formats PDF, JPG et PNG sont acceptés."));
        }

        // 4. Vérification de l'existence de l'absence et de l'étudiant
        Optional<Absence> absenceOpt = absenceRepository.findById(absenceId);
        if (absenceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Absence introuvable."));
        }

        Optional<Etudiant> etudiantOpt = etudiantRepository.findById(etudiantId);
        if (etudiantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Étudiant introuvable."));
        }

        Absence absence = absenceOpt.get();
        Etudiant etudiant = etudiantOpt.get();

        try {
            // 5. Stockage physique sécurisé du fichier
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String cleanFileName = System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path targetLocation = uploadPath.resolve(cleanFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 6. Enregistrement en base de données (Neon PostgreSQL)
            Optional<Justificatif> existantOpt = justificatifRepository.findByAbsenceId(absenceId);
            Justificatif justificatif;

            if (existantOpt.isPresent()) {
                justificatif = existantOpt.get();
                justificatif.setNomFichier(originalFilename);
                justificatif.setCheminStockage(targetLocation.toString());
                justificatif.setTypeMime(file.getContentType());
                justificatif.setTailleOctets(file.getSize());
                justificatif.setDateDepot(LocalDateTime.now());
                justificatif.setStatut(StatutJustificatif.EN_ATTENTE);
                justificatif.setMotifRefus(null);
            } else {
                justificatif = Justificatif.builder()
                        .absence(absence)
                        .etudiant(etudiant)
                        .nomFichier(originalFilename)
                        .cheminStockage(targetLocation.toString())
                        .typeMime(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                        .tailleOctets(file.getSize())
                        .dateDepot(LocalDateTime.now())
                        .statut(StatutJustificatif.EN_ATTENTE)
                        .build();
            }

            justificatifRepository.save(justificatif);

            // 7. Mise à jour de l'état de l'absence
            absence.setStatut(StatutAbsence.EN_ATTENTE);
            absenceRepository.save(absence);

            log.info("Justificatif enregistré avec succès avec ID: {}", justificatif.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Justificatif médical téléversé avec succès. Statut : En attente d'arbitrage.",
                    "justificatifId", justificatif.getId(),
                    "nomFichier", originalFilename,
                    "statut", justificatif.getStatut().name()
            ));

        } catch (IOException ex) {
            log.error("Erreur lors de l'enregistrement du fichier", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Erreur lors du stockage du document."));
        }
    }

    /**
     * US07 : Consulter la liste des justificatifs déposés par un étudiant (suivi de statut).
     */
    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<List<JustificatifReviewDTO>> getJustificatifsByEtudiant(@PathVariable Long etudiantId) {
        List<Justificatif> list = justificatifRepository.findByEtudiantIdOrderByDateDepotDesc(etudiantId);
        List<JustificatifReviewDTO> dtos = list.stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * US09 : Obtenir tous les justificatifs en attente d'arbitrage (Espace Enseignant & Scolarité).
     */
    @GetMapping("/en-attente")
    public ResponseEntity<List<JustificatifReviewDTO>> getJustificatifsEnAttente() {
        List<Justificatif> list = justificatifRepository.findByStatutOrderByDateDepotAsc(StatutJustificatif.EN_ATTENTE);
        List<JustificatifReviewDTO> dtos = list.stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * US09 : Valider ou Refuser un justificatif avec motif.
     */
    @PutMapping("/{id}/decision")
    @Transactional
    public ResponseEntity<?> arbitrerJustificatif(
            @PathVariable Long id,
            @RequestBody JustificatifDecisionRequest request
    ) {
        log.info("Décision d'arbitrage pour le justificatif ID {}: {}", id, request.getDecision());

        Optional<Justificatif> justifOpt = justificatifRepository.findById(id);
        if (justifOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Justificatif introuvable."));
        }

        Justificatif justif = justifOpt.get();
        Absence absence = justif.getAbsence();

        String decision = request.getDecision() != null ? request.getDecision().trim().toUpperCase() : "";

        if ("ACCEPTE".equals(decision) || "VALIDE".equals(decision) || "VALIDER".equals(decision)) {
            justif.setStatut(StatutJustificatif.ACCEPTE);
            justif.setMotifRefus(null);
            justif.setDateTraitement(LocalDateTime.now());
            if (absence != null) {
                absence.setStatut(StatutAbsence.JUSTIFIEE);
            }
        } else if ("REFUSE".equals(decision) || "REJETE".equals(decision) || "REFUSER".equals(decision)) {
            justif.setStatut(StatutJustificatif.REFUSE);
            justif.setMotifRefus(request.getMotif() != null && !request.getMotif().isBlank()
                    ? request.getMotif().trim()
                    : "Non conforme aux critères d'acceptation médicale UPF.");
            justif.setDateTraitement(LocalDateTime.now());
            if (absence != null) {
                absence.setStatut(StatutAbsence.REFUSEE);
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Décision invalide. Valeurs acceptées: ACCEPTE, REFUSE."));
        }

        if (request.getEnseignantId() != null) {
            enseignantRepository.findById(request.getEnseignantId()).ifPresent(justif::setValidePar);
        }

        justificatifRepository.save(justif);
        if (absence != null) {
            absenceRepository.save(absence);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Justificatif " + justif.getStatut().name() + " avec succès.",
                "justificatifId", justif.getId(),
                "nouveauStatut", justif.getStatut().name(),
                "absenceStatut", absence != null ? absence.getStatut().name() : ""
        ));
    }

    /**
     * Téléchargement ou visualisation du document justificatif.
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> telechargerFichier(@PathVariable Long id) {
        Optional<Justificatif> justifOpt = justificatifRepository.findById(id);
        if (justifOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Justificatif justif = justifOpt.get();
        try {
            Path filePath = Paths.get(justif.getCheminStockage()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = justif.getTypeMime() != null ? justif.getTypeMime() : "application/octet-stream";
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + justif.getNomFichier() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private JustificatifReviewDTO mapToDTO(Justificatif j) {
        Absence a = j.getAbsence();
        Etudiant e = j.getEtudiant();

        return JustificatifReviewDTO.builder()
                .id(j.getId())
                .absenceId(a != null ? a.getId() : null)
                .etudiantId(e != null ? e.getId() : null)
                .etudiantNom(e != null && e.getUser() != null ? e.getUser().getNom() + " " + e.getUser().getPrenom() : "Étudiant")
                .etudiantMatricule(e != null ? e.getMatricule() : "")
                .groupeCode(e != null && e.getGroupe() != null ? e.getGroupe().getCode() : "GI4-A")
                .matiereCode(a != null && a.getSeance() != null && a.getSeance().getMatiere() != null ? a.getSeance().getMatiere().getCode() : "GL401")
                .matiereNom(a != null && a.getSeance() != null && a.getSeance().getMatiere() != null ? a.getSeance().getMatiere().getNom() : "")
                .dateSeance(a != null && a.getSeance() != null ? a.getSeance().getDateSeance() : null)
                .nomFichier(j.getNomFichier())
                .typeMime(j.getTypeMime())
                .tailleOctets(j.getTailleOctets())
                .dateDepot(j.getDateDepot())
                .statut(j.getStatut())
                .motifRefus(j.getMotifRefus())
                .build();
    }
}
