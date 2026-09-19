import { LoveUpdate } from "@/types";
import { supabase, isSupabaseConfigured } from "./supabase";

const LOCAL_STORAGE_KEY = "trupti_love_updates_v2";

// Default seed data with realistic decimal percentages starting with Yesterday: 78%
const SEED_DATA: LoveUpdate[] = [
  {
    id: "seed-yesterday",
    percentage: 78,
    message: "You made my whole day brighter ✨",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-2days",
    percentage: 74.5,
    message: "Loved listening to your playlist together 🎧",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function getLocalData(): LoveUpdate[] {
  if (typeof window === "undefined") return SEED_DATA;
  try {
    const wasCleared = localStorage.getItem("trupti_history_cleared") === "true";
    if (wasCleared) return [];

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Error reading local storage updates:", e);
    return [];
  }
}

function saveLocalData(updates: LoveUpdate[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updates));
  } catch (e) {
    console.error("Error saving local storage updates:", e);
  }
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getTodayUpdate(updates: LoveUpdate[]): LoveUpdate | null {
  const today = new Date();
  const found = updates.find((u) => {
    const d = new Date(u.created_at);
    return isSameDay(d, today);
  });
  return found || null;
}

export async function fetchAllUpdates(): Promise<LoveUpdate[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("love_updates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetch failed, falling back to local:", error);
        return getLocalData();
      }

      if (Array.isArray(data)) {
        if (data.length > 0) {
          saveLocalData(data as LoveUpdate[]);
          return data as LoveUpdate[];
        } else {
          // Table in Supabase is empty (e.g. cleared by admin or freshly deleted)
          const wasCleared = typeof window !== "undefined" && localStorage.getItem("trupti_history_cleared") === "true";
          const localRaw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
          if (wasCleared || localRaw !== null) {
            saveLocalData([]);
            return [];
          }
          return SEED_DATA;
        }
      }
    } catch (e) {
      console.warn("Supabase fetch exception, using local fallback:", e);
      return getLocalData();
    }
  }

  return getLocalData().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function fetchLatestUpdate(): Promise<LoveUpdate | null> {
  const updates = await fetchAllUpdates();
  return updates.length > 0 ? updates[0] : null;
}

