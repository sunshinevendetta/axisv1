"use client";

import { LogoLoop } from "../LogoLoop";

const sponsorLogos = [
  { src: "https://api.grove.storage/87cfd143a85ed9f5e9a88a854a49ebf2f3ccd36d6378c287b9274fd4fdb11883", alt: "Absinth", title: "Absinth", href: "http://www.absinth.com.mx/" },
  { src: "https://api.grove.storage/80642034bcbefe5284b4bf65da2f37ca62fad6a5f85e7b6bfe152b33ab428bbd", alt: "Amaras", title: "Amaras", href: "https://mezcalamaras.com/" },
  { src: "https://api.grove.storage/580b0f0cb67de3f66ce36319b025ffaea686bbaf5893fdb46438772acc59a22d", alt: "Base", title: "Base", href: "https://base.org/" },
  { src: "https://api.grove.storage/69408e171ba87743345546aacf7c72f2f1698f7a7cdb888b6577ad8da844a999", alt: "Color", title: "Color", href: "https://color.fun/" },
  { src: "https://api.grove.storage/20d7a9b158bc6f5e4587d3071ed8d3a4cc610dd06e09374270fa1ad2fe53bef2", alt: "IRL", title: "IRL", href: "https://irl.energy/" },
  { src: "https://api.grove.storage/8bfe2dbc6ee597bd0db2fd8c6b7aa29c11e3dac883f80ab3bc5e1ae85571efb6", alt: "Las Flores", title: "Las Flores", href: "https://lasflores.mx/" },
  { src: "https://api.grove.storage/043fbdafc66f184818c6119520ba28a62195da8cce5c56e08a1925072f4bb68c", alt: "Nous Amigos", title: "Nous Amigos", href: "https://linktr.ee/nounsamigos" },
  { src: "https://api.grove.storage/efa42f39adb96f51df0faa315fda60b7c9b177e31659184c797de88fa31a5b0b", alt: "pump.fun", title: "pump.fun", href: "https://pump.fun/" },
  { src: "https://api.grove.storage/9c5b86b93ee7626ff44ff6f145a1f06787bda2d18ef4138aa9f0d8e476de8600", alt: "Refraction", title: "Refraction", href: "https://www.refractionfestival.com/" },
  { src: "https://api.grove.storage/df634e20ba7d25fac1280ba10e682cc2d1d80197c9112a19983ad9f78b1f7599", alt: "Retake", title: "Retake", href: "https://retake.tv/" },
  { src: "https://api.grove.storage/88a02f30bb36ad1398c9299c26b78c74da3f6492d3e4c62316947fa058032c17", alt: "Studio Berlin", title: "Studio Berlin", href: "https://www.studioberlin.club/" },
  { src: "https://api.grove.storage/489cc7988c5dc638c5d2ded94943a276e381c2ddefaf8442381edfe29ed6d892", alt: "Tortoise", title: "Tortoise", href: "https://www.tortoisemedia.com/" },
  { src: "https://api.grove.storage/77522e14e57a7ee81ed16f71f2ee2e936d7e25b0c1928ccbec6734e17ab9b106", alt: "Zora", title: "Zora", href: "https://zora.co/" },
];

export default function LogoArray() {
  const logos = sponsorLogos.map((logo) => ({
    node: (
      <div className="flex items-center justify-center h-[60px] w-auto">
        <img
          src={logo.src}
          alt={logo.alt}
          width={140}
          height={60}
          loading="lazy"
          decoding="async"
          className="object-contain brightness-100 hover:brightness-125 transition-all duration-300"
        />
      </div>
    ),
    title: logo.title,
    href: logo.href,           // ← LogoLoop will use this for the <a>
  }));

  return (
    <div className="py-2 flex justify-center items-center bg-black">
      <div
        style={{
          height: "50px",
          width: "100%",
          maxWidth: "1200px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <LogoLoop
          logos={logos}
          speed={80}
          direction="left"
          logoHeight={30}
          gap={100}
          hoverSpeed={0}
          scaleOnHover
          fadeOut={false}
          fadeOutColor="#ffffff"
          ariaLabel="© AXIS partners and collaborators"
        />
      </div>
    </div>
  );
}
