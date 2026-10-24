package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JustificatifDecisionRequest {
    private String decision; // "ACCEPTE" ou "REFUSE"
    private String motif;
    private Long enseignantId;
}
