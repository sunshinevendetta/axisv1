"use client";

import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

gsap.registerPlugin(ScrollTrigger);

/* Hub-and-spoke system diagram, styled as an order-routing topology: the hub
   is the matching-engine core (rotating tick ring + counter-rotating orderflow
   dashes) and every satellite is a data module with a deterministic sparkline
   or bar readout. The SVG underlay draws the spokes in a 0 0 100 62 viewBox
   stretched to the container (preserveAspectRatio="none"), so viewBox units
   map 1:1 onto the percentage coordinates of the HTML nodes. pathLength={1}
   normalizes every spoke so dash math is resolution-free. */

const VB_H = 62; // viewBox height => y% * 0.62
const HUB = { x: 50, y: 50 } as const;

interface SystemNode {
  label: ArenaKey;
  sub: ArenaKey;
  x: number; // left, %
  y: number; // top, %
  /** Untranslated HUD jargon tag — deliberately not routed through t(). */
  tag: string;
  /** Deterministic fake readout value. */
  delta: string;
  /** Marks the readout as a down/short series => var(--arena-red) (data only). */
  down?: boolean;
  kind: "spark" | "bars";
  series: readonly number[];
}

const NODES: readonly SystemNode[] = [
  { label: "s7.n1", sub: "s7.n1s", x: 50, y: 12, tag: "OPS", delta: "+1.2%", kind: "bars", series: [4, 6, 5, 7, 8, 7, 9, 10] },
  { label: "s7.n2", sub: "s7.n2s", x: 83, y: 29, tag: "FLOW", delta: "+3.2%", kind: "spark", series: [3, 4, 3.4, 5, 4.6, 6, 5.4, 7, 6.6, 8] },
  { label: "s7.n3", sub: "s7.n3s", x: 83, y: 71, tag: "FLOW", delta: "-0.8%", down: true, kind: "spark", series: [7, 6.4, 6.8, 5.6, 6, 5, 5.4, 4.4, 4.8, 4] },
  { label: "s7.n4", sub: "s7.n4s", x: 50, y: 88, tag: "LIVE", delta: "+5.1%", kind: "bars", series: [2, 3, 5, 4, 6, 8, 7, 10] },
  { label: "s7.n5", sub: "s7.n5s", x: 17, y: 71, tag: "FEED", delta: "+4.6%", kind: "spark", series: [4, 4.6, 4.2, 5.4, 5, 6.4, 6, 7.4, 7, 8.6] },
  { label: "s7.n6", sub: "s7.n6s", x: 17, y: 29, tag: "LIVE", delta: "+2.4%", kind: "spark", series: [5, 4.4, 5.6, 5, 6.2, 5.6, 6.8, 6.2, 7.4, 7] },
];

const HUB_SURFACE: CSSProperties = {
  background:
    "radial-gradient(circle at 50% 30%, #2c3036 0%, #0b0b0c 62%, #000000 100%)",
  boxShadow:
    "inset 0 2px 0 rgba(255,255,255,0.24), inset 0 -12px 28px rgba(0,0,0,0.8), 0 0 70px rgba(244,245,247,0.16)",
};

function Sparkline({ series, down }: { series: readonly number[]; down?: boolean }) {
  const W = 56;
  const H = 16;
  const P = 2;
  const min = Math.min(...series);
  const span = Math.max(...series) - min || 1;
  const d = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * W;
      const y = P + (1 - (v - min) / span) * (H - P * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-4 w-14 shrink-0" fill="none" aria-hidden="true">
      <path
        data-spark
        d={d}
        pathLength={1}
        strokeDasharray={1}
        stroke={down ? "var(--arena-red)" : "rgba(244,245,247,0.9)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{
          filter: down
            ? "drop-shadow(0 0 4px rgba(255,43,63,0.5))"
            : "drop-shadow(0 0 4px rgba(244,245,247,0.45))",
        }}
      />
    </svg>
  );
}

