# 0008 — Screenshot audit, section by section (0004 page)

Learner sent close-ups + full page and asked for a proper audit. Findings:

## Image 1 — demo section
- REAL BUG: native fieldset/legend unstyled — border struck through the
  legend text, zero padding. Fixed with dedicated #guest-form styles.
- Checkboxes cramped inline, tiny native boxes, awkward wrap. Fixed: flex
  rows, 1.15em boxes, accent-color, hover, focus ring.
- Canvas, buttons, log/verdict panels: good, untouched.

## Image 2 — exercise section
- REAL BUG: inline code pills broke mid-token (`ask` / `}` / `counts`)
  from word-break. Fixed: nowrap on inline code (block code unaffected).
- Code block panel itself: good. List numerals: fine.

## Image 3 — full page
- Verdict rows read as chips. Tightened: slimmer padding, subtler
  divider (#232A35), zero radius in tables.
- Footer emoji clashed with flat style → plain "Course Home" text.
- Headers, rhythm, callouts, quiz cards, sources: already match Zed.

Suite 19/19. Lesson for me: screenshots beat guessing — ask for them
whenever polishing visuals.
