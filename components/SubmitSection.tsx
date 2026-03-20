"use client";

import Link from "next/link";
import { useState } from "react";
import SubmissionForm from "@/components/forms/SubmissionForm";

export default function SubmitSection() {
  const [showArtistForm, setShowArtistForm] = useState(true);

  const baseButtonClassName =
    "inline-flex min-w-[170px] items-center justify-center border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] transition-colors duration-200";

  return (
    <div className="bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 text-center sm:pt-24">
        <p className="text-[10px] uppercase tracking-[0.34em] text-white/44 sm:text-[11px]">
          Submit To SPECTRA<span className="copy-mark">©</span>
        </p>
        <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.6rem)] leading-[0.92] tracking-[-0.05em] text-white">
          Choose your lane
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58 sm:text-base sm:leading-7">
          Artists can submit directly here. Developers have a dedicated standalone page with the full ecosystem brief and submission flow.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowArtistForm((current) => !current)}
            className={`${baseButtonClassName} ${
              showArtistForm
                ? "border-white bg-white text-black"
                : "border-white/18 bg-transparent text-white/76 hover:border-white/34 hover:text-white"
            }`}
          >
            {showArtistForm ? "Hide Artist Form" : "Artist Submission"}
          </button>
          <Link
            href="/devsubmit"
            className={`${baseButtonClassName} border-white/18 bg-transparent text-white/76 hover:border-white/34 hover:text-white`}
          >
            App Submission
          </Link>
        </div>
      </div>

      {showArtistForm ? <SubmissionForm variant="artist" /> : null}
    </div>
  );
}
