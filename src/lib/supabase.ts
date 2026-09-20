import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_SUPABASE_URL = "https://gphgnwsoxysiihpbuysv.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY =
  "sb_publishable_zcSs1RPPtYA1B75On7CuHg_LGmN6pKu";


const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl =
  rawUrl && rawUrl.trim() !== "" && !rawUrl.includes("your-supabase-url")
    ? rawUrl
    : DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  rawAnonKey && rawAnonKey.trim() !== ""
    ? rawAnonKey
    : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

