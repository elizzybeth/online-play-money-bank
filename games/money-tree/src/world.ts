import { paintBikeShopFacade } from "./bike-shop-mural";
import { seatForTea, createTeaDrinking } from "./tea-pose";
import { farmFields } from "./farm-fields";
import { addShopGardens } from "./shop-gardens";
import { arrangeHatStack } from "./hat-arrangement";
import { createFarm } from "./farm-world";
import { createRiverWorld } from "./river-world";
import {
  riverDistance,
  splitRiverBoundary,
  groveApproachPaths,
} from "./river-land";
import { makeSeriousHat } from "./soyjak-models";
import { makeCrop } from "./crop-model";
import type { Crop } from "./garden-crops";
import { createMarketShops, marketPaths, marketShops } from "./market-world";
import { makeBikeRack, makeBikeRackSign, homeBikeRack } from "./bike-rack";
import { makeBedsideTable } from "./bedside-model";
import { makeFurnishing } from "./furnishing-models";
import type { FurnishingId } from "./furnishings";
import { createTownLife } from "./town-life-world";
import { decorateHome } from "./home-interior";
import { fitWindow, pitchedRoof } from "./architecture";
import { type BirdhousePaint } from "./birdhouse-paint";
import { createWildlife } from "./wildlife";
import { makeBeaRoom } from "./bea-room";
import type { FamilyStory } from "./family-story";
import { bikes, bikeShopBounds } from "./bikes";
import { makeBike } from "./bike-models";
import { notebookSketches } from "./notebook-doodles";
import { makeSeedPacket } from "./seed-packet";
import { makeGardenTool } from "./tool-models";
import { signCanvas } from "./signage";
import { createSigmaWorld } from "./sigma-world";
import { createMillionaireWorld } from "./millionaire-world";
import { terrainHeight } from "./millionaire-land";
import { moneySkeleton } from "./money-tree-model";
import { surfaceMaterial, surfaceTexture } from "./textures";
import { hats, type HatId } from "./hats";
import { makeHat } from "./hat-models";
import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { type Rect, type Plot, opening, momStatus } from "./game";
export type Target = {
  id: string;
  x: number;
  z: number;
  label: string;
  footprint?: { w: number; d: number; rotation: number };
};
export function createWorld(scene: T.Scene) {
  const rects: Rect[] = [],
    occluders: T.Object3D[] = [],
    targets: Target[] = [],
    bills: T.Object3D[] = [],
    plots: T.Group[] = [];
  const paths: Rect[] = [
    ...marketPaths,
    { x: 3, z: 0, w: 5, d: 78 },
    { x: 15, z: -16, w: 52, d: 5 },
    { x: -8.25, z: 25, w: 17.5, d: 2 },
    { x: -16, z: 20, w: 2, d: 12 },
    { x: 24, z: -20, w: 3, d: 9 },
    { x: 34, z: -29.25, w: 3, d: 26.5 },
    { x: -7.5, z: -19.25, w: 21, d: 2.5 },
    { x: -10.7, z: -20.5, w: 4.4, d: 3 },
    { x: -29, z: -16, w: 38, d: 4 },
    { x: -47, z: -37, w: 4, d: 54 },
    { x: -69, z: -10, w: 40, d: 2 },
  ];
  const doorways: Rect[] = [];
  const scenery: {
    x: number;
    z: number;
    radius: number;
    kind: string;
    variety?: string;
    perchY?: number;
  }[] = [];
  const overlaps = (x: number, z: number, radius: number, r: Rect) =>
    x + radius > r.x - r.w / 2 &&
    x - radius < r.x + r.w / 2 &&
    z + radius > r.z - r.d / 2 &&
    z - radius < r.z + r.d / 2;
  // Reserve the walk-in shop interior before scattering outdoor scenery.
  const sceneryExclusions: Rect[] = [
    ...farmFields,
    ...marketShops,
    { x: 24, z: -29, w: 12, d: 12 },
    { x: 6, z: -30, w: 20, d: 18 },
    { x: -5, z: 10, w: 8, d: 8 },
    { x: -15, z: 6, w: 12, d: 16 },
    { x: -15, z: 19, w: 14, d: 8 },
    { x: 12, z: 15, w: 7, d: 6 },
    { x: 12, z: 1, w: 7, d: 6 },
    { x: -39, z: -25, w: 8, d: 8 },
    { x: -69, z: -25, w: 49, d: 39 },
    { x: -18, z: -30, w: 21, d: 19 },
  ];
  const clearScenery = (x: number, z: number, radius: number) =>
    riverDistance(x, z) > radius + 5 &&
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
    const m = new T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>(
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
    if (
      parent === scene &&
      Math.min(w, d) <= 0.6 &&
      ((solid && h >= 2.8) || (y > 2.8 && (h < 0.4 || h >= 2.8)))
    )
      m.userData.cameraWall = true;
    m.userData.boxDimensions = { w, h, d };
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    if (solid) {
      // Low solid furniture can be cleared by the rabbit-hat jump. Tall
      // structural walls keep an unbounded collision height.
      rects.push({
        x,
        z,
        w,
        d,
        ...(h <= 2.4 && y + h / 2 <= 2.8 ? { clearHeight: y + h / 2 } : {}),
      });
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
        transparent: true,
        alphaTest: 0.05,
      }),
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }
  function target(id: string, x: number, z: number, label: string) {
    const point = { id, x, z, label };
    targets.push(point);
    return point;
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
  // Grip origin at the D-handle. The whole shaft remains in front of the torso.
  diggingTool.children.forEach((child) => {
    child.position.y -= 2.06;
  });
  function setDigging(active: boolean, shovel: boolean, time: number) {
    diggingTool.visible = active && shovel;
    const stroke = Math.sin(time * Math.PI * 3);
    diggingTool.rotation.set(active ? -0.32 - (stroke + 1) * 0.14 : 0, 0, 0);
    diggingTool.position.set(0.65, 1.3 + stroke * 0.12, 0.65);
    for (const hand of player.children.filter((o) =>
      o.name.startsWith("hand-"),
    )) {
      const side = hand.name === "hand--1" ? -1 : 1;
      if (active && shovel) {
        const grip = new T.Vector3(0, side > 0 ? 0 : -0.38, 0)
          .multiplyScalar(0.7)
          .applyEuler(diggingTool.rotation)
          .add(diggingTool.position);
        hand.position.copy(grip);
      } else
        hand.position.set(
          side * 0.43,
          active ? 0.5 + stroke * 0.13 : 0.79,
          active ? 0.3 + stroke * 0.09 : 0,
        );
    }
    player.getObjectByName("body")!.rotation.x = active ? 0.12 : 0;
  }
  const fertilizerBox = new T.Group();
  player.add(fertilizerBox);
  box(0, 0, 0, 0.22, 0.32, 0.13, "#e6cc83", false, fertilizerBox);
  box(0, 0.02, 0.072, 0.18, 0.16, 0.012, "#48764a", false, fertilizerBox);
  box(0, 0.18, 0, 0.19, 0.035, 0.1, "#f6e7bc", false, fertilizerBox);
  const fertilizerGrains = new T.Group();
  scene.add(fertilizerGrains);
  for (let i = 0; i < 24; i++) {
    const grain = new T.Mesh(
      new T.IcosahedronGeometry(0.04, 0),
      mat(i % 2 ? "#d6b678" : "#6d9c58"),
    );
    fertilizerGrains.add(grain);
  }
  fertilizerBox.visible = fertilizerGrains.visible = false;
  function setFertilizing(active: boolean, time: number, x: number, z: number) {
    fertilizerBox.visible = fertilizerGrains.visible = active;
    if (!active) return;
    const shake = Math.sin(time * 22);
    const hand = player.getObjectByName("hand-1")!;
    hand.position.set(0.68, 1.02 + shake * 0.025, 0.38);
    fertilizerBox.position
      .copy(hand.position)
      .add(new T.Vector3(0, 0.04, 0.04));
    fertilizerBox.rotation.set(0.95 + shake * 0.12, 0, -0.25);
    player.getObjectByName("body")!.rotation.x = 0.12;
    const source = fertilizerBox.getWorldPosition(new T.Vector3());
    fertilizerGrains.children.forEach((grain, i) => {
      const flight = (time * 1.7 + i / 24) % 1;
      grain.visible = time > 0.15 && time < 1.45;
      const angle = i * 2.399;
      const radius = 0.15 + (i % 5) * 0.09;
      grain.position
        .copy(source)
        .lerp(
          new T.Vector3(
            x + Math.cos(angle) * radius,
            terrainHeight(x, z) + 0.27,
            z + Math.sin(angle) * radius,
          ),
          flight,
        );
      grain.position.y += Math.sin(flight * Math.PI) * 0.2;
    });
  }
  const wateringTool = makeGardenTool("can");
  wateringTool.scale.setScalar(0.65);
  wateringTool.visible = false;
  player.add(wateringTool);
  const waterDrops = new T.Group();
  scene.add(waterDrops);
  const dropGeometry = new T.SphereGeometry(0.025, 5, 4);
  const dropMaterial = new T.MeshStandardMaterial({
    color: "#84d5ec",
    transparent: true,
    opacity: 0.8,
  });
  for (let i = 0; i < 32; i++)
    waterDrops.add(new T.Mesh(dropGeometry, dropMaterial));
  waterDrops.visible = false;
  function setWatering(active: boolean, time: number, x: number, z: number) {
    wateringTool.visible = waterDrops.visible = active;
    if (!active) return;
    // The handle stays in the hand as the spout tips forward, clear of the torso.
    const tilt = Math.sin(Math.min(1, time / 0.9) * Math.PI) * 0.65;
    wateringTool.rotation.set(0, -Math.PI / 2, -tilt);
    const grip = new T.Vector3(0.65, 1.15, 0.6);
    wateringTool.position
      .copy(grip)
      .sub(
        new T.Vector3(-0.62, 0.5, 0)
          .multiplyScalar(0.65)
          .applyEuler(wateringTool.rotation),
      );
    player.getObjectByName("hand-1")!.position.copy(grip);
    player
      .getObjectByName("hand--1")!
      .position.copy(
        new T.Vector3(0.1, 0.55, 0)
          .multiplyScalar(0.65)
          .applyEuler(wateringTool.rotation)
          .add(wateringTool.position),
      );
    player.getObjectByName("body")!.rotation.x = 0.08;
    player.updateMatrixWorld(true);
    const spout = wateringTool.localToWorld(new T.Vector3(1.06, 0.66, 0));
    waterDrops.children.forEach((drop, i) => {
      drop.visible = time > 0.1 && time < 0.8;
      const flight = (time * 4 + i / 32) % 1;
      const angle = i * 2.399;
      const radius = 0.1 + (i % 5) * 0.055;
      drop.position
        .copy(spout)
        .lerp(
          new T.Vector3(
            x + Math.cos(angle) * radius,
            terrainHeight(x, z) + 0.3,
            z + Math.sin(angle) * radius,
          ),
          flight,
        );
      drop.position.y += Math.sin(flight * Math.PI) * 0.12;
    });
  }
  const sleeping = new T.Group();
  scene.add(sleeping);
  // The same complete chibi character, lying face-up with head on the pillow.
  const sleeper = person(0, 0, "#dfae6b", "#594637", false, false);
  scene.remove(sleeper);
  sleeper.rotation.x = -Math.PI / 2;
  sleeper.position.set(-19.1, 1.14, 1.75);
  sleeping.add(sleeper);
  const townGround = box(-38, -0.25, -25, 192, 0.5, 140, colors.grass);
  townGround.name = "town-ground";
  townGround.userData.depthAudit = true;
  townGround.material = surfaceMaterial(colors.grass, "grass", 50, 45);
  const eastMarketGround = box(95, -0.25, -19, 74, 0.5, 44, colors.grass);
  eastMarketGround.name = "east-market-ground";
  eastMarketGround.material = surfaceMaterial(colors.grass, "grass", 20, 12);
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
  sidewalk.userData.depthAudit = true;
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
  // A lower lean-to extension meets the house beneath its east eave,
  // rather than intersecting two large pyramid roofs.
  const momRoof = new T.Mesh(new T.BoxGeometry(8.5, 0.16, 8.9), roofMaterial);
  momRoof.position.set(-4.85, 3.55, 10);
  momRoof.rotation.z = -0.018;
  momRoof.name = "mom-bedroom-roof";
  scene.add(momRoof);
  box(-15, -0.02, 6, 12, 0.1, 16, "#dbbe96");
  box(-21, 1.7, 6, 0.25, 3.4, 16, "#efb3aa", true);
  box(-5, -0.02, 10, 8, 0.1, 8, "#dbbe96");
  box(-1, 1.7, 10, 0.25, 3.4, 8, "#efb3aa", true);
  for (const z of [6, 14]) box(-5, 1.7, z, 8, 3.4, 0.25, "#efb3aa", true);
  box(-4, 0.3, 7.9, 2, 0.6, 3.5, "#9a755b", true).name = "moms-bed-frame";
  box(-4, 0.69, 7.9, 2, 0.25, 3.3, "#f0e5cf");
  box(-4, 0.87, 8.4, 2, 0.14, 2.2, "#863d87");
  box(-4, 0.91, 6.85, 1.5, 0.2, 0.7, "#ffefd3");
  const bedside = makeBedsideTable();
  bedside.position.set(-2.4, 0, 7.2);
  scene.add(bedside);
  rects.push({ x: -2.4, z: 7.2, w: 1.2, d: 0.7, clearHeight: 2.28 });

  doorways.push({ x: -9, z: 7.5, w: 2, d: 2.4 });
  box(-9, 1.7, 2.25, 0.25, 3.4, 8.5, "#efb3aa", true);
  box(-9, 1.7, 11.25, 0.25, 3.4, 5.5, "#efb3aa", true);
  occluders.push(box(-9, 3.28, 7.5, 0.25, 0.24, 2, "#e8d2b3"));
  box(-15, 1.7, -2, 12, 3.4, 0.25, "#efb3aa", true);
  for (const z of [6, 14]) {
    box(-19, 1.7, z, 4, 3.4, 0.25, "#efb3aa", true);
    box(-12, 1.7, z, 6, 3.4, 0.25, "#efb3aa", true);
    occluders.push(box(-16, 3.28, z, 2, 0.24, 0.25, "#e8d2b3"));
  }
  box(-19.1, 0.3, 1, 2, 0.6, 3.5, "#9a755b", true);
  box(-19.1, 0.69, 1, 2, 0.25, 3.3, "#f0e5cf");
  box(-19.1, 0.87, 1.5, 2, 0.14, 2.2, "#146d7a");
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
    for (const sketch of notebookSketches(day - 1)) {
      pc.save();
      pc.translate(35 + sketch.x * 1.7, 100 + sketch.y * 1.7);
      pc.scale(1.25, 1.25);
      pc.translate(40, 45);
      pc.rotate((sketch.rotation * Math.PI) / 180);
      pc.translate(-40, -45);
      pc.stroke(new Path2D(sketch.path));
      pc.restore();
    }
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

  cyl(-13, 1.6, 0, 0.18, 0.3, "#877359");
  ball(-13, 1.96, 0, 0.38, "#f6d58e").scale.set(1, 0.7, 1);
  ball(-10.6, 1.65, 0, 0.26, "#e9a7a1");
  ball(-10.6, 1.63, 0.23, 0.1, "#de8f90");
  box(-10.6, 1.9, 0, 0.16, 0.02, 0.025, "#805c59");
  target("bank", -10.8, 1.4, "Use piggy bank");
  box(-19, 0.45, 10, 2.4, 0.9, 3.3, "#b34c2f", true);
  box(-19, 0.85, 10, 1.6, 0.3, 3, "#cb643c");
  box(-20, 0.95, 10, 0.35, 1.4, 3.5, "#9e382d");
  const mom = person(-18.9, 10, "#d9b6bd", "#7d6257");
  mom.rotation.y = Math.PI / 2;
  const seatedLegs = new T.Group();
  seatedLegs.name = "seated-legs";
  mom.add(seatedLegs);
  // No extended limbs: compact seated feet rest directly in front of her dress.

  const momCollider = rects.find((r) => r.x === -18.9 && r.z === 10)!;
  box(-12.5, 0.5, 12.8, 2, 1, 0.8, "#ead9b5", true);
  const worktop = box(-12.5, 1.04, 12.8, 1.9, 0.09, 0.75, "#6a756b");
  const cooking = new T.Group();
  scene.add(cooking);
  cyl(-12.5, 1.2, 12.8, 0.27, 0.25, "#829f97", cooking);
  box(-12.06, 1.27, 12.8, 0.4, 0.06, 0.1, "#716455", false, cooking);
  // A shallow pan of vegetable stew, with food seated inside the rim.
  const rim = new T.Mesh(
    new T.TorusGeometry(0.27, 0.025, 6, 24),
    mat("#ccd0b8"),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(-12.5, 1.34, 12.8);
  cooking.add(rim);
  cyl(-12.5, 1.325, 12.8, 0.24, 0.015, "#bb6b32", cooking);
  for (let j = 0; j < 14; j++) {
    const a = j * 2.399,
      radius = 0.04 + (j % 4) * 0.045;
    const vegetable = box(
      -12.5 + Math.cos(a) * radius,
      1.343,
      12.8 + Math.sin(a) * radius,
      0.055,
      0.028,
      0.04,
      ["#e58b24", "#588d42", "#e5c36d"][j % 3],
      false,
      cooking,
    );
    vegetable.rotation.y = a;
  }
  for (const dx of [-0.49, 0.49]) {
    cyl(-12.5 + dx, 1.107, 12.8, 0.2, 0.02, "#262c2c", cooking);
    cyl(-12.5 + dx, 1.125, 12.8, 0.13, 0.014, "#b54b24", cooking);
  }
  const board = box(
    -11.9,
    1.15,
    12.65,
    0.35,
    0.04,
    0.4,
    "#b7854c",
    false,
    cooking,
  );
  for (let j = 0; j < 4; j++)
    cyl(-11.92 + j * 0.04, 1.18, 12.63, 0.025, 0.025, "#e58b24", cooking);
  box(-12.0, 1.2, 12.87, 0.06, 0.02, 0.27, "#babfba", false, cooking);
  box(-12.0, 1.2, 13.02, 0.06, 0.04, 0.12, "#583b29", false, cooking);
  const spoon = cyl(-12.36, 1.51, 12.79, 0.015, 0.34, "#b88644", cooking);
  spoon.rotation.z = -0.32;
  const steam = new T.Group();
  cooking.add(steam);
  for (let j = 0; j < 3; j++) {
    const path = new T.CatmullRomCurve3([
      new T.Vector3(-12.62 + j * 0.1, 1.38, 12.8),
      new T.Vector3(-12.65 + j * 0.1, 1.55, 12.8),
      new T.Vector3(-12.58 + j * 0.1, 1.71, 12.8),
    ]);
    const wisp = new T.Mesh(
      new T.TubeGeometry(path, 8, 0.012, 4, false),
      new T.MeshBasicMaterial({
        color: "#fff5dd",
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    );
    steam.add(wisp);
  }
  const bacon = new T.Group();
  bacon.name = "bacon-sandwich-cooking";
  scene.add(bacon);
  cyl(-12.5, 1.18, 12.8, 0.32, 0.12, "#343838", bacon);
  box(-12.0, 1.19, 12.8, 0.5, 0.07, 0.1, "#5c4938", false, bacon);
  for (let j = 0; j < 4; j++) {
    const strip = box(
      -12.7 + j * 0.13,
      1.25,
      12.8,
      0.09,
      0.025,
      0.39,
      "#b85238",
      false,
      bacon,
    );
    strip.rotation.y = (j % 2 ? 1 : -1) * 0.12;
    for (let k = 0; k < 4; k++)
      box(
        -12.7 + j * 0.13,
        1.267,
        12.66 + k * 0.08,
        0.07,
        0.009,
        0.035,
        "#f0c5a1",
        false,
        bacon,
      );
  }
  for (const dx of [-0.2, 0.2]) {
    box(-11.94 + dx, 1.13, 12.5, 0.3, 0.04, 0.34, "#d1a257", false, bacon);
    box(-11.94 + dx, 1.155, 12.5, 0.26, 0.025, 0.3, "#f2dec0", false, bacon);
  }
  const spatula = new T.Group();
  spatula.name = "moms-spatula";
  mom.add(spatula);
  box(0, 0, 0, 0.045, 0.36, 0.05, "#5f4230", false, spatula);
  box(0, 0.22, 0, 0.17, 0.18, 0.025, "#969e98", false, spatula);
  for (const x of [-0.04, 0, 0.04])
    box(x, 0.22, 0.015, 0.016, 0.1, 0.003, "#3a4540", false, spatula);
  spatula.position.set(0.53, 1.17, 0.45);
  spatula.rotation.x = 0.9;
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
  box(-12.5, 1.8, 12.8, 1.2, 1, 0.07, "#b89468", false, painting);
  const picture = box(
    -12.5,
    1.8,
    12.75,
    1.06,
    0.86,
    0.04,
    "#ffffff",
    false,
    painting,
  );
  let canvasDay = -1;
  function paintForDay(day: number) {
    if (canvasDay === day) return;
    canvasDay = day;
    const artCanvas = document.createElement("canvas");
    artCanvas.width = 512;
    artCanvas.height = 384;
    const c = artCanvas.getContext("2d")!;
    c.fillStyle = ["#d5e4d6", "#e3c9c3", "#cbdbe3", "#e4ddb9"][day % 4];
    c.fillRect(0, 0, 512, 384);
    c.fillStyle = "#ac8866";
    c.fillRect(0, 270, 512, 114);
    // Striped tablecloth, a ceramic pitcher, flowers and seasonal fruit.
    c.fillStyle = "#ede6cd";
    c.beginPath();
    c.moveTo(35, 266);
    c.lineTo(400, 266);
    c.lineTo(455, 384);
    c.lineTo(0, 384);
    c.fill();
    c.strokeStyle = "#bd7171";
    c.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      c.beginPath();
      c.moveTo(60 + i * 40, 270);
      c.lineTo(30 + i * 52, 384);
      c.stroke();
    }
    c.fillStyle = "#547e8b";
    c.beginPath();
    c.moveTo(170, 174);
    c.bezierCurveTo(160, 210, 135, 282, 185, 305);
    c.bezierCurveTo(250, 324, 272, 266, 235, 174);
    c.closePath();
    c.fill();
    c.strokeStyle = "#547e8b";
    c.lineWidth = 15;
    c.beginPath();
    c.ellipse(252, 231, 27, 44, 0, 0, Math.PI * 2);
    c.stroke();
    for (let i = 0; i < 7; i++) {
      const x = 128 + i * 24,
        y = 80 + ((i * 37 + day * 13) % 70);
      c.strokeStyle = "#4d6d42";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(205, 181);
      c.lineTo(x, y);
      c.stroke();
      for (let p = 0; p < 6; p++) {
        c.fillStyle = ["#fff0ab", "#ce728e", "#b5a1d4", "#f0b078"][
          (day + i) % 4
        ];
        c.beginPath();
        c.ellipse(x + Math.cos(p) * 12, y + Math.sin(p) * 12, 12, 7, p, 0, 7);
        c.fill();
      }
      c.fillStyle = "#a97a39";
      c.beginPath();
      c.arc(x, y, 6, 0, 7);
      c.fill();
    }
    for (let i = 0; i < 3; i++) {
      c.fillStyle = i % 2 ? "#d8ac4f" : "#b6523e";
      c.beginPath();
      c.ellipse(315 + i * 44, 303 + (i % 2) * 15, 23, 20, 0, 0, 7);
      c.fill();
      c.strokeStyle = "#5b693e";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(315 + i * 44, 284);
      c.lineTo(320 + i * 44, 276);
      c.stroke();
    }
    const map = new T.CanvasTexture(artCanvas);
    map.colorSpace = T.SRGBColorSpace;
    const material = picture.material as T.MeshStandardMaterial;
    material.map?.dispose();
    material.map = map;
    material.needsUpdate = true;
  }
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
  let momUpdates = 0;
  function setMomDay(
    day: number,
    playerHome = true,
    force = false,
    story?: FamilyStory,
    gardenVisit = false,
  ) {
    const key = `${day}:${story?.surgeryDay ?? 0}:${+gardenVisit}:${+!!story?.escort}`;
    if (key === momKey && !force) {
      if (story && day === story.surgeryDay) mom.visible = false;
      return false;
    }
    momKey = key;
    momUpdates++;
    paintForDay(day);
    const absent = !!story && day === story.surgeryDay;
    mom.visible = !absent;
    if (absent) {
      bacon.visible = spatula.visible = false;
      const index = rects.indexOf(momCollider);
      if (index >= 0) rects.splice(index, 1);
      momCollider.w = momCollider.d = 0;
      cooking.visible =
        birdhouses.visible =
        painting.visible =
        book.visible =
          false;
      activityProps.forEach((g) => (g.visible = false));
      return false;
    }
    if (!rects.includes(momCollider)) rects.push(momCollider);
    if (story?.escort) {
      bacon.visible = spatula.visible = false;
      cooking.visible =
        birdhouses.visible =
        painting.visible =
        book.visible =
          false;
      activityProps.forEach((g) => (g.visible = false));
      return false;
    }
    const status = gardenVisit
        ? { ...momStatus(day, story), activity: "garden" as const }
        : momStatus(day, story),
      garden = status.activity === "garden";
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
        ? 8.65
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
    bacon.visible = spatula.visible = status.activity === "bacon";
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
  tvScreen.name = "tv-picture-with-captions";
  scene.add(tvScreen);
  for (const y of [1.145, 2.155])
    box(-10.19, y, 10, 0.06, 0.09, 1.83, "#202f31");
  for (const z of [9.11, 10.89])
    box(-10.19, 1.65, z, 0.06, 1.1, 0.09, "#202f31");
  target("tv", -11.4, 10, "Change TV channel");
  let cartoonFrame = "";
  function updateCartoon(
    time: number,
    channel: "cartoons" | "news" = "cartoons",
    headline = "Town News",
    report = "",
  ) {
    const frame = `${Math.floor(time * 8)}-${channel}-${headline}-${report}`;
    if (frame === cartoonFrame) return;
    cartoonFrame = frame;
    const c = cartoonCanvas.getContext("2d")!;
    if (channel === "news") {
      c.fillStyle = "#254c66";
      c.fillRect(0, 0, 384, 216);
      c.fillStyle = "#55788b";
      c.fillRect(210, 22, 155, 110);
      c.fillStyle = "#f1e9d5";
      c.font = "bold 23px Nunito";
      c.fillText("TOWN NEWS", 218, 58);
      c.fillStyle = "#253440";
      c.fillRect(76, 106, 112, 75);
      c.fillStyle = "#e9cba7";
      c.beginPath();
      c.ellipse(132, 75, 30, 37, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#554637";
      c.beginPath();
      c.ellipse(132, 47, 31, 13, -0.1, Math.PI, Math.PI * 2);
      c.fill();
      c.fillStyle = "#303b3a";
      for (const x of [122, 143]) {
        c.beginPath();
        c.arc(x, 70, 3, 0, 7);
        c.fill();
      }
      c.fillStyle = "#b56a65";
      c.fillRect(126, 89, 12, Math.floor(time * 4) % 2 ? 5 : 2);
      c.fillStyle = "#ebdfca";
      c.beginPath();
      c.moveTo(111, 107);
      c.lineTo(132, 131);
      c.lineTo(153, 107);
      c.fill();
      c.fillStyle = "#986c4a";
      c.fillRect(0, 156, 384, 60);
      c.fillStyle = "#183748";
      c.fillRect(0, 174, 384, 42);
      c.fillStyle = "#fff5dc";
      c.font = "bold 19px Nunito";
      c.font = "bold 13px Nunito";
      c.fillText(headline, 10, 187, 364);
      // Dialogue is drawn beside the TV with a readable attribution line.
      tvScreen.userData.caption = report;
      tvScreen.userData.headline = headline;
      cartoonTexture.needsUpdate = true;
      return;
    }
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
    const eating = time % 14 > 10;
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
    const carrot = eating
      ? 108 + Math.sin(time * 1.2) * 20
      : 192 + Math.sin(time) * 36;
    const carrotY = eating ? 132 - Math.abs(Math.sin(time * 3)) * 18 : 181;
    const bite = eating ? Math.max(0.05, 1 - ((time % 14) - 10) / 3.2) : 1;
    c.save();
    c.translate(carrot, carrotY);
    c.scale(bite, bite);
    c.translate(-carrot, -181);
    tvScreen.userData.rabbitEating = eating;
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
    c.restore();
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
  const bedTargets: Target[] = [];
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
    bedTargets.push(target(`plot${i}`, x, z + 1.6, `Garden plot ${i + 1}`));
  }
  for (let i = 0; i < 5; i++) addBed(i, -20 + i * 2, 19);
  function syncBeds(data: Plot[]) {
    const changed = plots.length !== data.length;
    while (plots.length > data.length) {
      const i = plots.length - 1;
      moneyTree(i, "empty", false);
      plots.pop()!.removeFromParent();
      const frame = bedFrames.pop()!;
      frame.traverse((object) => {
        if (!(object instanceof T.Mesh)) return;
        object.geometry.dispose();
        // Materials belong to this bed; soil/wood texture maps are shared.
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material])
          material.dispose();
      });
      frame.removeFromParent();
      bedSoils.pop();
      bedTargets.pop();
      const at = targets.findIndex((t) => t.id === `plot${i}`);
      if (at >= 0) targets.splice(at, 1);
    }
    while (plots.length < data.length) {
      const i = plots.length;
      addBed(i, data[i].x!, data[i].z!);
    }
    data.forEach((p, i) => {
      const plot = plots[i];
      if (i >= 5 && (plot.position.x !== p.x || plot.position.z !== p.z)) {
        const dx = p.x! - plot.position.x,
          dz = p.z! - plot.position.z;
        bedFrames[i].position.x += dx;
        bedFrames[i].position.z += dz;
        plot.position.x = p.x!;
        plot.position.z = p.z!;
        bedTargets[i].x = p.x!;
        bedTargets[i].z = p.z! + 1.6;
        if (treeRects[i]) {
          treeRects[i]!.x = p.x!;
          treeRects[i]!.z = p.z!;
        }
      }
      bedSoils[i].visible = p.soilFilled !== false;
      const openSoil = !!(p.mountain || p.meteor);
      bedFrames[i].visible = !openSoil;
      bedFrames[i].position.y = openSoil ? terrainHeight(p.x!, p.z!) : 0;
      plot.userData.mountain = openSoil;
      plot.position.y = openSoil ? terrainHeight(p.x!, p.z!) + 0.03 : 0.29;
      bedTargets[i].label = openSoil
        ? ["empty", "harvested"].includes(p.stage)
          ? "Plant in terrace soil"
          : "Money tree"
        : `Garden plot ${i + 1}`;
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
    const variety = Math.abs(Math.round(x * 7 + z * 11)) % 4;
    // Keep perched birds above the actual crown instead of inside its leaves.
    scenery[scenery.length - 1].perchY =
      (variety === 1
        ? 4
        : Math.max(2.4 + r, variety === 2 ? 2.7 + r * 0.65 : 0)) + 0.12;
    scenery[scenery.length - 1].kind = "tree";
    if (variety === 1) {
      for (let tier = 0; tier < 3; tier++) {
        const crown = new T.Mesh(
          new T.ConeGeometry(r * (1 - tier * 0.2), 1.6, 9),
          surfaceMaterial("#466f58", "leaf"),
        );
        crown.position.set(x, 2 + tier * 0.6, z);
        scene.add(crown);
      }
    } else {
      const colors = ["#6f9977", "#86a366", "#b4b771", "#729c91"];
      ball(x, 2.4, z, r, colors[variety]);
      ball(x + 0.55, 2.3, z + 0.2, r * 0.7, colors[(variety + 1) % 4]);
      if (variety === 2)
        for (const side of [-1, 1])
          ball(x + side * 0.7, 2.7, z - 0.25, r * 0.65, "#b4b771");
    }
    scenery[scenery.length - 1].variety = ["oak", "pine", "maple", "birch"][
      variety
    ];
    if (variety === 3) cyl(x, 0.9, z, 0.18, 1.8, "#ded9c3");
    rects.push({ x, z, w: 0.4, d: 0.4 });
  }
  function house(x: number, z: number, c: string, name: string) {
    const frontWalls: T.Mesh[] = [];
    if (name === "THE WILLOWS") {
      box(x - 3.5, 1.6, z, 0.2, 3.2, 6, c, true);
      box(x + 3.5, 1.6, z, 0.2, 3.2, 6, c, true);
      box(x, 1.6, z - 3, 7, 3.2, 0.2, c, true);
      for (const side of [-1, 1])
        frontWalls.push(
          box(x + side * 2.25, 1.6, z + 3, 2.5, 3.2, 0.2, c, true),
        );
      box(x, 2.95, z + 3, 2, 0.5, 0.2, c);
    } else {
      box(x - 3.5, 1.6, z, 0.2, 3.2, 6, c, true);
      box(x + 3.5, 1.6, z, 0.2, 3.2, 6, c, true);
      box(x, 1.6, z - 3, 7, 3.2, 0.2, c, true);
      frontWalls.push(box(x, 1.6, z + 3, 7, 3.2, 0.2, c, true));
      box(x, 0.025, z, 7, 0.05, 6, "#c3ad8e");
    }
    const roof = new T.Mesh(
      new T.ConeGeometry(5.3, 2, 4),
      surfaceMaterial("#a76f60", "shingles", 4, 2),
    );
    roof.position.set(x, 4, z);
    roof.rotation.y = Math.PI / 4;
    scene.add(roof);
    roof.name =
      name === "MAPLE HOUSE"
        ? "mabel-house-roof"
        : `${name.toLowerCase().replaceAll(" ", "-")}-roof`;
    roof.userData.roof = true;
    roof.userData.cameraWall = true;
    if (name === "THE WILLOWS") {
      roof.name = "bea-house-roof";
      (roof.material as T.MeshStandardMaterial).transparent = true;
    }
    (roof.material as T.MeshStandardMaterial).side = T.DoubleSide;
    occluders.push(roof);
    // Window panes and trim belong to their cutaway wall, never float alone.
    for (const wall of frontWalls) {
      const xs =
        name === "THE WILLOWS"
          ? [x + Math.sign(wall.position.x - x) * 2 - wall.position.x]
          : [-2, 2];
      fitWindow(
        wall,
        true,
        name === "THE WILLOWS" ? 2.5 : 7,
        3.2,
        0.2,
        xs.map((offset) => ({ x: offset, y: 0.2, width: 1.2, height: 1.2 })),
      );
      wall.userData.windowsFitted = true;
    }
    if (name !== "THE WILLOWS") {
      const door = box(x, 1, z + 3.03, 1.2, 2, 0.12, "#8b6e53");
      frontWalls[0].attach(door);
    }
    if (name === "SPOKE & SADDLE") label(name, x, 3.1, z + 3.16, 3.7);
    doorways.push({ x, z: z + 4.5, w: 2.4, d: 4 });
    for (const a of [-2.7, -1.8, 1.8, 2.7]) {
      if (!clearScenery(x + a, z + 4.5, 0.45)) continue;
      const shrubType = Math.abs(Math.round(x + a)) % 3;
      if (shrubType === 1) {
        const shrub = new T.Mesh(
          new T.ConeGeometry(0.43, 0.95, 9),
          surfaceMaterial("#68886c", "leaf"),
        );
        shrub.position.set(x + a, 0.48, z + 4.5);
        scene.add(shrub);
      } else {
        ball(
          x + a,
          0.45,
          z + 4.5,
          0.45,
          shrubType === 2 ? "#a894b7" : "#adc88a",
        );
        if (shrubType === 2)
          for (let j = 0; j < 5; j++)
            ball(
              x + a + Math.sin(j * 2) * 0.3,
              0.65,
              z + 4.5 + Math.cos(j * 2) * 0.3,
              0.065,
              "#dbc1d8",
            );
      }
      scenery.push({ x: x + a, z: z + 4.5, radius: 0.45, kind: "bush" });
    }
  }
  house(12, 15, "#dcbab0", "THE WILLOWS");
  house(12, 1, "#efdbaf", "ROSE COTTAGE");
  house(-39, -25, "#c4d2b0", "MAPLE HOUSE");
  speakers.push({
    id: "npc1",
    name: "Bea",
    object: person(10, 20, "#bda9d4", "#79584b"),
  });
  target("npc1", 10, 20, "Talk to Bea");
  const bea = speakers.find((n) => n.id === "npc1")!.object;
  const beaCollider = rects.find((r) => r.x === 10 && r.z === 20)!;
  const beaRoom = makeBeaRoom(scene);
  const beaSip = createTeaDrinking(bea, beaRoom.cups[0]);
  const playerSip = createTeaDrinking(player, beaRoom.cups[1]);
  function updateTea(dt: number, seated: boolean, reduced: boolean) {
    beaSip(dt, beaInside, reduced);
    playerSip(dt, seated, reduced);
  }
  rects.push(beaRoom.tableRect);
  target("bea-chair", 12, 16.9, "Sit down for tea with Bea");
  let beaInside = false;
  function setBeaInside(inside: boolean) {
    if (inside === beaInside) return;
    beaInside = inside;
    bea.position.set(inside ? 10.25 : 10, 0, inside ? 15.2 : 20);
    seatForTea(bea, inside);
    bea.rotation.y = inside ? Math.PI / 2 : 0;
    beaCollider.x = bea.position.x;
    beaCollider.z = bea.position.z;
    const t = targets.find((t) => t.id === "npc1")!;
    t.x = inside ? 10.5 : 10;
    t.z = inside ? 16.3 : 20;
  }
  speakers.push({
    id: "npc2",
    name: "Jun",
    object: person(12, 6, "#abc0cf", "#c49a62"),
  });
  target("npc2", 12, 6, "Talk to Jun");
  speakers.push({
    id: "npc3",
    name: "Mabel",
    object: person(-39, -30.7, "#dea58d", "#5f5549"),
  });
  target("npc3", -39, -30.7, "Talk to Mabel");
  // Robertsons walk-in shop at end of lane, front facing south.
  const sx = 8,
    sz = -31;
  box(6, -0.01, -30, 20, 0.12, 18, "#d0b894");
  box(-4, 3.6, -30, 0.25, 7.2, 18, "#a9b9a2", true);
  box(16, 3.6, -30, 0.25, 7.2, 18, "#a9b9a2", true);
  box(6, 3.6, -39, 20, 7.2, 0.25, "#a9b9a2", true);
  box(1, 3.6, -21, 10, 7.2, 0.25, "#a9b9a2", true);
  box(12, 3.6, -21, 8, 7.2, 0.25, "#a9b9a2", true);
  occluders.push(box(7, 5.28, -21, 2, 3.84, 0.25, "#a9b9a2"));
  const robertsonsRoof = box(6, 7.4, -30, 20.5, 0.25, 18.5, "#647a66");
  robertsonsRoof.geometry.dispose();
  robertsonsRoof.geometry = pitchedRoof(20.5, 18.5);
  robertsonsRoof.name = "robertsons-roof";
  robertsonsRoof.material = surfaceMaterial("#647a66", "shingles", 6, 5);
  (robertsonsRoof.material as T.MeshStandardMaterial).transparent = true;
  label("Robertsons", 8, 8, -20.7, 8).name = "robertsons-name";
  label("Hardware", 8, 5.1, -20.7, 8, "#334a3c", 2.4).name = "robertsons-trade";
  for (const x of [15.15]) {
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
    ["can", 2, -28, "WATERING CAN · $1", "#86ada5"],
    ["shovel", 10, -28, "SHOVEL · $1", "#9da5a2"],
    ["fertilizer", 13, -30, "FERTILIZER · 5 DOSES · $5", "#d7c18b"],
  ] as const) {
    box(x, 0.45, z, 1.1, 0.9, 1, "#b2946d", true);
    if (id === "can" || id === "shovel") {
      const model = makeGardenTool(id);
      model.position.set(x, 0.92, z);
      scene.add(model);
      model.updateWorldMatrix(true, true);
      rects.find((r) => r.x === x && r.z === z)!.clearHeight =
        new T.Box3().setFromObject(model).max.y;
    } else {
      const sack = box(x, 1.35, z, 0.65, 0.85, 0.55, color);
      sack.material = surfaceMaterial(color, "cloth");
      rects.find((r) => r.x === x && r.z === z)!.clearHeight = 1.775;
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
  const gardenBedDisplay = new T.Group();
  gardenBedDisplay.name = "garden-bed-model";
  scene.add(gardenBedDisplay);
  for (const x of [1.94, 4.06])
    box(x, 0.98, -34, 0.13, 0.4, 1.5, "#c3a176", false, gardenBedDisplay);
  for (const z of [-34.7, -33.3])
    box(3, 0.98, z, 2.25, 0.4, 0.13, "#c3a176", false, gardenBedDisplay);
  box(3, 0.79, -34, 2.1, 0.05, 1.35, "#66513c", false, gardenBedDisplay);
  rects.find((r) => r.x === 3 && r.z === -34)!.clearHeight = 1.18;
  label("Garden bed · $30", 3, 1.7, -32.98, 3);
  target("garden-bed", 3, -32.45, "Inspect garden bed · $30");
  box(12, 0.4, -35, 1.5, 0.8, 1.5, "#b2946d", true);
  const soilSack = box(12, 1.3, -35, 0.9, 1, 0.65, "#c3b295");
  soilSack.material = surfaceMaterial("#c3b295", "cloth");
  rects.find((r) => r.x === 12 && r.z === -35)!.clearHeight = 1.8;
  box(12, 1.36, -34.66, 0.58, 0.5, 0.015, "#e7dfbe");
  label("Soil · $10", 12, 2.2, -34.55, 2.5);
  target("garden-soil", 12, -33.4, "Inspect soil · $10");
  // Walk-in hat shop: a wide doorway, clear centre aisle and ten display stands.
  box(24, -0.02, -29, 12, 0.16, 12, "#c5aa87");
  box(18, 3.6, -29, 0.25, 7.2, 12, "#e4bc9e", true);
  box(30, 3.6, -29, 0.25, 7.2, 12, "#e4bc9e", true);
  box(24, 3.6, -35, 12, 7.2, 0.25, "#e4bc9e", true);
  box(19.9, 3.6, -23, 3.8, 7.2, 0.25, "#e4bc9e", true);
  box(28.1, 3.6, -23, 3.8, 7.2, 0.25, "#e4bc9e", true);
  box(24, 5.05, -23, 4.4, 4.3, 0.25, "#e4bc9e");
  label("Haberdashery", 24, 6.25, -22.6, 7, "#704a65", 5).name =
    "thread-thimble-haberdashery-sign";
  const arrowPost = box(28.2, 2.65, -22.55, 0.14, 5.3, 0.16, "#856c50");
  arrowPost.name = "haberdasher-arrow-post";
  // Rotated one-unit panels need more than one unit between their centres.
  // Keep them clear of one another and in front of the support and roof.
  for (const [text, y, turn] of [
    ["Thread & Thimble", 4.65, -0.06],
    ["Angry Haberdasher", 3.3, 0.08],
    ["This Way", 1.95, -0.055],
  ] as const) {
    const arrow = label(text, 28.2, y, -22.4, 4, "#704a65");
    arrow.name = `milliner-arrow-${text}`;
    arrow.rotation.z = turn;
  }
  doorways.push({ x: 24, z: -23, w: 4.4, d: 5 });
  box(24, 0.065, -28.3, 4, 0.025, 7, "#a8828b");
  label("A hat for every adventure", 24, 2.7, -34.8, 4, "#704a65");
  const hatShopRoof = box(24, 7.4, -29, 12.5, 0.25, 12.5, "#9e6a80");
  hatShopRoof.material = surfaceMaterial("#9e6a80", "shingles", 5, 5);
  hatShopRoof.geometry.dispose();
  hatShopRoof.geometry = pitchedRoof(12.5, 12.5);
  hatShopRoof.name = "thread-thimble-roof";
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
  hats.slice(0, 10).forEach((hat, i) => {
    const x = i < 5 ? 19.5 : 28.5,
      z = -24.6 - (i % 5) * 1.85;
    box(x, 0.47, z, 0.9, 0.94, 0.9, "#b89874", true);
    cyl(x, 1.03, z, 0.13, 0.22, "#73543c");
    const model = makeHat(hat.id);
    model.position.set(x, 1.2, z);
    scene.add(model);
    rects.find((r) => r.x === x && r.z === z)!.clearHeight =
      new T.Box3().setFromObject(model).max.y;
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
  const homeDecor = decorateHome(scene, rects);
  target("couch", -17.2, 11.1, "Sit on the couch");
  function setPlayerSeated(seated: boolean) {
    if (player.getObjectByName("tea-legs")) seatForTea(player, false);
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
  function setHat(ids: HatId[] | HatId | null, serious = false, level = 1) {
    const stack = Array.isArray(ids) ? ids : ids ? [ids] : [];
    const key = stack.join(",") + (serious ? ":serious" : "") + `:${level}`;
    if (key === wornKey) return;
    wornKey = key;
    wornHat.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        const material = o.material as T.MeshStandardMaterial;
        material.map?.dispose();
        material.dispose();
      }
    });
    wornHat.clear();
    const models = stack.map((id) => {
      const model = makeHat(id);
      return { id, model, height: new T.Box3().setFromObject(model).max.y };
    });
    const layout = arrangeHatStack(models, level);
    wornHat.scale.set(1, 1, 1);
    for (const item of layout) {
      item.model.position.y = item.y;
      item.model.userData.hatId = item.id;
      wornHat.add(item.model);
    }
    wornHat.userData.height =
      Math.max(0, ...layout.map((item) => item.y + item.height)) +
      (serious ? 0.35 : 0);
    if (serious) {
      const paper = makeSeriousHat();
      // Paper is a base for ornaments rather than covering the nest/saxophone.
      paper.userData.hatId = "serious";
      const bonnet = layout.find((item) => item.id === "seedkeeper");
      paper.position.y = bonnet
        ? Math.min(bonnet.height * 0.85, 0.45 + level * 0.25)
        : 0;
      for (const item of layout)
        if (item.id !== "seedkeeper") item.model.position.y += 0.35;
      wornHat.add(paper);
    }
  }

  // Pegs and an upright post in the bedroom, clear of the door and desk.
  cyl(-20.2, 1.35, 4.8, 0.07, 2.7, "#a48162");
  for (const y of [0.6, 1.06, 1.52, 1.98, 2.44])
    for (const side of [-1, 1])
      box(-20.2 + side * 0.3, y, 4.8, 0.6, 0.06, 0.09, "#a48162");
  box(-20.2, 0.09, 4.8, 0.9, 0.18, 0.65, "#a48162");
  target("hat-rack", -19.5, 4.8, "Manage your hats");
  const rackHats = new T.Group();
  rackHats.name = "owned-hats-on-rack";
  scene.add(rackHats);
  let rackKey = "";
  function setRackHats(owned: HatId[]) {
    const key = owned.join(",");
    if (key === rackKey) return;
    rackKey = key;
    rackHats.children.forEach((g) =>
      g.traverse((o) => {
        if (o instanceof T.Mesh) {
          o.geometry.dispose();
          (o.material as T.Material).dispose();
        }
      }),
    );
    rackHats.clear();
    owned.forEach((id, i) => {
      const model = makeHat(id);
      model.name = `rack-${id}`;
      model.scale.setScalar(0.46);
      model.position.set(
        -20.2 + (i % 2 ? 0.36 : -0.36),
        0.6 + Math.floor(i / 2) * 0.46,
        4.97,
      );
      model.rotation.y = 0.3;
      rackHats.add(model);
    });
  }
  // A walk-in showroom with wide aisles and wall-mounted bicycles.
  box(-18, 0.025, -30, 20, 0.05, 18, "#b5c4cd");
  box(-28, 3.6, -30, 0.25, 7.2, 18, "#b5c4cd", true);
  box(-8, 3.6, -30, 0.25, 7.2, 18, "#b5c4cd", true);
  box(-18, 3.6, -39, 20, 7.2, 0.25, "#b5c4cd", true);
  const bikeShopFront = [
    box(-20.45, 3.6, -21, 15.1, 7.2, 0.25, "#b5c4cd", true),
    box(-8.2, 3.6, -21, 0.4, 7.2, 0.25, "#b5c4cd", true),
    box(-10.65, 5.15, -21, 4.5, 4.1, 0.25, "#b5c4cd"),
  ];
  const bikeShopRoof = box(-18, 7.4, -30, 20.5, 0.25, 18.5, "#647a84");
  bikeShopRoof.material = surfaceMaterial("#647a84", "shingles", 6, 5);
  (bikeShopRoof.material as T.MeshStandardMaterial).transparent = true;
  bikeShopRoof.geometry.dispose();
  bikeShopRoof.geometry = pitchedRoof(20.5, 18.5);
  bikeShopRoof.name = "spoke-saddle-roof";

  box(-9, 0.65, -34.5, 1, 1.3, 3, "#947859", true);
  box(-9, 1.35, -34.5, 1.2, 0.12, 3.2, "#8f9ea2");
  for (const z of [-35.4, -34.5, -33.6])
    box(-9, 1.55, z, 0.55, 0.35, 0.5, "#e5b567");
  for (const x of [-24, -18, -12]) {
    cyl(x, 3.35, -29, 0.055, 0.6, "#657075");
    const lamp = new T.Mesh(
      new T.ConeGeometry(0.45, 0.25, 12),
      new T.MeshStandardMaterial({
        color: "#f2deac",
        emissive: "#d4b868",
        emissiveIntensity: 0.2,
      }),
    );
    lamp.position.set(x, 3.08, -29);
    scene.add(lamp);
  }
  doorways.push({ x: -10.65, z: -21, w: 4.5, d: 5 });
  const bikeRack = makeBikeRack();
  bikeRack.object.position.set(homeBikeRack.x, 0, homeBikeRack.z);
  bikeRack.object.add(makeBikeRackSign());
  scene.add(bikeRack.object);
  rects.push({
    x: homeBikeRack.x,
    z: homeBikeRack.z,
    w: 7,
    d: 3.2,
    clearHeight: 2.4,
  });
  target(
    "bike-rack",
    homeBikeRack.targetX,
    homeBikeRack.targetZ,
    "Choose a bike",
  );
  const bikeDisplays = bikes.map((bike, i) => {
    const hung = i >= 4;
    const x = hung ? -24 + (i - 4) * 6 : i % 2 ? -12 : -24;
    const z = hung ? -37.7 : i < 2 ? -25.5 : -31.5;
    const model = makeBike(bike.id);
    model.position.set(x, hung ? 1.5 : 0.14, z);
    model.rotation.y = hung ? Math.PI / 2 : Math.PI / 6;
    scene.add(model);
    if (hung) {
      for (const a of [-0.8, 0.8])
        box(x + a, 1.7, -38.25, 0.08, 0.9, 0.8, "#647a84");
    } else box(x, 0.07, z, 2.9, 0.14, 3.3, "#8f9ea2");
    rects.push({
      x,
      z,
      w: hung ? 3 : 2.3,
      d: hung ? 1.1 : 2.8,
      clearHeight: new T.Box3().setFromObject(model).max.y,
    });
    const signZ = hung ? -36.6 : z + 1.65;
    label(
      `${bike.name} · $${bike.price / 100}`,
      x,
      hung ? 1.15 : 0.6,
      signZ,
      2.8,
      "#334a3c",
    );
    target(
      `bike-${bike.id}`,
      x,
      hung ? -35.6 : z + 2.2,
      `Inspect ${bike.name}`,
    );
    model.userData.hung = hung;
    return model;
  });
  speakers.push({
    id: "bicycle",
    name: "Pretty Good Bikes",
    object: person(-18, -32.5, "#aec3a1", "#79584b"),
  });
  target("bicycle", -18, -31, "Talk to Pretty Good Bikes");
  for (let i = 0; i < 30; i++) {
    const x = i % 2 ? -28 - (i % 4) * 2 : 30 + (i % 4) * 2,
      z = -38 + i * 2.5;
    foliage(x, z, 1.7);
  }
  for (let i = 0; i < 16; i++)
    foliage(-34 + (i % 2) * 2, -35 + Math.floor(i / 2) * 8, 1.15);
  for (const x of [-84, -71, -57]) foliage(x, 3.5, 1.35);
  for (const [x, z] of [
    [-5, 10],
    [-4, -5],
    [19, 9],
    [20, -6],
    [-23, -19],
    [28, -19],
  ])
    foliage(x, z, 1.4);
  // Denser woodland edges, with broad clear approaches to every building.
  for (let i = 0; i < 48; i++) {
    const x = -34 + (i % 8) * 9 + Math.sin(i * 4.1) * 1.2;
    const z = -35 + Math.floor(i / 8) * 13 + Math.cos(i * 2.7);
    if (scenery.some((o) => Math.hypot(o.x - x, o.z - z) < 3.7)) continue;
    if ((x > 25 && z < -30) || (x > 5 && x < 22 && z > -5 && z < 23)) continue;
    foliage(x, z, 1.15 + (i % 3) * 0.22);
  }
  for (let i = 0; i < 22; i++) {
    const x = -33 + (i % 6) * 12,
      z = -33 + Math.floor(i / 6) * 21;
    if (
      !clearScenery(x, z, 0.8) ||
      scenery.some((o) => Math.hypot(o.x - x, o.z - z) < 2)
    )
      continue;
    const color = ["#648c73", "#88a664", "#b193b5"][i % 3];
    if (i % 3 === 1) {
      const shrub = new T.Mesh(
        new T.ConeGeometry(0.55, 1.2, 9),
        surfaceMaterial("#68886c", "leaf"),
      );
      shrub.position.set(x, 0.6, z);
      scene.add(shrub);
    } else
      for (let l = 0; l < 3; l++)
        ball(
          x + Math.sin(l * 2) * 0.3,
          0.4 + l * 0.08,
          z + Math.cos(l * 2) * 0.25,
          0.48,
          color,
        );
    if (i % 3 === 2)
      for (let cluster = 0; cluster < 5; cluster++) {
        const cx = x + Math.sin(cluster * 2.4) * 0.4;
        const cz = z + Math.cos(cluster * 2.4) * 0.4;
        for (let flower = 0; flower < 12; flower++) {
          const angle = flower * 2.399;
          const radius = 0.06 + (flower % 3) * 0.035;
          const bloom = ball(
            cx + Math.cos(angle) * radius,
            0.75 + Math.sin(flower * 3) * 0.07,
            cz + Math.sin(angle) * radius,
            0.055,
            ["#b3a0dc", "#9ab9e7", "#dda9cc"][(i + cluster) % 3],
          );
          bloom.scale.y = 0.7;
        }
      }
    if (i % 3 === 0)
      for (let b = 0; b < 6; b++)
        ball(
          x + Math.sin(b * 3) * 0.4,
          0.6,
          z + Math.cos(b * 3) * 0.4,
          0.055,
          "#c47779",
        );
    scenery.push({
      x,
      z,
      radius: 0.8,
      kind: "bush",
      variety: ["berry", "juniper", "hydrangea"][i % 3],
    });
  }
  const outdoorBirdhouses: T.Group[] = [];
  for (const [i, tree] of scenery
    .filter((o) => o.kind === "tree")
    .sort(
      (a, b) => Math.hypot(a.x + 16, a.z - 19) - Math.hypot(b.x + 16, b.z - 19),
    )
    .slice(0, 12)
    .entries()) {
    const g = new T.Group();
    g.position.set(tree.x, 1.35, tree.z + tree.radius + 1.5);
    g.userData.treeRadius = tree.radius;
    g.userData.tree = { x: tree.x, z: tree.z };
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
    g.children[0].name = "paint-body";
    const roof = box(0, 0.25, 0, 0.55, 0.08, 0.45, "#8e6548", false, g);
    roof.name = "paint-roof";
    roof.rotation.z = 0.15;
    const hole = ball(0, 0.03, 0.18, 0.075, "#3d392f", g);
    hole.scale.z = 0.1;
    box(0, -0.12, 0.25, 0.04, 0.04, 0.2, "#a48162", false, g);
    box(0, -0.78, 0, 0.11, 1.55, 0.11, "#a48162", false, g).name =
      "birdhouse-stilt";
    box(0, -1.32, 0, 0.42, 0.08, 0.32, "#a48162", false, g);
    outdoorBirdhouses.push(g);
  }
  function showBirdhouses(count: number, paints: BirdhousePaint[] = []) {
    outdoorBirdhouses.forEach((g, i) => {
      g.visible = i < count;
      if (!paints[i]) return;
      for (const [name, color] of [
        ["paint-body", paints[i].body],
        ["paint-roof", paints[i].roof],
      ]) {
        const mesh = g.getObjectByName(name) as T.Mesh;
        if (!mesh.userData.ownPaint) {
          mesh.material = (mesh.material as T.MeshStandardMaterial).clone();
          mesh.userData.ownPaint = true;
        }
        (mesh.material as T.MeshStandardMaterial).color.set(color);
      }
    });
  }
  const houseBirds = Array.from({ length: 2 }, (_, i) => {
    const g = new T.Group();
    g.name = "birdhouse-visitor";
    ball(0, 0, 0, 0.09, i ? "#caa265" : "#6991ad", g).scale.set(1, 0.8, 1.5);
    for (const side of [-1, 1]) {
      const wing = ball(side * 0.1, 0, 0, 0.08, "#526d85", g);
      wing.name = "wing";
      wing.scale.set(1.8, 0.15, 1);
    }
    scene.add(g);
    return g;
  });
  function updateHouseBirds(time: number) {
    houseBirds.forEach((bird, i) => {
      const house = outdoorBirdhouses[i];
      const cycle = (time + i * 13) % 32;
      bird.visible = house.visible && cycle < 9;
      if (!bird.visible) return;
      const hole = house.position.clone().add(new T.Vector3(0, 0.03, 0.24));
      const outside = hole.clone().add(new T.Vector3(i ? 2 : -2, 1.2, 4));
      const t =
        cycle < 5 ? Math.min(1, cycle / 4) : Math.min(1, (cycle - 5) / 4);
      bird.position.lerpVectors(
        cycle < 5 ? outside : hole,
        cycle < 5 ? hole : outside,
        t,
      );
      if (cycle >= 4 && cycle < 5) bird.visible = false;
      bird.rotation.y =
        Math.atan2(hole.x - outside.x, hole.z - outside.z) +
        (cycle >= 5 ? Math.PI : 0);
      bird.children
        .filter((o) => o.name === "wing")
        .forEach(
          (w, j) => (w.rotation.z = (j ? 1 : -1) * Math.sin(time * 24) * 0.6),
        );
    });
  }
  const fertilizerMarkers = new T.Group();
  fertilizerMarkers.name = "fertilizer-in-beds";
  scene.add(fertilizerMarkers);
  let fertilizerMarkerKey = "";
  function setFertilizerMarkers(data: Plot[], day: number) {
    const key = data
      .map((p, i) => (p.fertilizedDay === day ? `${i}:${p.x}:${p.z}` : ""))
      .join(",");
    if (key === fertilizerMarkerKey) return;
    fertilizerMarkerKey = key;
    fertilizerMarkers.children.forEach((g) =>
      g.traverse((o) => {
        if (o instanceof T.Mesh) {
          o.geometry.dispose();
          (o.material as T.Material).dispose();
        }
      }),
    );
    fertilizerMarkers.clear();
    data.forEach((p, i) => {
      if (p.fertilizedDay !== day || !plots[i]) return;
      const patch = new T.Group();
      patch.name = `fertilized-bed-${i}`;
      patch.position.copy(plots[i].position);
      fertilizerMarkers.add(patch);
      for (let n = 0; n < 24; n++) {
        const angle = n * 2.399,
          radius = 0.22 + (n % 5) * 0.11;
        const grain = new T.Mesh(
          new T.IcosahedronGeometry(0.04, 0),
          mat(n % 2 ? "#d6b678" : "#6d9c58"),
        );
        grain.position.set(
          Math.cos(angle) * radius,
          0.28,
          Math.sin(angle) * radius,
        );
        patch.add(grain);
      }
    });
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
    if (
      ["rosette", "aloe", "cactus", "flytrap", "pitcher", "sundew"].includes(
        type,
      )
    ) {
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const leaf = ball(
          Math.cos(a) * 0.13,
          0.22,
          Math.sin(a) * 0.13,
          0.14,
          type === "rosette" ? "#8eb6ab" : "#709457",
          g,
        );
        leaf.scale.set(0.65, type === "aloe" ? 2.5 : 0.55, 1.6);
        leaf.rotation.z = Math.cos(a) * 0.4;
      }
      if (type === "cactus") {
        ball(0, 0.4, 0, 0.17, "#6d9a73", g).scale.set(0.8, 2, 0.8);
        ball(0.16, 0.45, 0, 0.09, "#6d9a73", g).scale.y = 1.6;
        ball(0, 0.73, 0, 0.07, "#e0a1bd", g);
      } else if (type === "flytrap") {
        for (const side of [-1, 1]) {
          const jaw = ball(side * 0.075, 0.52, 0, 0.13, "#8caa61", g);
          jaw.scale.set(0.85, 0.45, 1.3);
          jaw.rotation.z = side * 0.5;
          ball(side * 0.075, 0.55, 0, 0.08, "#bd7979", g).scale.set(
            0.8,
            0.25,
            1.2,
          );
          for (let tooth = 0; tooth < 4; tooth++)
            cyl(
              side * 0.16,
              0.58,
              -0.1 + tooth * 0.065,
              0.009,
              0.1,
              "#e5d8a1",
              g,
            );
        }
      } else if (type === "pitcher") {
        ball(0, 0.46, 0, 0.14, "#bb767e", g).scale.set(0.8, 1.8, 0.8);
        const rim = new T.Mesh(
          new T.TorusGeometry(0.105, 0.025, 6, 12),
          new T.MeshStandardMaterial({ color: "#e3b69a" }),
        );
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.69;
        g.add(rim);
        ball(0.03, 0.76, -0.07, 0.11, "#81975b", g).scale.set(1, 0.2, 1);
      } else if (type === "sundew") {
        for (let j = 0; j < 8; j++)
          ball(
            Math.sin(j) * 0.14,
            0.5 + Math.cos(j) * 0.06,
            Math.cos(j) * 0.14,
            0.035,
            "#d98491",
            g,
          );
      }
    } else if (type === "cabbage") {
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
    } else if (type === "gerbera") {
      // Two offset rings of slender, slightly cupped petals around a dark disk.
      for (let layer = 0; layer < 2; layer++)
        for (let i = 0; i < 20; i++) {
          const a = ((i + layer * 0.5) * Math.PI) / 10;
          const radius = layer ? 0.18 : 0.23;
          const petal = ball(
            Math.cos(a) * radius,
            height + layer * 0.025,
            Math.sin(a) * radius,
            0.12,
            color,
            g,
          );
          petal.scale.set(1.3, 0.18, 0.36);
          petal.rotation.y = -a;
        }
      ball(0, height + 0.045, 0, 0.1, "#574031", g).scale.set(1, 0.4, 1);
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8;
        ball(
          Math.cos(a) * 0.11,
          height + 0.04,
          Math.sin(a) * 0.11,
          0.022,
          "#e7b340",
          g,
        );
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
    } else if (type === "kangaroo-paw") {
      for (let stem = 0; stem < 3; stem++) {
        const stalk = cyl(
          (stem - 1) * 0.09,
          0.42,
          0,
          0.018,
          0.8 + stem * 0.07,
          "#77994e",
          g,
        );
        stalk.rotation.z = (stem - 1) * 0.12;
        for (let bud = 0; bud < 4; bud++) {
          const paw = ball(
            (stem - 1) * 0.14 + bud * 0.035,
            0.78 + stem * 0.07 + bud * 0.045,
            0,
            0.055,
            ["#c95848", "#d88a3e", "#bd4561"][stem],
            g,
          );
          paw.scale.set(0.7, 1.8, 0.65);
          paw.rotation.z = -0.6;
          ball(
            paw.position.x + 0.025,
            paw.position.y + 0.065,
            0,
            0.025,
            "#b3bd70",
            g,
          );
        }
      }
    } else if (type === "orchid") {
      for (let bloom = 0; bloom < 3; bloom++) {
        const bx = (bloom - 1) * 0.11,
          by = 0.55 + bloom * 0.12;
        for (let petal = 0; petal < 5; petal++) {
          const angle = (petal * Math.PI * 2) / 5;
          const lobe = ball(
            bx + Math.cos(angle) * 0.075,
            by + Math.sin(angle) * 0.075,
            0,
            0.07,
            bloom % 2 ? "#eee0ed" : "#ba79bd",
            g,
          );
          lobe.scale.set(1, 1.25, 0.3);
          lobe.rotation.z = angle;
        }
        ball(bx, by - 0.035, 0.055, 0.04, "#c85c9f", g).scale.set(
          1.2,
          0.8,
          0.65,
        );
        ball(bx, by + 0.005, 0.065, 0.02, "#edc967", g);
      }
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
          height + (type === "sunflower" ? Math.sin(a) * radius : 0),
          type === "sunflower" ? 0 : Math.sin(a) * radius,
          radius * 0.8,
          color,
          g,
        );
        petal.scale.set(
          1,
          type === "sunflower" ? 1 : 0.35,
          type === "sunflower" ? 0.35 : 1,
        );
      }
      ball(
        0,
        height + 0.025,
        0,
        radius * 0.62,
        type === "sunflower" ? "#765636" : "#e4b75b",
        g,
      ).scale.set(
        1,
        type === "sunflower" ? 1 : 0.5,
        type === "sunflower" ? 0.4 : 1,
      );
    }
    return g;
  }
  for (const [x, z, types] of [
    [7.8, 20.8, ["daisy", "tulip", "lavender"]],
    [7.8, 24, ["gerbera", "gerbera", "gerbera"]],
    [17, 20, ["cabbage", "carrot", "tomato"]],
    [8.2, 6.2, ["orchid", "kangaroo-paw", "tulip"]],
    [17, 6, ["banana", "bird-of-paradise", "monstera"]],
    [-44, -35, ["lavender", "tulip", "fern"]],
    [7, 12, ["sunflower", "sunflower", "sunflower"]],
    [7, 15, ["kangaroo-paw", "lavender", "orchid"]],
    [17.5, 12, ["rosette", "aloe", "cactus"]],
    [17.5, 15, ["rosette", "cactus", "aloe"]],
    [7, -2, ["flytrap", "pitcher", "sundew"]],
    [7, 1, ["pitcher", "flytrap", "sundew"]],
    [17.5, -2, ["bird-of-paradise", "orchid", "monstera"]],
    [17.5, 1, ["monstera", "banana", "bird-of-paradise"]],
    [-40, -35, ["cabbage", "carrot", "tomato"]],
    [-40, -39, ["tomato", "carrot", "cabbage"]],
    [-44, -39, ["sunflower", "sunflower", "sunflower"]],
    [-36, -35, ["fern", "daisy", "lavender"]],
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
            ? Math.cos(col * 2 + row + neighborGardens.length * 0.17) * 0.8
            : -0.9 +
                col * 0.45 +
                Math.sin(col * 2.3 + row + neighborGardens.length) * 0.07,
          types[0] === "banana"
            ? Math.sin(col * 2 + row + neighborGardens.length * 0.17) * 0.5
            : -0.45 +
                row * 0.9 +
                Math.cos(col + row * 3 + neighborGardens.length) * 0.065,
          types[(col + row) % 3],
          types[0] === "gerbera"
            ? ["#e84c35", "#f49234", "#f2d044"][(col + row) % 3]
            : types[0] === "sunflower"
              ? ["#efce59", "#e8af48", "#f2db87"][(col + row) % 3]
              : ["#eee8d4", "#d68ca7", "#a493bd", "#e9c766"][(col + row) % 4],
          garden,
        ).scale.setScalar(
          0.82 +
            ((col * 3 + row * 7 + neighborGardens.length * 5) % 11) * 0.028,
        );
    garden.userData.layoutSeed = neighborGardens.length;
  }
  const wildflowers = new T.Group();
  scene.add(wildflowers);
  wildflowers.name = "wildflowers";
  for (let i = 0; i < 65; i++) {
    const x = Math.sin(i * 11.2) * 29,
      z = Math.cos(i * 3.7) * 35;
    if (
      Math.abs(x - 3) < 4 ||
      (x < -8 && x > -23 && z > -3 && z < 25) ||
      (x > 1 && x < 15 && z < -22) ||
      !clearScenery(x, z, 0.25)
    )
      continue;
    const group = new T.Group();
    group.position.set(x, 0, z);
    wildflowers.add(group);
    const variety = i % 3,
      h = 0.3 + (i % 4) * 0.055;
    cyl(0, h / 2, 0, 0.012, h, "#507449", group);
    for (const side of [-1, 1]) {
      const leaf = ball(side * 0.07, h * 0.4, 0, 0.07, "#638f58", group);
      leaf.scale.set(1.6, 0.14, 0.5);
      leaf.rotation.z = side * 0.35;
    }
    if (variety === 2) {
      for (let bloom = 0; bloom < 3; bloom++) {
        const bell = new T.Mesh(
          new T.ConeGeometry(0.055, 0.11, 6, 1, true),
          new T.MeshStandardMaterial({ color: "#8f8ccc", side: T.DoubleSide }),
        );
        bell.position.set(0.04 * bloom, h - 0.055 * bloom, 0);
        bell.rotation.z = Math.PI - 0.35;
        group.add(bell);
      }
    } else {
      const shape = new T.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(-0.065, 0.06, -0.035, 0.13);
      shape.quadraticCurveTo(0, 0.17, 0.035, 0.13);
      shape.quadraticCurveTo(0.065, 0.06, 0, 0);
      for (let petal = 0; petal < (variety ? 5 : 8); petal++) {
        const pivot = new T.Group();
        pivot.position.y = h;
        pivot.rotation.x = -Math.PI / 2;
        pivot.rotation.z = (petal * Math.PI * 2) / (variety ? 5 : 8);
        const mesh = new T.Mesh(
          new T.ShapeGeometry(shape, 5),
          new T.MeshStandardMaterial({
            color: variety ? "#f0c34d" : i % 2 ? "#f3edcf" : "#df9eae",
            side: T.DoubleSide,
          }),
        );
        mesh.rotation.x = variety ? 0.35 : 0.1;
        pivot.add(mesh);
        group.add(pivot);
      }
      cyl(0, h + 0.015, 0, 0.045, 0.028, "#be863d", group);
    }
  }
  // Merge static garden meshes by surface to keep rich planting inexpensive.
  for (const garden of [...neighborGardens, wildflowers]) {
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
  const wildlife = createWildlife(
    scene,
    scenery.filter((o) => o.kind === "tree"),
    neighborGardens,
    outdoorBirdhouses,
  );
  const level3PathBushes: T.Mesh[] = [];
  for (let i = 0; i < 12; i++) {
    const bush = ball(-45 + i * 9, 2, -91, 7, "#93ae82");
    bush.scale.set(1, 1.3, 1);
    if (i >= 9) {
      bush.name = "level3-path-backdrop-bush";
      level3PathBushes.push(bush);
    }
    ball(-45 + i * 9, 2, 45, 7, "#93ae82").scale.set(1, 1.3, 1);
  }
  for (let i = 0; i < 9; i++) {
    const g = new T.Group();
    g.position.set(-45 + i * 12, 19 + (i % 3) * 2, -25 + (i % 4) * 13);
    scene.add(g);
    for (let j = 0; j < 3; j++)
      ball(j * 1.6, 0, 0, 1.8, "#f6eedc", g).scale.set(1, 0.65, 0.8);
  }
  // River outlets interrupt both the visible hedge and its collision.
  const hedgeRects = [
    { x: 91, z: -41, w: 82, d: 1, clearHeight: 2.3 },
    { x: 131, z: -19, w: 1, d: 44, clearHeight: 2.3 },
    { x: 91, z: 3, w: 82, d: 1, clearHeight: 2.3 },
    { x: -130, z: -12.5, w: 1, d: 103, clearHeight: 2.3 },
    { x: -84.5, z: -64.5, w: 91, d: 1, clearHeight: 2.3 },
    { x: -39, z: -52, w: 1, d: 24, clearHeight: 2.3 },
    { x: 39, z: 0, w: 1, d: 90, clearHeight: 2.3 },
    { x: -3.25, z: -40, w: 70.5, d: 1, clearHeight: 2.3 },
    { x: 37.75, z: -40, w: 1.5, d: 1, clearHeight: 2.3 },
    { x: -45.5, z: 39, w: 168, d: 1, clearHeight: 2.3 },
  ].flatMap(splitRiverBoundary);
  rects.push(...hedgeRects);
  const boundaryHedges = hedgeRects.map((r) => {
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
  const millionaire = createMillionaireWorld(
    scene,
    rects,
    occluders,
    targets,
    speakers,
  );
  function setMillionaireOpen(open: boolean) {
    sigma.setMillionaireOpen(open);
    for (const bush of level3PathBushes) bush.visible = !open;
  }
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
  function moneyTree(
    index: number,
    stage: string,
    fertilized: boolean,
    crop?: Crop,
  ) {
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
    if (!g.userData.mountain && (stage === "growing" || stage === "ready")) {
      const wetSoil = new T.Mesh(
        new T.RingGeometry(0.08, 0.65, 32),
        new T.MeshStandardMaterial({ color: "#493021", roughness: 0.93 }),
      );
      wetSoil.name = "watered-soil-ring";
      wetSoil.rotation.x = -Math.PI / 2;
      wetSoil.position.y = 0.012;
      wetSoil.receiveShadow = true;
      g.add(wetSoil);
    }
    if (stage === "empty") return;
    if (crop) {
      if (stage !== "harvested") g.add(makeCrop(crop, stage === "ready"));
      return;
    }
    if (stage === "planted" || stage === "growing") {
      cyl(0, 0.18, 0, 0.025, 0.3, "#444535", g);
      for (const side of [-1, 1]) {
        const leaf = ball(side * 0.1, 0.26, 0, 0.1, "#94ba77", g);
        leaf.scale.set(1.4, 0.25, 0.65);
        leaf.rotation.z = side * 0.3;
      }
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
  for (const packet of [forestSeeds, gardenSeeds]) {
    scene.add(packet);
    packet.add(makeSeedPacket());
  }
  gardenSeeds.position.set(7.8, 0.13, 20.8);
  tvSeeds.position.set(-9.55, 1.25, 9);
  target("garden-seeds", 7.8, 20.8, "Look in the flowerbed");

  storeSeeds.position.set(12, 0.92, -32);
  box(12, 0.45, -32, 0.9, 0.9, 0.65, "#b2946d");
  for (const x of [11.75, 12.05]) cyl(x, 1.12, -31.8, 0.1, 0.38, "#a7b5a0");
  target("forest-seeds", 29, -35, "Search the seed packet");

  for (const object of scene.children.slice()) {
    if (
      !(object instanceof T.Mesh) ||
      !object.userData.boxDimensions ||
      object.userData.windowsFitted
    )
      continue;
    const { w, h, d } = object.userData.boxDimensions;
    if (
      h < 2.8 ||
      Math.min(w, d) > 0.3 ||
      Math.max(w, d) < 3 ||
      !object.userData.cameraWall
    )
      continue;
    // Bedroom/living-room partitions remain solid; exterior walls have real openings.
    if (
      object.position.x === -9 ||
      (object.position.z === 6 && object.position.x < -9)
    )
      continue;
    if (
      doorways.some(
        (door) =>
          Math.abs(object.position.x - door.x) < 0.3 &&
          Math.abs(object.position.z - door.z) < 0.3,
      )
    )
      continue;
    fitWindow(object, w > d, Math.max(w, d), h, Math.min(w, d));
  }
  const bikeShopMural = paintBikeShopFacade(
    bikeShopFront,
    new T.TextureLoader().load(
      new URL("./assets/pretty-good-bikes.webp", import.meta.url).href,
    ),
  );
  const bikeShopSign = bikeShopMural[0];
  const market = createMarketShops(scene, rects, targets);
  const life = createTownLife(scene, rects, targets, speakers, player, mom);
  const farm = createFarm(scene, rects, targets);
  addShopGardens(scene);
  const river = createRiverWorld(
    scene,
    rects,
    [...paths, ...sigma.paths, ...groveApproachPaths],
    [
      { x: -15, z: 6, w: 12, d: 16 },
      { x: -5, z: 10, w: 8, d: 8 },
      { x: 12, z: 15, w: 7, d: 6 },
      { x: 12, z: 1, w: 7, d: 6 },
      { x: -39, z: -25, w: 7, d: 6 },
      { x: 6, z: -30, w: 20, d: 18 },
      { x: 24, z: -29, w: 12, d: 14 },
      { x: -69, z: -15, w: 8, d: 7 },
      { x: 32, z: -79, w: 8, d: 6 },
      {
        x: (bikeShopBounds.left + bikeShopBounds.right) / 2,
        z: (bikeShopBounds.north + bikeShopBounds.south) / 2,
        w: bikeShopBounds.right - bikeShopBounds.left,
        d: bikeShopBounds.south - bikeShopBounds.north,
      },
      ...sigma.houseBounds,
      ...marketShops,
    ],
  );
  return {
    river,
    market,
    farm,
    life,
    cookingProps: [
      cooking,
      bacon,
      birdhouses,
      painting,
      book,
      ...activityProps.values(),
    ],
    houseBirds,
    updateHouseBirds,
    robertsonsRoof,
    bikeShopRoof,
    bikeShopSign,
    bikeShopMural,
    bikeDisplays,
    bikeRack,
    wildlife,
    diggingTool,
    fertilizerBox,
    fertilizerGrains,
    fertilizerMarkers,
    setFertilizerMarkers,
    setFertilizing,
    wateringTool,
    waterDrops,
    setWatering,
    updateCartoon,
    tvScreen,
    homeDecor,
    setDigging,
    updateNotebook,
    notebookPages: page,
    sigma,
    millionaire,
    setSigmaUnlocked,
    setMillionaireOpen,
    level3PathBushes,
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
    get momUpdates() {
      return momUpdates;
    },
    momCollider,
    bea,
    beaCollider,
    beaRoom,
    setBeaInside,
    updateTea,
    rackHats,
    setRackHats,
    rects,
    occluders,
    targets,
    plots,
    bills,
    moneyTree,
    gardenBedDisplay,
  };
}
