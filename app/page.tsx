import dynamic from "next/dynamic";
import AboutSection from "@/components/AboutSection";
import EpisodesSection from "@/components/EpisodesSection";
import Footer from "@/components/Footer";
import Logo3D from "@/components/Logo3d";
import LogoArray from "@/components/Logos/LogoArray";
import PillNav from "@/components/PillNav";
import { homeNavItems } from "@/src/lib/navigation";

import CountdownSection from "@/components/CountdownSection";
import PageGradualBlur from "@/components/PageGradualBlur";

const GatedMembershipFlow = dynamic(() => import("@/components/GatedMembershipFlow"), {
  loading: () => <div className="min-h-screen" />,
});

const SubmissionForm = dynamic(() => import("@/components/forms/SubmissionForm"), {
  loading: () => <div className="min-h-screen" />,
});

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <PageGradualBlur />
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
                href="#about"
                className="mt-8 inline-flex text-[11px] uppercase tracking-[0.32em] text-white/58 transition-colors duration-200 hover:text-white"
              >
                about
              </a>
            </div>
          </div>
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

        <CountdownSection />

        <AboutSection />

        <section id="join" className="bg-black">
          <GatedMembershipFlow />
        </section>

        <EpisodesSection />

        <section id="submit" className="bg-black">
          <SubmissionForm />
        </section>
      </main>

      <Footer />
    </div>
  );
}
