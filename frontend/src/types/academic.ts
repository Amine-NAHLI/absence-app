export interface Salle {
  id: number;
  code: string;
  nom: string;
  capacite: number;
  type: string;
}

export interface Matiere {
  id: number;
  code: string;
  nom: string;
  coefficient: number;
  heuresTotal?: number;
}

export interface Groupe {
  id: number;
  code: string;
  nom: string;
  filiere?: string;
  anneeScolaire?: string;
  effectif?: number;
  matieres?: Matiere[];
}

export interface DisponibiliteInscriptions {
  inscriptionsEtudiantsOuvertes: boolean;
  inscriptionsEnseignantsOuvertes: boolean;
  totalClasses: number;
  totalModules: number;
}

export interface AdminEtudiant {
  id: number;
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  matricule: string;
  cne?: string;
  photoUrl?: string;
  groupeCode?: string;
  groupeNom?: string;
  actif: boolean;
}

export interface AdminEnseignant {
  id: number;
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  matricule: string;
  departement?: string;
  specialite?: string;
  actif: boolean;
}

export interface SeanceAujourdhui {
  id: number;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  typeSeance: string;
  salle: string;
  matiereId: number;
  matiereCode: string;
  matiereNom: string;
  groupeId: number;
  groupeCode: string;
  groupeNom: string;
  groupeEffectif: number;
  enseignantId: number;
  enseignantNom: string;
  statut: string;
  appelFait: boolean;
  nbAbsents: number;
}


