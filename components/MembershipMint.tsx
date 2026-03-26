"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendCalls,
  useCallsStatus,
  useReadContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { encodeFunctionData } from "viem";
import Membership3D from "./Membership3D";

const MEMBERSHIP_CONTRACT = (
  process.env.NEXT_PUBLIC_COLLECT_CONTRACT_ADDRESS ?? "0xd26e98bbfa933ca10d60b9fe6a6a94ab600d3c08"
) as `0x${string}`;

const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL;

const MEMBERSHIP_ABI = [
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasMinted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "uri",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function MembershipMint() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [hasMinted, setHasMinted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { data: alreadyMinted } = useReadContract({
    address: MEMBERSHIP_CONTRACT,
    abi: MEMBERSHIP_ABI,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  const { data: currentSupply } = useReadContract({
    address: MEMBERSHIP_CONTRACT,
    abi: MEMBERSHIP_ABI,
    functionName: "totalSupply",
    chainId: base.id,
  });

  const { sendCalls, data: callsId, isPending: writePending } = useSendCalls();
  const { data: callsStatus } = useCallsStatus({
    id: callsId as string,
    query: { enabled: Boolean(callsId), refetchInterval: (query) => (query.state.data?.status === "CONFIRMED" ? false : 1000) },
  });
  const isSuccess = callsStatus?.status === "CONFIRMED";
  const txLoading = Boolean(callsId) && callsStatus?.status !== "CONFIRMED";
  const collectPrice = process.env.NEXT_PUBLIC_COLLECT_PRICE_USD?.trim();
  const numericPrice = collectPrice ? Number(collectPrice) : NaN;
  const priceLabel = Number.isFinite(numericPrice)
    ? numericPrice === 0
      ? "Limited Edition"
      : `$${numericPrice.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : "";

  const handleCollect = () => {
    sendCalls({
      calls: [
        {
          to: MEMBERSHIP_CONTRACT,
          data: encodeFunctionData({ abi: MEMBERSHIP_ABI, functionName: "mint" }),
        },
      ],
      capabilities: PAYMASTER_URL
        ? { paymasterService: { url: PAYMASTER_URL } }
        : undefined,
    });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (alreadyMinted || isSuccess) {
      setHasMinted(true);
    } else {
      setHasMinted(false);
    }
  }, [alreadyMinted, isSuccess, isConnected]);

  // Reset on disconnect
  useEffect(() => {
    if (!isConnected) {
      setHasMinted(false);
    }
  }, [isConnected]);

  const isMintDisabled =
    writePending ||
    txLoading ||
    hasMinted ||
    (currentSupply !== undefined && Number(currentSupply) >= 7777);

  if (!isMounted) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="mb-5 inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-white/55 backdrop-blur-md sm:text-xs">
          Founder Access
        </div>
        <h2 className="mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-base font-black tracking-[-0.05em] text-transparent sm:text-lg lg:text-xl">
          AXIS<span className="copy-mark">©</span> FOUNDER MEMBERSHIP
        </h2>

        <div className="mx-auto mb-10 max-w-2xl space-y-4 text-sm leading-6 text-gray-300 sm:text-base sm:leading-7 lg:text-lg">
          <p>AXIS<span className="copy-mark">©</span> Founder Membership is a limited access key issued to early participants and contributors during the initial formation of the AXIS<span className="copy-mark">©</span> ecosystem.</p>
          <p>This edition marks presence at the origin point and permanent recognition inside the AXIS<span className="copy-mark">©</span> cultural system.</p>
          <p>LIMITED EDITION</p>
        </div>

        <div className="mx-auto mb-12 w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-black via-gray-950 to-black p-5 shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-20 pointer-events-none" />
            <div className="aspect-square">
              <Membership3D />
            </div>
            <div className="mt-6 text-center sm:mt-8">
              <p className="text-base font-semibold text-white sm:text-xl lg:text-3xl">AXIS<span className="copy-mark">©</span> Founder Membership</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500 sm:text-sm">Origin-Level · Limited Edition</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="h-16 w-full max-w-sm animate-pulse rounded-2xl border border-white/12 bg-white/8" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
      <div className="mb-5 inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-white/55 backdrop-blur-md sm:text-xs">
        Founder Access
      </div>
      <h2 className="mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-base font-black tracking-[-0.05em] text-transparent sm:text-lg lg:text-xl">
        AXIS<span className="copy-mark">©</span> FOUNDER MEMBERSHIP
      </h2>

      <div className="mx-auto mb-10 max-w-2xl space-y-4 text-sm leading-6 text-gray-300 sm:text-base sm:leading-7 lg:text-lg">
        <p>AXIS<span className="copy-mark">©</span> Founder Membership is a limited access key issued to early participants and contributors during the initial formation of the AXIS<span className="copy-mark">©</span> ecosystem.</p>
        <p>This edition marks presence at the origin point and permanent recognition inside the AXIS<span className="copy-mark">©</span> cultural system.</p>
        <p>Limited Edition</p>
      </div>

      <div className="mx-auto mb-12 w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-black via-gray-950 to-black p-5 shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:p-8">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-20 pointer-events-none" />
          <div className="aspect-square">
            <Membership3D />
          </div>
          <div className="mt-6 text-center sm:mt-8">
            <p className="text-base font-semibold text-white sm:text-xl lg:text-3xl">AXIS<span className="copy-mark">©</span> Founder Membership</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500 sm:text-sm">Origin-Level · Limited Edition</p>
          </div>
        </div>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center gap-5">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector, chainId: base.id })}
              className="w-full max-w-sm rounded-2xl border border-white/14 bg-white/8 px-6 py-4 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/14 sm:text-base"
            >
              {connector.id.includes("coinbase") || connector.name.includes("Coinbase")
                ? "Coinbase / Base Smart Wallet"
                : connector.name || "Connect Wallet"}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-center">
            <button
              onClick={() => disconnect()}
              className="rounded-xl border border-white/28 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(140,140,140,0.14))] px-5 py-2 text-xs font-medium text-white backdrop-blur-xl transition-all hover:border-white/45 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(168,168,168,0.18))] sm:text-sm"
            >
              Disconnect
            </button>
          </div>

          {!hasMinted ? (
            <button
              onClick={handleCollect}
              disabled={isMintDisabled}
              className="mx-auto block w-full max-w-sm rounded-2xl bg-white px-6 py-4 text-sm font-black text-black shadow-lg shadow-white/20 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {writePending || txLoading ? "processing" : "collect now"}
            </button>
          ) : (
            <div className="h-12" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}
