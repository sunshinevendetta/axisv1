"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  createLiquidGlassPane,
  type LiquidGlassOptions,
  type LiquidGlassPane,
} from "@/components/liquid-glass-lens";

export type SiteLanguage = "zh" | "zh-Hant" | "en" | "es";

const STORAGE_KEY = "axis:site-language";
/* Separate from STORAGE_KEY: the provider writes a language on mount whether or
   not anyone chose one, so "has the visitor picked?" needs its own flag. */
const PICKED_KEY = "axis:site-language-picked";
const DEFAULT_LANGUAGE: SiteLanguage = "en";

const SiteLanguageContext = createContext<{
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
} | null>(null);

function normalizeLanguage(value: string | null, fallback: SiteLanguage = "en"): SiteLanguage {
  return value === "zh" || value === "zh-Hant" || value === "es" || value === "en" ? value : fallback;
}

function readStoredLanguage(fallback: SiteLanguage): SiteLanguage {
  if (typeof window === "undefined") return fallback;
  return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY), fallback);
}

export function SiteLanguageProvider({
  children,
  restoreStoredLanguage = true,
}: {
  children: ReactNode;
  restoreStoredLanguage?: boolean;
}) {
  const [language, setLanguageState] = useState<SiteLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const next = restoreStoredLanguage
      ? readStoredLanguage(DEFAULT_LANGUAGE)
      : DEFAULT_LANGUAGE;
    setLanguageState(next);
    document.documentElement.lang = next;
  }, [restoreStoredLanguage]);

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

const LANGUAGES: Array<{
  code: SiteLanguage;
  flag: string;
  label: string;
  native: string;
}> = [
  { code: "zh", flag: "/flags/cn.svg", label: "Chinese (Simplified)", native: "简体中文" },
  { code: "zh-Hant", flag: "/flags/tw.svg", label: "Chinese (Traditional)", native: "繁體中文" },
  { code: "en", flag: "/flags/us.svg", label: "English", native: "English" },
  { code: "es", flag: "/flags/mx.svg", label: "Spanish", native: "Español" },
];

type FlagImages = Array<HTMLImageElement | null>;

/** Rasterise a flag. The SVGs carry only a viewBox, which Canvas will not size. */
async function loadFlag(src: string): Promise<HTMLImageElement | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    let markup = await response.text();
    if (!/<svg[^>]*\swidth=/.test(markup)) {
      const box = markup.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      if (box) markup = markup.replace("<svg", `<svg width="${box[1]}" height="${box[2]}"`);
    }
    const image = new window.Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    await image.decode();
    return image;
  } catch {
    return null;
  }
}

/* One fetch for the whole session — the gate and the bubble share it. */
let flagsPromise: Promise<FlagImages> | null = null;
function loadFlags(): Promise<FlagImages> {
  flagsPromise ??= Promise.all(LANGUAGES.map((item) => loadFlag(item.flag)));
  return flagsPromise;
}

/** Fill the whole source with the glass plate — the shader mask carves the shape. */
function paintPlate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cy: number,
  halfHeight: number,
) {
  const plate = ctx.createLinearGradient(0, cy - halfHeight, 0, cy + halfHeight);
  plate.addColorStop(0, "#2a2a30");
  plate.addColorStop(0.55, "#131317");
  plate.addColorStop(1, "#07070a");
  ctx.globalAlpha = 1;
  ctx.fillStyle = plate;
  ctx.fillRect(0, 0, width, height);
}

/** Draw one flag as a circle, cover-fitted. */
function paintFlag(
  ctx: CanvasRenderingContext2D,
  flag: HTMLImageElement,
  x: number,
  y: number,
  radius: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  const width = flag.width * ((radius * 2) / flag.height);
  ctx.drawImage(flag, x - width / 2, y - radius, width, radius * 2);
  ctx.restore();
}

/* Active flag last so it stays on top while the others are stacked behind it. */
function paintOrder(activeIndex: number) {
  return LANGUAGES.map((_, index) => index).sort(
    (a, b) => Number(a === activeIndex) - Number(b === activeIndex),
  );
}

/**
 * Mount a liquid-glass pane into a host div.
 *
 * `ready` stays false until three.js and the flags have loaded, which is the
 * whole point: every caller paints a plain CSS version first and only crossfades
 * to the crystal once this flips, so nothing waits on the WebGL chunk to appear.
 */
