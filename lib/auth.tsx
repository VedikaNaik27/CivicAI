"use client";

import { DemoUser } from "@/types";
import { createContext, useContext, useSyncExternalStore } from "react";

// Simple DEMO authentication. No passwords are actually checked — this is
// a clearly-labeled demo auth system for a datathon MVP, not a production
// identity provider. See README "Demo Accounts".
export const DEMO_USERS: DemoUser[] = [
  { email: "admin@civicai.demo", role: "admin", name: "Anita Rao (Admin)" },
  { email: "roads@civicai.demo", role: "department", name: "Road Maintenance Staff", departmentId: "dept-road" },
  { email: "lighting@civicai.demo", role: "department", name: "Street Lighting Staff", departmentId: "dept-light" },
  { email: "waste@civicai.demo", role: "department", name: "Waste Management Staff", departmentId: "dept-waste" },
  { email: "drainage@civicai.demo", role: "department", name: "Drainage Staff", departmentId: "dept-drain" },
  { email: "citizen@civicai.demo", role: "citizen", name: "Demo Citizen" },
];

const STORAGE_KEY = "civicai_demo_user";

// A tiny external store so the current demo user can be read via
// useSyncExternalStore — the React-recommended way to synchronize with
// localStorage without triggering "setState in effect" cascades.
type Listener = () => void;
const listeners = new Set<Listener>();
let cachedUser: DemoUser = DEMO_USERS[0];
let initialized = false;

function readFromStorage(): DemoUser {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : DEMO_USERS[0];
  } catch {
    return DEMO_USERS[0];
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): DemoUser {
  if (!initialized) {
    cachedUser = readFromStorage();
    initialized = true;
  }
  return cachedUser;
}

function getServerSnapshot(): DemoUser {
  return DEMO_USERS[0];
}

function setUser(user: DemoUser) {
  cachedUser = user;
  initialized = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

interface AuthContextValue {
  user: DemoUser;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = (email: string) => {
    const found = DEMO_USERS.find((u) => u.email === email) ?? DEMO_USERS[0];
    setUser(found);
  };

  const logout = () => setUser(DEMO_USERS[0]);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: DEMO_USERS[0], login: () => {}, logout: () => {} };
  return ctx;
}
