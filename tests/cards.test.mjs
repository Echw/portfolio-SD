import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { createCardPointer } from '../src/scripts/card-pointer.ts';

const source = ts.transpileModule(readFileSync(new URL('../src/scripts/cards.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness() {
  const windowEvents = new Map(), documentEvents = new Map(), jobs = new Map(), tweens = [], updates = [], cleared = [];
  let id = 0, target;
  const cards = [true, false].map((tilts) => {
    const listeners = new Map(), classes = new Set();
    const surface = { style: { removeProperty() {} } };
    return { tilts, listeners, classes, surface, bounds: { left: 100, top: 100, width: 400, height: 500 }, dataset: {},
      hasAttribute: () => tilts, querySelector: () => surface, getBoundingClientRect() { return this.bounds; },
      contains: (node) => node === surface, matches: () => false,
      classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value) },
      addEventListener: (name, callback) => listeners.set(name, callback), removeEventListener: (name) => listeners.delete(name),
    };
  });
  const gsap = {
    quickTo(surface, property) {
      const update = (value) => updates.push({ surface, property, value });
      update.tween = { killed: false, kill() { this.killed = true; } };
      tweens.push({ surface, property, update }); return update;
    },
    set: (surface, vars) => cleared.push({ surface, vars }),
  };
  const document = { hidden: false, elementFromPoint: () => target,
    addEventListener: (name, callback) => documentEvents.set(name, callback), removeEventListener: (name) => documentEvents.delete(name) };
  const window = { addEventListener: (name, callback) => windowEvents.set(name, callback), removeEventListener: (name) => windowEvents.delete(name) };
  const exports = {};
  runInNewContext(source, { exports, require: (name) => name === 'gsap' ? { gsap } : { createCardPointer }, document, window,
    requestAnimationFrame(callback) { jobs.set(++id, callback); return id; }, cancelAnimationFrame: (key) => jobs.delete(key),
  });
  const cleanup = exports.initializeCards({ querySelectorAll: () => cards });
  return { cards, tweens, updates, cleared, windowEvents, documentEvents, jobs, cleanup,
    move(card) { target = card; card.listeners.get('pointermove')({ pointerType: 'mouse', clientX: 300, clientY: 300 }); },
    flush() { const callbacks = [...jobs.values()]; jobs.clear(); callbacks.forEach((callback) => callback()); } };
}

test('Work and Stack share light while only Work creates rotation tweens; a stable Stack target survives scroll and leave', () => {
  const h = harness(); const [project, stack] = h.cards;
  assert.equal(h.tweens.filter(({ property }) => property.startsWith('rotation')).length, 2);
  assert.ok(h.tweens.filter(({ surface }) => surface === stack.surface).every(({ property }) => property.startsWith('--')));
  h.move(stack); h.flush(); assert.ok(stack.classes.has('is-hovering'));
  assert.ok(h.updates.some(({ surface, property, value }) => surface === stack.surface && property === '--light' && value === 1));
  stack.bounds.top = 400; h.windowEvents.get('scroll')(); h.flush();
  assert.equal(stack.classes.size, 0);
  h.move(project); h.flush(); assert.ok(project.classes.has('is-hovering'));
  project.listeners.get('pointerleave')(); assert.equal(project.classes.size, 0);
  h.cleanup();
});

test('cleanup cancels frames and listeners without clearing Stack entrance transforms', () => {
  const h = harness(); h.move(h.cards[1]); h.cleanup(); h.flush();
  assert.equal(h.jobs.size, 0); assert.equal(h.windowEvents.size, 0); assert.equal(h.documentEvents.size, 0);
  assert.ok(h.cards.every(({ listeners }) => listeners.size === 0));
  assert.ok(h.tweens.every(({ update }) => update.tween.killed));
  assert.ok(h.cleared.every(({ surface }) => surface === h.cards[0].surface));
});
