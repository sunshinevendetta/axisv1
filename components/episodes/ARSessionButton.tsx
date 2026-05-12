"use client";

import { useEffect, useState } from "react";
import { episodeXRStore } from "@/components/episodes/EpisodeCanvas";
import { checkARSupport } from "@/src/lib/ar/xrSupport";

type Props = {
  onSessionChange: (active: boolean) => void;
};

export function ARSessionButton({ onSessionChange }: Props) {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    checkARSupport().then(setSupported);

    const unsubscribe = episodeXRStore.subscribe((state) => {
      const nextActive = state.session != null;
      setActive(nextActive);
      onSessionChange(nextActive);
    });

    return unsubscribe;
  }, [onSessionChange]);

  if (!supported) return null;

  async function handleClick() {
    try {
      if (active) {
        await episodeXRStore.getState().session?.end();
        return;
      }

      await episodeXRStore.enterAR();
      onSessionChange(true);
    } catch (error) {
      console.error("Failed to toggle AR session:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute bottom-4 right-4 z-10 border border-white/18 bg-black/45 px-4 py-2 text-[10px] uppercase tracking-[0.26em] text-white/82 backdrop-blur-sm transition-colors hover:bg-white/14"
      aria-label={active ? "Exit AR session" : "Enter AR session"}
    >
      {active ? "Exit AR" : "Enter XR"}
    </button>
  );
}
