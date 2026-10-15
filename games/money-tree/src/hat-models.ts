import * as T from "three";
import { hatById, type HatId } from "./hats";
// Shared geometry for shop stock, bag portraits, and the worn hat.
export function makeHat(id: HatId) {
  const g = new T.Group();
  g.name = `hat-${id}`;
  const color = hatById(id)!.color;
  const material = (c: string) =>
    new T.MeshStandardMaterial({
      color: c,
      roughness: ["#dfb844", "#c9dfe2"].includes(c) ? 0.25 : 0.78,
      metalness: ["#dfb844", "#c9dfe2"].includes(c) ? 0.65 : 0,
    });
  function mesh(geo: T.BufferGeometry, c: string, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geo, material(c));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return m;
  }
  const ell = (
    x: number,
    y: number,
    z: number,
    a: number,
    b: number,
    c: number,
    col: string,
  ) => {
    const m = mesh(new T.SphereGeometry(1, 20, 12), col, x, y, z);
    m.scale.set(a, b, c);
    return m;
  };
  const cyl = (r: number, h: number, col: string, y: number, top = r) =>
    mesh(new T.CylinderGeometry(top, r, h, 24), col, 0, y);
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    col: string,
  ) => mesh(new T.BoxGeometry(w, h, d), col, x, y, z);
  const brim = (r: number, col = color) => cyl(r, 0.055, col, 0.025);
  const band = (r: number, y: number, col: string) => cyl(r, 0.09, col, y);
  function stitches(r: number, y: number) {
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const t = box(
        Math.sin(a) * r,
        y,
        Math.cos(a) * r,
        0.035,
        0.015,
        0.07,
        "#efe4c9",
      );
      t.rotation.y = a;
    }
  }
  const advanced = [
    "terrace",
    "verdant",
    "seedkeeper",
    "harvest",
    "compost",
    "reach",
    "trail",
    "alchemist",
    "dew",
    "treasury",
  ].indexOf(id);
  if (id === "dew" || id === "harvest") {
    const gold = id === "dew" ? "#c9dfe2" : "#dfb844";
    const radius = 0.43;
    const ring = mesh(
      new T.TorusGeometry(radius, 0.028, 8, 48),
      gold,
      0,
      0.07,
      0,
    );
    ring.rotation.x = Math.PI / 2;
    const tube = (points: T.Vector3[], r: number, col: string) =>
      mesh(
        new T.TubeGeometry(new T.CatmullRomCurve3(points), 24, r, 6, false),
        col,
      );
    if (id === "dew") {
      // An open, delicate silver tiara with ascending arches across the forehead.
      for (let i = -2; i <= 2; i++) {
        const x = i * 0.15,
          h = 0.27 + (2 - Math.abs(i)) * 0.095;
        tube(
          [
            new T.Vector3(x - 0.085, 0.08, 0.35),
            new T.Vector3(x - 0.07, h * 0.75, 0.4),
            new T.Vector3(x, h, 0.42),
            new T.Vector3(x + 0.07, h * 0.75, 0.4),
            new T.Vector3(x + 0.085, 0.08, 0.35),
          ],
          0.012,
          gold,
        );
        const gem = mesh(
          new T.OctahedronGeometry(0.055),
          "#a3e5ed",
          x,
          h - 0.05,
          0.435,
        );
        gem.scale.y = 1.5;
      }
    } else {
      // A continuous gold circlet with pointed uprights, rather than a fabric hat.
      const vertices: number[] = [],
        indices: number[] = [];
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const top =
          0.2 + (i % 6 === 3 ? 0.3 : i % 6 === 2 || i % 6 === 4 ? 0.15 : 0);
        vertices.push(
          Math.sin(a) * radius,
          0.065,
          Math.cos(a) * radius,
          Math.sin(a) * radius,
          top,
          Math.cos(a) * radius,
        );
        if (i < 48) {
          const j = i * 2;
          indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);
        }
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const crown = mesh(geo, gold);
      crown.material.side = T.DoubleSide;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        mesh(
          new T.OctahedronGeometry(0.047),
          i % 2 ? "#df6861" : "#70b39a",
          Math.sin(a) * 0.445,
          0.17,
          Math.cos(a) * 0.445,
        );
        ell(
          Math.sin(a + Math.PI / 8) * radius,
          0.51,
          Math.cos(a + Math.PI / 8) * radius,
          0.034,
          0.034,
          0.034,
          gold,
        );
      }
    }
  } else if (id === "treasury") {
    // An actual woven nest, with visible eggs and a small bluebird on its rim.
    for (let i = 0; i < 9; i++) {
      const twig = mesh(
        new T.TorusGeometry(0.34 + (i % 3) * 0.025, 0.022, 5, 32),
        i % 2 ? "#98714a" : "#715234",
        0,
        0.045 + i * 0.018,
        0,
      );
      twig.rotation.set(Math.PI / 2 + (i % 2 ? 0.035 : -0.035), 0, i * 0.7);
    }
    for (let i = 0; i < 15; i++) {
      const a = i * 2.399;
      const twig = box(
        Math.sin(a) * 0.3,
        0.13 + (i % 3) * 0.025,
        Math.cos(a) * 0.3,
        0.32,
        0.025,
        0.025,
        "#aa8054",
      );
      twig.rotation.y = a + 0.7;
    }
    for (const [x, z] of [
      [-0.12, 0.05],
      [0.1, 0.1],
      [0, -0.1],
    ])
      ell(x, 0.17, z, 0.085, 0.12, 0.075, "#eee6c8");
    ell(0.31, 0.3, -0.06, 0.14, 0.13, 0.19, "#4a9bd0");
    ell(0.32, 0.46, 0.02, 0.105, 0.11, 0.1, "#62b1df");
    ell(0.29, 0.31, 0.08, 0.09, 0.08, 0.12, "#b7e1e6");
    ell(0.43, 0.31, -0.09, 0.035, 0.1, 0.13, "#337aab");
    const beak = mesh(
      new T.ConeGeometry(0.04, 0.1, 8),
      "#e2b34d",
      0.32,
      0.44,
      0.15,
    );
    beak.rotation.x = Math.PI / 2;
    for (const x of [0.26, 0.38])
      ell(x, 0.48, 0.095, 0.013, 0.015, 0.01, "#192a34");
  } else if (id === "seedkeeper") {
    const crown = mesh(
      new T.SphereGeometry(1, 28, 16, Math.PI, Math.PI),
      color,
      0,
      0.16,
      0.19,
    );
    crown.scale.set(0.45, 0.43, 0.52);
    crown.material.side = T.DoubleSide;
    crown.name = "bonnet-puffed-crown";
    // An upright, flared hood around the face, rather than a flat sunhat brim.
    const vertices: number[] = [],
      indices: number[] = [];
    for (let i = 0; i <= 40; i++) {
      const a = -Math.PI * 0.12 + (i / 40) * Math.PI * 1.24;
      const scallop = Math.cos(a * 24) * 0.018;
      vertices.push(Math.cos(a) * 0.43, 0.08 + Math.sin(a) * 0.39, 0.19);
      vertices.push(
        Math.cos(a) * (0.64 + scallop),
        0.08 + Math.sin(a) * (0.56 + scallop),
        0.48 + scallop,
      );
      if (i < 40) {
        const j = i * 2;
        indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);
      }
    }
    const hood = new T.BufferGeometry();
    hood.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    hood.setIndex(indices);
    hood.computeVertexNormals();
    const brim = mesh(hood, "#f1dfb9");
    brim.name = "bonnet-face-framing-brim";
    brim.material.side = T.DoubleSide;
    const edge = Array.from({ length: 41 }, (_, i) => {
      const a = -Math.PI * 0.12 + (i / 40) * Math.PI * 1.24;
      return new T.Vector3(
        Math.cos(a) * 0.645,
        0.08 + Math.sin(a) * 0.565,
        0.49,
      );
    });
    mesh(
      new T.TubeGeometry(new T.CatmullRomCurve3(edge), 40, 0.014, 5, false),
      "#fff3d5",
    );
    // Side ties leave the player's eyes clear, including when hats are stacked.
    for (const side of [-1, 1]) {
      const x = side * 0.47;
      for (const wing of [-1, 1]) {
        const loop = ell(
          x + wing * 0.095,
          -0.055,
          0.36,
          0.12,
          0.065,
          0.035,
          "#567f70",
        );
        loop.rotation.z = wing * 0.4;
      }
      ell(x, -0.055, 0.39, 0.045, 0.055, 0.04, "#8ba88b");
      for (const tail of [-1, 1]) {
        const ribbon = mesh(
          new T.PlaneGeometry(0.075, 0.34, 1, 4),
          "#567f70",
          x + tail * 0.045,
          -0.26,
          0.37,
        );
        const p = ribbon.geometry.attributes.position;
        for (let i = 0; i < p.count; i++)
          p.setZ(i, Math.sin(p.getY(i) * 12) * 0.045);
        ribbon.geometry.computeVertexNormals();
        ribbon.rotation.z = tail * 0.22;
        ribbon.material.side = T.DoubleSide;
        ribbon.name = "bonnet-ribbon";
      }
    }
    // Gathered fabric seams across the rounded back.
    for (let i = -2; i <= 2; i++) {
      const x = i * 0.12,
        radius = Math.sqrt(1 - (x / 0.45) ** 2);
      const points = Array.from({ length: 21 }, (_, j) => {
        const a = Math.PI * (0.04 + (j / 20) * 0.92);
        return new T.Vector3(
          x,
          0.16 + Math.cos(a) * 0.432 * radius,
          0.19 - Math.sin(a) * 0.522 * radius,
        );
      });
      mesh(
        new T.TubeGeometry(new T.CatmullRomCurve3(points), 20, 0.006, 4, false),
        "#e7cea1",
      );
    }
  } else if (advanced >= 0) {
    brim(advanced === 2 ? 0.65 : 0.53);
    cyl(
      0.4,
      0.25 + (advanced % 3) * 0.12,
      color,
      0.18 + (advanced % 3) * 0.06,
      0.31,
    );
    band(0.405, 0.09, "#ead6a4");
    stitches(0.43, 0.07);
    if (id === "terrace")
      for (let i = 0; i < 4; i++)
        box(
          -0.27 + i * 0.18,
          0.42 + i * 0.06,
          0.34,
          0.14,
          0.1,
          0.11,
          "#d6d9bc",
        );
    else if (["verdant", "trail"].includes(id)) {
      for (let i = 0; i < 3; i++) {
        const leaf = ell(
          (i - 1) * 0.13,
          0.48 + i * 0.035,
          0.1,
          0.08,
          0.16,
          0.035,
          "#34784e",
        );
        leaf.rotation.z = (i - 1) * 0.6;
      }
    } else if (id === "reach") {
      const lens = mesh(
        new T.TorusGeometry(0.12, 0.025, 6, 16),
        "#dcc68d",
        0,
        0.35,
        0.4,
      );
      lens.rotation.y = 0.1;
    } else if (id === "compost")
      for (let i = 0; i < 3; i++)
        ell((i - 1) * 0.12, 0.25, 0.4, 0.06, 0.06, 0.04, "#b8cf86");
    else if (id === "alchemist")
      mesh(new T.OctahedronGeometry(0.14), "#c8edd8", 0, 0.34, 0.39);
    else box(0, 0.3, 0.4, 0.16, 0.18, 0.05, "#e8c26e");
  } else if (id === "cap" || id === "propeller") {
    ell(0, 0.16, 0, 0.46, 0.28, 0.45, color);
    ell(0, 0.04, 0.4, 0.43, 0.04, 0.32, id === "cap" ? "#397766" : "#3f79a3");
    stitches(0.43, 0.13);
    band(0.455, 0.07, "#efe4c9");
    if (id === "cap") {
      box(0, 0.19, 0.437, 0.16, 0.13, 0.025, "#e7ce82");
      box(0, 0.2, 0.455, 0.025, 0.09, 0.02, "#437548");
      ell(0.045, 0.24, 0.455, 0.045, 0.025, 0.02, "#437548");
    } else {
      cyl(0.035, 0.18, "#e7cb66", 0.46);
      const blade = box(0, 0.56, 0, 0.9, 0.035, 0.14, "#e5cd68");
      blade.name = "propeller";
      ell(0, 0.58, 0, 0.065, 0.04, 0.065, "#3f79a3");
    }
  } else if (id === "rabbit") {
    ell(0, 0.14, 0, 0.46, 0.27, 0.43, color);
    band(0.46, 0.03, "#a68485");
    for (const x of [-0.23, 0.23]) {
      const ear = ell(x, 0.64, 0, 0.11, 0.48, 0.085, color);
      ear.rotation.z = x > 0 ? -0.2 : 0.2;
      const inner = ell(x, 0.66, 0.075, 0.06, 0.34, 0.02, "#d68f97");
      inner.rotation.z = ear.rotation.z;
    }
    ell(0, 0.14, -0.43, 0.12, 0.12, 0.12, color);
  } else if (id === "inspector") {
    ell(0, 0.15, 0, 0.47, 0.22, 0.43, color);
    ell(0, 0.03, 0.4, 0.48, 0.045, 0.34, "#19458e");
    band(0.47, 0.06, "#b7b47f");
    for (const x of [-0.22, 0.22]) {
      box(x, 0.42, 0, 0.04, 0.38, 0.04, "#5a9d54");
      const leaf = ell(x + 0.1, 0.58, 0, 0.15, 0.06, 0.08, "#84be58");
      leaf.rotation.z = 0.4;
      ell(x - 0.08, 0.49, 0, 0.12, 0.05, 0.07, "#5a9d54");
    }
  } else if (id === "hardhat") {
    brim(0.55);
    ell(0, 0.18, 0, 0.46, 0.32, 0.44, color);
    box(0, 0.4, 0, 0.1, 0.13, 0.62, "#ffda71");
    band(0.465, 0.1, "#8d6641");
    for (const x of [-0.3, 0.3])
      for (let z = -0.2; z <= 0.2; z += 0.1)
        box(x, 0.25, z, 0.04, 0.07, 0.045, "#a97e35");
    box(0, 0.16, 0.45, 0.2, 0.12, 0.03, "#fff1c2");
  } else if (id === "wizard") {
    brim(0.67);
    const cone = mesh(new T.ConeGeometry(0.43, 0.95, 24), color, 0, 0.49);
    cone.rotation.z = -0.15;
    band(0.43, 0.1, "#d3aa54");
    for (let i = 0; i < 7; i++) {
      const y = 0.18 + i * 0.09;
      const r = 0.39 * (1 - y / 0.98);
      const a = i * 2.4;
      const star = mesh(
        new T.OctahedronGeometry(0.055),
        "#f6dd84",
        Math.sin(a) * r,
        y,
        Math.cos(a) * r,
      );
      star.rotation.z = 0.4;
    }
    ell(-0.12, 1, 0, 0.06, 0.07, 0.06, "#f6dd84");
  } else if (id === "rain") {
    ell(0, 0.18, 0, 0.44, 0.28, 0.43, color);
    const rim = ell(0, 0.01, -0.1, 0.67, 0.06, 0.65, color);
    rim.rotation.x = 0.12;
    band(0.445, 0.12, "#b48336");
    stitches(0.43, 0.12);
    for (const x of [-0.25, 0.25]) box(x, -0.13, -0.35, 0.17, 0.25, 0.1, color);
  } else if (id === "banker") {
    brim(0.62);
    cyl(0.39, 0.8, color, 0.43, 0.43);
    cyl(0.45, 0.05, color, 0.85);
    band(0.405, 0.2, "#75a481");
    stitches(0.4, 0.13);
    box(0, 0.2, 0.41, 0.19, 0.12, 0.025, "#e4c470");
    box(0, 0.2, 0.428, 0.13, 0.075, 0.025, color);
    const feather = ell(0.36, 0.68, 0.05, 0.07, 0.32, 0.02, "#86ba87");
    feather.rotation.z = -0.5;
  } else if (id === "beekeeper") {
    brim(0.65);
    cyl(0.4, 0.3, color, 0.19, 0.34);
    band(0.4, 0.11, "#aa8846");
    const veil = mesh(
      new T.CylinderGeometry(0.6, 0.6, 0.65, 24, 1, true),
      "#d4e1ce",
      0,
      -0.24,
    );
    veil.name = "beekeeper-veil";
    const vm = veil.material as T.MeshStandardMaterial;
    vm.transparent = true;
    vm.opacity = 0.36;
    vm.side = T.DoubleSide;
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      box(
        Math.sin(a) * 0.6,
        -0.24,
        Math.cos(a) * 0.6,
        0.012,
        0.65,
        0.012,
        "#8a9275",
      );
    }
    // A hollow cloth hem, outside the veil: the old filled cylinder shared
    // its side surface with the veil and flickered at the lower edge.
    const hem = mesh(
      new T.LatheGeometry(
        [
          new T.Vector2(0.578, -0.595),
          new T.Vector2(0.625, -0.595),
          new T.Vector2(0.625, -0.505),
          new T.Vector2(0.578, -0.505),
          new T.Vector2(0.578, -0.595),
        ],
        24,
      ),
      "#aa8846",
    );
    hem.name = "beekeeper-veil-hem";
    ell(0.25, 0.4, 0, 0.085, 0.045, 0.055, "#eabf42");
    box(0.25, 0.405, 0, 0.025, 0.06, 0.12, "#3d4237");
    ell(0.2, 0.44, 0, 0.07, 0.025, 0.04, "#d4e1ce");
  } else {
    brim(0.56);
    cyl(0.4, 0.32, color, 0.19, 0.32);
    band(0.405, 0.12, "#3f4340");
    const lamp = mesh(
      new T.CylinderGeometry(0.11, 0.11, 0.12, 20),
      "#e4c887",
      0,
      0.21,
      0.43,
    );
    lamp.rotation.x = Math.PI / 2;
    const lens = mesh(
      new T.CircleGeometry(0.09, 20),
      "#fff5ba",
      0,
      0.21,
      0.495,
    );
    (lens.material as T.MeshStandardMaterial).emissive.set("#efd584");
    (lens.material as T.MeshStandardMaterial).emissiveIntensity = 1.5;
    const light = new T.PointLight("#ffe5a8", 1.5, 5);
    light.position.set(0, 0.21, 0.6);
    g.add(light);
    box(0.4, 0.18, 0, 0.09, 0.18, 0.22, "#3f4340");
    stitches(0.38, 0.28);
  }
  return g;
}
