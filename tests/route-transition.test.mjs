import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/scripts/route-transition.ts', import.meta.url), 'utf8')
  .replace(/^if \(import\.meta\.hot\).*$/m, ''), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function harness({ reduced = false, initialize = () => Promise.resolve() } = {}) {
  const window = new EventTarget(), document = new EventTarget();
  const media = Object.assign(new EventTarget(), { matches: reduced });
  const timers = new Map(), timelines = [], initializations = [], redirects = [], calls = [];
  let timer = 0;
  const element = () => ({ dataset: {}, style: {}, inert: false,
    setAttribute(name, value) { this[name] = value; }, removeAttribute(name) { delete this[name]; },
    focus() { calls.push('focus'); },
  });
  const overlay = element(), panel = element(), label = element(), main = element(), header = element();
  overlay.querySelector = (selector) => selector.includes('curtain') ? panel : label;
  document.documentElement = element(); document.body = { dataset: { page: 'home' } }; document.hidden = false;
  document.querySelector = (selector) => selector === 'main' ? main : overlay;
  document.querySelectorAll = () => [main, header];
  window.setTimeout = (fn, delay) => { timers.set(++timer, { fn, delay }); return timer; };
  window.clearTimeout = (id) => timers.delete(id);
  window.__portfolioEntry = { finish() { calls.push('intro-finish'); } };
  const gsap = {
    registerPlugin() {},
    set(target, properties) { Object.assign(target.style, properties); calls.push(['set', target, properties]); },
    timeline() {
      const timeline = { steps: [], killed: false,
        eventCallback(_, fn) { this.complete = fn; },
        to(target, properties, position) { this.steps.push({ target, properties, position }); return this; },
        play() { return this; }, kill() { this.killed = true; },
        finish() { this.complete(); },
      };
      timelines.push(timeline); return timeline;
    },
  };
  const motion = {
    initializePortfolio(options) { initializations.push(options); return initialize(); },
    destroyPortfolio() { calls.push('destroy'); }, pausePortfolioScroll() { calls.push('pause'); },
    resumePortfolioScroll() { calls.push('resume'); },
  };
  const exports = {};
  runInNewContext(source, {
    exports, window, document, Event, console: { ...console, warn() {} }, matchMedia: () => media,
    location: { assign: (url) => redirects.push(['assign', url]), replace: (url) => redirects.push(['replace', url]) },
    require(name) {
      if (name === 'gsap') return { gsap };
      if (name === 'gsap/CustomEase') return { CustomEase: { create: () => 'route-panel' } };
      if (name === './motion') return motion;
      throw Error(name);
    },
  });
  const dispose = exports.initializeRouteTransitions();
  const emit = (name) => document.dispatchEvent(new Event(name));
  function prepare({ to = '/work/goldnat/', page = 'case-study', title = 'Goldnat', type = 'push', sectionLabels, loader = async () => {} } = {}) {
    const controller = new AbortController();
    const newDocument = { documentElement: element(), body: { dataset: { page, sectionLabels: sectionLabels && JSON.stringify(sectionLabels) } },
      querySelector: () => ({ getAttribute: () => title }),
    };
    const event = Object.assign(new Event('astro:before-preparation', { cancelable: true }), {
      from: new URL(page === 'home' ? 'https://portfolio.test/work/goldnat/' : 'https://portfolio.test/'),
      to: new URL(to, 'https://portfolio.test'), newDocument, signal: controller.signal,
      navigationType: type, loader,
    });
    document.dispatchEvent(event);
    const loading = event.loader();
    return { event, controller, loading, swap() {
      const viewTransition = { ready: Promise.reject(Error('No native snapshots')), skipTransition() { calls.push('skip-native'); } };
      document.dispatchEvent(Object.assign(new Event('astro:before-swap'), {
        ...Object.fromEntries(['from', 'to', 'newDocument', 'signal'].map((key) => [key, event[key]])), viewTransition,
      }));
      document.documentElement.dataset = { ...newDocument.documentElement.dataset };
      emit('astro:after-swap'); emit('astro:page-load');
    } };
  }
  return { ...exports, dispose, prepare, emit, window, document, media, timers, timelines, initializations, redirects, calls, overlay, panel, label, main };
}

