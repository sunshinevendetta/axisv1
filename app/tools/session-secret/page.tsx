"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SecretFormat = "base64" | "hex";
type CopyKind = "env" | "raw";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function generateSecret() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return { base64: bytesToBase64(bytes), hex: bytesToHex(bytes) };
}

function chunkValue(value: string, size: number) {
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += size) chunks.push(value.slice(i, i + size));
  return chunks;
}

export default function SessionSecretPage() {
  const router = useRouter();
  const [secret, setSecret] = useState<{ base64: string; hex: string } | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SecretFormat>("base64");
  const [copied, setCopied] = useState<CopyKind | null>(null);

  useEffect(() => { setSecret(generateSecret()); }, []);

  const rawValue = secret?.[selectedFormat] ?? "";
  const envLine = rawValue ? `EPISODES_ADMIN_SESSION_SECRET=${rawValue}` : "";
  const displayRows = useMemo(
    () => chunkValue(rawValue, selectedFormat === "base64" ? 12 : 16),
    [rawValue, selectedFormat],
  );

  async function copyValue(value: string, kind: CopyKind) {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1500);
  }

  function regenerate() {
    setSecret(generateSecret());
    setCopied(null);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-4xl space-y-5">

        {/* Top nav bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/22 hover:text-white"
            >
              ← Back
            </button>
            <span className="text-[11px] uppercase tracking-[0.26em] text-white/36">Session Secret</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/owner/contracts")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/22 hover:text-white"
            >
              Contracts HQ
            </button>
            <button
              onClick={() => router.push("/owner/episodes")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/22 hover:text-white"
            >
              Episodes HQ
            </button>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">Step 0 of setup</div>
          <h1 className="mt-2 text-xl font-semibold tracking-[-0.04em] sm:text-2xl">
            Generate your HQ session secret
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
            This is a one-time password that locks down who can access Deployment HQ. Generate it here, copy the env line, paste it into your <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">.env</code> file, then restart the app. You only need to do this once.
          </p>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            {/* Left col — format picker + meta */}
            <div className="space-y-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">Format</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat("base64")}
                    className={`rounded-[20px] border p-3 text-left transition-all ${
                      selectedFormat === "base64"
                        ? "border-white/28 bg-white/[0.08]"
                        : "border-white/10 bg-black/25 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-white">Base64</div>
                      <span className="rounded-full border border-white/16 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/60">
                        recommended
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/52">Shorter, cleaner for .env files.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat("hex")}
                    className={`rounded-[20px] border p-3 text-left transition-all ${
                      selectedFormat === "hex"
                        ? "border-white/28 bg-white/[0.08]"
                        : "border-white/10 bg-black/25 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="text-sm font-medium text-white">Hex</div>
                    <p className="mt-1 text-xs leading-5 text-white/52">Longer, easier to visually inspect.</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[18px] border border-white/10 bg-black/30 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Format</div>
                  <div className="mt-1 text-sm font-medium text-white">{selectedFormat === "base64" ? "Base64" : "Hex"}</div>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-black/30 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Size</div>
                  <div className="mt-1 text-sm font-medium text-white">32 bytes</div>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-black/30 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Target</div>
                  <div className="mt-1 text-sm font-medium text-white">.env</div>
                </div>
              </div>

              {/* What to do next */}
              <div className="rounded-[20px] border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white/58 space-y-1.5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/36 mb-2">What to do</div>
                <div><span className="text-white/80">1.</span> Copy the env line below</div>
                <div><span className="text-white/80">2.</span> Open your <code className="rounded bg-white/10 px-1 font-mono text-xs">.env</code> file and paste it in</div>
                <div><span className="text-white/80">3.</span> Restart the dev server</div>
                <div><span className="text-white/80">4.</span> Come back to <button onClick={() => router.push("/owner/contracts")} className="text-white/80 underline underline-offset-2 hover:text-white">Contracts HQ</button> and sign in</div>
              </div>
            </div>

            {/* Right col — the actual secrets */}
            <div className="space-y-3">
              {/* Env line */}
              <div className="rounded-[24px] border border-white/12 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.20em] text-white/42">Paste this into .env</div>
                    <div className="mt-1 text-sm font-medium text-white">Full env line — safest option</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => envLine && copyValue(envLine, "env")}
                    className={`shrink-0 rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
                      copied === "env"
                        ? "border-white/30 bg-white/[0.12] text-white"
                        : "border-white/14 bg-white/[0.06] text-white/72 hover:border-white/28 hover:text-white"
                    }`}
                  >
                    {copied === "env" ? "✓ Copied" : "Copy Env Line"}
                  </button>
                </div>
                <div className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs leading-6 text-white/88 break-all">
                  {envLine || "Generating..."}
                </div>
              </div>

              {/* Raw value */}
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.20em] text-white/42">Raw secret only</div>
                    <div className="mt-1 text-sm font-medium text-white">Use if you need just the value</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => rawValue && copyValue(rawValue, "raw")}
                      className={`rounded-xl border px-3 py-1.5 text-xs transition-all ${
                        copied === "raw"
                          ? "border-white/30 bg-white/[0.12] text-white"
                          : "border-white/12 text-white/62 hover:border-white/24 hover:text-white"
                      }`}
                    >
                      {copied === "raw" ? "✓ Copied" : "Copy Raw"}
                    </button>
                    <button
                      type="button"
                      onClick={regenerate}
                      className="rounded-xl border border-white/12 px-3 py-1.5 text-xs text-white/62 transition-all hover:border-white/24 hover:text-white"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/36">{selectedFormat}</div>
                    <div className="text-[10px] text-white/36">{rawValue.length || 0} chars</div>
                  </div>
                  <div className="grid gap-1.5 font-mono text-xs leading-5 text-white/80 sm:grid-cols-2">
                    {displayRows.length > 0 ? (
                      displayRows.map((row) => (
                        <div key={row} className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5">
                          {row}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5">Generating...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav — go to HQ */}
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-medium text-white/70">Done pasting the secret?</div>
              <p className="mt-0.5 text-xs text-white/42">Restart your dev server, then head to Contracts HQ to continue setup.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => router.push("/owner/contracts")}
                className="rounded-xl border border-white/18 bg-white/[0.07] px-4 py-2 text-xs font-medium text-white transition hover:border-white/30 hover:bg-white/[0.12]"
              >
                Go to Contracts HQ →
              </button>
              <button
                onClick={() => router.push("/owner/episodes")}
                className="rounded-xl border border-white/12 px-4 py-2 text-xs text-white/60 transition hover:border-white/22 hover:text-white"
              >
                Episodes HQ
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
