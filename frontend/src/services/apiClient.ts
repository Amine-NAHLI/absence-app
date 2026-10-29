import { API_BASE_URL } from '../config/api';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipLogs?: boolean;
}

export interface DetailedApiError extends Error {
  status?: number;
  statusText?: string;
  url?: string;
  details?: any;
  isNetworkError?: boolean;
}

/**
 * Client HTTP centralisé avec journalisation granulaire de chaque requête et de chaque erreur.
 * Évite les messages généraux et affiche la cause exacte, le code HTTP et le corps de réponse.
 */
export const apiClient = async <T = any>(
  endpointOrFullUrl: string,
  options: RequestOptions = {}
): Promise<T> => {
  const method = (options.method || 'GET').toUpperCase();
  const fullUrl = endpointOrFullUrl.startsWith('http')
    ? endpointOrFullUrl
    : `${API_BASE_URL}${endpointOrFullUrl.startsWith('/') ? '' : '/'}${endpointOrFullUrl}`;

  const startTime = Date.now();

  // 1. Log de la requête sortante
  if (!options.skipLogs) {
    let safePayload: any = null;
    if (options.body && typeof options.body === 'string') {
      try {
        const parsed = JSON.parse(options.body);
        safePayload = { ...parsed };
        if (safePayload.motDePasse) safePayload.motDePasse = '******';
        if (safePayload.password) safePayload.password = '******';
      } catch {
        safePayload = options.body;
      }
    } else if (options.body) {
      safePayload = '[Corps de requête binaire ou FormData]';
    }

    console.log(`🌐 [HTTP REQUEST] [${method}] ${fullUrl}`, safePayload ? `\n📦 Payload : ${JSON.stringify(safePayload)}` : '');
  }

  // 2. Gestion du timeout si configuré
  const timeoutMs = options.timeoutMs || 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    // 3. Cas de Succès HTTP (200-299)
    if (response.ok) {
      // Pour les DELETE ou réponses 204 No Content
      if (response.status === 204) {
        console.log(`✅ [HTTP 204 No Content] [${method}] ${fullUrl} (${durationMs}ms)`);
        return {} as T;
      }

      const rawText = await response.text();
      let parsedData: any = {};
      if (rawText && rawText.trim() !== '') {
        try {
          parsedData = JSON.parse(rawText);
        } catch {
          parsedData = rawText;
        }
      }

      console.log(`✅ [HTTP ${response.status} ${response.statusText}] [${method}] ${fullUrl} (${durationMs}ms)`);
      return parsedData as T;
    }

    // 4. Cas d'Erreur HTTP (4xx / 5xx)
    const rawErrorText = await response.text();
    let jsonError: any = null;
    try {
      jsonError = rawErrorText ? JSON.parse(rawErrorText) : null;
    } catch {
      // Non-JSON (HTML 404, 502 Bad Gateway proxy, etc.)
    }

    // Extraction précise du message de l'erreur
    let exactErrorMessage: string = '';
    if (jsonError) {
      if (typeof jsonError.message === 'string' && jsonError.message.trim() !== '') {
        exactErrorMessage = jsonError.message;
      } else if (typeof jsonError.error === 'string') {
        exactErrorMessage = jsonError.error;
      } else if (typeof jsonError.details === 'string') {
        exactErrorMessage = jsonError.details;
      } else if (Array.isArray(jsonError.errors)) {
        exactErrorMessage = jsonError.errors.map((e: any) => e.defaultMessage || JSON.stringify(e)).join(' | ');
      } else if (typeof jsonError.details === 'object') {
        exactErrorMessage = Object.entries(jsonError.details).map(([k, v]) => `${k}: ${v}`).join(', ');
      }
    }

    if (!exactErrorMessage) {
      if (rawErrorText && !rawErrorText.includes('<html') && rawErrorText.length < 300) {
        exactErrorMessage = rawErrorText.trim();
      } else if (rawErrorText.includes('<html')) {
        // Extraction du titre HTML si disponible
        const titleMatch = rawErrorText.match(/<title>(.*?)<\/title>/i);
        const htmlTitle = titleMatch ? titleMatch[1] : 'Page HTML inattendue';
        exactErrorMessage = `Le serveur a retourné une page HTML au lieu de JSON (${htmlTitle}).`;
      } else {
        exactErrorMessage = `Erreur HTTP ${response.status} (${response.statusText || 'Échec de la requête'})`;
      }
    }

    // Journalisation explicite et ultra-détaillée
    console.error(`
❌ ======================= [ERREUR API DÉTAILLÉE] =======================
📍 Méthode & URL    : [${method}] ${fullUrl}
🔢 Code HTTP        : ${response.status} (${response.statusText})
⏱️ Durée de l'appel : ${durationMs}ms
⚠️ Message exact    : "${exactErrorMessage}"
📄 Détails bruts    : ${rawErrorText ? (rawErrorText.length > 400 ? rawErrorText.substring(0, 400) + '...' : rawErrorText) : '(corps vide)'}
========================================================================
`);

    const apiError: DetailedApiError = new Error(exactErrorMessage);
    apiError.status = response.status;
    apiError.statusText = response.statusText;
    apiError.url = fullUrl;
    apiError.details = jsonError || rawErrorText;
    throw apiError;

  } catch (err: any) {
    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    // Si c'est déjà une ApiError personnalisée, on la relance
    if (err.status !== undefined) {
      throw err;
    }

    const isTimeout = err.name === 'AbortError' || err.message?.toLowerCase().includes('aborted');
    const isNetwork = err.message?.includes('Network request failed') || err.message?.includes('Failed to fetch');

    console.error(`
🔥 ======================= [ERREUR RÉSEAU / SYSTÈME] =======================
📍 URL Cible        : [${method}] ${fullUrl}
⚠️ Type d'erreur    : ${err.name} - ${err.message}
⏱️ Temps écoulé     : ${durationMs}ms
🔍 DIAGNOSTIC CONCRET :
   ${isTimeout 
     ? `• Le serveur a mis plus de ${timeoutMs / 1000}s à répondre (Timeout). Vérifiez la charge du backend ou de la base Neon.`
     : isNetwork
     ? `• Impossible d'établir la connexion avec ${fullUrl}.\n   • Vérifiez que votre smartphone et votre PC sont sur le MÊME réseau Wi-Fi.\n   • Vérifiez que le Backend Spring Boot tourne bien sur le port 8080.\n   • Vérifiez que le Pare-feu Windows n'intercepte pas les connexions entrantes.`
     : `• Exception inattendue : ${err.message}`}
📦 Stack Trace      : ${err.stack || 'Non fournie'}
===========================================================================
`);

    const networkError: DetailedApiError = new Error(
      isTimeout
        ? `Délai d'attente dépassé (${timeoutMs / 1000}s) vers ${fullUrl}.`
        : isNetwork
        ? `Impossible de joindre le serveur à ${fullUrl}. Vérifiez la connexion Wi-Fi et le backend.`
        : err.message
    );
    networkError.isNetworkError = true;
    networkError.url = fullUrl;
    networkError.details = err;
    throw networkError;
  }
};