function useLiquidPane(
  width: number,
  height: number,
  options: Partial<LiquidGlassOptions>,
  onFrame: (pane: LiquidGlassPane, flags: FlagImages, delta: number) => void,
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const paneRef = useRef<LiquidGlassPane | null>(null);
  const frameRef = useRef(onFrame);
  const optionsRef = useRef(options);
  const [ready, setReady] = useState(false);

  frameRef.current = onFrame;
  optionsRef.current = options;

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let pane: LiquidGlassPane | null = null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = async () => {
      // the flags and the three.js chunk load together, not one after the other
      const [flags, created] = await Promise.all([
        loadFlags(),
        createLiquidGlassPane({
          width,
          height,
          options: { ...optionsRef.current, shimmer: !reduceMotion },
        }),
      ]);
      if (cancelled || !created) {
        created?.dispose();
        return;
      }

      pane = created;
      paneRef.current = pane;
      pane.canvas.style.position = "absolute";
      pane.canvas.style.inset = "0";
      pane.canvas.style.pointerEvents = "none";
      pane.setAnimated(!reduceMotion);
      setReady(true);

      let last = performance.now();
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const delta = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (pane) frameRef.current(pane, flags, delta);
      };
      raf = requestAnimationFrame(loop);
    };

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      paneRef.current = null;
      pane?.canvas.remove();
      pane?.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = paneRef.current?.canvas;
    if (!ready || !host || !canvas || canvas.parentElement === host) return;
    host.appendChild(canvas);
  }, [ready]);

  return { hostRef, ready };
}

/* The crystal draws the flags, so the DOM controls are transparent hit targets
   carrying the labels and the focus ring. */
const HIT_BUTTON: CSSProperties = {
  position: "absolute",
  appearance: "none",
  border: 0,
  padding: 0,
  background: "transparent",
  cursor: "pointer",
};

/* ── the opening gate ───────────────────────────────────────────────────── */

const GATE_W = 400;
const GATE_H = 188;
const GATE_CX = GATE_W / 2;
const GATE_CY = GATE_H / 2;
const GATE_HW = 190;
const GATE_HH = 84;
const GATE_PITCH = 84;
const GATE_FLAG_R = 22;
const GATE_FLAG_CY = 96;
const GATE_HIT = 60;

function gateSlotX(index: number) {
  return GATE_CX + (index - (LANGUAGES.length - 1) / 2) * GATE_PITCH;
}

function paintGateSource(ctx: CanvasRenderingContext2D, flags: FlagImages, activeIndex: number) {
  paintPlate(ctx, GATE_W, GATE_H, GATE_CY, GATE_HH);
  for (const index of paintOrder(activeIndex)) {
    const flag = flags[index];
    if (!flag) continue;
    paintFlag(
      ctx,
      flag,
      gateSlotX(index),
      GATE_FLAG_CY,
      GATE_FLAG_R,
      index === activeIndex ? 1 : 0.72,
    );
  }
}

function LanguageGate({ onPick }: { onPick: (language: SiteLanguage | null) => void }) {
  const { language } = useSiteLanguage();
  const activeIndex = Math.max(0, LANGUAGES.findIndex((item) => item.code === language));
  const activeRef = useRef(activeIndex);
  const paintedRef = useRef(-1);
  const [scale, setScale] = useState(1);
  activeRef.current = activeIndex;

  const { hostRef, ready } = useLiquidPane(
    GATE_W,
    GATE_H,
    { round: 0.36, alpha: 0.78 },
    useCallback((pane: LiquidGlassPane, flags: FlagImages) => {
      if (paintedRef.current === activeRef.current) return;
      paintedRef.current = activeRef.current;
      paintGateSource(pane.ctx, flags, activeRef.current);
      pane.markDirty();
      pane.setShape(GATE_CX, GATE_CY, GATE_HW, GATE_HH);
    }, []),
  );

  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerWidth - 32) / GATE_W));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onPick(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onPick]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select language"
      onClick={(event) => {
        if (event.target === event.currentTarget) onPick(null);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.62)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        animation: "axis-lang-gate-in 260ms ease both",
      }}
    >
      <style>{`@keyframes axis-lang-gate-in { from { opacity: 0 } to { opacity: 1 } }`}</style>
      <div
        style={{
          position: "relative",
          width: GATE_W,
          height: GATE_H,
          transform: `scale(${scale})`,
          color: "white",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: GATE_CX - GATE_HW,
            top: GATE_CY - GATE_HH,
            width: GATE_HW * 2,
            height: GATE_HH * 2,
            borderRadius: 30,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            background: ready ? "transparent" : "rgba(10,10,12,0.78)",
            border: `1px solid ${ready ? "transparent" : "rgba(255,255,255,0.18)"}`,
            boxShadow: "0 22px 60px rgba(0,0,0,0.55)",
            transition: "background-color 240ms ease, border-color 240ms ease",
          }}
        />
        <div ref={hostRef} aria-hidden style={{ position: "absolute", inset: 0 }} />

        <div
          aria-hidden
          style={{
            position: "absolute",
            insetInline: 0,
            top: 34,
            textAlign: "center",
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            opacity: 0.62,
          }}
        >
          Select language
        </div>

        {LANGUAGES.map((item, index) => (
          <div key={item.code}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.flag}
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                left: gateSlotX(index) - GATE_FLAG_R,
                top: GATE_FLAG_CY - GATE_FLAG_R,
                width: GATE_FLAG_R * 2,
                height: GATE_FLAG_R * 2,
                borderRadius: "50%",
                objectFit: "cover",
                opacity: ready ? 0 : index === activeIndex ? 1 : 0.72,
                transition: "opacity 240ms ease",
              }}
            />
            <button
              type="button"
              onClick={() => onPick(item.code)}
              aria-label={`Select ${item.label}`}
              aria-pressed={item.code === language}
              style={{
                ...HIT_BUTTON,
                left: gateSlotX(index) - GATE_HIT / 2,
                top: GATE_FLAG_CY - GATE_HIT / 2,
                width: GATE_HIT,
                height: GATE_HIT,
                borderRadius: "50%",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: gateSlotX(index) - GATE_PITCH / 2,
                top: 128,
                width: GATE_PITCH,
                textAlign: "center",
                fontSize: 12,
                opacity: 0.82,
                pointerEvents: "none",
              }}
            >
              {item.native}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── the corner bubble ──────────────────────────────────────────────────── */

