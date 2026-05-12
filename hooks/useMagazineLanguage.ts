"use client";

import { useEffect, useState } from "react";
import type { MagazineLang } from "@/src/types/magazine";

const STORAGE_KEY = "axis-magazine-lang";
const DEFAULT_LANG: MagazineLang = "en";

function isMagazineLang(value: string): value is MagazineLang {
  return value === "en" || value === "es" || value === "fr" || value === "de" || value === "ja" || value === "ru" || value === "zh";
}

function readStoredLanguage(): MagazineLang {
  if (typeof window === "undefined") {
    return DEFAULT_LANG;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && isMagazineLang(stored) ? stored : DEFAULT_LANG;
}

export function useMagazineLanguage() {
  const [lang, setLangState] = useState<MagazineLang>(DEFAULT_LANG);

  useEffect(() => {
    setLangState(readStoredLanguage());
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      setLangState(readStoredLanguage());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLang = (nextLang: MagazineLang) => {
    setLangState(nextLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLang);
    }
  };

  return { lang, setLang };
}
