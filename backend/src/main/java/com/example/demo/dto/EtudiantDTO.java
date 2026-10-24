package com.example.demo.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EtudiantDTO {
    private Long id;
    private Long userId;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String matricule;
    private String cne;
    private String photoUrl;
    private String groupeCode;
    private String groupeNom;
    private Boolean actif;
}
