import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/scripts/entry-bootstrap.js', import.meta.url), 'utf8');
function harness({ hash = '', scrollY = 0, reduced = false, hidden = false, type = 'navigate' } = {}) {
  const classes = new Set(), listeners = new Map(), jobs = new Map();
  let ended = 0;
  const window = {
    scrollY,
    addEventListener(name, callback) { listeners.set(name, callback); },
    removeEventListener(name) { listeners.delete(name); },
    dispatchEvent(event) { if (event.type === 'portfolio:entry-end') ended++; },
  };
  const context = {
    window, location: { hash }, performance: { getEntriesByType: () => [{ type }] },
    document: { hidden, documentElement: { classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value) } } },
    matchMedia: () => ({ matches: reduced }), Event,
    setTimeout(callback, delay) { jobs.set(1, { callback, delay }); return 1; },
    clearTimeout(id) { jobs.delete(id); },
  };
  runInNewContext(source, context);
  return { window, classes, listeners, jobs, repeat: () => runInNewContext(source, context), ended: () => ended };
}

test('full load/reload at the top arms one reveal; finish is idempotent and cleans the watchdog/listeners', () => {
  for (const type of ['navigate', 'reload']) {
    const h = harness({ type });
    assert.equal(h.classes.has('entry-pending'), true);
    assert.equal(h.jobs.get(1).delay, 3000);
    h.window.__portfolioEntry.finish(); h.window.__portfolioEntry.finish(); h.repeat();
    assert.equal(h.classes.size, 0); assert.equal(h.jobs.size, 0);
    assert.equal(h.listeners.size, 0); assert.equal(h.ended(), 1);
  }
});

test('deep links, restored scroll, BFCache/history, reduced motion and hidden tabs skip reveal', () => {
  for (const options of [{ hash: '#work' }, { scrollY: 200 }, { type: 'back_forward' }, { reduced: true }, { hidden: true }]) {
    const h = harness(options);
    assert.equal(h.classes.size, 0); assert.equal(h.jobs.size, 0); assert.equal(h.listeners.size, 0);
  }
});

test('interaction, leaving the page and the fail-open watchdog dismiss the curtain immediately', () => {
  for (const event of ['pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll', 'pagehide', 'visibilitychange']) {
    const h = harness(); h.listeners.get(event)();
    assert.equal(h.classes.size, 0); assert.equal(h.jobs.size, 0); assert.equal(h.listeners.size, 0);
  }
  const slow = harness(); slow.jobs.get(1).callback();
  assert.equal(slow.classes.size, 0); assert.equal(slow.window.__portfolioEntry.pending, false);
});
