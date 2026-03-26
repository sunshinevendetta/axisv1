import type { Metadata } from "next";
import Link from "next/link";
import PillNav from "@/components/PillNav";
import { DOC_ARTICLE_CLASSNAME, getDocumentationEntries } from "@/src/lib/docs";
import { docsNavItems } from "@/src/lib/navigation";

export const metadata: Metadata = {
  title: "AXIS Documents",
  description: "Project documentation, operational guides, and architecture notes for AXIS.",
};

export default async function DocsPage() {
  const documents = await getDocumentationEntries();
  const sections = Array.from(new Set(documents.map((document) => document.section)));

  return (
    <main
      id="top"
      className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,#050505,#000)] px-4 py-8 text-white sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl pt-20 sm:pt-24">
        <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
          <PillNav
            logo="/logo.png"
            logoAlt="AXIS logo"
            items={docsNavItems}
            activeHref="/docs"
            className="custom-nav"
            ease="power2.easeOut"
            baseColor="#000"
            pillColor="#fff"
            hoveredPillTextColor="#000"
            pillTextColor="#000"
            initialLoadAnimation={false}
          />
        </div>

        <div className="mb-6 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(150,150,150,0.06))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-[32px] sm:p-8">
          <div className="inline-flex rounded-full border border-white/20 bg-white/6 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/58">
            Documentation Hub
          </div>
          <h1 className="mt-4 bg-gradient-to-b from-white via-[#d9d9d9] to-[#8a8a8a] bg-clip-text text-3xl font-semibold leading-tight tracking-[-0.04em] text-transparent sm:text-5xl">
            AXIS<span className="copy-mark">©</span> Documents
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
            Read the local Markdown docs directly in the app, jump between sections from the menu, and move back to
            the diagram board whenever you need the visual architecture.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#docs-menu"
              className="rounded-full border border-white/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(155,155,155,0.12))] px-4 py-2 text-sm text-white/88 transition-all hover:border-white/40 hover:text-white"
            >
              Jump To Menu
            </Link>
            <Link
              href="/docs/diagrams"
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/64 transition-all hover:border-white/24 hover:text-white"
            >
              Open Diagrams
            </Link>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:hidden">
          <Link
            href="/docs/diagrams"
            className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white/72"
          >
            Diagrams
          </Link>
          {documents.map((document, index) => (
            <Link
              key={document.slug}
              href={`/docs/${document.slug}`}
              className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white/72"
            >
              {index + 1}. {document.title}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 xl:hidden">
          {documents.map((document, index) => (
            <Link
              key={document.slug}
              href={`/docs/${document.slug}`}
              className="rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(140,140,140,0.04))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.34)] backdrop-blur-2xl transition-all hover:border-white/24"
            >
              <div className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/48">
                {document.section} · Document {index + 1}
              </div>
              <h2 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.03em] text-white">{document.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">{document.summary}</p>
              <div className="mt-4 inline-flex rounded-full border border-white/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(155,155,155,0.12))] px-4 py-2 text-sm text-white/84">
                Open document
              </div>
            </Link>
          ))}
        </div>

        <div className="hidden gap-6 xl:grid xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside id="docs-menu" className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(140,140,140,0.04))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">Document Menu</div>
              <nav className="mt-5 space-y-5">
                {sections.map((section) => (
                  <div key={section}>
                    <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/38">{section}</div>
                    <div className="space-y-2">
                      {documents
                        .filter((document) => document.section === section)
                        .map((document) => (
                          <a
                            key={document.slug}
                            href={`#${document.slug}`}
                            className="block rounded-2xl border border-white/8 bg-black/20 px-4 py-3 transition-all hover:border-white/24 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(140,140,140,0.08))]"
                          >
                            <div className="text-sm font-medium text-white">{document.title}</div>
                            <div className="mt-1 text-xs leading-5 text-white/52">{document.summary}</div>
                          </a>
                        ))}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="mt-6 space-y-3 rounded-2xl border border-white/8 bg-black/25 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/44">Routes</div>
                  <div className="mt-2 text-sm text-white">/docs</div>
                </div>
                <Link
                  href="/docs/diagrams"
                  className="inline-flex rounded-full border border-white/12 px-4 py-2 text-sm text-white/72 transition-all hover:border-white/24 hover:text-white"
                >
                  Go To Diagrams
                </Link>
              </div>
            </div>
          </aside>

          <div className="grid gap-6">
            {documents.map((document, index) => (
              <section
                key={document.slug}
                id={document.slug}
                className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(140,140,140,0.04))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-6"
              >
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/48">
                      {document.section} · Document {index + 1}
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-3xl">
                      {document.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{document.summary}</p>
                    <p className="mt-2 text-sm text-white/44">{document.sourcePath}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em]">
                    <Link
                      href={`/docs/${document.slug}`}
                      className="rounded-full border border-white/12 px-4 py-2 text-white/64 transition-all hover:border-white/24 hover:text-white"
                    >
                      Open Page
                    </Link>
                    <a
                      href="#docs-menu"
                      className="rounded-full border border-white/12 px-4 py-2 text-white/64 transition-all hover:border-white/24 hover:text-white"
                    >
                      Back To Menu
                    </a>
                    <a
                      href="#top"
                      className="rounded-full border border-white/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(155,155,155,0.12))] px-4 py-2 text-white/84 transition-all hover:border-white/40 hover:text-white"
                    >
                      Top
                    </a>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.16))] p-4 sm:p-6">
                  <article className={DOC_ARTICLE_CLASSNAME} dangerouslySetInnerHTML={{ __html: document.html }} />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
