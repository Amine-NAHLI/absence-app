import { apiClient } from './apiClient';
import { API_BASE_URL } from '../config/api';
import { NotificationItem } from '../types/academic';

/**
 * US18 : Service de notifications temps réel avec support WebSocket et fallback HTTP résilient.
 */

export const getNotificationsByUser = async (userId: number): Promise<NotificationItem[]> => {
  try {
    return await apiClient<NotificationItem[]>(`/notifications/user/${userId}`);
  } catch {
    return [];
  }
};

export const getNotificationsByEtudiant = async (etudiantId: number): Promise<NotificationItem[]> => {
  try {
    return await apiClient<NotificationItem[]>(`/notifications/etudiant/${etudiantId}`);
  } catch {
    return [];
  }
};

export const markNotificationAsRead = async (id: number): Promise<boolean> => {
  try {
    await apiClient(`/notifications/${id}/lire`, { method: 'PUT' });
    return true;
  } catch {
    return false;
  }
};

export const markAllNotificationsAsRead = async (userId: number): Promise<boolean> => {
  try {
    await apiClient(`/notifications/user/${userId}/tout-lire`, { method: 'PUT' });
    return true;
  } catch {
    return false;
  }
};

/**
 * Abonnement temps réel : écoute WebSocket avec repli transparent sur polling régulier.
 * Garantit le fonctionnement sur Expo Go physique, émulateur et navigateur web.
 */
export const subscribeToNotifications = (options: {
  userId?: number;
  etudiantId?: number;
  onNotification: (notif: NotificationItem) => void;
}): (() => void) => {
  const { userId, etudiantId, onNotification } = options;
  let isSubscribed = true;
  let socket: WebSocket | null = null;
  let pollingInterval: any = null;
  let lastNotificationId = 0;

  // 1. Dérivation de l'URL WebSocket à partir de API_BASE_URL
  const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/ws-absence';

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('[WebSocket] Connecté au serveur WebSocket absence :', wsUrl);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.titre && data.message) {
          // Filtrer pour l'étudiant concerné
          if (!etudiantId || data.etudiantId === etudiantId || data.userId === userId) {
            onNotification(data);
          }
        }
      } catch (e) {
        // Ignorer les trames non-JSON STOMP (comme les heartbeats)
      }
    };

    socket.onerror = (err) => {
      console.log('[WebSocket] Erreur WebSocket, activation du fallback temps réel...');
    };

    socket.onclose = () => {
      console.log('[WebSocket] Connexion fermée');
    };
  } catch (err) {
    console.log('[WebSocket] Échec initialisation WebSocket, utilisation du polling');
  }

  // 2. Mécanisme de Heartbeat / Polling léger (toutes les 4 secondes)
  const pollForNewNotifications = async () => {
    if (!isSubscribed) return;
    try {
      let list: NotificationItem[] = [];
      if (etudiantId) {
        list = await getNotificationsByEtudiant(etudiantId);
      } else if (userId) {
        list = await getNotificationsByUser(userId);
      }

      if (list.length > 0) {
        const latest = list[0];
        if (lastNotificationId > 0 && latest.id > lastNotificationId && !latest.lu) {
          onNotification(latest);
        }
        lastNotificationId = Math.max(lastNotificationId, latest.id);
      }
    } catch (e) {
      // Ignorer les erreurs réseau temporaires
    }
  };

  // Premier appel immédiat pour mémoriser l'ID actuel
  pollForNewNotifications();
  pollingInterval = setInterval(pollForNewNotifications, 4000);

  // Fonction de nettoyage
  return () => {
    isSubscribed = false;
    if (pollingInterval) clearInterval(pollingInterval);
    if (socket) {
      try {
        socket.close();
      } catch {}
    }
  };
};
