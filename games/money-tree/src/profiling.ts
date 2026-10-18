/** Opt-in bounded diagnostics: no samples, marks or scene traversal in ordinary play. */
const enabled = new URLSearchParams(location.search).has("profile");
type Summary = { count: number; totalMs: number; maxMs: number };
const timings = new Map<string, Summary>(),
  counters = new Map<string, number>();
export const profiling = {
  enabled,
  start: () => (enabled ? performance.now() : 0),
  end(name: string, start: number) {
    if (!enabled) return;
    const ms = performance.now() - start;
    const s = timings.get(name) ?? { count: 0, totalMs: 0, maxMs: 0 };
    s.count++;
    s.totalMs += ms;
    s.maxMs = Math.max(s.maxMs, ms);
    timings.set(name, s);
  },
  count(name: string, n = 1) {
    if (enabled) counters.set(name, (counters.get(name) ?? 0) + n);
  },
  reset() {
    timings.clear();
    counters.clear();
  },
  snapshot() {
    return {
      timings: Object.fromEntries(
        [...timings].map(([key, s]) => [
          key,
          { ...s, meanMs: s.totalMs / s.count },
        ]),
      ),
      counters: Object.fromEntries(counters),
    };
  },
};
