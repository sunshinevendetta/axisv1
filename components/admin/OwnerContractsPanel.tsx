"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { getAddress, isAddress } from "viem";
import { useAccount, useChainId, useConnect, useDeployContract, useDisconnect, useSignMessage, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { defaultFounderBaseUri, defaultFounderContractMetadataUri, deploymentArtifacts, deploymentChainMeta, deploymentGuides, deploymentLabels, deploymentSteps, type DeploymentChainId, type DeploymentContractKey } from "@/src/lib/deployment-hq";
import { ownerAccessAbi, OWNER_ACCESS_CONTRACT_ROLES, normalizeOwnerAccessContractRoleName, normalizeOwnerAccessPresetRole } from "@/src/lib/owner-access-contract";

type SessionState = { authenticated: boolean; configured: boolean; subject?: string | null; walletConfigured?: boolean; bootstrapOnly?: boolean };
type ServerStatus = { deployReady: boolean; writeReady: boolean; adminReady: boolean; defaults: { contractAddress: string; adminAddress: string; initialMinterAddress: string; baseUri: string; contractMetadataUri: string; deployRpcUrl: string; ownerTokenGate: string }; missing: { deploy: string[]; mint: string[]; admin: string[] } };
type VerificationProvider = { status: "idle" | "disabled" | "submitted" | "pending" | "verified" | "failed"; message: string; url?: string; guid?: string };
type DeploymentRecord = { address: string; txHash: string; chainId: DeploymentChainId | null; deployedAt: string; constructorArgs: unknown[]; verification: { basescan: VerificationProvider; blockscout: VerificationProvider } };
type Deployments = Record<DeploymentContractKey, DeploymentRecord>;
type PendingDeployment = { key: DeploymentContractKey; txHash: `0x${string}`; constructorArgs: unknown[] };
type Activity = { id: string; tone: "info" | "success" | "warning" | "danger"; text: string };
type WorkflowStage = "deploy" | "permissions" | "handoff" | "events";

const emptySession: SessionState = { authenticated: false, configured: false, subject: null };
const emptyStatus: ServerStatus = { deployReady: false, writeReady: false, adminReady: false, defaults: { contractAddress: "", adminAddress: "", initialMinterAddress: "", baseUri: "ipfs://spectra-owner-access/{id}.json", contractMetadataUri: "ipfs://spectra-owner-access/contract.json", deployRpcUrl: "", ownerTokenGate: "" }, missing: { deploy: [], mint: [], admin: [] } };
const emptyProvider = (): VerificationProvider => ({ status: "idle", message: "Waiting for deployment." });
const emptyRecord = (): DeploymentRecord => ({ address: "", txHash: "", chainId: null, deployedAt: "", constructorArgs: [], verification: { basescan: emptyProvider(), blockscout: emptyProvider() } });
const emptyDeployments = (): Deployments => ({ ownerAccess: emptyRecord(), submissionRegistry: emptyRecord(), founderMembership: emptyRecord(), eventRegistry: emptyRecord() });
const storageKey = "spectra-deployment-hq-v2";

function storageReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? { __type: "bigint", value: value.toString() } : value;
}

function storageReviver(_key: string, value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "__type" in value &&
    "value" in value &&
    (value as { __type?: string }).__type === "bigint"
  ) {
    return BigInt((value as { value: string }).value);
  }
  return value;
}

function short(value?: string, lead = 6, tail = 4) { return value ? `${value.slice(0, lead)}...${value.slice(-tail)}` : "Pending"; }
function normalizeAddress(value: string, label: string) { if (!isAddress(value)) throw new Error(`${label} must be a valid address.`); return getAddress(value); }
function normalizePositiveBigInt(value: string, label: string, fallback = "1") { const raw = value.trim() || fallback; try { const parsed = BigInt(raw); if (parsed <= BigInt(0)) throw new Error(); return parsed; } catch { throw new Error(`${label} must be a positive integer.`); } }
function valid(value: string) { return isAddress(value); }
function glow(active?: boolean, disabled?: boolean) { if (disabled) return "rounded-2xl border border-red-500/35 bg-black/45 px-5 py-3 text-sm uppercase tracking-[0.16em] text-red-200/70 shadow-[0_0_18px_rgba(255,59,48,0.2)]"; return `rounded-2xl border px-5 py-3 text-sm uppercase tracking-[0.16em] transition-colors duration-200 hover:border-[#39ff14]/70 hover:text-white hover:shadow-[0_0_24px_rgba(57,255,20,0.34)] ${active ? "border-white/28 bg-white/[0.1] text-white hover:bg-white/[0.14]" : "border-white/14 bg-black/55 text-white/82 hover:bg-white/[0.06]"}`; }
function tone(_t: Activity["tone"]) { return "border-white/10 bg-white/[0.05] text-white/78"; }
function verifyTone(_status: VerificationProvider["status"]) { return "border-white/12 bg-white/[0.05] text-white/72"; }
function stateText(status: "blocked" | "ready" | "live" | "pending" | "verified" | "failed") { return status === "blocked" || status === "failed" ? "text-white/46" : status === "ready" || status === "live" || status === "verified" ? "text-white/88" : "text-white/62"; }
function verificationLabel(status: VerificationProvider["status"]) { return status === "verified" ? "verified" : status === "submitted" || status === "pending" ? "processing" : status === "disabled" ? "needs setup" : status === "failed" ? "attention" : "waiting"; }
function trimMessage(value: string) { return value.length > 140 ? `${value.slice(0, 137)}...` : value; }
function describeValue(value: unknown) { return typeof value === "bigint" ? value.toString() : typeof value === "string" ? value : JSON.stringify(value); }
function missingDependenciesFor(key: DeploymentContractKey, deployments: Deployments) {
  return deploymentGuides[key].dependsOn.filter((dependency) => !deployments[dependency].address);
}
function stepStatusFor(key: DeploymentContractKey, ready: boolean, deployments: Deployments) {
  if (deployments[key].address) return "live";
  if (!ready) return "needs-input";
  if (missingDependenciesFor(key, deployments).length) return "dependency";
  return "ready";
}
function plainContractSummary(key: DeploymentContractKey) {
  if (key === "ownerAccess") return "This is the master key system. It decides which wallets are allowed into HQ tools.";
  if (key === "submissionRegistry") return "This is the inbox for applications. It stores who applied, what they submitted, and whether they were approved.";
  if (key === "founderMembership") return "This is the actual founder token contract. When someone is approved, this contract is what mints their membership.";
  return "This is the event permissions layer. It controls who can manage events and who gets access for each event.";
}
function plainFieldSummary(key: DeploymentContractKey) {
  if (key === "ownerAccess") return "You are choosing who controls the system and where the token metadata lives.";
  if (key === "submissionRegistry") return "You are choosing the wallet that can review applications and pause the registry if needed.";
  if (key === "founderMembership") return "You are wiring the founder token contract to the correct registry and setting the collection metadata plus supply cap.";
  return "You are choosing the wallet that will manage event permissions.";
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

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="space-y-2"><span className="text-[11px] uppercase tracking-[0.24em] text-white/48">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/24 focus:border-white/35" /></label>;
}

function LinkOut({ href, label }: { href?: string; label: string }) {
  if (!href) return <span className="text-white/40">{label}</span>;
  return <a href={href} target="_blank" rel="noreferrer" className="text-white/76 hover:text-white">{label}</a>;
}

