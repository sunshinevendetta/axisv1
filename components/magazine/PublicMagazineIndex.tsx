"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MagazineNav from "@/components/magazine/MagazineNav";
import MagazineSlideshow from "@/components/magazine/MagazineSlideshow";
import DomeGallery from "@/components/magazine/DomeGallery";
import MagazinePageChrome, {
  MAGAZINE_NAV_HEIGHT,
  MAGAZINE_TICKER_HEIGHT,
} from "@/components/magazine/MagazinePageChrome";
import { useMagazineLanguage } from "@/hooks/useMagazineLanguage";
import { getArtistHref, artistProfiles } from "@/src/content/artists";
import { localizeMagazineArticle } from "@/src/lib/magazine-localization";
import type { MagazineArticle } from "@/src/types/magazine";
import rawMixtapes from "@/content/mixtapes.json";
import ShopCarousel from "@/components/magazine/ShopCarousel";

type Props = {
  articles: MagazineArticle[];
};

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Up to 6 featured artists for the index row
const FEATURED_ARTISTS = artistProfiles
  .filter((a) => a.featured || a.fromEpisode)
  .slice(0, 6);

// Mixtapes for the horizontal row
const MIXTAPES = (rawMixtapes as Array<{
  id: number;
  slug: string;
  title: string;
  artist: string;
  tags: string[];
  accentColor: string;
  date: string;
}>).slice(0, 6);

