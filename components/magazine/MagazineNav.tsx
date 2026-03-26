"use client";

import { MAGAZINE_CATEGORIES, CATEGORY_MAP, LANG_FLAGS, type MagazineLang } from "./types";

type Props = {
  active: string | null;
  onChange: (category: string | null) => void;
  onMixtapes?: () => void;
  lang: MagazineLang;
  onLangChange: (lang: MagazineLang) => void;
};

const ISSUE_LABEL = "Issue 04 · March 2026";

export default function MagazineNav({ active, onChange, onMixtapes, lang, onLangChange }: Props) {
  return (
    <nav className="sticky z-30 border-b border-white/8 bg-black" style={{ top: "calc(var(--ticker-top, 56px) + 32px)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        {/* Sections — horizontally scrollable */}
        <div className="scrollbar-none flex flex-1 overflow-x-auto">
          {MAGAZINE_CATEGORIES.map((section) => {
            const cat = CATEGORY_MAP[section];
            const isMixtape = section === "MIXTAPES";
            const isActive = isMixtape
              ? false
              : cat === null
              ? active === null
              : active === cat;

            return (
              <button
                key={section}
                onClick={() => {
                  if (isMixtape) onMixtapes?.();
                  else onChange(cat);
                }}
                className={`relative flex-none px-4 py-3.5 text-[9px] uppercase tracking-[0.38em] transition-colors duration-200 sm:px-5 sm:py-4 ${
                  isActive
                    ? "text-white"
                    : isMixtape
                    ? "text-white/34 hover:text-white/65"
                    : "text-white/24 hover:text-white/52"
                }`}
              >
                {section}
                {isMixtape && (
                  <span className="ml-1.5 text-[7px] text-white/20">↗</span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-px bg-white/50 sm:left-5 sm:right-5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right — lang picker + issue */}
        <div className="hidden flex-none items-center gap-0 border-l border-white/8 lg:flex">
          {/* Language flags */}
          <div className="flex items-center border-r border-white/8 px-3 py-3.5">
            {(Object.entries(LANG_FLAGS) as [MagazineLang, { flag: string; label: string }][]).map(
              ([code, { flag, label }]) => (
                <button
                  key={code}
                  onClick={() => onLangChange(code)}
                  title={label}
                  className={`px-1.5 text-sm leading-none transition-opacity duration-150 ${
                    lang === code ? "opacity-100" : "opacity-25 hover:opacity-60"
                  }`}
                >
                  {flag}
                </button>
              )
            )}
          </div>
          <span className="px-5 text-[8px] uppercase tracking-[0.38em] text-white/20">
            {ISSUE_LABEL}
          </span>
        </div>
      </div>
    </nav>
  );
}
