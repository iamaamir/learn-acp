import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const COMPONENTS = fs.readFileSync(path.join(ROOT, 'assets/lesson-components.js'), 'utf8');

function inlineScripts(html) {
  const out = [];
  for (const m of html.matchAll(/<script defer>([\s\S]*?)<\/script>/g)) out.push(m[1]);
  return out;
}

// ── Minimal stub DOM ────────────────────────────────────
class El {
  constructor(tag, attrs = {}) {
    this.tag = tag;
    this.tagName = tag.toUpperCase();
    this.attrs = { ...attrs };
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.textContent = '';
    this.disabled = false;
    this.value = '';
    this.checked = 'checked' in attrs;
    this._cls = new Set();
    this.classList = {
      add: (c) => this._cls.add(c),
      remove: (c) => this._cls.delete(c),
      contains: (c) => this._cls.has(c),
    };
    if (tag === 'canvas') {
      const w = Number(attrs.width ?? 300);
      const h = Number(attrs.height ?? 150);
      this.width = w;
      this.height = h;
    }
  }
  addEventListener(t, f) {
    (this.listeners[t] ??= []).push(f);
  }
  get parentElement() {
    return this.parentNode;
  }
  select() {}
  remove() {
    const p = this.parentNode;
    if (p) p.children = p.children.filter((c) => c !== this);
  }
  appendChild(c) {
    this.children.push(c);
    c.parentNode = this;
    return c;
  }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
  }
  getAttribute(k) {
    return this.attrs[k] ?? null;
  }
  getContext() {
    return new Proxy(
      {},
      {
        get: (t, p) => (p in t ? t[p] : (...a) => undefined),
        set: (t, p, v) => {
          t[p] = v;
          return true;
        },
      },
    );
  }
}

