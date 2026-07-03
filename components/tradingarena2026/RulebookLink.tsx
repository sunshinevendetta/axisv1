"use client";

import Link from "next/link";

/* Fixed corner chip pointing at the dedicated rulebook page. Deliberately
   quiet: the deck sells, the chip only signposts. Untranslated league jargon,
   same convention as the ticker labels. */
export default function RulebookLink() {
  return (
    <Link
      className="arena-rules-button"
      href="/tradingarena2026/rules"
      aria-label="Official Rulebook"
    >
      Rules
    </Link>
  );
}
