# Archived: the Studio badge editor

**Status:** archived 2026-09-29. The code is intact and compiles; it is simply no longer reachable
from Studio. Kept because the canvas editor may be reused later (e.g. certificate templates, event
passes, channel artwork).

**Replaced by:** the central credential system — `domains/credentials` (frontend) and
`certification.badges` (backend). See `backend/docs/architecture/credential-badges.md`.

## Why it was removed

Creators designed their own badge per course. In practice:

- Every channel's badges looked different, so a badge said nothing comparable about its holder.
- Nothing was ever *awarded*: the design was stored, but no learner received it.
- Designs could not be verified, and no reviewer checked them.
- Building an editor good enough for everyone was a large ongoing cost.

The replacement: Arcade owns one badge design and three levels. A creator only picks the level
their course, event or exam awards. Badges are issued automatically at 100% completion, sealed, and
publicly verifiable.

## What the editor was

A structured-document canvas editor (not Tiptap/Yjs):

| Piece | Location |
|---|---|
| Document model (`BadgeDocument`, schema v1) | `ui/domains/badges/types/badgeDocument.types.ts` |
| Zod schema + migrations | `ui/domains/badges/lib/badgeDocumentSchema.ts`, `lib/migrations.ts` |
| Canvas (Konva-style layers, shapes, text, icons, QR, images, gradients, patterns) | `ui/domains/badges/components/BadgeCanvas.tsx` |
| Toolbar, zoom, right-panel Design/Properties/Layers tabs | `components/BadgeToolbar.tsx`, `BadgeZoomControls.tsx`, `BadgePanels.tsx` |
| Editor state + autosave + version snapshots | `ui/domains/badges/hooks/useBadgeEditor.ts` |
| Shape catalogue (ARCADE_HEX) | `ui/domains/badges/types/badgeShape.types.ts` |
| Icon set / patterns | `ui/domains/badges/lib/badgeIcons.ts`, `lib/badgePatterns.ts` |
| HTTP | `ui/domains/badges/api.ts` → `/api/badges/**`, `/api/courses/{id}/badges` |
| Backend | `backend/.../studio/badge/**` (`Badge` is a `ContentItem`, table `badges`); the document lives in `documents` with `OwnerType.BADGE` (`BadgeDocumentAuthorizer`), history via `DocumentVersionService` |

## How it was wired (to re-enable)

In `ui/apps/creator/studio/workspaces/content/ContentEditorRuntime.tsx`, before 2026-09-29:

1. `import { useBadgeEditor, BadgeEditorWorkspace, BadgeEditorContextPanel } from "@/domains/badges";`
2. State: `badges: BadgeNode[]` (loaded from `adapter.loadContent().badges`), `activeBadgeId`,
   and `const badgeEditor = useBadgeEditor(activeBadgeId, status === "SUBMITTED")`.
3. Tree: root-level badge rows (sibling of modules) with rename/delete; the "+" menu called
   `adapter.addBadge(contentId, "Badge N")` (`CourseAdapter.addBadge/renameBadge/deleteBadge`, still present).
4. Canvas: `activeBadgeId ? <BadgeEditorWorkspace editor={badgeEditor} />`.
5. Right panel: `mode="editor"`, `editorContextNode={<BadgeEditorContextPanel editor={badgeEditor} />}`,
   `footerOverride={{ label: "Badge ID", value: activeBadgeId }}`, and an effect that switched the
   panel to the `design` / `properties` / `layers` tabs while a badge was open.

The git history of `ui/` at the commit before "central credential badges" has the exact code.

## Data

Existing `badges` rows and their `documents` are untouched. Nothing reads them now. Drop them only
with a migration once it is certain the editor will not return.
