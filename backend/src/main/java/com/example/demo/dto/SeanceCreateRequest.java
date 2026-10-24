package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeanceCreateRequest {

    @NotNull(message = "L'identifiant de l'enseignant est obligatoire")
    private Long enseignantId;

    @NotNull(message = "L'identifiant de la classe est obligatoire")
    private Long groupeId;

    @NotNull(message = "L'identifiant du module est obligatoire")
    private Long matiereId;

    private String salle;

    private String typeSeance; // COURS, TD, TP

    private String heureDebut; // ex: "08:30"

    private String heureFin; // ex: "10:15"

    private LocalDate dateSeance;
}
