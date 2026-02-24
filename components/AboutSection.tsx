"use client";

import FloatingLinesBackground from "./backgrounds/FloatingLinesBackground";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="min-h-screen flex flex-col items-center justify-center py-32 px-4 relative overflow-hidden bg-transparent"
    >
      <FloatingLinesBackground />

      <div
        className="
          relative z-10
          w-full max-w-4xl
          bg-black/40
          backdrop-blur-xl
          border border-white/10
          rounded-2xl
          shadow-2xl
          overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none" />

        <div className="relative px-8 py-12 md:px-12 md:py-16">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 text-white tracking-tight">
            ABOUT SPECTRA
          </h2>

          <div className="text-white/90 text-lg md:text-xl leading-relaxed space-y-6 max-w-3xl mx-auto">
            <p>
              Spectra creates unconventional art experiences in unexpected spaces not designed to function as galleries.
            </p>

             <p>
              Each edition can blend digital interventions, music, talks, and workshops, separately or all together, plus we live-stream globally every event to connect physical and digital audiences.
            </p>

            <p>
              We run monthly episodes mixing avant-garde digital culture, experimental setups, and direct engagement so users can test out new apps, ideas and concepts.
            </p>
            <p>We have open calls for artists, developers and curators every month, these are open to free participation, and only the sharpest proposals make it.</p>

          </div>
        </div>
      </div>
    </section>
  );
}