"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useSiteLanguage } from "@/components/site-language";
import { DATA, type Floor, type Mission } from "./data";
import { Brackets, EnergyBar } from "./Hud";
import { Intro } from "./Intro";
import { localizedText } from "./locale";

interface OperatorSummary {
  handle: string;
  rank: string;
  xp: number;
  nextReq: number;
  nextRank: string;
}

const monthIndex = {
  June: 5,
  July: 6,
} as const;

function getCdmxDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function eventDateKey(month: "June" | "July", date: string) {
  return `2026-${String(monthIndex[month] + 1).padStart(2, "0")}-${date.padStart(2, "0")}`;
}

function getEventMissionOfDay(missions: Mission[]) {
  const todayKey = getCdmxDateKey();
  const eventAgenda = DATA.agenda
    .filter((item) => item.kind === "after" && item.poster)
    .map((item) => ({
      key: eventDateKey(item.month, item.date),
      poster: item.poster,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  const agendaItem =
    eventAgenda.find((item) => item.key === todayKey) ??
    eventAgenda.find((item) => item.key >= todayKey) ??
    eventAgenda[eventAgenda.length - 1];

  return agendaItem ? missions.find((mission) => mission.poster === agendaItem.poster) : undefined;
}

export function MissionMap({
  onSelect,
  onProfile,
  me,
}: {
  onSelect: (m: Mission) => void;
  onProfile: () => void;
  me: OperatorSummary;
}) {
  const D = DATA;
  const { language } = useSiteLanguage();
  const t = (value: string) => localizedText(value, language);
  const [filter, setFilter] = useState<string>("all");
  const [floor, setFloor] = useState<string>("matchday");
  const eventMissionOfDay = useMemo(() => getEventMissionOfDay(D.missions as Mission[]), [D.missions]);
  const visibleMissions = useMemo(
    () => D.missions.filter((m) => !m.poster || !eventMissionOfDay || m.id === eventMissionOfDay.id),
    [D.missions, eventMissionOfDay],
  );

  const filtered = useMemo(() => {
    return visibleMissions.filter((m) => {
      if (filter !== "all" && m.type !== filter) return false;
      if (floor !== "all" && m.floor !== floor) return false;
      return true;
    });
  }, [filter, floor, visibleMissions]);

  const types = [
    { id: "all", name: "ALL", code: "·" },
    ...D.missionTypes.map((t) => ({ id: t.id, name: t.short, code: t.code })),
  ];

  const currentFloor = (D.floors.find((f) => f.id === floor) || D.floors[0]) as Floor;

  return (
    <div className="pdq-enter-fade" style={{ padding: "120px var(--pdq-pad-x) 80px" }}>
      <Intro />
      <div
        className="pdq-map-header"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 28,
          gap: 24,
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 320px" }}>
          <div className="pdq-eyebrow" style={{ marginBottom: 18 }}>
            {t("STEP 02 / 04 · QUEST MAP / MAPA")}
          </div>
          <h1
            className="pdq-display"
            style={{ fontSize: "clamp(32px, 4.5vw, 68px)", margin: 0, lineHeight: 0.9 }}
          >
            <span>{t("AFTERCUP QUEST / RUTA")}</span>
            <span style={{ color: "var(--pdq-ink-3)", marginLeft: 10 }}>FRONTON BUCARELI</span>
          </h1>
          <div className="pdq-mono" style={{ marginTop: 16, color: "var(--pdq-ink-3)" }}>
            BUCARELI 118 · CDMX · 11·06-19·07·2026 · MATCH CUP → AFTER CUP
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-end",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <div>
            <div className="pdq-mono" style={{ marginBottom: 6 }}>
              {t("OPERATOR / OPERADOR")}
            </div>
            <div className="pdq-display-alt" style={{ fontSize: 18 }}>
              {me.handle}
            </div>
          </div>
          <div>
            <div className="pdq-mono" style={{ marginBottom: 6 }}>
              {t("RANK / RANGO")}
            </div>
            <div className="pdq-display-alt" style={{ fontSize: 18 }}>
              {me.rank}
            </div>
          </div>
          <div>
            <div className="pdq-mono" style={{ marginBottom: 6 }}>
              {t("XP · NEXT / XP · SIG.")}
            </div>
            <div
              className="pdq-display-alt"
              style={{ fontSize: 18, fontVariantNumeric: "tabular-nums" }}
            >
              {me.xp} / {me.nextReq}
            </div>
          </div>
          <button type="button" className="pdq-btn ghost" onClick={onProfile}>
            {t("VIEW DOSSIER / VER EXPEDIENTE")} →
          </button>
        </div>
      </div>

      <EnergyBar value={(me.xp / me.nextReq) * 100} label={`→ ${me.nextRank}`} />

      <div
        className="pdq-hero-2col"
        style={{
          marginTop: 36,
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        <Brackets className="glass" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--pdq-line)",
            }}
          >
            <span className="pdq-mono">{t("VENUE / SEDE")} · FRONTON BUCARELI</span>
            <span className="pdq-mono">
              {filtered.length} / {visibleMissions.length} {t("VISIBLE / VISIBLES")}
            </span>
          </div>

          <BuildingAxon
            floors={D.floors as Floor[]}
            active={floor}
            onPick={setFloor}
            missions={visibleMissions as Mission[]}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${D.floors.length}, 1fr)`,
              borderTop: "1px solid var(--pdq-line)",
              borderBottom: "1px solid var(--pdq-line)",
            }}
          >
            {D.floors.map((f, i) => {
              const count = visibleMissions.filter((m) => m.floor === f.id).length;
              const active = floor === f.id;
              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFloor(f.id)}
                  style={{
                    appearance: "none",
                    border: 0,
                    cursor: "pointer",
                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                    color: active ? "var(--pdq-ink)" : "var(--pdq-ink-3)",
                    padding: "16px 14px",
                    textAlign: "left",
                    borderRight: i < D.floors.length - 1 ? "1px solid var(--pdq-line)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    position: "relative",
                  }}
                >
                  {active && (
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 1,
                        background: "var(--pdq-ink)",
                      }}
                    />
                  )}
                  <span
                    className="pdq-mono"
                    style={{ color: active ? "var(--pdq-ink-2)" : "var(--pdq-ink-4)" }}
                  >
                    {f.code} · {String(count).padStart(2, "0")} {t("QUESTS / MISIONES")}
                  </span>
                  <span className="pdq-display-alt" style={{ fontSize: 16 }}>
                    {f.name}
                  </span>
                  <span className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
                    {f.sub}
                  </span>
                </button>
              );
            })}
          </div>

          <FloorPlan
            floor={currentFloor}
            missions={filtered.filter((m) => m.floor === currentFloor.id)}
            onSelect={onSelect}
          />

          <div
            style={{
              padding: "12px 18px",
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid var(--pdq-line)",
              fontFamily: "var(--pdq-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "var(--pdq-ink-4)",
            }}
          >
            <span>SCALE · 1:50</span>
            <span>N ↑</span>
            <span>19.4294°N 99.1516°W</span>
          </div>
        </Brackets>

        <div>
          <div style={{ marginBottom: 16 }}>
            <div className="pdq-mono" style={{ marginBottom: 10 }}>
              {t("FILTER · TYPE / FILTRO · TIPO")}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {types.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`pdq-btn sm ${filter === t.id ? "" : "ghost"}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div className="pdq-mono" style={{ marginBottom: 10 }}>
              {t("VIEWING / VISTA")} · {currentFloor.name}
            </div>
            <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }}>
              {t(currentFloor.sub)} · {t("ZONES / ZONAS")} {currentFloor.zones.join(" · ")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 720,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {filtered.map((m) => (
              <MissionRow key={m.id} m={m} onSelect={() => onSelect(m)} />
            ))}
            {filtered.length === 0 && (
              <div
                className="pdq-mono"
                style={{ padding: 32, textAlign: "center", color: "var(--pdq-ink-4)" }}
              >
                {t("NO MATCHES ON / SIN RESULTADOS EN")} {currentFloor.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildingAxon({
  floors,
  active,
  onPick,
  missions,
}: {
  floors: Floor[];
  active: string;
  onPick: (id: string) => void;
  missions: Mission[];
}) {
  const stack = floors;
  const W = 880;
  const H = 460;
  // Isometric footprint half-extents. A unit ground square (dx,dy ∈ [-1,1])
  // projects to a diamond that is 4*sx wide and 4*sy tall on screen. We keep
  // these small so each zone's footprint stays narrow.
  const sx = 56;
  const sy = 28;
  // Vertical extrusion (building height) is now a real UPWARD offset in -y —
  // NOT a sideways shift. This is the core fix: previously the "top" face was
  // produced by advancing the level index, which pushed each box a full stride
  // to the right and forced every block to overlap its neighbour. Height and
  // row-position are now independent axes.
  const boxH = 86;
  // Distance between adjacent zone centres. The footprint spans 4*sx (≈224);
  // a stride comfortably larger than that guarantees clean separation with a
  // visible gap between the three buildings.
  const zoneStride = sx * 4 + 64; // 288
  const totalWidth = zoneStride * Math.max(0, stack.length - 1);
  const cx = W / 2 - totalWidth / 2;
  const cy = H * 0.58;

  // project: lvl = zone index (steps along the row), dx/dy = ground-plane
  // coords, h = vertical height (0 = ground, 1 = roof).
  const project = (lvl: number, dx: number, dy: number, h = 0): [number, number] => {
    const x = cx + lvl * zoneStride + (dx - dy) * sx;
    const y = cy + (dx + dy) * sy - h * boxH;
    return [x, y];
  };

  const countOn = (id: string) => missions.filter((m) => m.floor === id).length;

  return (
    <div
      style={{
        position: "relative",
        background:
          "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.04), transparent 70%)",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <defs>
          <pattern id="pdq-grid2" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
          </pattern>
          <linearGradient id="pdq-wallG" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <linearGradient id="pdq-wallGdim" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.01)" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#pdq-grid2)" />

        <ellipse
          cx={cx + (zoneStride * (stack.length - 1)) / 2}
          cy={cy + 8}
          rx={totalWidth / 2 + sx * 2 + 24}
          ry={sy * 1.1}
          fill="rgba(0,0,0,0.5)"
          opacity="0.7"
        />

        <g
          fontFamily="var(--font-body)"
          fontSize="9"
          fill="rgba(255,255,255,0.35)"
          letterSpacing="0.1em"
        >
          <text x={cx - sx - 12} y={cy + sy * 2 + 40} textAnchor="end">
            BUCARELI 118 →
          </text>
          <text x={cx + zoneStride * (stack.length - 1) + sx + 12} y={cy + sy * 2 + 40}>
            AFTER CUP ↓
          </text>
        </g>

        {stack.map((f, i) => {
          const isActive = f.id === active;
          const lvl = i;

          const p_bl = project(lvl, -1, 1, 0);
          const p_br = project(lvl, 1, 1, 0);
          const p_fr = project(lvl, 1, -1, 0);
          const p_bl_top = project(lvl, -1, 1, 1);
          const p_br_top = project(lvl, 1, 1, 1);
          const p_fr_top = project(lvl, 1, -1, 1);
          const p_fl_top = project(lvl, -1, -1, 1);

          const wallOpacity = isActive ? 1 : 0.38;
          const labelOpacity = isActive ? 1 : 0.6;

          return (
            <g key={f.id} style={{ cursor: "pointer" }} onClick={() => onPick(f.id)}>
              <polygon
                points={`${p_br[0]},${p_br[1]} ${p_fr[0]},${p_fr[1]} ${p_fr_top[0]},${p_fr_top[1]} ${p_br_top[0]},${p_br_top[1]}`}
                fill="url(#pdq-wallG)"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={isActive ? 1.2 : 0.7}
                opacity={wallOpacity}
              />
              <polygon
                points={`${p_bl[0]},${p_bl[1]} ${p_br[0]},${p_br[1]} ${p_br_top[0]},${p_br_top[1]} ${p_bl_top[0]},${p_bl_top[1]}`}
                fill="url(#pdq-wallGdim)"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={isActive ? 1.2 : 0.7}
                opacity={wallOpacity}
              />
              <polygon
                points={`${p_bl_top[0]},${p_bl_top[1]} ${p_br_top[0]},${p_br_top[1]} ${p_fr_top[0]},${p_fr_top[1]} ${p_fl_top[0]},${p_fl_top[1]}`}
                fill={isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.025)"}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={isActive ? 1.4 : 0.8}
                opacity={isActive ? 1 : 0.7}
              />

              <FrontWindows bl={p_bl} br={p_br} blTop={p_bl_top} brTop={p_br_top} active={isActive} />
              <SideWindows br={p_br} fr={p_fr} brTop={p_br_top} frTop={p_fr_top} active={isActive} />

              <g opacity={labelOpacity}>
                {/* Centred label stack ABOVE each separated block. The leader
                    line drops from the label down to the roof apex (p_fl_top,
                    the topmost screen point of the roof diamond). */}
                {(() => {
                  const blockCx = cx + lvl * zoneStride;
                  const apex = p_fl_top; // topmost roof corner
                  const labelY = cy - boxH - 96;
                  return (
                    <>
                      <line
                        x1={blockCx}
                        y1={labelY + 8}
                        x2={apex[0]}
                        y2={apex[1] - 2}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="0.6"
                      />
                      <circle cx={apex[0]} cy={apex[1] - 2} r="1.6" fill="rgba(255,255,255,0.6)" />
                      <text
                        x={blockCx}
                        y={labelY - 8}
                        textAnchor="middle"
                        fontFamily="var(--font-body)"
                        fontSize="10"
                        letterSpacing="0.12em"
                        fill={isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)"}
                      >
                        {f.code} · {f.name}
                      </text>
                      <text
                        x={blockCx}
                        y={labelY + 6}
                        textAnchor="middle"
                        fontFamily="var(--font-body)"
                        fontSize="8.5"
                        letterSpacing="0.08em"
                        fill="rgba(255,255,255,0.45)"
                      >
                        {countOn(f.id)} QUEST{countOn(f.id) === 1 ? "" : "S"}
                      </text>
                    </>
                  );
                })()}

                <FloorDots
                  bl={p_bl}
                  br={p_br}
                  isActive={isActive}
                  count={countOn(f.id)}
                />
              </g>
            </g>
          );
        })}

        <g transform={`translate(${W - 60},${40})`}>
          <circle r="18" fill="none" stroke="rgba(255,255,255,0.25)" />
          <path d="M 0 -12 L 4 4 L 0 1 L -4 4 Z" fill="rgba(255,255,255,0.75)" />
          <text
            y="-22"
            textAnchor="middle"
            fill="rgba(255,255,255,0.5)"
            fontFamily="var(--font-body)"
            fontSize="8"
          >
            N
          </text>
        </g>

        <g
          transform={`translate(${20},${30})`}
          fontFamily="var(--font-body)"
          fontSize="9"
          letterSpacing="0.12em"
          fill="rgba(255,255,255,0.55)"
        >
          <text>VENUE · AXON 1:100</text>
          <text y="14" fill="rgba(255,255,255,0.4)">
            CLICK A ZONE · OR USE TABS BELOW
          </text>
        </g>
      </svg>
    </div>
  );
}

function FrontWindows({
  bl,
  br,
  blTop,
  brTop,
  active,
}: {
  bl: [number, number];
  br: [number, number];
  blTop: [number, number];
  brTop: [number, number];
  active: boolean;
}) {
  const cols = 5;
  const lines: React.ReactElement[] = [];
  for (let i = 1; i < cols; i++) {
    const tt = i / cols;
    const x1 = bl[0] + (br[0] - bl[0]) * tt;
    const y1 = bl[1] + (br[1] - bl[1]) * tt;
    const x2 = blTop[0] + (brTop[0] - blTop[0]) * tt;
    const y2 = blTop[1] + (brTop[1] - blTop[1]) * tt;
    const yMid = (y1 + y2) / 2;
    lines.push(
      <line
        key={i}
        x1={x1}
        y1={yMid - 8}
        x2={x2}
        y2={yMid + 4}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.5"
      />,
    );
  }
  return (
    <g opacity={active ? 0.9 : 0.45}>
      <line
        x1={bl[0]}
        y1={bl[1] - 10}
        x2={br[0]}
        y2={br[1] - 10}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.5"
      />
      <line
        x1={blTop[0]}
        y1={blTop[1] + 6}
        x2={brTop[0]}
        y2={brTop[1] + 6}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.5"
      />
      {lines}
    </g>
  );
}

function SideWindows({
  br,
  fr,
  brTop,
  frTop,
  active,
}: {
  br: [number, number];
  fr: [number, number];
  brTop: [number, number];
  frTop: [number, number];
  active: boolean;
}) {
  const cols = 5;
  const lines: React.ReactElement[] = [];
  for (let i = 1; i < cols; i++) {
    const tt = i / cols;
    const x1 = br[0] + (fr[0] - br[0]) * tt;
    const y1 = br[1] + (fr[1] - br[1]) * tt;
    const x2 = brTop[0] + (frTop[0] - brTop[0]) * tt;
    const y2 = brTop[1] + (frTop[1] - brTop[1]) * tt;
    const yMid = (y1 + y2) / 2;
    lines.push(
      <line
        key={i}
        x1={x1}
        y1={yMid - 4}
        x2={x2}
        y2={yMid + 8}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.5"
      />,
    );
  }
  return (
    <g opacity={active ? 0.8 : 0.35}>
      <line
        x1={br[0]}
        y1={br[1] - 10}
        x2={fr[0]}
        y2={fr[1] - 10}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
      />
      <line
        x1={brTop[0]}
        y1={brTop[1] + 6}
        x2={frTop[0]}
        y2={frTop[1] + 6}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
      />
      {lines}
    </g>
  );
}

function FloorDots({
  bl,
  br,
  isActive,
  count,
}: {
  bl: [number, number];
  br: [number, number];
  isActive: boolean;
  count: number;
}) {
  const n = Math.max(0, Math.min(count, 6));
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const tt = (i + 1) / (n + 1);
        const x = bl[0] + (br[0] - bl[0]) * tt;
        const y = bl[1] + (br[1] - bl[1]) * tt - 12;
        return (
          <g key={i}>
            {isActive && (
              <circle cx={x} cy={y} r="2.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5">
                <animate attributeName="r" from="1" to="6" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <rect
              x={x - 2}
              y={y - 2}
              width="4"
              height="4"
              fill={isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)"}
            />
          </g>
        );
      })}
    </g>
  );
}

interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hot?: boolean;
  stairs?: boolean;
  round?: boolean;
  deck?: boolean;
}

function FloorPlan({
  floor,
  missions,
  onSelect,
}: {
  floor: Floor;
  missions: Mission[];
  onSelect: (m: Mission) => void;
}) {
  const W = 880;
  const H = 360;
  const pad = 50;
  const inner = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 };

  const ROOMS: Record<string, Room[]> = {
    matchday: [
      { id: "M1", name: "GATE · CHECK-IN", x: 0, y: 0, w: 0.24, h: 1 },
      { id: "M2", name: "SCREENS · TABLES · PICKS", x: 0.24, y: 0, w: 0.48, h: 1, round: true },
      { id: "M3", name: "TABLES", x: 0.72, y: 0, w: 0.28, h: 1 },
    ],
    night: [
      { id: "N1", name: "AFTER ENTRY", x: 0, y: 0, w: 0.22, h: 1 },
      { id: "N2", name: "STAGE · ART", x: 0.22, y: 0, w: 0.52, h: 1, deck: true },
      { id: "N3", name: "BAR", x: 0.74, y: 0, w: 0.26, h: 1 },
    ],
    areas: [
      { id: "A1", name: "FOOD COURT", x: 0, y: 0, w: 0.36, h: 1, hot: true },
      { id: "A2", name: "RESTAURANTS", x: 0.36, y: 0, w: 0.36, h: 1, round: true },
      { id: "A3", name: "BAR · PARTNERS", x: 0.72, y: 0, w: 0.28, h: 1 },
    ],
  };

  const rooms = ROOMS[floor.id] || [];

  // Group missions by zone so co-located pins stagger relative to their
  // OWN zone (not the global filtered index). Returns, per mission id, its
  // index within its zone and the zone's total count.
  const zoneIndex = useMemo(() => {
    const counts: Record<string, number> = {};
    const map: Record<string, { idx: number; total: number; zone: string }> = {};
    for (const m of missions) {
      const z = rooms.find((r) => r.id === m.zone) ? m.zone : rooms[0]?.id || m.zone;
      counts[z] = (counts[z] || 0) + 1;
    }
    const running: Record<string, number> = {};
    for (const m of missions) {
      const z = rooms.find((r) => r.id === m.zone) ? m.zone : rooms[0]?.id || m.zone;
      running[z] = running[z] || 0;
      map[m.id] = { idx: running[z], total: counts[z], zone: z };
      running[z] += 1;
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missions, floor.id]);

  // Stack pins vertically inside their room with even spacing, centred on the
  // room. Adequate vertical gap (28px) keeps the two-line labels from touching.
  const ROW_GAP = 28;
  const placeMission = (m: Mission): [number, number] | null => {
    const room = rooms.find((r) => r.id === m.zone) || rooms[0];
    if (!room) return null;
    const info = zoneIndex[m.id] || { idx: 0, total: 1 };
    const cxRoom = inner.x + room.x * inner.w + room.w * inner.w * 0.5;
    const cyRoom = inner.y + room.y * inner.h + room.h * inner.h * 0.5;
    // Centre the column of pins: offset each row from the group's midpoint.
    const ry = cyRoom + (info.idx - (info.total - 1) / 2) * ROW_GAP;
    return [cxRoom, ry];
  };

  return (
    <div style={{ background: "rgba(0,0,0,0.3)" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <defs>
          <pattern id="pdq-finegrid3" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#pdq-finegrid3)" />

        <rect
          x={inner.x}
          y={inner.y}
          width={inner.w}
          height={inner.h}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.2"
        />

        {rooms.map((r, i) => {
          const x = inner.x + r.x * inner.w;
          const y = inner.y + r.y * inner.h;
          const w = r.w * inner.w;
          const h = r.h * inner.h;
          return (
            <g key={`${r.id}-${i}`}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={r.hot ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.018)"}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.7"
              />

              {r.round && (
                <circle
                  cx={x + w / 2}
                  cy={y + h / 2}
                  r={Math.min(w, h) * 0.32}
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.7"
                />
              )}
              {r.stairs && (
                <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.6">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <line
                      key={j}
                      x1={x + 6}
                      y1={y + 12 + (j * (h - 24)) / 6}
                      x2={x + w - 6}
                      y2={y + 12 + (j * (h - 24)) / 6}
                    />
                  ))}
                </g>
              )}
              {r.deck && (
                <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.5">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <line
                      key={j}
                      x1={x + 6}
                      y1={y + 8 + (j * (h - 16)) / 7}
                      x2={x + w - 6}
                      y2={y + 8 + (j * (h - 16)) / 7}
                    />
                  ))}
                </g>
              )}
              {r.hot && (
                <g>
                  <circle
                    cx={x + w / 2}
                    cy={y + h * 0.4}
                    r={Math.min(w, h) * 0.18}
                    fill="rgba(255,255,255,0.08)"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="0.8"
                  />
                  <text
                    x={x + w / 2}
                    y={y + h * 0.4 + 4}
                    textAnchor="middle"
                    fontFamily="var(--font-body)"
                    fontSize="9"
                    fill="rgba(255,255,255,0.8)"
                    letterSpacing="0.1em"
                  >
                    FOOD
                  </text>
                </g>
              )}

              <text
                x={x + 8}
                y={y + 16}
                fontFamily="var(--font-body)"
                fontSize="9"
                fill="rgba(255,255,255,0.6)"
                letterSpacing="0.12em"
              >
                {r.id.replace(/[a-z]/g, "")} · {r.name}
              </text>
            </g>
          );
        })}

        {missions.map((m) => {
          const pos = placeMission(m);
          if (!pos) return null;
          const [px, py] = pos;
          const live = m.status === "live";
          const locked = m.status === "locked";
          // Decide which side the label sits on. Default to the right, but
          // flip to the left when a right-side label would run off the inner
          // wall (keeps long titles inside the 880-wide SVG).
          const labelOnRight = px < inner.x + inner.w - 150;
          const labelX = labelOnRight ? px + 14 : px - 14;
          const labelAnchor = labelOnRight ? "start" : "end";
          // Short title: strip the leading verb/section before the comma so
          // co-located labels stay compact (e.g. "POST, GIANT SCREEN" →
          // "GIANT SCREEN"). Falls back to the full title.
          const rawTitle =
            m.title.split(" — ")[1] ||
            m.title.split(",").slice(1).join(",").trim() ||
            m.title;
          return (
            <g
              key={m.id}
              onClick={() => onSelect(m)}
              style={{ cursor: locked ? "default" : "pointer" }}
            >
              {live && (
                <circle
                  cx={px}
                  cy={py}
                  r="14"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.8"
                >
                  <animate attributeName="r" from="6" to="22" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {m.poster ? (
                <>
                  <image
                    href={m.poster}
                    x={px - 13}
                    y={py - 17}
                    width="26"
                    height="34"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <rect
                    x={px - 13}
                    y={py - 17}
                    width="26"
                    height="34"
                    fill="none"
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth="0.8"
                  />
                </>
              ) : (
                <>
                  <rect
                    x={px - 10}
                    y={py - 10}
                    width="20"
                    height="20"
                    fill={locked ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.7)"}
                    stroke={locked ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.95)"}
                    strokeWidth="1"
                  />
                  <text
                    x={px}
                    y={py + 3.5}
                    textAnchor="middle"
                    fill={locked ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.95)"}
                    fontFamily="var(--font-body)"
                    fontSize="8"
                    fontWeight="500"
                  >
                    {locked ? "?" : m.code.split("·").pop()}
                  </text>
                </>
              )}
              <g className="pdq-pin-label">
                <text
                  x={labelX}
                  y={py - 3.5}
                  textAnchor={labelAnchor}
                  fill="rgba(255,255,255,0.7)"
                  fontFamily="var(--font-body)"
                  fontSize="8"
                  letterSpacing="0.06em"
                >
                  {locked ? "CLASSIFIED" : rawTitle}
                </text>
                <text
                  x={labelX}
                  y={py + 6.5}
                  textAnchor={labelAnchor}
                  fill="rgba(255,255,255,0.4)"
                  fontFamily="var(--font-body)"
                  fontSize="7"
                  letterSpacing="0.06em"
                >
                  +{m.xp} XP · {m.time}
                </text>
              </g>
            </g>
          );
        })}

        {floor.id === "matchday" && (
          <g transform={`translate(${inner.x + 30},${inner.y + 30})`}>
            <circle r="5" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1">
              <animate attributeName="r" from="3" to="14" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.9" to="0" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle r="3" fill="rgba(255,255,255,0.95)" />
            <text
              x="10"
              y="3"
              fill="rgba(255,255,255,0.95)"
              fontFamily="var(--font-body)"
              fontSize="8"
              letterSpacing="0.08em"
            >
              YOU · GATE
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function MissionRow({ m, onSelect }: { m: Mission; onSelect: () => void }) {
  const D = DATA;
  const typeInfo = D.missionTypes.find((t) => t.id === m.type);
  const floorInfo = D.floors.find((f) => f.id === m.floor);
  const locked = m.status === "locked";
  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "72px 1fr auto",
        alignItems: "center",
        gap: 16,
        padding: "16px 18px",
        border: "1px solid var(--pdq-line)",
        borderRadius: 4,
        background: "rgba(255,255,255,0.015)",
        cursor: locked ? "default" : "pointer",
        opacity: locked ? 0.55 : 1,
        transition: "background .15s, transform .15s",
      }}
      onMouseEnter={(ev) => {
        if (!locked) (ev.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(ev) => {
        (ev.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.015)";
      }}
    >
      {m.poster ? (
        <div
          style={{
            position: "relative",
            width: 60,
            height: 76,
            border: "1px solid var(--pdq-line-2)",
            background: "rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          <Image
            src={m.poster}
            alt={m.title}
            fill
            sizes="60px"
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            border: "1px solid var(--pdq-line-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--pdq-display-alt)",
            fontSize: 22,
            color: "var(--pdq-ink-2)",
          }}
        >
          {typeInfo?.glyph || "·"}
        </div>
      )}

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <span className="pdq-mono" style={{ fontSize: 9.5 }}>
            {m.code}
          </span>
          <span style={{ width: 2, height: 2, background: "var(--pdq-ink-4)" }} />
          <span className="pdq-mono" style={{ fontSize: 9.5, color: "var(--pdq-ink-4)" }}>
            {typeInfo?.name} · {floorInfo?.name} · ZONE {m.zone} · {m.time}
          </span>
        </div>
        <div className="pdq-display-alt" style={{ fontSize: 18, lineHeight: 1.1 }}>
          {m.title}
        </div>
      </div>

      <div
        style={{
          textAlign: "right",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        {m.status === "live" && (
          <span className="pdq-tag live">
            <span className="pdq-dot" />
            LIVE
          </span>
        )}
        {m.status === "queued" && <span className="pdq-tag">QUEUED</span>}
        {m.status === "locked" && <span className="pdq-tag locked">LOCKED</span>}
        <span className="pdq-mono" style={{ color: "var(--pdq-ink-2)" }}>
          +{m.xp} XP
        </span>
      </div>
    </div>
  );
}
