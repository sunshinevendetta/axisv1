import type { Metadata } from "next";
import localFont from "next/font/local";
import GlobalTicker from "@/components/GlobalTicker";
import { Providers } from "@/components/Providers";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const bodyFont = localFont({
  src: "../public/fonts/BINGO.woff2",
  variable: "--font-body",
  display: "swap",
});

const displayFont = localFont({
  src: "../public/fonts/AGURA.woff2",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://axis.show"),
  title: {
    default: "AXIS",
    template: "%s | AXIS",
  },
  description: "Unexpected art experiences, digital culture, live episodes, and collectible releases from AXIS.",
  applicationName: "AXIS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://axis.show",
    siteName: "AXIS",
    title: "AXIS",
    description: "Unexpected art experiences, digital culture, live episodes, and collectible releases from AXIS.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "AXIS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIS",
    description: "Unexpected art experiences, digital culture, live episodes, and collectible releases from AXIS.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable} pb-8 font-sans antialiased`} suppressHydrationWarning>
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <p style={{
            color: "#fff",
            fontFamily: "var(--font-display), sans-serif",
            fontSize: "clamp(1.2rem, 3vw, 2rem)",
            letterSpacing: "0.1em",
            textAlign: "center",
            margin: 0,
          }}>
            SPECTRA is now AXIS
          </p>
        </div>
        <Providers>{children}</Providers>
        <GlobalTicker />
        <SpeedInsights />
      </body>
    </html>
  );
}
