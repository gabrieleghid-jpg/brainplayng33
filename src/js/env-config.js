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
  SUPABASE_URL:      'https://qidzkvmuynruskrkpcwf.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpZHprdm11eW5ydXNrcmtwY3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTcyNTMsImV4cCI6MjA5NDY3MzI1M30.zepX7Mo_zuTCKmcCkjP9bEOcp5S5DirkYD5C87MwDVo',

  // URL del backend (per Vercel usa percorso relativo)
  BACKEND_URL: '',

  // Impostazioni app
  APP_NAME: 'BrainPlayng',
  VERSION:  '2.0.0'
};

// Freeze per evitare modifiche accidentali
Object.freeze(ENV);
