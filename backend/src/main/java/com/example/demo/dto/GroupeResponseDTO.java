package com.example.demo.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupeResponseDTO {
    private Long id;
    private String code;
    private String nom;
    private String filiere;
    private String anneeScolaire;
    private int effectif;

    @Builder.Default
    private List<MatiereDTO> matieres = new ArrayList<>();
}
