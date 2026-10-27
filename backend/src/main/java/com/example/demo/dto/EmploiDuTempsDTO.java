package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * US12 : DTO pour l'emploi du temps hebdomadaire de l'étudiant.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmploiDuTempsDTO {
    private Long etudiantId;
    private Long groupeId;
    private String groupeCode;
    private String groupeNom;
    private String filiere;
    private String anneeScolaire;
    private List<SeancePlanningDTO> seances;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeancePlanningDTO {
        private Long seanceId;
        private LocalDate dateSeance;
        private String jourSemaine; // "LUNDI", "MARDI", etc.
        private String jourLabel;   // "Lundi", "Mardi", etc.
        private LocalTime heureDebut;
        private LocalTime heureFin;
        private String creneauHoraire; // "08:30 — 10:15"
        private String typeSeance;     // "COURS", "TD", "TP"
        private String salle;
        private Long matiereId;
        private String matiereCode;
        private String matiereNom;
        private Long enseignantId;
        private String enseignantNom;
        private String statut;         // "PLANIFIEE", "EN_COURS", "TERMINEE"
        private boolean estEnCours;
    }
}
