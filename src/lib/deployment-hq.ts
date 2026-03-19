import eventRegistryArtifact from "@/artifacts/contracts/SpectraEventAccessRegistry.sol/SpectraEventAccessRegistry.json";
import founderArtifact from "@/artifacts/contracts/SpectraFounderSeason1_1155.sol/SpectraFounderSeason1_1155.json";
import ownerAccessArtifact from "@/artifacts/contracts/SpectraOwnerAccess1155.sol/SpectraOwnerAccess1155.json";
import submissionRegistryArtifact from "@/artifacts/contracts/SpectraSubmissionRegistry.sol/SpectraSubmissionRegistry.json";

export type DeploymentContractKey =
  | "ownerAccess"
  | "submissionRegistry"
  | "founderMembership"
  | "eventRegistry";

export const deploymentArtifacts = {
  ownerAccess: ownerAccessArtifact,
  submissionRegistry: submissionRegistryArtifact,
  founderMembership: founderArtifact,
  eventRegistry: eventRegistryArtifact,
} as const;

export const deploymentSteps: DeploymentContractKey[] = [
  "ownerAccess",
  "submissionRegistry",
  "founderMembership",
  "eventRegistry",
];

export const deploymentLabels: Record<DeploymentContractKey, string> = {
  ownerAccess: "Owner Access 1155",
  submissionRegistry: "Submission Registry",
  founderMembership: "Founder Membership S1",
  eventRegistry: "Event Access Registry",
};

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

export const defaultFounderBaseUri = "ipfs://spectra-founder-season1/";
export const defaultFounderContractMetadataUri = "ipfs://spectra-founder-season1/contract.json";

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
};

