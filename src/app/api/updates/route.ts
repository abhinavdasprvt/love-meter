import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from "@/lib/supabase";
import { Person, LoveUpdate } from "@/types";

const ABHINAV_UUID = "00000000-0000-0000-0000-000000000001";
const TRUPTI_UUID = "00000000-0000-0000-0000-000000000002";

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

function parseRowToLoveUpdate(row: any): LoveUpdate {
  let person: Person = "trupti";
  if (
    row.person === "abhinav" ||
    row.updated_by === ABHINAV_UUID ||
    (typeof row.message === "string" && row.message.startsWith("[abhinav]"))
  ) {
    person = "abhinav";
  } else if (row.person === "both") {
    person = "both";
  } else {
    person = "trupti";
  }

  let cleanMessage = row.message;

  if (typeof cleanMessage === "string") {
    cleanMessage = cleanMessage
      .replace(/^\[abhinav\]\s*/, "")
      .replace(/^\[trupti\]\s*/, "")
      .trim();
    if (!cleanMessage) cleanMessage = null;
  }

  return {
    id: row.id,
    percentage: Number(row.percentage),
    message: cleanMessage,
    created_at: row.created_at,
    updated_at: row.updated_at,
    updated_by: row.updated_by,
    person,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterPerson = searchParams.get("person") as Person | null;

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

    const parsed: LoveUpdate[] = (data || []).map(parseRowToLoveUpdate);

    const filtered = filterPerson
      ? parsed.filter((u) => u.person === filterPerson)
      : parsed;

    return NextResponse.json({
      success: true,
      data: filtered,
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
    const { percentage, message, person } = body;

    const targetPerson: Person = person === "abhinav" ? "abhinav" : "trupti";

    const rawNum = parseFloat(String(percentage));
    if (isNaN(rawNum) || rawNum < 0 || rawNum > 100) {
      return NextResponse.json(
        { success: false, error: "Percentage must be between 0 and 100." },
        { status: 400 }
      );
    }

    const val = Math.round(rawNum * 10) / 10;
    const rawCleanMessage =
      typeof message === "string" && message.trim() ? message.trim() : null;

    // Format message to preserve person tag in Supabase
    let dbMessage: string | null = rawCleanMessage;
    let targetUuid: string = TRUPTI_UUID;

    if (targetPerson === "abhinav") {
      dbMessage = rawCleanMessage ? `[abhinav] ${rawCleanMessage}` : "[abhinav]";
      targetUuid = ABHINAV_UUID;
    }

    const now = new Date();
    const nowIso = now.toISOString();

    const client = getSupabaseServerClient();

    // Look for today's entry specifically for this person in Supabase
    const { data: recentRows, error: fetchErr } = await client
      .from("love_updates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (fetchErr) {
      console.warn("Could not query recent updates:", fetchErr);
    }

    const todayEntry = (recentRows || []).find((row: any) => {
      const parsed = parseRowToLoveUpdate(row);
      return (
        parsed.person === targetPerson &&
        isSameCalendarDay(new Date(row.created_at), now)
      );
    });

    if (todayEntry?.id) {
      // Update today's existing row for this person
      let updatePayload: any = {
        percentage: val,
        message: dbMessage,
        updated_at: nowIso,
        updated_by: targetUuid,
        person: targetPerson,
      };

      let { data, error } = await client
        .from("love_updates")
        .update(updatePayload)
        .eq("id", todayEntry.id)
        .select()
        .single();

      // If column 'person' doesn't exist yet in Supabase, retry without it
      if (error && error.message?.includes("person")) {
        delete updatePayload.person;
        const retry = await client
          .from("love_updates")
          .update(updatePayload)
          .eq("id", todayEntry.id)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error("Failed to update today entry:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        update: parseRowToLoveUpdate(data),
        action: "updated",
      });
    } else {
      // Insert new row for today for this person
      let insertPayload: any = {
        percentage: val,
        message: dbMessage,
        created_at: nowIso,
        updated_at: nowIso,
        updated_by: targetUuid,
        person: targetPerson,
      };

      let { data, error } = await client
        .from("love_updates")
        .insert(insertPayload)
        .select()
        .single();

      // If column 'person' doesn't exist yet in Supabase, retry without it
      if (error && error.message?.includes("person")) {
        delete insertPayload.person;
        const retry = await client
          .from("love_updates")
          .insert(insertPayload)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error("Failed to insert today entry:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        update: parseRowToLoveUpdate(data),
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
