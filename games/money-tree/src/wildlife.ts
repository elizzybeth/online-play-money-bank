import * as T from "three";

/** Small non-colliding neighbors of the gardens. Perches follow actual trees. */
export function createWildlife(
  scene: T.Scene,
  trees: { x: number; z: number; perchY?: number }[],
  gardens: T.Group[],
  houses: T.Group[],
) {
  const material = (color: string) =>
    new T.MeshStandardMaterial({ color, roughness: 0.85 });
  const part = (
    g: T.Group,
    x: number,
    y: number,
    z: number,
    r: number,
    color: string,
    sx = 1,
    sy = 1,
    sz = 1,
  ) => {
    const mesh = new T.Mesh(new T.SphereGeometry(r, 8, 6), material(color));
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    g.add(mesh);
    return mesh;
  };
  const birds = Array.from({ length: 10 }, (_, i) => {
    const g = new T.Group();
    g.name = "garden-bird";
    scene.add(g);
    const color = ["#748fa8", "#a9886e", "#716f62"][i % 3];
    part(g, 0, 0, 0, 0.14, color, 1, 1, 1.5);
    part(g, 0, 0.12, -0.13, 0.095, color);
    part(g, 0, 0.16, -0.21, 0.04, "#e7bd6a", 0.6, 0.5, 1.7);
    part(
      g,
      0,
      -0.025,
      -0.07,
      0.1,
      i % 3 === 1 ? "#cc896a" : "#dbd2b8",
      0.85,
      1,
      1,
    );
    for (const side of [-1, 1])
      part(g, side * 0.045, 0.16, -0.19, 0.012, "#303938");
    const wings = [-1, 1].map((side) =>
      part(g, side * 0.14, 0.02, 0, 0.12, color, 1.5, 0.25, 1.2),
    );
    part(g, 0, 0.015, 0.2, 0.09, color, 0.7, 0.3, 2);
    return { object: g, wings, state: "perched", perch: "tree" };
  });
  const butterflies = Array.from({ length: 20 }, (_, i) => {
    const g = new T.Group();
    g.name = "garden-butterfly";
    scene.add(g);
    part(g, 0, 0, 0, 0.035, "#554c46", 0.5, 1, 2);
    const color = ["#e2a14d", "#87abd6", "#e8d56d", "#bb8cbd"][i % 4];
    const wings = [-1, 1].map((side) => {
      const wing = new T.Group();
      g.add(wing);
      part(wing, side * 0.09, 0, -0.04, 0.09, color, 1, 0.18, 1.2);
      part(wing, side * 0.065, 0, 0.08, 0.065, color, 1, 0.18, 1);
      part(wing, side * 0.085, 0.012, -0.035, 0.026, "#f4ead2", 1, 0.15, 1);
      return wing;
    });
    return { object: g, wings, garden: i % gardens.length };
  });
  function update(time: number) {
    birds.forEach((bird, i) => {
      const cycle = Math.floor((time + i * 2) / 18),
        phase = (time + i * 2) % 18;
      const perch = (n: number) => {
        const visible = houses.filter((h) => h.visible);
        if (i % 2 === 0 && visible.length) {
          const h = visible[(n + i) % visible.length];
          return {
            point: h.position.clone().add(new T.Vector3(0, -0.15, 0.23)),
            kind: "birdhouse",
          };
        }
        const t = trees[(n * 3 + i * 5) % trees.length];
        return {
          point: new T.Vector3(t.x, t.perchY ?? 3.1, t.z),
          kind: "tree",
        };
      };
      const a = perch(cycle),
        b = perch(cycle + 1),
        t = Math.min(1, phase / 6);
      bird.object.position.copy(a.point).lerp(b.point, t);
      bird.object.position.y +=
        Math.sin(t * Math.PI) * (3 + a.point.distanceTo(b.point) * 0.08);
      bird.state = t < 1 ? "flying" : "perched";
      bird.perch = b.kind;
      bird.object.rotation.y =
        Math.atan2(b.point.x - a.point.x, b.point.z - a.point.z) + Math.PI;
      bird.wings.forEach(
        (w, j) =>
          (w.rotation.z =
            (j ? 1 : -1) * (t < 1 ? Math.sin(time * 23) * 0.8 : 0.15)),
      );
    });
    butterflies.forEach((butterfly, i) => {
      const garden = gardens[butterfly.garden],
        a = time * 0.6 + i * 2.4;
      butterfly.object.position.set(
        garden.position.x + Math.sin(a) * 0.8,
        0.65 + Math.sin(a * 1.7) * 0.25,
        garden.position.z + Math.cos(a * 0.8) * 0.55,
      );
      butterfly.object.rotation.y = -a;
      butterfly.wings.forEach(
        (w, j) =>
          (w.rotation.z = (j ? 1 : -1) * (0.3 + Math.sin(time * 15 + i) * 0.6)),
      );
    });
  }
  update(0);
  return { birds, butterflies, update };
}
