# Architecture Decision Record (ADR)

Whenever an important architectural decision is made, record it here to prevent repeated discussions.

## Template
- **Decision**: [What was decided]
- **Reason**: [Why this decision was made]
- **Alternatives considered**: [What else was looked at]
- **Date**: [YYYY-MM-DD]

---

### Example Decision
- **Decision**: Use App Router instead of Pages Router.
- **Reason**: To leverage React Server Components and improved routing features.
- **Alternatives considered**: Next.js Pages Router, Vite + React Router.
- **Date**: 2026-07-09

### Load lesson content before switching the editor's key (auto-save restore fix)
- **Decision**: In `CourseEditorShell.openLesson`, fetch the lesson's draft/content **before** calling `setActiveLessonId`, then commit `activeLessonId` + `activeLessonInitialContent` in the same batch. Also flush the currently-open editor (`editorRef.current.flush()`) before switching lessons.
- **Reason**: `<ArcadeEditor>` is keyed on `activeLessonId` and Tiptap v3's `useEditor` only reads `content` at mount. The old code set the id first (remounting the editor with stale/empty content) and fetched the draft afterwards, so the fetched content was silently dropped — lessons opened blank and looked "not saved" even though `content_drafts` held the data. Flushing before switching also prevents losing the last ~2s of typing (unmount cancels the debounced save).
- **Alternatives considered**: (a) Add a `useEffect` in `ArcadeEditor` calling `editor.commands.setContent()` when `initialContent` changes — rejected as more surface area and fights the existing key-remount pattern. (b) Add a content hash to the editor `key` — rejected; still races with the async fetch.
- **Note / next step**: Content currently lives only in `content_drafts`; `lessons.body` is never populated. The learner-facing renderer reads `lessons.body`, so a "commit draft → lesson.body" step is still needed before publish works. Tracked as a follow-up, not part of this fix.
- **Date**: 2026-07-14

