/** Hand-lettered sign layouts, drawn at full resolution without stock imagery. */
export function heritageSign(
  text: string,
  w = 1536,
  h = 512,
  exterior = false,
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d")!;
  c.fillStyle = exterior ? "#433b30" : "#fff0d9";
  c.fillRect(0, 0, w, h);
  if (exterior) {
    for (let i = 0; i < 85; i++) {
      c.strokeStyle = i % 3 ? "#b4a38518" : "#15191228";
      c.lineWidth = 1 + (i % 3);
      c.beginPath();
      c.moveTo(0, (i * h) / 85);
      c.bezierCurveTo(
        w * 0.3,
        (i * h) / 85 + 5,
        w * 0.7,
        (i * h) / 85 - 5,
        w,
        (i * h) / 85,
      );
      c.stroke();
    }
  }
  const ink = exterior ? "#fff2d8" : "#242923";
  c.strokeStyle = ink;
  c.lineWidth = h * 0.009;
  c.strokeRect(h * 0.035, h * 0.035, w - h * 0.07, h - h * 0.07);
  c.lineWidth = h * 0.002;
  c.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
  const letters = (
    label: string,
    y: number,
    size: number,
    available: number,
    arch: number,
  ) => {
    // Warp each vertical slice of lettering; the baseline AND glyphs follow the bow.
    const line = document.createElement("canvas");
    line.width = w;
    line.height = h;
    const g = line.getContext("2d")!;
    g.font = `${size}px ${exterior ? "Rye" : "GlassAntiqua"},Georgia,serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = ink;
    g.fillText(label, w / 2, h / 2, available);
    for (
      let x = Math.floor((w - available) / 2) - 4;
      x < (w + available) / 2 + 4;
      x += 2
    ) {
      const t = (x - w / 2) / (available / 2),
        dy = arch * t * t;
      c.drawImage(line, x, 0, 2, h, x, y - h / 2 + dy, 2, h);
    }
  };
  if (exterior) {
    letters("GROCERY", h * 0.3, h * 0.3, w * 0.83, -h * 0.05);
    letters("HARDWARE", h * 0.78, h * 0.28, w * 0.84, -h * 0.025);
    c.fillStyle = ink;
    c.beginPath();
    c.ellipse(w / 2, h * 0.51, w * 0.075, h * 0.065, -0.08, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#433b30";
    c.font = `${h * 0.095}px Lobster`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("and", w / 2, h * 0.505);
  } else letters(text.toUpperCase(), h * 0.4, h * 0.65, w * 0.87, h * 0.06);
  c.strokeStyle = ink;
  c.lineWidth = h * 0.004;
  c.lineCap = "round";
  const y = exterior ? h * 0.51 : h * 0.76,
    spread = exterior ? 0.32 : 0.22;
  // Symmetric quill-and-scroll glyph, with an original central seed motif.
  for (const side of [-1, 1]) {
    c.beginPath();
    c.moveTo(w / 2 + side * w * 0.09, y);
    c.bezierCurveTo(
      w / 2 + side * w * 0.15,
      y - h * 0.12,
      w / 2 + side * w * 0.22,
      y + h * 0.1,
      w / 2 + side * w * spread,
      y,
    );
    c.stroke();
    c.beginPath();
    c.moveTo(w / 2 + side * w * 0.1, y + h * 0.025);
    c.bezierCurveTo(
      w / 2 + side * w * 0.19,
      y + h * 0.15,
      w / 2 + side * w * 0.13,
      y + h * 0.18,
      w / 2 + side * w * 0.13,
      y + h * 0.09,
    );
    c.stroke();
  }
  if (!exterior) {
    c.fillStyle = ink;
    c.beginPath();
    c.moveTo(w / 2, y - 0.025 * h);
    c.quadraticCurveTo(w / 2 + 0.025 * w, y + 0.025 * h, w / 2, y + 0.06 * h);
    c.quadraticCurveTo(w / 2 - 0.025 * w, y + 0.025 * h, w / 2, y - 0.025 * h);
    c.fill();
  }
  return canvas;
}
export const robertsonsLabels = new Set([
  "Groceries",
  "Home Furnishings",
  "Eggs",
  "Rice",
  "Beans",
  "Tortillas",
  "Plants",
  "Garden Tools",
  "Watering Can",
  "Shovel",
  "Fertilizer",
]);
