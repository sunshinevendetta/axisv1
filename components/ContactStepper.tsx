// components/ContactStepper.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Stepper, { Step } from "./Stepper";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { base } from "wagmi/chains";
import { BASE_BUILDER_DATA_SUFFIX } from "@/src/lib/base-app";

const BACARDI_FORM_ABI = [
  {
    name: "submit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_name", type: "string", internalType: "string" },
      { name: "_phone", type: "string", internalType: "string" },
      { name: "_instagram", type: "string", internalType: "string" },
      { name: "_x", type: "string", internalType: "string" },
      { name: "_tiktok", type: "string", internalType: "string" },
    ],
    outputs: [],
  },
] as const;

function isEmail(s: string) {
  const v = (s || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function normalizeHandle(s: string) {
  const v = (s || "").trim();
  if (!v) return "";
  return v.startsWith("@") ? v : `@${v}`;
}

export default function ContactStepper() {
  const contractAddress = process.env.NEXT_PUBLIC_BACARDI_FORM_ADDRESS as `0x${string}` | undefined;
  const wcProjectId =
    process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

  const [currentStep, setCurrentStep] = useState<number>(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [tiktok, setTiktok] = useState("");

  const [uiError, setUiError] = useState<string>("");

  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const { writeContract, data: txHash, isPending: isWriting, error: writeError, reset } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: base.id,
  });

  useEffect(() => {
    if (writeError) {
      const msg = (writeError as any)?.shortMessage || (writeError as any)?.message || "transaction failed";
      setUiError(String(msg));
    }
  }, [writeError]);

  const canProceedStep2 = useMemo(() => {
    return isConnected && chainId === base.id;
  }, [isConnected, chainId]);

  const canProceedStep3 = useMemo(() => {
    return name.trim().length > 0 && isEmail(email);
  }, [name, email]);

  const stepGuardMessage = useMemo(() => {
    if (currentStep === 2) {
      if (!isConnected) return "connect your wallet to continue";
      if (chainId !== base.id) return "switch network to Base to continue";
      return "";
    }
    if (currentStep === 3) {
      if (!name.trim()) return "name is required";
      if (!isEmail(email)) return "valid email is required";
      return "";
    }
    return "";
  }, [currentStep, isConnected, chainId, name, email]);

  const nextDisabled = useMemo(() => {
    if (currentStep === 1) return false;
    if (currentStep === 2) return !canProceedStep2;
    if (currentStep === 3) return !canProceedStep3;
    return false;
  }, [currentStep, canProceedStep2, canProceedStep3]);

  const submitOnchain = () => {
    setUiError("");

    if (!contractAddress) {
      setUiError("missing NEXT_PUBLIC_BACARDI_FORM_ADDRESS");
      return;
    }
    if (!isConnected) {
      setUiError("connect wallet first");
      return;
    }
    if (chainId !== base.id) {
      setUiError("switch network to Base");
      return;
    }
    if (!name.trim()) {
      setUiError("name is required");
      return;
    }
    if (!isEmail(email)) {
      setUiError("valid email is required");
      return;
    }

    const packedEmail = `email:${email.trim().toLowerCase()}`;

    const safePhone = (phone || "").trim();
    const safeIg = (instagram || "").trim();
    const safeX = normalizeHandle(xHandle);
    const safeTt = normalizeHandle(tiktok);

    writeContract({
      address: contractAddress,
      abi: BACARDI_FORM_ABI,
      functionName: "submit",
      args: [name.trim(), safePhone, packedEmail || safeIg, safeX, safeTt],
      chainId: base.id,
      dataSuffix: BASE_BUILDER_DATA_SUFFIX,
    });
  };

  const injectedConnector = connectors.find((connector) => connector.id === "injected");
  const coinbaseConnector = connectors.find(
    (connector) =>
      connector.id === "coinbaseWalletSDK" ||
      connector.id === "coinbaseWallet" ||
      connector.id === "coinbaseSmartWallet",
  );
  const walletConnectConnector = connectors.find((connector) => connector.id === "walletConnect");

  const connectInjected = () => {
    if (!injectedConnector) {
      setUiError("injected wallet connector is unavailable");
      return;
    }

    setUiError("");
    connect({ connector: injectedConnector });
  };

  const connectCoinbase = () => {
    if (!coinbaseConnector) {
      setUiError("coinbase wallet connector is unavailable");
      return;
    }

    setUiError("");
    connect({ connector: coinbaseConnector });
  };

  const connectWalletConnect = () => {
    if (!walletConnectConnector) {
      setUiError("missing NEXT_PUBLIC_REOWN_PROJECT_ID or NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");
      return;
    }

    setUiError("");
    connect({
      connector: walletConnectConnector,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <Stepper
        initialStep={1}
        onStepChange={(s) => {
          setUiError("");
          setCurrentStep(s);
        }}
        onFinalStepCompleted={() => {}}
        backButtonText="previous"
        nextButtonText="next"
        nextButtonProps={{
          disabled: nextDisabled,
          "aria-disabled": nextDisabled,
        }}
      >
        <Step>
          <h2 className="text-xl text-white">contact</h2>
          <p className="text-white/70 text-sm mt-2">
            wallet + email, saved onchain to BacardiForm.
          </p>

          {contractAddress ? (
            <p className="text-white/50 text-xs mt-3 break-all">contract: {contractAddress}</p>
          ) : (
            <p className="text-white/50 text-xs mt-3">set NEXT_PUBLIC_BACARDI_FORM_ADDRESS in .env.local</p>
          )}
        </Step>

        <Step>
          <h2 className="text-xl text-white">connect wallet</h2>
          <p className="text-white/70 text-sm mt-2">
            required. network must be Base.
          </p>

          {stepGuardMessage ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              {stepGuardMessage}
            </div>
          ) : null}

          {uiError ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              {uiError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            {!isConnected ? (
              <>
                <button
                  onClick={connectInjected}
                  disabled={isConnecting}
                  className="w-full px-4 py-3 border border-white text-white text-sm rounded-xl disabled:opacity-40"
                >
                  connect injected
                </button>

                <button
                  onClick={connectCoinbase}
                  disabled={isConnecting}
                  className="w-full px-4 py-3 border border-white text-white text-sm rounded-xl disabled:opacity-40"
                >
                  connect coinbase wallet
                </button>

                <button
                  onClick={connectWalletConnect}
                  disabled={isConnecting}
                  className="w-full px-4 py-3 border border-white text-white text-sm rounded-xl disabled:opacity-40"
                >
                  connect walletconnect
                </button>

                <div className="text-xs text-white/50">
                  walletconnect env: {wcProjectId ? "ok" : "missing"}
                </div>
              </>
            ) : (
              <div className="border border-white/20 rounded-xl p-4">
                <div className="text-white text-sm">connected</div>
                <div className="text-white/60 text-xs mt-2 break-all">address: {address}</div>
                <div className="text-white/60 text-xs mt-1">chain id: {chainId}</div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 border border-white text-white text-sm rounded-xl"
                  >
                    disconnect
                  </button>
                  <div className="text-xs text-white/50 self-center">
                    required: Base ({base.id})
                  </div>
                </div>
              </div>
            )}
          </div>
        </Step>

        <Step>
          <h2 className="text-xl text-white">email</h2>
          <p className="text-white/70 text-sm mt-2">
            name + email required.
          </p>

          {stepGuardMessage ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              {stepGuardMessage}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-white/60">name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
                className="mt-2 w-full px-4 py-3 rounded-xl bg-black border border-white/20 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="mt-2 w-full px-4 py-3 rounded-xl bg-black border border-white/20 text-white outline-none"
              />
              <div className="text-xs text-white/50 mt-2">
                status: {email.trim() ? (isEmail(email) ? "ok" : "invalid") : "empty"}
              </div>
            </div>
          </div>
        </Step>

        <Step>
          <h2 className="text-xl text-white">optional</h2>
          <p className="text-white/70 text-sm mt-2">
            phone + socials.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-white/60">phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 ..."
                className="mt-2 w-full px-4 py-3 rounded-xl bg-black border border-white/20 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">instagram</label>
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@handle"
                className="mt-2 w-full px-4 py-3 rounded-xl bg-black border border-white/20 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">x</label>
              <input
                value={xHandle}
                onChange={(e) => setXHandle(e.target.value)}
                placeholder="@handle"
                className="mt-2 w-full px-4 py-3 rounded-xl bg-black border border-white/20 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">tiktok</label>
              <input
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@handle"
                className="mt-2 w-full px-4 py-3 rounded-xl bg-black border border-white/20 text-white outline-none"
              />
            </div>
          </div>
        </Step>

        <Step>
          <h2 className="text-xl text-white">submit</h2>
          <p className="text-white/70 text-sm mt-2">
            writes to BacardiForm.submit.
          </p>

          {uiError ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              {uiError}
            </div>
          ) : null}

          {isReceiptError ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              receipt error. check explorer.
            </div>
          ) : null}

          {isConfirmed ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              confirmed on Base.
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                reset();
                submitOnchain();
              }}
              disabled={isWriting || isConfirming || !canProceedStep2 || !canProceedStep3}
              className="w-full px-4 py-3 border border-white text-white text-sm rounded-xl disabled:opacity-40"
            >
              {isWriting ? "signing" : isConfirming ? "confirming" : isConfirmed ? "submitted" : "submit onchain"}
            </button>

            {txHash ? (
              <div className="text-xs text-white/60 break-all">tx: {txHash}</div>
            ) : null}

            <div className="text-xs text-white/50">
              mapping: email is stored as <span className="text-white">email:you@domain.com</span> in the instagram field.
            </div>
          </div>
        </Step>
      </Stepper>
    </div>
  );
}
