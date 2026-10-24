package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupeCreateRequest {
    @NotBlank(message = "Le code de la classe est obligatoire (ex: GI4-A).")
    private String code;

    @NotBlank(message = "Le nom de la classe est obligatoire.")
    private String nom;

    private String filiere;

    private String anneeScolaire;

    @Builder.Default
    private List<Long> matiereIds = new ArrayList<>();
}
