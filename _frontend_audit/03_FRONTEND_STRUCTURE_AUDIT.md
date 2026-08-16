# Frontend Structure & Component-Architecture Audit — Arcade UI

Audit date: 2026-08-16. Builds directly on 02_FRONTEND_ARCHITECTURE.md's dependency-graph findings; this document focuses on folder-level organization questions and component-level code-smell findings (God components, mixed concerns, prop drilling, duplication).

## 1. Is `components/` a dumping ground?

**Verdict: No, but it is a stale/parallel tree, not a dumping ground.** `components/` has only 4 subfolders (`course`, `explore`, `landing`, `ui`) — it is small (33 files) and topically organized, not a miscellaneous junk drawer. The real problem (documented as ARCH-003/ARCH-004 in the architecture doc) is that it duplicates `apps/public/components/{explore,landing}` in a way that looks like an incomplete migration rather than sprawl. Distinguishing this from an actual dumping-god-drawer matters: the fix is "resolve the duplication," not "reorganize a mess."

```
ID: STRUCT-001
Severity: P2
Category: Duplicate directory trees
Location: components/explore/, components/landing/  vs.  apps/public/components/explore/, apps/public/components/landing/
Problem: Same topical folders exist in two places with overlapping/divergent content (see ARCH-004 for the CategoryDetailedView specifics).
Evidence: `find . -type d -iname explore` returns 3 hits (app/(public)/explore is the route, the other two are component trees); `find . -type d -iname landing` returns 2 hits.
Why it matters: doubles the maintenance surface for the marketing/discovery UI and creates ambiguity about which is live.
Failure scenario: see ARCH-004.
Affected users/features: explore, landing/marketing pages.
Recommended direction: consolidate into one location (apps/public/components/* appears to be the more architecturally-correct location per repository-map.md's ownership model, but components/explore/CategoryDetailedView.tsx is demonstrably the live one by import count — so the correct fix is likely "move the live components/ content into apps/public/components/ and delete the stale apps/public duplicate," not the reverse). Requires owner confirmation before acting (per CLAUDE.md's "Ask Instead of Assuming").
Implementation complexity: Medium.
Regression risk: Medium (live, routed, user-facing pages).
Dependencies: None.
Status: CONFIRMED DUPLICATION
```

## 2. Giant `utils`/`services`/`hooks` folders?

**Verdict: No single mega-folder — the opposite problem exists: utils are split across two competing locations.**

```
ID: STRUCT-002
Severity: P2
Category: Split/duplicated utility module
Location: lib/utils.ts (1 importer) vs. shared/utils/utils.ts + shared/utils/money.ts (34 importers)
Problem: Two "utils.ts" files exist at different roots. lib/utils.ts survives only because components.json (shadcn CLI config) still sets `"utils": "@/lib/utils"` and `"lib": "@/lib"` as its aliases, while the project's actual documented shared-utility home is shared/utils (per repository-map.md, shared/ owns "generic hooks, utilities").
Evidence: grep for "@/lib/utils" (1 hit) vs "shared/utils" (34 hits); components.json lines 15-21 show the shadcn aliases pointing at the legacy lib/ location.
Why it matters: every future `npx shadcn add <component>` run will regenerate code importing `@/lib/utils`, silently reintroducing the legacy path and undermining any cleanup unless the config is fixed first.
Failure scenario: a new shadcn-scaffolded component ships importing `cn()` from `@/lib/utils` while the rest of the codebase uses `@/shared/utils/utils`; if the two `cn()` implementations ever diverge (they may not today, but nothing prevents it), styling bugs appear only in shadcn-scaffolded components.
Affected users/features: none currently broken; this is a preventive fix.
Recommended direction: point components.json's `utils`/`lib` aliases at `@/shared/utils`, migrate the 1 remaining `lib/utils.ts` importer, delete `lib/utils.ts` and `lib/` entirely.
Implementation complexity: Low (this is the highest-leverage, lowest-effort fix in the entire audit).
Regression risk: Low.
Dependencies: None.
Status: CONFIRMED DUPLICATION
```

