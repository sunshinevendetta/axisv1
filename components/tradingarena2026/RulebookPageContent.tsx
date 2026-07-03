"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  FiArrowLeft,
  FiLink,
  FiList,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { TAL_RULEBOOK } from "./rulebook";
import "./arena2026.css";

/* ------------------------------------------------------------------ */
/* Parsing — TAL_RULEBOOK markdown → parts → articles → blocks.        */
/* ------------------------------------------------------------------ */

type RulebookBlock =
  | { id: string; kind: "heading"; level: 1 | 2 | 3; text: string }
  | { id: string; kind: "paragraph"; lines: string[] }
  | { id: string; kind: "list"; items: string[] }
  | { id: string; kind: "table"; headers: string[]; rows: string[][] }
  | { id: string; kind: "deflist"; pairs: Array<{ term: string; def: string }> }
  | { id: string; kind: "rule" };

interface RulebookArticle {
  /** Anchor id, e.g. "article-17" — stable, deep-linkable. */
  id: string;
  number: string;
  title: string;
  blocks: RulebookBlock[];
}

interface RulebookSection {
  /** Anchor id, e.g. "part-x" / "appendix-b". */
  id: string;
  label: string;
  title: string;
  articles: RulebookArticle[];
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function isBlockStart(line: string) {
  const trimmed = line.trim();
  return (
    trimmed === "---" ||
    /^#{1,3}\s+/.test(trimmed) ||
    trimmed.startsWith("* ") ||
    trimmed.startsWith("|")
  );
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseRulebook(markdown: string): RulebookBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: RulebookBlock[] = [];
  let i = 0;

  const nextId = (kind: RulebookBlock["kind"]) => `${kind}-${blocks.length}`;

  while (i < lines.length) {
    const line = lines[i]?.trim() ?? "";

    if (!line) {
      i += 1;
      continue;
    }

    if (line === "---") {
      blocks.push({ id: nextId("rule"), kind: "rule" });
      i += 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({
        id: nextId("heading"),
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      });
      i += 1;
      continue;
    }

    if (line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i]?.trim().startsWith("* ")) {
        items.push(lines[i].trim().replace(/^\*\s+/, ""));
        i += 1;
      }
      blocks.push({ id: nextId("list"), kind: "list", items });
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i]?.trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      const headers = parseTableRow(tableLines[0] ?? "");
      const rows = tableLines
        .slice(2)
        .map(parseTableRow)
        .filter((row) => row.some(Boolean));
      blocks.push({ id: nextId("table"), kind: "table", headers, rows });
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const current = lines[i]?.trim() ?? "";
      if (!current) break;
      if (paragraphLines.length > 0 && isBlockStart(current)) break;
      paragraphLines.push(current);
      i += 1;
    }
    blocks.push({ id: nextId("paragraph"), kind: "paragraph", lines: paragraphLines });
  }

  return blocks;
}

/* Definition articles (Article 6, Appendix A) are written as alternating
   term / definition paragraphs. A term is a short single line without
   terminal punctuation; fold each run of pairs into one definition grid. */
function isTermParagraph(block: RulebookBlock | undefined) {
  return (
    block?.kind === "paragraph" &&
    block.lines.length === 1 &&
    block.lines[0].length <= 32 &&
    block.lines[0].split(/\s+/).length <= 4 &&
    !/[.:,;]$/.test(block.lines[0])
  );
}

function foldDefinitions(blocks: RulebookBlock[]): RulebookBlock[] {
  const out: RulebookBlock[] = [];
  let i = 0;

  while (i < blocks.length) {
    const term = blocks[i];
    const def = blocks[i + 1];
    if (isTermParagraph(term) && def?.kind === "paragraph") {
      const pairs: Array<{ term: string; def: string }> = [];
      while (
        i + 1 < blocks.length &&
        isTermParagraph(blocks[i]) &&
        blocks[i + 1]?.kind === "paragraph"
      ) {
        const t = blocks[i] as Extract<RulebookBlock, { kind: "paragraph" }>;
        const d = blocks[i + 1] as Extract<RulebookBlock, { kind: "paragraph" }>;
        pairs.push({ term: t.lines[0], def: d.lines.join(" ") });
        i += 2;
      }
      out.push({ id: `deflist-${term.id}`, kind: "deflist", pairs });
      continue;
    }
    out.push(blocks[i]);
    i += 1;
  }

  return out;
}

function parseArticleHeading(text: string) {
  const match = /^Article\s+(\d+)\.\s+(.+)$/.exec(text);
  if (!match) return { number: "", title: text };
  return { number: match[1], title: match[2] };
}

