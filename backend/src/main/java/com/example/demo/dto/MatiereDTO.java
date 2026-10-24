package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatiereDTO {
    private Long id;

    @NotBlank(message = "Le code du module est obligatoire.")
    private String code;

    @NotBlank(message = "L'intitulé du module est obligatoire.")
    private String nom;

    @NotNull(message = "Le coefficient est obligatoire.")
    private Integer coefficient;

    private Integer heuresTotal;
}