function Bars({ series }: { series: readonly number[] }) {
  const W = 56;
  const H = 16;
  const bw = 4;
  const gap = (W - series.length * bw) / (series.length - 1);
  const max = Math.max(...series);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-4 w-14 shrink-0" aria-hidden="true">
      {series.map((v, i) => {
        const h = Math.max(1.5, (v / max) * H);
        return (
          <rect
            key={i}
            x={(i * (bw + gap)).toFixed(1)}
            y={(H - h).toFixed(1)}
            width={bw}
            height={h.toFixed(1)}
            fill={i === series.length - 1 ? "rgba(244,245,247,0.95)" : "rgba(244,245,247,0.35)"}
          />
        );
      })}
    </svg>
  );
}

function HubFace({ l1, l2 }: { l1: string; l2: string }) {
  return (
    <>
      {/* Matching-engine core: rotating tick ring + counter-rotating orderflow dashes. */}
      <svg
        className="pointer-events-none absolute -inset-3"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <g data-hub-ring>
          <circle
            cx={50}
            cy={50}
            r={48}
            stroke="rgba(244,245,247,0.35)"
            strokeWidth={0.8}
            strokeDasharray="0.6 4.2"
          />
        </g>
        <g data-hub-ring-rev>
          <circle
            cx={50}
            cy={50}
            r={44}
            stroke="rgba(244,245,247,0.16)"
            strokeWidth={1.6}
            strokeDasharray="9 17"
          />
        </g>
      </svg>
      <span className="arena-chrome arena-chrome--live text-lg font-black tracking-tight lg:text-xl">
        {l1}
      </span>
      <span className="mt-1 block max-w-[80%] text-[0.5rem] font-bold uppercase leading-tight tracking-[0.3em] text-[var(--arena-silver)]">
        {l2}
      </span>
    </>
  );
}

function NodeFace({ node, label, sub }: { node: SystemNode; label: string; sub: string }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-extrabold uppercase tracking-wide text-[var(--arena-white)]">
          {label}
        </span>
        <span className="rounded-[2px] border border-[var(--arena-line)] px-1 py-px font-mono text-[0.5rem] font-semibold tracking-[0.18em] text-[var(--arena-steel)]">
          {node.tag}
        </span>
      </div>
      <span className="mt-0.5 block text-[0.65rem] font-medium leading-snug text-[var(--arena-steel)]">
        {sub}
      </span>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--arena-line)] pt-1.5">
        {node.kind === "spark" ? (
          <Sparkline series={node.series} down={node.down} />
        ) : (
          <Bars series={node.series} />
        )}
        <span
          className={`font-mono text-[0.6rem] font-bold tabular-nums ${node.down ? "arena-down" : "arena-up"}`}
        >
          {node.delta}
        </span>
      </div>
    </>
  );
}

