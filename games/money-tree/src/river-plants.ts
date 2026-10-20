import * as T from "three";
export type RiverPlant =
  | "fern"
  | "fern-ostrich"
  | "fern-maidenhair"
  | "fern-strap"
  | "fern-silver"
  | "sedge"
  | "rush"
  | "daisy"
  | "heliconia-red"
  | "heliconia-pendant"
  | "heliconia-gold"
  | "heliconia-orange"
  | "passionflower"
  | "moss-rock";
type V = [number, number, number];
class PlantGeometry {
  positions: number[] = [];
  colors: number[] = [];
  palette = new Map<string, T.Color>();
  tri(a: V, b: V, c: V, color: string) {
    let shade = this.palette.get(color);
    if (!shade) {
      shade = new T.Color(color);
      this.palette.set(color, shade);
    }
    for (const p of [a, b, c]) {
      this.positions.push(...p);
      this.colors.push(shade.r, shade.g, shade.b);
    }
  }
  quad(a: V, b: V, c: V, d: V, color: string) {
    this.tri(a, b, c, color);
    this.tri(a, c, d, color);
  }
  tube(a: V, b: V, r: number, color: string, sides = 5) {
    const start = new T.Vector3(...a),
      end = new T.Vector3(...b),
      axis = end.clone().sub(start).normalize();
    const u = new T.Vector3(0, 1, 0);
    if (Math.abs(axis.y) > 0.95) u.set(1, 0, 0);
    u.cross(axis).normalize().multiplyScalar(r);
    const v = new T.Vector3()
      .crossVectors(axis, u)
      .normalize()
      .multiplyScalar(r);
    const point = (p: T.Vector3, i: number) =>
      p
        .clone()
        .addScaledVector(u, Math.cos((i * Math.PI * 2) / sides))
        .addScaledVector(v, Math.sin((i * Math.PI * 2) / sides))
        .toArray() as V;
    for (let i = 0; i < sides; i++)
      this.quad(
        point(start, i),
        point(start, i + 1),
        point(end, i + 1),
        point(end, i),
        color,
      );
  }
  finish(kind: RiverPlant) {
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(this.positions, 3));
    g.setAttribute("color", new T.Float32BufferAttribute(this.colors, 3));
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();
    g.userData.kind = kind;
    return g;
  }
}
function fern(g: PlantGeometry, kind: RiverPlant = "fern") {
  const upright = kind === "fern-ostrich";
  const silver = kind === "fern-silver";
  for (let f = 0; f < 7; f++) {
    const a = (f * Math.PI * 2) / 7 + 0.17,
      dx = Math.cos(a),
      dz = Math.sin(a),
      h = (upright ? 1.45 : 0.75) + (f % 3) * 0.13;
    const p = (t: number): V => [
      dx * t * (upright ? 0.45 : 0.9),
      0.04 + h * Math.sin(t * Math.PI * 0.78),
      dz * t * (upright ? 0.45 : 0.9),
    ];
    for (let n = 0; n < 7; n++) {
      const a = p(n / 7),
        b = p((n + 1) / 7),
        ox = -dz * 0.008,
        oz = dx * 0.008;
      g.quad(
        [a[0] + ox, a[1], a[2] + oz],
        [a[0] - ox, a[1], a[2] - oz],
        [b[0] - ox, b[1], b[2] - oz],
        [b[0] + ox, b[1], b[2] + oz],
        "#88a954",
      );
    }
    for (let n = 1; n < 11; n++) {
      const t = n / 12,
        c = p(t),
        length = 0.24 * Math.sin(Math.PI * t) ** 0.65;
      for (const side of [-1, 1]) {
        const ox = -dz * side,
          oz = dx * side;
        const q = (along: number, out: number, y: number): V => [
          c[0] + dx * along + ox * out,
          c[1] + y,
          c[2] + dz * along + oz * out,
        ];
        const shade =
          (n + f) % 3 === 0
            ? "#78a94d"
            : (n + f) % 3 === 1
              ? "#3c813e"
              : "#579a46";
        const base = q(-0.018, 0, 0),
          edge = q(0.01, length * 0.6, 0.014),
          tip = q(0.11, length, -0.025),
          lower = q(0.065, length * 0.45, -0.018);
        g.tri(base, edge, tip, silver ? "#a9c6b4" : shade);
        g.tri(base, tip, lower, silver ? "#738e91" : shade);
      }
    }
  }
}
function fernFans(g: PlantGeometry) {
  for (let f = 0; f < 7; f++) {
    const a = f * 2.4,
      dx = Math.cos(a),
      dz = Math.sin(a);
    const end: V = [dx * 0.6, 0.5 + (f % 3) * 0.15, dz * 0.6];
    g.tube([0, 0, 0], end, 0.008, "#514537", 3);
    for (let n = 1; n <= 5; n++) {
      const t = n / 6;
      for (const side of [-1, 1]) {
        const x = end[0] * t - dz * side * 0.15,
          z = end[2] * t + dx * side * 0.15;
        const y = end[1] * t;
        for (let j = 0; j < 4; j++) {
          const b = a + side * 1.2 + (j - 2) * 0.3;
          g.tri(
            [x, y, z],
            [x + Math.cos(b) * 0.14, y + 0.035, z + Math.sin(b) * 0.14],
            [
              x + Math.cos(b + 0.3) * 0.14,
              y + 0.035,
              z + Math.sin(b + 0.3) * 0.14,
            ],
            "#70ac63",
          );
        }
      }
    }
  }
}
function fernStraps(g: PlantGeometry) {
  for (let f = 0; f < 9; f++)
    leaf(g, [0, 0.015, 0], 0.85 + (f % 3) * 0.17, 0.11, f * 2.4, "#669648");
}
function fiddleheads(g: PlantGeometry) {
  for (let f = 0; f < 3; f++) {
    const x = (f - 1) * 0.16,
      z = (f % 2) * 0.15;
    g.tube([x, 0, z], [x, 0.85, z], 0.014, "#7d9b50", 4);
    let prev: V = [x, 0.85, z];
    for (let n = 1; n <= 14; n++) {
      const a = (n / 14) * Math.PI * 2,
        r = 0.12 * (1 - n / 18);
      const next: V = [x + Math.sin(a) * r, 0.85 + 0.12 - Math.cos(a) * r, z];
      g.tube(prev, next, 0.015, "#91b364", 4);
      prev = next;
    }
  }
}
function leaf(
  g: PlantGeometry,
  base: V,
  length: number,
  width: number,
  a: number,
  color: string,
) {
  const dx = Math.cos(a),
    dz = Math.sin(a);
  const p = (t: number, side: number): V => [
    base[0] + dx * t * length - dz * side * width * Math.sin(Math.PI * t),
    base[1] +
      Math.sin(t * Math.PI * 0.7) * length * 0.5 -
      Math.abs(side) * 0.025,
    base[2] + dz * t * length + dx * side * width * Math.sin(Math.PI * t),
  ];
  for (let n = 0; n < 7; n++)
    for (const side of [-1, 1]) {
      const t = n / 7,
        u = (n + 1) / 7;
      g.quad(
        p(t, 0),
        p(t, side),
        p(u, side),
        p(u, 0),
        side < 0 ? color : "#4c8846",
      );
    }
  for (let n = 0; n < 7; n++)
    g.tube(p(n / 7, 0), p((n + 1) / 7, 0), 0.006, "#8fa958", 4);
}
function bract(
  g: PlantGeometry,
  base: V,
  length: number,
  side: number,
  color: string,
  tip: string,
) {
  const point = (t: number, edge: number): V => [
    base[0] + side * t * length,
    base[1] + t * t * 0.22 + Math.abs(edge) * 0.08 * Math.sin(Math.PI * t),
    base[2] + edge * 0.14 * Math.sin(Math.PI * t),
  ];
  for (let n = 0; n < 6; n++)
    for (const edge of [-1, 1]) {
      const t = n / 6,
        u = (n + 1) / 6;
      g.quad(
        point(t, 0),
        point(t, edge),
        point(u, edge),
        point(u, 0),
        n >= 4 ? tip : color,
      );
      // Deep keel makes the waxy bract a solid boat-shaped claw, not a flat petal.
      const a = point(t, edge),
        b = point(u, edge),
        c = point(u, 0),
        d = point(t, 0);
      c[1] -= 0.1 * Math.sin(Math.PI * u);
      d[1] -= 0.1 * Math.sin(Math.PI * t);
      g.quad(a, b, c, d, n >= 4 ? "#94ad42" : color);
    }
}
function heliconia(g: PlantGeometry, kind: RiverPlant) {
  const pendant = kind === "heliconia-pendant",
    gold = kind === "heliconia-gold",
    orange = kind === "heliconia-orange";
  for (let n = 0; n < 6; n++) {
    const a = n * 2.4;
    const base: V = [Math.cos(a) * 0.16, 0.32 + n * 0.18, Math.sin(a) * 0.16];
    g.tube([0, 0, 0], base, 0.026, "#527842");
    leaf(
      g,
      base,
      1.05 + (n % 2) * 0.22,
      0.17,
      a,
      n % 2 ? "#285f38" : "#3b7740",
    );
  }
  const height = pendant ? 2.5 : 1.65;
  g.tube([0, 0, 0], [0, height, 0.03], 0.032, "#5d853f");
  if (pendant)
    g.tube([0, height, 0.03], [0.3, height + 0.13, 0.05], 0.025, "#ae3d43");
  const count = pendant ? 12 : gold || orange ? 5 : 7;
  for (let n = 0; n < count; n++) {
    const y = pendant ? height + 0.1 - n * 0.17 : 1.15 + n * 0.18;
    const base: V = [pendant ? 0.3 + Math.sin(n * 0.2) * 0.05 : 0, y, 0.05];
    if (n)
      g.tube(
        [base[0], y + (pendant ? 0.17 : -0.18), 0.05],
        base,
        0.02,
        "#b33f45",
      );
    bract(
      g,
      base,
      gold || orange ? 0.42 : 0.38,
      n % 2 ? -1 : 1,
      gold ? "#edb92f" : orange ? "#ef7a2b" : "#d83a45",
      gold ? "#ffe56c" : "#e7d26a",
    );
    if (gold || orange)
      g.tube(
        [base[0] + (n % 2 ? -1 : 1) * 0.31, y + 0.13, 0.05],
        [base[0] + (n % 2 ? -1 : 1) * 0.5, y + 0.49, 0.05],
        0.023,
        "#f3bf40",
        4,
      );
  }
}
function passion(g: PlantGeometry) {
  const point = (t: number): V => [
    Math.sin(t * 8) * 0.28,
    0.12 + t * 1.7,
    Math.cos(t * 8) * 0.13,
  ];
  for (let n = 0; n < 16; n++)
    g.tube(point(n / 16), point((n + 1) / 16), 0.015, "#688044", 4);
  g.tube([-0.2, 0, 0], [0.14, 1.75, 0], 0.035, "#7b6c48");
  for (let n = 1; n < 10; n++) {
    const b = point(n / 10),
      side = n % 2 ? 1 : -1;
    const outline: V[] = [
      [0, 0, 0],
      [side * 0.12, 0.02, 0],
      [side * 0.29, 0.22, 0],
      [side * 0.11, 0.19, 0.02],
      [side * 0.07, 0.43, 0],
      [-side * 0.06, 0.21, 0.02],
      [-side * 0.18, 0.29, 0],
      [-side * 0.1, 0.08, 0],
    ];
    const c: V = [b[0], b[1] + 0.13, b[2]];
    for (let i = 0; i < outline.length; i++) {
      const p = outline[i],
        q = outline[(i + 1) % outline.length];
      g.tri(
        c,
        [p[0] + b[0], p[1] + b[1], p[2] + b[2]],
        [q[0] + b[0], q[1] + b[1], q[2] + b[2]],
        n % 2 ? "#3a7a45" : "#517f40",
      );
    }
  }
  for (const [x, y, z] of [
    [-0.2, 0.85, 0.2],
    [0.28, 1.45, 0.23],
  ]) {
    const at = (r: number, a: number, depth = 0): V => [
      x + Math.cos(a) * r,
      y + Math.sin(a) * r,
      z + depth,
    ];
    for (let n = 0; n < 10; n++) {
      const a = (n * Math.PI) / 5;
      const petal = (t: number, side: number): V => {
        const r = 0.055 + t * 0.37,
          w = 0.078 * Math.sin(t * Math.PI) ** 0.6 * side;
        return [
          x + Math.cos(a) * r - Math.sin(a) * w,
          y + Math.sin(a) * r + Math.cos(a) * w,
          z + 0.02 * Math.sin(t * Math.PI) - 0.015 * t,
        ];
      };
      for (let i = 0; i < 5; i++)
        for (const side of [-1, 1])
          g.quad(
            petal(i / 5, 0),
            petal(i / 5, side),
            petal((i + 1) / 5, side),
            petal((i + 1) / 5, 0),
            n % 2 ? "#f1efd6" : "#e2e8c5",
          );
    }
    for (let n = 0; n < 60; n++) {
      const a = (n * Math.PI) / 30,
        w = 0.012;
      g.quad(
        at(0.08, a - w, 0.045),
        at(0.08, a + w, 0.045),
        at(0.17, a + w, 0.065),
        at(0.17, a - w, 0.065),
        "#583c79",
      );
      g.quad(
        at(0.17, a - w, 0.065),
        at(0.17, a + w, 0.065),
        at(0.235, a + w, 0.055),
        at(0.235, a - w, 0.055),
        "#f2eddf",
      );
      g.quad(
        at(0.235, a - w, 0.055),
        at(0.235, a + w, 0.055),
        at(0.33, a + w, 0.03),
        at(0.33, a - w, 0.03),
        "#5359bd",
      );
    }
    g.tube([x, y, z], [x, y, z + 0.16], 0.035, "#9daf4e", 6);
    for (let n = 0; n < 5; n++) {
      const a = (n * Math.PI * 2) / 5,
        p = at(0.12, a, 0.17);
      g.tube([x, y, z + 0.12], p, 0.012, "#b2bd54", 4);
      g.tube(
        [p[0] - 0.04, p[1], p[2]],
        [p[0] + 0.04, p[1], p[2]],
        0.022,
        "#d9bf3e",
        5,
      );
    }
    for (let n = 0; n < 3; n++) {
      const a = (n * Math.PI * 2) / 3,
        p = at(0.095, a, 0.26);
      g.tube([x, y, z + 0.16], p, 0.012, "#885685", 4);
      g.tube(p, [p[0] + 0.04, p[1], p[2]], 0.025, "#744776", 5);
    }
  }
  for (let n = 0; n < 2; n++)
    for (let i = 0; i < 18; i++) {
      const p = (t: number): V => [
        0.17 + n * 0.08 + Math.cos(t * 10) * (0.1 - t * 0.05),
        0.4 + n * 0.7 + t * 0.18,
        0.1 + Math.sin(t * 10) * (0.1 - t * 0.05),
      ];
      g.tube(p(i / 18), p((i + 1) / 18), 0.005, "#a1a66b", 3);
    }
}
export function makeRiverPlantGeometry(kind: RiverPlant) {
  const g = new PlantGeometry();
  if (kind === "fern-maidenhair") fernFans(g);
  else if (kind === "fern-strap") fernStraps(g);
  else if (kind.startsWith("fern")) {
    fern(g, kind);
    if (kind === "fern-ostrich") fiddleheads(g);
  } else if (kind.startsWith("heliconia")) heliconia(g, kind);
  else if (kind === "passionflower") passion(g);
  else if (kind === "sedge" || kind === "rush") {
    for (let n = 0; n < 9; n++) {
      const a = n * 2.4,
        h = 0.5 + (n % 4) * 0.15;
      const blade = (t: number, side: number): V => [
        Math.cos(a) * t * t * 0.3 -
          Math.sin(a) * side * 0.025 * Math.sin(Math.PI * t),
        h * t,
        Math.sin(a) * t * t * 0.3 +
          Math.cos(a) * side * 0.025 * Math.sin(Math.PI * t),
      ];
      for (let i = 0; i < 4; i++)
        g.quad(
          blade(i / 4, -1),
          blade(i / 4, 1),
          blade((i + 1) / 4, 1),
          blade((i + 1) / 4, -1),
          n % 2 ? "#658347" : "#829650",
        );
      if (kind === "rush" && n % 3 === 0) {
        g.tube(
          [0, 0, 0],
          [Math.cos(a) * 0.1, h * 1.3, Math.sin(a) * 0.1],
          0.012,
          "#74834b",
        );
        g.tube(
          [Math.cos(a) * 0.1, h * 1.1, Math.sin(a) * 0.1],
          [Math.cos(a) * 0.1, h * 1.3, Math.sin(a) * 0.1],
          0.026,
          "#806544",
        );
      }
    }
  } else if (kind === "daisy") {
    for (let n = 0; n < 5; n++) {
      const x = Math.sin(n * 2.4) * 0.2,
        z = Math.cos(n * 2.4) * 0.2,
        h = 0.35 + n * 0.07;
      g.tube([x, 0, z], [x, h, z], 0.008, "#6d8c44", 4);
      for (let p = 0; p < 9; p++) {
        const a = (p * Math.PI * 2) / 9;
        const at = (r: number, b: number): V => [
          x + Math.cos(b) * r,
          h + Math.sin(r * 8) * 0.02,
          z + Math.sin(b) * r,
        ];
        g.quad(
          at(0.025, a - 0.2),
          at(0.085, a - 0.2),
          at(0.13, a),
          at(0.085, a + 0.2),
          "#efeedd",
        );
      }
      g.tube([x, h - 0.005, z], [x, h + 0.025, z], 0.035, "#dcb95a", 8);
    }
  } else {
    const rock = new T.IcosahedronGeometry(0.5, 1),
      p = rock.attributes.position;
    for (let i = 0; i < p.count; i += 3) {
      const a = new T.Vector3().fromBufferAttribute(p, i).toArray() as V,
        b = new T.Vector3().fromBufferAttribute(p, i + 1).toArray() as V,
        c = new T.Vector3().fromBufferAttribute(p, i + 2).toArray() as V;
      for (const v of [a, b, c]) v[1] *= 0.5;
      g.tri(
        a,
        b,
        c,
        a[1] + b[1] + c[1] > 0.3 ? "#758452" : i % 2 ? "#858777" : "#737b6c",
      );
    }
    rock.dispose();
  }
  return g.finish(kind);
}

const shared = new Map<RiverPlant, T.BufferGeometry>();
export function sharedRiverPlantGeometry(kind: RiverPlant) {
  if (!shared.has(kind)) shared.set(kind, makeRiverPlantGeometry(kind));
  return shared.get(kind)!;
}
