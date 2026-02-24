"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import SpectraStepperForm from "./SpectraStepperForm";
import MembershipMint from "./MembershipMint";
import VideoBackground from "./backgrounds/VideoBackground";
import { base } from "wagmi/chains";

const MEMBERSHIP_CONTRACT = "0xd26e98bbfa933ca10d60b9fe6a6a94ab600d3c08" as `0x${string}`;

const MEMBERSHIP_ABI = [
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasMinted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function GatedMembershipFlow() {
  const { address, isConnected } = useAccount();
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const [hasMembership, setHasMembership] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const { data: alreadyMinted } = useReadContract({
    address: MEMBERSHIP_CONTRACT,
    abi: MEMBERSHIP_ABI,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  useEffect(() => {
    if (!isConnected || !address) {
      setHasSubmittedForm(false);
      setHasMembership(false);
      setIsChecking(false);
      return;
    }

    const key = `spectra_form_submitted_${address.toLowerCase()}`;
    const submitted = localStorage.getItem(key) === "true";
    setHasSubmittedForm(submitted);

    setHasMembership(!!alreadyMinted);

    setIsChecking(false);
  }, [address, isConnected, alreadyMinted]);

  const handleFormSuccess = () => {
    if (address) {
      localStorage.setItem(`spectra_form_submitted_${address.toLowerCase()}`, "true");
    }
    setHasSubmittedForm(true);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-3xl font-bold text-white/80 animate-pulse">
          Loading your status...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-screen overflow-hidden bg-black">
      {/* Background stays full-screen */}
      <VideoBackground />

      {/* Main content - centered */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        {/* Tight card container */}
        <div className="
          w-full 
          max-w-3xl 
          mx-auto 
          bg-black/40 
          backdrop-blur-xl 
          border border-white/10 
          rounded-2xl 
          shadow-2xl 
          overflow-hidden
        ">
          {/* Inner padding is small to avoid bloat */}
          <div className="p-6 md:p-8">
            {hasMembership ? (
              // Already minted → just the modal, no title/desc to save space
              <div className="w-full">
                <MembershipMint />
              </div>
            ) : isConnected && hasSubmittedForm ? (
              <>
                <h1 className="text-4xl md:text-5xl font-black mb-6 text-center bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent tracking-tight">
                  STEP 2: CLAIM FOUNDER MEMBERSHIP
                </h1>

                <p className="text-lg text-white/80 text-center mb-8">
                  Thank you for registering. You may now claim your permanent Founder Membership.
                </p>

                <div className="w-full">
                  <MembershipMint />
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-black mb-6 text-center bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent tracking-tight">
                  {isConnected ? "STEP 1: COMPLETE YOUR INFO" : "STEP 1: CONNECT WALLET"}
                </h1>

                <p className="text-lg text-white/80 text-center mb-8">
                  {isConnected
                    ? "Wallet connected. Please fill your info on-chain to join Spectra."
                    : "Connect your wallet (Coinbase Wallet, Base Smart Wallet, MetaMask, Frame, or any other) to begin."}
                </p>

                <div className="w-full">
                  <SpectraStepperForm onSuccess={handleFormSuccess} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}