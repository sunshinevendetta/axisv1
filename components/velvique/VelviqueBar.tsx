"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "./velvique.css";

/* Bar console. Everything comes from Base (recipes, owners) and Grove (names,
   garnish); "served" ticks live only on this device, since there is no database. */

type Card = {
  tokenId: number;
  name: string | null;
  guestName: string | null;
  signatureHash: string;
  build: Array<{ ingredientId: string; name: string; ml: number }>;
  garnish: { name: string; instruction: string } | null;
  mintedAt: string | null;
};

type Stock = {
  minted: number;
  baselineMl: number;
  reserveBaselineMl: number;
  ingredientBudgetMxn: number;
  rows: Array<{ id: string; name: string; stockMl: number; usedMl: number; availableMl: number; orderMl: number; packages: number | null }>;
};

type Winner = { tokenId: number; guestName: string | null; contactHint: string; notified: boolean };
type Checks = { pass: boolean; candidates: number; checks: Array<{ name: string; pass: boolean; detail: string }> };

const SERVED_STORE = "velvique-bar-served";

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export default function VelviqueBar() {
  const [tab, setTab] = useState<"queue" | "ops">("queue");
  const [queue, setQueue] = useState<Card[]>([]);
  const [served, setServed] = useState<number[]>([]);
  const [stock, setStock] = useState<Stock | null>(null);
  const [entrants, setEntrants] = useState<number | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [checks, setChecks] = useState<Checks | null>(null);
  const [error, setError] = useState("");
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    setServed(readJson<number[]>(SERVED_STORE, []));
  }, []);

  const call = useCallback(
    async <T,>(url: string, init?: RequestInit): Promise<T | null> => {
      const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
      const data = (await res.json().catch(() => ({}))) as T & { error?: string };
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return null;
      }
      setError("");
      return data;
    },
    [],
  );

  const refresh = useCallback(async () => {
    const data = await call<{ queue: Card[] }>("/api/velvique/bar/queue");
    if (data) setQueue(data.queue);
    if (tab === "ops") {
      const s = await call<Stock>("/api/velvique/ops/stock");
      if (s) setStock(s);
      const d = await call<{ entrants: number }>("/api/velvique/ops/draw");
      if (d) setEntrants(d.entrants);
    }
  }, [call, tab]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 6000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const toggleServed = (tokenId: number) => {
    const next = served.includes(tokenId) ? served.filter((id) => id !== tokenId) : [...served, tokenId];
    setServed(next);
    writeJson(SERVED_STORE, next);
  };

  const draw = async (again: boolean) => {
    if (again && !window.confirm("Draw a different winner? The current winner is skipped.")) return;
    const data = await call<{ entrants: number; winner: Winner | null }>("/api/velvique/ops/draw", {
      method: "POST",
      body: JSON.stringify({ exclude: again ? winners.map((w) => w.tokenId) : [] }),
    });
    if (!data) return;
    setEntrants(data.entrants);
    if (data.winner) setWinners(again ? [...winners, data.winner] : [data.winner]);
  };

  const validate = async () => {
    setChecks(null);
    const data = await call<Checks>("/api/velvique/ops/catalog/validate", { method: "POST" });
    if (data) setChecks(data);
  };

  const open = queue.filter((card) => !served.includes(card.tokenId));
  const done = queue.filter((card) => served.includes(card.tokenId)).reverse();
  const winner = winners[winners.length - 1];

  return (
    <main className="vq-bar-page">
      <div aria-hidden className="vq-bg" />
      <header className="vq-topbar">
        <Link href="/" aria-label="Go to AXIS home" className="vq-axis">
          <Image src="/logow.png" alt="AXIS" width={84} height={26} priority />
        </Link>
        <span className="vq-cross" aria-hidden>
          ×
        </span>
        <Image className="vq-brand" src="/velvique/velvique-logo.webp" alt="Velvique" width={688} height={107} priority />
        <span className="vq-kicker">Bar</span>
        <span className="vq-kicker vq-step">
          {queue.length} cards · {done.length} served
        </span>
      </header>

      <div className="vq-bar-grid">
        <div className="vq-bar-head">
          <div className="vq-tabs">
            <button type="button" className={`vq-button ${tab === "queue" ? "" : "is-ghost"}`} onClick={() => setTab("queue")}>
              Queue
            </button>
            <button type="button" className={`vq-button ${tab === "ops" ? "" : "is-ghost"}`} onClick={() => setTab("ops")}>
              Draw, stock and checks
            </button>
          </div>
        </div>

        {error && <p className="vq-copy">{error}</p>}

        {tab === "queue" && (
          <>
            {open.length === 0 && <p className="vq-copy is-dim">No shots waiting. New cards appear here as guests mint them.</p>}
            <div className="vq-queue">
              {open.map((card) => (
                <article key={card.tokenId} className="vq-card">
                  <div className="vq-card-head">
                    <span className="vq-card-num">#{String(card.tokenId).padStart(3, "0")}</span>
                    <span className="vq-kicker">{card.guestName ?? ""}</span>
                  </div>
                  <p className="vq-kicker">
                    {card.name ?? "Velvique"} · {card.signatureHash.slice(0, 8)}
                  </p>
                  <table className="vq-table">
                    <tbody>
                      {card.build.map((item) => (
                        <tr key={item.ingredientId}>
                          <td>{item.ingredientId}</td>
                          <td>{item.name}</td>
                          <td className="is-num">{item.ml.toFixed(1)} ml</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="vq-copy is-dim">{card.garnish ? `${card.garnish.name}: ${card.garnish.instruction}` : "No garnish."}</p>
                  <div className="vq-actions">
                    <button type="button" className="vq-button" onClick={() => toggleServed(card.tokenId)}>
                      Served
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {done.length > 0 && (
              <button type="button" className="vq-button is-ghost" onClick={() => setShowDone(!showDone)}>
                {showDone ? "Hide" : "Show"} served ({done.length})
              </button>
            )}
            {showDone && (
              <div className="vq-queue">
                {done.map((card) => (
                  <article key={card.tokenId} className="vq-card is-served">
                    <div className="vq-card-head">
                      <span className="vq-card-num">#{String(card.tokenId).padStart(3, "0")}</span>
                      <button type="button" className="vq-button is-ghost" onClick={() => toggleServed(card.tokenId)}>
                        Undo
                      </button>
                    </div>
                    <p className="vq-kicker">{card.build.map((item) => `${item.ingredientId} ${item.ml}`).join(" · ")}</p>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "ops" && (
          <>
            <section className="vq-card">
              <div className="vq-card-head">
                <h2 className="vq-choice-title">Free bottle draw</h2>
                <button type="button" className="vq-button" onClick={() => draw(false)}>
                  Draw a winner
                </button>
              </div>
              <p className="vq-copy is-dim">{entrants === null ? "Every guest who saved their card is entered." : `${entrants} guests entered by saving their card.`}</p>
              {winner && (
                <>
                  <p className="vq-card-num">
                    #{String(winner.tokenId).padStart(3, "0")} {winner.guestName ?? ""}
                  </p>
                  <p className="vq-copy is-dim">
                    {winner.contactHint}. {winner.notified ? "Their email and phone were sent to the team inbox." : "The team email didn't send; check the Velvique list in Brevo."} Ask the winner to show card #{winner.tokenId} on their phone.
                  </p>
                  <div className="vq-actions">
                    <button type="button" className="vq-button is-ghost" onClick={() => draw(true)}>
                      Draw again
                    </button>
                  </div>
                </>
              )}
            </section>

            {stock && (
              <section className="vq-card">
                <h2 className="vq-choice-title">Stock and procurement</h2>
                <p className="vq-copy is-dim">
                  {stock.minted} cards minted · baseline {stock.baselineMl} ml · with 15% reserve {stock.reserveBaselineMl} ml · ingredient budget MXN {stock.ingredientBudgetMxn.toLocaleString("en-US")}
                </p>
                <div className="vq-scroll">
                  <table className="vq-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Ingredient</th>
                        <th className="is-num">Used</th>
                        <th className="is-num">Left</th>
                        <th className="is-num">Order +15%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock.rows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.id}</td>
                          <td>{row.name}</td>
                          <td className="is-num">{row.usedMl} ml</td>
                          <td className="is-num">{row.availableMl} ml</td>
                          <td className="is-num">{row.orderMl} ml</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section className="vq-card">
              <div className="vq-card-head">
                <h2 className="vq-choice-title">Release checks</h2>
                <button type="button" className="vq-button" onClick={validate}>
                  Run
                </button>
              </div>
              {checks && (
                <>
                  <p className="vq-kicker">
                    {checks.pass ? "All gates pass" : "Gates failing"} · {checks.candidates} feasible candidates
                  </p>
                  {checks.checks.map((check) => (
                    <div key={check.name} className={`vq-check ${check.pass ? "" : "is-fail"}`}>
                      <span>
                        {check.pass ? "Pass" : "Fail"} · {check.name}
                      </span>
                      <span className="vq-copy is-dim">{check.detail}</span>
                    </div>
                  ))}
                </>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
