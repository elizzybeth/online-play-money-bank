export type Point = { x: number; z: number };
export type Wanderer = {
  position: Point;
  home: Point;
  destination?: Point;
  speed: number;
  pause: number;
  seed: number;
  journeys: number;
};
function random(w: Wanderer) {
  w.seed = (Math.imul(w.seed, 1664525) + 1013904223) >>> 0;
  return w.seed / 4294967296;
}
export function stepWanderer(
  w: Wanderer,
  seconds: number,
  allowed: (p: Point) => boolean,
  waiting = false,
  bounds = { minX: 0, maxX: 40, minZ: -86, maxZ: -43 },
) {
  if (waiting || !Number.isFinite(seconds) || seconds <= 0) return false;
  const dt = Math.min(seconds, 0.25);
  if (w.pause > 0) {
    w.pause = Math.max(0, w.pause - dt);
    return false;
  }
  if (!w.destination) {
    for (let i = 0; i < 20; i++) {
      const angle = random(w) * Math.PI * 2,
        distance = 2 + random(w) * 7;
      const p = {
        x: w.position.x + Math.sin(angle) * distance,
        z: w.position.z + Math.cos(angle) * distance,
      };
      if (
        p.x < bounds.minX ||
        p.x > bounds.maxX ||
        p.z < bounds.minZ ||
        p.z > bounds.maxZ ||
        Math.hypot(p.x - w.home.x, p.z - w.home.z) > 12 ||
        !allowed(p)
      )
        continue;
      w.destination = p;
      w.journeys++;
      break;
    }
    if (!w.destination) {
      w.pause = 0.4 + random(w);
      return false;
    }
  }
  const dx = w.destination.x - w.position.x,
    dz = w.destination.z - w.position.z;
  const distance = Math.hypot(dx, dz),
    step = Math.min(distance, w.speed * dt);
  if (distance < 0.15) {
    w.destination = undefined;
    w.pause = 0.5 + random(w) * 3;
    return false;
  }
  const p = {
    x: w.position.x + (dx / distance) * step,
    z: w.position.z + (dz / distance) * step,
  };
  if (!allowed(p)) {
    w.destination = undefined;
    w.pause = 0.2 + random(w) * 0.6;
    return false;
  }
  w.position = p;
  return true;
}
