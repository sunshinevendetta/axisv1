"use client";

const SECTIONS = [
  "ALL",
  "INTERVIEWS",
  "NEWS",
  "ESSAYS",
  "CULTURE",
  "TECHNOLOGY",
  "EVENTS",
  "MIXTAPES",
] as const;

// Map display label → category key used in article data
const SECTION_TO_CATEGORY: Record<string, string | null> = {
  ALL:        null,
  INTERVIEWS: "INTERVIEW",
  NEWS:       "NEWS",
  ESSAYS:     "ESSAY",
  CULTURE:    "CULTURE",
  TECHNOLOGY: "TECHNOLOGY",
  EVENTS:     "EVENT",
  MIXTAPES:   null, // handled separately as link
};

type Props = {
  active: string | null;
  onChange: (category: string | null) => void;
  onMixtapes?: () => void;
};

const ISSUE_LABEL = "Issue 04 · March 2026";

export default function MagazineNav({ active, onChange, onMixtapes }: Props) {
  return (
    <nav className="sticky z-30 border-b border-white/8 bg-black" style={{ top: "calc(var(--ticker-top, 56px) + 32px)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        {/* Sections — horizontally scrollable on mobile */}
        <div className="scrollbar-none flex overflow-x-auto">
          {SECTIONS.map((section) => {
            const cat = SECTION_TO_CATEGORY[section];
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
                  if (isMixtape) {
                    onMixtapes?.();
                  } else {
                    onChange(cat);
                  }
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
                {/* Active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-px bg-white/50 sm:left-5 sm:right-5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Issue info — desktop only */}
        <div className="hidden flex-none border-l border-white/8 px-5 py-3.5 lg:flex">
          <span className="text-[8px] uppercase tracking-[0.38em] text-white/20">
            {ISSUE_LABEL}
          </span>
        </div>
      </div>
    </nav>
  );
}
