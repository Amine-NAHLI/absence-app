import { API_BASE_URL } from '../config/api';
import { DemandeInscription } from '../types/auth';
import { AdminEnseignant, AdminEtudiant, DisponibiliteInscriptions, Groupe, Matiere, Salle } from '../types/academic';

export interface AdminStats {
  totalEtudiants: number;
  totalEnseignants: number;
  totalAbsences: number;
  totalClasses?: number;
  totalModules?: number;
  totalSalles?: number;
  demandesEnAttente: number;
  tauxAssiduite: string;
}

// =============================================================================
// 1. GESTION DES DEMANDES D'INSCRIPTION & STATISTIQUES
// =============================================================================

export const getDemandesInscription = async (): Promise<DemandeInscription[]> => {
  const url = `${API_BASE_URL}/admin/demandes-inscription`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur récupération demandes (${response.status})`);
    return await response.json();
  } catch (error: any) {
    console.error('[AdminService] getDemandesInscription error:', error);
    return [];
  }
};

export const accepterDemandeInscription = async (userId: number): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/demandes-inscription/${userId}/accepter`;
  const response = await fetch(url, { method: 'PUT' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur lors de la validation');
  return data;
};

export const refuserDemandeInscription = async (userId: number): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/demandes-inscription/${userId}/refuser`;
  const response = await fetch(url, { method: 'DELETE' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur lors du refus');
  return data;
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const url = `${API_BASE_URL}/admin/statistiques`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur stats (${response.status})`);
    return await response.json();
  } catch (error) {
    return {
      totalEtudiants: 0,
      totalEnseignants: 0,
      totalAbsences: 0,
      totalClasses: 0,
      totalModules: 0,
      totalSalles: 0,
      demandesEnAttente: 0,
      tauxAssiduite: '95.0%',
    };
  }
};

// =============================================================================
// 2. GESTION DES SALLES DE CLASSE
// =============================================================================

export const getSalles = async (): Promise<Salle[]> => {
  const url = `${API_BASE_URL}/admin/salles`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur récupération salles (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('[AdminService] getSalles error:', error);
    return [];
  }
};

