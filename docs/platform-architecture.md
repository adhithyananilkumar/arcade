# Arcade Platform Architecture — Domain-Driven Feature Design

> **Status:** Reference architecture (target state). Design-approved, incrementally adopted.
> **Scope:** Both repositories — `arcade` (Next.js frontend) and `arcade-backend` (Spring Boot backend).
> **Branch context:** authored on `content-management` while the content editor-engine is being built.
> **Last updated:** 2026-07-15.

This document is the **single, authoritative map of how the Arcade platform is
organized into domains, modules, and submodules** — and the rules that keep those
boundaries clean as the platform grows toward a large, Coursera-scale learning system.

It is deliberately a *documentation* deliverable: it describes the **target
architecture and the laws that govern it**, and maps that target onto the code that
exists today. It does **not** move code. Physical reorganization happens incrementally,
module by module, guided by §11.

**Read this if you are:**
- deciding *where a new feature belongs* (§3, §4),
- building inside an existing module and need to know *what it may and may not touch* (§4, §8),
- reviewing a PR for architectural drift (§8, §9, §12),
- onboarding onto a capability team (§3, §10).

### Related documents (do not duplicate — link)
| Document | Owns |
|---|---|
| `arcade/docs/architecture.md` | The **domain narrative** — users, ownership, content, approval, examination, certificates (the *what*). |
| `arcade-backend/docs/content-platform-architecture.md` | The **live data model & runtime flows** for the content editor (the *how it runs today*). |
| `arcade/docs/decisions.md` / `arcade-backend/docs/*` | ADRs and per-topic backend guides. |
| `arcade/docs/roadmap.md` | Capability teams and delivery sequencing. |
| **This document** | The **structural contract** — module boundaries, submodules, dependency rules, physical layout (the *where and the rules*). |

---

## Table of contents

