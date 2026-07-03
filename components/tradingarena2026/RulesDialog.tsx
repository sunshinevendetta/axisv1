"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FiBookOpen, FiX } from "react-icons/fi";
import { TAL_RULEBOOK, TAL_RULEBOOK_HIGHLIGHTS } from "./rulebook";

export default function RulesDialog() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const dialogId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="arena-rules-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => setOpen(true)}
      >
        <FiBookOpen aria-hidden="true" />
        <span>Official Rules</span>
      </button>

      {open ? (
        <div
          className="arena-rules-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            ref={panelRef}
            id={dialogId}
            className="arena-rules-dialog arena-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
          >
            <header className="arena-rules-header">
              <div>
                <span className="arena-rules-kicker">Trading Arena League</span>
                <h2 id={titleId}>Official Rulebook</h2>
              </div>
              <button
                type="button"
                className="arena-rules-close"
                aria-label="Close rules"
                onClick={() => setOpen(false)}
              >
                <FiX aria-hidden="true" />
              </button>
            </header>

            <div className="arena-rules-highlights" aria-label="Rulebook highlights">
              {TAL_RULEBOOK_HIGHLIGHTS.map((highlight) => (
                <p key={highlight}>{highlight}</p>
              ))}
            </div>

            <pre className="arena-rules-document">{TAL_RULEBOOK}</pre>
          </div>
        </div>
      ) : null}
    </>
  );
}
