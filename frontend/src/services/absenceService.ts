import { API_BASE_URL } from '../config/api';

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
  const url = `${API_BASE_URL}/groupes/${groupeId}/etudiants`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Impossible de charger les étudiants du groupe');
    const data = await res.json();
    return data.map((e: any) => ({ ...e, absent: false }));
  } catch (err) {
    console.error('[AbsenceService] getEtudiantsByGroupe error:', err);
    throw err;
  }
};

/**
 * Récupérer les IDs des étudiants déjà marqués absents pour une séance.
 */
export const getAbsentsForSeance = async (seanceId: number): Promise<number[]> => {
  const url = `${API_BASE_URL}/absences/seance/${seanceId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
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
  const url = `${API_BASE_URL}/absences/enregistrer-appel`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seanceId, enseignantId, absents }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Erreur lors de l'enregistrement");
    return data;
  } catch (err) {
    console.error('[AbsenceService] enregistrerAppel error:', err);
    throw err;
  }
};

/**
 * US04 : Récupérer les absences de l'étudiant connecté.
 */
export const getAbsencesByEtudiant = async (etudiantId: number): Promise<AbsenceItem[]> => {
  const url = `${API_BASE_URL}/absences/etudiant/${etudiantId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Impossible de charger vos absences');
    return await res.json();
  } catch (err) {
    console.error('[AbsenceService] getAbsencesByEtudiant error:', err);
    throw err;
  }
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
  const url = `${API_BASE_URL}/seances/demarrer`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Erreur initialisation de la séance');
    return data;
  } catch (err) {
    console.error('[AbsenceService] demarrerOuObtenirSeance error:', err);
    throw err;
  }
};

/**
 * Récupérer les séances de la journée pour l'enseignant.
 */
export const getSeancesAujourdhui = async (enseignantId?: number): Promise<any[]> => {
  const url = enseignantId
    ? `${API_BASE_URL}/seances/enseignant/${enseignantId}/aujourdhui`
    : `${API_BASE_URL}/seances/aujourdhui`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('[AbsenceService] getSeancesAujourdhui error:', err);
    return [];
  }
};

/**
 * Clôturer une séance une fois l'émargement terminé.
 */
export const cloturerSeance = async (seanceId: number): Promise<any> => {
  const url = `${API_BASE_URL}/seances/${seanceId}/cloturer`;
  try {
    const res = await fetch(url, { method: 'PUT' });
    if (!res.ok) throw new Error('Impossible de clôturer la séance');
    return await res.json();
  } catch (err) {
    console.error('[AbsenceService] cloturerSeance error:', err);
    throw err;
  }
};

// =============================================================================
// PHASE 2 (AYA BOUHSINI) API METHODS
// =============================================================================

import { EmploiDuTemps, SeanceHistorique, TauxAbsenteisme } from '../types/academic';

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
  const url = `${API_BASE_URL}/absences/historique${query}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur récupération historique (${res.status})`);
    return await res.json();
  } catch (err) {
    console.error('[AbsenceService] getHistoriqueAbsences error:', err);
    return [];
  }
};

/**
 * US11 : Consulter le taux d'absentéisme d'un étudiant avec seuil d'alerte (> 20%).
 */
export const getTauxAbsenteismeEtudiant = async (etudiantId: number): Promise<TauxAbsenteisme | null> => {
  const url = `${API_BASE_URL}/absences/statistiques/etudiant/${etudiantId}/taux`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Fallback sur route alternative
      const fallbackUrl = `${API_BASE_URL}/statistiques/etudiant/${etudiantId}/taux`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) throw new Error(`Erreur taux (${res.status})`);
      return await fallbackRes.json();
    }
    return await res.json();
  } catch (err) {
    console.error('[AbsenceService] getTauxAbsenteismeEtudiant error:', err);
    return null;
  }
};

/**
 * US12 : Consulter l'emploi du temps hebdomadaire de l'étudiant.
 */
export const getEmploiDuTempsEtudiant = async (etudiantId: number): Promise<EmploiDuTemps | null> => {
  const url = `${API_BASE_URL}/etudiants/${etudiantId}/emploi-du-temps`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur emploi du temps (${res.status})`);
    return await res.json();
  } catch (err) {
    console.error('[AbsenceService] getEmploiDuTempsEtudiant error:', err);
    return null;
  }
};

/**
 * US12 : Consulter l'emploi du temps par classe.
 */
export const getEmploiDuTempsGroupe = async (groupeId: number): Promise<EmploiDuTemps | null> => {
  const url = `${API_BASE_URL}/groupes/${groupeId}/emploi-du-temps`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur emploi du temps groupe (${res.status})`);
    return await res.json();
  } catch (err) {
    console.error('[AbsenceService] getEmploiDuTempsGroupe error:', err);
    return null;
  }
};


