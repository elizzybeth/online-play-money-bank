import * as T from "three";
export function makeSeedPacket() {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 512;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#fff8dc";
  g.fillRect(0, 0, 384, 512);
  g.fillStyle = "#27794f";
  g.fillRect(0, 0, 384, 100);
  g.fillStyle = "#fff8dc";
  g.textAlign = "center";
  g.font = "42px Lobster";
  g.fillText("Robertson’s", 192, 48);
  g.font = "23px BarlowCondensed";
  g.fillText("MYSTERIOUS MONEY SEEDS", 192, 82);
  g.fillStyle = "#b7cf94";
  g.fillRect(16, 116, 352, 320);
  g.fillStyle = "#765a42";
  g.beginPath();
  g.ellipse(192, 408, 130, 20, 0, 0, 7);
  g.fill();
  g.strokeStyle = "#252b28";
  g.lineCap = "round";
  const branch = (
    x: number,
    y: number,
    dx: number,
    dy: number,
    width: number,
  ) => {
    g.lineWidth = width;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + dx, y + dy);
    g.stroke();
  };
  branch(192, 408, -8, -245, 16);
  for (let i = 0; i < 7; i++) {
    const y = 350 - i * 25,
      side = i % 2 ? 1 : -1;
    branch(190, y, side * (70 - i * 5), -48, 8 - i * 0.7);
    branch(190 + side * (70 - i * 5), y - 48, side * 22, -24, 3);
    g.save();
    g.translate(190 + side * (70 - i * 5), y - 50);
    g.rotate(side * 0.25);
    g.fillStyle = "#318451";
    g.fillRect(-23, -12, 46, 24);
    g.strokeStyle = "#bde0a0";
    g.lineWidth = 2;
    g.strokeRect(-20, -9, 40, 18);
    g.fillStyle = "#e3ecc7";
    g.font = "17px serif";
    g.fillText("$", 0, 6);
    g.restore();
    g.strokeStyle = "#252b28";
  }
  g.fillStyle = "#315b3e";
  g.font = "30px Gaegu";
  g.fillText("Money Tree", 192, 473);
  g.font = "18px Nunito";
  g.fillText("5 seeds · plant, water, wonder", 192, 499);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const group = new T.Group();
  group.add(
    new T.Mesh(
      new T.BoxGeometry(0.42, 0.58, 0.018),
      new T.MeshStandardMaterial({ color: "#fff8dc" }),
    ),
  );
  const front = new T.Mesh(
    new T.PlaneGeometry(0.42, 0.58),
    new T.MeshStandardMaterial({ map: texture, side: T.DoubleSide }),
  );
  front.position.z = 0.01;
  group.add(front);
  group.position.y = 0.3;
  return group;
}
