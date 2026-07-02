"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { ArenaT } from "./content";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Native React SVG rebuild of public/tradingarena/bracket.svg: two columns of
   four competitor nodes converging through bracket lines into a center
   diamond. Restyled monochrome/chrome — white/silver strokes on engraved
   panels, transparent background so the 3D scene shows through.

   THE single red accent of the entire deck lives here: the "knockout by
   liquidation" beat — t("br.elim") text plus red pulses that travel the
   bracket paths into the center and a red ring that breathes around the
   diamond. Everything else is strictly black/white/grey/silver.

   Lines draw on via strokeDashoffset when the diagram scrolls into view;
   prefers-reduced-motion renders the diagram fully drawn and static. */

/* Bracket line geometry, verbatim from bracket.svg. Paths run node → center,
   so dash-offset pulses travel inward (the losing/knockout direction). */
const HUMAN_LINES = [
  "M250 224H390V304H488",
  "M250 344H390V304",
  "M250 504H390V584H488",
  "M250 624H390V584",
  "M488 304H545V400",
  "M488 584H545V400",
] as const;

const AGENT_LINES = [
  "M950 224H810V304H712",
  "M950 344H810V304",
  "M950 504H810V584H712",
  "M950 624H810V584",
  "M712 304H655V400",
  "M712 584H655V400",
] as const;

const NODE_YS = [190, 310, 470, 590] as const;
const DIAMOND = "M600 280L718 400L600 520L482 400Z";

function HumanIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="var(--arena-silver)">
      <circle cx={0} cy={-13} r={10} />
      <path d="M-31 20C-25 4 -12 -2 0 -2S25 4 31 20Z" />
      <path
        d="M-28 27H28"
        fill="none"
        stroke="var(--arena-steel)"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

function AgentIcon({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      fill="none"
      stroke="var(--arena-silver)"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x={-22} y={-22} width={44} height={44} rx={7} />
      <path d="M-36 -12H-22M-36 0H-22M-36 12H-22M22 -12H36M22 0H36M22 12H36M-12 -36V-22M0 -36V-22M12 -36V-22M-12 22V36M0 22V36M12 22V36" />
      <circle cx={0} cy={0} r={7} fill="var(--arena-white)" stroke="none" />
    </g>
  );
}

