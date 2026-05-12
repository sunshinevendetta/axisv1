"use client";

import React, { useState } from "react";
import Stepper, { Step } from "./Stepper";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendCalls,
  useCallsStatus,
} from "wagmi";
import { encodeFunctionData } from "viem";
import { base } from "wagmi/chains";

const AXIS_FORM_ABI = [
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

const COINBASE_CONNECTOR_IDS = new Set([
  "coinbaseWalletSDK",
  "coinbaseWallet",
  "coinbaseSmartWallet",
]);

function isEmail(s: string) {
  const v = (s || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function normalizeHandle(s: string) {
  const v = (s || "").trim();
  if (!v) return "";
  return v.startsWith("@") ? v : `@${v}`;
}

function isCoinbaseConnector(id: string) {
  return COINBASE_CONNECTOR_IDS.has(id);
}

function getCallsStatusId(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : "";
  }
  return "";
}

export default function ContactStepper() {
  const contractAddress = process.env.NEXT_PUBLIC_AXIS_FORM_ADDRESS as `0x${string}` | undefined;
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [tiktok, setTiktok] = useState("");

  const [uiError, setUiError] = useState<string>("");

  const { chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

  const { sendCalls, data: callsId, isPending: isWriting, reset } = useSendCalls();
  const callsStatusId = getCallsStatusId(callsId);
  const { data: callsStatus } = useCallsStatus({
    id: callsStatusId,
    query: { enabled: Boolean(callsId), refetchInterval: (q) => (q.state.data?.status === "success" ? false : 1000) },
  });
  const isConfirming = Boolean(callsId) && callsStatus?.status !== "success";
  const isConfirmed = callsStatus?.status === "success";
  const isReceiptError = callsStatus?.status === "failure";

  const canProceedStep2 = isConnected && chainId === base.id;
  const canProceedStep3 = name.trim().length > 0 && isEmail(email);
  const stepValidationMessage =
    currentStep === 3
      ? !name.trim()
        ? "name is required"
        : !isEmail(email)
          ? "valid email is required"
          : ""
      : "";
  const nextDisabled = currentStep === 1 ? false : currentStep === 2 ? !canProceedStep2 : currentStep === 3 ? !canProceedStep3 : false;

  const submitOnchain = () => {
    setUiError("");

    if (!contractAddress) {
      setUiError("missing NEXT_PUBLIC_AXIS_FORM_ADDRESS");
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

    sendCalls({
      calls: [{
        to: contractAddress,
        data: encodeFunctionData({
          abi: AXIS_FORM_ABI,
          functionName: "submit",
          args: [name.trim(), safePhone, packedEmail || safeIg, safeX, safeTt],
        }),
      }],
      capabilities: paymasterUrl ? { paymasterService: { url: paymasterUrl } } : undefined,
    });
  };

  const injectedConnector = connectors.find((connector) => connector.id === "injected");
  const coinbaseConnector = connectors.find(
    (connector) => isCoinbaseConnector(connector.id),
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
            A short contact intake to continue.
          </p>
        </Step>

        <Step>
          <h2 className="text-xl text-white">connect</h2>

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
              </>
            ) : (
              <div className="border border-white/20 rounded-xl p-4">
                <div className="mt-1 flex gap-3">
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 border border-white text-white text-sm rounded-xl"
                  >
                    disconnect
                  </button>
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

          {stepValidationMessage ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              {stepValidationMessage}
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

          {uiError ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              {uiError}
            </div>
          ) : null}

          {isReceiptError ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              Please try again.
            </div>
          ) : null}

          {isConfirmed ? (
            <div className="mt-4 text-sm text-white border border-white/20 rounded-xl p-3">
              Submitted.
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
              Submit
            </button>
          </div>
        </Step>
      </Stepper>
    </div>
  );
}
