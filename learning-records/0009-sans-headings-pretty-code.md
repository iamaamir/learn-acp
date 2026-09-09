# 0009 — Headings back to sans; code pretty-printed

Learner: heading serif fallback renders poorly; code must not be long
single lines — pretty-print for readability.

- Headings → system sans (dropped the Plex-Serif-via-Georgia experiment).
  Zed-editor-UI-like rather than zed.dev-marketing-like.
- Code: `pre` now soft-wraps (`pre-wrap`) so nothing ever scrolls
  horizontally, and every snippet reformatted so the longest line is 72
  chars (expanded JSON, multiline imports/try-catch, aligned `//`
  comments, single quotes everywhere). Verified by scan, suite 19/19.
