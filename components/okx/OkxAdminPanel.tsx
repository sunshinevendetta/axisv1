"use client";

import { useEffect, useRef, useState } from "react";
import { FiCamera, FiCheck, FiRefreshCw, FiRotateCcw, FiSend, FiX } from "react-icons/fi";

type OkxStats = {
  officialLimit: number;
  fallbackReserve: number;
  totalCapacity: number;
  allocated: number;
  delivered: number;
  officialDelivered: number;
  fallbackDelivered: number;
  officialLeft: number;
  fallbackLeft: number;
  totalLeft: number;
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
  officialLimit: 500,
  fallbackReserve: 150,
  totalCapacity: 650,
  allocated: 0,
  delivered: 0,
  officialDelivered: 0,
  fallbackDelivered: 0,
  officialLeft: 500,
  fallbackLeft: 150,
  totalLeft: 650,
  nextDrinkId: 0,
  recentClaims: [],
};

function resultCopy(result: RedeemResult | null) {
  if (!result) return "";
  if (result.ok) return `Approved drink #${result.claim?.drinkId ?? "?"} (${result.claim?.missionId ?? "mission"})`;
  if (result.status === "already-used") return `Already used: drink #${result.claim?.drinkId ?? "?"}`;
  if (result.status === "not-found") return "QR not found in this runtime.";
  return result.status;
}

export default function OkxAdminPanel() {
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

  async function refreshStats() {
    const response = await fetch("/api/okx/admin/status", { cache: "no-store" });
    const data = (await response.json().catch(() => emptyStats)) as OkxStats;
    setStats(data);
  }

  useEffect(() => {
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

  async function resetCounters() {
    if (!window.confirm("Reset all OKX test claims and counters in this runtime?")) return;
    await fetch("/api/okx/admin/reset", { method: "POST" });
    setResult(null);
    setManualScan("");
    await refreshStats();
  }

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-6 text-white sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/12 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#c9ff4a]">AXIS / OKX</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Drink admin</h1>
          </div>
          <button
            type="button"
            onClick={() => void resetCounters()}
            className="inline-flex h-11 items-center gap-2 border border-white/16 px-4 text-sm text-white/80"
          >
            <FiRotateCcw aria-hidden />
            Reset test
          </button>
        </header>

        <section className="grid gap-3 sm:grid-cols-4">
          {[
            ["Delivered", stats.delivered, `${stats.totalLeft} left total`],
            ["Official", stats.officialDelivered, `${stats.officialLeft}/${stats.officialLimit} left`],
            ["Fallback", stats.fallbackDelivered, `${stats.fallbackLeft}/${stats.fallbackReserve} left`],
            ["Allocated", stats.allocated, `next ID ${stats.nextDrinkId}`],
          ].map(([label, value, sub]) => (
            <div key={label} className="border border-white/12 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</p>
              <strong className="mt-2 block text-4xl tracking-[-0.05em]">{value}</strong>
              <span className="mt-1 block text-sm text-white/55">{sub}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-white/12 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium">Scan QR</h2>
              <button
                type="button"
                onClick={scanActive ? stopCamera : () => void startCamera()}
                className="inline-flex h-10 items-center gap-2 bg-white px-4 text-sm text-black"
              >
                {scanActive ? <FiX aria-hidden /> : <FiCamera aria-hidden />}
                {scanActive ? "Stop" : "Camera"}
              </button>
            </div>

            <video ref={videoRef} className="aspect-video w-full bg-black object-cover" muted playsInline />
            {scanError ? <p className="mt-3 text-sm text-[#ff6262]">{scanError}</p> : null}

            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void redeem(manualScan);
              }}
            >
              <input
                value={manualScan}
                onChange={(event) => setManualScan(event.target.value)}
                placeholder="Paste scanned QR URL"
                className="min-w-0 flex-1 border border-white/12 bg-black px-3 text-sm text-white outline-none"
              />
              <button type="submit" className="inline-flex h-11 items-center gap-2 bg-[#c9ff4a] px-4 text-sm text-black">
                <FiSend aria-hidden />
                Redeem
              </button>
            </form>
          </div>

          <div className={`border p-5 ${result?.ok ? "border-[#c9ff4a]" : result ? "border-[#ff6262]" : "border-white/12"} bg-white/[0.04]`}>
            <div className="flex items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-full ${result?.ok ? "bg-[#c9ff4a] text-black" : "bg-white/10 text-white"}`}>
                {result?.ok ? <FiCheck aria-hidden /> : <FiRefreshCw aria-hidden />}
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Last scan</p>
                <h2 className="text-xl font-medium">{resultCopy(result) || "Waiting for QR"}</h2>
              </div>
            </div>
            {result?.claim ? (
              <dl className="mt-5 grid gap-2 text-sm text-white/70">
                <div className="flex justify-between gap-3"><dt>Claim</dt><dd className="font-mono">{result.claim.claimId}</dd></div>
                <div className="flex justify-between gap-3"><dt>Mission</dt><dd>{result.claim.missionId}</dd></div>
                <div className="flex justify-between gap-3"><dt>Drink ID</dt><dd>{result.claim.drinkId}</dd></div>
                <div className="flex justify-between gap-3"><dt>UID</dt><dd>{result.claim.uidText || "n/a"}</dd></div>
              </dl>
            ) : null}
          </div>
        </section>

        <section className="border border-white/12 bg-white/[0.04]">
          <div className="grid grid-cols-[0.7fr_1fr_0.8fr_0.8fr] border-b border-white/12 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/40">
            <span>ID</span><span>Mission</span><span>Status</span><span>Pool</span>
          </div>
          {stats.recentClaims.map((claim) => (
            <div key={claim.claimId} className="grid grid-cols-[0.7fr_1fr_0.8fr_0.8fr] border-b border-white/[0.08] px-3 py-2 text-sm text-white/72 last:border-b-0">
              <span className="font-mono">{claim.drinkId}</span>
              <span>{claim.missionId}</span>
              <span>{claim.usedAt ? "delivered" : "ready"}</span>
              <span>{claim.official ? "official" : "fallback"}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
