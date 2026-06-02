"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useLayoutStore, type ModuleSize } from "./useLayoutStore";

interface ModuleRegistry {
  expandedId: string | null;
  expand: (id: string) => void;
  close: () => void;
  /** Open = body visible; default is closed (title-strip only). */
  isOpen: (id: string) => boolean;
  toggleOpen: (id: string) => void;
  setOpen: (id: string, value: boolean) => void;
  isExpanded: (id: string) => boolean;
  expandedRenderer: ((id: string) => ReactNode) | null;
  setExpandedRenderer: (id: string, renderDefault: () => ReactNode, renderExpanded?: () => ReactNode) => void;
  // Layout persistence
  getSize: (id: string) => ModuleSize | undefined;
  setSize: (id: string, size: ModuleSize | null) => void;
  // Reorder
  getColumnOrder: (columnId: string, registered: string[]) => string[];
  moveBefore: (columnId: string, sourceId: string, targetId: string) => void;
  setColumnOrder: (columnId: string, ids: string[]) => void;
  // Reset
  resetLayout: () => void;
  hydrated: boolean;
}

const ModuleCtx = createContext<ModuleRegistry | null>(null);

export function ModuleProvider({ children }: { children: ReactNode }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [renderers, setRenderers] = useState<Map<string, { def: () => ReactNode; ex?: () => ReactNode }>>(
    () => new Map(),
  );
  const layout = useLayoutStore();

  const expand = useCallback((id: string) => setExpandedId(id), []);
  const close = useCallback(() => setExpandedId(null), []);

  const toggleOpen = useCallback(
    (id: string) => {
      layout.setOpen(id, !layout.isOpen(id));
    },
    [layout],
  );

  const setExpandedRenderer = useCallback(
    (id: string, renderDefault: () => ReactNode, renderExpanded?: () => ReactNode) => {
      setRenderers((prev) => {
        const existing = prev.get(id);
        if (existing && existing.def === renderDefault && existing.ex === renderExpanded) return prev;
        const next = new Map(prev);
        next.set(id, { def: renderDefault, ex: renderExpanded });
        return next;
      });
    },
    [],
  );

  const expandedRenderer = useMemo(() => {
    if (!expandedId) return null;
    return (id: string) => {
      const pair = renderers.get(id);
      if (!pair) return null;
      return (pair.ex ?? pair.def)();
    };
  }, [expandedId, renderers]);

  const getColumnOrder = useCallback(
    (columnId: string, registered: string[]): string[] => {
      const stored = layout.getOrder(columnId);
      if (!stored) return registered;
      const known = new Set(stored);
      const kept = stored.filter((id) => registered.includes(id));
      const novel = registered.filter((id) => !known.has(id));
      return [...kept, ...novel];
    },
    [layout],
  );

  const value = useMemo<ModuleRegistry>(
    () => ({
      expandedId,
      expand,
      close,
      isOpen: layout.isOpen,
      toggleOpen,
      setOpen: layout.setOpen,
      isExpanded: (id) => expandedId === id,
      expandedRenderer,
      setExpandedRenderer,
      getSize: layout.getSize,
      setSize: layout.setSize,
      getColumnOrder,
      moveBefore: layout.moveBefore,
      setColumnOrder: layout.setOrder,
      resetLayout: layout.reset,
      hydrated: layout.hydrated,
    }),
    [expandedId, expand, close, toggleOpen, expandedRenderer, setExpandedRenderer, getColumnOrder, layout],
  );

  return <ModuleCtx.Provider value={value}>{children}</ModuleCtx.Provider>;
}

export function useModule() {
  const ctx = useContext(ModuleCtx);
  if (!ctx) throw new Error("useModule must be used inside <ModuleProvider>");
  return ctx;
}
