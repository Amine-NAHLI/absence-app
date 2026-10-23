package com.example.demo.dto;

import com.example.demo.entity.TypePresence;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnregistrerAppelRequest {

    @NotNull(message = "L'ID de la séance est obligatoire")
    private Long seanceId;

    @NotNull(message = "L'ID de l'enseignant est obligatoire")
    private Long enseignantId;

    private List<EtudiantPresenceItem> absents;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EtudiantPresenceItem {
        private Long etudiantId;
        private TypePresence typePresence; // ABSENT ou RETARD
    }
}
