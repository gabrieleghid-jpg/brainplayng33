/**
 * backend/routes/users.js
 * Profilo utente, crediti e avatar
 *
 * GET  /api/users/:id/profile   - Legge profilo
 * PUT  /api/users/:id/profile   - Aggiorna profilo
 * GET  /api/users/:id/avatar    - Legge configurazione avatar
 * PUT  /api/users/:id/avatar    - Salva configurazione avatar
 */

const express = require('express');
const router = express.Router();
const { supabase, supabaseConfigured } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// ── GET /api/users/:id/profile ──────────────────────────────
router.get('/:id/profile', authMiddleware, async (req, res) => {
  if (!supabaseConfigured || !supabase) {
    return res.status(503).json({ error: 'Supabase non configurato: completa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.' });
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Profilo non trovato.' });
  res.json(data);
});

// ── PUT /api/users/:id/profile ──────────────────────────────
router.put('/:id/profile', authMiddleware, async (req, res) => {
  if (!supabaseConfigured || !supabase) {
    return res.status(503).json({ error: 'Supabase non configurato: completa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.' });
  }
  const { username, bio } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .update({ username, bio, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ── GET /api/users/:id/avatar ───────────────────────────────
router.get('/:id/avatar', authMiddleware, async (req, res) => {
  if (!supabaseConfigured || !supabase) {
    return res.status(503).json({ error: 'Supabase non configurato: completa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.' });
  }
  const { data, error } = await supabase
    .from('avatar_configs')
    .select('*')
    .eq('user_id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Avatar non trovato.' });
  res.json(data);
});

// ── PUT /api/users/:id/avatar ───────────────────────────────
router.put('/:id/avatar', authMiddleware, async (req, res) => {
  if (!supabaseConfigured || !supabase) {
    return res.status(503).json({ error: 'Supabase non configurato: completa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.' });
  }
  const config = req.body;

  const { data, error } = await supabase
    .from('avatar_configs')
    .upsert({ user_id: req.params.id, ...config, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
