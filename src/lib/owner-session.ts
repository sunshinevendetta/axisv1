import crypto from "node:crypto";
import { cookies } from "next/headers";
import { Contract, JsonRpcProvider, getAddress, hashMessage, isAddress, verifyMessage } from "ethers";

const OWNER_SESSION_COOKIE = "spectra_owner_session";
const OWNER_NONCE_COOKIE = "spectra_owner_nonce";
const ERC1155_ABI = ["function balanceOf(address account, uint256 id) view returns (uint256)"];
const ERC1271_ABI = ["function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)"];
const ERC1271_MAGIC_VALUE = "0x1626ba7e";

function getOwnerEnvConfig() {
  return {
    secret: process.env.EPISODES_ADMIN_SESSION_SECRET,
    ownerAccessErc1155Address: process.env.EPISODES_OWNER_ERC1155_ADDRESS,
    ownerAccessTokenIds: process.env.EPISODES_OWNER_ERC1155_TOKEN_ID,
    ownerAccessRpcUrl: process.env.EPISODES_OWNER_RPC_URL || "https://mainnet.base.org",
    ownerAllowlist: process.env.EPISODES_OWNER_ALLOWLIST,
  };
}

function buildSessionHash(subject: string, secret: string) {
  return crypto.createHash("sha256").update(`${subject}:${secret}`).digest("hex");
}

function buildSessionCookieValue(subject: string, secret: string) {
  return `${subject}|${buildSessionHash(subject, secret)}`;
}

function parseAllowlist(allowlist: string | undefined) {
  return new Set(
    (allowlist ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => getAddress(value)),
  );
}

function parseTokenIds(tokenIds: string | undefined) {
  return (tokenIds ?? "").split(",").reduce<bigint[]>((parsed, value) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return parsed;
    }

    try {
      parsed.push(BigInt(trimmed));
    } catch {
      return parsed;
    }

    return parsed;
  }, []);
}

function ownerVerificationRpcUrls() {
  const configuredRpc = getOwnerEnvConfig().ownerAccessRpcUrl;

  return Array.from(
    new Set(
      [
        configuredRpc,
        "https://mainnet.base.org",
        "https://base-sepolia-rpc.publicnode.com",
      ].filter(Boolean),
    ),
  );
}

