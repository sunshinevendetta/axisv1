import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import PillNav from "@/components/PillNav";
import ARAppProductPage from "@/components/arapp/ARAppProductPage";
import ARAppStoreEpisodePage from "@/components/arapp/ARAppStoreEpisodePage";
import { arappNavItems } from "@/src/lib/navigation";
import {
  STORE_EPISODE_CONFIG,
  getStoreEpisodeBySlug,
  getDropsByEpisode,
  getARAppDropById,
} from "@/src/lib/arapp-catalog";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  // Episode slugs + individual product slugs both resolve here
  const episodeParams = STORE_EPISODE_CONFIG.map((e) => ({ id: e.slug }));
  return episodeParams;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const episode = getStoreEpisodeBySlug(id);
  if (episode) {
    return {
      title: `${episode.label} — AXIS Store`,
      description: `All products from ${episode.label} of the AXIS episode collection.`,
    };
  }

  const drop = getARAppDropById(id);
  if (drop) {
    return {
      title: `${drop.title} — AXIS Store`,
      description: drop.subtitle,
    };
  }

  return { title: "Not Found" };
}

export default async function ProductsPage({ params }: Props) {
  const { id } = await params;

  // Episode grid
  const episode = getStoreEpisodeBySlug(id);
  if (episode) {
    const drops = getDropsByEpisode(episode.number);
    return (
      <div className="min-h-screen bg-[#040406] text-white">
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
        <ARAppStoreEpisodePage episode={episode} drops={drops} />
        <Footer />
      </div>
    );
  }

  // Individual product (direct link)
  const drop = getARAppDropById(id);
  if (!drop) notFound();

  return (
    <div className="min-h-screen bg-[#040406] text-white">
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
      <ARAppProductPage drop={drop} />
      <Footer />
    </div>
  );
}
