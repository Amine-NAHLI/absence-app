package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * US18 : Configuration du broker WebSocket avec STOMP et SockJS.
 * Permet l'envoi instantané d'alertes d'absence aux étudiants et administrateurs.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Préfixe pour les topics de diffusion temps réel
        config.enableSimpleBroker("/topic");
        // Préfixe pour les messages entrants depuis les clients
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket natif & SockJS avec CORS permissif pour Expo Mobile / Web
        registry.addEndpoint("/ws-absence")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        registry.addEndpoint("/ws-absence")
                .setAllowedOriginPatterns("*");
    }
}
