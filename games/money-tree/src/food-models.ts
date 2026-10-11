import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import * as T from "three";
import { meals } from "./meals";
export function makeDish(recipe: number) {
  const root = new T.Group();
  root.name = `dish-${recipe}`;
  const mats = new Map<string, T.MeshStandardMaterial>();
  const add = (
    g: T.BufferGeometry,
    c: string,
    x: number,
    y: number,
    z: number,
  ) => {
    let mat = mats.get(c);
    if (!mat) {
      mat = new T.MeshStandardMaterial({ color: c, roughness: 0.7 });
      mats.set(c, mat);
    }
    const m = new T.Mesh(g, mat);
    m.position.set(x, y, z);
    root.add(m);
    return m;
  };
  const ball = (
    c: string,
    x: number,
    y: number,
    z: number,
    a: number,
    b: number,
    d: number,
  ) => add(new T.SphereGeometry(1, 8, 6), c, x, y, z).scale.set(a, b, d);
  add(new T.CylinderGeometry(0.47, 0.4, 0.045, 32), "#f5eedb", 0, 0.025, 0);
  const burrito = [10, 11, 14, 15].includes(recipe),
    sushi = recipe === 3,
    tacos = [12, 13].includes(recipe);
  if (burrito) {
    const tortilla = add(
      new T.CylinderGeometry(0.17, 0.17, 0.6, 20, 1, true),
      "#eac68b",
      0,
      0.22,
      0,
    );
    tortilla.rotation.z = Math.PI / 2;
    for (let j = 0; j < 12; j++)
      ball(
        "#a2743e",
        -0.24 + j * 0.044,
        0.36,
        Math.sin(j * 3) * 0.07,
        0.015,
        0.004,
        0.018,
      );
  } else if (sushi) {
    for (const x of [-0.23, 0.08])
      for (const z of [-0.15, 0.16]) {
        add(new T.BoxGeometry(0.22, 0.09, 0.21), "#fff5dc", x, 0.11, z);
        const egg = add(
          new T.BoxGeometry(0.23, 0.065, 0.21),
          "#f4be35",
          x,
          0.18,
          z,
        );
        egg.rotation.y = 0.08;
        add(new T.BoxGeometry(0.034, 0.17, 0.224), "#193d28", x, 0.16, z);
      }
  } else if (recipe === 8) {
    for (let i = 0; i < 9; i++) {
      const shape = new T.Shape();
      shape.moveTo(-0.1, -0.07);
      shape.lineTo(0.12, -0.07);
      shape.lineTo(0, 0.12);
      shape.closePath();
      const chip = add(
        new T.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: false }),
        "#e9b34b",
        Math.sin(i * 2.4) * 0.27,
        0.07 + i * 0.012,
        Math.cos(i * 2.4) * 0.24,
      );
      chip.rotation.x = -Math.PI / 2;
      chip.rotation.z = i;
    }
  } else if (recipe === 1) {
    // A folded golden omelette, with a curved edge and a seam exposing egg.
    ball("#efb62c", 0, 0.15, 0, 0.32, 0.07, 0.2);
    ball("#ffd35f", 0, 0.18, -0.035, 0.3, 0.06, 0.17);
    for (let i = 0; i < 9; i++)
      ball(
        "#b9852c",
        -0.24 + i * 0.06,
        0.224,
        Math.sin(i * 2) * 0.08,
        0.023,
        0.004,
        0.012,
      );
  } else if (recipe === 12) {
    // Two soft taco shells curl around separate bean fillings.
    for (const z of [-0.17, 0.17]) {
      const shell = add(
        new T.CylinderGeometry(
          0.24,
          0.24,
          0.022,
          28,
          1,
          true,
          Math.PI / 2,
          Math.PI,
        ),
        "#d7aa62",
        0,
        0.23,
        z,
      );
      shell.rotation.x = Math.PI / 2;
      for (let i = 0; i < 12; i++) {
        ball(
          "#702f26",
          -0.19 + i * 0.035,
          0.16 + (i % 3) * 0.018,
          z,
          0.03,
          0.022,
          0.025,
        );
        ball("#35853e", -0.16 + i * 0.027, 0.2, z + 0.03, 0.021, 0.008, 0.014);
      }
    }
  } else if (tacos || recipe === 9) {
    for (let i = 0; i < (tacos ? 2 : 1); i++)
      add(
        new T.CylinderGeometry(0.26, 0.26, 0.018, 24),
        "#d7aa62",
        i * 0.3 - 0.15,
        0.07,
        0,
      );
  } else {
    const bowl = add(new T.SphereGeometry(1, 24, 12), "#007c83", 0, 0.02, 0);
    bowl.scale.set(0.39, 0.14, 0.39);
    add(
      new T.CylinderGeometry(0.34, 0.34, 0.06, 24),
      recipe === 5 ? "#c44b28" : "#b88142",
      0,
      0.14,
      0,
    );
  }
  if (!sushi && ![1, 8, 12].includes(recipe)) {
    if (recipe & 2)
      for (let i = 0; i < 65; i++) {
        const a = i * 2.399,
          r = 0.29 * Math.sqrt((i + 1) / 65);
        const rice = ball(
          i % 4 ? "#f1d29a" : "#dfa749",
          Math.cos(a) * r,
          0.17 + (i % 3) * 0.012,
          Math.sin(a) * r,
          0.026,
          0.011,
          0.013,
        );
        rice;
      }
    if (recipe & 4)
      for (let i = 0; i < 24; i++) {
        const a = i * 2.4,
          r = 0.29 * Math.sqrt((i + 1) / 24);
        ball(
          "#702f26",
          Math.cos(a) * r,
          0.205,
          Math.sin(a) * r,
          0.035,
          0.022,
          0.024,
        );
      }
    if (recipe & 1) {
      if ([5, 9, 13].includes(recipe)) {
        ball("#ffefcb", 0, 0.235, 0, 0.15, 0.024, 0.12);
        ball("#f1ad1d", 0.015, 0.258, 0, 0.06, 0.022, 0.06);
      } else
        for (let i = 0; i < 10; i++)
          ball(
            "#f4bb32",
            Math.sin(i * 2) * 0.24,
            0.225,
            Math.cos(i * 2) * 0.23,
            0.046,
            0.02,
            0.03,
          );
    }
    for (let i = 0; i < 8; i++)
      ball(
        "#35853e",
        Math.sin(i * 2) * 0.24,
        0.26,
        Math.cos(i * 2) * 0.21,
        0.027,
        0.008,
        0.015,
      );
  }
  // Cut ends expose the filling rather than hiding every burrito ingredient.
  if (burrito) {
    root.children.slice(2).forEach((m) => {
      if (m.position.y < 0.3 && m.position.y > 0.1) {
        m.position.x = m.position.x * 0.15 + 0.305;
        m.position.z *= 0.45;
        m.position.y = (m.position.y - 0.18) * 2 + 0.22;
      }
    });
  }
  root.updateMatrixWorld(true);
  for (const mat of mats.values()) {
    const meshes = root.children.filter(
      (o): o is T.Mesh => o instanceof T.Mesh && o.material === mat,
    );
    const pieces = meshes.map((o) => o.geometry.clone().applyMatrix4(o.matrix));
    const geometry = mergeGeometries(pieces, false);
    if (geometry) {
      meshes.forEach((o) => {
        o.removeFromParent();
        o.geometry.dispose();
      });
      root.add(new T.Mesh(geometry, mat));
    }
    pieces.forEach((g) => g.dispose());
  }
  root.userData.recipe = recipe;
  root.userData.title = meals[recipe]?.name;
  return root;
}
export function foodIllustration(recipe: number) {
  const wrap = [10, 11, 14, 15].includes(recipe),
    sushi = recipe === 3,
    chips = recipe === 8,
    tacos = recipe === 12;
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="45" rx="29" ry="13" fill="#eee8d0" stroke="#41848a" stroke-width="2"/>${recipe === 1 ? '<path d="M10 35q0-17 22-17t22 17q-20 11-44 0z" fill="#efb62c" stroke="#b9852c" stroke-width="2"/><path d="M16 34q16 5 32 0" fill="none" stroke="#ffd35f" stroke-width="3"/>' : chips ? '<path d="M10 41l12-23 12 23zM29 39l13-20 12 22z" fill="#e9b34b" stroke="#a2743e" stroke-width="2"/>' : tacos ? '<path d="M8 41q0-27 22-12q-10 3-8 14zM32 41q0-27 22-12q-10 3-8 14z" fill="#d7aa62"/><path d="M16 30l9 5m15-5l9 5" stroke="#702f26" stroke-width="5"/>' : sushi ? '<rect x="10" y="23" width="18" height="20" rx="4" fill="#fff5dc"/><rect x="33" y="23" width="18" height="20" rx="4" fill="#fff5dc"/><path d="M10 23h18v9H10zm23 0h18v9H33" fill="#f4be35"/><path d="M17 23h5v20h-5zm23 0h5v20h-5" fill="#193d28"/>' : wrap ? '<rect x="7" y="20" width="48" height="25" rx="12" fill="#eac68b"/><ellipse cx="51" cy="32" rx="6" ry="11" fill="#702f26"/><path d="M17 24l5 5m6-6l5 5m-4 9l6 4" stroke="#a2743e" stroke-width="3"/>' : `<ellipse cx="32" cy="34" rx="22" ry="13" fill="${recipe === 5 ? "#c44b28" : "#d7ad68"}"/>${recipe & 1 ? '<ellipse cx="32" cy="31" rx="11" ry="7" fill="#fff0cb"/><circle cx="33" cy="30" r="4" fill="#f1ad1d"/>' : ""}${recipe & 4 ? '<path d="M15 35l4 2m24-3l5 1m-26 5l4 1" stroke="#702f26" stroke-width="5"/>' : ""}`}<path d="M20 34l3-2m18 6l3-2" stroke="#35853e" stroke-width="3"/></svg>`;
}
export function makeIngredient(index: number) {
  const root = new T.Group();
  root.name = [
    "ingredient-eggs",
    "ingredient-rice",
    "ingredient-beans",
    "ingredient-tortillas",
  ][index];
  const colors = ["#fff0cc", "#e9d49b", "#713e2b", "#d9ad69"];
  const mat = new T.MeshStandardMaterial({
    color: colors[index],
    roughness: 0.7,
  });
  const n = index === 3 ? 1 : index === 0 ? 2 : 14;
  for (let i = 0; i < n; i++) {
    const m = new T.Mesh(
      index === 3
        ? new T.CylinderGeometry(0.22, 0.22, 0.017, 20)
        : new T.SphereGeometry(1, 8, 6),
      mat,
    );
    if (index !== 3)
      m.scale.set(
        index === 0 ? 0.07 : index === 1 ? 0.025 : 0.032,
        index === 0 ? 0.025 : 0.013,
        index === 0 ? 0.055 : 0.018,
      );
    m.position.set(
      Math.sin(i * 2.4) * 0.15,
      i * 0.004,
      Math.cos(i * 2.4) * 0.15,
    );
    root.add(m);
  }
  return root;
}
