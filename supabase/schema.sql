-- TRUPTI 🪷✨ Database Schema for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

CREATE TABLE IF NOT EXISTS public.love_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    percentage NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.love_updates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to love updates so the public homepage can display the current percentage
CREATE POLICY "Allow public read access to love_updates"
    ON public.love_updates
    FOR SELECT
    USING (true);

-- Allow inserting updates (protected by client PIN verification & server validation)
CREATE POLICY "Allow insert access to love_updates"
    ON public.love_updates
    FOR INSERT
    WITH CHECK (percentage >= 0 AND percentage <= 100);

-- Allow updating today's entry
CREATE POLICY "Allow update access to love_updates"
    ON public.love_updates
    FOR UPDATE
    USING (true)
    WITH CHECK (percentage >= 0 AND percentage <= 100);

-- Initial Seed Data with decimals for Trupti
INSERT INTO public.love_updates (percentage, message, created_at, updated_at)
VALUES 
    (74.5, 'You brought me coffee today ☕', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (82.3, 'Loved listening to music together ✨', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
