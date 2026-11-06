import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCardPointer } from '../src/scripts/card-pointer.ts';

function harness() {
  let id = 0, resets = 0, ready = true, owns = true;
  const bounds = { left: 100, top: 100, width: 400, height: 500 };
  const jobs = new Map(), paints = [];
  const pointer = createCardPointer({
    bounds: () => bounds, ready: () => ready, ownsPoint: () => owns,
    request(callback) { const key = ++id; jobs.set(key, callback); return key; },
    cancel: (key) => jobs.delete(key),
    paint: (x, y, tilt) => paints.push({ x, y, tilt }),
    reset: () => resets++,
  });
  return { pointer, bounds, jobs, paints, resets: () => resets,
    ready: (value) => { ready = value; }, owns: (value) => { owns = value; },
    flush() { const callbacks = [...jobs.values()]; jobs.clear(); callbacks.forEach((callback) => callback()); },
  };
}

test('rapid enter/leave cancels pending paint; re-entry uses the newest point without duplicate frames', () => {
  const h = harness();
  h.pointer.move({ x: 110, y: 120 }); h.pointer.reset(); h.flush();
  assert.equal(h.paints.length, 0);
  h.pointer.move({ x: 110, y: 120 }); h.pointer.move({ x: 450, y: 520 });
  assert.equal(h.jobs.size, 1); h.flush();
  assert.equal(h.paints.length, 1); assert.equal(h.paints[0].x, 350);
  h.pointer.reset(); assert.equal(h.resets(), 1);
  h.pointer.move({ x: 300, y: 350 }); h.flush();
  assert.deepEqual(h.paints.at(-1).tilt, { x: 0, y: 0 });
  h.pointer.destroy();
});

test('scrolling beneath a stationary pointer remeasures light, then resets when the card leaves or is covered', () => {
  const h = harness(); h.pointer.move({ x: 300, y: 200 }); h.flush();
  h.bounds.top = 150; h.pointer.refresh(); h.flush();
  assert.equal(h.paints.at(-1).y, 50);
  h.bounds.top = 250; h.pointer.refresh(); h.flush();
  assert.equal(h.resets(), 1); assert.equal(h.paints.length, 2);
  h.pointer.move({ x: 300, y: 300 }); h.flush();
  h.owns(false); h.pointer.refresh(); h.flush();
  assert.equal(h.resets(), 2);
  h.pointer.destroy();
});

test('entrance blocks pointer effects but reveal can activate the last point; focus/reset prevents later activation', () => {
  const h = harness(); h.ready(false);
  h.pointer.move({ x: 300, y: 350 }); h.flush(); assert.equal(h.paints.length, 0);
  h.ready(true); h.pointer.refresh(); h.flush(); assert.equal(h.paints.length, 1);
  h.pointer.reset(); h.pointer.refresh(); h.flush(); assert.equal(h.paints.length, 1);
  h.pointer.move({ x: 300, y: 350 });
  h.pointer.destroy(); h.flush(); h.pointer.move({ x: 200, y: 200 });
  assert.equal(h.jobs.size, 0); assert.equal(h.paints.length, 1);
});

test('moving between two cards never reactivates the one left behind', () => {
  const first = harness(), second = harness();
  first.pointer.move({ x: 499, y: 200 }); first.flush();
  first.pointer.move({ x: 500, y: 200 }); first.pointer.reset();
  second.pointer.move({ x: 101, y: 200 }); first.flush(); second.flush();
  assert.equal(first.resets(), 1); assert.equal(first.paints.length, 1);
  assert.equal(second.paints.length, 1);
  first.pointer.destroy(); second.pointer.destroy();
});
