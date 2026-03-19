'use client';

import React, { useEffect, useState } from 'react';
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnect,
  useConnectors,
  useDisconnect,
  useReadContract,
} from 'wagmi';
import SpectraFormABI from '@/src/abi/SpectraForm.json';
import { base } from 'wagmi/chains';
import { SPECTRAFORM_ADDRESS } from '@/src/lib/contract';
import { BASE_BUILDER_DATA_SUFFIX } from '@/src/lib/base-app';
import MembershipMint from './MembershipMint';

const MEMBERSHIP_ADDRESS = "0xd26e98bbfa933ca10d60b9fe6a6a94ab600d3c08" as `0x${string}`;

const MEMBERSHIP_ABI_FRAGMENT = [
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasMinted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const BASE_CHAIN_ID = base.id;

function encryptData(str: string): string {
  const normalized = str.trim();
  return normalized ? btoa(unescape(encodeURIComponent(normalized))) : '';
}

interface SpectraStepperFormProps {
  onSuccess?: () => void;
}

export default function SpectraStepperForm({ onSuccess }: SpectraStepperFormProps) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const connectors = useConnectors();

  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [x, setX] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const {
    writeContract,
    data: hash,
    isPending: writePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: txLoading,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({ hash });

  const { data: alreadyMinted, isLoading: isCheckingMinted } = useReadContract({
    address: MEMBERSHIP_ADDRESS,
    abi: MEMBERSHIP_ABI_FRAGMENT,
    functionName: 'hasMinted',
    args: address ? [address] : undefined,
    chainId: BASE_CHAIN_ID,
    query: { enabled: !!address && isConnected },
  });

  const isOnBase = chainId === BASE_CHAIN_ID;
  const canSubmit = name.trim() !== '' && instagram.trim() !== '';

  useEffect(() => {
    if (isConnected && chainId && chainId !== BASE_CHAIN_ID) {
      switchChain?.({ chainId: BASE_CHAIN_ID });
    }
  }, [isConnected, chainId, switchChain]);

  useEffect(() => {
    if (txSuccess && hash) {
      setFormSubmitted(true);
      onSuccess?.();
    }
  }, [txSuccess, hash, onSuccess]);

  useEffect(() => {
    if (!isConnected) {
      setFormSubmitted(false);
      setName('');
      setInstagram('');
      setPhone('');
      setX('');
      setTiktok('');
      setShowOptionalFields(false);
    }
  }, [isConnected]);

  const handleSubmit = () => {
    if (!canSubmit) {
      alert('Name and Instagram are required.');
      return;
    }

    resetWrite();

    if (!isOnBase) {
      switchChain?.({ chainId: BASE_CHAIN_ID });
      return;
    }

    writeContract({
      address: SPECTRAFORM_ADDRESS,
      abi: SpectraFormABI,
      functionName: 'submit',
      args: [
        encryptData(name),
        encryptData(phone),
        encryptData(instagram),
        encryptData(x),
        encryptData(tiktok),
      ],
      dataSuffix: BASE_BUILDER_DATA_SUFFIX,
    });
  };

  if (isConnected && !isCheckingMinted && alreadyMinted === true) {
    return (
      <div className="w-full">
        <div className="mb-12 py-16 text-center">
          <h1 className="mb-6 text-5xl font-black text-white uppercase leading-none md:text-7xl">
            Already a Founder!
          </h1>
          <p className="text-2xl text-white/80">
            Your Origin status is confirmed.
            <br />
            Enjoy your © SPECTRA Founder Membership ↓
          </p>
        </div>
        <MembershipMint />
      </div>
    );
  }

  if (formSubmitted) {
    return (
      <div className="w-full">
        <div className="mb-12 py-16 text-center">
          <h1 className="mb-6 text-5xl font-black text-white uppercase leading-none md:text-7xl">
            Submission Confirmed
          </h1>
          <p className="text-2xl text-white/80">
            Your profile is now mapped on-chain.
            <br />
            Now claim your Founder Membership ↓
          </p>
        </div>
        <MembershipMint />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-20 text-center">
        <h1 className="mb-6 text-lg font-black text-white uppercase leading-none md:text-xl">
          FAST TRACK ACCESS
        </h1>
        <p className="mx-auto mb-12 max-w-xl text-xs leading-5 tracking-wide text-white/52 sm:text-sm sm:leading-[1.55]">
          Connect your wallet to unlock the fastest path into © SPECTRA Founder Membership.
          We keep the on-chain profile lightweight so you can move from connect to mint without a long intake.
        </p>
        <div className="flex flex-col items-center gap-4">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector, chainId: BASE_CHAIN_ID })}
              className="w-full max-w-md rounded-3xl bg-white px-8 py-4 text-lg font-black text-black shadow-lg transition-all hover:scale-[1.01] hover:bg-gray-200"
            >
              {connector.name === 'Coinbase Wallet' ? 'Coinbase Wallet / Base Smart Wallet' : connector.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isConnected && !isOnBase && (
        <div className="mb-8 rounded-3xl border border-[#cfd8e8]/25 bg-[linear-gradient(145deg,rgba(226,232,240,0.12),rgba(125,154,188,0.08))] py-8 text-center backdrop-blur-xl">
          <p className="mb-4 text-2xl font-bold text-[#dbe4f2]">Wrong network</p>
          <p className="mb-6 text-white/80">Please switch to Base to continue</p>
          <button
            onClick={() => switchChain?.({ chainId: BASE_CHAIN_ID })}
            className="rounded-2xl border border-[#d7e0ed]/35 bg-[linear-gradient(135deg,rgba(236,241,247,0.92),rgba(164,179,199,0.78))] px-12 py-5 text-xl font-bold text-black shadow-[0_18px_50px_rgba(148,163,184,0.22)] transition-all hover:scale-[1.01] hover:bg-[linear-gradient(135deg,rgba(244,247,251,0.96),rgba(180,194,212,0.84))]"
          >
            Switch to Base
          </button>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <div
          className="rounded-[32px] bg-black/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8"
          style={{
            border: "1px solid rgba(214, 222, 232, 0.16)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 36px rgba(214,222,232,0.04)",
          }}
        >
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-black text-white uppercase leading-none sm:text-4xl md:text-5xl">
              FAST ENTRY, THEN MINT
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
              The contract maps five profile fields on-chain: name, phone, Instagram, X, and TikTok.
              Only the essential fields are required here. Optional fields can stay blank and you can mint right after submission.
            </p>
          </div>

          <div
            className="mb-8 flex flex-col gap-4 rounded-3xl bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              border: "1px solid rgba(214, 222, 232, 0.14)",
              boxShadow: "0 0 28px rgba(214,222,232,0.04) inset",
            }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Connected wallet</p>
              <p className="mt-2 text-sm font-medium text-white sm:text-base">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—'}
              </p>
            </div>
            <button
              onClick={() => disconnect()}
              className="rounded-2xl px-5 py-3 text-sm font-medium text-[#f2f5f8] backdrop-blur-xl transition-all"
              style={{
                border: "1px solid rgba(214, 222, 232, 0.24)",
                background:
                  "linear-gradient(145deg, rgba(239,244,248,0.08), rgba(148,163,184,0.06))",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.02) inset, 0 0 20px rgba(214,222,232,0.06)",
                textShadow: "0 0 8px rgba(232,238,246,0.14)",
              }}
            >
              Disconnect
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">Name *</span>
              <input
                placeholder="Alias or full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl bg-white/5 px-5 py-4 text-base text-white backdrop-blur-md transition-all placeholder:text-white/35 focus:outline-none"
                style={{
                  border: "1px solid rgba(214, 222, 232, 0.16)",
                  boxShadow: "0 0 18px rgba(214,222,232,0.035) inset",
                }}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">Instagram *</span>
              <input
                placeholder="@handle"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full rounded-2xl bg-white/5 px-5 py-4 text-base text-white backdrop-blur-md transition-all placeholder:text-white/35 focus:outline-none"
                style={{
                  border: "1px solid rgba(214, 222, 232, 0.16)",
                  boxShadow: "0 0 18px rgba(214,222,232,0.035) inset",
                }}
              />
            </label>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowOptionalFields((value) => !value)}
              className="text-xs uppercase tracking-[0.24em] text-white/58 transition-colors hover:text-white"
            >
              {showOptionalFields ? 'Hide optional fields' : 'Add optional profile fields'}
            </button>
          </div>

          {showOptionalFields && (
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">Phone</span>
                <input
                  placeholder="+52 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 px-5 py-4 text-base text-white backdrop-blur-md transition-all placeholder:text-white/35 focus:outline-none"
                  style={{
                    border: "1px solid rgba(214, 222, 232, 0.16)",
                    boxShadow: "0 0 18px rgba(214,222,232,0.035) inset",
                  }}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">X</span>
                <input
                  placeholder="@handle"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 px-5 py-4 text-base text-white backdrop-blur-md transition-all placeholder:text-white/35 focus:outline-none"
                  style={{
                    border: "1px solid rgba(214, 222, 232, 0.16)",
                    boxShadow: "0 0 18px rgba(214,222,232,0.035) inset",
                  }}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">TikTok</span>
                <input
                  placeholder="@handle"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 px-5 py-4 text-base text-white backdrop-blur-md transition-all placeholder:text-white/35 focus:outline-none"
                  style={{
                    border: "1px solid rgba(214, 222, 232, 0.16)",
                    boxShadow: "0 0 18px rgba(214,222,232,0.035) inset",
                  }}
                />
              </label>
            </div>
          )}

          <div className="mt-8 min-h-32">
            {(writePending || txLoading) && (
              <div className="rounded-3xl border border-white/12 bg-white/[0.04] px-6 py-8 text-center">
                <p className="mb-2 text-2xl font-bold text-white">Processing your access</p>
                <p className="text-sm text-white/68">
                  Confirm in wallet first, then wait for Base to record the profile mapping.
                </p>
              </div>
            )}

            {(writeError || txError) && (
              <div className="rounded-3xl border border-[#cfd8e8]/25 bg-[linear-gradient(145deg,rgba(226,232,240,0.12),rgba(125,154,188,0.08))] px-6 py-8 text-center backdrop-blur-xl">
                <p className="mb-3 text-2xl font-bold text-[#dbe4f2]">Transaction failed</p>
                <p className="mx-auto mb-6 max-w-lg text-sm text-[#c8d4e5]">
                  {writeError?.message?.includes('rejected') || writeError?.message?.includes('denied')
                    ? 'You rejected the transaction.'
                    : 'Something went wrong while recording your profile. Please try again.'}
                </p>
                <button
                  onClick={() => resetWrite()}
                  className="rounded-2xl border border-[#d7e0ed]/35 bg-[linear-gradient(135deg,rgba(236,241,247,0.92),rgba(164,179,199,0.78))] px-8 py-4 text-base font-bold text-black shadow-[0_18px_50px_rgba(148,163,184,0.22)] transition-all hover:scale-[1.01] hover:bg-[linear-gradient(135deg,rgba(244,247,251,0.96),rgba(180,194,212,0.84))]"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">
              Required now: name + Instagram
            </p>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || writePending || txLoading}
              className="w-full py-4 px-8 bg-transparent text-white font-semibold rounded-xl border border-white/20 backdrop-blur-md hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit And Get Membership
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
