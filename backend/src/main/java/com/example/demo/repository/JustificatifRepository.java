package com.example.demo.repository;

import com.example.demo.entity.Justificatif;
import com.example.demo.entity.StatutJustificatif;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface JustificatifRepository extends JpaRepository<Justificatif, Long> {
    Optional<Justificatif> findByAbsenceId(Long absenceId);
    List<Justificatif> findByEtudiantIdOrderByDateDepotDesc(Long etudiantId);
    List<Justificatif> findByStatutOrderByDateDepotAsc(StatutJustificatif statut);
}
