import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const prenoptica = localFont({
  src: "../public/fonts/BINGO.woff2",
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
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
