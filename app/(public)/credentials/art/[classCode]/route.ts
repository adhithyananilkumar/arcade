/**
 * The badge artwork as an image file: `/credentials/art/ARC-COURSE-L2?name=React%20Basics`. This is the Open Badges
 * `image` of every badge class and assertion, so a backpack or verifier outside Arcade shows the
 * same drawing the app does. Drawn by the shared renderer; never stored.
 */

import { parseBadgeClassCode, renderBadgeSvg } from "@/domains/credentials";

export async function GET(req: Request, { params }: { params: Promise<{ classCode: string }> }) {
  const { classCode } = await params;
  const parsed = parseBadgeClassCode(classCode.replace(/\.svg$/i, ""));
  if (!parsed) {
    return new Response("No such badge class", { status: 404 });
  }
  // `?name=` prints an award's content name on it, as an issued badge's image does.
  const name = new URL(req.url).searchParams.get("name")?.slice(0, 200) || undefined;
  const svg = renderBadgeSvg({ ...parsed, title: name, uid: "art", standalone: true });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
