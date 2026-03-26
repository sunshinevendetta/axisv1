"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { getAddress, isAddress } from "viem";
import {
  useAccount, useChainId, useConnect, useDeployContract, useDisconnect,
  useSignMessage, useSwitchChain, useWaitForTransactionReceipt, useWriteContract,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import {
  artworkDeploymentSteps, legacyDeploymentSteps,
  defaultFounderBaseUri, defaultFounderContractMetadataUri,
  deploymentArtifacts, deploymentChainMeta, deploymentGuides, deploymentLabels,
  type ArtworkContractKey, type DeploymentChainId, type DeploymentContractKey,
} from "@/src/lib/deployment-hq";
import {
  ownerAccessAbi, OWNER_ACCESS_CONTRACT_ROLES,
  normalizeOwnerAccessContractRoleName, normalizeOwnerAccessPresetRole,
} from "@/src/lib/owner-access-contract";
import ArtworkMetadataBuilder from "@/components/admin/ArtworkMetadataBuilder";
import { episodeCatalog } from "@/src/content/episodes";
import type { EpisodeCollectibleRecord, EpisodeCollectiblesCatalog } from "@/src/content/collectibles";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionState = {
  authenticated: boolean;
  configured: boolean;
  subject?: string | null;
  walletConfigured?: boolean;
  bootstrapOnly?: boolean;
};
type ServerStatus = {
  deployReady: boolean;
  writeReady: boolean;
  adminReady: boolean;
  defaults: {
    contractAddress: string;
    adminAddress: string;
    initialMinterAddress: string;
    baseUri: string;
    contractMetadataUri: string;
    deployRpcUrl: string;
    ownerTokenGate: string;
  };
  missing: { deploy: string[]; mint: string[]; admin: string[] };
};
type VerificationProvider = {
  status: "idle" | "disabled" | "submitted" | "pending" | "verified" | "failed";
  message: string;
  url?: string;
  guid?: string;
};
type DeploymentRecord = {
  address: string;
  txHash: string;
  chainId: DeploymentChainId | null;
  deployedAt: string;
  constructorArgs: unknown[];
  verification: { basescan: VerificationProvider; blockscout: VerificationProvider };
};
type Deployments = Record<DeploymentContractKey, DeploymentRecord>;
type PendingDeployment = { key: DeploymentContractKey; txHash: `0x${string}`; constructorArgs: unknown[] };
type Activity = { id: string; tone: "info" | "success" | "warning" | "danger"; text: string };
type ZoraSyncResult = { slug: string; identifier: string; status: "synced" | "failed"; message: string };
type WorkflowStage = "launch" | "artwork" | "collectibles" | "legacy" | "permissions" | "artists" | "handoff" | "episodes";
type DeployTrack = "artwork" | "legacy";

// ─── Constants ───────────────────────────────────────────────────────────────

const emptySession: SessionState = { authenticated: false, configured: false, subject: null };
const emptyStatus: ServerStatus = {
  deployReady: false, writeReady: false, adminReady: false,
  defaults: { contractAddress: "", adminAddress: "", initialMinterAddress: "", baseUri: "ipfs://spectra-owner-access/{id}.json", contractMetadataUri: "ipfs://spectra-owner-access/contract.json", deployRpcUrl: "", ownerTokenGate: "" },
  missing: { deploy: [], mint: [], admin: [] },
};
const emptyProvider = (): VerificationProvider => ({ status: "idle", message: "Waiting for deployment." });
const emptyRecord = (): DeploymentRecord => ({
  address: "", txHash: "", chainId: null, deployedAt: "", constructorArgs: [],
  verification: { basescan: emptyProvider(), blockscout: emptyProvider() },
});
const emptyDeployments = (): Deployments => ({
  seasonRegistry: emptyRecord(),
  episodeContract: emptyRecord(),
  ownerAccess: emptyRecord(),
  submissionRegistry: emptyRecord(),
  founderMembership: emptyRecord(),
  eventRegistry: emptyRecord(),
});
const storageKey = "spectra-deployment-hq-v3";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function storageReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? { __type: "bigint", value: value.toString() } : value;
}
function storageReviver(_key: string, value: unknown) {
  if (value && typeof value === "object" && "__type" in value && "value" in value && (value as { __type?: string }).__type === "bigint") {
    return BigInt((value as { value: string }).value);
  }
  return value;
}
function short(value?: string, lead = 6, tail = 4) { return value ? `${value.slice(0, lead)}...${value.slice(-tail)}` : "Pending"; }
function normalizeAddress(value: string, label: string) { if (!isAddress(value)) throw new Error(`${label} must be a valid address.`); return getAddress(value); }
function normalizePositiveBigInt(value: string, label: string, fallback = "1") {
  const raw = value.trim() || fallback;
  try { const parsed = BigInt(raw); if (parsed <= BigInt(0)) throw new Error(); return parsed; }
  catch { throw new Error(`${label} must be a positive integer.`); }
}
function normalizeNonNegativeBigInt(value: string, label: string, fallback = "0") {
  const raw = value.trim() || fallback;
  try { const parsed = BigInt(raw); if (parsed < BigInt(0)) throw new Error(); return parsed; }
  catch { throw new Error(`${label} must be zero or a positive integer.`); }
}
function valid(value: string) { return isAddress(value); }
function glow(active?: boolean, disabled?: boolean) {
  if (disabled) return "rounded-2xl border border-white/18 bg-black/45 px-5 py-3 text-sm uppercase tracking-[0.16em] text-white/54 shadow-[0_0_18px_rgba(255,255,255,0.08)]";
  return `rounded-2xl border px-5 py-3 text-sm uppercase tracking-[0.16em] transition-colors duration-200 hover:border-[#39ff14]/70 hover:text-white hover:shadow-[0_0_24px_rgba(57,255,20,0.34)] ${active ? "border-white/28 bg-white/[0.1] text-white hover:bg-white/[0.14]" : "border-white/14 bg-black/55 text-white/82 hover:bg-white/[0.06]"}`;
}
function tone(_t: Activity["tone"]) { return "border-white/10 bg-white/[0.05] text-white/78"; }
function verifyTone(_s: VerificationProvider["status"]) { return "border-white/12 bg-white/[0.05] text-white/72"; }
function stateText(status: "blocked" | "ready" | "live" | "pending" | "verified" | "failed") {
  return status === "blocked" || status === "failed" ? "text-white/46" : status === "ready" || status === "live" || status === "verified" ? "text-white/88" : "text-white/62";
}
function verificationLabel(status: VerificationProvider["status"]) {
  return status === "verified" ? "verified" : status === "submitted" || status === "pending" ? "processing" : status === "disabled" ? "needs setup" : status === "failed" ? "attention" : "waiting";
}
function trimMessage(value: string) { return value.length > 320 ? `${value.slice(0, 317)}...` : value; }
function describeValue(value: unknown) { return typeof value === "bigint" ? value.toString() : typeof value === "string" ? value : JSON.stringify(value); }
function missingDependenciesFor(key: DeploymentContractKey, deployments: Deployments) {
  return deploymentGuides[key].dependsOn.filter((dep) => !deployments[dep].address);
}
function stepStatusFor(key: DeploymentContractKey, ready: boolean, deployments: Deployments) {
  if (deployments[key].address) return "live";
  if (!ready) return "needs-input";
  if (missingDependenciesFor(key, deployments).length) return "dependency";
  return "ready";
}
function downloadText(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-xl border border-white/14 bg-black/90 px-3 py-2 text-[11px] leading-5 text-white/82 shadow-xl backdrop-blur-xl">
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black/90" />
        </span>
      )}
    </span>
  );
}

function Field({ label, value, onChange, placeholder, tooltip }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; tooltip?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="flex items-center gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.24em] text-white/48">{label}</span>
        {tooltip && (
          <Tooltip text={tooltip}>
            <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-white/20 text-[9px] text-white/46 hover:border-white/40 hover:text-white/70">?</span>
          </Tooltip>
        )}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/24 focus:border-white/35"
      />
    </label>
  );
}

