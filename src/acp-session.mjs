// Lesson 0002 source: minimal ACP session store.
// Mirrors the real shapes: session/new {cwd, mcpServers} -> {sessionId},
// session/prompt appends history, Agent owns history, Client owns sessionId.
let counter = 0;

export class SessionStore {
  constructor() {
    this.sessions = new Map(); // sessionId -> { cwd, history: [] }
  }

  open(cwd, mcpServers = []) {
    if (typeof cwd !== 'string' || cwd.length === 0) throw new Error('cwd required');
    counter += 1;
    const sessionId = `sess_${String(counter).padStart(3, '0')}`;
    this.sessions.set(sessionId, { cwd, mcpServers, history: [] });
    return sessionId;
  }

  prompt(sessionId, text) {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error(`Unknown session ${sessionId}`);
    // Client turn…
    s.history.push({ role: 'user', text });
    // …Agent acknowledges immediately (v2) then streams updates; we record the turn.
    s.history.push({ role: 'agent-update', text: `ack + streaming for: ${text}` });
    return s.history.length;
  }

  history(sessionId) {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error(`Unknown session ${sessionId}`);
    return s.history.map((h) => ({ ...h }));
  }

  // Client crash simulation: Client drops its sessionId handle.
  // Agent-side history survives here, but WITHOUT the id the Client cannot resume.
  has(sessionId) {
    return this.sessions.has(sessionId);
  }
}
