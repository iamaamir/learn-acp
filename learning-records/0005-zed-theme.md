# 0005 — Page must match the canvas vibe; go Zed

Learner: happy with canvas demos, but "overall page theme and sections are
not really going well... rest is not matching the vibe. Lets get inspired
by the zed itself and refresh the theme."

## Evidence
- Third visual-feedback round; consistent thread: packaging gates learning
  for this learner. Canvas (dark, neon, alive) vs page (cream paper) clashed.

## What changed
- Sampled zed.dev directly: dark `hsl(218,13%,7.5%)` bg, off-white text,
  vivid brand-blue primary `hsl(228,100%,60-70%)`, IBM Plex Serif display +
  Sans body + Lilex mono, 0.75rem card radii, soft shadows.
- Reskinned to single dark "Zed at midnight" theme: serif display headings,
  blue→violet→cyan gradient strip, ghost-pill buttons with decisive blue
  hover, surface/inset panel depth, warm radial hero glow. Dropped the light
  variant entirely — one vibe, like sitting in the editor.
- All text pairs re-verified numerically (min 5.41:1, up from 4.84).

## Adjust
- Cohesion over choice: keep one theme until asked otherwise.
- If a light mode is ever requested, build it from Zed's cream tokens
  (`bg-cream`, offgray text) — sampled already, noted here.
