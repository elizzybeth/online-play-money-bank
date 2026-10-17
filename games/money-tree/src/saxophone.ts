import * as T from "three";
/** A complete miniature tenor sax, shared by stock, portraits and worn hats. */
export function makeSaxophone() {
  const root = new T.Group();
  root.name = "giant-steps-saxophone";
  const brass = new T.MeshStandardMaterial({
    color: "#dba638",
    metalness: 0.78,
    roughness: 0.24,
  });
  const gold = new T.MeshStandardMaterial({
    color: "#ffe09a",
    metalness: 0.7,
    roughness: 0.2,
  });
  const dark = new T.MeshStandardMaterial({
    color: "#252321",
    roughness: 0.38,
  });
  const pearl = new T.MeshStandardMaterial({
    color: "#f8f1d4",
    roughness: 0.28,
  });
  const add = (geo: T.BufferGeometry, mat: T.Material, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    root.add(m);
    return m;
  };
  const tube = (points: number[][], r: number, mat = brass) =>
    add(
      new T.TubeGeometry(
        new T.CatmullRomCurve3(
          points.map((p) => new T.Vector3(...(p as [number, number, number]))),
        ),
        48,
        r,
        12,
        false,
      ),
      mat,
    );
  tube(
    [
      [-0.18, 1.12, 0],
      [-0.15, 0.84, 0],
      [-0.09, 0.49, 0],
      [0, 0.16, 0],
      [0.15, 0.1, 0],
      [0.3, 0.2, 0],
      [0.34, 0.46, 0],
    ],
    0.075,
  );
  tube(
    [
      [-0.18, 1.1, 0],
      [-0.2, 1.25, 0],
      [-0.33, 1.31, 0],
      [-0.45, 1.26, 0],
    ],
    0.035,
  );
  const mouth = add(
    new T.CylinderGeometry(0.032, 0.044, 0.2, 12),
    dark,
    -0.49,
    1.24,
    0,
  );
  mouth.rotation.z = -1.05;
  const reed = add(
    new T.BoxGeometry(0.12, 0.013, 0.045),
    pearl,
    -0.52,
    1.22,
    0.012,
  );
  reed.rotation.z = -0.45;
  for (const x of [-0.44, -0.4]) {
    const band = add(
      new T.TorusGeometry(0.038, 0.008, 6, 16),
      gold,
      x,
      1.27,
      0,
    );
    band.rotation.y = Math.PI / 2;
  }
  const bellPoints = [
    [0.065, 0.28],
    [0.075, 0.38],
    [0.1, 0.48],
    [0.15, 0.58],
    [0.23, 0.66],
  ].map(([r, y]) => new T.Vector2(r, y));
  const bell = add(new T.LatheGeometry(bellPoints, 40), brass, 0.34, 0, 0);
  (bell.material as T.MeshStandardMaterial).side = T.DoubleSide;
  const inside = add(new T.CircleGeometry(0.206, 32), dark, 0.34, 0.632, 0);
  inside.rotation.x = -Math.PI / 2;
  const lip = add(new T.TorusGeometry(0.23, 0.014, 8, 40), gold, 0.34, 0.66, 0);
  lip.rotation.x = Math.PI / 2;
  // Tone holes, cups, pearl touches, guards, rods and connected key arms.
  for (let i = 0; i < 8; i++) {
    const y = 0.28 + i * 0.098,
      x = -0.02 - (y - 0.28) * 0.19;
    const hole = add(
      new T.CylinderGeometry(0.047, 0.047, 0.023, 16),
      dark,
      x,
      y,
      0.072,
    );
    hole.rotation.x = Math.PI / 2;
    const cup = add(
      new T.CylinderGeometry(0.052, 0.052, 0.016, 20),
      gold,
      x + 0.035,
      y,
      0.105,
    );
    cup.rotation.x = Math.PI / 2;
    const key = add(
      new T.SphereGeometry(0.025, 12, 8),
      pearl,
      x + 0.075,
      y + 0.025,
      0.133,
    );
    key.scale.z = 0.35;
    tube(
      [
        [x - 0.085, y, 0.03],
        [x + 0.06, y, 0.105],
      ],
      0.009,
      gold,
    );
  }
  tube(
    [
      [-0.23, 0.29, 0.02],
      [-0.33, 1.1, 0.02],
    ],
    0.012,
    gold,
  );
  tube(
    [
      [0.05, 0.2, -0.06],
      [-0.15, 0.99, -0.06],
    ],
    0.01,
    gold,
  );
  for (const y of [0.35, 0.62, 0.9])
    tube(
      [
        [-0.21, y, 0.01],
        [-0.26, y, 0.07],
        [-0.1, y, 0.1],
      ],
      0.009,
      gold,
    );
  for (const y of [0.17, 0.24])
    tube(
      [
        [0.1, y, 0.06],
        [0.2, y, 0.09],
        [0.27, y + 0.09, 0.06],
      ],
      0.012,
      gold,
    );
  const hook = add(
    new T.TorusGeometry(0.045, 0.009, 6, 16, Math.PI * 1.6),
    gold,
    -0.17,
    0.84,
    -0.08,
  );
  hook.rotation.y = Math.PI / 2;
  root.rotation.z = -0.18;
  return root;
}
