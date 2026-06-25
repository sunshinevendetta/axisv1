import { NextResponse } from "next/server";

type StoredClaim = {
  claimId: string;
  missionId: string;
  uid: string;
  proofName: string;
  hasProofImage: boolean;
  createdAt: string;
  usedAt: string | null;
};

declare global {
  var okxClaims: Map<string, StoredClaim> | undefined;
}

function html(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:Arial,sans-serif}.card{width:min(88vw,420px);border:1px solid rgba(255,255,255,.18);border-radius:24px;padding:28px;background:rgba(255,255,255,.06)}h1{font-size:34px;margin:0 0 12px}p{line-height:1.45;color:rgba(255,255,255,.72)}code{display:block;margin-top:16px;padding:12px;border-radius:12px;background:#fff;color:#000;word-break:break-all}</style></head><body><main class="card">${body}</main></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ claimId: string }> },
) {
  const { claimId } = await context.params;
  const store = globalThis.okxClaims;
  const claim = store?.get(claimId);

  if (!claim) {
    return html("QR not found", `<h1>QR not found</h1><p>This code is not active in this runtime.</p><code>${claimId}</code>`, 404);
  }

  if (claim.usedAt) {
    return html("Already used", `<h1>Already used</h1><p>This drink QR was already scanned.</p><p>${claim.usedAt}</p><code>${claim.claimId}</code>`, 409);
  }

  claim.usedAt = new Date().toISOString();
  store?.set(claimId, claim);

  return html("Drink approved", `<h1>Drink approved</h1><p>Mission: ${claim.missionId}</p><p>Proof: screenshot uploaded</p><code>${claim.claimId}</code>`);
}
