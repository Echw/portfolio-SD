import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { createScrollHold } from '../src/scripts/scroll-hold.ts';

const source = ts.transpileModule(readFileSync(new URL('../src/scripts/scroll.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness({ router = false } = {}) {
  const windowEvents = new Map(), documentEvents = new Map(), classes = new Set(), jobs = new Map();
  const events = (listeners) => ({ addEventListener: (name, callback) => listeners.set(name, callback), removeEventListener: (name) => listeners.delete(name) });
  const calls = [], navigations = [], historyWrites = []; let lenis;
  const location = { hash: '' };
  const history = { state: { index: 7, scrollY: 250 }, pushState(...args) { historyWrites.push(args); },
    replaceState(state) { this.state = state; } };
  const target = { getBoundingClientRect: () => ({ top: 600 }), hasAttribute: () => true, focus() {}, addEventListener() {} };
  class Element {
    closest() { return this; }
    getAttribute() { return '#about'; }
  }
  const link = new Element();
  class Lenis {
    actualScroll = 250; stops = 0; starts = 0; stopped = false; failScroll = false;
    constructor() { lenis = this; }
    on() {} off() {} raf() {} destroy() {}
    stop() { this.stops++; this.stopped = true; }
    start() { this.starts++; this.stopped = false; }
    scrollTo(top, options) {
      if (this.failScroll) throw Error('Framing unavailable');
      calls.push({ top, options, stopped: this.stopped });
      if (options.onComplete) window.scrollY = top;
      options.onComplete?.();
    }
  }
  const window = {
    ...events(windowEvents), scrollY: 250,
    setTimeout(callback, delay) { jobs.set(1, { callback, delay }); return 1; },
    clearTimeout: (key) => jobs.delete(key), scrollTo() {},
  };
  const document = { ...events(documentEvents), hidden: false,
    querySelector: () => router ? {} : null, getElementById: () => target,
    documentElement: { classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value) } },
  };
  const exports = {};
  runInNewContext(source, {
    exports, window, document, Element, location, history,
    require(name) {
      if (name === 'lenis') return { __esModule: true, default: Lenis };
      if (name === 'gsap') return { gsap: { ticker: { lagSmoothing() {}, add() {}, remove() {} } } };
      if (name === 'gsap/ScrollTrigger') return { ScrollTrigger: { update() {} } };
      if (name === './scroll-hold') return { createScrollHold };
      if (name === 'astro:transitions/client') return { navigate(hash, options) {
        navigations.push({ hash, options }); location.hash = hash; return Promise.resolve();
      } };
      return {};
    },
  });
  const scroll = exports.initializeScroll({ offsetHeight: 112 }, true);
  return { scroll, lenis, calls, classes, jobs, windowEvents, documentEvents, document, navigations, historyWrites, history, link };
}

test('local anchors use Astro history once and retain smooth scrolling without a document transition', async () => {
  const h = harness({ router: true }); let prevented = 0;
  h.documentEvents.get('click')({ target: h.link, button: 0, detail: 1, preventDefault: () => prevented++ });
  await Promise.resolve();
  assert.equal(prevented, 1);
  assert.equal(h.navigations.length, 1);
  assert.equal(h.navigations[0].hash, '#about');
  assert.equal(h.historyWrites.length, 0);
  assert.equal(h.history.state.index, 7);
  assert.equal(h.history.state.scrollY, 722);
  assert.equal(h.calls.at(-1).options.immediate, false);
  assert.equal(h.calls.at(-1).options.duration, .9);
  assert.equal(h.calls.at(-1).options.lerp, 0);
  for (const extra of [{ defaultPrevented: true }, { ctrlKey: true }, { metaKey: true }, { button: 1 }]) {
    h.documentEvents.get('click')({ target: h.link, button: 0, ...extra, preventDefault() { throw Error('Must remain native'); } });
  }
  assert.equal(h.navigations.length, 1); h.scroll.destroy();
});

test('history interrupts an anchor tween at the position restored by the router', () => {
  const h = harness({ router: true });
  h.lenis.actualScroll = 80;
  h.windowEvents.get('popstate')();
  assert.equal(h.calls.at(-1).top, 80);
  assert.equal(h.calls.at(-1).options.immediate, true);
  h.scroll.destroy();
});

test('navigation pause settles card holds and resumes exactly the current scroll owner', () => {
  const h = harness(); let settled = 0;
  h.scroll.hold(() => settled++);
  h.scroll.pause();
  assert.equal(settled, 1); assert.equal(h.lenis.stopped, true);
  assert.equal(h.classes.size, 0);
  h.scroll.resume(); assert.equal(h.lenis.stopped, false);
  h.scroll.destroy(); const starts = h.lenis.starts;
  h.scroll.resume(); assert.equal(h.lenis.starts, starts);
});

test('the real owner stops Lenis, discards wheel/keyboard input, frames once and resumes after the final holder', () => {
  const h = harness();
  const target = { getBoundingClientRect: () => ({ top: 450 }) };
  const first = h.scroll.hold(() => {}, target), second = h.scroll.hold(() => {}, target);
  assert.equal(h.lenis.stops, 1); assert.equal(h.classes.has('scroll-is-held'), true);
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0].stopped, true);
  assert.equal(h.calls[0].options.force, true);
  let prevented = 0;
  h.windowEvents.get('wheel')({ ctrlKey: false, cancelable: true, preventDefault: () => prevented++ });
  h.windowEvents.get('keydown')({ key: 'PageDown', preventDefault: () => prevented++ });
  assert.equal(prevented, 2); assert.equal(h.calls.length, 1);
  first(); assert.equal(h.lenis.starts, 0);
  second(); assert.equal(h.lenis.starts, 1); assert.equal(h.classes.size, 0);
  assert.equal(h.calls.length, 1, 'Blocked input is never queued for replay');
  h.scroll.destroy();
});

test('Escape, Tab, resize, history and hidden tabs finish entrances and restore scrolling', () => {
  for (const reason of ['Escape', 'Tab', 'resize', 'popstate', 'hidden']) {
    const h = harness(); let finished = 0;
    h.scroll.hold(() => finished++);
    if (reason === 'Escape' || reason === 'Tab') h.windowEvents.get('keydown')({ key: reason });
    else if (reason === 'hidden') { h.document.hidden = true; h.documentEvents.get('visibilitychange')(); }
    else h.windowEvents.get(reason)();
    assert.equal(finished, 1, reason); assert.equal(h.lenis.stopped, false);
    assert.equal(h.classes.size, 0); assert.equal(h.jobs.size, 0);
    h.scroll.destroy();
  }
});

test('navigation and destruction release active holds; a framing exception cannot leave the document locked', () => {
  const h = harness(); let finished = 0;
  h.scroll.hold(() => finished++);
  h.scroll.goTo({ getBoundingClientRect: () => ({ top: 600 }) }, true);
  assert.equal(finished, 1); assert.equal(h.calls.at(-1).stopped, false);
  h.lenis.failScroll = true;
  assert.throws(() => h.scroll.hold(() => {}, { getBoundingClientRect: () => ({ top: 300 }) }), /Framing unavailable/);
  assert.equal(h.classes.size, 0); assert.equal(h.jobs.size, 0); assert.equal(h.lenis.stopped, false);
  h.scroll.hold(() => finished++); h.scroll.destroy(); h.scroll.destroy();
  assert.equal(finished, 2); assert.equal(h.classes.size, 0);
  assert.equal(h.windowEvents.size, 0); assert.equal(h.documentEvents.size, 0);
});
