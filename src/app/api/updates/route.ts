import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from "@/lib/supabase";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;


function getSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function isSameCalendarDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export async function GET() {
  try {
    const client = getSupabaseServerClient();
    const { data, error } = await client
      .from("love_updates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/updates error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    console.error("GET /api/updates exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { percentage, message } = body;

    const rawNum = parseFloat(String(percentage));
    if (isNaN(rawNum) || rawNum < 0 || rawNum > 100) {
      return NextResponse.json(
        { success: false, error: "Percentage must be between 0 and 100." },
        { status: 400 }
      );
    }

    const val = Math.round(rawNum * 10) / 10;
    const cleanMessage =
      typeof message === "string" && message.trim() ? message.trim() : null;
    const now = new Date();
    const nowIso = now.toISOString();

    const client = getSupabaseServerClient();

    // Look for today's entry in Supabase
    const { data: recentRows, error: fetchErr } = await client
      .from("love_updates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (fetchErr) {
      console.warn("Could not query recent updates:", fetchErr);
    }

    const todayEntry = (recentRows || []).find((row: any) =>
      isSameCalendarDay(new Date(row.created_at), now)
    );

    if (todayEntry?.id) {
      // Update today's existing row
      const { data, error } = await client
        .from("love_updates")
        .update({
          percentage: val,
          message: cleanMessage,
          updated_at: nowIso,
        })
        .eq("id", todayEntry.id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update today entry:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        update: data,
        action: "updated",
      });
    } else {
      // Insert new row for today
      const { data, error } = await client
        .from("love_updates")
        .insert({
          percentage: val,
          message: cleanMessage,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to insert today entry:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        update: data,
        action: "inserted",
      });
    }
  } catch (err: any) {
    console.error("POST /api/updates exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save update" },
      { status: 500 }
    );
  }
}
