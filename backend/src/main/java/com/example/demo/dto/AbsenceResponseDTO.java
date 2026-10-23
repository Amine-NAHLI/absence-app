package com.example.demo.dto;

import com.example.demo.entity.StatutAbsence;
import com.example.demo.entity.StatutJustificatif;
import com.example.demo.entity.TypePresence;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbsenceResponseDTO {

    private Long id;
    private Long seanceId;
    private String matiereCode;
    private String matiereNom;
    private LocalDate dateSeance;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String enseignantNom;
    private String salle;
    private TypePresence typePresence;
    private Integer dureeMinutes;
    private StatutAbsence statut;
    private LocalDateTime dateMarquage;

    // Métadonnées du justificatif s'il existe
    private Long justificatifId;
    private String justificatifNom;
    private StatutJustificatif justificatifStatut;
    private String motifRefus;
}
