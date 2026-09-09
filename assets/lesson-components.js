/**
 * lesson-craft Web Components (copied from skill references/lesson-components.js)
 */
function define(tag, ctor) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

define('lesson-header', class extends HTMLElement {
  connectedCallback() {
    const slot = this.querySelector(':scope > [slot]') ?? this.firstElementChild;
    if (slot) this.replaceWith(slot);
  }
});

define('lesson-nav', class extends HTMLElement {
  connectedCallback() {
    const prev = this.getAttribute('previous');
    const next = this.getAttribute('next');
    const home = this.getAttribute('home');
    this.innerHTML = `
      <nav class="lesson-nav" aria-label="Lesson navigation">
        ${home ? `<a href="${home}" class="nav-home" rel="home">Course Home</a>` : ''}
        <span class="nav-prev-next">
          ${prev ? `<a href="${prev}" class="nav-prev" rel="prev">← Previous</a>` : ''}
          ${next ? `<a href="${next}" class="nav-next" rel="next">Next →</a>` : ''}
        </span>
      </nav>
    `;
  }
});

define('knowledge-check', class extends HTMLElement {
  connectedCallback() {
    const correct = this.getAttribute('correct');
    const cf = this.getAttribute('correct-feedback') || 'Correct!';
    const inf = this.getAttribute('incorrect-feedback') || 'Not quite.';
    const ef = this.getAttribute('empty-feedback') || 'Select an option first.';

    const form = this.querySelector('form');
    if (!form) return;

    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = this.getAttribute('button-label') || 'Check';
    form.appendChild(btn);

    const feedback = document.createElement('p');
    feedback.className = 'knowledge-feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const checked = form.querySelector('input[type="radio"]:checked');
      if (!checked) { feedback.textContent = ef; return; }
      feedback.textContent = checked.value === correct ? cf : inf;
    });
  }
});

define('source-code', class extends HTMLElement {  async connectedCallback() {
    const src = this.getAttribute('src');
    const label = this.getAttribute('label') || src;
    const figure = document.createElement('figure');
    figure.className = 'source-code';
    figure.innerHTML = `<figcaption>${label}</figcaption><pre><code>Loading source...</code></pre>`;
    this.append(figure);

    if (!src) return;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      figure.querySelector('code').textContent = text;
    } catch {
      figure.querySelector('code').textContent =
        `[Open ${src} to view source — file:// fetches not supported by browser policy]`;
    }
  }
});

// ─── Code copy buttons (progressive enhancement) ───────
// Adds a Copy button to every <pre><code>. Stays silent when no copy
// mechanism exists (restrictive file:// contexts): content is unaffected.
(function enableCopyButtons() {
  if (typeof document === 'undefined' || !document.querySelectorAll) return;
  const blocks = document.querySelectorAll('pre code');
  if (!blocks.length) return;
  const canAsync =
    typeof navigator !== 'undefined' && navigator.clipboard?.writeText;
  const canFallback =
    typeof document.execCommand === 'function' && typeof document.body !== 'undefined';
  if (!canAsync && !canFallback) return;

  blocks.forEach((code) => {
    const pre = code.parentElement;
    if (!pre || pre.tagName !== 'PRE') return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.addEventListener('click', async () => {
      try {
        if (canAsync) await navigator.clipboard.writeText(code.textContent);
        else {
          const ta = document.createElement('textarea');
          ta.value = code.textContent;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        btn.textContent = 'Copied!';
      } catch {
        btn.textContent = 'Copy failed';
      }
      setTimeout(() => {
        btn.textContent = 'Copy';
      }, 1500);
    });
    pre.appendChild(btn);
  });
})();
