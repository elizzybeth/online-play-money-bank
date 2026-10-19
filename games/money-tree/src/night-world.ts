import * as T from "three";
import type { NightCombat, Enemy } from "./night";
import { terrainHeight } from "./millionaire-land";
/** Shared geometry/material pools keep combat allocations and GPU work bounded. */
export function createNightWorld(scene: T.Scene) {
  const root = new T.Group();
  root.name = "night-monsters-and-bills";
  scene.add(root);
  const body = new T.MeshBasicMaterial({
    color: "#64ffd0",
    transparent: true,
    opacity: 0.66,
    forceSinglePass: true,
    depthWrite: false,
    side: T.DoubleSide,
    fog: false,
  });
  const bright = new T.MeshBasicMaterial({
    color: "#c3ffeb",
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    fog: false,
  });
  const dark = new T.MeshBasicMaterial({
    color: "#126d61",
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    fog: false,
  });
  const glow = new T.MeshBasicMaterial({
    color: "#63ffce",
    transparent: true,
    opacity: 0.1,
    blending: T.AdditiveBlending,
    depthWrite: false,
    side: T.BackSide,
    fog: false,
  });
  const box = new T.BoxGeometry(1, 1, 1),
    sphere = new T.SphereGeometry(1, 12, 8),
    cone = new T.ConeGeometry(1, 1, 8),
    plane = new T.PlaneGeometry(1, 1);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
  gradient.addColorStop(0, "#a3ffe995");
  gradient.addColorStop(0.35, "#6dffcb42");
  gradient.addColorStop(1, "#64ffd000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const haloTexture = new T.CanvasTexture(canvas);
  const haloMaterial = new T.SpriteMaterial({
    map: haloTexture,
    color: "#92ffe0",
    transparent: true,
    blending: T.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  const ink = document.createElement("canvas");
  ink.width = 256;
  ink.height = 128;
  const pen = ink.getContext("2d")!;
  pen.fillStyle = "#a4dd8a";
  pen.fillRect(0, 0, 256, 128);
  pen.strokeStyle = "#285c35";
  pen.lineWidth = 9;
  pen.strokeRect(9, 9, 238, 110);
  pen.fillStyle = "#285c35";
  pen.font = "bold 86px Georgia";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillText("$1", 128, 68);
  const moneyTexture = new T.CanvasTexture(ink);
  moneyTexture.colorSpace = T.SRGBColorSpace;
  const moneyMaterial = new T.MeshBasicMaterial({
    map: moneyTexture,
    side: T.DoubleSide,
  });
  function mesh(
    parent: T.Object3D,
    geo: T.BufferGeometry,
    mat: T.Material,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    shell = false,
  ) {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    if (shell) {
      const outline = new T.Mesh(geo, glow);
      outline.scale.setScalar(1.14);
      m.add(outline);
    }
    return m;
  }
  function halo(parent: T.Object3D, y: number, size: number) {
    const h = new T.Sprite(haloMaterial);
    h.position.y = y;
    h.scale.set(size, size, 1);
    parent.add(h);
  }
  const wingGeometry = new Map(
    [-1, 1].map((side) => {
      const shape = new T.Shape();
      shape.moveTo(0, 0.15);
      shape.lineTo(side * 0.8, 0.5);
      shape.quadraticCurveTo(side * 0.65, 0.05, side * 0.85, -0.3);
      shape.quadraticCurveTo(side * 0.45, 0.03, side * 0.26, -0.3);
      shape.lineTo(0, -0.2);
      shape.closePath();
      return [side, new T.ShapeGeometry(shape)] as const;
    }),
  );
  function wallet() {
    const g = new T.Group();
    g.name = "glowing-empty-wallet";
    mesh(g, box, body, 0, 0, 0, 0.72, 0.5, 0.22, true);
    mesh(g, box, dark, 0, 0.08, -0.12, 0.56, 0.18, 0.025);
    mesh(g, box, bright, 0, -0.16, -0.13, 0.64, 0.018, 0.018);
    for (const side of [-1, 1]) {
      const wing = new T.Group();
      wing.name = `wallet-wing-${side}`;
      wing.position.x = side * 0.32;
      g.add(wing);
      mesh(wing, wingGeometry.get(side)!, body, 0, 0, 0, 1, 1, 1, true);
      mesh(g, sphere, bright, side * 0.18, 0.18, -0.15, 0.065, 0.065, 0.04);
    }
    g.userData.wings = [
      g.getObjectByName("wallet-wing--1"),
      g.getObjectByName("wallet-wing-1"),
    ];
    halo(g, 0, 2.6);
    return g;
  }
  function cow() {
    const g = new T.Group();
    g.name = "glowing-cash-cow";
    mesh(g, sphere, body, 0, 0.95, 0, 0.9, 0.6, 1.3, true);
    mesh(g, box, body, 0, 1.35, -1.1, 0.75, 0.7, 0.75, true);
    mesh(g, sphere, bright, 0, 1.1, -1.53, 0.39, 0.22, 0.18);
    for (const side of [-1, 1]) {
      mesh(
        g,
        cone,
        bright,
        side * 0.29,
        1.88,
        -1.08,
        0.11,
        0.5,
        0.11,
      ).rotation.z = -side * 0.3;
      mesh(g, sphere, body, side * 0.48, 1.6, -1.12, 0.29, 0.12, 0.17, true);
      mesh(g, sphere, bright, side * 0.39, 1.5, -1.38, 0.08, 0.09, 0.06);
      for (const end of [-1, 1])
        mesh(
          g,
          box,
          body,
          side * 0.57,
          0.36,
          end * 0.79,
          0.23,
          0.72,
          0.24,
          true,
        );
      const spot = mesh(
        g,
        plane,
        moneyMaterial,
        side * 0.88,
        1,
        0,
        0.8,
        0.42,
        1,
      );
      spot.rotation.y = (side * Math.PI) / 2;
    }
    mesh(g, cone, body, 0, 0.9, 1.49, 0.13, 0.7, 0.13).rotation.x = Math.PI / 2;
    halo(g, 1, 4.8);
    return g;
  }
  // Models are allocated once and reused across waves and nights.
  const wallets = Array.from({ length: 8 }, wallet),
    cows = Array.from({ length: 8 }, cow);
  const bullets = Array.from({ length: 16 }, () => {
    const m = new T.Mesh(plane, moneyMaterial);
    m.name = "dollar-bill-shuriken";
    m.scale.set(0.65, 0.32, 1);
    return m;
  });
  const drops = Array.from({ length: 16 }, () => {
    const g = new T.Group();
    g.name = "monster-dollar-drop";
    mesh(g, plane, moneyMaterial, 0, 0.2, 0, 0.85, 0.45, 1);
    halo(g, 0.3, 1.2);
    return g;
  });
  const pooledObjects = [...wallets, ...cows, ...bullets, ...drops];
  for (const object of pooledObjects) {
    object.visible = false;
    root.add(object);
  }
  function pose(object: T.Object3D, e: Enemy) {
    object.visible = true;
    object.position.set(
      e.x,
      terrainHeight(e.x, e.z) +
        (e.kind === "wallet" ? 1.25 + Math.sin(e.age * 5) * 0.16 : 0),
      e.z,
    );
    object.rotation.y = Math.atan2(-e.dx, -e.dz);
    object.scale.setScalar(
      e.kind === "cow" && e.phase === "windup"
        ? 1 + Math.sin(e.age * 25) * 0.025
        : 1,
    );
  }
  return {
    root,
    update(combat: NightCombat, night: boolean, reduced: boolean) {
      root.visible = night;
      if (!night) return;
      for (const object of pooledObjects) object.visible = false;
      let wi = 0,
        ci = 0;
      for (const enemy of combat.enemies) {
        const model = enemy.kind === "wallet" ? wallets[wi++] : cows[ci++];
        pose(model, enemy);
        if (enemy.kind === "wallet")
          for (let i = 0; i < 2; i++) {
            const side = i === 0 ? -1 : 1;
            model.userData.wings[i].rotation.y = reduced
              ? side * 0.2
              : Math.sin(enemy.age * 12) * side * 0.7;
          }
      }
      combat.bills.forEach((b, i) => {
        const m = bullets[i];
        m.visible = true;
        m.position.set(b.x, terrainHeight(b.x, b.z) + 1.1, b.z);
        m.rotation.set(
          -0.35,
          Math.atan2(-b.dx, -b.dz),
          reduced ? 0 : b.age * 22,
        );
      });
      combat.loot.forEach((d, i) => {
        const m = drops[i];
        m.visible = true;
        m.position.set(d.x, terrainHeight(d.x, d.z) + 0.3, d.z);
        m.lookAt(m.position.x, 2, m.position.z + 5);
      });
    },
  };
}
