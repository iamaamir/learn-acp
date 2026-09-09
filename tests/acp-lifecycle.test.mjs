import test from 'node:test';
import assert from 'node:assert/strict';
import { transition, nextAllowed, canPrompt } from '../src/acp-lifecycle.mjs';

test('prompt moves idle -> running, updates keep it running', () => {
  assert.equal(transition('idle', 'session/prompt'), 'running');
  assert.equal(transition('running', 'session/update'), 'running');
});

test('requires_action blocks prompts until resolved', () => {
  assert.equal(transition('running', 'state:requires_action'), 'requires_action');
  assert.equal(canPrompt('requires_action'), false);
  assert.throws(() => transition('requires_action', 'session/prompt'), /Illegal/);
  assert.equal(transition('requires_action', 'permission:grant'), 'running');
  assert.equal(transition('requires_action', 'permission:deny'), 'running');
});

test('turn completes running -> idle with stop reason; only idle accepts prompts', () => {
  assert.equal(transition('running', 'state:idle'), 'idle');
  assert.equal(canPrompt('idle'), true);
  assert.equal(canPrompt('running'), false);
  assert.throws(() => transition('running', 'session/prompt'), /Illegal/);
  assert.deepEqual(nextAllowed('idle'), ['session/prompt']);
});
