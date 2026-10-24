import { API_BASE_URL } from '../config/api';

export interface JustificatifReviewItem {
  id: number;
  absenceId: number;
  etudiantId: number;
  etudiantNom: string;
  etudiantMatricule: string;
  groupeCode: string;
  matiereCode: string;
  matiereNom: string;
  dateSeance: string;
  nomFichier: string;
  typeMime: string;
  tailleOctets: number;
  dateDepot: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  motifRefus?: string;
}

/**
 * US06 : Téléverser un justificatif médical (PDF, JPG, PNG <= 5 Mo).
 */
export const uploadJustificatif = async (
  absenceId: number,
  etudiantId: number,
  fileUri: string,
  fileName: string,
  mimeType: string
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/justificatifs/upload`;

  const formData = new FormData();
  formData.append('absenceId', String(absenceId));
  formData.append('etudiantId', String(etudiantId));

  // Préparation du fichier compatible React Native / Web
  const fileObj: any = {
    uri: fileUri,
    name: fileName,
    type: mimeType || 'application/pdf',
  };
  formData.append('file', fileObj);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      // Note : Ne PAS mettre Content-Type ici pour laisser le boundary multipart se générer
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Échec du dépôt (${response.status})`);
  }

  return response.json();
};

/**
 * US09 : Obtenir la liste des justificatifs en attente d'arbitrage (Enseignant / Scolarité).
 */
export const getJustificatifsEnAttente = async (): Promise<JustificatifReviewItem[]> => {
  const url = `${API_BASE_URL}/justificatifs/en-attente`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`Erreur lors du chargement des justificatifs (${response.status})`);
  }

  return response.json();
};

/**
 * US09 : Valider ou Refuser un justificatif avec motif.
 */
export const arbitrerJustificatif = async (
  justificatifId: number,
  decision: 'ACCEPTE' | 'REFUSE',
  motif?: string,
  enseignantId?: number
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/justificatifs/${justificatifId}/decision`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      decision,
      motif,
      enseignantId: enseignantId || 1,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Erreur d'arbitrage (${response.status})`);
  }

  return response.json();
};

/**
 * US08 : Rectifier une absence unitaire (changer le type ou annuler pour remettre présent).
 */
export const rectifierAbsence = async (
  absenceId: number,
  annuler: boolean = false,
  typePresence: string = 'ABSENT'
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/absences/${absenceId}/rectifier?annuler=${annuler}&typePresence=${typePresence}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Erreur de rectification (${response.status})`);
  }

  return response.json();
};
