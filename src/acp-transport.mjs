// Lesson 0005 source: the road vs the town.
// A connection (transport) carries bytes; a session (agent memory) holds
// meaning. Drops kill the road, never the town — reconnect and resume.
// Mirrors ACP: stdio | HTTP transports, session/resume, session/cancel.
import { SessionStore } from './acp-session.mjs';

let connCounter = 0;

export class Link {
  constructor(agentStore = new SessionStore()) {
    this.agent = agentStore;
    this.conn = null;
    this.outbox = [];
  }

  connect(transport = 'stdio') {
    if (transport !== 'stdio' && transport !== 'http') {
      throw new Error(`Unknown transport ${transport}`);
    }
    connCounter += 1;
    this.conn = { id: `conn_${String(connCounter).padStart(3, '0')}`, transport, alive: true };
    return this.conn.id;
  }

  drop() {
    if (this.conn) this.conn.alive = false;
  }

  get alive() {
    return Boolean(this.conn?.alive);
  }

  send(sessionId, text) {
    if (!this.alive) {
      this.outbox.push({ sessionId, text });
      return 'queued';
    }
    this.agent.prompt(sessionId, text);
    return 'sent';
  }

  reconnect(sessionId) {
    // New road, same town: the session must still exist agent-side.
    if (!this.agent.has(sessionId)) {
      throw new Error(`Session ${sessionId} gone — session/new, not resume`);
    }
    const connectionId = this.connect(this.conn?.transport ?? 'stdio');
    const queued = this.outbox.splice(0);
    for (const m of queued) this.agent.prompt(m.sessionId, m.text);
    return { connectionId, resumed: sessionId, flushed: queued.length };
  }
}
