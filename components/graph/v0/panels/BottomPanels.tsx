"use client";

import { useState } from "react";
import Module from "../modules/Module";
import PanelAnalytics from "./PanelAnalytics";
import PanelDemo from "./PanelDemo";
import PanelEvents from "./PanelEvents";
import PanelMatrix from "./PanelMatrix";
import PanelSound from "./PanelSound";

type TabKey = "analytics" | "demo" | "matrix" | "sound" | "events";

const BOTTOM_TABS: { key: TabKey; label: string; color: string }[] = [
  { key: "analytics", label: "Listener Analytics", color: "#14B050" },
  { key: "demo", label: "Audience Demo", color: "#7C3AFF" },
  { key: "matrix", label: "Co-occurrence", color: "#1878F0" },
  { key: "sound", label: "Sound Intel", color: "#E06030" },
  { key: "events", label: "Live Events", color: "#1878F0" },
];

export default function BottomPanels() {
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const toggleTab = (key: TabKey) => setActiveTab((prev) => (prev === key ? null : key));

  const renderPanel = () => {
    if (!activeTab) return null;
    const tab = BOTTOM_TABS.find((t) => t.key === activeTab);
    if (!tab) return null;
    const content = (() => {
      switch (activeTab) {
        case "analytics": return <PanelAnalytics />;
        case "demo": return <PanelDemo />;
        case "matrix": return <PanelMatrix />;
        case "sound": return <PanelSound />;
        case "events": return <PanelEvents />;
        default: return null;
      }
    })();
    const expandedView = activeTab === "matrix" ? <PanelMatrix mode="full" /> : undefined;
    return (
      <Module id={`bottom-${activeTab}`} title={tab.label} bare expandedView={expandedView}>
        {content}
      </Module>
    );
  };

  return (
    <>
      <div className="bottom-tabs">
        {BOTTOM_TABS.map((t) => (
          <div key={t.key} className={`bottom-tab${activeTab === t.key ? " active" : ""}`}
            style={{ borderTopColor: activeTab === t.key ? t.color : "transparent" }}
            onClick={() => toggleTab(t.key)}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
              background: activeTab === t.key ? t.color : "var(--b2)",
              boxShadow: activeTab === t.key ? `0 0 6px ${t.color}` : undefined,
              transition: "background .15s,box-shadow .15s",
            }}></div>
            {t.label}
            <span style={{ fontFamily: "var(--fm)", fontSize: 8, color: activeTab === t.key ? t.color : "var(--t4)", marginLeft: 2 }}>
              {activeTab === t.key ? "▲" : "▼"}
            </span>
          </div>
        ))}
        <div style={{ flex: 1 }}></div>
        <div style={{ display: "flex", alignItems: "center", padding: "0 12px", borderLeft: "1px solid var(--b1)" }}>
          <span style={{ fontFamily: "var(--fu)", fontSize: 8, color: "var(--t4)", letterSpacing: ".1em" }}>
            {activeTab ? "CLICK TAB TO COLLAPSE" : "CLICK TAB TO EXPAND"}
          </span>
        </div>
      </div>
      {activeTab && (
        <div className="bottom-panel-wrap">
          {renderPanel()}
        </div>
      )}
    </>
  );
}
