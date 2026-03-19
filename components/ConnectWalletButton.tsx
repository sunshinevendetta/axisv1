"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

export default function ConnectWalletButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // Prevent SSR/client mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing until mounted (prevents hydration error)
  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="h-12 w-64 bg-white/10 rounded-2xl animate-pulse" />
        <div className="h-12 w-64 bg-white/10 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="text-center space-y-4">
        <p className="text-white/80">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <button
          onClick={() => disconnect()}
          className="rounded-2xl border border-[#cfd8e8]/35 bg-[linear-gradient(135deg,rgba(226,232,240,0.22),rgba(125,154,188,0.16))] px-8 py-4 font-bold text-white shadow-[0_14px_40px_rgba(148,163,184,0.18)] backdrop-blur-xl transition-all hover:border-[#dbe4f2]/50 hover:bg-[linear-gradient(135deg,rgba(235,241,248,0.28),rgba(138,166,198,0.2))]"
        >
          Disconnect
        </button>
      </div>
    );
  }

  function connectorLabel(id: string, name: string) {
    if (id === "walletConnect") return "WalletConnect";
    if (id === "injected") return "Browser Wallet";
    if (id === "coinbaseWalletSDK" || id === "coinbaseWallet" || id === "coinbaseSmartWallet") {
      return "Coinbase / Base Smart Wallet";
    }
    return name || "Connect Wallet";
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className={`
            px-8 py-5 text-xl font-bold rounded-2xl transition-all
            ${connector.id === 'coinbaseWallet' || connector.id === 'coinbaseSmartWallet'
              ? 'border border-[#cfd8e8]/40 bg-[linear-gradient(135deg,rgba(226,232,240,0.24),rgba(125,154,188,0.2))] text-white shadow-2xl shadow-slate-500/20 hover:bg-[linear-gradient(135deg,rgba(238,243,249,0.3),rgba(141,170,203,0.24))]'
              : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
            }
            ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isPending && connector.id === connectors.find(c => c.id === connector.id)?.id
            ? 'Connecting...'
            : connectorLabel(connector.id, connector.name)
          }
        </button>
      ))}
    </div>
  );
}
