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
  title: "SPECTRART",
  description: "Unexpected Art Experiences",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable} pb-8 font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
        <GlobalTicker />
        <SpeedInsights />
      </body>
    </html>
  );
}
