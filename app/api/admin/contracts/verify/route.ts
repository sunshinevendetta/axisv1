import { NextRequest, NextResponse } from "next/server";
import { verifyDeployedContract } from "@/src/lib/contract-verification";
import { hasOwnerSession } from "@/src/lib/owner-session";
import { type DeploymentChainId, type DeploymentContractKey } from "@/src/lib/deployment-hq";

type VerifyRequestBody = {
  address?: string;
  chainId?: DeploymentChainId;
  contractKey?: DeploymentContractKey;
  constructorArgs?: unknown[];
};

export async function POST(request: NextRequest) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as VerifyRequestBody;
    if (!body.address || !body.chainId || !body.contractKey || !Array.isArray(body.constructorArgs)) {
      return NextResponse.json({ error: "address, chainId, contractKey, and constructorArgs are required." }, { status: 400 });
    }

    const result = await verifyDeployedContract({
      address: body.address,
      chainId: body.chainId,
      contractKey: body.contractKey,
      constructorArgs: body.constructorArgs,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed." },
      { status: 400 },
    );
  }
}