function parseSections(markdown: string) {
  const blocks = parseRulebook(markdown);
  const sections: RulebookSection[] = [];
  let currentSection: RulebookSection | null = null;
  let currentArticle: RulebookArticle | null = null;
  let pendingSectionLabel = "";

  const commitArticle = () => {
    if (currentSection && currentArticle) {
      currentArticle.blocks = foldDefinitions(currentArticle.blocks);
      currentSection.articles.push(currentArticle);
    }
    currentArticle = null;
  };

  const commitSection = () => {
    commitArticle();
    if (currentSection && currentSection.articles.length > 0) {
      sections.push(currentSection);
    }
    currentSection = null;
  };

  blocks.forEach((block) => {
    if (block.kind === "heading" && block.level === 1) {
      if (/^(PART|APPENDIX)\b/.test(block.text)) {
        commitSection();
        pendingSectionLabel = block.text;
        return;
      }

      if (pendingSectionLabel) {
        currentSection = {
          id: slugify(pendingSectionLabel),
          label: pendingSectionLabel,
          title: block.text,
          articles: [],
        };
        pendingSectionLabel = "";
        return;
      }
    }

    if (
      block.kind === "heading" &&
      block.level === 2 &&
      pendingSectionLabel.startsWith("APPENDIX")
    ) {
      commitSection();
      currentSection = {
        id: slugify(pendingSectionLabel),
        label: pendingSectionLabel,
        title: block.text,
        articles: [],
      };
      pendingSectionLabel = "";
    }

    if (
      block.kind === "heading" &&
      block.level === 2 &&
      currentSection &&
      (block.text.startsWith("Article ") || currentSection.label.startsWith("APPENDIX"))
    ) {
      commitArticle();
      const { number, title } = parseArticleHeading(block.text);
      currentArticle = {
        id: number ? `article-${number}` : slugify(title),
        number,
        title,
        blocks: [],
      };
      return;
    }

    if (currentArticle && block.kind !== "rule") {
      currentArticle.blocks.push(block);
    }
  });

  commitSection();
  return sections;
}

function plainText(block: RulebookBlock) {
  if (block.kind === "paragraph") return block.lines.join(" ");
  if (block.kind === "list") return block.items.join(" ");
  if (block.kind === "table") return block.rows.flat().join(" ");
  if (block.kind === "deflist")
    return block.pairs.map((pair) => `${pair.term} ${pair.def}`).join(" ");
  if (block.kind === "heading") return block.text;
  return "";
}

/* ------------------------------------------------------------------ */
/* Inline rendering — **bold** plus live search-term highlighting.     */
/* ------------------------------------------------------------------ */

function highlightText(text: string, term: string): ReactNode {
  if (!term) return text;
  const lower = text.toLowerCase();
  const needle = term.toLowerCase();
  if (!lower.includes(needle)) return text;

  const parts: ReactNode[] = [];
  let from = 0;
  let idx = lower.indexOf(needle);
  while (idx !== -1) {
    if (idx > from) parts.push(text.slice(from, idx));
    parts.push(<mark key={idx}>{text.slice(idx, idx + needle.length)}</mark>);
    from = idx + needle.length;
    idx = lower.indexOf(needle, from);
  }
  parts.push(text.slice(from));
  return parts;
}

function renderInline(text: string, term: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{highlightText(part.slice(2, -2), term)}</strong>;
    }
    return <span key={index}>{highlightText(part, term)}</span>;
  });
}

