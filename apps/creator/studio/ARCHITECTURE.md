# Arcade Studio Architecture

## Studio Core (`apps/creator/studio/core/`)

Generic editor infrastructure with zero knowledge of Course, Event, Exam, or any future content
type. Verified by `ContentEditorRuntime.test.tsx`: no file here imports from `studio/workspaces/`.

| File | Owns |
|---|---|
| `StudioShell.tsx` | `StudioEditorFrame` (ambient chrome), `StudioEditorTopBar`, `StudioEditorBody` — the viewport contract (see below) — plus shared tree/canvas class constants and the four canvas states (`StudioCanvasLoading/Empty/Error`). |
| `StudioHeader.tsx` | `StudioPresenceStack`, `StudioShareControl`, `StudioPanelToggle`, `StudioActionButton`, `StudioIconAction` — every header control. |
| `StudioRightPanel.tsx` | The floating Status/History/Team panel. |
| `useStudioPanel.ts` | Collaborator list + status history + invite/remove state, parameterized only by two API paths. |
| `useUnsavedChangesGuard.ts` | `beforeunload` protection for a dirty flag. |

**The viewport contract.** `StudioEditorBody`'s `<main>` is the one element that owns top clearance,
scroll (`overflow-y-auto`), and horizontal centering — together, on the same element. A workspace
never places its own padding or `overflow` anywhere; it only sets `toolbarClearance` (`true` when
its canvas mounts ArcadeEditor's floating toolbar, `false` otherwise) and its own `max-w-[Npx]`
wrapper for width. This is what the header-overlap/scrollbar bug traced back to in the prior
audit: padding and scroll ownership were split across different elements, or combined
order-dependently, per workspace. Pinned by `StudioShell.test.tsx`.

## Workspaces (`apps/creator/studio/workspaces/`)

```
workspaces/
├── content/                     Shared editing engine for Course + Event
│   ├── ContentEditorRuntime.tsx  the engine: tree, lesson editing, history, collab, exams
│   ├── SessionSettingsDialog.tsx Event's day-schedule dialog (owned by Event, lives here for now)
│   ├── types.ts                  ContentDataAdapter contract
│   └── adapters/
│       ├── CourseAdapter.ts
│       └── EventAdapter.ts
├── course/
│   └── CourseWorkspace.tsx       Course's adapter + category selector + submit/back — 107 lines
├── event/
│   └── EventWorkspace.tsx        Event's adapter + day dialog + submit/back — 100 lines
└── exam/
    ├── ExamWorkspace.tsx
    ├── QuestionEditorCard.tsx, QuestionListPreview.tsx
    └── management/               plans, pools, preview, settings, attempts
```

### Why Course and Event share a runtime but Exam doesn't

Course and Event decompose into the *same shape*: a root item containing containers
(Modules/Days) of document leaves (Lessons), plus optional root-level badges, edited with the same
rich-text engine, saved through the same Y.Doc/version-history machinery. That sameness is real,
not superficial — `ContentEditorRuntime` is ~1,350 lines of tree CRUD, Y.Doc bootstrap, autosave,
version snapshots, and exam-attachment handling that is **byte-identical in behavior** for both,
gated entirely through the `ContentDataAdapter` interface (already established in a prior phase)
and a handful of named slots for the few things that differ.

Exam decomposes into a genuinely different shape — Question Bank Sections of Questions, plus Pools
and Plans that have no lesson/module analogue — so it correctly has its own workspace with no
runtime in common with Course/Event beyond Studio Core itself.

### CourseWorkspace

Owns: `CourseAdapter` instantiation, the category selector (Course-only setting), submit API call
(`PATCH /api/courses/{id}` + `POST .../submit`), back-navigation target
(`/studio/content/course/{id}`), and the initial category value from the bootstrap load (via
`onLoaded`). Nothing else — no tree logic, no lesson editing, no history.

### EventWorkspace

Owns: `EventAdapter` instantiation, `SessionSettingsDialog` (the day-schedule editor — creating or
renaming a "Day" means editing a real schedule, which is why Event needs a dialog Course doesn't),
the header's Day-Settings icon and "Manage" button, submit API call (`submitEvent`), and back
target (`/studio` — preserved exactly as it was pre-migration; not something this refactor changed).

The one piece of real coupling: `SessionSettingsDialog`'s `onSaved` needs to update the runtime's
internal sidebar cache after a save that goes through the dialog's own endpoint, not the runtime's
`renameContainer`. Solved with an imperative handle (`ContentEditorRuntimeHandle.renameContainerLocally`)
— the same pattern `ArcadeEditorHandle` already uses for "an external caller needs to poke internal
editor state." The runtime never knows `SessionSettingsDialog` exists.

### ExamWorkspace

Unchanged from the prior phase. Uses the same Studio Core (`StudioEditorFrame/TopBar/Body`,
`StudioHeader`, `StudioRightPanel`, `useStudioPanel`) as Course/Event. Question Bank Sections
remain the only section concept — there is no separate "Exam Section." Plans, Pools and Selection
Rules are configuration entities, not enums.

## The `ContentEditorRuntime` composition contract

Composition via named props, not a config object or a `contentType` switch:

```tsx
<ContentEditorRuntime
  adapter={adapter}                 // which content type — the one real seam
  contentId={id}
  backHref={backHref}               // where "Back" goes
  onSubmit={onSubmit}                // the actual submit API call
  onLoaded={onLoaded}                // seed workspace-owned state from the initial load
  headerExtras={(state) => ({ beforeSubmit, afterSubmit })}  // extra header buttons
  sidebarExtras={<...>}              // extra sidebar controls (Course's category picker)
  onContainerCreated={(c) => {...}}  // react to a new Module/Day (Event auto-opens its dialog)
  extraDialogs={<...>}               // workspace-owned dialogs (Event's day schedule)
  copy={{ noContainers, canvasTitle, canvasDescription }}
/>
```

Seven named slots, each traceable to one specific divergence found by auditing the original
2,110-line file — not booleans, not a generic factory. `adapter` is the only thing that says "which
content type this is"; the runtime itself contains **zero `contentType` checks** (verified by test).

## Save lifecycle

One conceptual state — `idle → dirty → saving → saved/error` — expressed per-domain rather than
through one shared persistence call:

- **Course/Event lessons**: `ArcadeEditor`'s 2s-idle autosave → `adapter.saveLeafDocument`
  (Document/Y.Doc). A `SaveStatusFooter` (external store, no re-render) shows status.
- **Exam questions**: the question-authoring engine's own debounced save → whole-section replace.
  `SaveIndicator` shows status.
- **Dirty-state guard**: `hasDraftChanges` was previously set on every mutation but never read —
  a real gap. `useUnsavedChangesGuard` (Studio Core) now warns on tab close/refresh whenever it's
  true, for any workspace that tracks a boolean dirty flag.

## History

Real, backend-persisted version history (`VersionHistoryOrchestrator` → `documents`/`document_versions`)
exists for Course and Event lessons — unchanged, still gated by `activeLessonId`. **Exam has no
equivalent and none is faked.** Its History/Team tabs render `unavailableNotes` explaining exactly
why (`ExamWorkspace.tsx`): questions aren't `Document` rows, and the collaboration server rejects
any document name not prefixed `lesson:`. Making Exam question editing produce real persisted
history requires a `Document.ContentType` enum addition and a question-save-path change — a
backend decision, not something to invent frontend-side. See **Remaining backend limitations**.

## Collaboration

Centralized presence/connection-state UI (`StudioPresenceStack`), but real-time collaboration
itself only exists where the backend supports it: lessons, via Hocuspocus keyed `lesson:{id}`.
Exam renders the same presence component with an empty collaborator list — honest about having
none, not a fake connection indicator.

## Publishing

Not unified into one lifecycle, deliberately — Course and Event go through a review workflow
(`submit → status`), Exam self-publishes an immutable `ExamVersion`. `onSubmit` is the seam: the
runtime calls it and updates `status` from the result; each workspace decides what "submit" means
for its own domain.

## Routing

Unchanged. `/studio/course/[courseId]/edit`, `/studio/events/[id]/edit`,
`/studio/exam/[examId]/edit` all still resolve — each route page is now a thin wrapper rendering
the corresponding workspace directly (`CourseWorkspace`/`EventWorkspace`/`ExamWorkspace`) instead
of one shared orchestrator branching on a `contentType` prop.

## Adding a new workspace

1. Decide whether the new content type's editing shape matches Course/Event's (container → leaf
   documents) or is genuinely different (like Exam).
2. If it matches: write a `ContentDataAdapter` implementation and a thin `<X>Workspace.tsx` that
   instantiates it and fills in `backHref`/`onSubmit`/`copy` — no runtime changes needed.
3. If it's genuinely different: build a new workspace under `studio/workspaces/<x>/` that imports
   only from `studio/core/` (`StudioEditorFrame/TopBar/Body`, `StudioHeader`, `StudioRightPanel`,
   `useStudioPanel`) — exactly as `ExamWorkspace` does.
4. Either way: **never** import from another workspace's directory, and **never** add a branch to
   Studio Core.

## Architectural rules

- Studio Core must not import workspaces. (Enforced by `ContentEditorRuntime.test.tsx`.)
- Workspaces may depend on Studio Core; never on each other's internals.
- Domain-specific behavior belongs to the workspace (or its adapter); generic editor
  infrastructure belongs to Studio Core.
- No `contentType === ...` branching in shared code — express the difference as a named prop or an
  adapter method instead.
- Do not duplicate the Studio shell. There is exactly one `StudioEditorFrame`/`TopBar`/`Body`.

## Remaining backend limitations (not solved in this phase — frontend cannot solve them alone)

1. **Exam history.** `Document.ContentType` has no exam/question member, and question prompts are
   fields on `question_bank_questions` rows, saved via whole-section replace. Real version history
   for a question needs a schema change plus a save-path change — deliberately not attempted
   frontend-only.
2. **Exam collaboration.** The Hocuspocus server hard-rejects any document name not prefixed
   `lesson:`. Real-time collaborative question editing needs that allow-list extended and a
   `Document` row per question, contingent on (1).
3. **Reproducibility.** `ExamVersion`/`StudentExamPaper` immutability is unaffected by this phase
   — this migration touched no exam persistence.

## Remaining frontend limitations

- `ContentEditorRuntime` at ~1,350 lines is still large — it is the honest size of "everything
  Course and Event's lesson/module/badge/history/collaboration engine actually does," not
  artificially inflated, but a future pass could split it further (e.g. extract the sidebar tree
  JSX into its own presentational component) if it keeps growing.
- `SessionSettingsDialog` and the `ContentDataAdapter` contract still live under
  `workspaces/content/` even though the dialog is Event-only; it wasn't moved into
  `workspaces/event/` to avoid an unnecessary import-path churn beyond what this phase already
  changed. A future cleanup could relocate it.
