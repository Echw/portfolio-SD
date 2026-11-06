export interface TypewriterClock {
  now(): number;
  schedule(callback: () => void, delay: number): unknown;
  cancel(handle: unknown): void;
}
type Phase = 'entry' | 'typing' | 'linePause' | 'hold' | 'deleting' | 'emptyPause';
type Gate = 'offscreen' | 'document' | 'user';
export interface TypewriterState {
  index: number;
  lines: [string, string];
  cursorRow: number;
  phase: Phase;
  blocked: boolean;
  userPaused: boolean;
}
interface Options {
  headlines: { lines: [string, string] }[];
  clock: TypewriterClock;
  entryDelay?: number;
  render(state: TypewriterState): void;
  error?(error: unknown): void;
}

/** A single clock retains both the current character and remaining delay across pause gates. */
export function createTypewriterController(options: Options) {
  const headlines = options.headlines.map(({ lines }) => lines.map((line) => Array.from(line)));
  const gates = new Set<Gate>(['offscreen']);
  let index = 0;
  let row = 0;
  let lengths = [0, 0];
  let phase: Phase = options.entryDelay ? 'entry' : 'typing';
  let remaining = options.entryDelay || 70;
  let deadline = 0;
  let timer: unknown;
  let disposed = false;
  const state = (): TypewriterState => ({
    index, lines: [headlines[index]?.[0].slice(0, lengths[0]).join('') ?? '', headlines[index]?.[1].slice(0, lengths[1]).join('') ?? ''],
    cursorRow: row, phase, blocked: gates.size > 0, userPaused: gates.has('user'),
  });
  const cancel = () => {
    if (timer !== undefined) {
      remaining = Math.max(0, deadline - options.clock.now());
      options.clock.cancel(timer);
      timer = undefined;
    }
  };
  const fail = (error: unknown) => {
    disposed = true;
    cancel();
    options.error?.(error);
  };
  const render = () => {
    try { options.render(state()); } catch (error) { fail(error); }
  };
  const advance = () => {
    if (phase === 'entry') { phase = 'typing'; remaining = 70; }
    else if (phase === 'typing') {
      lengths[row]++;
      remaining = 70;
      if (lengths[row] === headlines[index][row].length) {
        phase = row === 0 ? 'linePause' : 'hold';
        remaining = row === 0 ? 180 : 3500;
      }
    } else if (phase === 'linePause') { row = 1; phase = 'typing'; remaining = 70; }
    else if (phase === 'hold' || phase === 'deleting') {
      phase = 'deleting';
      lengths[row]--;
      remaining = 50;
      if (lengths[row] === 0) {
        if (row === 1) row = 0;
        else { phase = 'emptyPause'; remaining = 250; }
      }
    } else {
      index = (index + 1) % headlines.length;
      lengths = [0, 0]; row = 0; phase = 'typing'; remaining = 70;
    }
  };
  const arm = () => {
    if (disposed || gates.size || timer !== undefined || !headlines.length) return;
    deadline = options.clock.now() + remaining;
    timer = options.clock.schedule(() => {
      timer = undefined;
      if (disposed || gates.size) return;
      try { advance(); render(); arm(); } catch (error) { fail(error); }
    }, remaining);
  };
  const gate = (reason: Gate, blocked: boolean) => {
    if (disposed) return;
    if (blocked) { cancel(); gates.add(reason); }
    else gates.delete(reason);
    render(); arm();
  };
  render();
  return {
    state,
    setVisible: (visible: boolean) => gate('offscreen', !visible),
    setDocumentVisible: (visible: boolean) => gate('document', !visible),
    setPaused: (paused: boolean) => gate('user', paused),
    finishEntry() {
      if (disposed || phase !== 'entry') return;
      cancel(); phase = 'typing'; remaining = 70; render(); arm();
    },
    destroy() { disposed = true; cancel(); },
  };
}
