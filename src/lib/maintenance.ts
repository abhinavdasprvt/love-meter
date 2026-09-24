import { MaintenanceConfig, DEFAULT_MAINTENANCE_CONFIG } from "@/types";

const LOCAL_MAINTENANCE_KEY = "trupti_maintenance_config_v1";
const BYPASS_STORAGE_KEY = "trupti_maintenance_bypassed";

export function getLocalMaintenanceConfig(): MaintenanceConfig {
  if (typeof window === "undefined") {
    // If env var is set, honor it
    if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "false") {
      return { ...DEFAULT_MAINTENANCE_CONFIG, enabled: false };
    }
    return DEFAULT_MAINTENANCE_CONFIG;
  }

  try {
    const raw = localStorage.getItem(LOCAL_MAINTENANCE_KEY);
    if (!raw) {
      // Check env var override
      if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "false") {
        return { ...DEFAULT_MAINTENANCE_CONFIG, enabled: false };
      }
      return DEFAULT_MAINTENANCE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_MAINTENANCE_CONFIG, ...parsed };
  } catch (e) {
    console.warn("Failed to read maintenance config from localStorage:", e);
    return DEFAULT_MAINTENANCE_CONFIG;
  }
}

export function saveLocalMaintenanceConfig(config: MaintenanceConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_MAINTENANCE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save maintenance config to localStorage:", e);
  }
}

export async function fetchMaintenanceConfig(): Promise<MaintenanceConfig> {
  const local = getLocalMaintenanceConfig();

  if (typeof window === "undefined") {
    return local;
  }

  try {
    const res = await fetch("/api/maintenance", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.enabled === "boolean") {
        saveLocalMaintenanceConfig(data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch maintenance status from API, using local config:", err);
  }

  return local;
}

export async function updateMaintenanceConfig(
  updates: Partial<MaintenanceConfig>
): Promise<MaintenanceConfig> {
  const current = getLocalMaintenanceConfig();
  const nextConfig: MaintenanceConfig = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  saveLocalMaintenanceConfig(nextConfig);

  // Sync to server API
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextConfig),
      });
    } catch (e) {
      console.warn("Failed to sync maintenance config to server:", e);
    }
  }

  return nextConfig;
}

export function isMaintenanceBypassed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(BYPASS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setMaintenanceBypass(bypassed: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (bypassed) {
      sessionStorage.setItem(BYPASS_STORAGE_KEY, "true");
    } else {
      sessionStorage.removeItem(BYPASS_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Failed to set maintenance bypass:", e);
  }
}
