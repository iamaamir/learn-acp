import test from 'node:test';
import assert from 'node:assert/strict';
import { negotiateVersion, isValidInitialize, nextAllowed, transition } from '../src/acp-handshake.mjs';

test('negotiates highest shared version', () => {
  assert.equal(negotiateVersion(2, [1, 2]), 2);
  assert.equal(negotiateVersion(2, [1]), 1);
  assert.equal(negotiateVersion(1, [2]), null);
});

test('validates initialize params', () => {
  assert.equal(isValidInitialize({ protocolVersion: 2, capabilities: {}, info: { name: 'x' } }), true);
  assert.equal(isValidInitialize({ protocolVersion: '2', capabilities: {}, info: { name: 'x' } }), false);
  assert.equal(isValidInitialize(null), false);
});

test('enforces Client→Agent order', () => {
  assert.deepEqual(nextAllowed('disconnected'), ['initialize']);
  assert.equal(transition('disconnected', 'initialize'), 'initialized');
  assert.equal(transition('initialized', 'session/new'), 'session-open');
  assert.throws(() => transition('disconnected', 'session/prompt'), /Illegal/);
});
