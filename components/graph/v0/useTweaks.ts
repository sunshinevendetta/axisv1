"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tweaks } from "./types";

const STORAGE_KEY = "axis-graph-v0-tweaks";

export function useTweaks(defaults: Tweaks) {
  const [values, setValues] = useState<Tweaks>(defaults);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setValues({ ...defaults, ...(JSON.parse(raw) as Partial<Tweaks>) });
    } catch {
      // ignore — bad json or storage disabled
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTweak = useCallback(<K extends keyof Tweaks>(k: K | Partial<Tweaks>, v?: Tweaks[K]) => {
    setValues((prev) => {
      const edits = typeof k === "object" && k !== null ? k : ({ [k]: v } as Partial<Tweaks>);
      const next = { ...prev, ...edits };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { tweaks: values, setTweak };
}
