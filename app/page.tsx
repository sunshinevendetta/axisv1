import dynamic from "next/dynamic";
import PillNav from "@/components/PillNav";
import Logo3D from "@/components/Logo3d";
import Footer from "@/components/Footer";
import LogoArray from "@/components/Logos/LogoArray";
import AboutSection from "@/components/AboutSection";
import { Providers } from "@/components/Providers";

const GatedMembershipFlow = dynamic(() => import("@/components/GatedMembershipFlow"), {
  loading: () => <div className="min-h-screen" />,
});

const EpisodesSection = dynamic(() => import("@/components/EpisodesSection"), {
  loading: () => <div className="min-h-screen" />,
});

const SubmissionForm = dynamic(() => import("@/components/forms/SubmissionForm"), {
  loading: () => <div className="min-h-screen" />,
});

export default function Home() {
  return (
    <div className="font-sans min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <div className="fixed top-0 z-50 w-full flex justify-center pt-6 pointer-events-auto">
        <PillNav
          logo="/w.png"
          logoAlt="spectra logo"
          items={[
            { label: "home", href: "#home" },
            { label: "about", href: "#about" },
            { label: "join", href: "#join" },
            { label: "episodes", href: "#episodes" },
            { label: "submit", href: "#submit" },
          ]}
          activeHref="#home"
          className="custom-nav"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
        />
      </div>

      <main className="w-full overflow-x-hidden relative z-10">
        <section id="home" className="h-screen relative">
          <Logo3D />
        </section>

        <section className="py-12 bg-black flex flex-col items-center justify-center">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            FRIENDS AND FAMILY
          </h2>
          <p className="text-lg text-white/60 mb-8 text-center">
            Protocols, brands & events we've worked with
          </p>
          <LogoArray />
        </section>

        <AboutSection />

        <section id="join" className="min-h-screen">
          <Providers>
            <GatedMembershipFlow />
          </Providers>
        </section>

        <section id="episodes" className="min-h-screen">
          <EpisodesSection />
        </section>

        <section id="submit">
          <SubmissionForm />
        </section>
      </main>

      <Footer />
    </div>
  );
}
