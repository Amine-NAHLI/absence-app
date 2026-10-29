import { apiClient } from './apiClient';

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

  return apiClient<{ success: boolean; message: string }>('/justificatifs/upload', {
    method: 'POST',
    body: formData,
    // Note : Ne pas forcer Content-Type pour laisser le boundary multipart se générer
  });
};

/**
 * US09 : Obtenir la liste des justificatifs en attente d'arbitrage (Enseignant / Scolarité).
 */
export const getJustificatifsEnAttente = async (): Promise<JustificatifReviewItem[]> => {
  return apiClient<JustificatifReviewItem[]>('/justificatifs/en-attente');
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
  return apiClient<{ success: boolean; message: string }>(`/justificatifs/${justificatifId}/decision`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      decision,
      motif,
      enseignantId: enseignantId || 1,
    }),
  });
};

/**
 * US08 : Rectifier une absence unitaire (changer le type ou annuler pour remettre présent).
 */
export const rectifierAbsence = async (
  absenceId: number,
  annuler: boolean = false,
  typePresence: string = 'ABSENT'
): Promise<{ success: boolean; message: string }> => {
  return apiClient<{ success: boolean; message: string }>(
    `/absences/${absenceId}/rectifier?annuler=${annuler}&typePresence=${typePresence}`,
    {
      method: 'PUT',
    }
  );
};
