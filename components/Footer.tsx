"use client";

import Link from "next/link";
import { footerLegalLines, legalEntities } from "@/src/lib/legal-disclosure";

export default function Footer() {
  return (
    <footer className="bg-black px-6 pb-20 pt-12 text-center text-[10px] uppercase tracking-[0.18em] text-white/34 sm:pb-24 sm:pt-14 sm:text-[11px]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4">
        <p className="uppercase tracking-[0.32em]">
          © {new Date().getFullYear()} {legalEntities.brand}. All rights reserved.
        </p>
        <div className="space-y-2 leading-5 text-white/28">
          {footerLegalLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <Link
          href="/legal-disclosure"
          className="uppercase tracking-[0.32em] text-white/45 transition-colors hover:text-white"
        >
          Legal Disclosure
        </Link>
      </div>
    </footer>
  );
}
