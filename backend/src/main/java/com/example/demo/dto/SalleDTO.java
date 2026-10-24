package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalleDTO {
    private Long id;

    @NotBlank(message = "Le code de la salle est obligatoire.")
    private String code;

    @NotBlank(message = "Le nom de la salle est obligatoire.")
    private String nom;

    @NotNull(message = "La capacité est obligatoire.")
    private Integer capacite;

    private String type;
}