test('a browser without native view-transition APIs gets cover, destination title and reveal', async () => {
  const h = harness(), loading = deferred();
  const navigation = h.prepare({ loader: () => loading.promise });
  assert.equal(h.overlay['data-active'], '');
  assert.equal(h.panel.style.scaleX, 0, 'The panel is collapsed before it becomes visible');
  assert.equal(h.main.inert, true);
  let prepared = false; navigation.loading.then(() => { prepared = true; });
  h.timelines[0].finish(); await flush();
  assert.equal(prepared, false, 'Slow loading stays covered');
  loading.resolve(); await navigation.loading;
  navigation.swap(); await flush();
  assert.equal(h.label.textContent, 'Goldnat');
  assert.equal(h.overlay.dataset.phase, 'title');
  h.timelines[1].finish(); await flush();
  assert.equal(h.overlay.dataset.phase, 'reveal');
  h.timelines[2].finish(); await flush();
  assert.equal(h.overlay['data-active'], undefined);
  assert.equal(h.main.inert, false);
  assert.equal(h.document.documentElement.dataset.routeBusy, undefined);
  assert.equal(h.timers.size, 0);
  assert.ok(h.calls.includes('skip-native'));
  h.dispose();
});

test('fast loading cannot swap early; reveal waits for the incoming motion initialization', async () => {
  const ready = deferred(), h = harness({ initialize: () => ready.promise });
  const navigation = h.prepare();
  let prepared = false; navigation.loading.then(() => { prepared = true; });
  await flush(); assert.equal(prepared, false);
  h.timelines[0].finish(); await navigation.loading;
  navigation.swap(); h.timelines[1].finish(); await flush();
  assert.equal(h.timelines.length, 2);
  ready.resolve(); await flush();
  assert.equal(h.timelines.length, 3);
  h.timelines[2].finish(); await flush(); h.dispose();
});

test('labels distinguish Homepage, work and section links while project labels ignore hashes', () => {
  const h = harness();
  for (const [hash, title] of [['#top', 'Homepage'], ['', 'Homepage'], ['#work', 'All projects'], ['#about', 'About'], ['#stack', 'Stack'], ['#experience', 'Experience'], ['#contact', 'Contact']]) {
    assert.equal(h.routeLabel('home', hash, 'Homepage'), title);
  }
  assert.equal(h.routeLabel('case-study', '#contact', 'Goldnat'), 'Goldnat'); h.dispose();
  assert.equal(h.routeLabel('case-study', '#context', 'Młyn nad Sanną'), 'Młyn nad Sanną');
});

test('Sanna uses the accepted 550 / 600 / 550 ms persistent curtain sequence', async () => {
  const h = harness();
  const navigation = h.prepare({ to: '/work/mlyn-nad-sanna/', title: 'Młyn nad Sanną' });
  assert.equal(h.timelines[0].steps[0].properties.duration, .55);
  h.timelines[0].finish(); await navigation.loading;
  navigation.swap(); await flush();
  assert.equal(h.label.textContent, 'Młyn nad Sanną');
  const titleEnd = h.timelines[1].steps[1];
  assert.equal(titleEnd.position + titleEnd.properties.duration, .6);
  h.timelines[1].finish(); await flush();
  assert.equal(h.timelines[2].steps[0].properties.duration, .55);
  h.timelines[2].finish(); await flush();
  assert.equal(h.main.inert, false);
  h.dispose();
});

test('all experience destinations use full company labels and retain curtain timing', async () => {
  for (const [id, title] of [['flyps', 'Flyps'], ['thebrain', 'TheBrain Software House'], ['xolvio', 'Xolv.io'], ['leaderna', 'Leaderna Platform'], ['eleader', 'eLeader'], ['plum', 'PLUM']]) {
    const h = harness();
    const navigation = h.prepare({ to: `/experience/${id}/`, title });
    assert.equal(h.timelines[0].steps[0].properties.duration, .55);
    h.timelines[0].finish(); await navigation.loading;
    navigation.swap(); await flush();
    assert.equal(h.label.textContent, title);
    const titleEnd = h.timelines[1].steps[1];
    assert.equal(titleEnd.position + titleEnd.properties.duration, .6);
    h.timelines[1].finish(); await flush();
    assert.equal(h.timelines[2].steps[0].properties.duration, .55);
    h.timelines[2].finish(); await flush();
    assert.equal(h.main.inert, false);
    h.dispose();
  }
});

