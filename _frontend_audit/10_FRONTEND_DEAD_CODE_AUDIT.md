# Dead Code & Stray Artifact Audit — Arcade UI

Audit date: 2026-08-16. Every item below was checked with an import-reference grep across `app/`, `apps/`, `domains/`, `shared/`, `infrastructure/`, `components/`, `features/` before being classified. Nothing was deleted, moved, or edited — this is a read-only inventory for a follow-on cleanup pass.

## Stray artifacts at repo root

```
ID: DEAD-001
Severity: P3
Category: Repository hygiene / dead artifact
Location: creator_designs.patch (387,174 bytes), full_design.patch (199,241 bytes) — both at E:\arcade\ui\ root
Problem: Two large unapplied git patch files sit at the repository root. Neither is referenced by any npm script, CI config, or README instruction.
Evidence: `find`/`ls` at repo root; grep of package.json scripts and .github/ workflows shows no reference to either filename.
Why it matters: patch files at repo root are almost never meant to be committed long-term — they're either a leftover from a design-review workflow (generating a diff to share, e.g. via GitHub/PR tooling) or an abandoned attempt to apply someone else's changes. Left in place, they bloat clone size (~570KB combined) and confuse anyone who finds them wondering if they're still needed.
Failure scenario: a future contributor either accidentally applies a stale patch against current code (likely to conflict badly given repo has moved on) or spends time investigating what they are.
Affected users/features: none (build/runtime unaffected — not imported/required by any code).
Recommended direction: confirm with whoever created them (likely tied to the "creator designs" and "content studio" work mentioned in the task briefing) whether they're superseded by the now-merged/in-progress work; if so, delete. If they capture not-yet-applied design work, move them out of the repo (e.g., attach to the relevant PR/ticket) rather than leaving them at root.
Implementation complexity: Trivial (delete or relocate).
Regression risk: None (not referenced by any code path).
Dependencies: Owner confirmation.
Status: SAFE TO DELETE (pending a quick confirmation these aren't someone's only copy of unmerged work — recommend asking before deleting since patch files by nature may be the only record of some change)
```

```
ID: DEAD-002
Severity: P3
Category: Repository hygiene — untracked agent-tooling state inside the tree
Location: .claude/worktrees/agent-a40856fc28d56ab27/ (contains a full nested copy of parts of the source tree, e.g. its own components/explore/CoursesView.tsx)
Problem: An untracked directory containing what appears to be a Claude Code agent's isolated worktree copy exists inside the repository and is not covered by .gitignore.
Evidence: `git status --porcelain` shows it as `?? .claude/worktrees/`; `git check-ignore -v .claude/worktrees` returns nothing (not ignored); contains duplicated source files that could confuse file-search tooling or get accidentally committed.
Why it matters: if committed, this would ship a stale, disconnected copy of application code into version control, and would make future `grep`/`find`-based audits (like this one) double-count files unless explicitly excluded, which this audit did by excluding `.claude` paths.
Failure scenario: someone runs `git add -A` and commits a snapshot of an old agent session's scratch copy of the codebase alongside real changes.
Affected users/features: none at runtime; repo cleanliness / future-audit-accuracy only.
Recommended direction: add `.claude/worktrees/` to `.gitignore` (or confirm it's meant to be ephemeral local tooling state and simply remove it locally). Not a source-code concern.
Implementation complexity: Trivial.
Regression risk: None.
Dependencies: None.
Status: SAFE TO DELETE (from the working tree) / recommend .gitignore entry to prevent recurrence.
```

## Explicit "delete me" markers already left in the code

