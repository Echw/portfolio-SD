interface HoldOptions {
  block(): void;
  unblock(): void;
  schedule(callback: () => void, delay: number): unknown;
  cancel(timer: unknown): void;
}

/** Overlapping card entrances share one bounded lock and release it after the last front is visible. */
export function createScrollHold(options: HoldOptions) {
  const holders = new Map<symbol, () => void>();
  let timeout: unknown;
  let blocked = false;
  let destroyed = false;
  const unlock = () => {
    if (timeout !== undefined) options.cancel(timeout);
    timeout = undefined;
    if (blocked) { blocked = false; options.unblock(); }
  };
  const interrupt = () => {
    const callbacks = [...holders.values()];
    holders.clear();
    try {
      callbacks.forEach((finish) => { try { finish(); } catch (error) { console.error('Unable to finish project entrance.', error); } });
    } finally { unlock(); }
  };
  return {
    active: () => blocked,
    acquire(finish: () => void): () => void {
      if (destroyed) return () => {};
      const token = Symbol('project-entrance');
      holders.set(token, finish);
      if (!blocked) {
        blocked = true;
        try {
          options.block();
          timeout = options.schedule(interrupt, 3500);
        } catch (error) { interrupt(); throw error; }
      }
      return () => {
        if (!holders.delete(token)) return;
        if (!holders.size) unlock();
      };
    },
    interrupt,
    destroy() { destroyed = true; interrupt(); },
  };
}
