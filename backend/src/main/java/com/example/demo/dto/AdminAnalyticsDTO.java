package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * US17 : DTO pour le tableau de bord décisionnel (BI) et statistiques globales d'assiduité.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsDTO {

    // Compteurs généraux
    private long totalEtudiants;
    private long totalEnseignants;
    private long totalClasses;
    private long totalModules;
    private long totalSalles;
    private long totalSeances;

    // Métriques d'assiduité
    private long totalPresences;
    private long totalAbsences;
    private long totalRetards;
    private double tauxAssiduiteGlobal;
    private double tauxAbsenteismeGlobal;

    // Statut des justificatifs
    private long justificatifsTotal;
    private long justificatifsEnAttente;
    private long justificatifsValides;
    private long justificatifsRefuses;

    // Ventilation décisionnelle BI
    private List<FiliereStatDTO> repartitionParFiliere;
    private List<GroupeStatDTO> repartitionParGroupe;
    private List<MatiereStatDTO> repartitionParMatiere;
    private List<EtudiantAlerteItemDTO> etudiantsEnAlerte;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FiliereStatDTO {
        private String filiere;
        private int effectif;
        private long totalAbsences;
        private double tauxAbsenteisme;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupeStatDTO {
        private Long groupeId;
        private String code;
        private String nom;
        private String filiere;
        private int effectif;
        private long totalAbsences;
        private double tauxAssiduite;
        private double tauxAbsenteisme;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatiereStatDTO {
        private Long matiereId;
        private String code;
        private String nom;
        private long totalAbsences;
        private double tauxAbsenteisme;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EtudiantAlerteItemDTO {
        private Long etudiantId;
        private String matricule;
        private String nom;
        private String prenom;
        private String groupeCode;
        private long totalAbsences;
        private double tauxAbsence;
        private String niveauAlerte; // "CRITIQUE" (>20%), "ATTENTION" (10-20%)
    }
}
