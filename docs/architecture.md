# Arcade Content Architecture & Platform Plan

## 1. Platform overview
Arcade is an educational platform where anyone can register as a learner, while organizations and individuals can be approved as content creators. The platform manages learning, assessments, certifications, and creator publishing end to end.
The design principle guiding this plan is to keep the platform simple, scalable, and maintainable — avoiding unnecessary complexity in user roles, content structure, and workflows.

## 2. User model
There is a single base `User` entity. A user is not permanently “typed” as one role — instead, roles are memberships and grants attached to the user. The same person can simultaneously be a learner, a member of one or more organizations, an independent content creator, and (if invited) a platform administrator.

### 2.1 Public users (learners)
Anyone can register as a public user. No approval is required to become a learner.
Public users can:
- Browse public content
- Enroll in courses
- Register for workshops and webinars
- Attend sessions online or in person
- Take assessments and certification exams
- Receive certificates
- View their own learning history
- Maintain a public learner profile

### 2.2 Administration
Administration covers everyone with elevated, platform-level or org-level authority. It splits into two functionally distinct groups: Platform Administration and Content Creators.

#### 2.2.1 Platform administration
These are the owners and operators of Arcade itself — not content creators.
Roles include:
- Platform Owner
- Platform Administrators
- Moderators
- Reviewers (future)

**Responsibilities:**
- Managing the platform overall
- Inviting organizations onto the platform
- Inviting individual creators onto the platform
- Managing platform administrators and their permissions
- Approving organizations
- Approving content before public release
- Managing platform-wide policies
- Monitoring platform activity

*Design implication:* the Platform Owner can create administrators with different, customized permission sets and split responsibilities freely. This requires a real permission/role system underneath — not a single `is_admin` flag.

#### 2.2.2 Content creators
A content creator can be an Organization or an Individual Creator.
- Organizations (e.g. “Amal Jyothi College”) exist as entities inside Arcade and are onboarded at the top level by platform administration.
- An organization can onboard its own members (faculty, students, staff) as creators — the organization knows its own people and manages this internally.
- An organization may have its own internal admin-like roles for managing its members, separate from Arcade’s platform admins.
- Individual educators can publish independently, without belonging to any organization.
- A single user may belong to multiple organizations at the same time, publish under an organization, and/or publish independently under their own profile — all simultaneously.

## 3. Content ownership model
This was identified as a decision worth locking in early, since it directly shapes the data model. The confirmed rule:

| Concept | Definition | Owner |
|---------|------------|-------|
| **Owner** | The organization (if created under an org) or the individual (if published independently). The owner controls the content long-term. | Organization or Individual |
| **Authors** | The user(s) who actually created the content. This is credit, not control. | Users |

**Confirmed behaviors:**
- When a user creates content while part of an organization, the user is listed as author but the organization is the owner.
- Once a course is published, it belongs to the organization permanently — ownership does not change even if the author later leaves the organization.
- Authorship credit is historical and persists: the former member’s name still appears as author on the org’s published course, and the course still appears on that person’s own public profile, even after they leave.
- Edit rights, however, do not persist. After leaving the organization, the former member can no longer edit the content. The organization retains full edit rights, since it is the owner.

**Resulting minimal data shape:**
```json
Content { 
  owner_type: "org" | "user",  
  owner_id: "string",  
  authors: ["user_id", "…"] 
}
```
Authors remain listed independently of current org membership — the `authors` array is a permanent historical record, not a live membership lookup.

## 4. Content system
The content system is intentionally kept simple, with four top-level content types:
- Course (static/self-paced or live/scheduled)
- Workshop / Bootcamp
- Webinar
- Article

The internal structure of each type stays flexible. Content can combine any mix of: text, images, videos, audio, code snippets, graphs, resources, quizzes, assignments, and certification exams.
Courses support a structured learning flow (modules and sub-content) while remaining flexible — not every course needs the same number of modules or sections, but any expansion follows the same defined structural format. Workshops, webinars, and articles use the same underlying building blocks rather than separate content systems.

