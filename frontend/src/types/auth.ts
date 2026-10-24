export type Role = 'ETUDIANT' | 'ENSEIGNANT' | 'ADMIN';

export interface UserSession {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  telephone?: string;
  
  // Détails Étudiant
  etudiantId?: number;
  matricule?: string;
  cne?: string;
  groupeId?: number;
  groupeCode?: string;

  // Détails Enseignant
  enseignantId?: number;
  departement?: string;

  token: string;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  role: 'ETUDIANT' | 'ENSEIGNANT';
  matricule?: string;
  cne?: string;
  groupeCode?: string;
  departement?: string;
  specialite?: string;
}

export interface DemandeInscription {
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  matricule?: string;
  cne?: string;
  groupeCode?: string;
  departement?: string;
  specialite?: string;
  dateCreation: string;
  actif: boolean;
}

export interface LoginErrorResponse {
  message: string;
  enAttente?: boolean;
}
