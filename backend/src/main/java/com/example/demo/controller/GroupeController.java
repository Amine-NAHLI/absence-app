package com.example.demo.controller;

import com.example.demo.dto.EtudiantDTO;
import com.example.demo.entity.Groupe;
import com.example.demo.repository.EtudiantRepository;
import com.example.demo.repository.GroupeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groupes")
@RequiredArgsConstructor
public class GroupeController {

    private final GroupeRepository groupeRepository;
    private final EtudiantRepository etudiantRepository;

    @GetMapping
    public ResponseEntity<List<Groupe>> getAllGroupes() {
        return ResponseEntity.ok(groupeRepository.findAll());
    }

    /**
     * US02 : Consulter la liste des étudiants d'un groupe pour faire l'appel.
     * Trié par ordre alphabétique (Nom, Prénom).
     */
    @GetMapping("/{id}/etudiants")
    public ResponseEntity<List<EtudiantDTO>> getEtudiantsByGroupe(@PathVariable Long id) {
        List<EtudiantDTO> dtos = etudiantRepository.findByGroupeIdOrderByUserNomAscUserPrenomAsc(id)
                .stream()
                .map(e -> EtudiantDTO.builder()
                        .id(e.getId())
                        .userId(e.getUser().getId())
                        .nom(e.getUser().getNom())
                        .prenom(e.getUser().getPrenom())
                        .email(e.getUser().getEmail())
                        .matricule(e.getMatricule())
                        .cne(e.getCne())
                        .photoUrl(e.getPhotoUrl())
                        .groupeCode(e.getGroupe() != null ? e.getGroupe().getCode() : null)
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
