import * as T from "three";
import { bikes, type BikeId } from "./bikes";
import { makeBike } from "./bike-models";
export const homeBikeRack = { x: -4.7, z: 16.1, targetX: -4.7, targetZ: 18.4 };
export function makeBikeRack() {
  const object = new T.Group();
  object.name = "owned-bike-rack";
  const wood = new T.MeshStandardMaterial({ color: "#a87c51", roughness: 0.8 });
  const metal = new T.MeshStandardMaterial({
    color: "#377d83",
    metalness: 0.45,
    roughness: 0.4,
  });
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), wood);
    m.position.set(x, y, z);
    object.add(m);
  };
  box(0, 0.075, 0, 7, 0.15, 3.2);
  for (const x of [-3.35, 3.35]) box(x, 0.7, -1.15, 0.16, 1.4, 0.16);
  box(0, 1.35, -1.15, 6.8, 0.13, 0.15);
  const displays = bikes.map((b, i) => {
    const x = (i - 3) * 0.96;
    const hoop = new T.Mesh(
      new T.TorusGeometry(0.21, 0.025, 6, 20, Math.PI),
      metal,
    );
    hoop.position.set(x, 0.08, -0.85);
    object.add(hoop);
    const model = makeBike(b.id);
    model.position.set(x, 0.15, 0);
    model.visible = false;
    object.add(model);
    return model;
  });
  return {
    object,
    displays,
    sync(owned: readonly BikeId[], away?: BikeId) {
      for (const model of displays)
        model.visible =
          owned.includes(model.userData.bikeId) &&
          model.userData.bikeId !== away;
    },
  };
}

export function makeBikeRackSign() {
  const root = new T.Group();
  root.name = "bike-rack-sign";
  root.position.set(3.1, 0, -1.15);
  const white = new T.MeshStandardMaterial({
    color: "#fff9df",
    roughness: 0.6,
  });
  const post = new T.Mesh(new T.BoxGeometry(0.14, 1.9, 0.14), white);
  post.name = "bike-rack-sign-post";
  post.position.y = 0.95;
  root.add(post);
  const frame = new T.Mesh(new T.BoxGeometry(1.25, 1.8, 0.1), white);
  frame.name = "bike-rack-sign-frame";
  frame.position.y = 2.8;
  root.add(frame);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 960;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#343a3c";
  c.fillRect(0, 0, 640, 960);
  c.strokeStyle = "#fff9df";
  c.lineWidth = 16;
  c.strokeRect(14, 14, 612, 932);
  c.fillStyle = "#fff9df";
  c.textAlign = "center";
  c.font = "600 168px BarlowCondensed, sans-serif";
  c.fillText("BIKE", 320, 225, 520);
  c.fillText("RACK", 320, 420, 520);
  c.lineWidth = 14;
  c.lineCap = "round";
  c.lineJoin = "round";
  for (const x of [157, 483]) {
    c.beginPath();
    c.arc(x, 730, 110, 0, Math.PI * 2);
    c.stroke();
  }
  const line = (points: number[][]) => {
    c.beginPath();
    c.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) c.lineTo(x, y);
    c.stroke();
  };
  line([
    [157, 730],
    [247, 566],
    [320, 730],
    [157, 730],
    [417, 566],
    [483, 730],
  ]);
  line([
    [247, 566],
    [417, 566],
    [433, 524],
    [473, 524],
  ]);
  line([
    [247, 566],
    [233, 524],
    [200, 524],
    [263, 524],
  ]);
  line([
    [320, 730],
    [334, 766],
    [361, 766],
  ]);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const faceGeometry = new T.PlaneGeometry(1.18, 1.73);
  const faceMaterial = new T.MeshBasicMaterial({ map: texture });
  // Separate outward-facing prints keep both sides upright and opaque.
  for (const side of [-1, 1]) {
    const face = new T.Mesh(faceGeometry, faceMaterial);
    face.name = `bike-rack-sign-face-${side}`;
    face.position.set(0, 2.8, side * 0.056);
    face.rotation.y = side === 1 ? 0 : Math.PI;
    root.add(face);
  }
  return root;
}
