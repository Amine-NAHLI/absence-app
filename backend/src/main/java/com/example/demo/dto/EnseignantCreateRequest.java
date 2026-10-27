package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * US15 : Requête de création d'un enseignant par l'administration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnseignantCreateRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    private String telephone;

    private String motDePasse;

    @NotBlank(message = "Le matricule enseignant est obligatoire")
    private String matricule;

    private String departement;

    private String specialite;
}
