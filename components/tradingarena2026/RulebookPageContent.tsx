"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SpotlightCard from "@/components/SpotlightCard";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { TAL_RULEBOOK } from "./rulebook";
import "./arena2026.css";

type RulebookBlock =
  | { id: string; kind: "heading"; level: 1 | 2 | 3; text: string }
  | { id: string; kind: "paragraph"; lines: string[] }
  | { id: string; kind: "list"; items: string[] }
  | { id: string; kind: "table"; headers: string[]; rows: string[][] }
  | { id: string; kind: "rule" };

interface RulebookArticle {
  id: string;
  number: string;
  title: string;
  blocks: RulebookBlock[];
}

interface RulebookSection {
  id: string;
  label: string;
  title: string;
  articles: RulebookArticle[];
}

const KEY_FACTS = [
  { label: "Format", value: "3 phases" },
  { label: "Ranking", value: "Final PnL" },
  { label: "AI team", value: "3 engineers max" },
  { label: "Compute", value: "Equal budgets" },
] as const;

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
          id: `rules-section-${sections.length}`,
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
        id: `rules-section-${sections.length}`,
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
        id: `${currentSection.id}-article-${currentSection.articles.length}`,
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
  if (block.kind === "heading") return block.text;
  return "";
}

function preview(article: RulebookArticle) {
  const text = article.blocks.map(plainText).join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= 150) return text;
  return `${text.slice(0, 147).trim()}...`;
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function RuleBlock({ block }: { block: RulebookBlock }) {
  if (block.kind === "list") {
    return (
      <ul>
        {block.items.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.kind === "table") {
    return (
      <div className="arena-rulebook-table-wrap">
        <table>
          <thead>
            <tr>
              {block.headers.map((header) => (
                <th key={header}>{renderInline(header)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`}>{renderInline(cell)}</td>
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
            {renderInline(line)}
          </span>
        ))}
      </p>
    );
  }

  return null;
}

export default function RulebookPageContent() {
  const sections = useMemo(() => parseSections(TAL_RULEBOOK), []);
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");
  const [activeArticleId, setActiveArticleId] = useState(
    sections[0]?.articles[0]?.id ?? "",
  );
  const activeSection =
    sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const activeArticle =
    activeSection?.articles.find((article) => article.id === activeArticleId) ??
    activeSection?.articles[0];
  const articleCount = sections.reduce((sum, section) => sum + section.articles.length, 0);

  const selectSection = (section: RulebookSection) => {
    setActiveSectionId(section.id);
    setActiveArticleId(section.articles[0]?.id ?? "");
  };

  return (
    <main className="arena2026 arena-rulebook-page">
      <div className="arena-rulebook-page-bg" aria-hidden />

      <header className="arena-rulebook-hero">
        <Link className="arena-rulebook-back" href="/tradingarena2026">
          <FiArrowLeft aria-hidden="true" />
          <span>Back to deck</span>
        </Link>
        <span className="arena-rules-kicker">Trading Arena League</span>
        <h1 className="arena-chrome arena-chrome--live">Official Rulebook</h1>
        <p>
          Sporting and technical regulations for Human, AI and Team competition.
          Built as a separate reference document so the pitch deck stays concise.
        </p>

        <div className="arena-rulebook-facts">
          {KEY_FACTS.map((fact) => (
            <SpotlightCard
              key={fact.label}
              className="arena-rulebook-fact"
              spotlightColor="rgba(244, 245, 247, 0.16)"
            >
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </SpotlightCard>
          ))}
        </div>
      </header>

      <div className="arena-rulebook-layout">
        <aside className="arena-rulebook-sidebar" aria-label="Rulebook sections">
          <div className="arena-rulebook-index-card">
            <span>Version 1.0</span>
            <strong>{articleCount}</strong>
            <small>official entries</small>
          </div>

          <nav>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={section.id === activeSection?.id ? "is-active" : undefined}
                onClick={() => selectSection(section)}
              >
                <span>{section.label}</span>
                <strong>{section.title}</strong>
                <small>{section.articles.length} entries</small>
              </button>
            ))}
          </nav>
        </aside>

        {activeSection ? (
          <section className="arena-rulebook-section">
            <div className="arena-rulebook-section-header">
              <div>
                <span>{activeSection.label}</span>
                <h2>{activeSection.title}</h2>
                <p>Select an article to read the regulation without leaving this section.</p>
              </div>
              <strong>{String(activeSection.articles.length).padStart(2, "0")}</strong>
            </div>

            <div className="arena-rulebook-reader">
              <div className="arena-rulebook-article-list" aria-label="Articles">
                {activeSection.articles.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    className={article.id === activeArticle?.id ? "is-active" : undefined}
                    onClick={() => setActiveArticleId(article.id)}
                  >
                    <span>
                      {article.number ? `Article ${article.number}` : activeSection.label}
                    </span>
                    <strong>{article.title}</strong>
                    <small>{preview(article)}</small>
                  </button>
                ))}
              </div>

              {activeArticle ? (
                <SpotlightCard
                  key={activeArticle.id}
                  className="arena-rulebook-article-detail"
                  spotlightColor="rgba(244, 245, 247, 0.12)"
                >
                  <article>
                    <header>
                      <span>
                        {activeArticle.number
                          ? `Article ${activeArticle.number}`
                          : activeSection.label}
                      </span>
                      <FiChevronRight aria-hidden="true" />
                      <h3>{activeArticle.title}</h3>
                    </header>

                    <div className="arena-rulebook-copy">
                      {activeArticle.blocks.map((block) => (
                        <RuleBlock key={block.id} block={block} />
                      ))}
                    </div>
                  </article>
                </SpotlightCard>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
