-- The Wayfarer's Journey - Supabase Schema
-- Auth, Game State, Progress Tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game progress table
CREATE TABLE game_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    current_arc TEXT,
    current_challenge TEXT,
    stats JSONB DEFAULT '{}',
    inventory TEXT[],
    wisdom_points INTEGER DEFAULT 0,
    resilience_points INTEGER DEFAULT 100,
    faith_points INTEGER DEFAULT 10,
    patience_points INTEGER DEFAULT 5,
    community_points INTEGER DEFAULT 5,
    completed_challenges TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    challenge_id TEXT,
    content TEXT,
    reflections TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rest area logs
CREATE TABLE rest_area_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    rest_area_type TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rest_area_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own progress" ON game_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON game_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create own journal" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own journal" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own rest logs" ON rest_area_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own rest logs" ON rest_area_logs FOR SELECT USING (auth.uid() = user_id);
