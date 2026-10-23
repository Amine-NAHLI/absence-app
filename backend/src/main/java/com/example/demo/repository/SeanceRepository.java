package com.example.demo.repository;

import com.example.demo.entity.Seance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SeanceRepository extends JpaRepository<Seance, Long> {
    List<Seance> findByGroupeId(Long groupeId);
    List<Seance> findByEnseignantId(Long enseignantId);
    List<Seance> findByDateSeance(LocalDate dateSeance);
    List<Seance> findByEnseignantIdAndDateSeance(Long enseignantId, LocalDate dateSeance);
}
