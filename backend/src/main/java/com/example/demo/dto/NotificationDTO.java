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
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String titre;
    private String message;
    private String type;
    private Boolean lu;
    private LocalDateTime dateEnvoi;
    private Long etudiantId;
    private Long seanceId;
    private String matiereNom;
}
