"use client";

import type { ArtistWorldProfile } from "@/src/content/world-expansion";

type Props = {
  artist: ArtistWorldProfile;
  onClose: () => void;
};

function LinkRow({ label, href }: { label: string; href?: string }) {
  if (!href) {
    return <span className="text-sm leading-6 text-white/68">{label}</span>;
  }

  return (
    <a
      href={href}
      className="text-sm leading-6 text-white/68 underline decoration-white/18 underline-offset-4 transition-colors hover:text-white"
    >
      {label}
    </a>
  );
}

export default function ArtistWorldPanel({ artist, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-end bg-black/72 backdrop-blur-md sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close artist panel"
        onClick={onClose}
        className="absolute inset-0"
      />

      <aside className="relative z-10 h-[88vh] w-full overflow-y-auto border-l border-white/10 bg-[linear-gradient(180deg,rgba(9,9,11,0.98),rgba(5,5,7,0.98))] px-6 py-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:h-auto sm:max-h-[88vh] sm:max-w-2xl sm:px-8 sm:py-8">
        <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.34em] text-white/38">World Expansion</div>
            <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.4rem,3vw,2.4rem)] leading-[0.92] tracking-[-0.05em] text-white">
              {artist.name}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">{artist.summary}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-white/12 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-white/54 transition-colors hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-8 space-y-8">
          <section className="border border-[#75ffbf]/14 bg-[#75ffbf]/[0.03] p-5">
            <div className="text-[10px] uppercase tracking-[0.32em] text-[#75ffbf]/72">Artist</div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="[font-family:var(--font-display)] text-2xl leading-none tracking-[-0.04em] text-white/90">{artist.gridIndex}</span>
              <span className="text-[10px] uppercase tracking-[0.24em] text-white/34">Index</span>
            </div>
            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/34">Episodes</div>
              <div className="mt-2 flex flex-col gap-2">
                {artist.linkedEpisodes.map((entry) => (
                  <LinkRow key={entry.label} label={entry.label} href={entry.href} />
                ))}
              </div>
            </div>
            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/34">Works & Mentions</div>
              <div className="mt-2 flex flex-col gap-2">
                {artist.linkedArtifacts.map((entry) => (
                  <LinkRow key={entry.label} label={entry.label} href={entry.href} />
                ))}
              </div>
            </div>
          </section>

          {artist.spaces.length > 0 && (
            <section className="border border-[#9fd4ff]/14 bg-[#9fd4ff]/[0.03] p-5">
              <div className="text-[10px] uppercase tracking-[0.32em] text-[#9fd4ff]/72">Spaces</div>
              <div className="mt-4 space-y-3">
                {artist.spaces.map((space) => (
                  <div key={`${space.name}-${space.episode}`} className="border border-white/8 px-4 py-3">
                    <div className="text-sm text-white/78">{space.name}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/30">{space.episode}</div>
                    <div className="mt-2 text-sm leading-6 text-white/54">{space.note}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {artist.signals.length > 0 && (
            <section className="border border-[#ffe29f]/14 bg-[#ffe29f]/[0.03] p-5">
              <div className="text-[10px] uppercase tracking-[0.32em] text-[#ffe29f]/72">Activity</div>
              <div className="mt-4 space-y-3">
                {artist.signals.map((signal) => (
                  <div key={`${signal.timestamp}-${signal.text}`} className="border border-white/8 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/30">{signal.timestamp}</div>
                    <div className="mt-2 text-sm leading-6 text-white/68">{signal.text}</div>
                    {signal.link ? (
                      <div className="mt-2">
                        <LinkRow label={signal.link.label} href={signal.link.href} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
