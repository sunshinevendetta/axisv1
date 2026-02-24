'use client';

import React, { useState, useEffect } from 'react';
import Stepper, { Step } from './Stepper';
import { 
  useAccount, 
  useChainId, 
  useSwitchChain, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useConnect, 
  useConnectors,
  useDisconnect,
  useReadContract
} from 'wagmi';
import SpectraFormABI from '@/src/abi/SpectraForm.json';
import { base } from 'wagmi/chains';
import { SPECTRAFORM_ADDRESS } from '@/src/lib/contract';
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
  return btoa(unescape(encodeURIComponent(str.trim())));
}

export default function SpectraStepperForm() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [x, setX] = useState('');
  const [tiktok, setTiktok] = useState('');

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { 
    writeContract, 
    data: hash, 
    isPending: writePending, 
    error: writeError, 
    reset: resetWrite 
  } = useWriteContract();

  const { 
    isLoading: txLoading, 
    isSuccess: txSuccess, 
    error: txError 
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

  const { connect } = useConnect();
  const connectors = useConnectors();

  useEffect(() => {
    if (isConnected && chainId && chainId !== BASE_CHAIN_ID) {
      switchChain?.({ chainId: BASE_CHAIN_ID });
    }
  }, [isConnected, chainId, switchChain]);

  useEffect(() => {
    if (txSuccess && hash) {
      setFormSubmitted(true);
    }
  }, [txSuccess, hash]);

  // Reset form if disconnected
  useEffect(() => {
    if (!isConnected) {
      setFormSubmitted(false);
      setCurrentStep(1);
      setName('');
      setPhone('');
      setInstagram('');
      setX('');
      setTiktok('');
    }
  }, [isConnected]);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || !instagram.trim() || !x.trim() || !tiktok.trim()) {
      alert('All fields are required.');
      return;
    }

    resetWrite();

    if (!isOnBase) {
      switchChain?.({ chainId: BASE_CHAIN_ID });
      return;
    }

    const encName  = encryptData(name);
    const encPhone = encryptData(phone);
    const encIg    = encryptData(instagram);
    const encX     = encryptData(x);
    const encTt    = encryptData(tiktok);

    writeContract({
      address: SPECTRAFORM_ADDRESS,
      abi: SpectraFormABI,
      functionName: 'submit',
      args: [encName, encPhone, encIg, encX, encTt],
    });
  };

  const isStep2Valid = name.trim() !== '' && phone.trim() !== '';
  const isStep3Valid = instagram.trim() !== '' && x.trim() !== '' && tiktok.trim() !== '';

  if (isConnected && !isCheckingMinted && alreadyMinted === true) {
    return (
      <div className="w-full">
        <div className="text-center py-16 mb-12">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Already a Founder!
          </h1>
          <p className="text-2xl text-white/80 mb-16">
            Your Origin status is confirmed.<br/>
            Enjoy your SPECTRA Founder Membership ↓
          </p>
        </div>
        <MembershipMint />
      </div>
    );
  }

  if (formSubmitted) {
    return (
      <div className="w-full">
        <div className="text-center py-16 mb-12">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Thank You!
          </h1>
          <p className="text-2xl text-white/80 mb-16">
            Your data is now securely on-chain.<br/>
            Now claim your Founder Membership ↓
          </p>
        </div>
        <MembershipMint />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-4xl font-black mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          START
        </h1>
        <p className="text-sm md:text-md text-white/80 mb-12 max-w-5xl mx-auto leading-relaxed">
          Submit your data and get free <span className="font-bold text-white">$SPECTRA</span> tokens to spend at our events, also the membership allows you unlimited access to all our episodes in season 1 during 2026, plus early access and exclusive surprises.
        </p>
        <div className="flex flex-col items-center gap-4">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector, chainId: BASE_CHAIN_ID })}
              className="w-full max-w-md px-8 py-4 text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-3xl shadow-lg transition-all"
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
        <div className="text-center py-8 mb-8 bg-red-900/20 rounded-3xl border border-red-500/30">
          <p className="text-2xl font-bold text-red-300 mb-4">Wrong network</p>
          <p className="text-white/80 mb-6">Please switch to Base to continue</p>
          <button 
            onClick={() => switchChain?.({ chainId: BASE_CHAIN_ID })}
            className="px-12 py-5 bg-red-600 hover:bg-red-500 text-white text-xl font-bold rounded-2xl shadow-2xl"
          >
            Switch to Base
          </button>
        </div>
      )}

      <Stepper 
        initialStep={1} 
        onFinalStepCompleted={handleSubmit}
        backButtonText="Previous" 
        nextButtonText="Continue"
        onStepChange={(step) => setCurrentStep(step)}
        nextDisabled={
          (currentStep === 2 && !isStep2Valid) ||
          (currentStep === 3 && !isStep3Valid)
        }
        extraFooterButton={
          <button
            onClick={() => disconnect()}
            className="w-full md:w-auto px-4 py-2 text-sm md:text-base font-medium rounded-3xl transition-all duration-300 text-white bg-red-900/30 hover:bg-red-800/40 border border-red-500/40 backdrop-blur-md shadow-md"
          >
            Disconnect
          </button>
        }
      >
        <Step>
          <div className="text-center py-12">
            <h2 className="text-4xl md:text-6xl font-black mb-8">Welcome to Spectra</h2>
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Submit your info securely on Base. All data is encrypted before going on-chain.
            </p>
            <div className="mt-12">
              <p className="text-lg text-white/80 mb-6">
                Connected: {address ? `${address.slice(0,6)}...${address.slice(-4)}` : '—'}
              </p>
            </div>
          </div>
        </Step>

        <Step>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12">Name & Phone</h2>
          <div className="max-w-2xl mx-auto space-y-8">
            <input 
              placeholder="Full Name *" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-8 py-6 text-2xl rounded-3xl bg-white/5 border-2 border-white/20 backdrop-blur-md focus:border-white/60 focus:outline-none transition-all"
            />
            <input 
              placeholder="Phone (+ country code) *" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full px-8 py-6 text-2xl rounded-3xl bg-white/5 border-2 border-white/20 backdrop-blur-md focus:border-white/60 focus:outline-none transition-all"
            />
          </div>
        </Step>

        <Step>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12">Social Handles</h2>
          <div className="max-w-2xl mx-auto space-y-8">
            <input 
              placeholder="Instagram @handle *" 
              value={instagram} 
              onChange={e => setInstagram(e.target.value)} 
              className="w-full px-8 py-6 text-2xl rounded-3xl bg-white/5 border-2 border-white/20 backdrop-blur-md focus:border-white/60 focus:outline-none transition-all"
            />
            <input 
              placeholder="X @handle *" 
              value={x} 
              onChange={e => setX(e.target.value)} 
              className="w-full px-8 py-6 text-2xl rounded-3xl bg-white/5 border-2 border-white/20 backdrop-blur-md focus:border-white/60 focus:outline-none transition-all"
            />
            <input 
              placeholder="TikTok @handle *" 
              value={tiktok} 
              onChange={e => setTiktok(e.target.value)} 
              className="w-full px-8 py-6 text-2xl rounded-3xl bg-white/5 border-2 border-white/20 backdrop-blur-md focus:border-white/60 focus:outline-none transition-all"
            />
          </div>
        </Step>

        <Step>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12">Review & Submit</h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/20 p-10 mb-12 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 text-xl">
                <div><strong>Name or Alias:</strong> <span className="text-white/80">{name || '—'}</span></div>
                <div><strong>Phone:</strong> <span className="text-white/80">{phone || '—'}</span></div>
                <div><strong>Instagram:</strong> <span className="text-white/80">{instagram || '—'}</span></div>
                <div><strong>X:</strong> <span className="text-white/80">{x || '—'}</span></div>
                <div><strong>TikTok:</strong> <span className="text-white/80">{tiktok || '—'}</span></div>
                <div><strong>Wallet:</strong> <span className="text-white/80">{address ? `${address.slice(0,6)}...${address.slice(-4)}` : '—'}</span></div>
              </div>
            </div>

            <div className="min-h-48">
              {writePending && (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/20">
                  <p className="text-3xl font-bold text-white mb-4">⏳ Waiting for confirmation...</p>
                  <p className="text-xl text-white/70">Check your wallet and approve</p>
                </div>
              )}

              {txLoading && !txSuccess && (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/20">
                  <p className="text-3xl font-bold text-white mb-4">⏳ Broadcasting on Base...</p>
                  <p className="text-xl text-white/70">Your submission is being recorded</p>
                </div>
              )}

              {txSuccess && hash && (
                <div className="text-center py-16 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border-4 border-white/40 shadow-3xl">
                  <p className="text-5xl md:text-6xl font-black text-white mb-8">SUCCESS! 🌈</p>
                  <p className="text-2xl text-white/90 mb-10">Your data is now on-chain forever</p>
                  <a 
                    href={`https://basescan.org/tx/${hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-16 py-8 bg-white text-black text-2xl font-black rounded-3xl hover:bg-gray-200 shadow-2xl hover:scale-105 transition-all"
                  >
                    View on Basescan →
                  </a>
                </div>
              )}

              {(writeError || txError) && (
                <div className="text-center py-12 bg-red-900/30 rounded-3xl border border-red-500/50">
                  <p className="text-4xl font-bold text-red-300 mb-6">Transaction Failed</p>
                  <p className="text-xl text-red-200 max-w-lg mx-auto mb-8">
                    {writeError?.message?.includes('rejected') || writeError?.message?.includes('denied')
                      ? 'You rejected the transaction.'
                      : 'Something went wrong. Please try again.'}
                  </p>
                  <button 
                    onClick={() => resetWrite()}
                    className="px-12 py-6 bg-red-600 hover:bg-red-500 text-white text-xl font-bold rounded-2xl"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </Step>
      </Stepper>
    </div>
  );
}