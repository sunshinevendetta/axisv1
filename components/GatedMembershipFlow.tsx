"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import MembershipMint from "./MembershipMint";
import SpectraStepperForm from "./SpectraStepperForm";
import VideoBackground from "./backgrounds/MembershipBackground";

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
    setHasMembership(Boolean(alreadyMinted));
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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-40 animate-pulse rounded-full bg-white/6" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <VideoBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl overflow-hidden bg-[linear-gradient(180deg,rgba(8,8,8,0.96),rgba(8,8,8,0.78))] shadow-[0_36px_90px_rgba(0,0,0,0.46)]">
          <div className="p-5 sm:p-6 md:p-8">
            {hasMembership ? (
              <div className="w-full">
                <MembershipMint />
              </div>
            ) : isConnected && hasSubmittedForm ? (
              <>
                <h1 className="mb-4 text-center [font-family:var(--font-display)] text-base leading-[0.96] tracking-[-0.05em] text-white sm:text-lg md:text-xl">
                  STEP 2: COLLECT NOW
                </h1>
                <p className="mx-auto mb-8 max-w-xl text-center text-xs leading-5 tracking-wide text-white/52 sm:text-sm sm:leading-[1.55]">
                  Thank you for registering. You may now continue to collect.
                </p>
                <div className="w-full">
                  <MembershipMint />
                </div>
              </>
            ) : (
              <>
                <h1 className="mb-4 text-center [font-family:var(--font-display)] text-base leading-[0.96] tracking-[-0.05em] text-white sm:text-lg md:text-xl">
                  {isConnected ? "STEP 1: COMPLETE YOUR INFO" : "STEP 1: CONNECT WALLET"}
                </h1>
                <p className="mx-auto mb-8 max-w-xl text-center text-xs leading-5 tracking-wide text-white/52 sm:text-sm sm:leading-[1.55]">
                  {isConnected
                    ? "Complete the short intake to continue."
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
