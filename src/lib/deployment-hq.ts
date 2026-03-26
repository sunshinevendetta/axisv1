import eventRegistryArtifact from "@/artifacts/contracts/SpectraEventAccessRegistry.sol/SpectraEventAccessRegistry.json";
import founderArtifact from "@/artifacts/contracts/SpectraFounderSeason1_1155.sol/SpectraFounderSeason1_1155.json";
import ownerAccessArtifact from "@/artifacts/contracts/SpectraOwnerAccess1155.sol/SpectraOwnerAccess1155.json";
import submissionRegistryArtifact from "@/artifacts/contracts/SpectraSubmissionRegistry.sol/SpectraSubmissionRegistry.json";

// New artwork contracts — artifacts generated after `npm run contracts:compile`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let seasonRegistryArtifact: any = { abi: [], bytecode: "0x" };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let episodeArtifact: any = { abi: [], bytecode: "0x" };
try {
  // Dynamic require so missing artifacts don't crash the whole module at import time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  seasonRegistryArtifact = require("@/artifacts/contracts/SpectraSeasonRegistry.sol/SpectraSeasonRegistry.json");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  episodeArtifact = require("@/artifacts/contracts/SpectraEpisode1155.sol/SpectraEpisode1155.json");
} catch {
  // Contracts not compiled yet — run `npm run contracts:compile` first
}

// ─── Contract key types ───────────────────────────────────────────────────────

/**
 * Keys for the legacy management contract stack (owner key system, membership, event access).
 * These remain optional — deploy them if the founder / submission flow is needed.
 */
export type LegacyContractKey =
  | "ownerAccess"
  | "submissionRegistry"
  | "founderMembership"
  | "eventRegistry";

/**
 * Keys for the new artwork contract stack (season registry + per-episode ERC-1155).
 * These are the primary contracts for AR artwork collection.
 */
export type ArtworkContractKey =
  | "seasonRegistry"
  | "episodeContract";

export type DeploymentContractKey = LegacyContractKey | ArtworkContractKey;

// ─── Artifacts ───────────────────────────────────────────────────────────────

export const deploymentArtifacts = {
  ownerAccess: ownerAccessArtifact,
  submissionRegistry: submissionRegistryArtifact,
  founderMembership: founderArtifact,
  eventRegistry: eventRegistryArtifact,
  seasonRegistry: seasonRegistryArtifact,
  episodeContract: episodeArtifact,
} as const;

// ─── Step order ───────────────────────────────────────────────────────────────

/**
 * Primary artwork deployment order.
 * Season registry first, then the episode contract.
 * No ordering constraint between multiple episode contracts.
 */
export const artworkDeploymentSteps: ArtworkContractKey[] = [
  "seasonRegistry",
  "episodeContract",
];

/**
 * Legacy management contract steps (optional stack).
 * Owner access → submission registry → founder membership → event registry.
 */
export const legacyDeploymentSteps: LegacyContractKey[] = [
  "ownerAccess",
  "submissionRegistry",
  "founderMembership",
  "eventRegistry",
];

/** All steps combined for legacy compatibility. */
export const deploymentSteps: DeploymentContractKey[] = [
  ...artworkDeploymentSteps,
  ...legacyDeploymentSteps,
];

// ─── Labels ───────────────────────────────────────────────────────────────────

export const deploymentLabels: Record<DeploymentContractKey, string> = {
  // Artwork stack
  seasonRegistry: "Season Registry",
  episodeContract: "Episode Contract",
  // Legacy management stack
  ownerAccess: "Owner Access 1155",
  submissionRegistry: "Submission Registry",
  founderMembership: "Founder Membership S1",
  eventRegistry: "Event Access Registry",
};

// ─── Chain meta ───────────────────────────────────────────────────────────────

export const deploymentChainMeta = {
  8453: {
    label: "Base Mainnet",
    shortLabel: "Base",
    explorerUrl: "https://basescan.org",
    blockscoutUrl: "https://base.blockscout.com",
  },
  84532: {
    label: "Base Sepolia",
    shortLabel: "Sepolia",
    explorerUrl: "https://sepolia.basescan.org",
    blockscoutUrl: "https://base-sepolia.blockscout.com",
  },
} as const;

