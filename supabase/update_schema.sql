-- ============================================================================
-- TRUPTI 🪷 & ABHINAV 💙 — Supabase Database Migration
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

-- 1. Safely add the 'person' column to love_updates table (defaults to 'trupti')
ALTER TABLE public.love_updates 
ADD COLUMN IF NOT EXISTS person TEXT DEFAULT 'trupti';

-- 2. Add an index for fast queries by person & date
CREATE INDEX IF NOT EXISTS idx_love_updates_person_created 
ON public.love_updates (person, created_at DESC);

-- 3. Backfill existing records:
-- All original rows belong to Trupti (100% data preservation)
UPDATE public.love_updates 
SET person = 'trupti' 
WHERE person IS NULL;

-- Mark any entries created by Abhinav
UPDATE public.love_updates 
SET person = 'abhinav' 
WHERE updated_by = '00000000-0000-0000-0000-000000000001' 
   OR message LIKE '[abhinav]%';

-- 4. Seed baseline historical data points for Abhinav so his "LOVE LATELY" graph
-- has full trend lines matching Trupti's history:
INSERT INTO public.love_updates (percentage, message, person, created_at, updated_at, updated_by)
VALUES 
    (91.0, '[abhinav] Falling in love with you more every second ✨', 'abhinav', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', '00000000-0000-0000-0000-000000000001'),
    (93.5, '[abhinav] Thinking of your sweet smile today 💙', 'abhinav', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', '00000000-0000-0000-0000-000000000001'),
    (94.0, '[abhinav] Can never stop missing you my girl 🥺💙', 'abhinav', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', '00000000-0000-0000-0000-000000000001'),
    (95.5, '[abhinav] You make my whole world so beautiful 🪐', 'abhinav', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', '00000000-0000-0000-0000-000000000001'),
    (96.5, '[abhinav] You''re my entire galaxy 💙', 'abhinav', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 5. Row Level Security (RLS) policies
ALTER TABLE public.love_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to love_updates" ON public.love_updates;
CREATE POLICY "Allow public read access to love_updates"
    ON public.love_updates FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow insert access to love_updates" ON public.love_updates;
CREATE POLICY "Allow insert access to love_updates"
    ON public.love_updates FOR INSERT
    WITH CHECK (percentage >= 0 AND percentage <= 100);

DROP POLICY IF EXISTS "Allow update access to love_updates" ON public.love_updates;
CREATE POLICY "Allow update access to love_updates"
    ON public.love_updates FOR UPDATE
    USING (true)
    WITH CHECK (percentage >= 0 AND percentage <= 100);
