import type { State } from "./game";
export const DAY_SECONDS = 300,
  NIGHT_SECONDS = 120,
  MAX_HP = 10;
export type NightState = { elapsed: number; hp: number };
export function nightState(s: State): NightState {
  return (s.night ??= { elapsed: 0, hp: MAX_HP });
}
export function isNight(s: State) {
  return (s.night?.elapsed ?? 0) >= DAY_SECONDS;
}
export function validNight(value: unknown) {
  if (value === undefined) return true;
  if (!value || typeof value !== "object") return false;
  const n = value as NightState;
  return (
    Number.isFinite(n.elapsed) &&
    n.elapsed >= 0 &&
    n.elapsed < DAY_SECONDS + NIGHT_SECONDS &&
    Number.isInteger(n.hp) &&
    n.hp >= 0 &&
    n.hp <= MAX_HP
  );
}
export function tickNight(s: State, dt: number): "sunset" | "dawn" | undefined {
  if (!s.awake || !Number.isFinite(dt) || dt <= 0) return;
  const n = nightState(s),
    before = isNight(s);
  n.elapsed += dt;
  if (n.elapsed >= DAY_SECONDS + NIGHT_SECONDS) {
    n.elapsed = 0;
    return "dawn";
  }
  if (!before && isNight(s)) return "sunset";
}
export function morning(s: State) {
  s.night = { elapsed: 0, hp: MAX_HP };
}
export type EnemyKind = "wallet" | "cow";
export const monsterStats = {
  wallet: { hp: 2, damage: 2, dollars: 3 },
  cow: { hp: 5, damage: 5, dollars: 6 },
} as const;
export type Enemy = {
  id: number;
  kind: EnemyKind;
  x: number;
  z: number;
  hp: number;
  age: number;
  phase: "chase" | "windup" | "charge" | "rest";
  timer: number;
  dx: number;
  dz: number;
};
export type Bill = {
  id: number;
  x: number;
  z: number;
  dx: number;
  dz: number;
  age: number;
};
export type Loot = { id: number; x: number; z: number; dollars: number };
const distanceToSegment = (
  x: number,
  z: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
) => {
  const dx = bx - ax,
    dz = bz - az,
    t = Math.max(
      0,
      Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)),
    );
  return Math.hypot(x - ax - t * dx, z - az - t * dz);
};
/** Bounded transient actors; only clock, health and actual money changes are saved. */
export class NightCombat {
  enemies: Enemy[] = [];
  bills: Bill[] = [];
  loot: Loot[] = [];
  cooldown = 0;
  hurtFor = 0;
  spawnIn = 1.5;
  private nextId = 1;
  private spawnCount = 0;
  reset() {
    this.enemies.length = this.bills.length = this.loot.length = 0;
    this.cooldown = this.hurtFor = 0;
    this.spawnIn = 1.5;
    this.spawnCount = 0;
  }
  spawn(kind: EnemyKind, x: number, z: number) {
    if (this.enemies.length >= 8) return;
    const e: Enemy = {
      id: this.nextId++,
      kind,
      x,
      z,
      hp: monsterStats[kind].hp,
      age: 0,
      phase: kind === "wallet" ? "chase" : "windup",
      timer: 0.9,
      dx: 0,
      dz: -1,
    };
    this.enemies.push(e);
    return e;
  }
  throwBill(s: State, dx: number, dz: number) {
    if (
      !isNight(s) ||
      !s.awake ||
      s.cash < 100 ||
      this.cooldown > 0 ||
      this.bills.length >= 16
    )
      return false;
    const length = Math.hypot(dx, dz);
    if (!Number.isFinite(length) || length < 0.001) return false;
    s.cash -= 100;
    this.cooldown = 0.25;
    this.bills.push({
      id: this.nextId++,
      x: s.position.x,
      z: s.position.z,
      dx: dx / length,
      dz: dz / length,
      age: 0,
    });
    return true;
  }
  update(
    s: State,
    dt: number,
    safe: boolean,
    blocked: (x: number, z: number) => boolean,
    bulletBlocked = blocked,
  ) {
    if (!Number.isFinite(dt) || dt <= 0) return { died: false, collected: 0 };
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.hurtFor = Math.max(0, this.hurtFor - dt);
    let collected = 0;
    for (let i = this.bills.length - 1; i >= 0; i--) {
      const b = this.bills[i],
        ax = b.x,
        az = b.z;
      b.age += dt;
      // Small collision steps keep fast bills from passing through walls.
      const steps = Math.max(1, Math.ceil((18 * dt) / 0.25));
      let stopped = false;
      for (let step = 0; step < steps; step++) {
        const x = b.x + (b.dx * 18 * dt) / steps,
          z = b.z + (b.dz * 18 * dt) / steps;
        if (bulletBlocked(x, z)) {
          stopped = true;
          break;
        }
        b.x = x;
        b.z = z;
        const target = this.enemies.find(
          (e) =>
            distanceToSegment(e.x, e.z, ax, az, b.x, b.z) <
            (e.kind === "cow" ? 0.85 : 0.6),
        );
        if (target) {
          target.hp--;
          stopped = true;
          if (target.hp <= 0) {
            if (this.loot.length >= 16) this.loot.shift();
            this.loot.push({
              id: this.nextId++,
              x: target.x,
              z: target.z,
              dollars: monsterStats[target.kind].dollars,
            });
            this.enemies.splice(this.enemies.indexOf(target), 1);
          }
          break;
        }
      }
      if (stopped || b.age >= 1.8) this.bills.splice(i, 1);
    }
    for (const e of this.enemies) {
      e.age += dt;
      const dx = s.position.x - e.x,
        dz = s.position.z - e.z,
        d = Math.hypot(dx, dz) || 1;
      if (safe) continue;
      let speed = 0;
      if (e.kind === "wallet") {
        e.dx = dx / d;
        e.dz = dz / d;
        speed = 2.2;
      } else {
        e.timer -= dt;
        if (e.phase === "windup") {
          e.dx = dx / d;
          e.dz = dz / d;
          if (e.timer <= 0) {
            e.phase = "charge";
            e.timer = 2.1;
          }
        } else if (e.phase === "charge") {
          speed = 8;
          if (e.timer <= 0) {
            e.phase = "rest";
            e.timer = 1.2;
            speed = 0;
          }
        } else if (e.timer <= 0) {
          e.phase = "windup";
          e.timer = 0.9;
        }
      }
      const oldX = e.x,
        oldZ = e.z;
      const steps = Math.max(1, Math.ceil((speed * dt) / 0.2));
      for (let step = 0; step < steps; step++) {
        const x = e.x + (e.dx * speed * dt) / steps,
          z = e.z + (e.dz * speed * dt) / steps;
        if (blocked(x, z)) {
          if (e.kind === "cow") {
            e.phase = "rest";
            e.timer = 1.2;
          }
          break;
        }
        e.x = x;
        e.z = z;
      }
      if (
        this.hurtFor <= 0 &&
        (e.kind === "wallet" || e.phase === "charge") &&
        distanceToSegment(s.position.x, s.position.z, oldX, oldZ, e.x, e.z) <
          (e.kind === "cow" ? 1.1 : 0.85)
      ) {
        const n = nightState(s);
        n.hp = Math.max(0, n.hp - monsterStats[e.kind].damage);
        this.hurtFor = 1;
      }
    }
    for (let i = this.loot.length - 1; i >= 0; i--) {
      const drop = this.loot[i];
      if (Math.hypot(drop.x - s.position.x, drop.z - s.position.z) < 1.2) {
        const cents = drop.dollars * 100;
        s.cash += cents;
        s.totalEarned = (s.totalEarned ?? 0) + cents;
        collected += cents;
        this.loot.splice(i, 1);
      }
    }
    for (let i = this.enemies.length - 1; i >= 0; i--)
      if (
        Math.hypot(
          this.enemies[i].x - s.position.x,
          this.enemies[i].z - s.position.z,
        ) >= 45
      )
        this.enemies.splice(i, 1);
    this.spawnIn -= dt;
    if (!safe && this.spawnIn <= 0) {
      this.spawnIn = 5;
      for (let attempt = 0; attempt < 24; attempt++) {
        const angle = this.spawnCount * 2.399 + attempt * 0.71,
          radius = 11 + (attempt % 3) * 1.5,
          x = s.position.x + Math.sin(angle) * radius,
          z = s.position.z + Math.cos(angle) * radius;
        if (!blocked(x, z)) {
          this.spawn(this.spawnCount % 3 === 2 ? "cow" : "wallet", x, z);
          this.spawnCount++;
          break;
        }
      }
    }
    return { died: nightState(s).hp <= 0, collected };
  }
}
