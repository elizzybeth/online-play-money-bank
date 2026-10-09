import { hats, type HatId } from "./hats";
import { makeHat } from "./hat-models";
import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { type Rect, opening, momStatus } from "./game";
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
    { x: -6.25, z: 25, w: 18.5, d: 2 },
    { x: -5, z: 22, w: 8, d: 8 },
    { x: -16, z: 22, w: 2, d: 5 },
    { x: 24, z: -20, w: 3, d: 9 },
  ];
  const doorways: Rect[] = [];
  const scenery: { x: number; z: number; radius: number; kind: string }[] = [];
  const overlaps = (x: number, z: number, radius: number, r: Rect) =>
    x + radius > r.x - r.w / 2 &&
    x - radius < r.x + r.w / 2 &&
    z + radius > r.z - r.d / 2 &&
    z - radius < r.z + r.d / 2;
  // Reserve the walk-in shop interior before scattering outdoor scenery.
  const sceneryExclusions: Rect[] = [{ x: 24, z: -29, w: 12, d: 12 }];
  const clearScenery = (x: number, z: number, radius: number) =>
    !paths
      .concat(doorways, sceneryExclusions)
      .some((r) => overlaps(x, z, radius, r));
  const speakers: { id: string; name: string; object: T.Object3D }[] = [];
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
    aspect = 4,
  ) {
    const c = document.createElement("canvas");
    c.width = 128 * aspect;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#faf1d8";
    ctx.fillRect(0, 0, c.width, 128);
    ctx.strokeStyle = "#af996b";
    ctx.lineWidth = 9;
    ctx.strokeRect(5, 5, c.width - 10, 118);
    ctx.fillStyle = color;
    ctx.font = "bold 43px Georgia";
    for (
      let size = 43;
      ctx.measureText(text).width > c.width - 48 && size > 12;
    ) {
      ctx.font = `bold ${--size}px Georgia`;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, c.width / 2, 66);
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
    ball(0, 0.77, 0, 0.4, c, g).scale.set(0.9, 1.15, 0.7);
    const head = ball(0, 1.47, 0, 0.48, "#f3cfb0", g);
    head.name = "head";
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
  function bedBody(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
  ) {
    const mesh = new T.Mesh(
      new RoundedBoxGeometry(w, h, d, 4, Math.min(w, h, d) * 0.45),
      mat(color),
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    sleeping.add(mesh);
    return mesh;
  }
  // A connected body seen from the pillow: shirt, lap, trouser legs,
  // cuffs and bare feet. Sleeved arms rest alongside the stomach.
  bedBody(-19.1, 1.16, 0.65, 0.85, 0.3, 0.9, "#dfae6b");
  bedBody(-19.1, 1.15, 1.15, 0.75, 0.28, 0.38, "#8eaaab");
  box(-19.1, 1.315, 0.65, 0.015, 0.008, 0.8, "#bb874c", false, sleeping);
  for (const z of [0.45, 0.67, 0.88])
    ball(-19.1, 1.325, z, 0.025, "#785838", sleeping);
  for (const a of [-1, 1]) {
    const x = -19.1 + a * 0.23;
    bedBody(x, 1.15, 1.53, 0.29, 0.26, 0.62, "#8eaaab");
    bedBody(x, 1.13, 1.96, 0.26, 0.22, 0.57, "#8eaaab");
    bedBody(x, 1.14, 2.17, 0.28, 0.24, 0.09, "#eee3cf");
    bedBody(x, 1.13, 2.32, 0.27, 0.18, 0.44, "#f3cfb0");
    const sleeve = bedBody(
      -19.1 + a * 0.5,
      1.17,
      0.65,
      0.23,
      0.24,
      0.6,
      "#dfae6b",
    );
    sleeve.rotation.y = a * 0.14;
    bedBody(-19.1 + a * 0.5, 1.25, 1.03, 0.21, 0.2, 0.28, "#dfae6b");
    bedBody(-19.1 + a * 0.49, 1.3, 1.21, 0.24, 0.19, 0.26, "#f3cfb0");
    ball(-19.1 + a * 0.34, 1.28, 1.2, 0.065, "#f3cfb0", sleeping);
  }
  box(0, -0.25, 0, 100, 0.5, 90, colors.grass);
  for (const path of paths)
    box(path.x, 0.02, path.z, path.w, 0.04, path.d, "#d7cba9");
  // Home: north bedroom, south living room; open doorways on south walls.
  const roofMaterial = mat("#ad7762");
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
  pc.fillStyle = "#fff1b6";
  pc.fillRect(0, 0, 512, 384);
  pc.strokeStyle = "#91a777";
  pc.lineWidth = 1;
  for (let y = 51; y < 384; y += 30) {
    pc.beginPath();
    pc.moveTo(0, y);
    pc.lineTo(512, y);
    pc.stroke();
  }
  pc.beginPath();
  pc.moveTo(20, 0);
  pc.lineTo(20, 384);
  pc.stroke();
  pc.fillStyle = "#425b3e";
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
  pc.lineWidth = 3;
  pc.beginPath();
  pc.moveTo(62, 366);
  pc.quadraticCurveTo(55, 345, 65, 323);
  pc.moveTo(62, 347);
  pc.quadraticCurveTo(39, 342, 44, 327);
  pc.quadraticCurveTo(64, 328, 62, 347);
  pc.moveTo(63, 337);
  pc.quadraticCurveTo(83, 336, 85, 320);
  pc.quadraticCurveTo(63, 319, 63, 337);
  pc.stroke();
  pc.beginPath();
  pc.arc(438, 336, 16, 0, Math.PI * 2);
  pc.stroke();
  pc.beginPath();
  pc.arc(438, 338, 7, 0, Math.PI);
  pc.stroke();
  for (const x of [432, 444]) {
    pc.beginPath();
    pc.arc(x, 332, 2, 0, Math.PI * 2);
    pc.fill();
  }
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
  let momKey = "";
  function setMomDay(day: number, playerHome = true) {
    const status = momStatus(day),
      garden = status.activity === "garden" && !playerHome;
    const key = `${day}-${garden}`;
    if (key === momKey) return false;
    momKey = key;
    const seated =
      status.activity === "resting" || status.activity === "reading";
    mom.position.set(
      garden
        ? -10.2
        : seated
          ? -18.9
          : status.activity === "garden"
            ? -17.2
            : -12.5,
      seated ? 0.5 : 0,
      garden ? 18 : seated ? 10 : status.activity === "garden" ? 11.7 : 11.4,
    );
    mom.scale.y = seated ? 0.68 : 1;
    mom.rotation.y = seated ? Math.PI / 2 : garden ? -Math.PI / 2 : 0;
    cooking.visible = status.activity === "cooking";
    birdhouses.visible = status.activity === "birdhouses";
    painting.visible = status.activity === "painting";
    book.visible = status.activity === "reading";
    (worktop.material as T.MeshStandardMaterial).color.set(
      status.activity === "cooking" ? "#6a756b" : "#bca17a",
    );
    momCollider.x = mom.position.x;
    momCollider.z = mom.position.z;
    const interaction = targets.find((t) => t.id === "mom");
    if (interaction) {
      interaction.x =
        mom.position.x + (seated || status.activity === "garden" ? 1.3 : -1.3);
      interaction.z = mom.position.z;
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
  box(-10.14, 1.65, 10, 0.03, 0.92, 1.65, "#93c7c8");
  box(-14, 0.03, 10, 4, 0.04, 4, "#d1a38a");
  label("HOME", -15, 3.9, 14.1, 2.5);
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
  for (let i = 0; i < 5; i++) {
    const x = -20 + i * 2;
    const earth = box(x, 0.14, 19, 1.45, 0.28, 2.9, "#805943");
    (earth.material as T.MeshStandardMaterial).color.set("#ffffff");
    (earth.material as T.MeshStandardMaterial).map = soilTexture;
    for (const level of [0.09, 0.27]) {
      for (const side of [-1, 1]) {
        box(x + side * 0.78, level, 19, 0.11, 0.17, 3.1, "#ba9264");
        box(x, level, 19 + side * 1.5, 1.6, 0.17, 0.11, "#c7a171");
        // Grain lines and dark screw heads make the stacked 2x4s readable.
        box(x + side * 0.84, level, 19, 0.006, 0.016, 2.95, "#9c774e");
        for (const end of [-1, 1])
          ball(x + side * 0.64, level, 19 + end * 1.56, 0.018, "#5b584e");
      }
    }
    for (const side of [-1, 1])
      for (const end of [-1, 1])
        box(x + side * 0.69, 0.2, 19 + end * 1.4, 0.12, 0.4, 0.12, "#a58055");
    const g = new T.Group();
    g.position.set(x, 0.29, 19);
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
  // Continuous sidewalk joins the front gate, home and main lane.

  function foliage(x: number, z: number, r = 1) {
    if (!clearScenery(x, z, r + 0.55)) return;
    scenery.push({ x, z, radius: r + 0.55, kind: "tree" });
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
    sz = -29;
  box(sx, -0.01, sz, 12, 0.12, 12, "#d0b894");
  box(2, 1.8, sz, 0.25, 3.6, 12, "#a9b9a2", true);
  box(14, 1.8, sz, 0.25, 3.6, 12, "#a9b9a2", true);
  box(8, 1.8, -35, 12, 3.6, 0.25, "#a9b9a2", true);
  box(4, 1.8, -23, 4, 3.6, 0.25, "#a9b9a2", true);
  box(11, 1.8, -23, 6, 3.6, 0.25, "#a9b9a2", true);
  occluders.push(box(7, 3.2, -23, 2, 1, 0.25, "#a9b9a2"));
  label("ROBERTSONS", 8, 4.8, -22.7, 8).name = "robertsons-name";
  label("HARDWARE & GROCERIES", 8, 3.1, -22.7, 8, "#334a3c", 8).name =
    "robertsons-trade";
  for (const x of [3, 13]) {
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
  // Walk-in hat shop: a wide doorway, clear centre aisle and ten display stands.
  box(24, -0.02, -29, 12, 0.16, 12, "#c5aa87");
  box(18, 1.8, -29, 0.25, 3.6, 12, "#e4bc9e", true);
  box(30, 1.8, -29, 0.25, 3.6, 12, "#e4bc9e", true);
  box(24, 1.8, -35, 12, 3.6, 0.25, "#e4bc9e", true);
  box(19.9, 1.8, -23, 3.8, 3.6, 0.25, "#e4bc9e", true);
  box(28.1, 1.8, -23, 3.8, 3.6, 0.25, "#e4bc9e", true);
  box(24, 3.25, -23, 4.4, 0.7, 0.25, "#e4bc9e");
  label("THREAD & THIMBLE", 24, 3.2, -22.8, 4.2, "#704a65");
  doorways.push({ x: 24, z: -23, w: 4.4, d: 5 });
  box(24, 0.065, -28.3, 4, 0.025, 7, "#a8828b");
  for (const x of [18.16, 29.84]) {
    box(x, 2, -28, 0.04, 1.3, 2, "#a5c9ca");
    box(x, 2, -28, 0.06, 0.06, 2.1, "#79594a");
    box(x, 2, -28, 0.06, 1.4, 0.06, "#79594a");
  }
  label("A hat for every adventure", 24, 2.7, -34.8, 4, "#704a65");
  const hatShopRoof = box(24, 3.8, -29, 12.5, 0.25, 12.5, "#9e6a80");
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
  const wornHat = new T.Group();
  wornHat.position.y = 1.93;
  player.add(wornHat);
  let wornId: HatId | null = null;
  function setHat(id: HatId | null) {
    if (id === wornId) return;
    wornId = id;
    wornHat.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        (o.material as T.Material).dispose();
      }
    });
    wornHat.clear();
    if (id) {
      const model = makeHat(id);
      // Keep tall novelty hats in chibi proportions below the home’s lintels.
      const height = new T.Box3().setFromObject(model).max.y;
      if (height > 0.72) model.scale.y = 0.72 / height;
      wornHat.add(model);
    }
  }
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
  // Visible hedgerows exactly match the boundary colliders.
  const boundaryHedges = [
    { x: -39, z: 0, w: 1, d: 90 },
    { x: 39, z: 0, w: 1, d: 90 },
    { x: 0, z: -40, w: 80, d: 1 },
    { x: 0, z: 39, w: 80, d: 1 },
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
    const height =
      stage === "harvested" ? 1.25 : stage === "growing" ? 1.5 : 2.5;
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
    if (stage === "harvested") {
      g.traverse((o) => {
        if (o instanceof T.Mesh) o.material.color.set("#655e50");
      });
      for (const branch of g.children.slice(1)) branch.rotation.z += 0.8;
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
    setHat,
    wornHat,
    hatDisplays,
    hatShopRoof,
    homeRoof,
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
