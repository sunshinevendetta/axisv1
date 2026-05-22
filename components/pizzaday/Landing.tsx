"use client";

import { useEffect, useRef, useState } from "react";
import { DATA, type FeedItem } from "./data";
import { Brackets, Glitch, LiveTicker, Medal, Reticle, SectionHead } from "./Hud";

export type HeroMode = "feed" | "medal" | "type";

export function Landing({ onEnter, hero = "feed" }: { onEnter: () => void; hero?: HeroMode }) {
  const D = DATA;

  return (
    <div className="pdq-enter-fade">
      <section
        style={{
          padding: "160px var(--pdq-pad-x) 80px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <HeroEyebrow />

        {hero === "feed" && <HeroFeed onEnter={onEnter} />}
        {hero === "medal" && <HeroMedal onEnter={onEnter} />}
        {hero === "type" && <HeroType onEnter={onEnter} />}

        <div style={{ marginTop: "auto", paddingTop: 80, borderTop: "1px solid var(--pdq-line)" }}>
          <div className="pdq-line-label" style={{ marginBottom: 18 }}>
            <span>LIVE FEED, PDQ·01, Supremo · Doctores, {D.feed.length * 17} clears per day</span>
          </div>
          <LiveTicker items={D.feed as FeedItem[]} speed={50} />
        </div>
      </section>

      <div className="pdq-divider" />

      <section className="pdq-section">
        <SectionHead
          code="01. OVERVIEW"
          title={
            <>
              ONE DAY.
              <br />
              ONE VENUE.
              <br />
              <span style={{ color: "var(--pdq-ink-3)" }}>ONE CHIP.</span>
            </>
          }
          meta={
            <>
              YOU SIGN IN WITH A WALLET.
              <br />
              YOU TAP TASKS ON SITE.
              <br />
              YOU EARN MEDALS IN PERSON.
            </>
          }
        />

        <div
          className="pdq-grid-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "var(--pdq-line)",
            border: "1px solid var(--pdq-line)",
          }}
        >
          {[
            {
              n: "01",
              t: "GET YOUR CHIP",
              d: "At the door desk, you get an NFC chip and a slice. Your chip holds your access.",
              g: "◈",
            },
            {
              n: "02",
              t: "COMPLETE TASKS",
              d: "Tap, post, record, mint, talk, scan, or join a group task. Each task gives you one medal.",
              g: "◊",
            },
            {
              n: "03",
              t: "GAIN RANK",
              d: "XP moves you from Initiate to Monolith. Higher rank unlocks more tasks.",
              g: "◉",
            },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                background: "var(--pdq-bg)",
                padding: "48px 36px 36px",
                position: "relative",
                minHeight: 320,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  right: 28,
                  fontFamily: "var(--pdq-mono)",
                  fontSize: 11,
                  color: "var(--pdq-ink-4)",
                }}
              >
                {s.n} / 03
              </div>
              <div
                style={{
                  fontFamily: "var(--pdq-display-alt)",
                  fontSize: 56,
                  lineHeight: 1,
                  color: "var(--pdq-ink-5)",
                  marginBottom: 16,
                  marginTop: -12,
                }}
              >
                {s.g}
              </div>
              <div className="pdq-display" style={{ fontSize: 26, marginBottom: 12 }}>
                {s.t}
              </div>
              <div style={{ color: "var(--pdq-ink-2)", fontSize: 14, lineHeight: 1.5, maxWidth: 320 }}>
                {s.d}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pdq-divider" />

      <section className="pdq-section">
        <SectionHead
          code="02. TASKS"
          title={
            <>
              EIGHT TASKS
              <br />
              TO START.
            </>
          }
          meta={
            <>
              NFC. POST. REC. MINT.
              <br />
              TALK. SCAN. GROUP. LOCKED.
              <br />
              <br />
              ONE TASK GIVES YOU ONE MEDAL.
            </>
          }
        />

        <div className="pdq-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {D.missionTypes.map((m) => (
            <Brackets key={m.id} className="glass" style={{ padding: 24, minHeight: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <span className="pdq-mono">{m.code}</span>
                <span className="pdq-mono" style={{ color: "var(--pdq-ink-4)" }}>
                  {m.short}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--pdq-display-alt)",
                  fontSize: 40,
                  lineHeight: 1,
                  marginBottom: 14,
                  color: "var(--pdq-ink)",
                }}
              >
                {m.glyph}
              </div>
              <div className="pdq-display" style={{ fontSize: 18, marginBottom: 8 }}>
                {m.name}
              </div>
              <div style={{ color: "var(--pdq-ink-3)", fontSize: 12, lineHeight: 1.5 }}>{m.blurb}</div>
            </Brackets>
          ))}
        </div>
      </section>

      <div className="pdq-divider" />

      <section className="pdq-section">
        <SectionHead
          code="03. RANKS"
          title={
            <>
              FIVE RANKS.
              <br />
              ONE PROFILE.
            </>
          }
          meta={
            <>
              NO PURCHASE.
              <br />
              YOUR XP SETS THE RANK.
              <br />
              YOUR RANK SETS ACCESS.
            </>
          }
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--pdq-line)" }}>
          {D.ranks.map((r, i) => (
            <div
              key={r.id}
              className="pdq-rank-row"
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 220px 110px 100px",
                alignItems: "center",
                gap: 20,
                padding: "22px 26px",
                borderBottom: i < D.ranks.length - 1 ? "1px solid var(--pdq-line)" : "none",
                background: i === 1 ? "rgba(255,255,255,0.02)" : "transparent",
              }}
            >
              <div className="pdq-mono" style={{ color: "var(--pdq-ink-4)" }}>
                0{r.index}
              </div>
              <div className="pdq-display" style={{ fontSize: 34 }}>
                {r.title}
              </div>
              <div style={{ color: "var(--pdq-ink-3)", fontSize: 13, lineHeight: 1.4 }}>{r.desc}</div>
              <div className="pdq-mono">{`>= ${r.req} XP`}</div>
              <div className="pdq-mono" style={{ textAlign: "right" }}>
                {r.id === "initiate" ? "BASE" : r.id === "monolith" ? "TOP" : "EARNED"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pdq-divider" />

      <section className="pdq-section" style={{ textAlign: "center", padding: "140px var(--pdq-pad-x)" }}>
        <div className="pdq-eyebrow" style={{ marginBottom: 32, justifyContent: "center" }}>
          START PDQ·01, Supremo · Doctores
        </div>
        <h2
          className="pdq-display"
          style={{
            fontSize: "clamp(52px, 10vw, 148px)",
            lineHeight: 0.85,
            margin: "0 0 36px",
          }}
        >
          READY
          <br />
          <span style={{ color: "var(--pdq-ink-3)" }}>TO START?</span>
        </h2>
        <button type="button" className="pdq-btn lg" onClick={onEnter}>
          OPEN THE EVENT <span className="arr">→</span>
        </button>
        <div
          style={{
            marginTop: 48,
            color: "var(--pdq-ink-4)",
            fontSize: 11,
            fontFamily: "var(--pdq-mono)",
          }}
        >
          WALLET SIGNATURE REQUIRED. NFC ISSUED ON ARRIVAL. BRING YOUR PHONE.
        </div>
      </section>

      <footer
        className="pdq-footer-grid"
        style={{
          padding: "60px var(--pdq-pad-x) 80px",
          borderTop: "1px solid var(--pdq-line)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 28,
        }}
      >
        <div>
          <div className="pdq-display" style={{ fontSize: 20, marginBottom: 10 }}>
            AXIS
            <br />
            PDQ
          </div>
          <div className="pdq-mono">PIZZA DAY, 2026</div>
        </div>
        {[
          {
            h: "EPISODES",
            items: ["PDQ·01, Supremo · Doctores", "PDQ·02, Juárez", "PDQ·03, Polanco", "Pilot, Condesa"],
          },
          { h: "INFO", items: ["Tasks", "Medals", "Ranks", "Chips"] },
          {
            h: "CONTACT",
            items: ["@axispdq", "press@axispdq", "venues@axispdq", "+52 55 ... ...."],
          },
        ].map((c) => (
          <div key={c.h}>
            <div className="pdq-mono" style={{ marginBottom: 16 }}>
              {c.h}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {c.items.map((i) => (
                <span key={i} style={{ fontSize: 13, color: "var(--pdq-ink-2)" }}>
                  {i}
                </span>
              ))}
            </div>
          </div>
        ))}
      </footer>
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
        marginBottom: 48,
      }}
    >
      <div className="pdq-eyebrow">AXIS · PIZZA DAY / PDQ·01 · LIVE</div>
      <div className="pdq-mono" style={{ color: "var(--pdq-ink-4)" }}>
        21·06·2026, Supremo · Dr. Carmona y Valle 147, Doctores, CDMX
      </div>
    </div>
  );
}

