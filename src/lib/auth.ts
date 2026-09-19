export type AuthRole = "trupti" | "admin" | null;

const DEFAULT_TRUPTI_PIN = "1603";
const DEFAULT_ADMIN_PIN = "0609";
const AUTH_STORAGE_KEY = "trupti_authenticated_session";

function getTruptiPin(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_TRUPTI_PIN) {
    return process.env.NEXT_PUBLIC_TRUPTI_PIN.trim();
  }
  return DEFAULT_TRUPTI_PIN;
}

function getAdminPin(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ADMIN_PIN) {
    return process.env.NEXT_PUBLIC_ADMIN_PIN.trim();
  }
  return DEFAULT_ADMIN_PIN;
}

/** Check which role a PIN corresponds to. Returns null if invalid. */
export function checkPin(enteredPin: string): AuthRole {
  const pin = enteredPin.trim();
  if (pin === getTruptiPin()) return "trupti";
  if (pin === getAdminPin()) return "admin";
  return null;
}

export function getAuthenticatedRole(): AuthRole {
  if (typeof window === "undefined") return null;
  try {
    const session = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!session) return null;
    const parsed = JSON.parse(session);
    // Session expires after 4 hours
    if (Date.now() - parsed.timestamp > 4 * 60 * 60 * 1000) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed.role || null;
  } catch {
    return null;
  }
}

export function isUserAuthenticated(): boolean {
  return getAuthenticatedRole() !== null;
}

export function isAdminAuthenticated(): boolean {
  return getAuthenticatedRole() === "admin";
}

export function setAuthenticatedSession(role: AuthRole): void {
  if (typeof window === "undefined" || !role) return;
  try {
    sessionStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        role,
        authenticated: true,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.error("Failed to set auth session", e);
  }
}

export function clearAuthenticatedSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear auth session", e);
  }
}
