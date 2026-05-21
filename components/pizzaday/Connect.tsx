"use client";

import { useEffect, useMemo, useState } from "react";
import { isAddressEqual, recoverMessageAddress } from "viem";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useSiteLanguage } from "@/components/site-language";
import {
  buildPizzaDayAuthMessage,
  shortPizzaDayAddress,
  type PizzaDayAuthRecord,
} from "./auth";
import { Brackets, EnergyBar, Glitch, Reticle } from "./Hud";

function isBaseWalletConnector(id: string) {
  return (
    id === "baseAccount" ||
    id === "coinbaseWalletSDK" ||
    id === "coinbaseWallet" ||
    id === "coinbaseSmartWallet"
  );
}

function connectorLabel(id: string, name: string, language: "en" | "es") {
  if (isBaseWalletConnector(id)) {
    return language === "es" ? "Base Wallet o Base App" : "Base Wallet or Base App";
  }
  if (id === "walletConnect") return "WalletConnect";
  if (id === "injected") return language === "es" ? "Wallet del navegador" : "Browser wallet";
  return name || (language === "es" ? "Wallet" : "Wallet");
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
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const [feedback, setFeedback] = useState("");
  const [step, setStep] = useState(0);

  const copy =
    language === "es"
      ? {
          step: "PASO 01 DE 04, ACCESO",
          titleTop: "CONECTA",
          titleBottom: "TU WALLET.",
          intro:
            "Base Wallet y Base App te dan la ruta sin gas en Base. Tus collectibles viven en Base. Si usas otra wallet, podemos enviarlos a tu wallet personal después.",
          status: "ESTADO",
          session: "SESION",
          signature: "FIRMA",
          expiry: "CADUCA",
          connect: "CONECTAR WALLET",
          sign: "FIRMAR Y ENTRAR",
          open: "ABRIR MAPA",
          signOut: "SALIR",
          reset: "REINICIAR WALLET",
          noWallet: "No tienes wallet. Instala una. Toma 5 minutos.",
          connected: "CONECTADO",
          connectFirst: "Conecta primero.",
          verify: "Vas a confirmar esta dirección.",
          readyToEnter: "WALLET LISTA",
          readyToSign: "FIRMA EL MENSAJE",
          verified: "ACCESO LISTO",
          pending: "PENDIENTE",
          bullets: [
            "Los collectibles se mintean en Base.",
            "Base Wallet o Base App te da gas cero en el evento.",
            "Puedes usar otra wallet. Podemos enviar los collectibles a tu wallet personal después.",
          ],
          connectHint: "Elige una wallet para seguir.",
          baseBadge: "Base Wallet o Base App",
        }
      : {
          step: "STEP 01 OF 04, ACCESS",
          titleTop: "CONNECT",
          titleBottom: "YOUR WALLET.",
          intro:
            "Base Wallet and Base App give you the zero gas path on Base. Your collectibles live on Base. If you use another wallet, we can send them to your personal wallet later.",
          status: "STATUS",
          session: "SESSION",
          signature: "SIGNATURE",
          expiry: "EXPIRES",
          connect: "CONNECT WALLET",
          sign: "SIGN AND ENTER",
          open: "OPEN MAP",
          signOut: "SIGN OUT",
          reset: "RESET WALLET",
          noWallet: "No wallet? Install one. It takes 5 minutes.",
          connected: "CONNECTED",
          connectFirst: "Connect first.",
          verify: "You will confirm this address.",
          readyToEnter: "WALLET READY",
          readyToSign: "SIGN THE MESSAGE",
          verified: "ACCESS GRANTED",
          pending: "PENDING",
          bullets: [
            "Collectibles mint on Base.",
            "Base Wallet or Base App gives you zero gas at the event.",
            "You can use any wallet. We can send collectibles to your personal wallet later.",
          ],
          connectHint: "Pick a wallet to continue.",
          baseBadge: "Base Wallet or Base App",
        };

  const activeAddress = address as `0x${string}` | undefined;
  const hasAccess = Boolean(authenticatedAddress);
  const isWalletReady = Boolean(isConnected && activeAddress);
  const preferredConnector = useMemo(
    () =>
      connectors.find(
        (connector) =>
          isBaseWalletConnector(connector.id) ||
          connector.id === "injected" ||
          connector.id === "walletConnect",
      ) ?? connectors[0],
    [connectors],
  );

  useEffect(() => {
    if (hasAccess) {
      setStep(3);
      return;
    }
    if (isSigning) {
      setStep(2);
      return;
    }
    if (isWalletReady) {
      setStep(1);
      return;
    }
    setStep(0);
  }, [hasAccess, isSigning, isWalletReady]);

  const stages = [
    { label: copy.connect, sub: copy.connectHint },
    {
      label: language === "es" ? "WALLET LISTA" : "WALLET READY",
      sub: activeAddress ? shortPizzaDayAddress(activeAddress) : copy.connectFirst,
    },
    { label: language === "es" ? "FIRMA EL MENSAJE" : "SIGN MESSAGE", sub: copy.verify },
    {
      label: language === "es" ? "ACCESO LISTO" : "ACCESS GRANTED",
      sub: authenticatedAddress
        ? shortPizzaDayAddress(authenticatedAddress as `0x${string}`)
        : language === "es"
          ? "Sesión verificada."
          : "Session verified.",
    },
  ];
  const currentStage = stages[step];
  const progress = hasAccess ? 100 : isSigning ? 74 : isWalletReady ? 52 : 18;

  async function handleConnect() {
    if (!preferredConnector) {
      setFeedback(language === "es" ? "No hay wallet disponible." : "No wallet connector is available.");
      return;
    }

    setFeedback("");
    try {
      await connect({ connector: preferredConnector });
    } catch {
      setFeedback(language === "es" ? "La conexión falló." : "Wallet connection failed.");
    }
  }

  async function handleAuthenticate() {
    if (!activeAddress) {
      setFeedback(language === "es" ? "Conecta una wallet primero." : "Connect a wallet first.");
      return;
    }

    setFeedback("");
    try {
      const challenge = buildPizzaDayAuthMessage(activeAddress);
      const signature = (await signMessageAsync({ message: challenge.message })) as `0x${string}`;
      const recovered = await recoverMessageAddress({
        message: challenge.message,
        signature,
      });

      if (!isAddressEqual(recovered, activeAddress)) {
        throw new Error("Signature mismatch.");
      }

      onAuthenticated({
        address: activeAddress,
        message: challenge.message,
        signature,
        issuedAt: challenge.issuedAt,
        expiresAt: challenge.expiresAt,
      });
      setStep(3);
      setFeedback(language === "es" ? "Wallet verificada. Sesión activa." : "Wallet verified. Session locked.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed.";
      setFeedback(/reject|denied|cancel/i.test(message) ? (language === "es" ? "Firma cancelada." : "Signature cancelled.") : message);
    }
  }

  function handleSignOut() {
    disconnect();
    onSignOut();
    setFeedback("");
    setStep(0);
  }

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
      <div style={{ width: "100%", maxWidth: 920, position: "relative" }}>
        <div
          className="pdq-eyebrow"
          style={{ marginBottom: 32, justifyContent: "center", width: "fit-content", marginInline: "auto" }}
        >
          {copy.step}
        </div>

        <h1
          className="pdq-display"
          style={{
            fontSize: "clamp(44px, 8vw, 120px)",
            textAlign: "center",
            margin: "0 0 24px",
            lineHeight: 0.85,
          }}
        >
          {copy.titleTop}
          <br />
          <span style={{ color: "var(--pdq-ink-3)" }}>{copy.titleBottom}</span>
        </h1>

        <div style={{ maxWidth: 760, margin: "0 auto 28px", color: "var(--pdq-ink-2)", fontSize: 16, lineHeight: 1.65, textAlign: "center" }}>
          {copy.intro}
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto 22px", padding: "14px 16px", border: "1px solid var(--pdq-line)", borderRadius: 4, background: "rgba(255,255,255,0.02)" }}>
          <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)", marginBottom: 8 }}>
            {copy.baseBadge}
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6, color: "var(--pdq-ink-2)", fontSize: 13.5, lineHeight: 1.45 }}>
            {copy.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>

        <div
          className="pdq-hero-2col"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 18,
            alignItems: "start",
            marginBottom: 20,
          }}
        >
          <Brackets className="glass" style={{ padding: 24 }}>
            <div className="pdq-mono" style={{ marginBottom: 16, color: "var(--pdq-ink-3)" }}>
              {copy.status}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {stages.map((stage, index) => (
                <div key={stage.label} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, alignItems: "center" }}>
                  <div className="pdq-mono-tight" style={{ color: index === step ? "var(--pdq-ink)" : "var(--pdq-ink-4)" }}>
                    0{index + 1}
                  </div>
                  <div>
                    <div className="pdq-display-alt" style={{ fontSize: 16, marginBottom: 2 }}>
                      {stage.label}
                    </div>
                    <div style={{ color: "var(--pdq-ink-4)", fontSize: 12.5 }}>{stage.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <EnergyBar value={progress} label={`${copy.signature} · ${currentStage.label}`} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
              <button type="button" className="pdq-btn lg" onClick={handleConnect} disabled={Boolean(authenticatedAddress)}>
                {copy.connect} {!authenticatedAddress && <span className="arr">→</span>}
              </button>
              <button type="button" className="pdq-btn lg ghost" onClick={handleAuthenticate} disabled={!isWalletReady || hasAccess}>
                {copy.sign} {!hasAccess && <span className="arr">→</span>}
              </button>
              <button type="button" className="pdq-btn ghost" onClick={onDone} disabled={!hasAccess}>
                {copy.open}
              </button>
              <button type="button" className="pdq-btn ghost" onClick={handleSignOut}>
                {copy.signOut}
              </button>
            </div>

            <div className="pdq-mono-tight" style={{ marginTop: 14, color: "var(--pdq-ink-4)" }}>
              {copy.noWallet}
            </div>
            {feedback ? (
              <div style={{ marginTop: 12, color: "var(--pdq-ink-2)", fontSize: 13.5 }}>{feedback}</div>
            ) : null}
          </Brackets>

          <Brackets className="glass" style={{ padding: 24 }}>
            <div className="pdq-mono" style={{ marginBottom: 16, color: "var(--pdq-ink-3)" }}>
              {copy.session}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
                  {copy.signature}
                </div>
                <div className="pdq-display-alt" style={{ fontSize: 18 }}>
                  {authenticatedAddress ? shortPizzaDayAddress(authenticatedAddress as `0x${string}`) : copy.pending}
                </div>
              </div>
              <div>
                <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
                  {copy.expiry}
                </div>
                <div className="pdq-display-alt" style={{ fontSize: 18 }}>
                  {authenticatedAddress ? shortPizzaDayAddress(authenticatedAddress as `0x${string}`) : copy.pending}
                </div>
              </div>
              <div>
                <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
                  {copy.connected}
                </div>
                <div className="pdq-display-alt" style={{ fontSize: 18 }}>
                  {activeAddress ? shortPizzaDayAddress(activeAddress) : copy.pending}
                </div>
              </div>
              <div>
                <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
                  {copy.baseBadge}
                </div>
                <div className="pdq-display-alt" style={{ fontSize: 18 }}>
                  {connectorLabel(preferredConnector?.id ?? "", preferredConnector?.name ?? "", language)}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)", marginBottom: 10 }}>
                {copy.status}
              </div>
              <div style={{ position: "relative", minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Reticle size={220} animated />
                <Glitch trigger={step}>
                  <div style={{ position: "relative" }}>
                    <div className="pdq-display-alt" style={{ fontSize: 36, letterSpacing: "0.08em" }}>
                      {language === "es" ? "BASE" : "BASE"}
                    </div>
                  </div>
                </Glitch>
              </div>
            </div>
          </Brackets>
        </div>

        <div className="pdq-mono" style={{ marginTop: 18, color: "var(--pdq-ink-3)" }}>
          {copy.status}
        </div>
      </div>
    </div>
  );
}