export const deploymentGuides: Record<DeploymentContractKey, DeploymentContractGuide> = {
  ownerAccess: {
    purpose: "Root operator gate for Deployment HQ, Episodes HQ, and any wallet-based admin workflow.",
    whyItExists:
      "This soulbound ERC-1155 is the control plane contract. Token ID 1 is owner, token ID 2 is admin, and token ID 3 is reserved for AI-agent automation.",
    deployWhen:
      "Deploy first. The rest of the stack can come later, but this contract establishes the final wallet gate and operator role model.",
    dependsOn: [],
    constructorDocs: [
      {
        key: "adminAddress",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "Receives DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE, and URI_MANAGER_ROLE at deployment time.",
        recommended:
          "Use the long-term root ops wallet or multisig, not a disposable deployer if you can avoid it.",
      },
      {
        key: "initialMinterAddress",
        name: "Initial minter",
        required: false,
        placeholder: "0x...",
        description:
          "Gets MINTER_ROLE if it differs from the admin. Useful for a temporary deployment or issuance wallet.",
        recommended:
          "Set it to the deployer or an ops wallet during rollout, then revoke later if you want tighter separation.",
      },
      {
        key: "baseUri",
        name: "Base URI",
        required: true,
        placeholder: "ipfs://spectra-owner-access/{id}.json",
        description:
          "ERC-1155 token metadata base URI. Wallets and explorers resolve token metadata from this path.",
        recommended:
          "Use a versioned immutable IPFS prefix that contains token metadata for IDs 1, 2, 3, and any future custom IDs.",
      },
      {
        key: "contractMetadataUri",
        name: "Contract metadata URI",
        required: true,
        placeholder: "ipfs://spectra-owner-access/contract.json",
        description:
          "OpenSea/marketplace style contract-level metadata pointer for collection-level display and attribution.",
        recommended:
          "Publish a contract-level JSON separately from token metadata so collection branding can change without editing token files.",
      },
    ],
    afterDeploy: [
      "Mint token ID 1 or 2 to the wallet that should retain final HQ access.",
      "Update EPISODES_OWNER_ERC1155_ADDRESS and EPISODES_OWNER_ERC1155_TOKEN_ID in the app env.",
      "Keep bootstrap allowlists empty once token-gated access is live.",
      "Verify the contract on BaseScan and Blockscout so operators can inspect source and ABI from explorers.",
    ],
    envKeys: [
      "OWNER_ACCESS_CONTRACT_ADDRESS",
      "EPISODES_OWNER_ERC1155_ADDRESS",
      "EPISODES_OWNER_ERC1155_TOKEN_ID",
      "EPISODES_OWNER_RPC_URL",
    ],
  },
  submissionRegistry: {
    purpose: "Intake and approval ledger for founder/member applications before minting.",
    whyItExists:
      "This registry keeps the applicant history, approval state, metadata URI, and mint linkage so the founder membership contract can stay focused on issuance.",
    deployWhen:
      "Deploy second, before founder membership, because the founder contract constructor requires its address.",
    dependsOn: ["ownerAccess"],
    constructorDocs: [
      {
        key: "adminAddress",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "Receives DEFAULT_ADMIN_ROLE, APPROVER_ROLE, and PAUSER_ROLE for submission review and circuit breaking.",
        recommended:
          "Use the operator wallet that will approve submissions and manage the founder season configuration.",
      },
    ],
    afterDeploy: [
      "Record the contract address for downstream founder membership deployment.",
      "After founder membership is live, call setFounderMembershipContract once to link the mint callback path.",
      "Persist SPECTRA_SUBMISSION_REGISTRY_ADDRESS in env so app and ops tooling target the correct registry.",
      "Verify the contract so approver/admin role holders can audit it from explorers.",
    ],
    envKeys: ["SPECTRA_SUBMISSION_REGISTRY_ADDRESS"],
  },
  founderMembership: {
    purpose: "Season 1 membership ERC-1155 that mints approved founder tokens and tracks submission linkage.",
    whyItExists:
      "This contract turns approved submissions into onchain membership tokens while preserving a clean dependency on the submission registry and season-level supply controls.",
    deployWhen:
      "Deploy third, after the submission registry exists and before event access if founder membership is part of the initial release.",
    dependsOn: ["submissionRegistry"],
    constructorDocs: [
      {
        key: "adminAddress",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "Receives DEFAULT_ADMIN_ROLE, PAUSER_ROLE, URI_MANAGER_ROLE, AIRDROP_ROLE, and CLOSER_ROLE.",
        recommended:
          "Use the same long-term admin wallet as the submission registry unless you have a clear reason to split duties.",
      },
      {
        key: "submissionRegistryAddress",
        name: "Submission registry",
        required: true,
        placeholder: "0x...",
        description:
          "Immutable pointer to the registry used to validate approved submissions and mark them minted.",
        recommended:
          "Use the exact address from Step 2. If this is wrong, minting flow breaks and requires a redeploy.",
      },
      {
        key: "baseUri",
        name: "Base URI",
        required: true,
        placeholder: "ipfs://spectra-founder-season1/",
        description:
          "Base path used by uri(tokenId), which appends tokenId + .json for per-member metadata files.",
        recommended:
          "Publish metadata files as 1.json, 2.json, 3.json, and keep the prefix stable and immutable.",
      },
      {
        key: "contractMetadataUri",
        name: "Contract metadata URI",
        required: true,
        placeholder: "ipfs://spectra-founder-season1/contract.json",
        description:
          "Collection-level metadata for explorers and marketplaces.",
        recommended:
          "Use a separate contract.json file that explains the season and collection-level properties.",
      },
      {
        key: "maxSupply",
        name: "Max supply",
        required: true,
        placeholder: "333",
        description:
          "Caps the total founder supply when non-zero. The contract enforces the ceiling during mintFounder.",
        recommended:
          "Set the intended season cap at deployment time. Use 0 only if you explicitly want uncapped issuance.",
      },
    ],
    afterDeploy: [
      "Link the founder contract back into the submission registry with setFounderMembershipContract.",
      "Persist SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS in env for app reads and operations.",
      "Confirm the submission registry address embedded in the constructor is correct before moving to production.",
      "Verify the contract so minted founder tokens resolve against verified source and ABI.",
    ],
    envKeys: ["SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS"],
  },
  eventRegistry: {
    purpose: "Event configuration and per-wallet event access control for attendee and artist permissions.",
    whyItExists:
      "This registry separates event operations from founder issuance so event managers can create events, attach metadata, and assign access roles independently.",
    deployWhen:
      "Deploy last in the current stack. It is standalone but operationally follows the core access and membership rollout.",
    dependsOn: ["ownerAccess"],
    constructorDocs: [
      {
        key: "adminAddress",
        name: "Admin address",
        required: true,
        placeholder: "0x...",
        description:
          "Receives DEFAULT_ADMIN_ROLE, EVENT_MANAGER_ROLE, ACCESS_MANAGER_ROLE, and PAUSER_ROLE.",
        recommended:
          "Use the event ops admin or the same multisig/root admin if centralizing control is more important than separation.",
      },
    ],
    afterDeploy: [
      "Persist SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS in env for event tooling and later admin surfaces.",
      "Create initial event records only after the correct event metadata workflow is ready.",
      "Verify the contract so role-holders can inspect access writes and ABI from explorers.",
    ],
    envKeys: ["SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS"],
  },
};