/* Geometry in CSS px inside the fixed bottom-right box. Closed it is a circle
   sitting INSET from the corner; opening grows a pill leftwards out of it while
   the four flags fan out of the toggle. */
const INSET = 16;
const TOGGLE_R = 26;
const FLAG_R = 13;
const FLAG_GAP = 16;
const PILL_PAD = 24;
const BOX_W = 300;
const BOX_H = 84;
const PILL_HW =
  (LANGUAGES.length * FLAG_R * 2 + (LANGUAGES.length - 1) * FLAG_GAP) / 2 + PILL_PAD;
const PILL_HH = 28;
const CY = BOX_H - INSET - TOGGLE_R;
const CLOSED_CX = BOX_W - INSET - TOGGLE_R;
const OPEN_CX = BOX_W - INSET - PILL_HW;
const HIT = 40;

function slotX(index: number) {
  return OPEN_CX - PILL_HW + PILL_PAD + FLAG_R + index * (FLAG_R * 2 + FLAG_GAP);
}

function paintBubbleSource(
  ctx: CanvasRenderingContext2D,
  flags: FlagImages,
  activeIndex: number,
  open: number,
) {
  paintPlate(ctx, BOX_W, BOX_H, CY, PILL_HH);
  for (const index of paintOrder(activeIndex)) {
    const flag = flags[index];
    if (!flag) continue;
    const active = index === activeIndex;
    const alpha = active ? 1 : 0.58 * open;
    if (alpha <= 0.01) continue;
    const x = CLOSED_CX + (slotX(index) - CLOSED_CX) * open;
    paintFlag(ctx, flag, x, CY, FLAG_R + (active ? (1 - open) * 2 : 0), alpha);
  }
}