function HeroFeed({ onEnter }: { onEnter: () => void }) {
  const D = DATA;
  const [list, setList] = useState<FeedItem[]>(D.feed.slice(0, 6) as FeedItem[]);
  const idxRef = useRef(6);

  useEffect(() => {
    const id = setInterval(() => {
      const next = D.feed[idxRef.current % D.feed.length] as FeedItem;
      idxRef.current++;
      setList((prev) => [next, ...prev.slice(0, 5)]);
    }, 1400);
    return () => clearInterval(id);
  }, [D.feed]);

  return (
    <div
      className="pdq-hero-2col"
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: 40,
        flex: 1,
        alignItems: "start",
      }}
    >
      <div>
        <h1
          className="pdq-display"
          style={{
            fontSize: "clamp(48px, 8.5vw, 132px)",
            margin: "0 0 24px",
            letterSpacing: "-0.02em",
          }}
        >
          MEDALS
          <br />
          FOR
          <br />
          <span style={{ color: "var(--pdq-ink-3)" }}>YOU.</span>
        </h1>
        <p
          style={{
            maxWidth: 540,
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--pdq-ink-2)",
            margin: "0 0 28px",
          }}
        >
          Pizza Day is a one-day event at Supremo, in Doctores. You sign in with your wallet, tap tasks
          on site, and collect medals as you go.
        </p>
        <div style={{ display: "flex", gap: 14 }}>
          <button type="button" className="pdq-btn lg" onClick={onEnter}>
            OPEN THE EVENT <span className="arr">→</span>
          </button>
          <button type="button" className="pdq-btn lg ghost">
            VIEW PDQ·01
          </button>
        </div>

        <div
          className="pdq-grid-4"
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            borderTop: "1px solid var(--pdq-line)",
            paddingTop: 22,
          }}
        >
          {[
            { k: "OPERATORS", v: "247" },
            { k: "CLEARS · 1H", v: "184" },
            { k: "LIVE TASKS", v: "14" },
            { k: "EPISODE", v: "PDQ·01" },
          ].map((s) => (
            <div key={s.k}>
              <div className="pdq-mono" style={{ marginBottom: 6 }}>
                {s.k}
              </div>
              <div className="pdq-display-alt" style={{ fontSize: 22, fontVariantNumeric: "tabular-nums" }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 24,
          border: "1px solid var(--pdq-line)",
          borderRadius: 4,
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="pdq-tag live">
            <span className="pdq-dot" />
            LIVE TASKS
          </span>
          <span className="pdq-mono">FEED · TX/IN</span>
        </div>
        {list.map((it, i) => (
          <Glitch
            trigger={i === 0 ? list[0].who + idxRef.current : `static-${i}-${it.who}`}
            key={`${i}-${it.who}`}
            className="pdq-enter-fade"
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "36px 1fr auto",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                border: "1px solid var(--pdq-line)",
                borderRadius: 3,
                background: i === 0 ? "rgba(255,255,255,0.04)" : "transparent",
                opacity: 1 - i * 0.12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "1px solid var(--pdq-line-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--pdq-display-alt)",
                  fontSize: 14,
                }}
              >
                {it.who[0]}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--pdq-mono)",
                    fontSize: 10,
                    letterSpacing: "0.06em",
                    color: "var(--pdq-ink-3)",
                    marginBottom: 3,
                  }}
                >
                  {it.who}, {it.rank}
                </div>
                <div className="pdq-display-alt" style={{ fontSize: 16 }}>
                  {it.what}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-2)" }}>
                  +{2 + (i % 5)} XP
                </div>
                <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
                  {i === 0 ? "NOW" : `${i}s`}
                </div>
              </div>
            </div>
          </Glitch>
        ))}
        <span className="pdq-brk pdq-tl" />
        <span className="pdq-brk pdq-tr" />
        <span className="pdq-brk pdq-bl" />
        <span className="pdq-brk pdq-br" />
      </div>
    </div>
  );
}

