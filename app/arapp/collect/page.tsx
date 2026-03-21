import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PillNav from "@/components/PillNav";
import ARAppCollectMarketplace from "@/components/arapp/ARAppCollectMarketplace";
import { arappNavItems } from "@/src/lib/navigation";

export const metadata: Metadata = {
  title: "SPECTRA Collect",
  description: "Episode-based artwork claim rooms for SPECTRA. Open an episode to see the artworks configured for collection.",
};

export default function CollectPage() {
  return (
    <div className="min-h-screen bg-[#040406] text-white">
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="spectra logo"
          items={arappNavItems}
          activeHref="/arapp/collect"
          className="custom-nav"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
          initialLoadAnimation={false}
        />
      </div>

      <ARAppCollectMarketplace />
      <Footer />
    </div>
  );
}