```
ID: STRUCT-003
Severity: P2
Category: Split design-system location
Location: shared/design-system/ui/ (43 files, documented canonical) vs. components/ui/ (17 files, shadcn CLI default target per components.json's `"ui": "@/components/ui"` alias)
Problem: Same root cause as STRUCT-002 — components.json was never updated to reflect the project's actual design-system home, so shadcn scaffolding keeps targeting the wrong folder.
Evidence: components.json line 18; file counts above; both are live (components/ui files like AnimatedList.tsx, MagicBento.tsx, BadgeGraphic.tsx are distinct, purpose-built components, not obviously superseded by shared/design-system — worth noting these look like two genuinely different categories: shared/design-system holds primitive form/UI controls, components/ui holds decorative/marketing widgets (confetti, animated lists, bento grids, border effects) used mainly by the landing/public pages).
Why it matters: same forward-drift risk as STRUCT-002, but here the two folders may not be pure duplicates — components/ui appears to be "flashy marketing widgets" while shared/design-system/ui is "core design system primitives." This may be an intentional split that's simply undocumented and misconfigured, rather than accidental duplication.
Failure scenario: same as STRUCT-002 for the alias-drift part; separately, an agent following repository-map.md's instruction that shared/ "Must NOT contain... business concepts" and is the design-system home may not think to look in components/ui for a decorative widget, and re-implement one.
Affected users/features: landing/marketing/public pages (BadgeGraphic, MagicBento, AnimatedList, confetti-adjacent widgets).
Recommended direction: (1) rename/reframe components/ui as an intentional "marketing widgets" location and document it in repository-map.md if that's confirmed as the real distinction, OR (2) merge into shared/design-system/ui if the split isn't intentional. Either way, fix the components.json alias to point at whichever is decided as the target for new shadcn-generated primitives (should be shared/design-system/ui regardless, since shadcn generates primitives, not decorative widgets).
Implementation complexity: Low (config fix) to Medium (folder consolidation, pending decision).
Regression risk: Low.
Dependencies: Product/design decision on the intentional-split question.
Status: UNVERIFIED / NEEDS TESTING (whether split is intentional) — config-drift portion is CONFIRMED ARCHITECTURAL VIOLATION
```

No `services/` or `hooks/` mega-folder exists — both are properly domain-scoped (`domains/<name>/api`, `domains/<name>/hooks`). This is a structural strength worth noting explicitly rather than assuming every codebase has this problem.

## 3. Duplicated feature directories?

Covered under STRUCT-001 (explore/landing) and, separately, the roadmap feature:

```
ID: STRUCT-004
Severity: P2
Category: Duplicated/fragmented feature — roadmap
Location: features/roadmap/ (6549 lines, its own renderer/engine/store), domains/roadmaps/ (components, extensions, hooks, services, store, types, utils), plus FOUR separate app-router route trees: app/(authenticated)/roadmap/ (singular), app/(authenticated)/roadmaps/ (plural), app/(authenticated)/studio/roadmap/, and domains/courses/blocks/roadmap
Problem: The roadmap feature is spread across at least 4 distinct top-level locations with inconsistent singular/plural naming, and features/roadmap duplicates state-management and rendering machinery (features/roadmap/renderer/store/useRoadmapViewerStore.ts, features/roadmap/renderer/components/RoadmapViewer.tsx at 2324 lines) that domains/roadmaps (which has its own store, services, RoadmapCanvas.tsx at 804 lines) appears to also implement.
Evidence: `find . -type d -iname "*roadmap*"` returns 7 directories; features/roadmap/renderer/components/RoadmapViewer.tsx is the 3rd-largest file in the entire repo (2324 lines); domains/roadmaps/components/RoadmapCanvas.tsx is a separate 804-line canvas/renderer implementation. CLAUDE.md documents a 2026-07-21 "human-approved" decision that "/content was renamed to /render-engine and /roadmaps was merged into it as another content type" — but no render-engine/ directory exists anywhere in the tree (`find . -iname "*render-engine*"` returns zero results), meaning either the rename was reverted, never executed in the frontend, or happened on a branch not present here.
Why it matters: this is the single most fragmented feature area in the codebase, actively being worked on right now (features/roadmap and domains/roadmaps both show recent git churn — 6 and part of the "domains" churn respectively — and the user's own briefing notes the latest commits concern "a roadmap feature"). Whoever is doing that active work is very likely already fighting this exact fragmentation.
Failure scenario: a bug fix to roadmap rendering gets applied to RoadmapCanvas.tsx (domains/roadmaps) but the actual bug is being hit through RoadmapViewer.tsx (features/roadmap), or vice versa, because it's not obvious which one a given route renders without tracing imports.
Affected users/features: all roadmap viewing/editing/studio-authoring flows.
Recommended direction: given this is active, in-flight work (not settled legacy), do not attempt to resolve this audit-only — flag directly to whoever owns the roadmap work (matches the commit authorship "Athira - roadmap Linked" in the last 2 commits) with this evidence, and let them decide the consolidation given they have context this audit doesn't (e.g., which of the two renderers is being actively replaced by the other).
Implementation complexity: High (active feature, two renderer implementations, 4 route trees).
Regression risk: High if touched without the feature owner.
Dependencies: Feature owner input required.
Status: ARCHITECTURAL RISK — explicitly NOT recommending a specific consolidation given active development; flagging the fragmentation as fact only.
```

