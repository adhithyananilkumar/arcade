# Frontend Inventory — Arcade UI

Audit date: 2026-08-16
Method: direct inspection via `find`, `wc`, `grep` against the working tree at `E:\arcade\ui` (git repo, branch `refacto`). No file contents were assumed — every count below is derived from a command run against the tree during this audit.

## 1. Top-level footprint

| Directory | File count (all types) | Notes |
|---|---|---|
| `app/` | 229 | Next.js App Router tree |
| `apps/` | 136 | "Orchestration" layer (`core`, `creator`, `learner`, `public`) |
| `domains/` | 189 | Business-capability layer |
| `components/` | 33 | Legacy/parallel component tree (see 02/03 docs) |
| `features/` | 20 | Single feature (`features/roadmap`) — legacy/parallel to `domains/roadmaps` |
| `infrastructure/` | 12 | HTTP, auth, media, state, websocket adapters |
| `shared/` | 51 | Design system, generic hooks, utils, types, contexts |
| `lib/` | 1 | `lib/utils.ts` (shadcn default scaffold location) |
| `config/` | 1 | `.gitkeep` only — effectively empty |

## 2. Source file counts (`.ts`/`.tsx` only, across the 9 directories above)

- **Total source files: 624** (`.ts`: 149, `.tsx`: 475)
- **Test files: 0** — no `*.test.*` or `*.spec.*` files exist anywhere in the source tree. There is no test runner configured in `package.json` either (no `jest`, `vitest`, `@testing-library/*`, or `test` script). This is a P1-level gap, covered in the structure audit.
- **Pages/routes (App Router):** `page.tsx` — **102**; `layout.tsx` — **12**; `route.ts` (API route handlers) — **4** (all under `app/api/internal/...`, used as BFF-style proxies for auth/media, not general API surface).
- **Hooks:** files matching `use*.ts`/`use*.tsx` — **18** standalone hook files, spread across `shared/hooks`, and per-domain `hooks/` folders in `badges`, `channels`, `community`, `identity`, `notifications`, `roadmaps`, plus `apps/creator/editor/hooks` and one page-local hooks folder (`app/(authenticated)/studio/events/hooks`). This likely undercounts actual hook usage since many hooks are defined inline inside larger component files rather than in dedicated `use*.ts` files — see the architecture doc for the pattern this indicates.
- **Contexts:** 4 files matching `*context*` (all under `shared/contexts`).
- **Zustand stores:** 5 files import `from 'zustand'` (one additional file uses double-quote import style, effectively 6 distinct call sites across ~7 files whose name contains "store"). Stores live in `domains/community/store`, `domains/iam/store`, `domains/roadmaps/store`, `features/roadmap/renderer/store`, and `infrastructure/state/theme.store.ts` / `infrastructure/auth/auth.store.ts`. There is **no single global store** — state is intentionally domain-scoped, which is consistent with the documented architecture (see 02_FRONTEND_ARCHITECTURE.md).
- **API/service modules:** 17 files matching `*service*`, 6 additional files matching `*api*` that aren't already counted as `*service*` (many domains use an `api/` subfolder of one or more files instead of a `*.service.ts` naming convention — actual API-integration surface is larger than this filename count suggests; see 02_FRONTEND_ARCHITECTURE.md for the real data-access map).
- **Mock-data files:** **0** dedicated mock-data files by filename. However, 12 files contain inline mock data in-component (`mockData`, `MOCK_`, or `const mock*` identifiers), concentrated in `app/(authenticated)/channels/[id]/manage/components/*` (10 of the 12) and one in the Studio content-overview learners-analytics section. This is the literal "mock data not yet wired to backend" surface the follow-on integration work will need to touch — see 10_FRONTEND_DEAD_CODE_AUDIT.md for the itemized list.

## 3. Dependencies (`package.json`)

- **Runtime dependencies: 65**
- **Dev dependencies: 9**
- **`overrides` block: 43 entries**, all pinning `@tiptap/*` sub-packages plus `yjs` to exact versions — a strong signal of past dependency-resolution pain in the tiptap/yjs collaborative-editing stack.

### Duplicated/overlapping libraries (confirmed by actual import-site grep, not just presence in `package.json`)

