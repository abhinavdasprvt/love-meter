import { LoveUpdate, Person } from "@/types";
import { supabase, isSupabaseConfigured } from "./supabase";

const LOCAL_STORAGE_KEY = "love_meter_updates_v3";
const ABHINAV_UUID = "00000000-0000-0000-0000-000000000001";
const TRUPTI_UUID = "00000000-0000-0000-0000-000000000002";

// Realistic seed data baseline
const SEED_DATA: LoveUpdate[] = [
  {
    id: "seed-trupti-yesterday",
    percentage: 78,
    message: "You made my whole day brighter ✨",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    person: "trupti",
  },
  {
    id: "seed-abhinav-yesterday",
    percentage: 95,
    message: "You're my whole universe, Trupti 💙✨",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    person: "abhinav",
  },
];

function normalizeRow(row: any): LoveUpdate {
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

function getLocalData(): LoveUpdate[] {
  if (typeof window === "undefined") return SEED_DATA;
  try {
    const wasCleared =
      localStorage.getItem("trupti_history_cleared") === "true";
    if (wasCleared) return [];

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRow);
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

export function getTodayUpdate(
  updates: LoveUpdate[],
  person?: Person
): LoveUpdate | null {
  const today = new Date();
  const found = updates.find((u) => {
    const d = new Date(u.created_at);
    const matchesPerson = person ? u.person === person : true;
    return matchesPerson && isSameDay(d, today);
  });
  return found || null;
}

export async function fetchAllUpdates(person?: Person): Promise<LoveUpdate[]> {
  // 1. Try server API route first
  if (typeof window !== "undefined") {
    try {
      const url = person ? `/api/updates?person=${person}` : "/api/updates";
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const normalized = json.data.map(normalizeRow);
          // If a specific person was requested, replace only that person's records in cache
          // If all was requested, replace entire cache with server truth
          if (person) {
            const others = getLocalData().filter((u) => u.person !== person);
            saveLocalData([...normalized, ...others]);
          } else {
            saveLocalData(normalized);
          }
          return normalized;
        }
      }
    } catch (apiErr) {
      console.warn("Fetch /api/updates error, falling back:", apiErr);
    }
  }

  // 2. Direct Supabase client fallback
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("love_updates")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const normalized = data.map(normalizeRow);
        saveLocalData(normalized);
        return person
          ? normalized.filter((u) => u.person === person)
          : normalized;
      }
    } catch (e) {
      console.warn("Direct Supabase fetch exception, using local fallback:", e);
    }
  }

  const local = getLocalData().sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return person ? local.filter((u) => u.person === person) : local;
}

export async function fetchLatestUpdate(
  person: Person = "trupti"
): Promise<LoveUpdate | null> {
  const updates = await fetchAllUpdates(person);
  return updates.length > 0 ? updates[0] : null;
}

export async function fetchYesterdayUpdate(
  person: Person = "trupti"
): Promise<{
  percentage: number;
  message?: string | null;
  created_at?: string;
} | null> {
  const updates = await fetchAllUpdates(person);
  if (updates.length === 0) return null;

  const today = new Date();
  const hasToday = isSameDay(new Date(updates[0].created_at), today);

  if (hasToday && updates.length >= 2) {
    return {
      percentage: updates[1].percentage,
      message: updates[1].message,
      created_at: updates[1].created_at,
    };
  }

  return null;
}

