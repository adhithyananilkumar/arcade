import { redirect } from "next/navigation";
import type { ContentTypeSegment } from "../lib/contentTypeRouting";
import { editorHref } from "../lib/contentTypeRouting";

const VALID_SEGMENTS: ContentTypeSegment[] = ["course", "roadmap", "event"];

// Canonical /studio/content/{contentType}/{contentId}/edit URL — kept as a
// thin redirect to the real, unchanged editor so the new route namespace
// exists without duplicating any editor code.
export default async function ContentEditRedirectPage({
  params,
}: {
  params: Promise<{ contentType: string; contentId: string }>;
}) {
  const { contentType, contentId } = await params;
  if (!VALID_SEGMENTS.includes(contentType as ContentTypeSegment)) {
    redirect("/studio");
  }
  redirect(editorHref(contentType as ContentTypeSegment, contentId));
}
