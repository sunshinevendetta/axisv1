import fs from "node:fs/promises";
import path from "node:path";
import { getPlantUmlSvgUrl } from "@/src/lib/plantuml";

export type DiagramEntry = {
  slug: string;
  title: string;
  summary: string;
  section: string;
  source: string;
  imageUrl: string;
};

const DIAGRAM_META: Record<string, { summary: string; section: string }> = {
  "full-architecture": {
    section: "System Map",
    summary: "Top-level relationship map between the app, episode catalog, and all core contracts.",
  },
  "founder-mint-lifecycle": {
    section: "Founder Flow",
    summary: "Submission approval and Season 1 founder membership mint lifecycle.",
  },
  "owner-auth-lifecycle": {
    section: "Access Control",
    summary: "Wallet challenge, token verification, and owner dashboard session issuance.",
  },
  "episode-sync-lifecycle": {
    section: "Operations",
    summary: "How the episode catalog becomes onchain event registry state.",
  },
};

function toTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getDiagrams(): Promise<DiagramEntry[]> {
  const diagramsDir = path.join(process.cwd(), "docs", "diagrams");
  const entries = await fs.readdir(diagramsDir);
  const pumlFiles = entries.filter((entry) => entry.endsWith(".puml")).sort();

  return Promise.all(
    pumlFiles.map(async (fileName) => {
      const slug = fileName.replace(/\.puml$/, "");
      const source = await fs.readFile(path.join(diagramsDir, fileName), "utf8");
      const meta = DIAGRAM_META[slug] ?? {
        section: "Reference",
        summary: "PlantUML reference diagram.",
      };

      return {
        slug,
        title: toTitle(slug),
        summary: meta.summary,
        section: meta.section,
        source,
        imageUrl: getPlantUmlSvgUrl(source),
      };
    }),
  );
}
