import { NextResponse } from "next/server";
import { buildARAppCollectMetadata, getARAppCollectTokenByTokenId } from "@/src/lib/arapp-collect";

type RouteContext = {
  params: Promise<{
    tokenId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { tokenId } = await context.params;
  const numericTokenId = Number(tokenId);

  if (!Number.isInteger(numericTokenId) || numericTokenId < 0) {
    return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
  }

  const token = getARAppCollectTokenByTokenId(numericTokenId);

  if (!token) {
    return NextResponse.json({ error: "Collectible not found" }, { status: 404 });
  }

  return NextResponse.json(buildARAppCollectMetadata(token));
}