function LinkOut({ href, label }: { href?: string; label: string }) {
  if (!href) return <span className="text-white/40">{label}</span>;
  return <a href={href} target="_blank" rel="noreferrer" className="text-white/76 hover:text-white">{label}</a>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OwnerContractsPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(emptySession);
  const [serverStatus, setServerStatus] = useState(emptyStatus);
  const [mode, setMode] = useState<"wallet" | "server">("wallet");
  const [selectedChainId, setSelectedChainId] = useState<DeploymentChainId>(baseSepolia.id);
  const [feedback, setFeedback] = useState("");
  const [deployments, setDeployments] = useState<Deployments>(emptyDeployments);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [deployTrack, setDeployTrack] = useState<DeployTrack>("artwork");

  // ── Artwork track forms ──
  const [seasonRegistryForm, setSeasonRegistryForm] = useState({
    admin: "", seasonId: "1", seasonName: "AXIS Season 1",
  });
  const [episodeForm, setEpisodeForm] = useState({
    admin: "", name: "", symbol: "", seasonId: "1", episodeNumber: "1",
    baseUri: "", contractMetadataUri: "",
  });

  // ── Legacy track forms ──
  const [ownerAccessForm, setOwnerAccessForm] = useState({
    adminAddress: "", initialMinterAddress: "",
    baseUri: "ipfs://spectra-owner-access/{id}.json",
    contractMetadataUri: "ipfs://spectra-owner-access/contract.json",
  });
  const [submissionAdmin, setSubmissionAdmin] = useState("");
  const [founderForm, setFounderForm] = useState({
    adminAddress: "", submissionRegistryAddress: "",
    baseUri: defaultFounderBaseUri, contractMetadataUri: defaultFounderContractMetadataUri, maxSupply: "333",
  });
  const [eventAdmin, setEventAdmin] = useState("");
  const [opsForm, setOpsForm] = useState({
    contractAddress: "", recipient: "", role: "owner", tokenId: "", amount: "1",
    revokeAccount: "", revokeTokenId: "2", revokeAmount: "1",
    roleAction: "grant", contractRole: "MINTER_ROLE", roleAccount: "",
  });

  const [pendingDeployment, setPendingDeployment] = useState<PendingDeployment | null>(null);
  const [verifyingKey, setVerifyingKey] = useState<DeploymentContractKey | null>(null);
  const [artworkStepIndex, setArtworkStepIndex] = useState(0);
  const [legacyStepIndex, setLegacyStepIndex] = useState(0);
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>("launch");
  const [launchWizardStep, setLaunchWizardStep] = useState<1 | 2 | 3>(1);
  const [zoraSyncing, setZoraSyncing] = useState(false);
  const [zoraSyncSummary, setZoraSyncSummary] = useState<string>("");
  const [zoraSyncResults, setZoraSyncResults] = useState<ZoraSyncResult[]>([]);
  const [appOrigin, setAppOrigin] = useState("https://axis.show");
  const [paymasterAddress, setPaymasterAddress] = useState("");
  const [managedCatalog, setManagedCatalog] = useState<EpisodeCollectiblesCatalog | null>(null);
  const [managedEpisodeSlug, setManagedEpisodeSlug] = useState("");
  const [managedBaseUri, setManagedBaseUri] = useState("");
  const [managedContractMetadataUri, setManagedContractMetadataUri] = useState("");
  const [managedTokenId, setManagedTokenId] = useState("1");
  const [managedTokenUri, setManagedTokenUri] = useState("");
  const [registerTokenId, setRegisterTokenId] = useState("1");
  const [registerTokenName, setRegisterTokenName] = useState("");
  const [registerTokenUri, setRegisterTokenUri] = useState("");
  const [registerTokenMaxSupply, setRegisterTokenMaxSupply] = useState("0");
  const [registerTokenOpenMint, setRegisterTokenOpenMint] = useState(false);
  const [selectedEpisodeSlot, setSelectedEpisodeSlot] = useState<string>(
    episodeCatalog.find((episode) => episode.status === "locked")?.slug
    ?? episodeCatalog.find((episode) => episode.status === "open")?.slug
    ?? episodeCatalog[0]?.slug
    ?? "episode-1",
  );

  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { deployContractAsync, isPending: isDeploying } = useDeployContract();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const deployReceipt = useWaitForTransactionReceipt({ hash: pendingDeployment?.txHash });

  // ── Derived state ──
  const artworkDeployedCount = useMemo(() => artworkDeploymentSteps.filter((k) => Boolean(deployments[k].address)).length, [deployments]);
  const legacyDeployedCount = useMemo(() => legacyDeploymentSteps.filter((k) => Boolean(deployments[k].address)).length, [deployments]);
  const totalDeployedCount = artworkDeployedCount + legacyDeployedCount;
  const verifiedCount = useMemo(() => [...artworkDeploymentSteps, ...legacyDeploymentSteps].filter((k) => deployments[k].verification.basescan.status === "verified" || deployments[k].verification.blockscout.status === "verified").length, [deployments]);
  const artworkStackReady = artworkDeployedCount === artworkDeploymentSteps.length;
  const hasSavedProgress = totalDeployedCount > 0 || activity.length > 0;
  const selectedEpisodeRecord = useMemo(
    () => episodeCatalog.find((entry) => entry.slug === selectedEpisodeSlot) ?? null,
    [selectedEpisodeSlot],
  );

  // Readiness per step
  const seasonRegistryReady = valid(seasonRegistryForm.admin) && Boolean(seasonRegistryForm.seasonId.trim()) && Boolean(seasonRegistryForm.seasonName.trim());
  const episodeReady = valid(episodeForm.admin) && Boolean(episodeForm.name.trim()) && Boolean(episodeForm.symbol.trim()) && Boolean(episodeForm.seasonId.trim()) && Boolean(episodeForm.episodeNumber.trim()) && Boolean(episodeForm.baseUri.trim()) && Boolean(episodeForm.contractMetadataUri.trim());
  const ownerReady = valid(ownerAccessForm.adminAddress) && Boolean(ownerAccessForm.baseUri.trim()) && Boolean(ownerAccessForm.contractMetadataUri.trim());
  const submissionReady = valid(submissionAdmin);
  const founderReady = valid(founderForm.adminAddress) && valid(founderForm.submissionRegistryAddress) && Boolean(founderForm.baseUri.trim()) && Boolean(founderForm.contractMetadataUri.trim()) && Boolean(founderForm.maxSupply.trim());
  const eventReady = valid(eventAdmin);
  const founderLinkReady = Boolean(deployments.founderMembership.address && (founderForm.submissionRegistryAddress || deployments.submissionRegistry.address));
  const episodeMissingFields = useMemo(() => {
    const missing: string[] = [];
    if (!valid(episodeForm.admin)) missing.push("admin wallet");
    if (!episodeForm.name.trim()) missing.push("episode name");
    if (!episodeForm.symbol.trim()) missing.push("short code");
    if (!episodeForm.seasonId.trim()) missing.push("season number");
    if (!episodeForm.episodeNumber.trim()) missing.push("episode slot");
    if (!episodeForm.baseUri.trim()) missing.push("starter metadata link");
    if (!episodeForm.contractMetadataUri.trim()) missing.push("master metadata link");
    return missing;
  }, [episodeForm]);

  // Env previews
  const artworkEnvPreview = useMemo(() => [
    `SPECTRA_SEASON_REGISTRY_ADDRESS=${deployments.seasonRegistry.address}`,
    `SPECTRA_EPISODE_CONTRACT_ADDRESS=${deployments.episodeContract.address}`,
  ].join("\n"), [deployments]);
  const bootstrapEnvPreview = useMemo(() => [
    "EPISODES_ADMIN_SESSION_SECRET=<set-a-long-random-secret>",
    "EPISODES_OWNER_ERC1155_ADDRESS=",
    "EPISODES_OWNER_ERC1155_TOKEN_ID=",
    "EPISODES_OWNER_RPC_URL=",
    "EPISODES_OWNER_ALLOWLIST=",
  ].join("\n"), []);
  const tokenGatedEnvPreview = useMemo(() => [
    "EPISODES_ADMIN_SESSION_SECRET=<keep-your-existing-secret>",
    `EPISODES_OWNER_ERC1155_ADDRESS=${deployments.ownerAccess.address}`,
    "EPISODES_OWNER_ERC1155_TOKEN_ID=1,2",
    `EPISODES_OWNER_RPC_URL=<rpc-url-for-${deploymentChainMeta[selectedChainId].shortLabel.toLowerCase()}>`,
    "EPISODES_OWNER_ALLOWLIST=",
  ].join("\n"), [deployments.ownerAccess.address, selectedChainId]);
  const legacyEnvPreview = useMemo(() => [
    `OWNER_ACCESS_CONTRACT_ADDRESS=${deployments.ownerAccess.address}`,
    `SPECTRA_SUBMISSION_REGISTRY_ADDRESS=${deployments.submissionRegistry.address}`,
    `SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS=${deployments.founderMembership.address}`,
    `SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS=${deployments.eventRegistry.address}`,
  ].join("\n"), [deployments]);
  const paymasterEnvPreview = useMemo(() => [
    "NEXT_PUBLIC_PAYMASTER_URL=/api/paymaster",
    "CDP_PAYMASTER_URL=",
    `NEXT_PUBLIC_PAYMASTER_CONTRACT_ADDRESS=${paymasterAddress}`,
  ].join("\n"), [paymasterAddress]);
  const isBootstrapSession = Boolean(session.bootstrapOnly || session.subject?.startsWith("bootstrap:"));
  const managedEpisodes = useMemo(
    () => (managedCatalog?.episodes ?? []).filter((episode) => episode.contractAddress),
    [managedCatalog],
  );
  const managedEpisode = useMemo(
    () => managedEpisodes.find((episode) => episode.slug === managedEpisodeSlug) ?? managedEpisodes[0] ?? null,
    [managedEpisodeSlug, managedEpisodes],
  );

  // ── State helpers ──
  function push(text: string, toneValue: Activity["tone"] = "info") {
    const message = trimMessage(text);
    setFeedback(message);
    setActivity((current) => [{ id: `${Date.now()}-${Math.random()}`, tone: toneValue, text: message }, ...current].slice(0, 50));
  }
  function patchDeployment(key: DeploymentContractKey, value: Partial<DeploymentRecord>) {
    setDeployments((current) => ({ ...current, [key]: { ...current[key], ...value, verification: value.verification ? value.verification : current[key].verification } }));
  }
  async function ensureWalletChain() {
    if (!isConnected) throw new Error("Connect a wallet first.");
    if (currentChainId !== selectedChainId) await switchChainAsync({ chainId: selectedChainId as never });
  }
  async function copyBlock(label: string, content: string) {
    try { await navigator.clipboard.writeText(content); push(`${label} copied.`, "success"); }
    catch { push(`Could not copy ${label.toLowerCase()}.`, "danger"); }
  }
  function downloadAbiFor(key: DeploymentContractKey) {
    const artifact = deploymentArtifacts[key as keyof typeof deploymentArtifacts];
    if (!artifact?.abi?.length) {
      push(`${deploymentLabels[key]} ABI is not available yet. Compile contracts first.`, "warning");
      return;
    }
    downloadText(`${key}.abi.json`, `${JSON.stringify(artifact.abi, null, 2)}\n`, "application/json");
    push(`${deploymentLabels[key]} ABI downloaded.`, "success");
  }
  async function copyAbiFor(key: DeploymentContractKey) {
    const artifact = deploymentArtifacts[key as keyof typeof deploymentArtifacts];
    if (!artifact?.abi?.length) {
      push(`${deploymentLabels[key]} ABI is not available yet. Compile contracts first.`, "warning");
      return;
    }
    await copyBlock(`${deploymentLabels[key]} ABI`, JSON.stringify(artifact.abi, null, 2));
  }
  function applyEpisodeSlot(slug: string) {
    const episode = episodeCatalog.find((entry) => entry.slug === slug);
    if (!episode) return;
    setSelectedEpisodeSlot(slug);
    setLaunchWizardStep(2);
    setEpisodeForm((current) => ({
      ...current,
      admin: current.admin || seasonRegistryForm.admin || serverStatus.defaults.adminAddress || address || "",
      name: episode.title,
      symbol: `AXIS-EP${episode.id}`,
      seasonId: current.seasonId || seasonRegistryForm.seasonId || String(episode.season),
      episodeNumber: String(episode.id),
      baseUri: `${appOrigin}/api/arapp/collect/${episode.slug}/metadata`,
      contractMetadataUri: `${appOrigin}/api/episodes/${episode.slug}/metadata`,
    }));
    push(`${episode.shortTitle} loaded into the deploy form. You can deploy this slot or re-deploy it if needed.`, "success");
  }
  function applyEpisodeStarterLinks() {
    const episodeSlug = `episode-${episodeForm.episodeNumber || "1"}`;
    setEpisodeForm((current) => ({
      ...current,
      baseUri: `${appOrigin}/api/arapp/collect/${episodeSlug}/metadata`,
      contractMetadataUri: `${appOrigin}/api/episodes/${episodeSlug}/metadata`,
    }));
    push("Starter metadata links added. You can deploy now and replace them later after Grove uploads.", "success");
  }

  async function refreshManagedCatalog() {
    const response = await fetch("/api/admin/collectibles", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load live episode contracts.");
    }

    const data = (await response.json()) as EpisodeCollectiblesCatalog;
    setManagedCatalog(data);
    setManagedEpisodeSlug((current) => current || data.episodes.find((episode) => episode.contractAddress)?.slug || "");
  }

  async function saveManagedEpisode(nextEpisode: EpisodeCollectibleRecord, successMessage: string) {
    const response = await fetch("/api/admin/collectibles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episode: nextEpisode }),
    });
    const data = (await response.json()) as { episode?: EpisodeCollectibleRecord; episodes?: EpisodeCollectibleRecord[]; error?: string };
    if (!response.ok || !data.episode || !data.episodes) {
      throw new Error(data.error || "Failed to save episode contract state.");
    }
    setManagedCatalog((current) => current ? { ...current, episodes: data.episodes ?? current.episodes } : null);
    push(successMessage, "success");
  }

  async function updateManagedClaimOpen(open: boolean) {
    if (!managedEpisode) {
      return push("Pick a deployed episode first.", "warning");
    }
    try {
      await saveManagedEpisode({ ...managedEpisode, claimOpen: open }, open ? "Site claim opened for this episode." : "Site claim closed for this episode.");
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed to update site claim state.", "danger");
    }
  }

  async function runEpisodeContractWrite(
    actionLabel: string,
    functionName: "pause" | "unpause" | "setOpenMint" | "setBaseUri" | "setTokenUri" | "setContractMetadataUri" | "registerArtwork",
    args: unknown[],
  ) {
    if (!managedEpisode?.contractAddress) {
      return push("Pick a deployed episode contract first.", "warning");
    }

    try {
      await ensureWalletChain();
      const hash = await writeContractAsync({
        address: normalizeAddress(managedEpisode.contractAddress, "Episode contract"),
        abi: deploymentArtifacts.episodeContract.abi,
        chainId: selectedChainId as never,
        functionName,
        args,
        gas: 250000n,
      });
      push(`${actionLabel} submitted. ${short(hash, 10, 8)}`, "success");
    } catch (error) {
      push(error instanceof Error ? error.message : `${actionLabel} failed.`, "danger");
    }
  }

  function autofillRegisterTokenFromSavedToken(tokenIdValue: string) {
    if (!managedEpisode) {
      return;
    }

    const tokenIdNumber = Number(tokenIdValue);
    const savedToken = managedEpisode.tokens.find((token) => token.tokenId === tokenIdNumber);
    const fallbackUri = managedEpisode.baseUri?.trim()
      ? `${managedEpisode.baseUri.replace(/\/$/, "")}/${tokenIdValue}.json`
      : "";

    setRegisterTokenId(tokenIdValue);
    setRegisterTokenName(savedToken?.metadata.name || "");
    setRegisterTokenUri(savedToken?.metadata.external_url ? fallbackUri || savedToken.metadata.external_url : fallbackUri);
    setRegisterTokenMaxSupply(savedToken?.remaining ? String(savedToken.remaining) : "0");
    setRegisterTokenOpenMint(savedToken ? savedToken.status === "live" || savedToken.status === "member-access" : false);
  }

  // ── Constructor args ──
  function constructorArgsFor(key: DeploymentContractKey): unknown[] {
    if (key === "seasonRegistry") return [
      normalizeAddress(seasonRegistryForm.admin, "Admin"),
      normalizePositiveBigInt(seasonRegistryForm.seasonId, "Season ID"),
      seasonRegistryForm.seasonName.trim(),
    ];
    if (key === "episodeContract") return [
      normalizeAddress(episodeForm.admin, "Admin"),
      episodeForm.name.trim(),
      episodeForm.symbol.trim(),
      normalizePositiveBigInt(episodeForm.seasonId, "Season ID"),
      normalizePositiveBigInt(episodeForm.episodeNumber, "Episode number"),
      episodeForm.baseUri.trim(),
      episodeForm.contractMetadataUri.trim(),
    ];
    if (key === "ownerAccess") return [
      normalizeAddress(ownerAccessForm.adminAddress, "Owner access admin"),
      ownerAccessForm.initialMinterAddress.trim() ? normalizeAddress(ownerAccessForm.initialMinterAddress, "Initial minter") : normalizeAddress(address || ownerAccessForm.adminAddress, "Signer"),
      ownerAccessForm.baseUri.trim(),
      ownerAccessForm.contractMetadataUri.trim(),
    ];
    if (key === "submissionRegistry") return [normalizeAddress(submissionAdmin, "Submission registry admin")];
    if (key === "founderMembership") return [
      normalizeAddress(founderForm.adminAddress, "Founder membership admin"),
      normalizeAddress(founderForm.submissionRegistryAddress, "Submission registry"),
      founderForm.baseUri.trim(),
      founderForm.contractMetadataUri.trim(),
      normalizePositiveBigInt(founderForm.maxSupply, "Max supply"),
    ];
    return [normalizeAddress(eventAdmin, "Event registry admin")];
  }

  // ── Auto-copy env after deploy ──
  async function autoCopyEnvAfterDeploy(key: DeploymentContractKey, addr: string) {
    const lines: string[] = [];
    if (key === "seasonRegistry") lines.push(`SPECTRA_SEASON_REGISTRY_ADDRESS=${addr}`);
    else if (key === "episodeContract") lines.push(`SPECTRA_EPISODE_CONTRACT_ADDRESS=${addr}`);
    else if (key === "ownerAccess") {
      lines.push(`OWNER_ACCESS_CONTRACT_ADDRESS=${addr}`);
      lines.push(`EPISODES_OWNER_ERC1155_ADDRESS=${addr}`);
      lines.push(`EPISODES_OWNER_ERC1155_TOKEN_ID=1,2`);
    } else if (key === "submissionRegistry") lines.push(`SPECTRA_SUBMISSION_REGISTRY_ADDRESS=${addr}`);
    else if (key === "founderMembership") lines.push(`SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS=${addr}`);
    else lines.push(`SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS=${addr}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      push(`Env vars for ${deploymentLabels[key]} auto-copied to clipboard.`, "success");
    } catch { /* silent */ }
  }

  // ── Save manifest ──
  async function saveManifest() {
    try {
      const payload = {
        chain: deployments.seasonRegistry.chainId
          ? { id: deployments.seasonRegistry.chainId, ...deploymentChainMeta[deployments.seasonRegistry.chainId as keyof typeof deploymentChainMeta] }
          : { id: selectedChainId, ...deploymentChainMeta[selectedChainId] },
        contracts: Object.fromEntries(
          [...artworkDeploymentSteps, ...legacyDeploymentSteps].map((k) => [k, {
            address: deployments[k].address,
            txHash: deployments[k].txHash,
            deployedAt: deployments[k].deployedAt,
            chainId: deployments[k].chainId,
          }]),
        ),
      };
      const response = await fetch("/api/admin/contracts/manifest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save manifest.");
      push(`deployments.json saved. Run \`npm run env:sync\` to patch .env.`, "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed to save manifest.", "danger");
    }
  }

  async function syncArtistZoraData(slugs?: string[]) {
    try {
      setZoraSyncing(true);
      const runs: ZoraSyncResult[] = [];

      if (slugs?.length) {
        for (const slug of slugs) {
          const response = await fetch("/api/admin/artists/zora-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });
          const data = await response.json();
          if (!response.ok) {
            runs.push({
              slug,
              identifier: "",
              status: "failed",
              message: data.error || "Failed to sync artist.",
            });
            continue;
          }
          if (Array.isArray(data.results)) {
            runs.push(...data.results);
          }
        }
      } else {
        const response = await fetch("/api/admin/artists/zora-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scope: "all" }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to sync Zora artist data.");
        }
        if (Array.isArray(data.results)) {
          runs.push(...data.results);
        }
      }

      const synced = runs.filter((item) => item.status === "synced").length;
      const failed = runs.filter((item) => item.status === "failed").length;
      const summary = `${synced} synced, ${failed} failed.`;
      setZoraSyncSummary(summary);
      setZoraSyncResults(runs);
      push(`Artist Zora sync complete. ${summary}`, failed ? "warning" : "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sync Zora artist data.";
      setZoraSyncSummary(message);
      push(message, "danger");
    } finally {
      setZoraSyncing(false);
    }
  }

  async function retryFailedZoraSyncs() {
    const failedSlugs = zoraSyncResults
      .filter((item) => item.status === "failed")
      .map((item) => item.slug);

    if (!failedSlugs.length) {
      push("No failed Zora sync items to retry.", "warning");
      return;
    }

    await syncArtistZoraData(failedSlugs);
  }

  // ── Verification ──
  async function verifyDeployment(key: DeploymentContractKey, addressValue?: string, constructorArgs?: unknown[], chainIdOverride?: DeploymentChainId) {
    const record = deployments[key];
    const verifyAddress = addressValue || record.address;
    const args = constructorArgs || record.constructorArgs;
    const chainId = chainIdOverride || record.chainId;
    if (!verifyAddress || !chainId || !args.length) return push(`${deploymentLabels[key]} is missing deployment metadata for verification.`, "warning");
    setVerifyingKey(key);
    patchDeployment(key, { verification: { basescan: { status: "pending", message: "Submitting to BaseScan..." }, blockscout: { status: "pending", message: "Submitting to Blockscout..." } } });
    try {
      const response = await fetch("/api/admin/contracts/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address: verifyAddress, chainId, contractKey: key, constructorArgs: args }, storageReplacer) });
      const data = await response.json();
      if (!response.ok || !data.results) throw new Error(data.error || "Verification failed.");
      patchDeployment(key, { verification: data.results });
      push(`${deploymentLabels[key]} verification ${data.results.basescan.status} / ${data.results.blockscout.status}.`, data.results.basescan.status === "verified" || data.results.blockscout.status === "verified" ? "success" : "info");
    } catch (error) {
      patchDeployment(key, { verification: { basescan: { status: "failed", message: error instanceof Error ? error.message : "Verification failed." }, blockscout: { status: "failed", message: error instanceof Error ? error.message : "Verification failed." } } });
      push(error instanceof Error ? error.message : "Verification failed.", "danger");
    } finally {
      setVerifyingKey(null);
    }
  }

  // ── Deploy ──
  async function deployStep(key: DeploymentContractKey) {
    try {
      if (mode === "server") {
        if (key !== "ownerAccess") return push("Server mode only supports Owner Access. Use wallet mode for all other contracts.", "warning");
        await handleServerAction({ action: "deploy", adminAddress: ownerAccessForm.adminAddress, initialMinterAddress: ownerAccessForm.initialMinterAddress, baseUri: ownerAccessForm.baseUri, contractMetadataUri: ownerAccessForm.contractMetadataUri });
        return;
      }
      const missingDeps = missingDependenciesFor(key, deployments);
      if (missingDeps.length) push(`Deploying ${deploymentLabels[key]} before ${missingDeps.map((d) => deploymentLabels[d]).join(", ")}. Make sure you want that order.`, "warning");
      await ensureWalletChain();
      const constructorArgs = constructorArgsFor(key);
      const artifact = deploymentArtifacts[key as keyof typeof deploymentArtifacts];
      if (!artifact?.abi?.length) {
        return push(`${deploymentLabels[key]} artifact not found. Run \`npm run contracts:compile\` first.`, "danger");
      }
      const hash = await deployContractAsync({
        abi: artifact.abi,
        bytecode: artifact.bytecode as `0x${string}`,
        chainId: selectedChainId as never,
        args: constructorArgs,
      });
      setPendingDeployment({ key, txHash: hash, constructorArgs });
      patchDeployment(key, { txHash: hash, chainId: selectedChainId, constructorArgs });
      push(`${deploymentLabels[key]} deployment submitted. ${short(hash, 10, 8)}`, "info");
    } catch (error) {
      push(error instanceof Error ? error.message : "Deployment failed.", "danger");
    }
  }

  // ── Server action ──
  async function handleServerAction(payload: Record<string, string>) {
    const response = await fetch("/api/admin/contracts/owner-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Server action failed.");
    if (data.contractAddress) {
      const contractAddress = getAddress(data.contractAddress);
      const constructorArgs = constructorArgsFor("ownerAccess");
      patchDeployment("ownerAccess", { address: contractAddress, txHash: data.transactionHash || "", chainId: selectedChainId, deployedAt: new Date().toISOString(), constructorArgs, verification: { basescan: { status: "pending", message: "Queued." }, blockscout: { status: "pending", message: "Queued." } } });
      setOpsForm((c) => ({ ...c, contractAddress }));
      void verifyDeployment("ownerAccess", contractAddress, constructorArgs, selectedChainId);
      void autoCopyEnvAfterDeploy("ownerAccess", contractAddress);
    }
    push(`${data.summary || "Completed."}${data.transactionHash ? ` ${short(data.transactionHash, 10, 8)}` : ""}`, "success");
  }

  // ── Link founder ──
  async function linkFounderMembership() {
    try {
      await ensureWalletChain();
      const hash = await writeContractAsync({
        address: normalizeAddress(founderForm.submissionRegistryAddress || deployments.submissionRegistry.address, "Submission registry"),
        abi: deploymentArtifacts.submissionRegistry.abi,
        chainId: selectedChainId as never,
        functionName: "setFounderMembershipContract",
        args: [normalizeAddress(deployments.founderMembership.address, "Founder membership")],
      });
      push(`Founder membership linked: ${short(hash, 10, 8)}`, "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "Linking failed.", "danger");
    }
  }

  // ── Owner access ops ──
  async function handleOwnerAccessAction(kind: "mint" | "revoke" | "role") {
    try {
      if (mode === "wallet") {
        await ensureWalletChain();
        if (kind === "mint") {
          const contractAddress = normalizeAddress(opsForm.contractAddress, "Contract address");
          const recipient = normalizeAddress(opsForm.recipient, "Recipient");
          const role = normalizeOwnerAccessPresetRole(opsForm.role);
          const hash = role === "owner" ? await writeContractAsync({ address: contractAddress, abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: "mintOwner", args: [recipient] })
            : role === "admin" ? await writeContractAsync({ address: contractAddress, abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: "mintAdmin", args: [recipient] })
            : role === "aiagent" ? await writeContractAsync({ address: contractAddress, abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: "mintAiAgent", args: [recipient] })
            : await writeContractAsync({ address: contractAddress, abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: "mint", args: [recipient, normalizePositiveBigInt(opsForm.tokenId, "Token ID"), normalizePositiveBigInt(opsForm.amount, "Amount")] });
          return push(`Access key mint submitted: ${short(hash, 10, 8)}`, "success");
        }
        if (kind === "revoke") {
          const hash = await writeContractAsync({ address: normalizeAddress(opsForm.contractAddress, "Contract address"), abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: "revoke", args: [normalizeAddress(opsForm.revokeAccount, "Wallet to revoke"), normalizePositiveBigInt(opsForm.revokeTokenId, "Token ID"), normalizePositiveBigInt(opsForm.revokeAmount, "Amount")] });
          return push(`Access key revoke submitted: ${short(hash, 10, 8)}`, "warning");
        }
        const contractRole = normalizeOwnerAccessContractRoleName(opsForm.contractRole);
        const hash = await writeContractAsync({ address: normalizeAddress(opsForm.contractAddress, "Contract address"), abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: opsForm.roleAction === "grant" ? "grantRole" : "revokeRole", args: [OWNER_ACCESS_CONTRACT_ROLES[contractRole], normalizeAddress(opsForm.roleAccount, "Role account")] });
        return push(`Role action submitted: ${short(hash, 10, 8)}`, "info");
      }
      if (kind === "mint") return await handleServerAction({ action: "mint", contractAddress: opsForm.contractAddress, recipient: opsForm.recipient, role: opsForm.role, tokenId: opsForm.tokenId, amount: opsForm.amount });
      if (kind === "revoke") return await handleServerAction({ action: "revoke", contractAddress: opsForm.contractAddress, account: opsForm.revokeAccount, tokenId: opsForm.revokeTokenId, amount: opsForm.revokeAmount });
      return await handleServerAction({ action: "role", contractAddress: opsForm.contractAddress, roleAction: opsForm.roleAction, contractRole: opsForm.contractRole, account: opsForm.roleAccount });
    } catch (error) {
      push(error instanceof Error ? error.message : "Owner access action failed.", "danger");
    }
  }

  // ── Auth ──
  async function handleWalletLogin() {
    if (!address) return push("Connect a wallet first.", "warning");
    const challengeResponse = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "challenge", address }) });
    const challengeData = await challengeResponse.json();
    if (!challengeResponse.ok || !challengeData.message) return push(challengeData.error || "Failed to create wallet challenge.", "danger");
    const signature = await signMessageAsync({ message: challengeData.message });
    const verifyResponse = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "wallet", address, signature }) });
    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok) return push(verifyData.error || "Wallet sign-in failed.", "danger");
    setSession((c) => ({ ...c, authenticated: true, subject: `wallet:${address}` }));
    push("Wallet verified. Deployment HQ unlocked.", "success");
  }

  // ── Reset ──
  function resetDeploymentWorkspace() {
    if (typeof window !== "undefined") window.localStorage.removeItem(storageKey);
    setDeployments(emptyDeployments());
    setActivity([]);
    setPendingDeployment(null);
    setVerifyingKey(null);
    setFeedback("");
    setArtworkStepIndex(0);
    setLegacyStepIndex(0);
    setLaunchWizardStep(1);
    setWorkflowStage("launch");
    const d = serverStatus.defaults;
    setSeasonRegistryForm({ admin: d.adminAddress || "", seasonId: "1", seasonName: "AXIS Season 1" });
    setEpisodeForm({ admin: d.adminAddress || "", name: "", symbol: "", seasonId: "1", episodeNumber: "1", baseUri: "", contractMetadataUri: "" });
    setOwnerAccessForm({ adminAddress: d.adminAddress || "", initialMinterAddress: d.initialMinterAddress || "", baseUri: d.baseUri || "ipfs://spectra-owner-access/{id}.json", contractMetadataUri: d.contractMetadataUri || "ipfs://spectra-owner-access/contract.json" });
    setSubmissionAdmin(d.adminAddress || "");
    setFounderForm({ adminAddress: d.adminAddress || "", submissionRegistryAddress: "", baseUri: defaultFounderBaseUri, contractMetadataUri: defaultFounderContractMetadataUri, maxSupply: "333" });
    setEventAdmin(d.adminAddress || "");
    setOpsForm({ contractAddress: d.contractAddress || "", recipient: "", role: "owner", tokenId: "", amount: "1", revokeAccount: "", revokeTokenId: "2", revokeAmount: "1", roleAction: "grant", contractRole: "MINTER_ROLE", roleAccount: "" });
    push("Saved deployment cache cleared. HQ is back at zero.", "warning");
  }

  // ── Effects ──
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const stored = JSON.parse(raw, storageReviver) as {
        deployments?: Deployments; seasonRegistryForm?: typeof seasonRegistryForm;
        episodeForm?: typeof episodeForm; ownerAccessForm?: typeof ownerAccessForm;
        submissionAdmin?: string; founderForm?: typeof founderForm;
        eventAdmin?: string; activity?: Activity[];
      };
      if (stored.deployments) setDeployments({ ...emptyDeployments(), ...stored.deployments });
      if (stored.seasonRegistryForm) setSeasonRegistryForm((c) => ({ ...c, ...stored.seasonRegistryForm }));
      if (stored.episodeForm) setEpisodeForm((c) => ({ ...c, ...stored.episodeForm }));
      if (stored.ownerAccessForm) setOwnerAccessForm((c) => ({ ...c, ...stored.ownerAccessForm }));
      if (typeof stored.submissionAdmin === "string") setSubmissionAdmin(stored.submissionAdmin);
      if (stored.founderForm) setFounderForm((c) => ({ ...c, ...stored.founderForm }));
      if (typeof stored.eventAdmin === "string") setEventAdmin(stored.eventAdmin);
      if (typeof stored.paymasterAddress === "string") setPaymasterAddress(stored.paymasterAddress);
      if (stored.activity) setActivity(stored.activity);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
      const browserOrigin = window.location.origin;
      const hostname = window.location.hostname.toLowerCase();
      const preferredOrigin =
        envSiteUrl
        || (hostname === "localhost" || hostname === "127.0.0.1" ? "https://axis.show" : browserOrigin);
      setAppOrigin(preferredOrigin.replace(/\/$/, ""));
    }
  }, []);

  useEffect(() => {
    const targetSlug = `episode-${episodeForm.episodeNumber || "1"}`;
    if (episodeCatalog.some((entry) => entry.slug === targetSlug)) {
      setSelectedEpisodeSlot(targetSlug);
    }
  }, [episodeForm.episodeNumber]);

  useEffect(() => {
    if (deployments.episodeContract.address) {
      setLaunchWizardStep(3);
      return;
    }

    if (selectedEpisodeSlot) {
      setLaunchWizardStep((current) => (current < 2 ? 2 : current));
    }
  }, [deployments.episodeContract.address, selectedEpisodeSlot]);

  useEffect(() => {
    setEpisodeForm((current) => ({
      ...current,
      admin: current.admin || seasonRegistryForm.admin || serverStatus.defaults.adminAddress || "",
      seasonId: current.seasonId || seasonRegistryForm.seasonId || "1",
    }));
  }, [seasonRegistryForm.admin, seasonRegistryForm.seasonId, serverStatus.defaults.adminAddress]);

  useEffect(() => {
    if (!selectedEpisodeRecord) {
      return;
    }

    setEpisodeForm((current) => ({
      ...current,
      name: current.name || selectedEpisodeRecord.title,
      symbol: current.symbol || `AXIS-EP${selectedEpisodeRecord.id}`,
      seasonId: current.seasonId || String(selectedEpisodeRecord.season),
      episodeNumber: current.episodeNumber || String(selectedEpisodeRecord.id),
      baseUri: current.baseUri || `${appOrigin}/api/arapp/collect/${selectedEpisodeRecord.slug}/metadata`,
      contractMetadataUri: current.contractMetadataUri || `${appOrigin}/api/episodes/${selectedEpisodeRecord.slug}/metadata`,
    }));
  }, [appOrigin, selectedEpisodeRecord]);

  useEffect(() => {
    const section = searchParams.get("section");

    if (section === "launch") {
      setWorkflowStage("launch");
      return;
    }

    if (section === "artists") {
      setWorkflowStage("artists");
      return;
    }

    if (section === "permissions") {
      setWorkflowStage("permissions");
      return;
    }

    if (section === "collectibles") {
      setWorkflowStage("collectibles");
      return;
    }

    if (section === "episodes") {
      setWorkflowStage("episodes");
      return;
    }

    if (section === "handoff") {
      setWorkflowStage("handoff");
      return;
    }

    if (section === "legacy") {
      setWorkflowStage("legacy");
      setDeployTrack("legacy");
      return;
    }

    if (section === "artwork") {
      setWorkflowStage("artwork");
      setDeployTrack("artwork");
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify({ deployments, seasonRegistryForm, episodeForm, ownerAccessForm, submissionAdmin, founderForm, eventAdmin, paymasterAddress, activity }, storageReplacer));
  }, [activity, deployments, seasonRegistryForm, episodeForm, ownerAccessForm, submissionAdmin, founderForm, eventAdmin, paymasterAddress]);

  useEffect(() => {
    void fetch("/api/admin/session", { cache: "no-store" }).then(async (r) => {
      if (!r.ok) throw new Error("Failed to load session.");
      setSession((await r.json()) as SessionState);
    }).catch((e) => push(e instanceof Error ? e.message : "Failed to load session.", "danger"));
  }, []);

  useEffect(() => {
    if (!session.authenticated) {
      return;
    }

    void refreshManagedCatalog().catch((error) => {
      push(error instanceof Error ? error.message : "Failed to load live episode contracts.", "danger");
    });
  }, [session.authenticated]);

  useEffect(() => {
    if (!managedEpisode) {
      return;
    }

    setManagedEpisodeSlug(managedEpisode.slug);
    setManagedBaseUri(managedEpisode.baseUri || "");
    setManagedContractMetadataUri(managedEpisode.collectionMetadataUri || "");
    setManagedTokenId(String(managedEpisode.tokens[0]?.tokenId || 1));
    setManagedTokenUri("");
    autofillRegisterTokenFromSavedToken(String(managedEpisode.tokens[0]?.tokenId || 1));
  }, [managedEpisode]);

  useEffect(() => {
    if (!session.authenticated) return;
    void fetch("/api/admin/contracts/owner-access", { cache: "no-store" }).then(async (r) => {
      if (!r.ok) throw new Error("Failed to load server config.");
      const data = (await r.json()) as ServerStatus;
      setServerStatus(data);
      const d = data.defaults;
      setSeasonRegistryForm((c) => ({ ...c, admin: c.admin || d.adminAddress }));
      setEpisodeForm((c) => ({ ...c, admin: c.admin || d.adminAddress }));
      setOwnerAccessForm((c) => ({ ...c, adminAddress: c.adminAddress || d.adminAddress, initialMinterAddress: c.initialMinterAddress || d.initialMinterAddress, baseUri: c.baseUri || d.baseUri, contractMetadataUri: c.contractMetadataUri || d.contractMetadataUri }));
      setSubmissionAdmin((c) => c || d.adminAddress);
      setFounderForm((c) => ({ ...c, adminAddress: c.adminAddress || d.adminAddress }));
      setEventAdmin((c) => c || d.adminAddress);
      setOpsForm((c) => ({ ...c, contractAddress: c.contractAddress || d.contractAddress }));
    }).catch((e) => push(e instanceof Error ? e.message : "Failed to load server config.", "danger"));
  }, [session.authenticated]);

  useEffect(() => {
    if (!deployReceipt.isSuccess || !pendingDeployment?.key || !deployReceipt.data.contractAddress) return;
    const contractAddress = getAddress(deployReceipt.data.contractAddress);
    patchDeployment(pendingDeployment.key, { address: contractAddress, txHash: pendingDeployment.txHash, chainId: selectedChainId, deployedAt: new Date().toISOString(), constructorArgs: pendingDeployment.constructorArgs, verification: { basescan: { status: "pending", message: "Queued." }, blockscout: { status: "pending", message: "Queued." } } });
    if (pendingDeployment.key === "ownerAccess") setOpsForm((c) => ({ ...c, contractAddress }));
    if (pendingDeployment.key === "submissionRegistry") setFounderForm((c) => ({ ...c, submissionRegistryAddress: contractAddress }));
    push(`${deploymentLabels[pendingDeployment.key]} deployed at ${short(contractAddress, 8, 6)}.`, "success");
    void verifyDeployment(pendingDeployment.key, contractAddress, pendingDeployment.constructorArgs);
    void autoCopyEnvAfterDeploy(pendingDeployment.key, contractAddress);
    setPendingDeployment(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployReceipt.isSuccess, deployReceipt.data, pendingDeployment, selectedChainId]);

  // ─── Not configured guard ──────────────────────────────────────────────────

  if (!session.configured) {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_30%),linear-gradient(180deg,#020202,#000)] px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.32em] text-white/64">Deployment HQ</div>
          <h1 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">Start here: create the HQ secret first.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">
            Before any wallet access or contract deployment, this page needs <code>EPISODES_ADMIN_SESSION_SECRET</code> in your local environment.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Generate the secret", "Paste into `.env`", "Refresh HQ"].map((title, i) => (
              <div key={title} className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step {i + 1}</div>
                <div className="mt-2 text-lg font-semibold text-white">{title}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => router.push("/tools/session-secret")} className={glow(true, false)}>Open Secret Tool</button>
            <button onClick={() => window.location.reload()} className={glow(false, false)}>I Added It, Refresh HQ</button>
          </div>
        </div>
      </section>
    );
  }

  // ─── Not authenticated guard ───────────────────────────────────────────────

  if (!session.authenticated) {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_28%),linear-gradient(180deg,#020202,#000)] px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.32em] text-white/64">Deployment HQ</div>
          <h1 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">Unlock HQ, then follow the guided deploy path.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">Connect your wallet, sign once, and the panel opens.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Connect wallet", "Sign once", "Continue guided setup"].map((title, i) => (
              <div key={title} className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step {i + 1}</div>
                <div className="mt-2 text-lg font-semibold text-white">{title}</div>
              </div>
            ))}
          </div>
          {!isConnected ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {connectors.map((connector) => (
                <button key={connector.id} onClick={() => connect({ connector })} disabled={isConnecting} className={glow(true, isConnecting)}>{connector.name}</button>
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-white/12 bg-white/[0.05] px-4 py-4 text-sm break-all text-white/82">{address}</div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={handleWalletLogin} className={glow(true, false)}>Sign With Wallet</button>
                <button onClick={() => disconnect()} className={glow(false, false)}>Disconnect</button>
              </div>
            </div>
          )}
          <div className="mt-6">
            <button onClick={() => router.push("/tools/session-secret")} className={glow(false, false)}>Open Secret Tool</button>
          </div>
          {feedback ? <p className="mt-4 text-sm leading-6 text-white/68">{feedback}</p> : null}
        </div>
      </section>
    );
  }

  // ─── Build artwork deploy cards ───────────────────────────────────────────

  const srdocs = deploymentGuides.seasonRegistry.constructorDocs;
  const epdocs = deploymentGuides.episodeContract.constructorDocs;
  const oadocs = deploymentGuides.ownerAccess.constructorDocs;
  const subdocs = deploymentGuides.submissionRegistry.constructorDocs;
  const fdocs = deploymentGuides.founderMembership.constructorDocs;
  const evdocs = deploymentGuides.eventRegistry.constructorDocs;

  const artworkCards = [
    {
      key: "seasonRegistry" as ArtworkContractKey,
      step: "Step A1",
      title: "Season Registry",
      badge: "Deploy once per season",
      ready: seasonRegistryReady,
      summary: "The master index for Season 1. Deploy this once — it holds the list of all episode contracts so the app and marketplaces can discover them. Lightweight, no tokens, no gas headaches.",
      fieldSummary: "You are setting: who manages the registry, which season number this is (use 1), and the season name that shows publicly.",
      fields: (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Admin address" tooltip={srdocs[0]?.description} value={seasonRegistryForm.admin} onChange={(v) => setSeasonRegistryForm((c) => ({ ...c, admin: v }))} placeholder="0x..." />
          <Field label="Season ID" tooltip={srdocs[1]?.description} value={seasonRegistryForm.seasonId} onChange={(v) => setSeasonRegistryForm((c) => ({ ...c, seasonId: v }))} placeholder="1" />
          <div className="sm:col-span-2">
            <Field label="Season name" tooltip={srdocs[2]?.description} value={seasonRegistryForm.seasonName} onChange={(v) => setSeasonRegistryForm((c) => ({ ...c, seasonName: v }))} placeholder="AXIS Season 1" />
          </div>
        </div>
      ),
    },
    {
      key: "episodeContract" as ArtworkContractKey,
      step: "Step A2",
      title: "Episode Contract",
      badge: "One per episode",
      ready: episodeReady,
      summary: "The actual AR artwork contract for one episode. Each token ID inside is one collectible AR piece. Collectors scan the AR → tap mint → free, one per wallet. Deploy when the episode goes open and Luma is confirmed.",
      fieldSummary: "You are setting: who controls this contract, the episode name (e.g. 'IRL x AXIS'), its symbol, which season and episode number, where the artwork metadata lives, and the collection profile URL for OpenSea.",
      fields: (
        <>
          <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-sm leading-6 text-white/74">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">Easiest rule</div>
            <p className="mt-2">
              If you do not have any Grove links or JSON ready yet, that is fine. Click <span className="text-white/90">Use Easy Starter Links</span>, deploy the contract, then come back to Artwork JSON HQ and upload the real files later.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Choose episode slot</span>
                <select
                  value={selectedEpisodeSlot}
                  onChange={(event) => applyEpisodeSlot(event.target.value)}
                  className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                >
                  {episodeCatalog.map((episode) => (
                    <option key={episode.slug} value={episode.slug}>
                      Episode {episode.id} · {episode.title}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={applyEpisodeStarterLinks} className={glow(false, false)}>
                Use Easy Starter Links
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Admin address" tooltip={epdocs[0]?.description} value={episodeForm.admin} onChange={(v) => setEpisodeForm((c) => ({ ...c, admin: v }))} placeholder="0x..." />
            <Field label="Episode / event name" tooltip={epdocs[1]?.description} value={episodeForm.name} onChange={(v) => setEpisodeForm((c) => ({ ...c, name: v }))} placeholder="IRL x AXIS" />
            <Field label="Short code" tooltip={epdocs[2]?.description} value={episodeForm.symbol} onChange={(v) => setEpisodeForm((c) => ({ ...c, symbol: v }))} placeholder="AXIS-EP2" />
            <Field label="Season number" tooltip={epdocs[3]?.description} value={episodeForm.seasonId} onChange={(v) => setEpisodeForm((c) => ({ ...c, seasonId: v }))} placeholder="1" />
            <Field label="Episode slot" tooltip={epdocs[4]?.description} value={episodeForm.episodeNumber} onChange={(v) => setEpisodeForm((c) => ({ ...c, episodeNumber: v }))} placeholder="2" />
            <Field label="Starter metadata link" tooltip={epdocs[5]?.description} value={episodeForm.baseUri} onChange={(v) => setEpisodeForm((c) => ({ ...c, baseUri: v }))} placeholder="https://your-site/api/arapp/collect/episode-2/metadata" />
            <div className="sm:col-span-2">
              <Field label="Master metadata link" tooltip={epdocs[6]?.description} value={episodeForm.contractMetadataUri} onChange={(v) => setEpisodeForm((c) => ({ ...c, contractMetadataUri: v }))} placeholder="https://axis.show/api/episodes/episode-2/metadata" />
            </div>
          </div>
        </>
      ),
    },
  ];

  const legacyCards = [
    {
      key: "ownerAccess" as const,
      step: "Legacy L1",
      title: "Owner Access 1155",
      badge: "HQ key system",
      ready: ownerReady,
      summary: "The front door of your whole operation. Only wallets with a token from this contract can log into HQ. Think of it as handing out master keys.",
      fieldSummary: "You are setting: who is in charge, who else can hand out keys, where the key images are stored, and what the collection looks like on OpenSea.",
      fields: (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Admin address" tooltip={oadocs[0]?.description} value={ownerAccessForm.adminAddress} onChange={(v) => setOwnerAccessForm((c) => ({ ...c, adminAddress: v }))} placeholder="0x..." />
          <Field label="Initial minter (optional)" tooltip={oadocs[1]?.description} value={ownerAccessForm.initialMinterAddress} onChange={(v) => setOwnerAccessForm((c) => ({ ...c, initialMinterAddress: v }))} placeholder="0x..." />
          <Field label="Base URI — token image folder" tooltip={oadocs[2]?.description} value={ownerAccessForm.baseUri} onChange={(v) => setOwnerAccessForm((c) => ({ ...c, baseUri: v }))} placeholder="ipfs://.../{id}.json" />
          <Field label="Collection info URI" tooltip={oadocs[3]?.description} value={ownerAccessForm.contractMetadataUri} onChange={(v) => setOwnerAccessForm((c) => ({ ...c, contractMetadataUri: v }))} placeholder="ipfs://.../contract.json" />
        </div>
      ),
    },
    {
      key: "submissionRegistry" as const,
      step: "Legacy L2",
      title: "Submission Registry",
      badge: "Applications inbox",
      ready: submissionReady,
      summary: "The applications inbox. When someone applies to be a founder, their application lands here. The admin reviews and approves it, and this contract keeps the permanent record.",
      fieldSummary: "You are setting which wallet can review applications, approve them, and pause the system.",
      fields: (
        <div className="mt-5">
          <Field label="Admin address" tooltip={subdocs[0]?.description} value={submissionAdmin} onChange={setSubmissionAdmin} placeholder="0x..." />
        </div>
      ),
    },
    {
      key: "founderMembership" as const,
      step: "Legacy L3",
      title: "Founder Membership S1",
      badge: "Season membership token",
      ready: founderReady,
      summary: "The actual founder token. Once an application is approved, this contract creates and sends the membership NFT. It enforces the season supply cap.",
      fieldSummary: "You are connecting this to the registry, setting where founder token images are stored, what the collection looks like publicly, and how many founder spots exist.",
      fields: (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Admin address" tooltip={fdocs[0]?.description} value={founderForm.adminAddress} onChange={(v) => setFounderForm((c) => ({ ...c, adminAddress: v }))} placeholder="0x..." />
            <Field label="Submission registry address" tooltip={fdocs[1]?.description} value={founderForm.submissionRegistryAddress} onChange={(v) => setFounderForm((c) => ({ ...c, submissionRegistryAddress: v }))} placeholder="0x..." />
            <Field label="Base URI — founder token images" tooltip={fdocs[2]?.description} value={founderForm.baseUri} onChange={(v) => setFounderForm((c) => ({ ...c, baseUri: v }))} placeholder="ipfs://.../" />
            <Field label="Collection info URI" tooltip={fdocs[3]?.description} value={founderForm.contractMetadataUri} onChange={(v) => setFounderForm((c) => ({ ...c, contractMetadataUri: v }))} placeholder="ipfs://.../contract.json" />
            <Field label="Max supply — season cap" tooltip={fdocs[4]?.description} value={founderForm.maxSupply} onChange={(v) => setFounderForm((c) => ({ ...c, maxSupply: v }))} placeholder="333" />
          </div>
          <div className="mt-4">
            <button onClick={linkFounderMembership} disabled={!founderLinkReady || isWriting || isSwitchingChain} className={glow(founderLinkReady && Boolean(deployments.founderMembership.address), !founderLinkReady || isWriting || isSwitchingChain)}>
              Link Founder Into Registry
            </button>
          </div>
        </>
      ),
    },
    {
      key: "eventRegistry" as const,
      step: "Legacy L4",
      title: "Event Access Registry",
      badge: "Event permissions",
      ready: eventReady,
      summary: "The events permission layer. Controls who can create and manage events, and which wallets get access — separate from founder memberships and artwork collection.",
      fieldSummary: "You are setting which wallet can create events and control who gets access to them.",
      fields: (
        <div className="mt-5">
          <Field label="Admin address" tooltip={evdocs[0]?.description} value={eventAdmin} onChange={setEventAdmin} placeholder="0x..." />
        </div>
      ),
    },
  ];

  const activeArtworkCard = artworkCards[Math.min(artworkStepIndex, artworkCards.length - 1)];
  const activeLegacyCard = legacyCards[Math.min(legacyStepIndex, legacyCards.length - 1)];
  const activeCard = deployTrack === "artwork" ? activeArtworkCard : activeLegacyCard;
  const activeStepIndex = deployTrack === "artwork" ? artworkStepIndex : legacyStepIndex;
  const activeCards = deployTrack === "artwork" ? artworkCards : legacyCards;
  const activeGuide = deploymentGuides[activeCard.key];
  const activeRecord = deployments[activeCard.key];
  const activeMissingDeps = missingDependenciesFor(activeCard.key, deployments);
  const activeExplorerBase = activeRecord.chainId ? deploymentChainMeta[activeRecord.chainId].explorerUrl : deploymentChainMeta[selectedChainId].explorerUrl;
  const activeBusy = isDeploying || isSwitchingChain || verifyingKey === activeCard.key;
  const activeStepStatus = stepStatusFor(activeCard.key, activeCard.ready, deployments);
  const activeStatus = activeRecord.address ? "live" : activeCard.ready ? "ready" : "blocked";
  const activeStatusLabel = activeStepStatus === "live" ? "live" : activeStepStatus === "ready" ? "ready to deploy" : activeStepStatus === "dependency" ? "missing dependency" : "needs input";
  const deployDisabled = activeBusy || !activeCard.ready || (mode === "server" && activeCard.key !== "ownerAccess") || (mode === "server" && activeCard.key === "ownerAccess" && !serverStatus.deployReady);

  // ─── Guided checklist ─────────────────────────────────────────────────────

  const guidedChecklist = [
    {
      title: "HQ secret",
      description: session.configured ? "Done — bootstrap secret is ready." : "Generate your HQ session secret first.",
      done: session.configured,
      action: () => router.push("/tools/session-secret"),
      actionLabel: "Generate Secret",
    },
    {
      title: "Season Registry",
      description: deployments.seasonRegistry.address
        ? `Deployed: ${short(deployments.seasonRegistry.address, 8, 6)}`
        : "Deploy the season index contract — one time, cheap, permanent.",
      done: Boolean(deployments.seasonRegistry.address),
      action: () => { setWorkflowStage("launch"); setDeployTrack("artwork"); setArtworkStepIndex(0); },
      actionLabel: deployments.seasonRegistry.address ? "View" : "Deploy",
    },
    {
      title: "Episode Contract",
      description: deployments.episodeContract.address
        ? `Deployed: ${short(deployments.episodeContract.address, 8, 6)}`
        : "Deploy the AR artwork contract for the current open episode.",
      done: Boolean(deployments.episodeContract.address),
      action: () => { setWorkflowStage("launch"); setDeployTrack("artwork"); setArtworkStepIndex(1); },
      actionLabel: deployments.episodeContract.address ? "View" : "Deploy",
    },
    {
      title: "Episodes HQ",
      description: artworkStackReady ? "Register artworks and open minting in Episodes HQ." : "Available after the artwork contracts are deployed.",
      done: artworkStackReady,
      action: () => artworkStackReady ? router.push("/owner/episodes") : push("Deploy Season Registry and Episode Contract first.", "warning"),
      actionLabel: artworkStackReady ? "Open Episodes HQ" : "Locked",
    },
  ];
  const guideCompletedCount = guidedChecklist.filter((item) => item.done).length;
  const guideProgress = Math.round((guideCompletedCount / guidedChecklist.length) * 100);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="min-h-screen overflow-x-hidden bg-black px-3 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/56">AXIS Deployment HQ</div>
              <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-tight tracking-[-0.05em] sm:text-2xl">
                Deploy the artwork contracts, then open Episodes HQ.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/68">
                Two new contracts handle AR artwork collection: <span className="text-white/86">Season Registry</span> (deploy once) and <span className="text-white/86">Episode Contract</span> (deploy per event). The legacy stack below is optional for founder memberships.
              </p>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/admin/session", { method: "DELETE" });
                disconnect();
                setSession((c) => ({ ...c, authenticated: false, subject: null }));
              }}
              className={glow(false, false)}
            >
              Sign Out
            </button>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.45))] p-5 sm:p-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/52">Choose Your Path</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
                Start with the workflow that matches what you need right now.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/66">
                This page now starts with three clear modes: guided wizard for normal launches, advanced controls for direct contract work, or session recovery if you are returning to unfinished work.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <button
                  onClick={() => setWorkflowStage("launch")}
                  className={`rounded-[24px] border p-5 text-left transition ${workflowStage === "launch" ? "border-white/26 bg-white/[0.08]" : "border-white/10 bg-black/35 hover:border-white/22 hover:bg-white/[0.05]"}`}
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">Recommended</div>
                  <div className="mt-2 text-lg font-semibold text-white">Wizard</div>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Best for most launches. Follow the guided path from episode selection to NFC claim links.
                  </p>
                </button>
                <button
                  onClick={() => setWorkflowStage("artwork")}
                  className={`rounded-[24px] border p-5 text-left transition ${workflowStage === "artwork" || workflowStage === "legacy" ? "border-white/26 bg-white/[0.08]" : "border-white/10 bg-black/35 hover:border-white/22 hover:bg-white/[0.05]"}`}
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">Direct control</div>
                  <div className="mt-2 text-lg font-semibold text-white">Advanced</div>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Use the full contract panels, verification tools, ABI access, and manual deployment controls.
                  </p>
                </button>
                <button
                  onClick={() => hasSavedProgress ? setWorkflowStage(totalDeployedCount ? "handoff" : "launch") : push("No saved session state yet.", "warning")}
                  className={`rounded-[24px] border p-5 text-left transition ${hasSavedProgress ? "border-white/10 bg-black/35 hover:border-white/22 hover:bg-white/[0.05]" : "border-white/8 bg-black/20 text-white/46"}`}
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">Return later</div>
                  <div className="mt-2 text-lg font-semibold text-white">Recover Session</div>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Jump back into saved progress, copy env values, or continue where you left off after a stale session.
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-black/45 p-5 sm:p-6">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Session Snapshot</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Launch progress</div>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{guideProgress}%</div>
                    <div className="text-sm text-white/56">{guideCompletedCount}/{guidedChecklist.length} steps done</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Network</div>
                    <div className="mt-2 text-lg font-semibold text-white">{deploymentChainMeta[selectedChainId].shortLabel}</div>
                    <div className="text-sm text-white/56">Wallet: {currentChainId ?? "not connected"}</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Saved work</div>
                    <div className="mt-2 text-sm text-white/72">{hasSavedProgress ? "Session can be recovered" : "No saved progress yet"}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/45 p-5 sm:p-6">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Quick Actions</div>
                <div className="mt-4 grid gap-3">
                  <button onClick={() => router.push("/tools/session-secret")} className={glow(false, false)}>Open Secret Tool</button>
                  <button onClick={() => router.push("/owner/episodes")} disabled={!artworkStackReady} className={glow(artworkStackReady, !artworkStackReady)}>Go To Episodes HQ</button>
                  <button onClick={resetDeploymentWorkspace} disabled={!hasSavedProgress} className={glow(hasSavedProgress, !hasSavedProgress)}>Reset Saved Session</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {workflowStage === "launch" && (
          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Launch Wizard</div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                    One focused step at a time.
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
                    Choose the episode, deploy the contracts, then move into artwork setup. Extra tools stay hidden until you need them.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setWorkflowStage("artwork")} className={glow(false, false)}>Advanced Deploy View</button>
                  <button onClick={() => { setWorkflowStage("collectibles"); setLaunchWizardStep(3); }} className={glow(false, false)}>Open Artwork Wizard Only</button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {[
                  { id: 1 as const, label: "Choose episode", status: selectedEpisodeRecord ? "ready" : "waiting" },
                  { id: 2 as const, label: "Deploy contracts", status: deployments.episodeContract.address ? "ready" : "next" },
                  { id: 3 as const, label: "Upload artwork", status: deployments.episodeContract.address ? "open" : "locked" },
                ].map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id === 3 && !deployments.episodeContract.address) {
                        push("Deploy the episode contract first.", "warning");
                        return;
                      }
                      setLaunchWizardStep(step.id);
                    }}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      launchWizardStep === step.id
                        ? "border-white/24 bg-white text-black"
                        : "border-white/10 bg-black/35 text-white hover:border-white/18 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className={`text-[10px] uppercase tracking-[0.18em] ${launchWizardStep === step.id ? "text-black/55" : "text-white/40"}`}>Step {step.id}</div>
                    <div className="mt-2 text-base font-semibold">{step.label}</div>
                    <div className={`mt-2 text-xs uppercase tracking-[0.16em] ${launchWizardStep === step.id ? "text-black/60" : "text-white/52"}`}>{step.status}</div>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 rounded-[28px] border border-white/10 bg-black/35 p-5 sm:p-6">
                  {launchWizardStep === 1 && (
                    <div className="space-y-5">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 1</div>
                        <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Choose the episode</div>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
                          Pick the episode you are launching right now. The rest of the wizard will follow this choice automatically.
                        </p>
                      </div>
                      <label className="space-y-2 min-w-0">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Episode slot</span>
                        <select
                          value={selectedEpisodeSlot}
                          onChange={(event) => applyEpisodeSlot(event.target.value)}
                          className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                        >
                          {episodeCatalog.map((episode) => (
                            <option key={episode.slug} value={episode.slug}>
                              Episode {episode.id} · {episode.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      {selectedEpisodeRecord ? (
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Episode</div>
                            <div className="mt-2 break-words text-sm text-white/84">{selectedEpisodeRecord.title}</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Date</div>
                            <div className="mt-2 break-words text-sm text-white/84">{selectedEpisodeRecord.startsAt}</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Status</div>
                            <div className="mt-2 text-sm text-white/84">{selectedEpisodeRecord.status}</div>
                          </div>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => setLaunchWizardStep(2)} className={glow(true, false)}>
                          Continue To Deploy
                        </button>
                      </div>
                    </div>
                  )}

                  {launchWizardStep === 2 && (
                    <div className="space-y-5">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 2</div>
                        <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Deploy the contracts</div>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
                          First deploy the season registry if needed. Then deploy the episode contract for this episode. Verification stays here too.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Season registry</div>
                          <div className="mt-2 text-sm text-white/84">{deployments.seasonRegistry.address ? "Deployed" : "Not deployed yet"}</div>
                          <div className="mt-1 break-all font-mono text-xs text-white/56">{deployments.seasonRegistry.address || "Deploy once for the season"}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Episode contract</div>
                          <div className="mt-2 text-sm text-white/84">{deployments.episodeContract.address ? "Deployed" : "Not deployed yet"}</div>
                          <div className="mt-1 break-all font-mono text-xs text-white/56">{deployments.episodeContract.address || "Deploy for this episode"}</div>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                          label="Episode name"
                          value={episodeForm.name}
                          onChange={(v) => setEpisodeForm((current) => ({ ...current, name: v }))}
                          placeholder="AXIS EPISODE I"
                        />
                        <Field
                          label="Short code"
                          value={episodeForm.symbol}
                          onChange={(v) => setEpisodeForm((current) => ({ ...current, symbol: v }))}
                          placeholder="AXIS-EP1"
                        />
                        <Field
                          label="Admin wallet"
                          value={episodeForm.admin}
                          onChange={(v) => setEpisodeForm((current) => ({ ...current, admin: v }))}
                          placeholder="0x..."
                        />
                        <Field
                          label="Starter metadata link"
                          value={episodeForm.baseUri}
                          onChange={(v) => setEpisodeForm((current) => ({ ...current, baseUri: v }))}
                          placeholder={`${appOrigin}/api/arapp/collect/${selectedEpisodeSlot}/metadata`}
                        />
                        <Field
                          label="Master metadata link"
                          value={episodeForm.contractMetadataUri}
                          onChange={(v) => setEpisodeForm((current) => ({ ...current, contractMetadataUri: v }))}
                          placeholder={`${appOrigin}/api/episodes/${selectedEpisodeSlot}/metadata`}
                        />
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Episode slot</div>
                          <div className="mt-2 text-sm text-white/84">Episode {episodeForm.episodeNumber || selectedEpisodeRecord?.id || "1"}</div>
                          <div className="mt-1 text-xs text-white/56">This comes from the selected episode above.</div>
                        </div>
                      </div>
                      {!episodeReady ? (
                        <div className="rounded-2xl border border-white/14 bg-white/7 p-4 text-sm leading-6 text-white/72">
                          Episode deploy is still waiting for: {episodeMissingFields.join(", ")}.
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-white/16 bg-white/8 p-4 text-sm leading-6 text-white/76">
                          Episode deploy is ready. You can press the deploy button now.
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <button onClick={applyEpisodeStarterLinks} className={glow(false, false)}>Use Starter Links</button>
                        <button onClick={() => deployStep("seasonRegistry")} disabled={isDeploying || isSwitchingChain || !seasonRegistryReady} className={glow(seasonRegistryReady && !deployments.seasonRegistry.address, isDeploying || isSwitchingChain || !seasonRegistryReady)}>
                          {deployments.seasonRegistry.address ? "Re-Deploy Season Registry" : "Deploy Season Registry"}
                        </button>
                        <button onClick={() => verifyDeployment("seasonRegistry")} disabled={!deployments.seasonRegistry.address || verifyingKey === "seasonRegistry"} className={glow(Boolean(deployments.seasonRegistry.address), !deployments.seasonRegistry.address || verifyingKey === "seasonRegistry")}>
                          Verify Season Registry
                        </button>
                        <button onClick={() => deployStep("episodeContract")} disabled={isDeploying || isSwitchingChain || !episodeReady} className={glow(episodeReady && !deployments.episodeContract.address, isDeploying || isSwitchingChain || !episodeReady)}>
                          {deployments.episodeContract.address ? "Re-Deploy Episode Contract" : "Deploy Episode Contract"}
                        </button>
                        <button onClick={() => verifyDeployment("episodeContract")} disabled={!deployments.episodeContract.address || verifyingKey === "episodeContract"} className={glow(Boolean(deployments.episodeContract.address), !deployments.episodeContract.address || verifyingKey === "episodeContract")}>
                          Verify Episode Contract
                        </button>
                        <button onClick={() => setLaunchWizardStep(3)} disabled={!deployments.episodeContract.address} className={glow(Boolean(deployments.episodeContract.address), !deployments.episodeContract.address)}>
                          Continue To Artwork
                        </button>
                      </div>
                    </div>
                  )}

                  {launchWizardStep === 3 && (
                    <div className="space-y-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 3</div>
                          <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Upload artwork and publish claim links</div>
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
                            The deploy step is done. Now work only on the artwork setup, claim preview, and NFC links.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => artworkStackReady ? router.push("/owner/episodes") : push("Deploy the contracts first, then open Episodes HQ.", "warning")} className={glow(artworkStackReady, !artworkStackReady)}>
                            Open Episodes HQ
                          </button>
                          <button onClick={() => router.push("/arapp/collect")} className={glow(false, false)}>Open Public Collect</button>
                        </div>
                      </div>
                      <ArtworkMetadataBuilder
                        defaults={{
                          slug: selectedEpisodeSlot,
                          label: selectedEpisodeRecord?.title || episodeForm.name || `Episode ${episodeForm.episodeNumber || "1"}`,
                          number: Number(selectedEpisodeRecord?.id || episodeForm.episodeNumber || "1"),
                          chainId: deployments.episodeContract.chainId || selectedChainId,
                          episodeLabel: `Episode ${selectedEpisodeRecord?.id || episodeForm.episodeNumber || "1"}`,
                          episodeDate: selectedEpisodeRecord?.startsAt || "",
                          contractAddress: deployments.episodeContract.address,
                          baseUri: episodeForm.baseUri,
                          collectionMetadataUri: episodeForm.contractMetadataUri,
                          origin: appOrigin,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4 min-w-0">
                  <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Right now</div>
                    <div className="mt-4 space-y-3 text-sm text-white/66">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <span>Episode chosen</span>
                        <span className="text-white/84">{selectedEpisodeRecord ? `Episode ${selectedEpisodeRecord.id}` : "waiting"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <span>Season registry</span>
                        <span className="text-white/84">{deployments.seasonRegistry.address ? "done" : "waiting"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <span>Episode contract</span>
                        <span className="text-white/84">{deployments.episodeContract.address ? "done" : "waiting"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <span>Next focus</span>
                        <span className="text-white/84">
                          {launchWizardStep === 1 ? "choose episode" : launchWizardStep === 2 ? "deploy" : "upload artwork"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <details className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-white/86">Tools for later</summary>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">ABI Access</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => downloadAbiFor("seasonRegistry")} className={glow(false, false)}>Season ABI</button>
                          <button onClick={() => downloadAbiFor("episodeContract")} className={glow(false, false)}>Episode ABI</button>
                          <button onClick={() => copyAbiFor("seasonRegistry")} className={glow(false, false)}>Copy Season ABI</button>
                          <button onClick={() => copyAbiFor("episodeContract")} className={glow(false, false)}>Copy Episode ABI</button>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Paymaster</div>
                        <div className="mt-4 grid gap-4">
                          <Field label="Paymaster contract address on Base" value={paymasterAddress} onChange={setPaymasterAddress} placeholder="0x..." />
                          <button onClick={() => copyBlock("Paymaster env block", paymasterEnvPreview)} className={glow(false, false)}>
                            Copy Paymaster Env
                          </button>
                          <pre className="overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-6 text-white/68">{paymasterEnvPreview}</pre>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Deploy view (artwork or legacy) ── */}
        {(workflowStage === "artwork" || workflowStage === "legacy") && (
          <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">

            {/* Sidebar */}
            <aside className="space-y-5 min-w-0">
              {/* Track switcher */}
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Contract Track</div>
                <div className="mt-3 grid gap-2">
                  <button onClick={() => { setDeployTrack("artwork"); setWorkflowStage("artwork"); }} className={glow(deployTrack === "artwork", false)}>
                    Artwork Stack
                  </button>
                  <button onClick={() => { setDeployTrack("legacy"); setWorkflowStage("legacy"); }} className={glow(deployTrack === "legacy", false)}>
                    Legacy Stack
                  </button>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-5 text-white/52">
                  {deployTrack === "artwork"
                    ? "Artwork stack: Season Registry (once) + Episode Contract (per episode). This is the primary path for AR collection."
                    : "Legacy stack: Owner Access, Submission Registry, Founder Membership, Event Registry. Optional — deploy these for the membership and access control flow."}
                </div>
              </div>

              {/* Mode */}
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Mode</div>
                <div className="mt-3 grid gap-3">
                  <button onClick={() => setMode("wallet")} className={glow(mode === "wallet", false)}>Connected Wallet</button>
                  <button onClick={() => setMode("server")} className={glow(mode === "server", false)}>Server Signer</button>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/58">Wallet mode handles the full stack. Server mode supports owner-access only.</p>
              </div>

              {/* Network */}
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Network</div>
                <div className="mt-3 grid gap-3">
                  <button onClick={() => setSelectedChainId(baseSepolia.id)} className={glow(selectedChainId === baseSepolia.id, false)}>Base Sepolia</button>
                  <button onClick={() => setSelectedChainId(base.id)} className={glow(selectedChainId === base.id, false)}>Base Mainnet</button>
                </div>
              </div>

              {/* Contract carousel */}
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">
                  {deployTrack === "artwork" ? "Artwork Contracts" : "Legacy Contracts"}
                </div>
                <div className="mt-4 grid gap-3">
                  {activeCards.map((card, index) => {
                    const status = stepStatusFor(card.key, card.ready, deployments);
                    const selected = index === activeStepIndex;
                    return (
                      <button key={card.key}
                        onClick={() => deployTrack === "artwork" ? setArtworkStepIndex(index) : setLegacyStepIndex(index)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${selected ? "border-white/30 bg-white/[0.08]" : "border-white/10 bg-black/35 hover:border-white/20 hover:bg-black/50"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">{card.step}</div>
                            <div className="mt-1 break-words text-sm font-medium text-white/88">{card.title}</div>
                            <div className="mt-1 text-xs leading-5 text-white/50">
                              {status === "live" ? "Already deployed" : status === "ready" ? "Inputs look good" : status === "dependency" ? "Dependency missing" : "Needs more input"}
                            </div>
                          </div>
                          <div className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${status === "live" ? "border-white/25 text-white/88" : selected ? "border-white/20 text-white/80" : "border-white/10 text-white/50"}`}>
                            {status === "live" ? "live" : status === "ready" ? "ready" : status === "dependency" ? "watch" : "input"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Command log */}
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Command Log</div>
                <div className="mt-4 space-y-3">
                  {activity.length ? activity.map((item) => (
                    <div key={item.id} className={`rounded-2xl border p-3 text-sm leading-6 break-words ${tone(item.tone)}`}>
                      {item.text}
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/56">
                      Deployments, verification updates, and admin writes land here.
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main deploy card */}
            <div className="space-y-5 min-w-0">
              <motion.div key={`${activeCard.key}-${deployTrack}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
              >
                <div className="flex flex-col gap-5">
                  {/* Contract header */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">{activeCard.step}</div>
                        <div className="rounded-full border border-white/14 bg-white/[0.06] px-3 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/60">{activeCard.badge}</div>
                      </div>
                      <h2 className="mt-2 break-words text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{activeCard.title}</h2>
                      <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-white/60">{activeCard.summary}</p>
                    </div>
                    <div className="rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                      <span className={stateText(activeStatus)}>{activeStatusLabel}</span>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    {/* Left: guide + fields + deploy */}
                    <div className="rounded-[30px] border border-white/10 bg-black/45 p-4 sm:p-6">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Purpose</div>
                          <p className="mt-2 text-sm leading-6 text-white/72">{activeGuide.purpose}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">When to deploy</div>
                          <p className="mt-2 text-sm leading-6 text-white/72">{activeGuide.deployWhen}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Can I deploy now?</div>
                          <p className="mt-2 text-sm leading-6 text-white/72">
                            {activeMissingDeps.length
                              ? `Yes, but usual order is after: ${activeMissingDeps.map((d) => deploymentLabels[d]).join(", ")}.`
                              : activeCard.ready ? "Yes. Required inputs look filled." : "Not yet. Fill the required inputs below first."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-sm leading-6 text-white/74">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">In plain English</div>
                        <p className="mt-2 break-words">{activeCard.fieldSummary}</p>
                      </div>

                      <div className="mt-5">{activeCard.fields}</div>

                      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/64">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Env keys written after deploy</div>
                        <p className="mt-2 break-words font-mono text-xs">{activeGuide.envKeys.join(", ")}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={() => deployStep(activeCard.key)}
                          disabled={deployDisabled}
                          className={glow((activeStepStatus === "ready" || activeStepStatus === "dependency") && !activeRecord.address, deployDisabled)}
                        >
                          {activeMissingDeps.length ? "Deploy Anyway" : "Deploy"}
                        </button>
                        <button
                          onClick={() => verifyDeployment(activeCard.key)}
                          disabled={!activeRecord.address || verifyingKey === activeCard.key}
                          className={glow(Boolean(activeRecord.address) && (activeRecord.verification.basescan.status === "failed" || activeRecord.verification.blockscout.status === "failed"), !activeRecord.address || verifyingKey === activeCard.key)}
                        >
                          {verifyingKey === activeCard.key ? "Verifying" : "Verify Again"}
                        </button>
                        <button onClick={() => downloadAbiFor(activeCard.key)} className={glow(false, false)}>
                          Download ABI
                        </button>
                        <button onClick={() => copyAbiFor(activeCard.key)} className={glow(false, false)}>
                          Copy ABI
                        </button>
                        {activeCard.key === "founderMembership" && (
                          <button
                            onClick={linkFounderMembership}
                            disabled={!founderLinkReady || isWriting || isSwitchingChain}
                            className={glow(founderLinkReady && Boolean(deployments.founderMembership.address), !founderLinkReady || isWriting || isSwitchingChain)}
                          >
                            Link Founder Into Registry
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: status + deps */}
                    <div className="space-y-4">
                      <div className="rounded-[30px] border border-white/10 bg-black/45 p-4 sm:p-6">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Live Status</div>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-white/66">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div>Address</div>
                            <div className="mt-2 break-all font-mono text-xs text-white/72">{activeRecord.address || "Waiting for deployment."}</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div>Transaction</div>
                            <div className="mt-2 break-words">{activeRecord.txHash ? <LinkOut href={`${activeExplorerBase}/tx/${activeRecord.txHash}`} label={short(activeRecord.txHash, 10, 8)} /> : "No transaction yet."}</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div>Explorer</div>
                            <div className="mt-2 break-words">{activeRecord.address ? <LinkOut href={`${activeExplorerBase}/address/${activeRecord.address}#code`} label="Open contract page" /> : "Shows up after deployment."}</div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[30px] border border-white/10 bg-black/45 p-4 sm:p-6">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Dependencies</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {activeGuide.dependsOn.length ? activeGuide.dependsOn.map((dep) => (
                            <div key={dep} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                              <span className={stateText(deployments[dep].address ? "live" : "blocked")}>
                                {deploymentLabels[dep]} {deployments[dep].address ? "live" : "recommended first"}
                              </span>
                            </div>
                          )) : (
                            <div className="text-sm text-white/58">No dependencies — can deploy standalone.</div>
                          )}
                        </div>
                        <p className="mt-4 text-sm leading-6 text-white/60">Dependencies are not hard blockers — they only show the normal rollout order.</p>
                      </div>
                    </div>
                  </div>

                  {/* Collapsibles */}
                  <div className="grid gap-4 xl:grid-cols-2">
                    <details className="rounded-[28px] border border-white/10 bg-black/40 p-5">
                      <summary className="cursor-pointer list-none text-sm font-medium text-white/86">Field guide</summary>
                      <p className="mt-3 text-sm leading-6 text-white/56">One-time values baked into the contract at deployment.</p>
                      <div className="mt-4 grid gap-3">
                        {activeGuide.constructorDocs.map((field, fi) => (
                          <div key={`${activeCard.key}-${field.key}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/68">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">{field.name}</div>
                              <div className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${field.required ? "border-white/25 text-white/88" : "border-white/10 text-white/56"}`}>
                                {field.required ? "required" : "optional"}
                              </div>
                            </div>
                            <p className="mt-2 break-words">{field.description}</p>
                            <p className="mt-2 break-words text-white/54">Recommended: {field.recommended}</p>
                            <p className="mt-2 break-all rounded-xl border border-white/8 bg-black/35 px-3 py-2 font-mono text-xs text-white/72">
                              {describeValue(activeRecord.constructorArgs[fi] ?? "") || field.placeholder || "pending"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>

                    <details className="rounded-[28px] border border-white/10 bg-black/40 p-5">
                      <summary className="cursor-pointer list-none text-sm font-medium text-white/86">Verification and after-deploy checklist</summary>
                      <div className="mt-4 grid gap-4">
                        <div className={`min-w-0 rounded-[24px] border p-4 ${verifyTone(activeRecord.verification.basescan.status)}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[11px] uppercase tracking-[0.18em]">BaseScan</div>
                            <div className={`text-[10px] uppercase tracking-[0.18em] ${stateText(activeRecord.verification.basescan.status === "verified" ? "verified" : activeRecord.verification.basescan.status === "failed" ? "failed" : activeRecord.verification.basescan.status === "pending" || activeRecord.verification.basescan.status === "submitted" ? "pending" : "blocked")}`}>
                              {verificationLabel(activeRecord.verification.basescan.status)}
                            </div>
                          </div>
                          <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{activeRecord.verification.basescan.message}</div>
                          <div className="mt-2 text-xs"><LinkOut href={activeRecord.verification.basescan.url} label="Open BaseScan" /></div>
                        </div>
                        <div className={`min-w-0 rounded-[24px] border p-4 ${verifyTone(activeRecord.verification.blockscout.status)}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[11px] uppercase tracking-[0.18em]">Blockscout</div>
                            <div className={`text-[10px] uppercase tracking-[0.18em] ${stateText(activeRecord.verification.blockscout.status === "verified" ? "verified" : activeRecord.verification.blockscout.status === "failed" ? "failed" : activeRecord.verification.blockscout.status === "pending" || activeRecord.verification.blockscout.status === "submitted" ? "pending" : "blocked")}`}>
                              {verificationLabel(activeRecord.verification.blockscout.status)}
                            </div>
                          </div>
                          <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{activeRecord.verification.blockscout.message}</div>
                          <div className="mt-2 text-xs"><LinkOut href={activeRecord.verification.blockscout.url} label="Open Blockscout" /></div>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Verification debug</div>
                          <div className="mt-3 grid gap-3 text-sm text-white/70">
                            <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
                              <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Contract address</div>
                              <div className="mt-2 break-all font-mono text-xs text-white/78">{activeRecord.address || "Waiting for deployment."}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
                              <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Network</div>
                              <div className="mt-2 break-words text-white/78">{activeRecord.chainId ? deploymentChainMeta[activeRecord.chainId].label : "No network recorded yet"}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
                              <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Constructor args sent for verification</div>
                              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-white/78">{JSON.stringify(activeRecord.constructorArgs, storageReplacer, 2)}</pre>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">After deploy</div>
                          <div className="mt-3 space-y-2">
                            {activeGuide.afterDeploy.map((item) => (
                              <div key={`${activeCard.key}-${item}`} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm leading-6 text-white/68 break-words">{item}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* Carousel nav */}
                  <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-black/45 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <button
                      onClick={() => deployTrack === "artwork" ? setArtworkStepIndex((c) => Math.max(0, c - 1)) : setLegacyStepIndex((c) => Math.max(0, c - 1))}
                      disabled={activeStepIndex === 0}
                      className={glow(false, activeStepIndex === 0)}
                    >
                      Previous
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {activeCards.map((card, index) => (
                        <button key={`${card.key}-dot`}
                          onClick={() => deployTrack === "artwork" ? setArtworkStepIndex(index) : setLegacyStepIndex(index)}
                          aria-label={`Open ${card.title}`}
                          className={`h-2.5 rounded-full transition ${index === activeStepIndex ? "w-10 bg-white" : "w-2.5 bg-white/30 hover:bg-white/55"}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => deployTrack === "artwork" ? setArtworkStepIndex((c) => Math.min(artworkCards.length - 1, c + 1)) : setLegacyStepIndex((c) => Math.min(legacyCards.length - 1, c + 1))}
                      disabled={activeStepIndex === activeCards.length - 1}
                      className={glow(false, activeStepIndex === activeCards.length - 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* ── Permissions ── */}
        {workflowStage === "permissions" && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Owner Access Operations</div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] sm:text-xl">Daily operator controls</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
              Use this after the owner-access contract is live. Mint badges, revoke them, or change deeper contract roles.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                { title: "Mint access key", desc: "Gives a wallet permission. Like handing somebody a badge." },
                { title: "Revoke access key", desc: "Takes that badge away from a wallet." },
                { title: "Apply role action", desc: "Changes deeper contract permissions like who can mint, pause, or manage metadata." },
              ].map((item) => (
                <div key={item.title} className="min-w-0 rounded-[24px] border border-white/10 bg-black/35 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-[26px] border border-white/10 bg-black/35 p-4 sm:p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Mint</div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <Field label="Contract address" value={opsForm.contractAddress} onChange={(v) => setOpsForm((c) => ({ ...c, contractAddress: v }))} placeholder="0x..." />
                  <Field label="Recipient" value={opsForm.recipient} onChange={(v) => setOpsForm((c) => ({ ...c, recipient: v }))} placeholder="0x..." />
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/48">Role</span>
                    <select value={opsForm.role} onChange={(e) => setOpsForm((c) => ({ ...c, role: e.target.value }))} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none">
                      <option value="owner">owner</option>
                      <option value="admin">admin</option>
                      <option value="aiagent">aiagent</option>
                      <option value="custom">custom token id</option>
                    </select>
                  </label>
                  <div className="flex items-end">
                    <button onClick={() => handleOwnerAccessAction("mint")} disabled={isWriting || isSwitchingChain || (mode === "server" && !serverStatus.writeReady)} className={`${glow(Boolean(opsForm.contractAddress && opsForm.recipient), isWriting || isSwitchingChain || (mode === "server" && !serverStatus.writeReady))} w-full`}>
                      Mint Access Key
                    </button>
                  </div>
                  {opsForm.role === "custom" && (
                    <>
                      <Field label="Token id" value={opsForm.tokenId} onChange={(v) => setOpsForm((c) => ({ ...c, tokenId: v }))} placeholder="4" />
                      <Field label="Amount" value={opsForm.amount} onChange={(v) => setOpsForm((c) => ({ ...c, amount: v }))} placeholder="1" />
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-black/35 p-4 sm:p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Revoke</div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <Field label="Revoke wallet" value={opsForm.revokeAccount} onChange={(v) => setOpsForm((c) => ({ ...c, revokeAccount: v }))} placeholder="0x..." />
                  <Field label="Revoke token id" value={opsForm.revokeTokenId} onChange={(v) => setOpsForm((c) => ({ ...c, revokeTokenId: v }))} placeholder="2" />
                  <Field label="Revoke amount" value={opsForm.revokeAmount} onChange={(v) => setOpsForm((c) => ({ ...c, revokeAmount: v }))} placeholder="1" />
                  <div className="flex items-end">
                    <button onClick={() => handleOwnerAccessAction("revoke")} disabled={isWriting || isSwitchingChain || (mode === "server" && !serverStatus.adminReady)} className={`${glow(Boolean(opsForm.contractAddress && opsForm.revokeAccount), isWriting || isSwitchingChain || (mode === "server" && !serverStatus.adminReady))} w-full`}>
                      Revoke Access Key
                    </button>
                  </div>
                </div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-black/35 p-4 sm:p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Role management</div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/48">Role action</span>
                    <select value={opsForm.roleAction} onChange={(e) => setOpsForm((c) => ({ ...c, roleAction: e.target.value }))} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none">
                      <option value="grant">grant</option>
                      <option value="revoke">revoke</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/48">Contract role</span>
                    <select value={opsForm.contractRole} onChange={(e) => setOpsForm((c) => ({ ...c, contractRole: e.target.value }))} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none">
                      <option value="DEFAULT_ADMIN_ROLE">DEFAULT_ADMIN_ROLE</option>
                      <option value="MINTER_ROLE">MINTER_ROLE</option>
                      <option value="PAUSER_ROLE">PAUSER_ROLE</option>
                      <option value="URI_MANAGER_ROLE">URI_MANAGER_ROLE</option>
                    </select>
                  </label>
                  <Field label="Role account" value={opsForm.roleAccount} onChange={(v) => setOpsForm((c) => ({ ...c, roleAccount: v }))} placeholder="0x..." />
                  <div className="flex items-end">
                    <button onClick={() => handleOwnerAccessAction("role")} disabled={isWriting || isSwitchingChain || (mode === "server" && !serverStatus.adminReady)} className={`${glow(Boolean(opsForm.contractAddress && opsForm.roleAccount), isWriting || isSwitchingChain || (mode === "server" && !serverStatus.adminReady))} w-full`}>
                      Apply Role Action
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/62">
              <p>Token IDs: <span className="text-white/84">1 = owner, 2 = admin, 3 = AI agent.</span></p>
              <p>These are badge types. 1 is highest access, 2 is normal admin, 3 is the automation badge.</p>
            </div>
          </div>
        )}

        {/* ── Artist Data ── */}
        {workflowStage === "collectibles" && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Artwork JSON HQ</div>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-white/50">
                  Isolated workspace for building the episode artwork metadata, opening claims, and generating the collect links that get written to NFC chips.
                </p>
              </div>
              <button
                onClick={() => {
                  setWorkflowStage("artwork");
                  setDeployTrack("artwork");
                  setArtworkStepIndex(1);
                }}
                className={glow(false, false)}
              >
                Back To Episode Contract
              </button>
            </div>

            <ArtworkMetadataBuilder
              defaults={{
                slug: selectedEpisodeSlot,
                label: episodeCatalog.find((entry) => entry.slug === selectedEpisodeSlot)?.title || episodeForm.name || `Episode ${episodeForm.episodeNumber || "1"}`,
                number: Number(episodeCatalog.find((entry) => entry.slug === selectedEpisodeSlot)?.id || episodeForm.episodeNumber || "1"),
                chainId: deployments.episodeContract.chainId || selectedChainId,
                episodeLabel: `Episode ${episodeCatalog.find((entry) => entry.slug === selectedEpisodeSlot)?.id || episodeForm.episodeNumber || "1"}`,
                episodeDate: episodeCatalog.find((entry) => entry.slug === selectedEpisodeSlot)?.startsAt || "",
                contractAddress: deployments.episodeContract.address,
                baseUri: episodeForm.baseUri,
                collectionMetadataUri: episodeForm.contractMetadataUri,
                origin: appOrigin,
              }}
            />
          </div>
        )}

        {workflowStage === "episodes" && (
          <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4 min-w-0">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Live Episode HQ</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">Already deployed episode contracts</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  This is the post-deploy control room. Use it to manage claim state, pause state, token mint opening, and metadata URIs for episode contracts that already exist.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Episodes</div>
                  <button onClick={() => void refreshManagedCatalog().catch((error) => push(error instanceof Error ? error.message : "Failed to refresh live episode contracts.", "danger"))} className="rounded-2xl border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-white/62">
                    Refresh
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {managedEpisodes.length ? managedEpisodes.map((episode) => (
                    <button
                      key={episode.slug}
                      type="button"
                      onClick={() => setManagedEpisodeSlug(episode.slug)}
                      className={`w-full rounded-[22px] border p-4 text-left transition ${managedEpisode?.slug === episode.slug ? "border-white/24 bg-white/[0.08]" : "border-white/10 bg-black/35 hover:border-white/18 hover:bg-white/[0.05]"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">{episode.slug}</div>
                          <div className="mt-1 break-words text-sm font-medium text-white/84">{episodeCatalog.find((item) => item.slug === episode.slug)?.title || episode.slug}</div>
                        </div>
                        <div className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${episode.claimOpen ? "border-white/18 text-white/74" : "border-white/10 text-white/52"}`}>
                          {episode.claimOpen ? "site live" : "site closed"}
                        </div>
                      </div>
                      <div className="mt-2 break-all font-mono text-[11px] text-white/54">{episode.contractAddress}</div>
                    </button>
                  )) : (
                    <div className="rounded-[22px] border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/58">
                      No deployed episode contracts have been saved yet. Deploy one, sync the artwork JSON once, then it will appear here.
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <div className="space-y-5 min-w-0">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Contract status</div>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                      {managedEpisode ? (episodeCatalog.find((item) => item.slug === managedEpisode.slug)?.title || managedEpisode.slug) : "Pick an episode"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      If mint says coming soon, it is usually because the site claim is still closed here, or because the specific token is not open onchain yet.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setWorkflowStage("launch")} className={glow(false, false)}>Back To Launch Wizard</button>
                    <button onClick={() => setWorkflowStage("collectibles")} className={glow(false, false)}>Open Artwork JSON HQ</button>
                  </div>
                </div>

                {managedEpisode ? (
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Site claim status</div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Public claim page</div>
                          <div className="mt-2 text-sm text-white/84">{managedEpisode.claimOpen ? "Open now" : "Closed now"}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Saved artworks</div>
                          <div className="mt-2 text-sm text-white/84">{managedEpisode.tokens.length} token{managedEpisode.tokens.length === 1 ? "" : "s"}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button onClick={() => void updateManagedClaimOpen(true)} className={glow(!managedEpisode.claimOpen, false)}>Open Site Claim</button>
                        <button onClick={() => void updateManagedClaimOpen(false)} className={glow(managedEpisode.claimOpen, false)}>Close Site Claim</button>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Contract quick actions</div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <button onClick={() => void runEpisodeContractWrite("Pause contract", "pause", [])} className={glow(false, false)}>Pause Contract</button>
                        <button onClick={() => void runEpisodeContractWrite("Unpause contract", "unpause", [])} className={glow(false, false)}>Unpause Contract</button>
                        <button onClick={() => void runEpisodeContractWrite("Open mint for token", "setOpenMint", [normalizePositiveBigInt(managedTokenId, "Token ID"), true])} className={glow(false, false)}>Open Token Mint</button>
                        <button onClick={() => void runEpisodeContractWrite("Close mint for token", "setOpenMint", [normalizePositiveBigInt(managedTokenId, "Token ID"), false])} className={glow(false, false)}>Close Token Mint</button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {managedEpisode ? (
                <div className="grid gap-5 xl:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl xl:col-span-2">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Add token to this contract</div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
                      To add token 1, 2, 3, 4 to the same episode contract:
                      first add the artwork in Artwork JSON HQ, sync it, then register that token here onchain.
                    </p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
                      <Field label="Token ID" value={registerTokenId} onChange={(v) => autofillRegisterTokenFromSavedToken(v)} placeholder="2" />
                      <Field label="Artwork name" value={registerTokenName} onChange={setRegisterTokenName} placeholder="Artwork 2" />
                      <Field label="Token metadata URI" value={registerTokenUri} onChange={setRegisterTokenUri} placeholder="https://axis.show/api/arapp/collect/episode-1/metadata/2.json" />
                      <Field label="Max supply" value={registerTokenMaxSupply} onChange={setRegisterTokenMaxSupply} placeholder="0" />
                      <label className="space-y-2">
                        <span className="text-[11px] uppercase tracking-[0.24em] text-white/48">Open mint now?</span>
                        <select
                          value={registerTokenOpenMint ? "open" : "closed"}
                          onChange={(event) => setRegisterTokenOpenMint(event.target.value === "open")}
                          className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                        >
                          <option value="closed">Closed</option>
                          <option value="open">Open</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => void runEpisodeContractWrite(
                          "Register artwork token",
                          "registerArtwork",
                          [
                            normalizePositiveBigInt(registerTokenId, "Token ID"),
                            registerTokenName.trim(),
                            registerTokenUri.trim(),
                            normalizeNonNegativeBigInt(registerTokenMaxSupply, "Max supply", "0"),
                            registerTokenOpenMint,
                          ],
                        )}
                        className={glow(Boolean(registerTokenId.trim() && registerTokenName.trim()), !(registerTokenId.trim() && registerTokenName.trim()))}
                      >
                        Register Token Onchain
                      </button>
                      <button onClick={() => setWorkflowStage("collectibles")} className={glow(false, false)}>
                        Go Add More Artwork Cards
                      </button>
                    </div>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/60">
                      If the token already exists onchain, do not register it again. Use the controls below to update URI or open mint instead.
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Contract metadata</div>
                    <div className="mt-4 grid gap-4">
                      <Field label="Base URI" value={managedBaseUri} onChange={setManagedBaseUri} placeholder="https://axis.show/api/arapp/collect/episode-1/metadata" />
                      <Field label="Collection metadata URI" value={managedContractMetadataUri} onChange={setManagedContractMetadataUri} placeholder="https://axis.show/api/episodes/episode-1/metadata" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={() => void runEpisodeContractWrite("Base URI update", "setBaseUri", [managedBaseUri.trim()])} className={glow(Boolean(managedBaseUri.trim()), !managedBaseUri.trim())}>
                        Update Base URI
                      </button>
                      <button onClick={() => void runEpisodeContractWrite("Collection metadata update", "setContractMetadataUri", [managedContractMetadataUri.trim()])} className={glow(Boolean(managedContractMetadataUri.trim()), !managedContractMetadataUri.trim())}>
                        Update Collection URI
                      </button>
                    </div>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/60">
                      These are onchain contract settings. Use them after you upload or replace the final JSON.
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Per-token controls</div>
                    <div className="mt-4 grid gap-4">
                      <Field label="Token ID" value={managedTokenId} onChange={setManagedTokenId} placeholder="1" />
                      <Field label="Per-token metadata URI" value={managedTokenUri} onChange={setManagedTokenUri} placeholder="https://axis.show/api/arapp/collect/episode-1/metadata/1.json" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={() => void runEpisodeContractWrite("Token URI update", "setTokenUri", [normalizePositiveBigInt(managedTokenId, "Token ID"), managedTokenUri.trim()])} className={glow(Boolean(managedTokenUri.trim()), !managedTokenUri.trim())}>
                        Update Token URI
                      </button>
                      <button onClick={() => void runEpisodeContractWrite("Open mint for token", "setOpenMint", [normalizePositiveBigInt(managedTokenId, "Token ID"), true])} className={glow(false, false)}>
                        Open Claim For Token
                      </button>
                    </div>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Saved tokens in this episode</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {managedEpisode.tokens.map((token) => (
                          <button
                            key={`${managedEpisode.slug}-${token.tokenId}`}
                            type="button"
                            onClick={() => setManagedTokenId(String(token.tokenId))}
                            className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] ${managedTokenId === String(token.tokenId) ? "border-white/24 bg-white text-black" : "border-white/10 bg-white/[0.03] text-white/70"}`}
                          >
                            Token {token.tokenId}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ── Artist Data ── */}
        {workflowStage === "artists" && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Artist Data HQ</div>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  Editorial enrichment tools for the artist index. Separate from contracts, deploys, and env handoff.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => syncArtistZoraData()} disabled={zoraSyncing} className={glow(true, zoraSyncing)}>
                  {zoraSyncing ? "Syncing Zora" : "Sync Artist Data"}
                </button>
                <button
                  onClick={retryFailedZoraSyncs}
                  disabled={zoraSyncing || !zoraSyncResults.some((item) => item.status === "failed")}
                  className={glow(false, zoraSyncing || !zoraSyncResults.some((item) => item.status === "failed"))}
                >
                  Retry Failed
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">What it does</div>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Pulls Zora profile data for artists with a Zora handle and writes a local cache for public rendering.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Generated fields</div>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Avatar, socials, website, wallet, and up to 2 Zora embeds per artist.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Output</div>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  <code className="rounded bg-white/10 px-1 font-mono text-xs">content/artist-zora-cache.json</code>
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/16 bg-white/[0.05] p-4">
              <div className="text-[11px] uppercase tracking-[0.20em] text-white/56">Workflow</div>
              <div className="mt-3 space-y-1 text-xs leading-5 text-white/60">
                <div><span className="text-white/80">1.</span> Add or update artist records in local JSON</div>
                <div><span className="text-white/80">2.</span> Click <span className="text-white/80">Sync Artist Data</span></div>
                <div><span className="text-white/80">3.</span> Cache writes locally and artist pages read from that cache</div>
                <div><span className="text-white/80">4.</span> No live Zora fetches on the public site</div>
              </div>
              {zoraSyncSummary ? (
                <div className="mt-3 text-xs leading-5 text-white/58">{zoraSyncSummary}</div>
              ) : null}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/16 bg-white/[0.05] p-4">
              <div className="text-[11px] uppercase tracking-[0.20em] text-white/56">Env</div>
              <div className="mt-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/36 mb-2">Add this to `.env` for full Zora access</div>
                <pre className="overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">ZORA_API_KEY=your-zora-api-key</pre>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/58">
                This key is used by the Artist Data sync route to reduce rate limits and improve profile/embed retrieval reliability.
              </p>
            </div>

            {zoraSyncResults.length > 0 ? (
              <div className="mt-5 rounded-[24px] border border-white/16 bg-white/[0.05] p-4">
                <div className="text-[11px] uppercase tracking-[0.20em] text-white/56">Last Sync Log</div>
                <div className="mt-4 space-y-3">
                  {zoraSyncResults.map((entry) => (
                    <div key={`${entry.slug}-${entry.identifier}-${entry.status}`} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">{entry.slug}</div>
                          <div className="mt-1 text-xs leading-5 text-white/50">{entry.identifier || "No identifier"}</div>
                        </div>
                        <div className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${entry.status === "synced" ? "border-white/20 text-white/82" : "border-white/10 text-white/48"}`}>
                          {entry.status}
                        </div>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-white/66">{entry.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ── Handoff ── */}
        {workflowStage === "handoff" && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Env & Handoff</div>
                <p className="mt-1 text-xs leading-5 text-white/50">All the values your .env file needs. Save the manifest, run env:sync, restart the app.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => copyBlock("All env vars", [artworkEnvPreview, bootstrapEnvPreview, tokenGatedEnvPreview, legacyEnvPreview, paymasterEnvPreview].join("\n\n# ---\n\n"))} className={glow(Boolean(totalDeployedCount), false)}>
                  Copy All Env Vars
                </button>
                <button onClick={() => copyBlock("Paymaster env vars", paymasterEnvPreview)} className={glow(Boolean(paymasterAddress), false)}>
                  Copy Paymaster Env
                </button>
                <button
                  onClick={() => {
                    const log = JSON.stringify({ generatedAt: new Date().toISOString(), chain: { id: selectedChainId, ...deploymentChainMeta[selectedChainId] }, activity, contracts: Object.fromEntries([...artworkDeploymentSteps, ...legacyDeploymentSteps].map((k) => [k, { label: deploymentLabels[k], address: deployments[k].address, txHash: deployments[k].txHash, deployedAt: deployments[k].deployedAt, verification: deployments[k].verification }])) }, storageReplacer, 2);
                    downloadText(`spectra-deploy-log-${Date.now()}.json`, log, "application/json");
                    push("Deployment log downloaded.", "success");
                  }}
                  className={glow(Boolean(totalDeployedCount || activity.length), false)}
                >
                  Download Log JSON
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Auto-sync */}
              <div className="rounded-[24px] border border-white/16 bg-white/[0.05] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.20em] text-white/56">Auto-sync .env</div>
                    <div className="mt-1 text-sm font-medium text-white">Save manifest → run one command → .env updated</div>
                    <p className="mt-1.5 text-xs leading-5 text-white/52">
                      Saves your deployed addresses to <code className="rounded bg-white/10 px-1 font-mono">deployments.json</code>, then{" "}
                      <code className="rounded bg-white/10 px-1 font-mono">npm run env:sync</code> patches only the contract address keys in your{" "}
                      <code className="rounded bg-white/10 px-1 font-mono">.env</code> — everything else stays untouched.
                    </p>
                  </div>
                  <button onClick={saveManifest} disabled={!totalDeployedCount} className={`${glow(Boolean(totalDeployedCount), !totalDeployedCount)} shrink-0`}>
                    Save to Manifest
                  </button>
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/36 mb-2">Steps after clicking Save to Manifest</div>
                  <div className="space-y-1 text-xs leading-5 text-white/60">
                    <div><span className="text-white/80">1.</span> Click <span className="text-white/80">Save to Manifest</span> — writes <code className="rounded bg-white/10 px-1 font-mono">deployments.json</code></div>
                    <div><span className="text-white/80">2.</span> In your terminal: <code className="rounded bg-white/10 px-1 font-mono text-white/80">npm run env:sync</code></div>
                    <div><span className="text-white/80">3.</span> Restart the dev server — new addresses are live</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[...artworkDeploymentSteps, ...legacyDeploymentSteps].map((k) => (
                    <div key={k} className={`rounded-xl border px-3 py-2 text-xs ${deployments[k].address ? "border-white/16 bg-white/[0.04]" : "border-white/8 bg-black/20"}`}>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/38">{deploymentLabels[k]}</div>
                      <div className={`mt-1 font-mono truncate ${deployments[k].address ? "text-white/80" : "text-white/28"}`}>
                        {deployments[k].address ? `${deployments[k].address.slice(0, 8)}…` : "not deployed"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artwork env */}
              <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Artwork Contracts Env</div>
                    <p className="mt-1 text-xs text-white/40">Season Registry + Episode Contract addresses.</p>
                  </div>
                  <button onClick={() => copyBlock("Artwork env", artworkEnvPreview)} className={glow(Boolean(artworkDeployedCount), false)}>Copy</button>
                </div>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">{artworkEnvPreview}</pre>
              </div>

              {/* Bootstrap env */}
              <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Bootstrap Env</div>
                  <button onClick={() => copyBlock("Bootstrap env", bootstrapEnvPreview)} className={glow(false, false)}>Copy</button>
                </div>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">{bootstrapEnvPreview}</pre>
              </div>

              {/* Token gated env */}
              <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Token Gated Env</div>
                  <button onClick={() => copyBlock("Token-gated env", tokenGatedEnvPreview)} className={glow(Boolean(deployments.ownerAccess.address), false)}>Copy</button>
                </div>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">{tokenGatedEnvPreview}</pre>
              </div>

              {/* Legacy env */}
              <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Legacy Contract Env</div>
                  <button onClick={() => copyBlock("Legacy env", legacyEnvPreview)} className={glow(Boolean(legacyDeployedCount), false)}>Copy</button>
                </div>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">{legacyEnvPreview}</pre>
              </div>

              {/* Session info */}
              <div className="rounded-2xl border border-white/12 bg-black/30 p-4 text-sm leading-6 text-white/58">
                <p>Access mode: {isBootstrapSession ? "bootstrap wallet session" : "token-gated wallet session"}</p>
                <p>Server deploy readiness: <span className={stateText(serverStatus.deployReady ? "ready" : "blocked")}>{serverStatus.deployReady ? "ready" : "missing env"}</span></p>
                <p>Pending deployment: {pendingDeployment ? deploymentLabels[pendingDeployment.key] : "none"}</p>
                <p>Auto verification: {verifyingKey ? `running for ${deploymentLabels[verifyingKey]}` : "idle"}</p>
                <p>Wallet route: {deploymentChainMeta[selectedChainId].label}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Feedback bar ── */}
        {feedback && (
          <div className="rounded-[24px] border border-white/12 bg-white/[0.06] px-4 py-4 text-sm leading-6 text-white/82 backdrop-blur-xl break-words">
            {feedback}
          </div>
        )}
      </div>
    </section>
  );
}
