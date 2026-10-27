"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "./velvique.css";

type Status = "queued" | "preparing" | "ready" | "served" | "void";

type Card = {
  assignmentId: string;
  queueNumber: number;
  recipeId: string;
  signatureHash: string;
  status: Status;
  profileCode: string;
  assignedAt: string;
  build: Array<{ ingredientId: string; name: string; ml: number }>;
  garnish: { name: string; instruction: string } | null;
  narrative: { name: string; provider: string } | null;
};

type StockReport = {
  stock: {
    ingredients: Array<{ id: string; name: string; stockMl: number; reservedMl: number; availableMl: number; placeholderStock: boolean }>;
    garnishes: Array<{ id: string; name: string; stockUnits: number; reservedUnits: number; availableUnits: number }>;
  };
  procurement: {
    assigned: number;
    baselineMl: number;
    reserveBaselineMl: number;
    rows: Array<{ id: string; name: string; useMl: number; orderMl: number; packages: number | null }>;
    ingredientSpendMxn: number | null;
    ingredientBudgetMxn: number;
    note: string | null;
  };
};

type Draw = {
  entrants: number;
  winner: { queueNumber: number; guestName: string | null; passEnding: string | null } | null;
  drawnAt: string | null;
};

type Checks = { pass: boolean; candidates: number; checks: Array<{ name: string; pass: boolean; detail: string }> };

const KEY_STORE = "velvique-bar-key";
const NEXT: Partial<Record<Status, { to: Status; label: string }>> = {
  queued: { to: "preparing", label: "Start build" },
  preparing: { to: "ready", label: "Ready" },
  ready: { to: "served", label: "Served" },
};

