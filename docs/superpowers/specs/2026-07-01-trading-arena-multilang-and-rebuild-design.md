# Trading Arena — Multilang Bracket Fix + `/tradingarena2026` React Rebuild

Date: 2026-07-01
Status: Approved design, pending implementation plan

## Summary

The Trading Arena pitch deck already has a working 4-language i18n system
(`es / en / zh / zh-Hant`) driven by the site language switcher. Two pieces of
work remain:

1. **Phase 1 (bug fix, ship now):** the embedded `bracket.svg` is the only
   asset stuck in Spanish because it loads as an isolated `<object>` document
   the parent i18n script cannot reach. Make it respond to the language
   switcher.
2. **Phase 2 (rebuild, separate tracked effort):** rebuild the deck as native
   React at a **new route `/tradingarena2026`**, elevating it to
   multi-million-venture pitch quality with a monochrome + chrome + 3D
   futuristic design, using the frontend-design guidance, reactbits (via the
   shadcn MCP), and GSAP-React.

The existing `/tradingarena` deck stays live and untouched throughout. Cutover
is out of scope for this spec.

## Current State (verified)

- `app/tradingarena/page.tsx` renders `TradingArenaContent` + `TradingArenaDeck`.
- `components/tradingarena/TradingArenaDeck.tsx` loads two standalone HTML decks
  via iframe (`arena-horizontal.html`, `arena-vertical.html`) and broadcasts
  `postMessage({ type: "axis:language", language })` to them.
- `public/tradingarena/arena-i18n.js` swaps `[data-i18n]` text for 64 keys
  across 8 slides; supports `es | en | zh | zh-Hant`; boots from
  `localStorage["axis:site-language"]`, default `es`.
- The decks embed `bracket.svg` via
  `<object data="/tradingarena/bracket.svg" type="image/svg+xml">`.
  `bracket.svg` and `arena-bracket.svg` are byte-identical.
- `bracket.svg` has hardcoded Spanish `<text>`: `CATEGORIA` ×2, `2 CATEGORIAS`,
  `PROFIT WINS`, `ELIMINACION POR LIQUIDACION`. `market-depth.svg` has no text.
- Deck uses GSAP 3.13 + anime.js 3.2 via CDN.
- App deps already include `gsap`, `@gsap/react`, `framer-motion`/`motion`,
  Tailwind v4, `clsx`, `tailwind-merge`. shadcn is configured
  (`components.json`), and `components/ui/` already holds a reactbits component
  (`GradualBlur`).
- `components/site-language.tsx` exposes `useSiteLanguage()` →
  `{ language, setLanguage }` with `SiteLanguage = "zh" | "zh-Hant" | "en" | "es"`.

---

## Phase 1 — Multilingual Bracket SVG

### Approach: self-contained i18n inside the SVG

Add a small inline `<script>` to the SVG that:

- reads `localStorage["axis:site-language"]` on boot (default `es`, matching the
  deck),
- listens for `window.postMessage({ type: "axis:language", language })` — the
  exact message the deck already broadcasts,
- swaps its own `<text>` nodes by a `data-i18n`-style key.

The parent decks already iterate `.bracket-media object`; extend that handler so
that on load **and** on language change the parent forwards the current language
into the `<object>`'s `contentWindow` via `postMessage`. This reuses the existing
mechanism end to end — no new architecture, no reload, no re-triggered bracket
animation.

### Rejected alternatives

- **Inline the SVG into the HTML** so parent JS reaches it — bloats both HTML
  files, duplicates the SVG, breaks clean reuse.
- **Four separate SVG files, swap `data`** — visible reload/reflow and
  re-triggers the draw-on animation on every switch.

### Translations (default `es`)

| key            | es                          | en                    | zh        | zh-Hant   |
|----------------|-----------------------------|-----------------------|-----------|-----------|
| `br.cat` (×2)  | CATEGORIA                   | CATEGORY              | 类别       | 類別       |
| `br.title`     | 2 CATEGORIAS                | 2 CATEGORIES          | 两大类别    | 兩大類別    |
| `br.subtitle`  | PROFIT WINS                 | PROFIT WINS           | 利润最高者胜 | 利潤最高者勝 |
| `br.elim`      | ELIMINACION POR LIQUIDACION | KNOCKOUT BY LIQUIDATION| 爆仓即淘汰  | 爆倉即淘汰  |

`HUMAN TRADERS` / `AI AGENTS` remain unchanged (already English terms in the deck).

### Files touched

- `public/tradingarena/bracket.svg` — add `data-i18n` keys on the four `<text>`
  nodes + inline swap script.
