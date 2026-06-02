"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { base } from "wagmi/chains";
import type { Address, Hex } from "viem";
import {
  PDQ_ADMIN_ABI,
  PDQ_BYTECODE,
  PDQ_DEPLOY_DEFAULTS,
  deployArgsTuple,
  manifestToMedals,
  type MedalConfig,
  type ReadyManifest,
} from "@/src/lib/pizzaday-admin";
import {
  explorerAddressUrl,
  explorerTxUrl,
  getMedalsContractAddress,
} from "@/src/lib/pizzaday-onchain";
import readyManifest from "@/pizzaday/ready/manifest.json";

/** Base mainnet. The whole flow assumes Base. */
const CHAIN = base;

type DeployForm = {
  name: string;
  symbol: string;
  seasonId: string;
  episodeNumber: string;
  baseUri: string;
  contractMetadataUri: string;
};

type OnchainMedal = {
  exists: boolean;
  name: string;
  metadataUri: string;
  maxSupply: bigint;
  minted: bigint;
  openMint: boolean;
  mintStartsAt: bigint;
  mintEndsAt: bigint;
};

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "shortMessage" in e) {
    return String((e as { shortMessage: unknown }).shortMessage);
  }
  return e instanceof Error ? e.message : String(e);
}

export default function PizzaDayAdmin() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: CHAIN.id });
  const { data: walletClient } = useWalletClient();

  const medals = useMemo(
    () => manifestToMedals(readyManifest as ReadyManifest),
    [],
  );

  // Deployed address: env first, then in-session override after a deploy.
  const envAddress = getMedalsContractAddress();
  const [deployed, setDeployed] = useState<Address | null>(envAddress);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [deployForm, setDeployForm] = useState<DeployForm>({
    name: PDQ_DEPLOY_DEFAULTS.name,
    symbol: PDQ_DEPLOY_DEFAULTS.symbol,
    seasonId: PDQ_DEPLOY_DEFAULTS.seasonId.toString(),
    episodeNumber: PDQ_DEPLOY_DEFAULTS.episodeNumber.toString(),
    baseUri: "",
    contractMetadataUri: "",
  });

  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [chainState, setChainState] = useState<Record<number, OnchainMedal>>({});
  const [paused, setPaused] = useState<boolean | null>(null);
  const [manualAddr, setManualAddr] = useState("");

  const onBase = chainId === CHAIN.id;

  const pushLog = useCallback((line: string) => {
    setLog((prev) => [
      `${new Date().toLocaleTimeString()}  ${line}`,
      ...prev,
    ]);
  }, []);

  // ── Read current on-chain state for every medal ─────────────────────────
  const refresh = useCallback(async () => {
    if (!deployed || !publicClient) return;
    try {
      const entries = await Promise.all(
        medals.map(async (m) => {
          const r = (await publicClient.readContract({
            address: deployed,
            abi: PDQ_ADMIN_ABI,
            functionName: "artworks",
            args: [BigInt(m.tokenId)],
          })) as readonly [
            string,
            string,
            bigint,
            bigint,
            boolean,
            boolean,
            bigint,
            bigint,
          ];
          const medal: OnchainMedal = {
            name: r[0],
            metadataUri: r[1],
            maxSupply: r[2],
            minted: r[3],
            exists: r[4],
            openMint: r[5],
            mintStartsAt: r[6],
            mintEndsAt: r[7],
          };
          return [m.tokenId, medal] as const;
        }),
      );
      setChainState(Object.fromEntries(entries));
    } catch (e) {
      pushLog(`read failed: ${errMessage(e)}`);
    }
  }, [deployed, publicClient, medals, pushLog]);

  // Check whether connected wallet holds DEFAULT_ADMIN_ROLE, plus paused state.
  const checkAdmin = useCallback(async () => {
    if (!deployed || !publicClient || !address) {
      setIsAdmin(null);
      setPaused(null);
      return;
    }
    try {
      const role = (await publicClient.readContract({
        address: deployed,
        abi: PDQ_ADMIN_ABI,
        functionName: "DEFAULT_ADMIN_ROLE",
      })) as Hex;
      const has = (await publicClient.readContract({
        address: deployed,
        abi: PDQ_ADMIN_ABI,
        functionName: "hasRole",
        args: [role, address],
      })) as boolean;
      setIsAdmin(has);
      const isPaused = (await publicClient.readContract({
        address: deployed,
        abi: PDQ_ADMIN_ABI,
        functionName: "paused",
      })) as boolean;
      setPaused(isPaused);
    } catch {
      setIsAdmin(null);
      setPaused(null);
    }
  }, [deployed, publicClient, address]);

  useEffect(() => {
    void refresh();
    void checkAdmin();
  }, [refresh, checkAdmin]);

  // ── Write helper: send tx, wait, refresh ────────────────────────────────
  const send = useCallback(
    async (
      label: string,
      functionName: string,
      args: readonly unknown[],
    ): Promise<Hex | null> => {
      if (!walletClient || !publicClient || !deployed) {
        pushLog(`${label}: wallet not ready`);
        return null;
      }
      setBusy(true);
      try {
        pushLog(`${label}: confirm in wallet…`);
        const hash = await walletClient.writeContract({
          address: deployed,
          abi: PDQ_ADMIN_ABI,
          functionName: functionName as never,
          args: args as never,
          chain: CHAIN,
        });
        pushLog(`${label}: sent ${short(hash)} — waiting…`);
        await publicClient.waitForTransactionReceipt({ hash });
        pushLog(`${label}: confirmed ✓`);
        await refresh();
        return hash;
      } catch (e) {
        pushLog(`${label}: ${errMessage(e)}`);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [walletClient, publicClient, deployed, pushLog, refresh],
  );

  // ── Deploy ──────────────────────────────────────────────────────────────
  const handleDeploy = useCallback(async () => {
    if (!walletClient || !publicClient || !address) return;
    setBusy(true);
    try {
      pushLog("deploy: confirm in wallet…");
      const hash = await walletClient.deployContract({
        abi: PDQ_ADMIN_ABI,
        bytecode: PDQ_BYTECODE,
        args: deployArgsTuple({
          admin: address,
          name: deployForm.name,
          symbol: deployForm.symbol,
          seasonId: BigInt(deployForm.seasonId || "0"),
          episodeNumber: BigInt(deployForm.episodeNumber || "0"),
          baseUri: deployForm.baseUri,
          contractMetadataUri: deployForm.contractMetadataUri,
        }),
        chain: CHAIN,
        account: address,
      });
      pushLog(`deploy: sent ${short(hash)} — waiting…`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.contractAddress) {
        setDeployed(receipt.contractAddress);
        pushLog(`deploy: live at ${receipt.contractAddress} ✓`);
        pushLog(
          `ACTION: set NEXT_PUBLIC_PDQ_MEDALS_ADDRESS=${receipt.contractAddress} in env`,
        );
      } else {
        pushLog("deploy: confirmed but no contractAddress in receipt");
      }
    } catch (e) {
      pushLog(`deploy: ${errMessage(e)}`);
    } finally {
      setBusy(false);
    }
  }, [walletClient, publicClient, address, deployForm, pushLog]);

  // ── Register a single medal ─────────────────────────────────────────────
  const registerOne = useCallback(
    (m: MedalConfig) =>
      send("register " + m.tokenId, "registerArtwork", [
        BigInt(m.tokenId),
        m.name,
        m.metadataUri,
        m.maxSupply,
        m.openMint,
        m.mintStartsAt,
        m.mintEndsAt,
      ]),
    [send],
  );

  // Register every not-yet-registered medal, sequentially. Re-reads `exists`
  // on-chain per medal so a partially-registered contract (or a re-run) skips
  // already-registered ids without relying on the possibly-stale chainState
  // snapshot captured in this closure.
  const registerAll = useCallback(async () => {
    if (!publicClient || !deployed) return;
    for (const m of medals) {
      try {
        const r = (await publicClient.readContract({
          address: deployed,
          abi: PDQ_ADMIN_ABI,
          functionName: "artworks",
          args: [BigInt(m.tokenId)],
        })) as readonly unknown[];
        // 5th tuple field (index 4) is `exists`.
        if (r[4] === true) {
          pushLog(`register ${m.tokenId}: already registered — skipping`);
          continue;
        }
      } catch {
        // fall through and attempt registration
      }
      const ok = await registerOne(m);
      if (!ok) break;
    }
  }, [medals, publicClient, deployed, registerOne, pushLog]);

  // ── Airdrop ─────────────────────────────────────────────────────────────
  const [airdropToken, setAirdropToken] = useState<number>(medals[0]?.tokenId ?? 1);
  const [airdropList, setAirdropList] = useState("");

  const handleAirdrop = useCallback(async () => {
    const recipients = airdropList
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter((s) => /^0x[0-9a-fA-F]{40}$/.test(s)) as Address[];
    if (recipients.length === 0) {
      pushLog("airdrop: no valid 0x addresses found");
      return;
    }
    pushLog(`airdrop: ${recipients.length} recipients → token ${airdropToken}`);
    await send("airdrop", "airdrop", [recipients, BigInt(airdropToken)]);
  }, [airdropList, airdropToken, send, pushLog]);

  // Manually attach to an already-deployed contract (paste address, no env).
  const handleAttach = useCallback(() => {
    const a = manualAddr.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(a)) {
      pushLog("attach: not a valid 0x address");
      return;
    }
    setDeployed(a as Address);
    setManualAddr("");
    pushLog(`attached to ${a}`);
  }, [manualAddr, pushLog]);

  // ── Render ──────────────────────────────────────────────────────────────
  const ready = isConnected && onBase && !!walletClient && isAdmin !== false;

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <h1 style={S.h1}>PIZZA DAY · ADMIN</h1>
          <p style={S.sub}>Deploy & manage AxisPizzaDayEpisode1155 on Base.</p>
        </div>
        <div style={S.walletBox}>
          {isConnected ? (
            <>
              <span style={S.mono}>{short(address ?? "")}</span>
              <button style={S.btnGhost} onClick={() => disconnect()}>
                disconnect
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {connectors.map((c) => (
                <button
                  key={c.uid}
                  style={S.btn}
                  disabled={connecting}
                  onClick={() => connect({ connector: c })}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {isConnected && !onBase && (
        <div style={S.warn}>
          Wrong network. <button style={S.btn} onClick={() => switchChain({ chainId: CHAIN.id })}>Switch to Base</button>
        </div>
      )}

      {/* Contract status */}
      <section style={S.card}>
        <h2 style={S.h2}>CONTRACT</h2>
        {deployed ? (
          <p style={S.mono}>
            <a
              href={explorerAddressUrl(deployed)}
              target="_blank"
              rel="noreferrer"
              style={S.link}
            >
              {deployed}
            </a>
            {isAdmin === true && <span style={S.okTag}> · you are admin</span>}
            {isAdmin === false && <span style={S.errTag}> · not admin (read-only)</span>}
            {paused === true && <span style={S.errTag}> · PAUSED</span>}
          </p>
        ) : (
          <p style={S.sub}>Not deployed yet — deploy below, or attach an existing address.</p>
        )}
        {deployed && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button
              style={S.btnGhost}
              disabled={!ready || busy || paused === null}
              onClick={() =>
                void send(paused ? "unpause" : "pause", paused ? "unpause" : "pause", [])
              }
            >
              {paused ? "unpause contract" : "pause contract"}
            </button>
            <button style={S.btnGhost} disabled={busy} onClick={() => { setDeployed(null); setChainState({}); }}>
              detach
            </button>
          </div>
        )}
        {!deployed && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <input
              style={{ ...S.input, flex: 1, minWidth: 280 }}
              placeholder="0x… existing contract address"
              value={manualAddr}
              onChange={(e) => setManualAddr(e.target.value)}
            />
            <button style={S.btn} onClick={handleAttach}>attach</button>
          </div>
        )}
      </section>

      {/* Deploy */}
      {!deployed && (
        <section style={S.card}>
          <h2 style={S.h2}>DEPLOY</h2>
          <div style={S.grid2}>
            <Field label="Name" value={deployForm.name} onChange={(v) => setDeployForm((f) => ({ ...f, name: v }))} />
            <Field label="Symbol" value={deployForm.symbol} onChange={(v) => setDeployForm((f) => ({ ...f, symbol: v }))} />
            <Field label="Season ID" value={deployForm.seasonId} onChange={(v) => setDeployForm((f) => ({ ...f, seasonId: v }))} />
            <Field label="Episode #" value={deployForm.episodeNumber} onChange={(v) => setDeployForm((f) => ({ ...f, episodeNumber: v }))} />
            <Field label="Base URI (optional)" value={deployForm.baseUri} onChange={(v) => setDeployForm((f) => ({ ...f, baseUri: v }))} />
            <Field label="Contract metadata URI (optional)" value={deployForm.contractMetadataUri} onChange={(v) => setDeployForm((f) => ({ ...f, contractMetadataUri: v }))} />
          </div>
          <button style={S.btnPrimary} disabled={!ready || busy} onClick={handleDeploy}>
            {busy ? "working…" : "Deploy contract"}
          </button>
          <p style={S.hint}>
            Deployer wallet ({address ? short(address) : "—"}) gets all admin roles.
          </p>
        </section>
      )}

      {/* Medals */}
      {deployed && (
        <section style={S.card}>
          <div style={S.rowBetween}>
            <h2 style={S.h2}>MEDALS ({medals.length})</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnGhost} disabled={busy} onClick={() => void refresh()}>refresh</button>
              <button style={S.btnPrimary} disabled={!ready || busy} onClick={() => void registerAll()}>
                Register all unregistered
              </button>
            </div>
          </div>

          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>ID</th>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>State</th>
                  <th style={S.th}>Minted</th>
                  <th style={S.th}>Open</th>
                  <th style={S.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medals.map((m) => {
                  const oc = chainState[m.tokenId];
                  const exists = oc?.exists ?? false;
                  return (
                    <tr key={m.tokenId} style={S.tr}>
                      <td style={S.td}>{m.tokenId}</td>
                      <td style={S.td}>{m.name}</td>
                      <td style={S.td}>
                        {exists ? (
                          <span style={S.okTag}>registered</span>
                        ) : (
                          <span style={S.sub}>—</span>
                        )}
                      </td>
                      <td style={S.td}>{exists ? oc!.minted.toString() : "—"}</td>
                      <td style={S.td}>
                        {exists ? (oc!.openMint ? "yes" : "no") : "—"}
                      </td>
                      <td style={S.td}>
                        {!exists ? (
                          <button style={S.btnSm} disabled={!ready || busy} onClick={() => void registerOne(m)}>
                            register
                          </button>
                        ) : (
                          <button
                            style={S.btnSm}
                            disabled={!ready || busy}
                            onClick={() =>
                              void send(
                                `${oc!.openMint ? "close" : "open"} ${m.tokenId}`,
                                "setOpenMint",
                                [BigInt(m.tokenId), !oc!.openMint],
                              )
                            }
                          >
                            {oc!.openMint ? "close mint" : "open mint"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Airdrop */}
      {deployed && (
        <section style={S.card}>
          <h2 style={S.h2}>AIRDROP</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <label style={S.label}>Token</label>
            <select
              value={airdropToken}
              onChange={(e) => setAirdropToken(Number(e.target.value))}
              style={S.select}
            >
              {medals.map((m) => (
                <option key={m.tokenId} value={m.tokenId}>
                  {m.tokenId} · {m.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="0x… addresses, comma / space / newline separated"
            value={airdropList}
            onChange={(e) => setAirdropList(e.target.value)}
            style={S.textarea}
            rows={4}
          />
          <button style={S.btnPrimary} disabled={!ready || busy} onClick={() => void handleAirdrop()}>
            Airdrop
          </button>
          <p style={S.hint}>Bypasses openMint, window and 1-per-wallet guards.</p>
        </section>
      )}

      {/* Log */}
      <section style={S.card}>
        <h2 style={S.h2}>LOG</h2>
        <div style={S.logBox}>
          {log.length === 0 ? (
            <span style={S.sub}>No activity yet.</span>
          ) : (
            log.map((l, i) => {
              const isTx = /0x[0-9a-fA-F]{6}/.test(l);
              return (
                <div key={i} style={S.logLine}>
                  {l}
                  {isTx && deployed && (() => {
                    const m = l.match(/0x[0-9a-fA-F]{64}/);
                    return m ? (
                      <a href={explorerTxUrl(m[0])} target="_blank" rel="noreferrer" style={S.link}>
                        {" "}↗
                      </a>
                    ) : null;
                  })()}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={S.label}>{label}</span>
      <input style={S.input} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

// ── Inline styles (self-contained, dark, matches the PDQ aesthetic) ────────
const ink = "#f4f4f4";
const ink3 = "#8a8a8a";
const line = "rgba(255,255,255,0.12)";
const S: Record<string, React.CSSProperties> = {
  page: { maxWidth: 960, margin: "0 auto", padding: "48px 20px 120px", color: ink, fontFamily: "var(--display-alt, system-ui, sans-serif)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 28 },
  h1: { fontSize: 34, margin: 0, letterSpacing: "0.02em" },
  h2: { fontSize: 14, letterSpacing: "0.14em", color: ink3, margin: "0 0 16px", textTransform: "uppercase" },
  sub: { color: ink3, fontSize: 13, margin: "4px 0 0" },
  walletBox: { display: "flex", alignItems: "center", gap: 10 },
  mono: { fontFamily: "ui-monospace, monospace", fontSize: 13 },
  card: { border: `1px solid ${line}`, borderRadius: 12, padding: 24, marginBottom: 20, background: "rgba(255,255,255,0.02)" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 },
  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  label: { fontSize: 11, letterSpacing: "0.1em", color: ink3, textTransform: "uppercase" },
  input: { background: "#0a0a0a", border: `1px solid ${line}`, borderRadius: 8, padding: "10px 12px", color: ink, fontSize: 14 },
  select: { background: "#0a0a0a", border: `1px solid ${line}`, borderRadius: 8, padding: "8px 10px", color: ink, fontSize: 14 },
  textarea: { width: "100%", background: "#0a0a0a", border: `1px solid ${line}`, borderRadius: 8, padding: 12, color: ink, fontSize: 13, fontFamily: "ui-monospace, monospace", resize: "vertical", marginBottom: 12, boxSizing: "border-box" },
  btn: { background: "#1a1a1a", border: `1px solid ${line}`, color: ink, borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" },
  btnGhost: { background: "transparent", border: `1px solid ${line}`, color: ink3, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" },
  btnPrimary: { background: ink, border: "none", color: "#000", borderRadius: 8, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnSm: { background: "#1a1a1a", border: `1px solid ${line}`, color: ink, borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" },
  warn: { border: "1px solid #d9a441", background: "rgba(217,164,65,0.08)", color: "#e7bd6c", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", fontSize: 14 },
  okTag: { color: "#5fd08a", fontSize: 12 },
  errTag: { color: "#e06666", fontSize: 12 },
  link: { color: "#7fb4ff", textDecoration: "none" },
  hint: { color: ink3, fontSize: 12, marginTop: 10 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${line}`, color: ink3, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" },
  tr: { borderBottom: `1px solid rgba(255,255,255,0.06)` },
  td: { padding: "10px", verticalAlign: "middle" },
  logBox: { maxHeight: 240, overflowY: "auto", fontFamily: "ui-monospace, monospace", fontSize: 12, display: "grid", gap: 4 },
  logLine: { color: "#cfcfcf", whiteSpace: "pre-wrap" },
};