test('reduced motion swaps without animation or delay and history does not reset scroll to the hash', async () => {
  const h = harness({ reduced: true });
  const navigation = h.prepare({ to: '/#work', page: 'home', title: 'Homepage', type: 'traverse' });
  await navigation.loading; navigation.swap(); await flush();
  assert.equal(h.timelines.length, 0);
  assert.equal(h.initializations[0].restoreHash, false);
  assert.equal(h.label.textContent, 'All projects');
  assert.equal(h.main.inert, false);
  assert.equal(h.overlay['data-active'], undefined); h.dispose();
});

test('aborted navigation cannot clear the next curtain, and listeners initialize only once', async () => {
  const h = harness(); assert.equal(h.initializeRouteTransitions(), h.dispose);
  const first = h.prepare(); first.controller.abort();
  const second = h.prepare({ to: '/#top', page: 'home', title: 'Homepage' });
  await first.loading; await flush();
  assert.equal(h.overlay['data-active'], ''); assert.equal(h.main.inert, true);
  assert.equal(h.timelines[0].killed, true);
  h.timelines[1].finish(); await second.loading;
  second.swap(); await flush();
  assert.equal(h.label.textContent, 'Homepage'); h.dispose();
  assert.equal(h.timers.size, 0); assert.equal(h.main.inert, false);
});

test('fetch failure and timeout release input and delegate preparation failure to Astro', async () => {
  for (const timeout of [false, true]) {
    const h = harness();
    const navigation = h.prepare({ loader: timeout ? () => new Promise(() => {}) : async () => { throw Error('Offline'); } });
    if (timeout) [...h.timers.values()][0].fn();
    await navigation.loading;
    assert.equal(navigation.event.defaultPrevented, true);
    assert.equal(h.overlay['data-active'], undefined); assert.equal(h.main.inert, false);
    assert.equal(h.timers.size, 0); h.dispose();
  }
});

test('a stalled incoming page falls back with replace after swap, without trapping the visitor', async () => {
  const h = harness({ initialize: () => new Promise(() => {}) });
  const navigation = h.prepare(); h.timelines[0].finish(); await navigation.loading;
  navigation.swap(); [...h.timers.values()][0].fn(); await flush();
  assert.deepEqual(h.redirects, [['replace', 'https://portfolio.test/work/goldnat/']]);
  assert.equal(h.main.inert, false); assert.equal(h.overlay['data-active'], undefined); h.dispose();
});

test('resize or reduced-motion changes settle cancelled animations and leave navigation usable', async () => {
  for (const change of ['resize', 'reduce']) {
    const h = harness(), navigation = h.prepare();
    if (change === 'resize') h.window.dispatchEvent(new Event('resize'));
    else { h.media.matches = true; h.media.dispatchEvent(new Event('change')); }
    await navigation.loading; navigation.swap(); await flush();
    assert.equal(h.timelines.length, 1);
    assert.equal(h.main.inert, false); assert.equal(h.overlay['data-active'], undefined); h.dispose();
  }
});

test('the incoming Polish document supplies translated section labels to the persistent curtain', async () => {
  const h = harness({ reduced: true });
  const navigation = h.prepare({
    to: '/pl/#work', page: 'home', title: 'Strona główna',
    sectionLabels: { '#work': 'Wszystkie realizacje', '#about': 'O mnie' },
  });
  await navigation.loading;
  navigation.swap();
  await flush();
  assert.equal(h.label.textContent, 'Wszystkie realizacje');
  assert.equal(h.routeLabel('home', '#top', 'Strona główna', {}), 'Strona główna');
  h.dispose();
});
