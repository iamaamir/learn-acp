import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advertises,
  canSendPrompt,
  canUseMcp,
  gate,
  requiresAuth,
} from '../src/acp-capabilities.mjs';

const CAPS = { session: { prompt: { image: {}, audio: undefined }, mcp: { stdio: {}, http: undefined } } };

test('text is always allowed; unadvertised types are missing', () => {
  assert.deepEqual(canSendPrompt(CAPS, ['text']), { ok: true, missing: [] });
  assert.deepEqual(canSendPrompt(CAPS, ['text', 'image']), { ok: true, missing: [] });
  assert.deepEqual(canSendPrompt(CAPS, ['audio']), { ok: false, missing: ['audio'] });
});

test('mcp needs both advertisement and a connected session server', () => {
  const servers = [{ type: 'stdio', name: 'ws' }];
  assert.equal(canUseMcp(CAPS, servers, 'stdio'), true);
  assert.equal(canUseMcp(CAPS, servers, 'http'), false); // not advertised…
  const both = [...servers, { type: 'http', name: 'web' }];
  assert.equal(canUseMcp(CAPS, both, 'http'), false); // …still false
});

test('edits always ask; auth presence is explicit', () => {
  assert.equal(gate({ kind: 'edit' }), 'ask');
  assert.equal(gate({ kind: 'read' }), 'allow');
  assert.equal(requiresAuth([]), false);
  assert.equal(requiresAuth([{ methodId: 'agent-login' }]), true);
});

test('advertises reads the nested session caps', () => {
  assert.equal(advertises(CAPS, 'prompt:image'), true);
  assert.equal(advertises(CAPS, 'prompt:audio'), false);
  assert.equal(advertises({}, 'mcp:stdio'), false);
});
