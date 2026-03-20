"use client";

export default function Footer() {
  return (
    <footer className="bg-black px-6 pb-20 pt-12 text-center text-[10px] uppercase tracking-[0.32em] text-white/30 sm:pb-24 sm:pt-14 sm:text-[11px]">
      SPECTRA<span className="copy-mark">©</span> {new Date().getFullYear()} is powered by AXIS Labs
    </footer>
  );
}
