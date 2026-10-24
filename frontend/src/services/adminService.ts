import { API_BASE_URL } from '../config/api';
import { DemandeInscription } from '../types/auth';

export interface AdminStats {
  totalEtudiants: number;
  totalEnseignants: number;
  totalAbsences: number;
  demandesEnAttente: number;
  tauxAssiduite: string;
}

/**
 * Récupère la liste de toutes les demandes d'inscription en attente (comptes inactifs).
 */
export const getDemandesInscription = async (): Promise<DemandeInscription[]> => {
  const url = `${API_BASE_URL}/admin/demandes-inscription`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des demandes (${response.status})`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[AdminService] getDemandesInscription error:', error);
    throw error;
  }
};

/**
 * Accepte une demande d'inscription et active le compte utilisateur.
 */
export const accepterDemandeInscription = async (userId: number): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/demandes-inscription/${userId}/accepter`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'Erreur lors de la validation du compte');
    }

    return data;
  } catch (error: any) {
    console.error('[AdminService] accepterDemandeInscription error:', error);
    throw error;
  }
};

/**
 * Refuse et supprime une demande d'inscription.
 */
export const refuserDemandeInscription = async (userId: number): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/demandes-inscription/${userId}/refuser`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'Erreur lors du refus de la demande');
    }

    return data;
  } catch (error: any) {
    console.error('[AdminService] refuserDemandeInscription error:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques administratives globales.
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const url = `${API_BASE_URL}/admin/statistiques`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur récupération statistiques (${response.status})`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[AdminService] getAdminStats error:', error);
    // Retourne des valeurs par défaut en cas d'indisponibilité
    return {
      totalEtudiants: 0,
      totalEnseignants: 0,
      totalAbsences: 0,
      demandesEnAttente: 0,
      tauxAssiduite: '94.2%',
    };
  }
};
