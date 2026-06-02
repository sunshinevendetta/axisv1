"use client";

import { useEffect, useMemo, useRef } from "react";
import type { CircleMarker as CircleMarkerType, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  GB: [54, -2], DE: [51, 10], NL: [52, 5], FR: [46, 2], BE: [50, 4], PL: [52, 20],
  CZ: [50, 15], AT: [47, 14], CH: [47, 8], ES: [40, -4], IT: [43, 12], PT: [39, -8],
  DK: [56, 10], SE: [62, 15], NO: [65, 13], FI: [64, 26], HU: [47, 19], RO: [46, 25],
  HR: [45, 16], RS: [44, 21], GR: [39, 22],
  US: [38, -97], CA: [56, -106], MX: [24, -102], BR: [-15, -51], AR: [-35, -65],
  JP: [37, 138], AU: [-27, 134],
};

const COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom", DE: "Germany", NL: "Netherlands", FR: "France", BE: "Belgium",
  PL: "Poland", CZ: "Czechia", AT: "Austria", CH: "Switzerland", ES: "Spain", IT: "Italy",
  PT: "Portugal", DK: "Denmark", SE: "Sweden", NO: "Norway", FI: "Finland", HU: "Hungary",
  RO: "Romania", HR: "Croatia", RS: "Serbia", GR: "Greece",
  US: "United States", CA: "Canada", MX: "Mexico", BR: "Brazil", AR: "Argentina",
  JP: "Japan", AU: "Australia",
};

interface CityPlay {
  city: string;
  pct: number;
}

interface Props {
  countryPlays: Record<string, number>;
  height?: number;
  mode?: "compact" | "full";
  cityPlay?: CityPlay[];
}

export default function WorldMap({ countryPlays, height = 180, mode = "compact", cityPlay }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<CircleMarkerType[]>([]);

  const entries = useMemo(
    () => Object.entries(countryPlays).filter(([code]) => COUNTRY_CENTROIDS[code]),
    [countryPlays],
  );

  const sortedCountries = useMemo(
    () => [...entries].sort((a, b) => b[1] - a[1]),
    [entries],
  );

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [25, 10],
        zoom: 1,
        minZoom: 1,
        maxZoom: 6,
        zoomControl: true,
        attributionControl: true,
        worldCopyJump: true,
        preferCanvas: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      for (const [code, intensity] of entries) {
        const [lat, lon] = COUNTRY_CENTROIDS[code];
        const radius = 4 + intensity * 10;
        const opacity = 0.35 + intensity * 0.5;
        const marker = L.circleMarker([lat, lon], {
          radius,
          color: "#1878F0",
          weight: 1.2,
          fillColor: "#1878F0",
          fillOpacity: opacity,
        }).addTo(map);
        marker.bindTooltip(`${code} · ${Math.round(intensity * 100)}%`, {
          direction: "top",
          offset: [0, -radius],
          className: "axis-graph-v0-tt",
        });
        markersRef.current.push(marker);
      }

      cleanup = () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapRef.current = null;
      };
    })();
    return () => { cancelled = true; cleanup?.(); };
  }, [entries]);

  if (mode === "full") {
    return (
      <div className="worldmap-full">
        <div className="worldmap-full-map">
          <div
            ref={containerRef}
            style={{ width: "100%", height: "100%", background: "#07090D" }}
          />
        </div>
        <aside className="worldmap-full-side">
          <div className="worldmap-side-section">
            <div className="worldmap-side-hd">COUNTRIES · BY INTENSITY</div>
            <div className="worldmap-side-list">
              {sortedCountries.map(([code, val]) => (
                <div key={code} className="worldmap-country-row">
                  <span className="worldmap-country-code">{code}</span>
                  <span className="worldmap-country-name">{COUNTRY_NAMES[code] ?? code}</span>
                  <div className="worldmap-country-bar">
                    <div className="worldmap-country-fill" style={{ width: `${Math.round(val * 100)}%` }} />
                  </div>
                  <span className="worldmap-country-pct">{Math.round(val * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          {cityPlay && cityPlay.length > 0 && (
            <div className="worldmap-side-section">
              <div className="worldmap-side-hd">TOP CITIES</div>
              <div className="worldmap-side-list">
                {cityPlay.map((c) => (
                  <div key={c.city} className="worldmap-city-row">
                    <span className="worldmap-city-name">{c.city}</span>
                    <div className="worldmap-city-bar">
                      <div className="worldmap-city-fill" style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="worldmap-city-pct">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    );
  }

  return (
    <div ref={containerRef}
      style={{ width: "100%", height, background: "#07090D", borderRadius: 2, overflow: "hidden" }} />
  );
}
