"use client";

import Link from "next/link";
import { FiBookOpen } from "react-icons/fi";

export default function RulesDialog() {
  return (
    <Link className="arena-rules-button" href="/tradingarena2026/rules">
      <FiBookOpen aria-hidden="true" />
      <span>Official Rulebook</span>
    </Link>
  );
}
