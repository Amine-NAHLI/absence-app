import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Résout automatiquement l'URL du Backend Spring Boot :
 * - Sur Web : http://localhost:8080/api
 * - Sur Smartphone physique via Expo Go : extrait dynamiquement l'IP locale du serveur Metro (même si le Wi-Fi change !)
 * - Sur Émulateur Android : http://10.0.2.2:8080/api
 */
export const getApiBaseUrl = (): string => {
  // 1. Si une URL manuelle est forcée dans le .env (et différente de 'auto')
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'auto' && !envUrl.includes('localhost')) {
    return envUrl;
  }

  // 2. Environnement Web (navigateur)
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }

  // 3. Détection automatique via Metro Bundler (Téléphone physique avec Expo Go)
  // hostUri contient l'IP du PC hôte (ex: "10.200.3.99:8081")
  const hostUri = Constants.expoConfig?.hostUri 
    ?? (Constants as any).manifest2?.extra?.expoClient?.hostUri
    ?? (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const rawHost = hostUri.split(':')[0];
    // Vérifier si c'est une adresse IPv4 locale valide (ex: 10.200.3.99 ou 192.168.1.45)
    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(rawHost);
    if (isIPv4) {
      return `http://${rawHost}:8080/api`;
    }
    // Si c'est un domaine tunnel Expo (ex: *.on.expo.app), le port 8080 n'y est pas exposé
    console.warn(`[API Config] hostUri détecté comme tunnel cloud (${rawHost}). Redirection vers IP LAN.`);
  }

  // 4. IP locale du PC sur le réseau Wi-Fi
  const localLanIp = '10.200.3.99';

  // 5. Émulateur Android officiel
  if (Platform.OS === 'android' && !hostUri) {
    return 'http://10.0.2.2:8080/api';
  }

  return `http://${localLanIp}:8080/api`;
};

export const API_BASE_URL = getApiBaseUrl();

console.log(`[API Config] Backend URL auto-détectée : ${API_BASE_URL}`);

export default API_BASE_URL;
