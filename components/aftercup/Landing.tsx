"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useSiteLanguage } from "@/components/site-language";
import { DATA, type AgendaItem } from "./data";
import { Brackets, SectionHead } from "./Hud";
import { localizedText } from "./locale";

export type HeroMode = "feed" | "medal" | "type";

const MONTHS = ["June", "July"] as const;

export function Landing({ onEnter }: { onEnter: () => void; hero?: HeroMode }) {
  const { language } = useSiteLanguage();
  const t = (value: string) => localizedText(value, language);
  const matchCount = DATA.agenda.filter((item) => item.kind === "match").length;
  const afterCount = DATA.agenda.filter((item) => item.kind === "after").length;
  const featured = DATA.agenda.filter((item) => item.kind !== "closed").slice(0, 10);

  const agendaByMonth = useMemo(() => {
    return MONTHS.map((month) => ({
      month,
      items: DATA.agenda.filter((item) => item.month === month),
    }));
  }, []);

  return (
    <div className="pdq-enter-fade">
      <section
        className="aftercup-hero"
        style={{
          padding: "150px var(--pdq-pad-x) 72px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <HeroEyebrow />

        <div
          className="pdq-hero-2col"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 36,
            flex: 1,
            alignItems: "start",
          }}
        >
          <div>
            <div className="pdq-eyebrow" style={{ marginBottom: 22 }}>
              {t("MATCH CUP + AFTER CUP / MATCH CUP + AFTER CUP")}
            </div>
            <h1
              className="pdq-display aftercup-hero-title"
              style={{
                fontSize: "clamp(50px, 8.2vw, 124px)",
                margin: "0 0 24px",
              }}
            >
              FRONTON
              <br />
              BUCARELI
              <br />
              <span style={{ color: "var(--pdq-accent)" }}>AGENDA.</span>
            </h1>
            <p
              style={{
                maxWidth: 620,
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--pdq-ink-2)",
                margin: "0 0 30px",
              }}
            >
              {t(
                "From June 11 to July 19, Aftercup turns Fronton Bucareli into a match-day and nightlife venue: giant screens, live broadcasts, food court, shared tables, international shows, club nights, and collective parties. / Del 11 de junio al 19 de julio, Aftercup convierte Fronton Bucareli en sede de partidos y vida nocturna: pantallas gigantes, transmisiones en vivo, food court, mesas compartidas, conciertos internacionales, club nights y fiestas de colectivos.",
              )}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="pdq-btn lg" href="#agenda">
                {t("VIEW AGENDA / VER AGENDA")} <span className="arr">→</span>
              </a>
              <button type="button" className="pdq-btn lg ghost" onClick={onEnter}>
                {t("OPEN QUEST MAP / ABRIR MAPA QUEST")} <span className="arr">→</span>
              </button>
              <a className="pdq-btn lg ghost" href="https://aftercup.mx/" target="_blank" rel="noreferrer">
                AFTERCUP.MX
              </a>
            </div>

            <div
              className="pdq-grid-4 aftercup-stat-grid"
              style={{
                marginTop: 48,
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
              }}
            >
              {[
                { k: "MATCHES", v: String(matchCount).padStart(2, "0") },
                { k: "AFTER CUP", v: String(afterCount).padStart(2, "0") },
                { k: "TABLES", v: "4/6/8" },
                { k: "VENUE", v: "118" },
              ].map((s) => (
                <Brackets key={s.k} className="glass aftercup-stat" style={{ padding: 18 }}>
                  <div className="pdq-mono" style={{ marginBottom: 8 }}>
                    {s.k}
                  </div>
                  <div className="pdq-display-alt" style={{ fontSize: 28, color: "var(--pdq-accent)" }}>
                    {s.v}
                  </div>
                </Brackets>
              ))}
            </div>
          </div>

          <HeroAgenda items={featured as AgendaItem[]} />
        </div>

        <div style={{ marginTop: "auto", paddingTop: 60, borderTop: "1px solid var(--pdq-line)" }}>
          <div className="pdq-line-label" style={{ marginBottom: 18 }}>
            <span>
              {t(
                "SOURCE: AFTERCUP.MX CALENDAR + FEVER TICKETING / FUENTE: CALENDARIO AFTERCUP.MX + FEVER",
              )}
            </span>
          </div>
          <div className="aftercup-marquee" aria-hidden>
            <span>MATCH CUP</span>
            <span>GIANT SCREENS</span>
            <span>FOOD COURT</span>
            <span>AFTER CUP</span>
            <span>INTERNATIONAL SHOWS</span>
            <span>BUCARELI 118</span>
          </div>
        </div>
      </section>

      <div className="pdq-divider" />

      <section className="pdq-section">
        <SectionHead
          code="01. ACCESS"
          title={
            <>
              {t("MATCHES, TABLES, / PARTIDOS, MESAS,")}
              <br />
              <span style={{ color: "var(--pdq-accent)" }}>
                {t("FOOD, NIGHTLIFE. / COMIDA, NOCHE.")}
              </span>
            </>
          }
          meta={
            <>
              FRONTON BUCARELI
              <br />
              BUCARELI 118
              <br />
              11 JUN - 19 JUL
            </>
          }
        />

        <div className="pdq-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {DATA.activities.map((activity, index) => (
            <Brackets key={activity.title} className="glass aftercup-activity" style={{ padding: 24, minHeight: 230 }}>
              <div className="pdq-mono" style={{ marginBottom: 22, color: "var(--pdq-accent)" }}>
                0{index + 1}
              </div>
              <div className="pdq-display-alt" style={{ fontSize: 20, marginBottom: 12 }}>
                {localizedText(activity.title, language)}
              </div>
              <div style={{ color: "var(--pdq-ink-2)", fontSize: 13.5, lineHeight: 1.55 }}>
                {localizedText(activity.detail, language)}
              </div>
            </Brackets>
          ))}
        </div>
      </section>

      <div className="pdq-divider" />

      <section id="agenda" className="pdq-section">
        <SectionHead
          code="02. FULL AGENDA"
          title={
            <>
              {t("MATCH CUP / MATCH CUP")}
              <br />
              <span style={{ color: "var(--pdq-accent)" }}>{t("+ AFTER CUP / + AFTER CUP")}</span>
            </>
          }
          meta={
            <>
              {t("PUBLISHED BY AFTERCUP / PUBLICADO POR AFTERCUP")}
              <br />
              {t("TIMES IN CDMX / HORARIOS CDMX")}
            </>
          }
        />

        <div style={{ display: "grid", gap: 32 }}>
          {agendaByMonth.map(({ month, items }) => (
            <div key={month}>
              <div className="aftercup-month-label">
                <span>{month}</span>
                <span>{items.length} items</span>
              </div>
              <div className="aftercup-agenda-list">
                {items.map((item) => (
                  <AgendaRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pdq-divider" />

      <section className="pdq-section" style={{ textAlign: "center", padding: "120px var(--pdq-pad-x)" }}>
        <div className="pdq-eyebrow" style={{ marginBottom: 28, justifyContent: "center" }}>
          {t("BUCARELI 118 / BUCARELI 118")}
        </div>
        <h2
          className="pdq-display"
          style={{
            fontSize: "clamp(46px, 8vw, 108px)",
            lineHeight: 0.88,
            margin: "0 0 32px",
          }}
        >
          {t("THE MATCH / EL PARTIDO")}
          <br />
          <span style={{ color: "var(--pdq-accent)" }}>{t("BECOMES NIGHT. / SE VUELVE NOCHE.")}</span>
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <a className="pdq-btn lg" href="https://aftercup.mx/" target="_blank" rel="noreferrer">
            AFTERCUP.MX <span className="arr">→</span>
          </a>
          <button type="button" className="pdq-btn lg ghost" onClick={onEnter}>
            {t("OPEN QUEST MAP / ABRIR MAPA QUEST")} <span className="arr">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function HeroEyebrow() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 44,
        gap: 18,
      }}
    >
      <div className="pdq-eyebrow">AFTERCUP / MATCH CUP / FRONTON BUCARELI</div>
      <div className="pdq-mono" style={{ color: "var(--pdq-ink-4)" }}>
        JUNE 11 - JULY 19, 2026 / BUCARELI 118, CDMX
      </div>
    </div>
  );
}

function HeroAgenda({ items }: { items: AgendaItem[] }) {
  const { language } = useSiteLanguage();

  return (
    <Brackets className="glass aftercup-agenda-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="aftercup-card-head">
        <span className="pdq-mono">OFFICIAL PROGRAM</span>
        <span className="pdq-tag live">
          <span className="pdq-dot" />
          MATCH + AFTER
        </span>
      </div>
      <div className="aftercup-feature-list">
        {items.map((item) => (
          <AgendaRow key={item.id} item={item} compact language={language} />
        ))}
      </div>
    </Brackets>
  );
}

function AgendaRow({
  item,
  compact = false,
  language,
}: {
  item: AgendaItem;
  compact?: boolean;
  language?: "en" | "es" | "zh";
}) {
  const { language: siteLanguage } = useSiteLanguage();
  const activeLanguage = language ?? siteLanguage;
  const kindLabel =
    item.kind === "match"
      ? "MATCH CUP"
      : item.kind === "after"
        ? "AFTER CUP"
        : activeLanguage === "es"
          ? "SIN EVENTO"
          : "NO EVENT";

  return (
    <div className={`aftercup-agenda-row ${compact ? "compact" : ""} ${item.kind}`}>
      <div className="aftercup-date">
        <span>{item.date}</span>
        <small>{item.month.slice(0, 3)}</small>
      </div>
      {item.poster ? (
        <div className="aftercup-poster-thumb">
          <Image src={item.poster} alt={`${localizedText(item.title, activeLanguage)} poster`} fill sizes="96px" />
        </div>
      ) : null}
      <div className="aftercup-agenda-main">
        <div className="aftercup-agenda-meta">
          <span>{item.day}</span>
          <span>{kindLabel}</span>
          {item.time ? <span>{item.time} HRS</span> : null}
        </div>
        <div className="aftercup-agenda-title">{localizedText(item.title, activeLanguage)}</div>
        {item.price ? <div className="aftercup-agenda-price">{item.price}</div> : null}
      </div>
    </div>
  );
}
