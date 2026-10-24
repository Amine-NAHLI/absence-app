package com.example.demo.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeanceResponseDTO {
    private Long id;
    private LocalDate dateSeance;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String typeSeance;
    private String salle;

    // Matière
    private Long matiereId;
    private String matiereCode;
    private String matiereNom;

    // Groupe
    private Long groupeId;
    private String groupeCode;
    private String groupeNom;
    private Integer groupeEffectif;

    // Enseignant
    private Long enseignantId;
    private String enseignantNom;

    // Statut & Émargement
    private String statut;
    private boolean appelFait;
    private int nbAbsents;
}
