import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from "@/lib/supabase";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;


function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}


export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { success: false, error: "Admin client credentials not configured" },
        { status: 500 }
      );
    }

    if (clearAll) {
      // Delete all records
      const { data, error } = await adminClient
        .from("love_updates")
        .delete()
        .gte("percentage", 0)
        .select();

      if (error) {
        console.error("Supabase clear error:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        deletedCount: data?.length || 0,
        message: "All history cleared",
      });
    }

    if (id) {
      // Check if it's a seed or local id (e.g. seed-yesterday)
      if (id.startsWith("seed-")) {
        return NextResponse.json({
          success: true,
          message: "Seed item deleted locally",
        });
      }

      // Delete specific record in Supabase
      const { data, error } = await adminClient
        .from("love_updates")
        .delete()
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase delete error:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        deleted: data,
        message: "Entry deleted successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Missing id or all parameter" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Delete API handler exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process delete request" },
      { status: 500 }
    );
  }
}
