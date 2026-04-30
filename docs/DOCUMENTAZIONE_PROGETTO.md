# 📚 BrainPlayng - Documentazione Completa del Progetto

## 🎯 Panoramica del Progetto

**BrainPlayng** è una piattaforma educativa web-based che combina strumenti di studio, gamification e apprendimento interattivo. Offre un ambiente completo per lo studio personalizzato con AI (Claude by Anthropic), avatar personalizzabili, schemi interattivi e mini-giochi educativi.

---

## 📁 Struttura del Progetto (v2.0 - Ristrutturata)

```
brainplayng/
│
├── 📄 .env                        ← Variabili d'ambiente (NON committare!)
├── 📄 .env.example                ← Template .env da copiare
├── 📄 .gitignore
│
├── 🔧 backend/                    ← Server Node.js + API
│   ├── server.js                  ← Entry point Express
│   ├── package.json               ← Dipendenze backend
│   ├── config/
│   │   └── supabase.js            ← Client Supabase (service role, server-only)
│   ├── routes/
│   │   ├── riassunti.js           ← POST /api/riassunti/genera (Claude AI)
│   │   ├── auth.js                ← POST /api/auth/login|register|logout
│   │   ├── users.js               ← GET/PUT /api/users/:id/profile|avatar
│   │   └── schemi.js              ← CRUD /api/schemi
│   └── middleware/
│       └── auth.js                ← Verifica JWT Supabase
│
├── 🌐 frontend/                   ← Tutto il codice lato browser
│   ├── pages/                     ← Pagine HTML
│   │   ├── index.html             ← Login / Registrazione
│   │   ├── home.html              ← Dashboard principale
│   │   ├── riassunti.html         ← Generatore riassunti AI ✨
│   │   ├── avatar-studio.html     ← Studio avatar
│   │   ├── battle-game.html       ← Gioco battaglia
│   │   ├── minigiochi.html        ← Mini-giochi
│   │   ├── classifica.html        ← Classifiche
│   │   ├── profile.html           ← Profilo utente
│   │   ├── negozio.html           ← Negozio virtuale
│   │   └── schemi-analysis.html   ← Analisi schemi
│   ├── styles/                    ← CSS
│   │   ├── dashboard.css
│   │   ├── battle-game.css
│   │   ├── avatar-game.css
│   │   ├── avatar-layering.css
│   │   ├── foto.css
│   │   └── schemi.css
│   ├── js/                        ← JavaScript lato client
│   │   ├── env-config.js          ← ⚠️ Configura URL + ANON KEY Supabase
│   │   ├── supabase-client.js     ← Client Supabase browser + helper apiFetch()
│   │   ├── sidebar.js
│   │   ├── theme-manager.js
│   │   ├── animated-avatar.js
│   │   ├── avatar-layering.js
│   │   ├── battle-game.js
│   │   ├── battle-data.js
│   │   ├── battle-animations.js
│   │   ├── modules/               ← Moduli JS riutilizzabili
│   │   │   ├── auth.js
│   │   │   ├── credits.js
│   │   │   ├── shop.js
│   │   │   ├── notifications.js
│   │   │   ├── avatar-renderer.js
│   │   │   └── avatar-storage.js
│   │   └── utils/
│   │       └── utils.js
│   ├── components/                ← Componenti HTML riutilizzabili
│   └── assets/avatar/             ← PNG avatar (30+ file)
│
└── 📋 docs/
    ├── supabase-schema.sql        ← ⚠️ SQL da eseguire su Supabase
    └── DOCUMENTAZIONE_PROGETTO.md ← Questo file
```

---

## 🔑 Setup - Guida Passo Passo

### 1️⃣ Configura il file `.env`

```bash
# Copia il template
cp .env.example .env

# Apri .env e inserisci i tuoi valori reali (vedi sezione "Dove trovare le chiavi" sotto)
```

### 2️⃣ Esegui l'SQL su Supabase

