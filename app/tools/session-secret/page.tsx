"use client";

import { useEffect, useMemo, useState } from "react";

type SecretFormat = "base64" | "hex";
type CopyKind = "env" | "raw";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function generateSecret() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);

  return {
    base64: bytesToBase64(bytes),
    hex: bytesToHex(bytes),
  };
}

function chunkValue(value: string, size: number) {
  const chunks: string[] = [];

  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }

  return chunks;
}

export default function SessionSecretPage() {
  const [secret, setSecret] = useState<{ base64: string; hex: string } | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SecretFormat>("base64");
  const [copied, setCopied] = useState<CopyKind | null>(null);

  useEffect(() => {
    setSecret(generateSecret());
  }, []);

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(201,220,255,0.14),transparent_34%),linear-gradient(180deg,#02050a_0%,#07111d_55%,#030507_100%)] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pt-10 sm:pt-16">
        <section className="overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.05] shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-8">
            <div className="space-y-5">
              <div className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-1 text-[11px] uppercase tracking-[0.26em] text-cyan-100/80">
                Session Secret HQ
              </div>
              <div>
                <h1 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                  Generate a clean secret and copy the right HQ value fast.
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-200/72 sm:text-base">
                  Pick the format you want, then copy either the ready-to-paste env line or the raw secret. Base64 is
                  selected automatically because it is shorter and easiest to use in Deployment HQ.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormat("base64")}
                  className={`rounded-[24px] border p-4 text-left transition-all ${
                    selectedFormat === "base64"
                      ? "border-cyan-200/50 bg-cyan-200/12 shadow-[0_0_0_1px_rgba(186,230,253,0.15)]"
                      : "border-white/10 bg-black/20 hover:border-white/22 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">Use Base64</div>
                    <span className="rounded-full border border-cyan-200/30 bg-cyan-200/10 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-cyan-100/80">
                      Auto
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-200/68">Recommended for `.env` because it stays compact.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFormat("hex")}
                  className={`rounded-[24px] border p-4 text-left transition-all ${
                    selectedFormat === "hex"
                      ? "border-cyan-200/50 bg-cyan-200/12 shadow-[0_0_0_1px_rgba(186,230,253,0.15)]"
                      : "border-white/10 bg-black/20 hover:border-white/22 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="text-sm font-medium text-white">Use Hex</div>
                  <p className="mt-2 text-sm leading-6 text-slate-200/68">Longer, but easier to visually inspect and compare.</p>
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Current Format</div>
                  <div className="mt-2 text-lg font-medium text-white">{selectedFormat === "base64" ? "Base64" : "Hex"}</div>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Secret Size</div>
                  <div className="mt-2 text-lg font-medium text-white">32 bytes</div>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Paste Target</div>
                  <div className="mt-2 text-lg font-medium text-white">HQ `.env`</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 self-start">
              <section className="rounded-[28px] border border-white/12 bg-[#06101a]/90 p-4 sm:p-5">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/60">Ready To Paste</div>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">1. Copy the full env line</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-200/68">
                      This is the safest option because it already includes the correct key name.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => envLine && copyValue(envLine, "env")}
                    className="rounded-full border border-cyan-200/30 bg-cyan-200/12 px-4 py-2 text-sm font-medium text-cyan-50 transition-all hover:border-cyan-200/50 hover:bg-cyan-200/20"
                  >
                    {copied === "env" ? "Copied Env Line" : "Copy Env Line"}
                  </button>
                </div>

                <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/30">
                  <div className="border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-white/46">
                    EPISODES_ADMIN_SESSION_SECRET
                  </div>
                  <div className="overflow-x-auto px-4 py-4 font-mono text-sm leading-7 text-cyan-50/92">
                    {envLine || "Generating..."}
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/12 bg-white/[0.04] p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Raw Value</div>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">2. Use the secret by itself if needed</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-200/68">
                      The value is grouped into shorter chunks so it stays readable instead of turning into one huge block.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => rawValue && copyValue(rawValue, "raw")}
                      className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/78 transition-all hover:border-white/24 hover:text-white"
                    >
                      {copied === "raw" ? "Copied Raw" : "Copy Raw"}
                    </button>
                    <button
                      type="button"
                      onClick={regenerate}
                      className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/78 transition-all hover:border-white/24 hover:text-white"
                    >
                      Generate Again
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-[22px] border border-white/10 bg-black/25 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">{selectedFormat}</div>
                    <div className="text-xs text-white/48">{rawValue.length || 0} characters</div>
                  </div>
                  <div className="grid gap-2 font-mono text-sm leading-6 text-slate-100/88 sm:grid-cols-2">
                    {displayRows.length > 0 ? (
                      displayRows.map((row) => (
                        <div key={row} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                          {row}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">Generating...</div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Step 1</div>
            <h3 className="mt-2 text-lg font-semibold text-white">Leave it on Base64</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200/68">
              The page starts there automatically because it is shorter and cleaner for environment files.
            </p>
          </article>

          <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Step 2</div>
            <h3 className="mt-2 text-lg font-semibold text-white">Copy the env line</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200/68">
              That avoids manual formatting mistakes and keeps the HQ setup process fast.
            </p>
          </article>

          <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Step 3</div>
            <h3 className="mt-2 text-lg font-semibold text-white">Paste into `.env`</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200/68">
              Store it locally, keep it private, and reuse the same value for your existing HQ session setup.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
