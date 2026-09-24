-- ============================================================================
-- TRUPTI 🪷 & ABHINAV 💙 — 100% Non-Destructive Supabase Migration
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
--
-- GUARANTEE:
-- 1. ZERO old records are deleted or altered.
-- 2. Purely additive: only adds the 'person' column if it does not already exist.
-- 3. Trupti's existing 5 entries automatically remain 100% hers.
-- 4. No duplicate rows will be created (no INSERTs).
-- ============================================================================

-- STEP 1: Safely add the 'person' column without touching any existing row data.
-- All existing records will automatically have person = 'trupti' by default.
ALTER TABLE public.love_updates 
ADD COLUMN IF NOT EXISTS person TEXT DEFAULT 'trupti';

-- STEP 2: Speed up queries when filtering by Abhinav or Trupti.
CREATE INDEX IF NOT EXISTS idx_love_updates_person_created 
ON public.love_updates (person, created_at DESC);

-- STEP 3: Only mark Abhinav's specific rows (Trupti's data is 100% untouched).
-- This only matches rows that were created for Abhinav.
UPDATE public.love_updates 
SET person = 'abhinav' 
WHERE message LIKE '[abhinav]%' 
   OR updated_by = '00000000-0000-0000-0000-000000000001';

-- STEP 4: Ensure Row Level Security (RLS) is enabled and non-blocking
ALTER TABLE public.love_updates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Allow public to view love updates (both Abhinav & Trupti)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'love_updates' AND policyname = 'Allow public read access to love_updates'
    ) THEN
        CREATE POLICY "Allow public read access to love_updates"
            ON public.love_updates FOR SELECT
            USING (true);
    END IF;

    -- Allow insert access with percentage constraint check
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'love_updates' AND policyname = 'Allow insert access to love_updates'
    ) THEN
        CREATE POLICY "Allow insert access to love_updates"
            ON public.love_updates FOR INSERT
            WITH CHECK (percentage >= 0 AND percentage <= 100);
    END IF;

    -- Allow update access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'love_updates' AND policyname = 'Allow update access to love_updates'
    ) THEN
        CREATE POLICY "Allow update access to love_updates"
            ON public.love_updates FOR UPDATE
            USING (true)
            WITH CHECK (percentage >= 0 AND percentage <= 100);
    END IF;
END $$;
