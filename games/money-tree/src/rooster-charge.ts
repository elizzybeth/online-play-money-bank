export type Point = { x: number; z: number };
export function createRoosterCharge() {
  let cooldown = 8,
    elapsed = 0,
    phase: "idle" | "charge" | "kick" = "idle",
    wasInFront = false,
    seed = 7439,
    kicks = 0;
  return {
    get phase() {
      return phase;
    },
    get kicks() {
      return kicks;
    },
    update(
      dt: number,
      rooster: Point,
      heading: number,
      player: Point,
      playerHeading: number,
      moving: boolean,
      allowed: (p: Point) => boolean,
      enabled = true,
    ) {
      cooldown = Math.max(0, cooldown - dt);
      const dx = player.x - rooster.x,
        dz = player.z - rooster.z,
        d = Math.hypot(dx, dz);
      const inFront =
        d > 1 &&
        d < 4.5 &&
        (dx * Math.sin(heading) + dz * Math.cos(heading)) / d > 0.5;
      if (!enabled) {
        phase = "idle";
        elapsed = 0;
        wasInFront = inFront;
        return { position: rooster, heading, lift: 0, kick: 0 };
      }
      if (
        phase === "idle" &&
        inFront &&
        !wasInFront &&
        moving &&
        cooldown === 0
      ) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        cooldown = 24;
        if (seed / 4294967296 < 0.42) {
          phase = "charge";
          elapsed = 0;
        }
      }
      wasInFront = inFront;
      let position = { ...rooster },
        lift = 0,
        kick = 0;
      if (phase === "charge") {
        elapsed += dt;
        const goal = {
          x: player.x - Math.sin(playerHeading) * 0.65,
          z: player.z - Math.cos(playerHeading) * 0.65,
        };
        const gx = goal.x - rooster.x,
          gz = goal.z - rooster.z,
          dist = Math.hypot(gx, gz),
          step = Math.min(dist, dt * 6.4);
        heading = Math.atan2(gx, gz);
        const next = {
          x: rooster.x + Math.sin(heading) * step,
          z: rooster.z + Math.cos(heading) * step,
        };
        if (allowed(next)) position = next;
        else {
          phase = "idle";
          elapsed = 0;
        }
        if (dist < 0.18) {
          phase = "kick";
          elapsed = 0;
          kicks++;
        } else if (elapsed > 2.5 || d > 7) {
          phase = "idle";
          elapsed = 0;
        }
      } else if (phase === "kick") {
        elapsed += dt;
        lift = Math.sin(Math.min(1, elapsed / 0.65) * Math.PI) * 0.38;
        kick = Math.sin(Math.min(1, elapsed / 0.65) * Math.PI);
        if (elapsed >= 0.65) {
          phase = "idle";
          elapsed = 0;
        }
      }
      return { position, heading, lift, kick };
    },
  };
}
