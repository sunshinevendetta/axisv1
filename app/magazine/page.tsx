"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MagazineLang } from "@/components/magazine/types";
import PillNav from "@/components/PillNav";
import Footer from "@/components/Footer";
import ArticleReader from "@/components/magazine/ArticleReader";
import MagazineSlideshow from "@/components/magazine/MagazineSlideshow";
import MagazineNav from "@/components/magazine/MagazineNav";
import MagazineGrid from "@/components/magazine/MagazineGrid";
import MagazineSidebar from "@/components/magazine/MagazineSidebar";
import { useCryptoPrices } from "@/components/magazine/hooks/useCryptoPrices";
import { getArtistHref } from "@/src/content/artists";
import { magazineNavItems } from "@/src/lib/navigation";
import type { MagazineArticle } from "@/components/magazine/types";
import rawData from "@/content/magazine.json";

const articles = rawData as MagazineArticle[];

// PillNav ≈ 56px. Ticker is now fixed bottom (32px) so it doesn't
// consume top space — only the nav does.
const NAV_H = 56;
const TICK_H = 32;
// Passed to slideshow for height calc: 100vh - NAV_H - TICK_H
const TOP_OFFSET = NAV_H + TICK_H; // 88px (same result, accounts for bottom ticker)

export default function MagazinePage() {
  const router = useRouter();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lang, setLang] = useState<MagazineLang>("en");

  const { prices, loading: pricesLoading } = useCryptoPrices();

  const openArticle = openSlug
    ? articles.find((a) => a.slug === openSlug) ?? null
    : null;
  const openArtist = (artist: string) => router.push(getArtistHref(artist));

  // Keep featured article out of the slideshow (it's already prominent); use all 8 for rich cycling
  const slideshowArticles = useMemo(
    () => [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [],
  );

  return (
    // CSS variable so fixed children can align correctly
    <div
      className="min-h-screen overflow-x-hidden bg-black text-white"
      style={{ "--ticker-top": `${NAV_H}px` } as React.CSSProperties}
    >

      {/* ── Fixed navigation ─────────────────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS logo"
          items={magazineNavItems}
          activeHref="/magazine"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
        />
      </div>
      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main
        className="relative z-10"
        style={{ paddingTop: NAV_H, paddingBottom: TICK_H + 8 }}
      >
        {openArticle ? (

          /* ══ Article reader ══════════════════════════════════════════ */
          <div className="pt-8">
            <ArticleReader
              article={openArticle}
              allArticles={articles}
              onBack={() => setOpenSlug(null)}
              onOpenArticle={setOpenSlug}
              onOpenArtist={openArtist}
              lang={lang}
              onLangChange={setLang}
            />
          </div>

        ) : (

          /* ══ Magazine index ══════════════════════════════════════════ */
          <>

            {/* Hero slideshow */}
            <MagazineSlideshow
              articles={slideshowArticles}
              onRead={setOpenSlug}
              topOffset={TOP_OFFSET}
            />

            {/* Section nav — sticks below ticker */}
            <MagazineNav
              active={activeCategory}
              onChange={setActiveCategory}
              onMixtapes={() => router.push("/magazine/mixtapes")}
              lang={lang}
              onLangChange={setLang}
            />

            {/* Masthead row */}
            <div className="border-b border-white/6 bg-black">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
                <div>
                  <h1
                    className="[font-family:var(--font-display)] text-base leading-none tracking-[-0.04em] text-white sm:text-lg"
                  >
                    AXIS Journal
                  </h1>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.44em] text-white/24">
                    Digital culture · Music · Technology
                  </p>
                </div>
                <div className="hidden items-center gap-6 sm:flex">
                  <a
                    href="/magazine/artists"
                    className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/55"
                  >
                    Artists ↗
                  </a>
                  <span className="h-3 w-px bg-white/12" />
                  <a
                    href="/magazine/mixtapes"
                    className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/55"
                  >
                    Mixtapes ↗
                  </a>
                  <span className="h-3 w-px bg-white/12" />
                  <span className="text-[8px] uppercase tracking-[0.38em] text-white/18">
                    Issue 04 · March 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Two-column layout: grid + sidebar */}
            <section className="bg-black">
              <div className="mx-auto max-w-7xl px-4 pt-14 pb-0 sm:px-6">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_272px]">

                  {/* Main article grid */}
                  <div className="min-w-0">
                    <MagazineGrid
                      articles={articles}
                      onOpenArticle={setOpenSlug}
                      onOpenArtist={openArtist}
                      contained
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                    />
                  </div>

                  {/* Sidebar — sticky on desktop, hidden on mobile */}
                  <div className="hidden lg:block">
                    <div className="sticky top-[120px] space-y-0">
                      <MagazineSidebar
                        articles={articles}
                        prices={prices}
                        pricesLoading={pricesLoading}
                        onOpenArticle={setOpenSlug}
                        onCategoryChange={setActiveCategory}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Mobile sidebar — below the grid */}
              <div className="border-t border-white/8 px-4 pt-12 pb-20 sm:px-6 lg:hidden">
                <div className="mx-auto max-w-2xl">
                  <MagazineSidebar
                    articles={articles}
                    prices={prices}
                    pricesLoading={pricesLoading}
                    onOpenArticle={setOpenSlug}
                    onCategoryChange={setActiveCategory}
                  />
                </div>
              </div>
            </section>

          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