export default function PublicMagazineIndex({ articles }: Props) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [sidebarCycle, setSidebarCycle] = useState(0);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const { lang, setLang } = useMagazineLanguage();

  const localizedArticles = useMemo(
    () => articles.map((article) => localizeMagazineArticle(article, lang)),
    [articles, lang],
  );

  const slideshowArticles = useMemo(
    () => [...localizedArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [localizedArticles],
  );

  const filteredArticles = useMemo(
    () => (activeCategory ? localizedArticles.filter((article) => article.category === activeCategory) : localizedArticles),
    [localizedArticles, activeCategory],
  );

  const archiveGalleryImages = useMemo(
    () =>
      [...filteredArticles]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .filter((article) => Boolean(article.image_url))
        .map((article) => ({
          src: article.image_url as string,
          alt: `${article.title} by ${article.author}`,
          title: article.title,
          subtitle: article.subtitle || article.excerpt,
          href: `/magazine/${article.slug}`,
          ctaLabel: "Read More",
        })),
    [filteredArticles],
  );

  useEffect(() => {
    if (slideshowArticles.length === 0) {
      setHeroIndex(0);
      return;
    }
    setHeroIndex((current) => Math.min(current, slideshowArticles.length - 1));
  }, [slideshowArticles.length]);

  useEffect(() => {
    if (slideshowArticles.length <= 1) return;
    if (sidebarHovered) return;
    const id = window.setInterval(() => {
      setSidebarCycle((current) => current + 1);
    }, 8200);
    return () => window.clearInterval(id);
  }, [sidebarHovered, slideshowArticles.length]);

  // Hero sidebar: 3 rotating teasers that intentionally do not mirror the slideshow order.
  const heroSidebar = useMemo(() => {
    if (slideshowArticles.length <= 1) return [];

    const used = new Set<number>([heroIndex]);
    const picks: Array<{ article: MagazineArticle; index: number }> = [];
    const steps = [2, 3, 5];
    let cursor = (heroIndex + 1 + ((sidebarCycle * 2 + 1) % slideshowArticles.length)) % slideshowArticles.length;
    let guard = 0;

    while (picks.length < Math.min(3, slideshowArticles.length - 1) && guard < slideshowArticles.length * 4) {
      if (!used.has(cursor)) {
        picks.push({ article: slideshowArticles[cursor], index: cursor });
        used.add(cursor);
      }

      const step = steps[(sidebarCycle + picks.length + guard) % steps.length];
      cursor = (cursor + step) % slideshowArticles.length;
      guard += 1;
    }

    return picks;
  }, [heroIndex, sidebarCycle, slideshowArticles]);

  // Editorial grid: 6 articles
  const editorialArticles = filteredArticles.slice(0, 6);

  // Most read: top 4 (use newest as proxy)
  const mostRead = [...filteredArticles].slice(0, 4);

  const openArticle = (slug: string) => router.push(`/magazine/${slug}`);
  const openArtist = (artist: string) => router.push(getArtistHref(artist));

  if (localizedArticles.length === 0) {
    return (
      <MagazinePageChrome>
        <section
          className="flex min-h-[calc(100vh-88px)] items-center justify-center px-6"
          style={{ paddingBottom: MAGAZINE_TICKER_HEIGHT + 24 }}
        >
          <div className="max-w-xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/28">
              Editorial index unavailable
            </div>
            <h1 className="mt-5 [font-family:var(--font-display)] text-[clamp(1.5rem,4vw,3rem)] leading-[0.9] tracking-[-0.05em] text-white">
              No published stories are ready yet.
            </h1>
            <p className="mt-5 text-sm leading-7 text-white/48">
              The public magazine is waiting on a published editorial index. Once stories are approved and mirrored,
              they will land here without a runtime API dependency.
            </p>
          </div>
        </section>
      </MagazinePageChrome>
    );
  }

  return (
      <MagazinePageChrome>

      {/* ── 01 HERO CANVAS ────────────────────────────────────────────────── */}
      <div
        className="relative"
        style={{ marginTop: -MAGAZINE_NAV_HEIGHT }}
      >
        <MagazineSlideshow
          articles={slideshowArticles}
          onRead={openArticle}
          topOffset={MAGAZINE_TICKER_HEIGHT}
          currentIndex={heroIndex}
          onIndexChange={setHeroIndex}
          forcePaused={sidebarHovered}
        />

        {/* Desktop sidebar overlaid on the right of the hero */}
        {heroSidebar.length > 0 && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-30 hidden w-[280px] flex-col justify-end xl:flex">
            <div
              className="pointer-events-auto divide-y divide-white/8 border-l border-white/8 bg-black/80 backdrop-blur-sm"
              onMouseEnter={() => setSidebarHovered(true)}
              onMouseLeave={() => setSidebarHovered(false)}
            >
              {heroSidebar.map(({ article, index }, i) => {
                const LABELS = ["FEATURE", "EXCLUSIVE", "AXIS SELECT"];
                return (
                  <Link
                    key={article.slug}
                    href={`/magazine/${article.slug}`}
                    onMouseEnter={() => setHeroIndex(index)}
                    className="group flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 text-[7px] uppercase tracking-[0.44em] text-white/26">
                        {LABELS[i] ?? article.category}
                      </div>
                      <div className="text-[11px] font-medium uppercase leading-[1.25] tracking-[0.02em] text-white/80 transition-colors group-hover:text-white line-clamp-2">
                        {article.title}
                      </div>
                      <div className="mt-1.5 text-[8px] uppercase tracking-[0.28em] text-white/28">
                        READ →
                      </div>
                    </div>
                    {article.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="h-14 w-14 flex-none object-cover opacity-70 transition-opacity group-hover:opacity-90"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 03 SIGNAL STRIP / CATEGORY NAV ──────────────────────────────── */}
      <MagazineNav
        active={activeCategory}
        onChange={setActiveCategory}
        onMixtapes={() => router.push("/magazine/mixtapes")}
        lang={lang}
        onLangChange={setLang}
      />

      {/* ── 04 SHOP CAROUSEL ─────────────────────────────────────────────── */}
      <ShopCarousel lang={lang} />

      {/* ── 05 MIXTAPES / AUDIO ──────────────────────────────────────────── */}
      <section className="border-b border-white/6 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="[font-family:var(--font-display)] text-[clamp(0.9rem,1.8vw,1.15rem)] leading-none tracking-[-0.04em] text-white uppercase">
              AXIS Mixtapes
            </h2>
            <Link
              href="/magazine/mixtapes"
              className="text-[8px] uppercase tracking-[0.38em] text-white/28 transition-colors hover:text-white/58"
            >
              View All Mixtapes →
            </Link>
          </div>

          <div className="scrollbar-none -mx-4 flex gap-px overflow-x-auto px-4 sm:-mx-0 sm:px-0">
            {MIXTAPES.map((mix) => (
              <Link
                key={mix.id}
                href="/magazine/mixtapes"
                className="group relative flex-none w-[168px] sm:w-[200px] border border-white/8 bg-black transition-colors hover:border-white/20"
              >
                {/* Visual block */}
                <div
                  className="relative flex h-[110px] sm:h-[130px] items-center justify-center overflow-hidden border-b border-white/8"
                  style={{ background: `radial-gradient(ellipse at 50% 80%, ${mix.accentColor}88 0%, #000 70%)` }}
                >
                  {/* Play icon */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/60 transition-all group-hover:border-white/50 group-hover:text-white">
                    <svg className="ml-0.5 h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2 1.5l9 4.5-9 4.5V1.5z" />
                    </svg>
                  </div>
                  <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                </div>

                <div className="p-3">
                  <p className="text-[7px] uppercase tracking-[0.36em] text-white/24 mb-1 truncate">
                    {mix.tags[0] ?? "Electronic"}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide leading-[1.2] text-white/70 group-hover:text-white transition-colors line-clamp-2">
                    {mix.title}
                  </p>
                  <p className="mt-2 text-[8px] uppercase tracking-[0.28em] text-white/32">
                    {mix.artist}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 EDITORIAL GRID ────────────────────────────────────────────── */}
      <section className="border-b border-white/6 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="[font-family:var(--font-display)] text-[clamp(0.9rem,1.8vw,1.15rem)] leading-none tracking-[-0.04em] text-white uppercase">
              Editorial
            </h2>
            <Link
              href="/magazine"
              onClick={() => setActiveCategory(null)}
              className="text-[8px] uppercase tracking-[0.38em] text-white/28 transition-colors hover:text-white/58"
            >
              View All Articles →
            </Link>
          </div>

          <div className="grid gap-px bg-white/6 sm:grid-cols-2 lg:grid-cols-3">
            {editorialArticles.map((article) => (
              <button
                key={article.slug}
                onClick={() => openArticle(article.slug)}
                className="group bg-black text-left transition-colors hover:bg-white/[0.025]"
              >
                {article.image_url ? (
                  <div className="relative h-[160px] w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="h-full w-full object-cover opacity-65 transition-opacity group-hover:opacity-80"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.028]"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="h-[160px] w-full"
                    style={{ background: "linear-gradient(145deg,#0d0d14,#000)" }}
                  />
                )}
                <div className="p-4 sm:p-5">
                  <p className="mb-1.5 text-[7px] uppercase tracking-[0.42em] text-white/26">
                    {article.category}
                  </p>
                  <h3 className="text-[13px] leading-[1.3] tracking-[-0.02em] text-white/75 transition-colors group-hover:text-white line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-white/22">
                    {formatShortDate(article.date)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 09 MOST READ + 10 ARTIST INDEX ──────────────────────────────── */}
      <section className="border-b border-white/6 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2">

            {/* Most Read */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="[font-family:var(--font-display)] text-[clamp(0.9rem,1.8vw,1.15rem)] leading-none tracking-[-0.04em] text-white uppercase">
                  Most Read
                </h2>
                <Link
                  href="/magazine"
                  onClick={() => setActiveCategory(null)}
                  className="text-[8px] uppercase tracking-[0.38em] text-white/28 transition-colors hover:text-white/58"
                >
                  View All Articles →
                </Link>
              </div>

              <div className="space-y-0 divide-y divide-white/6">
                {mostRead.map((article, i) => (
                  <button
                    key={article.slug}
                    onClick={() => openArticle(article.slug)}
                    className="group flex w-full items-start gap-4 py-4 text-left first:pt-0 last:pb-0"
                  >
                    <span className="w-5 flex-none tabular-nums text-[10px] text-white/18 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[7px] uppercase tracking-[0.36em] text-white/22">
                        {article.category} · {formatShortDate(article.date)}
                      </p>
                      <p className="text-[13px] leading-[1.3] tracking-[-0.02em] text-white/68 transition-colors group-hover:text-white line-clamp-2">
                        {article.title}
                      </p>
                    </div>
                    {article.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="h-12 w-12 flex-none object-cover opacity-60 transition-opacity group-hover:opacity-85"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Artist Index */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="[font-family:var(--font-display)] text-[clamp(0.9rem,1.8vw,1.15rem)] leading-none tracking-[-0.04em] text-white uppercase">
                  Artist Index
                </h2>
                <Link
                  href="/magazine/artists"
                  className="text-[8px] uppercase tracking-[0.38em] text-white/28 transition-colors hover:text-white/58"
                >
                  View All Artists →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-px bg-white/6 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
                {FEATURED_ARTISTS.map((artist) => (
                  <button
                    key={artist.slug}
                    onClick={() => openArtist(artist.name)}
                    className="group bg-black text-left transition-colors hover:bg-white/[0.025]"
                  >
                    <div className="relative overflow-hidden border-b border-white/6" style={{ aspectRatio: "1 / 1" }}>
                      {artist.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={artist.profileImage}
                          alt={artist.name}
                          className="h-full w-full object-cover opacity-65 transition-opacity group-hover:opacity-85"
                        />
                      ) : (
                        <div className="h-full w-full bg-white/[0.03]" />
                      )}
                    </div>
                    <div className="p-2 sm:p-3">
                      <p className="text-[9px] uppercase tracking-[0.28em] text-white/62 group-hover:text-white transition-colors truncate">
                        {artist.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 11 ARCHIVE ACCESS ────────────────────────────────────────────── */}
      <section className="border-b border-white/6 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <button
            onClick={() => {
              setActiveCategory(null);
              document.getElementById("axis-archive-grid")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative flex w-full items-center justify-between overflow-hidden border border-white/8 bg-white/[0.015] p-8 transition-colors hover:border-white/20 hover:bg-white/[0.03] sm:p-10"
          >
            <div>
              <p className="mb-2 text-[8px] uppercase tracking-[0.48em] text-white/24">
                Archive
              </p>
              <h2 className="[font-family:var(--font-display)] text-[clamp(1.1rem,2.5vw,2rem)] leading-[0.92] tracking-[-0.04em] text-white">
                Explore the Archive
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/38">
                Dive into all stories, drops and culture.
              </p>
            </div>
            <span className="flex h-12 w-12 flex-none items-center justify-center border border-white/16 text-white/50 transition-colors group-hover:border-white/40 group-hover:text-white">
              →
            </span>
          </button>
        </div>
      </section>

      {/* Archive grid (shown after scroll-into-view) */}
      <section id="axis-archive-grid" className="border-b border-white/6 bg-black">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-2 sm:px-6">
          {archiveGalleryImages.length > 0 ? (
            <div className="relative overflow-hidden border border-white/8 bg-black/60">
              <div className="border-b border-white/8 px-5 py-4">
                <p className="text-[8px] uppercase tracking-[0.42em] text-white/24">Archive Dome</p>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-white/42 sm:text-sm">
                  Drag through the archive and open images for a closer look. The dome is populated from the current article selection.
                </p>
              </div>
              <div className="relative h-[520px] sm:h-[620px] lg:h-[760px]">
                <DomeGallery
                  images={archiveGalleryImages}
                  fit={0.42}
                  fitBasis="auto"
                  minRadius={460}
                  padFactor={0.12}
                  overlayBlurColor="#050505"
                  maxVerticalRotationDeg={4}
                  dragSensitivity={24}
                  dragDampening={0.78}
                  openedImageWidth="min(70vw, 520px)"
                  openedImageHeight="min(70vw, 520px)"
                  imageBorderRadius="24px"
                  openedImageBorderRadius="28px"
                  grayscale={false}
                />
              </div>
            </div>
          ) : (
            <div className="border border-white/8 bg-white/[0.02] px-5 py-10 text-center text-sm text-white/42">
              No archive imagery is available for this filter yet.
            </div>
          )}
        </div>
      </section>

      {/* ── 12 NEWSLETTER ────────────────────────────────────────────────── */}
      <section className="border-b border-white/6 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="[font-family:var(--font-display)] text-[clamp(0.9rem,1.8vw,1.15rem)] leading-none tracking-[-0.04em] text-white uppercase mb-1">
                Stay in the Signal
              </h2>
              <p className="text-xs tracking-wide text-white/36">
                Exclusive drops, stories and events. Straight to your inbox.
              </p>
            </div>
            <form
              className="flex w-full max-w-sm gap-0"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                suppressHydrationWarning
                className="flex-1 border border-white/12 bg-white/[0.03] px-4 py-2.5 text-[11px] tracking-wide text-white placeholder:text-white/28 outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="border border-l-0 border-white/20 bg-white px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-black transition-colors hover:bg-white/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

    </MagazinePageChrome>
  );
}

