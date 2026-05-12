import type { CSSProperties, ReactNode } from "react";
import Footer from "@/components/Footer";
import GlobalTicker from "@/components/GlobalTicker";
import PillNav from "@/components/PillNav";
import { magazineNavItems } from "@/src/lib/navigation";

const NAV_H = 56;
const TICK_H = 32;

type Props = {
  children: ReactNode;
};

export const MAGAZINE_NAV_HEIGHT = NAV_H;
export const MAGAZINE_TICKER_HEIGHT = TICK_H;
export const MAGAZINE_TOP_OFFSET = NAV_H + TICK_H;

export default function MagazinePageChrome({ children }: Props) {
  return (
    <div
      className="min-h-screen overflow-x-hidden bg-black text-white"
      style={{ "--ticker-top": `${NAV_H}px` } as CSSProperties}
    >
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS logo"
          items={magazineNavItems}
          activeHref="/magazine"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
        />
      </div>

      <main
        className="relative z-10"
        style={{ paddingTop: NAV_H, paddingBottom: TICK_H + 8 }}
      >
        {children}
      </main>

      <Footer />
      <GlobalTicker />
    </div>
  );
}
