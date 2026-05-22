"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useSiteLanguage } from "@/components/site-language";
import {
  buildConnectionOnlyAuthRecord,
  shortPizzaDayAddress,
  type PizzaDayAuthRecord,
} from "./auth";
import { Brackets, Glitch, Reticle } from "./Hud";

function isBaseAccountConnector(id: string) {
  return id === "baseAccount" || id === "coinbaseWalletSDK" || id === "coinbaseWallet" || id === "coinbaseSmartWallet";
}

function isWalletConnectConnector(id: string) {
  return id === "walletConnect";
}

function isInjectedConnector(id: string) {
  return id === "injected";
}

export function Connect({
  onDone,
  onAuthenticated,
  onSignOut,
  authenticatedAddress,
}: {
  onDone: () => void;
  onAuthenticated: (record: PizzaDayAuthRecord) => void;
  onSignOut: () => void;
  authenticatedAddress?: string | null;
}) {
  const { language } = useSiteLanguage();
  const { address, isConnected } = useAccount();
  const { connect, connectors, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const [feedback, setFeedback] = useState("");

  const copy =
    language === "es"
      ? {
          step: "ACCESO",
          titleTop: "ENTRA AL EVENTO.",
          titleBottom: "DOS OPCIONES.",
          intro:
            "Pizza Day vive en Base. Crea una cuenta nueva con passkey (Base Wallet) o conecta una wallet que ya tengas.",
          createAccount: "CREAR CUENTA (PASSKEY)",
          createHint: "Sin app, sin semilla. Solo passkey en tu dispositivo.",
          connectWallet: "CONECTAR WALLET",
          connectHint: "MetaMask, Rainbow, WalletConnect…",
          openMap: "ABRIR MAPA",
          signOut: "SALIR",
          connectingLabel: "CONECTANDO",
          authedLabel: "CUENTA LISTA",
          gasNote: "El gas de los collectibles está patrocinado en Base.",
        }
      : {
          step: "ACCESS",
          titleTop: "ENTER THE EVENT.",
          titleBottom: "TWO OPTIONS.",
          intro:
            "Pizza Day lives on Base. Create a new account with a passkey (Base Wallet) or connect a wallet you already have.",
          createAccount: "CREATE ACCOUNT (PASSKEY)",
          createHint: "No app, no seed. Just a passkey on this device.",
          connectWallet: "CONNECT WALLET",
          connectHint: "MetaMask, Rainbow, WalletConnect…",
          openMap: "OPEN MAP",
          signOut: "SIGN OUT",
          connectingLabel: "CONNECTING",
          authedLabel: "ACCOUNT READY",
          gasNote: "Collectible gas is sponsored on Base.",
        };

  const activeAddress = address as `0x${string}` | undefined;
  const hasAccess = Boolean(authenticatedAddress);

  const baseAccountConnector = useMemo(
    () => connectors.find((c) => isBaseAccountConnector(c.id)),
    [connectors],
  );
  const walletConnector = useMemo(
    () =>
      connectors.find(
        (c) =>
          !isBaseAccountConnector(c.id) &&
          (isWalletConnectConnector(c.id) || isInjectedConnector(c.id)),
      ) ?? connectors[0],
    [connectors],
  );

  // Connection IS the auth. As soon as wallet connects, mint the auth record
  // and call onAuthenticated — no signature step, no extra button click.
  useEffect(() => {
    if (hasAccess) return;
    if (!isConnected || !activeAddress) return;
    onAuthenticated(buildConnectionOnlyAuthRecord(activeAddress));
  }, [activeAddress, hasAccess, isConnected, onAuthenticated]);

  // Auto-redirect to the map is handled by PizzaDayApp once auth.authenticated
  // flips. We don't call onDone() here to avoid a stale-closure race with
  // goToRoute's auth guard.

  async function handleCreateAccount() {
    if (!baseAccountConnector) {
      setFeedback(language === "es" ? "Base Wallet no disponible." : "Base Wallet not available.");
      return;
    }
    setFeedback("");
    try {
      await connect({ connector: baseAccountConnector });
    } catch {
      setFeedback(
        language === "es"
          ? "No se pudo crear la cuenta."
          : "Couldn't create the account.",
      );
    }
  }

  async function handleConnectWallet() {
    if (!walletConnector) {
      setFeedback(language === "es" ? "No hay wallet disponible." : "No wallet connector available.");
      return;
    }
    setFeedback("");
    try {
      await connect({ connector: walletConnector });
    } catch {
      setFeedback(language === "es" ? "Conexión cancelada." : "Connection cancelled.");
    }
  }

  function handleSignOut() {
    disconnect();
    onSignOut();
    setFeedback("");
  }

  const isConnecting = connectStatus === "pending";

  return (
    <div
      className="pdq-enter-fade"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px var(--pdq-pad-x) 80px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720, position: "relative" }}>
        <div
          className="pdq-eyebrow"
          style={{ marginBottom: 24, justifyContent: "center", width: "fit-content", marginInline: "auto" }}
        >
          {copy.step}
        </div>

        <h1
          className="pdq-display"
          style={{
            fontSize: "clamp(40px, 7vw, 96px)",
            textAlign: "center",
            margin: "0 0 18px",
            lineHeight: 0.88,
          }}
        >
          {copy.titleTop}
          <br />
          <span style={{ color: "var(--pdq-ink-3)" }}>{copy.titleBottom}</span>
        </h1>

        <p
          style={{
            maxWidth: 560,
            margin: "0 auto 36px",
            color: "var(--pdq-ink-2)",
            fontSize: 15,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          {copy.intro}
        </p>

        <Brackets className="glass" style={{ padding: 28 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <button
              type="button"
              className="pdq-btn lg"
              onClick={handleCreateAccount}
              disabled={isConnecting || hasAccess}
            >
              {copy.createAccount} {!hasAccess && <span className="arr">→</span>}
            </button>
            <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)", marginTop: -4, marginBottom: 4 }}>
              {copy.createHint}
            </div>

            <button
              type="button"
              className="pdq-btn lg ghost"
              onClick={handleConnectWallet}
              disabled={isConnecting || hasAccess}
            >
              {copy.connectWallet} {!hasAccess && <span className="arr">→</span>}
            </button>
            <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)", marginTop: -4 }}>
              {copy.connectHint}
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: "1px solid var(--pdq-line)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
                {isConnecting
                  ? copy.connectingLabel
                  : hasAccess
                    ? copy.authedLabel
                    : ""}
              </div>
              <Glitch trigger={`${isConnected}-${hasAccess}`}>
                <div className="pdq-display-alt" style={{ fontSize: 18 }}>
                  {hasAccess && authenticatedAddress
                    ? shortPizzaDayAddress(authenticatedAddress as `0x${string}`)
                    : isConnected && activeAddress
                      ? shortPizzaDayAddress(activeAddress)
                      : "—"}
                </div>
              </Glitch>
            </div>

            <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
              {copy.gasNote}
            </div>

            {hasAccess ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="pdq-btn ghost" onClick={onDone}>
                  {copy.openMap} <span className="arr">→</span>
                </button>
                <button type="button" className="pdq-btn ghost" onClick={handleSignOut}>
                  {copy.signOut}
                </button>
              </div>
            ) : null}

            {feedback ? (
              <div style={{ color: "var(--pdq-ink-2)", fontSize: 13.5 }}>{feedback}</div>
            ) : null}
          </div>

          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              opacity: 0.35,
              pointerEvents: "none",
            }}
          >
            <Reticle size={64} animated />
          </div>
        </Brackets>
      </div>
    </div>
  );
}
