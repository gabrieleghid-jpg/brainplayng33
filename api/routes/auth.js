/**
 * backend/routes/auth.js
 * Autenticazione tramite Supabase Auth
 *
 * POST /api/auth/register  - Registrazione nuovo utente
 * POST /api/auth/login     - Login utente
 * POST /api/auth/logout    - Logout
 * GET  /api/auth/me        - Dati utente corrente
 */

require('dotenv').config({ path: '../../.env' });
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const {
  hasValidSupabaseUrl,
  hasValidSupabaseAnonKey
} = require('../utils/env');

// Client con ANON KEY per le operazioni di auth
const supabaseConfigured = hasValidSupabaseUrl() && hasValidSupabaseAnonKey();
const supabase = supabaseConfigured
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

function requireSupabaseAuthConfigured(req, res) {
  if (!supabaseConfigured || !supabase) {
    res.status(503).json({
      error: 'Supabase Auth non configurato: completa SUPABASE_URL e SUPABASE_ANON_KEY nel .env (non i placeholder).'
    });
    return false;
  }
  return true;
}

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  if (!requireSupabaseAuthConfigured(req, res)) return;
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password e username sono obbligatori.' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    message: 'Registrazione completata! Controlla la tua email per confermare.',
    user: { id: data.user.id, email: data.user.email, username }
  });
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  if (!requireSupabaseAuthConfigured(req, res)) return;
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: 'Credenziali non valide.' });

  res.json({
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || 'BrainPlayer'
    }
  });
});

// ── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', async (req, res) => {
  if (!requireSupabaseAuthConfigured(req, res)) return;
  const { error } = await supabase.auth.signOut();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Logout effettuato con successo.' });
});

module.exports = router;