## 4. Domain logic inside page components / API logic inside UI components?

```
ID: STRUCT-005
Severity: P1
Category: God component — data + state + business logic + rendering fused
Location: app/(authenticated)/profile/page.tsx (1940 lines)
Problem: A single App Router page file contains 46 occurrences of useState/useEffect/fetch/axios/useQuery-pattern code, meaning data-fetching, client state, and rendering for the entire profile experience live in one file with no separation.
Evidence: `grep -c "useState\|useEffect\|fetch(\|axios\|useQuery" app/(authenticated)/profile/page.tsx` → 46. File is 1940 lines, the 5th largest in the repo.
Why it matters: per repository-map.md, app/ "Must NOT contain... complex business logic"; this is the clearest single violation of that rule in the repo, in one of the most heavily-trafficked pages (user profile).
Failure scenario: any change to profile data-loading behavior requires reading and safely modifying a 1940-line file with mixed concerns, raising the chance of an unrelated regression; testability is near-zero since there's no extracted hook/service to unit test independently of rendering.
Affected users/features: every user's profile page.
Recommended direction: extract data-fetching and derived state into one or more hooks under domains/identity or apps/core, leaving page.tsx as a thin composition of section components + the extracted hook(s). Do this incrementally, one section at a time, validated against the backend-wiring work already underway.
Implementation complexity: High.
Regression risk: High if done in one large sweep; Low-Medium if done incrementally per section.
Dependencies: None blocking, but should be sequenced with backend-wiring work since it will touch the same data-fetching code paths.
Status: CONFIRMED ARCHITECTURAL VIOLATION
```

```
ID: STRUCT-006
Severity: P1
Category: God component
Location: apps/core/components/ExploreHub.tsx (2444 lines — largest file in the repo), components/explore/CategoryDetailedView.tsx (2337 lines), features/roadmap/renderer/components/RoadmapViewer.tsx (2324 lines), apps/creator/shared/content-editor/SharedContentEditorOrchestrator.tsx (2248 lines)
Problem: 4 files exceed 2200 lines; 13 files exceed 1000 lines; 53 exceed 500 lines (see FRONTEND_INVENTORY.md §5). Not all of these are automatically bad — a canvas/renderer component (RoadmapViewer, RoadmapCanvas) legitimately concentrates rendering logic for a single complex visual surface, and a size threshold alone doesn't prove a mixing-of-concerns problem.
Evidence: line counts per FRONTEND_INVENTORY.md §5; spot-checked ExploreHub.tsx and profile/page.tsx for useState/useEffect/fetch density (10 and 46 respectively) confirming ExploreHub mixes fewer concerns proportionally to its size than profile/page.tsx does, suggesting ExploreHub's size may be more attributable to breadth of composed sub-views than fused business logic — this needs a closer read before assuming it needs the same treatment as STRUCT-005.
Why it matters: distinguishing "big because it composes many legitimate sub-sections" from "big because concerns are fused" changes the recommended fix (split into sub-components with the same responsibilities vs. extract hooks/services first). Treating every large file identically would be over-corrective.
Failure scenario: N/A — this entry exists to prevent mis-triage, not to assert a specific bug.
Affected users/features: explore/discovery, content editor, roadmap viewer.
Recommended direction: for SharedContentEditorOrchestrator.tsx specifically — the name itself signals it should be an orchestrator per the documented apps/ role, which is architecturally correct placement (it lives under apps/creator/shared/content-editor/); its size warrants a read-through to confirm it's actually orchestrating (delegating to domain components) rather than reimplementing domain logic inline, but placement is not a violation. For ExploreHub.tsx and CategoryDetailedView.tsx, recommend a follow-up manual read (not done exhaustively in this audit given the 634-file scope) before deciding whether to split.
Implementation complexity: Unknown pending follow-up read.
Regression risk: Unknown pending follow-up read.
Dependencies: None.
Status: UNVERIFIED / NEEDS TESTING (size alone is documented, concern-mixing is not confirmed for these 4 specifically beyond ExploreHub's lower fetch/state density)
```

## 5. Authorization logic duplicated across pages

See ARCH-006 in 02_FRONTEND_ARCHITECTURE.md (14 files with ad-hoc role/permission checks outside the centralized `authorization.service.ts`). Folded in here as a component-architecture concern as well: several of the 14 files (e.g. `apps/learner/layout/LearnerNavbar.tsx`, `apps/learner/layout/LearnerSidebar.tsx`) are navigation/shell components making authorization decisions inline, which is a "components with authorization logic embedded" pattern per this audit's explicit checklist.

