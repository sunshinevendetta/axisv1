import { Contract, ContractFactory, JsonRpcProvider, Wallet, getAddress, isAddress } from "ethers";
import {
  OWNER_ACCESS_CONTRACT_ROLES,
  normalizeOwnerAccessContractRoleName,
  normalizeOwnerAccessPresetRole,
  ownerAccessAbi,
  ownerAccessBytecode,
} from "@/src/lib/owner-access-contract";

const DEFAULT_BASE_URI = "ipfs://axis-owner-access/{id}.json";
const DEFAULT_CONTRACT_METADATA_URI = "ipfs://axis-owner-access/contract.json";

type ServerActionBase = {
  contractAddress?: string;
};

export type OwnerAccessServerAction =
  | ({
      action: "deploy";
      adminAddress?: string;
      initialMinterAddress?: string;
      baseUri?: string;
      contractMetadataUri?: string;
    } & ServerActionBase)
  | ({
      action: "mint";
      recipient: string;
      role?: string;
      tokenId?: string;
      amount?: string;
    } & ServerActionBase)
  | ({
      action: "revoke";
      account: string;
      tokenId: string;
      amount?: string;
    } & ServerActionBase)
  | ({
      action: "role";
      roleAction: "grant" | "revoke";
      contractRole: string;
      account: string;
    } & ServerActionBase);

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for server signer mode.`);
  }

  return value;
}

function parseOptionalAddress(value: string | undefined, fieldName: string) {
  if (!value) {
    return undefined;
  }

  if (!isAddress(value)) {
    throw new Error(`${fieldName} must be a valid address.`);
  }

  return getAddress(value);
}

function parseRequiredAddress(value: string | undefined, fieldName: string) {
  const parsed = parseOptionalAddress(value, fieldName);

  if (!parsed) {
    throw new Error(`${fieldName} is required.`);
  }

  return parsed;
}

function parsePositiveBigInt(value: string | undefined, fieldName: string, fallback = "1") {
  const raw = (value && value.trim()) || fallback;

  try {
    const parsed = BigInt(raw);

    if (parsed <= 0n) {
      throw new Error();
    }

    return parsed;
  } catch {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
}

function createWallet(rpcUrl: string, privateKey: string) {
  return new Wallet(privateKey, new JsonRpcProvider(rpcUrl));
}

export function getOwnerAccessServerStatus() {
  const hasDeployRpc = Boolean(process.env.OWNER_ACCESS_DEPLOY_RPC_URL);
  const hasDeployPrivateKey = Boolean(process.env.OWNER_ACCESS_DEPLOY_PRIVATE_KEY);
  const hasAdminSigner =
    Boolean(process.env.OWNER_ACCESS_ADMIN_PRIVATE_KEY) || Boolean(process.env.OWNER_ACCESS_DEPLOY_PRIVATE_KEY);

  return {
    deployReady: hasDeployRpc && hasDeployPrivateKey,
    writeReady: hasDeployRpc && hasDeployPrivateKey,
    adminReady: Boolean(process.env.OWNER_ACCESS_ADMIN_RPC_URL || process.env.OWNER_ACCESS_DEPLOY_RPC_URL) && hasAdminSigner,
    defaults: {
      contractAddress:
        process.env.OWNER_ACCESS_CONTRACT_ADDRESS || process.env.EPISODES_OWNER_ERC1155_ADDRESS || "",
      adminAddress: process.env.OWNER_ACCESS_ADMIN_ADDRESS || "",
      initialMinterAddress: process.env.OWNER_ACCESS_INITIAL_MINTER_ADDRESS || "",
      baseUri: process.env.OWNER_ACCESS_BASE_URI || DEFAULT_BASE_URI,
      contractMetadataUri:
        process.env.OWNER_ACCESS_CONTRACT_METADATA_URI || DEFAULT_CONTRACT_METADATA_URI,
      deployRpcUrl: process.env.OWNER_ACCESS_DEPLOY_RPC_URL || "",
      ownerTokenGate: process.env.EPISODES_OWNER_ERC1155_TOKEN_ID || "",
    },
    missing: {
      deploy: [
        !process.env.OWNER_ACCESS_DEPLOY_RPC_URL ? "OWNER_ACCESS_DEPLOY_RPC_URL" : null,
        !process.env.OWNER_ACCESS_DEPLOY_PRIVATE_KEY ? "OWNER_ACCESS_DEPLOY_PRIVATE_KEY" : null,
        !process.env.OWNER_ACCESS_ADMIN_ADDRESS ? "OWNER_ACCESS_ADMIN_ADDRESS" : null,
      ].filter(Boolean),
      mint: [
        !(process.env.OWNER_ACCESS_DEPLOY_RPC_URL || process.env.OWNER_ACCESS_MINT_RPC_URL)
          ? "OWNER_ACCESS_DEPLOY_RPC_URL or OWNER_ACCESS_MINT_RPC_URL"
          : null,
        !(process.env.OWNER_ACCESS_DEPLOY_PRIVATE_KEY || process.env.OWNER_ACCESS_MINT_PRIVATE_KEY)
          ? "OWNER_ACCESS_DEPLOY_PRIVATE_KEY or OWNER_ACCESS_MINT_PRIVATE_KEY"
          : null,
      ].filter(Boolean),
      admin: [
        !(process.env.OWNER_ACCESS_ADMIN_RPC_URL || process.env.OWNER_ACCESS_DEPLOY_RPC_URL)
          ? "OWNER_ACCESS_ADMIN_RPC_URL or OWNER_ACCESS_DEPLOY_RPC_URL"
          : null,
        !(process.env.OWNER_ACCESS_ADMIN_PRIVATE_KEY || process.env.OWNER_ACCESS_DEPLOY_PRIVATE_KEY)
          ? "OWNER_ACCESS_ADMIN_PRIVATE_KEY or OWNER_ACCESS_DEPLOY_PRIVATE_KEY"
          : null,
      ].filter(Boolean),
    },
  };
}

export async function runOwnerAccessServerAction(input: OwnerAccessServerAction) {
  if (input.action === "deploy") {
    const rpcUrl = requiredEnv("OWNER_ACCESS_DEPLOY_RPC_URL");
    const privateKey = requiredEnv("OWNER_ACCESS_DEPLOY_PRIVATE_KEY");
    const signer = createWallet(rpcUrl, privateKey);
    const adminAddress = parseRequiredAddress(
      input.adminAddress || process.env.OWNER_ACCESS_ADMIN_ADDRESS,
      "Admin address",
    );
    const initialMinterAddress = parseOptionalAddress(
      input.initialMinterAddress || process.env.OWNER_ACCESS_INITIAL_MINTER_ADDRESS || signer.address,
      "Initial minter address",
    );
    const factory = new ContractFactory(ownerAccessAbi, ownerAccessBytecode, signer);
    const contract = await factory.deploy(
      adminAddress,
      initialMinterAddress ?? signer.address,
      input.baseUri || process.env.OWNER_ACCESS_BASE_URI || DEFAULT_BASE_URI,
      input.contractMetadataUri ||
        process.env.OWNER_ACCESS_CONTRACT_METADATA_URI ||
        DEFAULT_CONTRACT_METADATA_URI,
    );

    const deploymentTx = contract.deploymentTransaction();
    await contract.waitForDeployment();

    return {
      mode: "server",
      action: input.action,
      contractAddress: await contract.getAddress(),
      transactionHash: deploymentTx?.hash ?? null,
      summary: "Owner access contract deployed with the server signer.",
    };
  }

  if (input.action === "mint") {
    const rpcUrl = process.env.OWNER_ACCESS_MINT_RPC_URL || requiredEnv("OWNER_ACCESS_DEPLOY_RPC_URL");
    const privateKey =
      process.env.OWNER_ACCESS_MINT_PRIVATE_KEY || requiredEnv("OWNER_ACCESS_DEPLOY_PRIVATE_KEY");
    const signer = createWallet(rpcUrl, privateKey);
    const contractAddress = parseRequiredAddress(
      input.contractAddress ||
        process.env.OWNER_ACCESS_CONTRACT_ADDRESS ||
        process.env.EPISODES_OWNER_ERC1155_ADDRESS,
      "Contract address",
    );
    const recipient = parseRequiredAddress(input.recipient, "Recipient");
    const role = normalizeOwnerAccessPresetRole(input.role || "owner");
    const contract = new Contract(contractAddress, ownerAccessAbi, signer);

    let tx;

    if (role === "owner") {
      tx = await contract.mintOwner(recipient);
    } else if (role === "admin") {
      tx = await contract.mintAdmin(recipient);
    } else if (role === "aiagent") {
      tx = await contract.mintAiAgent(recipient);
    } else {
      const tokenId = parsePositiveBigInt(input.tokenId, "Token ID");
      const amount = parsePositiveBigInt(input.amount, "Amount");
      tx = await contract.mint(recipient, tokenId, amount);
    }

    const receipt = await tx.wait();

    return {
      mode: "server",
      action: input.action,
      contractAddress,
      transactionHash: receipt?.hash ?? tx.hash ?? null,
      summary: `Minted access token(s) to ${recipient}.`,
    };
  }

  if (input.action === "revoke") {
    const rpcUrl = process.env.OWNER_ACCESS_ADMIN_RPC_URL || requiredEnv("OWNER_ACCESS_DEPLOY_RPC_URL");
    const privateKey =
      process.env.OWNER_ACCESS_ADMIN_PRIVATE_KEY || requiredEnv("OWNER_ACCESS_DEPLOY_PRIVATE_KEY");
    const signer = createWallet(rpcUrl, privateKey);
    const contractAddress = parseRequiredAddress(
      input.contractAddress ||
        process.env.OWNER_ACCESS_CONTRACT_ADDRESS ||
        process.env.EPISODES_OWNER_ERC1155_ADDRESS,
      "Contract address",
    );
    const account = parseRequiredAddress(input.account, "Wallet to revoke");
    const tokenId = parsePositiveBigInt(input.tokenId, "Token ID");
    const amount = parsePositiveBigInt(input.amount, "Amount");
    const contract = new Contract(contractAddress, ownerAccessAbi, signer);
    const tx = await contract.revoke(account, tokenId, amount);
    const receipt = await tx.wait();

    return {
      mode: "server",
      action: input.action,
      contractAddress,
      transactionHash: receipt?.hash ?? tx.hash ?? null,
      summary: `Revoked token ${tokenId.toString()} from ${account}.`,
    };
  }

  const rpcUrl = process.env.OWNER_ACCESS_ADMIN_RPC_URL || requiredEnv("OWNER_ACCESS_DEPLOY_RPC_URL");
  const privateKey =
    process.env.OWNER_ACCESS_ADMIN_PRIVATE_KEY || requiredEnv("OWNER_ACCESS_DEPLOY_PRIVATE_KEY");
  const signer = createWallet(rpcUrl, privateKey);
  const contractAddress = parseRequiredAddress(
    input.contractAddress ||
      process.env.OWNER_ACCESS_CONTRACT_ADDRESS ||
      process.env.EPISODES_OWNER_ERC1155_ADDRESS,
    "Contract address",
  );
  const contractRole = normalizeOwnerAccessContractRoleName(input.contractRole);
  const account = parseRequiredAddress(input.account, "Role account");
  const contract = new Contract(contractAddress, ownerAccessAbi, signer);
  const roleValue = OWNER_ACCESS_CONTRACT_ROLES[contractRole];
  const tx =
    input.roleAction === "grant"
      ? await contract.grantRole(roleValue, account)
      : await contract.revokeRole(roleValue, account);
  const receipt = await tx.wait();

  return {
    mode: "server",
    action: input.action,
    contractAddress,
    transactionHash: receipt?.hash ?? tx.hash ?? null,
    summary: `${input.roleAction}ed ${contractRole} ${input.roleAction === "grant" ? "to" : "from"} ${account}.`,
  };
}

