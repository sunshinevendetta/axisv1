import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import PillNav from "@/components/PillNav";
import ARAppCollectProductPage from "@/components/arapp/ARAppCollectProductPage";
import { arappNavItems } from "@/src/lib/navigation";
import {
  getEpisodeBySlug,
  getARAppCollectTokenByTokenId,
  toARAppCollectDrop,
} from "@/src/lib/arapp-collect";
import { IS_CONTRACT_DEPLOYED } from "@/src/lib/arapp-collect-chain";
import { getAxisNodeByRoute, getAxisNodesByType } from "@/src/lib/graph";

type Props = { params: Promise<{ id: string; tokenId: string }> };

export async function generateStaticParams() {
  return getAxisNodesByType("drop")
    .map((node) => node.surfaces?.canonical)
    .filter((route): route is string => Boolean(route))
    .map((route) => {
      const [, , , id, tokenId] = route.split("/");
      return { id, tokenId };
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, tokenId } = await params;
  const node = getAxisNodeByRoute(`/arapp/collect/${id}/${tokenId}`);
  if (!node || node.type !== "drop") return { title: "Not Found" };
  return {
    title: `${node.title} — AXIS Collect`,
    description: node.summary,
  };
}

export default async function CollectTokenPage({ params }: Props) {
  const { id, tokenId: tokenIdStr } = await params;
  const node = getAxisNodeByRoute(`/arapp/collect/${id}/${tokenIdStr}`);
  if (!node || node.type !== "drop") notFound();

  const episode = getEpisodeBySlug(id);
  const tokenId = Number(tokenIdStr);

  if (!episode || isNaN(tokenId) || !episode.tokenIds.includes(tokenId)) notFound();

  const localToken = getARAppCollectTokenByTokenId(tokenId);
  if (!localToken) notFound();

  const drop = toARAppCollectDrop(localToken);

  return (
    <div className="min-h-screen bg-[#040406] text-white">
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS logo"
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

      <ARAppCollectProductPage
        drop={drop}
        episode={episode}
        isContractDeployed={IS_CONTRACT_DEPLOYED}
      />
      <Footer />
    </div>
  );
}
