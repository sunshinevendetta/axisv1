# Vercel Score Audit

Date: 2026-03-22

## Scope

This audit reviews likely causes of the low Vercel score reported for the SPECTRA site. The investigation focused on:

- homepage rendering strategy
- metadata and crawlability
- heavy media and runtime behavior
- build and lint health

The score could not be reproduced exactly in this environment because local `next build` did not finish within a 90 second timeout, but the source-level issues below are concrete and high confidence.

## High-Confidence Findings

### 1. Global metadata is too thin for SEO and social preview quality

Evidence:

- [`app/layout.tsx`](/mnt/z/spectra/episode/spectrart/app/layout.tsx#L20) only defines a plain `title` and `description`.
- There is no `metadataBase`, `alternates.canonical`, `openGraph`, `twitter`, or explicit `robots` metadata in the root layout.
- No `app/robots.ts`, `app/sitemap.ts`, or manifest was found under `app/`.

Impact:

- weak crawl signals
- poor social cards
- no canonical control
- weaker indexation hygiene for a content-rich site

### 2. The homepage forces a very large client-side hydration boundary

Evidence:

- [`app/page.tsx`](/mnt/z/spectra/episode/spectrart/app/page.tsx#L1) is a client component.
- The same file imports most of the landing page sections directly inside that client boundary at lines 6 through 22.
- Only two pieces are dynamically split: membership and the persistent player at lines 34 through 41.

Impact:

- larger client JS payload
- more hydration work on first load
- slower first contentful and interactive experience

Notes:

This does not mean the page has zero prerendered HTML. It means a large amount of content that could stay server-rendered is currently bundled into the client tree.

### 3. The hero immediately loads expensive 3D and video assets

Evidence:

- [`components/Logo3d.tsx`](/mnt/z/spectra/episode/spectrart/components/Logo3d.tsx#L28) dynamically imports `@google/model-viewer`.
- The same component loads `/models/logo.glb` at line 170.
- [`components/backgrounds/PrismBackground.tsx`](/mnt/z/spectra/episode/spectrart/components/backgrounds/PrismBackground.tsx#L6) marks the hero background video as `priority`.
- [`components/backgrounds/LazyVideoBackground.tsx`](/mnt/z/spectra/episode/spectrart/components/backgrounds/LazyVideoBackground.tsx#L109) switches the video preload mode to `"auto"` when `priority` is set.
- [`components/Logo3d.tsx`](/mnt/z/spectra/episode/spectrart/components/Logo3d.tsx#L194) also shows a full-screen loading overlay until the intro completes.

Impact:

- expensive first-load network and decode cost
- likely worse LCP and INP on slower devices
- risk that the main landing experience feels blocked behind media readiness

### 4. Static asset weight is far above what a fast landing page should ship

Evidence from local file inventory:

- `public/` is about `137 MB`
- `public/models/membership.glb` is about `22.9 MB`
- `public/assets/3d/cardog.glb` is about `20.2 MB`
- `public/assets/3d/episode1/ep1.mp4` is about `20.1 MB`
- multiple background videos are between roughly `1 MB` and `6.8 MB`

Impact:

- high risk of oversized transfers
- slow mobile experience
- likely poor Core Web Vitals if any of these assets land on initial or near-initial navigation paths

### 5. Build quality gates are disabled

Evidence:

- [`next.config.ts`](/mnt/z/spectra/episode/spectrart/next.config.ts#L24) sets `eslint.ignoreDuringBuilds = true`
- [`next.config.ts`](/mnt/z/spectra/episode/spectrart/next.config.ts#L28) sets `typescript.ignoreBuildErrors = true`

Impact:

- production builds can succeed with hidden correctness and performance issues
- regressions become harder to catch before deployment

### 6. Lint is currently broken, so the repo has no working static-analysis safety net

Evidence:

- `npm run lint` fails immediately with an ESM/CJS import issue in [`eslint.config.mjs`](/mnt/z/spectra/episode/spectrart/eslint.config.mjs#L3)
- current code uses `import { FlatCompat } from "@eslint/eslintrc";`, but the installed package resolves as CommonJS in this environment

Impact:

- no reliable linting
- weak feedback loop for accessibility, Next.js, and Core Web Vitals problems

### 7. A global live data widget adds recurring client fetch work on every page

Evidence:

- [`app/layout.tsx`](/mnt/z/spectra/episode/spectrart/app/layout.tsx#L34) mounts `GlobalTicker` globally
- [`components/magazine/hooks/useCryptoPrices.ts`](/mnt/z/spectra/episode/spectrart/components/magazine/hooks/useCryptoPrices.ts#L75) fetches CoinGecko with `cache: "no-store"`
- the same hook refreshes every 60 seconds at [`components/magazine/hooks/useCryptoPrices.ts`](/mnt/z/spectra/episode/spectrart/components/magazine/hooks/useCryptoPrices.ts#L141)

Impact:

- unnecessary network and script work on routes where price data does not support the primary user task
- can inflate layout-level client work site-wide

### 8. Debug logging remains in user-facing and API paths

Evidence:

- debug logging exists in visual components such as `components/VideoBackground.tsx` and `components/backgrounds/FloatingLinesBackground.tsx`
- verbose logs also exist in submit API routes under `app/api/submit/`

Impact:

- noise in production
- weaker operational hygiene
- can obscure real failures in browser and server logs

## Medium-Confidence Concerns

### 9. Many content sections appear to be client components even when the content is mostly static

Examples:

- `components/home/HomeFeaturedArtifactsSection.tsx`
- `components/home/HomeMixtapesSection.tsx`
- `components/home/HomeArtistsSection.tsx`
- `components/home/HomeStoreSection.tsx`

Impact:

- likely avoidable bundle growth
- more hydration work than necessary

This needs a deliberate pass component by component, but the pattern is visible across the homepage.

### 10. Dynamic page metadata is present on some routes, but still minimal

Examples:

- AR routes define title and description only
- there is still no canonical, Open Graph, or Twitter card detail on those pages

Impact:

- better than the homepage baseline, but still under-optimized for discoverability and sharing

## Local Verification Notes

### Build

Command run:

```bash
timeout 90s npm run build
```

Observed:

- Next.js started production build
- build did not complete within 90 seconds in this environment
- output also showed missing local SWC binary fallbacks before continuing

### Lint

Command run:

```bash
timeout 60s npm run lint
```

Observed:

- ESLint exited with code `2`
- failure came from the `FlatCompat` import in `eslint.config.mjs`

## Priority Fix Order

### Immediate

1. Add proper root metadata, canonical handling, social metadata, `robots`, and `sitemap`.
2. Fix `eslint.config.mjs` and restore a working lint check.
3. Stop ignoring TypeScript and ESLint failures in `next.config.ts`.

### Highest performance wins

1. Move `app/page.tsx` back to a server component and isolate only truly interactive sections as client components.
2. Replace the first-load 3D hero with a lightweight poster or static hero by default, then progressively enhance.
3. Remove `priority` video loading for the hero background unless testing proves it is worth the LCP cost.
4. Compress or replace oversized `.glb` and video assets.

### Secondary improvements

1. Scope `GlobalTicker` to only routes that need it, or fetch less often with caching.
2. Remove production debug logging.
3. Review homepage sections for unnecessary `"use client"` boundaries.

## Expected Outcome

If the reported Vercel score of `29` is driven by performance and SEO signals, the combination of:

- metadata and crawl fixes
- homepage server/client boundary cleanup
- hero media reduction
- asset compression

should materially improve the score. The biggest gains should come from the homepage architecture and first-load media strategy, not from micro-optimizations.
