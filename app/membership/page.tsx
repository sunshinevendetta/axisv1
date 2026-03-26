"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import PrismBackground from "@/components/backgrounds/PrismBackground";
import PillNav from "@/components/PillNav";
import MagicBento from "@/components/MagicBento";
import { publicNavItems } from "@/src/lib/navigation";

const ConnectWalletButton = dynamic(() => import("@/components/ConnectWalletButton"), {
  ssr: false,
  loading: () => <div className="h-14 w-64 animate-pulse rounded-2xl bg-white/8" />,
});

const BENEFITS = [
  {
    color: "#000000",
    label: "Access",
    title: "Members-Only Drops",
    description: "First access to limited edition collectibles, art prints, and digital artifacts exclusive to AXIS members.",
  },
  {
    color: "#000000",
    label: "Experience",
    title: "Live Episodes",
    description: "Priority entry and backstage access at AXIS live episodes — unexpected art experiences in unusual places.",
  },
  {
    color: "#000000",
    label: "Culture",
    title: "AXIS Magazine",
    description: "Full archive access to editorial, artist profiles, and the ongoing story of digital culture through our lens.",
  },
  {
    color: "#000000",
    label: "Community",
    title: "Members Area",
    description: "A private space for artists, collectors, and curators. Proposals, collaborations, and direct access to the team.",
  },
  {
    color: "#000000",
    label: "Collect",
    title: "AR Artifacts",
    description: "Unlock AXIS AR app items — spatial art pieces tied to real-world episode locations and digital coordinates.",
  },
  {
    color: "#000000",
    label: "Identity",
    title: "AXIS Token",
    description: "Your membership lives on-chain. One token, one identity — transferable, verifiable, and forever yours.",
  },
];

export default function MembershipPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      {/* Video bg */}
      <PrismBackground />

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.10)_30%,rgba(0,0,0,0.10)_60%,rgba(0,0,0,0.90)_100%)]" />

      {/* Nav */}
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="axis logo"
          items={publicNavItems}
          activeHref="/membership"
        />
      </div>

      <div className="relative z-20">
        {/* Hero */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-32 text-center">
          <div className="text-[9px] uppercase tracking-[0.44em] text-white/32">
            AXIS membership
          </div>

          <h1
            className="mt-6 leading-[0.85] tracking-[-0.065em] text-white"
            style={{ fontSize: "clamp(2.06rem, 9.7vw, 7.76rem)" }}
          >
            BECOME
            <br />
            AXIS
          </h1>

          <p className="mx-auto mt-8 max-w-md text-[12px] leading-[1.8] tracking-[0.02em] text-white/48 sm:text-[13px]">
            AXIS is a living culture protocol. Part art space, part digital magazine,
            part on-chain collective. Membership is your key to all of it.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <a
              href="#collect"
              className="inline-flex h-12 items-center rounded-full border border-white/20 bg-white/6 px-8 text-[10px] uppercase tracking-[0.32em] text-white backdrop-blur-sm transition-all duration-200 hover:border-white/35 hover:bg-white/12"
            >
              Collect Membership
            </a>
            <Link
              href="/members"
              className="inline-flex h-12 items-center px-6 text-[10px] uppercase tracking-[0.32em] text-white/40 transition-colors duration-200 hover:text-white/70"
            >
              Already a member →
            </Link>
          </div>

          {/* Scroll cue */}
          <div className="mt-16 text-[9px] uppercase tracking-[0.34em] text-white/20 animate-pulse">
            scroll ↓
          </div>
        </section>

        {/* What is AXIS */}
        <section className="px-6 pb-24 pt-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">
                what we are
              </div>
              <h2 className="mt-4 text-[clamp(1.13rem,4vw,3.2rem)] leading-[0.9] tracking-[-0.05em] text-white">
                UNEXPECTED EXPERIENCES<br />UNUSUAL PLACES
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px bg-white/6 sm:grid-cols-3">
              {[
                { num: "01", title: "LIVE EPISODES", body: "Immersive art events held in cities across the world — each one a one-of-a-kind experience designed to disorient and inspire." },
                { num: "02", title: "DIGITAL CULTURE", body: "An editorial voice for the intersection of art, tech, and underground scenes. The magazine, the artists, the spaces." },
                { num: "03", title: "ON-CHAIN ARTIFACTS", body: "Collectible digital objects tied to real experiences. AR, editions, prints — each one a fragment of an episode." },
              ].map((item) => (
                <div key={item.num} className="bg-black/80 p-8 backdrop-blur-sm">
                  <div className="mb-4 text-[9px] uppercase tracking-[0.42em] text-white/22">{item.num}</div>
                  <h3 className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white">{item.title}</h3>
                  <p className="text-[11px] leading-[1.8] text-white/42">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits bento */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">
                member benefits
              </div>
              <h2 className="mt-4 text-[clamp(1.13rem,4vw,3rem)] leading-[0.9] tracking-[-0.05em] text-white">
                WHAT YOU GET
              </h2>
            </div>

            <MagicBento
              cards={BENEFITS}
              enableSpotlight
              enableBorderGlow
              enableStars
              enableTilt
              enableMagnetism
              clickEffect
              glowColor="255, 255, 255"
              spotlightRadius={320}
              particleCount={10}
            />
          </div>
        </section>

        {/* Collect CTA */}
        <section id="collect" className="overflow-hidden px-6 pb-32 pt-8">
          <div className="mx-auto max-w-lg text-center">
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">
              get started
            </div>
            <h2 className="mt-9 text-[3vw] leading-[0.92] tracking-[-0.05em] text-white sm:text-[4.8rem]">MEMBERSHIP
            </h2>
            <p className="mx-auto mt-6 max-w-sm text-[11px] leading-[1.8] text-white/42">
              One token. Permanent access. Connect your wallet and claim your place in AXIS.
            </p>

            {/* Glass card for wallet connect */}
            <div className="relative mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/4 px-8 py-10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(255,255,255,0.07),transparent_70%)]" />
              <div className="relative flex flex-col items-center gap-6">
                <div className="text-[10px] uppercase tracking-[0.32em] text-white/40">
                  connect wallet to collect
                </div>
                <ConnectWalletButton />
                <p className="text-[9px] text-white/20">
                  Base network · ERC-721 · 1 per wallet
                </p>
              </div>
            </div>

            <p className="mt-6 text-[9px] leading-relaxed text-white/18">
              Membership token grants access to all benefits above. Non-transferable utility.
            </p>
          </div>
        </section>

        {/* Footer nav */}
        <div className="pb-16 text-center">
          <Link
            href="/"
            className="text-[9px] uppercase tracking-[0.36em] text-white/20 transition-colors hover:text-white/40"
          >
            ← Back to AXIS
          </Link>
        </div>
      </div>
    </div>
  );
}
