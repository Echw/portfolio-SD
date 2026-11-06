import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTypewriterController } from '../src/scripts/typewriter-controller.ts';

const headlines = [{ lines: ['FULL-STACK', 'DEVELOPER'] }, { lines: ['Web applications.', 'AI tools.'] }];
function harness(entryDelay = 0, render = () => {}) {
  let now = 0, id = 0;
  const jobs = new Map();
  const frames = [], errors = [];
  const controller = createTypewriterController({
    headlines, entryDelay,
    clock: {
      now: () => now,
      schedule(callback, delay) { const key = ++id; jobs.set(key, { callback, at: now + delay }); return key; },
      cancel(key) { jobs.delete(key); },
    },
    render(state) { render(state); frames.push(state); },
    error: (error) => errors.push(error),
  });
  const advance = (time) => {
    const end = now + time;
    while (jobs.size) {
      const [key, job] = [...jobs.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      if (job.at > end) break;
      now = job.at; jobs.delete(key); job.callback();
    }
    now = end;
  };
  return { controller, jobs, frames, errors, advance, step() {
    const next = Math.min(...[...jobs.values()].map((job) => job.at));
    assert.ok(Number.isFinite(next), 'Expected one pending character timer');
    advance(next - now);
  } };
}

test('real text prefixes appear every 70 ms, first row before the second; hold lasts 3.5 s', () => {
  const h = harness();
  assert.deepEqual(h.controller.state().lines, ['', '']);
  h.controller.setVisible(true);
  h.advance(69); assert.deepEqual(h.controller.state().lines, ['', '']);
  h.advance(1); assert.deepEqual(h.controller.state().lines, ['F', '']);
  for (let count = 2; count <= 10; count++) {
    h.advance(70); assert.deepEqual(h.controller.state().lines, ['FULL-STACK'.slice(0, count), '']);
  }
  assert.equal(h.controller.state().phase, 'linePause');
  assert.equal(h.controller.state().cursorRow, 0);
  h.advance(180); assert.equal(h.controller.state().cursorRow, 1);
  for (let count = 1; count <= 9; count++) {
    h.advance(70); assert.deepEqual(h.controller.state().lines, ['FULL-STACK', 'DEVELOPER'.slice(0, count)]);
  }
  assert.equal(h.controller.state().phase, 'hold');
  h.advance(3499); assert.equal(h.controller.state().lines[1], 'DEVELOPER');
  h.advance(1); assert.equal(h.controller.state().lines[1], 'DEVELOPE');
  h.controller.destroy();
});

test('deletion runs backwards at 50 ms; the caret follows the active row and both messages cycle', () => {
  const h = harness(); h.controller.setVisible(true);
  while (h.controller.state().phase !== 'hold') h.step();
  for (let count = 8; count >= 0; count--) {
    h.step();
    assert.deepEqual(h.controller.state().lines, ['FULL-STACK', 'DEVELOPER'.slice(0, count)]);
    assert.equal(h.controller.state().cursorRow, count ? 1 : 0);
  }
  for (let count = 9; count >= 0; count--) {
    h.advance(49); assert.equal(h.controller.state().lines[0].length, count + 1);
    h.advance(1); assert.equal(h.controller.state().lines[0], 'FULL-STACK'.slice(0, count));
  }
  assert.equal(h.controller.state().phase, 'emptyPause');
  h.advance(249); assert.equal(h.controller.state().index, 0);
  h.advance(1); assert.equal(h.controller.state().index, 1);
  while (h.controller.state().phase !== 'hold') h.step();
  assert.deepEqual(h.controller.state().lines, headlines[1].lines);
  while (h.controller.state().index !== 0) h.step();
  assert.deepEqual(h.controller.state().lines, ['', '']);
  h.controller.destroy(); assert.equal(h.jobs.size, 0);
});

test('overlapping pause gates preserve the exact character and remaining time', () => {
  const h = harness(); h.controller.setVisible(true); h.advance(100);
  assert.equal(h.controller.state().lines[0], 'F');
  h.controller.setPaused(true); h.controller.setVisible(false); h.controller.setDocumentVisible(false);
  h.advance(10000); assert.equal(h.jobs.size, 0);
  h.controller.setPaused(false); h.controller.setDocumentVisible(true);
  assert.equal(h.jobs.size, 0);
  h.controller.setVisible(true); h.controller.setVisible(true);
  assert.equal(h.jobs.size, 1);
  h.advance(39); assert.equal(h.controller.state().lines[0], 'F');
  h.advance(1); assert.equal(h.controller.state().lines[0], 'FU');
  h.controller.destroy(); h.controller.setVisible(true); assert.equal(h.jobs.size, 0);
});

test('entry starts typing during the reveal and can be finished immediately by interaction', () => {
  const h = harness(240); h.controller.setVisible(true);
  h.advance(239); assert.equal(h.controller.state().phase, 'entry');
  h.advance(1); assert.equal(h.controller.state().phase, 'typing');
  h.advance(70); assert.equal(h.controller.state().lines[0], 'F');
  h.controller.destroy();
  const interrupted = harness(240); interrupted.controller.setVisible(true);
  interrupted.controller.finishEntry(); interrupted.advance(70);
  assert.equal(interrupted.controller.state().lines[0], 'F');
  interrupted.controller.destroy();
});

test('pausing the full-text hold keeps its remaining duration; render failure stops all timers', () => {
  const h = harness(); h.controller.setVisible(true);
  while (h.controller.state().phase !== 'hold') h.step();
  h.advance(3000); h.controller.setPaused(true); h.advance(20000);
  h.controller.setPaused(false); h.advance(499);
  assert.equal(h.controller.state().phase, 'hold');
  h.advance(1); assert.equal(h.controller.state().phase, 'deleting');
  h.controller.destroy();
  const failure = harness(0, (state) => { if (state.lines[0] === 'F') throw Error('DOM unavailable'); });
  failure.controller.setVisible(true); failure.advance(70);
  assert.equal(failure.errors.length, 1); assert.equal(failure.jobs.size, 0);
  failure.controller.setVisible(true); assert.equal(failure.jobs.size, 0);
});