- `public/tradingarena/arena-bracket.svg` — keep byte-identical to `bracket.svg`.
- `public/tradingarena/arena-horizontal.html` — extend bracket-load handler to
  forward current language into the `<object>`.
- `public/tradingarena/arena-vertical.html` — same.

Scope: ~40 lines, no new dependencies, no visual change except correct text.

### Testing (Phase 1)

- Load deck, switch through es/en/zh/zh-Hant via the switcher; bracket text
  updates in place with no reload/animation restart.
- First-load default is `es`.
- `bracket.svg` and `arena-bracket.svg` remain identical (diff clean).

---

## Phase 2 — React Rebuild at `/tradingarena2026`

### Route & files (mirror existing convention)

- `app/tradingarena2026/page.tsx` — metadata with canonical `/tradingarena2026`;
  renders the new deck. Existing `/tradingarena` untouched.
- `components/tradingarena2026/`
  - `ArenaDeck2026.tsx` — orchestrator (slide sequencing, shared scroll context).
  - `Slide01Hero.tsx` … `Slide08Close.tsx` — one component per slide.
  - `content.ts` — i18n dictionary ported from the 64 keys in `arena-i18n.js`,
    typed against `SiteLanguage`.
  - `BracketDiagram.tsx` — the bracket as a native React SVG, translated for free
    via `useSiteLanguage()`; no `<object>`, no postMessage.
  - `useReveal.ts` (or similar) — one shared scroll/reveal hook so reveal logic
    isn't copy-pasted across 8 slides.

### Architecture principles

- Each slide is self-contained: receives the resolved translations `t` for the
  current language as a prop, owns its own layout and GSAP timeline via `useGSAP`
  (scoped, auto-cleanup). No global mutable animation state.
- i18n is pure data (`content.ts`); copy changes never touch animation code.
- Single responsive component tree via Tailwind — retires the separate
  horizontal/vertical HTML files, ending dual maintenance.
- Consumes `useSiteLanguage()` directly (app-wide switcher already works); no
  iframe, no postMessage bridge.

### Visual direction — monochrome / chrome / 3D futuristic

- **Monochromatic:** black / white / greys as the structural palette. The
  current gold (`#d7a83f`) and red (`#ff233f`) are removed as structure.
- **Single accent:** exactly ONE semantic use of red — the liquidation /
  knockout beat — as punctuation, nowhere else.
- **Chrome:** brushed-metal / liquid-chrome treatment on headings and key edges
  (gradient-on-mono with specular highlights).
- **3D / futuristic:** depth via layering, parallax, subtle perspective/tilt,
  bevel and glow; motion carried by GSAP-React + reactbits.
- **Legibility first:** high contrast, generous spacing, unmistakable hierarchy.
  Futuristic must never cost instant readability — this deck has to land in
  seconds.
- **Benchmark:** the caliber of an investor deck that gets a multi-million
  venture greenlit; measurably better than the current base deck, not a reskin.

### Tooling

- **frontend-design** skill for typographic system, spacing scale, and
  intentional (non-templated) composition.
- **reactbits** primitives pulled via the shadcn MCP
  (`npx shadcn@latest` / MCP) for hero text motion, gradient/blur fields
  (`GradualBlur` already present), and card treatments — used to elevate, not as
  a template skin.
- **GSAP-React** (`@gsap/react` `useGSAP`) for slide transitions, bracket
  draw-on, and ambient market-depth motion. Bespoke animation is the deck's real
  value; shadcn/reactbits augment rather than replace it.

### Sequencing & parity

- Build `/tradingarena2026` slide-by-slide to visual/content parity with the
  eight existing slides, then elevate to the design direction above.
- `/tradingarena` remains the live deck until parity is reached.
- Cutover (redirect old → new, or route swap) is a later, separate decision —
  explicitly **out of scope** here.

### Effort note

This is a large, multi-session effort. This spec captures architecture and
direction; the implementation plan (writing-plans, next step) breaks it into
ordered, independently reviewable tasks — one slide at a time with checkpoints.

### Testing (Phase 2)

- Each slide renders and animates in isolation.
- Language switch across es/en/zh/zh-Hant updates all copy including the bracket,
  with no reload.
- Responsive parity: single tree covers the cases previously split across
  horizontal/vertical HTML.
- Reduced-motion honored (animations degrade gracefully).
- `/tradingarena` remains unchanged and functional.

---

## Out of Scope

- Cutover / redirect from `/tradingarena` to `/tradingarena2026`.
- Copy rewrites beyond porting existing translations (new copy is a later pass).
- Changes to the site-wide language switcher.
