"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import AboutSection from "@/components/AboutSection";
import CountdownSection from "@/components/CountdownSection";
import EpisodesSection from "@/components/EpisodesSection";
import Footer from "@/components/Footer";
import Logo3D from "@/components/Logo3dAsciiGlass";
import LogoArray from "@/components/Logos/LogoArray";
import PageGradualBlur from "@/components/PageGradualBlur";
import PillNav from "@/components/PillNav";
import SubmitSection from "@/components/SubmitSection";
import HomeArtistsSection from "@/components/home/HomeArtistsSection";
import HomeCollectSection from "@/components/home/HomeCollectSection";
import HomeMagazineSection from "@/components/home/HomeMagazineSection";
import HomeMixtapesSection from "@/components/home/HomeMixtapesSection";
import HomeSpacesSection from "@/components/home/HomeSpacesSection";
import HomeStoreSection from "@/components/home/HomeStoreSection";
import { homeNavItems } from "@/src/lib/navigation";
import type { ArtistProfile } from "@/src/content/artists";
import type { ARAppDrop } from "@/src/lib/arapp-catalog";
import type { Mixtape } from "@/components/magazine/mixtapes/types";
import type { MagazineArticle } from "@/components/magazine/types";

const GatedMembershipFlow = dynamic(() => import("@/components/GatedMembershipFlow"), {
  loading: () => <div className="min-h-[40vh]" />,
  ssr: false,
});

const HomePersistentPlayer = dynamic(() => import("@/components/home/HomePersistentPlayer"), {
  ssr: false,
});

type UpcomingEpisode = {
  title: string;
  startsAtISO: string;
  city: string;
};

type HomePageClientProps = {
  upcomingEpisodes: UpcomingEpisode[];
  mixtapes: Mixtape[];
  articles: MagazineArticle[];
  featuredArtists: ArtistProfile[];
  musicCount: number;
  visualCount: number;
  genreLabels: string[];
  drops: ARAppDrop[];
};

export default function HomePageClient({
  upcomingEpisodes,
  mixtapes,
  articles,
  featuredArtists,
  musicCount,
  visualCount,
  genreLabels,
  drops,
}: HomePageClientProps) {
  const [activeMixtape, setActiveMixtape] = useState<Mixtape | null>(null);
  const [playerPlaying, setPlayerPlaying] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <PageGradualBlur />

      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="axis logo"
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
        <section id="home" className="relative isolate min-h-screen overflow-hidden">
          <Logo3D />
          <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.14)_32%,rgba(0,0,0,0.08)_68%,rgba(0,0,0,0.84)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.72)_60%,#000_100%)]" />

          <div className="pointer-events-none relative z-20 mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-12 pt-28 sm:pb-16 sm:pt-32">
            <div className="max-w-2xl overflow-hidden">
              <div className="text-[10px] uppercase tracking-[0.34em] text-white/42 sm:text-[11px]">
                Unexpected Experiences in Unusual Places
              </div>
              <h1 className="mt-5 text-[clamp(1.4rem,3.2vw,2.6rem)] leading-[0.86] tracking-[-0.06em] text-white">
                WELCOME
              </h1>
              <a
                href="#episodes"
                className="pointer-events-auto mt-8 inline-flex text-[11px] uppercase tracking-[0.32em] text-white/58 transition-colors duration-200 hover:text-white"
              >
                explore ↓
              </a>
            </div>
          </div>
        </section>

        {upcomingEpisodes.length > 0 ? <CountdownSection episodes={upcomingEpisodes} /> : null}
        <EpisodesSection />
        {/* <HomeFeaturedArtifactsSection drops={drops} /> */}
        <HomeMixtapesSection
          mixtapes={mixtapes}
          onTrackSelect={setActiveMixtape}
          activeMixtapeId={activeMixtape?.id ?? null}
          isPlaying={playerPlaying}
        />
        <HomeMagazineSection articles={articles} />
        <HomeArtistsSection
          artists={featuredArtists}
          musicCount={musicCount}
          visualCount={visualCount}
          genreLabels={genreLabels}
        />
        <HomeSpacesSection articles={articles} />
        <HomeStoreSection drops={drops} />
        <HomeCollectSection />

        <section id="join" className="bg-black">
          <GatedMembershipFlow />
        </section>

        <AboutSection />

        <section id="submit" className="bg-black">
          <SubmitSection />
        </section>

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

      <HomePersistentPlayer
        mixtape={activeMixtape}
        isPlaying={playerPlaying}
        onPlayStateChange={setPlayerPlaying}
      />
    </div>
  );
}