export async function saveLoveUpdate(
  percentage: number,
  message?: string,
  person: Person = "trupti"
): Promise<{ success: boolean; update?: LoveUpdate; error?: string }> {
  // 1. Validation
  const rawNum = parseFloat(String(percentage));
  if (isNaN(rawNum) || rawNum < 0 || rawNum > 100) {
    return {
      success: false,
      error: "Percentage must be between 0 and 100.",
    };
  }

  const val = Math.round(rawNum * 10) / 10;
  const cleanMessage = message?.trim() ? message.trim() : null;
  const now = new Date().toISOString();

  if (typeof window !== "undefined") {
    localStorage.removeItem("trupti_history_cleared");
  }

  // 2. Primary: Server API route
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          percentage: val,
          message: cleanMessage,
          person,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.update) {
          const savedUpdate: LoveUpdate = normalizeRow(json.update);

          // Synchronize immediately to local storage cache
          const current = getLocalData();
          const today = new Date();
          const todayIndex = current.findIndex(
            (u) => u.person === person && isSameDay(new Date(u.created_at), today)
          );

          if (todayIndex >= 0) {
            current[todayIndex] = savedUpdate;
          } else {
            current.unshift(savedUpdate);
          }

          current.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          saveLocalData(current);
          return { success: true, update: savedUpdate };
        }
      }
    } catch (apiErr) {
      console.warn("POST /api/updates error, trying fallback:", apiErr);
    }
  }

  // 3. Fallback: Direct Supabase client
  if (isSupabaseConfigured && supabase) {
    try {
      const existingUpdates = await fetchAllUpdates(person);
      const todayEntry = getTodayUpdate(existingUpdates, person);
      const isUuid = (id?: string) =>
        Boolean(
          id &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              id
            )
        );

      let dbMsg = cleanMessage;
      let targetUuid = TRUPTI_UUID;
      if (person === "abhinav") {
        dbMsg = cleanMessage ? `[abhinav] ${cleanMessage}` : "[abhinav]";
        targetUuid = ABHINAV_UUID;
      }

      if (todayEntry && isUuid(todayEntry.id)) {
        const { data, error } = await supabase
          .from("love_updates")
          .update({
            percentage: val,
            message: dbMsg,
            updated_at: now,
            updated_by: targetUuid,
            person: person,
          })
          .eq("id", todayEntry.id)
          .select()
          .single();

        if (!error && data) {
          const saved = normalizeRow(data);
          const current = getLocalData();
          const idx = current.findIndex((u) => u.id === saved.id);
          if (idx >= 0) current[idx] = saved;
          else current.unshift(saved);
          saveLocalData(current);
          return { success: true, update: saved };
        }
      } else {
        const { data, error } = await supabase
          .from("love_updates")
          .insert({
            percentage: val,
            message: dbMsg,
            created_at: now,
            updated_at: now,
            updated_by: targetUuid,
            person: person,
          })
          .select()
          .single();

        if (!error && data) {
          const saved = normalizeRow(data);
          const current = getLocalData();
          current.unshift(saved);
          saveLocalData(current);
          return { success: true, update: saved };
        }
      }
    } catch (e: any) {
      console.warn("Direct Supabase save error:", e);
    }
  }

  // 4. Offline LocalStorage fallback
  try {
    const current = getLocalData();
    const today = new Date();
    const todayIndex = current.findIndex(
      (u) => u.person === person && isSameDay(new Date(u.created_at), today)
    );

    let updatedItem: LoveUpdate;

    if (todayIndex >= 0) {
      updatedItem = {
        ...current[todayIndex],
        percentage: val,
        message: cleanMessage,
        updated_at: now,
        person,
      };
      current[todayIndex] = updatedItem;
    } else {
      updatedItem = {
        id: "local-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        percentage: val,
        message: cleanMessage,
        created_at: now,
        updated_at: now,
        person,
      };
      current.unshift(updatedItem);
    }

    current.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
  // If it's a seed item
  if (id.startsWith("seed-")) {
    const current = getLocalData();
    saveLocalData(current.filter((u) => u.id !== id));
    return { success: true };
  }

  let serverErr: string | undefined;

  // 1. Try server admin delete endpoint
  try {
    const res = await fetch(`/api/admin/history?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      if (!data.success) {
        serverErr = data.error;
      }
    } else {
      serverErr = `Server error ${res.status}`;
    }
  } catch (e: any) {
    serverErr = e.message;
    console.warn("Server delete API error:", e);
  }

  // 2. Direct Supabase client fallback
  if (serverErr && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("love_updates")
        .delete()
        .eq("id", id)
        .select();
      if (!error && data && data.length > 0) {
        serverErr = undefined; // Succeeded via direct Supabase client
      }
    } catch (e) {
      console.warn("Direct Supabase delete fallback error:", e);
    }
  }

  // 3. Only update local cache if server or client deletion actually succeeded
  if (!serverErr) {
    try {
      const current = getLocalData();
      const filtered = current.filter((u) => u.id !== id);
      saveLocalData(filtered);
      if (filtered.length === 0 && typeof window !== "undefined") {
        localStorage.setItem("trupti_history_cleared", "true");
      }
    } catch (e) {
      console.warn("Local storage delete error:", e);
    }
    return { success: true };
  }

  return { success: false, error: serverErr };
}

export async function clearAllHistory(
  person?: Person
): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  let deletedCount = 0;

  try {
    const res = await fetch(
      `/api/admin/history?all=true${person ? `&person=${person}` : ""}`,
      {
        method: "DELETE",
      }
    );
    if (res.ok) {
      const json = await res.json();
      deletedCount = json.deletedCount || 0;
    }
  } catch (e) {
    console.warn("Server clear API call error:", e);
  }

  try {
    const local = getLocalData();
    const filtered = person ? local.filter((u) => u.person !== person) : [];
    deletedCount = deletedCount || local.length - filtered.length;
    saveLocalData(filtered);
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

  let streak = 0;
  const sorted = [...updates].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
