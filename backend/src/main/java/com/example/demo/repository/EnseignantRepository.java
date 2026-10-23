package com.example.demo.repository;

import com.example.demo.entity.Enseignant;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EnseignantRepository extends JpaRepository<Enseignant, Long> {
    Optional<Enseignant> findByUser(User user);
    Optional<Enseignant> findByUserId(Long userId);
    Optional<Enseignant> findByMatricule(String matricule);
}
