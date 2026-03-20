"use client";

import Link from "next/link";
import type { ARAppDrop } from "@/src/lib/arapp-catalog";

type Props = {
  drops: ARAppDrop[];
};

const STATUS_LABEL: Record<string, string> = {
  live: "Live",
  "member-access": "Members",
  "coming-soon": "Soon",
  "sold-out": "Sold Out",
};

export default function HomeStoreSection({ drops }: Props) {
  const featured = drops.slice(0, 3);

  return (
    <section id="store" className="border-t border-white/6 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">Commerce Layer</div>
            <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white">
              Store
            </h2>
          </div>
          <Link
            href="/arapp"
            className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/60"
          >
            shop now ↗
          </Link>
        </div>

        {/* 3-article grid */}
        <div className="grid gap-px bg-white/6 sm:grid-cols-3">
          {featured.map((drop) => (
            <Link
              key={drop.id}
              href="/arapp"
              className="group flex flex-col justify-between gap-8 bg-black p-7 transition-colors hover:bg-white/[0.02]"
            >
              <div>
                {/* Status chip */}
                <div className="mb-5 flex items-center gap-2">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                    drop.status === "live" ? "bg-white/60" :
                    drop.status === "member-access" ? "bg-white/30" :
                    "bg-white/14"
                  }`} />
                  <span className="text-[8px] uppercase tracking-[0.36em] text-white/28">
                    {STATUS_LABEL[drop.status] ?? drop.status}
                  </span>
                </div>

                <h3 className="mb-2 text-sm leading-5 tracking-wide text-white/72 transition-colors group-hover:text-white/92">
                  {drop.title}
                </h3>
                <p className="text-[11px] leading-5 text-white/34 line-clamp-2">
                  {drop.subtitle}
                </p>
              </div>

              <div className="flex items-end justify-between">
                <div className="text-[9px] uppercase tracking-[0.28em] text-white/28">
                  {drop.edition}
                </div>
                <div className="[font-family:var(--font-display)] text-base tracking-[-0.04em] text-white/56 transition-colors group-hover:text-white/80">
                  ${drop.priceUsd}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/arapp"
            className="border border-white/14 px-8 py-3 text-[10px] uppercase tracking-[0.38em] text-white/48 transition-all hover:border-white/28 hover:text-white/78"
          >
            Browse Full Store
          </Link>
        </div>

      </div>
    </section>
  );
}
