# Mission: Agent Client Protocol

## Why
Ship an ACP-compatible integration — connect an editor/client to a coding agent (or vice versa) — and be able to explain the design tradeoffs in an interview.

## Success looks like
- Explain Client vs Agent split and why ACP exists (LSP analogy) without notes
- Trace `initialize` → `session/new` → `session/prompt` → streaming updates in a live demo
- Build a minimal JSON-RPC client that opens a session and streams agent updates
- Answer: how ACP differs from LSP/MCP, how auth/capabilities/permissions work

## Constraints
- Intermediate dev; comfortable with TypeScript/JSON-RPC, new to agents/protocols
- Zero-infra lessons: open `file://`, no npm install required; optional `node --test` for source modules
- One concept per lesson, incremental

## Out of scope
- Building a full production agent (model routing, evals)
- Deep MCP spec; only ACP↔MCP boundary
- Editor-specific plugin APIs (Zed/VS Code internals)
