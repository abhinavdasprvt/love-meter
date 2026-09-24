import { NextRequest, NextResponse } from "next/server";
import { MaintenanceConfig, DEFAULT_MAINTENANCE_CONFIG } from "@/types";

// In-memory server cache (disabled by default, managed via /admin)
let serverMaintenanceConfig: MaintenanceConfig = {
  ...DEFAULT_MAINTENANCE_CONFIG,
  enabled: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true",
};

export async function GET() {
  return NextResponse.json(serverMaintenanceConfig, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    serverMaintenanceConfig = {
      ...serverMaintenanceConfig,
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, config: serverMaintenanceConfig },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update maintenance config" },
      { status: 500 }
    );
  }
}
