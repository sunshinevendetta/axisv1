"use client";

import Link from "next/link";
import type { MagazineArticle } from "@/components/magazine/types";

type Props = {
  articles: MagazineArticle[];
};

// Spaces are articles tagged with EVENT or CULTURE categories
function getSpaceArticles(articles: MagazineArticle[]) {
  return articles
    .filter((a) => a.category === "EVENT" || a.category === "CULTURE")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomeSpacesSection({ articles }: Props) {
  const spaces = getSpaceArticles(articles);

  // Always show at least 4 slots
  const fillerCount = Math.max(0, 4 - spaces.length);

  return (
    <section id="spaces" className="border-t border-white/6 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">Places · Events · Venues</div>
            <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white">
              Spaces
            </h2>
          </div>
          <Link
            href="/magazine"
            className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/60"
          >
            explore ↗
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-px bg-white/6 sm:grid-cols-2 lg:grid-cols-4">
          {spaces.map((article) => (
            <Link
              key={article.slug}
              href="/magazine"
              className="group flex flex-col justify-between gap-6 bg-black p-7 transition-colors hover:bg-white/[0.02]"
            >
              <div>
                <div className="mb-4 text-[8px] uppercase tracking-[0.36em] text-white/24">
                  {article.category} · {formatDate(article.date)}
                </div>
                <h3 className="text-sm leading-5 tracking-wide text-white/68 transition-colors group-hover:text-white/90">
                  {article.title}
                </h3>
                <p className="mt-3 text-[11px] leading-5 text-white/36 line-clamp-3">
                  {article.excerpt}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="border border-white/8 px-2 py-0.5 text-[7px] uppercase tracking-[0.24em] text-white/22">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}

          {/* Filler slots */}
          {Array.from({ length: fillerCount }).map((_, i) => (
            <div key={`filler-${i}`} className="flex flex-col gap-4 bg-black p-7">
              <div className="h-2 w-24 bg-white/[0.04]" />
              <div className="h-3 w-40 bg-white/[0.04]" />
              <div className="h-2 w-32 bg-white/[0.03]" />
              <div className="mt-auto flex gap-1.5">
                <div className="h-4 w-12 border border-white/[0.04]" />
                <div className="h-4 w-10 border border-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-white/6 pt-6">
          <p className="text-[9px] uppercase tracking-[0.32em] text-white/18">
            Activated locations · Documented in the journal
          </p>
        </div>
      </div>
    </section>
  );
}
