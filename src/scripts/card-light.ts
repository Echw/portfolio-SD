/** Pointer fractions stay bounded even when a pointer leaves the card between frames. */
export function cardTilt(x: number, y: number): { x: number; y: number } {
  const unit = (value: number) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : .5;
  return { x: (.5 - unit(y)) * 6, y: (unit(x) - .5) * 6 };
}
