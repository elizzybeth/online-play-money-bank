import { makeSeedPacket } from "./seed-packet";
import { makeGardenTool } from "./tool-models";
import { signCanvas } from "./signage";
import { createSigmaWorld } from "./sigma-world";
import { moneySkeleton } from "./money-tree-model";
import { surfaceMaterial, surfaceTexture } from "./textures";
import { hats, type HatId } from "./hats";
import { makeHat } from "./hat-models";
import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { type Rect, type Plot, opening, momStatus } from "./game";
export type Target = { id: string; x: number; z: number; label: string };
export function createWorld(scene: T.Scene) {
  const rects: Rect[] = [],
    occluders: T.Object3D[] = [],
    targets: Target[] = [],
    bills: T.Object3D[] = [],
    plots: T.Group[] = [];
  const paths: Rect[] = [
    { x: 3, z: 0, w: 5, d: 78 },
    { x: 15, z: -16, w: 52, d: 5 },
    { x: -8.25, z: 25, w: 17.5, d: 2 },
    { x: -16, z: 20, w: 2, d: 12 },
    { x: 24, z: -20, w: 3, d: 9 },
    { x: 34, z: -29.25, w: 3, d: 26.5 },
  ];
  const doorways: Rect[] = [];
  const scenery: { x: number; z: number; radius: number; kind: string }[] = [];
  const overlaps = (x: number, z: number, radius: number, r: Rect) =>
    x + radius > r.x - r.w / 2 &&
    x - radius < r.x + r.w / 2 &&
    z + radius > r.z - r.d / 2 &&
    z - radius < r.z + r.d / 2;
  // Reserve the walk-in shop interior before scattering outdoor scenery.
  const sceneryExclusions: Rect[] = [
    { x: 24, z: -29, w: 12, d: 12 },
    { x: 8, z: -31, w: 16, d: 16 },
    { x: -5, z: 10, w: 8, d: 8 },
  ];
  const clearScenery = (x: number, z: number, radius: number) =>
    !paths
      .concat(doorways, sceneryExclusions)
      .some((r) => overlaps(x, z, radius, r));
  const speakers: { id: string; name: string; object: T.Object3D }[] = [];
  const woodColors = new Set([
    "#a48162",
    "#b2946d",
    "#947859",
    "#8b7456",
    "#d7b68a",
    "#c3a176",
    "#a08056",
    "#877359",
    "#8b6e53",
  ]);
  const wallColors = new Set([
    "#dcbab0",
    "#efdbaf",
    "#c4d2b0",
    "#a9b9a2",
    "#ead9b5",
    "#cfc4a8",
    "#e6d4b0",
  ]);
  const leafColors = new Set(["#6f9977", "#92b080", "#adc88a", "#93ae82"]);
  const mat = (c: string) =>
    woodColors.has(c)
      ? surfaceMaterial(c, "wood")
      : wallColors.has(c)
        ? surfaceMaterial(c, "plaster", 2, 2)
        : leafColors.has(c)
          ? surfaceMaterial(c, "leaf", 2, 2)
          : c === "#303832"
            ? surfaceMaterial(c, "bark", 1, 3)
            : new T.MeshStandardMaterial({ color: c, roughness: 0.9 });
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
    if (parent === scene && h >= 2.8 && (w > 2 || d > 2))
      m.material = surfaceMaterial(c, "plaster", Math.max(w, d) / 2, h / 2);
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
    aspect = 4,
  ) {
    const c = signCanvas(text, 128 * aspect, 128);
    const mesh = new T.Mesh(
      new T.PlaneGeometry(width, width / aspect),
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
    if (solid) rects.push({ x, z, w: 0.96, d: 0.96 });
    const g = new T.Group();
    scene.add(g);
    g.position.set(x, 0, z);
    g.userData.isNPC = solid;
    const body = ball(0, 0.77, 0, 0.4, c, g);
    body.name = "body";
    body.material = surfaceMaterial(c, "cloth", 2, 2);
    body.scale.set(0.9, 1.15, 0.7);
    const head = ball(0, 1.47, 0, 0.48, "#f3cfb0", g);
    head.name = "head";
    const hairMesh = ball(0, 1.7, -0.05, 0.47, hair, g);
    hairMesh.material = surfaceMaterial(hair, "hair", 2, 1);
    hairMesh.scale.set(1, 0.66, 1);
    for (let i = 0; i < 4; i++) {
      const lock = ball(-0.27 + i * 0.18, 1.69, 0.27, 0.13, hair, g);
      lock.scale.set(0.85, 1.5, 0.7);
      lock.material = surfaceMaterial(hair, "hair");
    }
    const collar = ball(0, 1.06, 0.16, 0.14, "#eee3cd", g);
    collar.scale.set(1.45, 0.35, 1);
    collar.material = surfaceMaterial("#eee3cd", "cloth");
    for (const a of [-1, 1]) {
      const foot = ball(a * 0.15, 0.16, 0, 0.16, "#544c41", g);
      foot.name = "foot";
      foot.scale.set(1, 1, 1.5);
      ball(a * 0.43, 0.79, 0, 0.15, "#f3cfb0", g).name = `hand-${a}`;
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
  const diggingTool = makeGardenTool("shovel");
  diggingTool.scale.setScalar(0.7);
  diggingTool.visible = false;
  player.add(diggingTool);
  function setDigging(active: boolean, shovel: boolean, time: number) {
    diggingTool.visible = active && shovel;
    const stroke = Math.sin(time * Math.PI * 3);
    for (const hand of player.children.filter((o) =>
      o.name.startsWith("hand-"),
    )) {
      const side = hand.name === "hand--1" ? -1 : 1;
      hand.position.set(
        side * 0.43,
        active ? (shovel ? 0.71 : 0.5) + stroke * 0.13 : 0.79,
        active ? 0.3 + stroke * 0.09 : 0,
      );
    }
    diggingTool.rotation.x = active ? -0.9 - stroke * 0.25 : 0;
    diggingTool.position.set(0.2, active ? 0.8 : 0, 0.24);
    // Shift the shaft's grip to the hands; blade swings down into the soil.
    for (const child of diggingTool.children)
      if (!child.userData.gripAdjusted) {
        child.position.y -= 0.9;
        child.userData.gripAdjusted = true;
      }
    player.getObjectByName("body")!.rotation.x = active ? 0.16 : 0;
  }
  const sleeping = new T.Group();
  scene.add(sleeping);
  // The same complete chibi character, lying face-up with head on the pillow.
  const sleeper = person(0, 0, "#dfae6b", "#594637", false, false);
  scene.remove(sleeper);
  sleeper.rotation.x = -Math.PI / 2;
  sleeper.position.set(-19.1, 1.14, 1.75);
  sleeping.add(sleeper);
  box(0, -0.25, -25, 100, 0.5, 140, colors.grass).material = surfaceMaterial(
    colors.grass,
    "grass",
    50,
    45,
  );
  // Draw the union once: overlapping sidewalk rectangles used to flicker.
  const xs = [
    ...new Set(paths.flatMap((p) => [p.x - p.w / 2, p.x + p.w / 2])),
  ].sort((a, b) => a - b);
  const zs = [
    ...new Set(paths.flatMap((p) => [p.z - p.d / 2, p.z + p.d / 2])),
  ].sort((a, b) => a - b);
  const vertices: number[] = [],
    uv: number[] = [];
  for (let i = 0; i < xs.length - 1; i++)
    for (let j = 0; j < zs.length - 1; j++) {
      const [a, b, c, d] = [xs[i], xs[i + 1], zs[j], zs[j + 1]];
      if (
        !paths.some(
          (p) =>
            (a + b) / 2 >= p.x - p.w / 2 &&
            (a + b) / 2 <= p.x + p.w / 2 &&
            (c + d) / 2 >= p.z - p.d / 2 &&
            (c + d) / 2 <= p.z + p.d / 2,
        )
      )
        continue;
      for (const [x, z] of [
        [a, c],
        [a, d],
        [b, d],
        [a, c],
        [b, d],
        [b, c],
      ]) {
        vertices.push(x, 0.04, z);
        uv.push(x / 2, z / 2);
      }
    }
  const pavement = new T.BufferGeometry();
  pavement.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  pavement.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  pavement.computeVertexNormals();
  const sidewalk = new T.Mesh(
    pavement,
    surfaceMaterial("#d7cba9", "path", 1, 1),
  );
  sidewalk.name = "continuous-sidewalk";
  scene.add(sidewalk);
  // Home: north bedroom, south living room; open doorways on south walls.
  const roofMaterial = surfaceMaterial("#ad7762", "shingles", 5, 3);
  roofMaterial.transparent = true;
  const homeRoof = new T.Mesh(
    new T.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4),
    roofMaterial,
  );
  homeRoof.name = "home-roof";
  homeRoof.position.set(-15, 4.75, 6);
  homeRoof.scale.set(9.8, 2.7, 12);
  homeRoof.userData.roof = true;
  homeRoof.castShadow = true;
  scene.add(homeRoof);
  const momRoof = new T.Mesh(
    new T.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4),
    roofMaterial,
  );
  momRoof.position.set(-5, 4.3, 10);
  momRoof.scale.set(6.5, 2.2, 6.5);
  momRoof.name = "mom-bedroom-roof";
  scene.add(momRoof);
  box(-15, -0.02, 6, 12, 0.1, 16, "#dbbe96");
  box(-21, 1.7, 6, 0.25, 3.4, 16, "#e8d2b3", true);
  box(-5, -0.02, 10, 8, 0.1, 8, "#dbbe96");
  box(-1, 1.7, 10, 0.25, 3.4, 8, "#e8d2b3", true);
  for (const z of [6, 14]) box(-5, 1.7, z, 8, 3.4, 0.25, "#e8d2b3", true);
  box(-4, 0.3, 10, 2, 0.6, 3.5, "#9a755b", true);
  box(-4, 0.69, 10, 2, 0.25, 3.3, "#f0e5cf");
  box(-4, 0.87, 10.5, 2, 0.14, 2.2, "#b5a4b5");
  box(-4, 0.91, 8.95, 1.5, 0.2, 0.7, "#ffefd3");
  box(-2.4, 0.6, 7.2, 1.2, 1.2, 0.7, "#a48162", true);
  ball(-2.4, 1.6, 7.2, 0.25, "#ead596").scale.set(1, 0.7, 1);
  box(-1.15, 1.8, 10, 0.08, 1.2, 1.5, "#bce0d9");
  doorways.push({ x: -9, z: 7.5, w: 2, d: 2.4 });
  box(-9, 1.7, 2.25, 0.25, 3.4, 8.5, "#e8d2b3", true);
  box(-9, 1.7, 11.25, 0.25, 3.4, 5.5, "#e8d2b3", true);
  occluders.push(box(-9, 3.28, 7.5, 0.25, 0.24, 2, "#e8d2b3"));
  box(-15, 1.7, -2, 12, 3.4, 0.25, "#e8d2b3", true);
  for (const z of [6, 14]) {
    box(-19, 1.7, z, 4, 3.4, 0.25, "#e8d2b3", true);
    box(-12, 1.7, z, 6, 3.4, 0.25, "#e8d2b3", true);
    occluders.push(box(-16, 3.28, z, 2, 0.24, 0.25, "#e8d2b3"));
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
  paper.width = 768;
  paper.height = 512;
  const pc = paper.getContext("2d")!;
  const notebookMap = new T.CanvasTexture(paper);
  notebookMap.colorSpace = T.SRGBColorSpace;
  let lastNotebook = "";
  function updateNotebook(entry: string, day: number) {
    const key = day + entry;
    if (key === lastNotebook) return;
    lastNotebook = key;
    pc.fillStyle = "#fff1b6";
    pc.fillRect(0, 0, 768, 512);
    for (const side of [0, 384]) {
      pc.strokeStyle = "#92aa7270";
      pc.lineWidth = 1;
      for (let y = 58; y < 500; y += 32) {
        pc.beginPath();
        pc.moveTo(side + 18, y);
        pc.lineTo(side + 366, y);
        pc.stroke();
      }
      pc.strokeStyle = "#7c9c7466";
      pc.beginPath();
      pc.moveTo(side + 38, 15);
      pc.lineTo(side + 38, 496);
      pc.stroke();
    }
    const fold = pc.createLinearGradient(365, 0, 403, 0);
    fold.addColorStop(0, "#846c3900");
    fold.addColorStop(0.5, "#846c3977");
    fold.addColorStop(1, "#846c3900");
    pc.fillStyle = fold;
    pc.fillRect(365, 0, 38, 512);
    pc.fillStyle = "#425b3e";
    pc.font = "34px Gaegu";
    pc.fillText("My notebook", 48, 49);
    pc.fillText("for Mom", 68, 436);
    pc.strokeStyle = "#5c7b4d";
    pc.lineWidth = 3;
    pc.beginPath();
    pc.moveTo(163, 311);
    pc.bezierCurveTo(151, 235, 181, 210, 165, 160);
    pc.moveTo(166, 223);
    pc.bezierCurveTo(119, 220, 115, 184, 156, 202);
    pc.moveTo(166, 208);
    pc.bezierCurveTo(209, 207, 219, 178, 172, 182);
    pc.stroke();
    pc.font = "32px Gaegu";
    pc.fillText(`Day ${day}`, 432, 49);
    pc.font = "28px Gaegu";
    let line = "",
      py = 88;
    const words = entry.replace(/^Day \d+\s*/, "").split(/\s+/);
    for (const word of words) {
      if (pc.measureText(line + word).width > 295) {
        pc.fillText(line, 432, py);
        line = "";
        py += 32;
        if (py > 464) break;
      }
      line += word + " ";
    }
    if (py <= 464) pc.fillText(line, 432, py);
    notebookMap.needsUpdate = true;
  }
  updateNotebook(opening, 1);
  const page = new T.Mesh(
    new T.PlaneGeometry(0.69, 0.49),
    new T.MeshBasicMaterial({ map: notebookMap }),
  );
  page.name = "open-notebook-pages";
  page.userData.writingBounds = { left: 432, right: 727, gutter: 384 };
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
  const seatedLegs = new T.Group();
  mom.add(seatedLegs);
  // No extended limbs: compact seated feet rest directly in front of her dress.

  const momCollider = rects.find((r) => r.x === -18.9 && r.z === 10)!;
  box(-12.5, 0.5, 12.8, 2, 1, 0.8, "#ead9b5", true);
  const worktop = box(-12.5, 1.04, 12.8, 1.9, 0.09, 0.75, "#6a756b");
  const cooking = new T.Group();
  scene.add(cooking);
  cyl(-12.5, 1.2, 12.8, 0.27, 0.25, "#829f97", cooking);
  box(-12.06, 1.27, 12.8, 0.4, 0.06, 0.1, "#716455", false, cooking);
  const steam = ball(-12.5, 1.6, 12.8, 0.13, "#e7ece1", cooking);
  steam.scale.set(0.7, 1.6, 0.7);
  const birdhouses = new T.Group();
  scene.add(birdhouses);
  for (const dx of [-0.42, 0.35]) {
    box(-12.5 + dx, 1.32, 12.8, 0.48, 0.5, 0.42, "#bc9667", false, birdhouses);
    const roof = new T.Mesh(
      new T.ConeGeometry(0.42, 0.3, 4),
      mat(dx < 0 ? "#789083" : "#b47664"),
    );
    roof.position.set(-12.5 + dx, 1.7, 12.8);
    roof.rotation.y = Math.PI / 4;
    birdhouses.add(roof);
    ball(-12.5 + dx, 1.37, 12.57, 0.075, "#514734", birdhouses).scale.z = 0.2;
  }
  const painting = new T.Group();
  scene.add(painting);
  box(-12.5, 1.8, 12.8, 1.05, 1.25, 0.07, "#b89468", false, painting);
  const picture = box(
    -12.5,
    1.8,
    12.75,
    0.9,
    1.1,
    0.04,
    "#e9dca6",
    false,
    painting,
  );
  const paintCanvas = document.createElement("canvas");
  paintCanvas.width = 128;
  paintCanvas.height = 160;
  const paint = paintCanvas.getContext("2d")!;
  paint.fillStyle = "#bad7d6";
  paint.fillRect(0, 0, 128, 160);
  paint.fillStyle = "#ead389";
  paint.beginPath();
  paint.arc(100, 30, 15, 0, 7);
  paint.fill();
  paint.fillStyle = "#8db07a";
  paint.fillRect(0, 90, 128, 70);
  paint.fillStyle = "#776148";
  paint.fillRect(42, 55, 8, 75);
  paint.fillStyle = "#688f69";
  paint.beginPath();
  paint.arc(45, 65, 29, 0, 7);
  paint.fill();
  (picture.material as T.MeshStandardMaterial).color.set("white");
  (picture.material as T.MeshStandardMaterial).map = new T.CanvasTexture(
    paintCanvas,
  );
  const book = new T.Group();
  mom.add(book);
  box(0, 0.87, 0.4, 0.6, 0.07, 0.4, "#517b61", false, book);
  box(0, 0.92, 0.4, 0.53, 0.03, 0.35, "#fff0b1", false, book);
  box(0, 0.94, 0.4, 0.016, 0.02, 0.36, "#8ca379", false, book);
  const activityProps = new Map<string, T.Group>();
  for (const id of ["mending", "puzzles", "music", "letters", "feeding"]) {
    const g = new T.Group();
    g.name = `mom-${id}`;
    scene.add(g);
    activityProps.set(id, g);
    if (id === "mending") {
      box(-12.5, 1.15, 12.8, 0.8, 0.08, 0.5, "#88a2b6", false, g);
      for (const x of [-12.8, -12.6])
        cyl(x, 1.25, 12.6, 0.055, 0.18, "#c68da0", g);
      ball(-12.3, 1.24, 12.7, 0.04, "#d6c592", g);
    } else if (id === "puzzles") {
      for (let i = 0; i < 20; i++)
        box(
          -12.9 + (i % 5) * 0.18,
          1.13,
          12.55 + Math.floor(i / 5) * 0.16,
          0.16,
          0.04,
          0.14,
          ["#6595ad", "#cbb665", "#81a365"][i % 3],
          false,
          g,
        );
    } else if (id === "music") {
      box(-12.5, 1.15, 12.8, 1.1, 0.12, 0.45, "#453e4e", false, g);
      for (let i = 0; i < 12; i++)
        box(
          -12.97 + i * 0.086,
          1.23,
          12.64,
          0.07,
          0.04,
          0.23,
          "#eee9d9",
          false,
          g,
        );
      for (let i = 0; i < 9; i++)
        if (i % 3 !== 0)
          box(
            -12.9 + i * 0.1,
            1.27,
            12.7,
            0.04,
            0.04,
            0.13,
            "#343638",
            false,
            g,
          );
    } else if (id === "letters") {
      box(-12.5, 1.12, 12.8, 0.7, 0.025, 0.5, "#fff0bd", false, g);
      for (let i = 0; i < 4; i++)
        box(
          -12.5,
          1.14,
          12.65 + i * 0.07,
          0.45,
          0.005,
          0.009,
          "#6f8663",
          false,
          g,
        );
      box(-12.05, 1.15, 12.8, 0.04, 0.04, 0.35, "#b57b49", false, g);
    } else {
      box(-12.5, 1.15, 12.8, 0.6, 0.09, 0.35, "#bc9667", false, g);
      for (let i = 0; i < 12; i++)
        ball(
          -12.7 + (i % 4) * 0.12,
          1.22,
          12.7 + Math.floor(i / 4) * 0.07,
          0.025,
          "#d7bd78",
          g,
        );
    }
  }
  let momKey = "";
  function setMomDay(day: number, playerHome = true) {
    const status = momStatus(day),
      garden = status.activity === "garden";
    const key = `${day}-${garden}`;
    if (key === momKey) return false;
    momKey = key;
    const seated =
      status.activity === "resting" || status.activity === "reading";
    const inBed = status.activity === "bedrest";
    mom.rotation.x = inBed ? -Math.PI / 2 : 0;
    mom.position.set(
      inBed
        ? -4
        : garden
          ? -10.2
          : seated
            ? -18.9
            : status.activity === "garden"
              ? -17.2
              : -12.5,
      inBed ? 1.14 : seated ? 0.69 : 0,
      inBed
        ? 10.75
        : garden
          ? 18
          : seated
            ? 10
            : status.activity === "garden"
              ? 11.7
              : 11.4,
    );
    mom.scale.y = 1;
    seatedLegs.visible = seated;
    for (const foot of mom.children.filter((o) => o.name === "foot")) {
      foot.position.y = seated ? 0.53 : 0.16;
      foot.position.z = seated ? 0.4 : 0;
      foot.scale.set(seated ? 1.1 : 1, seated ? 1.35 : 1, seated ? 0.8 : 1.5);
    }
    mom.rotation.y = seated ? Math.PI / 2 : garden ? -Math.PI / 2 : 0;
    cooking.visible = status.activity === "cooking";
    birdhouses.visible = status.activity === "birdhouses";
    painting.visible = status.activity === "painting";
    book.visible = status.activity === "reading";
    activityProps.forEach((g, id) => (g.visible = id === status.activity));
    (worktop.material as T.MeshStandardMaterial).color.set(
      status.activity === "cooking" ? "#6a756b" : "#bca17a",
    );
    momCollider.x = mom.position.x;
    momCollider.z = mom.position.z;
    momCollider.w = inBed ? 1 : 0.96;
    momCollider.d = inBed ? 2 : 0.96;
    const interaction = targets.find((t) => t.id === "mom");
    if (interaction) {
      interaction.x = inBed
        ? -2.5
        : mom.position.x +
          (seated || status.activity === "garden" ? 1.3 : -1.3);
      interaction.z = inBed ? 10 : mom.position.z;
      if (garden) {
        interaction.x = mom.position.x;
        interaction.z = mom.position.z + 1.3;
      }
    }
    mom.userData.activity = status.activity;
    return true;
  }
  speakers.push({ id: "mom", name: "Mom", object: mom });
  target("mom", -17.4, 10, "Talk to Mom");
  box(-10.1, 0.6, 10, 1.1, 1.2, 3, "#9b805f", true);
  box(-10, 1.65, 10, 0.23, 1.2, 2, "#434b45");
  const cartoonCanvas = document.createElement("canvas");
  cartoonCanvas.width = 384;
  cartoonCanvas.height = 216;
  const cartoonTexture = new T.CanvasTexture(cartoonCanvas);
  cartoonTexture.colorSpace = T.SRGBColorSpace;
  const tvScreen = new T.Mesh(
    new T.PlaneGeometry(1.65, 0.92),
    new T.MeshBasicMaterial({ map: cartoonTexture }),
  );
  tvScreen.position.set(-10.16, 1.65, 10);
  tvScreen.rotation.y = -Math.PI / 2;
  scene.add(tvScreen);
  let cartoonFrame = -1;
  function updateCartoon(time: number) {
    const frame = Math.floor(time * 8);
    if (frame === cartoonFrame) return;
    cartoonFrame = frame;
    const c = cartoonCanvas.getContext("2d")!;
    c.fillStyle = "#a4d8ed";
    c.fillRect(0, 0, 384, 216);
    c.fillStyle = "#80b76b";
    c.fillRect(0, 160, 384, 56);
    const circle = (x: number, y: number, r: number, color: string) => {
      c.fillStyle = color;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    };
    circle(330, 38, 23, "#ffe49b");
    for (const x of [50, 215]) {
      circle(x, 42, 16, "#fff7e8");
      circle(x + 18, 40, 20, "#fff7e8");
      circle(x + 36, 45, 14, "#fff7e8");
    }
    // Original little rabbits chasing a carrot, animated at eight frames per second.
    for (let i = 0; i < 2; i++) {
      const x = 100 + i * 130 + Math.sin(time * 1.2 + i) * 20,
        y = 135 - Math.abs(Math.sin(time * 3 + i)) * 18,
        color = i ? "#e2b2cf" : "#fff0ce";
      circle(x - 11, y - 42, 10, color);
      circle(x + 11, y - 42, 10, color);
      circle(x, y, 26, color);
      circle(x, y - 19, 24, color);
      circle(x - 8, y - 22, 3, "#374344");
      circle(x + 8, y - 22, 3, "#374344");
      circle(x, y - 12, 3, "#ce8b9c");
      circle(x - 18, y + 20, 10, color);
      circle(x + 18, y + 20, 10, color);
    }
    const carrot = 192 + Math.sin(time) * 36;
    c.fillStyle = "#ef9853";
    c.beginPath();
    c.moveTo(carrot - 14, 176);
    c.lineTo(carrot + 16, 181);
    c.lineTo(carrot - 14, 188);
    c.fill();
    c.strokeStyle = "#49815a";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(carrot - 14, 181);
    c.lineTo(carrot - 24, 173);
    c.moveTo(carrot - 14, 181);
    c.lineTo(carrot - 27, 186);
    c.stroke();
    cartoonTexture.needsUpdate = true;
  }
  updateCartoon(0);
  box(-14, 0.03, 10, 4, 0.04, 4, "#d1a38a");

  // Repeating canvas texture: soil grains, clods and tiny stones.
  const soilCanvas = document.createElement("canvas");
  soilCanvas.width = soilCanvas.height = 128;
  const soil = soilCanvas.getContext("2d")!;
  soil.fillStyle = "#79513a";
  soil.fillRect(0, 0, 128, 128);
  let soilSeed = 7919;
  const soilRandom = () => {
    soilSeed = (soilSeed * 16807) % 2147483647;
    return soilSeed / 2147483647;
  };
  for (let i = 0; i < 380; i++) {
    const x = soilRandom() * 128,
      y = soilRandom() * 128;
    soil.fillStyle = ["#63422e", "#8e6548", "#aa805b", "#5c402f"][i % 4];
    soil.beginPath();
    soil.ellipse(
      x,
      y,
      1 + soilRandom() * 2,
      1 + soilRandom(),
      soilRandom() * Math.PI,
      0,
      Math.PI * 2,
    );
    soil.fill();
  }
  const soilTexture = new T.CanvasTexture(soilCanvas);
  soilTexture.colorSpace = T.SRGBColorSpace;
  soilTexture.wrapS = soilTexture.wrapT = T.RepeatWrapping;
  soilTexture.repeat.set(1, 2);
  // Garden and open fence gate.
  const bedFrames: T.Group[] = [],
    bedSoils: T.Mesh[] = [];
  function addBed(i: number, x: number, z: number) {
    const frame = new T.Group();
    scene.add(frame);
    bedFrames.push(frame);
    box(x, 0.04, z, 1.45, 0.08, 2.9, "#b2946d", false, frame);
    const earth = box(x, 0.14, z, 1.45, 0.28, 2.9, "#805943", false, frame);
    bedSoils.push(earth);
    (earth.material as T.MeshStandardMaterial).color.set("#ffffff");
    (earth.material as T.MeshStandardMaterial).map = soilTexture;
    for (const level of [0.09, 0.27]) {
      for (const side of [-1, 1]) {
        box(
          x + side * 0.78,
          level,
          z,
          0.11,
          0.17,
          3.1,
          "#ba9264",
          false,
          frame,
        );
        box(x, level, z + side * 1.5, 1.6, 0.17, 0.11, "#c7a171", false, frame);
        // Grain lines and dark screw heads make the stacked 2x4s readable.
        box(
          x + side * 0.84,
          level,
          z,
          0.006,
          0.016,
          2.95,
          "#9c774e",
          false,
          frame,
        );
        for (const end of [-1, 1])
          ball(x + side * 0.64, level, z + end * 1.56, 0.018, "#5b584e", frame);
      }
    }
    for (const side of [-1, 1])
      for (const end of [-1, 1])
        box(
          x + side * 0.69,
          0.2,
          z + end * 1.4,
          0.12,
          0.4,
          0.12,
          "#a58055",
          false,
          frame,
        );
    const g = new T.Group();
    g.position.set(x, 0.29, z);
    scene.add(g);
    plots.push(g);
    target(`plot${i}`, x, z + 1.6, `Garden plot ${i + 1}`);
  }
  for (let i = 0; i < 5; i++) addBed(i, -20 + i * 2, 19);
  function syncBeds(data: Plot[]) {
    const rebuild = data.some(
      (p, i) =>
        i >= 5 &&
        plots[i] &&
        (plots[i].position.x !== p.x || plots[i].position.z !== p.z),
    );
    const changed = rebuild || plots.length !== data.length;
    while (plots.length > (rebuild ? 5 : data.length)) {
      const i = plots.length - 1;
      moneyTree(i, "empty", false);
      plots.pop()!.removeFromParent();
      bedFrames.pop()!.removeFromParent();
      bedSoils.pop();
      const at = targets.findIndex((t) => t.id === `plot${i}`);
      if (at >= 0) targets.splice(at, 1);
    }
    while (plots.length < data.length) {
      const i = plots.length;
      addBed(i, data[i].x!, data[i].z!);
    }
    data.forEach((p, i) => {
      bedSoils[i].visible = p.soilFilled !== false;
    });
    return changed;
  }
  for (let i = 0; i < 15; i++) {
    const x = -22 + i;
    if (x > -17 && x < -14) continue;
    box(x, 0.55, 23, 0.12, 1.1, 0.15, "#d7b68a", true);
    box(x, 0.45, 23, 0.85, 0.12, 0.1, "#c3a176");
    box(x, 0.83, 23, 0.85, 0.12, 0.1, "#c3a176");
  }
  // Continuous sidewalk joins the front gate, home and main lane.

  function foliage(x: number, z: number, r = 1) {
    if (!clearScenery(x, z, r + 0.55)) return;
    scenery.push({ x, z, radius: r + 0.55, kind: "tree" });
    cyl(x, 0.9, z, 0.17, 1.8, "#826b50").material = surfaceMaterial(
      "#826b50",
      "bark",
      1,
      2,
    );
    const branch = cyl(x + 0.2, 1.4, z, 0.08, 0.7, "#826b50");
    branch.rotation.z = -0.7;
    branch.material = surfaceMaterial("#826b50", "bark");
    ball(x, 2.4, z, r, "#6f9977");
    ball(x + 0.55, 2.3, z + 0.2, r * 0.7, "#92b080");
    rects.push({ x, z, w: 0.4, d: 0.4 });
  }
  function house(x: number, z: number, c: string, name: string) {
    box(x, 1.6, z, 7, 3.2, 6, c, true);
    const roof = new T.Mesh(
      new T.ConeGeometry(5.3, 2, 4),
      surfaceMaterial("#a76f60", "shingles", 4, 2),
    );
    roof.position.set(x, 4, z);
    roof.rotation.y = Math.PI / 4;
    scene.add(roof);
    roof.userData.roof = true;
    (roof.material as T.MeshStandardMaterial).side = T.DoubleSide;
    occluders.push(roof);
    box(x, 1, z + 3.03, 1.2, 2, 0.12, "#8b6e53");
    for (const a of [-2, 2]) box(x + a, 1.8, z + 3.1, 1.2, 1.2, 0.1, "#bce0d9");
    if (name === "SPOKE & SADDLE") label(name, x, 3.1, z + 3.16, 3.7);
    doorways.push({ x, z: z + 4.5, w: 2.4, d: 4 });
    for (const a of [-2.7, -1.8, 1.8, 2.7]) {
      if (!clearScenery(x + a, z + 4.5, 0.45)) continue;
      ball(x + a, 0.45, z + 4.5, 0.45, "#adc88a");
      scenery.push({ x: x + a, z: z + 4.5, radius: 0.45, kind: "bush" });
    }
  }
  house(12, 15, "#dcbab0", "THE WILLOWS");
  house(12, 1, "#efdbaf", "ROSE COTTAGE");
  house(-14, -13, "#c4d2b0", "MAPLE HOUSE");
  speakers.push({
    id: "npc1",
    name: "Bea",
    object: person(10, 20, "#bda9d4", "#79584b"),
  });
  target("npc1", 10, 20, "Talk to Bea");
  speakers.push({
    id: "npc2",
    name: "Jun",
    object: person(12, 6, "#abc0cf", "#c49a62"),
  });
  target("npc2", 12, 6, "Talk to Jun");
  speakers.push({
    id: "npc3",
    name: "Mabel",
    object: person(-10, -8, "#dea58d", "#5f5549"),
  });
  target("npc3", -10, -8, "Talk to Mabel");
  // Robertsons walk-in shop at end of lane, front facing south.
  const sx = 8,
    sz = -31;
  box(sx, -0.01, sz, 16, 0.12, 16, "#d0b894");
  box(0, 1.8, sz, 0.25, 3.6, 16, "#a9b9a2", true);
  box(16, 1.8, sz, 0.25, 3.6, 16, "#a9b9a2", true);
  box(8, 1.8, -39, 16, 3.6, 0.25, "#a9b9a2", true);
  box(3, 1.8, -23, 6, 3.6, 0.25, "#a9b9a2", true);
  box(12, 1.8, -23, 8, 3.6, 0.25, "#a9b9a2", true);
  occluders.push(box(7, 3.48, -23, 2, 0.24, 0.25, "#a9b9a2"));
  label("Robertsons", 8, 4.8, -22.7, 8).name = "robertsons-name";
  label("Hardware & Grocer", 8, 3.1, -22.7, 8, "#334a3c", 8).name =
    "robertsons-trade";
  for (const x of [0.85, 15.15]) {
    box(x, 1, -29, 1, 2, 7, "#947859", true);
    for (let j = 0; j < 6; j++) {
      box(x, 1.3, -32 + j * 1.1, 0.65, 0.5, 0.6, j % 2 ? "#c9b466" : "#c78e6f");
      box(x, 2.2, -32 + j * 1.1, 0.65, 0.5, 0.6, j % 2 ? "#8caa86" : "#d2ad93");
    }
  }
  box(8, 0.5, -33, 5, 1, 1, "#8b7456", true);
  speakers.push({
    id: "robertson",
    name: "Ol’ Man Robertson",
    object: person(8, -34, "#708b75", "#eee9db", true),
  });
  target("robertson", 8, -31.7, "Talk to Ol’ Man Robertson");
  for (const [id, x, z, name, color] of [
    ["can", 5, -26, "WATERING CAN · $1", "#86ada5"],
    ["shovel", 10, -26, "SHOVEL · $1", "#9da5a2"],
    ["fertilizer", 11, -30, "FERTILIZER · 5 DOSES · $5", "#d7c18b"],
  ] as const) {
    box(x, 0.45, z, 1.1, 0.9, 1, "#b2946d", true);
    if (id === "can" || id === "shovel") {
      const model = makeGardenTool(id);
      model.position.set(x, 0.92, z);
      scene.add(model);
    } else {
      const sack = box(x, 1.35, z, 0.65, 0.85, 0.55, color);
      sack.material = surfaceMaterial(color, "cloth");
      box(x, 1.4, z + 0.285, 0.42, 0.38, 0.018, "#edf0c9");
      for (const side of [-1, 1]) {
        const leaf = ball(x + side * 0.08, 1.43, z + 0.31, 0.08, "#648747");
        leaf.scale.set(0.55, 1, 0.15);
        leaf.rotation.z = side * 0.5;
      }
    }
    target(id, x, z + 1.1, `Buy ${id}`);
    label(name, x, id === "shovel" ? 3.3 : 2.45, z + 0.4, 2.7);
  }
  // Separate, roomy supply displays: an empty wooden bed and a sack of soil.
  box(3, 0.35, -34, 2.7, 0.7, 1.9, "#b2946d", true);
  for (const x of [1.94, 4.06]) box(x, 0.98, -34, 0.13, 0.4, 1.5, "#c3a176");
  for (const z of [-34.7, -33.3]) box(3, 0.98, z, 2.25, 0.4, 0.13, "#c3a176");
  box(3, 0.79, -34, 2.1, 0.05, 1.35, "#66513c");
  label("Garden bed · $30", 3, 1.7, -32.98, 3);
  target("garden-bed", 3, -32.45, "Inspect garden bed · $30");
  box(12, 0.4, -35, 1.5, 0.8, 1.5, "#b2946d", true);
  const soilSack = box(12, 1.3, -35, 0.9, 1, 0.65, "#c3b295");
  soilSack.material = surfaceMaterial("#c3b295", "cloth");
  box(12, 1.36, -34.66, 0.58, 0.5, 0.015, "#e7dfbe");
  label("Soil · $10", 12, 2.2, -34.55, 2.5);
  target("garden-soil", 12, -33.4, "Inspect soil · $10");
  // Walk-in hat shop: a wide doorway, clear centre aisle and ten display stands.
  box(24, -0.02, -29, 12, 0.16, 12, "#c5aa87");
  box(18, 1.8, -29, 0.25, 3.6, 12, "#e4bc9e", true);
  box(30, 1.8, -29, 0.25, 3.6, 12, "#e4bc9e", true);
  box(24, 1.8, -35, 12, 3.6, 0.25, "#e4bc9e", true);
  box(19.9, 1.8, -23, 3.8, 3.6, 0.25, "#e4bc9e", true);
  box(28.1, 1.8, -23, 3.8, 3.6, 0.25, "#e4bc9e", true);
  box(24, 3.25, -23, 4.4, 0.7, 0.25, "#e4bc9e");
  label("Thread & Thimble", 24, 3.2, -22.8, 4.2, "#704a65");
  doorways.push({ x: 24, z: -23, w: 4.4, d: 5 });
  box(24, 0.065, -28.3, 4, 0.025, 7, "#a8828b");
  for (const x of [18.16, 29.84]) {
    box(x, 2, -28, 0.04, 1.3, 2, "#a5c9ca");
    box(x, 2, -28, 0.06, 0.06, 2.1, "#79594a");
    box(x, 2, -28, 0.06, 1.4, 0.06, "#79594a");
  }
  label("A hat for every adventure", 24, 2.7, -34.8, 4, "#704a65");
  const hatShopRoof = box(24, 3.8, -29, 12.5, 0.25, 12.5, "#9e6a80");
  hatShopRoof.material = surfaceMaterial("#9e6a80", "shingles", 5, 5);
  const roofMat = hatShopRoof.material as T.MeshStandardMaterial;
  roofMat.transparent = true;
  box(24, 0.55, -33.4, 3, 1.1, 0.65, "#a48162", true);
  speakers.push({
    id: "haberdashery",
    name: "Thimble",
    object: person(24, -34.3, "#c7a6cc", "#664b40"),
  });
  target("haberdashery", 24, -32.3, "Talk to Thimble");
  const hatDisplays: T.Group[] = [];
  const capSeeds = new T.Group();
  scene.add(capSeeds);
  hats.forEach((hat, i) => {
    const x = i < 5 ? 19.5 : 28.5,
      z = -24.6 - (i % 5) * 1.85;
    box(x, 0.47, z, 0.9, 0.94, 0.9, "#b89874", true);
    cyl(x, 1.03, z, 0.13, 0.22, "#73543c");
    const model = makeHat(hat.id);
    model.position.set(x, 1.2, z);
    scene.add(model);
    hatDisplays.push(model);
    label(
      `${hat.name} · $${hat.price / 100}`,
      x,
      0.7,
      z + 0.48,
      1.65,
      "#574431",
    );
    target(
      hat.id === "cap" ? "cap" : `hat-${hat.id}`,
      x + (i < 5 ? 1.15 : -1.15),
      z,
      `Inspect ${hat.name}`,
    );
    if (hat.id === "cap")
      for (let n = 0; n < 5; n++)
        ball(x - 0.16 + n * 0.08, 1.26, z + 0.56, 0.035, "#584c2f", capSeeds);
  });
  target("couch", -17.2, 11.1, "Sit on the couch");
  function setPlayerSeated(seated: boolean) {
    player.rotation.y = seated ? Math.PI / 2 : player.rotation.y;
    player.position.y = seated ? 0.69 : 0;
    for (const foot of player.children.filter((o) => o.name === "foot")) {
      foot.position.y = seated ? 0.53 : 0.16;
      foot.position.z = seated ? 0.4 : 0;
      foot.scale.set(seated ? 1.1 : 1, seated ? 1.35 : 1, seated ? 0.8 : 1.5);
    }
  }
  const wornHat = new T.Group();
  wornHat.position.y = 1.93;
  player.add(wornHat);
  let wornKey = "";
  function setHat(ids: HatId[] | HatId | null) {
    const stack = Array.isArray(ids) ? ids : ids ? [ids] : [];
    const key = stack.join(",");
    if (key === wornKey) return;
    wornKey = key;
    wornHat.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        (o.material as T.Material).dispose();
      }
    });
    wornHat.clear();
    const models = stack
      .map((id) => {
        const model = makeHat(id);
        const height = new T.Box3().setFromObject(model).max.y;
        if (height > 0.72) model.scale.y = 0.72 / height;
        // Stack on the crown, not the veil hanging below the brim.
        const size = new T.Box3().setFromObject(model).max.y;
        return {
          id,
          model,
          size,
          height,
          priority: id === "propeller" ? 2 : id === "rabbit" ? 1 : 0,
        };
      })
      .sort((a, b) => a.priority - b.priority || a.height - b.height);
    let y = 0;
    wornHat.scale.set(1, 1, 1);
    for (const { id, model, size } of models) {
      model.position.y = y;
      model.userData.hatId = id;
      wornHat.add(model);
      y += size * 0.98;
    }
    if (y > 0.95) wornHat.scale.y = 0.95 / y;
  }
  // Pegs and an upright post in the bedroom, clear of the door and desk.
  cyl(-20.2, 0.95, 4.8, 0.07, 1.9, "#a48162");
  for (const side of [-1, 1])
    box(-20.2 + side * 0.3, 1.7, 4.8, 0.6, 0.09, 0.09, "#a48162");
  box(-20.2, 0.09, 4.8, 0.9, 0.18, 0.65, "#a48162");
  target("hat-rack", -19.5, 4.8, "Manage your hats");
  house(-7, -29, "#b5c4cd", "SPOKE & SADDLE");
  speakers.push({
    id: "bicycle",
    name: "Spoke & Saddle",
    object: person(-7, -24, "#aec3a1", "#79584b"),
  });
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
  const outdoorBirdhouses: T.Group[] = [];
  for (const [i, tree] of scenery
    .filter((o) => o.kind === "tree")
    .slice(0, 12)
    .entries()) {
    const g = new T.Group();
    g.position.set(tree.x, 1.65, tree.z + 0.32);
    g.name = "moms-birdhouse";
    g.visible = false;
    scene.add(g);
    box(
      0,
      0,
      0,
      0.42,
      0.45,
      0.32,
      ["#bc9667", "#8ba8ab", "#c791a4"][i % 3],
      false,
      g,
    );
    const roof = box(0, 0.25, 0, 0.55, 0.08, 0.45, "#8e6548", false, g);
    roof.rotation.z = 0.15;
    const hole = ball(0, 0.03, 0.18, 0.075, "#3d392f", g);
    hole.scale.z = 0.1;
    box(0, -0.12, 0.25, 0.04, 0.04, 0.2, "#a48162", false, g);
    outdoorBirdhouses.push(g);
  }
  function showBirdhouses(count: number) {
    outdoorBirdhouses.forEach((g, i) => (g.visible = i < count));
  }
  // Each neighbor has a small planted border, leaving the doorway and lane clear.
  const neighborGardens: T.Group[] = [];
  function plantFlower(
    x: number,
    z: number,
    type: string,
    color: string,
    parent: T.Group,
  ) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.name = type;
    parent.add(g);
    const height =
      type === "sunflower" ? 1.05 : type === "lavender" ? 0.7 : 0.5;
    cyl(0, height / 2, 0, 0.025, height, "#507449", g);
    for (const side of [-1, 1]) {
      const leaf = ball(side * 0.13, height * 0.4, 0, 0.14, "#6d9358", g);
      leaf.scale.set(1.7, 0.3, 0.65);
      leaf.rotation.z = side * 0.45;
    }
    if (type === "cabbage") {
      for (let i = 0; i < 7; i++) {
        const a = (i * Math.PI * 2) / 7;
        const leaf = ball(
          Math.cos(a) * 0.1,
          0.23,
          Math.sin(a) * 0.1,
          0.19,
          "#7f9e58",
          g,
        );
        leaf.scale.set(0.9, 0.65, 1);
        leaf.material = surfaceMaterial("#7f9e58", "leaf");
      }
      ball(0, 0.25, 0, 0.16, "#b2c67a", g);
    } else if (type === "carrot") {
      const root = new T.Mesh(
        new T.ConeGeometry(0.08, 0.26, 6),
        mat("#e68c39"),
      );
      root.position.y = 0.16;
      root.rotation.z = Math.PI;
      g.add(root);
      for (let i = 0; i < 5; i++) {
        const leaf = ball((i - 2) * 0.05, 0.4, 0, 0.1, "#5e944c", g);
        leaf.scale.set(0.35, 2, 0.4);
        leaf.rotation.z = (i - 2) * 0.25;
      }
    } else if (type === "tomato") {
      cyl(0.09, 0.5, 0, 0.025, 1, "#a48162", g);
      for (let i = 0; i < 5; i++) {
        const a = i * 2.4;
        ball(
          Math.cos(a) * 0.15,
          0.3 + i * 0.1,
          Math.sin(a) * 0.15,
          0.09,
          "#d75c40",
          g,
        );
      }
    } else if (
      type === "banana" ||
      type === "bird-of-paradise" ||
      type === "monstera"
    ) {
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const leaf = ball(
          Math.cos(a) * 0.2,
          0.65 + Math.sin(i) * 0.1,
          Math.sin(a) * 0.2,
          0.26,
          "#417b58",
          g,
        );
        leaf.scale.set(0.55, 2.4, 0.25);
        leaf.rotation.set(Math.cos(a) * 0.65, a, Math.sin(a) * 0.65);
        leaf.material = surfaceMaterial("#417b58", "leaf");
      }
      if (type === "bird-of-paradise")
        for (let i = 0; i < 4; i++) {
          const petal = ball(0.08 * i, 1.05 + 0.05 * i, 0, 0.1, "#f3a335", g);
          petal.scale.set(1.8, 0.4, 0.5);
          petal.rotation.z = 0.5;
        }
      if (type === "banana")
        for (let i = 0; i < 3; i++)
          ball(0.1 + i * 0.04, 0.6, 0.16, 0.065, "#d5c25f", g).scale.set(
            0.5,
            1.8,
            0.6,
          );
    } else if (type === "tulip") {
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5,
          p = ball(
            Math.cos(a) * 0.1,
            height,
            Math.sin(a) * 0.1,
            0.12,
            color,
            g,
          );
        p.scale.set(0.7, 1.6, 0.7);
      }
    } else if (type === "lavender") {
      for (let i = 0; i < 8; i++)
        ball(
          Math.sin(i * 2) * 0.065,
          height - 0.2 + i * 0.04,
          Math.cos(i * 2) * 0.065,
          0.065,
          color,
          g,
        );
    } else if (type === "fern") {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const leaf = ball(
          Math.cos(a) * 0.15,
          0.25,
          Math.sin(a) * 0.15,
          0.16,
          "#558360",
          g,
        );
        leaf.scale.set(0.6, 1.8, 0.3);
        leaf.rotation.z = Math.sin(a) * 0.5;
        leaf.material = surfaceMaterial("#558360", "leaf");
      }
    } else {
      const radius = type === "sunflower" ? 0.19 : 0.11;
      for (let i = 0; i < 9; i++) {
        const a = (i * Math.PI * 2) / 9;
        const petal = ball(
          Math.cos(a) * radius,
          height,
          Math.sin(a) * radius,
          radius * 0.8,
          color,
          g,
        );
        petal.scale.set(1, 0.35, 1);
      }
      ball(
        0,
        height + 0.025,
        0,
        radius * 0.62,
        type === "sunflower" ? "#765636" : "#e4b75b",
        g,
      ).scale.set(1, 0.5, 1);
    }
    return g;
  }
  for (const [x, z, types] of [
    [7.8, 20.8, ["daisy", "tulip", "lavender"]],
    [17, 20, ["cabbage", "carrot", "tomato"]],
    [8.2, 6.2, ["tulip", "lavender", "daisy"]],
    [17, 6, ["banana", "bird-of-paradise", "monstera"]],
    [-19.3, -8.5, ["lavender", "tulip", "fern"]],
  ] as const) {
    const garden = new T.Group();
    garden.position.set(x, 0, z);
    garden.name = "neighbor-garden";
    garden.userData.plantTypes = types;
    garden.userData.strategy =
      types[0] === "cabbage"
        ? "vegetable rows"
        : types[0] === "banana"
          ? "tropical cluster"
          : types[0] === "daisy"
            ? "flower border"
            : "mixed cottage planting";
    scene.add(garden);
    neighborGardens.push(garden);
    box(0, 0.07, 0, 2.4, 0.14, 1.6, "#66553b", false, garden).material =
      surfaceMaterial("#66553b", "grass", 2, 2);
    for (const side of [-1, 1]) {
      box(side * 1.2, 0.13, 0, 0.1, 0.22, 1.7, "#b2946d", false, garden);
      box(0, 0.13, side * 0.8, 2.5, 0.22, 0.1, "#b2946d", false, garden);
    }
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 5; col++)
        plantFlower(
          types[0] === "banana"
            ? Math.cos(col * 2 + row) * 0.8
            : -0.9 + col * 0.45,
          types[0] === "banana"
            ? Math.sin(col * 2 + row) * 0.5
            : -0.45 + row * 0.9,
          types[(col + row) % 3],
          ["#eee8d4", "#d68ca7", "#a493bd", "#e9c766"][(col + row) % 4],
          garden,
        );
  }
  // Merge static garden meshes by surface to keep rich planting inexpensive.
  for (const garden of neighborGardens) {
    garden.updateMatrixWorld(true);
    const inverse = garden.matrixWorld.clone().invert();
    const buckets = new Map<
      string,
      { material: T.MeshStandardMaterial; geometries: T.BufferGeometry[] }
    >();
    garden.traverse((o) => {
      if (!(o instanceof T.Mesh)) return;
      const material = o.material as T.MeshStandardMaterial;
      const key =
        material.color.getHexString() + ":" + (material.map?.uuid ?? "");
      const bucket = buckets.get(key) ?? { material, geometries: [] };
      bucket.geometries.push(
        o.geometry
          .clone()
          .applyMatrix4(inverse.clone().multiply(o.matrixWorld)),
      );
      buckets.set(key, bucket);
    });
    garden.clear();
    for (const bucket of buckets.values()) {
      const geometry = mergeGeometries(bucket.geometries);
      for (const part of bucket.geometries) part.dispose();
      if (!geometry) throw Error("Garden mesh merge failed");
      const mesh = new T.Mesh(geometry, bucket.material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      garden.add(mesh);
    }
  }
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
    if (!clearScenery(x, z, 0.18)) continue;
    ball(x, 0.14, z, 0.18, i % 3 ? "#f0d295" : "#dda7ae");
  }
  for (let i = 0; i < 12; i++) {
    ball(-45 + i * 9, 2, -91, 7, "#93ae82").scale.set(1, 1.3, 1);
    ball(-45 + i * 9, 2, 45, 7, "#93ae82").scale.set(1, 1.3, 1);
  }
  for (let i = 0; i < 9; i++) {
    const g = new T.Group();
    g.position.set(-45 + i * 12, 19 + (i % 3) * 2, -25 + (i % 4) * 13);
    scene.add(g);
    for (let j = 0; j < 3; j++)
      ball(j * 1.6, 0, 0, 1.8, "#f6eedc", g).scale.set(1, 0.65, 0.8);
  }
  // Jumpable hedgerow perimeter.
  rects.push(
    { x: -39, z: 0, w: 1, d: 90, clearHeight: 2.3 },
    { x: 39, z: 0, w: 1, d: 90, clearHeight: 2.3 },
    { x: -3.25, z: -40, w: 70.5, d: 1, clearHeight: 2.3 },
    { x: 37.75, z: -40, w: 1.5, d: 1, clearHeight: 2.3 },
    { x: 0, z: 39, w: 77, d: 1, clearHeight: 2.3 },
  );
  // Visible hedgerows exactly match the boundary colliders.
  const boundaryHedges = [
    { x: -39, z: 0, w: 1, d: 90, clearHeight: 2.3 },
    { x: 39, z: 0, w: 1, d: 90, clearHeight: 2.3 },
    { x: -3.25, z: -40, w: 70.5, d: 1, clearHeight: 2.3 },
    { x: 37.75, z: -40, w: 1.5, d: 1, clearHeight: 2.3 },
    { x: 0, z: 39, w: 77, d: 1, clearHeight: 2.3 },
  ].map((r) => {
    const hedge = box(r.x, 1.05, r.z, r.w, 2.1, r.d, "#658464");
    occluders.push(hedge);
    const length = Math.max(r.w, r.d);
    for (let n = -length / 2 + 0.5; n < length / 2; n += 1.6)
      ball(
        r.x + (r.w > r.d ? n : 0),
        1.8,
        r.z + (r.d > r.w ? n : 0),
        0.46,
        Math.floor(n * 10) % 2 ? "#71916b" : "#5f805e",
      );
    return hedge;
  });
  const sigma = createSigmaWorld(scene, rects, occluders, targets, speakers);
  const gateRect = { x: 34.5, z: -40, w: 5, d: 1 };
  const gate = box(34.5, 1.05, -40, 5, 2.1, 1, "#658464");
  rects.push(gateRect);
  occluders.push(gate);
  let sigmaOpen = false;
  function setSigmaUnlocked(value: boolean) {
    sigma.setUnlocked(value);
    if (value === sigmaOpen) return;
    sigmaOpen = value;
    gate.visible = !value;
    if (value) {
      rects.splice(rects.indexOf(gateRect), 1);
      occluders.splice(occluders.indexOf(gate), 1);
    } else {
      rects.push(gateRect);
      occluders.push(gate);
    }
  }
  sigma.setUnlocked(false);
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
    const height = stage === "harvested" ? 1.35 : 2.4;
    const wood = surfaceMaterial(
      stage === "harvested" ? "#655e50" : "#252b28",
      "bark",
      1,
      3,
    );
    const skeleton = moneySkeleton(index, height, wood, stage === "harvested");
    g.add(skeleton.trunk, skeleton.branches);
    treeRects[index] = {
      x: g.position.x,
      z: g.position.z,
      w: 0.5,
      d: 0.5,
      clearHeight: 3.2,
    };
    rects.push(treeRects[index]!);
    treeTrunks[index] = skeleton.trunk;
    occluders.push(skeleton.trunk);
    if (stage === "ready" || stage === "growing") {
      for (let j = 0; j < (stage === "ready" ? 18 : 6); j++) {
        const a = j * 2.4,
          tip = skeleton.tips[j % skeleton.tips.length];
        const bill = box(
          tip.x,
          tip.y - 0.08,
          tip.z,
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
  const forestSeeds = new T.Group(),
    storeSeeds = new T.Group(),
    gardenSeeds = new T.Group(),
    tvSeeds = new T.Group();
  for (const packet of [forestSeeds, storeSeeds, gardenSeeds, tvSeeds]) {
    scene.add(packet);
    packet.add(makeSeedPacket());
  }
  gardenSeeds.position.set(7.8, 0.13, 20.8);
  tvSeeds.position.set(-9.55, 1.25, 9);
  target("garden-seeds", 7.8, 20.8, "Look in the flowerbed");
  target("tv-seeds", -10, 7.9, "Look behind the TV");
  storeSeeds.position.set(12, 0.92, -32);
  box(12, 0.45, -32, 0.9, 0.9, 0.65, "#b2946d");
  for (const x of [11.75, 12.05]) cyl(x, 1.12, -31.8, 0.1, 0.38, "#a7b5a0");
  target("forest-seeds", 29, -35, "Search the seed packet");
  target("store-seeds", 12, -31.5, "Search behind the tins");
  return {
    diggingTool,
    updateCartoon,
    setDigging,
    updateNotebook,
    notebookPages: page,
    sigma,
    setSigmaUnlocked,
    syncBeds,
    showBirdhouses,
    outdoorBirdhouses,
    neighborGardens,
    forestSeeds,
    storeSeeds,
    gardenSeeds,
    tvSeeds,
    player,
    setPlayerSeated,
    setHat,
    wornHat,
    hatDisplays,
    hatShopRoof,
    homeRoof,
    momRoof,
    paths,
    doorways,
    scenery,
    boundaryHedges,
    speakers,
    capSeeds,
    sleeping,
    mom,
    setMomDay,
    rects,
    occluders,
    targets,
    plots,
    bills,
    moneyTree,
  };
}