| Concern | Libraries present | Usage evidence | Verdict |
|---|---|---|---|
| HTTP client | `axios` (^1.18.1) **and** native `fetch` | `axios` imported in exactly **1 file**: `infrastructure/auth/auth.service.ts` (9 call sites, all auth-flow). `fetch(` used directly in **11 files**, including the canonical `infrastructure/http/api.ts`. | **Confirmed duplication.** Two HTTP mechanisms coexist in the same `infrastructure/` layer that is supposed to be the single adapter boundary. |
| Rich-text editing | `@tiptap/*` (raw, 39 files), `reactjs-tiptap-editor` (wrapper around tiptap, 13 files, used only in `apps/creator/editor/*`), `@uiw/react-md-editor` (1 file: `domains/community/components/ForumEditor.tsx`) | Three distinct editing stacks for three different surfaces (course content editor, creator rich editor, community forum). | **Partially justified, partially duplicated.** `@tiptap/*` direct usage vs. the `reactjs-tiptap-editor` wrapper look like two parallel approaches to the same problem (course/content editing) rather than deliberately different tools for different jobs — needs owner confirmation. The single-file `@uiw/react-md-editor` usage for the forum is a plausible deliberate lightweight choice but is still a third markdown/rich-text engine to maintain for one component. |
| Canvas / diagram / whiteboard | `@excalidraw/excalidraw` (1 file), `konva`/`react-konva` (1 file), `mermaid` (4 files), `@xyflow/react` + `dagre` (14 files) | Each has a narrow, distinct usage (roadmap canvas/flow diagrams use `@xyflow/react`+`dagre`; badge/graphic work likely uses `konva`; `mermaid` for rendered diagram blocks; `excalidraw` for a single sketch feature). | **Likely intentional** — different tools solve different visual problems (flow graphs vs. freeform sketch vs. rendered diagram markup vs. canvas graphics). Flag as **UNVERIFIED** rather than redundant; confirm with design/product whether excalidraw and konva's single-file usages are still live features or abandoned experiments (see dead-code doc). |
| Drag-and-drop | `@dnd-kit/*` only (4 files) | Single library, no overlap found. | Not duplicated. |
| State/data | `zustand` (domain-scoped stores) + `@tanstack/react-query` (server-state cache) | Standard, complementary pairing (client UI state vs. server cache) — not a duplication. | Not duplicated. |
| Utilities | `lib/utils.ts` (shadcn-scaffolded, referenced by **1** file) vs. `shared/utils/utils.ts` + `shared/utils/money.ts` (referenced by **34** files) | `components.json` (shadcn config) still points its `utils` alias at `@/lib/utils`, i.e. new shadcn-generated components will keep writing into the now-legacy `lib/` location even though the project's real utility home is `shared/utils`. | **Confirmed duplication / config drift** — see 02 and 03 docs. |
| Design-system / UI primitives | `shared/design-system/ui/*` (43 files, documented as canonical in `docs/architecture/repository-map.md`) vs. `components/ui/*` (17 files, the shadcn CLI default target per `components.json`) | Both are actively imported by app code. | **Confirmed duplication** — two parallel "ui/" primitive folders. See 02/03 docs. |

## 4. Risk-pattern sweep (grep counts, not yet triaged — see 03/10 docs for classification)

- `: any` / `<any>` / `as any` — **403 occurrences** across the source tree. Meaningful type-safety erosion; not itemized here (too voluminous), flagged as a hotspot category in 03_FRONTEND_STRUCTURE_AUDIT.md.
- `dangerouslySetInnerHTML` — **4 files**.
- Files with `role ===`, `.includes(role)`, `hasPermission`, `isAdmin`, `isCreator`, `isOrganizer` literal checks outside the central `authorization.service.ts` — **14 files**, indicating authorization logic is not fully centralized (see 03 doc).

## 5. 20 largest files by line count (source only)

| Lines | File |
|---|---|
| 2444 | `apps/core/components/ExploreHub.tsx` |
| 2337 | `components/explore/CategoryDetailedView.tsx` |
| 2324 | `features/roadmap/renderer/components/RoadmapViewer.tsx` |
| 2248 | `apps/creator/shared/content-editor/SharedContentEditorOrchestrator.tsx` |
| 1940 | `app/(authenticated)/profile/page.tsx` |
| 1915 | `app/(public)/explore/page.tsx` |
| 1844 | `app/(authenticated)/my-learning/page.tsx` |
| 1579 | `app/(authenticated)/studio/page.tsx` |
| 1254 | `apps/public/components/explore/CategoryDetailedView.tsx` (unreferenced duplicate — see 10 doc) |
| 1098 | `app/(authenticated)/learn/[courseId]/page.tsx` |
| 1090 | `app/(public)/[username]/page.tsx` |
| 1044 | `app/(authenticated)/notifications/page.tsx` |
| 1026 | `apps/learner/components/achievements/AchievementsPage.tsx` |
| 916 | `app/(authenticated)/channels/[id]/manage/components/CourseManagementSection.tsx` |
| 859 | `components/explore/CoursesView.tsx` |
| 859 | `app/(authenticated)/channels/[id]/manage/ChannelDangerZone.tsx` |
| 804 | `domains/roadmaps/components/RoadmapCanvas.tsx` |
| 767 | `apps/public/components/landing/creators/CreatorFormats.tsx` |
| 720 | `components/landing/CircularGallery.tsx` |
| 717 | `apps/public/components/landing/MagicBento.tsx` |

