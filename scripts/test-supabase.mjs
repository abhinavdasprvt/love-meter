import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gphgnwsoxysiihpbuysv.supabase.co";
const supabaseKey = "sb_publishable_zcSs1RPPtYA1B75On7CuHg_LGmN6pKu";
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const client = createClient(supabaseUrl, supabaseKey);

console.log("Testing connection to Supabase...");
const { data, error } = await client.from("love_updates").select("*").limit(5);

if (error) {
  console.log("Query error:", error.message, error.code, error.details);
} else {
  console.log("Success! Data in love_updates:", data);
}
