import * as T from "three";
/** Original cut-metal farm silhouette, printed on two upright transparent faces. */
export function makeFarmSign() {
  const root = new T.Group();
  root.name = "hanging-robertsons-farm-sign";
  const c = document.createElement("canvas");
  c.width = 1536;
  c.height = 900;
  const g = c.getContext("2d")!;
  g.scale(1.5, 1.5);
  g.fillStyle = g.strokeStyle = "#202722";
  g.lineWidth = 16;
  const path = (d: string) => {
    const p = new Path2D(d);
    g.fill(p);
  };
  g.beginPath();
  g.moveTo(35, 530);
  g.lineTo(35, 190);
  g.quadraticCurveTo(512, -65, 989, 190);
  g.lineTo(989, 530);
  g.closePath();
  g.stroke();
  g.beginPath();
  g.moveTo(35, 285);
  g.quadraticCurveTo(512, 145, 989, 285);
  g.stroke();
  for (let i = 0; i < 9; i++) {
    g.beginPath();
    g.moveTo(512, 65);
    g.lineTo(65 + i * 112, 230 - Math.sin((i / 8) * Math.PI) * 55);
    g.stroke();
  }
  g.beginPath();
  g.arc(512, 66, 42, 0, Math.PI);
  g.fill();
  g.font = "bold 86px Rye";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("ROBERTSON’S", 512, 285, 890);
  g.font = "bold 60px Rye";
  g.fillText("FARM", 512, 363, 480);
  // A small tractor, field furrows, hen and grain silhouettes.
  g.save();
  g.translate(170, 170);
  g.scale(0.7, 0.7);
  g.beginPath();
  g.arc(502, 472, 47, 0, Math.PI * 2);
  g.arc(650, 488, 28, 0, Math.PI * 2);
  g.fill();
  g.clearRect(489, 459, 26, 26);
  g.clearRect(641, 479, 18, 18);
  path("M482 425h65v-80h57v79h50v55H545v-30h-63zM550 356h43v54h-43z");
  g.fillRect(629, 394, 10, 50);
  g.restore();
  path(
    "M190 481q-14-41 16-55q14-25 30-12q25 4 28 28q32 5 30 30l-22 23h-58l-8 29h-10zM240 416l5-22 9 8 13-10 2 23z",
  );
  for (const x of [100, 130, 815, 850, 890]) {
    g.fillRect(x, 415, 6, 106);
    for (let y = 425; y < 490; y += 19) {
      path(`M${x} ${y}q-35-25-26-38q28 7 26 38z`);
      path(`M${x + 6} ${y + 7}q35-25 26-38q-28 7-26 38z`);
    }
  }
  g.lineWidth = 5;
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(335 + i * 25, 519);
    g.lineTo(400 + i * 15, 466);
    g.stroke();
  }
  g.fillRect(35, 522, 954, 16);
  const texture = new T.CanvasTexture(c);
  texture.colorSpace = T.SRGBColorSpace;
  const material = new T.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.5,
    roughness: 0.7,
  });
  const geometry = new T.PlaneGeometry(4.6, 2.7);
  for (const side of [-1, 1]) {
    const face = new T.Mesh(geometry, material);
    face.position.z = side * 0.018;
    face.rotation.y = side < 0 ? Math.PI : 0;
    root.add(face);
  }
  return root;
}
