"use client";

import { useState } from "react";
import { useSiteLanguage } from "@/components/site-language";
import {
  DATA,
  type MedalVariant,
  type Medal as MedalType,
  type MissionType,
  type Operator,
} from "./data";
import { Brackets, EnergyBar, Medal, Reticle } from "./Hud";
import { localizedText } from "./locale";

type SelectedMedal = MedalType & { typeInfo: MissionType | undefined };

export function Profile({
  me,
  onBack,
  onMapBack,
  medalVariant,
}: {
  me: Operator;
  onBack: () => void;
  onMapBack: () => void;
  medalVariant: MedalVariant;
}) {
  const D = DATA;
  const { language } = useSiteLanguage();
  const t = (value: string) => localizedText(value, language);
  const [selectedMedal, setSelectedMedal] = useState<SelectedMedal | null>(null);
  const pct = (me.xp / me.nextReq) * 100;

  return (
    <div className="pdq-enter-fade" style={{ padding: "120px var(--pdq-pad-x) 80px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "flex-end",
          marginBottom: 36,
          gap: 32,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="pdq-eyebrow" style={{ marginBottom: 18 }}>
            {t("STEP 04 / 04 · DOSSIER / EXPEDIENTE")}
          </div>
          <h1
            className="pdq-display"
            style={{ fontSize: "clamp(36px, 5.5vw, 80px)", margin: 0, lineHeight: 0.88 }}
          >
            {me.handle}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="pdq-btn ghost" onClick={onMapBack}>
            ← {t("MISSION MAP / MAPA")}
          </button>
          <button type="button" className="pdq-btn ghost" onClick={onBack}>
            {t("EXIT FIELD / SALIR")}
          </button>
        </div>
      </div>

      <div
        className="pdq-hero-2col"
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Brackets className="glass" style={{ padding: 28 }}>
          <div
            className="pdq-hero-2col"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
              alignItems: "center",
            }}
          >
            <div>
              <div className="pdq-mono" style={{ marginBottom: 10, color: "var(--pdq-ink-3)" }}>
                CURRENT RANK
              </div>
              <div
                className="pdq-display"
                style={{ fontSize: "clamp(44px, 6vw, 62px)", lineHeight: 0.88, marginBottom: 18 }}
              >
                {me.rank}
              </div>
              <div style={{ marginBottom: 18 }}>
                <EnergyBar value={pct} label={`→ ${me.nextRank}`} />
              </div>
              <div className="pdq-mono" style={{ color: "var(--pdq-ink-3)" }}>
                {me.xp} / {me.nextReq} XP · {me.nextReq - me.xp} {t("TO NEXT / PARA EL SIGUIENTE")}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {D.ranks.map((r, i) => {
                  const earned = r.req <= me.xp;
                  const isCurrent = r.title === me.rank;
                  return (
                    <div
                      key={r.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "32px 1fr auto",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 0",
                        borderBottom:
                          i < D.ranks.length - 1 ? "1px dashed var(--pdq-line)" : "none",
                        opacity: earned ? 1 : 0.5,
                      }}
                    >
                      <span
                        className="pdq-mono"
                        style={{ color: isCurrent ? "var(--pdq-ink)" : "var(--pdq-ink-4)" }}
                      >
                        0{r.index}
                      </span>
                      <span
                        className="pdq-display-alt"
                        style={{
                          fontSize: 16,
                          color: isCurrent
                            ? "var(--pdq-ink)"
                            : earned
                              ? "var(--pdq-ink-2)"
                              : "var(--pdq-ink-4)",
                        }}
                      >
                        {r.title}
                      </span>
                      <span className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
                        {earned ? "✓" : `≥${r.req}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Brackets>

        <Brackets className="glass" style={{ padding: 28 }}>
          <div className="pdq-mono" style={{ marginBottom: 18, color: "var(--pdq-ink-3)" }}>
            {t("OPERATOR · DATA / OPERADOR")}
          </div>
          <div
            className="pdq-grid-2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              marginBottom: 24,
            }}
          >
            {[
              { k: "CHIP ID", v: me.chip },
              {k: "JOINED / INGRESO", v: me.joined},
              {k: "MEDALS / MEDALLAS", v: String(me.medals.length).padStart(2, "0")},
              {k: "EPISODES / EPISODIOS", v: "03 · ATTENDED / ASISTIDOS"},
              {k: "CLEARS · 24H / LIMPIOS", v: "4"},
              {k: "AVG · RARITY / RAREZA", v: "RARE"},
            ].map((x) => (
              <div key={x.k}>
                <div
                  className="pdq-mono-tight"
                  style={{ color: "var(--pdq-ink-4)", marginBottom: 4 }}
                >
                  {x.k}
                </div>
                <div className="pdq-display-alt" style={{ fontSize: 18 }}>
                  {x.v}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--pdq-line)", paddingTop: 18 }}>
            <div className="pdq-mono" style={{ marginBottom: 10, color: "var(--pdq-ink-3)" }}>
              {t("NEXT MILESTONE / SIGUIENTE HITO")}
            </div>
            <div className="pdq-display-alt" style={{ fontSize: 16, color: "var(--pdq-ink-2)" }}>
              {language === "es"
                ? "Completa 6 quests más para desbloquear PIE. Aparecen quests ocultas."
                : "Clear 6 more quests to unlock PIE. Hidden quests surface."}
            </div>
          </div>
        </Brackets>
      </div>

      <div
        style={{
          marginTop: 18,
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
          {D.medalRules.map((rule) => (
            <li key={rule.en}>
              {localizedText(rule.en, language)}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 56 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
          }}
        >
          <h2
            className="pdq-display"
            style={{ fontSize: "clamp(30px, 4.5vw, 60px)", margin: 0, lineHeight: 0.9 }}
          >
            MEDAL
            <br />
            {t("CABINET / VITRINA")}
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="pdq-btn sm">
              {t("ALL / TODAS")}
            </button>
            <button type="button" className="pdq-btn sm ghost">
              PDQ·01
            </button>
            <button type="button" className="pdq-btn sm ghost">
              PDQ·00
            </button>
          </div>
        </div>

        <div className="pdq-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {me.medals.map((m) => {
            const typeInfo = D.missionTypes.find((t) => t.id === m.type);
            return (
              <Brackets
                key={m.id}
                className="glass"
                style={{ padding: 18, cursor: "pointer", transition: "transform .15s" }}
                onClick={() => setSelectedMedal({ ...m, typeInfo })}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span className="pdq-mono">{m.ep}</span>
                  <span className="pdq-mono" style={{ color: "var(--pdq-ink-4)" }}>
                    {typeInfo?.short}
                  </span>
                </div>
                <div style={{ position: "relative", aspectRatio: "1", marginBottom: 16 }}>
                  <Medal size="100%" variant={medalVariant} type={typeInfo?.glyph} />
                </div>
                <div className="pdq-display-alt" style={{ fontSize: 14, marginBottom: 4 }}>
                  {m.label}
                </div>
                <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
                  BOUND · {me.chip.slice(-5)}
                </div>
              </Brackets>
            );
          })}

          {Array.from({ length: Math.max(0, 8 - me.medals.length) }).map((_, i) => (
            <div
              key={`slot-${i}`}
              style={{
                padding: 18,
                border: "1px dashed var(--pdq-line-2)",
                borderRadius: 4,
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--pdq-ink-5)",
              }}
            >
              <div className="pdq-display-alt" style={{ fontSize: 22, marginBottom: 8 }}>
                +
              </div>
              <div className="pdq-mono-tight">{t("SLOT EMPTY / ESPACIO VACÍO")}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedMedal && (
        <div
          onClick={() => setSelectedMedal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(16px)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 720 }}>
            <Brackets className="glass" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "14px 24px",
                  borderBottom: "1px solid var(--pdq-line)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span className="pdq-mono" style={{ color: "var(--pdq-ink-2)" }}>
                  MEDAL · {selectedMedal.label} · {selectedMedal.ep}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMedal(null)}
                  style={{
                    background: "transparent",
                    border: 0,
                    color: "var(--pdq-ink-2)",
                    cursor: "pointer",
                    fontFamily: "var(--pdq-mono)",
                    fontSize: 12,
                  }}
                >
                  {t("CLOSE ✕ / CERRAR")}
                </button>
              </div>
              <div
                className="pdq-hero-2col"
                style={{
                  padding: 32,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 28,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Reticle size={300} animated />
                  <Medal size={240} variant={medalVariant} type={selectedMedal.typeInfo?.glyph} />
                </div>
                <div>
                  <div className="pdq-mono" style={{ marginBottom: 12, color: "var(--pdq-ink-3)" }}>
                    {t("BOUND / ENLACE")} · {selectedMedal.typeInfo?.code} · AR
                  </div>
                  <div
                    className="pdq-display"
                    style={{ fontSize: 28, marginBottom: 14, lineHeight: 0.95 }}
                  >
                    {selectedMedal.label}
                  </div>
                  <div
                    style={{
                      color: "var(--pdq-ink-2)",
                      fontSize: 14,
                      lineHeight: 1.5,
                      marginBottom: 24,
                    }}
                  >
                    {language === "es"
                      ? `Obtenida en ${selectedMedal.ep} vía ${selectedMedal.typeInfo?.name.toLowerCase()}. Ver en AR manteniendo tu dispositivo vinculado al chip sobre cualquier superficie plana.`
                      : `Earned at ${selectedMedal.ep} via ${selectedMedal.typeInfo?.name.toLowerCase()}. View in AR by holding your chip-bound device against any flat surface.`}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" className="pdq-btn">
                      {t("VIEW IN AR / VER EN AR")} <span className="arr">→</span>
                    </button>
                    <button type="button" className="pdq-btn ghost">
                      {t("CERTIFICATE / CERTIFICADO")}
                    </button>
                  </div>
                </div>
              </div>
            </Brackets>
          </div>
        </div>
      )}
    </div>
  );
}

