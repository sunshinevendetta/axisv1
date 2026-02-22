// components/EpisodesCards.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ChromaGrid from "./ChromaGrid";

type EpisodeStatus = "open" | "locked";

export type Episode = {
  id: number;
  title: string;
  subtitle: string;
  status: EpisodeStatus;
  year: number;
  image: string;
  handle?: string;
  lumaEvent?: string;
};

export type EpisodesCardsProps = {
  episodes?: Episode[];
  initialOpenId?: number | null;
  onClose?: () => void;
};

export default function EpisodesCards(props: EpisodesCardsProps) {
  const { episodes: episodesProp, initialOpenId = null, onClose } = props;

  const [openId, setOpenId] = useState<number | null>(initialOpenId);

  useEffect(() => {
    setOpenId(initialOpenId);
  }, [initialOpenId]);

  // load lu.ma checkout script once
  useEffect(() => {
    const existing = document.getElementById("luma-checkout-script");
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://embed.lu.ma/checkout-button.js";
      script.id = "luma-checkout-script";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const episodes: Episode[] = useMemo(() => {
    if (episodesProp && episodesProp.length > 0) return episodesProp;

    return [
      {
        id: 1,
        title: "episode 1",
        subtitle: "12/20/2025",
        status: "open",
        handle: "@spectrartxyz",
        year: 2025,
        image: "/ep1.jpg",
        lumaEvent: "evt-4HMKwOyFAW4iKry",
      },
      {
        id: 2,
        title: "episode 2",
        subtitle: "12/27/2025",
        status: "open",
        handle: "@spectrartxyz",
        year: 2025,
        image: "/ep1-5.jpg",
        lumaEvent: "evt-GRVDgVCIyMjwukd",
      },
      {
        id: 3,
        title: "episode 3",
        subtitle: "28/02/2026",
       status: "open",
        handle: "@spectrartxyz",
        year: 2025,
        image: "/ep3.png",
        lumaEvent: "evt-TsVfVtfEqlaLcIe",
      },
      {
        id: 4,
        title: "episode 3",
        subtitle: "02/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 5,
        title: "episode 4",
        subtitle: "03/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 6,
        title: "episode 5",
        subtitle: "04/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 7,
        title: "episode 6",
        subtitle: "05/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 8,
        title: "episode 7",
        subtitle: "06/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 9,
        title: "episode 8",
        subtitle: "07/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 10,
        title: "episode 9",
        subtitle: "08/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 11,
        title: "episode 10",
        subtitle: "09/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 12,
        title: "episode 11",
        subtitle: "10/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 13,
        title: "episode 12",
        subtitle: "11/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 14,
        title: "episode 13",
        subtitle: "12/2026",
        status: "locked",
        year: 2026,
        image: "/soon.jpg",
      },
      {
        id: 15,
        title: "episode 14",
        subtitle: "01/2027",
        status: "locked",
        year: 2027,
        image: "/soon.jpg",
      },
    ];
  }, [episodesProp]);

  const chromaItems = episodes.map((ep) => ({
    image: ep.image,
    title: ep.title,
    subtitle: ep.subtitle,
    handle: ep.status === "locked" ? "locked" : "",
    borderColor: ep.status === "open" ? "#ffffff" : "#333333",
    gradient:
      ep.status === "open"
        ? "linear-gradient(145deg, #ffffff, #000000)"
        : "linear-gradient(145deg, #444444, #000000)",
    url: "",
    episodeId: ep.id,
  }));

  const handleCardClick = (index: number) => {
    const ep = episodes[index];
    if (ep.status !== "locked") setOpenId(ep.id);
  };

  if (openId !== null) {
    const ep = episodes.find((e) => e.id === openId);
    if (!ep) return null;

    const hasLumaButton = Boolean(ep.lumaEvent);

    return (
      <div className="w-full flex flex-col items-center justify-center pt-10 pb-20 px-4 text-white">
        <Image
          src={ep.image}
          alt={ep.title}
          width={350}
          height={350}
          className={ep.status === "locked" ? "opacity-40" : "opacity-100"}
        />

        <h2 className="text-3xl mt-6">{ep.title}</h2>
        <p className="text-sm opacity-70">{ep.subtitle}</p>

        {hasLumaButton && (
          <div className="mt-8">
            <a
              href={`https://luma.com/event/${ep.lumaEvent}`}
              target="_blank"
              rel="noopener noreferrer"
              className="luma-checkout--button px-6 py-2 border border-white text-white text-sm inline-block"
              data-luma-action="checkout"
              data-luma-event-id={ep.lumaEvent}
            >
              register for event
            </a>
          </div>
        )}

        {!hasLumaButton && (
          <p className="max-w-xl text-center mt-6 opacity-80 text-sm">
            scheduled for {ep.subtitle}, details unlock soon.
          </p>
        )}

        <button
          onClick={() => {
            setOpenId(null);
            if (onClose) onClose();
          }}
          className="mt-10 px-6 py-2 border border-white text-white text-sm"
        >
          go back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mt-20 px-6 overflow-x-hidden">
      <ChromaGrid
        items={chromaItems}
        radius={200}
        damping={0.45}
        fadeOut={0.6}
        ease="power3.out"
        rows={2}
        columns={3}
        className="max-w-[1000px] mx-auto"
        onItemClick={handleCardClick}
      />
    </div>
  );
}
