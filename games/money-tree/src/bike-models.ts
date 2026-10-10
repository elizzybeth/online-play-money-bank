import * as T from "three";
import { bikeById, type BikeId } from "./bikes";
const up = new T.Vector3(0, 1, 0);
const weavePixels = new Uint8Array(16 * 16 * 4);
for (let y = 0; y < 16; y++)
  for (let x = 0; x < 16; x++) {
    const i = (y * 16 + x) * 4;
    const stripe = ((Math.floor(x / 4) + Math.floor(y / 4)) % 2 ? x : y) % 4;
    weavePixels.set(
      [90 + stripe * 30, 95 + stripe * 30, 100 + stripe * 30, 255],
      i,
    );
  }
const carbonWeave = new T.DataTexture(weavePixels, 16, 16);
carbonWeave.colorSpace = T.SRGBColorSpace;
carbonWeave.wrapS = carbonWeave.wrapT = T.RepeatWrapping;
carbonWeave.repeat.set(4, 4);
carbonWeave.needsUpdate = true;
function tube(
  g: T.Object3D,
  a: number[],
  b: number[],
  radius: number,
  color: string,
) {
  const start = new T.Vector3(...a),
    end = new T.Vector3(...b),
    delta = end.clone().sub(start);
  const m = new T.Mesh(
    new T.CylinderGeometry(radius, radius, delta.length(), 8),
    new T.MeshStandardMaterial({ color, roughness: 0.55 }),
  );
  m.position.copy(start.add(end).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(up, delta.normalize());
  g.add(m);
  return m;
}
function block(g: T.Object3D, p: number[], size: number[], color: string) {
  const m = new T.Mesh(
    new T.BoxGeometry(...size),
    new T.MeshStandardMaterial({ color, roughness: 0.7 }),
  );
  m.position.set(p[0], p[1], p[2]);
  g.add(m);
  return m;
}
function wheel(
  g: T.Object3D,
  z: number,
  r: number,
  tire: string,
  width = 0.055,
  y = r,
) {
  const w = new T.Group();
  w.position.set(0, y, z);
  w.name = "wheel";
  g.add(w);
  const torus = (radius: number, thickness: number, color: string) => {
    const m = new T.Mesh(
      new T.TorusGeometry(radius, thickness, 6, 32),
      new T.MeshStandardMaterial({ color, roughness: 0.75 }),
    );
    m.rotation.y = Math.PI / 2;
    w.add(m);
  };
  torus(r, width, tire);
  torus(r - 0.065, 0.022, "#b9bcc0");
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    tube(
      w,
      [0, 0, 0],
      [0, Math.sin(a) * (r - 0.07), Math.cos(a) * (r - 0.07)],
      0.009,
      "#c1c4bd",
    );
  }
  tube(w, [-0.1, 0, 0], [0.1, 0, 0], 0.04, "#657075");
  return w;
}
export function makeBike(id: BikeId) {
  const bike = bikeById(id)!;
  const g = new T.Group();
  g.name = `bicycle-${id}`;
  g.userData.bikeId = id;
  const penny = id === "penny",
    small = id === "tassels" || id === "bmx",
    r = penny ? 0.79 : small ? 0.36 : 0.48;
  const frontZ = -0.85,
    backZ = penny ? 0.88 : 0.85,
    backR = penny ? 0.25 : r;
  wheel(
    g,
    frontZ,
    r,
    id === "cruiser" ? "#efe5cc" : "#343b3c",
    id === "mountain" ? 0.095 : id === "road" ? 0.03 : 0.055,
  );
  wheel(
    g,
    backZ,
    backR,
    id === "cruiser" ? "#efe5cc" : "#343b3c",
    id === "mountain" ? 0.095 : id === "road" ? 0.03 : 0.055,
  );
  const crank = [0, penny ? 1.02 : 0.47, 0],
    seat = [0, penny ? 1.72 : small ? 0.97 : 1.18, 0.38],
    neck = [0, penny ? 1.52 : 1.06, -0.65];
  if (penny) {
    tube(g, seat, neck, 0.055, bike.color);
    tube(g, [0, r, frontZ], neck, 0.035, "#9ea6a6");
    tube(g, seat, [0, backR, backZ], 0.045, bike.color);
  } else {
    for (const [a, b] of [
      [crank, seat],
      [seat, neck],
      [neck, crank],
      [seat, [0, r, backZ]],
      [crank, [0, r, backZ]],
    ])
      tube(g, a, b, id === "road" ? 0.045 : 0.035, bike.color);
    for (const x of [-0.075, 0.075])
      tube(
        g,
        [x, r, frontZ],
        [x, neck[1], neck[2]],
        id === "mountain" ? 0.055 : 0.025,
        id === "mountain" ? "#bcc5c6" : bike.color,
      );
    tube(g, seat, [0, seat[1] + 0.1, seat[2]], 0.025, "#b8b8b3");
  }
  block(g, [0, seat[1] + 0.11, seat[2]], [0.27, 0.08, 0.36], "#5a4745");
  const barY = neck[1] + 0.24;
  tube(g, neck, [0, barY, -0.68], 0.03, "#b9c2c1");
  tube(g, [-0.43, barY, -0.68], [0.43, barY, -0.68], 0.027, "#b9c2c1");
  for (const x of [-0.43, 0.43]) {
    const z = id === "cruiser" || id === "city" ? -0.45 : -0.68;
    tube(g, [x * 0.7, barY, -0.68], [x, barY, z], 0.027, "#b9c2c1");
    tube(
      g,
      [x, barY, z - 0.06],
      [x, barY, z + 0.12],
      0.047,
      id === "tassels" ? "#f28eac" : "#4b5053",
    );
    if (id === "road") {
      tube(g, [x, barY, -0.68], [x, barY - 0.2, -0.8], 0.03, "#565c5e");
      tube(g, [x, barY - 0.2, -0.8], [x, barY - 0.28, -0.55], 0.03, "#565c5e");
    }
    if (id === "tassels")
      for (let n = 0; n < 5; n++)
        tube(
          g,
          [x, barY, z + 0.1],
          [x + (n - 2) * 0.018, barY - 0.27 - (n % 2) * 0.06, z + 0.15],
          0.009,
          ["#f47eaa", "#ddc0e8", "#a4d6ed"][n % 3],
        );
  }
  tube(
    g,
    [-0.18, crank[1], crank[2]],
    [0.18, crank[1], crank[2]],
    0.025,
    "#666d6c",
  );
  for (const side of [-1, 1]) {
    tube(
      g,
      [side * 0.18, crank[1], 0],
      [side * 0.18, crank[1] + side * 0.13, 0],
      0.022,
      "#879494",
    );
    block(
      g,
      [side * 0.25, crank[1] + side * 0.13, 0],
      [0.18, 0.06, 0.14],
      "#424b4b",
    );
  }
  if (id === "tassels")
    for (const side of [-1, 1]) {
      tube(g, [0, r, backZ], [side * 0.32, 0.13, backZ], 0.025, "#c1c8c5");
      const w = new T.Mesh(
        new T.CylinderGeometry(0.13, 0.13, 0.06, 16),
        new T.MeshStandardMaterial({ color: "#f4e8da" }),
      );
      w.rotation.z = Math.PI / 2;
      w.position.set(side * 0.32, 0.13, backZ);
      g.add(w);
    }
  if (id === "bmx")
    for (const z of [frontZ, backZ])
      tube(g, [-0.25, r, z], [0.25, r, z], 0.035, "#4e5658");
  if (id === "mountain")
    for (let n = 0; n < 24; n++)
      for (const z of [frontZ, backZ]) {
        const a = (n * Math.PI) / 12;
        const knob = block(
          g,
          [0, r + Math.sin(a) * (r + 0.075), z + Math.cos(a) * (r + 0.075)],
          [0.14, 0.035, 0.06],
          "#363d3d",
        );
        knob.rotation.x = a;
      }
  if (id === "cruiser" || id === "city") {
    for (const z of [frontZ, backZ]) {
      const f = new T.Mesh(
        new T.TorusGeometry(r + 0.07, 0.04, 5, 24, Math.PI),
        new T.MeshStandardMaterial({
          color: id === "city" ? "#b5c0bd" : bike.color,
        }),
      );
      f.rotation.y = Math.PI / 2;
      f.rotation.z = 0;
      f.position.set(0, r, z);
      g.add(f);
    }
    if (id === "city") {
      block(g, [0, r + 0.58, backZ], [0.36, 0.04, 0.65], "#b2c1bf");
      for (const x of [-0.15, 0.15])
        tube(g, [x, r, backZ], [x, r + 0.58, backZ + 0.18], 0.016, "#bbc5c3");
    } else {
      block(g, [0, barY - 0.19, -1.04], [0.44, 0.3, 0.32], "#c6a276");
      for (let n = 0; n < 5; n++)
        block(
          g,
          [-0.2 + n * 0.1, barY - 0.19, -1.21],
          [0.014, 0.29, 0.016],
          "#8c7559",
        );
    }
  }
  g.traverse((o) => {
    if (o instanceof T.Mesh) {
      const material = o.material as T.MeshStandardMaterial;
      if (id === "road" && material.color.equals(new T.Color(bike.color)))
        material.map = carbonWeave;
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}
export function makeBikeCockpit() {
  const g = new T.Group();
  g.name = "bike-cockpit";
  const tassels = new T.Group();
  for (const side of [-1, 1])
    for (let i = 0; i < 5; i++)
      tube(
        tassels,
        [side * 0.67, -0.43, -1.05],
        [side * (0.67 + (i - 2) * 0.02), -0.7 - (i % 2) * 0.05, -0.96],
        0.008,
        ["#f47eaa", "#ddc0e8", "#a4d6ed"][i % 3],
      );
  g.add(tassels);
  tube(g, [-0.6, -0.43, -1.05], [0.6, -0.43, -1.05], 0.035, "#bdc4c3");
  tube(g, [0, -0.43, -1.05], [0, -0.9, -0.95], 0.055, "#738f85");
  for (const side of [-1, 1]) {
    tube(
      g,
      [side * 0.45, -0.43, -1.05],
      [side * 0.65, -0.43, -1.05],
      0.065,
      "#414b4b",
    );
    tube(
      g,
      [side * 0.9, -0.92, -0.35],
      [side * 0.57, -0.44, -1.03],
      0.095,
      "#d9aa66",
    );
    const palm = new T.Mesh(
      new T.SphereGeometry(0.105, 12, 8),
      new T.MeshStandardMaterial({ color: "#f5d4ab" }),
    );
    palm.position.set(side * 0.55, -0.43, -1.04);
    palm.scale.set(1, 0.75, 1.3);
    g.add(palm);
    tube(
      g,
      [side * 0.4, -0.48, -1.04],
      [side * 0.6, -0.53, -1.15],
      0.018,
      "#777f7c",
    );
  }
  const bell = new T.Mesh(
    new T.SphereGeometry(0.085, 12, 8),
    new T.MeshStandardMaterial({
      color: "#e6c26c",
      metalness: 0.6,
      roughness: 0.3,
    }),
  );
  bell.scale.y = 0.55;
  bell.position.set(-0.28, -0.37, -1.05);
  g.add(bell);
  block(g, [0, -0.38, -1.03], [0.25, 0.16, 0.04], "#394646");
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const screen = new T.Mesh(
    new T.PlaneGeometry(0.225, 0.13),
    new T.MeshBasicMaterial({ map: texture }),
  );
  screen.position.set(0, -0.38, -1.005);
  g.add(screen);
  let value = -1;
  function update(speed: number, id: BikeId) {
    const n = Math.round(speed * 3.6);
    if (n === value && g.userData.bikeId === id) return;
    value = n;
    g.userData.bikeId = id;
    tassels.visible = id === "tassels";
    ctx.fillStyle = "#b7d6b9";
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = "#254438";
    ctx.font = "bold 64px monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(n), 128, 72);
    ctx.font = "22px sans-serif";
    ctx.fillText("km/h", 128, 108);
    texture.needsUpdate = true;
  }
  update(0, "tassels");
  g.visible = false;
  return { object: g, update };
}
