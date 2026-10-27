/**
 * CDP Paymaster JSON-RPC proxy for Velvique card mints. Same pattern as the
 * Pizza Day proxy: the CDP key stays on the server, and only UserOps that
 * call mint(bytes8,string,uint256,bytes) on the cards contract are forwarded.
 *
 * Env (server-only): CDP_PAYMASTER_URL, NEXT_PUBLIC_VELVIQUE_CARDS_ADDRESS.
 */

import { NextResponse } from "next/server";
import { toFunctionSelector } from "viem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MINT_SELECTOR = toFunctionSelector("mint(bytes8,string,uint256,bytes)");
const ALLOWED_METHODS = new Set(["pm_getPaymasterStubData", "pm_getPaymasterData"]);

type JsonRpcRequest = { jsonrpc?: string; id?: number | string | null; method?: string; params?: unknown[] };

function jsonRpcError(id: number | string | null | undefined, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status: 200 });
}

/* callData must reference both the cards contract and the mint selector. */
function callDataLooksLikeCardMint(callData: string, cardsAddress: string) {
  if (!callData.startsWith("0x")) return false;
  const hay = callData.slice(2).toLowerCase();
  return hay.includes(cardsAddress.toLowerCase().replace(/^0x/, "")) && hay.includes(MINT_SELECTOR.toLowerCase().replace(/^0x/, ""));
}

export async function POST(request: Request) {
  const cdpUrl = process.env.CDP_PAYMASTER_URL;
  const cardsAddress = process.env.NEXT_PUBLIC_VELVIQUE_CARDS_ADDRESS;
  if (!cdpUrl) return jsonRpcError(null, -32603, "paymaster not configured");
  if (!cardsAddress || !/^0x[0-9a-fA-F]{40}$/.test(cardsAddress)) return jsonRpcError(null, -32603, "cards address not configured");

  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return jsonRpcError(null, -32700, "invalid JSON");
  }

  const { id = null, method } = body;
  if (!method || !ALLOWED_METHODS.has(method)) return jsonRpcError(id, -32601, `method not allowed: ${method ?? "none"}`);
  const userOp = Array.isArray(body.params) ? body.params[0] : null;
  const callData = userOp && typeof userOp === "object" && typeof (userOp as Record<string, unknown>).callData === "string" ? ((userOp as Record<string, unknown>).callData as string) : "";
  if (!callDataLooksLikeCardMint(callData, cardsAddress)) return jsonRpcError(id, -32601, "callData does not target the cards contract mint");

  const upstream = await fetch(cdpUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
