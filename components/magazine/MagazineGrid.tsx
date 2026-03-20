"use client";

import { useState, useMemo } from "react";
import type { MagazineArticle } from "./types";
import MagazineCard from "./MagazineCard";

const FILTER_CATEGORIES = ["ALL", "INTERVIEW", "NEWS", "ESSAY", "CULTURE", "TECHNOLOGY", "EVENT"];

type Props = {
  articles: MagazineArticle[];
  onOpenArticle: (slug: string) => void;
  onOpenArtist?: (artist: string) => void;
  /** When true, removes the internal max-width container (use inside a parent layout) */
  contained?: boolean;
  /** Controlled active category — passed from MagazineNav */
  activeCategory?: string | null;
  /** Called when internal filter changes */
  onCategoryChange?: (cat: string | null) => void;
};

export default function MagazineGrid({
  articles,
  onOpenArticle,
  onOpenArtist,
  contained = false,
  activeCategory: externalCategory,
  onCategoryChange,
}: Props) {
  const [internalCategory, setInternalCategory] = useState<string | null>(null);

  const isControlled = externalCategory !== undefined;
  const activeCategory = isControlled ? externalCategory : internalCategory;

  const setActiveCategory = (cat: string | null) => {
    setInternalCategory(cat);
    onCategoryChange?.(cat);
  };

  const filtered = useMemo(() => {
    if (!activeCategory) return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  const content = (
    <>
      {/* Internal filter bar — only shown when not controlled by MagazineNav */}
      {!isControlled && (
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/8 pb-8">
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = cat === "ALL" ? !activeCategory : activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === "ALL" ? null : cat)}
                className={`text-[9px] uppercase tracking-[0.38em] transition-colors duration-200 ${
                  isActive ? "text-white" : "text-white/24 hover:text-white/52"
                }`}
              >
                {cat}
                {isActive && (
                  <span className="ml-2 inline-block h-px w-2.5 align-middle bg-white/40" />
                )}
              </button>
            );
          })}
          {activeCategory && (
            <span className="ml-auto text-[9px] uppercase tracking-[0.3em] text-white/18">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Article count when controlled */}
      {isControlled && activeCategory && (
        <p className="mb-6 text-[9px] uppercase tracking-[0.3em] text-white/18">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {filtered.map((article) => (
            <MagazineCard key={article.id} article={article} onClick={onOpenArticle} onOpenArtist={onOpenArtist} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-[10px] uppercase tracking-[0.36em] text-white/24">
            No articles in this category yet.
          </p>
        </div>
      )}
    </>
  );

  if (contained) {
    return <div className="w-full pb-20">{content}</div>;
  }

  return (
    <div className="w-full px-4 pb-28 sm:px-6">
      <div className="mx-auto max-w-6xl">{content}</div>
    </div>
  );
}
