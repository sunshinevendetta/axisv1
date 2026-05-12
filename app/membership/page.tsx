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
    title: "AR Objects",
    description: "Unlock AXIS AR app items — art pieces tied to real episode locations that you can place in your physical space.",
  },
  {
    color: "#000000",
    label: "Identity",
    title: "AXIS Pass",
    description: "Your membership is yours forever. One account, one identity — permanent, verifiable, and always with you.",
  },
];

export default function MembershipPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <PrismBackground />

      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.10)_30%,rgba(0,0,0,0.10)_60%,rgba(0,0,0,0.90)_100%)]" />

      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="axis logo"
          items={publicNavItems}
          activeHref="/membership"
        />
      </div>

      <div className="relative z-20">
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-32 text-center">
          <div className="text-[9px] uppercase tracking-[0.44em] text-white/32">
            AXIS membership
          </div>

          <h1
            className="mt-5 max-w-4xl [font-family:var(--font-display)] leading-[0.9] tracking-[-0.055em] text-white"
            style={{ fontSize: "clamp(2.25rem, 7vw, 5.4rem)" }}
          >
            BECOME
            <br />
            AXIS
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 tracking-[0.01em] text-white/56 sm:text-[15px]">
            AXIS is a living culture protocol. Part art space, part digital magazine,
            part on-chain collective. Membership is your key to all of it.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
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

          <div className="mt-14 text-[9px] uppercase tracking-[0.34em] text-white/20 animate-pulse">
            scroll ↓
          </div>
        </section>

        <section className="px-6 pb-24 pt-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">
                what we are
              </div>
              <h2 className="mt-4 [font-family:var(--font-display)] text-[clamp(1.5rem,4vw,3.1rem)] leading-[0.94] tracking-[-0.045em] text-white">
                UNEXPECTED EXPERIENCES<br />UNUSUAL PLACES
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px bg-white/6 sm:grid-cols-3">
              {[
                { num: "01", title: "LIVE EPISODES", body: "Immersive art events held in cities across the world — each one a one-of-a-kind experience designed to disorient and inspire." },
                { num: "02", title: "DIGITAL CULTURE", body: "An editorial voice for the intersection of art, tech, and underground scenes. The magazine, the artists, the spaces." },
                { num: "03", title: "COLLECTIBLES", body: "Limited edition prints, digital objects, and AR pieces tied to real episodes — each one a fragment of the night." },
              ].map((item) => (
                <div key={item.num} className="bg-black/80 p-7 text-left backdrop-blur-sm sm:p-8">
                  <div className="mb-4 text-[9px] uppercase tracking-[0.42em] text-white/22">{item.num}</div>
                  <h3 className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white">{item.title}</h3>
                  <p className="text-sm leading-7 text-white/46">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">
                member benefits
              </div>
              <h2 className="mt-4 [font-family:var(--font-display)] text-[clamp(1.4rem,3.5vw,2.8rem)] leading-[0.94] tracking-[-0.045em] text-white">
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

        <section id="collect" className="overflow-hidden px-6 pb-32 pt-20 sm:pt-24">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">
              get started
            </div>
            <h2 className="mt-5 flex flex-col items-center [font-family:var(--font-display)] leading-[0.84] text-white">
              <span className="block w-fit text-center text-[clamp(1.5rem,7vw,5.2rem)] tracking-[-0.055em]">
                GET
              </span>
              <span className="block w-fit max-w-full text-center text-[1.5rem] tracking-[-0.07em] sm:text-[clamp(3.2rem)]">
                MEMBERSHIP
              </span>
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[12px] leading-[1.9] text-white/48 sm:text-[15px]">
              One membership. Permanent access. Sign in and claim your place in AXIS.
            </p>

            <div className="relative mt-12 w-full max-w-[39rem] overflow-hidden rounded-3xl border border-white/10 bg-white/4 px-6 py-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:px-8 sm:py-10">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(255,255,255,0.07),transparent_70%)]" />
              <div className="relative flex flex-col items-center gap-6">
                <div className="text-[10px] uppercase tracking-[0.32em] text-white/40">
                  sign in to get access
                </div>
                <ConnectWalletButton />
                <p className="text-[10px] text-white/24">
                  1 membership per account
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-xl text-[10px] leading-relaxed text-white/22">
              Your membership unlocks everything above. Yours to keep.
            </p>
          </div>
        </section>

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
