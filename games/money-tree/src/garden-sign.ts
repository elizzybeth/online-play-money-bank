import * as T from "three";
type Stroke = number[][];
const glyphs: Record<string, Stroke[]> = {
  C: [
    [
      [0.55, 0.9],
      [0.2, 0.92],
      [0, 0.7],
      [0, 0.25],
      [0.2, 0.03],
      [0.55, 0.06],
    ],
  ],
  O: [
    [
      [0.3, 0],
      [0.05, 0.12],
      [0, 0.45],
      [0.06, 0.8],
      [0.3, 0.95],
      [0.55, 0.8],
      [0.6, 0.45],
      [0.55, 0.12],
      [0.3, 0],
    ],
  ],
  M: [
    [
      [0, 0],
      [0.05, 0.9],
      [0.3, 0.35],
      [0.55, 0.9],
      [0.6, 0],
    ],
  ],
  U: [
    [
      [0, 0.9],
      [0, 0.2],
      [0.15, 0],
      [0.45, 0],
      [0.6, 0.2],
      [0.6, 0.9],
    ],
  ],
  N: [
    [
      [0, 0],
      [0, 0.9],
      [0.6, 0],
      [0.6, 0.9],
    ],
  ],
  I: [
    [
      [0.3, 0],
      [0.3, 0.9],
    ],
  ],
  T: [
    [
      [0, 0.9],
      [0.6, 0.9],
    ],
    [
      [0.3, 0.9],
      [0.3, 0],
    ],
  ],
  Y: [
    [
      [0, 0.9],
      [0.3, 0.45],
      [0.6, 0.9],
    ],
    [
      [0.3, 0.45],
      [0.3, 0],
    ],
  ],
  G: [
    [
      [0.55, 0.82],
      [0.3, 0.94],
      [0.05, 0.8],
      [0, 0.4],
      [0.1, 0.1],
      [0.4, 0.02],
      [0.6, 0.15],
      [0.6, 0.4],
      [0.32, 0.4],
    ],
  ],
  A: [
    [
      [0, 0],
      [0.3, 0.9],
      [0.6, 0],
    ],
    [
      [0.15, 0.36],
      [0.45, 0.36],
    ],
  ],
  R: [
    [
      [0, 0],
      [0, 0.9],
      [0.4, 0.9],
      [0.6, 0.75],
      [0.5, 0.5],
      [0, 0.5],
    ],
    [
      [0.25, 0.5],
      [0.65, 0],
    ],
  ],
  D: [
    [
      [0, 0],
      [0, 0.9],
      [0.3, 0.9],
      [0.55, 0.75],
      [0.6, 0.45],
      [0.55, 0.15],
      [0.3, 0],
      [0, 0],
    ],
  ],
  E: [
    [
      [0.6, 0.9],
      [0, 0.9],
      [0, 0],
      [0.6, 0],
    ],
    [
      [0, 0.45],
      [0.48, 0.45],
    ],
  ],
};
export function makeGardenSign() {
  const g = new T.Group();
  g.name = "community-garden-iron-fence";
  g.position.set(10, 0, -80.5);
  const iron = new T.MeshStandardMaterial({
    color: "#283b36",
    metalness: 0.75,
    roughness: 0.45,
  });
  function tube(
    points: number[][],
    radius = 0.055,
    mat = iron,
    parent: T.Object3D = g,
  ) {
    const path = new T.CurvePath<T.Vector3>();
    for (let i = 1; i < points.length; i++)
      path.add(
        new T.LineCurve3(
          new T.Vector3(...points[i - 1]),
          new T.Vector3(...points[i]),
        ),
      );
    const m = new T.Mesh(
      new T.TubeGeometry(
        path,
        Math.max(8, points.length * 5),
        radius,
        6,
        false,
      ),
      mat,
    );
    parent.add(m);
    m.castShadow = true;
    return m;
  }
  for (const x of [-6.2, 6.2]) {
    tube(
      [
        [x, 0, 0],
        [x, 4.8, 0],
      ],
      0.1,
    );
    const cap = new T.Mesh(new T.SphereGeometry(0.17, 10, 8), iron);
    cap.position.set(x, 4.9, 0);
    g.add(cap);
  }
  for (const y of [0.18, 1.7, 2.95, 4.45])
    tube([
      [-6.2, y, 0],
      [6.2, y, 0],
    ]);
  for (let x = -6; x <= 6; x += 0.6) {
    tube(
      [
        [x, 0.2, 0],
        [x, 1.7, 0],
      ],
      0.035,
    );
    const spear = new T.Mesh(new T.ConeGeometry(0.085, 0.25, 4), iron);
    spear.position.set(x, 1.85, 0);
    g.add(spear);
  }
  for (const side of [-1, 1]) {
    const x = side * 5.25;
    const points = Array.from({ length: 33 }, (_, i) => [
      x + Math.sin(i * 0.4) * 0.35,
      0.3 + i * 0.12,
      0,
    ]);
    tube(points, 0.04);
    for (let i = 0; i < 6; i++) {
      const y = 0.7 + i * 0.56;
      const loop = Array.from({ length: 17 }, (_, j) => [
        x + side * Math.sin((j * Math.PI) / 8) * 0.32,
        y + Math.cos((j * Math.PI) / 8) * 0.25,
        0.02,
      ]);
      tube(loop, 0.028);
    }
  }
  const colors = [
    "#47794b",
    "#db5335",
    "#dfba4e",
    "#587c3c",
    "#be5548",
    "#6d984e",
    "#dd8936",
    "#5b8646",
    "#754765",
  ];
  function word(text: string, y: number, spacing: number) {
    [...text].forEach((letter, i) => {
      const group = new T.Group();
      group.name = `vegetable-letter-${text}-${i}-${letter}`;
      group.position.set((i - (text.length - 1) / 2) * spacing - 0.3, y, 0.12);
      g.add(group);
      const painted = new T.MeshStandardMaterial({
        color: colors[i % colors.length],
        metalness: 0.15,
        roughness: 0.7,
      });
      for (const stroke of glyphs[letter]) {
        tube(
          stroke.map(([x, y]) => [x, y, 0]),
          0.092,
          iron,
          group,
        );
        tube(
          stroke.map(([x, y]) => [x, y, 0.07]),
          letter === "I" ? 0.07 : 0.064,
          painted,
          group,
        );
      }
      // Leaf tops and stems make the lettering into vegetable silhouettes.
      if (text === "COMMUNITY" && letter === "I") {
        const carrot = new T.Mesh(new T.ConeGeometry(0.14, 0.82, 10), painted);
        carrot.rotation.z = Math.PI;
        carrot.position.set(0.3, 0.42, 0.14);
        group.add(carrot);
      }
      if (text === "COMMUNITY" && letter === "O") {
        const tomato = new T.Mesh(new T.SphereGeometry(0.3, 12, 8), painted);
        tomato.scale.set(1, 1.4, 0.45);
        tomato.position.set(0.3, 0.45, 0.1);
        group.add(tomato);
      }
      if (text === "COMMUNITY" && letter === "M") {
        const corn = new T.MeshStandardMaterial({
          color: "#efc749",
          roughness: 0.85,
        });
        for (const x of [0.06, 0.54])
          for (let y = 0.12; y < 0.85; y += 0.12) {
            const kernel = new T.Mesh(new T.SphereGeometry(0.052, 6, 4), corn);
            kernel.scale.set(1, 0.85, 0.65);
            kernel.position.set(x, y, 0.12);
            group.add(kernel);
          }
      }
      tube(
        [
          [0.3, 0.88, 0.04],
          [0.32, 1.04, 0.04],
        ],
        0.025,
        iron,
        group,
      );
      for (const side of [-1, 1]) {
        const leaf = new T.Mesh(
          new T.SphereGeometry(0.1, 8, 5),
          new T.MeshStandardMaterial({ color: "#648d4b", roughness: 0.9 }),
        );
        leaf.scale.set(1.4, 0.45, 0.3);
        leaf.rotation.z = side * 0.5;
        leaf.position.set(0.3 + side * 0.09, 1, 0.1);
        group.add(leaf);
      }
      if (letter === "O")
        for (let j = 0; j < 5; j++) {
          const a = (j * Math.PI * 2) / 5;
          tube(
            [
              [0.3, 0.93, 0.1],
              [0.3 + Math.cos(a) * 0.1, 0.93 + Math.sin(a) * 0.1, 0.1],
            ],
            0.018,
            iron,
            group,
          );
        }
    });
  }
  word("COMMUNITY", 3.18, 0.93);
  word("GARDEN", 1.96, 1.1);
  const sigma = tube(
    [
      [1.25, 6.85, 0],
      [-1.25, 6.85, 0],
      [0.15, 5.75, 0],
      [-1.25, 4.65, 0],
      [1.25, 4.65, 0],
    ],
    0.14,
  );
  sigma.name = "wrought-iron-sigma";
  for (const side of [-1, 1])
    tube(
      [
        [side * 4.8, 4.45, 0],
        [side * 3.4, 5.2, 0],
        [side * 1.4, 5.8, 0],
      ],
      0.055,
    );
  g.userData.text = "COMMUNITY GARDEN";
  return g;
}
