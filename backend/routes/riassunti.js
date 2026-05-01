/**
 * backend/routes/riassunti.js
 * Route per la generazione di riassunti tramite Claude (Anthropic)
 *
 * POST /api/riassunti/genera
 *   body: { testo: string, lingua?: string, stile?: string }
 *   → restituisce { riassunto: string, paroleChiave: string[] }
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { hasValidAnthropicKey } = require('../utils/env');

// Inizializza client Claude - legge la chiave dal .env
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

// ── POST /api/riassunti/genera ───────────────────────────────
router.post('/genera', async (req, res) => {
  try {
    const { testo, lingua = 'italiano', stile = 'scolastico' } = req.body;

    if (!testo || testo.trim().length < 50) {
      return res.status(400).json({
        error: 'Il testo deve contenere almeno 50 caratteri.'
      });
    }

    if (!hasValidAnthropicKey()) {
      return res.status(503).json({
        error: 'Claude/Anthropic non configurato: imposta una ANTHROPIC_API_KEY valida nel file .env (non il placeholder).'
      });
    }

    const prompt = `Sei un assistente educativo per studenti. Analizza il seguente testo e:
1. Crea un riassunto chiaro e conciso in ${lingua}
2. Estrai le 5-8 parole chiave più importanti
3. Mantieni uno stile ${stile}

Testo da analizzare:
"""
${testo}
"""

Rispondi SOLO con un JSON valido nel formato:
{
  "riassunto": "...",
  "paroleChiave": ["parola1", "parola2", ...],
  "titoloProposto": "..."
}`;

    const message = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    // Parsing risposta Claude
    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Risposta AI non valida');

    const risultato = JSON.parse(jsonMatch[0]);
    res.json(risultato);

  } catch (error) {
    console.error('❌ Errore riassunti:', error.message);
    const status = error?.status || error?.statusCode;
    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'Chiave Anthropic non valida o non autorizzata.',
        details: error.message
      });
    }

    res.status(500).json({ error: 'Errore durante la generazione del riassunto', details: error.message });
  }
});

// ── POST /api/riassunti/schema ───────────────────────────────
router.post('/schema', async (req, res) => {
  try {
    const { testo, tipo = 'mappa-mentale' } = req.body;

    if (!testo || testo.trim().length < 30) {
      return res.status(400).json({ error: 'Testo troppo breve.' });
    }

    if (!hasValidAnthropicKey()) {
      return res.status(503).json({
        error: 'Claude/Anthropic non configurato: imposta una ANTHROPIC_API_KEY valida nel file .env (non il placeholder).'
      });
    }

    const prompt = `Sei un assistente educativo. Dal testo fornito, crea uno schema di tipo "${tipo}".
Restituisci SOLO JSON valido:
{
  "titolo": "...",
  "nodi": [
    { "id": "1", "testo": "Concetto principale", "livello": 0 },
    { "id": "2", "testo": "Sotto-concetto", "livello": 1, "parentId": "1" }
  ]
}

Testo: """${testo}"""`;

    const message = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Risposta AI non valida');

    res.json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    console.error('❌ Errore schema:', error.message);
    const status = error?.status || error?.statusCode;
    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'Chiave Anthropic non valida o non autorizzata.',
        details: error.message
      });
    }
    res.status(500).json({ error: 'Errore generazione schema', details: error.message });
  }
});

module.exports = router;
