"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "axis-graph-v0-layout-v3";
const VERSION = 3;

export interface ModuleSize {
  h?: number;
  w?: number;
}

export interface LayoutState {
  version: number;
  /** Modules the user has explicitly CLOSED. Default state is open. */
  closed: string[];
  sizes: Record<string, ModuleSize>;
  /** Per-column display order. Keys are column ids ("left" | "right" | …). */
  order: Record<string, string[]>;
}

const emptyState = (): LayoutState => ({ version: VERSION, closed: [], sizes: {}, order: {} });

function readStorage(): LayoutState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<LayoutState>;
    if (!parsed || parsed.version !== VERSION) return emptyState();
    return {
      version: VERSION,
      closed: Array.isArray(parsed.closed) ? parsed.closed.filter((s) => typeof s === "string") : [],
      sizes:
        parsed.sizes && typeof parsed.sizes === "object" ? (parsed.sizes as Record<string, ModuleSize>) : {},
      order:
        parsed.order && typeof parsed.order === "object"
          ? (parsed.order as Record<string, string[]>)
          : {},
    };
  } catch {
    return emptyState();
  }
}

function writeStorage(state: LayoutState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export interface LayoutStore {
  hydrated: boolean;
  state: LayoutState;
  getSize: (id: string) => ModuleSize | undefined;
  setSize: (id: string, size: ModuleSize | null) => void;
  isOpen: (id: string) => boolean;
  setOpen: (id: string, value: boolean) => void;
  getOrder: (columnId: string) => string[] | undefined;
  setOrder: (columnId: string, ids: string[]) => void;
  moveBefore: (columnId: string, sourceId: string, targetId: string) => void;
  reset: () => void;
}

/**
 * SSR-safe layout store backed by localStorage key `axis-graph-v0-layout-v3`.
 *
 * Convention: default state is fully open. The store tracks which modules
 * the user has explicitly closed, plus per-module heights/widths and the
 * per-column drag-reorder.
 */
export function useLayoutStore(): LayoutStore {
  const [state, setState] = useState<LayoutState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(state);
  }, [state, hydrated]);

  const getSize = useCallback(
    (id: string): ModuleSize | undefined => state.sizes[id],
    [state.sizes],
  );

  const setSize = useCallback((id: string, size: ModuleSize | null) => {
    setState((prev) => {
      const sizes = { ...prev.sizes };
      if (size === null) {
        if (!(id in sizes)) return prev;
        delete sizes[id];
      } else {
        sizes[id] = { ...sizes[id], ...size };
      }
      return { ...prev, sizes };
    });
  }, []);

  const isOpen = useCallback(
    (id: string): boolean => !state.closed.includes(id),
    [state.closed],
  );

  const setOpen = useCallback((id: string, value: boolean) => {
    setState((prev) => {
      const isClosed = prev.closed.includes(id);
      if (value && isClosed) return { ...prev, closed: prev.closed.filter((x) => x !== id) };
      if (!value && !isClosed) return { ...prev, closed: [...prev.closed, id] };
      return prev;
    });
  }, []);

  const getOrder = useCallback(
    (columnId: string): string[] | undefined => state.order[columnId],
    [state.order],
  );

  const setOrder = useCallback((columnId: string, ids: string[]) => {
    setState((prev) => ({ ...prev, order: { ...prev.order, [columnId]: ids } }));
  }, []);

  const moveBefore = useCallback((columnId: string, sourceId: string, targetId: string) => {
    setState((prev) => {
      const current = prev.order[columnId];
      if (!current || sourceId === targetId) return prev;
      const without = current.filter((x) => x !== sourceId);
      const targetIdx = without.indexOf(targetId);
      if (targetIdx === -1) return prev;
      const next = [...without.slice(0, targetIdx), sourceId, ...without.slice(targetIdx)];
      return { ...prev, order: { ...prev.order, [columnId]: next } };
    });
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    setState(emptyState());
  }, []);

  return { hydrated, state, getSize, setSize, isOpen, setOpen, getOrder, setOrder, moveBefore, reset };
}
