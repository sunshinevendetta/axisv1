import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import PillNav from "@/components/PillNav";
import ARAppCollectEpisodePage from "@/components/arapp/ARAppCollectEpisodePage";
import { arappNavItems } from "@/src/lib/navigation";
import { EPISODE_CONFIG, getEpisodeBySlug, getTokensByEpisode } from "@/src/lib/arapp-collect";
import { IS_CONTRACT_DEPLOYED } from "@/src/lib/arapp-collect-chain";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return EPISODE_CONFIG.map((ep) => ({ id: ep.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ep = getEpisodeBySlug(id);
  if (!ep) return { title: "Not Found" };
  return {
    title: `${ep.label} — SPECTRA Collect`,
    description: `All artworks from ${ep.label} of the SPECTRA episode collection. Free ERC-1155 claim, gas sponsored.`,
  };
}

export default async function CollectEpisodePage({ params }: Props) {
  const { id } = await params;
  const episode = getEpisodeBySlug(id);
  if (!episode) notFound();

  const tokens = getTokensByEpisode(id);

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

      <ARAppCollectEpisodePage
        episode={episode}
        tokens={tokens}
        isContractDeployed={IS_CONTRACT_DEPLOYED}
      />
      <Footer />
    </div>
  );
}
