-- ============================================================
--  BrainPlayng - Schema SQL per Supabase
--  Esegui questo file nel SQL Editor di Supabase:
--  Dashboard → SQL Editor → New Query → incolla → Run
-- ============================================================

-- Abilita l'estensione UUID (già attiva su Supabase, ma per sicurezza)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABELLA: profiles
--    Estende la tabella auth.users di Supabase con dati aggiuntivi
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT NOT NULL,
  bio           TEXT DEFAULT '',
  livello       INTEGER DEFAULT 1,
  exp           INTEGER DEFAULT 0,
  crediti       INTEGER DEFAULT 100,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: crea automaticamente il profilo quando un utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. TABELLA: avatar_configs
--    Salva la configurazione dell'avatar personalizzato dell'utente
-- ============================================================
CREATE TABLE IF NOT EXISTS public.avatar_configs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  capelli     TEXT DEFAULT 'nessun_capello',
  vestiti     TEXT DEFAULT 'vestito_default',
  cappello    TEXT DEFAULT 'nessun_cappello',
  occhiali    TEXT DEFAULT 'nessun_occhiale',
  accessori   JSONB DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 3. TABELLA: schemi
--    Schemi e mappe concettuali creati dall'utente
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schemi (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titolo      TEXT NOT NULL,
  tipo        TEXT DEFAULT 'mappa-mentale',  -- 'mappa-mentale', 'flashcard', 'timeline', 'flowchart'
  contenuto   JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TABELLA: riassunti
--    Storico dei riassunti generati dall'AI
-- ============================================================
CREATE TABLE IF NOT EXISTS public.riassunti (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titolo          TEXT,
  testo_originale TEXT NOT NULL,
  riassunto       TEXT NOT NULL,
  parole_chiave   TEXT[] DEFAULT '{}',
  lingua          TEXT DEFAULT 'italiano',
  stile           TEXT DEFAULT 'scolastico',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. TABELLA: punteggi
--    Punteggi di minigiochi e battle
-- ============================================================
CREATE TABLE IF NOT EXISTS public.punteggi (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gioco       TEXT NOT NULL,   -- 'battle', 'quiz', 'flashcard', ecc.
  punteggio   INTEGER NOT NULL DEFAULT 0,
  dati_extra  JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TABELLA: classifica
--    Vista materializzata dei punteggi totali per classifica
-- ============================================================
CREATE OR REPLACE VIEW public.classifica AS
  SELECT
    p.id AS user_id,
    p.username,
    p.livello,
    COALESCE(SUM(s.punteggio), 0) AS punteggio_totale,
    COUNT(s.id) AS partite_giocate
  FROM public.profiles p
  LEFT JOIN public.punteggi s ON s.user_id = p.id
  GROUP BY p.id, p.username, p.livello
  ORDER BY punteggio_totale DESC;

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
--    Ogni utente vede e modifica SOLO i propri dati
-- ============================================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemi        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riassunti     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punteggi      ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "Utenti vedono solo il proprio profilo"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utenti aggiornano solo il proprio profilo"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies: avatar_configs
CREATE POLICY "Utenti gestiscono solo il proprio avatar"
  ON public.avatar_configs FOR ALL
  USING (auth.uid() = user_id);

-- Policies: schemi
CREATE POLICY "Utenti gestiscono solo i propri schemi"
  ON public.schemi FOR ALL
  USING (auth.uid() = user_id);

-- Policies: riassunti
CREATE POLICY "Utenti gestiscono solo i propri riassunti"
  ON public.riassunti FOR ALL
  USING (auth.uid() = user_id);

-- Policies: punteggi
CREATE POLICY "Utenti inseriscono i propri punteggi"
  ON public.punteggi FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tutti vedono i punteggi (classifica pubblica)"
  ON public.punteggi FOR SELECT
  USING (true);

-- ============================================================
-- 8. INDICI per performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_schemi_user_id     ON public.schemi(user_id);
CREATE INDEX IF NOT EXISTS idx_riassunti_user_id  ON public.riassunti(user_id);
CREATE INDEX IF NOT EXISTS idx_punteggi_user_id   ON public.punteggi(user_id);
CREATE INDEX IF NOT EXISTS idx_punteggi_gioco     ON public.punteggi(gioco);

-- ============================================================
-- ✅  FINE SETUP - Il database BrainPlayng è pronto!
-- ============================================================
