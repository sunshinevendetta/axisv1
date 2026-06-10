"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteLanguage } from "@/components/site-language";
import {
  DATA,
  type MedalVariant,
  type Mission,
  type MissionType,
  type MissionTypeId,
} from "./data";
import { Brackets, EnergyBar, Glitch, Medal, Reticle } from "./Hud";
import { localizedText } from "./locale";

type Phase = "brief" | "tap" | "claiming" | "done";

export function MissionDetail({
  mission,
  onClose,
  onComplete,
  medalVariant,
}: {
  mission: Mission;
  onClose: () => void;
  onComplete: (m: Mission) => void;
  medalVariant: MedalVariant;
}) {
  const D = DATA;
  const { language } = useSiteLanguage();
  const t = (value: string) => localizedText(value, language);
  const typeInfo = D.missionTypes.find((t) => t.id === mission.type) as MissionType;
  const [phase, setPhase] = useState<Phase>("brief");
  const [progress, setProgress] = useState(0);
  const [holdT, setHoldT] = useState(0);
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "claiming") return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        const np = p + 4;
        if (np >= 100) {
          clearInterval(id);
          setTimeout(() => setPhase("done"), 250);
          return 100;
        }
        return np;
      });
    }, 80);
    return () => clearInterval(id);
  }, [phase]);

  const startHold = () => {
    if (phase !== "tap") return;
    holdRef.current = setInterval(() => {
      setHoldT((t) => {
        const nt = t + 3.5;
        if (nt >= 100) {
          if (holdRef.current) {
            clearInterval(holdRef.current);
            holdRef.current = null;
          }
          setPhase("claiming");
          return 100;
        }
        return nt;
      });
    }, 40);
  };
  const endHold = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
    if (phase === "tap" && holdT < 100) setHoldT(0);
  };

  useEffect(
    () => () => {
      if (holdRef.current) clearInterval(holdRef.current);
    },
    [],
  );

  if (!mission) return null;

  const locked = mission.status === "locked";
  const subTitle = mission.title.split(" — ")[1] || mission.title;

  return (
    <div
      className="pdq-enter-fade"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ width: "100%", maxWidth: 1100, position: "relative" }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: -44,
            right: 0,
            background: "transparent",
            border: "1px solid var(--pdq-line-2)",
            color: "var(--pdq-ink-2)",
            width: 32,
            height: 32,
            borderRadius: 2,
            cursor: "pointer",
            fontFamily: "var(--pdq-mono)",
            fontSize: 14,
          }}
        >
          ✕
        </button>

        <Brackets className="glass" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--pdq-line)",
              background: "rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <span className="pdq-mono" style={{ color: "var(--pdq-ink-2)" }}>
                {t("DOSSIER ·")} {mission.code}
              </span>
              <span className="pdq-mono" style={{ color: "var(--pdq-ink-4)" }}>
                · PDQ·01
              </span>
              <span className="pdq-mono" style={{ color: "var(--pdq-ink-4)" }}>
                ZONE {mission.zone}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {phase === "brief" && (
                <span className="pdq-tag live">
                  <span className="pdq-dot" />
                  {t("READY / LISTO")}
                </span>
              )}
              {phase === "tap" && (
                <span className="pdq-tag live">
                  <span className="pdq-dot" />
                  {t("AWAITING TAP / ESPERANDO TAP")}
                </span>
              )}
              {phase === "claiming" && (
                <span className="pdq-tag live">
                  <span className="pdq-dot" />
                  {t("CLAIMING / RECLAMANDO")}
                </span>
              )}
              {phase === "done" && (
                <span className="pdq-tag live">
                  <span className="pdq-dot" />
                  {t("CLEARED / COMPLETADO")}
                </span>
              )}
            </div>
          </div>

          {phase === "brief" && (
            <BriefView
              mission={mission}
              typeInfo={typeInfo}
              subTitle={subTitle}
              locked={locked}
              onStart={() => setPhase("tap")}
              onClose={onClose}
            />
          )}

          {phase === "tap" && (
            <TapView
              typeInfo={typeInfo}
              mission={mission}
              holdT={holdT}
              startHold={startHold}
              endHold={endHold}
              onBack={() => {
                setHoldT(0);
                setPhase("brief");
              }}
            />
          )}

          {phase === "claiming" && (
            <ClaimingView
              progress={progress}
              typeInfo={typeInfo}
              medalVariant={medalVariant}
            />
          )}

          {phase === "done" && (
            <DoneView
              mission={mission}
              typeInfo={typeInfo}
              medalVariant={medalVariant}
              onContinue={() => onComplete(mission)}
            />
          )}
        </Brackets>
      </div>
    </div>
  );
}