function buildDocument(html) {
  const byId = new Map();
  for (const m of html.matchAll(/<(\w+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
    const id = m[2].match(/\sid="([\w-]+)"/)?.[1];
    if (!id || byId.has(id)) continue;
    const attrs = {};
    for (const a of m[2].matchAll(/(\w[\w-]*)="([^"]*)"/g)) attrs[a[1]] = a[2];
    for (const b of m[2].matchAll(/\s(checked|disabled|selected)(?=\s|$)/g)) attrs[b[1]] = '';
    byId.set(id, new El(m[1], attrs));
  }
  const cells = [...html.matchAll(/<td data-s="(\d+)">/g)].map((m) => {
    const td = new El('td', { 'data-s': m[1] });
    td.textContent = '— pending';
    return td;
  });
  const codes = [...html.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map((m) => {
    const pre = new El('pre');
    const code = new El('code');
    code.textContent = m[1].replace(/<[^>]*>/g, '');
    pre.appendChild(code);
    return code;
  });
  const body = new El('body');
  return {
    byId,
    cells,
    codes,
    body,
    getElementById: (id) => {
      if (!byId.has(id)) throw new Error(`missing #${id}`);
      return byId.get(id);
    },
    querySelectorAll: (sel) => {
      if (sel.includes('td[data-s]')) return cells;
      if (sel === 'pre code') return codes;
      return [];
    },
    querySelector: () => null,
    createElement: (tag) => new El(tag),
  };
}

// ── Virtual clock: deterministic, instant ───────────────
function makeClock() {
  let now = 0;
  let seq = 0;
  const tasks = [];
  const errors = [];
  const setTimeout = (fn, ms = 0) => {
    tasks.push({ t: now + ms, seq: seq++, fn });
    return seq;
  };
  const api = {
    now: () => now,
    setTimeout,
    clearTimeout: () => {},
    requestAnimationFrame: (cb) => setTimeout(() => cb(now), 16),
    errors,
    async pump(budgetMs) {
      const end = now + budgetMs;
      let guard = 100000;
      while (tasks.length && now <= end && guard-- > 0) {
        tasks.sort((a, b) => a.t - b.t || a.seq - b.seq);
        const task = tasks.shift();
        now = Math.max(now, task.t);
        try {
          task.fn();
        } catch (e) {
          errors.push(e);
        }
        await new Promise((r) => setImmediate(r));
      }
    },
  };
  return api;
}

async function loadLesson(file, opts = {}) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const document = buildDocument(html);
  const clock = makeClock();
  const errors = [...clock.errors];
  const copied = [];
  const context = {
    document,
    customElements: { get: () => undefined, define() {} },
    HTMLElement: class {},
    navigator: {
      clipboard: {
        writeText: async (t) => {
          copied.push(t);
        },
      },
    },
    matchMedia: () => ({ matches: false }),
    getComputedStyle: () => ({ color: '#000' }),
    performance: { now: clock.now },
    requestAnimationFrame: clock.requestAnimationFrame,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    console,
  };
  context.globalThis = context;
  context.window = context; // browsers: window IS the global (DemoKit etc.)
  vm.createContext(context);
  const run = (src) => {
    try {
      vm.runInContext(src, context, { filename: file });
    } catch (e) {
      errors.push(e);
    }
  };
  for (const src of inlineScripts(html)) run(src);
  if (opts.components) run(COMPONENTS);
  await clock.pump(500); // settle top-level (incl. first frames)
  const click = async (id, pumpMs = 1500) => {
    const el = document.getElementById(id);
    if (el.disabled) return; // faithful: real buttons ignore clicks while disabled
    for (const fn of el.listeners.click ?? []) {
      try {
        const r = fn({ preventDefault() {} });
        if (r?.catch) r.catch((e) => errors.push(e));
      } catch (e) {
        errors.push(e);
      }
    }
    await clock.pump(pumpMs);
  };
  const failIfErrors = (phase) => {
    assert.deepEqual(
      errors.map((e) => String(e?.stack ?? e)),
      [],
      `${file} threw during ${phase}`,
    );
  };
  return { document, click, failIfErrors, clock, copied };
}

const logText = (document, id) =>
  document
    .getElementById(id)
    .children.map((c) => c.textContent)
    .join('\n');

test('0001: top-level runs, steps advance, run + reset work', async () => {
  const { document, click, failIfErrors } = await loadLesson('lessons/0001-client-agent-split.html');
  failIfErrors('load');
  for (let i = 0; i < 6; i++) await click('btn-step', 100);
  failIfErrors('step-through');
  assert.match(logText(document, 'wire-log'), /initialize/);
  await click('btn-run', 8000);
  failIfErrors('run-all');
  await click('btn-reset', 100);
  failIfErrors('reset');
});

test('0002: top-level runs, steps advance, run + reset work', async () => {
  const { document, click, failIfErrors } = await loadLesson('lessons/0002-sessions-where-state-lives.html');
  failIfErrors('load');
  for (let i = 0; i < 7; i++) await click('btn-step', 100);
  failIfErrors('step-through');
  assert.match(logText(document, 'wire-log'), /session\/new/);
  await click('btn-run', 12000);
  failIfErrors('run-all');
  await click('btn-reset', 100);
  failIfErrors('reset');
});

test('0003: full playthrough incl. approve gate reaches idle', async () => {
  const { document, click, failIfErrors } = await loadLesson('lessons/0003-prompt-lifecycle-stream.html');
  failIfErrors('load');
  await click('btn-run', 6000); // advances to the amber gate, then waits
  failIfErrors('run-to-gate');
  assert.match(logText(document, 'wire-log'), /requires_action/);
  await click('btn-approve', 15000); // grant → burst 2 → idle
  failIfErrors('approve-to-idle');
  assert.match(logText(document, 'wire-log'), /stop: complete/);
  assert.ok(
    document.cells.some((c) => c.textContent.includes('idle')),
    'state table reaches idle',
  );
  assert.equal(document.getElementById('btn-step').disabled, true, 'step dead at end');
  assert.equal(document.getElementById('btn-run').disabled, true, 'run dead at end');
  assert.equal(
    document.getElementById('btn-reset').classList.contains('is-done'),
    true,
    'reset lit up at end',
  );
  await click('btn-step', 200); // end-guard, must not throw
  failIfErrors('end-guard');
  await click('btn-reset', 200);
  failIfErrors('reset');
  assert.match(document.getElementById('wire-log').textContent, /^Ready\./);
  assert.equal(document.getElementById('btn-step').disabled, false, 'step back after reset');
  assert.equal(
    document.getElementById('btn-reset').classList.contains('is-done'),
    false,
    'reset dimmed after reset',
  );
});

test('0004: default list denies audio, asks the edit, tallies', async () => {
  const { document, click, failIfErrors } = await loadLesson('lessons/0004-capabilities-auth.html');
  failIfErrors('load');
  // defaults: image on, audio off, http on
  assert.equal(document.getElementById('t-image').checked, true);
  assert.equal(document.getElementById('t-audio').checked, false);
  await click('btn-run', 6000); // reaches the edit gate, then waits
  failIfErrors('run-to-gate');
  assert.match(logText(document, 'wire-log'), /DENY audio/);
  assert.match(logText(document, 'wire-log'), /ALLOW image/);
  await click('btn-deny', 15000);
  failIfErrors('deny-to-tally');
  assert.match(logText(document, 'wire-log'), /Door tally: 3 allowed · 1 denied · 1 asked/);
});

test('0004: unlisting image denies it; listing audio allows it', async () => {
  const { document, click, failIfErrors } = await loadLesson('lessons/0004-capabilities-auth.html');
  failIfErrors('load');
  const fireChange = async (id, value) => {
    const el = document.getElementById(id);
    el.checked = value;
    for (const fn of el.listeners.change ?? []) fn({});
  };
  await fireChange('t-image', false);
  await fireChange('t-audio', true);
  failIfErrors('retoggle');
  await click('btn-run', 8000);
  failIfErrors('run-to-gate');
  assert.match(logText(document, 'wire-log'), /DENY image/);
  assert.match(logText(document, 'wire-log'), /ALLOW audio/);
  await click('btn-approve', 15000);
  failIfErrors('approve-to-tally');
  assert.match(logText(document, 'wire-log'), /Door tally: 3 allowed · 1 denied · 1 asked/);
});

test('homepage lesson links resolve to real files', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const hrefs = [...html.matchAll(/href="([^"#]+)"/g)]
    .map((m) => m[1])
    .filter((h) => !h.startsWith('http') && h.endsWith('.html'));
  assert.ok(hrefs.length >= 4, 'homepage links its lessons');
  for (const h of hrefs) assert.ok(fs.existsSync(path.join(ROOT, h)), `${h} exists`);
  assert.match(html, /class="course-grid"/, 'card grid present');
});

test('copy buttons capture the code text', async () => {
  const { document, failIfErrors, clock, copied } = await loadLesson(
    'lessons/0004-capabilities-auth.html',
    { components: true },
  );
  failIfErrors('load with components');
  const pres = document.codes.map((c) => c.parentElement).filter(Boolean);
  assert.ok(pres.length > 0, 'code fixtures built');
  const btns = pres.flatMap((pre) => pre.children.filter((c) => c.tag === 'button'));
  assert.equal(btns.length, pres.length, 'one copy button per block');
  assert.equal(btns[0].textContent, 'Copy');
  for (const fn of btns[0].listeners.click ?? []) await fn({});
  await clock.pump(2500);
  failIfErrors('copy click');
  assert.equal(btns[0].textContent, 'Copy', 'label reverts after timeout');
  assert.ok(copied.length > 0 && copied[0].includes('canSendPrompt'), 'clipboard got the code');
});

test('all exercise code blocks are highlighted with balanced spans', () => {
  for (const f of ['0001-client-agent-split', '0002-sessions-where-state-lives', '0003-prompt-lifecycle-stream', '0004-capabilities-auth']) {
    const html = fs.readFileSync(path.join(ROOT, `lessons/${f}.html`), 'utf8');
    const blocks = [...html.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)];
    assert.ok(blocks.length > 0, `${f} has code blocks`);
    for (const b of blocks) {
      assert.match(b[1], /tok-(kw|str|num|key|com)/, `${f}: block is highlighted`);
      assert.equal(
        (b[1].match(/<span/g) || []).length,
        (b[1].match(/<\/span>/g) || []).length,
        `${f}: spans balanced`,
      );
    }
  }
});

test('lesson.css: block code keeps newlines (inline pills may not break)', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets/lesson.css'), 'utf8');
  // `pre` block itself preserves wrapping (flat or nested — decl precedes any nested rule)
  assert.match(css, /pre\s*\{[^}]*white-space:\s*pre-wrap/, 'pre must preserve newlines');
  // the `pre code` reset (flat `pre code {` or nested `code {` inside `pre {`) also preserves them
  assert.match(
    css,
    /code \{\s*background:\s*transparent[\s\S]*?white-space:\s*pre-wrap/,
    'pre code must preserve newlines',
  );
  const baseCode = css.match(/(^|\n)code \{([^}]*)\}/)?.[2] ?? '';
  assert.doesNotMatch(baseCode, /white-space:\s*nowrap/, 'bare code rule must not collapse whitespace');
});

test('0005: drop freezes, reconnect resumes the same session', async () => {
  const { document, click, failIfErrors } = await loadLesson('lessons/0005-transports.html');
  failIfErrors('load');
  await click('btn-run', 6000); // streams, then the road washes out
  failIfErrors('run-to-drop');
  assert.match(logText(document, 'wire-log'), /DROPPED|washed out|DROP/);
  await click('btn-reconnect', 15000);
  failIfErrors('reconnect-to-idle');
  assert.match(logText(document, 'wire-log'), /drop survived/);
  assert.equal(document.getElementById('btn-step').disabled, true, 'step dead at end');
  assert.equal(
    document.getElementById('btn-reset').classList.contains('is-done'),
    true,
    'reset lit up at end',
  );
  await click('btn-reset', 200);
  failIfErrors('reset');
  assert.equal(document.getElementById('btn-step').disabled, false, 'step back after reset');
});

test('0005: http road names POST /acp', async () => {
  const { document, click, failIfErrors } = await loadLesson('lessons/0005-transports.html');
  failIfErrors('load');
  document.getElementById('r-http').checked = true;
  document.getElementById('r-stdio').checked = false;
  for (const fn of document.getElementById('r-http').listeners.change ?? []) fn({});
  failIfErrors('switch road');
  await click('btn-step', 3000); // phase 0: connect + resume + prompt
  failIfErrors('connect over http');
  assert.match(logText(document, 'wire-log'), /POST \/acp/);
});

test('0003: deny path also completes the turn', async () => {
  const { document, click, failIfErrors } = await loadLesson('lessons/0003-prompt-lifecycle-stream.html');
  failIfErrors('load');
  await click('btn-step', 1500); // phase 0
  await click('btn-step', 7000); // phase 1
  await click('btn-step', 500); // phase 2 arms the gate
  failIfErrors('to-gate');
  await click('btn-deny', 12000);
  failIfErrors('deny-to-end');
  await click('btn-step', 6000);
  await click('btn-step', 6000);
  failIfErrors('finish');
  assert.match(logText(document, 'wire-log'), /stop: complete/);
});

test('0006: sandbox flies the full pattern', async () => {  const { document, failIfErrors, clock } = await loadLesson('lessons/0006-capstone.html');
  failIfErrors('load');
  const submit = async (text) => {
    document.getElementById('cap-cmd').value = text;
    for (const fn of document.getElementById('cap-form').listeners.submit ?? []) {
      await fn({ preventDefault() {} });
    }
    await clock.pump(100);
  };
  const log = () => logText(document, 'cap-log');
  await submit('open /proj');
  await submit('prompt fix login');
  await submit('prompt edit auth.ts');
  await submit('prompt another');
  assert.match(log(), /requires_action/);
  assert.match(log(), /Holding on amber/);
  await submit('approve');
  await submit('drop');
  await submit('prompt yo');
  assert.match(log(), /queued/);
  await submit('reconnect');
  failIfErrors('pattern');
  assert.match(log(), /resumed/);
  assert.match(log(), /flushed 1/);
  await submit('history');
  assert.match(log(), /fix login/);
  await submit('bogus');
  assert.match(log(), /Unknown/);
  assert.match(document.getElementById('cap-state').textContent, /sess_001/);
});

test('every toggle form uses the shared choice-form styling', () => {
  for (const f of ['0004-capabilities-auth', '0005-transports']) {
    const html = fs.readFileSync(path.join(ROOT, `lessons/${f}.html`), 'utf8');
    for (const m of html.matchAll(/<form([^>]*)>([\s\S]*?)<\/form>/g)) {
      if (!/id="/.test(m[1])) continue; // quiz forms are styled by knowledge-check CSS
      if (/type="(checkbox|radio)"/.test(m[2])) {
        assert.match(m[1], /choice-form/, `${f}: toggle form carries choice-form`);
      }
    }
  }
});

test('0007: guided turn posts menu, fires /test, denies off-menu', async () => {
  const { document, click, failIfErrors } = await loadLesson('lessons/0007-slash-commands.html');
  failIfErrors('load');
  await click('btn-run', 12000);
  failIfErrors('guided run');
  const log = () => logText(document, 'wire-log');
  assert.match(log(), /available_commands_update/);
  assert.match(log(), /stop: complete/);
  assert.match(log(), /DENY \/dance/);
  assert.equal(document.getElementById('btn-step').disabled, true, 'step dead at end');
  assert.equal(
    document.getElementById('btn-reset').classList.contains('is-done'),
    true,
    'reset lit up at end',
  );
  await click('btn-reset', 200);
  failIfErrors('reset');
});

test('0007: free-play validates orders like a bouncer', async () => {
  const { document, click, failIfErrors, clock } = await loadLesson('lessons/0007-slash-commands.html');
  failIfErrors('load');
  const order = async (text, pumpMs = 3000) => {
    document.getElementById('cmd-input').value = text;
    for (const fn of document.getElementById('order-form').listeners.submit ?? []) {
      await fn({ preventDefault() {} });
    }
    await clock.pump(pumpMs);
  };
  await order('no menu yet', 500);
  assert.match(logText(document, 'wire-log'), /No menu yet/);
  await click('btn-step', 3000); // phase 0: advertise
  failIfErrors('advertise');
  await order('/plan', 500);
  assert.match(logText(document, 'wire-log'), /needs input/);
  await order('/plan ship it', 3000);
  failIfErrors('fire valid');
  assert.match(logText(document, 'wire-log'), /session\/prompt “\/plan ship it”/);
});
