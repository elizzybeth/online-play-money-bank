import * as T from "three";
export const inBeaHouse = (p: { x: number; z: number }) =>
  p.x > 8.5 && p.x < 15.5 && p.z > 12 && p.z < 18;
export function makeBeaRoom(scene: T.Scene) {
  const room = new T.Group();
  room.name = "bea-tea-room";
  scene.add(room);
  const material = (c: string, metalness = 0) =>
    new T.MeshStandardMaterial({
      color: c,
      roughness: metalness ? 0.3 : 0.8,
      metalness,
    });
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    c: string,
  ) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), material(c));
    m.position.set(x, y, z);
    room.add(m);
    return m;
  }
  function cylinder(
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    c: string,
  ) {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 24), material(c));
    m.position.set(x, y, z);
    room.add(m);
    return m;
  }
  box(12, 0.025, 15, 6.8, 0.05, 5.8, "#765a48");
  box(12, 0.07, 15.6, 4.5, 0.025, 3.5, "#92727c");
  for (let i = 0; i < 5; i++)
    box(12, 0.087, 14.2 + i * 0.7, 4.4, 0.008, 0.04, "#d4b5a1");
  cylinder(12, 0.65, 15.2, 0.16, 1.2, "#714f3e");
  cylinder(12, 1.25, 15.2, 1.2, 0.12, "#84614c");
  const clothCanvas = document.createElement("canvas");
  clothCanvas.width = clothCanvas.height = 256;
  const ctx = clothCanvas.getContext("2d")!;
  ctx.fillStyle = "#eee7d4";
  ctx.beginPath();
  ctx.arc(128, 128, 112, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  for (let r = 48; r <= 106; r += 19)
    for (let i = 0; i < r / 2; i++) {
      const a = (i * Math.PI * 4) / r;
      ctx.beginPath();
      ctx.ellipse(
        128 + Math.cos(a) * r,
        128 + Math.sin(a) * r,
        3,
        7,
        a,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "#c8bb9f";
  ctx.lineWidth = 2;
  for (const r of [34, 60, 80, 98, 112]) {
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const cloth = new T.Mesh(
    new T.PlaneGeometry(2.2, 2.2),
    new T.MeshStandardMaterial({
      map: new T.CanvasTexture(clothCanvas),
      transparent: true,
      side: T.DoubleSide,
      roughness: 1,
    }),
  );
  cloth.name = "lace-doily";
  cloth.rotation.x = -Math.PI / 2;
  cloth.position.set(12, 1.318, 15.2);
  room.add(cloth);
  function porcelain(x: number, z: number, size = 1) {
    const g = new T.Group();
    g.name = "floral-teacup";
    g.position.set(x, 1.34, z);
    g.scale.setScalar(size);
    room.add(g);
    const cup = new T.Mesh(
      new T.LatheGeometry(
        [
          new T.Vector2(0.08, 0),
          new T.Vector2(0.1, 0.04),
          new T.Vector2(0.14, 0.18),
          new T.Vector2(0.15, 0.2),
          new T.Vector2(0.14, 0.2),
          new T.Vector2(0.12, 0.06),
        ],
        20,
      ),
      material("#f1e9d6"),
    );
    g.add(cup);
    const saucer = new T.Mesh(
      new T.CylinderGeometry(0.23, 0.2, 0.025, 24),
      material("#eddfca"),
    );
    saucer.position.y = -0.01;
    g.add(saucer);
    const tea = new T.Mesh(new T.CircleGeometry(0.13, 20), material("#8c4c24"));
    tea.rotation.x = -Math.PI / 2;
    tea.position.y = 0.18;
    g.add(tea);
    const handle = new T.Mesh(
      new T.TorusGeometry(0.075, 0.018, 6, 12),
      material("#ecd7a7"),
    );
    handle.position.set(0.175, 0.11, 0);
    g.add(handle);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const petal = new T.Mesh(
        new T.SphereGeometry(0.021, 6, 4),
        material("#bd7281"),
      );
      petal.position.set(
        Math.sin(a) * 0.027,
        0.105 + Math.cos(a) * 0.025,
        0.142,
      );
      g.add(petal);
    }
  }
  porcelain(11.4, 15.45);
  porcelain(12.6, 15.45);
  porcelain(12, 14.55);
  const pot = new T.Mesh(
    new T.SphereGeometry(0.28, 16, 12),
    material("#efdfc7"),
  );
  pot.position.set(12, 1.58, 15.2);
  room.add(pot);
  cylinder(12, 1.82, 15.2, 0.21, 0.055, "#eddfc7");
  cylinder(12, 1.88, 15.2, 0.055, 0.07, "#bba36b");
  const spout = new T.Mesh(
    new T.ConeGeometry(0.075, 0.4, 12),
    material("#efdfc7"),
  );
  spout.position.set(12.33, 1.65, 15.2);
  spout.rotation.z = -0.8;
  room.add(spout);
  const handle = new T.Mesh(
    new T.TorusGeometry(0.2, 0.035, 8, 20),
    material("#efdfc7"),
  );
  handle.position.set(11.71, 1.6, 15.2);
  room.add(handle);
  for (const [x, z, rotation] of [
    [10.25, 15.2, -Math.PI / 2],
    [12, 13.6, Math.PI],
    [12, 16.9, 0],
  ]) {
    const chair = new T.Group();
    chair.name = "bea-dining-chair";
    chair.position.set(x, 0, z);
    chair.rotation.y = rotation;
    room.add(chair);
    const add = (
      y: number,
      zz: number,
      w: number,
      h: number,
      d: number,
      c: string,
    ) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), material(c));
      m.position.set(0, y, zz);
      chair.add(m);
    };
    add(0.5, 0, 0.65, 0.12, 0.65, "#795441");
    add(0.58, 0, 0.6, 0.08, 0.6, "#b79094");
    add(1.02, 0.28, 0.65, 0.8, 0.1, "#795441");
    for (const side of [-1, 1])
      for (const end of [-1, 1]) {
        const m = new T.Mesh(
          new T.BoxGeometry(0.07, 0.5, 0.07),
          material("#795441"),
        );
        m.position.set(side * 0.25, 0.25, end * 0.25);
        chair.add(m);
      }
  }
  box(14.9, 1, 13.2, 0.65, 2, 1.8, "#785846");
  for (const y of [0.65, 1.2, 1.7]) {
    box(14.55, y, 13.2, 0.8, 0.04, 1.8, "#a78660");
    for (const z of [12.7, 13.2, 13.7]) {
      const plate = new T.Mesh(
        new T.TorusGeometry(0.19, 0.025, 8, 20),
        material("#e7dbbe"),
      );
      plate.position.set(14.5, y + 0.23, z);
      plate.rotation.y = Math.PI / 2;
      room.add(plate);
    }
  }
  // Antique clock, framed flowers and warm lamps complete Bea's sitting room.
  cylinder(9.1, 1.1, 12.7, 0.16, 0.04, "#ad9867");
  box(9.1, 0.65, 12.7, 0.7, 0.1, 0.6, "#75513e");
  const shade = new T.Mesh(
    new T.ConeGeometry(0.3, 0.35, 16, 1, true),
    material("#e4caa8"),
  );
  shade.position.set(9.1, 1.35, 12.7);
  room.add(shade);
  box(11, 1.9, 12.16, 0.9, 1.1, 0.06, "#a58b59");
  box(11, 1.9, 12.21, 0.75, 0.95, 0.03, "#e2d6bb");
  return {
    room,
    tableRect: { x: 12, z: 15.2, w: 2.2, d: 2.2, clearHeight: 1.4 },
  };
}
