"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import type { MagazineLang } from "@/src/types/magazine";

// ── Localized category tags ───────────────────────────────────────────────────
const TAG_LABELS: Record<string, Record<MagazineLang, string>> = {
  APPAREL:     { en: "APPAREL",     es: "ROPA",       fr: "VÊTEMENTS", de: "KLEIDUNG",  ja: "アパレル",   ru: "ОДЕЖДА",     zh: "服装",   pt: "VESTUÁRIO", ko: "의류",    it: "ABBIGLIAMENTO", nl: "KLEDING"   },
  JEWELLERY:   { en: "JEWELLERY",   es: "JOYERÍA",    fr: "BIJOUX",     de: "SCHMUCK",   ja: "ジュエリー", ru: "УКРАШЕНИЯ",  zh: "珠宝",   pt: "JOALHARIA", ko: "주얼리",  it: "GIOIELLI",      nl: "SIERADEN"  },
  ACCESSORIES: { en: "ACCESSORIES", es: "ACCESORIOS", fr: "ACCESSOIRES",de: "ZUBEHÖR",   ja: "アクセサリー",ru: "АКСЕССУАРЫ",zh: "配件",   pt: "ACESSÓRIOS",ko: "액세서리",it: "ACCESSORI",     nl: "ACCESSOIRES"},
  "ART PRINT": { en: "ART PRINT",   es: "IMPRESIÓN",  fr: "IMPRESSION", de: "KUNSTDRUCK",ja: "アートプリント",ru: "ПРИНТ",  zh: "艺术印刷",pt: "IMPRESSÃO", ko: "아트프린트",it: "STAMPA D'ARTE", nl: "KUNSTPRINT"},
  OBJECTS:     { en: "OBJECTS",     es: "OBJETOS",    fr: "OBJETS",     de: "OBJEKTE",   ja: "オブジェ",   ru: "ОБЪЕКТЫ",    zh: "物品",   pt: "OBJETOS",   ko: "오브젝트", it: "OGGETTI",       nl: "OBJECTEN"  },
  MUSIC:       { en: "MUSIC",       es: "MÚSICA",     fr: "MUSIQUE",    de: "MUSIK",     ja: "ミュージック",ru: "МУЗЫКА",    zh: "音乐",   pt: "MÚSICA",    ko: "음악",    it: "MUSICA",        nl: "MUZIEK"    },
};

function localizeTag(tag: string, lang: MagazineLang): string {
  return TAG_LABELS[tag]?.[lang] ?? tag;
}

// ── Shop item data ────────────────────────────────────────────────────────────
const SHOP_ITEMS = [
  { id: 1,  label: "AXIS VORTEX TEE",       tag: "APPAREL",     price: "€99",  accent: "#1a1a2e" },
  { id: 2,  label: "DARIACORE HOODIE",       tag: "APPAREL",     price: "€129", accent: "#0d0d1a" },
  { id: 3,  label: "AXIS ORB RING",          tag: "JEWELLERY",   price: "€199", accent: "#1a1a0d" },
  { id: 4,  label: "GLITCH GODDESS #1",      tag: "ART PRINT",   price: "€420", accent: "#14141e" },
  { id: 5,  label: "AXIS LOGO CAP",          tag: "ACCESSORIES", price: "€59",  accent: "#0d141a" },
  { id: 6,  label: "SIGNAL PENDANT",         tag: "JEWELLERY",   price: "€149", accent: "#1a0d14" },
  { id: 7,  label: "NOISE CULTURE JACKET",   tag: "APPAREL",     price: "€289", accent: "#0d1a14" },
  { id: 8,  label: "AXIS TOTE",           tag: "ACCESSORIES", price: "€45",  accent: "#141a0d" },
  { id: 9,  label: "VOID CERAMIC MUG",       tag: "OBJECTS",     price: "€39",  accent: "#1a0d0d" },
  { id: 10, label: "AXIS ENAMEL PIN SET",    tag: "ACCESSORIES", price: "€22",  accent: "#0d0d1a" },
  { id: 11, label: "DARIACORE POSTER 01",    tag: "ART PRINT",   price: "€89",  accent: "#1a1a14" },
  { id: 12, label: "FREQUENCY BRACELET",     tag: "JEWELLERY",   price: "€79",  accent: "#141414" },
  { id: 13, label: "SIGNAL HOODIE BLACK",    tag: "APPAREL",     price: "€149", accent: "#0a0a14" },
  { id: 14, label: "ARCH PRINT BERLIN",      tag: "ART PRINT",   price: "€199", accent: "#14141a" },
  { id: 15, label: "AXIS LIGHTER",           tag: "OBJECTS",     price: "€29",  accent: "#1a1a1a" },
  { id: 16, label: "AXIS VINYL S01",      tag: "MUSIC",       price: "€34",  accent: "#0d141e" },
  { id: 17, label: "GLITCH SLEEVE TEE",      tag: "APPAREL",     price: "€89",  accent: "#1e0d14" },
  { id: 18, label: "CULTURAL COMPASS PRINT", tag: "ART PRINT",   price: "€159", accent: "#14180d" },
  { id: 19, label: "AXIS BEANIE",            tag: "ACCESSORIES", price: "€49",  accent: "#0d1814" },
  { id: 20, label: "NOISE RING SILVER",      tag: "JEWELLERY",   price: "€119", accent: "#181818" },
];

