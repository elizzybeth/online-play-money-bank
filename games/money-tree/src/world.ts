import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { type Rect, opening } from "./game";
export type Target = { id: string; x: number; z: number; label: string };
export function createWorld(scene: T.Scene) {
  const rects: Rect[] = [],
    occluders: T.Object3D[] = [],
    targets: Target[] = [],
    bills: T.Object3D[] = [],
    plots: T.Group[] = [];
  const mat = (c: string) =>
    new T.MeshStandardMaterial({ color: c, roughness: 0.9 });
  const colors = {
    grass: "#a4bd77",
    wood: "#a48162",
    cream: "#f6e3bd",
    roof: "#a75e53",
  };
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    c: string,
    solid = false,
    parent: T.Object3D = scene,
  ) {
    const m = new T.Mesh(
      c === "#303832" || c === "#93c276" || c === "#a8d769" || c === "#41633f"
        ? new T.BoxGeometry(w, h, d)
        : new RoundedBoxGeometry(
            w,
            h,
            d,
            2,
            Math.min(0.15, w * 0.15, h * 0.15, d * 0.15),
          ),
      mat(c),
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    if (solid) {
      rects.push({ x, z, w, d });
      occluders.push(m);
    }
    return m;
  }
  function ball(
    x: number,
    y: number,
    z: number,
    r: number,
    c: string,
    parent: T.Object3D = scene,
  ) {
    const m = new T.Mesh(new T.SphereGeometry(r, 12, 8), mat(c));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  function cyl(
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    c: string,
    parent: T.Object3D = scene,
  ) {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 10), mat(c));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  function label(
    text: string,
    x: number,
    y: number,
    z: number,
    width = 4,
    color = "#334a3c",
  ) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#faf1d8";
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = "#af996b";
    ctx.lineWidth = 9;
    ctx.strokeRect(5, 5, 502, 118);
    ctx.fillStyle = color;
    ctx.font = "bold 43px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 66);
    const mesh = new T.Mesh(
      new T.PlaneGeometry(width, width / 4),
      new T.MeshBasicMaterial({
        map: new T.CanvasTexture(c),
        side: T.DoubleSide,
      }),
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }
  function target(id: string, x: number, z: number, label: string) {
    targets.push({ id, x, z, label });
  }
  function person(
    x: number,
    z: number,
    c: string,
    hair: string,
    old = false,
    solid = true,
  ) {
    if (solid) rects.push({ x, z, w: 0.65, d: 0.65 });
    const g = new T.Group();
    scene.add(g);
    g.position.set(x, 0, z);
    ball(0, 0.77, 0, 0.4, c, g).scale.set(0.9, 1.15, 0.7);
    ball(0, 1.47, 0, 0.48, "#f3cfb0", g);
    ball(0, 1.7, -0.05, 0.47, hair, g).scale.set(1, 0.66, 1);
    for (const a of [-1, 1]) {
      ball(a * 0.15, 0.16, 0, 0.16, "#544c41", g).scale.set(1, 1, 1.5);
      ball(a * 0.43, 0.79, 0, 0.15, "#f3cfb0", g);
      ball(a * 0.16, 1.49, 0.427, 0.04, "#343630", g);
    }
    if (old) {
      ball(0, 1.25, 0.31, 0.27, "#eee9db", g);
      box(0, 0.77, 0.32, 0.48, 0.68, 0.08, "#e8d5a1", false, g);
    }
    return g;
  }
  const treeRects: (Rect | undefined)[] = [],
    treeTrunks: (T.Object3D | undefined)[] = [];
  const dollarCanvas = document.createElement("canvas");
  dollarCanvas.width = 128;
  dollarCanvas.height = 64;
  const dc = dollarCanvas.getContext("2d")!;
  dc.strokeStyle = "#345b39";
  dc.lineWidth = 4;
  dc.strokeRect(4, 4, 120, 56);
  dc.fillStyle = "#345b39";
  dc.font = "bold 48px Georgia";
  dc.textAlign = "center";
  dc.fillText("$", 64, 48);
  const dollarMaterial = new T.MeshBasicMaterial({
    map: new T.CanvasTexture(dollarCanvas),
    transparent: true,
  });
  const player = person(-15, 5, "#dfae6b", "#594637", false, false);
  const sleeping = new T.Group();
  scene.add(sleeping);
  for (const a of [-1, 1]) {
    const leg = ball(-19.1 + a * 0.26, 1.02, 1.7, 0.19, "#d9b6bd", sleeping);
    leg.scale.set(1, 0.65, 2.5);
    const foot = ball(-19.1 + a * 0.26, 1.12, 2.15, 0.18, "#f3cfb0", sleeping);
    foot.scale.set(1, 0.8, 1.3);
  }
  box(0, -0.25, 0, 100, 0.5, 90, colors.grass);
  box(3, 0.005, 0, 5, 0.04, 78, "#d7cba9");
  box(15, 0.01, -16, 52, 0.04, 5, "#d7cba9");
  // Home: north bedroom, south living room; open doorways on south walls.
  box(-15, -0.02, 6, 12, 0.1, 16, "#dbbe96");
  box(-21, 1.7, 6, 0.25, 3.4, 16, "#e8d2b3", true);
  box(-9, 1.7, 6, 0.25, 3.4, 16, "#e8d2b3", true);
  box(-15, 1.7, -2, 12, 3.4, 0.25, "#e8d2b3", true);
  for (const z of [6, 14]) {
    box(-19, 1.7, z, 4, 3.4, 0.25, "#e8d2b3", true);
    box(-12, 1.7, z, 6, 3.4, 0.25, "#e8d2b3", true);
    occluders.push(box(-16, 3.05, z, 2, 0.7, 0.25, "#e8d2b3"));
  }
  box(-19.1, 0.3, 1, 2, 0.6, 3.5, "#9a755b", true);
  box(-19.1, 0.69, 1, 2, 0.25, 3.3, "#f0e5cf");
  box(-19.1, 0.87, 1.5, 2, 0.14, 2.2, "#b3bd98");
  box(-19.1, 0.91, -0.05, 1.5, 0.2, 0.7, "#ffefd3");
  target("bed", -17.5, 1, "Sleep until tomorrow");
  box(-12, 0.7, 0, 3, 1.4, 1, "#a17f5e", true);
  box(-12, 1.43, 0, 3.3, 0.12, 1.2, "#b7946a");
  box(-12, 1.52, 0.15, 0.7, 0.06, 0.5, "#fff9e9");
  box(-12, 1.56, 0.15, 0.025, 0.02, 0.5, "#c0ad89");
  const paper = document.createElement("canvas");
  paper.width = 512;
  paper.height = 384;
  const pc = paper.getContext("2d")!;
  pc.fillStyle = "#fff9e9";
  pc.fillRect(0, 0, 512, 384);
  pc.fillStyle = "#655948";
  pc.font = "italic 23px Georgia";
  let line = "",
    py = 45;
  for (const word of opening.split(" ")) {
    if (pc.measureText(line + word).width > 450) {
      pc.fillText(line, 28, py);
      line = "";
      py += 30;
    }
    line += word + " ";
  }
  pc.fillText(line, 28, py);
  const page = new T.Mesh(
    new T.PlaneGeometry(0.69, 0.49),
    new T.MeshBasicMaterial({ map: new T.CanvasTexture(paper) }),
  );
  page.rotation.x = -Math.PI / 2;
  page.position.set(-12, 1.565, 0.15);
  scene.add(page);
  target("notebook", -12, 1.3, "Read your notebook");
  const lamp = new T.PointLight("#ffd492", 1.3, 6);
  lamp.position.set(-13, 2, 0);
  scene.add(lamp);
  box(-17, 1.9, -1.83, 2.2, 1.45, 0.08, "#b8d9d1");
  box(-17, 1.9, -1.76, 0.1, 1.5, 0.05, "#f7e9ca");
  box(-17, 1.9, -1.75, 2.2, 0.09, 0.05, "#f7e9ca");
  cyl(-13, 1.6, 0, 0.18, 0.3, "#877359");
  ball(-13, 1.96, 0, 0.38, "#f6d58e").scale.set(1, 0.7, 1);
  ball(-10.6, 1.65, 0, 0.26, "#e9a7a1");
  ball(-10.6, 1.63, 0.23, 0.1, "#de8f90");
  box(-10.6, 1.9, 0, 0.16, 0.02, 0.025, "#805c59");
  target("bank", -10.8, 1.4, "Use piggy bank");
  box(-19, 0.45, 10, 2.4, 0.9, 3.3, "#92a296", true);
  box(-19, 0.85, 10, 1.6, 0.3, 3, "#b6c2a9");
  box(-20, 0.95, 10, 0.35, 1.4, 3.5, "#899c8c");
  const mom = person(-18.9, 10, "#d9b6bd", "#7d6257");
  mom.rotation.y = Math.PI / 2;
  target("mom", -17.4, 10, "Talk to Mom");
  box(-10.1, 0.6, 10, 1.1, 1.2, 3, "#9b805f", true);
  box(-10, 1.65, 10, 0.23, 1.2, 2, "#434b45");
  box(-10.14, 1.65, 10, 0.03, 0.92, 1.65, "#93c7c8");
  box(-14, 0.03, 10, 4, 0.04, 4, "#d1a38a");
  label("HOME", -15, 3.9, 14.1, 2.5);
  // Garden and open fence gate.
  for (let i = 0; i < 5; i++) {
    const x = -20 + i * 2;
    box(x, 0.04, 19, 1.6, 0.16, 3, "#805943");
    const g = new T.Group();
    g.position.set(x, 0, 19);
    scene.add(g);
    plots.push(g);
    target(`plot${i}`, x, 20.6, `Garden plot ${i + 1}`);
  }
  for (let i = 0; i < 15; i++) {
    const x = -22 + i;
    if (x > -17 && x < -14) continue;
    box(x, 0.55, 23, 0.12, 1.1, 0.15, "#d7b68a", true);
    box(x, 0.45, 23, 0.85, 0.12, 0.1, "#c3a176");
    box(x, 0.83, 23, 0.85, 0.12, 0.1, "#c3a176");
  }
  box(-5, 0.02, 19, 8, 0.04, 2, "#d7cba9");
  box(-16, 0.02, 22, 2, 0.04, 5, "#d7cba9");
  function foliage(x: number, z: number, r = 1) {
    cyl(x, 0.9, z, 0.17, 1.8, "#826b50");
    ball(x, 2.4, z, r, "#6f9977");
    ball(x + 0.55, 2.3, z + 0.2, r * 0.7, "#92b080");
    rects.push({ x, z, w: 0.4, d: 0.4 });
  }
  function house(x: number, z: number, c: string, name: string) {
    box(x, 1.6, z, 7, 3.2, 6, c, true);
    const roof = new T.Mesh(new T.ConeGeometry(5.3, 2, 4), mat("#a76f60"));
    roof.position.set(x, 4, z);
    roof.rotation.y = Math.PI / 4;
    scene.add(roof);
    roof.userData.roof = true;
    (roof.material as T.MeshStandardMaterial).side = T.DoubleSide;
    occluders.push(roof);
    box(x, 1, z + 3.03, 1.2, 2, 0.12, "#8b6e53");
    for (const a of [-2, 2]) box(x + a, 1.8, z + 3.1, 1.2, 1.2, 0.1, "#bce0d9");
    label(name, x, 3.1, z + 3.16, 3.7);
    for (let a = 0; a < 4; a++)
      ball(x - 2 + a * 1.3, 0.45, z + 4.5, 0.45, "#adc88a");
  }
  house(12, 15, "#dcbab0", "THE WILLOWS");
  house(12, 1, "#efdbaf", "ROSE COTTAGE");
  house(-14, -13, "#c4d2b0", "MAPLE HOUSE");
  person(10, 20, "#bda9d4", "#79584b");
  target("npc1", 10, 20, "Talk to Bea");
  person(12, 6, "#abc0cf", "#c49a62");
  target("npc2", 12, 6, "Talk to Jun");
  person(-10, -8, "#dea58d", "#5f5549");
  target("npc3", -10, -8, "Talk to Mabel");
  // Robertsons walk-in shop at end of lane, front facing south.
  const sx = 8,
    sz = -29;
  box(sx, -0.01, sz, 12, 0.12, 12, "#d0b894");
  box(2, 1.8, sz, 0.25, 3.6, 12, "#a9b9a2", true);
  box(14, 1.8, sz, 0.25, 3.6, 12, "#a9b9a2", true);
  box(8, 1.8, -35, 12, 3.6, 0.25, "#a9b9a2", true);
  box(4, 1.8, -23, 4, 3.6, 0.25, "#a9b9a2", true);
  box(11, 1.8, -23, 6, 3.6, 0.25, "#a9b9a2", true);
  occluders.push(box(7, 3.2, -23, 2, 1, 0.25, "#a9b9a2"));
  label("ROBERTSONS", 8, 4.2, -22.85, 8);
  label("HARDWARE & GROCERIES", 8, 3.55, -22.83, 5);
  for (const x of [3, 13]) {
    box(x, 1, -29, 1, 2, 7, "#947859", true);
    for (let j = 0; j < 6; j++) {
      box(x, 1.3, -32 + j * 1.1, 0.65, 0.5, 0.6, j % 2 ? "#c9b466" : "#c78e6f");
      box(x, 2.2, -32 + j * 1.1, 0.65, 0.5, 0.6, j % 2 ? "#8caa86" : "#d2ad93");
    }
  }
  box(8, 0.5, -33, 5, 1, 1, "#8b7456", true);
  person(8, -34, "#708b75", "#eee9db", true);
  target("robertson", 8, -31.7, "Talk to Ol’ Man Robertson");
  for (const [id, x, z, name, color] of [
    ["can", 5, -26, "WATERING CAN · $1", "#86ada5"],
    ["shovel", 10, -26, "SHOVEL · $1", "#9da5a2"],
    ["fertilizer", 11, -30, "FERTILIZER · $5", "#d7c18b"],
  ] as const) {
    box(x, 0.45, z, 1.1, 0.9, 1, "#b2946d", true);
    if (id === "can") {
      cyl(x, 1.2, z, 0.25, 0.55, color);
      box(x + 0.35, 1.25, z, 0.4, 0.12, 0.13, color);
    } else if (id === "shovel") {
      cyl(x, 1.6, z, 0.045, 1.3, "#a08056");
      box(x, 1, z, 0.3, 0.35, 0.1, color);
    } else box(x, 1.2, z, 0.6, 0.6, 0.5, color);
    target(id, x, z + 1.1, `Buy ${id}`);
    label(name, x, 2.25, z + 0.4, 2.5);
  }
  house(24, -29, "#e4bc9e", "THREAD & THIMBLE");
  target("haberdashery", 24, -24, "Visit the haberdashery");
  house(-7, -29, "#b5c4cd", "SPOKE & SADDLE");
  target("bicycle", -7, -24, "Visit the bicycle shop");
  for (let i = 0; i < 30; i++) {
    const x = i % 2 ? -28 - (i % 4) * 2 : 30 + (i % 4) * 2,
      z = -38 + i * 2.5;
    foliage(x, z, 1.7);
  }
  for (const [x, z] of [
    [-5, 10],
    [-4, -5],
    [19, 9],
    [20, -6],
    [-23, -19],
    [28, -19],
  ])
    foliage(x, z, 1.4);
  // Flower clumps, stones, clouds, distant hills.
  for (let i = 0; i < 65; i++) {
    const x = Math.sin(i * 11.2) * 29,
      z = Math.cos(i * 3.7) * 35;
    if (
      Math.abs(x - 3) < 4 ||
      (x < -8 && x > -23 && z > -3 && z < 25) ||
      (x > 1 && x < 15 && z < -22)
    )
      continue;
    ball(x, 0.14, z, 0.18, i % 3 ? "#f0d295" : "#dda7ae");
  }
  for (let i = 0; i < 12; i++) {
    ball(-45 + i * 9, 2, -44, 7, "#93ae82").scale.set(1, 1.3, 1);
    ball(-45 + i * 9, 2, 45, 7, "#93ae82").scale.set(1, 1.3, 1);
  }
  for (let i = 0; i < 9; i++) {
    const g = new T.Group();
    g.position.set(-45 + i * 12, 19 + (i % 3) * 2, -25 + (i % 4) * 13);
    scene.add(g);
    for (let j = 0; j < 3; j++)
      ball(j * 1.6, 0, 0, 1.8, "#f6eedc", g).scale.set(1, 0.65, 0.8);
  }
  // Invisible perimeter.
  rects.push(
    { x: -39, z: 0, w: 1, d: 90 },
    { x: 39, z: 0, w: 1, d: 90 },
    { x: 0, z: -40, w: 80, d: 1 },
    { x: 0, z: 39, w: 80, d: 1 },
  );
  function moneyTree(index: number, stage: string, fertilized: boolean) {
    const g = plots[index];
    if (treeRects[index]) {
      rects.splice(rects.indexOf(treeRects[index]!), 1);
      treeRects[index] = undefined;
    }
    if (treeTrunks[index]) {
      const at = occluders.indexOf(treeTrunks[index]!);
      if (at >= 0) occluders.splice(at, 1);
      treeTrunks[index] = undefined;
    }
    for (let i = bills.length - 1; i >= 0; i--) {
      if (bills[i].parent === g) bills.splice(i, 1);
    }
    while (g.children.length) {
      const child = g.children[0];
      g.remove(child);
      child.traverse((o) => {
        if (o instanceof T.Mesh) {
          o.geometry.dispose();
          if (o.material instanceof T.Material && o.material !== dollarMaterial)
            o.material.dispose();
        }
      });
    }
    if (stage === "empty") return;
    if (stage === "planted") {
      ball(0, 0.12, 0, 0.17, "#94ba77", g);
      return;
    }
    const height = stage === "growing" ? 1.5 : 2.5;
    const trunk = box(0, height / 2, 0, 0.2, height, 0.2, "#303832", false, g);
    trunk.rotation.z = 0.12;
    treeRects[index] = { x: g.position.x, z: g.position.z, w: 0.28, d: 0.28 };
    rects.push(treeRects[index]!);
    treeTrunks[index] = trunk;
    occluders.push(trunk);
    for (let j = 0; j < 6; j++) {
      const a = j * 2.4,
        branch = box(
          Math.sin(a) * 0.44,
          height * (0.45 + j * 0.065),
          Math.cos(a) * 0.35,
          0.13,
          1.1,
          0.13,
          "#303832",
          false,
          g,
        );
      branch.rotation.z = Math.sin(a) * 0.9;
      branch.rotation.x = Math.cos(a) * 0.7;
    }
    if (stage === "ready" || stage === "growing") {
      for (let j = 0; j < (stage === "ready" ? 18 : 6); j++) {
        const a = j * 2.4;
        const bill = box(
          Math.sin(a) * (0.6 + (j % 3) * 0.14),
          height * 0.6 + (j % 5) * 0.22,
          Math.cos(a) * 0.75,
          0.42,
          0.22,
          0.025,
          fertilized ? "#a8d769" : "#93c276",
          false,
          g,
        );
        bill.rotation.set(0.2, a, 0.2);
        bill.userData.phase = j;
        for (const side of [-1, 1]) {
          const mark = new T.Mesh(
            new T.PlaneGeometry(0.38, 0.19),
            dollarMaterial,
          );
          mark.position.z = side * 0.014;
          mark.rotation.y = side === 1 ? 0 : Math.PI;
          bill.add(mark);
        }
        bills.push(bill);
      }
    }
  }
  return {
    player,
    sleeping,
    mom,
    rects,
    occluders,
    targets,
    plots,
    bills,
    moneyTree,
  };
}
