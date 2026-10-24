package com.example.demo.repository;

import com.example.demo.entity.Etudiant;
import com.example.demo.entity.Groupe;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByUser(User user);
    Optional<Etudiant> findByUserId(Long userId);
    Optional<Etudiant> findByMatricule(String matricule);
    Optional<Etudiant> findByCne(String cne);
    List<Etudiant> findByGroupeOrderByUserNomAscUserPrenomAsc(Groupe groupe);
    List<Etudiant> findByGroupeIdOrderByUserNomAscUserPrenomAsc(Long groupeId);
    List<Etudiant> findByGroupeId(Long groupeId);
}
