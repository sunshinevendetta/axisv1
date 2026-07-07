import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { legalDisclosureSections, legalEntities } from "@/src/lib/legal-disclosure";

export const metadata: Metadata = {
  title: "Legal Disclosure",
  description: "Entity disclosure and general disclaimer for AXIS.",
  alternates: {
    canonical: "/legal-disclosure",
  },
};

export default function LegalDisclosurePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-24 sm:px-10">
        <Link
          href="/"
          className="mb-16 w-fit text-[10px] uppercase tracking-[0.36em] text-white/35 transition-colors hover:text-white"
        >
          Back to AXIS
        </Link>

        <p className="text-[10px] uppercase tracking-[0.5em] text-white/26">
          Legal Disclosure
        </p>
        <h1 className="mt-5 text-4xl uppercase leading-none tracking-[0.02em] text-white sm:text-6xl">
          {legalEntities.brand}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/58 sm:text-lg sm:leading-8">
          Entity disclosure, privacy notice, and general disclaimer for AXIS SHOW, operated by AXIS CORP.
        </p>

        <div className="mt-16 space-y-12">
          {legalDisclosureSections.map((section) => (
            <section key={section.title} className="border-t border-white/10 pt-8">
              <h2 className="text-xs uppercase tracking-[0.4em] text-white/45">
                {section.title}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-white/62 sm:text-base sm:leading-8">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
