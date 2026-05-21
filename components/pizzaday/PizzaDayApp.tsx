"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSiteLanguage } from "@/components/site-language";
import { Connect } from "./Connect";
import {
  clearPizzaDayAuthRecord,
  readPizzaDayAuthRecord,
  shortPizzaDayAddress,
  storePizzaDayAuthRecord,
  type PizzaDayAuthRecord,
  verifyPizzaDayAuthRecord,
} from "./auth";
import { DATA, type MedalVariant, type Mission, type Operator } from "./data";
import { BgStage, HudStrip, RegMarks, StatusPill } from "./Hud";
import { Landing } from "./Landing";
import { MissionDetail } from "./MissionDetail";
import { MissionMap } from "./MissionMap";
import { Profile } from "./Profile";
import "./pizzaday.css";

type Route = "landing" | "connect" | "map" | "profile";

type AuthState = {
  authenticated: boolean;
  address: `0x${string}` | null;
  expiresAt: number | null;
};

const MEDAL_VARIANT: MedalVariant = "chrome";

const emptyAuth: AuthState = {
  authenticated: false,
  address: null,
  expiresAt: null,
};

export default function PizzaDayApp() {
  const { language } = useSiteLanguage();
  const isDevLocal = process.env.NODE_ENV === "development";
  const [route, setRoute] = useState<Route>("landing");
  const [mission, setMission] = useState<Mission | null>(null);
  const [me, setMe] = useState<Operator>(() => structuredClone(DATA.me) as Operator);
  const [auth, setAuth] = useState<AuthState>(emptyAuth);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const stored = readPizzaDayAuthRecord();
      if (!stored) {
        if (active) {
          setAuthReady(true);
        }
        return;
      }

      const verified = await verifyPizzaDayAuthRecord(stored).catch(() => false);
      if (!active) return;

      if (verified) {
        setAuth({
          authenticated: true,
          address: stored.address,
          expiresAt: stored.expiresAt,
        });
      } else {
        clearPizzaDayAuthRecord();
        setAuth(emptyAuth);
      }

      setAuthReady(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!auth.authenticated && !isDevLocal && route !== "landing" && route !== "connect") {
      setRoute("connect");
    }
  }, [auth.authenticated, authReady, isDevLocal, route]);

  const handleAuth = (record: PizzaDayAuthRecord) => {
    storePizzaDayAuthRecord(record);
    setAuth({
      authenticated: true,
      address: record.address,
      expiresAt: record.expiresAt,
    });
  };

  const handleSignOut = () => {
    clearPizzaDayAuthRecord();
    setAuth(emptyAuth);
    setMission(null);
    setRoute("landing");
  };

  const handleComplete = (m: Mission) => {
    const newMedal = {
      id: `mx-${Date.now()}`,
      type: m.type,
      label: m.payoff.toUpperCase(),
      ep: DATA.brand.episode,
    };
    setMe((prev) => ({
      ...prev,
      xp: Math.min(prev.xp + m.xp, prev.nextReq),
      medals: [newMedal, ...prev.medals],
    }));
    setMission(null);
  };

  const screen = ({ landing: "LANDING", connect: "AUTH", map: "MAP", profile: "DOSSIER" } as const)[route];
  const securityLabel = auth.authenticated ? "AUTH OK" : isDevLocal ? "DEV OPEN" : "LOCKED";

  function goToRoute(next: Route) {
    if ((next === "map" || next === "profile") && !auth.authenticated && !isDevLocal) {
      setRoute("connect");
      return;
    }
    if (next === "connect" && auth.authenticated) {
      setRoute("map");
      return;
    }
    setRoute(next);
  }

  const navCopy =
    language === "es"
      ? {
          homeLabel: "AXIS Pizza Day inicio",
          auth: "acceso",
          map: "mapa",
          profile: "perfil",
        }
      : {
          homeLabel: "AXIS Pizza Day home",
          auth: "access",
          map: "map",
          profile: "profile",
        };

  return (
    <div className="pdq-shell density-reg" data-screen-label={`00 ${screen}`}>
      <BgStage />
      <div className="pdq-noise" />
      <RegMarks />

      <nav className="pdq-topnav" style={{ gap: 8 }}>
        <button
          type="button"
          className={route === "landing" ? "active" : ""}
          onClick={() => goToRoute("landing")}
          aria-label={navCopy.homeLabel}
          style={{ padding: 0, display: "inline-flex", alignItems: "center" }}
        >
          <span className="sr-only">AXIS Pizza Day</span>
          <span
            style={{
              position: "relative",
              display: "inline-block",
              width: 92,
              height: 24,
            }}
          >
            <Image src="/logow.png" alt="AXIS logo" fill priority sizes="92px" style={{ objectFit: "contain" }} />
          </span>
        </button>
        <span className="nav-sep" />
        <button
          type="button"
          className={route === "connect" ? "active" : ""}
          onClick={() => goToRoute("connect")}
          style={{ paddingInline: 4 }}
        >
          {navCopy.auth}
        </button>
        <button
          type="button"
          className={route === "map" ? "active" : ""}
          onClick={() => goToRoute("map")}
          style={{ paddingInline: 4 }}
        >
          {navCopy.map}
        </button>
        <button
          type="button"
          className={route === "profile" ? "active" : ""}
          onClick={() => goToRoute("profile")}
          style={{ paddingInline: 4 }}
        >
          {navCopy.profile}
        </button>
      </nav>
      <StatusPill
        authenticated={auth.authenticated}
        address={auth.address ? shortPizzaDayAddress(auth.address) : null}
        onSignOut={auth.authenticated ? handleSignOut : undefined}
      />

      <div className="pdq-content" key={route}>
        {route === "landing" && (
          <Landing onEnter={() => goToRoute(auth.authenticated || isDevLocal ? "map" : "connect")} hero="feed" />
        )}
        {route === "connect" && (
          <Connect
            onDone={() => goToRoute("map")}
            onAuthenticated={handleAuth}
            onSignOut={handleSignOut}
            authenticatedAddress={auth.address}
          />
        )}
        {route === "map" && (
          <MissionMap
            me={me}
            onSelect={(m) => setMission(m)}
            onProfile={() => goToRoute("profile")}
          />
        )}
        {route === "profile" && (
          <Profile
            me={me}
            medalVariant={MEDAL_VARIANT}
            onBack={() => goToRoute("landing")}
            onMapBack={() => goToRoute("map")}
          />
        )}
      </div>

      {mission && (
        <MissionDetail
          mission={mission}
          medalVariant={MEDAL_VARIANT}
          onClose={() => setMission(null)}
          onComplete={handleComplete}
        />
      )}

      <HudStrip screen={screen} security={securityLabel} />
      {!authReady ? (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 250,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(4px)",
          }}
        />
      ) : null}
    </div>
  );
}