export default function BracketDiagram({ t }: { t: ArenaT }) {
  const rootRef = useRef<HTMLDivElement>(null);

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
          const draws = gsap.utils.toArray<SVGPathElement>(
            root.querySelectorAll("path[data-draw]"),
          );
          const pulses = gsap.utils.toArray<SVGPathElement>(
            root.querySelectorAll("path[data-pulse]"),
          );
          const nodes = gsap.utils.toArray<SVGGElement>(
            root.querySelectorAll("[data-node]"),
          );
          const headers = gsap.utils.toArray<SVGGElement>(
            root.querySelectorAll("[data-header]"),
          );
          const center = root.querySelector("[data-center]");
          const liqRing = root.querySelector("[data-liq-ring]");
          const liqText = root.querySelector("[data-liq-text]");

          if (reduced) {
            /* Static, fully drawn; hide the red pulse overlays entirely. */
            gsap.set(pulses, { autoAlpha: 0 });
            if (liqRing) gsap.set(liqRing, { autoAlpha: 0 });
            return;
          }

          /* Prime bracket lines + diamond outline for draw-on. */
          draws.forEach((p) => {
            const len = p.getTotalLength();
            gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
          });

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: root,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          });

          tl.from(
            headers,
            { autoAlpha: 0, y: -20, duration: 0.7, ease: "power3.out", stagger: 0.1 },
            0,
          )
            .from(
              nodes,
              { autoAlpha: 0, y: 24, duration: 0.7, ease: "power3.out", stagger: 0.07 },
              0.15,
            )
            .to(draws, { strokeDashoffset: 0, duration: 1.3, stagger: 0.07 }, 0.4);

          if (center) {
            tl.from(
              center,
              {
                autoAlpha: 0,
                scale: 0.82,
                svgOrigin: "600 400",
                duration: 0.9,
                ease: "power3.out",
              },
              1.5,
            );
          }

          /* THE red beat — liquidation pulses travel the bracket paths
             into the diamond, endlessly knocking competitors out. */
          const PULSE_AT = 2.2;
          pulses.forEach((p, i) => {
            const len = p.getTotalLength();
            const dash = 46;
            gsap.set(p, { strokeDasharray: `${dash} ${len}` });
            tl.fromTo(
              p,
              { strokeDashoffset: dash },
              {
                strokeDashoffset: -len,
                duration: 1.15,
                ease: "power1.in",
                repeat: -1,
                repeatDelay: 2.4,
              },
              PULSE_AT + (i % 6) * 0.4,
            );
          });

          if (liqRing) {
            tl.fromTo(
              liqRing,
              { autoAlpha: 0 },
              {
                autoAlpha: 0.45,
                duration: 1.2,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
              },
              PULSE_AT,
            );
          }
          if (liqText) {
            tl.fromTo(
              liqText,
              { opacity: 0.55 },
              {
                opacity: 1,
                duration: 0.9,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
              },
              PULSE_AT,
            );
          }
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="w-full">
      <svg
        viewBox="0 0 1200 800"
        role="img"
        aria-label={`${t("br.title")} — ${t("br.subtitle")} — ${t("br.elim")}`}
        className="h-auto w-full"
      >
        <defs>
          <linearGradient id="arena-br-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--arena-steel)" />
            <stop offset="45%" stopColor="var(--arena-white)" />
            <stop offset="100%" stopColor="var(--arena-silver)" />
          </linearGradient>
          <filter id="arena-br-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="arena-br-redglow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Column headers */}
        <g
          fontWeight={900}
          textAnchor="middle"
          style={{ fontFamily: "inherit" }}
        >
          <g data-header>
            <rect
              x={70}
              y={56}
              width={405}
              height={76}
              rx={8}
              fill="rgba(7,7,7,0.72)"
              stroke="url(#arena-br-stroke)"
              strokeWidth={1.6}
            />
            <text
              x={272}
              y={92}
              fill="var(--arena-steel)"
              fontSize={15}
              letterSpacing={6}
            >
              {t("br.cat")}
            </text>
            <text x={272} y={120} fill="var(--arena-white)" fontSize={30}>
              HUMAN TRADERS
            </text>
          </g>
          <g data-header>
            <rect
              x={725}
              y={56}
              width={405}
              height={76}
              rx={8}
              fill="rgba(7,7,7,0.72)"
              stroke="url(#arena-br-stroke)"
              strokeWidth={1.6}
            />
            <text
              x={927}
              y={92}
              fill="var(--arena-steel)"
              fontSize={15}
              letterSpacing={6}
            >
              {t("br.cat")}
            </text>
            <text x={927} y={120} fill="var(--arena-white)" fontSize={30}>
              AI AGENTS
            </text>
          </g>
        </g>

        {/* Bracket lines — chrome strokes, drawn on scroll */}
        <g
          fill="none"
          stroke="url(#arena-br-stroke)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        >
          {[...HUMAN_LINES, ...AGENT_LINES].map((d) => (
            <path key={d} data-draw d={d} />
          ))}
        </g>

        {/* Red liquidation pulses riding the same paths toward the center */}
        <g
          fill="none"
          stroke="var(--arena-red)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#arena-br-redglow)"
          aria-hidden
        >
          {[...HUMAN_LINES, ...AGENT_LINES].map((d) => (
            <path key={d} data-pulse d={d} strokeDasharray="0 9999" />
          ))}
        </g>

        {/* Competitor nodes — engraved panels */}
        <g>
          {NODE_YS.map((y) => (
            <g data-node key={`h-${y}`}>
              <rect
                x={82}
                y={y}
                width={168}
                height={68}
                rx={8}
                fill="rgba(7,7,7,0.7)"
                stroke="rgba(244,245,247,0.32)"
                strokeWidth={1.5}
              />
              <HumanIcon x={166} y={y + 34} />
            </g>
          ))}
          {NODE_YS.map((y) => (
            <g data-node key={`a-${y}`}>
              <rect
                x={950}
                y={y}
                width={168}
                height={68}
                rx={8}
                fill="rgba(7,7,7,0.7)"
                stroke="rgba(244,245,247,0.32)"
                strokeWidth={1.5}
              />
              <AgentIcon x={1034} y={y + 34} />
            </g>
          ))}
        </g>

        {/* Red breathing ring behind the diamond — liquidation only */}
        <path
          data-liq-ring
          d={DIAMOND}
          fill="none"
          stroke="var(--arena-red)"
          strokeWidth={2}
          filter="url(#arena-br-redglow)"
          opacity={0}
          aria-hidden
        />

        {/* Center diamond */}
        <g data-center fontWeight={900} textAnchor="middle" style={{ fontFamily: "inherit" }}>
          <path
            data-draw
            d={DIAMOND}
            fill="rgba(8,8,8,0.88)"
            stroke="url(#arena-br-stroke)"
            strokeWidth={3}
            filter="url(#arena-br-glow)"
          />
          <text x={600} y={378} fill="var(--arena-white)" fontSize={38}>
            {t("br.title")}
          </text>
          <text
            x={600}
            y={426}
            fill="var(--arena-silver)"
            fontSize={22}
            letterSpacing={4}
          >
            {t("br.subtitle")}
          </text>
          <text
            data-liq-text
            x={600}
            y={466}
            className="arena-liquidation"
            fill="currentColor"
            fontSize={17}
            letterSpacing={2}
            fontWeight={700}
            filter="url(#arena-br-redglow)"
          >
            {t("br.elim")}
          </text>
        </g>
      </svg>
    </div>
  );
}