function LanguageBubble() {
  const { language, setLanguage } = useSiteLanguage();
  const [open, setOpen] = useState(false);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const paintedRef = useRef(-1);
  const openRef = useRef(open);
  const activeRef = useRef(0);

  const activeIndex = Math.max(0, LANGUAGES.findIndex((item) => item.code === language));
  openRef.current = open;
  activeRef.current = activeIndex;

  const { hostRef: stageRef, ready } = useLiquidPane(
    BOX_W,
    BOX_H,
    {},
    useCallback((pane: LiquidGlassPane, flags: FlagImages, delta: number) => {
      const target = openRef.current ? 1 : 0;
      let progress = target + (progressRef.current - target) * Math.exp(-delta * 12);
      if (Math.abs(progress - target) < 0.001) progress = target;
      progressRef.current = progress;

      const key = Math.round(progress * 500) * 10 + activeRef.current;
      if (key === paintedRef.current) return;
      paintedRef.current = key;

      paintBubbleSource(pane.ctx, flags, activeRef.current, progress);
      pane.markDirty();

      const cx = CLOSED_CX + (OPEN_CX - CLOSED_CX) * progress;
      const halfWidth = TOGGLE_R + (PILL_HW - TOGGLE_R) * progress;
      const halfHeight = TOGGLE_R + (PILL_HH - TOGGLE_R) * progress;
      pane.setShape(cx, CY, halfWidth, halfHeight);

      // the CSS blur sits behind the canvas, so it has to track the same shape
      const backdrop = backdropRef.current;
      if (backdrop) {
        backdrop.style.left = `${cx - halfWidth}px`;
        backdrop.style.top = `${CY - halfHeight}px`;
        backdrop.style.width = `${halfWidth * 2}px`;
        backdrop.style.height = `${halfHeight * 2}px`;
        backdrop.style.borderRadius = `${Math.min(halfWidth, halfHeight)}px`;
      }
    }, []),
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!hostRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const activeLabel = LANGUAGES[activeIndex]?.label ?? "English";
  /* Until the crystal is up — and forever, if WebGL never arrives — the CSS
     layer IS the widget, so it carries the closed / open geometry itself. */
  const cssCx = open ? OPEN_CX : CLOSED_CX;
  const cssHalfWidth = open ? PILL_HW : TOGGLE_R;
  const cssHalfHeight = open ? PILL_HH : TOGGLE_R;
  const glide = "260ms cubic-bezier(0.2, 0.7, 0.2, 1)";

  return (
    <div
      ref={hostRef}
      style={{
        position: "fixed",
        right: 0,
        bottom: 0,
        width: BOX_W,
        height: BOX_H,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        ref={backdropRef}
        aria-hidden
        style={{
          position: "absolute",
          left: cssCx - cssHalfWidth,
          top: CY - cssHalfHeight,
          width: cssHalfWidth * 2,
          height: cssHalfHeight * 2,
          borderRadius: Math.min(cssHalfWidth, cssHalfHeight),
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          background: ready ? "transparent" : "rgba(10,10,12,0.72)",
          border: `1px solid ${ready ? "transparent" : "rgba(255,255,255,0.18)"}`,
          boxShadow: "0 10px 34px rgba(0,0,0,0.45)",
          transition: ready
            ? "background-color 240ms ease, border-color 240ms ease"
            : `left ${glide}, top ${glide}, width ${glide}, height ${glide}, border-radius ${glide}`,
        }}
      />
      <div ref={stageRef} aria-hidden style={{ position: "absolute", inset: 0 }} />

      {LANGUAGES.map((item, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`flag-${item.code}`}
          src={item.flag}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            left: (open ? slotX(index) : CLOSED_CX) - FLAG_R,
            top: CY - FLAG_R,
            width: FLAG_R * 2,
            height: FLAG_R * 2,
            borderRadius: "50%",
            objectFit: "cover",
            opacity: ready ? 0 : index === activeIndex ? 1 : open ? 0.58 : 0,
            transition: `opacity 240ms ease, left ${glide}`,
            pointerEvents: "none",
          }}
        />
      ))}

      <button
        type="button"
        onClick={() => setOpen(true)}
        tabIndex={open ? -1 : 0}
        aria-label={`Change language — current: ${activeLabel}`}
        aria-expanded={open}
        style={{
          ...HIT_BUTTON,
          left: CLOSED_CX - TOGGLE_R,
          top: CY - TOGGLE_R,
          width: TOGGLE_R * 2,
          height: TOGGLE_R * 2,
          borderRadius: "50%",
          pointerEvents: open ? "none" : "auto",
        }}
      />

      <div
        role="group"
        aria-label="Select language"
        aria-hidden={!open}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {LANGUAGES.map((item, index) => (
          <button
            key={item.code}
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => {
              setLanguage(item.code);
              setOpen(false);
            }}
            aria-label={`Select ${item.label}`}
            aria-pressed={language === item.code}
            style={{
              ...HIT_BUTTON,
              left: slotX(index) - HIT / 2,
              top: CY - HIT / 2,
              width: HIT,
              height: HIT,
              borderRadius: "50%",
              pointerEvents: open ? "auto" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function LanguageSwitch() {
  const { setLanguage } = useSiteLanguage();
  /* null until storage has been read, so the gate never flashes for a returning
     visitor and never server-renders. */
  const [gate, setGate] = useState<boolean | null>(null);

  useEffect(() => {
    setGate(window.localStorage.getItem(PICKED_KEY) !== "1");
  }, []);

  const pick = useCallback(
    (next: SiteLanguage | null) => {
      if (next) setLanguage(next);
      window.localStorage.setItem(PICKED_KEY, "1");
      setGate(false);
    },
    [setLanguage],
  );

  return (
    <>
      {gate ? <LanguageGate onPick={pick} /> : null}
      <LanguageBubble />
    </>
  );
}
