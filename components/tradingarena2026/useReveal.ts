"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface RevealContext {
  root: HTMLElement;
  /** True when the user prefers reduced motion — timelines must degrade to static. */
  reduced: boolean;
}

/* Shared reveal hook for deck slides.

   Any child carrying [data-reveal] fades/rises in when the slide scrolls into
   view, staggered in DOM order. Set data-reveal="left" | "right" | "scale" for
   directional variants. Slides needing bespoke choreography pass `build` and
   compose their own scoped timelines on top (or instead — remove data-reveal).

   Honors prefers-reduced-motion: content snaps to its final state. */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  build?: (ctx: RevealContext) => void,
): RefObject<T | null> {
  const rootRef = useRef<T>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (mmCtx) => {
          const reduced = Boolean(mmCtx.conditions?.reduced);
          const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-reveal]"));

          if (reduced) {
            gsap.set(items, { clearProps: "all" });
          } else if (items.length > 0) {
            const from = (el: HTMLElement) => {
              switch (el.dataset.reveal) {
                case "left":
                  return { autoAlpha: 0, x: -64 };
                case "right":
                  return { autoAlpha: 0, x: 64 };
                case "scale":
                  return { autoAlpha: 0, scale: 0.9 };
                default:
                  return { autoAlpha: 0, y: 48 };
              }
            };
            items.forEach((el, i) => {
              gsap.from(el, {
                ...from(el),
                duration: 1.1,
                ease: "power3.out",
                delay: (i % 8) * 0.08,
                scrollTrigger: {
                  trigger: el,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
              });
            });
          }

          build?.({ root, reduced });
        },
      );
    },
    { scope: rootRef },
  );

  return rootRef;
}
