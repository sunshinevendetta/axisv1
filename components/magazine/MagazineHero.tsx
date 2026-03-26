"use client";

import type { MagazineArticle } from "./types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  article: MagazineArticle;
  onRead: (slug: string) => void;
};

export default function MagazineHero({ article, onRead }: Props) {
  return (
    <section className="relative isolate min-h-[80vh] overflow-hidden bg-black">

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 60%, rgba(255,255,255,0.028) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.012) 0%, transparent 50%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-end px-6 pb-16 pt-36 sm:pb-20 sm:pt-44">

        {/* Journal masthead */}
        <div className="mb-10 flex items-center gap-4">
          <span className="text-[9px] uppercase tracking-[0.48em] text-white/24">
            AXIS Journal
          </span>
          <div className="h-px w-10 bg-white/14" />
          <span className="text-[9px] uppercase tracking-[0.34em] text-white/16">
            Cover Story
          </span>
        </div>

        {/* Category */}
        <p className="mb-5 text-[10px] uppercase tracking-[0.38em] text-white/34">
          {article.category}
        </p>

        {/* Title */}
        <h1 className="mb-6 max-w-4xl [font-family:var(--font-display)] text-[clamp(2rem,5vw,4.2rem)] leading-[0.86] tracking-[-0.06em] text-white">
          {article.title}
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-xl text-sm leading-6 tracking-wide text-white/46 sm:text-base sm:leading-7">
          {article.subtitle}
        </p>

        {/* Divider */}
        <div className="mb-8 h-px w-16 bg-white/14" />

        {/* Meta + CTA */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-wrap items-center gap-x-3 text-[10px] uppercase tracking-[0.3em] text-white/28">
            <span>{article.author}</span>
            <span className="text-white/14">·</span>
            <span>{formatDate(article.date)}</span>
            <span className="text-white/14">·</span>
            <span>{article.readTime} read</span>
          </div>

          <button
            onClick={() => onRead(article.slug)}
            className="border border-white/20 px-5 py-2.5 text-[10px] uppercase tracking-[0.34em] text-white transition-colors duration-200 hover:border-white/50 hover:text-white sm:text-[11px]"
          >
            Read Now →
          </button>
        </div>
      </div>
    </section>
  );
}
