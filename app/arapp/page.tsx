import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PillNav from "@/components/PillNav";
import ARAppMarketplace from "@/components/arapp/ARAppMarketplace";
import { arappNavItems } from "@/src/lib/navigation";

export const metadata: Metadata = {
  title: "AXIS AR",
  description: "Marketplace-style AR drop collection experience for the next AXIS episode.",
};

export default function ARAppPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS logo"
          items={arappNavItems}
          activeHref="/arapp"
          className="custom-nav"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
          initialLoadAnimation={false}
        />
      </div>

      <ARAppMarketplace />
      <Footer />
    </div>
  );
}