## 5. Content approval workflow
Content is never published directly. The workflow is:
1. Creator prepares content (draft)
2. Creator submits content for review
3. Platform administration reviews the submission
4. Content is approved or sent back with feedback
5. Only approved content becomes visible to learners

This approval pipeline applies uniformly across all four content types. The concrete data model and versioning mechanics that make this work (submit-and-keep-editing, re-submission, re-approval of published edits) are specified in §11.

## 6. Assessment system
Content may include assessments. Supported assessment types:
- Quizzes
- Assignments
- Certification exams
- Manual reviews (future)

Assignments may require file uploads, written responses, or form-based submissions.
Courses with certification maintain their own question bank. The examination system selects questions from that bank according to predefined weight-distribution rules, rather than presenting the whole bank to every learner.

## 7. Examination system
Arcade includes a secure examination module supporting multiple evaluation methods:
- Online certification exams
- Scheduled examinations
- Manual evaluation
- Reviewer-based evaluation, for projects or internal assessments

The online exam experience emphasizes academic integrity through browser restrictions, tab-switch detection, and other anti-cheating mechanisms.

## 8. Certificates
Learners receive certificates after successfully completing eligible content and its associated assessments. Certificates are generated by the platform and remain independently verifiable.

## 9. Public profiles
- Learners have public profiles showing their learning achievements and certificates.
- Content creators have public profiles showcasing their published courses, workshops, webinars, and articles — functioning like a channel.
- Organizations have public pages representing the institution and everything published under it.

## 10. Editor persistence & collaboration architecture
The content editor (Tiptap) is authoring-only; learners never load Tiptap and instead consume a pre-rendered, read-only view. The persistence and real-time strategy is phased. (Full rationale in `docs/decisions.md` → "Editor persistence & collaboration architecture".)

### 10.1 Phase 1 — single author (current)
- **Write path:** debounced autosave (2s) via REST `PUT /api/lessons/{id}/draft`, with a localStorage fallback for offline/unreachable-backend cases.
- **Storage:** `content_drafts` (one working row per lesson) is the autosave buffer; `lessons.body` (JSONB) is the committed content the renderer reads.
- **No WebSockets, no polling** — appropriate for single-author editing.
- **Hardening (planned in this phase):** optimistic-concurrency conflict detection on draft saves; flush on `blur` / `visibilitychange` / `beforeunload`; commit draft → `lessons.body` so published content is populated.

