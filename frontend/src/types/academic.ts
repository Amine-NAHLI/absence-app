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
