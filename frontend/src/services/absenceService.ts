import { apiClient } from './apiClient';
import { EmploiDuTemps, SeanceHistorique, TauxAbsenteisme } from '../types/academic';

export interface EtudiantItem {
  id: number;
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  cne: string;
  photoUrl?: string;
  groupeCode?: string;
  absent: boolean;
}

export interface AbsenceItem {
  id: number;
  seanceId: number;
  matiereCode: string;
  matiereNom: string;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  enseignantNom: string;
  salle: string;
  typePresence: 'ABSENT' | 'RETARD';
  dureeMinutes: number;
  statut: 'NON_JUSTIFIEE' | 'EN_ATTENTE' | 'JUSTIFIEE' | 'REFUSEE';
  dateMarquage: string;
  justificatifId?: number;
  justificatifNom?: string;
  justificatifStatut?: string;
  motifRefus?: string;
}

/**
 * US02 : Récupérer la liste des étudiants d'un groupe pour faire l'appel.
 */
export const getEtudiantsByGroupe = async (groupeId: number): Promise<EtudiantItem[]> => {
  const data = await apiClient<any[]>(`/groupes/${groupeId}/etudiants`);
  return data.map((e: any) => ({ ...e, absent: false }));
};

/**
 * Récupérer les IDs des étudiants déjà marqués absents pour une séance.
 */
export const getAbsentsForSeance = async (seanceId: number): Promise<number[]> => {
  try {
    return await apiClient<number[]>(`/absences/seance/${seanceId}`);
  } catch {
    return [];
  }
};

/**
 * US03 : Enregistrer l'appel avec règle anti-doublon.
 */
export const enregistrerAppel = async (
  seanceId: number,
  enseignantId: number,
  absents: { etudiantId: number; typePresence: 'ABSENT' | 'RETARD' }[]
): Promise<any> => {
  return apiClient('/absences/enregistrer-appel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seanceId, enseignantId, absents }),
  });
};

/**
 * US04 : Récupérer les absences de l'étudiant connecté.
 */
export const getAbsencesByEtudiant = async (etudiantId: number): Promise<AbsenceItem[]> => {
  return apiClient<AbsenceItem[]>(`/absences/etudiant/${etudiantId}`);
};

/**
 * Démarrer ou obtenir une séance d'appel pour un enseignant, une classe, un module et une salle.
 */
export const demarrerOuObtenirSeance = async (params: {
  enseignantId: number;
  groupeId: number;
  matiereId: number;
  salle?: string;
  typeSeance?: string;
  heureDebut?: string;
  heureFin?: string;
}): Promise<any> => {
  return apiClient('/seances/demarrer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
};

/**
 * Récupérer les séances de la journée pour l'enseignant.
 */
export const getSeancesAujourdhui = async (enseignantId?: number): Promise<any[]> => {
  const endpoint = enseignantId
    ? `/seances/enseignant/${enseignantId}/aujourdhui`
    : `/seances/aujourdhui`;
  try {
    return await apiClient<any[]>(endpoint);
  } catch {
    return [];
  }
};

/**
 * Clôturer une séance une fois l'émargement terminé.
 */
export const cloturerSeance = async (seanceId: number): Promise<any> => {
  return apiClient(`/seances/${seanceId}/cloturer`, { method: 'PUT' });
};

/**
 * US10 : Consulter l'historique complet des absences par groupe, matière ou date.
 */
export const getHistoriqueAbsences = async (filters?: {
  groupeId?: number;
  matiereId?: number;
  enseignantId?: number;
  dateDebut?: string;
  dateFin?: string;
}): Promise<SeanceHistorique[]> => {
  const params = new URLSearchParams();
  if (filters?.groupeId) params.append('groupeId', filters.groupeId.toString());
  if (filters?.matiereId) params.append('matiereId', filters.matiereId.toString());
  if (filters?.enseignantId) params.append('enseignantId', filters.enseignantId.toString());
  if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters?.dateFin) params.append('dateFin', filters.dateFin);

  const query = params.toString() ? `?${params.toString()}` : '';
  try {
    return await apiClient<SeanceHistorique[]>(`/absences/historique${query}`);
  } catch {
    return [];
  }
};

/**
 * US11 : Consulter le taux d'absentéisme d'un étudiant avec seuil d'alerte (> 20%).
 */
export const getTauxAbsenteismeEtudiant = async (etudiantId: number): Promise<TauxAbsenteisme | null> => {
  try {
    return await apiClient<TauxAbsenteisme>(`/absences/statistiques/etudiant/${etudiantId}/taux`);
  } catch {
    try {
      return await apiClient<TauxAbsenteisme>(`/statistiques/etudiant/${etudiantId}/taux`);
    } catch {
      return null;
    }
  }
};

/**
 * US12 : Consulter l'emploi du temps hebdomadaire de l'étudiant.
 */
export const getEmploiDuTempsEtudiant = async (etudiantId: number): Promise<EmploiDuTemps | null> => {
  try {
    return await apiClient<EmploiDuTemps>(`/etudiants/${etudiantId}/emploi-du-temps`);
  } catch {
    return null;
  }
};

/**
 * US12 : Consulter l'emploi du temps par classe.
 */
export const getEmploiDuTempsGroupe = async (groupeId: number): Promise<EmploiDuTemps | null> => {
  try {
    return await apiClient<EmploiDuTemps>(`/groupes/${groupeId}/emploi-du-temps`);
  } catch {
    return null;
  }
};
