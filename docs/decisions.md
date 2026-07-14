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
