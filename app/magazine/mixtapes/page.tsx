"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PillNav from "@/components/PillNav";
import { DEFAULT_HYDRA_CONTROLS, HYDRA_CONTROL_GROUPS } from "@/components/magazine/mixtapes/HydraBackground";
import { magazineNavItems } from "@/src/lib/navigation";
import type { Mixtape } from "@/components/magazine/mixtapes/types";
import rawData from "@/content/mixtapes.json";
import { useAllMetadata } from "@/components/magazine/mixtapes/hooks/useAllMetadata";
import { getArtistHref } from "@/src/content/artists";

const MixtapeSelector = dynamic(
  () => import("@/components/magazine/mixtapes/MixtapeSelector"),
  { ssr: false },
);

const MixtapePlayer = dynamic(
  () => import("@/components/magazine/mixtapes/MixtapePlayer"),
  { ssr: false },
);

const mixtapes = rawData as Mixtape[];

export default function MixtapesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hydraControls, setHydraControls] = useState(DEFAULT_HYDRA_CONTROLS);
  const [showHydraControls, setShowHydraControls] = useState(false);

  // Load ID3 metadata (title, artist, cover art) from all Grove URLs
  const metaMap = useAllMetadata(mixtapes.map((m) => m.audioUrl));

  const handleSelect = (idx: number) => {
    setSelected(idx);
    setPlaying(false);
  };

  const mix = mixtapes[selected];
  const openArtist = (artist: string) => router.push(getArtistHref(artist));

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Fixed navigation */}
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS logo"
          items={magazineNavItems}
          activeHref="/magazine/mixtapes"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
        />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col pt-20">

        {/* Back + masthead */}
        <div className="border-b border-white/[0.06] px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/magazine"
                className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/58"
              >
                ← Magazine
              </Link>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-white/18">Mixtapes</span>
            </div>
            {playing && (
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/45" />
                <span className="text-[7px] uppercase tracking-[0.38em] text-white/26">
                  Transmitting
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Page title */}
        <div className="border-b border-white/[0.05] px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-[8px] uppercase tracking-[0.5em] text-white/20">
              AXIS Journal
            </p>
            <h1 className="[font-family:var(--font-display)] text-[clamp(1.33rem,3.325vw,2rem)] leading-[0.9] tracking-[-0.05em] text-white sm:text-[clamp(1.6rem,2vw,2.2rem)]">
              Transmissions
            </h1>
            <p className="mt-4 max-w-md text-xs leading-6 tracking-wide text-white/32 sm:text-sm sm:leading-5">
              Live recordings and mixtapes from AXIS episodes. Generative visuals
              created uniquely for each transmission. Stored on Grove, Base chain.
            </p>

            <div className="mt-6 border border-white/[0.08] bg-white/[0.02] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[8px] uppercase tracking-[0.38em] text-white/24">Visual Mod</div>
                  <p className="mt-2 max-w-xl text-xs leading-5 text-white/38">
                    Keep the transmission clean by default. Open the full Hydra parameter bank only when you want to push the visual live.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHydraControls((current) => !current)}
                  className="border border-white/12 px-4 py-3 text-[9px] uppercase tracking-[0.3em] text-white/62 transition-colors hover:text-white"
                >
                  {showHydraControls ? "Hide Visual Controls" : "Mod Visual"}
                </button>
              </div>

              {showHydraControls ? (
                <div className="mt-5 space-y-3">
                  {HYDRA_CONTROL_GROUPS.map((group) => (
                    <section key={group.title} className="border border-white/[0.08] bg-black/20 p-4">
                      <div className="mb-4 text-[8px] uppercase tracking-[0.38em] text-white/24">{group.title}</div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {group.controls.map((control) => (
                          <label key={control.key} className="border border-white/[0.06] bg-black/20 px-3 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[8px] uppercase tracking-[0.28em] text-white/28">{control.label}</span>
                              <span className="text-[8px] uppercase tracking-[0.18em] text-white/18">
                                {hydraControls[control.key as keyof typeof hydraControls]}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={control.min}
                              max={control.max}
                              step={control.step}
                              value={hydraControls[control.key as keyof typeof hydraControls]}
                              onChange={(event) => {
                                const value = Number(event.target.value);
                                setHydraControls((current) => ({
                                  ...current,
                                  [control.key]: value,
                                }));
                              }}
                              className="mt-3 h-px w-full cursor-pointer appearance-none bg-white/12 accent-white/60"
                            />
                          </label>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-7xl">

            {/* Main card — selector stacked above player */}
            <div
              className="border border-white/[0.07] mixtape-card"
              style={{
                boxShadow: playing
                  ? `0 0 0 1px ${mix.accentColor}40, 0 0 80px ${mix.accentColor}18, inset 0 0 60px rgba(255,255,255,0.01)`
                  : "0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(255,255,255,0.015), inset 0 0 60px rgba(255,255,255,0.008)",
                transition: "box-shadow 1.2s ease",
              }}
            >
              {/* Top section — Hydra visual + track selection */}
              <MixtapeSelector
                mixtapes={mixtapes}
                selected={selected}
                playing={playing}
                onSelect={handleSelect}
                metaMap={metaMap}
                onOpenArtist={openArtist}
                hydraControls={hydraControls}
              />

              {/* Bottom section — player controls (full width) */}
              <div className="border-t border-white/[0.06]">
                <MixtapePlayer
                  mixtape={mix}
                  meta={metaMap[selected] ?? null}
                  onPlayStateChange={setPlaying}
                  onOpenArtist={openArtist}
                />
              </div>
            </div>

            {/* PSX hint bar */}
            <div className="mt-3 flex items-center justify-between px-1">
              <div className="flex gap-5">
                <span className="text-[7px] uppercase tracking-[0.34em] text-white/14">↑ ↓ Navigate</span>
                <span className="text-[7px] uppercase tracking-[0.34em] text-white/14">↵ Select</span>
                <span className="text-[7px] uppercase tracking-[0.34em] text-white/14">← Back</span>
              </div>
              <span className="text-[7px] uppercase tracking-[0.32em] text-white/10">
                AXIS · Transmissions
              </span>
            </div>

          </div>
        </div>

        {/* Footer strip */}
        <div className="border-t border-white/[0.06] px-4 py-5 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link
              href="/magazine"
              className="text-[8px] uppercase tracking-[0.36em] text-white/20 transition-colors hover:text-white/48"
            >
              ← Back to Magazine
            </Link>
            <p className="text-[7px] uppercase tracking-[0.32em] text-white/12">
              AXIS<span className="copy-mark">©</span> {new Date().getFullYear()} · AXIS Labs
            </p>
          </div>
        </div>

      </main>

    </div>
  );
}
