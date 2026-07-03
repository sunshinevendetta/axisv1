"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiBookOpen, FiX } from "react-icons/fi";
import { TAL_RULEBOOK } from "./rulebook";

type RulebookBlock =
  | { id: string; kind: "heading"; level: 1 | 2 | 3; text: string }
  | { id: string; kind: "paragraph"; lines: string[] }
  | { id: string; kind: "list"; items: string[] }
  | { id: string; kind: "table"; headers: string[]; rows: string[][] }
  | { id: string; kind: "rule" };

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

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function RulebookContent({ markdown }: { markdown: string }) {
  const blocks = useMemo(() => parseRulebook(markdown), [markdown]);

  return (
    <div className="arena-rulebook">
      {blocks.map((block) => {
        if (block.kind === "rule") {
          return <hr key={block.id} />;
        }

        if (block.kind === "heading") {
          if (block.level === 1) {
            return <h3 key={block.id}>{renderInline(block.text)}</h3>;
          }

          if (block.level === 2) {
            return <h4 key={block.id}>{renderInline(block.text)}</h4>;
          }

          return <h5 key={block.id}>{renderInline(block.text)}</h5>;
        }

        if (block.kind === "list") {
          return (
            <ul key={block.id}>
              {block.items.map((item, itemIndex) => (
                <li key={`${block.id}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.kind === "table") {
          return (
            <div key={block.id} className="arena-rulebook-table-wrap">
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
                    <tr key={`${block.id}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${block.id}-${rowIndex}-${cellIndex}`}>
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={block.id}>
            {block.lines.map((line, index) => (
              <span key={`${block.id}-${index}`}>
                {index > 0 ? <br /> : null}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function RulesDialog() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const dialogId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="arena-rules-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => setOpen(true)}
      >
        <FiBookOpen aria-hidden="true" />
        <span>Official Rules</span>
      </button>

      {open ? (
        <div
          className="arena-rules-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            ref={panelRef}
            id={dialogId}
            className="arena-rules-dialog arena-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
          >
            <header className="arena-rules-header">
              <div>
                <span className="arena-rules-kicker">Trading Arena League</span>
                <h2 id={titleId}>Official Rulebook</h2>
                <p>Version 1.0</p>
              </div>
              <button
                type="button"
                className="arena-rules-close"
                aria-label="Close rules"
                onClick={() => setOpen(false)}
              >
                <FiX aria-hidden="true" />
              </button>
            </header>

            <div className="arena-rules-scroll">
              <RulebookContent markdown={TAL_RULEBOOK} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