export type DeploymentChainId = 8453 | 84532;

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const defaultFounderBaseUri = "ipfs://spectra-founder-season1/";
export const defaultFounderContractMetadataUri = "ipfs://spectra-founder-season1/contract.json";

// ─── Guide types ──────────────────────────────────────────────────────────────

export type DeploymentFieldDoc = {
  name: string;
  key: string;
  required: boolean;
  placeholder?: string;
  description: string;
  recommended: string;
};

export type DeploymentContractGuide = {
  purpose: string;
  whyItExists: string;
  deployWhen: string;
  dependsOn: DeploymentContractKey[];
  constructorDocs: DeploymentFieldDoc[];
  afterDeploy: string[];
  envKeys: string[];
  isArtworkContract?: boolean;
  isLegacy?: boolean;
};

// ─── Guides ───────────────────────────────────────────────────────────────────

export const deploymentGuides: Record<DeploymentContractKey, DeploymentContractGuide> = {

  // ── Artwork stack ──────────────────────────────────────────────────────────

  seasonRegistry: {
    purpose: "The master index for Season 1. Holds the list of every episode contract address so the app — and anyone on the internet — can find all AXIS artworks in one place.",
    whyItExists:
      "Without this, there is no single source of truth for which episode contracts belong to Season 1. Collectors' wallets, marketplaces, and future tools all use this registry to discover the full AXIS collection. It's deployed once per season and never needs to change. Technically: a lightweight AccessControl contract with no tokens, just a mapping of episode entries.",
    deployWhen:
      "Deploy this first — before any episode contracts. It takes 30 seconds and costs almost nothing on Base. Once it exists, episode contracts can be registered in any order, in parallel.",
    dependsOn: [],
    isArtworkContract: true,
    constructorDocs: [
      {
        key: "admin",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "The wallet that can register new episode contracts and manage the list. Think of it as the librarian for the season's collection.",
        recommended:
          "Use your main long-term wallet. Technical: receives DEFAULT_ADMIN_ROLE and REGISTRY_MANAGER_ROLE.",
      },
      {
        key: "seasonId",
        name: "Season number",
        required: true,
        placeholder: "1",
        description:
          "Which season this registry belongs to. For now, use 1. This is locked in when you deploy.",
        recommended:
          "Use 1.",
      },
      {
        key: "seasonName",
        name: "Season display name",
        required: true,
        placeholder: "AXIS Season 1",
        description:
          "The public name people will see for this season.",
        recommended:
          "Use 'AXIS Season 1'. This appears in any UI that reads from the registry contract.",
      },
    ],
    afterDeploy: [
      "Save the season registry address — you'll register every episode contract here after each deploy.",
      "Copy SPECTRA_SEASON_REGISTRY_ADDRESS into your .env file (or use 'Save to Manifest' + env:sync).",
      "Verify the contract on BaseScan so the registry is publicly auditable.",
      "You're ready to deploy episode contracts. They can be deployed in any order and registered here when ready.",
    ],
    envKeys: ["SPECTRA_SEASON_REGISTRY_ADDRESS"],
  },

  episodeContract: {
    purpose: "The actual AR artwork contract for one episode. Each token ID inside is one AR artwork that collectors can mint at or after the event.",
    whyItExists:
      "One contract per event gives each episode its own identity, supply caps, and minting window. Collectors who find and scan the AR artwork call mint() on this contract — free, one per wallet. The token they receive is a permanent proof they found that piece. Technically: an ERC-1155 with per-token supply caps, 1-per-wallet guard, open mint, airdrop, pause, and per-token URI support.",
    deployWhen:
      "Deploy when you know which episode slot this is. You do not need Grove uploads ready yet. The easy path is: pick the episode, use the starter links, deploy now, upload the real files later.",
    dependsOn: ["seasonRegistry"],
    isArtworkContract: true,
    constructorDocs: [
      {
        key: "admin",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "The wallet that controls this episode contract. Gets all roles: can register artworks, open/close minting, run airdrops, pause the contract, and update metadata.",
        recommended:
          "Use your main admin wallet. Technical: receives DEFAULT_ADMIN_ROLE, ARTWORK_MANAGER_ROLE, MINTER_ROLE, AIRDROP_ROLE, PAUSER_ROLE, URI_MANAGER_ROLE.",
      },
      {
        key: "name",
        name: "Episode/event name",
        required: true,
        placeholder: "IRL x AXIS",
        description:
          "The name for this episode collection. Usually this matches the event title.",
        recommended:
          "Match the Luma event title exactly. You can't change this easily after deployment.",
      },
      {
        key: "symbol",
        name: "Short code",
        required: true,
        placeholder: "AXIS-EP2",
        description:
          "A short internal code for this contract. Example: AXIS-EP2.",
        recommended:
          "Use AXIS-EP1 for episode 1, AXIS-EP2 for episode 2, and so on.",
      },
      {
        key: "seasonId",
        name: "Season number",
        required: true,
        placeholder: "1",
        description:
          "Which season this episode belongs to. For now this is 1.",
        recommended:
          "Use 1 for Season 1. This links the episode to its season in any registry query.",
      },
      {
        key: "episodeNumber",
        name: "Episode slot",
        required: true,
        placeholder: "2",
        description:
          "Which episode slot this contract belongs to: 1, 2, 3, 4 and so on.",
        recommended:
          "Use the sequential episode number: 1, 2, 3... up to 12 for Season 1.",
      },
      {
        key: "baseUri",
        name: "Starter metadata link",
        required: true,
        placeholder: "ipfs://bafybei.../episode-2",
        description:
          "A link the contract uses to find each artwork's JSON. If you are not ready yet, use the app's starter link now and replace it later after you upload the real files.",
        recommended:
          "If you are not ready yet, use the app's starter metadata link first and deploy anyway. Later you can upload the final JSON files and update the base URI with setBaseUri() or update each artwork one by one with setTokenUri().",
      },
      {
        key: "contractMetadataUri",
        name: "Master metadata link",
        required: true,
        placeholder: "https://axis.show/api/episodes/episode-2/metadata",
        description:
          "One JSON file for the overall episode collection page. You can start with the app link and replace it later.",
        recommended:
          "Use the app's episode metadata link first if you want the fastest path. You can replace it later with a Grove or IPFS file after the artwork setup is ready.",
      },
    ],
    afterDeploy: [
      "Call registerArtwork() for each AR piece in this episode (from the Episodes HQ admin panel or directly via the contract).",
      "Register this contract in the season registry by calling registerEpisode() on SpectraSeasonRegistry.",
      "Call setOpenMint(tokenId, true) for each artwork when the event day arrives.",
      "Save the episode contract address to episodes.json under 'episodeContractAddress'.",
      "Use 'Save to Manifest' and run npm run env:sync to patch .env.",
      "Verify the contract on BaseScan so minting is publicly auditable.",
    ],
    envKeys: ["SPECTRA_EPISODE_CONTRACT_ADDRESS"],
  },

  // ── Legacy management stack ────────────────────────────────────────────────

  ownerAccess: {
    purpose: "The master key system. Controls which wallets can access HQ tools and perform admin actions.",
    whyItExists:
      "Think of it as the front door lock for your entire operation. Only wallets that hold an access token from this contract can log into HQ. Technically: a soulbound ERC-1155 where token ID 1 = owner, ID 2 = admin, ID 3 = AI automation.",
    deployWhen:
      "Deploy this first in the legacy stack — before submission registry, founder membership, or event registry. Without it, there is no permanent way to lock down who can access HQ.",
    dependsOn: [],
    isLegacy: true,
    constructorDocs: [
      {
        key: "adminAddress",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "The wallet that will be in charge of this contract. It gets full control: can mint keys, pause the system, and update metadata. Think of it as the master key holder.",
        recommended:
          "Use your main long-term wallet — not a throwaway. This is the wallet you'll always need to manage HQ. Technical: receives DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE, URI_MANAGER_ROLE.",
      },
      {
        key: "initialMinterAddress",
        name: "Initial minter (optional)",
        required: false,
        placeholder: "0x...",
        description:
          "A second wallet that can hand out access keys, if you want to keep that job separate from the main admin. Leave it blank and the admin wallet handles minting too.",
        recommended:
          "Use your deployer or ops wallet here during setup, then remove the permission later if you want tighter security. Technical: granted MINTER_ROLE.",
      },
      {
        key: "baseUri",
        name: "Base URI — where token images & info live",
        required: true,
        placeholder: "ipfs://spectra-owner-access/{id}.json",
        description:
          "This is the folder address where each access key's image and description is stored. When someone's wallet shows their access token, it reads the info from this location. The {id} part gets replaced with the token number (1, 2, or 3). Use IPFS so it stays permanent and no one can change it.",
        recommended:
          "Upload your token metadata files to IPFS first, then paste the folder URL here with {id} in it. Example: ipfs://bafybeiabc123.../token-{id}.json. Technical: ERC-1155 base URI — wallets and explorers resolve metadata from this path.",
      },
      {
        key: "contractMetadataUri",
        name: "Collection info URI — the contract's public profile",
        required: true,
        placeholder: "ipfs://spectra-owner-access/contract.json",
        description:
          "This is a link to a single JSON file that describes the whole collection — its name, description, and image. Think of it as the 'about page' for this contract on OpenSea or any explorer.",
        recommended:
          "Create a contract.json file with fields like name, description, and image, upload it to IPFS, then paste the URL here. Keep it separate from the token files so you can update branding later. Technical: OpenSea-style contractURI for collection-level display.",
      },
    ],
    afterDeploy: [
      "Mint an access key (token ID 1 or 2) to the wallet you want to log into HQ with.",
      "Copy the contract address into EPISODES_OWNER_ERC1155_ADDRESS in your .env file.",
      "Set EPISODES_OWNER_ERC1155_TOKEN_ID to 1,2 so HQ knows which token IDs grant access.",
      "Verify the contract on BaseScan so anyone can inspect the code and confirm it's legitimate.",
    ],
    envKeys: [
      "OWNER_ACCESS_CONTRACT_ADDRESS",
      "EPISODES_OWNER_ERC1155_ADDRESS",
      "EPISODES_OWNER_ERC1155_TOKEN_ID",
      "EPISODES_OWNER_RPC_URL",
    ],
  },

  submissionRegistry: {
    purpose: "The applications inbox. Stores who applied to be a founder, what they submitted, and whether they were approved.",
    whyItExists:
      "Before minting someone a founder token, you need a record of their application and approval. This contract is that record keeper. It tracks every application from submission through approval to minting. Technical: stores applicant history, approval state, metadata URI, and mint linkage.",
    deployWhen:
      "Deploy second in the legacy stack, right after Owner Access. The founder membership contract needs this address when it's deployed — so it has to exist first.",
    dependsOn: ["ownerAccess"],
    isLegacy: true,
    constructorDocs: [
      {
        key: "adminAddress",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "The wallet that can review applications, approve or reject them, and pause the registry if something goes wrong.",
        recommended:
          "Use the same admin wallet you used for Owner Access unless you want a separate wallet specifically for reviewing applications. Technical: receives DEFAULT_ADMIN_ROLE, APPROVER_ROLE, PAUSER_ROLE.",
      },
    ],
    afterDeploy: [
      "Copy this contract address — you'll need it for the next deployment (Founder Membership).",
      "After deploying Founder Membership, come back and link them together with the 'Link Founder Into Registry' button.",
      "Add SPECTRA_SUBMISSION_REGISTRY_ADDRESS to your .env file.",
      "Verify the contract so people can see how applications are reviewed.",
    ],
    envKeys: ["SPECTRA_SUBMISSION_REGISTRY_ADDRESS"],
  },

  founderMembership: {
    purpose: "The actual founder token. When someone's application is approved, this contract mints their membership NFT.",
    whyItExists:
      "Once an application is approved in the registry, something has to actually create the token and give it to the person. That's this contract. It mints the token and records that the application has been fulfilled. Technical: ERC-1155 with submission linkage, season supply cap, and airdrop support.",
    deployWhen:
      "Deploy third in the legacy stack, after the Submission Registry is live. You'll paste the registry address into this deployment.",
    dependsOn: ["submissionRegistry"],
    isLegacy: true,
    constructorDocs: [
      {
        key: "adminAddress",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "The wallet that controls this membership contract. Can pause minting, update metadata, run airdrops, and close the season.",
        recommended:
          "Use the same admin wallet as the registry to keep things simple, unless you want different people managing approvals vs. minting. Technical: receives DEFAULT_ADMIN_ROLE, PAUSER_ROLE, URI_MANAGER_ROLE, AIRDROP_ROLE, CLOSER_ROLE.",
      },
      {
        key: "submissionRegistryAddress",
        name: "Submission registry address",
        required: true,
        placeholder: "0x...",
        description:
          "The address of the Submission Registry you just deployed. This links the two contracts together so minting only works for approved applicants.",
        recommended:
          "Paste the address from Step 2 here. If you get this wrong, minting will be broken and you'd have to redeploy.",
      },
      {
        key: "baseUri",
        name: "Base URI — where founder token art & info live",
        required: true,
        placeholder: "ipfs://spectra-founder-season1/",
        description:
          "The IPFS folder where each founder's token image and description is stored. Each token ID gets its own file: 1.json, 2.json, etc. This must end with a slash.",
        recommended:
          "Upload metadata files named 1.json, 2.json, 3.json to IPFS, then paste the folder URL ending in /. Example: ipfs://bafybeiabc123.../. Technical: base path for uri(tokenId) which appends tokenId + .json.",
      },
      {
        key: "contractMetadataUri",
        name: "Collection info URI — the contract's public profile",
        required: true,
        placeholder: "ipfs://spectra-founder-season1/contract.json",
        description:
          "A link to a JSON file describing the whole founder collection — name, description, image. Shows up on OpenSea and explorers as the collection's profile.",
        recommended:
          "Upload a contract.json to IPFS with the collection name and description. Keep it separate from token files.",
      },
      {
        key: "maxSupply",
        name: "Max supply — how many founder tokens can exist",
        required: true,
        placeholder: "333",
        description:
          "The maximum number of founder memberships that can ever be minted for this season. Once this number is reached, no more can be created. Use 0 for no limit (not recommended).",
        recommended:
          "Set the number you want for Season 1 — 333 is the default. You can't change this after deployment without redeploying.",
      },
    ],
    afterDeploy: [
      "Click 'Link Founder Into Registry' to connect this contract back to the Submission Registry.",
      "Add SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS to your .env file.",
      "Double-check the submission registry address in the constructor was correct before going live.",
      "Verify the contract so minted founder tokens show up properly on explorers.",
    ],
    envKeys: ["SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS"],
  },

  eventRegistry: {
    purpose: "The events permission layer. Controls who can manage events and who gets access to each one.",
    whyItExists:
      "Separate from founder memberships, this contract handles access for individual events. It lets event managers create events, attach info, and assign who gets in — without touching the membership contracts. Technical: standalone registry with EVENT_MANAGER_ROLE and ACCESS_MANAGER_ROLE.",
    deployWhen:
      "Deploy last in the legacy stack. It can work independently but makes most sense after the core access and membership contracts are in place.",
    dependsOn: ["ownerAccess"],
    isLegacy: true,
    constructorDocs: [
      {
        key: "adminAddress",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "The wallet that can create events, manage who gets access, and pause the registry if needed.",
        recommended:
          "Use the same main admin wallet, or a separate event operations wallet if someone else handles events. Technical: receives DEFAULT_ADMIN_ROLE, EVENT_MANAGER_ROLE, ACCESS_MANAGER_ROLE, PAUSER_ROLE.",
      },
    ],
    afterDeploy: [
      "Add SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS to your .env file.",
      "Only start creating events once your event metadata workflow is ready.",
      "Verify the contract so event access writes are publicly auditable.",
    ],
    envKeys: ["SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS"],
  },
};
