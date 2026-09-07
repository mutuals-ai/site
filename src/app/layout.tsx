import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
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
const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap", preload: true });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap", preload: false });

import { siteUrl } from "@/lib/site";

const SITE = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Mutuals · A second brain for your relationships.",
  description:
    "Send it a voice note after you meet someone. It files the person, the context, and the intro you promised. Then it sends you one message a day. No app to open.",
  openGraph: {
    title: "Mutuals · A second brain for your relationships.",
    description: "Send it a voice note after you meet someone. One message a day. No app to open.",
    url: SITE,
    siteName: "Mutuals",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: SITE },
};

export const viewport: Viewport = { themeColor: "#0E0C0B", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${frauncesHeroSubset.variable} ${frauncesItalic.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">
        <SmoothScroll />
        {children}
        <div className="paper-grain" aria-hidden="true" />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <Script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        ) : null}
      </body>
    </html>
  );
}
