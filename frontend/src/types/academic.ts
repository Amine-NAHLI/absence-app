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

// =============================================================================
// PHASE 2 (AYA BOUHSINI) TYPES
// =============================================================================

// US10 : Historique des absences
export interface AbsenceDetailItem {
  absenceId: number;
  etudiantId: number;
  matricule: string;
  nom: string;
  prenom: string;
  typePresence: 'ABSENT' | 'RETARD';
  statut: 'NON_JUSTIFIEE' | 'EN_ATTENTE' | 'JUSTIFIEE' | 'REFUSEE';
  dateMarquage?: string;
  justificatifId?: number;
  justificatifStatut?: string;
  justificatifNom?: string;
  motifRefus?: string;
}

export interface SeanceHistorique {
  seanceId: number;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  typeSeance: string;
  salle: string;
  groupeId: number;
  groupeCode: string;
  groupeNom: string;
  matiereId: number;
  matiereCode: string;
  matiereNom: string;
  enseignantId: number;
  enseignantNom: string;
  totalEffectif: number;
  totalPresents: number;
  totalAbsents: number;
  totalRetards: number;
  tauxPresence: number;
  detailsAbsents: AbsenceDetailItem[];
}

// US11 : Taux d'absentéisme et alertes de seuil (> 20%)
export interface TauxMatiere {
  matiereId: number;
  matiereCode: string;
  matiereNom: string;
  totalSeances: number;
  absences: number;
  retards: number;
  nonJustifiees: number;
  justifiees: number;
  tauxAbsence: number;
  seuilDepasse: boolean;
}

export interface TauxAbsenteisme {
  etudiantId: number;
  matricule: string;
  nom: string;
  prenom: string;
  groupeCode: string;
  groupeNom: string;
  totalSeances: number;
  totalPresences: number;
  totalAbsences: number;
  totalRetards: number;
  absencesNonJustifiees: number;
  absencesJustifiees: number;
  absencesEnAttente: number;
  heuresAbsenceTotal: number;
  tauxAssiduite: number;
  tauxAbsenteisme: number;
  seuilDepasse: boolean;
  niveauAlerte: 'NORMAL' | 'ATTENTION' | 'CRITIQUE';
  messageAlerte: string;
  repartitionParMatiere: TauxMatiere[];
}

// US12 : Emploi du temps interactif
export interface SeancePlanning {
  seanceId: number;
  dateSeance: string;
  jourSemaine: string;
  jourLabel: string;
  heureDebut: string;
  heureFin: string;
  creneauHoraire: string;
  typeSeance: string;
  salle: string;
  matiereId: number;
  matiereCode: string;
  matiereNom: string;
  enseignantId: number;
  enseignantNom: string;
  statut: string;
  estEnCours: boolean;
}

export interface EmploiDuTemps {
  etudiantId?: number;
  groupeId?: number;
  groupeCode: string;
  groupeNom: string;
  filiere?: string;
  anneeScolaire?: string;
  seances: SeancePlanning[];
}

// US17 : Tableau de bord BI / Analytics
export interface FiliereStat {
  filiere: string;
  effectif: number;
  totalAbsences: number;
  tauxAbsenteisme: number;
}

export interface GroupeStat {
  groupeId: number;
  code: string;
  nom: string;
  filiere: string;
  effectif: number;
  totalAbsences: number;
  tauxAssiduite: number;
  tauxAbsenteisme: number;
}

export interface MatiereStat {
  matiereId: number;
  code: string;
  nom: string;
  totalAbsences: number;
  tauxAbsenteisme: number;
}

export interface EtudiantAlerteItem {
  etudiantId: number;
  matricule: string;
  nom: string;
  prenom: string;
  groupeCode: string;
  totalAbsences: number;
  tauxAbsence: number;
  niveauAlerte: 'CRITIQUE' | 'ATTENTION' | 'NORMAL';
}

export interface AdminAnalytics {
  totalEtudiants: number;
  totalEnseignants: number;
  totalClasses: number;
  totalModules: number;
  totalSalles: number;
  totalSeances: number;
  totalPresences: number;
  totalAbsences: number;
  totalRetards: number;
  tauxAssiduiteGlobal: number;
  tauxAbsenteismeGlobal: number;
  justificatifsTotal: number;
  justificatifsEnAttente: number;
  justificatifsValides: number;
  justificatifsRefuses: number;
  repartitionParFiliere: FiliereStat[];
  repartitionParGroupe: GroupeStat[];
  repartitionParMatiere: MatiereStat[];
  etudiantsEnAlerte: EtudiantAlerteItem[];
}

// US18 : Notifications temps réel
export interface NotificationItem {
  id: number;
  userId?: number;
  titre: string;
  message: string;
  type?: string;
  lu: boolean;
  dateEnvoi: string;
  etudiantId?: number;
  seanceId?: number;
  matiereNom?: string;
}


