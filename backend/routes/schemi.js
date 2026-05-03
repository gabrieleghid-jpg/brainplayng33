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
    `-> Concetto Principale`,
    `  -> Sottoconcetto 1`,
    `    -> Dettaglio A`,
    `    -> Dettaglio B`,
    `  -> Sottoconcetto 2`,
    `    -> Dettaglio C`,
    `-> Concetto Secondario`,
    `  -> Applicazione 1`,
    `  -> Applicazione 2`,
    `-> Sintesi e Conclusioni`
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
      
      // Validate and clean flashcard content
      const domanda = parts[0].length > 200 ? parts[0].substring(0, 200) + '...' : parts[0];
      const risposta = parts[1].length > 200 ? parts[1].substring(0, 200) + '...' : parts[1];
      
      return { domanda, risposta };
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

      // Validate quiz content
      const domanda = parts[0].length > 300 ? parts[0].substring(0, 300) + '...' : parts[0];
      const opzioni = parts.slice(1, 5).map(opt => opt.length > 100 ? opt.substring(0, 100) + '...' : opt);
      const correctIndex = Number(parts[5]);
      
      // Debug logging
      console.log('Quiz parsing - parts:', parts);
      console.log('Quiz parsing - correctIndex:', correctIndex, 'type:', typeof correctIndex);
      
      // Ensure correctIndex is valid
      const validIndex = Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < 4 ? correctIndex : Math.floor(Math.random() * 4);
      
      return {
        domanda,
        tipo: 'scelta_multipla',
        opzioni,
        risposta_corretta: validIndex
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
- Lo schema deve essere il focus principale: struttura ad albero gerarchica con macroargomenti e sotto-argomenti ben organizzati.
- Lo schema deve usare frecce testuali tipo "->" per mostrare i collegamenti logici.
- Usa rientri di 2 spazi per i livelli successivi (esempio sotto).
- Organizza gli argomenti in modo logico e gerarchico, dal generale al particolare.
- Il riassunto deve essere breve: 3-5 righe massimo.
- Le domande del quiz devono essere chiare e utili per ripassare.
- Se il testo nell'immagine e' parziale, usa solo cio' che riesci a dedurre con buona affidabilita'.
- La sezione MERMAID deve contenere solo codice Mermaid valido (nessun testo esplicativo dentro MERMAID); diagramma flowchart TD o LR coerente con lo SCHEMA, massimo 22 nodi, etichette italiane brevi tra quadre, senza carattere " nelle etichette.

Rispondi SOLO con queste sezioni, nello stesso ordine, senza testo extra:

CONTENUTO:
testo chiaro e ordinato

FLASHCARD:
- domanda breve | risposta breve
- domanda breve | risposta breve

SCHEMA:
Argomento principale
-> concetto fondamentale 1
  -> macroargomento 1.1
    -> dettaglio specifico 1.1.a
    -> dettaglio specifico 1.1.b
  -> macroargomento 1.2
    -> dettaglio specifico 1.2.a
-> concetto fondamentale 2
  -> macroargomento 2.1
    -> dettaglio specifico 2.1.a
  -> macroargomento 2.2
    -> dettaglio specifico 2.2.a
    -> dettaglio specifico 2.2.b
-> concetto fondamentale 3
  -> macroargomento 3.1

MERMAID:
flowchart TD
    A["Nodo radice breve"] --> B["Primo concetto"]
    B --> C["Dettaglio"]

RIASSUNTO:
riassunto molto breve in 3-5 righe

QUIZ:
1. domanda | opzione A | opzione B | opzione C | opzione D | 0
2. domanda | opzione A | opzione B | opzione C | opzione D | 1`;
}

function buildTextPrompt(topic) {
  return `Genera materiali di studio completi per l'argomento: ${topic}

Crea contenuti educativi sintetici e utili per studenti.

Vincoli:
- Scrivi tutto in italiano.
- Non usare Markdown.
- Lo schema deve essere il focus principale: struttura ad albero gerarchica con macroargomenti e sotto-argomenti ben organizzati.
- Lo schema deve usare frecce testuali tipo "->" per mostrare i collegamenti logici.
- Usa rientri di 2 spazi per i livelli successivi.
- Organizza gli argomenti in modo logico e gerarchico, dal generale al particolare.
- Il riassunto deve essere breve: 3-5 righe massimo.
- Le domande del quiz devono essere chiare e utili per ripassare.
- I contenuti devono essere accurati e ben strutturati.
- La sezione MERMAID deve contenere solo codice Mermaid valido (nessun testo esplicativo dentro MERMAID); diagramma flowchart TD o LR coerente con lo SCHEMA, massimo 22 nodi, etichette italiane brevi tra quadre, senza carattere " nelle etichette.

Rispondi SOLO con queste sezioni, nello stesso ordine, senza testo extra:

CONTENUTO:
testo chiaro e ordinato sull'argomento

FLASHCARD:
- domanda breve | risposta breve
- domanda breve | risposta breve
- domanda breve | risposta breve

SCHEMA:
${topic}
-> concetto fondamentale 1
  -> macroargomento 1.1
    -> dettaglio specifico 1.1.a
    -> dettaglio specifico 1.1.b
  -> macroargomento 1.2
    -> dettaglio specifico 1.2.a
-> concetto fondamentale 2
  -> macroargomento 2.1
    -> dettaglio specifico 2.1.a
  -> macroargomento 2.2
    -> dettaglio specifico 2.2.a
    -> dettaglio specifico 2.2.b
-> concetto fondamentale 3
  -> macroargomento 3.1

MERMAID:
flowchart TD
    A["Nodo radice breve"] --> B["Primo concetto"]
    B --> C["Dettaglio"]

RIASSUNTO:
riassunto molto breve in 3-5 righe

QUIZ:
1. domanda | opzione A | opzione B | opzione C | opzione D | 0
2. domanda | opzione A | opzione B | opzione C | opzione D | 1
3. domanda | opzione A | opzione B | opzione C | opzione D | 2`;
}

async function createTextMessage(topic) {
  const modelsToTry = [...new Set([
    anthropicModel,
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022'
  ])];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      return await anthropic.messages.create({
        model,
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: buildTextPrompt(topic)
              }
            ]
          }
        ]
      });
    } catch (error) {
      lastError = error;
      console.warn(`Model ${model} failed for text generation, trying next...`);
    }
  }

  throw lastError || new Error('Impossibile generare materiali dal testo.');
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
        max_tokens: 2000, // Increased for better schema generation
        temperature: 0.1, // Lower for more consistent structure
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
      console.warn(`Model ${model} failed, trying next...`);
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
      mermaid: normalizeMultilineText(parsed.mermaid || ''),
      riassunto: normalizeMultilineText(parsed.riassunto),
      quiz: parsed.quiz && Array.isArray(parsed.quiz.domande) ? parsed.quiz.domande : []
    };
  } catch {
    return {
      contenuto: extractSection(normalized, 'CONTENUTO', ['FLASHCARD', 'SCHEMA', 'MERMAID', 'RIASSUNTO', 'QUIZ']),
      flashcard: parseFlashcardsSection(extractSection(normalized, 'FLASHCARD', ['SCHEMA', 'MERMAID', 'RIASSUNTO', 'QUIZ'])),
      schema: extractSection(normalized, 'SCHEMA', ['MERMAID', 'RIASSUNTO', 'QUIZ']),
      mermaid: extractSection(normalized, 'MERMAID', ['RIASSUNTO', 'QUIZ']),
      riassunto: extractSection(normalized, 'RIASSUNTO', ['QUIZ']),
      quiz: parseQuizSection(extractSection(normalized, 'QUIZ', []))
    };
  }
}

router.post('/analizza-testo', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({ error: 'Argomento troppo breve. Inserisci almeno 3 caratteri.' });
    }

    // Usa lo stesso controllo dell'endpoint foto che funziona
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('your_anthropic_api_key_here')) {
      return res.status(503).json({
        error: 'Claude/Anthropic non configurato: imposta una ANTHROPIC_API_KEY valida nel file .env (non il placeholder).'
      });
    }

    const message = await createTextMessage(topic.trim());
    const raw = message.content[0]?.text?.trim() || '';
    const parsed = parseStudyMaterials(raw);
    
    res.json({
      contenuto: normalizeMultilineText(parsed.contenuto) || topic,
      flashcard: Array.isArray(parsed.flashcard) && parsed.flashcard.length > 0
        ? parsed.flashcard
        : [{ domanda: 'Qual e\' il tema principale?', risposta: topic }],
      schema: normalizeMultilineText(parsed.schema) || buildFallbackSchema(topic),
      mermaid: normalizeMultilineText(parsed.mermaid || ''),
      riassunto: normalizeMultilineText(parsed.riassunto) || topic,
      quiz: Array.isArray(parsed.quiz) && parsed.quiz.length > 0
        ? { domande: parsed.quiz }
        : {
            domande: [
              {
                domanda: `L'argomento "${topic}" presenta concetti principali riconoscibili?`,
                tipo: 'vero_falso',
                opzioni: ['Vero', 'Falso'],
                risposta_corretta: Math.random() > 0.5 ? 0 : 1
              }
            ]
          }
    });
  } catch (error) {
    console.error('❌ Errore analisi testo:', error.message);
    const status = error?.status || error?.statusCode;
    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'Chiave Anthropic non valida o non autorizzata.',
        details: error.message
      });
    }

    res.status(500).json({ error: 'Errore durante l\'analisi del testo', details: error.message });
  }
});

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
      mermaid: normalizeMultilineText(parsed.mermaid || ''),
      riassunto: normalizeMultilineText(parsed.riassunto) || topic,
      quiz: Array.isArray(parsed.quiz) && parsed.quiz.length > 0
        ? { domande: parsed.quiz }
        : {
            domande: [
              {
                domanda: 'Il contenuto dell\'immagine presenta un concetto principale riconoscibile?',
                tipo: 'vero_falso',
                opzioni: ['Vero', 'Falso'],
                risposta_corretta: Math.random() > 0.5 ? 0 : 1 // Random correct answer for fallback
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
