package com.example.demo.repository;

import com.example.demo.entity.Absence;
import com.example.demo.entity.StatutAbsence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    
    // Règle anti-doublon clé du TP (US03)
    boolean existsByEtudiantIdAndSeanceId(Long etudiantId, Long seanceId);

    Optional<Absence> findByEtudiantIdAndSeanceId(Long etudiantId, Long seanceId);

    // Espace Étudiant (US04 - tri ante-chronologique)
    List<Absence> findByEtudiantIdOrderByDateMarquageDesc(Long etudiantId);

    // Espace Enseignant (US02, US10)
    List<Absence> findBySeanceId(Long seanceId);
    List<Absence> findByEnseignantIdOrderByDateMarquageDesc(Long enseignantId);

    // Statistiques & taux (US11)
    long countByEtudiantId(Long etudiantId);
    long countByEtudiantIdAndStatut(Long etudiantId, StatutAbsence statut);
}