```
ID: DEAD-003
Severity: P2
Category: Abandoned experiment / self-flagged temporary code
Location: app/dev-editor-perf/page.tsx (full route, plus its subtree of variant components)
Problem: The file's own header comment reads: "TEMPORARY perf-diagnosis page — DELETE after the latency investigation." It mounts 4 variants of the rich-text editor for typing-latency measurement, bypassing auth/backend entirely.
Evidence: app/dev-editor-perf/page.tsx lines 1-9 (verbatim comment quoted above, file read in full during this audit).
Why it matters: this is a real, reachable Next.js route (no auth gate, since it explicitly says it mounts "without auth/backend") that was self-documented as temporary. If the latency investigation it supported is finished, this is safe to remove; if not, it's still worth tracking so it doesn't silently ship to production as a public debug route.
Failure scenario: the route remains reachable in production, exposing an unauthenticated internal diagnostic page (low security impact given no data access, but still an unintended public surface and a Lighthouse/SEO/crawl-budget nuisance).
Affected users/features: none directly (dev/diagnostic tool), but its mere presence in the production route table is worth flagging.
Recommended direction: confirm with whoever ran the latency investigation (recent editor-focused commits: "add EditorRightSidebar...", "SharedContentEditorOrchestrator..." suggest this was very recent work) whether it's still needed; if not, delete the route per its own instruction.
Implementation complexity: Trivial (self-contained route folder).
Regression risk: None if the investigation is confirmed complete.
Dependencies: Owner confirmation.
Status: NEEDS VERIFICATION (author's own comment says delete, but audit cannot confirm the investigation concluded)
```