export const createSalle = async (salle: { code: string; nom: string; capacite: number; type?: string }): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/salles`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(salle),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur lors de la création de la salle');
  return data;
};

export const deleteSalle = async (id: number): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/salles/${id}`;
  const response = await fetch(url, { method: 'DELETE' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur suppression salle');
  return data;
};

// =============================================================================
// 3. GESTION DES MODULES / MATIÈRES
// =============================================================================

export const getMatieres = async (): Promise<Matiere[]> => {
  const url = `${API_BASE_URL}/admin/matieres`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur récupération modules (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('[AdminService] getMatieres error:', error);
    return [];
  }
};

export const createMatiere = async (matiere: { code: string; nom: string; coefficient: number; heuresTotal?: number }): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/matieres`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matiere),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur lors de la création du module');
  return data;
};

export const deleteMatiere = async (id: number): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/matieres/${id}`;
  const response = await fetch(url, { method: 'DELETE' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur suppression module');
  return data;
};

// =============================================================================
// 4. GESTION DES CLASSES & ASSOCIATION DES MODULES
// =============================================================================

export const getGroupes = async (): Promise<Groupe[]> => {
  const url = `${API_BASE_URL}/admin/groupes`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur récupération classes (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('[AdminService] getGroupes error:', error);
    return [];
  }
};

export const createGroupe = async (groupe: { code: string; nom: string; filiere?: string; anneeScolaire?: string; matiereIds: number[] }): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/groupes`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(groupe),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur lors de la création de la classe');
  return data;
};

export const deleteGroupe = async (id: number): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/groupes/${id}`;
  const response = await fetch(url, { method: 'DELETE' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur suppression classe');
  return data;
};

// =============================================================================
// 5. ENDPOINTS PUBLICS POUR L'INSCRIPTION SÉCURISÉE
// =============================================================================

export const getPublicGroupes = async (): Promise<Groupe[]> => {
  const url = `${API_BASE_URL}/public/groupes`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
};

export const getPublicMatieres = async (): Promise<Matiere[]> => {
  const url = `${API_BASE_URL}/public/matieres`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
};

export const getDisponibiliteInscriptions = async (): Promise<DisponibiliteInscriptions> => {
  const url = `${API_BASE_URL}/public/disponibilite-inscriptions`;
  try {
    const response = await fetch(url);
    if (!response.ok) return { inscriptionsEtudiantsOuvertes: false, inscriptionsEnseignantsOuvertes: false, totalClasses: 0, totalModules: 0 };
    return await response.json();
  } catch {
    return { inscriptionsEtudiantsOuvertes: false, inscriptionsEnseignantsOuvertes: false, totalClasses: 0, totalModules: 0 };
  }
};

// =============================================================================
// 6. PURGE COMPLÈTE
// =============================================================================

export const purgeComplete = async (): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/purge-complete`;
  const response = await fetch(url, { method: 'POST' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur purge base');
  return data;
};

// =============================================================================
// 7. GESTION DES ÉTUDIANTS & ENSEIGNANTS
// =============================================================================

export const getAllEtudiants = async (): Promise<AdminEtudiant[]> => {
  const url = `${API_BASE_URL}/admin/etudiants`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur récupération étudiants (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('[AdminService] getAllEtudiants error:', error);
    return [];
  }
};

export const deleteEtudiant = async (id: number): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/etudiants/${id}`;
  const response = await fetch(url, { method: 'DELETE' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur suppression étudiant');
  return data;
};

export const getAllEnseignants = async (): Promise<AdminEnseignant[]> => {
  const url = `${API_BASE_URL}/admin/enseignants`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur récupération enseignants (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('[AdminService] getAllEnseignants error:', error);
    return [];
  }
};

export const deleteEnseignant = async (id: number): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/enseignants/${id}`;
  const response = await fetch(url, { method: 'DELETE' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erreur suppression enseignant');
  return data;
};

// =============================================================================
// PHASE 2 (AYA BOUHSINI) ADMINISTRATION METHODS
// =============================================================================

import { AdminAnalytics } from '../types/academic';

/**
 * US13 : Ajouter un nouvel étudiant par l'administration.
 */
export const createEtudiant = async (data: {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  motDePasse?: string;
  matricule: string;
  cne?: string;
  groupeId?: number;
}): Promise<{ success: boolean; message: string; id?: number }> => {
  const url = `${API_BASE_URL}/admin/etudiants`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (!response.ok) throw new Error(res?.message || "Erreur lors de la création de l'étudiant");
  return res;
};

/**
 * US14 : Modifier les informations d'un étudiant.
 */
export const updateEtudiant = async (
  id: number,
  data: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    matricule?: string;
    cne?: string;
    groupeId?: number;
    actif?: boolean;
  }
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/etudiants/${id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (!response.ok) throw new Error(res?.message || "Erreur lors de la mise à jour de l'étudiant");
  return res;
};

/**
 * US15 : Ajouter un enseignant par l'administration.
 */
export const createEnseignant = async (data: {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  motDePasse?: string;
  matricule: string;
  departement?: string;
  specialite?: string;
}): Promise<{ success: boolean; message: string; id?: number }> => {
  const url = `${API_BASE_URL}/admin/enseignants`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (!response.ok) throw new Error(res?.message || "Erreur lors de la création de l'enseignant");
  return res;
};

/**
 * Modifier les informations d'un enseignant.
 */
export const updateEnseignant = async (
  id: number,
  data: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    matricule?: string;
    departement?: string;
    specialite?: string;
    actif?: boolean;
  }
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/enseignants/${id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (!response.ok) throw new Error(res?.message || "Erreur lors de la mise à jour de l'enseignant");
  return res;
};

/**
 * US16 : Mettre à jour une classe / groupe.
 */
export const updateGroupe = async (
  id: number,
  data: {
    code: string;
    nom: string;
    filiere?: string;
    anneeScolaire?: string;
    matiereIds?: number[];
  }
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/groupes/${id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (!response.ok) throw new Error(res?.message || 'Erreur lors de la modification de la classe');
  return res;
};

/**
 * US16 : Gérer les affectations de matières à une classe.
 */
export const updateGroupeAffectations = async (
  id: number,
  matiereIds: number[]
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/admin/groupes/${id}/affectations`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matiereIds }),
  });
  const res = await response.json();
  if (!response.ok) throw new Error(res?.message || 'Erreur lors de la mise à jour des affectations');
  return res;
};

/**
 * US17 : Tableau de bord décisionnel & BI d'assiduité globale.
 */
export const getAdminAnalytics = async (): Promise<AdminAnalytics | null> => {
  const url = `${API_BASE_URL}/admin/analytics`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur analytics (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('[AdminService] getAdminAnalytics error:', error);
    return null;
  }
};

