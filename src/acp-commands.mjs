// Lesson 0007 source: the specials board.
// The Agent advertises slash commands mid-session
// (available_commands_update); the Client offers only those, then fires
// the chosen one as plain "/name args" text inside session/prompt.
export function advertiseMenu(list) {
  const menu = new Map();
  for (const c of list ?? []) {
    if (typeof c?.name === 'string') menu.set(c.name, { ...c });
  }
  return menu;
}

export function updateMenu(menu, list) {
  // Later advertisements replace same-named entries (nightly specials).
  for (const c of list ?? []) {
    if (typeof c?.name === 'string') menu.set(c.name, { ...c });
  }
  return menu;
}

export function parseCommand(text) {
  const m = /^\s*\/([\w-]+)(?:\s+(.*))?$/.exec(text ?? '');
  if (!m) return null;
  return { name: m[1], arg: (m[2] ?? '').trim() };
}

export function resolveCommand(menu, text) {
  const parsed = parseCommand(text);
  if (!parsed) return { ok: false, reason: 'not-a-command' };
  const cmd = menu.get(parsed.name);
  if (!cmd) return { ok: false, reason: 'unlisted', name: parsed.name };
  if (cmd.input && !parsed.arg) {
    return { ok: false, reason: 'missing-input', name: parsed.name, hint: cmd.input.hint };
  }
  const fired = `/${parsed.name}${parsed.arg ? ` ${parsed.arg}` : ''}`;
  return { ok: true, command: cmd, text: fired };
}
