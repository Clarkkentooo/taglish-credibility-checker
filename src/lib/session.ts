export type SessionMode = "user" | "demo";

export const DEMO_EMAIL = "demo@tsek.local";
export const DEMO_PASSWORD = "demo123";
export const SESSION_MODE_KEY = "tsek_session_mode";

export function isDemoCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export function getSessionMode(): SessionMode {
  if (typeof window === "undefined") return "user";
  return window.localStorage.getItem(SESSION_MODE_KEY) === "demo" ? "demo" : "user";
}

export function setSessionMode(mode: SessionMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_MODE_KEY, mode);
}

export function isDemoMode() {
  return getSessionMode() === "demo";
}
