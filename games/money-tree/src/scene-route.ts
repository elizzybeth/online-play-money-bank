import { blocked, type Rect } from "./game";
export type Point = { x: number; z: number };
export function routeLength(route: Point[]) {
  return route
    .slice(1)
    .reduce(
      (sum, p, i) => sum + Math.hypot(p.x - route[i].x, p.z - route[i].z),
      0,
    );
}
export function alongRoute(route: Point[], fraction: number): Point {
  let remaining = Math.max(0, Math.min(1, fraction)) * routeLength(route);
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1],
      b = route[i],
      length = Math.hypot(b.x - a.x, b.z - a.z);
    if (remaining <= length && length > 0)
      return {
        x: a.x + ((b.x - a.x) * remaining) / length,
        z: a.z + ((b.z - a.z) * remaining) / length,
      };
    remaining -= length;
  }
  return { ...route.at(-1)! };
}
// Grid routes follow the same solid furniture and walls as ordinary walking.
export function sceneRoute(start: Point, end: Point, rects: Rect[]): Point[] {
  const step = 0.4,
    key = (x: number, z: number) => `${x},${z}`;
  const source = {
    x: Math.round(start.x / step),
    z: Math.round(start.z / step),
  };
  const goal = { x: Math.round(end.x / step), z: Math.round(end.z / step) };
  const clearLine = (a: Point, b: Point) => {
    const count = Math.max(
      1,
      Math.ceil(Math.hypot(a.x - b.x, a.z - b.z) / 0.1),
    );
    for (let i = 0; i <= count; i++)
      if (
        blocked(
          a.x + ((b.x - a.x) * i) / count,
          a.z + ((b.z - a.z) * i) / count,
          rects,
          0.48,
        )
      )
        return false;
    return true;
  };
  const first = { x: source.x * step, z: source.z * step },
    last = { x: goal.x * step, z: goal.z * step };
  if (!clearLine(start, first) || !clearLine(last, end)) return [];
  const queue = [source],
    previous = new Map<string, string | null>([
      [key(source.x, source.z), null],
    ]);
  let found = false;
  for (let head = 0; head < queue.length && head < 40000; head++) {
    const p = queue[head];
    if (p.x === goal.x && p.z === goal.z) {
      found = true;
      break;
    }
    for (const [dx, dz] of [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]) {
      const x = p.x + dx,
        z = p.z + dz,
        id = key(x, z);
      if (
        x * step < -38 ||
        x * step > 38 ||
        z * step < -39 ||
        z * step > 38 ||
        previous.has(id) ||
        blocked(x * step, z * step, rects, 0.48)
      )
        continue;
      previous.set(id, key(p.x, p.z));
      queue.push({ x, z });
    }
  }
  if (!found) return [];
  const reverse: Point[] = [end];
  let id: string | null = key(goal.x, goal.z);
  while (id) {
    const [x, z] = id.split(",").map(Number);
    reverse.push({ x: x * step, z: z * step });
    id = previous.get(id) ?? null;
  }
  reverse.push(start);
  const raw = reverse.reverse(),
    result = [raw[0]];
  for (let i = 0; i < raw.length - 1;) {
    let next = i + 1;
    while (next + 1 < raw.length && clearLine(raw[i], raw[next + 1])) next++;
    result.push(raw[next]);
    i = next;
  }
  return result;
}
