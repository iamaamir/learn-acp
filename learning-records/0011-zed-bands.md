# 0011 — Zed bands: dividers + gutter lines

Learner pointed at zed.dev's section boxes and background lines. Applied
the two structural motifs (boxes already existed as panels/callouts/quiz):

- Full-bleed 1px hairline dividers between top-level sections
  (`main > section::after`, 100vw, #232A35) — the band rhythm.
- Faint fixed vertical gutter lines framing the 780px column
  (body::before, 5% white, viewport-edge fallback under 860px).
  Static, pointer-transparent, decorative only.

Both declarations verified present; suite 21/21 (CSS-only change).
