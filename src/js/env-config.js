/**
 * frontend/js/env-config.js
 * Configurazione lato client per il frontend
 *
 * ⚠️  Qui va la ANON KEY di Supabase (quella pubblica, sicura per il browser)
 *     MAI mettere qui la SERVICE_ROLE_KEY o la chiave Anthropic!
 *
 * Come aggiornare:
 *   1. Apri Supabase Dashboard → Project Settings → API
 *   2. Copia "URL" e "anon / public" key
 *   3. Sostituisci i valori qui sotto
 */

const ENV = {
  // Supabase - usa SOLO la chiave pubblica (anon) nel frontend
  SUPABASE_URL:      'https://XXXXXXXXXXXXXXXX.supabase.co',   // ← sostituisci
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // ← sostituisci

  // URL del backend locale (o produzione)
  BACKEND_URL: '',

  // Impostazioni app
  APP_NAME: 'BrainPlayng',
  VERSION:  '2.0.0'
};

// Freeze per evitare modifiche accidentali
Object.freeze(ENV);
