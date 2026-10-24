package com.example.demo.controller;

import com.example.demo.dto.MatiereDTO;
import com.example.demo.dto.GroupeResponseDTO;
import com.example.demo.entity.Groupe;
import com.example.demo.repository.GroupeRepository;
import com.example.demo.repository.MatiereRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Slf4j
public class PublicController {

    private final GroupeRepository groupeRepository;
    private final MatiereRepository matiereRepository;

    /**
     * Renvoie la liste des classes réelles créées par l'administrateur pour l'inscription étudiante.
     */
    @GetMapping("/groupes")
    @Transactional(readOnly = true)
    public ResponseEntity<List<GroupeResponseDTO>> getPublicGroupes() {
        List<Groupe> groupes = groupeRepository.findAll();
        List<GroupeResponseDTO> dtos = groupes.stream().map(g -> {
            List<MatiereDTO> matieresList = g.getMatieres() != null ? g.getMatieres().stream().map(m -> MatiereDTO.builder()
                    .id(m.getId())
                    .code(m.getCode())
                    .nom(m.getNom())
                    .coefficient(m.getCoefficient())
                    .heuresTotal(m.getHeuresTotal())
                    .build()).collect(Collectors.toList()) : Collections.emptyList();

            return GroupeResponseDTO.builder()
                    .id(g.getId())
                    .code(g.getCode())
                    .nom(g.getNom())
                    .filiere(g.getFiliere())
                    .anneeScolaire(g.getAnneeScolaire())
                    .matieres(matieresList)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * Renvoie la liste des modules réels créés par l'administrateur pour l'inscription enseignante.
     */
    @GetMapping("/matieres")
    public ResponseEntity<List<MatiereDTO>> getPublicMatieres() {
        List<MatiereDTO> dtos = matiereRepository.findAll().stream().map(m -> MatiereDTO.builder()
                .id(m.getId())
                .code(m.getCode())
                .nom(m.getNom())
                .coefficient(m.getCoefficient())
                .heuresTotal(m.getHeuresTotal())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * Vérifie l'état de préparation de l'établissement : si aucune classe ou aucun module n'a été créé,
     * permet au frontend d'activer instantanément les garde-fous pour avertir les utilisateurs.
     */
    @GetMapping("/disponibilite-inscriptions")
    public ResponseEntity<?> getDisponibiliteInscriptions() {
        long nbGroupes = groupeRepository.count();
        long nbMatieres = matiereRepository.count();

        return ResponseEntity.ok(Map.of(
                "inscriptionsEtudiantsOuvertes", nbGroupes > 0,
                "inscriptionsEnseignantsOuvertes", nbMatieres > 0,
                "totalClasses", nbGroupes,
                "totalModules", nbMatieres
        ));
    }
}