### 10.2 Phase 2 — real-time collaboration
- **Write model:** Yjs (CRDT) becomes authoritative for concurrent editing.
- **Read model:** the Tiptap **JSON tree is derived from the Yjs document** — the AGENTS.md structured-JSON renderer contract is unchanged; it just becomes a projection of Yjs state.
- **Sync transport:** **Hocuspocus** (Tiptap's Yjs WebSocket server) run as a **Node sidecar**, persisting Yjs state to Postgres. Spring Boot stays the authority for auth, metadata, ownership, and the review/publish workflow.
- **Topology:** `Tiptap ↔ Yjs ↔ Hocuspocus ↔ Postgres`. Open deployment question: operating a Node sidecar alongside Spring Boot.

### 10.3 Guardrail for interim work
Until Phase 2, do **not** build logic that assumes server-side JSON is the authoritative *write* model (e.g. server-side merges/transforms of the JSON blob that a CRDT would later own). Treat `lessons.body` JSON as a read/publish projection so the migration to a Yjs write model stays clean.

## 11. Content approval workflow — versioning & submissions
Extends §5 with the data model. Full rationale in `docs/decisions.md` → "Content approval workflow via immutable version snapshots + submissions". Status: design-approved, build-deferred.

### 11.1 Core idea — mutable working copy vs. immutable snapshots
A course must present three views of itself **at the same time**. The author edits a live working copy; the reviewer and learners read **frozen snapshots**. That decoupling is the entire design.

| Track | What it is | Who sees it | Mutable? |
|---|---|---|---|
| **Working copy** | The live tree the author edits (`modules` / `lessons.body` / `content_drafts`; Yjs doc in Phase 2) | Author | Yes — every keystroke |
| **In-review snapshot** | Frozen copy taken at submit time | Reviewer (admin) | No |
| **Published snapshot** | Frozen copy learners consume | Learners | No |

At any instant these can differ: author editing v3, v2 in the review queue, v1 live to learners.

### 11.2 Data model
- **`course_versions`** (immutable = version history): `id, course_id, version_number (monotonic per course), snapshot (jsonb: full serialized course tree — metadata + modules + lessons + bodies + ordering), created_at, created_by, source (SUBMISSION | PUBLISH)`. Created only at **submit** and **publish** checkpoints — bounded, not per-keystroke. Learner rendering = read one row; diffing = compare two JSON blobs.
- **`course_submissions`** (review records): `id, course_id, version_id → course_versions, status (PENDING | CHANGES_REQUESTED | APPROVED | REJECTED | SUPERSEDED), submitted_by, submitted_at, reviewer_id?, decided_at?, feedback?`. `version_id` permanently records which version was submitted.
- **`courses`**: add `published_version_id → course_versions (nullable)` = what learners see. Do **not** overload a single `status` string.

### 11.3 State — two orthogonal facts
- **Publication**: derived from `published_version_id` — UNPUBLISHED / PUBLISHED / ARCHIVED.
- **Review state**: status of the *latest* submission — NONE / PENDING / CHANGES_REQUESTED / APPROVED / REJECTED.

The displayed badge (e.g. "Published · update in review") is a rendering of the pair. This is what lets "published **and** has a pending revision" exist without a bespoke state.

### 11.4 Flows
- **Submit** → materialize working content, freeze into a new `course_versions` row, **supersede** any existing `PENDING` submission (`→ SUPERSEDED`), create a new `PENDING` submission pointing at the new version.
- **Keep editing while pending** → author mutates the working copy; the frozen snapshot (and thus the reviewer's view) is untouched.
- **Re-submit newer version** → the supersede step keeps **≤1 PENDING per course**, so the reviewer queue (`PENDING` only) always shows just the latest submitted version; all submission rows are retained as history.
- **Reviewer decision** → **Approve**: submission `APPROVED` + `published_version_id = submission.version_id`. **Request changes**: `CHANGES_REQUESTED` + feedback. **Reject**: `REJECTED`.
- **Edit published content** → `published_version_id` advances *only* on approval, so post-publish edits sit in a new `PENDING` submission while learners keep seeing the old published version — enforcing re-approval automatically.

### 11.5 Edge cases to honor
- Approval publishes the **reviewed** snapshot, not the current working copy (which may have newer unsubmitted edits). Surface this in the UI.
- A reviewer decision applies only if the submission is still `PENDING` (author may have resubmitted mid-review) — the same optimistic-concurrency guard used for draft saves (§10.1).

### 11.6 Build prerequisites (current gaps)
- RBAC tables (`roles`/`permissions`/`user_roles`, `V2__iam_schema.sql`) are **empty** — a reviewer/admin role must be seeded and assigned before reviewer endpoints can be authorized (`@EnableMethodSecurity` is already enabled).
- No admin/review UI exists yet — a reviewer dashboard must be built.
- Snapshotting depends on the §10.1 "commit working content → `lessons.body`" step (content currently lives only in `content_drafts`).

## 12. Open items for schema design
| Question | Why it matters |
|----------|----------------|
| Can an org hold an internal “admin” role for managing its own members, distinct from Arcade platform admins? | Affects whether org-level permissions are a lightweight sub-system or reuse the platform permission model. |
| Does every edit to already-published content require re-approval, or only the initial publish? | Determines whether “approved” is a one-time gate or a recurring state tied to content versions. |
| Is a certificate tied to (learner, content, exam attempt), or does it need to reference a specific content version? | Matters if courses can be revised after learners have already completed and certified on an earlier version. |
| If a user publishes independently first and later joins an org, does that content stay personally owned, or is there an explicit transfer-to-org action? | Assumed: stays personal unless explicitly transferred. Confirm before building the ownership-transfer logic (or deciding not to build it). |
