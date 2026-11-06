import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScrollHold } from '../src/scripts/scroll-hold.ts';

function harness() {
  const jobs = new Map(); let blocks = 0, unblocks = 0;
  const hold = createScrollHold({
    block: () => blocks++, unblock: () => unblocks++,
    schedule(callback, delay) { jobs.set(1, { callback, delay }); return 1; },
    cancel: (key) => jobs.delete(key),
  });
  return { hold, jobs, blocks: () => blocks, unblocks: () => unblocks };
}

test('two overlapping entrances stop once and release only after the final card; release is idempotent', () => {
  const h = harness(); const first = h.hold.acquire(() => {}), second = h.hold.acquire(() => {});
  assert.equal(h.blocks(), 1); assert.equal(h.jobs.size, 1);
  first(); first(); assert.equal(h.unblocks(), 0); assert.equal(h.hold.active(), true);
  second(); second(); assert.equal(h.unblocks(), 1); assert.equal(h.jobs.size, 0);
  assert.equal(h.hold.active(), false); h.hold.destroy(); assert.equal(h.unblocks(), 1);
});

test('watchdog finishes all pending cards and guarantees unlock even if the animation never completes', () => {
  const h = harness(); let finished = 0;
  h.hold.acquire(() => finished++); h.hold.acquire(() => finished++);
  assert.equal(h.jobs.get(1).delay, 3500);
  h.jobs.get(1).callback();
  assert.equal(finished, 2); assert.equal(h.hold.active(), false);
  assert.equal(h.unblocks(), 1); assert.equal(h.jobs.size, 0);
});

test('interruption and destruction finish holders without allowing an old release to clear a later lock', () => {
  const h = harness(); let finished = 0;
  const old = h.hold.acquire(() => finished++);
  h.hold.interrupt(); assert.equal(finished, 1);
  h.hold.acquire(() => finished++); old();
  assert.equal(h.hold.active(), true);
  h.hold.destroy(); assert.equal(finished, 2); assert.equal(h.hold.active(), false);
  h.hold.acquire(() => {}); assert.equal(h.blocks(), 2); assert.equal(h.jobs.size, 0);
});
