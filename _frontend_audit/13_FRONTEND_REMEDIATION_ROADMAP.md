# 13 — Frontend Remediation Roadmap

This is a proposed sequencing, not an authorization to implement. Per the audit's own ground rules and the project's `CLAUDE.md` ("Architecture Protection" — structural changes require explicit approval, never auto-applied), every phase below should be scoped into its own reviewed change, not batched into one large PR.

## PHASE 0 — Critical security/correctness blockers

Goal: nothing here requires architectural change. All are surgical, low-regression-risk fixes.

| Finding | Files | Complexity | Risk | Benefit |
|---|---|---|---|---|
| `IAM-003` — `/console/inbox` unguarded (backend + frontend) | Backend: `ContactMessageController.java`; Frontend: `app/(authenticated)/console/inbox/page.tsx` | Small | Low (only removes access from users who shouldn't have had it) | Closes a live broken-access-control hole exposing PII and abuse reports platform-wide |
| `XSS-001` — forum stored XSS | `domains/community/components/CommentCard.tsx:130-136`, `app/(public)/forum/[slug]/page.tsx:147-153` | Small (drop-in sanitizer) / moderate (allowlist tuning) | Low-moderate | Closes a realistic full-session-hijack path reachable by any forum poster |
| `PERF-005` — broken production build | `package.json` (add `@types/canvas-confetti`) | Trivial | None | Unblocks CI/deploy; currently confirmed broken |
| `API-09` — SSRF-shaped media-upload proxy | `app/api/internal/media/upload/route.ts` | Small | Low | Closes a server-side request forgery surface |
| `API-07` — hardcoded OAuth redirect to localhost | `apps/public/orchestrators/AuthOrchestrator.tsx:171` | Trivial | Low | Google login is currently non-functional outside local dev |
| `ROUTE-002` — unguarded dev route | `app/dev-editor-perf/page.tsx` | Trivial (pending content confirmation) | None | Removes unnecessary production attack surface |

Dependencies: none — this phase can start immediately and independently of every later phase.

## PHASE 1 — Architecture/boundary fixes

Goal: close the gaps between the documented architecture and reality, without changing the architecture itself.

| Finding | Files | Complexity | Risk | Benefit |
|---|---|---|---|---|
| Give `enrollment`, `iam` domains public `index.ts` barrels | `domains/enrollment/`, `domains/iam/` | Small | Low | Unblocks deep-import cleanup across consumers |
| Break payment/enrollment circular dependency | TBD — needs the specific cycle traced in `02_FRONTEND_ARCHITECTURE.md` `ARCH-*` findings before scoping | Medium | Medium | Removes a genuine circular-dependency violation |
| `AUTH-001`/`API-10` — delete dead orphaned auth model | `infrastructure/auth/auth.ts`, `apps/core/components/AuthGuard.tsx` | Trivial | None (unreferenced) | Removes a landmine that would silently misbehave if ever reintroduced |
| `DEAD-001`/`DEAD-002` — stray patch files and duplicate worktree | `creator_designs.patch`, `full_design.patch`, `.claude/worktrees/` | Trivial (confirm intent first) | None once confirmed | Repo hygiene |

Dependencies: none blocking Phase 0; can run in parallel.

## PHASE 2 — Duplication and shared infrastructure

Goal: pick a canonical implementation for each duplicated concern and migrate off the other. Each row is an independent decision + migration, not one big-bang change.

| Finding | Decision needed | Files | Complexity | Risk |
|---|---|---|---|---|
| `STRUCT-003`/`04-DUP` — two UI-primitive folders | Which is canonical: `components/ui/` or `shared/design-system/ui/`? Fix `components.json` to match. | `components/ui/*` (17 files) vs `shared/design-system/ui/*` (43 files) | Medium (migration touches many import sites) | Medium |
| `STRUCT-004` — roadmap fragmentation | Which is canonical: `features/roadmap` or `domains/roadmaps`? | `features/roadmap/*` (20 files) vs `domains/roadmaps/*` | Medium | Medium |
| `STRUCT-002` — `lib/utils.ts` vs `shared/utils/utils.ts` | Migrate the 1 live importer off `lib/utils.ts`; repoint `components.json`'s shadcn alias | `lib/utils.ts`, `components.json` | Small | Low |
| `API-01` — two HTTP client stacks | Consolidate `auth.service.ts` (axios) onto `api.ts` (fetch) | `infrastructure/http/api.ts`, `infrastructure/auth/auth.service.ts`, `apps/core/components/AuthInitializer.tsx` | Medium | Medium-high (security-sensitive refresh flow) |
| `API-04` — 6x duplicated `getAvatarUrl` | Extract one shared helper | 6 files listed in `05_FRONTEND_API_INTEGRATION_AUDIT.md` | Trivial | Low |
| `API-05`/`API-06` — hardcoded base-URL/WS-URL literals | Centralize backend origin + WS URL config | `infrastructure/http/api.ts`, `app/api/internal/auth/*/route.ts`, `infrastructure/auth/auth.service.ts`, `domains/community/hooks/useWebSocket.ts`, `infrastructure/websocket/useWebSocket.ts`, `domains/learning/components/TimeTracker.tsx` | Small | Low |
| `IAM-005` — hardcoded/guessed role-name string lists | Replace with a shared `AuthorizationService.getDisplayRoleBadge()` helper | `app/(public)/[username]/page.tsx`, `app/(authenticated)/profile/page.tsx` | Small | Low (cosmetic) |
| Duplicated `formatDate`, EmptyState, Skeleton implementations | Consolidate into `shared/` | Multiple (see `04_FRONTEND_DUPLICATION_AUDIT.md`) | Small per instance | Low |

Dependencies: the UI-primitive and roadmap decisions should happen before Phase 6 (mock-data replacement) touches the same files, to avoid rework.

## PHASE 3 — API/data integration foundation

Goal: make the data layer consistently cacheable and consistently typed before wiring more real data onto it.

| Finding | Files | Complexity | Risk |
|---|---|---|---|
| `STATE-001` — extend React Query pattern beyond `community/forum` | 77 files currently doing manual `useEffect`+fetch (see `08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md`) | Large (many files, but mechanical per-file) | Medium |
| `API-02` — fix `queryClient.ts`'s error-shape check | `infrastructure/state/queryClient.ts:14` | Trivial | Low |
| `IAM-001`/`IAM-002` — resolve nonexistent permission codes | Backend `IamBootstrap.java` seed list (or) frontend `authorization.service.ts` re-gating | Cross-team decision + moderate implementation | Medium |
| `CONTRACT-03` — verify frontend status/enum types against backend | Frontend `domains/*/types/*.ts` (not yet individually diffed — see contract audit's "what this audit could not verify") | Small (verification) + variable (fixes) | Low to verify |
| `TS-001`/`TS-002` — reduce `any`/`as any` usage (403 occurrences) | Codebase-wide | Large, should be incremental (e.g. enforce no-new-any via lint, don't attempt a single sweep) | Low if incremental |

Dependencies: Phase 2's HTTP-client consolidation should land before or alongside the React Query expansion, so the new pattern isn't built on top of two different error shapes.

## PHASE 4 — Performance/scalability

Goal: address the confirmed and architectural-risk items once the build is fixed and real bundle numbers can be measured.

| Finding | Files | Complexity | Risk |
|---|---|---|---|
| `PERF-002` — pagination/virtualization on catalog-style lists | Course catalog, admin tables, review queues (see perf audit for sampled list) | Medium | Low |
| `PERF-003` — code-split heavy editor libraries (tiptap/excalidraw/mermaid/konva) behind `next/dynamic` | Editor-hosting components in `apps/creator/editor/*` and related | Medium | Low |
| `STATE-002` — stale cached auth/role/enrollment data after mutation | Pairs naturally with Phase 3's React Query expansion (invalidation comes for free once queries are properly keyed) | Small once Phase 3 lands | Low |
| `STATE-004` — two websocket hook implementations | `domains/community/hooks/useWebSocket.ts`, `infrastructure/websocket/useWebSocket.ts` | Small | Low |

Dependencies: measure real bundle size only after Phase 0's build fix lands — do not guess at numbers before then.

## PHASE 5 — Testing

Goal: close the zero-coverage gap, prioritized by the business-critical flows identified in `09_FRONTEND_TESTING_AUDIT.md`.

| Priority | Flow | Rationale |
|---|---|---|
| 1 | Authentication / token-refresh race conditions | Hosts confirmed security-adjacent complexity (dual refresh-trigger components, dual token-transport mechanisms per `CONTRACT-02`) |
| 2 | Authorization / Platform Console access | Hosts the two P0 findings in this audit; regression protection here is the highest-leverage test investment in the codebase |
| 3 | Content publishing / review workflow | Business-critical, currently fully manual |
| 4 | Enrollment | Business-critical, three overlapping backend enum concepts increase regression risk |
| 5 | Exams | Business-critical |
| 6 | Roadmap collaboration | Realtime/collaborative editing, higher inherent bug surface |
| 7 | Notifications | Lower business risk, but simple to cover as a starting exercise |
| 8 | Payments | Lowest priority in this pass only because the flow's exact location wasn't conclusively confirmed — should be re-scoped once confirmed |

Also add: `error.tsx` boundaries to `console/`, `studio/` (non-events subtrees), and `channels/[id]/manage/` (currently missing per `ROUTE-001`'s routing inventory), and a keyboard-accessibility sweep of the 33 `<div onClick>` sites plus the 2+ custom modals bypassing the project's accessible dialog primitive.

## PHASE 6 — Mock-data replacement

Goal: swap fake data for real, prioritized by effort-to-value. See [06_FRONTEND_MOCK_DATA_INVENTORY.md](./06_FRONTEND_MOCK_DATA_INVENTORY.md) for full per-screen detail.

**Tier 1 — real backend service/endpoint already exists, just needs wiring:**
- Notifications full page (`app/(authenticated)/notifications/page.tsx`) → `NotificationService`
- Settings→Security sessions (`app/(authenticated)/settings/security/page.tsx`) → `GET /api/v1/sessions` (confirmed real in `12_FRONTEND_BACKEND_CONTRACT_AUDIT.md`)
- `StaffManagementSection.tsx` → `domains/channels/api/channel-staff.service.ts` (already used correctly by a sibling component)

**Tier 2 — real backend content exists but needs a small extension (e.g. curriculum/review fields on an already-fetched course object) or the remaining 8 channel-manage tabs, which need per-tab restructuring (props/hook instead of local `useState(mockX)`) but sit behind an already-correct real shell:**
- `learn/[courseId]/page.tsx` MODULES/REVIEWS sections
- Remaining `channels/[id]/manage/components/*` tabs (Webinar, Events, Bootcamp, Articles, Reviews, Org Analytics, AI Insights, Recent Activity)
- `StaffDetailsModal.tsx`, `SmallCourseOverview.tsx` (need prop-threading fixes once `CourseManagementSection.tsx`'s real data path becomes the only path)

**Tier 3 — no backend endpoint exists yet; needs backend design work before any frontend swap:**
- Leaderboard (no ranking/XP endpoint)
- Achievements (no learner badge/certificate/XP endpoint)
- Studio `LearnersAnalyticsSection.tsx` (no corresponding `api/` module for this feature)
- IAM policy-editor's risk-level/permission-origin indicators (no backend concept exists for either yet)

Dependencies: Tier 1 should start immediately after Phase 0/1 — it requires no backend work and delivers the highest value-per-effort in this entire roadmap. Tier 3 is blocked on backend product/design decisions and should not be scheduled until those land.

## PHASE 7 — Cleanup/dead code

| Finding | Files | Complexity | Risk |
|---|---|---|---|
| `DEAD-005` — unreferenced duplicate `CategoryDetailedView.tsx` | `apps/public/components/explore/CategoryDetailedView.tsx` (pending dynamic-import check) | Trivial once confirmed | None |
| `DEAD-003` — confirm and gate/remove `dev-editor-perf` | Already in Phase 0 if confirmed unguarded; full removal here if confirmed genuinely dead | Trivial | None |
| `DEAD-009` — broader unused-export sweep | Tooling gap — recommend adding `ts-prune` or equivalent to CI | Small (tooling setup) | None |
| `MOCK-03` — confirm/remove `public/mock-questions.json` | Needs confirmation against `domains/assessments` first | Trivial once confirmed | None |

## PHASE 8 — Long-term improvements

Not required for production readiness, but worth tracking:

- Reduce the 403 `any`/`as any` occurrences incrementally via a lint rule preventing new ones, rather than a one-time sweep.
- Add runtime validation (zod, already a dependency but used in only 1 file) at the API-response boundary for high-value domains, rather than trusting backend responses blindly.
- Consider `middleware.ts`-based defense-in-depth for authenticated routes, on top of (not replacing) the existing correct client-side + backend enforcement.
- Revisit the `@tiptap/*` direct-usage vs. `reactjs-tiptap-editor` wrapper split — confirm with the owning team whether both are deliberately serving different surfaces or whether one is a leftover from a migration.

## Sequencing summary

```
Phase 0 (days)      ─┬─ Phase 1 (days-1wk) ─┬─ Phase 2 (1-3wk) ─── Phase 3 (2-4wk) ─── Phase 4 (1-2wk)
security/build fix  │  boundary cleanup     │  pick-and-migrate     data-layer         perf, after build
                     │                       │  duplication          consolidation      is measurable
                     └───────────────────────┴─────────────┬─────────────────────────────────┘
                                                             │
                                              Phase 5 (ongoing, start early) ── tests, prioritized by risk
                                                             │
                                              Phase 6 (Tier 1 starts after Phase 0/1;
                                                        Tier 2 after Phase 2's UI-primitive decision;
                                                        Tier 3 blocked on backend design work)
                                                             │
                                              Phase 7 (anytime, low risk) ── Phase 8 (ongoing)
```
