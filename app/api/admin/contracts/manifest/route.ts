import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { hasOwnerSession } from "@/src/lib/owner-session";

const manifestPath = path.join(process.cwd(), "deployments.json");

export async function GET() {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const raw = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8") : "{}";
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Could not read deployments.json" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    type ContractEntry = { address: string; txHash: string; deployedAt: string; chainId: number | null };
    const body = await request.json() as {
      contracts: Record<string, ContractEntry>;
      chain: { id: number | null; label: string; explorerUrl: string };
    };

    const emptyEntry = (): ContractEntry => ({ address: "", txHash: "", deployedAt: "", chainId: null });

    const manifest = {
      _note: "Auto-managed by Deployment HQ. Run `npm run env:sync` after any deploy to patch .env.",
      updatedAt: new Date().toISOString(),
      chain: body.chain ?? { id: null, label: "", explorerUrl: "" },
      contracts: {
        // Artwork stack (primary)
        seasonRegistry:   body.contracts?.seasonRegistry   ?? emptyEntry(),
        episodeContract:  body.contracts?.episodeContract  ?? emptyEntry(),
        // Legacy stack (optional)
        ownerAccess:       body.contracts?.ownerAccess       ?? emptyEntry(),
        submissionRegistry: body.contracts?.submissionRegistry ?? emptyEntry(),
        founderMembership:  body.contracts?.founderMembership  ?? emptyEntry(),
        eventRegistry:      body.contracts?.eventRegistry      ?? emptyEntry(),
      },
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true, updatedAt: manifest.updatedAt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not write deployments.json" },
      { status: 500 },
    );
  }
}
