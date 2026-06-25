"use client";

import { useEffect, useRef, useState } from "react";
import { FiCamera, FiCheck, FiRefreshCw, FiRotateCcw, FiSend, FiX } from "react-icons/fi";

type OkxStats = {
  allocated: number;
  delivered: number;
  scannedDelivered?: number;
  manualDeliveredAdjustment?: number;
  nextDrinkId: number;
  recentClaims: Array<{
    claimId: string;
    missionId: string;
    participantId: string;
    drinkId: number;
    official: boolean;
    createdAt: string;
    usedAt: string | null;
    uidText: string;
  }>;
};

type RedeemResult = {
  ok: boolean;
  status: string;
  claim?: {
    claimId: string;
    missionId: string;
    participantId: string;
    drinkId: number;
    usedAt: string | null;
    uidText: string;
  };
};

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
};

const emptyStats: OkxStats = {
  allocated: 0,
  delivered: 0,
  scannedDelivered: 0,
  manualDeliveredAdjustment: 0,
  nextDrinkId: 0,
  recentClaims: [],
};
const adminStatsStorageKey = "axis-okx-admin-stats-v1";

function resultCopy(result: RedeemResult | null) {
  if (!result) return "";
  if (result.ok) return `Approved drink #${result.claim?.drinkId ?? "?"} (${result.claim?.missionId ?? "mission"})`;
  if (result.status === "already-used") return `Already used: drink #${result.claim?.drinkId ?? "?"}`;
  if (result.status === "not-found") return "QR not found in this runtime.";
  if (result.status === "scan-required") return "Scan the real QR URL to redeem.";
  return result.status;
}

function readStoredAdminStats() {
  try {
    const raw = window.localStorage.getItem(adminStatsStorageKey);
    return raw ? JSON.parse(raw) as OkxStats : null;
  } catch {
    return null;
  }
}

function writeStoredAdminStats(stats: OkxStats) {
  window.localStorage.setItem(adminStatsStorageKey, JSON.stringify(stats));
}

function isEmptyStats(stats: OkxStats) {
  return stats.allocated === 0 && stats.delivered === 0 && stats.recentClaims.length === 0;
}

function mergeClaimIntoStats(stats: OkxStats, claim: NonNullable<RedeemResult["claim"]>) {
  const existing = stats.recentClaims.find((item) => item.claimId === claim.claimId);
  const wasDelivered = Boolean(existing?.usedAt);
  const deliveredAt = claim.usedAt || new Date().toISOString();
  const nextClaims = [
    {
      claimId: claim.claimId,
      missionId: claim.missionId,
      participantId: claim.participantId,
      drinkId: claim.drinkId,
      official: true,
      createdAt: existing?.createdAt || deliveredAt,
      usedAt: deliveredAt,
      uidText: claim.uidText,
    },
    ...stats.recentClaims.filter((item) => item.claimId !== claim.claimId),
  ].slice(0, 24);

  return {
    ...stats,
    allocated: Math.max(stats.allocated, nextClaims.length),
    delivered: wasDelivered ? stats.delivered : stats.delivered + 1,
    scannedDelivered: wasDelivered ? stats.scannedDelivered : (stats.scannedDelivered ?? stats.delivered) + 1,
    nextDrinkId: Math.max(stats.nextDrinkId, claim.drinkId + 1),
    recentClaims: nextClaims,
  };
}

function removeParticipantFromStats(stats: OkxStats, participantId: string) {
  const removedClaims = stats.recentClaims.filter((claim) => claim.participantId === participantId);
  const nextClaims = stats.recentClaims.filter((claim) => claim.participantId !== participantId);
  const removedDelivered = removedClaims.filter((claim) => claim.usedAt).length;
  const scannedDelivered = Math.max(0, (stats.scannedDelivered ?? stats.delivered) - removedDelivered);
  const manualDeliveredAdjustment = stats.manualDeliveredAdjustment ?? 0;

  return {
    ...stats,
    allocated: Math.max(0, stats.allocated - removedClaims.length),
    delivered: Math.max(0, scannedDelivered + manualDeliveredAdjustment),
    scannedDelivered,
    recentClaims: nextClaims,
  };
}