export async function fetchYesterdayUpdate(): Promise<{
  percentage: number;
  message?: string | null;
  created_at?: string;
} | null> {
  const updates = await fetchAllUpdates();
  if (updates.length >= 2) {
    return {
      percentage: updates[1].percentage,
      message: updates[1].message,
      created_at: updates[1].created_at,
    };
  } else if (updates.length === 1) {
    const wasCleared = typeof window !== "undefined" && localStorage.getItem("trupti_history_cleared") === "true";
    if (wasCleared) return null;
    return {
      percentage: 78,
      message: null,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  const wasCleared = typeof window !== "undefined" && localStorage.getItem("trupti_history_cleared") === "true";
  if (wasCleared) return null;

  return {
    percentage: 78,
    message: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function saveLoveUpdate(
  percentage: number,
  message?: string
): Promise<{ success: boolean; update?: LoveUpdate; error?: string }> {
  // 1. Validation - supports decimals (e.g. 78.5)
  const rawNum = parseFloat(String(percentage));
  if (isNaN(rawNum) || rawNum < 0 || rawNum > 100) {
    return {
      success: false,
      error: "Percentage must be between 0 and 100.",
    };
  }

  // Round cleanly to 1 decimal place max (e.g. 85.5)
  const val = Math.round(rawNum * 10) / 10;
  const cleanMessage = message?.trim() ? message.trim() : null;
  const now = new Date().toISOString();

  if (typeof window !== "undefined") {
    localStorage.removeItem("trupti_history_cleared");
  }

  // 2. If Supabase is active
  if (isSupabaseConfigured && supabase) {
    try {
      const existingUpdates = await fetchAllUpdates();
      const todayEntry = getTodayUpdate(existingUpdates);

      if (todayEntry) {
        const { data, error } = await supabase
          .from("love_updates")
          .update({
            percentage: val,
            message: cleanMessage,
            updated_at: now,
          })
          .eq("id", todayEntry.id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, update: data as LoveUpdate };
      } else {
        const { data, error } = await supabase
          .from("love_updates")
          .insert({
            percentage: val,
            message: cleanMessage,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, update: data as LoveUpdate };
      }
    } catch (e: any) {
      console.warn("Supabase save error, writing to local fallback:", e);
    }
  }

  // 3. LocalStorage persistence
  try {
    const current = getLocalData();
    const today = new Date();
    const todayIndex = current.findIndex((u) => isSameDay(new Date(u.created_at), today));

    let updatedItem: LoveUpdate;

    if (todayIndex >= 0) {
      updatedItem = {
        ...current[todayIndex],
        percentage: val,
        message: cleanMessage,
        updated_at: now,
      };
      current[todayIndex] = updatedItem;
    } else {
      updatedItem = {
        id: "local-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        percentage: val,
        message: cleanMessage,
        created_at: now,
        updated_at: now,
      };
      current.unshift(updatedItem);
    }

    current.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    saveLocalData(current);
    return { success: true, update: updatedItem };
  } catch (e: any) {
    return {
      success: false,
      error: "Couldn't save this one. Please try again.",
    };
  }
}

// ─── Admin Operations ───────────────────────────────────────────────

export async function deleteSingleUpdate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Delete in Supabase via server API (service role bypasses RLS)
  try {
    const res = await fetch(`/api/admin/history?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.warn("Server API delete returned status:", res.status);
    }
  } catch (e) {
    console.warn("Server delete API call error:", e);
  }

  // 2. Delete locally in storage cache
  try {
    const current = getLocalData();
    const filtered = current.filter((u) => u.id !== id);
    saveLocalData(filtered);
    if (filtered.length === 0 && typeof window !== "undefined") {
      localStorage.setItem("trupti_history_cleared", "true");
    }
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete this entry." };
  }
}

export async function clearAllHistory(): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  let deletedCount = 0;

  // 1. Delete all in Supabase via server API (service role bypasses RLS)
  try {
    const res = await fetch("/api/admin/history?all=true", {
      method: "DELETE",
    });
    if (res.ok) {
      const json = await res.json();
      deletedCount = json.deletedCount || 0;
    }
  } catch (e) {
    console.warn("Server clear API call error:", e);
  }

  // 2. Clear locally
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("trupti_history_cleared", "true");
    }
    const local = getLocalData();
    if (deletedCount === 0) deletedCount = local.length;
    saveLocalData([]);
    return { success: true, deletedCount };
  } catch {
    return { success: false, deletedCount: 0, error: "Could not clear history." };
  }
}

export function getHistoryStats(updates: LoveUpdate[]): {
  total: number;
  average: number;
  highest: { value: number; date: string } | null;
  lowest: { value: number; date: string } | null;
  streak: number;
} {
  if (updates.length === 0) {
    return { total: 0, average: 0, highest: null, lowest: null, streak: 0 };
  }

  const total = updates.length;
  const avg = updates.reduce((s, u) => s + u.percentage, 0) / total;
  const average = Math.round(avg * 10) / 10;

  let highest = updates[0];
  let lowest = updates[0];
  for (const u of updates) {
    if (u.percentage > highest.percentage) highest = u;
    if (u.percentage < lowest.percentage) lowest = u;
  }

  // Calculate streak — consecutive days with entries (from today backwards)
  let streak = 0;
  const sorted = [...updates].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const today = new Date();
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const entryDate = new Date(sorted[i].created_at);
    if (isSameDay(entryDate, expected)) {
      streak++;
    } else {
      break;
    }
  }

  return {
    total,
    average,
    highest: { value: highest.percentage, date: highest.created_at },
    lowest: { value: lowest.percentage, date: lowest.created_at },
    streak,
  };
}
