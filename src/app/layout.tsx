import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: "normal",
  weight: "variable",
  display: "swap",
  preload: false,
});
// The "Mutuals" wordmark ships as a tiny preloaded Fraunces subset (a static instance at opsz 72 / SOFT 0 / WONK 0).
// Regenerate ./fonts/Fraunces-hero-calm.woff2 if the wordmark text changes (see docs/design-decisions.md).
const frauncesHeroSubset = localFont({
  src: "./fonts/Fraunces-hero-calm.woff2",
  variable: "--font-fraunces-sub",
  style: "normal",
  weight: "400",
  display: "swap",
  preload: true,
});
// Full italic face for any other italic display text; not preloaded.
const frauncesItalic = Fraunces({
  variable: "--font-fraunces-italic",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: "italic",
  weight: "variable",
  display: "swap",
  preload: false,
});
// Geist sets the headline (the LCP), so it is preloaded.
const headline = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const geist = IBM_Plex_Sans({ variable: "--font-geist-sans", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", preload: true });
const geistMono = IBM_Plex_Mono({ variable: "--font-geist-mono", subsets: ["latin"], weight: "400", display: "swap", preload: false });

import { siteUrl } from "@/lib/site";

const SITE = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Mutuals · Relationship memory for your AI",
  description:
    "Remember the people you meet, what matters to them, and where you left off. Relationship memory for the agents you choose. Join agent early access.",
  openGraph: {
    title: "Mutuals · Relationship memory for your AI",
    description: "Your people. Your choice of agent. Explore Mutuals agent early access.",
    url: SITE,
    siteName: "Mutuals",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: SITE },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headline.variable} ${fraunces.variable} ${frauncesHeroSubset.variable} ${frauncesItalic.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">
        <SmoothScroll />
        {children}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <Script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        ) : null}
      </body>
    </html>
  );
}
