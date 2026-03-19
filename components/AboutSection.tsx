"use client";

import AboutBackground from "./backgrounds/AboutBackground";

export default function AboutSection() {
  return (
    <section id="about" className="relative isolate min-h-screen overflow-hidden bg-black">
      <AboutBackground />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.54)_26%,rgba(0,0,0,0.54)_72%,rgba(0,0,0,0.94)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-24 sm:py-32">
        <div className="max-w-4xl">
          <h2 className="text-lg leading-[0.94] tracking-[-0.05em] text-white sm:text-xl md:text-2xl">
            ABOUT SPECTRA
          </h2>

          <div className="mt-6 max-w-2xl space-y-3 text-xs leading-5 tracking-wide text-white/58 sm:text-sm sm:leading-6">
            <p>
              Spectra creates unconventional art experiences in unexpected spaces not designed to function as galleries.
            </p>
            <p>
              Each edition can blend digital interventions, music, talks, and workshops, separately or all together,
              plus we live-stream globally every event to connect physical and digital audiences.
            </p>
            <p>
              We run monthly episodes mixing avant-garde digital culture, experimental setups, and direct engagement so
              users can test out new apps, ideas and concepts.
            </p>
            <p>
              We have open calls for artists, developers and curators every month, these are open to free
              participation, and only the sharpest proposals make it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
