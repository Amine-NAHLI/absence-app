package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "Format d'adresse email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;

    private String telephone;

    @NotBlank(message = "Le rôle est obligatoire (ETUDIANT ou ENSEIGNANT)")
    private String role; // "ETUDIANT" ou "ENSEIGNANT"

    // Spécifique Étudiant
    private String matricule;
    private String cne;
    private String groupeCode; // ex : "GI4-A"

    // Spécifique Enseignant
    private String departement;
    private String specialite;
}
