"use client";

import type { ReactNode } from "react";
import { clsx } from "clsx";

/* Shared slide chrome: full-viewport section, engraved slide number,
   kicker rail, consistent gutters. Slides own everything inside. */
export default function SlideShell({
  index,
  kicker,
  id,
  className,
  children,
}: {
  index: number;
  kicker: string;
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const num = String(index).padStart(2, "0");

  return (
    <section
      id={id}
      data-arena-slide={num}
      className={clsx(
        "arena-grid-bg relative flex min-h-screen w-full flex-col justify-center overflow-hidden",
        "px-6 py-24 sm:px-12 lg:px-24",
        className,
      )}
    >
      <header className="pointer-events-none absolute left-6 top-8 flex items-baseline gap-4 sm:left-12 lg:left-24">
        <span className="arena-num text-5xl font-black sm:text-6xl" aria-hidden>
          {num}
        </span>
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-[var(--arena-steel)]">
          {kicker}
        </span>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
