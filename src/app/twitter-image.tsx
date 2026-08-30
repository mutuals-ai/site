import { size, contentType, renderOgImage } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Mutuals · Your people, remembered.";
export { size, contentType };

export default async function Image() {
  return renderOgImage();
}