function HeroMedal({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      className="pdq-hero-2col"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        flex: 1,
        alignItems: "center",
      }}
    >
      <div>
        <h1 className="pdq-display" style={{ fontSize: "clamp(44px, 8vw, 120px)", margin: "0 0 24px" }}>
          COLLECT
          <br />
          THE
          <br />
          MEDAL.
        </h1>
        <p
          style={{
            maxWidth: 520,
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--pdq-ink-2)",
            margin: "0 0 28px",
          }}
        >
          Each task gives you an AR medal. You can view it on any flat surface after you finish.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="pdq-btn lg" onClick={onEnter}>
            OPEN THE EVENT <span className="arr">→</span>
          </button>
          <button type="button" className="pdq-btn lg ghost">
            SPEC SHEET
          </button>
        </div>
      </div>

      <div style={{ position: "relative", height: 480 }}>
        <Medal variant="chrome" size={420} />
        <Reticle size={500} animated />
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span className="pdq-tag live">
            <span className="pdq-dot" />
            AR, 60 FPS
          </span>
        </div>
        <div style={{ position: "absolute", bottom: 10, right: 10, textAlign: "right" }}>
          <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-3)" }}>
            LOCK, 0.984
          </div>
          <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
            ID, M·07·∆
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroType({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <h1
        className="pdq-display"
        style={{
          fontSize: "clamp(72px, 15vw, 240px)",
          margin: 0,
          letterSpacing: "-0.03em",
          textAlign: "center",
        }}
      >
        AXIS
        <br />
        <span style={{ color: "var(--pdq-ink-3)" }}>PDQ</span>
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          maxWidth: 1100,
          margin: "48px auto 0",
          width: "100%",
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <p style={{ fontSize: 15, color: "var(--pdq-ink-2)", lineHeight: 1.5, margin: 0 }}>
            One day. One building. Three floors and a terrace. Chips, medals, and ranks.
          </p>
        </div>
        <button type="button" className="pdq-btn lg" onClick={onEnter}>
          OPEN THE EVENT <span className="arr">→</span>
        </button>
      </div>
    </div>
  );
}
