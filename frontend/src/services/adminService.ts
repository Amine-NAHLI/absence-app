import { apiClient } from './apiClient';
import { DemandeInscription } from '../types/auth';
import { AdminAnalytics, AdminEnseignant, AdminEtudiant, DisponibiliteInscriptions, Groupe, Matiere, Salle } from '../types/academic';

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
  try {
    return await apiClient<DemandeInscription[]>('/admin/demandes-inscription');
  } catch {
    return [];
  }
};

export const accepterDemandeInscription = async (userId: number): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>(`/admin/demandes-inscription/${userId}/accepter`, {
    method: 'PUT',
  });
};

export const refuserDemandeInscription = async (userId: number): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>(`/admin/demandes-inscription/${userId}/refuser`, {
    method: 'DELETE',
  });
};

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    return await apiClient<AdminStats>('/admin/statistiques');
  } catch {
    return {
      totalEtudiants: 0,
      totalEnseignants: 0,
      totalAbsences: 0,
      totalClasses: 0,
      totalModules: 0,
      totalSalles: 0,
      demandesEnAttente: 0,
      tauxAssiduite: '—',
    };
  }
};

// =============================================================================
// 2. GESTION DES CLASSES (GROUPES)
// =============================================================================

export const getGroupes = async (): Promise<Groupe[]> => {
  try {
    return await apiClient<Groupe[]>('/admin/groupes');
  } catch {
    return [];
  }
};

export const createGroupe = async (data: {
  code: string;
  nom: string;
  filiere?: string;
  anneeScolaire?: string;
  matiereIds?: number[];
}): Promise<Groupe> => {
  return apiClient<Groupe>('/admin/groupes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const deleteGroupe = async (id: number): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>(`/admin/groupes/${id}`, {
    method: 'DELETE',
  });
};

// =============================================================================
// 3. GESTION DES MATIÈRES (MODULES)
// =============================================================================

export const getMatieres = async (): Promise<Matiere[]> => {
  try {
    return await apiClient<Matiere[]>('/admin/matieres');
  } catch {
    return [];
  }
};

export const createMatiere = async (data: {
  code: string;
  nom: string;
  coefficient?: number;
  heuresTotal?: number;
}): Promise<Matiere> => {
  return apiClient<Matiere>('/admin/matieres', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const deleteMatiere = async (id: number): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>(`/admin/matieres/${id}`, {
    method: 'DELETE',
  });
};

// =============================================================================
// 4. GESTION DES SALLES DE CLASSE
// =============================================================================

export const getSalles = async (): Promise<Salle[]> => {
  try {
    return await apiClient<Salle[]>('/admin/salles');
  } catch {
    return [];
  }
};

export const createSalle = async (data: {
  code: string;
  nom: string;
  capacite?: number;
  type?: string;
}): Promise<Salle> => {
  return apiClient<Salle>('/admin/salles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const deleteSalle = async (id: number): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>(`/admin/salles/${id}`, {
    method: 'DELETE',
  });
};

// =============================================================================
// 5. DISPONIBILITÉ POUR L'INSCRIPTION & ENDPOINTS PUBLICS
// =============================================================================

export const getDisponibiliteInscriptions = async (): Promise<DisponibiliteInscriptions> => {
  try {
    return await apiClient<DisponibiliteInscriptions>('/admin/disponibilite-inscriptions');
  } catch {
    return {
      inscriptionsEtudiantsOuvertes: false,
      inscriptionsEnseignantsOuvertes: false,
      totalClasses: 0,
      totalModules: 0,
    };
  }
};

export const getPublicGroupes = async (): Promise<Groupe[]> => {
  try {
    return await apiClient<Groupe[]>('/public/groupes');
  } catch {
    return [];
  }
};

export const getPublicMatieres = async (): Promise<Matiere[]> => {
  try {
    return await apiClient<Matiere[]>('/public/matieres');
  } catch {
    return [];
  }
};

// =============================================================================
// 6. GESTION ET NETTOYAGE DES COMPTES
// =============================================================================

export const purgeComplete = async (): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>('/admin/purge-complete', {
    method: 'POST',
  });
};

export const getAllEtudiants = async (): Promise<AdminEtudiant[]> => {
  try {
    return await apiClient<AdminEtudiant[]>('/admin/etudiants');
  } catch {
    return [];
  }
};

export const deleteEtudiant = async (id: number): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>(`/admin/etudiants/${id}`, {
    method: 'DELETE',
  });
};

export const getAllEnseignants = async (): Promise<AdminEnseignant[]> => {
  try {
    return await apiClient<AdminEnseignant[]>('/admin/enseignants');
  } catch {
    return [];
  }
};

export const deleteEnseignant = async (id: number): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>(`/admin/enseignants/${id}`, {
    method: 'DELETE',
  });
};

// =============================================================================
// 7. CRÉATION DIRECTE ÉTUDIANT & ENSEIGNANT
// =============================================================================

export const createEtudiant = async (data: {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  matricule?: string;
  cne?: string;
  groupeId?: number;
  motDePasse?: string;
}): Promise<AdminEtudiant> => {
  return apiClient<AdminEtudiant>('/admin/etudiants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const createEnseignant = async (data: {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  matricule?: string;
  departement?: string;
  specialite?: string;
  motDePasse?: string;
}): Promise<AdminEnseignant> => {
  return apiClient<AdminEnseignant>('/admin/enseignants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

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
  return apiClient<{ success: boolean; message: string }>(`/admin/groupes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const updateGroupeAffectations = async (
  id: number,
  matiereIds: number[]
): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>(`/admin/groupes/${id}/affectations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matiereIds }),
  });
};

export const getAdminAnalytics = async (): Promise<AdminAnalytics | null> => {
  try {
    return await apiClient<AdminAnalytics>('/admin/analytics');
  } catch {
    return null;
  }
};