type OkxAdminPanelProps = {
  superAdmin?: boolean;
};

export default function OkxAdminPanel({ superAdmin = false }: OkxAdminPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const [stats, setStats] = useState<OkxStats>(emptyStats);
  const [manualScan, setManualScan] = useState("");
  const [scanActive, setScanActive] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lastScan, setLastScan] = useState("");
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [manualDelivered, setManualDelivered] = useState("");
  const [resetParticipantId, setResetParticipantId] = useState("");

  async function refreshStats() {
    const response = await fetch("/api/okx/admin/status", { cache: "no-store" });
    const data = (await response.json().catch(() => emptyStats)) as OkxStats;
    setStats((current) => {
      const stored = readStoredAdminStats();
      const base = stored && !isEmptyStats(stored) ? stored : current;
      const next = isEmptyStats(data) && !isEmptyStats(base) ? base : data;
      writeStoredAdminStats(next);
      return next;
    });
  }

  useEffect(() => {
    const stored = readStoredAdminStats();
    if (stored) setStats(stored);
    void refreshStats();
    const interval = window.setInterval(() => void refreshStats(), 2000);
    return () => window.clearInterval(interval);
  }, []);

  async function redeem(raw: string) {
    const value = raw.trim();
    if (!value || busy) return;
    if (value === lastScan) return;

    setBusy(true);
    setLastScan(value);
    try {
      const response = await fetch("/api/okx/admin/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = (await response.json().catch(() => ({ ok: false, status: "bad-response" }))) as RedeemResult;
      setResult(data);
      if (data.ok && data.claim) {
        setStats((current) => {
          const next = mergeClaimIntoStats(current, data.claim!);
          writeStoredAdminStats(next);
          return next;
        });
      }
      await refreshStats();
    } finally {
      window.setTimeout(() => setLastScan(""), 2500);
      setBusy(false);
    }
  }

  async function startCamera() {
    setScanError("");
    const detectorCtor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!detectorCtor) {
      setScanError("Camera QR scan is not supported here. Paste the QR URL manually.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new detectorCtor({ formats: ["qr_code"] });
      scanningRef.current = true;
      setScanActive(true);

      const scan = async () => {
        if (!videoRef.current || !scanningRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          const rawValue = codes[0]?.rawValue;
          if (rawValue) await redeem(rawValue);
        } catch {
          // Keep scanning; individual frame failures are normal in low light.
        }
        if (scanningRef.current) window.setTimeout(scan, 450);
      };

      void scan();
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "Could not start camera.");
      setScanActive(false);
    }
  }

  function stopCamera() {
    scanningRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanActive(false);
  }

  async function resetAllUsers() {
    if (!window.confirm("Reset all OKX users, claims, and drink counters?")) return;
    const response = await fetch("/api/okx/admin/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-okx-supervisor": "sv",
      },
      body: JSON.stringify({}),
    });
    const data = (await response.json().catch(() => null)) as { stats?: OkxStats } | null;
    if (!response.ok || !data?.stats) return;
    window.localStorage.removeItem(adminStatsStorageKey);
    setResult(null);
    setManualScan("");
    const nextStats = data.stats;
    setStats(nextStats);
    writeStoredAdminStats(nextStats);
  }

  async function resetParticipant() {
    const participantId = resetParticipantId.trim();
    if (!participantId) return;
    if (!window.confirm(`Reset OKX user ${participantId}?`)) return;

    const response = await fetch("/api/okx/admin/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-okx-supervisor": "sv",
      },
      body: JSON.stringify({ participantId }),
    });
    const data = (await response.json().catch(() => null)) as { stats?: OkxStats } | null;
    if (!response.ok) return;
    setResult(null);
    setResetParticipantId("");
    setStats((current) => {
      const nextStats = data?.stats && !isEmptyStats(data.stats)
        ? data.stats
        : removeParticipantFromStats(current, participantId);
      writeStoredAdminStats(nextStats);
      return nextStats;
    });
  }

  async function adjustDelivered(payload: { delta?: number; delivered?: number }) {
    const response = await fetch("/api/okx/admin/adjust", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-okx-supervisor": "sv",
      },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as { stats?: OkxStats } | null;
    if (data?.stats) {
      setStats(data.stats);
      writeStoredAdminStats(data.stats);
    }
    else await refreshStats();
  }

  const metrics = [
    ["Scans", stats.delivered, "delivered count"],
    ["Ready QRs", Math.max(0, stats.allocated - stats.delivered), "not scanned yet"],
    ["Issued", stats.allocated, `next ID ${stats.nextDrinkId}`],
  ];
  const resultTone = result?.ok ? "approved" : result ? "blocked" : "idle";

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-3 text-white sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-5">
        <header className="flex flex-col gap-3 border-b border-white/12 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.28em] text-[#c9ff4a]">AXIS / OKX</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Drink admin</h1>
          </div>
          {superAdmin ? (
            <button
              type="button"
              onClick={() => void resetAllUsers()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 border border-white/16 bg-white/[0.03] px-4 text-sm text-white/80 sm:w-auto"
            >
              <FiRotateCcw aria-hidden />
              Reset all users
            </button>
          ) : null}
        </header>

        {superAdmin ? (
          <section className="grid gap-3 border border-[#c9ff4a]/30 bg-[#c9ff4a]/[0.05] p-3 sm:p-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#c9ff4a]">Supervisor</p>
              <p className="mt-1 text-sm text-white/60">Manual delivered count: scanned {stats.scannedDelivered ?? 0}, adjustment {stats.manualDeliveredAdjustment ?? 0}</p>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-[auto_auto_minmax(120px,1fr)_auto]">
                <button type="button" onClick={() => void adjustDelivered({ delta: -1 })} className="h-11 border border-white/16 px-4 text-sm text-white/80">
                  -1
                </button>
                <button type="button" onClick={() => void adjustDelivered({ delta: 1 })} className="h-11 border border-white/16 px-4 text-sm text-white/80">
                  +1
                </button>
                <input
                  value={manualDelivered}
                  onChange={(event) => setManualDelivered(event.target.value)}
                  inputMode="numeric"
                  placeholder="Set count"
                  className="h-11 min-w-0 border border-white/12 bg-black px-3 text-sm text-white outline-none placeholder:text-white/35"
                />
                <button
                  type="button"
                  onClick={() => {
                    const value = Number(manualDelivered);
                    if (Number.isFinite(value)) void adjustDelivered({ delivered: value });
                  }}
                  className="h-11 bg-[#c9ff4a] px-4 text-sm font-medium text-black"
                >
                  Set
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_auto]">
                <input
                  value={resetParticipantId}
                  onChange={(event) => setResetParticipantId(event.target.value)}
                  placeholder="Participant ID"
                  className="h-11 min-w-0 border border-white/12 bg-black px-3 font-mono text-sm text-white outline-none placeholder:font-sans placeholder:text-white/35"
                />
                <button
                  type="button"
                  onClick={() => void resetParticipant()}
                  className="h-11 border border-[#c9ff4a]/45 px-4 text-sm text-[#c9ff4a]"
                >
                  Reset user
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          {metrics.map(([label, value, sub]) => (
            <div key={label} className="min-h-[112px] border border-white/12 bg-white/[0.045] p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 sm:text-xs">{label}</p>
              <strong className="mt-2 block text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{value}</strong>
              <span className="mt-1 block text-xs text-white/58 sm:text-sm">{sub}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="border border-white/12 bg-white/[0.045] p-3 sm:p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between gap-3 sm:block">
                <h2 className="text-lg font-medium">Scan QR</h2>
                <span className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] sm:hidden ${scanActive ? "bg-[#c9ff4a] text-black" : "bg-white/10 text-white/65"}`}>
                  {scanActive ? "Live" : "Off"}
                </span>
              </div>
              <button
                type="button"
                onClick={scanActive ? stopCamera : () => void startCamera()}
                className="inline-flex h-12 w-full items-center justify-center gap-2 bg-white px-4 text-sm font-medium text-black sm:h-10 sm:w-auto"
              >
                {scanActive ? <FiX aria-hidden /> : <FiCamera aria-hidden />}
                {scanActive ? "Stop" : "Camera"}
              </button>
            </div>

            <div className="relative overflow-hidden border border-white/10 bg-black">
              <video ref={videoRef} className="aspect-[4/5] w-full object-cover sm:aspect-video" muted playsInline />
              {!scanActive ? (
                <div className="absolute inset-0 grid place-items-center bg-black/70 px-4 text-center text-sm text-white/58">
                  Camera is off
                </div>
              ) : null}
            </div>
            {scanError ? <p className="mt-3 text-sm text-[#ff6262]">{scanError}</p> : null}

            <form
              className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                void redeem(manualScan);
              }}
            >
              <input
                value={manualScan}
                onChange={(event) => setManualScan(event.target.value)}
                placeholder="Paste scanned QR URL"
                className="h-12 min-w-0 border border-white/12 bg-black px-3 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 bg-[#c9ff4a] px-4 text-sm font-medium text-black">
                <FiSend aria-hidden />
                Redeem
              </button>
            </form>
          </div>

          <div className={`border p-4 sm:p-5 ${resultTone === "approved" ? "border-[#c9ff4a]" : resultTone === "blocked" ? "border-[#ff6262]" : "border-white/12"} bg-white/[0.045]`}>
            <div className="flex items-start gap-3">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${result?.ok ? "bg-[#c9ff4a] text-black" : "bg-white/10 text-white"}`}>
                {result?.ok ? <FiCheck aria-hidden /> : <FiRefreshCw aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Last scan</p>
                <h2 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">{resultCopy(result) || "Waiting for QR"}</h2>
              </div>
            </div>
            {result?.claim ? (
              <dl className="mt-5 grid gap-2 text-sm text-white/72">
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3"><dt>Claim</dt><dd className="break-all font-mono text-white/90">{result.claim.claimId}</dd></div>
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3"><dt>Mission</dt><dd>{result.claim.missionId}</dd></div>
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3"><dt>Drink ID</dt><dd>{result.claim.drinkId}</dd></div>
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3"><dt>UID</dt><dd className="break-words">{result.claim.uidText || "n/a"}</dd></div>
              </dl>
            ) : null}
          </div>
        </section>

        <section className="border border-white/12 bg-white/[0.045]">
          <div className="flex items-center justify-between border-b border-white/12 px-3 py-3 sm:px-4">
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-white/55">Recent claims</h2>
            <span className="text-xs text-white/40">{stats.recentClaims.length}</span>
          </div>
          <div className="hidden grid-cols-[0.7fr_1fr_0.8fr_1.35fr] border-b border-white/12 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/40 sm:grid">
            <span>ID</span><span>Mission</span><span>Status</span><span>User</span>
          </div>
          {stats.recentClaims.length ? stats.recentClaims.map((claim) => (
            <div key={claim.claimId} className="border-b border-white/[0.08] px-3 py-3 text-sm text-white/72 last:border-b-0 sm:grid sm:grid-cols-[0.7fr_1fr_0.8fr_1.35fr] sm:px-4 sm:py-2">
              <div className="flex items-start justify-between gap-3 sm:block">
                <span className="font-mono text-lg text-white sm:text-sm">{claim.drinkId}</span>
                <span className={`rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.16em] sm:hidden ${claim.usedAt ? "bg-[#c9ff4a] text-black" : "bg-white/10 text-white/72"}`}>
                  {claim.usedAt ? "delivered" : "ready"}
                </span>
              </div>
              <span className="mt-1 block text-white/84 sm:mt-0">{claim.missionId}</span>
              <span className="hidden sm:block">{claim.usedAt ? "delivered" : "ready"}</span>
              <span className="mt-1 block break-all font-mono text-xs text-white/42 sm:mt-0 sm:text-sm sm:text-white/72">{claim.participantId}</span>
            </div>
          )) : (
            <p className="px-3 py-6 text-sm text-white/45 sm:px-4">No claims yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
