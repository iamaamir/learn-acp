# 0012 — Latest/greatest pass (adopted + deliberately skipped)

Learner asked for all modern CSS/JS/HTML features. Adopted only what pays:

- `color-scheme: dark` — native dark scrollbars, checkboxes, radios.
- `text-wrap: balance` (headings) + `pretty` (prose).
- `color-mix()` for hover tints (replaces magic-gray rgba).
- `@view-transition { navigation: auto }` under no-preference —
  cross-page transitions on file://, ignored by older browsers.
- Clipboard copy buttons on every code block (progressive enhancement:
  Clipboard API → execCommand fallback → silent absence). Covered by a
  real harness test (button per block, clipboard text, label revert).

Skipped with reasons: container queries (single column, no value),
cascade layers (reorders cascade — risk without payoff here),
`structuredClone`/`.at()` (contrived at call sites), popover/dialog
(no use case), anchor positioning (too new, no need).

Suite 22/22.
