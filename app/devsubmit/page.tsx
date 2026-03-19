import Link from "next/link";
import Footer from "@/components/Footer";
import MagicBento, { BentoCardProps } from "@/components/MagicBento";
import SubmissionForm from "@/components/forms/SubmissionForm";

const createPlaceholderImage = (label: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020202" />
          <stop offset="52%" stop-color="#111111" />
          <stop offset="100%" stop-color="#6e737b" />
        </linearGradient>
        <radialGradient id="glow" cx="20%" cy="20%" r="80%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <rect width="1200" height="900" fill="url(#glow)" />
      <rect x="68" y="68" width="1064" height="764" rx="32" fill="none" stroke="#ffffff" stroke-opacity="0.18" />
      <text x="90" y="122" fill="#ffffff" fill-opacity="0.58" font-size="34" font-family="Arial, Helvetica, sans-serif">© SPECTRA PLACEHOLDER</text>
      <text x="90" y="770" fill="#ffffff" font-size="82" font-family="Arial, Helvetica, sans-serif">${label}</text>
    </svg>
  `)}`;

const bentoCards: BentoCardProps[] = [
  {
    color: "#05010c",
    label: "Why © SPECTRA",
    title: "Unusual places, real reactions",
    description: "© SPECTRA brings onchain OGs and first-time users into the same live experience.",
    imageSrc: createPlaceholderImage("spectra1.jpg"),
    imageAlt: "© SPECTRA placeholder 1",
  },
{
  color: "#05010c",
  label: "The Ecosystem",
  title: "Yearly seasons, monthly episodes",
  description: "Art, music, apps, and brands share the same activation calendar.",
  imageSrc: createPlaceholderImage("spectra2.webp"),
  imageAlt: "© SPECTRA placeholder 2",
},
  {
    color: "#05010c",
    label: "The Method",
title: "Controlled chaos beats boring demos",
description: "Test MVPs with real people, not just crypto natives. Behavior exposes friction faster than panels or staged demos.",
    imageSrc: createPlaceholderImage("spectra3.jpg"),
    imageAlt: "© SPECTRA placeholder 3",
  },
  {
    color: "#05010c",
    label: "Activation Model",
    title: "People use it instead of just watch",
    description: "With a small contribution, devs can sponsor one or many app-led experiences. We build mechanics around your apps, merch, rewards, food, drinks, entry, and live participation, with part of that going back to attendees as in-app credits, bonuses, or airdrops.",
    imageSrc: createPlaceholderImage("spectra4.webp"),
    imageAlt: "© SPECTRA placeholder 4",
  },
  {
    color: "#05010c",
    label: "What To Send",
    title: "Send the clearest live link",
    description: "App, demo, landing page, waitlist, or offer plus the action you want users to take.",
    imageSrc: createPlaceholderImage("spectra5.jpg"),
    imageAlt: "© SPECTRA placeholder 5",
  },
  {
    color: "#05010c",
    label: "Outcome",
    title: "Feedback you can actually use",
    description: "Get pain points, ideas, photos, videos, and testimonials. Part of the contribution can fund gas or user credits.",
    imageSrc: createPlaceholderImage("spectra6.webp"),
    imageAlt: "© SPECTRA placeholder 6",
  },
{
  color: "#05010c",
  label: "Example Mechanic",
  title: "Token check-in rewards",
  description: "An app rewards attendees with tokens when they check in at the event.",
  imageSrc: createPlaceholderImage("spectra7.webp"),
  imageAlt: "© SPECTRA mechanic check-in rewards",
},
{
  color: "#05010c",
  label: "Example Mechanic",
  title: "Games unlock real rewards",
  description: "A game activation lets players win drinks, merch, or access perks during the event.",
  imageSrc: createPlaceholderImage("spectra8.webp"),
  imageAlt: "© SPECTRA mechanic game rewards",
},
{
  color: "#05010c",
  label: "Example Mechanic",
  title: "Waitlists unlock spaces",
  description: "A signup or waitlist interaction unlocks access to installations or special rooms.",
  imageSrc: createPlaceholderImage("spectra9.webp"),
  imageAlt: "© SPECTRA mechanic waitlist access",
},
{
  color: "#05010c",
  label: "Example Mechanic",
  title: "Wallet interactions",
  description: "Wallet actions distribute onchain collectibles live during the event.",
  imageSrc: createPlaceholderImage("spectra10.webp"),
  imageAlt: "© SPECTRA mechanic wallet collectibles",
},
];

export default function DevSubmitPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="relative overflow-x-hidden">
        <section className="relative isolate px-6 pb-20 pt-8 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_60%)]" />
            <div className="absolute left-0 top-32 h-80 w-80 rounded-full bg-white/6 blur-3xl" />
            <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-slate-300/8 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-10 flex items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/70 transition hover:border-white/30 hover:text-white"
              >
                Back to © SPECTRA
              </Link>
              <div className="text-right text-[10px] uppercase tracking-[0.32em] text-white/40">
                /devsubmit
              </div>
            </div>

            <div className="mb-12 max-w-3xl">
              <p className="mb-4 text-xs uppercase tracking-[0.34em] text-white/58">
                Build For The © SPECTRA Network
              </p>
              <h1 className="max-w-2xl text-5xl uppercase leading-none sm:text-6xl lg:text-7xl">
                Submit your product for real users, attendees, and collaborators.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
  This lane is for developers and digital builders who want to test products in live event environments, observe real behavior, and get direct feedback from the © SPECTRA ecosystem.
</p>
            </div>

            <div className="mb-16">
              <MagicBento
                cards={bentoCards}
                className="magic-bento-card--detail"
                textAutoHide={false}
                enableTilt
                enableMagnetism={false}
                glowColor="205, 214, 223"
                spotlightRadius={260}
              />
            </div>
          </div>
        </section>

        <section className="relative">
          <SubmissionForm variant="dev" />
        </section>
      </main>

      <Footer />
    </div>
  );
}
