import { size, contentType, renderOgImage } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Mutuals · A second brain for your relationships.";
export { size, contentType };

export default async function Image() {
  return renderOgImage();
}
