"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { base } from "wagmi/chains";
import Membership3D from "./Membership3D";

const MEMBERSHIP_CONTRACT = "0xd26e98bbfa933ca10d60b9fe6a6a94ab600d3c08" as `0x${string}`;

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

  const { writeContract, data: hash, isPending: writePending } = useWriteContract();
  const { isLoading: txLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleMint = () => {
    writeContract({
      address: MEMBERSHIP_CONTRACT,
      abi: MEMBERSHIP_ABI,
      functionName: "mint",
      chainId: base.id,
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
      <div className="w-full max-w-xl mx-auto px-6 py-32 text-center">
        <h2 className="text-5xl lg:text-5xl font-black mb-20 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
          SPECTRA FOUNDER MEMBERSHIP
        </h2>

        <div className="max-w-lg mx-auto space-y-6 text-gray-400 text-sm lg:text-lg leading-relaxed mb-20">
          <p>SPECTRA Founder Membership is a limited access key issued to early participants and contributors during the initial formation of the SPECTRA ecosystem.</p>
          <p>This membership represents presence at the origin point. It grants permanent recognition as a founding participant and early alignment with the SPECTRA cultural system.</p>
          <p>Founder Memberships are free, non-replicable, and limited in supply. They exist separately from future public memberships.</p>
        </div>

        {currentSupply !== undefined && (
          <p className="text-lg lg:text-sm text-gray-400 mb-8">
            Minted: {currentSupply.toString()} / 7777
          </p>
        )}

        <div className="mx-auto w-full max-w-4xl mb-20">
          <div className="relative rounded-lg overflow-hidden shadow-lg border-6 border-gray-600 bg-gradient-to-br from-black via-gray-950 to-black p-12">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-white/10 rounded-lg" />
            <div className="aspect-square">
              <Membership3D />
            </div>
            <div className="mt-12 text-center">
              <p className="text-lg lg:text-4xl font-bold text-white">SPECTRA Founder Membership</p>
              <p className="text-base lg:text-lg text-gray-500 mt-3">Origin-Level · Limited Edition</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-10">
          <div className="px-20 py-8 text-lg font-bold rounded-lg bg-white/10 text-transparent border-2 border-gray-500">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-32 text-center">
      <h2 className="text-5xl lg:text-5xl font-black mb-20 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
        SPECTRA FOUNDER MEMBERSHIP
      </h2>

      <div className="max-w-lg mx-auto space-y-6 text-gray-400 text-sm lg:text-lg leading-relaxed mb-20">
        <p>SPECTRA Founder Membership is a limited access key issued to early participants and contributors during the initial formation of the SPECTRA ecosystem.</p>
        <p>This membership represents presence at the origin point. It grants permanent recognition as a founding participant and early alignment with the SPECTRA cultural system.</p>
        <p>Founder Memberships are free, non-replicable, and limited in supply. They exist separately from future public memberships.</p>
      </div>

      {currentSupply !== undefined && (
        <p className="text-lg lg:text-sm text-gray-400 mb-8">
          Minted: {currentSupply.toString()} / 7777
        </p>
      )}

      <div className="mx-auto w-full max-w-4xl mb-20">
        <div className="relative rounded-lg overflow-hidden shadow-lg border-6 border-gray-600 bg-gradient-to-br from-black via-gray-950 to-black p-12">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-white/10 rounded-lg" />
          <div className="aspect-square">
            <Membership3D />
          </div>
          <div className="mt-12 text-center">
            <p className="text-lg lg:text-4xl font-bold text-white">SPECTRA Founder Membership</p>
            <p className="text-base lg:text-lg text-gray-500 mt-3">Origin-Level · Limited Edition</p>
          </div>
        </div>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center gap-10">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector, chainId: base.id })}
              className="px-20 py-8 text-lg font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white border-2 border-gray-500 backdrop-blur-md transition-all shadow-xl"
            >
              {connector.id.includes("coinbase") || connector.name.includes("Coinbase")
                ? "Coinbase / Base Smart Wallet"
                : connector.name || "Connect Wallet"}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
            <p className="text-base text-gray-300 font-medium">
              Connected: <span className="font-mono text-white">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </p>

            <button
              onClick={() => disconnect()}
              className="px-6 py-3 text-sm font-medium text-white bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 rounded-xl transition-all backdrop-blur-sm"
            >
              Disconnect
            </button>
          </div>

          {!hasMinted ? (
            <button
              onClick={handleMint}
              disabled={isMintDisabled}
              className="px-24 py-10 mx-auto block text-sm lg:text-lg font-black text-black bg-white rounded-lg hover:bg-gray-200 shadow-lg shadow-white/50 transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {writePending || txLoading ? "Claiming..." : "Claim Founder Membership"}
            </button>
          ) : (
            <p className="text-xl font-black text-emerald-400 tracking-wide">
              Origin Confirmed ✅
            </p>
          )}
        </div>
      )}
    </div>
  );
}