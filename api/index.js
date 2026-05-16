/**
 * api/index.js
 * Funzione serverless Vercel per BrainPlayng Backend
 * Gestisce: API schemi (Claude Vision), proxy Supabase, CORS
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const app = express();

// Permetti tutte le origini per Vercel (poiché vercel gestisce i domini)
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// ─── Routes ─────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const schemiRoutes    = require('./routes/schemi');

app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/schemi',    schemiRoutes);

// ─── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

// ─── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ error: 'Errore interno del server', details: err.message });
});

// Esporta come funzione serverless per Vercel
module.exports = app;
