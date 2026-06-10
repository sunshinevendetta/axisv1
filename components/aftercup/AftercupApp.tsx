"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSiteLanguage } from "@/components/site-language";
import { Connect } from "./Connect";
import {
  clearAftercupAuthRecord,
  readAftercupAuthRecord,
  storeAftercupAuthRecord,
  type AftercupAuthRecord,
  verifyAftercupAuthRecord,
} from "./auth";
import { DATA, type MedalVariant, type Mission, type Operator } from "./data";
import { BgStage } from "./Hud";
import { Landing } from "./Landing";
import { MissionDetail } from "./MissionDetail";
import { MissionMap } from "./MissionMap";
import { Profile } from "./Profile";
import "./aftercup.css";

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

export default function AftercupApp() {
  const { language } = useSiteLanguage();
  const isDevLocal = process.env.NODE_ENV === "development";
  const navRef = useRef<HTMLDivElement>(null);
  const [route, setRoute] = useState<Route>("landing");
  const [mission, setMission] = useState<Mission | null>(null);
  const [me, setMe] = useState<Operator>(() => structuredClone(DATA.me) as Operator);
  const [auth, setAuth] = useState<AuthState>(emptyAuth);
  const [authReady, setAuthReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [clockReady, setClockReady] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setClockReady(true);
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const stored = readAftercupAuthRecord();
      if (!stored) {
        if (active) {
          setAuthReady(true);
        }
        return;
      }

      const verified = await verifyAftercupAuthRecord(stored).catch(() => false);
      if (!active) return;

      if (verified) {
        setAuth({
          authenticated: true,
          address: stored.address,
          expiresAt: stored.expiresAt,
        });
      } else {
        clearAftercupAuthRecord();
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

  // As soon as the user authenticates while sitting on the connect screen,
  // jump them to the map. No extra click required.
  useEffect(() => {
    if (auth.authenticated && route === "connect") {
      setRoute("map");
    }
  }, [auth.authenticated, route]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleScroll = () => setMenuOpen(false);

    document.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [menuOpen]);

  const handleAuth = (record: AftercupAuthRecord) => {
    storeAftercupAuthRecord(record);
    setAuth({
      authenticated: true,
      address: record.address,
      expiresAt: record.expiresAt,
    });
  };

  const handleSignOut = () => {
    clearAftercupAuthRecord();
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
      poster: m.poster,
    };
    setMe((prev) => ({
      ...prev,
      xp: Math.min(prev.xp + m.xp, prev.nextReq),
      medals: [newMedal, ...prev.medals],
    }));
    setMission(null);
  };

  const cdmxTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

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
          homeLabel: "AXIS Aftercup",
          auth: "acceso",
          map: "mapa",
          profile: "perfil",
          authStatus: auth.authenticated ? "CHECK-IN OK" : "CHECK-IN",
          time: "HORA CDMX",
        }
      : {
          homeLabel: "AXIS Aftercup",
          auth: "access",
          map: "map",
          profile: "profile",
          authStatus: auth.authenticated ? "CHECK-IN OK" : "CHECK-IN",
          time: "CDMX TIME",
        };

  return (
    <div className="pdq-shell density-reg">
      <BgStage />
      <div className="pdq-noise" />

      <div
        style={{
          position: "fixed",
          top: 24,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div ref={navRef} style={{ position: "relative", width: "max-content", pointerEvents: "auto" }}>
          <nav className="pdq-topnav" style={{ position: "static", left: "auto", transform: "none", gap: 8 }}>
            <button
              type="button"
              className="pdq-logo-toggle"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((current) => !current)}
              style={{
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                background: "transparent",
                border: 0,
              }}
            >
              <span className="sr-only">{navCopy.homeLabel}</span>
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: 108,
                  height: 28,
                }}
              >
                <Image src="/logo.svg" alt="AXIS logo" fill priority sizes="108px" style={{ objectFit: "contain" }} />
              </span>
            </button>
          </nav>

          <div
            className={`pdq-menu-panel ${menuOpen ? "open" : ""}`}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              left: "50%",
              width: 296,
              transform: menuOpen ? "translate(-50%, 0)" : "translate(-50%, -6px)",
              pointerEvents: menuOpen ? "auto" : "none",
              opacity: menuOpen ? 1 : 0,
              transition: "opacity 180ms ease, transform 180ms ease",
            }}
          >
            <div
              className="pdq-menu-inner"
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(10,10,10,0.96)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                backdropFilter: "blur(18px)",
                padding: 12,
              }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <button
                  type="button"
                  className={route === "connect" ? "active" : ""}
                  onClick={() => {
                    setMenuOpen(false);
                    goToRoute("connect");
                  }}
                >
                  {navCopy.auth}
                </button>
                <button
                  type="button"
                  className={route === "map" ? "active" : ""}
                  onClick={() => {
                    setMenuOpen(false);
                    goToRoute("map");
                  }}
                >
                  {navCopy.map}
                </button>
                <button
                  type="button"
                  className={route === "profile" ? "active" : ""}
                  onClick={() => {
                    setMenuOpen(false);
                    goToRoute("profile");
                  }}
                >
                  {navCopy.profile}
                </button>
              </div>
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    goToRoute("connect");
                  }}
                  style={{
                    appearance: "none",
                    border: 0,
                    background: "transparent",
                    color: "inherit",
                    font: "inherit",
                    letterSpacing: "inherit",
                    textTransform: "inherit",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  {navCopy.authStatus}
                </button>
              <div className="pdq-mono-tight" style={{ color: "var(--pdq-ink-4)" }} suppressHydrationWarning>
                {navCopy.time} {clockReady ? cdmxTime : "--:--:--"}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

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
