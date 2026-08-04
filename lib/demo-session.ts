import type { DemoUser } from "@/lib/demo";

const SESSION_KEY = "milmo-demo-session";

export function saveDemoSession(user: DemoUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getDemoSession(): DemoUser | null {
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as DemoUser;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearDemoSession() {
  window.localStorage.removeItem(SESSION_KEY);
}
