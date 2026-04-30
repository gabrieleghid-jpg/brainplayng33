# BrainPlayng

Progetto riorganizzato con una struttura piu pulita e vicina a un setup moderno.

## Struttura

```text
brainplayng/
|- backend/        API Express e logica server
|- codex-temp/     residui tecnici e cartelle importate male dallo zip
|- docs/           documentazione progetto
|- public/         asset statici pubblici
|- src/
|  |- components/  frammenti HTML riutilizzabili
|  |- js/          script frontend e moduli
|  |- pages/       pagine HTML
|  |- styles/      fogli di stile
|- supabase/       schema e file collegati al database
|- .env
|- .env.example
|- README.md
```

## Note rapide

- Il frontend e stato separato in `src` e `public`.
- Lo schema SQL e stato spostato in `supabase/supabase-schema.sql`.
- I file anomali presenti nello zip sono stati spostati in `codex-temp/`.

## Avvio

1. Configura `.env` partendo da `.env.example`.
2. Esegui `supabase/supabase-schema.sql` nel progetto Supabase.
3. Avvia il backend da `backend/`.
4. Apri le pagine frontend da `src/pages/`.