## 6. Feature modules reaching into unrelated feature internals

The domain-boundary violations (ARCH-001, ARCH-005) are the concrete instances of this. No additional cross-*feature* (as opposed to cross-*domain*) violations were found — `apps/creator`, `apps/learner`, `apps/public`, `apps/core` do not import from each other's internals in the sampled grep (each apps/ subtree's `@/apps/` imports, where present, stayed within its own subtree).

## 7. Deeply nested prop drilling

```
ID: STRUCT-007
Severity: P3
Category: Verification gap — prop drilling not systematically measured
Location: N/A
Problem: Detecting prop drilling reliably requires tracing prop flow through component trees, which is impractical to do exhaustively across 624 files within this audit's scope. A targeted read of a few large, deeply-composed files (ExploreHub.tsx, SharedContentEditorOrchestrator.tsx) would be needed to confirm or refute prop drilling specifically, as opposed to other size drivers.
Evidence: N/A.
Why it matters: prop drilling is a real risk in a codebase with 2000+ line composition-heavy components, but asserting it without evidence would violate this audit's own "don't assume" standard.
Failure scenario: N/A.
Affected users/features: N/A.
Recommended direction: if prop-drilling pain is being felt by the team (ask), a targeted follow-up reading the 4-5 largest components' prop signatures would answer this quickly; otherwise not worth the audit budget given no reviewer or contributor has flagged it as a lived pain point.
Implementation complexity: N/A.
Regression risk: N/A.
Dependencies: None.
Status: UNVERIFIED / NEEDS TESTING
```

## 8. Components duplicated across features

Two confirmed instances, both already documented: `CategoryDetailedView.tsx` (ARCH-004) and the roadmap renderer/canvas duplication (STRUCT-004). No further duplicate-component instances were found via filename-collision search across `app/`, `apps/`, `domains/`, `components/`, `features/` beyond `CoursesView.tsx` (which exists once in `components/explore/` and once inside the untracked `.claude/worktrees/` scratch copy — not counted as a real duplication since the worktree is agent tooling state, not application source; see 10_FRONTEND_DEAD_CODE_AUDIT.md).

## 9. Should the repo be organized around features/domains rather than technical categories — and are there competing schemes?

**Yes to both halves of this question, but with an important nuance: the repo already chose feature/domain-oriented organization as its primary scheme (the `domains/` layer), and does so reasonably well for 12 of 14 domains.** The competing-scheme problem is not "domains vs. technical folders" (that battle is already won in favor of domains) — it's that **three additional, smaller organizational attempts exist alongside the winning scheme and were never fully migrated or cleaned up**:

1. `components/` — a pre-domains, technically-categorized tree (`ui`, `course`, `explore`, `landing`) that predates or ran parallel to the `domains/` migration.
2. `features/` — a single feature (`roadmap`) organized in a "feature-sliced" style that's structurally similar to what `domains/roadmaps` does, suggesting `features/` may have been an earlier or alternative pattern tried once and not repeated (no other feature exists there) before the team settled on `domains/`.
3. `apps/public/components/` — yet another partial copy of the `components/{explore,landing}` content, inside the otherwise-legitimate `apps/` orchestration layer.

This matches the task briefing's hypothesis exactly, with evidence now attached: `domains/` (189 files) is the largest and most mature scheme and is the one documented in `repository-map.md`; `components/` (33 files) and `features/` (20 files) are smaller, undocumented, and each has at least one confirmed dead or duplicate file inside it, consistent with abandoned/incomplete migrations rather than currently-intended parallel structures. Recency: `components/explore` shows 8 commits in the last 60 (still being touched, so not fully abandoned), while `features/roadmap` shows 6 (also still active) — meaning neither is safely "frozen legacy" that can be ignored; both need an explicit decision, not silent removal.

## Summary table

| Finding | Severity | Status |
|---|---|---|
| STRUCT-001 explore/landing duplication | P2 | CONFIRMED DUPLICATION |
| STRUCT-002 lib/utils vs shared/utils | P2 | CONFIRMED DUPLICATION |
| STRUCT-003 components/ui vs shared/design-system/ui | P2 | UNVERIFIED (intent) / CONFIRMED (config drift) |
| STRUCT-004 roadmap fragmentation | P2 | ARCHITECTURAL RISK |
| STRUCT-005 profile/page.tsx God component | P1 | CONFIRMED ARCHITECTURAL VIOLATION |
| STRUCT-006 large-file triage | P1 | UNVERIFIED / NEEDS TESTING |
| STRUCT-007 prop drilling | P3 | UNVERIFIED / NEEDS TESTING |