### Editor persistence & collaboration architecture (Yjs write model, JSON read model, Hocuspocus sidecar)
- **Decision**: Lock in the editor's long-term persistence and real-time architecture in two phases:
  - **Phase 1 (now — single author, no sockets):** Keep the debounced REST autosave (`PUT /api/lessons/{id}/draft`, 2s) + localStorage fallback. Harden durability by adding **optimistic-concurrency conflict detection** to draft saves (reject/reconcile stale writes using a version or `saved_at` check) and **flush on `blur` and `visibilitychange`/`beforeunload`**, not only on navigation. This same pass also commits the draft into `lessons.body` (the renderer's read model), closing the existing publish gap.
  - **Phase 2 (real-time collaboration):** Adopt **Yjs as the write model** (CRDT), with the **Tiptap JSON tree as a *derived* read model** for the Course Renderer. Real-time sync runs through **Hocuspocus** (the Tiptap team's Yjs WebSocket server) as a **Node sidecar service**, persisting Yjs document state to Postgres. Spring Boot remains the authority for auth, metadata, ownership, and the review/publish workflow. Wiring: `Tiptap ↔ Yjs ↔ Hocuspocus ↔ Postgres`.
- **Reason**: Durability ("never lose work") and real-time multiplayer are separate problems; only the latter needs WebSockets. The current debounced-REST model is the correct, standard choice for single-author authoring (same pattern as Google Docs/Notion/Linear for single-user editing) and is not a rework risk — so we defer sockets, but decide the data model **now** so nothing built in the meantime assumes "server JSON is the authoritative write model" in a way that fights Yjs later. Keeping JSON as a derived read model preserves the AGENTS.md "structured JSON contract" for the renderer unchanged while letting Yjs own the write path.
- **Alternatives considered**:
  - *Java-native Yjs sync* (implement CRDT sync in Spring Boot) — rejected; the JVM Yjs ecosystem is immature and this reinvents a solved problem.
  - *`y-websocket` (barebones) instead of Hocuspocus* — viable but less batteries-included (no built-in auth hooks/persistence extensions); Hocuspocus preferred.
  - *Add real-time collaboration now* — rejected as premature; single-author is the current phase per AGENTS.md (Yjs is explicitly reserved for a later phase).
  - *Keep JSON snapshot as the write model even under collaboration* — rejected; CRDT convergence requires the Yjs update log to be authoritative, with JSON derived from it.
- **Key open item for Phase 2**: ~~confirm willingness to operate a **Node sidecar (Hocuspocus)** alongside Spring Boot~~ **Confirmed 2026-07-14** — running a Hocuspocus Node sidecar in deployment is accepted, **for Phase 2 only**.
- **Status**: Approved 2026-07-14. Phase 1 not yet implemented (no code written under this ADR yet). Phase 2 is design-committed, build-deferred.
- **Date**: 2026-07-14

### Content approval workflow via immutable version snapshots + submissions
- **Decision**: Model course review/publishing around a **mutable working copy decoupled from immutable version snapshots**, so three views of a course can coexist at once — the author's live working copy, a frozen snapshot under review, and a frozen published snapshot.
  - **`course_versions`** (immutable, = version history): `id, course_id, version_number (monotonic per course), snapshot (jsonb — full serialized course tree: metadata + modules + lessons + bodies + ordering), created_at, created_by, source (SUBMISSION | PUBLISH)`. Snapshots are created **only at submit and publish checkpoints**, not per keystroke.
  - **`course_submissions`** (review records): `id, course_id, version_id → course_versions, status (PENDING | CHANGES_REQUESTED | APPROVED | REJECTED | SUPERSEDED), submitted_by, submitted_at, reviewer_id?, decided_at?, feedback?`. The `version_id` FK is the permanent record of *which version was submitted*.
  - **`courses`** gains `published_version_id → course_versions (nullable)` = what learners see. Truth is derived from **two orthogonal facts** — publication (does `published_version_id` exist) and review state (status of the latest submission) — rather than one overloaded `status` string.
  - **Working copy** stays in the existing normalized editable tables (`modules`/`lessons.body`/`content_drafts`); it is what gets serialized into a snapshot at each checkpoint.
- **Flows** (mapped to requirements):
  - *Submit*: materialize working content, freeze it into a new `course_versions` row, **supersede** any existing `PENDING` submission for the course (`→ SUPERSEDED`), create a new `PENDING` submission pointing at the new version.
  - *Keep editing while pending*: author mutates the working copy; the submitted snapshot is frozen, so the reviewer's view is unaffected.
  - *Re-submit newer version*: same supersede step ⇒ at most one `PENDING` submission per course ⇒ reviewer queue (`PENDING` only) **always shows just the latest** submitted version, while every submission row is retained as history.
  - *Reviewer decision*: **Approve** → submission `APPROVED` + set `published_version_id = submission.version_id`; **Request changes** → `CHANGES_REQUESTED` + feedback; **Reject** → `REJECTED`.
  - *Edit already-published content requires re-approval*: `published_version_id` only advances on approval, so post-publish edits sit in a new `PENDING` submission while learners keep seeing the old published version until it is approved.
- **Reason**: The requirements (submit-and-keep-editing, re-submit newer, show reviewer only the latest, re-approve edits to published content) are impossible with a single mutable content record — they require the reviewer and learners to read **frozen** copies while the author edits freely. Immutable snapshots + a moving `published_version_id` pointer express all of it with no bespoke states. This also lands on the Yjs decision above: the working copy is the *write model*, snapshots are immutable *JSON read projections* (in Phase 2, snapshots are derived from the Yjs doc at checkpoint time — model unchanged).
- **Alternatives considered**:
  - *Versioned rows per entity / temporal tables* (every lesson/module row carries version info) — rejected; far more complex and painful given edit-while-pending. Denormalized snapshot blob per version is simpler and matches the JSON read-model contract.
  - *Snapshot on every autosave* — rejected; storage explosion for little value. Milestone snapshots (submit/publish) chosen; fine-grained history comes free from Yjs in Phase 2.
  - *One overloaded `courses.status` enum* — rejected; "published AND has a pending revision" causes combinatorial state blow-up. Publication and review state kept orthogonal.
  - *Second competing review on re-submit* — rejected in favor of supersede, which directly satisfies "only latest shown to reviewer" and keeps ≤1 PENDING per course.
- **Edge cases to honor when building**:
  - Approval publishes the **reviewed** snapshot, not the current working copy (which may have newer unsubmitted edits). Must be explicit in UI.
  - A decision applies only if the submission is still `PENDING` (author may have resubmitted mid-review). This is the **same optimistic-concurrency guard** as the Phase 1 draft-save conflict check.
- **Defaults chosen** (override before build if needed): milestone-granularity history; keep all versions for now (prune policy later, always keep published + last N submissions); **pull-based** reviewer queue (`reviewer_id` set when an admin picks up a PENDING submission).
- **Current-state gaps found during design (prerequisites for build)**:
  - `roles`/`permissions`/`user_roles` tables exist (`V2__iam_schema.sql`) but are **empty** — no reviewer/admin role is seeded or assigned. Reviewer endpoints will need a seeded review role (e.g. assign to `admin@ajce.in`) and method-level authorization (`@EnableMethodSecurity` is already on).
  - There is **no admin/review UI** in the frontend yet (only the author dashboard under `app/(authenticated)/dashboard/`). A reviewer surface must be built.
  - Snapshotting depends on the Phase 1 "commit working content → `lessons.body`" step, since `lessons.body` is currently empty and content lives in `content_drafts`.
- **Status**: Design approved 2026-07-14, build-deferred. No code written under this ADR yet. Next migration number is **V12**. Backend touch-points when implemented: `content/model` (+`CourseVersion`, `CourseSubmission`), `content/repository`, `content/service/CourseService` (replaces the current one-line `submitCourse` status flip), `content/controller` (+ reviewer endpoints), new Flyway `V12` migration; frontend: author status/version-history UI in `CourseEditorShell.tsx` + a new reviewer dashboard.
- **Date**: 2026-07-14
