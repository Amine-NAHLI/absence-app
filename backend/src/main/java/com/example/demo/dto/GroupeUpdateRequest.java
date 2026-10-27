package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * US16 : Requête de modification d'une classe / groupe et de ses affectations de matières.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupeUpdateRequest {

    @NotBlank(message = "Le code de la classe est obligatoire")
    private String code;

    @NotBlank(message = "Le nom de la classe est obligatoire")
    private String nom;

    private String filiere;

    private String anneeScolaire;

    private List<Long> matiereIds;
}
