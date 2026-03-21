/**
 * applyDeployments.ts
 *
 * Reads deployments.json and patches .env with the deployed contract addresses.
 * All other .env keys are left untouched. Missing keys are appended at the bottom.
 *
 * Usage:
 *   npm run env:sync
 *
 * What it writes (artwork stack — primary):
 *   SPECTRA_SEASON_REGISTRY_ADDRESS
 *   SPECTRA_EPISODE_CONTRACT_ADDRESS
 *
 * What it writes (legacy stack — optional):
 *   OWNER_ACCESS_CONTRACT_ADDRESS
 *   EPISODES_OWNER_ERC1155_ADDRESS   (same as owner access, used for HQ gate)
 *   EPISODES_OWNER_ERC1155_TOKEN_ID  (set to 1,2 once owner access is deployed)
 *   SPECTRA_SUBMISSION_REGISTRY_ADDRESS
 *   SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS
 *   SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS
 *
 * What it never touches:
 *   Secrets, API keys, RPC URLs, SMTP config, or any key not in the list above.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const root = process.cwd();
const manifestPath = path.join(root, "deployments.json");
const envPath = path.join(root, ".env");

// ─── load manifest ────────────────────────────────────────────────────────────

if (!fs.existsSync(manifestPath)) {
  console.error("✗  deployments.json not found. Deploy contracts from HQ first, then use 'Save to Manifest'.");
  process.exit(1);
}

type ContractEntry = { address: string; txHash: string; deployedAt: string; chainId: number | null };
type Manifest = {
  updatedAt: string;
  chain: { id: number | null; label: string; explorerUrl: string };
  contracts: Record<string, ContractEntry>;
};

const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const { contracts } = manifest;

// ─── build the key→value map ──────────────────────────────────────────────────

const updates: Record<string, string> = {};

// Artwork stack (primary)
if (contracts.seasonRegistry?.address) {
  updates["SPECTRA_SEASON_REGISTRY_ADDRESS"] = contracts.seasonRegistry.address;
}
if (contracts.episodeContract?.address) {
  updates["SPECTRA_EPISODE_CONTRACT_ADDRESS"] = contracts.episodeContract.address;
}

// Legacy stack (optional)
if (contracts.ownerAccess?.address) {
  updates["OWNER_ACCESS_CONTRACT_ADDRESS"] = contracts.ownerAccess.address;
  updates["EPISODES_OWNER_ERC1155_ADDRESS"] = contracts.ownerAccess.address;
  updates["EPISODES_OWNER_ERC1155_TOKEN_ID"] = "1,2";
}
if (contracts.submissionRegistry?.address) {
  updates["SPECTRA_SUBMISSION_REGISTRY_ADDRESS"] = contracts.submissionRegistry.address;
}
if (contracts.founderMembership?.address) {
  updates["SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS"] = contracts.founderMembership.address;
}
if (contracts.eventRegistry?.address) {
  updates["SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS"] = contracts.eventRegistry.address;
}

if (Object.keys(updates).length === 0) {
  console.log("⚠  No deployed addresses found in deployments.json. Nothing to apply.");
  process.exit(0);
}

// ─── show preview and confirm ─────────────────────────────────────────────────

const artworkReady = Boolean(contracts.seasonRegistry?.address && contracts.episodeContract?.address);

console.log("");
console.log("  Will apply these updates to .env:");
console.log("");
for (const [k, v] of Object.entries(updates)) {
  console.log(`    ${k}=${v}`);
}
console.log("");

if (!artworkReady) {
  console.log("  ⚠  Artwork stack not fully deployed yet (Season Registry + Episode Contract).");
  console.log("     These partial updates will still be applied.");
  console.log("     Run again after both contracts are live for a complete .env patch.");
  console.log("");
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await new Promise<void>((resolve) => {
  rl.question("  Apply these changes to .env? (y/N) ", (answer) => {
    rl.close();
    if (answer.trim().toLowerCase() !== "y") {
      console.log("  Cancelled. .env was not changed.");
      process.exit(0);
    }
    resolve();
  });
});

// ─── patch .env in-place ──────────────────────────────────────────────────────

const envRaw = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const lines = envRaw.split(/\r?\n/);
const applied = new Set<string>();

const patched = lines.map((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return line;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) return line;
  const key = trimmed.slice(0, eqIdx).trim();
  if (key in updates) {
    applied.add(key);
    const oldVal = trimmed.slice(eqIdx + 1).trim();
    const newVal = updates[key];
    if (oldVal === newVal) return line;
    return `${key}=${newVal}`;
  }
  return line;
});

const missing = Object.entries(updates).filter(([k]) => !applied.has(k));
if (missing.length > 0) {
  patched.push("");
  patched.push("# Added by env:sync");
  for (const [k, v] of missing) patched.push(`${k}=${v}`);
}

const trimmedOutput = patched.join("\n").replace(/\n+$/, "") + "\n";
fs.writeFileSync(envPath, trimmedOutput, "utf8");

// ─── report ───────────────────────────────────────────────────────────────────

console.log("");
console.log("✓  .env patched from deployments.json");
console.log(`   Manifest updated: ${manifest.updatedAt || "unknown"}`);
console.log(`   Chain: ${manifest.chain?.label || manifest.chain?.id || "unknown"}`);
console.log("");

for (const [k, v] of Object.entries(updates)) {
  const wasNew = !applied.has(k);
  console.log(`   ${wasNew ? "+" : "~"} ${k}=${v}`);
}

console.log("");
console.log("   Restart your dev server to pick up the new values.");
console.log("");
