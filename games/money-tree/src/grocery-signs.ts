/** Bold, irregular vintage grocery lettering to complement the painted basket mark.
 * Uses the already bundled display face; all shelf labels share the market atlas. */
export function grocerySignCanvas(text: string, width = 512, height = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#faf5e9";
  g.fillRect(0, 0, width, height);
  const label = text.toUpperCase();
  const size = height * 0.61;
  g.font = `${size}px Bungee`;
  g.textBaseline = "middle";
  const advances = [...label].map((c) => g.measureText(c).width);
  const total = advances.reduce((sum, n) => sum + n, 0);
  const scale = Math.min(1, (width - 34) / total);
  g.save();
  g.translate((width - total * scale) / 2, height * 0.48);
  g.scale(scale, 1);
  g.fillStyle = "#151914";
  let x = 0;
  [...label].forEach((letter, i) => {
    g.save();
    g.translate(x + advances[i] / 2, ((i % 3) - 1) * height * 0.009);
    g.transform(1, 0, i % 2 ? -0.035 : 0.035, 1, 0, 0);
    g.rotate(((i % 3) - 1) * 0.018);
    g.fillText(letter, -advances[i] / 2, 0);
    g.restore();
    x += advances[i];
  });
  g.restore();
  // A restrained, slightly curved green brush accent ties labels to the logo.
  g.strokeStyle = "#64924e";
  g.lineWidth = height * 0.035;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(width * 0.06, height * 0.86);
  g.quadraticCurveTo(width * 0.51, height * 0.82, width * 0.94, height * 0.86);
  g.stroke();
  return canvas;
}
