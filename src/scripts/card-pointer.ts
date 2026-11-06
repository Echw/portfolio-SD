import { cardTilt } from './card-light.ts';

interface Point { x: number; y: number }
interface Bounds { left: number; top: number; width: number; height: number }
interface PointerOptions {
  bounds(): Bounds;
  ready(): boolean;
  ownsPoint(point: Point): boolean;
  request(callback: () => void): number;
  cancel(frame: number): void;
  paint(x: number, y: number, tilt: { x: number; y: number }): void;
  reset(): void;
}

/** A pending frame cannot relight a card after leave/cancel, including during scroll. */
export function createCardPointer(options: PointerOptions) {
  let point: Point | undefined;
  let frame: number | undefined;
  let active = false;
  let disposed = false;
  const neutral = () => {
    if (frame !== undefined) options.cancel(frame);
    frame = undefined;
    if (active) options.reset();
    active = false;
  };
  const paint = () => {
    frame = undefined;
    if (disposed || !point) return;
    const bounds = options.bounds();
    const x = point.x - bounds.left, y = point.y - bounds.top;
    if (bounds.width <= 0 || bounds.height <= 0 || x < 0 || x > bounds.width || y < 0 || y > bounds.height || !options.ownsPoint(point)) {
      point = undefined; neutral(); return;
    }
    if (!options.ready()) { neutral(); return; }
    active = true;
    options.paint(x, y, cardTilt(x / bounds.width, y / bounds.height));
  };
  const refresh = () => {
    if (!disposed && point && frame === undefined) frame = options.request(paint);
  };
  return {
    move(next: Point) { if (!disposed) { point = next; refresh(); } },
    refresh,
    reset() { point = undefined; neutral(); },
    destroy() { disposed = true; point = undefined; neutral(); },
  };
}
