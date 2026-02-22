"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import SpectraStepperForm from "./SpectraStepperForm";
import MembershipMint from "./MembershipMint";

export default function GatedMembershipFlow() {
  const { address, isConnected } = useAccount();
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // You'll replace this placeholder with actual on-chain check later
  // For now, we use localStorage as a simple client-side gate (clears on incognito/private mode)
  useEffect(() => {
    if (!isConnected || !address) {
      setIsChecking(false);
      return;
    }

    const key = `spectra_form_submitted_${address.toLowerCase()}`;
    const submitted = localStorage.getItem(key) === "true";
    setHasSubmittedForm(submitted);
    setIsChecking(false);
  }, [address, isConnected]);

  // Callback from SpectraStepperForm on successful tx
  const handleFormSuccess = () => {
    if (address) {
      localStorage.setItem(`spectra_form_submitted_${address.toLowerCase()}`, "true");
    }
    setHasSubmittedForm(true);
  };

  if (isChecking) {
    return (
      <div className="text-center py-20">
        <p className="text-3xl font-bold text-white/80">Loading your status...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!hasSubmittedForm ? (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-12 text-center bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            STEP 1: REGISTER YOUR PRESENCE
          </h1>
          <p className="text-xl md:text-2xl text-white/70 text-center mb-16 max-w-3xl mx-auto leading-relaxed">
            Submit your info on-chain to join Spectra. This is required before claiming your Founder Membership.
          </p>
          {/* Pass success callback to child */}
          <SpectraStepperForm onSuccess={handleFormSuccess} />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-12 text-center bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            STEP 2: CLAIM FOUNDER MEMBERSHIP
          </h1>
          <p className="text-xl md:text-2xl text-white/70 text-center mb-16 max-w-3xl mx-auto leading-relaxed">
            Thank you for registering. You may now claim your permanent Founder Membership.
          </p>
          <MembershipMint />
        </div>
      )}
    </div>
  );
}
