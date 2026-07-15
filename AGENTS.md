<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Architecture (where does my code go?)

Modular monolith, **sliced by domain, layered within**. Same 8 domains + a shared kernel on both repos (`arcade` frontend `features/<slug>`, `arcade-backend` `com.arcade.backend.<slug>`).

**Domains** (dependency flows top→down, never up/sideways):
`identity` (auth/accounts/RBAC/audit) → `organizations` (owner+authors) → `content` (course tree + **editor-engine**, the working copy) → `publishing` (immutable version snapshots + review) → `learning` (enroll/deliver/progress) → `assessment` (quizzes/exams/banks) → `certification`; `discovery` (public catalog/search/profiles) reads published output.
**Foundation** (shared kernel, depends on no domain): backend `common config security storage email`; frontend `components/ui lib hooks types config styles`.

**Laws — do not violate:**
- A domain owns its tables; only its code touches them. Reference other domains **by ID**, never JPA relations/cross-domain model imports. Call another domain via its **service interface** (backend) / feature public surface (frontend), never its internals.
- `learning`/`discovery` read **published snapshots**, never the author's working copy or drafts. Delivery never loads Tiptap (renderer = structured JSON contract).
- Server content JSON is a **read/publish projection, not the write model** (keeps the Phase-2 Yjs write model clean).
- New feature → decide its domain first. New domain only if it owns data + one team + own vocabulary; else it's a submodule. `app/` composes, `features/` implements.

**Current state:** `content` (editor-engine) is the live/built domain; others are scaffold/backend-only. `EnrolledCourse`/`Certificate` currently misfiled under backend `user/` → belong in `learning`/`certification`.

Full detail (submodules, per-domain owns/must-not, migration): **`docs/platform-architecture.md`**. Read it before structural work; don't restate it here.
