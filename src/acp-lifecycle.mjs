// Lesson 0003 source: prompt-lifecycle state machine (ACP v2).
// idle ->(prompt)-> running ->(updates)-> running
//   running -> requires_action ->(grant|deny)-> running ->(turn complete)-> idle
// Only prompt when idle. Mirrored by the Canvas demo in lesson 0003.
export const STATES = ['idle', 'running', 'requires_action'];

const TRANSITIONS = {
  idle: ['session/prompt'],
  running: ['session/update', 'state:requires_action', 'state:idle'],
  requires_action: ['permission:grant', 'permission:deny'],
};

export function nextAllowed(state) {
  return TRANSITIONS[state] ?? [];
}

export function transition(state, event) {
  if (!nextAllowed(state).includes(event)) {
    throw new Error(`Illegal ${event} in state ${state}`);
  }
  if (state === 'idle' && event === 'session/prompt') return 'running';
  if (state === 'running' && event === 'state:requires_action') return 'requires_action';
  if (state === 'running' && event === 'state:idle') return 'idle';
  if (state === 'requires_action') return 'running'; // grant or deny: agent continues
  return state; // session/update: still running
}

export function canPrompt(state) {
  return state === 'idle';
}
