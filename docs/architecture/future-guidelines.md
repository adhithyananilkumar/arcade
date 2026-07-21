# Render Engine — Future Work & Optimization Notes

Status as of 2026-07-16: the Course Renderer (`features/learning/delivery`) is built and
verified for **Course** content only. This doc records what's generic already, what's
Course-specific, and what to do when Article/Workshop/Webinar get their own authoring
structure — so whoever picks that up doesn't have to rediscover this by reading the diff.

## What's already generic (reuse, don't duplicate)

- **`TiptapContentView`** (`features/learning/delivery/components/TiptapContentView.tsx`) —
  a pure JSON → React renderer. It takes a `body: string` (Tiptap JSON, per the
  `TiptapDocument` contract in `types/editor.ts`) and an optional `emptyMessage`, and knows
  nothing about lessons, courses, or any other content type. It was renamed from
  `LessonContentView` specifically so it reads as shared infrastructure, not
  lesson-only tooling. **Any future content type's body should render through this same
  component, unchanged.**
- **`documents` table / `Document.currentBody`** (backend) — already generic across
  `ContentType.LESSON | ARTICLE | WORKSHOP | WEBINAR`. Whatever the new content type's
  authoring flow looks like, if it saves through the existing Yjs-backed document endpoints
  (`DocumentController`, `DocumentVersionService`), its JSON body ends up in the same place
  a Lesson's does — no new storage work needed for the body itself.

## What's Course-specific (needs a sibling, not a shared implementation)

- **`CourseRenderController` / `CourseRenderService`**
  (`com.arcade.backend.learning.delivery`) — returns a `Course → Module → Lesson` tree.
  This shape is Course-only. It will not work for content types that don't have that
  two-level nesting.
- **`CourseRenderer`** (`features/learning/delivery/components/CourseRenderer.tsx`) — the
  sidebar/navigation shell assumes a module/lesson tree (collapsible modules, a flat lesson
  list per module). An Article (probably just one document, no tree) or a Workshop (maybe
  `Workshop → Session[]`, one level, not two) will need their own shell component.

## What to do per new content type

When Article/Workshop/Webinar get a real authoring structure and are ready for a learner-facing
view, the pattern to follow is:

1. **Backend**: add a new read-only service + controller under `com.arcade.backend.learning.delivery`
   (e.g. `ArticleRenderController`, `WorkshopRenderService`) that queries that content type's own
   tables and returns its own DTO shape. Do **not** try to force it into `CourseRenderResponse`'s
   shape — a `Module`/`Lesson` split doesn't make sense for content with no such split. Reuse
   `Document.currentBody` as the read source per lesson/section/item, same as Course does.
2. **Frontend**: add a new shell component (e.g. `ArticleRenderer.tsx`, `WorkshopRenderer.tsx`)
   under `features/learning/delivery/components/` for that type's navigation shape. Whatever the
   shell looks like, the actual content body should still render through **`TiptapContentView`**
   — pass it the JSON string, don't reimplement node-type switching.
3. **Routing**: add the type's own route under `app/(authenticated)/studio/published/`
   (or wherever the catalog lives by then), following the pattern in
   `app/(authenticated)/studio/published/[courseId]/page.tsx`. (Renamed from `/content` to
   `/studio` 2026-07-21 — see `platform-architecture.md` §14 Unified Content Model.)
4. If two content types turn out to share more structure than expected (e.g. Workshop ends up
   being module/lesson-shaped too), consider generalizing `CourseRenderer`'s sidebar into a
   shared tree-navigation component at that point — not before. Speculative generalization now,
   before the second real shape exists, would just be guessing.

## Known gaps carried over from Phase 2 (Course renderer)

These apply to whatever gets built next too, not just Course:

- **No publish gate.** The renderer reads live authoring data directly (creator-only access),
  not an immutable published snapshot. `docs/platform-architecture.md`'s D4 `publishing` domain
  (immutable `course_versions`, `published_version_id`) is documented but not built. Once it
  exists, every render endpoint (Course and whatever comes after) should switch from reading the
  live tree to reading the published snapshot — this is a data-source swap inside each
  `*RenderService`, not a rewrite of the renderer components.
- **No enrollment/access model beyond "creator can view their own content."** Real learner access
  (enrolled users, public/paid gating) isn't wired up anywhere yet.
- **Quizzes are listed but not playable.** `CourseRenderer` shows quiz titles in the sidebar as
  inert items. Building actual quiz-taking is separate work in the `assessment` domain.
- **No video-player authoring yet.** `TiptapContentView` already knows how to render a
  `video-player` node (pointing at an R2 object URL) if one shows up in the JSON, but the
  authoring editor (`features/content/editor/extensions`) doesn't have a corresponding Tiptap
  extension yet — so no lesson can actually produce one today. Wiring that up is authoring-side
  work, not renderer-side.
