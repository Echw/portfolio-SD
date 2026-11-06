import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardTilt } from '../src/scripts/card-light.ts';

test('the center is neutral and opposite edges tilt in opposite directions', () => {
  assert.deepEqual(cardTilt(.5, .5), { x: 0, y: 0 });
  assert.deepEqual(cardTilt(0, 0), { x: 3, y: -3 });
  assert.deepEqual(cardTilt(1, 1), { x: -3, y: 3 });
});

test('leaving the bounds never exceeds three degrees and invalid geometry stays neutral', () => {
  assert.deepEqual(cardTilt(-100, 100), { x: -3, y: -3 });
  assert.deepEqual(cardTilt(Number.NaN, Infinity), { x: 0, y: 0 });
});
