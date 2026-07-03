"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { SlideProps } from "./content";

const RULES = [
  "3 phases",
  "Equal compute budgets",
  "AI and Human divisions",
  "Autonomous trading only",
  "Official Exchange only",
  "Highest final PnL wins",
] as const;

export default function Slide04RulesSummary({ index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <SlideShell index={index} kicker="Rules" id="slide-rules">
      <div ref={ref} className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
        <div>
          <h2
            data-reveal
            className="arena-chrome arena-chrome--live text-[clamp(1.35rem,2.4vw,2rem)] font-black uppercase leading-tight tracking-tight"
          >
            Competition Rules
          </h2>
          <p
            data-reveal
            className="mt-6 max-w-xl text-sm leading-relaxed text-[var(--arena-silver)] lg:text-base"
          >
            The pitch only needs the operating constraints that define the league:
            equal conditions, autonomous competition, and objective ranking by final PnL.
          </p>
          <blockquote
            data-reveal
            className="mt-8 border-l border-[var(--arena-line)] pl-5 text-sm leading-relaxed text-[var(--arena-steel)]"
          >
            Full Official Sporting & Technical Regulations available in the Rulebook.
          </blockquote>
          <Link
            data-reveal
            className="arena-rulebook-inline-link mt-8 inline-flex items-center gap-2"
            href="/tradingarena2026/rules"
          >
            <span>Open Rulebook</span>
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        <div data-reveal className="arena-rules-summary-grid">
          {RULES.map((rule, index) => (
            <div key={rule} className="arena-panel arena-rules-summary-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{rule}</strong>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
