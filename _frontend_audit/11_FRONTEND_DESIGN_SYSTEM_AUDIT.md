# Frontend Design System Audit — Arcade UI

Audit date: 2026-08-16
Scope: whole `ui/` tree (excluding `node_modules`, `.next`). Read-only audit; no source files touched.

## Bottom line

There is a real, if unglamorous, shadcn/radix-derived primitive layer — but it lives at `shared/design-system/ui/`, not at the path the project's own tooling config (`components.json`) claims (`@/components/ui`), and it is not a curated system: it has no documentation, no composition guidelines, no barrel that enumerates "the system," and it has organically accreted decorative one-offs and a domain-specific marketing bundle inside the same folder as the primitives. Beyond that primitive layer, reuse is inconsistent — Card, Badge, and Skeleton "concepts" are frequently re-implemented as bespoke divs with hand-picked Tailwind classes rather than composed from the primitive, and there is no shared component at all for common list-page needs (pagination, search, filters, empty states). Toast usage is the one area that behaves like a disciplined system already.

Verdict: **shadcn primitives reused ad hoc, with one real (but mislabeled and undocumented) primitive layer underneath the ad-hoc-ness** — closer to option 2 ("just shadcn primitives reused ad hoc") than option 1 ("a real design system"), but with the raw material already in place to become the latter without a rewrite.

---

## Inventory by tier

### CORE PRIMITIVES (should be canonical, low-level, unopinionated about business logic)

Actual location: **`shared/design-system/ui/`** (NOT `components/ui/`, despite `components.json:14` declaring `"ui": "@/components/ui"`).

