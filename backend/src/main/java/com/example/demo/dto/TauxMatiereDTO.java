package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TauxMatiereDTO {
    private Long matiereId;
    private String matiereCode;
    private String matiereNom;
    private int totalSeances;
    private int absences;
    private int retards;
    private int nonJustifiees;
    private int justifiees;
    private double tauxAbsence;
    private boolean seuilDepasse;
}
