package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Ex: "LABO-03", "AMPHI-A", "SALLE-102"

    @Column(nullable = false, length = 100)
    private String nom; // Ex: "Laboratoire Systèmes & Réseaux"

    @Column(nullable = false)
    private Integer capacite; // Ex: 35

    @Column(length = 50)
    @Builder.Default
    private String type = "SALLE_COURS"; // "LABO", "AMPHI", "SALLE_COURS", "SALLE_TD"
}
