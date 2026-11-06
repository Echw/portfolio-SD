export interface BackdropPoint {
  x: number;
  y: number;
  offset: number;
  velocity: number;
  heat: number;
  target: number;
  targetHeat: number;
}

const RADIUS = 180;
const LIMIT = 24;
const DECAY = 9;
const SPRING = 22;

/** Viewport-space geometry: document scroll never enters the model. */
export function createBackdropField(width: number, height: number, compact = false) {
  const count = compact ? 12 : Math.min(36, Math.max(18, Math.round(width / 52)));
  const samples = Math.min(32, Math.max(10, Math.ceil(height / 40) + 1));
  const lines: BackdropPoint[][] = Array.from({ length: count }, (_, column) => {
    const origin = (column + .5) * width / count;
    return Array.from({ length: samples }, (_, row) => {
      const t = row / (samples - 1);
      const bend = Math.sin(t * Math.PI * 2 + column * .61) * 3.5 + Math.sin(t * Math.PI) * 2;
      return { x: origin + bend, y: -24 + t * (height + 48), offset: 0, velocity: 0, heat: 0, target: 0, targetHeat: 0 };
    });
  });
  let activity = 0;
  const reset = () => {
    activity = 0;
    lines.forEach((line) => line.forEach((point) => {
      point.offset = point.velocity = point.heat = point.target = point.targetHeat = 0;
    }));
  };
  return {
    lines,
    reset,
    disturb(x: number, y: number, movementX = 0) {
      let affected = false;
      lines.forEach((line) => line.forEach((point) => {
        const dx = point.x - x, dy = point.y - y;
        const distance = Math.hypot(dx, dy);
        const influence = Math.max(0, 1 - distance / RADIUS);
        const falloff = influence * influence;
        const direction = Math.abs(dx) > 2 ? Math.sign(dx) : Math.sign(movementX) || 1;
        point.target = direction * LIMIT * falloff;
        point.targetHeat = .30 * falloff;
        if (falloff > .001) affected = true;
      }));
      if (affected) activity = 1;
      return affected;
    },
    step(deltaSeconds: number) {
      const elapsed = Math.min(.05, Math.max(0, deltaSeconds));
      const steps = Math.max(1, Math.ceil(elapsed * 60));
      const dt = elapsed / steps;
      for (let step = 0; step < steps; step++) {
        const middleActivity = activity * Math.exp(-DECAY * dt * .5);
        activity *= Math.exp(-DECAY * dt);
        const damping = Math.exp(-SPRING * dt);
        lines.forEach((line) => line.forEach((point) => {
          const goal = point.target * middleActivity;
          const difference = point.offset - goal;
          const impulse = (point.velocity + SPRING * difference) * dt;
          const offset = goal + (difference + impulse) * damping;
          point.velocity = (point.velocity - SPRING * impulse) * damping;
          point.offset = Math.max(-LIMIT, Math.min(LIMIT, offset));
          if (Math.abs(offset) > LIMIT) point.velocity = 0;
          point.heat = point.targetHeat * activity;
        }));
      }
      const moving = lines.some((line) => line.some((point) => Math.abs(point.offset) > .025 || Math.abs(point.velocity) > .06 || point.heat > .002));
      if (!moving && activity < .002) { reset(); return false; }
      return true;
    },
  };
}
