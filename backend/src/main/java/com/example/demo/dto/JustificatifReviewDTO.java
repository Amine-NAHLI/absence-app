package com.example.demo.dto;

import com.example.demo.entity.StatutJustificatif;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JustificatifReviewDTO {
    private Long id;
    private Long absenceId;
    private Long etudiantId;
    private String etudiantNom;
    private String etudiantMatricule;
    private String groupeCode;
    private String matiereCode;
    private String matiereNom;
    private LocalDate dateSeance;
    private String nomFichier;
    private String typeMime;
    private Long tailleOctets;
    private LocalDateTime dateDepot;
    private StatutJustificatif statut;
    private String motifRefus;
}
