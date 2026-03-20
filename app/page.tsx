"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";

import AboutSection from "@/components/AboutSection";
import EpisodesSection from "@/components/EpisodesSection";
import Footer from "@/components/Footer";
import Logo3D from "@/components/Logo3d";
import LogoArray from "@/components/Logos/LogoArray";
import PillNav from "@/components/PillNav";
import CountdownSection from "@/components/CountdownSection";
import PageGradualBlur from "@/components/PageGradualBlur";
import SubmitSection from "@/components/SubmitSection";
import ArtistWorldPanel from "@/components/magazine/ArtistWorldPanel";

import HomeFeaturedArtifactsSection from "@/components/home/HomeFeaturedArtifactsSection";
import HomeMixtapesSection from "@/components/home/HomeMixtapesSection";
import HomeMagazineSection from "@/components/home/HomeMagazineSection";
import HomeArtistsSection from "@/components/home/HomeArtistsSection";
import HomeSpacesSection from "@/components/home/HomeSpacesSection";
import HomeStoreSection from "@/components/home/HomeStoreSection";
import HomeCollectSection from "@/components/home/HomeCollectSection";

import { homeNavItems } from "@/src/lib/navigation";
import { getUpcomingEpisodes } from "@/src/lib/episodes";
import { artistWorldProfiles, findArtistWorldProfile } from "@/src/content/world-expansion";
import { arappDrops } from "@/src/lib/arapp-catalog";

import type { Mixtape } from "@/components/magazine/mixtapes/types";
import type { MagazineArticle } from "@/components/magazine/types";
import rawMixtapes from "@/content/mixtapes.json";
import rawArticles from "@/content/magazine.json";

const GatedMembershipFlow = dynamic(() => import("@/components/GatedMembershipFlow"), {
  loading: () => <div className="min-h-[40vh]" />,
  ssr: false,
});

const HomePersistentPlayer = dynamic(() => import("@/components/home/HomePersistentPlayer"), {
  ssr: false,
});

const mixtapes = rawMixtapes as Mixtape[];
const articles = rawArticles as MagazineArticle[];
const upcomingEpisodes = getUpcomingEpisodes().map((ep) => ({
  title: ep.title,
  startsAtISO: ep.startsAt,
  city: ep.city,
}));

export default function Home() {
  const [activeMixtape, setActiveMixtape] = useState<Mixtape | null>(null);
  const [playerPlaying, setPlayerPlaying] = useState(false);
  const [openArtistName, setOpenArtistName] = useState<string | null>(null);

  const openArtist = openArtistName ? findArtistWorldProfile(openArtistName) : null;

  const handleTrackSelect = (mix: Mixtape) => {
    setActiveMixtape(mix);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <PageGradualBlur />

      {/* ── Fixed navigation ──────────────────────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="spectra logo"
          items={homeNavItems}
          activeHref="/#home"
          className="custom-nav"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
        />
      </div>

      <main className="relative z-10">

        {/* ── 0. Hero ────────────────────────────────────────────────────── */}
        <section id="home" className="relative isolate min-h-screen overflow-hidden">
          <Logo3D />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.14)_32%,rgba(0,0,0,0.08)_68%,rgba(0,0,0,0.84)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0),#000)]" />

          <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-12 pt-28 sm:pb-16 sm:pt-32">
            <div className="max-w-2xl overflow-hidden">
              <div className="text-[10px] uppercase tracking-[0.34em] text-white/42 sm:text-[11px]">
                Unexpected Experiences in Unusual Places
              </div>
              <h1 className="mt-5 text-[clamp(1.4rem,3.2vw,2.6rem)] leading-[0.86] tracking-[-0.06em] text-white">
                WELCOME
              </h1>
              <a
                href="#episodes"
                className="mt-8 inline-flex text-[11px] uppercase tracking-[0.32em] text-white/58 transition-colors duration-200 hover:text-white"
              >
                explore ↓
              </a>
            </div>
          </div>
        </section>

        {/* ── 1. Episodes ────────────────────────────────────────────────── */}
        {upcomingEpisodes.length > 0 && (
          <CountdownSection episodes={upcomingEpisodes} />
        )}
        <EpisodesSection />

        {/* ── 2. Featured Artifacts ──────────────────────────────────────── */}
        <HomeFeaturedArtifactsSection drops={arappDrops} />

        {/* ── 3. Mixtapes ────────────────────────────────────────────────── */}
        <HomeMixtapesSection
          mixtapes={mixtapes}
          onTrackSelect={handleTrackSelect}
          activeMixtapeId={activeMixtape?.id ?? null}
          isPlaying={playerPlaying}
        />

        {/* ── 4. Magazine ────────────────────────────────────────────────── */}
        <HomeMagazineSection articles={articles} />

        {/* ── 5. Artists ─────────────────────────────────────────────────── */}
        <HomeArtistsSection
          artists={artistWorldProfiles}
          onOpenArtist={setOpenArtistName}
        />

        {/* ── 6. Spaces ──────────────────────────────────────────────────── */}
        <HomeSpacesSection articles={articles} />

        {/* ── 7. Store ───────────────────────────────────────────────────── */}
        <HomeStoreSection drops={arappDrops} />

        {/* ── 8. Collect App ─────────────────────────────────────────────── */}
        <HomeCollectSection />

        {/* ── 9. Membership ──────────────────────────────────────────────── */}
        <section id="join" className="bg-black">
          <GatedMembershipFlow />
        </section>

        {/* ── 10. About ──────────────────────────────────────────────────── */}
        <AboutSection />

        {/* ── 11. Submit ─────────────────────────────────────────────────── */}
        <section id="submit" className="bg-black">
          <SubmitSection />
        </section>

        {/* ── 12. Partners ───────────────────────────────────────────────── */}
        <section className="bg-black pb-20 pt-8 sm:pb-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-base leading-[0.94] tracking-[-0.05em] text-white sm:text-lg">
              FRIENDS AND FAMILY
            </h2>
            <p className="mt-4 text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
              Protocols, brands &amp; events we&apos;ve worked with
            </p>
          </div>
          <div className="mt-10">
            <LogoArray />
          </div>
        </section>

      </main>

      <Footer />

      {/* ── Artist world panel ─────────────────────────────────────────── */}
      {openArtist && (
        <ArtistWorldPanel artist={openArtist} onClose={() => setOpenArtistName(null)} />
      )}

      {/* ── Persistent bottom player ───────────────────────────────────── */}
      <HomePersistentPlayer
        mixtape={activeMixtape}
        isPlaying={playerPlaying}
        onPlayStateChange={setPlayerPlaying}
      />
    </div>
  );
}
