"use client";

import Link from "next/link";
import type { ARAppDrop } from "@/src/lib/arapp-catalog";

type Props = {
  drops: ARAppDrop[];
};

const STATUS_DOT: Record<string, string> = {
  live: "bg-white/60",
  "member-access": "bg-white/28",
  "coming-soon": "bg-white/14",
  "sold-out": "bg-white/8",
};

export default function HomeFeaturedArtifactsSection({ drops }: Props) {
  const featured = drops.filter((d) => d.status === "live" || d.status === "member-access").slice(0, 4);

  return (
    <section id="artifacts" className="border-t border-white/6 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">Episode Drops</div>
            <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white">
              Featured Artifacts
            </h2>
          </div>
          <Link
            href="/arapp/collect"
            className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/60"
          >
            all artifacts ↗
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="grid gap-px bg-white/6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((drop) => (
            <Link
              key={drop.id}
              href="/arapp/collect"
              className="group flex flex-col gap-5 bg-black p-7 transition-colors hover:bg-white/[0.025]"
            >
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[drop.status] ?? "bg-white/10"}`} />
                <span className="text-[8px] uppercase tracking-[0.36em] text-white/24">
                  {drop.status === "live" ? "Available" : drop.status === "member-access" ? "Members" : drop.status}
                </span>
              </div>

              {/* Format chip */}
              <div className="border border-white/8 px-2.5 py-1 text-[7px] uppercase tracking-[0.28em] text-white/26 self-start">
                {drop.format}
              </div>

              {/* Title */}
              <div>
                <h3 className="text-sm leading-5 tracking-wide text-white/66 transition-colors group-hover:text-white/90">
                  {drop.title}
                </h3>
                <p className="mt-2 text-[11px] leading-5 text-white/30 line-clamp-2">
                  {drop.summary}
                </p>
              </div>

              {/* Price + edition */}
              <div className="mt-auto flex items-end justify-between">
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/22">{drop.edition}</span>
                <span className="[font-family:var(--font-display)] text-base tracking-[-0.04em] text-white/48 transition-colors group-hover:text-white/72">
                  ${drop.priceUsd}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
