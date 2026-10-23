import { API_BASE_URL } from '../config/api';
import { UserSession } from '../types/auth';

export const loginUser = async (email: string, motDePasse: string): Promise<UserSession> => {
  const url = `${API_BASE_URL}/auth/login`;
  console.log(`[AuthService] Envoi requête de connexion vers : ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, motDePasse }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.message || 'Identifiants invalides ou erreur serveur';
      throw new Error(errorMessage);
    }

    return data as UserSession;
  } catch (error: any) {
    console.error('[AuthService] Erreur lors de la connexion :', error);
    if (error.message && error.message.includes('Network request failed')) {
      throw new Error(`Impossible de joindre le serveur à ${API_BASE_URL}. Vérifiez que le backend Spring Boot est bien lancé !`);
    }
    throw error;
  }
};
