# 0010 — Flat white code is unreadable; highlight it

Learner on the fixed (multiline) snippet: "better but still not readable."
Screenshot showed the cause: zero syntax coloring — keywords, strings,
comments all identical bright white, unlike any editor a Zed user knows.

- Hand-highlighted all 5 exercise/wire blocks (spans, zero JS to keep
  file:// bulletproof): violet keywords, green strings, blue JSON keys,
  orange numbers, dim italic comments. All ≥6.24:1 on the inset bg.
- Tightened code type: letter-spacing to 0, line-height 1.7.
- New committed test: every pre block highlighted + spans balanced.
- Also fixed my own repeated edit-tool blunder (insert swallowing a test
  header) — caught both times by the suite before reaching the learner.
  Suite 21/21.