function RuleBlock({ block, term }: { block: RulebookBlock; term: string }) {
  if (block.kind === "list") {
    return (
      <ul>
        {block.items.map((item, index) => (
          <li key={index}>{renderInline(item, term)}</li>
        ))}
      </ul>
    );
  }

  if (block.kind === "deflist") {
    return (
      <dl className="tal-deflist">
        {block.pairs.map((pair) => (
          <div key={pair.term} className="tal-deflist-row">
            <dt>{highlightText(pair.term, term)}</dt>
            <dd>{highlightText(pair.def, term)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (block.kind === "table") {
    return (
      <div className="tal-table-wrap">
        <table>
          <thead>
            <tr>
              {block.headers.map((header) => (
                <th key={header}>{renderInline(header, term)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${rowIndex}-${cellIndex}`}
                    /* DSQ severity is data — the deck's red, never decoration. */
                    className={/\bDSQ\b/.test(cell) ? "tal-dsq" : undefined}
                  >
                    {renderInline(cell, term)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.kind === "paragraph") {
    return (
      <p>
        {block.lines.map((line, index) => (
          <span key={index}>
            {index > 0 ? <br /> : null}
            {renderInline(line, term)}
          </span>
        ))}
      </p>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function RulebookPageContent() {
  const sections = useMemo(() => parseSections(TAL_RULEBOOK), []);

  const searchIndex = useMemo(
    () =>
      sections.flatMap((section) =>
        section.articles.map((article) => ({
          id: article.id,
          hay: [
            article.number ? `article ${article.number}` : "",
            article.number ? `art ${article.number}` : "",
            section.label,
            article.title,
            article.blocks.map(plainText).join(" "),
          ]
            .join(" ")
            .toLowerCase(),
        })),
      ),
    [sections],
  );

  const counts = useMemo(() => {
    const parts = sections.filter((s) => s.label.startsWith("PART")).length;
    const appendices = sections.filter((s) => s.label.startsWith("APPENDIX")).length;
    const articles = sections.reduce(
      (sum, s) => sum + s.articles.filter((a) => a.number).length,
      0,
    );
    return { parts, appendices, articles };
  }, [sections]);

  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const progressRef = useRef<HTMLSpanElement>(null);
  const tocNavRef = useRef<HTMLElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const term = query.trim().length >= 2 ? query.trim() : "";

  const matchIds = useMemo(() => {
    if (!term) return null;
    const needle = term.toLowerCase();
    return new Set(searchIndex.filter((a) => a.hay.includes(needle)).map((a) => a.id));
  }, [term, searchIndex]);

  const visibleSections = useMemo(() => {
    if (!matchIds) return sections;
    return sections
      .map((section) => ({
        ...section,
        articles: section.articles.filter((article) => matchIds.has(article.id)),
      }))
      .filter((section) => section.articles.length > 0);
  }, [sections, matchIds]);

  /* Reading progress — thin hairline across the top of the viewport. */
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Scroll-spy — the top-most article inside the reading band drives the
     table of contents and the mobile position readout. */
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("article[data-tal-article]"),
    );
    if (els.length === 0) return;

    const inView = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.talArticle;
          if (!id) continue;
          if (entry.isIntersecting) inView.add(id);
          else inView.delete(id);
        }
        for (const el of els) {
          const id = el.dataset.talArticle;
          if (id && inView.has(id)) {
            setActiveId(id);
            return;
          }
        }
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleSections]);

  /* Keep the active entry visible inside the TOC rail without touching
     page scroll. */
  useEffect(() => {
    const nav = tocNavRef.current;
    if (!nav || !activeId) return;
    const link = nav.querySelector<HTMLElement>(`[data-toc-article="${activeId}"]`);
    if (!link) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    if (linkRect.top < navRect.top) {
      nav.scrollTop += linkRect.top - navRect.top - 32;
    } else if (linkRect.bottom > navRect.bottom) {
      nav.scrollTop += linkRect.bottom - navRect.bottom + 32;
    }
  }, [activeId]);

  /* Lock body scroll while the mobile contents overlay is open. */
  useEffect(() => {
    if (!tocOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [tocOpen]);

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

  const copyArticleLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    void navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedId(id);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedId(""), 1600);
  };

  const activeArticle = useMemo(() => {
    for (const section of sections) {
      const found = section.articles.find((article) => article.id === activeId);
      if (found) return found;
    }
    return null;
  }, [sections, activeId]);

  const matchCount = matchIds?.size ?? 0;

  const tocNav = (
    <nav
      ref={tocNavRef}
      className="tal-toc-nav"
      aria-label="Rulebook contents"
    >
      {visibleSections.map((section) => {
        /* Appendices parse as a single article that repeats the section
           title — link the section itself, skip the duplicate row. */
        const solo =
          section.articles.length === 1 &&
          section.articles[0].title === section.title;
        return (
          <div key={section.id} className="tal-toc-part">
            <a
              href={`#${solo ? section.articles[0].id : section.id}`}
              className={
                solo && activeId === section.articles[0].id ? "is-active" : undefined
              }
              onClick={() => setTocOpen(false)}
            >
              <span>{section.label}</span>
              <strong>{section.title}</strong>
            </a>
            {!solo &&
              section.articles.map((article) => (
                <a
                  key={article.id}
                  href={`#${article.id}`}
                  data-toc-article={article.id}
                  className={
                    activeId === article.id
                      ? "tal-toc-article is-active"
                      : "tal-toc-article"
                  }
                  onClick={() => setTocOpen(false)}
                >
                  <span aria-hidden>{article.number.padStart(2, "0")}</span>
                  {article.title}
                </a>
              ))}
          </div>
        );
      })}
    </nav>
  );

  const searchField = (
    <div className="tal-search">
      <FiSearch aria-hidden="true" />
      <input
        type="search"
        value={query}
        placeholder="Search the regulations"
        aria-label="Search the regulations"
        onChange={(event) => setQuery(event.target.value)}
      />
      {query ? (
        <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
          <FiX aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );

  return (
    <main className="arena2026 tal-page">
      <div className="tal-page-bg" aria-hidden />

      <div className="tal-progress" aria-hidden>
        <span ref={progressRef} />
      </div>

      <header className="tal-hero">
        <div className="tal-hero-top">
          <Link className="tal-back" href="/tradingarena2026">
            <FiArrowLeft aria-hidden="true" />
            <span>Back to deck</span>
          </Link>
          <span className="tal-version" aria-hidden>
            V 1.0
          </span>
        </div>
        <span className="tal-kicker">Trading Arena League</span>
        <h1 className="arena-chrome arena-chrome--live">Official Rulebook</h1>
        <p>
          Sporting and technical regulations for Human, AI and Team competition.
          Every article is linkable — search, jump from the contents, or read
          straight through.
        </p>
        <div className="tal-hero-meta" aria-label="Document summary">
          <span>{counts.parts} parts</span>
          <span>{counts.articles} articles</span>
          <span>{counts.appendices} appendices</span>
        </div>
      </header>

      {/* Mobile position bar: where you are + a door into the contents. */}
      <div className="tal-mobilebar">
        <button type="button" onClick={() => setTocOpen(true)}>
          <FiList aria-hidden="true" />
          <span>Contents</span>
        </button>
        <span className="tal-mobilebar-pos" aria-live="polite">
          {activeArticle
            ? `${activeArticle.number ? `ART ${activeArticle.number.padStart(2, "0")} · ` : ""}${activeArticle.title}`
            : ""}
        </span>
      </div>

      {tocOpen ? (
        <div
          className="tal-toc-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Rulebook contents"
        >
          <div className="tal-toc-panel">
            <div className="tal-toc-panel-head">
              <strong>Contents</strong>
              <button
                type="button"
                aria-label="Close contents"
                onClick={() => setTocOpen(false)}
              >
                <FiX aria-hidden="true" />
              </button>
            </div>
            {searchField}
            {term ? (
              <span className="tal-search-count">
                {matchCount} {matchCount === 1 ? "match" : "matches"}
              </span>
            ) : null}
            {tocNav}
          </div>
        </div>
      ) : null}

      <div className="tal-layout">
        <aside className="tal-toc" aria-label="Rulebook contents">
          {searchField}
          {term ? (
            <span className="tal-search-count" aria-live="polite">
              {matchCount} {matchCount === 1 ? "article matches" : "articles match"}
            </span>
          ) : null}
          {tocNav}
        </aside>

        <div className="tal-doc">
          {visibleSections.length === 0 ? (
            <div className="tal-empty">
              <p>
                No articles match <strong>“{query.trim()}”</strong>.
              </p>
              <button type="button" onClick={() => setQuery("")}>
                Clear search
              </button>
            </div>
          ) : (
            visibleSections.map((section) => {
              const solo =
                section.articles.length === 1 &&
                section.articles[0].title === section.title;
              return (
                <section key={section.id} id={section.id} className="tal-part">
                  <header className="tal-part-head">
                    <span>{section.label}</span>
                    <h2>{highlightText(section.title, term)}</h2>
                  </header>
                  {section.articles.map((article) => (
                    <article
                      key={article.id}
                      id={article.id}
                      data-tal-article={article.id}
                      className={solo ? "tal-article tal-article--solo" : "tal-article"}
                    >
                      {!solo ? (
                        <header className="tal-article-head">
                          <span className="tal-art-num" aria-hidden>
                            {article.number
                              ? article.number.padStart(2, "0")
                              : "§"}
                          </span>
                          <h3>
                            {article.number ? (
                              <span className="sr-only">
                                Article {article.number}.{" "}
                              </span>
                            ) : null}
                            {highlightText(article.title, term)}
                          </h3>
                          {copiedId === article.id ? (
                            <span className="tal-copied" role="status">
                              Copied
                            </span>
                          ) : null}
                          <a
                            className="tal-anchor"
                            href={`#${article.id}`}
                            aria-label={`Copy link to ${article.title}`}
                            onClick={() => copyArticleLink(article.id)}
                          >
                            <FiLink aria-hidden="true" />
                          </a>
                        </header>
                      ) : null}
                      <div className="tal-article-body">
                        {article.blocks.map((block) => (
                          <RuleBlock key={block.id} block={block} term={term} />
                        ))}
                      </div>
                    </article>
                  ))}
                </section>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
