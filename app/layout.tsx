import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

const prenoptica = localFont({
  src: "../public/fonts/BINGO.woff2",
  display: "swap",
});

const bingo = localFont({
  src: [
    {
      path: "../public/fonts/BINGO.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/BINGO-ITALIC.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SPECTRART",
  description: "Unvexpected Art Experiences",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${prenoptica.className} antialiased`}>
        <Providers>
          {children}
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}