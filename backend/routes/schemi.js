/**
 * backend/routes/schemi.js
 * Gestione schemi e analisi foto con AI
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();
const { supabase, supabaseConfigured } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { hasValidAnthropicKey } = require('../utils/env');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const anthropicVisionModel = process.env.ANTHROPIC_VISION_MODEL || 'claude-3-7-sonnet-20250219';

function extractJsonObject(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Risposta AI non valida.');
  }

  return JSON.parse(jsonMatch[0]);
}

function parseImageDataUrl(imageDataUrl) {
  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Formato immagine non valido.');
  }

  return {
    mediaType: match[1],
    data: match[2]
  };
}

function buildFallbackSchema(topic) {
  return [
    `${topic}`,
    `-> idea principale`,
    `-> concetti chiave`,
    `-> dettagli importanti`,
    `-> collegamenti logici`,
    `-> sintesi finale`
  ].join('\n');
}

function normalizeMultilineText(value) {
  return (value || '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractSection(text, sectionName, nextSectionNames) {
  const escapedCurrent = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nextPattern = nextSectionNames.length > 0
    ? nextSectionNames
      .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')
    : null;
  const regex = nextPattern
    ? new RegExp(`${escapedCurrent}\\s*:\\s*([\\s\\S]*?)(?=\\n(?:${nextPattern})\\s*:|$)`, 'i')
    : new RegExp(`${escapedCurrent}\\s*:\\s*([\\s\\S]*)$`, 'i');
  const match = text.match(regex);
  return normalizeMultilineText(match ? match[1] : '');
}

function parseFlashcardsSection(sectionText) {
  const flashcards = sectionText
    .split('\n')
    .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim()).filter(Boolean);
      if (parts.length < 2) return null;
      return { domanda: parts[0], risposta: parts[1] };
    })
    .filter(Boolean);

  return flashcards;
}

function parseQuizSection(sectionText) {
  const domande = sectionText
    .split('\n')
    .map((line) => line.replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim()).filter(Boolean);
      if (parts.length < 6) return null;

      const correctIndex = Number(parts[5]);
      return {
        domanda: parts[0],
        tipo: 'scelta_multipla',
        opzioni: parts.slice(1, 5),
        risposta_corretta: Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < 4 ? correctIndex : 0
      };
    })
    .filter(Boolean);

  return domande;
}

function buildPrompt() {
  return `Analizza l'immagine caricata dallo studente. Estrai il testo leggibile e ricostruisci il contenuto anche se la foto non e' perfetta.

Genera materiali di studio sintetici e utili.

Vincoli:
- Scrivi tutto in italiano.
- Non usare Markdown.
- Lo schema deve essere molto sintetico.
- Lo schema deve usare frecce testuali tipo "->" per mostrare i collegamenti.
- Se il testo nell'immagine e' parziale, usa solo cio' che riesci a dedurre con buona affidabilita'.

Rispondi SOLO con queste sezioni, nello stesso ordine, senza testo extra:

CONTENUTO:
testo chiaro e ordinato

FLASHCARD:
- domanda breve | risposta breve
- domanda breve | risposta breve

SCHEMA:
Argomento principale
-> concetto 1
  -> dettaglio
-> concetto 2
  -> dettaglio

RIASSUNTO:
riassunto sintetico massimo 180 parole

QUIZ:
1. domanda | opzione A | opzione B | opzione C | opzione D | 0
2. domanda | opzione A | opzione B | opzione C | opzione D | 1`;
}

async function createVisionMessage(mediaType, data) {
  const modelsToTry = [...new Set([
    anthropicVisionModel,
    anthropicModel,
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022'
  ])];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      return await anthropic.messages.create({
        model,
        max_tokens: 1800,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data
                }
              },
              {
                type: 'text',
                text: buildPrompt()
              }
            ]
          }
        ]
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Impossibile analizzare l\'immagine.');
}

function parseStudyMaterials(rawText) {
  const normalized = normalizeMultilineText(rawText);

  try {
    const parsed = extractJsonObject(normalized);
    return {
      contenuto: normalizeMultilineText(parsed.contenuto),
      flashcard: Array.isArray(parsed.flashcard) ? parsed.flashcard : [],
      schema: normalizeMultilineText(parsed.schema),
      riassunto: normalizeMultilineText(parsed.riassunto),
      quiz: parsed.quiz && Array.isArray(parsed.quiz.domande) ? parsed.quiz.domande : []
    };
  } catch {
    return {
      contenuto: extractSection(normalized, 'CONTENUTO', ['FLASHCARD', 'SCHEMA', 'RIASSUNTO', 'QUIZ']),
      flashcard: parseFlashcardsSection(extractSection(normalized, 'FLASHCARD', ['SCHEMA', 'RIASSUNTO', 'QUIZ'])),
      schema: extractSection(normalized, 'SCHEMA', ['RIASSUNTO', 'QUIZ']),
      riassunto: extractSection(normalized, 'RIASSUNTO', ['QUIZ']),
      quiz: parseQuizSection(extractSection(normalized, 'QUIZ', []))
    };
  }
}

router.post('/analizza-foto', async (req, res) => {
  try {
    const { imageDataUrl } = req.body;

    if (!imageDataUrl) {
      return res.status(400).json({ error: 'Immagine mancante.' });
    }

    if (!hasValidAnthropicKey()) {
      return res.status(503).json({
        error: 'Claude/Anthropic non configurato: imposta una ANTHROPIC_API_KEY valida nel file .env (non il placeholder).'
      });
    }

    const { mediaType, data } = parseImageDataUrl(imageDataUrl);
    const message = await createVisionMessage(mediaType, data);

    const raw = message.content[0]?.text?.trim() || '';
    const parsed = parseStudyMaterials(raw);
    const topic = (parsed.riassunto || parsed.contenuto || parsed.schema || 'Schema sintetico').split(/[.!?\n]/)[0].trim() || 'Schema sintetico';

    res.json({
      contenuto: normalizeMultilineText(parsed.contenuto) || topic,
      flashcard: Array.isArray(parsed.flashcard) && parsed.flashcard.length > 0
        ? parsed.flashcard
        : [{ domanda: 'Qual e\' il tema principale?', risposta: topic }],
      schema: normalizeMultilineText(parsed.schema) || buildFallbackSchema(topic),
      riassunto: normalizeMultilineText(parsed.riassunto) || topic,
      quiz: Array.isArray(parsed.quiz) && parsed.quiz.length > 0
        ? { domande: parsed.quiz }
        : {
            domande: [
              {
                domanda: 'Il contenuto dell\'immagine presenta un concetto principale riconoscibile?',
                tipo: 'vero_falso',
                opzioni: ['Vero', 'Falso'],
                risposta_corretta: 0
              }
            ]
          }
    });
  } catch (error) {
    console.error('❌ Errore analisi schema da foto:', error.message);
    const status = error?.status || error?.statusCode;
    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'Chiave Anthropic non valida o non autorizzata.',
        details: error.message
      });
    }

    res.status(500).json({ error: 'Errore durante l\'analisi della foto', details: error.message });
  }
});

router.use(authMiddleware);

router.get('/', async (req, res) => {
  if (!supabaseConfigured || !supabase) {
    return res.status(503).json({ error: 'Supabase non configurato: completa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.' });
  }
  const { data, error } = await supabase
    .from('schemi')
    .select('id, titolo, tipo, created_at, updated_at')
    .eq('user_id', req.userId)
    .order('updated_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  if (!supabaseConfigured || !supabase) {
    return res.status(503).json({ error: 'Supabase non configurato: completa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.' });
  }
  const { titolo, tipo, contenuto } = req.body;

  const { data, error } = await supabase
    .from('schemi')
    .insert({ user_id: req.userId, titolo, tipo, contenuto })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.get('/:id', async (req, res) => {
  if (!supabaseConfigured || !supabase) {
    return res.status(503).json({ error: 'Supabase non configurato: completa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.' });
  }
  const { data, error } = await supabase
    .from('schemi')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .single();

  if (error) return res.status(404).json({ error: 'Schema non trovato.' });
  res.json(data);
});

router.put('/:id', async (req, res) => {
  if (!supabaseConfigured || !supabase) {
    return res.status(503).json({ error: 'Supabase non configurato: completa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.' });
  }
  const { titolo, contenuto } = req.body;

  const { data, error } = await supabase
    .from('schemi')
    .update({ titolo, contenuto, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  if (!supabaseConfigured || !supabase) {
    return res.status(503).json({ error: 'Supabase non configurato: completa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.' });
  }
  const { error } = await supabase
    .from('schemi')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.userId);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Schema eliminato.' });
});

module.exports = router;
