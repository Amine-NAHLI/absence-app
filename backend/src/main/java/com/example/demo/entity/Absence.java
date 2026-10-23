package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "absences",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_absence_etudiant_seance", columnNames = {"etudiant_id", "seance_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Absence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seance_id", nullable = false)
    private Seance seance;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "enseignant_id", nullable = false)
    private Enseignant enseignant;

    @Column(name = "date_marquage")
    private LocalDateTime dateMarquage;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_presence", nullable = false, length = 20)
    @Builder.Default
    private TypePresence typePresence = TypePresence.ABSENT;

    @Column(name = "duree_minutes")
    @Builder.Default
    private Integer dureeMinutes = 90;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutAbsence statut = StatutAbsence.NON_JUSTIFIEE;

    @PrePersist
    protected void onCreate() {
        if (this.dateMarquage == null) {
            this.dateMarquage = LocalDateTime.now();
        }
    }
}
