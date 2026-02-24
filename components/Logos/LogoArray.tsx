"use client";

import Image from "next/image";
import { LogoLoop } from "../LogoLoop";

const sponsorLogos = [
  { src: "/logos/absinth.png", alt: "Absinth", title: "Absinth", href: "http://www.absinth.com.mx/" },
  { src: "/logos/amaras.png", alt: "Amaras", title: "Amaras", href: "https://mezcalamaras.com/" },
  { src: "/logos/baselogo.png", alt: "Base", title: "Base", href: "https://base.org/" },
  { src: "/logos/casamancera.png", alt: "Casa Mancera", title: "Casa Mancera", href: "https://www.instagram.com/casamancera1750/" },
  { src: "/logos/color.png", alt: "Color", title: "Color", href: "https://color.fun/" },
  { src: "/logos/irl.png", alt: "IRL", title: "IRL", href: "https://irl.energy/" },
  { src: "/logos/lasflores.png", alt: "Las Flores", title: "Las Flores", href: "https://lasflores.mx/" },
  { src: "/logos/nousamigos.png", alt: "Nous Amigos", title: "Nous Amigos", href: "https://linktr.ee/nounsamigos" },
  { src: "/logos/refraction.png", alt: "Refraction", title: "Refraction", href: "https://www.refractionfestival.com/" },
  { src: "/logos/retake.png", alt: "Retake", title: "Retake", href: "https://retake.tv/" },
  { src: "/logos/solarlogo.png", alt: "Solar", title: "Solar", href: "https://secondlifeofsolar.org/" },
  { src: "/logos/studioberlin.png", alt: "Studio Berlin", title: "Studio Berlin", href: "https://www.studioberlin.club/" },
  { src: "/logos/tortoise.png", alt: "Tortoise", title: "Tortoise", href: "https://www.tortoisemedia.com/" },
  { src: "/logos/zora.png", alt: "Zora", title: "Zora", href: "https://zora.co/" },
];

export default function LogoArray() {
  const logos = sponsorLogos.map((logo) => ({
    node: (
      <div className="flex items-center justify-center h-[60px] w-auto">
        <Image
          src={logo.src}
          alt={logo.alt}
          width={140}
          height={60}
          className="object-contain brightness-100 hover:brightness-125 transition-all duration-300"
          priority={false}
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
          ariaLabel="Spectra partners and collaborators"
        />
      </div>
    </div>
  );
}