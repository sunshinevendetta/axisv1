import fs from "node:fs/promises";
import path from "node:path";
import { encodeAbiParameters, type AbiParameter } from "viem";
import { deploymentArtifacts, deploymentChainMeta, type DeploymentChainId, type DeploymentContractKey } from "@/src/lib/deployment-hq";

type VerificationProvider = "basescan" | "blockscout";
type VerificationState = "disabled" | "submitted" | "pending" | "verified" | "failed";

export type VerificationResult = {
  provider: VerificationProvider;
  status: VerificationState;
  message: string;
  url?: string;
  guid?: string;
};

type VerificationRequest = {
  address: string;
  chainId: DeploymentChainId;
  contractKey: DeploymentContractKey;
  constructorArgs: unknown[];
};

type BuildInfoInput = {
  solcLongVersion: string;
  input: {
    language?: string;
    sources: Record<string, { content?: string }>;
    settings: {
      optimizer?: { enabled?: boolean; runs?: number };
      evmVersion?: string;
      viaIR?: boolean;
    };
  };
};

function cleanExplorerMessage(value: string | undefined, fallback: string) {
  const raw = value?.trim();
  if (!raw) return fallback;
  if (raw.startsWith("<!DOCTYPE") || raw.startsWith("<html")) {
    return fallback;
  }
  return raw.replace(/\s+/g, " ").slice(0, 1200);
}

