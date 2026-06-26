"use client";

import { useEffect, useState } from "react";
import type { User } from "@shared";

const TOKEN_KEY = "aqas_token";
const USER_KEY = "aqas_user";

export function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("aqas-auth"));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("aqas-auth"));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

/** Reactive auth state for client components (and the sidebar). */
export function useAuth() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sync = () => {
      setUser(getUser());
      setReady(true);
    };
    sync();
    window.addEventListener("aqas-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("aqas-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready, isAuthed: !!user };
}
