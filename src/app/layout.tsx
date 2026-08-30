import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: "normal",
  weight: "variable",
  display: "swap",
  preload: false,
});
// Above-the-fold glyphs ("Your people," and the "Mutuals" wordmark) ship as a tiny preloaded subset.
// Regenerate ./fonts/Fraunces-hero.woff2 if the headline or wordmark text changes (see docs/design-decisions.md).
const frauncesHeroSubset = localFont({
  src: "./fonts/Fraunces-hero.woff2",
  variable: "--font-fraunces-sub",
  style: "normal",
  weight: "400",
  display: "swap",
  preload: true,
});
// The headline's italic word ships as a 2KB subset (preloaded) so the LCP never waits for the full italic face.
// Regenerate ./fonts/FrauncesItalic-remembered.woff2 if the italic headline word changes (see docs/design-decisions.md).
const frauncesItalicSubset = localFont({
  src: "./fonts/FrauncesItalic-remembered.woff2",
  variable: "--font-fraunces-italic-sub",
  style: "italic",
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
const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap", preload: false });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap", preload: false });

import { siteUrl } from "@/lib/site";

const SITE = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Mutuals · Your people, remembered.",
  description:
    "Send it a voice note after you meet someone. It files the person, the context, and the intro you promised. Then it sends you one message a day. No app to open.",
  openGraph: {
    title: "Mutuals · Your people, remembered.",
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
    <html lang="en" className={`${fraunces.variable} ${frauncesHeroSubset.variable} ${frauncesItalicSubset.variable} ${frauncesItalic.variable} ${geist.variable} ${geistMono.variable}`}>
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
