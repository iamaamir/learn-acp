import test from 'node:test';
import assert from 'node:assert/strict';
import { advertiseMenu, updateMenu, parseCommand, resolveCommand } from '../src/acp-commands.mjs';

const MENU = advertiseMenu([
  { name: 'test', description: 'Run tests' },
  { name: 'plan', description: 'Plan it', input: { type: 'text', hint: 'what to plan' } },
]);

test('advertise builds the menu; updates replace same-named specials', () => {
  assert.equal(MENU.size, 2);
  updateMenu(MENU, [{ name: 'test', description: 'Run tests, now with coverage' }]);
  assert.equal(MENU.get('test').description, 'Run tests, now with coverage');
  assert.equal(MENU.size, 2);
});

test('parse splits /name and args, rejects plain text', () => {
  assert.deepEqual(parseCommand('/plan ship it'), { name: 'plan', arg: 'ship it' });
  assert.deepEqual(parseCommand('/test'), { name: 'test', arg: '' });
  assert.equal(parseCommand('just talking'), null);
});

test('resolve allows listed, demands input, rejects unlisted', () => {
  assert.equal(resolveCommand(MENU, '/test').ok, true);
  assert.equal(resolveCommand(MENU, '/test').text, '/test');
  const need = resolveCommand(MENU, '/plan');
  assert.equal(need.ok, false);
  assert.equal(need.reason, 'missing-input');
  assert.equal(need.hint, 'what to plan');
  assert.equal(resolveCommand(MENU, '/plan ship it').text, '/plan ship it');
  const no = resolveCommand(MENU, '/dance');
  assert.equal(no.ok, false);
  assert.equal(no.reason, 'unlisted');
});
