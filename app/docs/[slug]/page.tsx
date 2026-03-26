import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PillNav from "@/components/PillNav";
import { getDiagrams } from "@/src/lib/diagrams";
import {
  DOC_ARTICLE_CLASSNAME,
  getDocumentationEntries,
  getDocumentationEntry,
} from "@/src/lib/docs";
import { docsNavItems } from "@/src/lib/navigation";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const documents = await getDocumentationEntries();
  return documents.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = await getDocumentationEntry(slug);

  if (!document) {
    return {
      title: "Document Not Found",
    };
  }

  return {
    title: `${document.title} | AXIS Docs`,
    description: document.summary,
  };
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [document, documents, diagrams] = await Promise.all([
    getDocumentationEntry(slug),
    getDocumentationEntries(),
    getDiagrams(),
  ]);

  if (!document) {
    notFound();
  }

  const sectionDocuments = documents.filter((entry) => entry.section === document.section);

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
            Document Reader
          </div>
          <h1 className="mt-4 bg-gradient-to-b from-white via-[#d9d9d9] to-[#8a8a8a] bg-clip-text text-3xl font-semibold leading-tight tracking-[-0.04em] text-transparent sm:text-5xl">
            {document.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70 sm:text-base">{document.summary}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="rounded-full border border-white/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(155,155,155,0.12))] px-4 py-2 text-sm text-white/88 transition-all hover:border-white/40 hover:text-white"
            >
              Back To Documents
            </Link>
            <Link
              href="/docs/diagrams"
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/64 transition-all hover:border-white/24 hover:text-white"
            >
              Open Diagrams
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden xl:sticky xl:top-6 xl:block xl:self-start">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(140,140,140,0.04))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">Document Menu</div>

              <div className="mt-5 space-y-3">
                <Link
                  href="/docs"
                  className="inline-flex rounded-full border border-white/12 px-4 py-2 text-sm text-white/72 transition-all hover:border-white/24 hover:text-white"
                >
                  All Documents
                </Link>
                <Link
                  href="/docs/diagrams"
                  className="inline-flex rounded-full border border-white/12 px-4 py-2 text-sm text-white/72 transition-all hover:border-white/24 hover:text-white"
                >
                  Diagrams
                </Link>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/38">{document.section}</div>
                <div className="space-y-2">
                  {sectionDocuments.map((entry) => (
                    <Link
                      key={entry.slug}
                      href={`/docs/${entry.slug}`}
                      className={`block rounded-2xl border px-4 py-3 transition-all ${
                        entry.slug === document.slug
                          ? "border-white/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(140,140,140,0.1))]"
                          : "border-white/8 bg-black/20 hover:border-white/24 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(140,140,140,0.08))]"
                      }`}
                    >
                      <div className="text-sm font-medium text-white">{entry.title}</div>
                      <div className="mt-1 text-xs leading-5 text-white/52">{entry.summary}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0 rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(140,140,140,0.04))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:rounded-[32px] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/48">
                  {document.section}
                </div>
                <p className="mt-3 break-all text-sm text-white/44">{document.sourcePath}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em]">
                <Link
                  href="/docs"
                  className="rounded-full border border-white/12 px-4 py-2 text-white/64 transition-all hover:border-white/24 hover:text-white"
                >
                  Back To Hub
                </Link>
                <a
                  href="#top"
                  className="rounded-full border border-white/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(155,155,155,0.12))] px-4 py-2 text-white/84 transition-all hover:border-white/40 hover:text-white"
                >
                  Top
                </a>
              </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:hidden">
              <Link
                href="/docs"
                className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white/72"
              >
                All Docs
              </Link>
              <Link
                href="/docs/diagrams"
                className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white/72"
              >
                Diagrams
              </Link>
              {sectionDocuments.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/docs/${entry.slug}`}
                  className={`rounded-2xl border px-4 py-3 text-sm transition-all ${
                    entry.slug === document.slug
                      ? "border-white/28 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(155,155,155,0.12))] text-white"
                      : "border-white/12 bg-black/25 text-white/72"
                  }`}
                >
                  {entry.title}
                </Link>
              ))}
            </div>

            <div className="min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.16))] p-4 sm:rounded-[28px] sm:p-6">
              <article className={DOC_ARTICLE_CLASSNAME} dangerouslySetInnerHTML={{ __html: document.html }} />
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.16))] p-4 sm:rounded-[28px] sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/48">
                    Embedded Diagrams
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                    Visual deployment and architecture references
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                    The same system diagrams are available here inside the document so you can review flows, contracts,
                    and deployment context without leaving the page.
                  </p>
                </div>
                <Link
                  href="/docs/diagrams"
                  className="inline-flex rounded-full border border-white/12 px-4 py-2 text-sm text-white/72 transition-all hover:border-white/24 hover:text-white"
                >
                  Open Full Diagram Board
                </Link>
              </div>

              <div className="grid gap-5">
                {diagrams.map((diagram, index) => (
                  <section
                    key={diagram.slug}
                    className="overflow-hidden rounded-[22px] border border-white/10 bg-black/20 p-3 sm:p-4"
                  >
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/46">
                          {diagram.section} · Diagram {index + 1}
                        </div>
                        <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{diagram.title}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">{diagram.summary}</p>
                      </div>
                      <a
                        href={diagram.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full border border-white/24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(155,155,155,0.12))] px-4 py-2 text-sm text-white/84 transition-all hover:border-white/40 hover:text-white"
                      >
                        Open SVG
                      </a>
                    </div>

                    <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white/4 p-2 sm:p-3">
                      <img
                        src={diagram.imageUrl}
                        alt={diagram.title}
                        className="h-auto max-h-[75vh] w-full rounded-[16px] bg-white object-contain"
                        loading="lazy"
                      />
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
