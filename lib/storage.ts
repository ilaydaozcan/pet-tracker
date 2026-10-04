// A tiny helper for keeping a list in localStorage and reading it in React.
// pets.ts and records.ts both use it, so this logic lives in one place.

import { useSyncExternalStore } from "react";

export function readList<T>(key: string): T[] {
  const text = localStorage.getItem(key);
  return text ? JSON.parse(text) : [];
}

export function writeList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
  // The browser's "storage" event only fires in *other* tabs,
  // so we tell this tab's components ourselves.
  listeners.forEach((notify) => notify());
}

// --- Reading lists inside React components ---

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

// React needs the same object back each time if nothing changed,
// so we only re-parse when the saved text is different.
const cache = new Map<string, { text: string | null; list: unknown[] }>();

function getSnapshot<T>(key: string): T[] {
  const text = localStorage.getItem(key);
  const cached = cache.get(key);
  if (cached && cached.text === text) return cached.list as T[];
  const list = text ? JSON.parse(text) : [];
  cache.set(key, { text, list });
  return list;
}

// Returns null on the server (no localStorage there) and the list in the browser.
export function useStoredList<T>(key: string): T[] | null {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot<T>(key),
    () => null,
  );
}
