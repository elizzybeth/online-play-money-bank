import * as T from "three";
import { bikeFeatures, type BikeId } from "./bikes";
type Particle = {
  object: T.Object3D;
  velocity: T.Vector3;
  life: number;
  total: number;
  kind: BikeId;
};
export function createBikeFeatures(scene: T.Scene) {
  const root = new T.Group();
  root.name = "bicycle-special-effects";
  scene.add(root);
  const particles: Particle[] = [];
  const cooldowns = new Map<BikeId, number>();
  const sphere = new T.SphereGeometry(1, 8, 6),
    paper = new T.PlaneGeometry(0.09, 0.16),
    torus = new T.TorusGeometry(0.07, 0.018, 5, 12);
  let active: BikeId | undefined,
    remaining = 0,
    emission = 0,
    uses = 0,
    sequence = 1;
  const random = () => {
    sequence = (Math.imul(sequence, 1664525) + 1013904223) >>> 0;
    return sequence / 4294967296;
  };
  function emit(id: BikeId, position: T.Vector3, yaw: number, height: number) {
    if (particles.length >= 140) return;
    const object = new T.Group();
    const palette = ["#ed5d93", "#ffcd48", "#69c4c6", "#9874d0", "#fbecc9"];
    const material = new T.MeshBasicMaterial({
      color: palette[Math.floor(random() * palette.length)],
      side: T.DoubleSide,
    });
    const forward = new T.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    object.position
      .copy(position)
      .addScaledVector(forward, id === "cruiser" ? -1.5 : 2.4);
    object.position.y += height;
    const velocity = new T.Vector3(
      (random() - 0.5) * 2,
      random() * 1.8 + 0.4,
      (random() - 0.5) * 2,
    );
    let life = 3;
    if (id === "tassels" || id === "road") {
      if (id === "road") material.color.set("#ffb43b");
      object.add(new T.Mesh(paper, material));
      object.rotation.set(random() * 3, random() * 3, random() * 3);
      velocity.addScaledVector(forward, id === "road" ? -2 : 1.8);
    } else if (id === "penny") {
      material.color.set("#bbf2ee");
      material.transparent = true;
      material.opacity = 0.42;
      material.depthWrite = false;
      const bubble = new T.Mesh(sphere, material);
      bubble.scale.setScalar(0.08 + random() * 0.14);
      object.add(bubble);
      velocity.multiplyScalar(0.35);
      life = 5;
    } else if (id === "cruiser") {
      object.position.y = position.y + 0.055;
      velocity.set(0, 0, 0);
      life = 6;
      const center = new T.Mesh(
        sphere,
        new T.MeshBasicMaterial({ color: "#ffce52" }),
      );
      center.scale.set(0.065, 0.03, 0.065);
      object.add(center);
      for (let j = 0; j < 5; j++) {
        const petal = new T.Mesh(sphere, material);
        petal.position.set(
          Math.sin((j * Math.PI * 2) / 5) * 0.09,
          0,
          Math.cos((j * Math.PI * 2) / 5) * 0.09,
        );
        petal.scale.set(0.07, 0.02, 0.07);
        object.add(petal);
      }
    } else if (id === "city") {
      object.add(new T.Mesh(torus, material));
      const stem = new T.Mesh(new T.BoxGeometry(0.026, 0.2, 0.025), material);
      stem.position.set(0.065, 0.09, 0);
      object.add(stem);
      life = 5;
      const angle = random() * Math.PI * 2;
      velocity.set(
        Math.cos(angle) * (0.6 + random() * 1.3),
        0.5 + random() * 1.3,
        Math.sin(angle) * (0.6 + random() * 1.3),
      );
    } else if (id === "mountain") {
      material.color.set("#edff8b");
      const light = new T.Mesh(sphere, material);
      light.scale.setScalar(0.045);
      object.add(light);
      velocity.multiplyScalar(0.3);
      life = 2;
    }
    root.add(object);
    particles.push({ object, velocity, life, total: life, kind: id });
  }
  function clear() {
    for (const p of particles) {
      p.object.removeFromParent();
      p.object.traverse((o) => {
        if (o instanceof T.Mesh) {
          (o.material as T.Material).dispose();
          if (
            o.geometry !== sphere &&
            o.geometry !== paper &&
            o.geometry !== torus
          )
            o.geometry.dispose();
        }
      });
    }
    particles.length = 0;
    active = undefined;
    remaining = 0;
    cooldowns.clear();
  }
  return {
    activate(id: BikeId, position: T.Vector3, yaw: number, height: number) {
      if ((cooldowns.get(id) ?? 0) > 0) return false;
      active = id;
      remaining = bikeFeatures[id].duration;
      cooldowns.set(id, bikeFeatures[id].cooldown);
      emission = 0;
      uses++;
      if (id === "tassels")
        for (let i = 0; i < 50; i++) emit(id, position, yaw, height);
      if (id === "city")
        for (let i = 0; i < 24; i++) emit(id, position, yaw, height);
      return true;
    },
    update(
      dt: number,
      position: T.Vector3,
      yaw: number,
      height: number,
      riding: boolean,
    ) {
      for (const [id, t] of cooldowns) cooldowns.set(id, Math.max(0, t - dt));
      if (!riding) {
        active = undefined;
        remaining = 0;
      }
      if (active) {
        remaining = Math.max(0, remaining - dt);
        emission += dt;
        if (emission >= 0.1) {
          emission = 0;
          if (["penny", "cruiser", "mountain", "road", "city"].includes(active))
            for (
              let i = 0;
              i < (active === "mountain" || active === "city" ? 4 : 2);
              i++
            )
              emit(active, position, yaw, height);
        }
        if (remaining === 0) active = undefined;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        p.object.position.addScaledVector(p.velocity, dt);
        if (p.kind === "tassels" || p.kind === "road") {
          p.velocity.y -= dt * 0.8;
          p.object.rotation.x += dt * 2;
          p.object.rotation.z += dt;
        }
        p.object.scale.setScalar(Math.min(1, Math.max(0, p.life) / 0.6));
        if (p.life <= 0) {
          p.object.removeFromParent();
          p.object.traverse((o) => {
            if (o instanceof T.Mesh) {
              (o.material as T.Material).dispose();
              if (
                o.geometry !== sphere &&
                o.geometry !== paper &&
                o.geometry !== torus
              )
                o.geometry.dispose();
            }
          });
          particles.splice(i, 1);
        }
      }
    },
    cooldown(id: BikeId) {
      return cooldowns.get(id) ?? 0;
    },
    cancel() {
      active = undefined;
      remaining = 0;
    },
    reset: clear,
    get active() {
      return active;
    },
    get remaining() {
      return remaining;
    },
    get uses() {
      return uses;
    },
    get particles() {
      return particles.length;
    },
    get speedMultiplier() {
      return active === "road" ? 1.5 : 1;
    },
    get lift() {
      return active === "bmx" ? Math.sin(Math.PI * (1 - remaining)) * 0.7 : 0;
    },
  };
}