async function verifyContractWalletSignature(address: string, signature: string, message: string) {
  const checksumAddress = getAddress(address);
  const digest = hashMessage(message);

  for (const rpcUrl of ownerVerificationRpcUrls()) {
    try {
      const provider = new JsonRpcProvider(rpcUrl);
      const code = await provider.getCode(checksumAddress);

      if (!code || code === "0x") {
        continue;
      }

      const contract = new Contract(checksumAddress, ERC1271_ABI, provider);
      const result = await contract.isValidSignature(digest, signature);

      if (String(result).toLowerCase() === ERC1271_MAGIC_VALUE) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

export function isOwnerWalletConfigured() {
  const { ownerAccessErc1155Address, ownerAccessTokenIds, secret } = getOwnerEnvConfig();
  return Boolean(ownerAccessErc1155Address && ownerAccessTokenIds && secret);
}

export function isOwnerAuthConfigured() {
  return Boolean(getOwnerEnvConfig().secret);
}

export function isOwnerBootstrapOnly() {
  return isOwnerAuthConfigured() && !isOwnerWalletConfigured();
}

export async function setOwnerSession(subject: string) {
  const config = getOwnerEnvConfig();

  if (!config.secret) {
    throw new Error("EPISODES_ADMIN_SESSION_SECRET is required.");
  }

  const cookieStore = await cookies();
  cookieStore.set(OWNER_SESSION_COOKIE, buildSessionCookieValue(subject, config.secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearOwnerSession() {
  const cookieStore = await cookies();
  cookieStore.set(OWNER_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set(OWNER_NONCE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function hasOwnerSession() {
  const config = getOwnerEnvConfig();

  if (!config.secret) {
    return false;
  }

  const cookieStore = await cookies();
  const rawSession = cookieStore.get(OWNER_SESSION_COOKIE)?.value;

  if (!rawSession) {
    return false;
  }

  const [subject, hash] = rawSession.split("|");
  if (!subject || !hash) {
    return false;
  }

  return buildSessionHash(subject, config.secret) === hash;
}

export async function hasTokenGatedOwnerSession() {
  const subject = await getOwnerSessionSubject();

  if (!subject) {
    return false;
  }

  return !subject.startsWith("bootstrap:");
}

export async function getOwnerSessionSubject() {
  const config = getOwnerEnvConfig();

  if (!config.secret) {
    return null;
  }

  const cookieStore = await cookies();
  const rawSession = cookieStore.get(OWNER_SESSION_COOKIE)?.value;

  if (!rawSession) {
    return null;
  }

  const [subject, hash] = rawSession.split("|");
  if (!subject || !hash) {
    return null;
  }

  return buildSessionHash(subject, config.secret) === hash ? subject : null;
}

export async function createOwnerWalletChallenge(address: string) {
  if (!isAddress(address)) {
    throw new Error("A valid wallet address is required.");
  }

  const nonce = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(OWNER_NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return buildOwnerWalletMessage(getAddress(address), nonce);
}

export function buildOwnerWalletMessage(address: string, nonce: string) {
  return [
    "AXIS owner access",
    `Address: ${getAddress(address)}`,
    `Nonce: ${nonce}`,
    "Sign this message to unlock the episodes control room.",
  ].join("\n");
}

export async function verifyOwnerWalletSignature(address: string, signature: string) {
  if (!isAddress(address)) {
    throw new Error("A valid wallet address is required.");
  }

  const cookieStore = await cookies();
  const nonce = cookieStore.get(OWNER_NONCE_COOKIE)?.value;

  if (!nonce) {
    throw new Error("Wallet challenge expired. Request a new signature.");
  }

  const checksumAddress = getAddress(address);
  const message = buildOwnerWalletMessage(checksumAddress, nonce);

  cookieStore.set(OWNER_NONCE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  try {
    const recoveredAddress = getAddress(verifyMessage(message, signature));
    return recoveredAddress === checksumAddress;
  } catch {
    return await verifyContractWalletSignature(checksumAddress, signature, message);
  }
}

export async function addressHasOwnerAccess(address: string) {
  const config = getOwnerEnvConfig();
  const checksumAddress = getAddress(address);
  const allowlist = parseAllowlist(config.ownerAllowlist);

  if (allowlist.has(checksumAddress)) {
    return true;
  }

  const tokenIds = parseTokenIds(config.ownerAccessTokenIds);

  if (!config.ownerAccessErc1155Address || tokenIds.length === 0) {
    return false;
  }

  const provider = new JsonRpcProvider(config.ownerAccessRpcUrl);
  const contractCode = await provider.getCode(config.ownerAccessErc1155Address);

  if (!contractCode || contractCode === "0x") {
    throw new Error(
      `EPISODES_OWNER_ERC1155_ADDRESS is not a deployed contract on EPISODES_OWNER_RPC_URL. Check the address, token IDs, and network pairing.`,
    );
  }

  const contract = new Contract(config.ownerAccessErc1155Address, ERC1155_ABI, provider);

  for (const tokenId of tokenIds) {
    try {
      const balance = await contract.balanceOf(checksumAddress, tokenId);
      if (balance > 0n) {
        return true;
      }
    } catch (error) {
      throw new Error(
        `Failed to read owner access token ${tokenId.toString()} from ${config.ownerAccessErc1155Address}. Confirm the contract address and RPC network match the deployed owner-access contract.`,
      );
    }
  }

  return false;
}

export async function issueOwnerWalletSession(address: string) {
  const checksumAddress = getAddress(address);

  if (!(await addressHasOwnerAccess(checksumAddress))) {
    throw new Error("This wallet does not hold the required owner ERC-1155 token.");
  }

  await setOwnerSession(`wallet:${checksumAddress}`);
}

export async function issueBootstrapWalletSession(address: string) {
  await setOwnerSession(`bootstrap:${getAddress(address)}`);
}
