# 0004 — Spacing and code sections not up to the mark

Learner, after the theme reskin landed: "overall spacing on the page and code
etc sections are not upto the mark."

## Evidence
- Direct quote; follows two visual-feedback rounds (animation, then theme).
  Pattern: this learner reads with their eyes first — packaging gates learning.

## Challenges
- Concrete defects found on inspection: list markers flush (reset wiped
  padding), sections ran together, code blocks washed out (page-bg fill),
  panel headings over-margined, quiz options unstyled, no button-row layout.

## Engagement Pattern
- Continued high standards for feel. Content/density complaints: zero.

## Adjust
- Fixed in shared CSS (all lessons at once): section rhythm + h2 rules,
  list padding/markers, dark terminal code blocks (16.74:1), inline-code pills,
  card-style knowledge checks, table striping, btn-row flex, log auto-scroll.
- No headless browser here, so no screenshots — asked learner to confirm
  visually. If more polish asks come, consider a screenshot loop via a
  temporary local tool, not guesses.
