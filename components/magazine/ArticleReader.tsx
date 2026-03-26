"use client";

import Image from "next/image";
import { useState } from "react";
import type { MagazineArticle, ContentBlock, MagazineLang } from "./types";
import { LANG_FLAGS } from "./types";

function formatDate(dateStr: string, lang: MagazineLang) {
  const d = new Date(dateStr);
  const localeMap: Record<MagazineLang, string> = {
    en: "en-US",
    es: "es-MX",
    fr: "fr-FR",
    de: "de-DE",
    ja: "ja-JP",
    ru: "ru-RU",
    zh: "zh-CN",
  };
  return d.toLocaleDateString(localeMap[lang], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Block({ block }: { block: ContentBlock }) {
  if (block.type === "heading") {
    return (
      <h3 className="mt-14 mb-5 [font-family:var(--font-display)] text-base leading-[1.05] tracking-[-0.03em] text-white sm:text-lg">
        {block.text}
      </h3>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className="my-12 border-l-2 border-white/22 pl-7 sm:pl-10">
        <p className="[font-family:var(--font-display)] text-base leading-relaxed tracking-[-0.02em] text-white/70 sm:text-xl sm:leading-8">
          &ldquo;{block.text}&rdquo;
        </p>
      </blockquote>
    );
  }

  return (
    <p className="mb-7 text-sm leading-[1.9] tracking-wide text-white/58 sm:text-[15px] sm:leading-[2]">
      {block.text}
    </p>
  );
}

type RelatedCardProps = {
  article: MagazineArticle;
  onClick: () => void;
};

function RelatedCard({ article, onClick }: RelatedCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col gap-2 border border-white/6 p-4 text-left transition-all duration-200 hover:border-white/16 hover:bg-white/[0.02]"
    >
      <span className="text-[8px] uppercase tracking-[0.4em] text-white/28">
        {article.category}
      </span>
      <span className="text-xs leading-5 tracking-wide text-white/70 transition-colors group-hover:text-white/90 sm:text-sm">
        {article.title}
      </span>
      <span className="text-[8px] uppercase tracking-[0.28em] text-white/22">
        {article.author} · {article.readTime} read
      </span>
    </button>
  );
}

type CommentPlaceholderProps = { lang: MagazineLang };

const COMMENTS_LABEL: Record<MagazineLang, string> = {
  en: "Comments",
  es: "Comentarios",
  fr: "Commentaires",
  de: "Kommentare",
  ja: "コメント",
  ru: "Комментарии",
  zh: "评论",
};
const COMMENTS_EMPTY: Record<MagazineLang, string> = {
  en: "No comments yet. Be the first.",
  es: "Sin comentarios aún. Sé el primero.",
  fr: "Pas encore de commentaires. Soyez le premier.",
  de: "Noch keine Kommentare. Sei der Erste.",
  ja: "まだコメントはありません。最初のコメントを。",
  ru: "Комментариев пока нет. Будьте первым.",
  zh: "暂无评论。成为第一个评论者。",
};

function CommentsSection({ lang }: CommentPlaceholderProps) {
  return (
    <div className="mt-16 border-t border-white/8 pt-12">
      <h4 className="mb-8 text-[10px] uppercase tracking-[0.44em] text-white/32">
        {COMMENTS_LABEL[lang]}
      </h4>
      <div className="flex items-center justify-center border border-white/6 px-6 py-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/18">
          {COMMENTS_EMPTY[lang]}
        </p>
      </div>
    </div>
  );
}

type Props = {
  article: MagazineArticle;
  allArticles: MagazineArticle[];
  onBack: () => void;
  onOpenArticle: (slug: string) => void;
  onOpenArtist?: (artist: string) => void;
  lang: MagazineLang;
  onLangChange: (l: MagazineLang) => void;
};

export default function ArticleReader({
  article,
  allArticles,
  onBack,
  onOpenArticle,
  onOpenArtist,
  lang,
  onLangChange,
}: Props) {
  const t = article.translations?.[lang];
  const title = t?.title ?? article.title;
  const subtitle = t?.subtitle ?? article.subtitle;
  const content = t?.content ?? article.content;

  // Related stories — explicit list first, fallback to same category
  const related = (() => {
    if (article.relatedSlugs?.length) {
      return article.relatedSlugs
        .map((slug) => allArticles.find((a) => a.slug === slug))
        .filter((a): a is MagazineArticle => Boolean(a))
        .slice(0, 3);
    }
    return allArticles
      .filter((a) => a.slug !== article.slug && a.category === article.category)
      .slice(0, 3);
  })();

  // If < 3 related from category, pad with recents
  const relatedFilled = related.length >= 2 ? related : [
    ...related,
    ...allArticles
      .filter((a) => a.slug !== article.slug && !related.find((r) => r.slug === a.slug))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3 - related.length),
  ];

  return (
    <div className="w-full px-4 pt-10 pb-28 sm:px-6">

      {/* ── Article column — narrower luxury width */}
      <div className="mx-auto max-w-[680px]">

        {/* Back */}
        <button
          onClick={onBack}
          className="mb-14 flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-white/28 transition-colors hover:text-white/60"
        >
          <span>←</span> magazine
        </button>

        {/* Category + meta row */}
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="border border-white/12 px-2.5 py-1 text-[8px] uppercase tracking-[0.44em] text-white/50">
            {article.category}
          </span>
          <span className="text-[9px] uppercase tracking-[0.32em] text-white/22">
            {formatDate(article.date, lang)}
          </span>
          <span className="text-[9px] uppercase tracking-[0.32em] text-white/18">
            {article.readTime} read
          </span>
          {/* Lang picker — inline in article */}
          <div className="ml-auto flex items-center gap-0.5">
            {(Object.entries(LANG_FLAGS) as [MagazineLang, { src: string; label: string; alt: string }][]).map(
              ([code, { src, alt }]) => (
                <button
                  key={code}
                  onClick={() => onLangChange(code)}
                  title={code.toUpperCase()}
                  className={`magazine-lang-flag flex h-6 w-8 items-center justify-center px-1 transition-opacity duration-150 ${
                    lang === code ? "opacity-100" : "opacity-20 hover:opacity-55"
                  }`}
                >
                  <Image src={src} alt={alt} width={20} height={14} className="h-[14px] w-5 rounded-[2px] object-cover" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-6 [font-family:var(--font-display)] text-[clamp(1.7rem,4.5vw,3.2rem)] leading-[0.87] tracking-[-0.05em] text-white">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mb-10 text-base leading-7 tracking-wide text-white/44 sm:text-[17px] sm:leading-8">
          {subtitle}
        </p>

        {/* Rule */}
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-[7px] uppercase tracking-[0.5em] text-white/16">AXIS© Journal</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {/* Author */}
        <div className="mb-12 flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center border border-white/10 text-[10px] uppercase tracking-wide text-white/30">
            {article.author.charAt(0)}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/55">{article.author}</p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-white/22">{article.authorRole}</p>
          </div>
        </div>

        {article.linkedArtists?.length ? (
          <div className="mb-12 flex flex-wrap gap-2">
            {article.linkedArtists.map((artist) => (
              <button
                key={artist}
                type="button"
                onClick={() => onOpenArtist?.(artist)}
                className="border border-white/10 px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-white/42 transition-colors hover:text-white/78"
              >
                {artist}
              </button>
            ))}
          </div>
        ) : null}

        {/* Rule */}
        <div className="mb-14 h-px bg-white/6" />

        {/* Body */}
        <div className="article-body">
          {content.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {/* Rule */}
        <div className="mt-16 mb-10 h-px bg-white/8" />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-14 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="border border-white/8 px-2.5 py-1 text-[8px] uppercase tracking-[0.26em] text-white/24 transition-colors hover:border-white/18 hover:text-white/44"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Related stories */}
        {relatedFilled.length > 0 && (
          <div className="mt-4 border-t border-white/8 pt-12">
            <h4 className="mb-6 text-[10px] uppercase tracking-[0.44em] text-white/32">
              Related Stories
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedFilled.map((rel) => (
                <RelatedCard
                  key={rel.slug}
                  article={rel}
                  onClick={() => onOpenArticle(rel.slug)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentsSection lang={lang} />

        {/* Back */}
        <div className="mt-14">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-white/28 transition-colors hover:text-white/60"
          >
            <span>←</span> back to magazine
          </button>
        </div>
      </div>
    </div>
  );
}
