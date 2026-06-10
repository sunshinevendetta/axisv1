"use client";

import { useState } from "react";
import { useSiteLanguage } from "@/components/site-language";
import { buildConnectionOnlyAuthRecord, type AftercupAuthRecord } from "./auth";
import { Brackets, Reticle } from "./Hud";

const VENUE_CHECKIN_ID: `0x${string}` = "0x0000000000000000000000000000000000000001";

export function Connect({
  onDone,
  onAuthenticated,
  onSignOut,
  authenticatedAddress,
}: {
  onDone: () => void;
  onAuthenticated: (record: AftercupAuthRecord) => void;
  onSignOut: () => void;
  authenticatedAddress?: string | null;
}) {
  const { language } = useSiteLanguage();
  const [feedback, setFeedback] = useState("");
  const hasAccess = Boolean(authenticatedAddress);

  const copy =
    language === "es"
      ? {
          step: "CHECK-IN",
          titleTop: "ENTRA A AFTERCUP.",
          titleBottom: "CON TU TELEFONO.",
          intro:
            "En la sede, toca el cubo de check-in con tu telefono o escanea el QR del punto. Confirma obtener medalla y listo.",
          tap: "TOCAR CHECK-IN",
          scan: "ESCANEAR QR",
          ready: "CHECK-IN LISTO",
          openMap: "ABRIR MAPA",
          restart: "REINICIAR",
          feedback: "Listo. Ya puedes abrir el mapa.",
          note: "No necesitas instalar nada para empezar.",
        }
      : {
          step: "CHECK-IN",
          titleTop: "ENTER AFTERCUP.",
          titleBottom: "WITH YOUR PHONE.",
          intro:
            "At the venue, tap the check-in cube with your phone or scan the QR at the quest point. Confirm collect medal and you are done.",
          tap: "TAP CHECK-IN",
          scan: "SCAN QR",
          ready: "CHECK-IN READY",
          openMap: "OPEN MAP",
          restart: "RESTART",
          feedback: "Done. You can open the map.",
          note: "Nothing to install before you start.",
        };

  function handleCheckIn() {
    const record = buildConnectionOnlyAuthRecord(VENUE_CHECKIN_ID);
    onAuthenticated(record);
    setFeedback(copy.feedback);
  }

  function handleRestart() {
    onSignOut();
    setFeedback("");
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
              onClick={handleCheckIn}
              disabled={hasAccess}
            >
              {copy.tap} {!hasAccess && <span className="arr">→</span>}
            </button>

            <button
              type="button"
              className="pdq-btn lg ghost"
              onClick={handleCheckIn}
              disabled={hasAccess}
            >
              {copy.scan} {!hasAccess && <span className="arr">→</span>}
            </button>

            <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
              {copy.note}
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
                {hasAccess ? copy.ready : ""}
              </div>
              <div className="pdq-display-alt" style={{ fontSize: 18 }}>
                {hasAccess ? "OK" : "—"}
              </div>
            </div>

            {hasAccess ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="pdq-btn ghost" onClick={onDone}>
                  {copy.openMap} <span className="arr">→</span>
                </button>
                <button type="button" className="pdq-btn ghost" onClick={handleRestart}>
                  {copy.restart}
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
