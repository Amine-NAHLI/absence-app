package com.example.demo.service;

import com.example.demo.dto.NotificationDTO;
import com.example.demo.entity.Etudiant;
import com.example.demo.entity.Notification;
import com.example.demo.entity.Seance;
import com.example.demo.entity.TypePresence;
import com.example.demo.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * US18 : Service d'envoi de notifications temps réel via WebSockets (STOMP)
 * avec persistance en base de données.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public NotificationDTO notifierAbsence(Etudiant etudiant, Seance seance, TypePresence typePresence) {
        if (etudiant == null || etudiant.getUser() == null || seance == null) {
            log.warn("Impossible d'envoyer la notification : données incomplètes.");
            return null;
        }

        String matiereNom = seance.getMatiere() != null ? seance.getMatiere().getNom() : "Séance de cours";
        String typeLabel = typePresence == TypePresence.RETARD ? "un Retard" : "une Absence";
        String heureStr = seance.getHeureDebut() != null ? seance.getHeureDebut().toString() : "";
        String dateStr = seance.getDateSeance() != null ? seance.getDateSeance().toString() : "";

        String titre = "⚠️ Signalement : " + typeLabel + " en " + matiereNom;
        String message = String.format("Vous avez été marqué(e) %s lors de la séance de %s du %s à %s. Pensez à régulariser votre justificatif dans les 48h.",
                typeLabel.toLowerCase(), matiereNom, dateStr, heureStr);

        // 1. Persistance en base de données
        Notification notification = Notification.builder()
                .user(etudiant.getUser())
                .titre(titre)
                .message(message)
                .type(typePresence != null ? typePresence.name() : "ABSENCE")
                .lu(false)
                .dateEnvoi(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);

        NotificationDTO dto = NotificationDTO.builder()
                .id(saved.getId())
                .userId(etudiant.getUser().getId())
                .titre(saved.getTitre())
                .message(saved.getMessage())
                .type(saved.getType())
                .lu(saved.getLu())
                .dateEnvoi(saved.getDateEnvoi())
                .etudiantId(etudiant.getId())
                .seanceId(seance.getId())
                .matiereNom(matiereNom)
                .build();

        // 2. Diffusion temps réel WebSocket sur le topic personnel de l'étudiant
        String topicEtudiant = "/topic/etudiant/" + etudiant.getId() + "/absences";
        try {
            messagingTemplate.convertAndSend(topicEtudiant, dto);
            log.info("Notification WebSocket envoyée sur {} : {}", topicEtudiant, dto.getTitre());
        } catch (Exception e) {
            log.error("Erreur d'envoi WebSocket pour l'étudiant ID {}: {}", etudiant.getId(), e.getMessage());
        }

        // 3. Diffusion sur le topic d'administration / surveillance globale
        try {
            messagingTemplate.convertAndSend("/topic/admin/absences", dto);
        } catch (Exception ignored) {}

        return dto;
    }

    public List<NotificationDTO> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByDateEnvoiDesc(userId).stream()
                .map(n -> NotificationDTO.builder()
                        .id(n.getId())
                        .userId(n.getUser() != null ? n.getUser().getId() : null)
                        .titre(n.getTitre())
                        .message(n.getMessage())
                        .type(n.getType())
                        .lu(n.getLu())
                        .dateEnvoi(n.getDateEnvoi())
                        .build())
                .collect(Collectors.toList());
    }

    public long countNonLues(Long userId) {
        return notificationRepository.countByUserIdAndLuFalse(userId);
    }

    @Transactional
    public boolean marquerCommeLue(Long notificationId) {
        return notificationRepository.findById(notificationId).map(n -> {
            n.setLu(true);
            notificationRepository.save(n);
            return true;
        }).orElse(false);
    }

    @Transactional
    public void marquerToutesCommeLues(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByDateEnvoiDesc(userId);
        for (Notification n : list) {
            if (!Boolean.TRUE.equals(n.getLu())) {
                n.setLu(true);
                notificationRepository.save(n);
            }
        }
    }
}
