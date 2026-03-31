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
          Signed in · {address?.slice(0, 6)}···{address?.slice(-4)}
        </p>
        <button
          onClick={() => disconnect()}
          className="rounded-2xl border border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(148,148,148,0.08))] px-8 py-4 font-bold text-white shadow-[0_14px_40px_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all hover:border-white/30 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(170,170,170,0.12))]"
        >
          Sign out
        </button>
      </div>
    );
  }

  function connectorLabel(id: string, name: string) {
    if (id === "coinbaseWalletSDK" || id === "coinbaseWallet" || id === "coinbaseSmartWallet") {
      return "New user";
    }
    return name || "Sign in";
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
              ? 'border border-white/22 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(150,150,150,0.1))] text-white shadow-2xl shadow-white/6 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(180,180,180,0.14))]'
              : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
            }
            ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isPending && connector.id === connectors.find(c => c.id === connector.id)?.id
            ? 'Signing in...'
            : connectorLabel(connector.id, connector.name)
          }
        </button>
      ))}
    </div>
  );
}