function parseUrlCandidate(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function resolveBaseScanConfig(chainId: DeploymentChainId) {
  const defaultUrl = new URL("https://api.etherscan.io/v2/api");
  defaultUrl.searchParams.set("chainid", String(chainId));

  const apiKeyCandidate = process.env.BASESCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "";
  const apiUrlCandidate = process.env.ETHERSCAN_API_URL || "";

  const keyUrl = parseUrlCandidate(apiKeyCandidate);
  const apiUrl = parseUrlCandidate(apiUrlCandidate);

  const apiKey =
    keyUrl?.searchParams.get("apikey") ||
    apiUrl?.searchParams.get("apikey") ||
    (keyUrl ? "" : apiKeyCandidate);

  const endpoint = apiUrl || keyUrl || defaultUrl;
  endpoint.searchParams.delete("apikey");
  endpoint.searchParams.set("chainid", String(chainId));

  return {
    apiKey: apiKey.trim(),
    endpoint: endpoint.toString(),
  };
}

function resolveBlockscoutApiUrl(chainId: DeploymentChainId) {
  const candidate =
    chainId === 84532
      ? process.env.BASE_SEPOLIA_BLOCKSCOUT_API_URL
      : process.env.BASE_BLOCKSCOUT_API_URL;

  const parsed = parseUrlCandidate(candidate);
  if (parsed) {
    return parsed.toString().replace(/\/+$/, "");
  }

  return chainId === 84532
    ? "https://base-sepolia.blockscout.com/api"
    : "https://base.blockscout.com/api";
}

function normalizeStatusMessage(provider: VerificationProvider, status: VerificationState, message: string) {
  if (provider === "basescan") {
    if (status === "disabled") return "BaseScan verification is waiting for an API key.";
    if (status === "pending") return "BaseScan accepted the request and is still processing it.";
    if (status === "failed") return cleanExplorerMessage(message, "BaseScan could not verify this contract yet.");
  }

  if (provider === "blockscout") {
    if (status === "submitted" || status === "pending") return "Blockscout verification request submitted.";
    if (status === "failed") return cleanExplorerMessage(message, "Blockscout could not verify this contract yet.");
  }

  return cleanExplorerMessage(message, "Verification status updated.");
}

function getArtifact(contractKey: DeploymentContractKey) {
  return deploymentArtifacts[contractKey];
}

async function getBuildInfo(contractKey: DeploymentContractKey) {
  const artifact = getArtifact(contractKey);
  const buildInfoPath = path.join(process.cwd(), "artifacts", "build-info", `${artifact.buildInfoId}.json`);
  const buildInfo = JSON.parse(await fs.readFile(buildInfoPath, "utf8")) as BuildInfoInput;
  return { artifact, buildInfo };
}

function toAbiValues(params: readonly AbiParameter[], values: unknown[]) {
  return params.map((param, index) => coerceAbiValue(param, values[index]));
}

function coerceAbiValue(param: AbiParameter, value: unknown): unknown {
  if (
    value &&
    typeof value === "object" &&
    "__type" in value &&
    "value" in value &&
    (value as { __type?: string }).__type === "bigint"
  ) {
    return coerceAbiValue(param, (value as { value: string }).value);
  }

  if (param.type.endsWith("[]")) {
    const innerType = param.type.slice(0, -2);
    if (!Array.isArray(value)) {
      throw new Error(`Constructor argument ${param.name || param.type} must be an array.`);
    }
    return value.map((item) => coerceAbiValue({ ...param, type: innerType }, item));
  }

  if (param.type.startsWith("uint") || param.type.startsWith("int")) {
    if (typeof value === "bigint") return value;
    if (typeof value === "number") return BigInt(value);
    if (typeof value === "string" && value.trim()) return BigInt(value);
    throw new Error(`Constructor argument ${param.name || param.type} must be a number.`);
  }

  if (param.type === "bool") {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true";
    return Boolean(value);
  }

  return value;
}

function getConstructorArgs(contractKey: DeploymentContractKey, values: unknown[]) {
  const artifact = getArtifact(contractKey);
  const ctor = artifact.abi.find((entry) => entry.type === "constructor");
  if (!ctor || !("inputs" in ctor) || !ctor.inputs?.length) return "";
  const encoded = encodeAbiParameters(ctor.inputs as AbiParameter[], toAbiValues(ctor.inputs as AbiParameter[], values));
  return encoded.slice(2);
}

function getSpdxIdentifier(source: string | undefined) {
  const match = source?.match(/SPDX-License-Identifier:\s*([^\s*]+)/);
  return match?.[1]?.trim() ?? "UNLICENSED";
}

function getLicenseMeta(spdx: string) {
  const normalized = spdx.toUpperCase();
  const licenses: Record<string, { etherscan: string; blockscout: string }> = {
    "UNLICENSED": { etherscan: "2", blockscout: "none" },
    "MIT": { etherscan: "3", blockscout: "mit" },
    "GPL-2.0": { etherscan: "4", blockscout: "gnu_gpl_v2" },
    "GPL-3.0": { etherscan: "5", blockscout: "gnu_gpl_v3" },
    "LGPL-2.1": { etherscan: "6", blockscout: "gnu_lgpl_v2_1" },
    "LGPL-3.0": { etherscan: "7", blockscout: "gnu_lgpl_v3" },
    "BSD-2-CLAUSE": { etherscan: "8", blockscout: "bsd_2_clause" },
    "BSD-3-CLAUSE": { etherscan: "9", blockscout: "bsd_3_clause" },
    "MPL-2.0": { etherscan: "10", blockscout: "mpl_2_0" },
    "OSL-3.0": { etherscan: "11", blockscout: "osl_3_0" },
    "APACHE-2.0": { etherscan: "12", blockscout: "apache_2_0" },
    "AGPL-3.0": { etherscan: "13", blockscout: "gnu_affero_gpl_v3" },
    "BSL-1.1": { etherscan: "14", blockscout: "bsl_1_1" },
  };

  return licenses[normalized] ?? { etherscan: "2", blockscout: "none" };
}

async function submitBaseScanVerification(request: VerificationRequest) {
  const { apiKey, endpoint } = resolveBaseScanConfig(request.chainId);
  const explorerBaseUrl = deploymentChainMeta[request.chainId].explorerUrl;
  if (!apiKey) {
    return {
      provider: "basescan",
      status: "disabled",
      message: normalizeStatusMessage("basescan", "disabled", ""),
      url: `${explorerBaseUrl}/address/${request.address}#code`,
    } satisfies VerificationResult;
  }

  const { artifact, buildInfo } = await getBuildInfo(request.contractKey);
  const sourceName = artifact.inputSourceName || artifact.sourceName;
  const source = buildInfo.input.sources[sourceName]?.content;
  const license = getLicenseMeta(getSpdxIdentifier(source));
  const optimizerEnabled = Boolean(buildInfo.input.settings.optimizer?.enabled);
  const optimizerRuns = buildInfo.input.settings.optimizer?.runs ?? 200;
  const constructorArguments = getConstructorArgs(request.contractKey, request.constructorArgs);

  const body = new URLSearchParams({
    apikey: apiKey,
    chainid: String(request.chainId),
    module: "contract",
    action: "verifysourcecode",
    contractaddress: request.address,
    sourceCode: JSON.stringify(buildInfo.input),
    codeformat: "solidity-standard-json-input",
    contractname: `${sourceName}:${artifact.contractName}`,
    compilerversion: `v${buildInfo.solcLongVersion}`,
    optimizationUsed: optimizerEnabled ? "1" : "0",
    runs: String(optimizerRuns),
    constructorArguments,
    evmversion: buildInfo.input.settings.evmVersion || "default",
    licenseType: license.etherscan,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const data = (await response.json()) as { status?: string; result?: string; message?: string };
  const resultText = data.result || data.message || "Verification submission failed.";

  if (resultText.toLowerCase().includes("already verified")) {
    return {
      provider: "basescan",
      status: "verified",
      message: "BaseScan already marked this contract as verified.",
      url: `${explorerBaseUrl}/address/${request.address}#code`,
    } satisfies VerificationResult;
  }

  if (data.status !== "1" || !data.result) {
    return {
      provider: "basescan",
      status: "failed",
      message: normalizeStatusMessage("basescan", "failed", resultText),
      url: `${explorerBaseUrl}/address/${request.address}#code`,
    } satisfies VerificationResult;
  }

  const guid = data.result;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const statusUrl = new URL(endpoint);
    statusUrl.searchParams.set("apikey", apiKey);
    statusUrl.searchParams.set("chainid", String(request.chainId));
    statusUrl.searchParams.set("module", "contract");
    statusUrl.searchParams.set("action", "checkverifystatus");
    statusUrl.searchParams.set("guid", guid);

    const statusResponse = await fetch(statusUrl, { cache: "no-store" });
    const statusData = (await statusResponse.json()) as { status?: string; result?: string; message?: string };
    const statusText = statusData.result || statusData.message || "Verification pending.";
    const lowered = statusText.toLowerCase();

    if (lowered.includes("pass") || lowered.includes("verified")) {
      return {
        provider: "basescan",
        status: "verified",
        message: normalizeStatusMessage("basescan", "verified", statusText),
        guid,
        url: `${explorerBaseUrl}/address/${request.address}#code`,
      } satisfies VerificationResult;
    }

    if (!lowered.includes("pending") && !lowered.includes("queue")) {
      return {
        provider: "basescan",
        status: "failed",
        message: normalizeStatusMessage("basescan", "failed", statusText),
        guid,
        url: `${explorerBaseUrl}/address/${request.address}#code`,
      } satisfies VerificationResult;
    }
  }

  return {
    provider: "basescan",
    status: "pending",
    message: normalizeStatusMessage("basescan", "pending", ""),
    guid,
    url: `${explorerBaseUrl}/address/${request.address}#code`,
  } satisfies VerificationResult;
}

async function submitBlockscoutVerification(request: VerificationRequest) {
  const apiUrl = resolveBlockscoutApiUrl(request.chainId);
  const siteUrl = deploymentChainMeta[request.chainId].blockscoutUrl;
  const { artifact, buildInfo } = await getBuildInfo(request.contractKey);
  const sourceName = artifact.inputSourceName || artifact.sourceName;
  const source = buildInfo.input.sources[sourceName]?.content;
  const license = getLicenseMeta(getSpdxIdentifier(source));
  const form = new FormData();
  form.set("compiler_version", buildInfo.solcLongVersion);
  form.set("contract_name", artifact.contractName);
  form.set("file_name", sourceName);
  form.set("license_type", license.blockscout);
  form.set("is_optimization_enabled", String(Boolean(buildInfo.input.settings.optimizer?.enabled)));
  form.set("optimization_runs", String(buildInfo.input.settings.optimizer?.runs ?? 200));
  form.set("evm_version", buildInfo.input.settings.evmVersion || "default");
  form.set("autodetect_constructor_args", "false");
  form.set("constructor_args", getConstructorArgs(request.contractKey, request.constructorArgs));
  form.set("code_format", "solidity-standard-json-input");
  form.set("files[0]", JSON.stringify(buildInfo.input));

  try {
    const response = await fetch(`${apiUrl}/v2/smart-contracts/${request.address}/verification/via/standard-input`, {
      method: "POST",
      body: form,
      cache: "no-store",
    });

    if (response.ok) {
      return {
        provider: "blockscout",
        status: "submitted",
        message: normalizeStatusMessage("blockscout", "submitted", ""),
        url: `${siteUrl}/address/${request.address}?tab=contract`,
      } satisfies VerificationResult;
    }

    const errorText = await response.text();
    return {
      provider: "blockscout",
      status: "failed",
      message: normalizeStatusMessage("blockscout", "failed", errorText),
      url: `${siteUrl}/address/${request.address}?tab=contract`,
    } satisfies VerificationResult;
  } catch (error) {
    return {
      provider: "blockscout",
      status: "failed",
      message: normalizeStatusMessage("blockscout", "failed", error instanceof Error ? error.message : undefined),
      url: `${siteUrl}/address/${request.address}?tab=contract`,
    } satisfies VerificationResult;
  }
}

export async function verifyDeployedContract(request: VerificationRequest) {
  const [basescan, blockscout] = await Promise.all([
    submitBaseScanVerification(request),
    submitBlockscoutVerification(request),
  ]);

  return {
    address: request.address,
    chainId: request.chainId,
    contractKey: request.contractKey,
    results: { basescan, blockscout },
  };
}
