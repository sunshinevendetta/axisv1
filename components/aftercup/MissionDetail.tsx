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
      className="pdq-enter-fade pdq-sheet-overlay"
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
      <div
        className="pdq-sheet-card"
        style={{ width: "100%", maxWidth: 1100, position: "relative" }}
      >
        <Brackets
          className="glass pdq-sheet-brackets"
          style={{
            padding: 0,
            overflow: "hidden",
            maxHeight: "90dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="pdq-sheet-head"
            style={{
              padding: "16px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--pdq-line)",
              background: "rgba(0,0,0,0.4)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <span className="pdq-mono" style={{ color: "var(--pdq-ink-2)" }}>
                {t("DOSSIER ·")} {mission.code}
              </span>
              <span className="pdq-mono" style={{ color: "var(--pdq-ink-4)" }}>
                · ACQ·01
              </span>
              <span className="pdq-mono" style={{ color: "var(--pdq-ink-4)" }}>
                ZONE {mission.zone}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("CLOSE / CERRAR")}
                className="pdq-sheet-close"
                style={{
                  background: "transparent",
                  border: "1px solid var(--pdq-line-2)",
                  color: "var(--pdq-ink-2)",
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  cursor: "pointer",
                  fontFamily: "var(--pdq-mono)",
                  fontSize: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="pdq-sheet-body" style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
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
              poster={mission.poster}
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
          </div>
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
    <div className="pdq-hero-2col pdq-sheet-2col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", minHeight: 520 }}>
      <div className="pdq-sheet-pad" style={{ padding: 40, borderRight: "1px solid var(--pdq-line)" }}>
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

      <div className="pdq-sheet-pad" style={{ padding: 40, display: "flex", flexDirection: "column" }}>
        <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)", marginBottom: 18 }}>
          {t("PAYOFF · MEDAL PREVIEW / RECOMPENSA · VISTA PREVIA")}
        </div>
        <div
          className="pdq-medal-stage"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: 300,
          }}
        >
          <div className="pdq-medal-stack">
            <Reticle size={300} animated />
            <span className="pdq-medal-stack-center">
              <Medal size={240} variant="chrome" type={typeInfo.glyph} imageSrc={mission.poster} />
            </span>
          </div>
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
        localizedText("Find the check-in point in the marked zone. / Encuentra el punto de check-in en la zona marcada.", language),
        localizedText("Tap the check-in cube with your phone. / Toca el cubo de check-in con tu telefono.", language),
        localizedText("Confirm the medal on screen and keep going. / Confirma la medalla en pantalla y sigue.", language),
      ];
    case "social":
      return [
        localizedText("Share your match or event moment with #AftercupMX. / Comparte tu momento del partido o evento con #AftercupMX.", language),
        localizedText("Show it at the quest point. / Muestralo en el punto de quest.", language),
        localizedText("Confirm the medal on screen. / Confirma la medalla en pantalla.", language),
      ];
    case "bet":
      return [
        localizedText("Pick your match prediction on the screen. / Elige tu pronostico del partido en la pantalla.", language),
        localizedText("Confirm your choice before kickoff. / Confirma tu eleccion antes del inicio.", language),
        localizedText("Check the result after the match to collect the medal. / Revisa el resultado despues del partido para obtener la medalla.", language),
      ];
    case "chain":
      return [
        localizedText("Open your camera and scan the QR at the event point. / Abre la camara y escanea el QR del punto del evento.", language),
        localizedText("Confirm that you want to collect the medal. / Confirma que quieres obtener la medalla.", language),
        localizedText("Show the success screen to staff if asked. / Muestra la pantalla de exito al staff si te la piden.", language),
      ];
    case "ar":
      return [
        localizedText("Point your phone at the art mark. / Apunta tu telefono hacia la marca de arte.", language),
        localizedText("Hold for a few seconds until it confirms. / Manten unos segundos hasta que confirme.", language),
        localizedText("Confirm the medal on screen. / Confirma la medalla en pantalla.", language),
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
  const isTap = mission.type === "nfc";
  const verb =
    ({
      nfc: "PRESS & HOLD TO CHECK IN",
      social: "PRESS & HOLD TO BROADCAST",
      chain: "PRESS & HOLD TO COLLECT",
      bet: "PRESS & HOLD TO PREDICT",
      ar: "PRESS & HOLD TO SCAN",
    } as Record<MissionTypeId, string>)[mission.type] || "PRESS & HOLD";

  return (
    <div
      className="pdq-hero-2col pdq-sheet-2col pdq-sheet-pad"
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
          {isTap ? (language === "es" ? "TOCA\nCHECK-IN." : "TAP\nCHECK-IN.") : `${verb.split(" ").slice(2).join(" ")}.`}
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
            {t("CHECK")} · {(holdT / 100).toFixed(3)}
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
  poster,
}: {
  progress: number;
  typeInfo: MissionType;
  medalVariant: MedalVariant;
  poster?: string;
}) {
  const { language } = useSiteLanguage();
  const t = (value: string) => localizedText(value, language);
  return (
    <div
      className="pdq-hero-2col pdq-sheet-2col pdq-sheet-pad"
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
            {t("MEDAL CHECK / CONFIRMACIÓN")} · {Math.round(progress)}%
          </div>
          <h2
            className="pdq-display"
            style={{ fontSize: "clamp(32px, 5vw, 46px)", margin: "0 0 22px", lineHeight: 0.9, whiteSpace: "pre-line" }}
          >
            {progress < 33
              ? (language === "es" ? "PREPARANDO\nMEDALLA." : "PREPARING\nMEDAL.")
              : progress < 66
                ? (language === "es" ? "AGREGANDO\nAL PERFIL." : "ADDING\nTO PROFILE.")
                : progress < 95
                  ? (language === "es" ? "CONFIRMANDO." : "CONFIRMING.")
                  : (language === "es" ? "LISTO." : "READY.")}
          </h2>
        </Glitch>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <EnergyBar value={Math.min(progress * 1.2, 100)} label={t("QR")} />
          <EnergyBar value={Math.min(Math.max(0, progress - 20) * 1.2, 100)} label={t("OK")} />
          <EnergyBar value={Math.min(Math.max(0, progress - 40) * 1.4, 100)} label={t("MEDAL")} />
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
            ? "qr leido - staff ok"
            : "QR read - staff OK"}
          <br />
          {language === "es"
            ? "medalla lista para tu perfil"
            : "medal ready for your profile"}
          <br />
          {language === "es"
            ? `confirmación pendiente [${Math.round(progress)}%]`
            : `confirmation pending [${Math.round(progress)}%]`}
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
        <div className="pdq-medal-stack">
          <Reticle size={400} animated />
          <span className="pdq-medal-stack-center">
            <Medal size={300} variant={medalVariant} type={typeInfo.glyph} imageSrc={poster} />
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
      className="pdq-hero-2col pdq-sheet-2col pdq-sheet-pad"
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
            { k: "RANK", v: DATA.me.rank },
            { k: "NEXT", v: DATA.me.nextRank },
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
        <div className="pdq-medal-stack">
          <Reticle size={420} animated />
          <span className="pdq-medal-stack-center">
            <Medal size={320} variant={medalVariant} type={typeInfo.glyph} imageSrc={mission.poster} />
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
