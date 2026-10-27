package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * US11 : DTO pour le calcul du taux d'absentéisme et la gestion des seuils d'alerte (> 20%).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TauxAbsenteismeDTO {
    private Long etudiantId;
    private String matricule;
    private String nom;
    private String prenom;
    private String groupeCode;
    private String groupeNom;
    private int totalSeances;
    private int totalPresences;
    private int totalAbsences;
    private int totalRetards;
    private int absencesNonJustifiees;
    private int absencesJustifiees;
    private int absencesEnAttente;
    private double heuresAbsenceTotal;
    private double tauxAssiduite;
    private double tauxAbsenteisme;
    private boolean seuilDepasse; // true si > 20%
    private String niveauAlerte;  // "NORMAL" (<=10%), "ATTENTION" (10-20%), "CRITIQUE" (>20%)
    private String messageAlerte;
    private List<TauxMatiereDTO> repartitionParMatiere;
}
