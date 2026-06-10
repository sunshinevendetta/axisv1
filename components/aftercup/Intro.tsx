"use client";

/**
 * Intro — friendly "how it works" on-ramp for the Aftercup on-site app.
 *
 * MOBILE-FIRST. Renders as a centered glass card / bottom-sheet that fits a
 * 390px screen. Plain-language copy (the rest of the app keeps its ops voice).
 *
 * API
 * ---
 *   import { Intro, IntroButton } from "./Intro";
 *
 * 1. Drop <Intro /> anywhere inside the shell. It self-manages its open state:
 *    - opens automatically on first visit (persisted via localStorage key
 *      `aftercup_intro_seen`)
 *    - renders its own small floating "?" help button so users can re-open it
 *      any time. That's the whole integration — no props required.
 *
 *      <Intro />
 *
 * 2. If you want to trigger it from your OWN button (e.g. a header link),
 *    pass `open` + `onClose` and hide the built-in button with
 *    `showButton={false}`:
 *
 *      const [help, setHelp] = useState(false);
 *      <Intro open={help} onClose={() => setHelp(false)} showButton={false} />
 *      <IntroButton onClick={() => setHelp(true)} />
 */

import { useEffect, useState } from "react";
import { useSiteLanguage } from "@/components/site-language";
import { Brackets } from "./Hud";

const SEEN_KEY = "aftercup_intro_seen";

type Step = {
  no: string;
  glyph: string;
  en: { head: string; body: string };
  es: { head: string; body: string };
};

const STEPS: Step[] = [
  {
    no: "01",
    glyph: "◈",
    en: { head: "EXPLORE", body: "Walk the venue and find the spots on your map." },
    es: { head: "EXPLORA", body: "Recorre la sede y encuentra los puntos en tu mapa." },
  },
  {
    no: "02",
    glyph: "◇",
    en: { head: "JOIN IN", body: "Take part in what's happening at each spot." },
    es: { head: "PARTICIPA", body: "Únete a lo que está pasando en cada punto." },
  },
  {
    no: "03",
    glyph: "✦",
    en: { head: "WIN", body: "Earn points, collect medals, and unlock prizes." },
    es: { head: "GANA", body: "Gana puntos, colecciona medallas y obtén premios." },
  },
];

const RANKS = ["FAN", "EXPLORER", "EXPERT", "LEGEND"];

/** Small on-brand "HOW IT WORKS" floating button. Exported so it can be
 *  mounted independently (e.g. inside a header) and wired to your own open. */
export function IntroButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  const { language } = useSiteLanguage();
  const label = language === "es" ? "CÓMO FUNCIONA" : "HOW IT WORKS";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pdq-intro-fab ${className}`}
      aria-label={label}
    >
      <span className="pdq-intro-fab-q" aria-hidden>
        ?
      </span>
      <span className="pdq-intro-fab-label">{label}</span>
    </button>
  );
}

export function Intro({
  open: controlledOpen,
  onClose,
  showButton = true,
}: {
  /** Controlled open state. Omit to let the component self-manage. */
  open?: boolean;
  /** Called when the user dismisses. Required if you pass `open`. */
  onClose?: () => void;
  /** Render the built-in floating help button. Default true. */
  showButton?: boolean;
} = {}) {
  const { language } = useSiteLanguage();
  const es = language === "es";

  const isControlled = controlledOpen !== undefined;
  const [selfOpen, setSelfOpen] = useState(false);

  // First-visit auto-open (uncontrolled mode only). SSR-guarded.
  useEffect(() => {
    if (isControlled) return;
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (!seen) setSelfOpen(true);
  }, [isControlled]);

  const open = isControlled ? Boolean(controlledOpen) : selfOpen;

  // Lock body scroll while the sheet is open; restore on close/unmount.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage unavailable — dismissal just won't persist */
      }
    }
    if (isControlled) onClose?.();
    else setSelfOpen(false);
  };

  const reopen = () => {
    if (isControlled) return; // host owns open state
    setSelfOpen(true);
  };

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {showButton && !isControlled && <IntroButton onClick={reopen} />}

      {open && (
        <div
          className="pdq-intro-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={es ? "Cómo funciona Aftercup" : "How Aftercup works"}
          onClick={(e) => {
            if (e.target === e.currentTarget) dismiss();
          }}
        >
          <Brackets className="glass pdq-intro-card">
            <div className="pdq-intro-body">
              <div className="pdq-intro-head">
                <span className="pdq-eyebrow">
                  {es ? "AFTERCUP QUEST" : "AFTERCUP QUEST"}
                </span>
                <button
                  type="button"
                  className="pdq-intro-x"
                  onClick={dismiss}
                  aria-label={es ? "Cerrar" : "Close"}
                >
                  ✕
                </button>
              </div>

              <h2 className="pdq-display pdq-intro-title">
                {es ? "VIVE LA SEDE." : "PLAY THE VENUE."}
              </h2>

              <p className="pdq-intro-lede">
                {es
                  ? "Tu mapa en vivo. Explora, participa y gana puntos."
                  : "Your live map. Explore, join in, and earn points."}
              </p>

              <ol className="pdq-intro-steps">
                {STEPS.map((s) => {
                  const copy = es ? s.es : s.en;
                  return (
                    <li key={s.no} className="pdq-intro-step">
                      <div className="pdq-intro-step-mark" aria-hidden>
                        <span className="pdq-intro-step-glyph">{s.glyph}</span>
                        <span className="pdq-intro-step-no">{s.no}</span>
                      </div>
                      <div className="pdq-intro-step-text">
                        <div className="pdq-display-alt pdq-intro-step-head">
                          {copy.head}
                        </div>
                        <p className="pdq-intro-step-body">{copy.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="pdq-intro-ranks" aria-hidden>
                <span className="pdq-intro-ranks-label">
                  {es ? "RANGO" : "RANK"}
                </span>
                <div className="pdq-intro-ranks-track">
                  {RANKS.map((r, i) => (
                    <span key={r} className="pdq-intro-rank">
                      {r}
                      {i < RANKS.length - 1 && (
                        <span className="pdq-intro-rank-arrow">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="pdq-btn lg pdq-intro-go"
                onClick={dismiss}
              >
                {es ? "VAMOS" : "LET'S GO"}
              </button>
            </div>
          </Brackets>
        </div>
      )}
    </>
  );
}

export default Intro;
