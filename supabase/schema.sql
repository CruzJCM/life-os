-- ==========================================
-- Life OS v3 - Database Schema
-- ==========================================
-- Run this SQL in your Supabase SQL Editor

-- ==========================================
-- PROFILES (Extiende auth.users de Supabase)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  grid_layouts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- CARDS (Tarjetas del dashboard)
-- ==========================================
CREATE TYPE public.card_type AS ENUM (
  'event_counter',    -- Contador de eventos (dias hasta fecha)
  'goal_counter',     -- Contador de objetivos (veces hecho)
  'daily_checklist',  -- Checklist diario
  'goal_progress'     -- Meta con progreso numerico
);

CREATE TYPE public.card_status AS ENUM ('active', 'completed', 'archived');

CREATE TABLE IF NOT EXISTS public.cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Tipo y estado
  type public.card_type NOT NULL,
  status public.card_status DEFAULT 'active',

  -- Datos comunes
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,

  -- Posicion en grid
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 2,
  height INTEGER DEFAULT 2,

  -- Configuracion especifica por tipo (JSONB flexible)
  config JSONB DEFAULT '{}',

  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_position CHECK (position_x >= 0 AND position_y >= 0),
  CONSTRAINT valid_size CHECK (width >= 1 AND height >= 1)
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_cards_user ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_type ON public.cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);

-- RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.cards
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER on_cards_update
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- CARD_HISTORY (Historial de tarjetas completadas)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.card_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Snapshot del estado al completarse
  card_type public.card_type NOT NULL,
  title TEXT NOT NULL,
  final_config JSONB NOT NULL,

  -- Metricas de tiempo
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_days INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM completed_at - started_at)::INTEGER
  ) STORED,

  -- Estadisticas especificas por tipo
  stats JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user ON public.card_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_card ON public.card_history(card_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON public.card_history(completed_at DESC);

ALTER TABLE public.card_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON public.card_history
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- DAILY_SNAPSHOTS (Para reset diario)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.daily_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  state_at_reset JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(card_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_date ON public.daily_snapshots(snapshot_date);

ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own snapshots" ON public.daily_snapshots
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Funcion para mover tarjeta al historial cuando se completa
CREATE OR REPLACE FUNCTION public.archive_completed_card()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.card_history (
      card_id, user_id, card_type, title,
      final_config, started_at, stats
    ) VALUES (
      NEW.id, NEW.user_id, NEW.type, NEW.title,
      NEW.config, NEW.created_at, '{}'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_card_complete
  AFTER UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.archive_completed_card();

-- ==========================================
-- AUTOMATIC PROFILE CREATION ON SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();