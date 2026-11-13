import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Execute the real adapter with isolated GSAP/DOM doubles; this is not visual browser QA.
const source = ts.transpileModule(readFileSync(new URL('../src/scripts/project-entry.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness({ width = 1440, failTrigger = false, count = 2, fit = width >= 1024 && count === 2 } = {}) {
  const timelines = [], triggers = [], sets = [], errors = [], holders = new Set();
  const section = { dataset: { projectFit: String(fit) } }, framed = [];
  const cards = Array.from({ length: count }, () => {
    const classes = new Set(), listeners = new Map(), events = [];
    const entry = { classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) } };
    const arrival = {};
    return {
      dataset: {}, entry, arrival, classes, listeners, events, top: 700,
      querySelector: (selector) => selector === '[data-project-entry]' ? entry : arrival,
      closest: () => section,
      getBoundingClientRect() { return { top: this.top, bottom: this.top + 600 }; },
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name) => listeners.delete(name),
      dispatchEvent: (event) => events.push(event.type),
    };
  });
  const gsap = {
    set: (target, vars) => sets.push({ target, vars }),
    timeline(options) {
      const timeline = { options, tracks: [], plays: 0, killed: false,
        to(target, vars, at) { this.tracks.push({ target, vars, at }); return this; },
        invalidate() { return this; }, play() { this.plays++; }, kill() { this.killed = true; },
      };
      timelines.push(timeline); return timeline;
    },
  };
  const ScrollTrigger = { create(options) {
    if (failTrigger) throw Error('ScrollTrigger unavailable');
    const trigger = { options, killed: false, kill() { this.killed = true; } };
    triggers.push(trigger); return trigger;
  } };
  const exports = {};
  const window = Object.assign(new EventTarget(), { innerWidth: width, innerHeight: 900 });
  runInNewContext(source, {
    exports, require: (name) => name === 'gsap' ? { gsap } : { ScrollTrigger },
    window, document: { activeElement: null }, Event,
    console: { error: (...values) => errors.push(values) },
  });
  const root = { querySelectorAll: () => cards };
  const hold = (finish, target) => { holders.add(finish); framed.push(target); return () => holders.delete(finish); };
  return { cards, timelines, triggers, sets, errors, holders, section, framed, window, initialize: () => exports.initializeProjectEntry(root, hold) };
}

test('a route arrival finishes pending card entrances and releases their scroll hold', () => {
  const h = harness();
  const cleanup = h.initialize();
  h.triggers[0].options.onEnter();
  h.window.dispatchEvent(new Event('portfolio:route-arrive'));
  assert.equal(h.holders.size, 0);
  assert.ok(h.cards.every((card) => card.dataset.projectReady === 'true'));
  assert.ok(h.timelines.every((timeline) => timeline.killed));
  cleanup();
  const eventCounts = h.cards.map((card) => card.events.length);
  h.window.dispatchEvent(new Event('portfolio:route-arrive'));
  assert.deepEqual(h.cards.map((card) => card.events.length), eventCounts);
});

test('cards arrive from below the viewport before either turns; stages retain 160ms stagger and a one-shot trigger', () => {
  const h = harness(); const cleanup = h.initialize();
  assert.equal(h.timelines.length, 2);
  const arrivalTracks = h.timelines.map((timeline) => timeline.tracks.find(({ vars }) => vars.y === 0));
  const turnTracks = h.timelines.map((timeline) => timeline.tracks.find(({ vars }) => vars.rotationY === 0));
  assert.equal(arrivalTracks[0].at, 0);
  assert.equal(arrivalTracks[1].at, .16);
  assert.ok(Math.abs(turnTracks[1].at - turnTracks[0].at - .16) < .0001);
  assert.ok(Math.max(...arrivalTracks.map(({ at, vars }) => at + vars.duration)) < turnTracks[0].at);
  for (let index = 0; index < 2; index++) {
    const card = h.cards[index], timeline = h.timelines[index];
    assert.equal(card.dataset.projectReady, 'false');
    assert.ok(card.classes.has('is-entering'));
    assert.ok(h.sets.some(({ target, vars }) => target === card.entry && vars.rotationY === 180 && vars.opacity === undefined));
    assert.ok(h.sets.some(({ target, vars }) => target === card.arrival && vars.y === 64 && vars.opacity === 0));
    assert.equal(timeline.tracks.find(({ target }) => target === card.entry).vars.duration, 1.1);
    assert.equal(h.triggers[index].options.once, true);
    assert.equal(h.triggers[index].options.start, 'top 50%');
    card.top = 450;
    h.triggers[index].options.onEnter(); assert.equal(timeline.plays, 1);
    const initialY = h.sets.filter(({ target, vars }) => target === card.arrival && vars.y !== undefined).at(-1).vars.y;
    assert.ok(card.top + initialY > 900, 'The card starts below the viewport at trigger time');
    timeline.options.onComplete();
    assert.equal(card.dataset.projectReady, 'true');
    assert.equal(card.dataset.projectRevealed, 'true');
    assert.ok(!card.classes.has('is-entering'));
    assert.deepEqual(card.events, ['project:revealed']);
  }
  cleanup(); const again = h.initialize();
  assert.equal(h.timelines.length, 2, 'Completed entrances do not restart on media/BFCache initialization');
  again();
});

test('keyboard focus ends entrance immediately, mobile has no second-column delay, and cleanup removes listeners', () => {
  const h = harness({ width: 390 }); const cleanup = h.initialize();
  assert.equal(h.timelines[1].tracks.find(({ vars }) => vars.y === 0).at, 0);
  h.cards[1].listeners.get('focus')();
  assert.equal(h.cards[1].dataset.projectReady, 'true');
  assert.equal(h.timelines[1].killed, true);
  assert.equal(h.triggers[1].killed, true);
  cleanup();
  assert.equal(h.cards[0].listeners.size, 0); assert.equal(h.cards[1].listeners.size, 0);
  assert.equal(h.cards[0].classes.size, 0);
});

test('failed initialization removes prepared state and restores the static front', () => {
  const h = harness({ failTrigger: true }); const cleanup = h.initialize();
  assert.equal(h.errors.length, 1); assert.equal(h.cards[0].listeners.size, 0);
  assert.equal(h.cards[0].classes.size, 0); assert.equal(h.cards[0].dataset.projectReady, undefined);
  assert.ok(h.sets.some(({ target, vars }) => target === h.cards[0].arrival && vars.clearProps === 'transform,opacity'));
  cleanup();
});

test('scroll stays held until both cards finish, and cleanup releases an interrupted entrance', () => {
  const h = harness(); const cleanup = h.initialize();
  h.triggers.forEach(({ options }) => options.onEnter());
  assert.equal(h.holders.size, 2);
  h.timelines[0].options.onComplete(); assert.equal(h.holders.size, 1);
  h.timelines[1].options.onComplete(); assert.equal(h.holders.size, 0);
  cleanup();
  const interrupted = harness(); const dispose = interrupted.initialize();
  interrupted.triggers.forEach(({ options }) => options.onEnter());
  assert.equal(interrupted.holders.size, 2);
  dispose(); assert.equal(interrupted.holders.size, 0);
});

test('only the fitted desktop scene frames the section; mobile and later rows frame the active card', () => {
  for (const options of [{ width: 1440 }, { width: 390 }, { count: 3 }, { fit: false }]) {
    const h = harness(options); const cleanup = h.initialize();
    const index = h.cards.length - 1;
    h.triggers[index].options.onEnter();
    assert.equal(h.framed[0], h.section.dataset.projectFit === 'true' ? h.section : h.cards[index]);
    cleanup();
  }
});