// Triple the items so the strip is seamlessly infinite in both directions
const ITEMS = [...SHOP_ITEMS, ...SHOP_ITEMS, ...SHOP_ITEMS];

const CARD_W = 220;
const GAP    = 1;
const STEP   = CARD_W + GAP;
const SET_W  = SHOP_ITEMS.length * STEP; // one full set width
const ORIGIN = -SET_W; // start in the middle copy

// ── Section header labels ─────────────────────────────────────────────────────
const SECTION_LABEL: Record<MagazineLang, string> = {
  en: "LIVE DROPS", es: "EN VIVO", fr: "SORTIES", de: "DROPS",
  ja: "ライブドロップ", ru: "ДРОПЫ", zh: "最新发布",
  pt: "LANÇAMENTOS", ko: "라이브 드롭", it: "USCITE", nl: "DROPS",
};
const VIEW_ALL_LABEL: Record<MagazineLang, string> = {
  en: "View All Drops →", es: "Ver todo →",      fr: "Tout voir →",  de: "Alle ansehen →",
  ja: "すべて見る →",      ru: "Смотреть всё →", zh: "查看全部 →",
  pt: "Ver tudo →",       ko: "전체 보기 →",     it: "Vedi tutto →", nl: "Alles bekijken →",
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface ShopCarouselProps {
  lang?: MagazineLang;
}

export default function ShopCarousel({ lang = "en" }: ShopCarouselProps) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const xRef      = useRef(ORIGIN);
  const velRef    = useRef(-0.9); // px/frame, negative = scroll left
  const rafRef    = useRef<number>(0);
  const pausedRef = useRef(false);
  const dragRef   = useRef({ active: false, lastX: 0, startX: 0 });

  const setTrack = (x: number) => {
    // Seamless wrap: keep within middle copy range
    let nx = x;
    if (nx > ORIGIN + SET_W) nx -= SET_W;
    if (nx < ORIGIN - SET_W) nx += SET_W;
    xRef.current = nx;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${nx}px)`;
    }
  };

  const loop = useCallback(() => {
    if (!pausedRef.current) {
      setTrack(xRef.current + velRef.current);
      // Dampen velocity back toward cruise
      const cruise = -0.9;
      if (velRef.current !== cruise) {
        velRef.current += (cruise - velRef.current) * 0.035;
        if (Math.abs(velRef.current - cruise) < 0.02) velRef.current = cruise;
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    setTrack(ORIGIN);
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // Arrow: velocity kick
  const handleArrow = (forward: boolean) => {
    velRef.current = forward ? -20 : 20;
    pausedRef.current = false;
  };

  // Drag
  const onPointerDown = (e: React.PointerEvent) => {
    pausedRef.current = true;
    velRef.current = 0;
    dragRef.current = { active: true, lastX: e.clientX, startX: e.clientX };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    velRef.current = dx;
    dragRef.current.lastX = e.clientX;
    setTrack(xRef.current + dx);
  };

  const onPointerUp = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const momentum = velRef.current * 7;
    if (Math.abs(momentum) < 2) {
      velRef.current = -0.9;
      pausedRef.current = false;
      return;
    }
    // Release with momentum, loop's dampen returns to cruise
    velRef.current = momentum;
    pausedRef.current = false;
  };

  const onMouseEnter = () => { pausedRef.current = true; };
  const onMouseLeave = () => {
    pausedRef.current = false;
    if (!dragRef.current.active) velRef.current = -0.9;
  };

  return (
    <section className="relative border-b border-white/6 bg-black overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="[font-family:var(--font-display)] text-[clamp(0.9rem,1.8vw,1.15rem)] leading-none tracking-[-0.04em] text-white uppercase">
            {SECTION_LABEL[lang]}
          </h2>
          {/* uncomment when /shop is live:
          <Link href="/shop" className="text-[8px] uppercase tracking-[0.38em] text-white/28 hover:text-white/60 transition-colors">
            {VIEW_ALL_LABEL[lang]}
          </Link> */}
          <span className="text-[8px] uppercase tracking-[0.38em] text-white/28 cursor-default">
            {VIEW_ALL_LABEL[lang]}
          </span>
        </div>

        <div className="relative select-none">

          {/* Left arrow */}
          <button
            aria-label="Scroll left"
            onClick={() => handleArrow(false)}
            className="absolute left-0 top-0 z-20 h-full w-14 flex items-center justify-start pl-2 focus:outline-none group"
            style={{ background: "linear-gradient(to right,#000 0%,rgba(0,0,0,0.65) 55%,transparent 100%)" }}
          >
            <svg className="text-white/25 group-hover:text-white/80 transition-colors duration-150" width="12" height="22" viewBox="0 0 12 22" fill="none">
              <path d="M10 2L2 11L10 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Right arrow */}
          <button
            aria-label="Scroll right"
            onClick={() => handleArrow(true)}
            className="absolute right-0 top-0 z-20 h-full w-14 flex items-center justify-end pr-2 focus:outline-none group"
            style={{ background: "linear-gradient(to left,#000 0%,rgba(0,0,0,0.65) 55%,transparent 100%)" }}
          >
            <svg className="text-white/25 group-hover:text-white/80 transition-colors duration-150" width="12" height="22" viewBox="0 0 12 22" fill="none">
              <path d="M2 2L10 11L2 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div
              ref={trackRef}
              className="flex"
              style={{ gap: `${GAP}px`, width: `${ITEMS.length * STEP}px` }}
            >
              {ITEMS.map((item, i) => (
                <ShopCard key={i} item={item} lang={lang} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function ShopCard({ item, lang }: { item: typeof SHOP_ITEMS[number]; lang: MagazineLang }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const onEnter = () => {
    if (overlayRef.current)
      gsap.to(overlayRef.current, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
  };
  const onLeave = () => {
    if (overlayRef.current)
      gsap.to(overlayRef.current, { opacity: 0, y: 8, duration: 0.16, ease: "power2.in" });
  };

  const localTag = localizeTag(item.tag, lang);

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      // onClick={() => router.push(`/shop/${item.id}`)}
      style={{ width: CARD_W, flexShrink: 0 }}
      className="border border-white/8 bg-black"
    >
      <div
        className="relative flex items-end justify-start overflow-hidden border-b border-white/8"
        style={{
          height: 200,
          background: `radial-gradient(ellipse at 30% 70%,${item.accent}dd 0%,#050505 80%)`,
        }}
      >
        {/* grid noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* scan lines */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "repeating-linear-gradient(135deg,transparent,transparent 18px,rgba(255,255,255,0.012) 18px,rgba(255,255,255,0.012) 19px)",
          }}
        />
        {/* tag badge */}
        <span className="relative z-10 m-3 border border-white/10 bg-black/60 px-2 py-1 text-[7px] uppercase tracking-[0.38em] text-white/36 backdrop-blur-sm">
          {localTag}
        </span>

        {/* hover overlay */}
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 border-t border-white/8 bg-black/90 px-3 py-3 backdrop-blur-sm"
          style={{ opacity: 0, transform: "translateY(8px)" }}
        >
          <p className="text-[8px] uppercase tracking-[0.3em] text-white/40 mb-1">{localTag}</p>
          <p className="text-[11px] uppercase tracking-wide text-white leading-[1.3]">{item.label}</p>
          <p className="mt-1.5 text-[9px] uppercase tracking-[0.28em] text-white/50">{item.price}</p>
          {/* <p className="mt-2 text-[7px] uppercase tracking-[0.4em] text-white/30">SHOP →</p> */}
        </div>
      </div>

      <div className="p-3">
        <p className="text-[11px] uppercase tracking-wide leading-[1.2] text-white/60 line-clamp-2">
          {item.label}
        </p>
        <p className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-white/36">{item.price}</p>
      </div>
    </div>
  );
}

