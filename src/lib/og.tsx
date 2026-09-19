/**
 * Shared OG/Twitter image render. See src/app/opengraph-image.tsx and
 * src/app/twitter-image.tsx. Tries to fetch the Fraunces display font from
 * Google Fonts at request time; falls back to Georgia if that fails, so a
 * network hiccup never breaks the build or the image.
 */
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#ffffff";
const CARD = "#eaf3ed";
const CARD_BORDER = "#dce4df";
const INK = "#18201f";
const SIGNAL = "#185c43";

import { readFile } from "node:fs/promises";
import path from "node:path";

// Fonts are bundled locally (OFL) so the OG image never depends on the network.
async function loadFont(file: string): Promise<ArrayBuffer | null> {
  try {
    const buf = await readFile(path.join(process.cwd(), "src/app/fonts", file));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch (err) {
    console.error(`[og] failed to load ${file}`, err);
    return null;
  }
}

export async function renderOgImage(): Promise<ImageResponse> {
  const [fontData, monoData] = await Promise.all([loadFont("Fraunces.woff"), loadFont("GeistMono.ttf")]);
  const displayFont = fontData ? "Fraunces" : "Georgia, serif";
  const monoFont = monoData ? "Geist Mono" : "monospace";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: PAPER,
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingRight: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: displayFont,
              fontSize: 64,
              color: INK,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            <span>Relationship memory</span>
            <span>for your AI.</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 12,
              padding: "28px 32px",
              fontFamily: monoFont,
              fontSize: 22,
              color: INK,
              gap: 10,
              minWidth: 420,
            }}
          >
            <div style={{ display: "flex" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={SIGNAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 10 }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              <span>Agent early access</span>
            </div>
            <div style={{ display: "flex" }}>Remember a conversation.</div>
            <div style={{ display: "flex" }}>Choose the right person.</div>
            <div style={{ display: "flex" }}>Recall with context.</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "absolute",
            left: 64,
            bottom: 48,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 64 64" fill={SIGNAL}>
            <circle cx="24" cy="24" r="16" />
            <circle cx="40" cy="40" r="16" />
          </svg>
          <div
            style={{
              display: "flex",
              fontFamily: monoFont,
              fontSize: 20,
              color: SIGNAL,
            }}
          >
            getmutuals.ai
          </div>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
      fonts: [
        ...(fontData ? [{ name: "Fraunces", data: fontData, style: "normal" as const, weight: 400 as const }] : []),
        ...(monoData ? [{ name: "Geist Mono", data: monoData, style: "normal" as const, weight: 400 as const }] : []),
      ],
    },
  );
}