export default function OwnerContractsPanel() {
  const router = useRouter();
  const [session, setSession] = useState(emptySession);
  const [serverStatus, setServerStatus] = useState(emptyStatus);
  const [mode, setMode] = useState<"wallet" | "server">("wallet");
  const [selectedChainId, setSelectedChainId] = useState<DeploymentChainId>(baseSepolia.id);
  const [feedback, setFeedback] = useState("");
  const [deployments, setDeployments] = useState<Deployments>(emptyDeployments);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [ownerAccessForm, setOwnerAccessForm] = useState({ adminAddress: "", initialMinterAddress: "", baseUri: "ipfs://spectra-owner-access/{id}.json", contractMetadataUri: "ipfs://spectra-owner-access/contract.json" });
  const [submissionAdmin, setSubmissionAdmin] = useState("");
  const [founderForm, setFounderForm] = useState({ adminAddress: "", submissionRegistryAddress: "", baseUri: defaultFounderBaseUri, contractMetadataUri: defaultFounderContractMetadataUri, maxSupply: "333" });
  const [eventAdmin, setEventAdmin] = useState("");
  const [opsForm, setOpsForm] = useState({ contractAddress: "", recipient: "", role: "owner", tokenId: "", amount: "1", revokeAccount: "", revokeTokenId: "2", revokeAmount: "1", roleAction: "grant", contractRole: "MINTER_ROLE", roleAccount: "" });
  const [pendingDeployment, setPendingDeployment] = useState<PendingDeployment | null>(null);
  const [verifyingKey, setVerifyingKey] = useState<DeploymentContractKey | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>("deploy");

  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { deployContractAsync, isPending: isDeploying } = useDeployContract();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const deployReceipt = useWaitForTransactionReceipt({ hash: pendingDeployment?.txHash });

  const deployedCount = useMemo(() => deploymentSteps.filter((key) => Boolean(deployments[key].address)).length, [deployments]);
  const verifiedCount = useMemo(() => deploymentSteps.filter((key) => deployments[key].verification.basescan.status === "verified" || deployments[key].verification.blockscout.status === "verified").length, [deployments]);
  const nextStep = useMemo(() => deploymentSteps.find((key) => !deployments[key].address) ?? null, [deployments]);
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
  const contractEnvPreview = useMemo(() => [
    `OWNER_ACCESS_CONTRACT_ADDRESS=${deployments.ownerAccess.address}`,
    `SPECTRA_SUBMISSION_REGISTRY_ADDRESS=${deployments.submissionRegistry.address}`,
    `SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS=${deployments.founderMembership.address}`,
    `SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS=${deployments.eventRegistry.address}`,
  ].join("\n"), [deployments]);
  const envJsonPreview = useMemo(() => JSON.stringify({
    EPISODES_ADMIN_SESSION_SECRET: "<keep-your-existing-secret>",
    EPISODES_OWNER_ERC1155_ADDRESS: deployments.ownerAccess.address || "",
    EPISODES_OWNER_ERC1155_TOKEN_ID: deployments.ownerAccess.address ? "1,2" : "",
    EPISODES_OWNER_RPC_URL: deployments.ownerAccess.address ? `<rpc-url-for-${deploymentChainMeta[selectedChainId].shortLabel.toLowerCase()}>` : "",
    EPISODES_OWNER_ALLOWLIST: "",
    OWNER_ACCESS_CONTRACT_ADDRESS: deployments.ownerAccess.address || "",
    SPECTRA_SUBMISSION_REGISTRY_ADDRESS: deployments.submissionRegistry.address || "",
    SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS: deployments.founderMembership.address || "",
    SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS: deployments.eventRegistry.address || "",
  }, null, 2), [deployments, selectedChainId]);
  const deploymentManifest = useMemo(() => JSON.stringify({
    version: 1,
    generatedAt: new Date().toISOString(),
    chain: {
      id: selectedChainId,
      ...deploymentChainMeta[selectedChainId],
    },
    access: {
      recommendedMode: deployments.ownerAccess.address ? "token-gated" : "bootstrap-only",
      bootstrapEnv: Object.fromEntries(bootstrapEnvPreview.split("\n").map((line) => {
        const [key, ...rest] = line.split("=");
        return [key, rest.join("=")];
      })),
      tokenGatedEnv: Object.fromEntries(tokenGatedEnvPreview.split("\n").map((line) => {
        const [key, ...rest] = line.split("=");
        return [key, rest.join("=")];
      })),
      contractEnv: Object.fromEntries(contractEnvPreview.split("\n").map((line) => {
        const [key, ...rest] = line.split("=");
        return [key, rest.join("=")];
      })),
    },
    operatorLog: activity,
    contracts: Object.fromEntries(
      deploymentSteps
        .map((key) => [
          key,
          {
            label: deploymentLabels[key],
            guide: deploymentGuides[key],
            deployed: Boolean(deployments[key].address),
            address: deployments[key].address,
            txHash: deployments[key].txHash,
            chainId: deployments[key].chainId,
            deployedAt: deployments[key].deployedAt,
            constructorArgs: deployments[key].constructorArgs,
            constructorPreview: deploymentGuides[key].constructorDocs.map((doc, index) => ({
              field: doc.name,
              key: doc.key,
              value: describeValue(deployments[key].constructorArgs[index] ?? ""),
            })),
            verification: deployments[key].verification,
            envKeys: deploymentGuides[key].envKeys,
          },
        ]),
    ),
    envCopyPaste: JSON.parse(envJsonPreview),
  }, storageReplacer, 2), [activity, bootstrapEnvPreview, contractEnvPreview, deployments, envJsonPreview, selectedChainId, tokenGatedEnvPreview]);
  const isBootstrapSession = Boolean(session.bootstrapOnly || session.subject?.startsWith("bootstrap:"));

  function push(text: string, toneValue: Activity["tone"] = "info") { const message = trimMessage(text); setFeedback(message); setActivity((current) => [{ id: `${Date.now()}-${Math.random()}`, tone: toneValue, text: message }, ...current].slice(0, 8)); }
  function patchDeployment(key: DeploymentContractKey, value: Partial<DeploymentRecord>) { setDeployments((current) => ({ ...current, [key]: { ...current[key], ...value, verification: value.verification ? value.verification : current[key].verification } })); }
  async function ensureWalletChain() { if (!isConnected) throw new Error("Connect a wallet first."); if (currentChainId !== selectedChainId) await switchChainAsync({ chainId: selectedChainId as never }); }

  function constructorArgsFor(key: DeploymentContractKey): unknown[] {
    if (key === "ownerAccess") return [normalizeAddress(ownerAccessForm.adminAddress, "Owner access admin"), ownerAccessForm.initialMinterAddress.trim() ? normalizeAddress(ownerAccessForm.initialMinterAddress, "Initial minter") : normalizeAddress(address || ownerAccessForm.adminAddress, "Signer"), ownerAccessForm.baseUri.trim(), ownerAccessForm.contractMetadataUri.trim()];
    if (key === "submissionRegistry") return [normalizeAddress(submissionAdmin, "Submission registry admin")];
    if (key === "founderMembership") return [normalizeAddress(founderForm.adminAddress, "Founder membership admin"), normalizeAddress(founderForm.submissionRegistryAddress, "Submission registry"), founderForm.baseUri.trim(), founderForm.contractMetadataUri.trim(), normalizePositiveBigInt(founderForm.maxSupply, "Max supply")];
    return [normalizeAddress(eventAdmin, "Event registry admin")];
  }

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
      const summary = `${deploymentLabels[key]} verification ${data.results.basescan.status} / ${data.results.blockscout.status}.`;
      push(summary, data.results.basescan.status === "verified" || data.results.blockscout.status === "verified" ? "success" : "info");
    } catch (error) {
      patchDeployment(key, { verification: { basescan: { status: "failed", message: error instanceof Error ? error.message : "Verification failed." }, blockscout: { status: "failed", message: error instanceof Error ? error.message : "Verification failed." } } });
      push(error instanceof Error ? error.message : "Verification failed.", "danger");
    } finally {
      setVerifyingKey(null);
    }
  }

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const stored = JSON.parse(raw, storageReviver) as { deployments?: Deployments; ownerAccessForm?: typeof ownerAccessForm; submissionAdmin?: string; founderForm?: typeof founderForm; eventAdmin?: string; activity?: Activity[] };
      if (stored.deployments) setDeployments({ ...emptyDeployments(), ...stored.deployments });
      if (stored.ownerAccessForm) setOwnerAccessForm((current) => ({ ...current, ...stored.ownerAccessForm }));
      if (typeof stored.submissionAdmin === "string") setSubmissionAdmin(stored.submissionAdmin);
      if (stored.founderForm) setFounderForm((current) => ({ ...current, ...stored.founderForm }));
      if (typeof stored.eventAdmin === "string") setEventAdmin(stored.eventAdmin);
      if (stored.activity) setActivity(stored.activity);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ deployments, ownerAccessForm, submissionAdmin, founderForm, eventAdmin, activity }, storageReplacer),
    );
  }, [activity, deployments, ownerAccessForm, submissionAdmin, founderForm, eventAdmin]);

  useEffect(() => {
    void fetch("/api/admin/session", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Failed to load session.");
      setSession((await response.json()) as SessionState);
    }).catch((error) => push(error instanceof Error ? error.message : "Failed to load session.", "danger"));
  }, []);

  useEffect(() => {
    if (!session.authenticated) return;
    void fetch("/api/admin/contracts/owner-access", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Failed to load server config.");
      const data = (await response.json()) as ServerStatus;
      setServerStatus(data);
      setOwnerAccessForm((current) => ({ ...current, adminAddress: current.adminAddress || data.defaults.adminAddress, initialMinterAddress: current.initialMinterAddress || data.defaults.initialMinterAddress, baseUri: current.baseUri || data.defaults.baseUri, contractMetadataUri: current.contractMetadataUri || data.defaults.contractMetadataUri }));
      setSubmissionAdmin((current) => current || data.defaults.adminAddress);
      setFounderForm((current) => ({ ...current, adminAddress: current.adminAddress || data.defaults.adminAddress }));
      setEventAdmin((current) => current || data.defaults.adminAddress);
      setOpsForm((current) => ({ ...current, contractAddress: current.contractAddress || data.defaults.contractAddress }));
    }).catch((error) => push(error instanceof Error ? error.message : "Failed to load server config.", "danger"));
  }, [session.authenticated]);

  useEffect(() => {
    if (!deployReceipt.isSuccess || !pendingDeployment?.key || !deployReceipt.data.contractAddress) return;
    const contractAddress = getAddress(deployReceipt.data.contractAddress);
    patchDeployment(pendingDeployment.key, { address: contractAddress, txHash: pendingDeployment.txHash, chainId: selectedChainId, deployedAt: new Date().toISOString(), constructorArgs: pendingDeployment.constructorArgs, verification: { basescan: { status: "pending", message: "Queued for verification." }, blockscout: { status: "pending", message: "Queued for verification." } } });
    if (pendingDeployment.key === "ownerAccess") setOpsForm((current) => ({ ...current, contractAddress }));
    if (pendingDeployment.key === "submissionRegistry") setFounderForm((current) => ({ ...current, submissionRegistryAddress: contractAddress }));
    push(`${deploymentLabels[pendingDeployment.key]} deployed at ${short(contractAddress, 8, 6)}.`, "success");
    void verifyDeployment(pendingDeployment.key, contractAddress, pendingDeployment.constructorArgs);
    setPendingDeployment(null);
  }, [deployReceipt.isSuccess, deployReceipt.data, pendingDeployment, selectedChainId]);

  useEffect(() => {
    if (!nextStep) return;
    const nextIndex = deploymentSteps.indexOf(nextStep);
    if (nextIndex >= 0) setActiveStepIndex(nextIndex);
  }, [nextStep]);

  async function handleWalletLogin() {
    if (!address) return push("Connect a wallet first.", "warning");
    const challengeResponse = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "challenge", address }) });
    const challengeData = await challengeResponse.json();
    if (!challengeResponse.ok || !challengeData.message) return push(challengeData.error || "Failed to create wallet challenge.", "danger");
    const signature = await signMessageAsync({ message: challengeData.message });
    const verifyResponse = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "wallet", address, signature }) });
    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok) return push(verifyData.error || "Wallet sign-in failed.", "danger");
    setSession((current) => ({ ...current, authenticated: true, subject: `wallet:${address}` }));
    push("Wallet verified. Deployment HQ unlocked.", "success");
  }

  async function copyBlock(label: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      push(`${label} copied.`, "success");
    } catch {
      push(`Could not copy ${label.toLowerCase()}.`, "danger");
    }
  }

  function resetDeploymentWorkspace() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }

    setDeployments(emptyDeployments());
    setActivity([]);
    setPendingDeployment(null);
    setVerifyingKey(null);
    setFeedback("");
    setActiveStepIndex(0);
    setWorkflowStage("deploy");
    setOwnerAccessForm({
      adminAddress: serverStatus.defaults.adminAddress || "",
      initialMinterAddress: serverStatus.defaults.initialMinterAddress || "",
      baseUri: serverStatus.defaults.baseUri || "ipfs://spectra-owner-access/{id}.json",
      contractMetadataUri: serverStatus.defaults.contractMetadataUri || "ipfs://spectra-owner-access/contract.json",
    });
    setSubmissionAdmin(serverStatus.defaults.adminAddress || "");
    setFounderForm({
      adminAddress: serverStatus.defaults.adminAddress || "",
      submissionRegistryAddress: "",
      baseUri: defaultFounderBaseUri,
      contractMetadataUri: defaultFounderContractMetadataUri,
      maxSupply: "333",
    });
    setEventAdmin(serverStatus.defaults.adminAddress || "");
    setOpsForm({
      contractAddress: serverStatus.defaults.contractAddress || "",
      recipient: "",
      role: "owner",
      tokenId: "",
      amount: "1",
      revokeAccount: "",
      revokeTokenId: "2",
      revokeAmount: "1",
      roleAction: "grant",
      contractRole: "MINTER_ROLE",
      roleAccount: "",
    });
    push("Saved deployment cache cleared. HQ is back at zero.", "warning");
  }

  async function handleServerAction(payload: Record<string, string>) {
    const response = await fetch("/api/admin/contracts/owner-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Server action failed.");
    if (data.contractAddress) {
      const contractAddress = getAddress(data.contractAddress);
      const constructorArgs = constructorArgsFor("ownerAccess");
      patchDeployment("ownerAccess", { address: contractAddress, txHash: data.transactionHash || "", chainId: selectedChainId, deployedAt: new Date().toISOString(), constructorArgs, verification: { basescan: { status: "pending", message: "Queued for verification." }, blockscout: { status: "pending", message: "Queued for verification." } } });
      setOpsForm((current) => ({ ...current, contractAddress }));
      void verifyDeployment("ownerAccess", contractAddress, constructorArgs, selectedChainId);
    }
    push(`${data.summary || "Completed."}${data.transactionHash ? ` ${short(data.transactionHash, 10, 8)}` : ""}`, "success");
  }

  async function deployStep(key: DeploymentContractKey) {
    try {
      const missingDependencies = missingDependenciesFor(key, deployments);
      if (mode === "server") {
        if (key !== "ownerAccess") return push("Server mode is wired for owner-access only. Use wallet mode for the full stack.", "warning");
        await handleServerAction({ action: "deploy", adminAddress: ownerAccessForm.adminAddress, initialMinterAddress: ownerAccessForm.initialMinterAddress, baseUri: ownerAccessForm.baseUri, contractMetadataUri: ownerAccessForm.contractMetadataUri });
        return;
      }
      if (missingDependencies.length) {
        push(`Deploying ${deploymentLabels[key]} before ${missingDependencies.map((dependency) => deploymentLabels[dependency]).join(", ")}. Make sure you really want that constructor order.`, "warning");
      }
      await ensureWalletChain();
      const constructorArgs = constructorArgsFor(key);
      const hash = key === "ownerAccess" ? await deployContractAsync({ abi: deploymentArtifacts.ownerAccess.abi, bytecode: deploymentArtifacts.ownerAccess.bytecode as `0x${string}`, chainId: selectedChainId as never, args: constructorArgs }) : key === "submissionRegistry" ? await deployContractAsync({ abi: deploymentArtifacts.submissionRegistry.abi, bytecode: deploymentArtifacts.submissionRegistry.bytecode as `0x${string}`, chainId: selectedChainId as never, args: constructorArgs }) : key === "founderMembership" ? await deployContractAsync({ abi: deploymentArtifacts.founderMembership.abi, bytecode: deploymentArtifacts.founderMembership.bytecode as `0x${string}`, chainId: selectedChainId as never, args: constructorArgs }) : await deployContractAsync({ abi: deploymentArtifacts.eventRegistry.abi, bytecode: deploymentArtifacts.eventRegistry.bytecode as `0x${string}`, chainId: selectedChainId as never, args: constructorArgs });
      setPendingDeployment({ key, txHash: hash, constructorArgs });
      patchDeployment(key, { txHash: hash, chainId: selectedChainId, constructorArgs });
      push(`${deploymentLabels[key]} deployment submitted. ${short(hash, 10, 8)}`, "info");
    } catch (error) {
      push(error instanceof Error ? error.message : "Deployment failed.", "danger");
    }
  }

  async function linkFounderMembership() {
    try {
      await ensureWalletChain();
      const hash = await writeContractAsync({ address: normalizeAddress(founderForm.submissionRegistryAddress || deployments.submissionRegistry.address, "Submission registry"), abi: deploymentArtifacts.submissionRegistry.abi, chainId: selectedChainId as never, functionName: "setFounderMembershipContract", args: [normalizeAddress(deployments.founderMembership.address, "Founder membership")] });
      push(`Founder membership linked: ${short(hash, 10, 8)}`, "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "Linking failed.", "danger");
    }
  }

  async function handleOwnerAccessAction(kind: "mint" | "revoke" | "role") {
    try {
      if (mode === "wallet") {
        await ensureWalletChain();
        if (kind === "mint") {
          const contractAddress = normalizeAddress(opsForm.contractAddress, "Contract address");
          const recipient = normalizeAddress(opsForm.recipient, "Recipient");
          const role = normalizeOwnerAccessPresetRole(opsForm.role);
          const hash = role === "owner" ? await writeContractAsync({ address: contractAddress, abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: "mintOwner", args: [recipient] }) : role === "admin" ? await writeContractAsync({ address: contractAddress, abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: "mintAdmin", args: [recipient] }) : role === "aiagent" ? await writeContractAsync({ address: contractAddress, abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: "mintAiAgent", args: [recipient] }) : await writeContractAsync({ address: contractAddress, abi: ownerAccessAbi, chainId: selectedChainId as never, functionName: "mint", args: [recipient, normalizePositiveBigInt(opsForm.tokenId, "Token ID"), normalizePositiveBigInt(opsForm.amount, "Amount")] });
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

  const ownerReady = valid(ownerAccessForm.adminAddress) && Boolean(ownerAccessForm.baseUri.trim()) && Boolean(ownerAccessForm.contractMetadataUri.trim());
  const submissionReady = valid(submissionAdmin);
  const founderReady = valid(founderForm.adminAddress) && valid(founderForm.submissionRegistryAddress) && Boolean(founderForm.baseUri.trim()) && Boolean(founderForm.contractMetadataUri.trim()) && Boolean(founderForm.maxSupply.trim());
  const eventReady = valid(eventAdmin);
  const founderLinkReady = Boolean(deployments.founderMembership.address && (founderForm.submissionRegistryAddress || deployments.submissionRegistry.address));
  const fullStackReady = deployedCount === deploymentSteps.length;
  const hasSavedProgress = deployedCount > 0 || activity.length > 0;

  if (!session.configured) {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_30%),linear-gradient(180deg,#020202,#000)] px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.32em] text-white/64">Deployment HQ</div>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Start here: create the HQ secret first.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">
            Before any wallet access or contract deployment, this page needs <code>EPISODES_ADMIN_SESSION_SECRET</code> in your local
            environment. The flow is simple: generate it, paste it into <code>.env</code>, then come back here.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 1</div>
              <div className="mt-2 text-lg font-semibold text-white">Generate the secret</div>
              <p className="mt-2 text-sm leading-6 text-white/62">Open the secret tool and copy the ready-to-paste env line.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 2</div>
              <div className="mt-2 text-lg font-semibold text-white">Paste into `.env`</div>
              <p className="mt-2 text-sm leading-6 text-white/62">Add the copied line locally so bootstrap access is enabled.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 3</div>
              <div className="mt-2 text-lg font-semibold text-white">Refresh HQ</div>
              <p className="mt-2 text-sm leading-6 text-white/62">Come back here and continue into wallet unlock and guided deployment.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => router.push("/tools/session-secret")} className={glow(true, false)}>
              Open Secret Tool
            </button>
            <button onClick={() => window.location.reload()} className={glow(false, false)}>
              I Added It, Refresh HQ
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!session.authenticated) {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_28%),linear-gradient(180deg,#020202,#000)] px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.32em] text-white/64">Deployment HQ</div>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Unlock HQ, then follow the guided deploy path.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">
            This page now works like a sequence: connect your wallet, sign once, then use the guided setup button inside HQ to move
            through contracts and finally into Episodes HQ.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 1</div>
              <div className="mt-2 text-lg font-semibold text-white">Connect wallet</div>
              <p className="mt-2 text-sm leading-6 text-white/62">Choose a wallet connection below.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 2</div>
              <div className="mt-2 text-lg font-semibold text-white">Sign once</div>
              <p className="mt-2 text-sm leading-6 text-white/62">This unlocks Deployment HQ for the connected wallet.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 3</div>
              <div className="mt-2 text-lg font-semibold text-white">Continue guided setup</div>
              <p className="mt-2 text-sm leading-6 text-white/62">The next screen will move you step by step through deployment.</p>
            </div>
          </div>

          {!isConnected ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {connectors.map((connector) => (
                <button key={connector.id} onClick={() => connect({ connector })} disabled={isConnecting} className={glow(true, isConnecting)}>
                  {connector.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-white/12 bg-white/[0.05] px-4 py-4 text-sm break-all text-white/82">
                {address}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={handleWalletLogin} className={glow(true, false)}>
                  Sign With Wallet
                </button>
                <button onClick={() => disconnect()} className={glow(false, false)}>
                  Disconnect
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => router.push("/tools/session-secret")} className={glow(false, false)}>
              Open Secret Tool
            </button>
          </div>

          {feedback ? <p className="mt-4 text-sm leading-6 text-white/68">{feedback}</p> : null}
        </div>
      </section>
    );
  }

  const cards = [
    { key: "ownerAccess" as const, step: "Step 1", title: "Owner Access 1155", ready: ownerReady, fields: <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Admin address" value={ownerAccessForm.adminAddress} onChange={(v) => setOwnerAccessForm((c) => ({ ...c, adminAddress: v }))} placeholder="0x..." /><Field label="Initial minter" value={ownerAccessForm.initialMinterAddress} onChange={(v) => setOwnerAccessForm((c) => ({ ...c, initialMinterAddress: v }))} placeholder="0x..." /><Field label="Base URI" value={ownerAccessForm.baseUri} onChange={(v) => setOwnerAccessForm((c) => ({ ...c, baseUri: v }))} placeholder="ipfs://..." /><Field label="Contract metadata URI" value={ownerAccessForm.contractMetadataUri} onChange={(v) => setOwnerAccessForm((c) => ({ ...c, contractMetadataUri: v }))} placeholder="ipfs://..." /></div> },
    { key: "submissionRegistry" as const, step: "Step 2", title: "Submission Registry", ready: submissionReady, fields: <div className="mt-5"><Field label="Admin address" value={submissionAdmin} onChange={setSubmissionAdmin} placeholder="0x..." /></div> },
    { key: "founderMembership" as const, step: "Step 3", title: "Founder Membership S1", ready: founderReady, fields: <><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Admin address" value={founderForm.adminAddress} onChange={(v) => setFounderForm((c) => ({ ...c, adminAddress: v }))} placeholder="0x..." /><Field label="Submission registry" value={founderForm.submissionRegistryAddress} onChange={(v) => setFounderForm((c) => ({ ...c, submissionRegistryAddress: v }))} placeholder="0x..." /><Field label="Base URI" value={founderForm.baseUri} onChange={(v) => setFounderForm((c) => ({ ...c, baseUri: v }))} placeholder="ipfs://..." /><Field label="Contract metadata URI" value={founderForm.contractMetadataUri} onChange={(v) => setFounderForm((c) => ({ ...c, contractMetadataUri: v }))} placeholder="ipfs://..." /><Field label="Max supply" value={founderForm.maxSupply} onChange={(v) => setFounderForm((c) => ({ ...c, maxSupply: v }))} placeholder="333" /></div><div className="mt-4"><button onClick={linkFounderMembership} disabled={!founderLinkReady || isWriting || isSwitchingChain} className={glow(founderLinkReady && Boolean(deployments.founderMembership.address), !founderLinkReady || isWriting || isSwitchingChain)}>Link Founder Into Registry</button></div></> },
    { key: "eventRegistry" as const, step: "Step 4", title: "Event Access Registry", ready: eventReady, fields: <div className="mt-5"><Field label="Admin address" value={eventAdmin} onChange={setEventAdmin} placeholder="0x..." /></div> },
  ];
  const activeCard = cards[Math.min(activeStepIndex, cards.length - 1)];
  const activeGuide = deploymentGuides[activeCard.key];
  const activeRecord = deployments[activeCard.key];
  const activeMissingDependencies = missingDependenciesFor(activeCard.key, deployments);
  const activeExplorerBase = activeRecord.chainId ? deploymentChainMeta[activeRecord.chainId].explorerUrl : deploymentChainMeta[selectedChainId].explorerUrl;
  const activeBusy = isDeploying || isSwitchingChain || verifyingKey === activeCard.key;
  const activeStepStatus = stepStatusFor(activeCard.key, activeCard.ready, deployments);
  const activeStatus = activeRecord.address ? "live" : activeCard.ready ? "ready" : "blocked";
  const activeStatusLabel = activeStepStatus === "live" ? "live" : activeStepStatus === "ready" ? "ready to deploy" : activeStepStatus === "dependency" ? "missing dependency" : "needs input";
  const deployDisabled = activeBusy || !activeCard.ready || (mode === "server" && activeCard.key !== "ownerAccess") || (mode === "server" && activeCard.key === "ownerAccess" && !serverStatus.deployReady);
  const guidedChecklist = [
    {
      title: "HQ secret",
      description: "Bootstrap secret is configured and ready.",
      done: session.configured,
    },
    {
      title: "Owner access",
      description: deployments.ownerAccess.address ? short(deployments.ownerAccess.address, 8, 6) : "Deploy the first contract that unlocks long-term HQ access.",
      done: Boolean(deployments.ownerAccess.address),
    },
    {
      title: "Contract stack",
      description: fullStackReady ? "All deploy records are saved in this browser." : `${deployedCount}/4 saved so far.`,
      done: fullStackReady,
    },
    {
      title: "Episodes HQ",
      description: fullStackReady ? "Ready for events, ops, and post-deploy admin work." : "Opens after the contract stack is in place.",
      done: fullStackReady,
    },
  ];
  const guideCompletedCount = guidedChecklist.filter((item) => item.done).length;
  const guideProgress = Math.round((guideCompletedCount / guidedChecklist.length) * 100);
  const guideNextLabel = !deployments.ownerAccess.address
    ? "Next: deploy Owner Access 1155."
    : nextStep
      ? `Next: deploy ${deploymentLabels[nextStep]}.`
      : "Next: move into Episodes HQ.";
  const workflowStages: { key: WorkflowStage; title: string; description: string; ready: boolean; lockedMessage: string }[] = [
    {
      key: "deploy",
      title: "Deploy Contracts",
      description: "Move through owner access, submission registry, founder membership, and event registry in order.",
      ready: true,
      lockedMessage: "",
    },
    {
      key: "permissions",
      title: "HQ Permissions",
      description: "Mint owner/admin keys, revoke them, or change deeper contract roles after owner access is live.",
      ready: Boolean(deployments.ownerAccess.address),
      lockedMessage: "Deploy Owner Access first, then the permissions tools unlock.",
    },
    {
      key: "handoff",
      title: "Handoff",
      description: "Copy env values, export the manifest, and keep a clean record of what is deployed.",
      ready: Boolean(deployedCount),
      lockedMessage: "Deploy at least one contract first so the handoff data has something real to export.",
    },
    {
      key: "events",
      title: "Events HQ",
      description: "After contracts are ready, continue into episode editing, Luma import, and onchain event sync.",
      ready: fullStackReady,
      lockedMessage: "Finish the contract stack first, then Events HQ becomes the next clean step.",
    },
  ];
  const workflowIndex = workflowStages.findIndex((stage) => stage.key === workflowStage);
  const currentWorkflow = workflowStages[workflowIndex] ?? workflowStages[0];

  function openWorkflowStage(stage: WorkflowStage) {
    const target = workflowStages.find((item) => item.key === stage);
    if (!target) return;
    if (stage !== "deploy" && !target.ready) {
      push(target.lockedMessage, "warning");
      return;
    }
    setWorkflowStage(stage);
    push(`${target.title} opened.`, "info");
  }

  function moveWorkflow(direction: -1 | 1) {
    const nextIndex = workflowIndex + direction;
    if (nextIndex < 0 || nextIndex >= workflowStages.length) return;

    const target = workflowStages[nextIndex];
    if (direction > 0 && !target.ready) {
      push(target.lockedMessage, "warning");
      return;
    }

    setWorkflowStage(target.key);
    push(`${target.title} opened.`, "info");
  }

  function continueGuidedSetup() {
    if (!deployments.ownerAccess.address) {
      setWorkflowStage("deploy");
      setActiveStepIndex(0);
      push("Guided setup opened Owner Access first.", "info");
      return;
    }

    if (nextStep) {
      setWorkflowStage("deploy");
      setActiveStepIndex(deploymentSteps.indexOf(nextStep));
      push(`Guided setup moved to ${deploymentLabels[nextStep]}.`, "info");
      return;
    }

    if (workflowStage === "deploy") {
      openWorkflowStage("permissions");
      return;
    }

    if (workflowStage === "permissions") {
      openWorkflowStage("handoff");
      return;
    }

    if (workflowStage === "handoff") {
      openWorkflowStage("events");
      return;
    }

    router.push("/owner/episodes");
  }

  return (
    <section className="min-h-screen overflow-x-hidden bg-black px-3 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/56">Spectra Deployment HQ</div>
              <h1 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.05em] sm:text-3xl">
                One contract at a time, with the fields, dependencies, and next actions visible before you sign.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
                Black-only operator view, tighter mobile layout, editable inputs, and a focused carousel instead of a wall of blocks.
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

          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.45))] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/52">Guided Setup</div>
                  <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.04em] text-white">
                    Use one button to keep moving through HQ in the right order.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
                    The button below always takes you to the next useful step: deploy owner access, continue the stack, or go straight into
                    Episodes HQ when contracts are ready.
                  </p>
                </div>
                <button onClick={continueGuidedSetup} className={glow(true, false)}>
                  {fullStackReady ? "Open Episodes HQ" : "Continue Guided Setup"}
                </button>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3 text-sm text-white/68">
                  <span>{guideNextLabel}</span>
                  <span>{guideProgress}% complete</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${guideProgress}%` }} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {guidedChecklist.map((item, index) => (
                  <div key={item.title} className="rounded-[22px] border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/44">Step {index + 1}</div>
                      <div className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${item.done ? "border-white/20 text-white/82" : "border-white/10 text-white/48"}`}>
                        {item.done ? "done" : "next"}
                      </div>
                    </div>
                    <div className="mt-2 text-base font-medium text-white">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-white/62">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/45 p-5 sm:p-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Resume Or Restart</div>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Keep saved progress, or start from zero.</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Deployment HQ remembers addresses and recent actions in this browser. That makes it easy to resume later, and now it is also
                easy to wipe the cache if you want a clean run.
              </p>

              <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/62">
                <p>Saved contracts: <span className="text-white/84">{deployedCount}/4</span></p>
                <p>Saved activity items: <span className="text-white/84">{activity.length}</span></p>
                <p>Current browser state: <span className="text-white/84">{hasSavedProgress ? "resume available" : "clean start"}</span></p>
              </div>

              <div className="mt-4 grid gap-3">
                <button onClick={() => router.push("/tools/session-secret")} className={glow(false, false)}>
                  Open Secret Tool
                </button>
                <button onClick={resetDeploymentWorkspace} disabled={!hasSavedProgress} className={glow(hasSavedProgress, !hasSavedProgress)}>
                  Start From Zero
                </button>
                <button onClick={() => router.push("/owner/episodes")} disabled={!fullStackReady} className={glow(fullStackReady, !fullStackReady)}>
                  Go To Episodes HQ
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] border border-white/10 bg-black/60 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/52">Contracts Live</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{deployedCount}/4</div>
              <div className="mt-2 text-sm leading-6 text-white/62">
                Next step: {nextStep ? deploymentLabels[nextStep] : "Verification and handoff"}.
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/60 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/52">Explorer Proof</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{verifiedCount}/4</div>
              <div className="mt-2 text-sm leading-6 text-white/62">Verified on BaseScan or Blockscout.</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/60 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/52">Network</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{deploymentChainMeta[selectedChainId].shortLabel}</div>
              <div className="mt-2 text-sm leading-6 text-white/62 break-words">
                Wallet chain {currentChainId ?? "not connected"}.
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/60 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/52">Wallet</div>
              <div className="mt-2 text-xl font-semibold tracking-[-0.03em]">{short(address)}</div>
              <div className="mt-2 text-sm leading-6 break-all text-white/56">{address}</div>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-black/45 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">HQ Walkthrough</div>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                  Move through HQ one clear part at a time.
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
                  Pick a part below or use the previous and next buttons. This keeps deploy, permissions, handoff, and events separated so
                  the screen stays readable instead of turning into one long control wall.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={() => moveWorkflow(-1)} disabled={workflowIndex === 0} className={glow(false, workflowIndex === 0)}>
                  Previous Part
                </button>
                <button onClick={continueGuidedSetup} className={glow(true, false)}>
                  {workflowStage === "events" ? "Open Episodes HQ" : "Next Part"}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-4">
              {workflowStages.map((stage, index) => {
                const selected = stage.key === workflowStage;
                return (
                  <button
                    key={stage.key}
                    onClick={() => openWorkflowStage(stage.key)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      selected
                        ? "border-white/26 bg-white/[0.08]"
                        : stage.ready
                          ? "border-white/10 bg-white/[0.03] hover:border-white/24 hover:bg-white/[0.05]"
                          : "border-white/8 bg-black/25 text-white/55"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/44">Part {index + 1}</div>
                      <div className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                        selected
                          ? "border-white/22 text-white/84"
                          : stage.ready
                            ? "border-white/16 text-white/68"
                            : "border-white/8 text-white/38"
                      }`}>
                        {selected ? "open" : stage.ready ? "ready" : "locked"}
                      </div>
                    </div>
                    <div className="mt-2 text-lg font-medium text-white">{stage.title}</div>
                    <p className="mt-2 text-sm leading-6 text-white/60">{stage.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/62">
              <span className="text-white/86">{currentWorkflow.title}:</span> {currentWorkflow.description}
            </div>
          </div>
        </motion.div>

        {workflowStage === "deploy" && (
          <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5 min-w-0">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Mode</div>
              <div className="mt-3 grid gap-3">
                <button onClick={() => setMode("wallet")} className={glow(mode === "wallet", false)}>Connected Wallet</button>
                <button onClick={() => setMode("server")} className={glow(mode === "server", false)}>Server Signer</button>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/58">
                Wallet mode handles the full stack. Server mode keeps owner-access automation available.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Network</div>
              <div className="mt-3 grid gap-3">
                <button onClick={() => setSelectedChainId(baseSepolia.id)} className={glow(selectedChainId === baseSepolia.id, false)}>Base Sepolia</button>
                <button onClick={() => setSelectedChainId(base.id)} className={glow(selectedChainId === base.id, false)}>Base Mainnet</button>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Contract Carousel</div>
              <div className="mt-4 grid gap-3">
                {cards.map((card, index) => {
                  const stepStatus = stepStatusFor(card.key, card.ready, deployments);
                  const selected = index === activeStepIndex;
                  return (
                    <button
                      key={card.key}
                      onClick={() => setActiveStepIndex(index)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        selected ? "border-white/30 bg-white/[0.08]" : "border-white/10 bg-black/35 hover:border-white/20 hover:bg-black/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">{card.step}</div>
                          <div className="mt-1 break-words text-sm font-medium text-white/88">{card.title}</div>
                          <div className="mt-1 text-xs leading-5 text-white/50">
                            {stepStatus === "live" ? "Already deployed" : stepStatus === "ready" ? "Inputs look good" : stepStatus === "dependency" ? "Can deploy, but deps are missing" : "Needs more input"}
                          </div>
                        </div>
                        <div
                          className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                            stepStatus === "live" ? "border-white/25 text-white/88" : selected ? "border-white/20 text-white/80" : "border-white/10 text-white/50"
                          }`}
                        >
                          {stepStatus === "live" ? "live" : stepStatus === "ready" ? "ready" : stepStatus === "dependency" ? "watch" : "input"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Command Log</div>
              <div className="mt-4 space-y-3">
                {activity.length ? activity.map((item) => (
                  <div key={item.id} className={`rounded-2xl border p-3 text-sm leading-6 break-words ${tone(item.tone)}`}>
                    <div className="text-white/82">
                      {item.text}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/56">
                    Deployments, verification updates, and admin writes land here.
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-5 min-w-0">
            <motion.div
              key={activeCard.key}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">{activeCard.step}</div>
                    <h2 className="mt-2 break-words text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{activeCard.title}</h2>
                    <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-white/60">{plainContractSummary(activeCard.key)}</p>
                  </div>
                  <div className="rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                    <span className={stateText(activeStatus)}>{activeStatusLabel}</span>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[30px] border border-white/10 bg-black/45 p-4 sm:p-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Purpose</div>
                        <p className="mt-2 text-sm leading-6 text-white/72">{activeGuide.purpose}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Timing</div>
                        <p className="mt-2 text-sm leading-6 text-white/72">{activeGuide.deployWhen}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Can I deploy now?</div>
                        <p className="mt-2 text-sm leading-6 text-white/72">
                          {activeMissingDependencies.length
                            ? `Yes, but usual order is after ${activeMissingDependencies.map((dependency) => deploymentLabels[dependency]).join(", ")}.`
                            : activeCard.ready
                              ? "Yes. Required inputs look filled."
                              : "Not yet. Fill the required inputs below first."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-sm leading-6 text-white/74">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">In plain English</div>
                      <p className="mt-2 break-words">{plainFieldSummary(activeCard.key)}</p>
                    </div>

                    <div className="mt-5">{activeCard.fields}</div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/64">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Env keys after deploy</div>
                      <p className="mt-2 break-words">{activeGuide.envKeys.join(", ")}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => deployStep(activeCard.key)}
                        disabled={deployDisabled}
                        className={glow((nextStep === activeCard.key || activeStepStatus === "dependency") && activeCard.ready && !activeRecord.address, deployDisabled)}
                      >
                        {activeMissingDependencies.length ? "Deploy Anyway" : "Deploy"}
                      </button>
                      <button
                        onClick={() => verifyDeployment(activeCard.key)}
                        disabled={!activeRecord.address || verifyingKey === activeCard.key}
                        className={glow(Boolean(activeRecord.address) && (activeRecord.verification.basescan.status === "failed" || activeRecord.verification.blockscout.status === "failed"), !activeRecord.address || verifyingKey === activeCard.key)}
                      >
                        {verifyingKey === activeCard.key ? "Verifying" : "Verify Again"}
                      </button>
                      {activeCard.key === "founderMembership" ? (
                        <button
                          onClick={linkFounderMembership}
                          disabled={!founderLinkReady || isWriting || isSwitchingChain}
                          className={glow(founderLinkReady && Boolean(deployments.founderMembership.address), !founderLinkReady || isWriting || isSwitchingChain)}
                        >
                          Link Founder Into Registry
                        </button>
                      ) : null}
                    </div>
                  </div>

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
                        {activeGuide.dependsOn.length ? activeGuide.dependsOn.map((dependency) => (
                          <div key={dependency} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                            <span className={stateText(deployments[dependency].address ? "live" : "blocked")}>
                              {deploymentLabels[dependency]} {deployments[dependency].address ? "live" : "recommended first"}
                            </span>
                          </div>
                        )) : (
                          <div className="text-sm text-white/58">This contract has no dependencies.</div>
                        )}
                      </div>
                      <p className="mt-4 text-sm leading-6 text-white/60">
                        Dependencies are not hard blockers here. They only show the normal rollout order.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <details className="rounded-[28px] border border-white/10 bg-black/40 p-5">
                    <summary className="cursor-pointer list-none text-sm font-medium text-white/86">Field guide</summary>
                    <p className="mt-3 text-sm leading-6 text-white/56">
                      These are the one-time values baked into the contract at deployment.
                    </p>
                    <div className="mt-4 grid gap-3">
                      {activeGuide.constructorDocs.map((field, fieldIndex) => (
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
                            {describeValue(activeRecord.constructorArgs[fieldIndex] ?? "") || field.placeholder || "pending"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>

                  <details className="rounded-[28px] border border-white/10 bg-black/40 p-5">
                    <summary className="cursor-pointer list-none text-sm font-medium text-white/86">Verification and checklist</summary>
                    <div className="mt-4 grid gap-4">
                      <div className={`min-w-0 rounded-[24px] border p-4 ${verifyTone(activeRecord.verification.basescan.status)}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[11px] uppercase tracking-[0.18em]">BaseScan</div>
                          <div className={`text-[10px] uppercase tracking-[0.18em] ${stateText(activeRecord.verification.basescan.status === "verified" ? "verified" : activeRecord.verification.basescan.status === "failed" ? "failed" : activeRecord.verification.basescan.status === "pending" || activeRecord.verification.basescan.status === "submitted" ? "pending" : "blocked")}`}>
                            {verificationLabel(activeRecord.verification.basescan.status)}
                          </div>
                        </div>
                        <div className="mt-2 break-words text-sm leading-6">{trimMessage(activeRecord.verification.basescan.message)}</div>
                        <div className="mt-2 text-xs"><LinkOut href={activeRecord.verification.basescan.url} label="Open BaseScan" /></div>
                      </div>
                      <div className={`min-w-0 rounded-[24px] border p-4 ${verifyTone(activeRecord.verification.blockscout.status)}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[11px] uppercase tracking-[0.18em]">Blockscout</div>
                          <div className={`text-[10px] uppercase tracking-[0.18em] ${stateText(activeRecord.verification.blockscout.status === "verified" ? "verified" : activeRecord.verification.blockscout.status === "failed" ? "failed" : activeRecord.verification.blockscout.status === "pending" || activeRecord.verification.blockscout.status === "submitted" ? "pending" : "blocked")}`}>
                            {verificationLabel(activeRecord.verification.blockscout.status)}
                          </div>
                        </div>
                        <div className="mt-2 break-words text-sm leading-6">{trimMessage(activeRecord.verification.blockscout.message)}</div>
                        <div className="mt-2 text-xs"><LinkOut href={activeRecord.verification.blockscout.url} label="Open Blockscout" /></div>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">After deploy</div>
                        <div className="mt-3 space-y-2">
                          {activeGuide.afterDeploy.map((item) => (
                            <div key={`${activeCard.key}-${item}`} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm leading-6 text-white/68 break-words">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-black/45 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <button onClick={() => setActiveStepIndex((current) => Math.max(0, current - 1))} disabled={activeStepIndex === 0} className={glow(false, activeStepIndex === 0)}>
                    Previous
                  </button>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {cards.map((card, index) => (
                      <button
                        key={`${card.key}-dot`}
                        onClick={() => setActiveStepIndex(index)}
                        aria-label={`Open ${card.title}`}
                        className={`h-2.5 rounded-full transition ${index === activeStepIndex ? "w-10 bg-white" : "w-2.5 bg-white/30 hover:bg-white/55"}`}
                      />
                    ))}
                  </div>
                  <button onClick={() => setActiveStepIndex((current) => Math.min(cards.length - 1, current + 1))} disabled={activeStepIndex === cards.length - 1} className={glow(false, activeStepIndex === cards.length - 1)}>
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          </div>
        )}

        <div className="grid gap-5">
          {workflowStage === "permissions" && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Owner Access Operations</div>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">Daily operator controls</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
                  Use this after the owner-access contract is live. The presets stay simple, but every value remains editable if operations need a different token or role.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="min-w-0 rounded-[24px] border border-white/10 bg-black/35 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Mint access key</div>
                    <p className="mt-2 text-sm leading-6 text-white/68">Gives a wallet permission. Think of it like handing somebody a badge.</p>
                  </div>
                  <div className="min-w-0 rounded-[24px] border border-white/10 bg-black/35 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Revoke access key</div>
                    <p className="mt-2 text-sm leading-6 text-white/68">Takes that badge away from a wallet.</p>
                  </div>
                  <div className="min-w-0 rounded-[24px] border border-white/10 bg-black/35 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Apply role action</div>
                    <p className="mt-2 text-sm leading-6 text-white/68">Changes deeper contract permissions like who can mint, pause, or manage metadata.</p>
                  </div>
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
                      {opsForm.role === "custom" ? (
                        <>
                          <Field label="Token id" value={opsForm.tokenId} onChange={(v) => setOpsForm((c) => ({ ...c, tokenId: v }))} placeholder="4" />
                          <Field label="Amount" value={opsForm.amount} onChange={(v) => setOpsForm((c) => ({ ...c, amount: v }))} placeholder="1" />
                        </>
                      ) : null}
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
                  <p><span className="text-white/84">Auto presets stay as-is:</span> owner = token ID 1, admin = token ID 2, aiagent = token ID 3.</p>
                  <p><span className="text-white/84">Layman version:</span> those token IDs are just badge types. `1` is highest access, `2` is normal admin access, `3` is the automation badge.</p>
                  <p><span className="text-white/84">Editable values:</span> contract address, recipient, custom token ID, amount, revoke amount, and contract roles can all be changed directly here.</p>
                </div>
            </div>
          )}

          {workflowStage === "handoff" && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Handoff</div>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Bootstrap Env</div>
                      <button onClick={() => copyBlock("Bootstrap env", bootstrapEnvPreview)} className={glow(false, false)}>Copy</button>
                    </div>
                    <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">{bootstrapEnvPreview}</pre>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Token Gated Env</div>
                      <button onClick={() => copyBlock("Token-gated env", tokenGatedEnvPreview)} className={glow(Boolean(deployments.ownerAccess.address), false)}>Copy</button>
                    </div>
                    <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">{tokenGatedEnvPreview}</pre>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Contract Env Handoff</div>
                      <button onClick={() => copyBlock("Contract env handoff", contractEnvPreview)} className={glow(Boolean(deployments.ownerAccess.address || deployments.submissionRegistry.address || deployments.founderMembership.address || deployments.eventRegistry.address), false)}>Copy</button>
                    </div>
                    <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">{contractEnvPreview}</pre>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Env JSON Handoff</div>
                      <button onClick={() => copyBlock("Env JSON handoff", envJsonPreview)} className={glow(Boolean(deployedCount), false)}>Copy JSON</button>
                    </div>
                    <pre className="mt-3 max-h-[220px] overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">{envJsonPreview}</pre>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Deployment Manifest</div>
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => copyBlock("Deployment manifest", deploymentManifest)} className={glow(Boolean(deployedCount), false)}>Copy JSON</button>
                        <button
                          onClick={() => {
                            downloadText(`spectra-deployment-${selectedChainId}.json`, deploymentManifest, "application/json");
                            push("Deployment manifest downloaded.", "success");
                          }}
                          className={glow(Boolean(deployedCount), false)}
                        >
                          Download JSON
                        </button>
                      </div>
                    </div>
                    <pre className="mt-3 max-h-[320px] overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-white/68">{deploymentManifest}</pre>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-black/30 p-4 text-sm leading-6 text-white/58">
                    <p>Access mode: {isBootstrapSession ? "bootstrap wallet session" : "token-gated wallet session"}</p>
                    <p>Server deploy readiness: <span className={stateText(serverStatus.deployReady ? "ready" : "blocked")}>{serverStatus.deployReady ? "ready" : "missing env"}</span></p>
                    <p>Pending deployment: {pendingDeployment ? deploymentLabels[pendingDeployment.key] : "none"}</p>
                    <p>Auto verification: {verifyingKey ? `running for ${deploymentLabels[verifyingKey]}` : "idle"}</p>
                    <p>Wallet route: {deploymentChainMeta[selectedChainId].label}</p>
                    <p>CLI handoff: <code>npm run contracts:log:deployment -- --chainId {selectedChainId}</code></p>
                  </div>
                </div>
            </div>
          )}

          {workflowStage === "events" && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Events HQ</div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Contracts are ready. Move into event operations.</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
                    This is the final part of the walkthrough. Open Episodes HQ, choose the episode, update the data, pull from Luma if
                    needed, then sync the event onchain.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button onClick={() => moveWorkflow(-1)} className={glow(false, false)}>
                    Back To Handoff
                  </button>
                  <button onClick={() => router.push("/owner/episodes")} disabled={!fullStackReady} className={glow(fullStackReady, !fullStackReady)}>
                    Open Episodes HQ
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 1</div>
                  <div className="mt-2 text-lg font-semibold text-white">Open the episodes page</div>
                  <p className="mt-2 text-sm leading-6 text-white/62">That becomes the live event control room after deployment is done.</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 2</div>
                  <div className="mt-2 text-lg font-semibold text-white">Choose and edit the episode</div>
                  <p className="mt-2 text-sm leading-6 text-white/62">Select the active or next episode, then edit it directly or pull details from Luma.</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/35 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 3</div>
                  <div className="mt-2 text-lg font-semibold text-white">Sync the event onchain</div>
                  <p className="mt-2 text-sm leading-6 text-white/62">Once the episode draft looks right, sync it so the contract-side event record matches.</p>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-white/12 bg-white/[0.05] p-4 text-sm leading-6 text-white/72">
                Ready check: all four deployment records are saved, so the next clean move is into <span className="text-white">Episodes HQ</span>.
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {deploymentSteps.map((key) => (
                  <div key={`events-${key}`} className="rounded-[22px] border border-white/10 bg-black/30 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">{deploymentLabels[key]}</div>
                    <div className="mt-2 break-all font-mono text-xs leading-6 text-white/72">
                      {deployments[key].address || "Not saved"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

            {feedback && (
              <div className="rounded-[24px] border border-white/12 bg-white/[0.06] px-4 py-4 text-sm leading-6 text-white/82 backdrop-blur-xl break-words">
                {feedback}
              </div>
            )}
          </div>
      </div>
    </section>
  );
}
