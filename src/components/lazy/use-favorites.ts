"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Client-only favorites store. Persisted to localStorage and shared across every
// component that calls useFavorites() (the sidebar groups, the favorites list)
// through a single external store so a heart toggle anywhere updates everywhere
// without prop drilling — and stays in sync across browser tabs.

const STORAGE_KEY = "lazyui-favorites";

let current: string[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}

// Read localStorage lazily on first subscribe/toggle — never during module eval
// (SSR has no localStorage) so the server snapshot stays empty and hydration
// matches before useSyncExternalStore swaps in the real client value.
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  current = readStorage();
}

function emit() {
  for (const listener of listeners) listener();
}

export function toggleFavorite(slug: string) {
  hydrate();
  // Newest-first so the favorites list reads as a recent-activity stack.
  current = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [slug, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage disabled or over quota — keep the in-memory state so the UI works
    // for this session even if it can't persist.
  }
  emit();
}

function subscribe(callback: () => void): () => void {
  hydrate();
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = readStorage();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): string[] {
  return current;
}

// Stable empty reference for SSR + the hydration pass.
const SERVER_SNAPSHOT: string[] = [];
function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

export function useFavorites() {
  const slugs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const set = useMemo(() => new Set(slugs), [slugs]);
  const isFavorite = useCallback((slug: string) => set.has(slug), [set]);
  return { slugs, isFavorite, toggle: toggleFavorite };
}
