"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { MagazineArticle } from "@/components/magazine/types";
import type { MagazineLang } from "@/src/types/magazine";

type Props = {
  articles: MagazineArticle[];
  lang: MagazineLang;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomeMagazineSection({ articles, lang }: Props) {
  // Auto-cycle through the 3 most recent articles
  const featured = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
  const isRussian = lang === "ru";
  const isKorean = lang === "ko";

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
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">Hypermedia</div>
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
          <article
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

            <Link href={`/magazine/${article.slug}`} className="block">
              {article.image_url ? (
                <div className="relative mb-8 overflow-hidden border border-white/8 bg-white/[0.02]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="h-[280px] w-full object-cover opacity-78 transition duration-300 group-hover:scale-[1.01] group-hover:opacity-90 sm:h-[360px]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.18)_45%,rgba(0,0,0,0.68)_100%)]" />
                </div>
              ) : null}

              <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
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

              <h3 className={`mb-4 text-white ${isRussian ? "[font-family:var(--font-bebas)] leading-[0.9] text-[clamp(1.4rem,3.2vw,2.6rem)] tracking-[0.01em]" : isKorean ? "[font-family:var(--font-noto-kr)] font-bold leading-[1.1] text-[clamp(1rem,2.2vw,1.7rem)] tracking-[-0.02em]" : "[font-family:var(--font-display)] leading-[0.9] text-[clamp(1.3rem,2.8vw,2.2rem)] tracking-[-0.05em]"}`}>
                {article.title}
              </h3>
              <p className="mb-8 text-sm leading-7 text-white/44 sm:text-[15px]">
                {article.excerpt}
              </p>
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center border border-white/10 text-[9px] uppercase text-white/30">
                  {article.author.charAt(0)}
                </div>
                <span className="text-[10px] uppercase tracking-[0.28em] text-white/38">{article.author}</span>
              </div>
              <Link
                href={`/magazine/${article.slug}`}
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
          </article>

          {/* Side list — remaining articles */}
          <div className="flex flex-col divide-y divide-white/6">
            {featured.filter((_, i) => i !== active).slice(0, 4).map((art) => (
              <Link
                key={art.slug}
                href={`/magazine/${art.slug}`}
                className="group flex gap-4 py-5 transition-colors first:pt-0"
              >
                {art.image_url ? (
                  <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden border border-white/8 bg-white/[0.02] sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.image_url}
                      alt={art.title}
                      className="h-full w-full object-cover opacity-75 transition duration-300 group-hover:opacity-90"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/20" />
                  </div>
                ) : null}
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-[8px] uppercase tracking-[0.36em] text-white/22">
                    {art.category} · {formatDate(art.date)}
                  </span>
                  <span className={`${isRussian ? "text-[0.7rem] sm:text-[0.78rem]" : "text-sm"} leading-5 tracking-wide text-white/60 transition-colors group-hover:text-white/88`}>
                    {art.title}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.26em] text-white/20">
                    {art.author} · {art.readTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