export default function VelviqueBar() {
  const [barKey, setBarKey] = useState("");
  const [tab, setTab] = useState<"queue" | "ops">("queue");
  const [queue, setQueue] = useState<Card[]>([]);
  const [report, setReport] = useState<StockReport | null>(null);
  const [checks, setChecks] = useState<Checks | null>(null);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [error, setError] = useState("");
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    try {
      setBarKey(window.localStorage.getItem(KEY_STORE) ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  const call = useCallback(
    async <T,>(url: string, init?: RequestInit): Promise<T | null> => {
      const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", "x-velvique-bar": barKey, ...init?.headers } });
      const data = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return null;
      }
      setError("");
      return data;
    },
    [barKey],
  );

  const refresh = useCallback(async () => {
    const data = await call<{ queue: Card[] }>("/api/velvique/bar/queue");
    if (data) setQueue(data.queue);
    if (tab === "ops") {
      const stock = await call<StockReport>("/api/velvique/ops/stock");
      if (stock) setReport(stock);
      const current = await call<Draw>("/api/velvique/ops/draw");
      if (current) setDraw(current);
    }
  }, [call, tab]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const move = async (card: Card, status: Status) => {
    if (status === "void" && !window.confirm(`Void shot #${card.queueNumber}? Its stock is released.`)) return;
    await call(`/api/velvique/bar/assignments/${card.assignmentId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    void refresh();
  };

  const runDraw = async (redraw: boolean) => {
    if (redraw && !window.confirm("Pick a different winner? The current one is replaced.")) return;
    const data = await call<Draw>("/api/velvique/ops/draw", { method: "POST", body: JSON.stringify({ redraw }) });
    if (data) setDraw(data);
  };

  const resetAll = async () => {
    if (!window.confirm("Clear every guest, card, stock movement and the draw? Card numbers restart at 001. This cannot be undone.")) return;
    const data = await call<{ ok: boolean }>("/api/velvique/ops/reset", { method: "POST", body: JSON.stringify({ confirm: "RESET" }) });
    if (data) {
      setDraw(null);
      setChecks(null);
      void refresh();
    }
  };

  const validate = async () => {
    setChecks(null);
    const data = await call<Checks>("/api/velvique/ops/catalog/validate", { method: "POST" });
    if (data) setChecks(data);
  };

  const saveKey = (value: string) => {
    setBarKey(value);
    try {
      window.localStorage.setItem(KEY_STORE, value);
    } catch {
      /* ignore */
    }
  };

  const open = queue.filter((card) => card.status !== "served" && card.status !== "void").sort((a, b) => a.queueNumber - b.queueNumber);
  const done = queue.filter((card) => card.status === "served" || card.status === "void").sort((a, b) => b.queueNumber - a.queueNumber);
  const served = queue.filter((card) => card.status === "served").length;

  return (
    <main className="vq-bar-page">
      <div aria-hidden className="vq-bg" />
      <header className="vq-topbar">
        <Link href="/" aria-label="Go to AXIS home">
          <Image src="/logow.png" alt="AXIS" width={84} height={26} priority />
        </Link>
        <span className="vq-cross" aria-hidden>×</span>
        <Image className="vq-brand" src="/velvique/velvique-logo.webp" alt="Velvique" width={688} height={107} priority />
        <span className="vq-kicker">Bar</span>
        <span className="vq-kicker vq-step">
          {served} served · {open.length} open · {queue.filter((c) => c.status !== "void").length}/100 assigned
        </span>
      </header>

      <div className="vq-bar-grid">
        <div className="vq-bar-head">
          <div className="vq-tabs">
            <button type="button" className={`vq-button ${tab === "queue" ? "" : "is-ghost"}`} onClick={() => setTab("queue")}>
              Queue
            </button>
            <button type="button" className={`vq-button ${tab === "ops" ? "" : "is-ghost"}`} onClick={() => setTab("ops")}>
              Stock & checks
            </button>
          </div>
          <input className="vq-input" type="password" placeholder="Bar key" value={barKey} onChange={(e) => saveKey(e.target.value)} aria-label="Bar key" />
        </div>

        {error && <p className="vq-copy">{error}</p>}

        {tab === "queue" && (
          <>
            {open.length === 0 && <p className="vq-copy is-dim">No open shots. New assignments appear here automatically.</p>}
            <div className="vq-queue">
              {open.map((card) => (
                <article key={card.assignmentId} className={`vq-card is-${card.status}`}>
                  <div className="vq-card-head">
                    <span className="vq-card-num">#{String(card.queueNumber).padStart(3, "0")}</span>
                    <span className="vq-kicker">{card.status}</span>
                  </div>
                  <p className="vq-kicker">
                    {card.narrative?.name ?? card.recipeId} · {card.profileCode} · {card.signatureHash.slice(0, 8)}
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
                    {NEXT[card.status] && (
                      <button type="button" className="vq-button" onClick={() => move(card, NEXT[card.status]!.to)}>
                        {NEXT[card.status]!.label}
                      </button>
                    )}
                    <button type="button" className="vq-button is-ghost" onClick={() => move(card, "void")}>
                      Void
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {done.length > 0 && (
              <button type="button" className="vq-button is-ghost" onClick={() => setShowDone(!showDone)}>
                {showDone ? "Hide" : "Show"} served and voided ({done.length})
              </button>
            )}
            {showDone && (
              <div className="vq-queue">
                {done.map((card) => (
                  <article key={card.assignmentId} className={`vq-card is-${card.status}`}>
                    <div className="vq-card-head">
                      <span className="vq-card-num">#{String(card.queueNumber).padStart(3, "0")}</span>
                      <span className="vq-kicker">{card.status}</span>
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
                <button type="button" className="vq-button" onClick={() => runDraw(false)}>
                  {draw?.winner ? "Show winner" : "Draw a winner"}
                </button>
              </div>
              <p className="vq-copy is-dim">{draw ? `${draw.entrants} guests entered by saving their card.` : "Guests enter by saving their card to a pass."}</p>
              {draw?.winner && (
                <>
                  <p className="vq-card-num">
                    #{String(draw.winner.queueNumber).padStart(3, "0")} {draw.winner.guestName ?? ""}
                  </p>
                  <p className="vq-copy is-dim">Pass ending in {draw.winner.passEnding}. Ask the winner to show card #{draw.winner.queueNumber} on their phone.</p>
                  <div className="vq-actions">
                    <button type="button" className="vq-button is-ghost" onClick={() => runDraw(true)}>
                      Draw again
                    </button>
                  </div>
                </>
              )}
            </section>

            <section className="vq-card">
              <div className="vq-card-head">
                <h2 className="vq-choice-title">Reset test data</h2>
                <button type="button" className="vq-button is-ghost" onClick={resetAll}>
                  Reset everything
                </button>
              </div>
              <p className="vq-copy is-dim">Use before the event opens. Clears guests, cards, stock movements and the draw.</p>
            </section>

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
                      <span>{check.pass ? "Pass" : "Fail"} · {check.name}</span>
                      <span className="vq-copy is-dim">{check.detail}</span>
                    </div>
                  ))}
                </>
              )}
            </section>

            {report && (
              <>
                <section className="vq-card">
                  <h2 className="vq-choice-title">Ingredient stock</h2>
                  <div className="vq-scroll">
                    <table className="vq-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Ingredient</th>
                          <th className="is-num">Stock</th>
                          <th className="is-num">Reserved</th>
                          <th className="is-num">Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.stock.ingredients.map((row) => (
                          <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.name}{row.placeholderStock ? " (planning stock)" : ""}</td>
                            <td className="is-num">{row.stockMl} ml</td>
                            <td className="is-num">{row.reservedMl} ml</td>
                            <td className="is-num">{row.availableMl} ml</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="vq-card">
                  <h2 className="vq-choice-title">Garnish</h2>
                  <div className="vq-scroll">
                    <table className="vq-table">
                      <tbody>
                        {report.stock.garnishes.map((row) => (
                          <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.name}</td>
                            <td className="is-num">{row.availableUnits} / {row.stockUnits} available</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="vq-card">
                  <h2 className="vq-choice-title">Procurement</h2>
                  <p className="vq-copy is-dim">
                    {report.procurement.assigned} assigned · baseline {report.procurement.baselineMl} ml · with 15% reserve {report.procurement.reserveBaselineMl} ml · ingredient budget MXN {report.procurement.ingredientBudgetMxn.toLocaleString("en-US")}
                  </p>
                  {report.procurement.note && <p className="vq-copy is-dim">{report.procurement.note}</p>}
                  <div className="vq-scroll">
                    <table className="vq-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Ingredient</th>
                          <th className="is-num">Used</th>
                          <th className="is-num">Order +15%</th>
                          <th className="is-num">Packs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.procurement.rows.map((row) => (
                          <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.name}</td>
                            <td className="is-num">{row.useMl} ml</td>
                            <td className="is-num">{row.orderMl} ml</td>
                            <td className="is-num">{row.packages ?? "unconfirmed"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
