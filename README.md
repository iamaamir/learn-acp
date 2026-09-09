# Learn ACP — Interactive Agent Client Protocol Course

**Live site:** https://iamaamir.github.io/learn-acp/

One protocol. Any editor. Any agent. A mission-driven course on the
Agent Client Protocol: six lessons with live, interactive demos —
no server, no build step, no install. Every lesson opens straight
from the filesystem.

## Lessons

| # | Lesson | You learn |
| - | ------ | --------- |
| 0001 | [The Split](https://iamaamir.github.io/learn-acp/lessons/0001-client-agent-split.html) | Why ACP exists: Client vs Agent, the handshake |
| 0002 | [Sessions](https://iamaamir.github.io/learn-acp/lessons/0002-sessions-where-state-lives.html) | Where multi-turn state lives; crash recovery |
| 0003 | [The Stream](https://iamaamir.github.io/learn-acp/lessons/0003-prompt-lifecycle-stream.html) | Prompt lifecycle: running, requires_action, idle |
| 0004 | [The Guest List](https://iamaamir.github.io/learn-acp/lessons/0004-capabilities-auth.html) | Capabilities, auth, permissions |
| 0005 | [The Road](https://iamaamir.github.io/learn-acp/lessons/0005-transports.html) | Transports, drops, resume, cancel |
| 0006 | [Capstone](https://iamaamir.github.io/learn-acp/lessons/0006-capstone.html) | Build the resilient mini-client |

Plus a [glossary](https://iamaamir.github.io/learn-acp/reference/glossary.html)
of canonical terms, earned lesson by lesson.

## Run it locally

Requirements: any modern browser, and Node 20+ for the tests.

```bash
# Read a lesson — just open the file (double-click works too)
open lessons/0001-client-agent-split.html

# Run the full suite from the repo root — must stay green
node --test
```

Everything runs from `file://`. The demos need no server and no
dependencies; `src/*.mjs` modules are mirrored by the in-page exercises
and covered by `tests/*.test.mjs`.

## Repo layout

```
index.html            # course home (also the GitHub Pages landing page)
lessons/              # 0001–0006, one concept each, self-contained pages
assets/               # shared theme (lesson.css) + web components
src/ / tests/         # runnable protocol models + node:test suite
reference/            # glossary
MISSION.md            # why this course exists
learning-records/     # what stuck, what didn't, what changed + why
```

## Method

One lesson at a time, each with a framing device, a live demo, an
interview payoff, and a challenge into the next. After each session a
learning record captures what actually landed and steers what comes
next. Open questions live in the doubt clinic — see `NOTES.md`.
