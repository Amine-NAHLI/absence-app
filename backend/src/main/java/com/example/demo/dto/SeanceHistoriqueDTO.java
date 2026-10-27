package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * US10 : DTO pour l'historique complet d'une séance avec la liste de ses absences.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeanceHistoriqueDTO {
    private Long seanceId;
    private LocalDate dateSeance;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String typeSeance;
    private String salle;
    private Long groupeId;
    private String groupeCode;
    private String groupeNom;
    private Long matiereId;
    private String matiereCode;
    private String matiereNom;
    private Long enseignantId;
    private String enseignantNom;
    private int totalEffectif;
    private int totalPresents;
    private int totalAbsents;
    private int totalRetards;
    private double tauxPresence;
    private List<AbsenceDetailItemDTO> detailsAbsents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AbsenceDetailItemDTO {
        private Long absenceId;
        private Long etudiantId;
        private String matricule;
        private String nom;
        private String prenom;
        private String typePresence;
        private String statut;
        private String dateMarquage;
        private Long justificatifId;
        private String justificatifStatut;
        private String justificatifNom;
        private String motifRefus;
    }
}
