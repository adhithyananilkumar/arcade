# Theming

**Scope: the theme applies only inside the signed-in app** — the `(authenticated)` route group.
Landing, explore, public course/event pages, sign-in and onboarding always render Arcade's
standard light design, whatever the viewer chose. The `(authenticated)` layout mounts
`ThemeScope`; `AppearanceController` applies the appearance while one is mounted and clears it
otherwise. For first paint the boot script uses `APP_THEME_ROUTE` (theme.store.ts), and
`theme.scope.test.ts` fails if that pattern drifts from the route groups — when adding a
signed-in top-level route, add it to the pattern.

Arcade has three independent appearance settings, applied as attributes on `<html>`:

| Setting   | Values                      | On `<html>`                       |
|-----------|-----------------------------|-----------------------------------|
| Tone      | light · dark · system       | `class="dark"`                    |
| Contrast  | standard · high             | `data-contrast="high"`            |
| Material  | solid · glass (+ wallpaper) | `data-material="glass"`, `data-wallpaper` / `--wallpaper-image` |

The saved appearance is applied before first paint by `APPEARANCE_BOOT_SCRIPT`
(`infrastructure/state/theme.store.ts`), kept in sync by
`apps/core/components/AppearanceController.tsx`, and stored per account by the backend
(`/api/v1/users/me/appearance`). Wallpapers are curated in Console → Appearance
(`platform.appearance.manage`).

## Writing components that follow the theme

All tokens live in `app/themes.css`.

- **Neutral colours: use Tailwind's neutral families** (`slate`, `gray`, `zinc`, `neutral`,
  `stone`). They are re-pointed per theme, so `text-slate-900` is "strongest text" and
  `bg-slate-50` is "subtle panel" everywhere. **Do not add `dark:` variants for neutral colours** —
  they would flip a colour that is already flipped.
- **Card/panel surface:** `bg-surface` (never `bg-white`). It turns translucent and frosted in glass.
- **Arcade ink:** `text-ink`, `bg-ink`, `hover:bg-ink-hover`; text on an ink fill is `text-on-ink`.
  Ink inverts in dark (dark buttons become light buttons).
- **Coloured tints** (`bg-amber-50 text-amber-700`) need a dark pair:
  `dark:bg-amber-500/10 dark:text-amber-300`.
- **Inline styles / CSS files:** wrap neutral colours as a theme switch with the light value as the
  fallback — `var(--theme-surface, #ffffff)`, `var(--theme-ink, #14142b)`, `var(--theme-n-500, #64748b)`,
  `var(--theme-wash, <light page gradient>)`. Undefined in light, so light renders exactly as written.
- **Deliberately absolute colours** (a black/white sample, badge artwork): add the no-op class
  `theme-fixed` to the class list so the migration scripts leave it alone.
- **Floating chrome** (pills, docks): `apple-glass-dock`.
- **Full-screen page background layers** (a `fixed inset-0` div painting a page's own backdrop):
  add `theme-page-layer` so it steps aside for the glass wallpaper and the high-contrast ground.
- **A page's own full-height wrapper** (`min-h-screen bg-surface …`): add `theme-page-bg` so it
  turns transparent under glass and the wallpaper shows around the page's cards.
- **Content that sits directly on the page** (no card behind it, like Settings rows): add
  `theme-glass-panel` to its container — one frosted panel under glass, nothing in solid themes.
- **Inline-styled surfaces** (`background: var(--theme-surface, …)`) get the same frost as
  `bg-surface` automatically.
- **Glass limits:** panel opacity is clamped to 0.5–0.9 (client and server); wallpaper dimming is
  0–0.6, darkening the wallpaper for light text and softening it towards white for dark text.
- **Third-party widgets** that take a theme prop: `useDocumentTheme()` from `shared/hooks`.

## Migration scripts

`scripts/theme-codemod.mjs` (class lists), `scripts/theme-codemod-styles.mjs` (inline styles and
SVG colour attributes) and `scripts/theme-codemod-css.mjs` (CSS files) apply the rules above to
existing code. They are idempotent; run them dry first (no `--write`) to review.
