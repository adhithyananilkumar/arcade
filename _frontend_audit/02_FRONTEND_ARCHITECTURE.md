# Frontend Architecture Audit — Arcade UI

Audit date: 2026-08-16. All findings below are derived from grepping actual import statements across the tree (`@/domains/...`, `@/apps/...`, `@/shared/...`, `@/infrastructure/...`, `@/components/...`, `@/features/...`), cross-referenced against the documented target architecture in `CLAUDE.md`, `docs/architecture/repository-map.md`, `docs/architecture/ADR-001-frontend-architecture.md`, and the ESLint boundary rule in `eslint.config.mjs`.

## A. Documented / intended architecture

The repo carries first-class architecture documentation that is unusually explicit for a frontend codebase:

- `CLAUDE.md` states the frontend "has reached Version 1.0 and is STABLE," declares the dependency direction **`app -> apps -> domains -> infrastructure -> shared`**, requires domain imports to go through a domain's public `index.ts` ("no deep imports"), requires "pure UI" domain components (props in, no side effects), and requires all side effects (API calls, routing) to live in `apps/` orchestrators.
- `docs/architecture/repository-map.md` assigns one purpose to each top-level directory and explicitly lists what each **must not** contain (e.g., `app/` must not contain services/business logic; `domains/` must never depend on `apps/`; `shared/` must not contain HTTP/auth/business concepts).
- `eslint.config.mjs` mechanically enforces exactly one of these rules: `no-restricted-imports` blocks `@/domains/*/*` deep-import patterns, forcing consumers through each domain's `index.ts`.

This is the target architecture used as the baseline for (C) below.

## B. Actual observed architecture

Layer-by-layer, based on directory purpose and confirmed import behavior:

- **UI layer (Next.js routing):** `app/` — 229 files, 46,130 lines, 102 `page.tsx` routes, 12 layouts, 4 API route handlers.
- **Application/orchestration layer:** `apps/` — 136 files, 29,053 lines, split into `apps/core`, `apps/creator`, `apps/learner`, `apps/public`.
- **Domain/business-logic layer:** `domains/` — 189 files, 23,835 lines, 14 domains (`assessments`, `badges`, `channels`, `community`, `courses`, `enrollment`, `iam`, `identity`, `learning`, `notifications`, `organizations`, `payment`, `publishing`, `roadmaps`).
- **Infrastructure/adapter layer:** `infrastructure/` — 12 files, 686 lines (`auth/`, `http/`, `media/`, `state/`, `websocket/`).
- **Shared/framework-agnostic layer:** `shared/` — 51 files, 5,547 lines (`design-system`, `hooks`, `utils`, `types`, `contexts`).
- **Two undocumented parallel trees:** `components/` (33 files, 8,453 lines: `course`, `explore`, `landing`, `ui`) and `features/` (20 files, 6,549 lines: only `features/roadmap`). Neither appears in `docs/architecture/repository-map.md`'s directory list at all.
- **State management:** genuinely domain-scoped — Zustand stores live inside `domains/community/store`, `domains/iam/store`, `domains/roadmaps/store`, `features/roadmap/renderer/store`, plus two infra-level stores (`infrastructure/auth/auth.store.ts`, `infrastructure/state/theme.store.ts`). No global app-wide store. `@tanstack/react-query` handles server-state caching separately. This part of the architecture is implemented as documented and is a genuine strength.
- **Auth/authz:** centralized primitives exist (`infrastructure/auth/auth.service.ts`, `auth.store.ts`, `authorization.service.ts`, `session.service.ts`) and are used by 14 files, but 14 *other* files perform ad-hoc `role ===` / `isAdmin` / `hasPermission`-style checks outside that service (see finding ARCH-006).

## C. Intended dependency direction (per docs)

```
app  →  apps  →  domains  →  infrastructure  →  shared
```
Each arrow means "may import from," and nothing may import "upward" (e.g., `domains` must never import `apps`, `shared` must never import `infrastructure`).

## D. Verified violations

