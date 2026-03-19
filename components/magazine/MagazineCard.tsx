"use client";

import type { MagazineArticle } from "./types";

const CATEGORY_WATERMARK: Record<string, string> = {
  INTERVIEW: "I",
  NEWS: "N",
  ESSAY: "E",
  CULTURE: "C",
  TECHNOLOGY: "T",
  EVENT: "V",
};

const CATEGORY_GRADIENT: Record<string, string> = {
  INTERVIEW: "linear-gradient(145deg, #0d0d14 0%, #141420 100%)",
  NEWS:      "linear-gradient(145deg, #0c0c0c 0%, #111111 100%)",
  ESSAY:     "linear-gradient(145deg, #0e0d0b 0%, #141310 100%)",
  CULTURE:   "linear-gradient(145deg, #0b0c0e 0%, #10121a 100%)",
  TECHNOLOGY:"linear-gradient(145deg, #0a0c12 0%, #0f1220 100%)",
  EVENT:     "linear-gradient(145deg, #0e0a0e 0%, #160f16 100%)",
};

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
  onClick: (slug: string) => void;
};

export default function MagazineCard({ article, onClick }: Props) {
  const watermark = CATEGORY_WATERMARK[article.category] ?? article.category[0];
  const gradient = CATEGORY_GRADIENT[article.category] ?? "linear-gradient(145deg, #0d0d0d, #111)";

  return (
    <article
      className="group cursor-pointer border border-white/8 bg-black transition-all duration-300 hover:border-white/20"
      onClick={() => onClick(article.slug)}
    >
      {/* Visual block */}
      <div
        className="relative overflow-hidden border-b border-white/8"
        style={{ aspectRatio: "4 / 3", background: gradient }}
      >
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Category watermark */}
        <span className="pointer-events-none absolute right-4 bottom-3 select-none [font-family:var(--font-display)] text-[6rem] leading-none text-white/[0.04] transition-opacity duration-300 group-hover:text-white/[0.07]">
          {watermark}
        </span>
        {/* Issue number indicator */}
        <div className="absolute top-4 left-4 text-[8px] uppercase tracking-[0.4em] text-white/18">
          {article.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Category label */}
        <p className="mb-3 text-[9px] uppercase tracking-[0.38em] text-white/28">
          {article.category}
        </p>

        {/* Title */}
        <h3 className="mb-3 [font-family:var(--font-display)] text-sm leading-[1.1] tracking-[-0.03em] text-white transition-colors duration-200 group-hover:text-white/80 sm:text-[0.95rem]">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="mb-6 line-clamp-2 text-xs leading-5 tracking-wide text-white/40">
          {article.excerpt}
        </p>

        {/* Divider */}
        <div className="mb-4 h-px w-full bg-white/6" />

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-2.5 text-[9px] uppercase tracking-[0.28em] text-white/22">
          <span>{article.author}</span>
          <span className="text-white/12">·</span>
          <span>{formatDate(article.date)}</span>
          <span className="text-white/12">·</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </article>
  );
}
