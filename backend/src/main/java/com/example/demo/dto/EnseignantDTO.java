package com.example.demo.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnseignantDTO {
    private Long id;
    private Long userId;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String matricule;
    private String departement;
    private String specialite;
    private Boolean actif;
}
