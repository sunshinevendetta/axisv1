"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type ARAppDrop, type ARAppDropStatus } from "@/src/lib/arapp-catalog";
import type { StoreEpisodeSlug } from "@/src/lib/arapp-catalog";

const statusTone: Record<ARAppDropStatus, string> = {
  live: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  "member-access": "border-cyan-400/30 bg-cyan-400/15 text-cyan-300",
  "coming-soon": "border-amber-400/30 bg-amber-400/15 text-amber-300",
  "sold-out": "border-white/12 bg-white/6 text-white/42",
};

const statusLabel: Record<ARAppDropStatus, string> = {
  live: "Live",
  "member-access": "Members",
  "coming-soon": "Soon",
  "sold-out": "Sold Out",
};

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type Episode = { slug: StoreEpisodeSlug; label: string; number: number };

type Props = { episode: Episode; drops: ARAppDrop[] };

export default function ARAppStoreEpisodePage({ episode, drops }: Props) {
  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <div className="border-b border-white/8 bg-[#040406]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-3 pt-24 sm:px-6 sm:pt-28">
          <div>
            <nav className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.28em] text-white/30">
              <Link href="/arapp" className="hover:text-white/54 transition-colors">Store</Link>
              <span>/</span>
              <span className="text-white/50">{episode.label}</span>
            </nav>
            <h1 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-white">{episode.label} — Store</h1>
          </div>
          <div className="hidden gap-5 sm:flex">
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Products</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{drops.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Live</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{drops.filter((d) => d.status === "live").length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {drops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-xs text-white/40">
            No products found for this episode.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drops.map((drop) => (
              <article
                key={drop.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-white/18"
              >
                <Link
                  href={`/arapp/products/${drop.id}`}
                  className="relative block aspect-[4/5] overflow-hidden bg-black/40"
                >
                  <Image
                    src={drop.image}
                    alt={drop.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] ${statusTone[drop.status]}`}>
                      {statusLabel[drop.status]}
                    </span>
                  </div>
                  {drop.remaining > 0 && drop.remaining < 100 && (
                    <div className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.2em] text-white/60">
                      {drop.remaining} left
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  <div className="text-[9px] uppercase tracking-[0.28em] text-white/38">{drop.artist}</div>
                  <Link href={`/arapp/products/${drop.id}`}>
                    <h3 className="mt-1 text-[13px] font-medium leading-snug tracking-[-0.01em] text-white hover:text-white/80">
                      {drop.title}
                    </h3>
                  </Link>
                  <div className="mt-1 text-[11px] text-white/46">{drop.edition}</div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold tracking-[-0.02em] text-white">{fmt.format(drop.priceUsd)}</span>
                    <Link
                      href={`/arapp/products/${drop.id}`}
                      className="rounded-xl border border-white/16 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-black transition-opacity hover:opacity-80"
                    >
                      Buy
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/arapp"
            className="text-[10px] uppercase tracking-[0.26em] text-white/34 hover:text-white/56"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    </main>
  );
}
