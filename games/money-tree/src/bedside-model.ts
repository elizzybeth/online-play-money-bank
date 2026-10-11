import * as T from "three";
export function makeBedsideTable() {
  const root = new T.Group();
  root.name = "moms-bedside-table";
  const mats = new Map<string, T.MeshStandardMaterial>();
  const mesh = (
    geometry: T.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
  ) => {
    let mat = mats.get(color);
    if (!mat) {
      mat = new T.MeshStandardMaterial({
        color,
        roughness: color === "#dba325" ? 0.23 : 0.7,
      });
      mats.set(color, mat);
    }
    const m = new T.Mesh(geometry, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    root.add(m);
    return m;
  };
  const box = (
    w: number,
    h: number,
    d: number,
    c: string,
    x: number,
    y: number,
    z: number,
  ) => mesh(new T.BoxGeometry(w, h, d), c, x, y, z);
  for (const x of [-0.42, 0.42])
    for (const z of [-0.22, 0.22]) {
      const leg = mesh(
        new T.CylinderGeometry(0.05, 0.035, 0.58, 12),
        "#a67744",
        x,
        0.32,
        z,
      );
      leg.rotation.z = -Math.sign(x) * 0.16;
      leg.rotation.x = Math.sign(z) * 0.12;
    }
  box(1.2, 0.08, 0.7, "#d1a36d", 0, 1.15, 0);
  box(1.2, 0.06, 0.7, "#b98650", 0, 0.59, 0);
  for (const x of [-0.56, 0.56]) box(0.08, 0.52, 0.7, "#c39765", x, 0.88, 0);
  box(1.05, 0.48, 0.05, "#9a734e", 0, 0.88, -0.32);
  box(1.04, 0.24, 0.64, "#a87547", 0, 0.73, 0);
  box(1.07, 0.22, 0.045, "#d0a06c", 0, 0.74, 0.35);
  const knob = mesh(
    new T.SphereGeometry(0.035, 12, 8),
    "#5b4430",
    0,
    0.74,
    0.39,
  );
  knob.scale.z = 0.6;
  // Real open cubby above the drawer, with stacked clothbound books.
  for (let i = 0; i < 3; i++) {
    const y = 0.88 + i * 0.064;
    box(
      0.68 - i * 0.045,
      0.055,
      0.39,
      ["#126c76", "#794a70", "#e9d7aa"][i],
      -0.11,
      y,
      0.08,
    );
    box(0.63 - i * 0.045, 0.03, 0.014, "#f3e5c5", -0.11, y, 0.28);
  }
  // Mustard enamel lamp: domed base, slender stem, open upper dome and bowl reflector.
  const lamp = new T.Group();
  lamp.name = "mustard-dome-lamp";
  root.add(lamp);
  const lampPart = (g: T.BufferGeometry, c: string, y: number) => {
    const m = mesh(g, c, 0.2, y, -0.02);
    root.remove(m);
    lamp.add(m);
    return m;
  };
  lampPart(new T.CylinderGeometry(0.22, 0.22, 0.018, 24), "#514230", 1.2);
  lampPart(
    new T.SphereGeometry(0.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    "#dba325",
    1.21,
  ).scale.y = 0.65;
  lampPart(new T.CylinderGeometry(0.025, 0.025, 0.47, 16), "#dba325", 1.55);
  const shade = lampPart(
    new T.SphereGeometry(0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    "#dba325",
    1.91,
  );
  (shade.material as T.MeshStandardMaterial).side = T.DoubleSide;
  lampPart(
    new T.SphereGeometry(
      0.15,
      24,
      12,
      0,
      Math.PI * 2,
      Math.PI / 2,
      Math.PI / 2,
    ),
    "#f5bf40",
    1.9,
  );
  lampPart(new T.SphereGeometry(0.025, 12, 8), "#b8b7ad", 2.25);
  const glow = new T.PointLight("#ffd28b", 0.55, 3);
  glow.position.set(0.2, 1.85, -0.02);
  lamp.add(glow);
  return root;
}