**Files over 500 lines: 53. Files over 1000 lines: 13.** (counted across `app/`, `apps/`, `domains/`, `components/`, `features/`). See 03_FRONTEND_STRUCTURE_AUDIT.md for which of these qualify as "God components" mixing concerns vs. which are legitimately large but cohesive (e.g., a single big visual canvas renderer).

### Largest hooks
No standalone hook file exceeds ~150 lines by inspection; the "large hook" problem in this codebase is instead that hook-shaped logic (multiple `useState`/`useEffect`/data-fetching) is embedded directly inside the God page/component files above rather than extracted — see 03 doc, "components mixing API calls + state + business logic + rendering."

### Largest services
`infrastructure/http/api.ts` (163 lines) is the largest infra file; domain `api/` folders are generally small (1–3 files, <150 lines each) except `domains/publishing/api` and `domains/roadmaps/services`, which warrant a closer look during backend wiring since roadmaps/publishing are the most actively-churned domains (see §6).

## 6. Architectural hotspots (directory size + git churn)

Total lines by top-level directory (source only):

| Directory | Total lines |
|---|---|
| `app/` | 46,130 |
| `apps/` | 29,053 |
| `domains/` | 23,835 |
| `components/` | 8,453 |
| `features/` | 6,549 |
| `shared/` | 5,547 |
| `infrastructure/` | 686 |

Git churn (files touched in the last 60 commits, grouped by directory):

| Directory | Commits touching it |
|---|---|
| `app/(authenticated)` | 249 |
| `apps/creator` | 72 |
| `app/(public)` | 32 |
| `apps/learner` | 28 |
| `domains/assessments` | 22 |
| `domains/courses` | 16 |
| `domains/payment` | 15 |
| `domains/badges` | 15 |
| `domains/enrollment` | 11 |
| `components/explore` | 8 |
| `shared/types` | 7 |
| `features/roadmap` | 6 |

**`app/(authenticated)` is both the largest single tree by line count and by far the most-churned directory** — it is also documented (`docs/architecture/repository-map.md`) as the layer that should contain *only* routing glue (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) and must **not** contain "reusable services, complex business logic, or pure UI components." The line-count and God-component evidence above (multiple 900–2000-line files living directly under `app/(authenticated)/.../page.tsx` or its local `components/` subfolders) shows this rule is being violated at scale, not as an isolated exception. Full detail in 02_FRONTEND_ARCHITECTURE.md and 03_FRONTEND_STRUCTURE_AUDIT.md.

`apps/creator` is the second-heaviest churn zone, consistent with the "uncommitted work in progress under `app/(authenticated)/studio/content/...`" the user flagged — this is active, unstable surface area, not legacy debt. Treated as such (not penalized) in the other reports.

## 7. Suspicious / dead files (surfaced here, fully triaged in 10_FRONTEND_DEAD_CODE_AUDIT.md)

- `creator_designs.patch` (387,174 bytes) and `full_design.patch` (199,241 bytes) at repo root — stray unapplied patch files, not referenced by any script, `package.json`, or `.gitignore` rule. Dead artifacts left in the repo root.
- `.claude/worktrees/agent-a40856fc28d56ab27/` — an **untracked** nested working copy (contains its own `components/explore/CoursesView.tsx`, etc.) sitting inside the repository tree. Not part of `.gitignore`. Flagged as hygiene debt (see 10 doc) — appears to be leftover agent-tooling scratch state, not application source.
- `apps/public/components/explore/CategoryDetailedView.tsx` (1254 lines) — no importer found anywhere in `app/`, `apps/`, `domains/`, `shared/`, `infrastructure/`, `features/`, or `components/`; a live, differently-sized duplicate of `components/explore/CategoryDetailedView.tsx` (2337 lines, actively imported by 5 files) exists. See 10 doc for full dead-code classification.
- `lib/utils.ts` — referenced by exactly 1 file while the project's real utility module (`shared/utils/utils.ts`) is referenced by 34. `lib/utils.ts` is kept alive only because `components.json` (shadcn CLI config) still points there.

## 8. Uncommitted work in progress (noted, not touched)

`git status` shows 19 modified/added files, all under `app/(authenticated)/studio/content/[contentType]/[contentId]/...` (content-overview sections, capabilities, and data-fetch lib), plus the untracked `.claude/worktrees/` directory. This matches the task briefing and was left untouched per instructions.
