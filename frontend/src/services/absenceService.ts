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
