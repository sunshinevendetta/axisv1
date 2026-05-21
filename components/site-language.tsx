"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SiteLanguage = "en" | "es";

const STORAGE_KEY = "axis:site-language";

const SiteLanguageContext = createContext<{
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
} | null>(null);

function readStoredLanguage(): SiteLanguage {
  if (typeof window === "undefined") return "en";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "es" ? "es" : "en";
}

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>("en");

  useEffect(() => {
    const next = readStoredLanguage();
    setLanguageState(next);
    document.documentElement.lang = next;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageState,
    }),
    [language],
  );

  return <SiteLanguageContext.Provider value={value}>{children}</SiteLanguageContext.Provider>;
}

export function useSiteLanguage() {
  const context = useContext(SiteLanguageContext);
  if (!context) {
    return {
      language: "en" as SiteLanguage,
      setLanguage: () => {},
    };
  }
  return context;
}

export function LanguageSwitch() {
  const { language, setLanguage } = useSiteLanguage();
  const nextLanguage = language === "en" ? "es" : "en";

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={language === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 9999,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(0,0,0,0.72)",
        color: "white",
        borderRadius: 999,
        padding: "8px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        backdropFilter: "blur(12px)",
      }}
    >
      <span className="sr-only">{language === "en" ? "English" : "Español"}</span>
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: language === "en" ? "0 0 0 2px rgba(255,255,255,0.6)" : "none",
          opacity: language === "en" ? 1 : 0.45,
        }}
      >
        <Image src="/flags/us.svg" alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
      </span>
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: language === "es" ? "0 0 0 2px rgba(255,255,255,0.6)" : "none",
          opacity: language === "es" ? 1 : 0.45,
        }}
      >
        <Image src="/flags/mx.svg" alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
      </span>
    </button>
  );
}