1. Vai su [app.supabase.com](https://app.supabase.com) → seleziona il tuo progetto
2. Menu laterale → **SQL Editor** → **New Query**
3. Copia-incolla il contenuto di `docs/supabase-schema.sql`
4. Clicca **Run** (▶)

Questo crea le tabelle: `profiles`, `avatar_configs`, `schemi`, `riassunti`, `punteggi`, e la vista `classifica`.

### 3️⃣ Configura il frontend

Apri `frontend/js/env-config.js` e sostituisci:

```javascript
const ENV = {
  SUPABASE_URL:      'https://TUO-PROGETTO.supabase.co',    // ← la tua URL
  SUPABASE_ANON_KEY: 'eyJhbGc...la-tua-anon-key...',       // ← la tua anon key
  BACKEND_URL:       'http://localhost:3001',
  // ...
};
```

### 4️⃣ Avvia il backend

```bash
cd backend
npm install
npm start
# → Server su http://localhost:3001
```

### 5️⃣ Apri il frontend

Apri `frontend/pages/home.html` con Live Server (VS Code) oppure:

```bash
# Dall'interno di frontend/
npx serve . -p 3000
```

---

## 🗝️ Dove trovare le chiavi

### Chiavi Supabase

1. [app.supabase.com](https://app.supabase.com) → Tuo progetto
2. **Project Settings** (⚙️) → **API**
3. Copia:
   - **Project URL** → `SUPABASE_URL` nel `.env` e `env-config.js`
   - **anon / public** → `SUPABASE_ANON_KEY` nel `.env` e `env-config.js`
   - **service_role** (secret!) → `SUPABASE_SERVICE_ROLE_KEY` nel `.env` SOLO

> ⚠️ La **service_role key** non va MAI nel frontend o committata su Git!

### Chiave Anthropic (Claude AI)

1. [console.anthropic.com](https://console.anthropic.com) → **Settings** → **API Keys**
2. Clicca **Create Key**
3. Copia la chiave → `ANTHROPIC_API_KEY` nel `.env` SOLO

> ⚠️ La chiave Anthropic non va MAI nel frontend!

---

## 🏗️ Architettura del Sistema

```
[Browser / Frontend]
       │
       │  HTTP (fetch / apiFetch)
       ▼
[Backend Node.js - porta 3001]
       │
       ├── /api/riassunti/genera → Anthropic Claude API
       ├── /api/auth/*           → Supabase Auth
       ├── /api/users/*          → Supabase DB (profiles, avatar)
       └── /api/schemi/*         → Supabase DB (schemi)
```

**Flusso riassunti AI:**
1. L'utente incolla il testo in `riassunti.html`
2. Il frontend chiama `POST http://localhost:3001/api/riassunti/genera`
3. Il backend usa la chiave `ANTHROPIC_API_KEY` per chiamare Claude
4. Claude restituisce `{ riassunto, paroleChiave, titoloProposto }`
5. Il frontend mostra il risultato

---

## 💾 Schema Database Supabase

| Tabella | Descrizione |
|---------|-------------|
| `profiles` | Estende auth.users: username, bio, livello, exp, crediti |
| `avatar_configs` | Configurazione avatar: capelli, vestiti, cappello, occhiali |
| `schemi` | Schemi/mappe mentali salvati dall'utente |
| `riassunti` | Storico riassunti generati da AI |
| `punteggi` | Punteggi di giochi e battle |
| `classifica` (VIEW) | Vista aggregata per la classifica pubblica |

**RLS attiva**: ogni utente vede e modifica SOLO i propri dati.

---

## 🔌 API Endpoints Backend

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| `GET`  | `/api/health` | No | Health check |
| `POST` | `/api/auth/register` | No | Registrazione |
| `POST` | `/api/auth/login` | No | Login → JWT |
| `POST` | `/api/auth/logout` | No | Logout |
| `GET`  | `/api/users/:id/profile` | Sì | Leggi profilo |
| `PUT`  | `/api/users/:id/profile` | Sì | Aggiorna profilo |
| `GET`  | `/api/users/:id/avatar` | Sì | Leggi avatar |
| `PUT`  | `/api/users/:id/avatar` | Sì | Salva avatar |
| `GET`  | `/api/schemi` | Sì | Lista schemi |
| `POST` | `/api/schemi` | Sì | Crea schema |
| `GET`  | `/api/schemi/:id` | Sì | Leggi schema |
| `PUT`  | `/api/schemi/:id` | Sì | Aggiorna schema |
| `DELETE` | `/api/schemi/:id` | Sì | Elimina schema |
| `POST` | `/api/riassunti/genera` | No* | Genera riassunto con Claude |
| `POST` | `/api/riassunti/schema` | No* | Genera mappa concettuale |

*Le route riassunti non richiedono auth ma possono essere protette in futuro.

---

## 🎨 Design System

**Palette Colori:**
- Primary: `#4f46e5` (Indigo) / Dark: `#818cf8`
- Background: `#f5f7ff` / Dark: `#090b14`
- Panel: `rgba(255,255,255,0.92)` / Dark: `rgba(15,23,42,0.92)`

**Typography:** Inter (Google Fonts) — pesi 400, 500, 600, 700

---

## 🚀 Roadmap Futura

1. **Salvataggio riassunti** su Supabase dopo la generazione AI
2. **PWA** (Progressive Web App) con service worker
3. **Multiplayer battle** tramite Supabase Realtime
4. **Mobile app** con Capacitor
5. **Achievement system** con badge
6. **WebSocket** per notifiche real-time

---

*Ultimo aggiornamento: Aprile 2026 — v2.0*