```
ID: DEAD-004
Severity: P2
Category: Commented-out backend integration, explicit TODO
Location: app/(authenticated)/roadmap/[id]/page.tsx:6-7, 17-35 (approx.)
Problem: The real data-fetching implementation (`roadmapService.getRoadmap(id)` with loading/error state) is fully written but commented out, with an explicit `// TODO: Wire backend up later` and `// We are currently using the RoadmapViewer preview UI directly without fetching the actual roadmap data from the backend.` The import of `roadmapService` and `RoadmapData` type is also commented out.
Evidence: file read in full during this audit; lines quoted verbatim above.
Why it matters: this is precisely the kind of file the upcoming "wire mock data to the real backend" effort needs to find — it's a page currently rendering a preview/placeholder instead of live data, with the real implementation already drafted and just switched off.
Failure scenario: N/A — this is exactly the target of planned work, not a bug. Listed here so it's not missed among 624 files.
Affected users/features: roadmap detail view (app/(authenticated)/roadmap/[id]).
Recommended direction: this is a direct input to the backend-wiring task the audit is feeding — uncomment and validate against the live `roadmapService.getRoadmap` API once the roadmap fragmentation question (STRUCT-004) is resolved, since there are two competing roadmap renderers and it's not certain this route will keep using `@/features/roadmap/renderer/components/RoadmapViewer` long-term.
Implementation complexity: Low (code already written, needs re-enabling + testing).
Regression risk: Low.
Dependencies: STRUCT-004 resolution recommended first (don't wire data into a component that might be replaced).
Status: CONFIRMED BUG (feature is a non-functional stub in production today, self-documented as such) — not a security/correctness bug, a known-incomplete feature.
```

## Confirmed orphaned duplicate component

```
ID: DEAD-005
Severity: P2
Category: Unreferenced duplicate file
Location: apps/public/components/explore/CategoryDetailedView.tsx (1254 lines)
Problem: No importer found anywhere in the tree. A differently-sized, actively-used file with the same name and overlapping purpose exists at components/explore/CategoryDetailedView.tsx (2337 lines, imported by 5 files).
Evidence: `grep -rln "apps/public/components/explore/CategoryDetailedView"` across app/apps/domains/shared/infrastructure/features/components returns zero matches; `apps/public/` as a whole is confirmed live (24 import sites elsewhere), ruling out "the whole apps/public tree is dead" as an explanation — this specific file is the orphan.
Why it matters: 1254 lines of unreachable code sitting next to a same-named live file is a maintenance trap (see ARCH-004 for the failure scenario).
Failure scenario: developer edits the wrong copy; see ARCH-004.
Affected users/features: none currently (unreachable).
Recommended direction: verify with `git log --follow --oneline -- apps/public/components/explore/CategoryDetailedView.tsx` and the same for the components/ copy to see which was authored/modified more recently, confirm zero dynamic/string-based imports (none found in this audit's grep, which covers static import syntax only — dynamic `import()` with a computed path would not be caught), then delete.
Implementation complexity: Trivial.
Regression risk: Low — recommend the git-log + dynamic-import double-check above before deleting, since the grep-based method has a theoretical blind spot for computed dynamic imports.
Dependencies: None.
Status: SAFE TO DELETE (pending the dynamic-import double-check noted above)
```

## Legacy/near-dead shared modules

```
ID: DEAD-006
Severity: P3
Category: Near-dead duplicate module kept alive only by tool config
Location: lib/utils.ts
Problem: Referenced by exactly 1 file in the entire source tree; kept alive only because components.json's shadcn alias points new scaffolding at it. Functionally a duplicate of shared/utils/utils.ts (34 references).
Evidence: grep counts above (also documented as STRUCT-002 in 03_FRONTEND_STRUCTURE_AUDIT.md, where the recommended fix — repoint components.json — is detailed).
Why it matters: not fully dead (1 live reference), so not immediately deletable, but on a clear path to becoming dead-by-neglect once STRUCT-002's config fix ships.
Failure scenario: none currently; risk is purely the forward-drift described in STRUCT-002.
Affected users/features: none currently broken.
Recommended direction: see STRUCT-002 — fix components.json, migrate the 1 remaining importer, then delete lib/utils.ts and the lib/ directory.
Implementation complexity: Trivial.
Regression risk: Low.
Dependencies: STRUCT-002.
Status: NEEDS VERIFICATION (1 live importer must be migrated first — not zero-reference today)
```

## Inline mock data (the direct backend-wiring surface)

```
ID: DEAD-007
Severity: P2
Category: Mock/placeholder data awaiting real backend wiring
Location: 12 files contain inline mockData/MOCK_*/const mock identifiers:
  app/(authenticated)/channels/[id]/manage/components/AIInsightsPanel.tsx
  app/(authenticated)/channels/[id]/manage/components/ArticlesManagementSection.tsx
  app/(authenticated)/channels/[id]/manage/components/BootcampManagementSection.tsx
  app/(authenticated)/channels/[id]/manage/components/CourseManagementSection.tsx
  app/(authenticated)/channels/[id]/manage/components/EventsManagementSection.tsx
  app/(authenticated)/channels/[id]/manage/components/OrganizationAnalyticsSection.tsx
  app/(authenticated)/channels/[id]/manage/components/RecentActivityTimeline.tsx
  app/(authenticated)/channels/[id]/manage/components/ReviewsFeedbackSection.tsx
  app/(authenticated)/channels/[id]/manage/components/StaffDetailsModal.tsx
  app/(authenticated)/channels/[id]/manage/components/StaffManagementSection.tsx
  app/(authenticated)/channels/[id]/manage/components/WebinarManagementSection.tsx
  app/(authenticated)/studio/content/[contentType]/[contentId]/components/sections/LearnersAnalyticsSection.tsx
Problem: These are not "dead code" in the traditional sense (unreferenced) — they are live, rendered components whose data source is hardcoded rather than fetched. 10 of the 12 are concentrated in a single feature area: channel management.
Evidence: grep for mockData/MOCK_/const mock identifiers, confirmed these are all rendered route-reachable components (channels/[id]/manage is a live route tree).
Why it matters: this is the most concrete, itemized answer to "where does mock data need to become real backend calls" — precisely the next phase of work this audit exists to prepare for. Channel management is disproportionately mock-heavy (10/12 files), suggesting that entire feature was built UI-first without backend endpoints yet, or the endpoints exist but wiring was deferred.
Failure scenario: N/A — informational inventory for planning, not a bug report.
Affected users/features: channel management (staff, articles, bootcamp, courses, events, org analytics, activity timeline, reviews, webinars — i.e., nearly the entire channel-owner admin surface), plus one Studio content-overview analytics section.
Recommended direction: prioritize channel management as the first backend-wiring target given its concentration of mock data in one coherent feature area; confirm with backend team whether corresponding endpoints already exist (the backend underwent its own audit/remediation per the task briefing) before starting.
Implementation complexity: Medium-High (10-12 files, likely need corresponding backend endpoint confirmation per file).
Regression risk: Low to document, Medium to implement (out of scope for this audit).
Dependencies: Backend endpoint availability confirmation.
Status: CONFIRMED — this is a mapped inventory of known mock-data surface, not a bug.
```

## Redundant editing-library usage (dev-only route reference)

```
ID: DEAD-008
Severity: P3
Category: Verification needed — single-usage third-party integrations
Location: apps/creator/editor/components/RichTextBubbles.tsx (only file importing @excalidraw/excalidraw); domains/badges/components/BadgeCanvas.tsx (only file importing konva/react-konva)
Problem: Both libraries have exactly one importing file each in the entire tree. Both were checked for reachability: RichTextBubbles.tsx is imported by the live ArcadeEditor.tsx (and the flagged-for-deletion dev-editor-perf route), and BadgeCanvas.tsx is imported by 5 other files within the actively-developed domains/badges domain (15 commits in the last 60 per FRONTEND_INVENTORY.md churn table) — both are reachable/live, not orphaned.
Evidence: import-site grep plus reverse-importer grep for both entry files.
Why it matters: single-usage heavy dependencies (excalidraw is a large library) are worth knowing about even when live, since they add real bundle weight for one feature — this is a bundle-budget note, not a dead-code finding.
Failure scenario: N/A — both are confirmed live.
Affected users/features: rich-text editor sketch/drawing feature, badge design canvas.
Recommended direction: no action needed for dead-code purposes; consider dynamic-import/code-splitting these two heavy, narrowly-used libraries if bundle size becomes a concern (out of scope for this audit).
Implementation complexity: N/A.
Regression risk: N/A.
Dependencies: None.
Status: NOT DEAD — verified live and reachable; downgraded from initial suspicion based on single-file usage.
```

## Not investigated to a firm conclusion (explicitly flagged as gaps)

```
ID: DEAD-009
Severity: P3
Category: Verification gap
Location: N/A — audit-scope limitation
Problem: This audit checked for dead code via static import grep only. It did not run a dedicated unused-export tool (e.g., ts-prune, knip) across all 624 files, and did not check for: unreachable conditional branches, unused exported TypeScript types/interfaces, or components exported from a domain's index.ts but never imported by any consumer (as opposed to files never imported at all, which was checked).
Evidence: N/A — documents method limitation.
Why it matters: a tool-based pass (knip in particular is well-suited to a Next.js + TypeScript monorepo-style layout like this one) would likely surface additional unused exports beyond the file-level dead code found manually here.
Failure scenario: N/A.
Affected users/features: N/A.
Recommended direction: run `npx knip` (or `ts-prune`) as a follow-up and fold results into this document before acting on any "keep" decisions made here based on absence of evidence.
Implementation complexity: Low (tooling run only).
Regression risk: None.
Dependencies: None.
Status: UNVERIFIED / NEEDS TESTING
```

## Summary table

| ID | Item | Classification |
|---|---|---|
| DEAD-001 | creator_designs.patch, full_design.patch | SAFE TO DELETE (confirm first) |
| DEAD-002 | .claude/worktrees/ | SAFE TO DELETE / add to .gitignore |
| DEAD-003 | app/dev-editor-perf/ route | NEEDS VERIFICATION |
| DEAD-004 | app/(authenticated)/roadmap/[id]/page.tsx commented backend call | CONFIRMED — known stub, input to planned work |
| DEAD-005 | apps/public/components/explore/CategoryDetailedView.tsx | SAFE TO DELETE (pending dynamic-import check) |
| DEAD-006 | lib/utils.ts | NEEDS VERIFICATION (1 live importer to migrate first) |
| DEAD-007 | 12 files with inline mock data | POTENTIALLY REFERENCED EXTERNALLY (i.e., live UI awaiting real data — not for deletion, for wiring) |
| DEAD-008 | excalidraw / konva single-usage | NOT DEAD (verified live) |
| DEAD-009 | Broader unused-export sweep | UNVERIFIED / NEEDS TESTING (tooling gap) |
