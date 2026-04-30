/**
 * frontend/js/supabase-client.js
 * Inizializza il client Supabase per il browser
 * Importa la libreria tramite CDN (vedi tag <script> nelle pagine HTML)
 */

// Dipende da: env-config.js (caricato prima di questo file)

function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.error('❌ Supabase SDK non trovato. Aggiungi il tag <script> CDN prima di questo file.');
    return null;
  }

  const client = supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
  return client;
}

const supabaseClient = initSupabase();

/**
 * Helper: ottieni il token JWT dell'utente loggato
 * Usato per le chiamate autenticate al backend
 */
async function getAuthToken() {
  if (!supabaseClient) return null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session?.access_token || null;
}

/**
 * Helper: chiamata autenticata al backend
 * Aggiunge automaticamente il Bearer token nell'header
 */
async function apiFetch(endpoint, options = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${ENV.BACKEND_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Errore HTTP ${response.status}`);
  }

  return response.json();
}
