"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  useAccount,
  useCallsStatus,
  useConnect,
  useDisconnect,
  useReadContract,
  useSendCalls,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { encodeFunctionData } from "viem";
import { base, baseSepolia } from "wagmi/chains";
import { type ARAppCollectDrop, type ARAppCollectStatus, type EpisodeConfig } from "@/src/lib/arapp-collect";
import ModelViewer from "@/components/arapp/ModelViewer";

const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL;

const COLLECT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const statusLabel: Record<ARAppCollectStatus, string> = {
  live: "Live Now",
  "member-access": "Member Access",
  "coming-soon": "Coming Soon",
  "sold-out": "Sold Out",
};

const statusTone: Record<ARAppCollectStatus, string> = {
  live: "border-white/20 bg-white/10 text-white/82",
  "member-access": "border-white/16 bg-white/8 text-white/74",
  "coming-soon": "border-white/14 bg-white/7 text-white/66",
  "sold-out": "border-white/12 bg-white/6 text-white/42",
};

function shortAddress(v: string | undefined) {
  if (!v) return "Not connected";
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

function connectorLabel(id: string, name: string) {
  if (id === "coinbaseWalletSDK" || id === "coinbaseWallet" || id === "coinbaseSmartWallet") return "Coinbase / Base Smart Wallet";
  if (id === "walletConnect") return "WalletConnect";
  if (id === "injected") return "Browser Wallet";
  return name || "Connect Wallet";
}

function getCallsStatusId(value: { id?: string } | string | undefined): string {
  return typeof value === "string" ? value : value?.id ?? "";
}

type ViewMode = "image" | "model" | "video";

type Props = { drop: ARAppCollectDrop; episode: EpisodeConfig; isContractDeployed?: boolean };

function detectMediaKind(url: string) {
  const normalized = url.split("?")[0].toLowerCase();
  if (!normalized) return "none";
  if (normalized.endsWith(".glb") || normalized.endsWith(".gltf")) return "model";
  if (normalized.endsWith(".mp4") || normalized.endsWith(".webm") || normalized.endsWith(".mov") || normalized.endsWith(".m4v")) return "video";
  return "other";
}

export default function ARAppCollectProductPage({ drop, episode, isContractDeployed = false }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const mediaKind = drop.mediaKind || detectMediaKind(drop.model);
  const [viewMode, setViewMode] = useState<ViewMode>("image");
  const [claimFeedback, setClaimFeedback] = useState("");

  const { address, chain, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync, isPending: writing } = useWriteContract();

  const canClaim = drop.status === "live" || drop.status === "member-access";
  const tokenId = BigInt(drop.tokenId);
  const hasSecondaryMedia = Boolean(drop.model);
  const collectContract = (episode.contractAddress || "0x0000000000000000000000000000000000000000") as `0x${string}`;
  const episodeChainId = episode.chainId === baseSepolia.id ? baseSepolia.id : base.id;

  const preferred = connectors.find(
    (c) => c.id === "coinbaseWalletSDK" || c.id === "coinbaseWallet" || c.id === "coinbaseSmartWallet",
  ) || connectors[0];

  const alternates = connectors.filter((c) => c.id !== preferred?.id);

  const { data: balance } = useReadContract({
    address: collectContract,
    abi: COLLECT_ABI,
    functionName: "balanceOf",
    args: address ? [address, tokenId] : undefined,
    chainId: episodeChainId,
    query: { enabled: !!address && Boolean(episode.contractAddress) },
  });

  const alreadyClaimed = balance !== undefined && balance > 0n;
  const { sendCalls, data: callsId, isPending: sendingCalls } = useSendCalls();
  const { data: callsStatus } = useCallsStatus({
    id: getCallsStatusId(callsId as { id?: string } | string | undefined),
    query: { enabled: Boolean(callsId), refetchInterval: (q) => (q.state.data?.status === "success" ? false : 1000) },
  });
  const [claimTxHash, setClaimTxHash] = useState<`0x${string}` | null>(null);
  const claimReceipt = useWaitForTransactionReceipt({ hash: claimTxHash ?? undefined });
  const isCallSuccess = callsStatus?.status === "success";
  const isDirectSuccess = claimReceipt.status === "success";
  const isSuccess = isCallSuccess || isDirectSuccess;
  const confirming = (Boolean(callsId) && callsStatus?.status !== "success") || (Boolean(claimTxHash) && claimReceipt.status !== "success");

  const claimed = alreadyClaimed || isSuccess;

  useEffect(() => {
    setIsMounted(true);
    if (mediaKind === "video") {
      setViewMode("video");
    } else if (mediaKind === "model") {
      setViewMode("model");
    } else {
      setViewMode("image");
    }
  }, [mediaKind]);

  async function handleSponsoredClaim() {
    if (!address || !canClaim || claimed) return;
    if (!episode.contractAddress) return;
    if (!PAYMASTER_URL) {
      setClaimFeedback("Sponsored claim is not configured right now.");
      return;
    }

    try {
      setClaimFeedback("");
      sendCalls({
        calls: [{
          to: collectContract,
          data: encodeFunctionData({
            abi: COLLECT_ABI,
            functionName: "mint",
            args: [tokenId],
          }),
        }],
        capabilities: {
          paymasterService: { url: PAYMASTER_URL },
        },
      });
    } catch (error) {
      setClaimFeedback(error instanceof Error ? error.message : "Sponsored claim failed.");
    }
  }

  async function handleDirectClaim() {
    if (!address || !canClaim || claimed) return;
    if (!episode.contractAddress) return;

    try {
      setClaimFeedback("");
      const hash = await writeContractAsync({
      address: collectContract,
      abi: COLLECT_ABI,
      chainId: episodeChainId as never,
      functionName: "mint",
        args: [tokenId],
        gas: 250000n,
      });
      setClaimTxHash(hash);
    } catch (error) {
      setClaimFeedback(error instanceof Error ? error.message : "Direct wallet claim failed.");
    }
  }

  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-white/36">
          <Link href="/arapp/collect" className="hover:text-white/60 transition-colors">Collect</Link>
          <span>/</span>
          <Link href={`/arapp/collect/${episode.slug}`} className="hover:text-white/60 transition-colors">{episode.label}</Link>
          <span>/</span>
          <span className="text-white/54">{drop.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">

          {/* Image + 3D panel */}
          <div className="space-y-3">
            {/* View toggle */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("image")}
                className={`rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                  viewMode === "image"
                    ? "border-white/20 bg-white text-black"
                    : "border-white/10 bg-white/4 text-white/50 hover:text-white/80"
                }`}
              >
                Image
              </button>
              {mediaKind === "model" ? (
                <button
                  type="button"
                  onClick={() => setViewMode("model")}
                  className={`rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                    viewMode === "model"
                      ? "border-white/20 bg-white text-black"
                      : "border-white/10 bg-white/4 text-white/50 hover:text-white/80"
                  }`}
                >
                  3D View
                </button>
              ) : null}
              {mediaKind === "video" ? (
                <button
                  type="button"
                  onClick={() => setViewMode("video")}
                  className={`rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                    viewMode === "video"
                      ? "border-white/20 bg-white text-black"
                      : "border-white/10 bg-white/4 text-white/50 hover:text-white/80"
                  }`}
                >
                  Video
                </button>
              ) : null}
              <div className="ml-auto flex items-center gap-1.5">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] ${statusTone[drop.status]}`}>
                  {statusLabel[drop.status]}
                </span>
                <span className="rounded-full border border-white/16 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70">
                  Free
                </span>
              </div>
            </div>

            {/* Viewer area */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {viewMode === "image" || !hasSecondaryMedia ? (
                <>
                  <Image
                    src={drop.image}
                    alt={drop.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </>
              ) : viewMode === "video" && mediaKind === "video" ? (
                <video
                  src={drop.model}
                  poster={drop.image}
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : viewMode === "model" && mediaKind === "model" ? (
                <ModelViewer
                  src={drop.model}
                  poster={drop.image}
                  alt={drop.title}
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/52">
                  Extra media is available for this artwork, but this file type is not previewable here yet.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {drop.chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/52">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Info + claim panel */}
          <div className="space-y-5">

            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">{drop.artist}</div>
              <h1 className="mt-1.5 text-xl font-semibold leading-tight tracking-[-0.03em] text-white">{drop.title}</h1>
              <p className="mt-2 text-sm leading-6 text-white/56">{drop.subtitle}</p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-semibold tracking-[-0.04em] text-white">Free</span>
                <span className="text-[11px] text-white/36">Gas sponsored · ERC-1155 on Base</span>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                <div className="text-[9px] uppercase tracking-[0.26em] text-white/36">Edition</div>
                <div className="mt-1 text-[12px] font-medium text-white/82">{drop.edition}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                <div className="text-[9px] uppercase tracking-[0.26em] text-white/36">Format</div>
                <div className="mt-1 text-[12px] font-medium text-white/82">{drop.format}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                <div className="text-[9px] uppercase tracking-[0.26em] text-white/36">Token</div>
                <div className="mt-1 text-[12px] font-medium text-white/82">ERC-1155 #{tokenId.toString()}</div>
              </div>
            </div>

            {/* Availability */}
            {drop.remaining > 0 && (
              <div className="rounded-xl border border-white/8 bg-white/4 p-3 text-[11px] text-white/54">
                <span className="font-semibold text-white">{drop.remaining}</span>{" "}
                {drop.remaining === 1 ? "edition" : "editions"} available
                {drop.remaining < 30 && (
                  <span className="ml-2 text-white/54">— almost gone</span>
                )}
              </div>
            )}

            {/* Utilities */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-4">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">What you get</div>
              <ul className="mt-3 space-y-2">
                {drop.utilities.map((u) => (
                  <li key={u} className="flex items-start gap-2.5 text-[12px] text-white/66">
                    <span className="mt-0.5 text-white/30">—</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/44">
              <span className="h-1 w-1 rounded-full bg-white/30" />
              {drop.delivery}
            </div>

            {/* Wallet section */}
            <div className="rounded-xl border border-white/8 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Wallet</div>
                  <div className="mt-0.5 text-[12px] font-medium text-white/80">
                    {isMounted ? shortAddress(address) : "—"}
                  </div>
                  {isMounted && isConnected && (
                    <div className="mt-0.5 text-[10px] text-white/36">{chain?.name || "Base"}</div>
                  )}
                </div>
                {isMounted && isConnected && (
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white/48 hover:text-white"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              {isMounted && !isConnected && preferred && (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => connect({ connector: preferred, chainId: episodeChainId })}
                    disabled={isPending}
                    className="w-full rounded-xl border border-white/14 bg-white/8 px-3 py-2.5 text-[10px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:bg-white/12 disabled:opacity-40"
                  >
                    {isPending ? "Connecting…" : connectorLabel(preferred.id, preferred.name)}
                  </button>
                  {alternates.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => connect({ connector: c, chainId: episodeChainId })}
                      disabled={isPending}
                      className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/48 disabled:opacity-40"
                    >
                      {connectorLabel(c.id, c.name)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Claim CTA */}
            {isMounted && canClaim && (
              <>
                {claimed ? (
                  <div className="w-full rounded-xl border border-white/16 bg-white/6 py-4 text-center text-[11px] uppercase tracking-[0.28em] text-white/72">
                    Claimed ✓
                  </div>
                ) : (
                  <div className="space-y-3">
                    {PAYMASTER_URL ? (
                      <button
                        type="button"
                        onClick={handleSponsoredClaim}
                        disabled={sendingCalls || confirming || !isConnected || !episode.contractAddress}
                        className="w-full rounded-xl border border-white/20 bg-white py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        {!isConnected
                          ? "Connect Wallet to Claim"
                          : !episode.contractAddress
                          ? "Episode Contract Missing"
                          : sendingCalls
                          ? "Confirm Sponsored Claim…"
                          : confirming
                          ? "Claiming…"
                          : "Sponsored Claim"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleDirectClaim}
                      disabled={writing || confirming || !isConnected || !episode.contractAddress}
                      className="w-full rounded-xl border border-white/12 bg-white/6 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-opacity hover:bg-white/10 disabled:opacity-40"
                    >
                      {!isConnected
                        ? "Connect Wallet To Pay Gas"
                        : !episode.contractAddress
                        ? "Episode Contract Missing"
                        : writing
                        ? "Confirm Wallet Claim…"
                        : confirming
                        ? "Claiming…"
                        : "Claim With Wallet Gas"}
                    </button>
                    <div className="text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {PAYMASTER_URL ? "Top button uses paymaster. Bottom button uses your wallet gas." : "Direct wallet gas claim is active."}
                    </div>
                  </div>
                )}
              </>
            )}

            {!canClaim && (
              <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[11px] text-white/42">
                {drop.status === "coming-soon"
                  ? isContractDeployed
                    ? "This artwork is still closed on the site. Open the site claim and token mint in Live Episode HQ."
                    : "This artwork opens in the next release wave."
                  : "This edition is sold out."}
              </div>
            )}

            {claimFeedback ? (
              <div className="rounded-xl border border-white/16 bg-white/7 px-4 py-3 text-[11px] leading-6 text-white/74">
                {claimFeedback}
              </div>
            ) : null}

            <Link
              href={`/arapp/collect/${episode.slug}`}
              className="block text-center text-[10px] uppercase tracking-[0.26em] text-white/34 hover:text-white/56"
            >
              ← Back to {episode.label}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
