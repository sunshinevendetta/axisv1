import fs from "node:fs/promises";
import path from "node:path";

export type DocumentationEntry = {
  slug: string;
  title: string;
  summary: string;
  section: string;
  sourcePath: string;
  body: string;
  html: string;
};

export const DOC_ARTICLE_CLASSNAME = [
  "max-w-none min-w-0 text-[15px] leading-7 tracking-normal text-white/80 sm:text-[16px] sm:leading-8",
  "[&_a]:break-words [&_a]:text-[#d7e3f3] [&_a]:underline [&_a]:underline-offset-4",
  "[&_code]:break-words [&_code]:rounded-md [&_code]:bg-white/8 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.95em]",
  "[&_.doc-ref]:rounded-md [&_.doc-ref]:border [&_.doc-ref]:border-white/10 [&_.doc-ref]:bg-white/6 [&_.doc-ref]:px-1.5 [&_.doc-ref]:py-0.5 [&_.doc-ref]:font-mono [&_.doc-ref]:text-[0.95em] [&_.doc-ref]:text-[#d7e3f3]",
  "[&_em]:text-white/84 [&_em]:italic [&_strong]:font-semibold [&_strong]:text-white",
  "[&_h1]:mt-0 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:tracking-[-0.03em] [&_h1]:text-white sm:[&_h1]:text-3xl",
  "[&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:tracking-[-0.02em] [&_h2]:text-white sm:[&_h2]:mt-10 sm:[&_h2]:text-2xl",
  "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:text-[#ecf1f7] sm:[&_h3]:mt-8 sm:[&_h3]:text-xl",
  "[&_hr]:my-8 [&_hr]:border-white/10",
  "[&_li]:break-words [&_li]:text-white/72 [&_ol]:my-5 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-2 sm:[&_ol]:ml-5",
  "[&_p]:my-4 [&_p]:break-words [&_pre]:my-5 [&_pre]:overflow-x-hidden [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-black/45 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-[#d7e3f3]",
  "[&_pre_code]:whitespace-pre-wrap [&_pre_code]:break-words [&_ul]:my-5 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-2 sm:[&_ul]:ml-5",
  "[&_img]:my-6 [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:rounded-[20px] [&_img]:border [&_img]:border-white/10 [&_img]:bg-white/4 [&_img]:object-contain",
].join(" ");

