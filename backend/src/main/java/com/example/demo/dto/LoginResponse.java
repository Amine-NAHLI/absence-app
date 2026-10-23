package com.example.demo.dto;

import com.example.demo.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private Role role;
    private String telephone;

    // Métadonnées contextuelles selon le rôle
    private Long etudiantId;
    private String matricule;
    private String cne;
    private Long groupeId;
    private String groupeCode;

    private Long enseignantId;
    private String departement;

    private String token; // Jeton de session / JWT
}
