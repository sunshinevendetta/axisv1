import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import PillNav from "@/components/PillNav";
import ARAppCollectProductPage from "@/components/arapp/ARAppCollectProductPage";
import { arappNavItems } from "@/src/lib/navigation";
import {
  EPISODE_CONFIG,
  getEpisodeBySlug,
  getARAppCollectTokenByTokenId,
  toARAppCollectDrop,
} from "@/src/lib/arapp-collect";
import { fetchTokenData, IS_CONTRACT_DEPLOYED } from "@/src/lib/arapp-collect-chain";

type Props = { params: Promise<{ id: string; tokenId: string }> };

export async function generateStaticParams() {
  return EPISODE_CONFIG.flatMap((ep) =>
    ep.tokenIds.map((tokenId) => ({ id: ep.slug, tokenId: tokenId.toString() })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tokenId } = await params;
  const token = getARAppCollectTokenByTokenId(Number(tokenId));
  if (!token) return { title: "Not Found" };
  return {
    title: `${token.metadata.name} — SPECTRA Collect`,
    description: token.metadata.description,
  };
}

export default async function CollectTokenPage({ params }: Props) {
  const { id, tokenId: tokenIdStr } = await params;
  const episode = getEpisodeBySlug(id);
  const tokenId = Number(tokenIdStr);

  if (!episode || isNaN(tokenId) || !episode.tokenIds.includes(tokenId)) notFound();

  const localToken = getARAppCollectTokenByTokenId(tokenId);
  if (!localToken) notFound();

  // Merge onchain metadata over local config
  const { metadata: onchainMetadata, supply: onchainSupply } = await fetchTokenData(tokenId);

  const drop = toARAppCollectDrop({
    ...localToken,
    metadata: onchainMetadata
      ? {
          ...localToken.metadata,
          ...onchainMetadata,
          attributes: onchainMetadata.attributes ?? localToken.metadata.attributes,
          properties: {
            ...(localToken.metadata.properties ?? {}),
            ...(onchainMetadata.properties ?? {}),
          },
        }
      : localToken.metadata,
    // Onchain supply wins for remaining count
    remaining: onchainSupply ?? localToken.remaining,
  });

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

      <ARAppCollectProductPage
        drop={drop}
        episode={episode}
        isContractDeployed={IS_CONTRACT_DEPLOYED}
      />
      <Footer />
    </div>
  );
}
