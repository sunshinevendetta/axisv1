"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  useSiteLanguage,
  type SiteLanguage,
} from "@/components/site-language";

const BREAKPOINT = 820;

gsap.registerPlugin(useGSAP);

const LANGUAGES: Array<{
  code: SiteLanguage;
  short: string;
  name: string;
  detail: string;
}> = [
  {
    code: "en",
    short: "EN",
    name: "English",
    detail: "View the presentation in English",
  },
  {
    code: "es",
    short: "ES",
    name: "Español",
    detail: "Ver la presentación en español",
  },
  {
    code: "zh",
    short: "中文",
    name: "简体中文",
    detail: "以简体中文查看演示文稿",
  },
];

export default function FutureRenaissanceDeck() {
  const { language, setLanguage } = useSiteLanguage();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRootRef = useRef<HTMLDivElement>(null);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const languageModalRef = useRef<HTMLDivElement>(null);
  const languagePanelRef = useRef<HTMLDivElement>(null);
  const firstLanguageRef = useRef<HTMLButtonElement>(null);
  const languageTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const wasLanguageOpenRef = useRef(false);

  const normalizedLanguage = language === "zh-Hant" ? "zh" : language;
  const activeLanguage =
    LANGUAGES.find((item) => item.code === normalizedLanguage) ?? LANGUAGES[0];

  const syncDeckLanguage = useCallback(() => {
    if (typeof window === "undefined") return;

    document
      .querySelectorAll<HTMLIFrameElement>('iframe[data-future-renaissance-deck="true"]')
      .forEach((iframe) => {
        iframe.contentWindow?.postMessage(
          {
            type: "axis:language",
            language,
          },
          window.location.origin,
        );
      });
  }, [language]);

  useEffect(() => {
    syncDeckLanguage();
  }, [syncDeckLanguage]);

  useGSAP(
    () => {
      const modal = languageModalRef.current;
      const panel = languagePanelRef.current;
      if (!modal || !panel) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const optionRows = panel.querySelectorAll("[data-language-option]");

      gsap.set(modal, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(panel, {
        scale: reduceMotion ? 1 : 0.18,
        xPercent: reduceMotion ? 0 : 24,
        y: reduceMotion ? 0 : -36,
        transformOrigin: "top right",
      });
      gsap.set(optionRows, { autoAlpha: 0, y: reduceMotion ? 0 : 28 });

      languageTimelineRef.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power3.out" },
          onStart: () => {
            gsap.set(modal, { pointerEvents: "auto" });
          },
          onReverseComplete: () => {
            gsap.set(modal, { pointerEvents: "none" });
          },
        })
        .to(modal, {
          autoAlpha: 1,
          duration: reduceMotion ? 0.01 : 0.24,
        })
        .to(
          panel,
          {
            scale: 1,
            xPercent: 0,
            y: 0,
            duration: reduceMotion ? 0.01 : 0.52,
          },
          0,
        )
        .to(
          optionRows,
          {
            autoAlpha: 1,
            y: 0,
            stagger: reduceMotion ? 0 : 0.055,
            duration: reduceMotion ? 0.01 : 0.34,
          },
          reduceMotion ? 0 : 0.16,
        );

      return () => {
        languageTimelineRef.current = null;
      };
    },
    { scope: languageRootRef },
  );

  useEffect(() => {
    const timeline = languageTimelineRef.current;
    if (!timeline) return;

    if (isLanguageOpen) {
      timeline.play(0);
      const frame = window.requestAnimationFrame(() => firstLanguageRef.current?.focus());
      wasLanguageOpenRef.current = true;
      return () => window.cancelAnimationFrame(frame);
    }

    timeline.reverse();
    if (wasLanguageOpenRef.current) {
      languageTriggerRef.current?.focus();
      wasLanguageOpenRef.current = false;
    }
  }, [isLanguageOpen]);

  const selectLanguage = (nextLanguage: SiteLanguage) => {
    setLanguage(nextLanguage);
    setIsLanguageOpen(false);
  };

  const handleLanguageKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsLanguageOpen(false);
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <style>{`
        .future-deck-desktop,
        .future-deck-mobile {
          position: fixed;
          inset: 0;
        }

        .future-deck-mobile {
          display: none;
        }

        .future-language {
          position: fixed;
          inset: 0;
          z-index: 10000;
          pointer-events: none;
          font-family: var(--font-body), Bingo, sans-serif;
        }

        .future-language-trigger {
          position: absolute;
          top: max(14px, env(safe-area-inset-top));
          right: max(14px, env(safe-area-inset-right));
          width: 116px;
          height: 62px;
          padding: 11px 15px 10px 25px;
          border: 0;
          border-top: 1px solid rgba(212, 170, 103, 0.72);
          border-right: 1px solid rgba(212, 170, 103, 0.72);
          background:
            linear-gradient(135deg, transparent 0 17px, rgba(4, 27, 51, 0.9) 18px),
            rgba(4, 27, 51, 0.82);
          color: #f1e2c8;
          display: grid;
          grid-template-columns: 1fr auto;
          grid-template-rows: auto 1fr;
          align-items: center;
          text-align: left;
          pointer-events: auto;
          cursor: pointer;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: color 180ms ease, border-color 180ms ease;
        }

        .future-language-trigger::before,
        .future-language-trigger::after {
          content: "";
          position: absolute;
          background: rgba(212, 170, 103, 0.55);
          pointer-events: none;
        }

        .future-language-trigger::before {
          top: -1px;
          right: 100%;
          width: 34px;
          height: 1px;
        }

        .future-language-trigger::after {
          top: 100%;
          right: -1px;
          width: 1px;
          height: 28px;
        }

        .future-language-trigger:hover,
        .future-language-trigger:focus-visible {
          color: #d4aa67;
          border-color: #d4aa67;
          outline: none;
        }

        .future-language-trigger__label {
          grid-column: 1 / -1;
          color: #7f9676;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.24em;
          line-height: 1;
        }

        .future-language-trigger__code {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.08em;
          line-height: 1;
        }

        .future-language-trigger__mark {
          color: #d4aa67;
          font-size: 14px;
          line-height: 1;
          transform: translateY(-1px);
        }

        .future-language-modal {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: clamp(16px, 4vw, 54px);
          background:
            radial-gradient(circle at 78% 13%, rgba(36, 112, 178, 0.34), transparent 32%),
            radial-gradient(circle at 16% 88%, rgba(212, 170, 103, 0.13), transparent 38%),
            rgba(1, 13, 27, 0.91);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .future-language-modal::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.2;
          background-image:
            linear-gradient(rgba(212, 170, 103, 0.16) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 170, 103, 0.16) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(circle at 72% 26%, black, transparent 72%);
          pointer-events: none;
        }

        .future-language-panel {
          position: relative;
          width: min(940px, 100%);
          max-height: calc(100dvh - clamp(32px, 8vw, 108px));
          overflow: auto;
          padding: clamp(26px, 5vw, 64px);
          border: 1px solid rgba(212, 170, 103, 0.52);
          background:
            linear-gradient(112deg, rgba(4, 27, 51, 0.98), rgba(5, 39, 72, 0.95)),
            #041b33;
          color: #f1e2c8;
          box-shadow: 0 42px 110px rgba(0, 0, 0, 0.48);
          clip-path: polygon(34px 0, 100% 0, 100% calc(100% - 34px), calc(100% - 34px) 100%, 0 100%, 0 34px);
        }

        .future-language-panel::before {
          content: "";
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(127, 150, 118, 0.18);
          pointer-events: none;
        }

        .future-language-panel::after {
          content: "FR";
          position: absolute;
          right: clamp(18px, 4vw, 52px);
          bottom: -0.18em;
          color: rgba(212, 170, 103, 0.055);
          font-family: var(--font-display), serif;
          font-size: clamp(110px, 22vw, 250px);
          line-height: 0.8;
          letter-spacing: -0.08em;
          pointer-events: none;
        }

        .future-language-close {
          position: absolute;
          top: clamp(18px, 3vw, 34px);
          right: clamp(18px, 3vw, 34px);
          z-index: 2;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(212, 170, 103, 0.42);
          border-radius: 50%;
          background: rgba(4, 27, 51, 0.5);
          color: #d4aa67;
          display: grid;
          place-items: center;
          font: 400 21px/1 var(--font-body), Bingo, sans-serif;
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease, transform 180ms ease;
        }

        .future-language-close:hover,
        .future-language-close:focus-visible {
          background: #d4aa67;
          color: #041b33;
          outline: none;
          transform: rotate(45deg);
        }

        .future-language-kicker {
          position: relative;
          z-index: 1;
          margin: 0 0 15px;
          color: #7f9676;
          font-size: clamp(9px, 1vw, 12px);
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        .future-language-title {
          position: relative;
          z-index: 1;
          margin: 0;
          color: #f1e2c8;
          font-family: var(--font-body), Bingo, sans-serif;
          font-size: clamp(35px, 6vw, 74px);
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 0.92;
          text-transform: uppercase;
        }

        .future-language-title span {
          color: #d4aa67;
        }

        .future-language-intro {
          position: relative;
          z-index: 1;
          margin: 18px 0 clamp(25px, 4vw, 45px);
          color: rgba(241, 226, 200, 0.62);
          font-size: clamp(11px, 1.3vw, 15px);
          letter-spacing: 0.08em;
        }

        .future-language-options {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-top: 1px solid rgba(212, 170, 103, 0.24);
        }

        .future-language-option {
          position: relative;
          min-height: 190px;
          padding: 25px 22px 22px;
          border: 0;
          border-right: 1px solid rgba(212, 170, 103, 0.24);
          background: transparent;
          color: #f1e2c8;
          text-align: left;
          cursor: pointer;
          overflow: hidden;
          transition: background 200ms ease, color 200ms ease;
        }

        .future-language-option:last-child {
          border-right: 0;
        }

        .future-language-option::after {
          content: "";
          position: absolute;
          inset: auto 0 0;
          height: 3px;
          background: #d4aa67;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 220ms ease;
        }

        .future-language-option:hover,
        .future-language-option:focus-visible,
        .future-language-option[aria-pressed="true"] {
          background: rgba(212, 170, 103, 0.095);
          outline: none;
        }

        .future-language-option:hover::after,
        .future-language-option:focus-visible::after,
        .future-language-option[aria-pressed="true"]::after {
          transform: scaleX(1);
        }

        .future-language-option__index {
          display: block;
          margin-bottom: 28px;
          color: #7f9676;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
        }

        .future-language-option__name {
          display: block;
          margin-bottom: 10px;
          color: #d4aa67;
          font-size: clamp(23px, 2.7vw, 35px);
          font-weight: 600;
          letter-spacing: 0.02em;
          line-height: 1;
        }

        .future-language-option__detail {
          display: block;
          max-width: 190px;
          color: rgba(241, 226, 200, 0.52);
          font-size: 10px;
          letter-spacing: 0.06em;
          line-height: 1.45;
        }

        .future-language-option__selected {
          position: absolute;
          top: 23px;
          right: 20px;
          color: #d4aa67;
          font-size: 12px;
        }

        @media (max-width: ${BREAKPOINT}px) {
          .future-deck-desktop {
            display: none;
          }

          .future-deck-mobile {
            display: block;
          }

          .future-language-trigger {
            top: max(10px, env(safe-area-inset-top));
            right: max(10px, env(safe-area-inset-right));
            width: 92px;
            height: 52px;
            padding: 9px 11px 8px 20px;
          }

          .future-language-trigger::before {
            width: 20px;
          }

          .future-language-trigger__label {
            font-size: 7px;
          }

          .future-language-trigger__code {
            font-size: 15px;
          }

          .future-language-modal {
            place-items: start center;
            padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom));
          }

          .future-language-panel {
            width: 100%;
            max-height: calc(100dvh - 24px);
            min-height: calc(100dvh - 24px);
            padding: 54px 25px 32px;
            clip-path: polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px);
          }

          .future-language-title {
            font-size: clamp(32px, 12vw, 52px);
          }

          .future-language-intro {
            margin-top: 13px;
          }

          .future-language-options {
            grid-template-columns: 1fr;
          }

          .future-language-option {
            min-height: 112px;
            padding: 18px 17px 17px;
            border-right: 0;
            border-bottom: 1px solid rgba(212, 170, 103, 0.24);
          }

          .future-language-option:last-child {
            border-bottom: 0;
          }

          .future-language-option__index {
            margin-bottom: 13px;
          }

          .future-language-option__name {
            font-size: 25px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .future-language-trigger,
          .future-language-close,
          .future-language-option,
          .future-language-option::after {
            transition: none;
          }
        }
      `}</style>

      <div className="future-deck-desktop">
        <iframe
          data-future-renaissance-deck="true"
          src="/futurerenaissance/axis-horizontal.html"
          title="Future Renaissance proposal, desktop deck"
          onLoad={syncDeckLanguage}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
            background: "#041B33",
          }}
        />
      </div>

      <div className="future-deck-mobile">
        <iframe
          data-future-renaissance-deck="true"
          src="/futurerenaissance/axis-vertical.html"
          title="Future Renaissance proposal, mobile deck"
          onLoad={syncDeckLanguage}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
            background: "#041B33",
          }}
        />
      </div>

      <div ref={languageRootRef} className="future-language">
        <button
          ref={languageTriggerRef}
          className="future-language-trigger"
          type="button"
          aria-label={`Change language. Current language: ${activeLanguage.name}`}
          aria-haspopup="dialog"
          aria-expanded={isLanguageOpen}
          aria-controls="future-language-dialog"
          onClick={() => setIsLanguageOpen(true)}
        >
          <span className="future-language-trigger__label">LANGUAGE</span>
          <strong className="future-language-trigger__code">{activeLanguage.short}</strong>
          <span className="future-language-trigger__mark" aria-hidden="true">
            ✦
          </span>
        </button>

        <div
          ref={languageModalRef}
          className="future-language-modal"
          aria-hidden={!isLanguageOpen}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLanguageOpen(false);
          }}
        >
          <div
            ref={languagePanelRef}
            id="future-language-dialog"
            className="future-language-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="future-language-title"
            aria-describedby="future-language-description"
            onKeyDown={handleLanguageKeyDown}
          >
            <button
              className="future-language-close"
              type="button"
              aria-label="Close language selection"
              onClick={() => setIsLanguageOpen(false)}
            >
              +
            </button>

            <p className="future-language-kicker">AXIS · Future Renaissance</p>
            <h2 id="future-language-title" className="future-language-title">
              Select <span>language</span>
            </h2>
            <p id="future-language-description" className="future-language-intro">
              Choose the language for this presentation.
            </p>

            <div className="future-language-options">
              {LANGUAGES.map((item, index) => {
                const isSelected = item.code === normalizedLanguage;

                return (
                  <button
                    ref={index === 0 ? firstLanguageRef : undefined}
                    key={item.code}
                    className="future-language-option"
                    type="button"
                    aria-pressed={isSelected}
                    data-language-option
                    onClick={() => selectLanguage(item.code)}
                  >
                    <span className="future-language-option__index">
                      {String(index + 1).padStart(2, "0")} / {item.short}
                    </span>
                    <strong className="future-language-option__name">{item.name}</strong>
                    <span className="future-language-option__detail">{item.detail}</span>
                    {isSelected ? (
                      <span className="future-language-option__selected" aria-hidden="true">
                        ✦
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
