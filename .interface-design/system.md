# Martyrs frontend design patterns

Saved from the implemented auth UI on 2026-10-11. Read this before building or refining frontend screens. These are current, scoped patterns, not a completed dashboard design system.

## Direction

The orchestrator serves administrators and instructors managing learning content, assessments, and learners. Interfaces should feel focused, calm, and operational. The supplied sign-in screenshot establishes the auth composition: a narrow centered form, compact heading, quiet supporting text, small blue workspace icon, and one full-width primary action. Do not introduce marketing panels, decorative gradients, oversized headings, or an enclosing card around this form.

Preserve the shared shadcn preset `b7nwSN6jVA` and Base UI components. The user approved promoting auth blue to the shared primary across both apps: `#155dfb` with white primary-action text, plus `#51a2ff` for readable dark-mode focus and sidebar selected-link text. Neutral surfaces remain unchanged; `.auth-surface` keeps only its auth-specific control/surface refinements.

## Theme contract

- Light is the default, including when the operating system prefers dark.
- Support both light and dark on every new screen through semantic tokens.
- Reuse `ThemeProvider`, `ThemeToggle`, and `UiProvider` from `packages/ui`.
- Save the explicit preference under `martyrs.theme` in localStorage; unavailable storage must not break the UI.
- Keep `themeInitScript` in both root HTML documents so saved dark mode is applied before first paint. Preserve hydration handling.
- Theme changes should snap cleanly, with transitions temporarily suppressed rather than making the entire page cross-fade.
- The theme toggle uses a 44px hit area, a named action, and Phosphor moon/sun icons. In auth, place it 20px from the top and right of the page.

## Color and depth

Use `background`, `foreground`, `muted-foreground`, `primary`, `primary-foreground`, `input`, `ring`, and `destructive` tokens, not raw colors inside view components. Token definitions live in `packages/ui/src/styles/globals.css`.

Auth overrides currently use:

| Token | Light | Dark |
| --- | --- | --- |
| Background | Shared light background | `#09090b` |
| Foreground | Shared light foreground | `#fafafa` |
| Muted foreground | Shared light muted text | `#a1a1aa` |
| Primary | `#155dfb` | `#155dfb` |
| Primary foreground | `#ffffff` | `#ffffff` |
| Input border | `#8a8f99` | `#62626d` |
| Focus ring | `#155dfb` | `#51a2ff` |
| Auth link | Primary token | `#51a2ff` |

Depth strategy: flat canvas with structural control borders and restrained focus rings. No raised auth card or dramatic shadows. The workspace icon uses a small outline ring to distinguish it from the canvas. Keep contrast readable in both themes; verify text, links, control boundaries, and focus states independently.

## Typography and hierarchy

- Body, headings, and controls in both apps: Season Collection Sans via `font-sans` and `font-heading`.
- Use the supplied `SeasonCollectionVF-TRIAL.ttf`, available in each app's public folder. The shared face uses the verified Sans axis (`SERF: 0`), variable weights 300-900, and `font-display: swap`. Each root document preloads its own local font URL; neither app depends on the other app's server.
- Auth title: 20px, 600 weight, tight tracking.
- Labels: 14px, 500 weight; required indicators use the destructive token.
- Supporting text: 14px, 400 weight, 24px line-height, muted foreground.
- Input and button text: 14px; the primary button uses the shared medium-weight treatment.
- Small password guidance: 12px, muted foreground.
- The hierarchy is heading -> labels/actions -> supporting text. Use weight, space, and contrast, not excessive size differences. Sign-in is the single focal action.

Season Collection Sans was explicitly approved for both apps. Preserve it instead of reintroducing Inter or Instrument Sans. Keep existing size/weight hierarchy and check wrapping whenever typography changes. The supplied file is a trial font; confirm an appropriate webfont license before public deployment.

## Spacing and reusable components

Use a 4px base spacing unit and the existing preset radius scale (`--radius: 0.625rem`).

- `AuthLayout`: minimum viewport height, vertically and horizontally centered; 384px maximum form width; 24px horizontal gutters and 80px vertical padding. Allow scrolling on short screens.
- Header -> form: 28px. Icon -> heading: 12px. Heading -> description: 4px.
- Form sections: 24px gaps. Label -> input: 8px.
- `Input`: 40px height, 12px horizontal padding, shared `rounded-md`, 1px input border, visible 2px focus ring. Reuse the shared component.
- Auth primary `Button`: 40px height, full form width, shared radius and primary variant. Reuse the existing Base UI button instead of recreating it.
- Workspace mark: 32px container, 22px filled Phosphor teacher icon, shared small radius, 1px ring with 2px offset. This is a workspace indicator, not an approved brand logo.
- Remember-email row: 16px native checkbox with 12px gap; the whole text label is clickable. Supporting copy sits below its label with a 4px gap.
- Recovery links sit in the same relative locations across auth screens. Keep the password label and forgot-password action on one row where space permits.

`AuthLayout` is reused by sign-in, forgot-password, reset-password, and the temporary signed-in handoff. Shared controls belong in `packages/ui`; app-specific layout composition belongs in the app's `components` folder.

## Interaction and accessibility

- Use native form semantics, associated visible labels, appropriate input types, and password-manager autocomplete. Allow paste.
- Every action needs hover, keyboard focus, active, disabled, and pending states. Disable duplicate submissions and use explicit progress copy.
- Report failures with readable recovery instructions and `role="alert"`; confirmations use `role="status"`.
- Keep password-recovery confirmation enumeration-safe.
- All product forms use Formik with feature-owned Yup schemas. Use shared `FormInput` for touched inline errors and helper/error `aria-describedby`, and `FormFeedback` for server errors and a focused error summary whose controls return focus to invalid fields. Validate on change, blur, and submit; reveal inline errors only after touch/submission and clear corrected errors as the user types. Retain entered values on failure and use Formik submission state to disable duplicate requests. Keep native labels and autocomplete, but disable browser validation bubbles with `noValidate`.
- Preserve supplied copy where applicable, but never promise functionality that is not implemented. The current checkbox is **Remember my email**, not persistent sign-in.
- Access tokens remain in memory. Neither passwords nor access tokens belong in localStorage.
- Use only Phosphor icons, imported individually. Regular weight is the shared default; the workspace mark is intentionally filled.
- Avoid decorative entrance animation on authentication screens. Respect reduced motion and keep controls usable without animation.

## Structure and future work

Routes are programmatic in each app's `src/route-tree.tsx`; views live under `src/pages` with PascalCase page filenames. GraphQL operations live in `packages/data/apollo/<feature>/query.ts`. For Start asset-metadata compatibility and auth lifecycle limitations, see [frontend setup](../docs/frontend-setup.md).

The orchestrator now has a reference-inspired shadcn sidebar/inset shell and initial views; see frontend setup for its backend-aligned navigation and role restrictions. The main inset has a subtle neutral-gray border and no shadow. Detailed workspace tools, session restoration, Google callback handling, invitation acceptance, and learner product screens remain separate work.

## Verification expectations

Before shipping a new screen, run relevant typecheck/lint/tests/build checks and inspect both themes in a browser. Check at least desktop and 375-390px mobile widths, short/landscape layouts, keyboard focus, loading/error/success states, and reduced motion. Check saved theme behavior and prevent horizontal overflow.

The initial auth slice passed desktop/mobile browser checks with mocked GraphQL responses, including SSR/hydration, theme preference, sign-in error/retry, role rejection, sign-out, and password recovery/reset. This does not prove live login credentials, Google OAuth, or email delivery. Preserve that distinction in future handoffs.
