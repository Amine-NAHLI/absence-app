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

export interface LoginErrorResponse {
  message: string;
}