const DOC_META: Record<string, { title: string; summary: string; section: string }> = {
  "master-contract-integration": {
    title: "Master Contract Integration Guide",
    section: "Core Docs",
    summary: "The top-level architecture, flow, and integration map for the current contract stack.",
  },
  "owner-access-ops": {
    title: "Owner Access Ops",
    section: "Operations",
    summary: "Deployment, minting, wallet access, and operational guidance for the owner-access ERC-1155.",
  },
  "founder-membership-season1": {
    title: "Founder Membership Season 1",
    section: "Founder Flow",
    summary: "The Season 1 founder membership model, its contract split, and what is still missing.",
  },
  "episodes-automation-architecture": {
    title: "Episodes Automation Architecture",
    section: "Operations",
    summary: "How the episode catalog powers UI, metadata, admin editing, and onchain registry sync.",
  },
  "episode-description-schema": {
    title: "Episode Description Schema",
    section: "Operations",
    summary: "Schema, AI agent prompt, and UI spec for structuring Luma event descriptions into the episodes catalog.",
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeHref(rawHref: string) {
  const href = rawHref.trim();

  const mdMatch =
    href.match(/(?:^|\/)(?:docs\/)?([a-z0-9-]+)\.md$/i) ??
    href.match(/\/docs\/([a-z0-9-]+)\.md$/i);
  if (mdMatch) {
    return `/docs/${mdMatch[1]}`;
  }

  const localRepoPath =
    href.startsWith("/z:/") ||
    href.startsWith("z:/") ||
    href.startsWith("/mnt/") ||
    href.startsWith("content/") ||
    href.startsWith("src/") ||
    href.startsWith("contracts/") ||
    href.startsWith("scripts/");

  if (localRepoPath) {
    return "";
  }

  return href;
}

function normalizeImageSrc(rawSrc: string) {
  const src = rawSrc.trim();

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/") ||
    src.startsWith("./") ||
    src.startsWith("../")
  ) {
    return src;
  }

  return normalizeHref(src);
}

function renderInline(value: string) {
  let output = escapeHtml(value);

  output = output.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, src: string) => {
    const normalizedSrc = normalizeImageSrc(src);
    if (!normalizedSrc) {
      return `<span class="doc-ref">${escapeHtml(alt || "Image")}</span>`;
    }

    return `<img src="${escapeHtml(normalizedSrc)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
  });
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
    const normalizedHref = normalizeHref(href);
    const escapedLabel = escapeHtml(label);

    if (!normalizedHref) {
      return `<span class="doc-ref">${escapedLabel}</span>`;
    }

    return `<a href="${escapeHtml(normalizedHref)}">${escapedLabel}</a>`;
  });
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return output;
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let codeFence: { language: string; lines: string[] } | null = null;
  let tableHeaders: string[] | null = null;
  let tableRows: string[][] = [];

  const closeParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }

    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) {
      return;
    }

    html.push(`</${listType}>`);
    listType = null;
  };

  const closeCodeFence = () => {
    if (!codeFence) {
      return;
    }

    const languageClass = codeFence.language ? ` class="language-${escapeHtml(codeFence.language)}"` : "";
    html.push(
      `<pre><code${languageClass}>${escapeHtml(codeFence.lines.join("\n"))}</code></pre>`,
    );
    codeFence = null;
  };

  const isTableLine = (value: string) => /^\|.*\|$/.test(value);
  const isTableDivider = (value: string) => {
    const cells = value
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  };
  const splitTableRow = (value: string) =>
    value
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

  const closeTable = () => {
    if (!tableHeaders) {
      return;
    }

    const head = tableHeaders
      .map(
        (header) =>
          `<th class="hidden border-b border-white/10 bg-white/6 px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-white/58 sm:table-cell">${renderInline(header)}</th>`,
      )
      .join("");
    const body = tableRows
      .map((row, index) => {
        const cells = tableHeaders
          .map((header, index) => {
            const value = row[index] ?? "";
            return `<td class="block px-4 py-3 align-top text-white/76 before:mb-1 before:block before:text-[10px] before:font-medium before:uppercase before:tracking-[0.16em] before:text-white/42 before:content-[attr(data-label)] sm:table-cell sm:before:hidden" data-label="${escapeHtml(header)}">${renderInline(value)}</td>`;
          })
          .join("");

        return `<tr class="block border-white/10 sm:table-row ${index === 0 ? "" : "border-t"}">${cells}</tr>`;
      })
      .join("");

    html.push(
      `<div class="doc-table my-6 overflow-hidden rounded-[24px] border border-white/10 bg-white/4"><table class="w-full border-collapse text-left text-sm"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`,
    );
    tableHeaders = null;
    tableRows = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (codeFence) {
      if (trimmed.startsWith("```")) {
        closeCodeFence();
      } else {
        codeFence.lines.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      closeParagraph();
      closeList();
      closeTable();
      codeFence = {
        language: trimmed.slice(3).trim(),
        lines: [],
      };
      continue;
    }

    if (trimmed === "") {
      closeParagraph();
      closeList();
      closeTable();
      continue;
    }

    if (isTableLine(trimmed)) {
      closeParagraph();
      closeList();

      if (!tableHeaders) {
        tableHeaders = splitTableRow(trimmed);
        tableRows = [];
        continue;
      }

      if (tableRows.length === 0 && isTableDivider(trimmed)) {
        continue;
      }

      tableRows.push(splitTableRow(trimmed));
      continue;
    }

    closeTable();

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeParagraph();
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      closeParagraph();
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("<ol>");
      }
      html.push(`<li>${renderInline(orderedMatch[1])}</li>`);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      closeParagraph();
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("<ul>");
      }
      html.push(`<li>${renderInline(unorderedMatch[1])}</li>`);
      continue;
    }

    if (/^-{3,}$/.test(trimmed)) {
      closeParagraph();
      closeList();
      html.push("<hr />");
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  closeParagraph();
  closeList();
  closeTable();
  closeCodeFence();

  return html.join("\n");
}

export async function getDocumentationEntries(): Promise<DocumentationEntry[]> {
  const docsDir = path.join(process.cwd(), "docs");
  const entries = await fs.readdir(docsDir);
  const markdownFiles = entries.filter((entry) => entry.endsWith(".md")).sort();

  return Promise.all(
    markdownFiles.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const body = await fs.readFile(path.join(docsDir, fileName), "utf8");
      const meta = DOC_META[slug] ?? {
        title: slug,
        section: "Reference",
        summary: "Project documentation.",
      };

      return {
        slug,
        title: meta.title,
        summary: meta.summary,
        section: meta.section,
        sourcePath: `docs/${fileName}`,
        body,
        html: markdownToHtml(body),
      };
    }),
  );
}

export async function getDocumentationEntry(slug: string) {
  const documents = await getDocumentationEntries();
  return documents.find((document) => document.slug === slug) ?? null;
}
