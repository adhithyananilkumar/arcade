import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes user-authored rich-text HTML (forum posts/comments, and any
 * other place that renders stored user HTML via dangerouslySetInnerHTML)
 * against a real allowlist-based sanitizer, instead of a naive
 * `<script>`-tag regex strip (which does nothing against event-handler
 * attributes like `onerror`, `javascript:` URLs, or dozens of other
 * injection vectors).
 *
 * Uses DOMPurify's default profile — a well-tested allowlist that keeps
 * ordinary rich-text formatting (paragraphs, headings, bold/italic,
 * lists, blockquotes, code blocks, tables, links, images) while removing
 * `<script>`, `on*` event-handler attributes, `javascript:`/`data:` URLs
 * in hrefs/srcs, `<iframe>`/`<object>`/`<embed>`, and inline `style`
 * expressions — so it does not blindly strip formatting the product
 * intentionally supports.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["iframe", "object", "embed", "style"],
    FORBID_ATTR: ["style"],
  });
}
