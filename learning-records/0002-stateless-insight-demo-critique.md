# 0002 — Stateless-wire insight + demo critique

Learner independently derived the stateless-protocol/stateful-endpoints model and
asked for better interactive demos.

## Evidence
- Asked: "the protocol itself is stateless and both agent and client have to
  have persistent state?" — correct mental model, unprompted. Session Tab framing stuck.

## Challenges
- SVG step-through demos underwhelm; "can be better" (unspecified how).

## Engagement Pattern
- Strong conceptual reasoning, weak demo engagement. Reads for the model,
  clicks through visuals without much play.

## Adjust
- Ask which demo pattern they want (sandbox REPL / canvas / real CLI / multi-modal),
  then rebuild 0003's demo in that pattern. Keep depth at 0002 level or higher.
- Answer stateless question precisely: wire carries correlation (sessionId),
  durability is each side's job.
