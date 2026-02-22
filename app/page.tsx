"use client";

import PillNav from "@/components/PillNav";
import Logo3D from "@/components/Logo3d";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";
import EpisodesSection from "@/components/EpisodesSection";
import GatedMembershipFlow from "@/components/GatedMembershipFlow"; 
import SubmissionForm from '@/components/forms/SubmissionForm'; // ← new import

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      event.preventDefault();
      const el = document.getElementById(href.replace("#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="font-sans min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      {/* Fixed Navigation */}
      <div className="fixed top-0 z-50 w-full flex justify-center pt-6 pointer-events-auto">
        <PillNav
          logo="/w.png"
          logoAlt="spectra logo"
          items={[
            { label: "home", href: "#home" },
            { label: "join", href: "#join" },         // ← Single section for the gated flow
            { label: "episodes", href: "#episodes" },
            { label: "submit", href: "#submit" },     // ← added for new section
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

      <VideoBackground />
      <Logo3D />

      <main className="w-full overflow-x-hidden relative z-10">
        <section id="home" className="h-screen" />

        {/* SINGLE GATED SECTION: Contact → Membership */}
        <section
          id="join"
          className="min-h-screen flex items-center justify-center py-32 px-4 relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 60%),
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%),
              #000000
            `,
            boxShadow: "inset 0 0 150px rgba(0,0,0,0.9)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.01) 20px)",
            }}
          />
          <div className="w-full max-w-screen-2xl mx-auto relative z-10">
            <GatedMembershipFlow />
          </div>
        </section>

        <EpisodesSection />

        {/* ────────────────────────────────────────────────
            NEW SUBMISSION SECTION – added below Episodes
            Pure monochromatic black/white theme
        ──────────────────────────────────────────────── */}
        <section 
          id="submit" 
          className="py-32 px-6 bg-gradient-to-b from-black to-gray-950 relative overflow-hidden"
        >
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_70%)]" 
          />
          <div className="max-w-5xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
              Submit Your Art
            </h2>
            <SubmissionForm />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}