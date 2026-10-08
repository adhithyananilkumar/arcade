/**
 * The badge artwork as an image file: `/credentials/art/ARC-COURSE-L2?name=React%20Basics` (honours add `&stars=4`). This is the Open Badges
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
  const query = new URL(req.url).searchParams;
  const name = query.get("name")?.slice(0, 200) || undefined;
  // `?stars=` is a Distinguished honour's rating, 1–5.
  const stars = Number(query.get("stars")) || undefined;
  const svg = renderBadgeSvg({ ...parsed, title: name, stars, uid: "art", standalone: true });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