export default function Slide07System({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>(({ root, reduced }) => {
    if (reduced) return;

    // Matching-engine core: slow tick ring + faster counter-rotating dashes.
    // Applies to both layouts (rings render in the hub face itself).
    gsap.to(root.querySelectorAll("[data-hub-ring]"), {
      rotation: 360,
      duration: 36,
      ease: "none",
      repeat: -1,
      transformOrigin: "50% 50%",
    });
    gsap.to(root.querySelectorAll("[data-hub-ring-rev]"), {
      rotation: -360,
      duration: 22,
      ease: "none",
      repeat: -1,
      transformOrigin: "50% 50%",
    });

    // Sparkline readouts draw on as their card enters (both layouts).
    gsap.utils
      .toArray<SVGPathElement>(root.querySelectorAll("[data-spark]"))
      .forEach((path) => {
        gsap.from(path, {
          strokeDashoffset: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: path,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

    // Radial diagram only exists visually at lg+; scope its choreography there
    // so the stacked mobile layout stays on the shared [data-reveal] path.
    const mm = gsap.matchMedia(root);
    mm.add("(min-width: 1024px)", () => {
      const diagram = root.querySelector<HTMLElement>("[data-diagram]");
      if (!diagram) return;

      const hub = diagram.querySelector<HTMLElement>("[data-hub]");
      const spokes = gsap.utils.toArray<SVGLineElement>(
        diagram.querySelectorAll("[data-spoke]"),
      );
      const nodes = gsap.utils.toArray<HTMLElement>(
        diagram.querySelectorAll("[data-node]"),
      );
      const pulses = gsap.utils.toArray<SVGLineElement>(
        diagram.querySelectorAll("[data-pulse]"),
      );

      // Assembly: hub lands, spokes draw outward, nodes pop in around the ring.
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: diagram,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });
      if (hub) {
        tl.from(hub, {
          autoAlpha: 0,
          scale: 0.55,
          duration: 0.9,
          ease: "back.out(1.6)",
        });
      }
      tl.from(
        spokes,
        {
          strokeDashoffset: 1,
          duration: 0.8,
          stagger: 0.09,
          ease: "power2.inOut",
        },
        "-=0.35",
      ).from(
        nodes,
        {
          autoAlpha: 0,
          y: 18,
          scale: 0.88,
          duration: 0.7,
          stagger: 0.09,
          ease: "back.out(1.8)",
        },
        "-=0.55",
      );

      // Ambient beat: a short mono-glow dash travels each spoke hub -> node,
      // forever, paused while the diagram is off screen.
      if (pulses.length > 0) {
        gsap.set(pulses, { opacity: 0.9 });
        gsap.fromTo(
          pulses,
          { strokeDashoffset: 0.12 },
          {
            strokeDashoffset: -1.05,
            duration: 2.6,
            ease: "sine.inOut",
            repeat: -1,
            repeatDelay: 1.3,
            delay: 1.6,
            stagger: { each: 0.45 },
            scrollTrigger: {
              trigger: diagram,
              start: "top 70%",
              toggleActions: "play pause resume pause",
            },
          },
        );
      }
    });
  });

  return (
    <SlideShell index={index} kicker={t("kicker.07")} id="slide-07">
      <div ref={ref}>
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live text-center text-[clamp(1.3rem,2.2vw,1.75rem)] font-black uppercase leading-tight tracking-tight"
        >
          {t("s7.h2")}
        </h2>

        {/* Radial hub-and-spoke — desktop */}
        <div
          data-diagram
          className="relative mx-auto mt-12 hidden aspect-[16/10] w-full max-w-4xl lg:block"
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 100 ${VB_H}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            {/* faint orbit for depth */}
            <ellipse
              cx={HUB.x}
              cy={(HUB.y / 100) * VB_H}
              rx={24}
              ry={15}
              stroke="rgba(244,245,247,0.1)"
              strokeWidth={1}
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
            />
            {NODES.map((n) => (
              <line
                key={`spoke-${n.label}`}
                data-spoke
                x1={HUB.x}
                y1={(HUB.y / 100) * VB_H}
                x2={n.x}
                y2={(n.y / 100) * VB_H}
                pathLength={1}
                strokeDasharray={1}
                stroke="rgba(244,245,247,0.24)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <g style={{ filter: "drop-shadow(0 0 6px rgba(244,245,247,0.7))" }}>
              {NODES.map((n) => (
                <line
                  key={`pulse-${n.label}`}
                  data-pulse
                  x1={HUB.x}
                  y1={(HUB.y / 100) * VB_H}
                  x2={n.x}
                  y2={(n.y / 100) * VB_H}
                  pathLength={1}
                  strokeDasharray="0.12 1"
                  opacity={0}
                  stroke="rgba(255,255,255,0.95)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          </svg>

          {NODES.map((n) => (
            <div
              key={`node-${n.label}`}
              data-node
              className="arena-panel absolute w-44 -translate-x-1/2 -translate-y-1/2 rounded-lg px-3.5 py-3 text-left"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <NodeFace node={n} label={t(n.label)} sub={t(n.sub)} />
            </div>
          ))}

          <div
            data-hub
            className="absolute left-1/2 top-1/2 z-10 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/40 text-center"
            style={HUB_SURFACE}
          >
            <HubFace l1={t("s7.hub.l1")} l2={t("s7.hub.l2")} />
          </div>
        </div>

        {/* Stacked layout — small screens (no spokes, same content) */}
        <div className="mt-12 lg:hidden">
          <div
            data-reveal="scale"
            className="relative mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/40 text-center"
            style={HUB_SURFACE}
          >
            <HubFace l1={t("s7.hub.l1")} l2={t("s7.hub.l2")} />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {NODES.map((n) => (
              <div
                key={`stack-${n.label}`}
                data-reveal
                className="arena-panel rounded-lg px-3.5 py-3 text-left"
              >
                <NodeFace node={n} label={t(n.label)} sub={t(n.sub)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
