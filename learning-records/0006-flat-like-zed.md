# 0006 — Flat like Zed, no gradients or bubbles

Learner on the Zed reskin: "good for started but zed's website seems to be
using flat style and we are using gradients and curves."

## Evidence
- Correct observation: I had added gradient strip/buttons/glows, pill
  buttons (99px), card shadows, gradient code bg — none of that is Zed.

## What changed (lesson.css only, all lessons inherit)
- Radius token 12px → 6px; buttons square-ish with instant flat hover
  (no lift, no glow); header strip is a solid 4px brand-blue bar;
  body radial glow removed; panel/card/code shadows removed;
  code block flat inset bg; arcade frame flat blue border (canvas art
  itself untouched — the demos are the liked reference);
  dead gradient token deleted. No color changes → contrast still holds.

## Adjust
- House rule, recorded: page chrome stays flat solids; motion and glow
  live *inside* canvas demos only.