function BriefView({
  mission,
  typeInfo,
  subTitle,
  onStart,
  onClose,
  locked,
}: {
  mission: Mission;
  typeInfo: MissionType;
  subTitle: string;
  onStart: () => void;
  onClose: () => void;
  locked: boolean;
}) {
  const { language } = useSiteLanguage();
  const missionLanguage = language === "zh" ? "en" : language;
  const t = (value: string) => localizedText(value, language);
  return (
    <div className="pdq-hero-2col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", minHeight: 520 }}>
      <div style={{ padding: 40, borderRight: "1px solid var(--pdq-line)" }}>
        <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)", marginBottom: 18 }}>
          {typeInfo.code} · {typeInfo.name}
        </div>
        <h2
          className="pdq-display"
          style={{ fontSize: "clamp(36px, 5.5vw, 52px)", margin: "0 0 12px", lineHeight: 0.88 }}
        >
          {mission.title.split(" — ")[0]}
        </h2>
        <div
          className="pdq-display-alt"
          style={{ fontSize: 20, color: "var(--pdq-ink-3)", marginBottom: 22 }}
        >
          {subTitle}
        </div>
        <div
          style={{
            fontSize: 15,
            color: "var(--pdq-ink-2)",
            lineHeight: 1.55,
            maxWidth: 460,
            marginBottom: 28,
          }}
        >
          {mission.desc}
        </div>

        <div
          style={{
            marginBottom: 28,
            padding: "14px 16px",
            border: "1px solid var(--pdq-line)",
            borderRadius: 4,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)", marginBottom: 8 }}>
            {t("MEDAL RULES / REGLAS DE MEDALLAS")}
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              display: "grid",
              gap: 6,
              color: "var(--pdq-ink-2)",
              fontSize: 13.5,
              lineHeight: 1.45,
            }}
          >
            {DATA.medalRules.map((rule) => (
              <li key={rule.en}>
              {localizedText(rule.en, language)}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="pdq-grid-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            padding: "20px 0",
            borderTop: "1px solid var(--pdq-line)",
            borderBottom: "1px solid var(--pdq-line)",
          }}
        >
          {[
            { k: "XP", v: `+${mission.xp}` },
            { k: "TIME", v: mission.time },
            { k: "RARITY", v: mission.rarity.toUpperCase() },
            { k: "PAYOFF", v: "MEDAL" },
          ].map((s) => (
            <div key={s.k}>
              <div
                className="pdq-mono-tight"
                style={{ color: "var(--pdq-ink-4)", marginBottom: 4 }}
              >
                {s.k}
              </div>
              <div className="pdq-display-alt" style={{ fontSize: 20 }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <div className="pdq-mono" style={{ marginBottom: 12, color: "var(--pdq-ink-3)" }}>
          {t("EXECUTION / EJECUCIÓN")}
          </div>
          <ol
            style={{
              paddingLeft: 0,
              margin: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {executionSteps(mission.type, missionLanguage).map((s, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  color: "var(--pdq-ink-2)",
                  fontSize: 13.5,
                }}
              >
                <span
                  className="pdq-mono"
                  style={{ minWidth: 28, color: "var(--pdq-ink-4)", paddingTop: 2 }}
                >
                  0{i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button type="button" className="pdq-btn ghost" onClick={onClose}>
            {t("BACK / VOLVER")}
          </button>
          <button
            type="button"
            className="pdq-btn lg"
            onClick={onStart}
            disabled={locked}
            style={{ opacity: locked ? 0.3 : 1, pointerEvents: locked ? "none" : "auto" }}
          >
            {locked ? t("CLASSIFIED / CLASIFICADO") : t("BEGIN MISSION / INICIAR MISIÓN")} {!locked && <span className="arr">→</span>}
          </button>
        </div>
      </div>

      <div style={{ padding: 40, display: "flex", flexDirection: "column" }}>
        <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)", marginBottom: 18 }}>
          {t("PAYOFF · MEDAL PREVIEW / RECOMPENSA · VISTA PREVIA")}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Reticle size={300} animated />
          <Medal size={240} variant="chrome" type={typeInfo.glyph} />
        </div>
        <div
          style={{
            marginTop: 24,
            padding: "16px 20px",
            border: "1px solid var(--pdq-line)",
            borderRadius: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              className="pdq-mono-tight"
              style={{ color: "var(--pdq-ink-4)", marginBottom: 4 }}
            >
              {t("MEDAL · UNCLAIMED / MEDALLA · SIN RECLAMAR")}
            </div>
            <div className="pdq-display-alt" style={{ fontSize: 16 }}>
              {mission.payoff}
            </div>
          </div>
          <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)" }}>
            {mission.rarity.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

function executionSteps(type: MissionTypeId, language: "en" | "es"): string[] {
  switch (type) {
    case "nfc":
      return [
        localizedText("Locate the marked station in the designated zone. / Localiza la estación marcada en la zona indicada.", language),
        localizedText("Hold the chip within 3 cm of the reader. / Acerca el chip a 3 cm del lector.", language),
        localizedText("Wait for the LED to flash white. / Espera a que el LED parpadee en blanco.", language),
      ];
    case "social":
      return [
        localizedText("Open your social client. Public account required. / Abre tu app social. Se requiere cuenta pública.", language),
        localizedText("Compose a post including #PIZZADAYQUEST. / Escribe una publicación con #PIZZADAYQUEST.", language),
        localizedText("Show the QR at the door desk for verification. / Muestra el QR en el mostrador de entrada para verificar.", language),
      ];
    case "record":
      return [
        localizedText("Step into the marked recording booth. / Entra al booth de grabación marcado.", language),
        localizedText("Tap the kiosk. Speak for up to 30 seconds. / Toca el kiosco. Habla hasta 30 segundos.", language),
        localizedText("Confirm the take. It will not be played publicly. / Confirma la toma. No se reproducirá públicamente.", language),
      ];
    case "chain":
      return [
        localizedText("Bring an EVM-compatible wallet on your phone. / Trae una wallet compatible con EVM en tu teléfono.", language),
        localizedText("Scan the booth's QR. Sign one free transaction. / Escanea el QR del booth. Firma una transacción gratis.", language),
        localizedText("Return to the door desk to confirm. / Vuelve al mostrador de entrada para confirmar.", language),
      ];
    case "debate":
      return [
        localizedText("Take a numbered seat at the round table. / Toma un asiento numerado en la mesa redonda.", language),
        localizedText("Listen to the moderator open the topic. / Escucha al moderador abrir el tema.", language),
        localizedText("Speak when called, or hold the silence. / Habla cuando te llamen, o sostén el silencio.", language),
      ];
    case "ar":
      return [
        localizedText("Point the chip-bound device at the piece. / Apunta el dispositivo vinculado al chip hacia la pieza.", language),
        localizedText("Hold for 8 seconds. Lock-on confirms green. / Mantén 8 segundos. El bloqueo confirma en verde.", language),
        localizedText("Release. The AR layer is now bound to you. / Suelta. La capa AR queda vinculada a ti.", language),
      ];
    case "group":
      return [
        localizedText("Gather a party of four holders. / Reúne un grupo de cuatro holders.", language),
        localizedText("All four must tap the same station within 60 seconds. / Los cuatro deben tocar la misma estación en 60 segundos.", language),
        localizedText("Convergence medal is minted to all four. / La medalla de convergencia se mintea para los cuatro.", language),
      ];
    case "hidden":
      return [
        localizedText("Mission requires ORACLE rank or higher. / La misión requiere rango ORACLE o superior.", language),
        localizedText("Coordinates redacted until threshold. / Las coordenadas permanecen redactadas hasta el umbral.", language),
        localizedText("You will know when you are ready. / Lo sabrás cuando estés listo.", language),
      ];
    default:
      return [];
  }
}

function TapView({
  typeInfo,
  mission,
  holdT,
  startHold,
  endHold,
  onBack,
}: {
  typeInfo: MissionType;
  mission: Mission;
  holdT: number;
  startHold: () => void;
  endHold: () => void;
  onBack: () => void;
}) {
  const { language } = useSiteLanguage();
  const t = (value: string) => localizedText(value, language);
  const isTap = mission.type === "nfc" || mission.type === "group";
  const verb =
    ({
      nfc: "PRESS & HOLD TO TAP",
      social: "PRESS & HOLD TO BROADCAST",
      record: "PRESS & HOLD TO RECORD",
      chain: "PRESS & HOLD TO MINT",
      debate: "PRESS & HOLD TO TAKE SEAT",
      ar: "PRESS & HOLD TO LOCK",
      group: "PRESS & HOLD TO ASSEMBLE",
      hidden: "—",
    } as Record<MissionTypeId, string>)[mission.type] || "PRESS & HOLD";

  return (
    <div
      className="pdq-hero-2col"
      style={{
        minHeight: 520,
        padding: 32,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 32,
        alignItems: "center",
      }}
    >
      <div>
        <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)", marginBottom: 14 }}>
          {t("EXECUTING · EJECUTANDO")} · {typeInfo.code}
        </div>
        <h2 className="pdq-display" style={{ fontSize: "clamp(32px, 5vw, 46px)", margin: "0 0 14px", lineHeight: 0.9 }}>
          {isTap ? (language === "es" ? "ACERCA\nEL\nCHIP." : "TAP\nTHE\nCHIP.") : `${verb.split(" ").slice(2).join(" ")}.`}
        </h2>
        <p
          style={{
            color: "var(--pdq-ink-2)",
            fontSize: 14.5,
            lineHeight: 1.5,
            maxWidth: 440,
          }}
        >
          {localizedText(mission.desc, language)}
        </p>
        <div style={{ marginTop: 32 }}>
          <EnergyBar value={holdT} label="HOLD" />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button type="button" className="pdq-btn ghost" onClick={onBack}>
            {t("CANCEL / CANCELAR")}
          </button>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Reticle size={360} animated />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              cursor: "pointer",
              appearance: "none",
              background:
                holdT > 0
                  ? `conic-gradient(rgba(255,255,255,0.9) ${holdT * 3.6}deg, rgba(255,255,255,0.06) 0)`
                  : "rgba(255,255,255,0.04)",
              border: "1px solid var(--pdq-line-3)",
              color: "var(--pdq-ink)",
              fontFamily: "var(--pdq-mono)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              boxShadow:
                "0 0 40px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.18)",
              transition: "transform .1s",
              userSelect: "none",
              transform: holdT > 0 ? "scale(1.02)" : "scale(1)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                border: "1px solid var(--pdq-line-3)",
                borderRadius: 999,
                background: "rgba(0,0,0,0.5)",
              }}
            >
              {verb}
            </span>
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0 }}>
          <span className="pdq-mono-tight" style={{ color: "var(--pdq-ink-3)" }}>
            {t("LOCK")} · {(holdT / 100).toFixed(3)}
          </span>
        </div>
        <div style={{ position: "absolute", bottom: 0, right: 0 }}>
          <span className="pdq-mono-tight" style={{ color: "var(--pdq-ink-3)" }}>
            SIG · {typeInfo.code}
          </span>
        </div>
      </div>
    </div>
  );
}

function ClaimingView({
  progress,
  typeInfo,
  medalVariant,
}: {
  progress: number;
  typeInfo: MissionType;
  medalVariant: MedalVariant;
}) {
  const { language } = useSiteLanguage();
  const t = (value: string) => localizedText(value, language);
  return (
    <div
      className="pdq-hero-2col"
      style={{
        minHeight: 520,
        padding: 32,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 32,
        alignItems: "center",
      }}
    >
      <div>
        <Glitch trigger={Math.floor(progress / 25)}>
          <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)", marginBottom: 14 }}>
            {t("CLAIM SEQUENCE")} · {Math.round(progress)}%
          </div>
          <h2
            className="pdq-display"
            style={{ fontSize: "clamp(32px, 5vw, 46px)", margin: "0 0 22px", lineHeight: 0.9, whiteSpace: "pre-line" }}
          >
            {progress < 33
              ? (language === "es" ? "ESCRIBIENDO\nMEDALLA." : "WRITING\nMEDAL.")
              : progress < 66
                ? (language === "es" ? "VINCULANDO\nAL CHIP." : "BINDING\nTO CHIP.")
                : progress < 95
                  ? (language === "es" ? "FIRMANDO\nLIBRO." : "SIGNING\nLEDGER.")
                  : (language === "es" ? "LISTO." : "READY.")}
          </h2>
        </Glitch>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <EnergyBar value={Math.min(progress * 1.2, 100)} label={t("MINT")} />
          <EnergyBar value={Math.min(Math.max(0, progress - 20) * 1.2, 100)} label={t("BIND")} />
          <EnergyBar value={Math.min(Math.max(0, progress - 40) * 1.4, 100)} label={t("LOG")} />
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: "var(--pdq-mono)",
            fontSize: 10.5,
            color: "var(--pdq-ink-4)",
            letterSpacing: "0.06em",
            lineHeight: 1.6,
          }}
        >
          {language === "es"
            ? "0x4f·a2··881e — nodo ax·mex·01 — firma ok"
            : "0x4f·a2··881e — node ax·mex·01 — signature OK"}
          <br />
          {language === "es"
            ? `medalla #m·07·${Math.floor(progress * 7).toString(16)} → operator·x`
            : `medal #m·07·${Math.floor(progress * 7).toString(16)} → operator·x`}
          <br />
          {language === "es"
            ? `confirmación pendiente [${Math.round(progress)}%]`
            : `ledger commit pending [${Math.round(progress)}%]`}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Reticle size={400} animated />
        <Medal size={300} variant={medalVariant} type={typeInfo.glyph} />
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <span className="pdq-tag live">
            <span className="pdq-dot" />
            {language === "es" ? "MEDALLA · ESCRIBIENDO" : "MEDAL · WRITING"}
          </span>
        </div>
      </div>
    </div>
  );
}

function DoneView({
  mission,
  typeInfo,
  medalVariant,
  onContinue,
}: {
  mission: Mission;
  typeInfo: MissionType;
  medalVariant: MedalVariant;
  onContinue: () => void;
}) {
  const { language } = useSiteLanguage();
  const t = (value: string) => localizedText(value, language);
  return (
    <div
      className="pdq-hero-2col"
      style={{
        minHeight: 520,
        padding: 32,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 32,
        alignItems: "center",
      }}
    >
      <div>
        <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)", marginBottom: 14 }}>
          {t("MISSION CLEARED")} · {mission.code}
        </div>
        <h2 className="pdq-display" style={{ fontSize: "clamp(44px, 7vw, 64px)", margin: "0 0 12px", lineHeight: 0.85 }}>
          MEDAL
          <br />
          <span style={{ color: "var(--pdq-ink-3)" }}>EARNED.</span>
        </h2>
        <div className="pdq-display-alt" style={{ fontSize: 16, marginBottom: 20 }}>
          {mission.payoff} · {mission.rarity.toUpperCase()}
        </div>

        <div
          className="pdq-grid-3"
          style={{
            padding: "20px 24px",
            border: "1px solid var(--pdq-line)",
            borderRadius: 4,
            marginBottom: 24,
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
          }}
        >
          {[
            { k: "+ XP", v: `+${mission.xp}` },
            { k: "RANK", v: "SLICE" },
            { k: "NEXT", v: "PIE" },
          ].map((s) => (
            <div key={s.k}>
              <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)", marginBottom: 4 }}>
                {s.k}
              </div>
              <div className="pdq-display-alt" style={{ fontSize: 22 }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="pdq-btn lg" onClick={onContinue}>
            {t("CONTINUE / CONTINUAR")} <span className="arr">→</span>
          </button>
          <button type="button" className="pdq-btn ghost lg">
            {t("SHARE / COMPARTIR")}
          </button>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Reticle size={420} animated />
        <Medal size={320} variant={medalVariant} type={typeInfo.glyph} />
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <span className="pdq-tag live">
            <span className="pdq-dot" />
            {t("BOUND TO CHIP / VINCULADA AL CHIP")}
          </span>
        </div>
        <div style={{ position: "absolute", bottom: 0, right: 0, textAlign: "right" }}>
          <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-3)" }}>
            SIG · M·{mission.code.replace("AX·", "")}
          </div>
          <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
            {t("FOREVER · YOURS / SIEMPRE TUYA")}
          </div>
        </div>
      </div>
    </div>
  );
}

