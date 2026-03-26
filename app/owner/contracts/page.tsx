import { Suspense } from "react";
import PillNav from "@/components/PillNav";
import ContractsStrategyPanel from "@/components/admin/ContractsStrategyPanel";
import { ownerNavItems } from "@/src/lib/navigation";
import OwnerContractsPanel from "@/components/admin/OwnerContractsPanel";

export default function OwnerContractsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS logo"
          items={ownerNavItems}
          activeHref="/owner/contracts"
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
        <ContractsStrategyPanel />
        <Suspense fallback={null}>
          <OwnerContractsPanel />
        </Suspense>
      </div>
    </div>
  );
}
