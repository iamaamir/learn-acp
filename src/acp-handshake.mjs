// Lesson 0001 source: minimal ACP handshake logic.
// Mirrored inline in the lesson HTML for file:// use; tested here with node:test.
export function negotiateVersion(clientVersion, agentSupported) {
  if (!Number.isInteger(clientVersion)) return null;
  if (!Array.isArray(agentSupported)) return null;
  // Agent picks highest version it supports that is <= client version.
  const candidates = agentSupported.filter((v) => Number.isInteger(v) && v <= clientVersion);
  if (candidates.length === 0) return null;
  return Math.max(...candidates);
}

export function isValidInitialize(params) {
  if (!params || typeof params !== 'object') return false;
  if (!Number.isInteger(params.protocolVersion)) return false;
  if (!params.capabilities || typeof params.capabilities !== 'object') return false;
  if (!params.info || typeof params.info.name !== 'string') return false;
  return true;
}

// Tiny state machine for lesson 1: who can speak when.
const TRANSITIONS = {
  disconnected: ['initialize'],
  initialized: ['session/new'],
  'session-open': ['session/prompt'],
  prompting: ['session/update', 'session/prompt'],
};

export function nextAllowed(state) {
  return TRANSITIONS[state] ?? [];
}

export function transition(state, method) {
  if (!nextAllowed(state).includes(method)) {
    throw new Error(`Illegal ${method} in state ${state}`);
  }
  if (state === 'disconnected' && method === 'initialize') return 'initialized';
  if (state === 'initialized' && method === 'session/new') return 'session-open';
  if (state === 'session-open' && method === 'session/prompt') return 'prompting';
  return state; // session/update stays in prompting
}
