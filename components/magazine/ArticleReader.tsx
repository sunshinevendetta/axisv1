"use client";

import type { MagazineArticle, ContentBlock } from "./types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Block({ block }: { block: ContentBlock }) {
  if (block.type === "heading") {
    return (
      <h3 className="mt-12 mb-5 [font-family:var(--font-display)] text-sm leading-[1.1] tracking-[-0.03em] text-white sm:text-base">
        {block.text}
      </h3>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className="my-10 border-l border-white/18 pl-6 sm:pl-8">
        <p className="text-sm leading-7 tracking-wide text-white/55 sm:text-base sm:leading-8">
          &ldquo;{block.text}&rdquo;
        </p>
      </blockquote>
    );
  }

  return (
    <p className="mb-6 text-xs leading-6 tracking-wide text-white/52 sm:text-sm sm:leading-7">
      {block.text}
    </p>
  );
}

type Props = {
  article: MagazineArticle;
  onBack: () => void;
};

export default function ArticleReader({ article, onBack }: Props) {
  return (
    <div className="w-full px-4 pt-10 pb-28 sm:px-6">
      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <button
          onClick={onBack}
          className="mb-12 flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-white/36 transition-colors hover:text-white/68"
        >
          <span>←</span> magazine
        </button>

        {/* Category + date */}
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.34em] text-white/32">
          <span>{article.category}</span>
          <span className="text-white/16">·</span>
          <span>{formatDate(article.date)}</span>
          <span className="text-white/16">·</span>
          <span>{article.readTime} read</span>
        </div>

        {/* Title */}
        <h1 className="mb-5 [font-family:var(--font-display)] text-[clamp(1.4rem,3.5vw,2.6rem)] leading-[0.88] tracking-[-0.05em] text-white">
          {article.title}
        </h1>

        {/* Subtitle */}
        <p className="mb-10 text-sm leading-6 tracking-wide text-white/46 sm:text-base sm:leading-7">
          {article.subtitle}
        </p>

        {/* Divider */}
        <div className="mb-8 h-px w-full bg-white/8" />

        {/* Author */}
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.34em] text-white/46">{article.author}</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/22">{article.authorRole}</p>
        </div>

        {/* Divider */}
        <div className="mb-12 h-px w-full bg-white/8" />

        {/* Article body */}
        <div>
          {article.content.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {/* Divider */}
        <div className="mt-14 mb-10 h-px w-full bg-white/8" />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-12 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.24em] text-white/28"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-white/36 transition-colors hover:text-white/68"
        >
          <span>←</span> back to magazine
        </button>
      </div>
    </div>
  );
}
