"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { FiRefreshCw, FiSend, FiUpload } from "react-icons/fi";

type DebugEvent = {
  at: string;
  message: string;
  extra?: unknown;
};

type DebugResponse = {
  claimId?: string;
  missionId?: string;
  participantId?: string;
  drinkId?: number;
  redeemUrl?: string;
  qrUrl?: string;
  emailSent?: boolean;
  emailError?: string;
  uidText?: string;
  ocrProvider?: string;
  error?: string;
  debug?: {
    events?: DebugEvent[];
    emailDelivery?: {
      method: string;
      to: string[];
      cc: string[];
      subject: string;
      attachmentName: string;
      accepted: boolean;
      providerMessageId?: string;
      apiFallbackError?: string;
    } | null;
    ocr?: unknown;
  };
};

function readFileDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

function makeTestParticipantId() {
  return `AXIS-OKX-TEST-${Date.now().toString(36).toUpperCase()}`;
}

export default function OkxTestConsole() {
  const [participantId, setParticipantId] = useState(makeTestParticipantId);
  const [proofName, setProofName] = useState("");
  const [proofDataUrl, setProofDataUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [localLog, setLocalLog] = useState<string[]>([]);

  const events = useMemo(() => result?.debug?.events || [], [result]);

  function pushLog(message: string) {
    setLocalLog((current) => [`${new Date().toLocaleTimeString()} ${message}`, ...current].slice(0, 12));
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setProofName(file.name);
    setProofDataUrl(await readFileDataUrl(file));
    setResult(null);
    pushLog(`Loaded ${file.name} (${Math.round(file.size / 1024)} KB)`);
  }

  async function runDebugSubmit() {
    if (!proofDataUrl || busy) return;
    setBusy(true);
    setResult(null);
    pushLog(`Submitting ${participantId}`);

    try {
      const response = await fetch("/api/okx/claim?debug=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: "en",
          missionId: "verify",
          participantId,
          proofName,
          hasProofImage: Boolean(proofDataUrl),
          proofImageDataUrl: proofDataUrl,
        }),
      });
      const data = (await response.json().catch(() => ({ error: "Bad JSON response" }))) as DebugResponse;
      setResult(data);
      console.info("OKX debug proof response", data);
      pushLog(response.ok ? `Done: ${data.claimId || "no claim"}` : `Error: ${data.error || response.status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setResult({ error: message });
      pushLog(`Error: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-[#050505] px-3 py-4 text-white sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-3 border border-[#c9ff4a]/35 bg-white/[0.045] p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:p-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#c9ff4a]">OKX test console</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">UID OCR + mail proof</h1>
          </div>

          <label className="block text-xs uppercase tracking-[0.18em] text-white/45" htmlFor="okx-test-participant">
            Test user
          </label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              id="okx-test-participant"
              value={participantId}
              onChange={(event) => setParticipantId(event.target.value)}
              className="h-11 min-w-0 border border-white/12 bg-black px-3 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const nextId = makeTestParticipantId();
                setParticipantId(nextId);
                pushLog(`New test user ${nextId}`);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 border border-white/16 px-3 text-sm text-white/80"
            >
              <FiRefreshCw aria-hidden />
              New
            </button>
          </div>

          <label className="grid min-h-[130px] place-items-center border border-dashed border-white/20 bg-black/35 px-4 text-center text-sm text-white/65">
            <input type="file" accept="image/*" onChange={(event) => void handleFile(event)} className="sr-only" />
            <span className="inline-flex items-center gap-2">
              <FiUpload aria-hidden />
              {proofName || "Upload OKX UID screenshot"}
            </span>
          </label>

          <button
            type="button"
            disabled={!proofDataUrl || busy}
            onClick={() => void runDebugSubmit()}
            className="inline-flex h-12 w-full items-center justify-center gap-2 bg-[#c9ff4a] px-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-45"
          >
            <FiSend aria-hidden />
            {busy ? "Testing..." : "Run OCR + send mail"}
          </button>

          {result?.qrUrl ? (
            <div className="grid gap-2 border border-white/12 bg-black/40 p-3">
              <img src={result.qrUrl} alt="Generated test QR" className="mx-auto h-40 w-40 bg-white p-2" />
              <code className="break-all text-xs text-white/70">{result.claimId}</code>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          <div className={`border p-3 ${result?.emailSent ? "border-[#c9ff4a]/50" : result ? "border-[#ff6262]/50" : "border-white/12"} bg-black/35`}>
            <p className="text-xs uppercase tracking-[0.18em] text-white/42">Result</p>
            <div className="mt-2 grid gap-1 text-sm text-white/75">
              <p>UID: <span className="font-mono text-white">{result?.uidText || "none yet"}</span></p>
              <p>OCR: <span className="text-white">{result?.ocrProvider || "waiting"}</span></p>
              <p>Email: <span className="text-white">{result ? (result.emailSent ? "accepted" : "failed") : "waiting"}</span></p>
              {result?.emailError ? <p className="break-words text-[#ff6262]">{result.emailError}</p> : null}
            </div>
          </div>

          {result?.debug?.emailDelivery ? (
            <div className="border border-white/12 bg-black/35 p-3 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.18em] text-white/42">Delivery</p>
              <p className="mt-2">Method: <span className="text-white">{result.debug.emailDelivery.method}</span></p>
              <p>To: <span className="break-words text-white">{result.debug.emailDelivery.to.join(", ")}</span></p>
              <p>CC: <span className="break-words text-white">{result.debug.emailDelivery.cc.join(", ")}</span></p>
              <p>Subject: <span className="break-words text-white">{result.debug.emailDelivery.subject}</span></p>
              <p>Attachment: <span className="break-words text-white">{result.debug.emailDelivery.attachmentName}</span></p>
              {result.debug.emailDelivery.providerMessageId ? <p>Message: <span className="break-all text-white">{result.debug.emailDelivery.providerMessageId}</span></p> : null}
            </div>
          ) : null}

          <div className="max-h-[360px] overflow-auto border border-white/12 bg-black/35 p-3 text-xs text-white/64">
            <p className="mb-2 uppercase tracking-[0.18em] text-white/42">Server log</p>
            {events.length ? events.map((event, index) => (
              <pre key={`${event.at}-${index}`} className="mb-2 whitespace-pre-wrap break-words border-b border-white/[0.08] pb-2">
                {event.at} {event.message}{event.extra !== undefined ? `\n${JSON.stringify(event.extra, null, 2)}` : ""}
              </pre>
            )) : (
              <p>No server events yet.</p>
            )}
          </div>

          <div className="border border-white/12 bg-black/35 p-3 text-xs text-white/54">
            <p className="mb-2 uppercase tracking-[0.18em] text-white/42">Local log</p>
            {localLog.length ? localLog.map((line) => <p key={line}>{line}</p>) : <p>No local events yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