1. [Purpose & goals](#1-purpose--goals)
2. [Architectural style & first principles](#2-architectural-style--first-principles)
3. [The capability map — platform domains](#3-the-capability-map--platform-domains)
4. [Domain catalog (deep dive per domain)](#4-domain-catalog)
5. [Platform Foundation (the shared kernel)](#5-platform-foundation--the-shared-kernel)
6. [Physical layout — backend](#6-physical-layout--backend)
7. [Physical layout — frontend](#7-physical-layout--frontend)
8. [Boundary & dependency laws](#8-boundary--dependency-laws)
9. [Naming & organization conventions](#9-naming--organization-conventions)
10. [Ownership & team mapping (Conway alignment)](#10-ownership--team-mapping)
11. [Current → target: gap analysis & migration](#11-current--target-gap-analysis--migration)
12. [Governance — adding a domain or submodule](#12-governance--adding-a-domain-or-submodule)
13. [Appendices](#13-appendices)

---

## 1. Purpose & goals

Arcade is an educational platform where anyone can enroll as a learner while
organizations and individuals publish courses, workshops, webinars, and articles
through a review-gated pipeline (see `docs/architecture.md`). At Coursera scale the
platform will host many independently evolving capabilities — authoring, review,
delivery, assessment, examination, certification, discovery — each with its own data,
rules, and release cadence.

This architecture exists to make that scale **manageable by many teams at once**. Its
goals, in priority order:

1. **One home for every concept.** Every feature has exactly one obvious module. No
   feature is split across two modules; no two modules both "sort of" own a concept.
2. **Independent maintainability.** A module can be understood, changed, tested, and
   (eventually) deployed with minimal knowledge of the internals of other modules.
3. **Loose coupling, high cohesion.** Modules talk through **narrow, explicit
   interfaces**, never through each other's internals or database tables.
4. **Parallel development.** Capability teams (see `roadmap.md`) work in their own
   module trees with few merge collisions.
5. **A clean path to extraction.** The system is a *modular monolith* today. Boundaries
   are drawn so that any single domain could be lifted into its own service later with
   minimal refactoring — without forcing that cost now.

Non-goals: microservices today, premature infrastructure, or speculative modules for
features not on the roadmap. Structure follows the domain, and the domain follows
`docs/architecture.md`.

---

## 2. Architectural style & first principles

### 2.1 Style: a modular monolith, sliced by capability

Both repositories are **modular monoliths organized by business capability, not by
technical layer.** Everything about a capability — its UI, its API, its business rules,
its persistence — lives together inside that capability's module. Technical layers
(controller/service/repository on the backend; components/hooks/api on the frontend)
exist *inside* each module, not as top-level folders that everything shares.

This is already the established direction in both repos and is reaffirmed here:

- Backend: *"organized by feature, not by layer … isolate business domains"*
  (`arcade-backend/docs/architecture.md`, `project-structure.md`).
- Frontend: `features/` holds *"business features and modules … each feature
  encapsulates its own components, hooks, and utils"* (`arcade/docs/folder-structure.md`).

### 2.2 Domain-Driven Design, applied pragmatically

We use DDD's **bounded context** idea as the tool for drawing module lines: each domain
is a bounded context with its own model and vocabulary. We do **not** adopt heavyweight
tactical DDD (aggregates-as-ceremony, mandatory CQRS/event-sourcing) except where a
concrete requirement demands it — the content **versioning/approval** context is the one
place we already lean into immutable snapshots and explicit state, because the
requirements force it (see `decisions.md` → *"Content approval workflow via immutable
version snapshots"*).

### 2.3 The nine laws (summary — enforced in §8)

1. **Package/feature by domain**, layer *within* the domain.
2. **A domain owns its data.** Only its code reads or writes its tables.
3. **No cross-domain entity linking.** Reference other domains **by ID**, not by JPA
   relationship or a foreign import of their model. (`arcade-backend/docs/architecture.md`.)
4. **Talk through the public interface.** A domain exposes a service/API contract;
   callers depend on that, never on its `repository`/`model`/internal components.
5. **Dependencies point one way.** Follow the dependency graph (§3.3). No cycles.
6. **The shared kernel is tiny and stable.** Cross-cutting code lives in a named
   foundation (§5); domains depend on it, it depends on no domain.
7. **The renderer contract is sacred.** Learner-facing content is consumed as
   structured JSON, decoupled from the authoring editor (see §4.3, AGENTS.md).
8. **Server JSON is a read/publish projection, not the write model.** Do not build
   logic that assumes otherwise, so the Phase-2 Yjs write model stays clean
   (`docs/architecture.md` §10.3).
9. **Conway alignment.** One capability team owns one domain end-to-end, UI→DB (§10).

### 2.4 Why this scales

Cohesion means a change to "how examinations are proctored" touches one module.
Loose coupling means that change cannot silently break certification. Reference-by-ID
and interface-only calls mean any domain can later be pulled into its own service by
replacing an in-process service call with a network call — the boundary is already the
same shape. This is the explicit rationale in the backend architecture doc's *"Future
Scalability"* section, generalized here to the whole platform.

---

## 3. The capability map — platform domains

### 3.1 The domains

Arcade is divided into **eight product domains** plus **one platform foundation**. These
map 1:1 to the capability teams already defined in `roadmap.md`, formalized here with
submodules and boundaries.

| # | Domain | Slug | One-line responsibility |
|---|---|---|---|
| D1 | **Identity & Access** | `identity` | Who you are, how you prove it, and what you're allowed to do. |
| D2 | **Organizations & Creators** | `organizations` | Institutions and independent creators; content ownership & authorship. |
| D3 | **Content Authoring** | `content` | Creating and structuring content: the course tree and the editor-engine. |
| D4 | **Review & Publishing** | `publishing` | Turning a draft into approved, published content via versioned review. |
| D5 | **Learning Experience** | `learning` | Enrollment, delivery/consumption, and progress after publish. |
| D6 | **Assessment & Examination** | `assessment` | Quizzes, assignments, question banks, secure exams, evaluation. |
| D7 | **Certification** | `certification` | Issuing and verifying certificates for completed, assessed content. |
| D8 | **Discovery & Public** | `discovery` | Everything visible without logging in: catalog, search, public profiles, landing. |
| F0 | **Platform Foundation** | `platform` | Cross-cutting shared kernel: security infra, media/storage, notifications, audit, config, design system, API contract. |

> **Naming note.** The roadmap uses long capability names; this document uses the short
> `slug` as the canonical module identifier (backend package name and frontend `features/`
> folder name). The existing frontend folders `features/{auth,users,admin}` collapse into
> `identity`; `certificates` → `certification`; `content` stays; new folders
> `publishing`, `learning`, `assessment`, `discovery`, and shared foundation appear as
> the domains are built. See the mapping in §13.3.

### 3.2 Domain vs. submodule

- A **domain** is a bounded context and a top-level module (one backend package, one
  frontend `features/` folder). It is what a team owns.
- A **submodule** is a cohesive slice *inside* a domain — its own folder, its own
  responsibility, but sharing the domain's data ownership and public interface. Submodules
  are how a large domain (Content, Assessment) stays navigable without fragmenting
  ownership.

The rest of §4 defines every domain's submodules.

### 3.3 Dependency graph

Dependencies flow **downward only**. A domain may depend on domains below it and on the
Foundation; it may **never** depend upward or sideways in a way that creates a cycle.

```text
                        ┌─────────────────────────────┐
                        │  F0  Platform Foundation     │  (shared kernel — depended on
                        │  security · media · notify   │   by everything, depends on
                        │  audit · config · ui · api   │   nothing above it)
                        └─────────────▲───────────────┘
                                      │ (every domain may use Foundation)
   D1 Identity & Access  ────────────┤
        │                            │
        ▼                            │
   D2 Organizations & Creators ──────┤
        │                            │
        ▼                            │
   D3 Content Authoring ─────────────┤
        │                            │
        ├───────────────► D4 Review & Publishing
        │                        │
        ▼                        ▼
   D5 Learning Experience   D8 Discovery & Public
        │
        ▼
   D6 Assessment & Examination
        │
        ▼
   D7 Certification
```

Reading the graph:
- **D1 Identity** is the foundation domain — everything above the platform kernel depends
  on it, it depends on nothing but the kernel.
- **D3 Content** depends on D1 + D2 (needs an owner and an author).
- **D4 Publishing** consumes the working copy D3 produces; **D5 Learning** and **D8
  Discovery** consume what D4 *publishes* (they read published snapshots, never the
  author's working copy).
- **D6 Assessment** attaches to published content and feeds outcomes to **D7
  Certification**.

This is the graph in `roadmap.md`, made into an enforceable dependency rule.

---

## 4. Domain catalog

Each domain below is specified with a fixed template:

- **Responsibility / bounded context** — the one sentence that decides what belongs here.
- **Submodules** — the cohesive slices inside it.
- **Owns (data)** — the tables/state only this domain may read/write.
- **Backend package** / **Frontend feature** — physical home.
- **Public interface** — what it exposes to other domains.
- **Depends on** — allowed downstream dependencies.
- **Must NOT** — the anti-overlap guardrails.
- **Today** — current implementation status, grounded in the code.

---

### 4.1 D1 — Identity & Access (`identity`)

**Responsibility.** Establish *who a principal is* and *what they may do*. Owns the
canonical account, authentication and session lifecycle, the role/permission (RBAC)
model, and the security audit trail. It is the platform's root of trust.

**Submodules.**
| Submodule | Responsibility |
|---|---|
| `accounts` | The canonical `User` — email, name, credentials, lifecycle/lockout flags. The identity, not the public profile (profiles live in D8). |
| `authentication` | Login, registration, JWT issue/refresh/rotation, sessions, password reset, email verification, OAuth2 sign-in. |
| `access-control` | Roles, permissions, role↔permission and user↔role assignment; policy/authorization decisions. |
| `audit` | Security-relevant history: login history and audit log of sensitive actions. |

**Owns (data).** `users`, `refresh_tokens`, `email_verification_tokens`,
`password_reset_tokens`, `roles`, `permissions`, `role_permissions`, `user_roles`,
`login_history`, `audit_logs`.

**Backend package.** `com.arcade.backend.identity.*` (target) — today split across
`auth/`, `user/`, `role/`, `permission/`, `audit/`. The reusable **security
infrastructure** (`security/` — JWT filter, `SecurityConfig`, rate limiting,
`CustomUserDetails`) is a *Foundation* concern that implements Identity's policy; see §5.

**Frontend feature.** `features/identity/*` (target) — today `features/auth`,
`features/users`, part of `features/admin`. Login/register live under
`app/(auth)/`; account settings under the authenticated dashboard.

**Public interface.**
- Backend: an authentication API (`/api/v1/auth/*`) and, for other domains, a narrow
  contract to *resolve the current principal* and *check a permission* — never direct
  access to `UserRepository`. Other domains receive the caller as
  `@AuthenticationPrincipal CustomUserDetails` and ask access-control for authorization.
- Frontend: the API client's auth/token handling (`lib/auth.ts`, `lib/api.ts`) and the
  route `AuthGuard`.

**Depends on.** Platform Foundation only.

**Must NOT.**
- Own public-facing profile presentation (that is D8 Discovery / Profiles).
- Embed content, org, or learning logic. Membership *of an org* is D2's data; Identity
  only knows the account.

**Today.** 🟢 Live: login/refresh/rotation, ownership-based authz. ⚪ Idle: RBAC tables
exist but are unseeded and unused (authz is ownership-based today). Email verification &
password reset are backend-only (no UI). See `content-platform-architecture.md` §1.3, §2.

---

### 4.2 D2 — Organizations & Creators (`organizations`)

**Responsibility.** Model the **entities that own content** and the **people credited as
authors**. Institutions (e.g. a college), their internal membership and admin roles,
independent creators, and the **ownership/authorship rule** that governs all content.

**Submodules.**
| Submodule | Responsibility |
|---|---|
| `organizations` | The org entity, its settings, and org-level admin roles (distinct from platform admins). |
| `memberships` | Who belongs to which org, in what internal role. |
| `invitations` | Onboarding members and creators into an org. |
| `ownership` | The `owner_type/owner_id` + `authors[]` model applied to any content (see `docs/architecture.md` §3). Cross-cutting policy this domain defines and others honor. |

**Owns (data).** `organizations`, `organization_memberships`,
`organization_invitations`. The **ownership fields** on content (`owner_type`,
`owner_id`, `authors`) are defined by this domain's rules but physically live on
Content's tables (see the boundary note below).

**Backend package.** `com.arcade.backend.organization.*` (already exists).

**Frontend feature.** `features/organizations/*` (scaffolded).

**Public interface.** "Is user U a member of org O, and in what role?"; "resolve the
owner of content C to a display entity." Other domains call this; they do not join to
`organization_memberships`.

**Depends on.** D1 Identity, Foundation.

**Must NOT.**
- Store content. It owns *who owns content*, not the content itself.
- Reimplement platform admin (that is D1 access-control + the platform-admin surface in
  D8/Foundation). Org-internal admin roles are separate and live here.

**Boundary note — ownership fields.** Content rows carry `owner_type/owner_id/authors`
so the write path is simple, but the **meaning and rules** (ownership persists after a
member leaves; authorship is permanent credit; edit rights do not persist — see
`docs/architecture.md` §3) are **D2's contract**. D3 stores the fields; D2 defines what
they mean. This is the one intentional shared field-set, documented here to prevent it
becoming an accidental overlap.

**Today.** 🟡 Backend-only. Full `OrganizationService` exists; no frontend drives it on
this branch.

---

### 4.3 D3 — Content Authoring (`content`)

*The largest domain.* This is where the current branch's work — the **editor-engine** —
lives.

**Responsibility.** Let creators **produce and structure** content: the course tree
(Course → Module → Lesson), the rich-content editor, and the durable autosave of
in-progress work. It owns the **working copy** — the live, mutable content the author
edits. It does **not** own review, publishing, or delivery.

**Submodules.**
| Submodule | Responsibility |
|---|---|
| `structure` | The content tree: courses, modules, lessons, ordering; the four content *types* (Course, Workshop, Webinar, Article — all built from the same building blocks, `docs/architecture.md` §4). |
| `editor-engine` | The authoring editor: Tiptap schema, extensions, toolbar, editor React hooks/state, and the **Yjs** substrate. Authoring-only — learners never load it. |
| `drafts` | Durable autosave: the debounced write path and the `content_drafts` buffer (`content-platform-architecture.md` §4). |
| `renderer-contract` | The structured-JSON contract that decouples authored content from how it is displayed (see below). The renderer *implementation* for learners is D5; the *contract* is defined here. |
| `assets` | References to media used in content. The bytes live in Foundation `media`; this submodule owns the linkage. |

**Owns (data).** `courses` (incl. `deleted_at` soft-delete), `modules`, `lessons`
(incl. `body` JSONB), `content_drafts`.

**Backend package.** `com.arcade.backend.content.*` — already structured
`controller/ · service/ · model/ · dto/ · repository/` (the reference implementation of
the layered-within-feature pattern).

**Frontend feature.** `features/content/*` — already the most-built feature:
`content/course/components/CourseEditorShell.tsx` (the shell) and
`content/editor/{components,extensions,hooks,lib,styles}` (the editor-engine). Routes
under `app/(authenticated)/dashboard/content/`.

**Public interface.**
- To D4 Publishing: "materialize the current working copy of course C as a serializable
  tree" (used to freeze a version snapshot).
- To D5 Learning / D8 Discovery: **nothing directly** — they read *published snapshots*
  from D4, not the working copy. This is a hard rule (law #7/#8).

**Depends on.** D1 Identity (author/owner), D2 Organizations (ownership rules),
Foundation (media, editor deps).

**The editor-engine (current work) — architectural anchors.**
- **Two-level tree only:** Module → Lesson (no `chapters`). (`content-platform-architecture.md` §3.3.)
- **Authoring vs. reading are separate models.** Tiptap authors; a pre-rendered
  read-only view consumes structured JSON. The **renderer JSON contract is stable**
  regardless of the write model (AGENTS.md; `docs/architecture.md` §10).
- **Persistence is phased.** Phase 1: debounced REST autosave + localStorage fallback,
  `content_drafts` as the buffer. Phase 2: **Yjs (CRDT) becomes the authoritative write
  model**, JSON becomes a *derived read model*, synced via a **Hocuspocus Node sidecar**.
  (`decisions.md` → editor persistence ADR.)
- **Guardrail (law #8):** until Phase 2, do not build logic that treats server-side JSON
  as the authoritative *write* model. Treat `lessons.body` as a read/publish projection.

**Must NOT.**
- Decide *what learners see*. Publishing state is D4; delivery is D5.
- Implement the review workflow, version snapshots, or the `published_version_id`
  pointer — those are **D4**, even though they read D3's working copy.

**Today.** 🟢 The live domain on this branch. Editor + autosave + soft-delete/trash work.
Known gap: content lives in `content_drafts`; `lessons.body` is not yet populated, so the
"commit working copy → `lessons.body`" step is a prerequisite for publishing
(`content-platform-architecture.md` §4.3).

---

### 4.4 D4 — Review & Publishing (`publishing`)

**Responsibility.** Turn an author's working copy into **approved, published content**
through a **versioned review workflow**. Owns immutable version snapshots, submissions,
the reviewer decision flow, and the `published_version_id` pointer that defines "what
learners see."

**Submodules.**
| Submodule | Responsibility |
|---|---|
| `versioning` | Immutable `course_versions` snapshots (frozen JSON trees) created at submit/publish checkpoints. |
| `submissions` | `course_submissions` review records and their lifecycle (PENDING → APPROVED / CHANGES_REQUESTED / REJECTED / SUPERSEDED). |
| `review-workflow` | Submit, supersede, reviewer pickup, decision; the ≤1-PENDING-per-course invariant. |
| `moderation` | Content moderation actions available to platform reviewers. |

**Owns (data).** `course_versions`, `course_submissions`, and the
`courses.published_version_id` pointer (a Content-owned column whose *transitions* only
D4 may perform — see boundary note).

**Backend package.** `com.arcade.backend.publishing.*` (target) — today a stub: the
one-line `submitCourse` status flip lives in `content/service/CourseService`. The ADR
already names the touch-points for extraction (`decisions.md`).

**Frontend feature.** `features/publishing/*` (target) — author-facing submit/version
UI in `CourseEditorShell`, plus a **new reviewer dashboard** (does not exist yet).

**Public interface.** To D5/D8: "give me the published snapshot of course C"
(read `published_version_id` → `course_versions`). To D3: consumes "materialize working
copy." To Identity: requires a seeded reviewer/admin role.

**Depends on.** D3 Content, D1 Identity (reviewer role), Foundation.

**Must NOT.**
- Mutate the author's working copy. It only **freezes** and **points at** snapshots.
- Overload a single `courses.status` string — publication state and review state are
  **orthogonal** (`decisions.md`).

**Boundary note — `published_version_id`.** The column sits on `courses` (D3's table) for
locality, but **only D4 advances it**, and only on approval. This is the "publish" seam;
document any code that writes it and keep it in D4's service.

**Today.** ⚪ Design-approved, build-deferred. Prerequisites: seed a reviewer role
(D1 RBAC is empty), build the reviewer UI, and the D3 "commit working copy → `lessons.body`"
step. Next migration is **V12** (`decisions.md`, and V12 exists on this branch for version
history — confirm before assigning).

---

### 4.5 D5 — Learning Experience (`learning`)

**Responsibility.** Everything a learner does **after content is published**: enroll,
consume the read-only rendered content, and track progress/completion — including live
session attendance for scheduled formats.

**Submodules.**
| Submodule | Responsibility |
|---|---|
| `enrollment` | Enrolling/registering a learner in a course/workshop/webinar. |
| `delivery` | The **read-only content renderer** that consumes the published structured-JSON snapshot (implements D3's renderer-contract; never loads Tiptap). |
| `progress` | Progress and completion tracking per learner per content. |
| `attendance` | Live/scheduled session attendance (online or in person). |

**Owns (data).** `enrolled_courses` (today), plus future progress/attendance tables.

**Backend package.** `com.arcade.backend.learning.*` (target; scaffolded name in
`structure.md`). Enrollment currently lives under `user/EnrolledCourse.java` and should
move here.

**Frontend feature.** `features/learning/*` (scaffolded). Public consumption routes under
`app/(public)/courses/` and a learner dashboard.

**Public interface.** "Is learner L enrolled in C?"; "mark C complete for L" (consumed by
D7 Certification eligibility).

**Depends on.** D4 Publishing (reads published snapshots), D3 renderer-contract, D1, Foundation.

**Must NOT.**
- Read the author's working copy or drafts. It reads **published versions** only.
- Load the authoring editor-engine. Delivery is a separate, read-only renderer (law #7).

**Today.** 🟡 `enrolled_courses` is backend-only, currently under the `user` package;
no learner UI on this branch.

---

### 4.6 D6 — Assessment & Examination (`assessment`)

**Responsibility.** All evaluation: lightweight in-content assessment and high-stakes
secure examination. Kept as **one domain** because they share the question model and
outcome pipeline, split into clear submodules (per `roadmap.md`).

**Submodules.**
| Submodule | Responsibility |
|---|---|
| `quizzes` | In-content quizzes. |
| `assignments` | File-upload / written / form-based submissions. |
| `question-bank` | Per-course question banks and weight-distribution selection rules (`docs/architecture.md` §6). |
| `exams` | Certification/scheduled exam sessions and attempts. |
| `integrity` | Anti-cheat: browser restrictions, tab-switch detection, proctoring signals (`docs/architecture.md` §7). |
| `evaluation` | Auto and manual/reviewer-based grading and results. |

**Owns (data).** Question banks, quizzes, assignments, exam sessions/attempts, results
(future tables).

**Backend package.** `com.arcade.backend.assessment.*` (target; scaffolded name).

**Frontend feature.** `features/assessment/*` (scaffolded).

**Public interface.** "Did learner L pass the graded requirements of course C?" — the
signal D7 Certification consumes.

**Depends on.** D3/D4 (assessment attaches to published content), D5 (an enrolled
learner), D1, Foundation (media for uploads, integrity signals).

**Must NOT.**
- Issue certificates (that is D7). It produces *outcomes*; D7 decides eligibility and issues.
- Own content structure — a quiz *references* a lesson/course by ID; it does not embed the tree.

**Today.** ⚪ Scaffolding only.

---

### 4.7 D7 — Certification (`certification`)

**Responsibility.** Issue **verifiable certificates** when a learner completes eligible
content and its assessments, and provide independent public verification.

**Submodules.**
| Submodule | Responsibility |
|---|---|
| `issuance` | Generate a certificate from a (learner, content, outcome) tuple. |
| `templates` | Certificate templates/branding. |
| `verification` | Public, independently verifiable certificate lookup. |
| `history` | A learner's certificate history. |

**Owns (data).** `certificates` (today under `user/`), plus templates/verification tables.

**Backend package.** `com.arcade.backend.certification.*` (target). Certificate entity
currently under `user/Certificate.java` and should move here.

**Frontend feature.** `features/certification/*` (rename of scaffolded `features/certificates`).

**Public interface.** "Issue a certificate for (L, C)"; "verify certificate X" (public).

**Depends on.** D6 Assessment (pass signal), D5 Learning (completion), Foundation (media
for PDF/render). Open question: does a certificate reference a specific *content version*?
(`docs/architecture.md` §12.)

**Must NOT.** Decide pass/fail (that is D6) or gate content (D4/D5). It only issues and verifies.

**Today.** 🟡 `certificates` table is backend-only, under `user`.

---

### 4.8 D8 — Discovery & Public (`discovery`)

**Responsibility.** Everything visible **without logging in**: the public catalog,
search/browse, public profiles (learner, creator channel, org page), landing pages, and
SEO/discovery surfaces.

**Submodules.**
| Submodule | Responsibility |
|---|---|
| `catalog` | Public listing of published content. |
| `search` | Search and discovery/browse pages. |
| `profiles` | Public profiles — learner achievements, creator channels, org pages (`docs/architecture.md` §9). |
| `landing` | Marketing/landing pages and SEO. |

**Owns (data).** Primarily a **read/projection** domain — it reads published content
(D4), profiles (composed from D1 accounts + D2 orgs + D7 certificates), and enrollment
counts. It may own search-index/denormalized projection tables, but no source-of-truth
domain data.

**Backend package.** `com.arcade.backend.discovery.*` (target).

**Frontend feature.** `features/discovery/*` (target) plus routes under `app/(public)/`
(`courses/`, `landing/` scaffolded).

**Public interface.** Public, unauthenticated read APIs and pages.

**Depends on.** D4 Publishing, D2 Organizations, D7 Certification, D1 (profile basics),
Foundation.

**Must NOT.**
- Expose unpublished/working content. It reads **published snapshots** only.
- Own the profile's underlying data — it *composes* a public view from owning domains.

**Boundary note — Profiles.** Public profile *presentation* is D8. The underlying facts
are owned elsewhere: the account (D1), org membership/authorship (D2), certificates (D7),
learning achievements (D5). D8 composes; it does not duplicate.

**Today.** ⚪ Scaffolding (`app/(public)/courses`, `landing`).

---

## 5. Platform Foundation — the shared kernel

The Foundation (`platform` / backend `common` + `config` + `security` + `storage` +
`email`; frontend `components/ui` + `lib` + `hooks` + `types` + `config` + `styles`) is
the **shared kernel**: cross-cutting capabilities every domain may use. It is
deliberately **small and stable**, and it **depends on no product domain** (law #6).

| Foundation module | Backend | Frontend | Responsibility |
|---|---|---|---|
| **Security infra** | `security/` (JWT filter, `SecurityConfig`, rate limiting, `CustomUserDetails*`) | `lib/auth.ts`, `AuthGuard`, `lib/api.ts` auth | Mechanism that *enforces* D1's policy. Infra, not policy. |
| **Media & Storage** | `storage/FileStorageService` | upload components | Store/serve file bytes. Domains store *references*; bytes live here. |
| **Notifications** | `email/*` | — | Transactional email (verification, review notices). Extensible to in-app later. |
| **Audit sink** | (`audit/` write side) | — | Append-only audit/log writing used by D1 and others. |
| **Common** | `common/entity/BaseEntity`, `common/exception/*`, `ErrorResponse`, `GlobalExceptionHandler` | `types/api.ts`, error handling | Base entity, exception hierarchy, uniform API response/error contract. |
| **Config** | `config/` (`CorsConfig`, `OpenApiConfig`), `application*.yml`, Flyway migrations | `config/`, `components.json` | Global configuration, API docs, DB migration ownership. |
| **API contract** | DTO conventions, `api-response-format.md` | `lib/api.ts` client, `types/api.ts` | The request/response envelope and the typed client all domains use. |
| **Design system** | — | `components/ui/*` (shadcn/base-ui), `styles/`, `assets/` | Feature-agnostic UI primitives and design tokens. |

**Rules for the Foundation.**
- **No product logic.** If code knows what a "course" or a "certificate" is, it is a
  domain, not the kernel. (`security/` may know about *users/roles* only as an
  authentication mechanism, not about content.)
- **Stable interfaces.** Changes here ripple everywhere; treat its public surface as an
  API with care.
- **Flyway is single-owner.** Schema is owned entirely by Flyway migrations
  (`ddl-auto: none`); each domain's tables are created by migrations that live in the
  Foundation's migration folder but are *authored by the owning domain's team*
  (`content-platform-architecture.md`).

> **Security is infra, D1 is policy.** A recurring question: does `security/` belong to
> Identity? Split it: the *reusable mechanism* (verify a JWT, populate the security
> context, rate-limit) is Foundation; the *policy* (which roles/permissions exist, what
> they grant) is D1 access-control. Keeping the mechanism in the kernel lets every domain
> receive an authenticated principal without depending on D1's internals.

---

## 6. Physical layout — backend

### 6.1 Package-by-feature, layered within

Root package `com.arcade.backend`. One package per domain; technical layers live inside
each domain. This is the established pattern (`arcade-backend/docs/architecture.md`,
`project-structure.md`) — reaffirmed and extended to all domains.

```text
com.arcade.backend
├── identity/                      # D1  (consolidates today's auth + user + role + permission + audit)
│   ├── accounts/         {controller, service, repository, model, dto, mapper}
│   ├── authentication/   {controller, service, repository, model, dto}
│   ├── accesscontrol/    {controller, service, repository, model, dto}
│   └── audit/            {controller, service, repository, model, dto}
├── organization/                  # D2  (exists)
├── content/                       # D3  (exists — the reference layout)
│   ├── controller/  service/  model/  repository/  dto/
│   └── (submodules: structure, editor support, drafts, assets)
├── publishing/                    # D4  (extract from content: versions, submissions, review)
├── learning/                      # D5  (enrollment/progress; move EnrolledCourse here)
├── assessment/                    # D6  (quizzes, assignments, question-bank, exams, integrity, evaluation)
├── certification/                 # D7  (move Certificate here)
├── discovery/                     # D8  (public catalog/search/profiles)
│
├── common/                        # F0  base entity, exceptions, error contract
├── config/                        # F0  CORS, OpenAPI, app config
├── security/                      # F0  JWT filter, SecurityConfig, rate limiting (mechanism)
├── storage/                       # F0  file storage
└── email/                         # F0  notifications
```

Each domain package uses the same internal layering (`arcade-backend/docs/architecture.md`):

```text
<domain>/
├── controller/   # REST endpoints; HTTP + validation only
├── service/      # business logic (interfaces + impls; constructor injection)
├── repository/   # Spring Data JPA
├── model/        # JPA entities (a.k.a. entity/)
├── dto/          # request/response DTOs
├── mapper/       # entity↔DTO (MapStruct or manual)
└── exception/    # domain-specific errors (extend the common hierarchy)
```

### 6.2 Backend boundary rules (restating the laws physically)

- **Reference across domains by ID**, not JPA relationship. If Assessment needs a course,
  it stores `course_id: Long`, it does not `@ManyToOne Course`. (`architecture.md`,
  principle 3.)
- **Cross-domain calls go through a `service` interface**, never another domain's
  `repository` or `model`. (Principle 4: *"the `learning` module needs user data → it
  interacts with a `UserService` interface, not `UserRepository`."*)
- **No cross-domain entity imports.** A compile-time dependency from `assessment.model`
  on `content.model` is a boundary violation.
- **Constructor injection only** (`@RequiredArgsConstructor`); no field `@Autowired`.

---

## 7. Physical layout — frontend

### 7.1 App Router thin, features thick

Next.js App Router pages are **thin routing/composition shells**; the substance lives in
`features/`. Route groups map to audience, features map to domains.

```text
arcade/
├── app/                                   # routing & composition only
│   ├── (public)/          # unauthenticated → D8 Discovery surfaces
│   ├── (auth)/            # login/register  → D1 Identity surfaces
│   └── (authenticated)/   # dashboard, editor, reviewer, learner
│       └── dashboard/content/...          # composes features/content
│
├── features/                              # one folder per domain (D1–D8)
│   ├── identity/          # (from today's auth + users + admin)
│   ├── organizations/
│   ├── content/           # ← the built one (editor-engine lives here)
│   │   ├── course/        # course shell (CourseEditorShell)
│   │   └── editor/        # editor-engine: components, extensions, hooks, lib (yjs), styles
│   ├── publishing/        # author submit UI + reviewer dashboard
│   ├── learning/
│   ├── assessment/
│   ├── certification/     # (rename of certificates)
│   └── discovery/
│
├── components/                            # F0 design system (feature-agnostic)
│   ├── ui/                # shadcn/base-ui primitives
│   └── (AppShell, AuthGuard, intro/…)
├── lib/                   # F0 api client (api.ts), auth (auth.ts), utils
├── hooks/                 # F0 cross-feature hooks
├── types/                 # F0 global types (api.ts, editor.ts)
├── config/  styles/  assets/  docs/       # F0
```

### 7.2 Feature module anatomy

Each `features/<domain>/` encapsulates its own layers (matching
`docs/folder-structure.md`, "each feature encapsulates its own components, hooks, and
utils when they are not shared globally"):

```text
features/<domain>/
├── components/     # domain UI (PascalCase .tsx)
├── hooks/          # domain hooks (useX.ts)
├── lib/            # domain client logic / adapters
├── api/            # typed calls to this domain's backend endpoints
├── types/          # domain types (local; promote to /types only when shared)
└── styles/         # domain-scoped CSS (e.g. editor.css)
```

The **editor-engine** (`features/content/editor/`) is the canonical example, already
built this way: `components/` (ArcadeEditor, EditorToolbar, VersionHistoryPanel),
`extensions/`, `hooks/` (useArcadeEditor), `lib/` (yjs), `styles/` (editor.css).

### 7.3 Frontend boundary rules

- **Cross-feature imports go through a feature's public surface** (its `index.ts` /
  exported API), not deep into another feature's `components/` internals.
- **Shared → `components/ui`, `lib`, `hooks`, `types`.** A component used by two features
  is not feature-specific; promote it to the Foundation. A component used by one feature
  stays in that feature. (This is the "feature-agnostic vs feature-owned" test from
  `folder-structure.md`.)
- **`app/` composes, it does not implement.** No business logic in `page.tsx`/`layout.tsx`
  beyond wiring a feature's exported screen.
- **The API client is shared, endpoints are domain-owned.** `lib/api.ts` is the one
  transport (auth, refresh, 401 replay); each feature owns its own `api/` calls on top.

---

## 8. Boundary & dependency laws

These are the enforceable rules. A PR that violates one is an architecture regression,
not a style nit.

| # | Law | How to check |
|---|---|---|
| L1 | Package/slice by domain; layer within. | New code lands under a `features/<domain>` or `com.arcade.backend.<domain>` package. |
| L2 | A domain owns its tables; only its code touches them. | No repository/query for domain X's tables outside X. |
| L3 | Cross-domain references are by **ID**, never JPA relations or foreign model imports. | Grep for `@ManyToOne`/`@OneToMany` and imports crossing domain packages. |
| L4 | Cross-domain access is via the owning domain's **service interface**. | No import of another domain's `repository`, `model`, or internal component. |
| L5 | Dependencies follow the graph (§3.3); **no cycles**. | Dependency direction matches D1→…→D7; kernel depends on nothing above it. |
| L6 | The Foundation depends on no product domain. | `common/config/security/storage/email` and `components/ui/lib` import no `features/*` or domain package. |
| L7 | Learner-facing content is the **structured-JSON renderer contract**; delivery never loads the authoring editor. | Delivery (D5) imports no Tiptap; renderer reads published JSON. |
| L8 | Server JSON is a **read/publish projection**, not the write model (pre-Yjs). | No server-side merge/transform of the content JSON blob as source of truth. |
| L9 | One team owns one domain end-to-end. | CODEOWNERS maps `features/<domain>` + `backend/<domain>` to one team. |

**Cross-domain communication — allowed mechanisms (in preference order):**
1. **In-process service interface call** (today, monolith): `X` depends on `YService`'s
   interface. This is the default.
2. **Published-read projection**: D5/D8 read D4's published snapshots — a read model, not
   a call into D3's internals.
3. **Domain events** (future, when a flow must be async/decoupled — e.g. "exam passed" →
   certification). Introduce only when a real requirement needs it; do not pre-build an
   event bus.

The point of keeping (1) behind an interface is that swapping it for a network call
(microservice extraction) later touches only the adapter, not the caller — the boundary
shape is identical. This is the extraction path promised in the backend architecture doc.

---

## 9. Naming & organization conventions

Consolidated from `arcade/docs/naming-conventions.md` and the backend docs, plus the
domain-slug rules introduced here.

**Domains & modules**
- Domain slug = backend package name = frontend `features/` folder name (§3.1). Singular,
  lowercase, no separators (`content`, `publishing`, `identity`).
- Submodule = a folder inside the domain, same casing (`editor-engine` on the frontend as
  a folder is written `editor/`; kebab in prose, folder name per platform convention).

**Backend (Java)**
- Package-by-feature, layered within (`controller/service/repository/model/dto/mapper/exception`).
- Reference other domains by ID; call their `service` interface; constructor injection.
- Flyway owns schema; migrations are `V<n>__snake_case.sql`, sequential, never edited
  after merge.

**Frontend (TS/React)**
- Components `PascalCase.tsx`; hooks `useSomething.ts`; other files `kebab-case.ts`;
  variables `camelCase`; constants `UPPER_SNAKE_CASE` (`naming-conventions.md`).
- App Router route groups by audience: `(public)`, `(auth)`, `(authenticated)`.
- Feature-agnostic → `components/ui`, `lib`, `hooks`, `types`; feature-owned → inside the feature.

**Docs**
- `docs/` is the single source of truth. A new architectural decision goes in
  `decisions.md` (ADR); a structural change to domains/boundaries updates **this**
  document.

---

## 10. Ownership & team mapping

The module structure is drawn to match the capability teams in `roadmap.md`
(Conway's Law used deliberately: team boundaries = module boundaries).

| Team (roadmap) | Domain | Owns (frontend + backend + tables) |
|---|---|---|
| Identity & User Management | D1 `identity` | `features/identity` · `backend/identity` · users/auth/rbac/audit tables |
| Organizations & Creators | D2 `organizations` | `features/organizations` · `backend/organization` · org tables |
| Content Management | D3 `content` | `features/content` · `backend/content` · course tree + drafts |
| Content Review & Publishing | D4 `publishing` | `features/publishing` · `backend/publishing` · versions + submissions |
| Learning Experience | D5 `learning` | `features/learning` · `backend/learning` · enrollment + progress |
| Assessment & Examination | D6 `assessment` | `features/assessment` · `backend/assessment` · quizzes/exams/banks |
| Certificates | D7 `certification` | `features/certification` · `backend/certification` · certificates |
| Public Platform | D8 `discovery` | `features/discovery` + `app/(public)` · `backend/discovery` · projections |
| (Platform/infra, shared) | F0 `platform` | Foundation kernel — owned by a platform/infra function, changed by RFC. |

Each team owns a **vertical slice UI→DB**, minimizing cross-team merge conflicts — the
explicit intent in `roadmap.md`. A `CODEOWNERS` file should encode this mapping so reviews
route to the owning team (L9).

---

## 11. Current → target: gap analysis & migration

### 11.1 Where the code is today

| Domain | Backend today | Frontend today | State |
|---|---|---|---|
| D1 Identity | `auth/ user/ role/ permission/ audit/` (separate pkgs) | `features/{auth,users,admin}` (scaffold) + `app/(auth)` | 🟢 auth live; ⚪ RBAC idle |
| D2 Organizations | `organization/` | `features/organizations` (empty) | 🟡 backend-only |
| D3 Content | `content/` (full layering) | `features/content/{course,editor}` (**built**) | 🟢 live — current work |
| D4 Publishing | one-line `submitCourse` in `content` | in `CourseEditorShell` | ⚪ design-approved |
| D5 Learning | `user/EnrolledCourse` | `features/learning` (empty) | 🟡 backend-only |
| D6 Assessment | — | `features/assessment` (empty) | ⚪ not started |
| D7 Certification | `user/Certificate` | `features/certificates` (empty) | 🟡 backend-only |
| D8 Discovery | — | `app/(public)/{courses,landing}` (empty) | ⚪ not started |
| F0 Foundation | `common/ config/ security/ storage/ email/` | `components/ui, lib, hooks, types, config, styles` | 🟢 in use |

### 11.2 The gaps (deltas to reach target)

1. **Identity is fragmented.** `auth/user/role/permission/audit` are five sibling
   packages; target consolidates them under `identity/` with submodules. *(Rename/regroup;
   no behavior change.)*
2. **Content and Publishing are entangled.** Version/submission logic will grow inside
   `content`; extract to `publishing/` as it is built (the ADR already lists touch-points).
3. **Learning & Certification data lives under `user/`.** `EnrolledCourse` → `learning/`,
   `Certificate` → `certification/`. These are misfiled today.
4. **Frontend folders don't match slugs.** `certificates` → `certification`;
   `auth`+`users`+`admin` → `identity`; add `publishing`, `discovery`.
5. **Discovery has no backend.** Public read APIs/projections are unbuilt.
6. **RBAC is scaffolding.** Reviewer/admin roles must be seeded before D4 authorization.

### 11.3 Migration principle: strangler, not big-bang

Do **not** reorganize everything at once. The platform ships on `content-management`;
churn there is risk. Instead:

- **New domains land in the target shape from day one.** When D4/D5/D6/D8 are built, they
  are created as `publishing/`, `learning/`, etc. — never bolted onto `content` or `user`.
- **Existing domains are regrouped when they're next touched substantially.** Consolidate
  `identity/` when the RBAC/reviewer work begins (it needs that code anyway). Move
  `EnrolledCourse`/`Certificate` when Learning/Certification get their first real feature.
- **Every move is mechanical and covered by tests** — package rename + import fixups, no
  logic change in the same PR.
- **Boundaries first, folders second.** Even before a physical move, enforce L2–L4 (own
  your tables, reference by ID, call via service interface). Correct *dependencies* matter
  more than folder cosmetics.

### 11.4 Suggested sequence (aligned with roadmap delivery)

1. Finish D3 editor-engine (current) + the "commit working copy → `lessons.body`" step.
2. Seed RBAC + consolidate `identity/` (unblocks reviewer authz).
3. Extract `publishing/` (D4) with the V12 version/submission schema + reviewer dashboard.
4. Build `learning/` (D5) delivery renderer against published snapshots; move `EnrolledCourse`.
5. Build `discovery/` (D8) public catalog against published snapshots.
6. Build `assessment/` (D6), then `certification/` (D7); move `Certificate`.

---

## 12. Governance — adding a domain or submodule

**Before creating a new top-level domain, prove it is a bounded context**, not a feature
of an existing one. Ask:
1. Does it own data no current domain should own? (If it just reads others → it may be a
   submodule of D8 Discovery or a read projection, not a domain.)
2. Would a single team own it end-to-end?
3. Does it have its own vocabulary and rules?
If not all three → it is a **submodule** inside an existing domain.

**Definition of done for a module (the checklist):**
- [ ] Lands under one `features/<slug>` and one `com.arcade.backend.<slug>` package.
- [ ] Owns its tables via Flyway migrations authored by its team; no other domain queries them.
- [ ] Exposes a `service` interface (backend) / feature public surface (frontend);
      internals are not imported across domains.
- [ ] References other domains by ID + interface only (L3/L4); dependency direction obeys §3.3.
- [ ] Uses the Foundation (design system, api client, error contract) rather than
      re-implementing kernel concerns.
- [ ] Added to this document's domain catalog (§4) and the team map (§10); any new
      architectural decision recorded in `decisions.md`.
- [ ] `CODEOWNERS` updated so the owning team reviews it.

**When boundaries change**, update §3–§4 here in the same PR — this document is the
structural contract, and a merged change that contradicts it is a bug in the docs.

---

## 13. Appendices

### 13.1 Glossary

| Term | Meaning |
|---|---|
| **Domain** | A bounded context = one top-level module, owned by one team. |
| **Submodule** | A cohesive slice inside a domain; shares its data ownership. |
| **Working copy** | The live, mutable content an author edits (D3). |
| **Snapshot / version** | An immutable frozen JSON tree of a course at a checkpoint (D4). |
| **Published snapshot** | The version `courses.published_version_id` points at — what learners read. |
| **Renderer contract** | The stable structured-JSON shape learner delivery consumes, decoupled from the editor. |
| **Owner vs Author** | Owner (org/individual) controls content; authors are permanent credit (D2 rule). |
| **Shared kernel / Foundation** | Cross-cutting code every domain may use; depends on no domain. |
| **Modular monolith** | One deployable, internally partitioned into domain modules with strict boundaries. |

### 13.2 Domain → tables matrix (current tables)

| Table | Domain | Note |
|---|---|---|
| `users` | D1 Identity | account |
| `refresh_tokens`, `email_verification_tokens`, `password_reset_tokens` | D1 Identity/auth | |
| `roles`, `permissions`, `role_permissions`, `user_roles` | D1 Identity/access-control | idle |
| `login_history`, `audit_logs` | D1 Identity/audit | |
| `organizations`, `organization_memberships`, `organization_invitations` | D2 Organizations | |
| `courses`, `modules`, `lessons`, `content_drafts` | D3 Content | working copy |
| `course_versions`, `course_submissions` (planned V12) | D4 Publishing | |
| `courses.published_version_id` (planned) | D4 (writes) / D3 (column) | publish seam |
| `enrolled_courses` | D5 Learning | *currently under `user/`* → move |
| `certificates` | D7 Certification | *currently under `user/`* → move |
| `user_social_links`, `user_preferences` | D8 Profiles (composed) | *currently on User* |

### 13.3 Current folder → target module map

| Today | Target |
|---|---|
| `backend/auth`, `user`, `role`, `permission`, `audit` | `backend/identity/{authentication,accounts,accesscontrol,audit}` |
| `backend/organization` | `backend/organization` (D2) — unchanged |
| `backend/content` (incl. submit + versions) | `backend/content` (D3) + extract `backend/publishing` (D4) |
| `backend/user/EnrolledCourse` | `backend/learning` (D5) |
| `backend/user/Certificate` | `backend/certification` (D7) |
| `backend/common`, `config`, `security`, `storage`, `email` | Foundation (unchanged homes) |
| `features/auth`, `users`, `admin` | `features/identity` |
| `features/content` | `features/content` — unchanged (built) |
| `features/certificates` | `features/certification` |
| `features/organizations`, `learning`, `assessment` | unchanged slugs (build out) |
| *(new)* | `features/publishing`, `features/discovery` |

### 13.4 Change log

| Date | Change |
|---|---|
| 2026-07-15 | Initial reference architecture: 8 domains + Foundation, submodules, boundary laws, migration plan. |
