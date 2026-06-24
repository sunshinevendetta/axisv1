"use client";

import { useSiteLanguage } from "@/components/site-language";
import AboutBackground from "./backgrounds/AboutBackground";
import { getSiteCopy } from "@/src/lib/site-translations";

export default function AboutSection() {
  const { language } = useSiteLanguage();
  const copy = getSiteCopy(language);

  return (
    <section id="about" className="relative isolate min-h-screen overflow-hidden bg-black">
      <AboutBackground />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.54)_26%,rgba(0,0,0,0.54)_72%,rgba(0,0,0,0.94)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-24 sm:py-32">
        <div className="max-w-4xl">
          <h2 className="text-lg leading-[0.94] tracking-[-0.05em] text-white sm:text-xl md:text-2xl">
            {copy.about.title}<span className="copy-mark">©</span>
          </h2>

          <div className="mt-6 max-w-2xl space-y-3 text-xs leading-5 tracking-wide text-white/58 sm:text-sm sm:leading-6">
            {copy.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
