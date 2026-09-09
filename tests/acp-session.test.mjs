import test from 'node:test';
import assert from 'node:assert/strict';
import { SessionStore } from '../src/acp-session.mjs';

test('session/new returns id and isolates history', () => {
  const store = new SessionStore();
  const a = store.open('/proj');
  const b = store.open('/proj');
  assert.notEqual(a, b);
  store.prompt(a, 'fix login');
  assert.equal(store.history(a).length, 2);
  assert.equal(store.history(b).length, 0);
});

test('prompt on unknown session throws (lost sessionId = new session needed)', () => {
  const store = new SessionStore();
  assert.throws(() => store.prompt('sess_999', 'hi'), /Unknown session/);
});

test('history accumulates across turns (the tab keeps the rounds)', () => {
  const store = new SessionStore();
  const id = store.open('/proj');
  store.prompt(id, 'fix login');
  store.prompt(id, 'now add tests');
  const h = store.history(id);
  assert.equal(h[0].text, 'fix login');
  assert.equal(h[2].text, 'now add tests');
});
