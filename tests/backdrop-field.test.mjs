import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBackdropField } from '../src/scripts/backdrop-field.ts';

test('viewport geometry is deterministic and bounded on desktop and touch', () => {
  for (const [width, height] of [[1024, 720], [1536, 1024], [3840, 2160]]) {
    const first = createBackdropField(width, height), second = createBackdropField(width, height);
    assert.ok(first.lines.length >= 18 && first.lines.length <= 36);
    assert.ok(first.lines.every((line) => line.length <= 32));
    assert.deepEqual(first.lines, second.lines);
    assert.equal(first.step(1 / 60), false);
  }
  assert.equal(createBackdropField(390, 844, true).lines.length, 12);
});

test('mouse disturbance is local and settles to exact rest without continued pointer input', () => {
  const field = createBackdropField(1536, 900);
  field.disturb(400, 350, 10);
  field.step(1 / 60);
  const affected = field.lines.flat().filter((point) => Math.abs(point.offset) > 0);
  assert.ok(affected.length > 0);
  assert.ok(affected.every((point) => Math.hypot(point.x - 400, point.y - 350) < 180));
  assert.ok(field.lines.flat().some((point) => point.heat > 0));
  let moving = true, elapsed = 1 / 60;
  while (moving && elapsed < 2) { moving = field.step(1 / 60); elapsed += 1 / 60; }
  assert.equal(moving, false); assert.ok(elapsed < 1.2);
  assert.ok(field.lines.flat().every((point) => point.offset === 0 && point.velocity === 0 && point.heat === 0));
});

test('fast sweeps and long frames cannot exceed 24px or produce invalid values', () => {
  const field = createBackdropField(1024, 720);
  for (let index = 0; index < 120; index++) {
    field.disturb(200 + Math.sin(index) * 180, 320, index % 2 ? 500 : -500);
    field.step(index % 2 ? 5 : 1 / 120);
    assert.ok(field.lines.flat().every((point) => Number.isFinite(point.offset) && Math.abs(point.offset) <= 24 && point.heat <= .30));
  }
  field.reset(); assert.equal(field.step(0), false);
});

test('spring response remains consistent at 60 and 120Hz', () => {
  const slow = createBackdropField(1440, 900), fast = createBackdropField(1440, 900);
  slow.disturb(500, 400, 10); fast.disturb(500, 400, 10);
  for (let frame = 0; frame < 24; frame++) slow.step(1 / 60);
  for (let frame = 0; frame < 48; frame++) fast.step(1 / 120);
  const a = slow.lines.flat(), b = fast.lines.flat();
  assert.ok(a.every((point, index) => Math.abs(point.offset - b[index].offset) < .05));
});
