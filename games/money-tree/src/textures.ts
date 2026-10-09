import * as T from "three";
export type Surface =
  | "grass"
  | "path"
  | "bark"
  | "leaf"
  | "hair"
  | "cloth"
  | "plaster"
  | "shingles"
  | "wood";
const cache = new Map<string, T.CanvasTexture>();
export function surfaceTexture(kind: Surface, rx = 1, ry = 1) {
  const key = `${kind}:${rx}:${ry}`;
  if (cache.has(key)) return cache.get(key)!;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#dddddd";
  c.fillRect(0, 0, 256, 256);
  let seed = 1789;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 2500; i++) {
    const v = 180 + Math.floor(random() * 65);
    c.fillStyle = `rgba(${v},${v},${v},.22)`;
    c.fillRect(
      random() * 256,
      random() * 256,
      1 + random() * 3,
      1 + random() * 3,
    );
  }
  c.lineCap = "round";
  if (kind === "grass" || kind === "leaf")
    for (let i = 0; i < 700; i++) {
      const x = random() * 256,
        y = random() * 256;
      c.strokeStyle = i % 3 ? "#c0c0c0" : "#eeeeee";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x - 2, y - 4, x + random() * 7 - 3, y - 7);
      c.stroke();
    }
  if (["bark", "wood", "hair"].includes(kind))
    for (let i = 0; i < 85; i++) {
      const x = i * 3 + random() * 2;
      c.strokeStyle = i % 4 ? "#c2c2c2" : "#f3f3f3";
      c.lineWidth = kind === "hair" ? 1 : 2;
      c.beginPath();
      c.moveTo(x, 0);
      for (let y = 0; y <= 256; y += 16)
        c.lineTo(x + Math.sin(y * 0.045 + i) * (kind === "wood" ? 5 : 2), y);
      c.stroke();
    }
  if (kind === "wood" || kind === "bark")
    for (let i = 0; i < 7; i++) {
      c.strokeStyle = "#adadad";
      c.lineWidth = 1.4;
      c.beginPath();
      c.ellipse(
        random() * 256,
        random() * 256,
        3 + random() * 5,
        9 + random() * 9,
        0,
        0,
        Math.PI * 2,
      );
      c.stroke();
    }
  if (kind === "cloth") {
    for (let i = 0; i < 256; i += 4) {
      c.strokeStyle = i % 8 ? "#ececec" : "#c7c7c7";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i, 256);
      c.moveTo(0, i);
      c.lineTo(256, i);
      c.stroke();
    }
    c.strokeStyle = "#bcbcbc";
    c.setLineDash([3, 4]);
    c.strokeRect(8, 8, 240, 240);
  }
  if (kind === "path")
    for (let row = 0; row < 4; row++)
      for (let col = -1; col < 4; col++) {
        const x = col * 86 + (row % 2) * 43,
          y = row * 64;
        c.fillStyle = ["#d8d8d8", "#ededed", "#cecece"][(row + col + 6) % 3];
        c.beginPath();
        c.roundRect(x + 2, y + 2, 82, 60, 8);
        c.fill();
        c.strokeStyle = "#b1b1b1";
        c.lineWidth = 2;
        c.stroke();
      }
  if (kind === "shingles")
    for (let row = 0; row < 8; row++)
      for (let col = -1; col < 8; col++) {
        const x = col * 40 + (row % 2) * 20,
          y = row * 32;
        c.fillStyle = row % 2 ? "#d2d2d2" : "#e4e4e4";
        c.fillRect(x + 1, y + 1, 38, 30);
        c.strokeStyle = "#ababab";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x, y + 31);
        c.lineTo(x + 40, y + 31);
        c.stroke();
      }
  if (kind === "plaster")
    for (let i = 0; i < 1800; i++) {
      c.fillStyle = i % 2 ? "#c9c9c9" : "#eeeeee";
      c.beginPath();
      c.arc(random() * 256, random() * 256, random() * 2, 0, 7);
      c.fill();
    }
  const t = new T.CanvasTexture(canvas);
  t.colorSpace = T.SRGBColorSpace;
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  cache.set(key, t);
  return t;
}
export function surfaceMaterial(color: string, kind: Surface, rx = 1, ry = 1) {
  return new T.MeshStandardMaterial({
    color,
    map: surfaceTexture(kind, rx, ry),
    roughness: kind === "hair" ? 0.76 : 0.94,
  });
}
