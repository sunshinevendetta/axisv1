"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SiteLanguage = "en" | "es";

const STORAGE_KEY = "axis:site-language";

const SiteLanguageContext = createContext<{
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
} | null>(null);

function normalizeLanguage(value: string | null, fallback: SiteLanguage = "en"): SiteLanguage {
  return value === "es" || value === "en" ? value : fallback;
}

function readStoredLanguage(fallback: SiteLanguage): SiteLanguage {
  if (typeof window === "undefined") return fallback;
  return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY), fallback);
}

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const defaultLanguage: SiteLanguage = "en";
  const [language, setLanguageState] = useState<SiteLanguage>("en");

  useEffect(() => {
    const stored = readStoredLanguage(defaultLanguage);
    const next = stored;
    setLanguageState(next);
    document.documentElement.lang = next;
  }, [defaultLanguage]);

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
  const languages: Array<{
    code: SiteLanguage;
    flag: string;
    label: string;
  }> = [
    { code: "en", flag: "/flags/us.svg", label: "English" },
    { code: "es", flag: "/flags/mx.svg", label: "Spanish" },
  ];

  return (
    <div
      role="group"
      aria-label="Select language"
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
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLanguage(item.code)}
          aria-label={`Select ${item.label}`}
          aria-pressed={language === item.code}
          style={{
            appearance: "none",
            border: 0,
            background: "transparent",
            padding: 0,
            width: 22,
            height: 22,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: language === item.code ? "0 0 0 2px rgba(255,255,255,0.6)" : "none",
            opacity: language === item.code ? 1 : 0.45,
            cursor: language === item.code ? "default" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image src={item.flag} alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
        </button>
      ))}
    </div>
  );
}
