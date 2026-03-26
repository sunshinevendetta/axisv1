import PillNav from "@/components/PillNav";
import { ownerNavItems } from "@/src/lib/navigation";
import EpisodesAdminPanel from "@/components/admin/EpisodesAdminPanel";

export default function OwnerEpisodesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS logo"
          items={ownerNavItems}
          activeHref="/owner/episodes"
          className="custom-nav"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
          initialLoadAnimation={false}
        />
      </div>

      <div className="pt-20 sm:pt-24">
        <EpisodesAdminPanel />
      </div>
    </div>
  );
}
