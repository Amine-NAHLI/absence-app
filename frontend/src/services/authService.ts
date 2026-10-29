import { apiClient } from './apiClient';
import { RegisterPayload, UserSession } from '../types/auth';

/**
 * Service d'authentification connecté au client API détaillé.
 */
export const loginUser = async (email: string, motDePasse: string): Promise<UserSession> => {
  return apiClient<UserSession>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, motDePasse }),
  });
};

export const registerUser = async (payload: RegisterPayload): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};
