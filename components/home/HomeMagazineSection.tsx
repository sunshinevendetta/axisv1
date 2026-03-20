"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { MagazineArticle } from "@/components/magazine/types";

type Props = {
  articles: MagazineArticle[];
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomeMagazineSection({ articles }: Props) {
  // Auto-cycle through the 3 most recent articles
  const featured = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive((i) => (i + 1) % featured.length), [featured.length]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  const article = featured[active];
  if (!article) return null;

  return (
    <section id="magazine" className="border-t border-white/6 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">Journal</div>
            <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white">
              Magazine
            </h2>
          </div>
          <Link
            href="/magazine"
            className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/60"
          >
            read more ↗
          </Link>
        </div>

        {/* Two-col layout */}
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">

          {/* Featured article — auto-cycling */}
          <div
            className="group relative cursor-pointer border border-white/8 p-8 transition-all duration-300 hover:border-white/16 hover:bg-white/[0.015] sm:p-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Progress bar */}
            {!paused && (
              <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
                <div
                  key={active}
                  className="h-full bg-white/30 animate-[progress_5s_linear_forwards]"
                  style={{ width: "100%", transformOrigin: "left" }}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6">
              <span className="border border-white/12 px-2 py-0.5 text-[8px] uppercase tracking-[0.4em] text-white/44">
                {article.category}
              </span>
              <span className="text-[9px] uppercase tracking-[0.28em] text-white/22">
                {formatDate(article.date)}
              </span>
              <span className="text-[9px] uppercase tracking-[0.28em] text-white/16">
                {article.readTime} read
              </span>
            </div>

            <h3 className="mb-4 [font-family:var(--font-display)] text-[clamp(1.3rem,2.8vw,2.2rem)] leading-[0.9] tracking-[-0.05em] text-white">
              {article.title}
            </h3>
            <p className="mb-8 text-sm leading-7 text-white/44 sm:text-[15px]">
              {article.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center border border-white/10 text-[9px] uppercase text-white/30">
                  {article.author.charAt(0)}
                </div>
                <span className="text-[10px] uppercase tracking-[0.28em] text-white/38">{article.author}</span>
              </div>
              <Link
                href="/magazine"
                className="text-[9px] uppercase tracking-[0.32em] text-white/30 transition-colors hover:text-white/60"
              >
                Read →
              </Link>
            </div>

            {/* Dot navigation */}
            <div className="mt-8 flex items-center gap-2">
              {featured.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  className={`h-px transition-all duration-300 ${i === active ? "w-8 bg-white/50" : "w-3 bg-white/16 hover:bg-white/32"}`}
                />
              ))}
            </div>
          </div>

          {/* Side list — remaining articles */}
          <div className="flex flex-col divide-y divide-white/6">
            {featured.filter((_, i) => i !== active).slice(0, 4).map((art) => (
              <Link
                key={art.slug}
                href="/magazine"
                className="group flex flex-col gap-2 py-5 transition-colors first:pt-0"
              >
                <span className="text-[8px] uppercase tracking-[0.36em] text-white/22">
                  {art.category} · {formatDate(art.date)}
                </span>
                <span className="text-sm leading-5 tracking-wide text-white/60 transition-colors group-hover:text-white/88">
                  {art.title}
                </span>
                <span className="text-[9px] uppercase tracking-[0.26em] text-white/20">
                  {art.author} · {art.readTime}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
