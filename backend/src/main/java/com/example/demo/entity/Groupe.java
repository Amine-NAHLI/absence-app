package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "groupes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Groupe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 100)
    private String filiere;

    @Column(name = "annee_scolaire", length = 20)
    private String anneeScolaire;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "groupe_matieres",
            joinColumns = @JoinColumn(name = "groupe_id"),
            inverseJoinColumns = @JoinColumn(name = "matiere_id")
    )
    @JsonIgnoreProperties("groupes")
    @Builder.Default
    private Set<Matiere> matieres = new HashSet<>();
}