Genuine shadcn-derived primitives present: `button.tsx`, `input.tsx`, `input-group.tsx`, `textarea.tsx`, `select.tsx`, `card.tsx`, `dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `tooltip.tsx`, `command.tsx`, `avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`, `table.tsx`, `skeleton.tsx`, `progress.tsx`, `scroll-area.tsx`, `separator.tsx`.

Confirmed missing from the primitive set entirely (zero matches on glob): **Checkbox, Switch, Tabs, Alert, Label, Accordion, RadioGroup, and a Toast primitive** (toast is instead handled entirely by `sonner`, which is fine — see below — but means there's no in-house Toast component to keep consistent with the rest of the set, which is actually the right call here).

Non-primitive content mixed into the same folder (should not live here):
- Decorative/animated one-offs: `dock.tsx`, `fluid-menu.tsx`, `floating-toolbar.tsx`, `magic-bento.tsx`/`.css`, `tilted-card.tsx`, `EnrollButton.tsx`/`.css`, `TextType.tsx`/`.css` **plus a duplicate nested copy** at `TextType/TextType.tsx`/`.css`, `ElasticMesh/ElasticMesh.tsx`/`.css`.
- A feature-specific marketing bundle: `ui/learning/` (`LearningCta.tsx`, `LearningDecorations.tsx`, `LearningHero.tsx`, `LearningLayout.tsx`, `LearningReviews.tsx`, `LearningTabs.tsx`, `index.ts`) — this is landing-page composition for one feature, not a generic primitive.
- Domain-flavored modals that don't belong in a primitive layer: `ReportModal.tsx`, `image-crop-modal.tsx`.

Separately, **`components/ui/`** (the path the tooling actually points at) contains only decorative/marketing widgets and zero shadcn primitives: `AnimatedList.tsx`, `BadgeGraphic.tsx`, `BracketPlaqueBorder.tsx`, `DottedTrapezoidBorder.tsx`, `FoldText.tsx`, `MagicBento.tsx` (a second, differently-cased copy of `shared/design-system/ui/magic-bento.tsx`), `Masonry.tsx`, `OrnamentalFlourishFrame.tsx`, `PartyPopper.tsx`, `SimpleGraph.tsx`, `TicketNotchBorder.tsx`, `WavyScallopedBorder.tsx`, `border-beam.tsx`.

### DOMAIN COMPONENTS (business-aware, composed from primitives, scoped to one domain)

This tier mostly exists and mostly does compose the primitives correctly (e.g. the ~20 Modal/Dialog wrappers listed in `04_FRONTEND_DUPLICATION_AUDIT.md` DUP-007 are thin wrappers around `dialog.tsx`). Where it breaks down:

- **Badge variants** are domain concepts correctly built as separate components (`domains/community/components/PostTypeBadge.tsx`, `ReputationBadge.tsx`, `TagBadge.tsx`; `app/(authenticated)/studio/events/components/badges/EventStatusBadge.tsx`) — this is legitimate, domain-specific composition of the `badge.tsx` primitive, not duplication.
- **Card-shaped surfaces**, by contrast, are frequently *not* composed from `card.tsx` at all — they're bespoke `<div>`s with independently chosen Tailwind classes (see "Inconsistency samples" below). This is the weak point of the domain tier: the primitive exists, but domain authors often didn't reach for it.

### PAGE COMPONENTS (route-level composition, orchestration, one-off layout)

Largest files in the repo are concentrated here (per `FRONTEND_INVENTORY.md` §5: `apps/core/components/ExploreHub.tsx` 2444 lines, `app/(authenticated)/profile/page.tsx` 1940 lines, etc.) — expected for this tier, not a design-system concern per se, but several of these pages (`profile/page.tsx`, `[username]/page.tsx`) are exactly where the copy-pasted `isAdmin` role-check block from DUP-001 lives, which is a symptom of page components growing large enough to reimplement logic instead of importing it.

---

## Findings

### DS-001
**Severity:** P2
**Category:** Design-system tooling / config drift
**Location:** `components.json:14` (`"ui": "@/components/ui"`) vs actual primitive location `shared/design-system/ui/*`; duplicate `MagicBento` at `components/ui/MagicBento.tsx` and `shared/design-system/ui/magic-bento.tsx`
**Problem:** The shadcn generator config points at a directory (`components/ui`) that contains zero real primitives, while the actual, actively-imported primitive set lives at `shared/design-system/ui` — a path the generator doesn't know about. Confirmed via grep: 0 files import `@/components/ui/button`; 20+ files import from `shared/design-system/ui`.
**Evidence:** See `04_FRONTEND_DUPLICATION_AUDIT.md` DUP-003 for the full grep evidence; same finding, reported here from the design-system-completeness angle rather than the duplication angle.
**Why it matters:** This is the strongest single piece of evidence that the "Version 1.0 STABLE" architecture claim in CLAUDE.md doesn't match the current state of the UI layer specifically — the move to `shared/design-system` happened without updating the tool that's supposed to generate new components into it.
**Failure scenario:** Next contributor (human or AI) runs `npx shadcn add <component>`, gets a file in a directory nothing imports, and either duplicates further or has to manually relocate it — friction and further drift, not a runtime failure.
**Affected users/features:** Developer experience only.
**Recommended direction:** Point `components.json`'s `ui` alias (and `utils`, which has the same problem — see `FRONTEND_INVENTORY.md` §3, `lib/utils.ts` referenced by 1 file vs `shared/utils/utils.ts` referenced by 34) at the paths actually in use. Relocate `components/ui`'s decorative widgets somewhere clearly non-primitive.
**Implementation complexity:** Low.
**Regression risk:** Low.
**Dependencies:** None.
**Status:** CONFIRMED DUPLICATION / ARCHITECTURAL RISK

---

### DS-002
**Severity:** P2
**Category:** Design-system primitive underuse — Card
**Location (sample, not exhaustive):**
- Primitive: `shared/design-system/ui/card.tsx:15` — `rounded-xl bg-card ... ring-1 ring-foreground/10 ... text-card-foreground` (token-based)
- Bespoke, non-composed "card-like" surfaces with independently invented styling:
  - `domains/publishing/components/VersionHistoryPanel.tsx:234` `rounded-2xl bg-slate-50`; `:268` `rounded-xl border-slate-100 bg-slate-50/80`; `:432` `rounded-2xl bg-[#14142b]` (raw hex)
  - `domains/publishing/components/ContentStatusHistoryModal.tsx:93` `rounded-xl bg-slate-100`; `:118` `rounded-2xl bg-slate-50`; `:138` `rounded-lg border-slate-100 bg-slate-50` — three different radii for visually similar "icon chip" surfaces within two sibling files
  - `domains/roadmaps/components/AppearancePanel.tsx:85` `rounded-2xl bg-[#1E1E1E]/95` (raw hex) vs `:101,190,250` `rounded-lg` vs `:173,180` `rounded-xl` — three radii in one file
  - `domains/roadmaps/components/LayerOutlinePanel.tsx:51,70` `rounded-lg` vs `:87,135` `rounded-xl` — mixed within one file
  - `domains/roadmaps/components/HoverCard.tsx:28` `rounded-xl bg-white ... border-gray-200` — hardcoded `bg-white`/`border-gray-200` instead of the `bg-card`/`border-border` tokens the actual primitive uses

**Problem:** The `card.tsx` primitive uses semantic design tokens (`bg-card`, `ring-foreground/10`) that would automatically respect theming, but a large share of "elevated surface" UI across `domains/publishing` and `domains/roadmaps` is built as raw, independently-styled divs — different radius scale (`lg`/`xl`/`2xl` used interchangeably, sometimes within the same file), and hardcoded colors (`slate-50`, `#14142b`, `#1E1E1E`, `gray-200`) instead of tokens.
**Evidence:** File:line list above.
**Why it matters:** This is the concrete mechanism behind "just shadcn primitives reused ad hoc" — the primitive exists and is well-built, but domain authors routinely didn't use it, so the visual language drifts panel by panel. Hardcoded hex colors also mean these surfaces won't respond correctly to any future theme/dark-mode token changes, unlike the primitive-based ones.
**Failure scenario:** A future dark-mode or rebrand token change updates `--card`/`--border` CSS variables; every component using `card.tsx` picks it up automatically, but the hardcoded-hex surfaces in `VersionHistoryPanel.tsx`, `AppearancePanel.tsx`, etc. stay visually stuck on the old palette, producing a visibly inconsistent product mid-migration.
**Affected users/features:** Publishing workflow panels, roadmap editor side panels — internal/creator-facing tooling, not the highest-traffic consumer surfaces, but a real user-visible inconsistency today (mixed radii are visible in a single screen in at least two files).
**Recommended direction:** Not "build more primitives" — the primitive already exists and is fine. The fix is adoption: replace the bespoke surfaces in `domains/publishing` and `domains/roadmaps` with `<Card>` (or a thin variant of it) and token classes. Given the current bar (no lint rule catching hardcoded hex/gray Tailwind classes), consider an ESLint rule or Tailwind-class allowlist as a longer-term guardrail rather than a one-time cleanup that will regress again.
**Implementation complexity:** Medium — cosmetic but touches many files; do incrementally per-domain rather than as one giant PR.
**Regression risk:** Low functionally, but visual regressions are easy to introduce silently (radius/spacing changes) — needs visual review, not just code review.
**Dependencies:** None.
**Status:** CONFIRMED DUPLICATION / TECHNICAL DEBT

---

### DS-003
**Severity:** P3
**Category:** Icon library inconsistency
**Location:** `components.json:12` declares `"iconLibrary": "lucide"`; exceptions found at `app/(public)/[username]/page.tsx:18` (`import { FaLinkedin } from 'react-icons/fa'`), `app/(authenticated)/profile/page.tsx`, `app/(authenticated)/notifications/page.tsx`
**Problem:** Three files import from `react-icons` instead of the declared `lucide-react` set, for a handful of icons lucide likely also covers (e.g. a LinkedIn brand icon — lucide has a generic `Linkedin` icon, though not always styled identically to `react-icons`' brand-accurate version, which may be *why* this exception exists — not confirmed).
**Evidence:** Import statement above; small blast radius (3 files).
**Why it matters:** Minor — an extra icon-library dependency for a handful of icons, and a small inconsistency versus the declared standard. Not worth urgent action.
**Failure scenario:** None significant; at most a slightly inconsistent icon visual weight/style in the 2-3 spots `react-icons` is used next to `lucide-react` icons.
**Affected users/features:** Public profile page, own profile page, notifications page — cosmetic only.
**Recommended direction:** If the `react-icons` usage is for brand-accurate social icons (LinkedIn, etc.) that lucide doesn't render faithfully, this may be an intentional, acceptable exception — worth a one-line confirmation rather than a mandated migration. If it's just habit/copy-paste, swap to lucide's equivalents for consistency the next time these files are touched for other reasons — not worth a dedicated PR on its own.
**Implementation complexity:** Trivial.
**Regression risk:** Negligible.
**Dependencies:** None.
**Status:** TECHNICAL DEBT (low priority) / UNVERIFIED whether the exception is intentional

---

### DS-004
**Severity:** P3
**Category:** Missing shared primitives for common list-page needs
**Location:** repo-wide — confirmed via glob, zero files match `Pagination`, `DataTable`, `SearchBar`, `SearchInput`, or `FilterBar` naming anywhere in the tree.
**Problem:** Every list/search/filter surface (e.g. `app/(authenticated)/console/iam/UsersList.tsx`, `app/(authenticated)/console/content-manage/page.tsx`, community forum listings) builds its own pagination/search/filter UI inline, with nothing shared to converge on.
**Evidence:** Glob returned 0 results for all four patterns.
**Why it matters:** Not itself a bug, but it's the most visible gap between "has a design system" and "has shadcn primitives" — pagination and search/filter controls are exactly the kind of composed-but-generic pattern a real design system tier would hold, and right now there's no candidate to consolidate around, only N independent implementations to eventually audit individually.
**Failure scenario:** Ongoing — inconsistent pagination UX (page-number vs "load more" vs infinite scroll, unpredictable per page), and no leverage point for a future accessibility or behavior fix (e.g. keyboard navigation for search) that would otherwise apply everywhere at once.
**Affected users/features:** Any list-heavy page — IAM console, content management console, community listings, course/channel management tables.
**Recommended direction:** Do not build a speculative generic `Pagination`/`DataTable`/`SearchBar` component up front. Instead, the next time two of these list pages are touched for feature work, extract the common shape into `shared/design-system` at that point — retrofitting from real usage avoids over-engineering a one-size-fits-all component before its actual requirements are known across surfaces.
**Implementation complexity:** N/A (deliberately deferred).
**Regression risk:** N/A.
**Dependencies:** None.
**Status:** ARCHITECTURAL RISK (gap, not duplication) — do not over-correct by building a large new component library speculatively.

---

### DS-005
**Severity:** P3
**Category:** Toast/notification system
**Location:** `apps/core/Providers.tsx:22,31` (single `sonner` `<Toaster>` at app root), 87 call sites across `domains/`, `apps/`, `app/`
**Problem:** None — reported here as a positive control / calibration point. Single library, single mount point, no competing custom Toast component, no `useToast` hook reimplementing anything.
**Evidence:** `apps/core/Providers.tsx:22` `import { Toaster } from 'sonner'`; `:31` `<Toaster position="top-right" richColors />`.
**Why it matters:** Demonstrates the codebase is capable of disciplined, single-source-of-truth reuse when a pattern is established early and consistently — the toast system is what the Card/EmptyState/formatDate patterns should look like.
**Failure scenario:** N/A.
**Affected users/features:** All.
**Recommended direction:** None needed. Use this as the internal reference example when communicating the Card/Badge/EmptyState consolidation recommendations to the team — "make it work like toast already does."
**Implementation complexity:** N/A.
**Regression risk:** N/A.
**Dependencies:** N/A.
**Status:** Not a finding — included for contrast. This is intentional reuse (a), working as intended.

---

## Recommended tier structure going forward (not a new component library — a placement recommendation)

- **CORE PRIMITIVES** → keep at `shared/design-system/ui/` (fix `components.json` to point here — DS-001). Strip out decorative one-offs and the `learning/` bundle; they don't belong in a primitive folder even though they can stay in `shared/design-system` under a differently named subfolder (e.g. `shared/design-system/decorative/`, `shared/design-system/marketing/learning/`) if that's the intended shared-asset home.
- **DOMAIN COMPONENTS** → stay where they are (`domains/*/components/`, `apps/*/components/`) — this tier is largely working correctly already (Badge variants, most Modal/Dialog wrappers). The fix needed here is adoption discipline (compose `Card`/`Badge` primitives instead of hand-rolling divs — DS-002), not relocation.
- **PAGE COMPONENTS** → stay in `app/`. The main design-system-relevant risk at this tier is size/scope creep (multiple 1000+ line pages) leading authors to reimplement logic locally instead of importing shared pieces (see DUP-001's `profile/page.tsx`/`[username]/page.tsx` findings) — a code-organization issue more than a design-system issue per se.
- Do **not** build a new generic component library speculatively for pagination/search/filter (DS-004) — extract from real usage when next touched.
