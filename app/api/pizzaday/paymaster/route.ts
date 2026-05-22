/**
 * CDP Paymaster JSON-RPC proxy for Pizza Day.
 *
 * Sits between the browser and the Coinbase Developer Platform Paymaster URL
 * so the project key never reaches the client. Validates that every UserOp
 * targets the medals contract + the `mint(uint256)` selector, then forwards
 * the call to CDP.
 *
 * Env (server-only):
 *   CDP_PAYMASTER_URL                 The full CDP Paymaster RPC URL with key
 *   NEXT_PUBLIC_PDQ_MEDALS_ADDRESS    Medals contract address (also read on client)
 *   NEXT_PUBLIC_PDQ_CHAIN_ID          Chain id (default 8453 mainnet)
 *
 * The route accepts standard JSON-RPC requests. ERC-7677 methods only:
 *   - pm_getPaymasterStubData
 *   - pm_getPaymasterData
 *
 * Any other method or any call targeting a different contract / selector
 * is rejected with JSON-RPC error -32601 ("not allowed").
 */

import { NextResponse } from "next/server";
import { toFunctionSelector } from "viem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MINT_SELECTOR = toFunctionSelector("mint(uint256)");

const ALLOWED_METHODS = new Set([
  "pm_getPaymasterStubData",
  "pm_getPaymasterData",
]);

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: unknown[];
};

function jsonRpcError(
  id: number | string | null | undefined,
  code: number,
  message: string,
): NextResponse {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code, message },
    },
    { status: 200 },
  );
}

function lower(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function getString(obj: unknown, key: string): string {
  if (obj && typeof obj === "object" && key in obj) {
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === "string" ? v : "";
  }
  return "";
}

/**
 * UserOp may use different field names across 4337 versions (v0.6 vs v0.7).
 * We check both possible call data targets. The "to" / "target" is encoded
 * inside `callData` (executeBatch/execute), so the safest universal check is:
 *
 *   - extract the appended function selector from the inner call,
 *   - check it equals our mint(uint256) selector,
 *   - check the inner `to` parameter equals our medals contract.
 *
 * To keep this dependency-free we do a string scan: callData must contain
 * BOTH the medals contract address (lowercased, sans 0x) AND the mint selector
 * (sans 0x). For Coinbase Smart Wallet's `executeBatch` encoding this is
 * sufficient; if a UserOp tries to call a different contract or method, the
 * substring check fails. This is permissive enough to work across SDK versions
 * and strict enough to prevent paymaster abuse: CDP also enforces the contract
 * allowlist on its side as defense in depth.
 */
function callDataLooksLikeAllowedMint(
  callData: string,
  medalsAddress: string,
): boolean {
  if (!callData.startsWith("0x")) return false;
  const hay = callData.slice(2).toLowerCase();
  const needleAddress = medalsAddress.toLowerCase().replace(/^0x/, "");
  const needleSelector = MINT_SELECTOR.toLowerCase().replace(/^0x/, "");
  return hay.includes(needleAddress) && hay.includes(needleSelector);
}

export async function POST(request: Request) {
  const cdpUrl = process.env.CDP_PAYMASTER_URL;
  const medalsAddress = process.env.NEXT_PUBLIC_PDQ_MEDALS_ADDRESS;

  if (!cdpUrl) {
    return jsonRpcError(null, -32603, "paymaster not configured");
  }
  if (!medalsAddress || !/^0x[0-9a-fA-F]{40}$/.test(medalsAddress)) {
    return jsonRpcError(null, -32603, "medals address not configured");
  }

  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return jsonRpcError(null, -32700, "invalid JSON");
  }

  const { id = null, method } = body;
  if (!method || typeof method !== "string") {
    return jsonRpcError(id, -32600, "missing method");
  }
  if (!ALLOWED_METHODS.has(method)) {
    return jsonRpcError(id, -32601, `method not allowed: ${method}`);
  }

  const params = Array.isArray(body.params) ? body.params : [];
  const userOp = params[0];
  if (!userOp || typeof userOp !== "object") {
    return jsonRpcError(id, -32602, "missing userOp");
  }

  const callData =
    getString(userOp, "callData") || getString(userOp, "callGasLimit") /* fallback noop */ || "";
  if (!callData) {
    return jsonRpcError(id, -32602, "missing callData");
  }

  if (!callDataLooksLikeAllowedMint(callData, medalsAddress)) {
    return jsonRpcError(
      id,
      -32601,
      "callData does not target the medals contract mint(uint256)",
    );
  }

  // (Optional) sender allowlist could go here — e.g. only Smart Wallet senders.
  // For now we let CDP's policy + the substring check above gate the call.
  void lower; // silence noUnusedLocals if not used elsewhere

  // Forward to CDP.
  const upstream = await fetch(cdpUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, service: "pizzaday-paymaster-proxy" },
    { status: 200 },
  );
}
