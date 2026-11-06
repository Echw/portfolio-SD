import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/scripts/cursor.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function classList() {
  const values = new Set();
  return { values, add: (value) => values.add(value), remove: (value) => values.delete(value),
    toggle(value, enabled) { if (enabled) values.add(value); else values.delete(value); } };
}
function harness() {
  const windowEvents = new Map(), documentEvents = new Map(), jobs = new Map(), updates = [], errors = [];
  const root = { classList: classList() };
  const dot = {}, ring = {}, layer = { hidden: true, dataset: {}, classList: classList(),
    querySelector: (selector) => selector === '[data-cursor-dot]' ? dot : ring };
  let target = 'background', fail = false, id = 0;
  const document = {
    documentElement: root, hidden: false, querySelector: () => layer,
    elementFromPoint() {
      if (fail) throw Error('Pointer surface unavailable');
      if (target === 'outside') return null;
      return { closest(selector) {
        if (selector.startsWith('input')) return target === 'input' ? {} : null;
        if (selector.startsWith('a[')) return target === 'link' ? {} : null;
        return target === 'tile' ? {} : null;
      } };
    },
    addEventListener: (name, callback) => documentEvents.set(name, callback),
    removeEventListener: (name) => documentEvents.delete(name),
  };
  const window = {
    addEventListener: (name, callback) => windowEvents.set(name, callback),
    removeEventListener: (name) => windowEvents.delete(name),
  };
  const motions = [];
  const gsap = {
    quickTo(node, property, options) {
      const update = (value, start) => updates.push({ node, property, value, start, options });
      update.tween = { paused: 0, killed: false, pause() { this.paused++; }, kill() { this.killed = true; } };
      motions.push(update); return update;
    },
    quickSetter: (node, property) => (value) => updates.push({ node, property, value, exact: true }),
    set(nodes, vars) { nodes.forEach((node) => Object.assign(node, vars)); },
  };
  const exports = {};
  runInNewContext(source, {
    exports, require: () => ({ gsap }), document, window,
    requestAnimationFrame(callback) { jobs.set(++id, callback); return id; },
    cancelAnimationFrame: (key) => jobs.delete(key), console: { error: (...values) => errors.push(values) },
  });
  const cleanup = exports.initializeCursor();
  const move = (values = {}) => windowEvents.get('pointermove')({ pointerType: 'mouse', clientX: 100, clientY: 200, buttons: 0, ...values });
  return { root, layer, dot, ring, updates, motions, jobs, errors, document, windowEvents, documentEvents, cleanup, move,
    target: (value) => { target = value; }, fail: () => { fail = true; },
    flush() { const callbacks = [...jobs.values()]; jobs.clear(); callbacks.forEach((callback) => callback()); } };
}

test('native cursor remains until a successful positioned frame; the dot is exact and the ring uses 180ms motion', () => {
  const h = harness();
  assert.equal(h.layer.hidden, true); assert.equal(h.root.classList.values.size, 0);
  h.move();
  assert.equal(h.dot.x, 100); assert.equal(h.ring.y, 200);
  assert.equal(h.layer.hidden, false); assert.ok(h.root.classList.values.has('has-custom-cursor'));
  h.move({ clientX: 180, clientY: 240 });
  assert.ok(h.updates.some((update) => update.node === h.dot && update.exact && update.property === 'x' && update.value === 180));
  assert.ok(h.updates.some((update) => update.node === h.ring && update.property === 'x' && update.value === 180 && update.options.duration === .18));
  h.cleanup();
});

test('links, static tiles and background have distinct states, including scroll under a stationary pointer and click release', () => {
  const h = harness(); h.target('link'); h.move();
  assert.equal(h.layer.dataset.mode, 'interactive');
  h.target('tile'); h.windowEvents.get('scroll')(); h.flush();
  assert.equal(h.layer.dataset.mode, 'tile');
  h.windowEvents.get('pointerdown')({ pointerType: 'mouse', clientX: 100, clientY: 200, buttons: 1 });
  assert.ok(h.layer.classList.values.has('is-pressed'));
  h.windowEvents.get('pointerup')(); assert.equal(h.layer.classList.values.size, 0);
  h.target('background'); h.move(); assert.equal(h.layer.dataset.mode, 'default'); h.cleanup();
});

test('keyboard, touch, leaving the window and hidden tabs restore the native cursor; re-entry starts at its new position', () => {
  const h = harness();
  const hideActions = [
    () => h.windowEvents.get('keydown')(),
    () => h.move({ pointerType: 'touch' }),
    () => h.windowEvents.get('pointerout')({ relatedTarget: null }),
    () => h.windowEvents.get('blur')(),
    () => { h.document.hidden = true; h.documentEvents.get('visibilitychange')(); h.document.hidden = false; },
  ];
  for (const hide of hideActions) {
    h.move(); hide(); assert.equal(h.layer.hidden, true); assert.equal(h.root.classList.values.size, 0);
  }
  h.move({ clientX: 650, clientY: 500 });
  assert.equal(h.ring.x, 650); assert.equal(h.updates.at(-2).start, 650);
  h.target('input'); h.move(); assert.equal(h.layer.hidden, true); h.cleanup();
});

test('a failed update immediately restores the native cursor and disables further custom updates', () => {
  const h = harness(); h.move(); h.fail(); h.move();
  assert.equal(h.layer.hidden, true); assert.equal(h.root.classList.values.size, 0); assert.equal(h.errors.length, 1);
  h.move(); assert.equal(h.errors.length, 1); h.cleanup();
});

test('cleanup cancels pending refreshes, removes every listener and kills ring tweens', () => {
  const h = harness(); h.move(); h.windowEvents.get('scroll')();
  assert.equal(h.jobs.size, 1); h.cleanup(); h.flush();
  assert.equal(h.jobs.size, 0); assert.equal(h.windowEvents.size, 0); assert.equal(h.documentEvents.size, 0);
  assert.equal(h.root.classList.values.size, 0); assert.equal(h.layer.hidden, true);
  assert.ok(h.motions.every((motion) => motion.tween.killed));
});
