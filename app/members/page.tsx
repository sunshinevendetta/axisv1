"use client";

import Link from "next/link";
import PrismBackground from "@/components/backgrounds/PrismBackground";
import PillNav from "@/components/PillNav";
import { publicNavItems } from "@/src/lib/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

const COINBASE_CONNECTOR_IDS = new Set([
  "coinbaseWalletSDK",
  "coinbaseWallet",
  "coinbaseSmartWallet",
]);

function isCoinbaseConnector(id: string) {
  return COINBASE_CONNECTOR_IDS.has(id);
}

function identityLabel(id: string, name: string) {
  return isCoinbaseConnector(id) ? "New user" : name || "Sign in";
}

function IdentityButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex w-full flex-col gap-3">
        <div className="h-14 w-full animate-pulse rounded-2xl bg-white/8" />
        <div className="h-14 w-full animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-white/50">
            signed in
          </span>
        </div>
        <p className="font-mono text-[11px] text-white/30">
          {address?.slice(0, 6)}···{address?.slice(-4)}
        </p>
        <button
          onClick={() => disconnect()}
          className="mt-1 text-[9px] uppercase tracking-[0.32em] text-white/22 transition-colors hover:text-white/45"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className={`
            group relative w-full overflow-hidden rounded-2xl border px-6 py-4
            text-[11px] uppercase tracking-[0.28em] text-white
            transition-all duration-200
            ${
              isCoinbaseConnector(connector.id)
                ? "border-white/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(200,200,255,0.06))] shadow-[0_8px_32px_rgba(180,180,255,0.08)] hover:border-white/28 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(200,200,255,0.10))]"
                : "border-white/10 bg-white/5 hover:border-white/18 hover:bg-white/8"
            }
            ${isPending ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
          `}
        >
          <span className="relative z-10">
            {isPending ? "signing in…" : identityLabel(connector.id, connector.name)}
          </span>
          <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
        </button>
      ))}
    </div>
  );
}

export default function MembersPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white">
      <PrismBackground />

      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.15)_40%,rgba(0,0,0,0.15)_60%,rgba(0,0,0,0.8)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_35%,rgba(0,0,0,0.6)_100%)]" />

      <div className="absolute inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="axis logo"
          items={publicNavItems}
          activeHref="/members"
        />
      </div>

      <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
        <div className="w-full max-w-[22rem]">
          <div className="mb-7 flex flex-col items-center gap-2 text-center">
            <div className="text-[8px] uppercase tracking-[0.46em] text-white/28">
              AXIS · members
            </div>
            <h1 className="text-[clamp(1.76rem,8vw,3.6rem)] leading-[0.88] tracking-[-0.06em] text-white">
              ENTER
            </h1>
            <p className="mt-1 text-[10px] leading-relaxed text-white/38">
              Sign in to access your AXIS account.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-7 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_100%_50%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]" />

            <div className="relative flex flex-col items-center gap-7">
              <IdentityButton />

              <div className="flex w-full items-center gap-3">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[8px] uppercase tracking-[0.3em] text-white/20">
                  new here
                </span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <Link
                href="/membership"
                className="text-[10px] uppercase tracking-[0.26em] text-white/38 transition-colors duration-150 hover:text-white/65"
              >
                Get AXIS membership →
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-[8px] leading-relaxed text-white/16">
            No password needed. No personal data stored.
          </p>
        </div>
      </div>
    </div>
  );
}
