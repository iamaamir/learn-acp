import test from 'node:test';
import assert from 'node:assert/strict';
import { Link } from '../src/acp-transport.mjs';
import { SessionStore } from '../src/acp-session.mjs';

test('sends flow while the road is up', () => {
  const link = new Link(new SessionStore());
  const id = link.connect('stdio');
  assert.match(id, /^conn_/);
  const sess = link.agent.open('/proj');
  assert.equal(link.send(sess, 'fix login'), 'sent');
  assert.equal(link.agent.history(sess).length, 2);
});

test('drop queues sends; reconnect flushes in order on the same session', () => {
  const link = new Link(new SessionStore());
  link.connect('http');
  const sess = link.agent.open('/proj');
  link.send(sess, 'one');
  link.drop();
  assert.equal(link.alive, false);
  assert.equal(link.send(sess, 'two'), 'queued');
  assert.equal(link.send(sess, 'three'), 'queued');
  const r = link.reconnect(sess);
  assert.equal(r.resumed, sess);
  assert.equal(r.flushed, 2);
  assert.equal(link.alive, true);
  const texts = link.agent.history(sess).map((h) => h.text);
  assert.deepEqual(texts.filter((t) => !t.startsWith('ack')), ['one', 'two', 'three']);
});

test('resume of a gone session fails fast — then it is time for session/new', () => {
  const link = new Link(new SessionStore());
  link.connect('stdio');
  assert.throws(() => link.reconnect('sess_999'), /session\/new/);
});

test('unknown transports rejected at connect', () => {
  const link = new Link();
  assert.throws(() => link.connect('pigeon'), /Unknown transport/);
});
