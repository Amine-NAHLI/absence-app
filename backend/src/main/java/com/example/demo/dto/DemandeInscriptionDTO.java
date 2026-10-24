package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeInscriptionDTO {
    private Long userId;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String role;
    private String matricule;
    private String cne;
    private String groupeCode;
    private String departement;
    private String specialite;
    private LocalDateTime dateCreation;
    private boolean actif;
}
