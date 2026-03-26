import type { Metadata } from "next";
import Link from "next/link";
import PillNav from "@/components/PillNav";
import { getDiagrams } from "@/src/lib/diagrams";
import { docsNavItems } from "@/src/lib/navigation";

export const metadata: Metadata = {
  title: "AXIS Diagrams",
  description: "Live PlantUML diagrams for the AXIS contract and app architecture.",
};

export default async function DiagramsPage() {
  const diagrams = await getDiagrams();
  const sections = Array.from(new Set(diagrams.map((diagram) => diagram.section)));

  return (
    <main
      id="top"
      className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,#050505,#000)] px-4 py-10 text-white sm:px-6 sm:py-14"
    >
      <div className="mx-auto max-w-7xl pt-20 sm:pt-24">
        <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
          <PillNav
            logo="/logo.png"
            logoAlt="AXIS logo"
            items={docsNavItems}
            activeHref="/docs/diagrams"
            className="custom-nav"
            ease="power2.easeOut"
            baseColor="#000"
            pillColor="#fff"
            hoveredPillTextColor="#000"
            pillTextColor="#000"
            initialLoadAnimation={false}
          />
        </div>

        <div className="mb-8 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(150,150,150,0.06))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-[32px] sm:p-8">
          <div className="inline-flex rounded-full border border-white/20 bg-white/6 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/58">
            System Diagrams
          </div>
          <h1 className="mt-4 bg-gradient-to-b from-white via-[#d9d9d9] to-[#8a8a8a] bg-clip-text text-3xl font-semibold leading-tight tracking-[-0.04em] text-transparent sm:text-5xl">
            AXIS<span className="copy-mark">©</span> PlantUML Board
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
            Live-rendered contract and app integration diagrams sourced from the local `.puml` files in `docs/diagrams`.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-white/48">
            <span className="rounded-full border border-white/10 px-3 py-1">Monochrome Ops View</span>
            <span className="rounded-full border border-white/10 px-3 py-1">PlantUML SVG</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Live From Repo Files</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="rounded-full border border-white/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(155,155,155,0.12))] px-4 py-2 text-sm text-white/88 transition-all hover:border-white/40 hover:text-white"
            >
              Open Documents
            </Link>
            <a
              href="#diagram-menu"
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/64 transition-all hover:border-white/24 hover:text-white"
            >
              Jump To Menu
            </a>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside id="diagram-menu" className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(140,140,140,0.04))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">Diagram Menu</div>
              <nav className="mt-5 space-y-5">
                {sections.map((section) => (
                  <div key={section}>
                    <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/38">{section}</div>
                    <div className="space-y-2">
                      {diagrams
                        .filter((diagram) => diagram.section === section)
                        .map((diagram) => (
                          <a
                            key={diagram.slug}
                            href={`#${diagram.slug}`}
                            className="block rounded-2xl border border-white/8 bg-black/20 px-4 py-3 transition-all hover:border-white/24 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(140,140,140,0.08))]"
                          >
                            <div className="text-sm font-medium text-white">{diagram.title}</div>
                            <div className="mt-1 text-xs leading-5 text-white/52">{diagram.summary}</div>
                          </a>
                        ))}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="mt-6 rounded-2xl border border-white/8 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/44">Route</div>
                <div className="mt-2 text-sm text-white">/docs/diagrams</div>
                <Link
                  href="/docs"
                  className="mt-4 inline-flex rounded-full border border-white/12 px-4 py-2 text-sm text-white/72 transition-all hover:border-white/24 hover:text-white"
                >
                  Back To Documents
                </Link>
              </div>
            </div>
          </aside>

          <div className="grid gap-6">
            {diagrams.map((diagram, index) => (
              <section
                key={diagram.slug}
                id={diagram.slug}
                className="min-w-0 rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(140,140,140,0.04))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-6"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/48">
                      {diagram.section} · Diagram {index + 1}
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                      {diagram.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{diagram.summary}</p>
                    <p className="mt-2 text-sm text-white/44">/{diagram.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em]">
                    <a
                      href={diagram.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(155,155,155,0.12))] px-4 py-2 text-white/84 transition-all hover:border-white/40 hover:text-white"
                    >
                      Open SVG
                    </a>
                    <a
                      href={`#${diagram.slug}`}
                      className="rounded-full border border-white/12 px-4 py-2 text-white/64 transition-all hover:border-white/24 hover:text-white"
                    >
                      Anchor Link
                    </a>
                    <a
                      href="#diagram-menu"
                      className="rounded-full border border-white/12 px-4 py-2 text-white/64 transition-all hover:border-white/24 hover:text-white"
                    >
                      Back To Menu
                    </a>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.16))] p-3 sm:p-5">
                  <p className="mb-3 text-xs leading-5 text-white/52 sm:hidden">
                    Diagrams are scaled to fit the screen without horizontal scroll. Use <span className="text-white/78">Open SVG</span> to zoom and inspect every label on mobile.
                  </p>
                  <img
                    src={diagram.imageUrl}
                    alt={diagram.title}
                    className="h-auto max-h-[75vh] w-full rounded-[20px] bg-white object-contain"
                    loading="lazy"
                  />
                </div>

                <details className="mt-4 rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <summary className="cursor-pointer text-sm uppercase tracking-[0.18em] text-white/64">
                    View PlantUML Source
                  </summary>
                  <pre className="mt-4 overflow-x-hidden whitespace-pre-wrap break-words rounded-2xl border border-white/8 bg-black/40 p-4 text-xs leading-6 text-white">
                    <code>{diagram.source}</code>
                  </pre>
                </details>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