```
ID: ARCH-001
Severity: P2
Category: Layering / import-boundary violation
Location: 29 call sites across app/ and apps/, e.g. app/(authenticated)/learn/[courseId]/page.tsx:33-34, apps/creator/orchestrators/VersionHistoryOrchestrator.tsx:5, app/(authenticated)/console/iam/PolicyManager.tsx:15
Problem: Deep imports into domain internals (e.g. `@/domains/enrollment/components/EnrollmentButton`, `@/domains/iam/policy-editor/PolicyEditor`) bypass each domain's public `index.ts`, violating the explicit "no deep imports" rule in CLAUDE.md and the eslint `no-restricted-imports` pattern (`@/domains/*/*`).
Evidence: `grep -rn "@/domains/[a-zA-Z_-]*/[a-zA-Z_-]"` across app/apps/domains/shared/infrastructure/components/features returns 29 matches that are not simple `@/domains/<name>` root imports. Concentrated in `enrollment`, `iam`, `publishing`, `identity`, `roadmaps` — precisely the domains identified in ARCH-002 as missing a public `index.ts`.
Why it matters: the whole point of the public-API-per-domain rule is to let a domain team refactor internals without breaking every consumer. Once 29 call sites reach past that boundary, internal refactors of `enrollment`, `iam`, `publishing` become breaking changes for arbitrary route/orchestrator files.
Failure scenario: a domain owner renames or moves `PolicyEditor.tsx` inside `domains/iam/policy-editor/` and silently breaks `app/(authenticated)/console/iam/PolicyManager.tsx` and `app/(authenticated)/channels/[id]/manage/ChannelPolicyManager.tsx` with no lint signal (the eslint rule should have caught this — see ARCH-002 for why it currently can't in some cases, and note this rule was evidently added after these imports already existed, since it does not appear to be enforced in CI given these violations are on the current branch).
Affected users/features: IAM policy management, enrollment/checkout flow, publishing review workflow, identity/auth UI.
Recommended direction: either (a) add re-exports for these specific symbols to each domain's `index.ts` and fix the 29 call sites, or (b) if this is intentional scoping (some domains export a narrower public surface than internal consumers need), document the exception the way the roadmap/render-engine merge was documented in CLAUDE.md. Given the ESLint rule already exists and disagrees with 29 live call sites, this is not a matter of taste — either the rule or the code is wrong today.
Implementation complexity: Medium (mechanical for most files; requires each domain owner to decide what's public API).
Regression risk: Low if done incrementally per domain.
Dependencies: Requires domains/enrollment and domains/iam to gain an index.ts first (ARCH-002).
Status: CONFIRMED ARCHITECTURAL VIOLATION
```

```
ID: ARCH-002
Severity: P2
Category: Missing domain public API boundary
Location: domains/enrollment/, domains/iam/
Problem: Of the 14 domains, 12 have an `index.ts` (public API entrypoint); `domains/enrollment` and `domains/iam` do not. Every consumer of these two domains is therefore forced into a deep import (mechanically triggering ARCH-001), because there is no root module to import from.
Evidence: `for d in domains/*/; do [ -f "$d/index.ts" ] ...` — enrollment and iam are the only two directories without one. Cross-checked: the 29 deep-import violations in ARCH-001 are concentrated almost entirely in these two domains plus publishing/identity/roadmaps (which do have an index.ts but export a narrower surface than what consumers reach for).
Why it matters: this is the root cause of ARCH-001, not a separate problem — fixing the missing index.ts files is the actual fix, not chasing 29 call sites individually.
Failure scenario: same as ARCH-001.
Affected users/features: IAM/permissions, enrollment/checkout.
Recommended direction: add `domains/enrollment/index.ts` and `domains/iam/index.ts` exporting the actual public surface (components, services, types) currently reached via deep import, then let the existing eslint rule catch future regressions.
Implementation complexity: Low.
Regression risk: Low.
Dependencies: None — this should be step 1 before touching ARCH-001 call sites.
Status: CONFIRMED ARCHITECTURAL VIOLATION
```

```
ID: ARCH-003
Severity: P1
Category: Undocumented parallel organizational scheme
Location: components/ (33 files, 8,453 lines), features/ (20 files, 6,549 lines — effectively just features/roadmap/)
Problem: Neither `components/` nor `features/` appears anywhere in docs/architecture/repository-map.md's canonical directory list, yet both are live, actively-imported, non-trivial trees (components/ is imported by 9 files including 6 page.tsx routes; features/roadmap is imported by app/(authenticated)/roadmap/[id]/page.tsx). This is a third and fourth organizational scheme layered on top of the documented app/apps/domains/infrastructure/shared five-layer model.
Evidence: grep for "@/components/" and "@/features/" importers outside their own trees; docs/architecture/repository-map.md directory list (lines 6-20) enumerates only app, apps, domains, infrastructure, shared, public, docs, config, scripts.
Why it matters: a developer or AI agent onboarding from repository-map.md (which explicitly says it exists "for developers and AI agents to quickly understand where code belongs") will not learn that components/ and features/ exist or what belongs in them, yet will encounter them immediately (components/explore/CategoryDetailedView.tsx is the single largest explore-related file and is live in production routes).
Failure scenario: new feature work gets added to components/ or features/ (matching existing precedent) instead of domains/ or apps/, deepening the split; or, conversely, gets duplicated into domains/ because the developer didn't know components/ already had it (this already happened once — see ARCH-004).
Affected users/features: explore/discovery pages, landing page, roadmap viewer.
Recommended direction: treat components/ and features/ as a known-incomplete migration. components/course, components/explore, components/landing look like predecessors to apps/public/components/* (which has directories with the same names — explore, landing) — see ARCH-004. features/roadmap looks like a predecessor to domains/roadmaps, which is more fully built out (has hooks, services, store, extensions, types) and matches the CLAUDE.md-documented "roadmaps merged into content/render-engine" decision. Recommend: (1) diff components/{course,explore,landing} against apps/public/components/{explore,landing} to determine which is actually current, (2) migrate the live one into the documented structure, (3) delete the abandoned one, (4) do the same for features/roadmap vs domains/roadmaps, (5) update repository-map.md once resolved.
Implementation complexity: Medium-High (requires product/design confirmation on which version is current — see ARCH-004 for evidence one pair is already stale).
Regression risk: Medium — these are user-facing, actively-routed components; migration needs care, not a red flag to leave as-is indefinitely.
Dependencies: None to start the investigation; execution should follow domain-owner sign-off per CLAUDE.md's "Ask Instead of Assuming" rule.
Status: CONFIRMED ARCHITECTURAL VIOLATION (undocumented structure) / ARCHITECTURAL RISK (unclear which tree is canonical)
```

```
ID: ARCH-004
Severity: P2
Category: Duplicate component trees, one apparently stale
Location: components/explore/CategoryDetailedView.tsx (2337 lines) vs apps/public/components/explore/CategoryDetailedView.tsx (1254 lines); components/landing/ vs apps/public/components/landing/
Problem: Two same-named, differently-sized components exist for "category detailed view." The components/ version is actively imported by 5 files (app/(public)/articles, courses, events, explore pages, and apps/core/components/ExploreHub.tsx). No importer was found anywhere in the tree for the apps/public/ version.
Evidence: `diff` between the two files shows they diverged after line 3 (2611 diff lines out of ~2337); grep for importers of `apps/public/components/explore/CategoryDetailedView` returns zero matches, while `apps/public/` overall is genuinely used elsewhere (24 import sites for other files in that tree).
Why it matters: this is very likely a superseded copy left behind after a refactor moved the live logic into components/, or vice versa — either way it's 1254 lines of dead weight that could confuse the next person who greps for "CategoryDetailedView" and edits the wrong one.
Failure scenario: a developer fixes a bug in the wrong (dead) copy, ships it, and the bug persists in production because the live copy is elsewhere.
Affected users/features: none currently (dead file), but risk to future maintenance velocity.
Recommended direction: confirm via `git log --follow` which file is newer/was the source of the copy, then delete the unreferenced one. Full detail and SAFE-TO-DELETE classification in 10_FRONTEND_DEAD_CODE_AUDIT.md.
Implementation complexity: Low.
Regression risk: Low (file has zero confirmed importers).
Dependencies: None.
Status: CONFIRMED DUPLICATION
```

```
ID: ARCH-005
Severity: P2
Category: Circular dependency between domains
Location: domains/payment/utils/launchRazorpayCheckout.ts:2 imports domains/enrollment/api/enrollment.service (deep import); domains/enrollment/components/EnrollmentButton.tsx:10 imports domains/payment (public index)
Problem: domains/payment → domains/enrollment → domains/payment is a two-node cycle. Payment reaches into enrollment's internals (deep import, compounding ARCH-001/002 since enrollment has no index.ts), while enrollment imports payment's public surface.
Evidence: grep "@/domains/enrollment" domains/payment and grep "@/domains/payment" domains/enrollment both return non-empty results, confirming the cycle in both directions.
Why it matters: domains are documented as independent business capabilities owned by separate teams; a real cycle means neither domain can be built, tested, or reasoned about in isolation, and bundlers/TS project references can develop subtle initialization-order bugs.
Failure scenario: a future move to per-domain build targets, lazy-loaded domain bundles, or stricter TS project references will fail or produce a load-order bug specifically at the payment/enrollment boundary. Today it "works" only because Next.js bundles everything together.
Affected users/features: checkout/payment flow, course/event enrollment flow — i.e., the revenue path, which raises the severity above a purely cosmetic architecture issue.
Recommended direction: extract the shared concept (an enrollment created as a side effect of a successful payment) into a coordination point in apps/ (an orchestrator), so payment emits a result/event and enrollment or an apps/ orchestrator listens rather than payment directly calling into enrollment's service. Alternatively, define a narrow shared type/interface in shared/types that both domains depend on downward instead of on each other sideways.
Implementation complexity: Medium.
Regression risk: Medium — this is live checkout code; changes need careful testing against the payment flow.
Dependencies: ARCH-002 (enrollment needs an index.ts regardless).
Status: CONFIRMED ARCHITECTURAL VIOLATION
```

```
ID: ARCH-006
Severity: P2
Category: Authorization logic duplication / incomplete centralization
Location: 14 files perform ad-hoc role/permission checks outside infrastructure/auth/authorization.service.ts, e.g. app/(authenticated)/organizations/[id]/page.tsx, app/(public)/[username]/page.tsx, apps/learner/layout/LearnerNavbar.tsx, apps/learner/layout/LearnerSidebar.tsx, apps/creator/shared/content-editor/EditorRightSidebar.tsx
Problem: infrastructure/auth/authorization.service.ts exists and is imported by 14 files, but a separate set of 14 files implements its own `role === ...`, `.includes(role)`, `hasPermission`, `isAdmin`/`isCreator`/`isOrganizer` checks rather than going through the central service.
Evidence: grep for both the centralized service's import and the ad-hoc pattern set independently; the two sets of 14 files are largely non-overlapping.
Why it matters: authorization is exactly the kind of logic that must not drift — two independently-maintained sources of truth for "is this user allowed to do X" is how privilege-check bugs happen (one gets updated, the other doesn't).
Failure scenario: a role/permission model change (e.g., adding a new "organizer" role or revoking "creator" self-service rights) gets applied to authorization.service.ts but missed in the 14 files with inline checks, leaving stale access control live in the UI (note: UI-level authz is a defense-in-depth/UX layer only — this does not imply a backend security hole, but it does imply inconsistent UI behavior and wasted engineering effort maintaining two systems).
Affected users/features: organization management, creator/learner navigation, content editor collaborator permissions, IAM policy manager, public profile pages.
Recommended direction: audit the 14 ad-hoc files, migrate each check to authorization.service.ts (or a thin hook wrapping it), and treat any new inline role check as a lint/review flag going forward.
Implementation complexity: Medium (14 files, mostly mechanical, but each needs to confirm the exact permission it's replicating actually maps 1:1 onto the central service's model).
Regression risk: Medium — incorrect migration could tighten or loosen UI-level access unintentionally.
Dependencies: None.
Status: TECHNICAL DEBT
```

```
ID: ARCH-007
Severity: P1
Category: Layer-purpose violation — routing layer contains business logic and giant components
Location: app/(authenticated)/profile/page.tsx (1940 lines), app/(public)/explore/page.tsx (1915 lines), app/(authenticated)/my-learning/page.tsx (1844 lines), app/(authenticated)/studio/page.tsx (1579 lines), and 249 total commits touching app/(authenticated) in the last 60 (by far the highest-churn directory in the repo)
Problem: docs/architecture/repository-map.md states app/ "Must NOT contain: Reusable services, complex business logic, or pure UI components" and should contain only page.tsx/layout.tsx/loading.tsx/error.tsx/route handlers. In practice, app/(authenticated) totals 46,130 lines (the single largest directory in the repo, larger than apps/ and domains/ combined... actually larger than either individually) and contains multiple 1000+ line page files mixing data-fetching, useState-driven UI state, and rendering directly in the route file.
Evidence: line counts above; grep count of useState/useEffect/fetch/axios/useQuery inside app/(authenticated)/profile/page.tsx alone returns 46 matches in a single file. Git churn analysis (last 60 commits) shows app/(authenticated) touched 249 times vs. apps/creator's 72 — the routing layer is the most actively developed layer, which is the inverse of what the documented "thin routing shell" architecture would predict.
Why it matters: this is the architecture's central promise — that apps/ orchestrates and app/ just routes — failing at its largest and most active surface. It means the "apps -> domains" boundary the whole layering exists to protect is being routinely bypassed by putting the orchestration logic directly in the page file instead.
Failure scenario: two developers both need to change how profile data loads; one edits app/(authenticated)/profile/page.tsx directly (since that's where the logic already lives), the other assumes it lives in apps/learner or apps/core per the documented architecture and can't find it, or duplicates it.
Affected users/features: profile, explore, my-learning, studio — core high-traffic surfaces.
Recommended direction: treat this as the highest-value refactor target once backend wiring begins (the task this audit is feeding into) — extract data-fetching/state from these page files into apps/ orchestrators + domain hooks, leaving page.tsx as composition-only. Do not do this speculatively; do it as part of the backend-wiring pass so the extraction is validated against real integration, not guessed at.
Implementation complexity: High (large files, high churn = higher chance of merge conflicts with in-flight work).
Regression risk: High if rushed; these are core user-facing flows.
Dependencies: Coordinate with whoever owns the in-progress studio/content uncommitted changes to avoid collision.
Status: CONFIRMED ARCHITECTURAL VIOLATION
```

```
ID: ARCH-008
Severity: P3
Category: shared/ layer depends on infrastructure/ (documented as forbidden)
Location: shared/hooks/usePublicCategories.ts, shared/hooks/usePublicCourses.ts
Problem: docs/architecture/repository-map.md says shared/ "Must NOT contain: HTTP logic, authentication, routing, or business concepts," implying shared should sit below infrastructure/ in the dependency graph, not depend on it. Two hooks in shared/hooks import from infrastructure/.
Evidence: grep "@/infrastructure" shared/ returns exactly these 2 files.
Why it matters: minor in isolation (2 files), but it's the one crack in an otherwise clean layering — domains/, infrastructure/ themselves have zero upward-import violations found (no domains->apps, no infrastructure->domains, no infrastructure->apps).
Failure scenario: low risk today; becomes a real problem only if shared/ is ever extracted into a standalone package (e.g., a design-system package published separately), at which point these 2 files would break the extraction.
Affected users/features: public categories/courses data hooks (likely used on public landing/explore surfaces).
Recommended direction: move these two hooks into apps/public or domains/courses (wherever "public categories/courses" data-fetching conceptually belongs), or invert the dependency by having infrastructure/http/api.ts export a generic fetcher that shared/hooks composes without importing infrastructure-specific modules.
Implementation complexity: Low.
Regression risk: Low.
Dependencies: None.
Status: CONFIRMED ARCHITECTURAL VIOLATION
```

## E. Circular dependencies

One confirmed cycle found by direct grep cross-check: **`domains/payment` ↔ `domains/enrollment`** (ARCH-005 above). No other domain-to-domain cycles were found in the sampled cross-domain import grep (each of the 14 domains' outbound `@/domains/` imports was enumerated and checked for a return edge). This was not run through an automated cycle-detection tool (e.g., madge) — the check here is manual grep-based and should be treated as a spot-check, not exhaustive; a `madge --circular` run against the real module graph is recommended as a follow-up (noted as UNVERIFIED beyond the one confirmed cycle).

```
ID: ARCH-009
Severity: P3
Category: Verification gap
Location: N/A (tooling gap)
Problem: This audit's circular-dependency check was manual (grep each domain's outbound imports, check for a matching inbound edge) rather than tool-based. It reliably found the payment/enrollment cycle but cannot rule out other cycles through apps/ or app/ (which weren't exhaustively cross-checked pairwise the same way, only checked for upward-layer violations).
Evidence: N/A — this documents a limitation of the audit method, not a code finding.
Why it matters: madge or dpdm would give exhaustive, provable results in minutes and should be run before treating "only one cycle" as fact.
Failure scenario: N/A.
Affected users/features: N/A.
Recommended direction: run `npx madge --circular --extensions ts,tsx app apps domains infrastructure shared components features` (or `dpdm`) as a follow-up and fold results into this document.
Implementation complexity: Low.
Regression risk: None (read-only tooling).
Dependencies: None.
Status: UNVERIFIED / NEEDS TESTING
```

## F. Cross-feature coupling

Beyond the payment/enrollment cycle, cross-domain coupling observed via `@/domains/` imports inside each domain is otherwise shallow and one-directional in the sampled grep: `courses -> roadmaps`, `learning -> assessments`, `learning -> courses`, `notifications -> channels`, `iam -> identity`. None of these showed a return edge except payment/enrollment. This is a reasonable amount of cross-domain coupling for a platform where courses/learning/assessments/roadmaps are inherently related concepts — **not flagged as a violation**, just documented as the real coupling graph.

## G. Shared-code problems

Two parallel "shared" locations exist and are both live:
- `shared/utils/utils.ts` (34 importers) vs. `lib/utils.ts` (1 importer, kept alive by `components.json`'s shadcn alias). See ARCH-010 in 03_FRONTEND_STRUCTURE_AUDIT.md for full detail.
- `shared/design-system/ui/*` (43 files, documented canonical) vs. `components/ui/*` (17 files, shadcn CLI default target). Same root cause: the shadcn tool config (`components.json`) was never updated to point at the project's actual documented structure, so every future `npx shadcn add` invocation will keep growing the wrong (undocumented) folder. This is arguably the single highest-leverage one-line fix available in the whole audit — see 03 doc.

## H. Domain-boundary violations

Covered fully under ARCH-001/002/005 above. Summary: 2 of 14 domains lack a public API boundary at all (enrollment, iam), which directly causes both the deep-import violations and contributes to the one confirmed circular dependency.

## I. Recommended target architecture

The documented target (`app -> apps -> domains -> infrastructure -> shared`) is sound and, encouragingly, is **already correctly implemented for the infrastructure and shared layers in the upward direction** (no domains-import-apps, no infrastructure-imports-domains violations found) — the documented architecture is not aspirational fiction, it's mostly real. The gaps are concentrated in four specific, fixable places:

1. Give `enrollment` and `iam` public `index.ts` files (low effort, unblocks the deep-import cleanup).
2. Resolve the `components/` vs `apps/public/components/` and `features/roadmap` vs `domains/roadmaps` duplication — pick one, delete the other, update `repository-map.md` to either document `components/` as a legitimate landing/marketing-page exception or eliminate it.
3. Break the payment/enrollment cycle via an orchestrator-level coordination point in `apps/`.
4. Treat `app/(authenticated)` as the top refactor priority once backend wiring starts — it is simultaneously the largest, most-churned, and most rule-violating directory in the repo, and every hour spent extracting its logic into `apps/` orchestrators pays for itself the next time someone has to touch profile, explore, or my-learning.

No wholesale re-architecture is warranted. The five-layer model is well-documented, mostly followed, and mechanically enforced in part by ESLint — the fixes above are targeted, not a rewrite.
