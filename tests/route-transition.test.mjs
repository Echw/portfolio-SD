import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/scripts/route-transition.js', import.meta.url), 'utf8');
function harness({ supported = true, reduced = false, panel = true, page = 'home', hash = '', title = 'Homepage' } = {}) {
  const window = new EventTarget();
  if (supported) Object.assign(window, { onpageswap: null, onpagereveal: null });
  const classes = new Set(), rootClasses = new Set();
  const root = { dataset: {}, classList: { add: (name) => rootClasses.add(name) } };
  const element = { classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) } };
  const label = { dataset: { routeLabel: title }, textContent: title };
  const location = { hash };
  window.location = location;
  const media = Object.assign(new EventTarget(), { matches: reduced });
  let introFinished = 0, arrivals = 0;
  window.__portfolioEntry = { finish: () => introFinished++ };
  window.addEventListener('portfolio:route-arrive', () => arrivals++);
  runInNewContext(source, {
    window, Event, document: {
      documentElement: root, body: { dataset: { page } },
      querySelector: (selector) => selector === '[data-route-label]' ? label : panel ? element : null,
    },
    matchMedia: () => media,
  });
  const emit = (name, transition) => window.dispatchEvent(Object.assign(new Event(name), { viewTransition: transition }));
  return { classes, rootClasses, root, media, emit, label, location, introFinished: () => introFinished, arrivals: () => arrivals };
}
function transition() {
  let resolve, reject, skipped = 0;
  const finished = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { ready: Promise.resolve(), finished, resolve, reject, skipTransition: () => skipped++, skipped: () => skipped };
}

test('homepage arrival labels follow the destination, including restored pages and the site-name link', () => {
  const h = harness();
  for (const [hash, expected] of [
    ['#work', 'All projects'], ['#top', 'Homepage'],
    ['#about', 'About'], ['#stack', 'Stack'], ['#experience', 'Experience'],
    ['#contact', 'Contact'], ['', 'Homepage'], ['#unknown', 'Homepage'],
  ]) {
    h.location.hash = hash;
    h.emit('pagereveal', transition());
    assert.equal(h.label.textContent, expected);
  }
});

test('case studies keep their project label when navigating to a section', () => {
  const h = harness({ page: 'case-study', hash: '#contact', title: 'Goldnat' });
  h.emit('pagereveal', transition());
  assert.equal(h.label.textContent, 'Goldnat');
});

test('unsupported, reduced motion, missing panel and ordinary navigation never expose a curtain', () => {
  for (const options of [{ supported: false }, { reduced: true }, { panel: false }]) {
    const h = harness(options), t = transition();
    h.emit('pageswap', t);
    assert.equal(h.classes.size, 0);
    if (options.supported !== false) assert.equal(t.skipped(), 1);
  }
  const h = harness(); h.emit('pageswap', null);
  assert.equal(h.classes.size, 0);
});

test('snapshot capture never exposes a live overlay; completed transitions cannot be cancelled again', async () => {
  for (const outcome of ['resolve', 'reject']) {
    const h = harness(), t = transition();
    h.emit('pageswap', t);
    assert.equal(h.classes.size, 0, 'Do not flash the full-size panel on the outgoing page');
    t[outcome]();
    await Promise.resolve();
    h.emit('pageshow'); h.emit('resize');
    assert.equal(t.skipped(), 0);
    assert.equal(h.classes.size, 0);
  }
});

test('arrival dismisses homepage intro; resize and a reduced-motion change cancel cleanly', () => {
  const h = harness(), t = transition();
  h.emit('pagereveal', t);
  assert.equal(h.root.dataset.routeArrival, 'true');
  assert.equal(h.introFinished(), 1);
  assert.equal(h.arrivals(), 1);
  h.emit('resize');
  assert.equal(t.skipped(), 1);
  const next = transition(); h.emit('pageswap', next);
  h.media.matches = true; h.media.dispatchEvent(new Event('change'));
  assert.equal(next.skipped(), 1);
  assert.equal(h.classes.size, 0);
});

test('an earlier transition finishing cannot remove cancellation handling for a newer transition', async () => {
  const h = harness(), first = transition(), second = transition();
  h.emit('pageswap', first); h.emit('pageswap', second);
  first.resolve(); await Promise.resolve();
  h.emit('resize');
  assert.equal(first.skipped(), 0);
  assert.equal(second.skipped(), 1);
  second.resolve(); await Promise.resolve();
  assert.equal(h.classes.size, 0);
});
