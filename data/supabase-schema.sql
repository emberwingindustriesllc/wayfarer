-- The Wayfarer's Journey - Comprehensive Supabase Schema
-- Supports offline-first guests and authenticated pilgrims

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (stores user metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    username TEXT,
    display_name TEXT DEFAULT 'Wayfarer',
    pilgrimage_started_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game progress table (stores primary pilgrimage state)
CREATE TABLE IF NOT EXISTS public.game_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    guest_id TEXT UNIQUE,
    current_arc TEXT DEFAULT 'grief',
    active_challenge_id TEXT,
    stats JSONB DEFAULT '{"resilience": 100, "wisdom": 0, "faith": 10, "patience": 5, "community": 5}'::jsonb,
    inventory TEXT[] DEFAULT ARRAY['gospel_reading', 'breath_of_grace']::text[],
    completed_challenges TEXT[] DEFAULT ARRAY[]::text[],
    stasis_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    guest_id TEXT,
    challenge_id TEXT,
    arc_id TEXT,
    prompt TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rest area visit logs
CREATE TABLE IF NOT EXISTS public.rest_area_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    guest_id TEXT,
    rest_type TEXT NOT NULL, -- 'campfire', 'scripture_well', 'support_circle'
    reflection TEXT,
    scripture_referenced TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Acts of Grace
CREATE TABLE IF NOT EXISTS public.acts_of_grace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    guest_id TEXT,
    act_title TEXT NOT NULL,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_progress_guest_id ON public.game_progress(guest_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON public.game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_guest_id ON public.journal_entries(guest_id);
CREATE INDEX IF NOT EXISTS idx_acts_of_grace_guest_id ON public.acts_of_grace(guest_id);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rest_area_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acts_of_grace ENABLE ROW LEVEL SECURITY;

-- Permissive policies for web client & anonymous guest access (with user_id fallback)
DROP POLICY IF EXISTS "Allow public read game_progress" ON public.game_progress;
CREATE POLICY "Allow public read game_progress" ON public.game_progress FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert game_progress" ON public.game_progress;
CREATE POLICY "Allow public insert game_progress" ON public.game_progress FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update game_progress" ON public.game_progress;
CREATE POLICY "Allow public update game_progress" ON public.game_progress FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read journal_entries" ON public.journal_entries;
CREATE POLICY "Allow public read journal_entries" ON public.journal_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert journal_entries" ON public.journal_entries;
CREATE POLICY "Allow public insert journal_entries" ON public.journal_entries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read rest_area_logs" ON public.rest_area_logs;
CREATE POLICY "Allow public read rest_area_logs" ON public.rest_area_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert rest_area_logs" ON public.rest_area_logs;
CREATE POLICY "Allow public insert rest_area_logs" ON public.rest_area_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read acts_of_grace" ON public.acts_of_grace;
CREATE POLICY "Allow public read acts_of_grace" ON public.acts_of_grace FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert acts_of_grace" ON public.acts_of_grace;
CREATE POLICY "Allow public insert acts_of_grace" ON public.acts_of_grace FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update acts_of_grace" ON public.acts_of_grace;
CREATE POLICY "Allow public update acts_of_grace" ON public.acts_of_grace FOR UPDATE USING (true);
