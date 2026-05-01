/**
 * backend/server.js
 * Server Express principale di BrainPlayng
 * Gestisce: API schemi (Claude Vision), proxy Supabase, CORS
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3010',
  'http://127.0.0.1:3010'
]);

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin non consentita: ${origin}`));
  },
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
    env: process.env.NODE_ENV || 'development'
  });
});

// ─── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ error: 'Errore interno del server', details: err.message });
});

// ─── Avvio ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 BrainPlayng Backend avviato!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔑 Supabase: ${process.env.SUPABASE_URL ? '✅ Configurato' : '❌ MANCANTE'}`);
  console.log(`🤖 Claude AI: ${process.env.ANTHROPIC_API_KEY ? '✅ Configurato' : '❌ MANCANTE'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
