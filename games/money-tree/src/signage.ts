// Original shop identities, drawn at texture resolution with bundled fonts.
export function signCanvas(text: string, width = 768, height = 192) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const g = c.getContext("2d")!;
  const sigmaBrand = [
    "Community Garden",
    "Sigma Town",
    "Doge",
    "Pepe",
    "Hawk Tuah",
    "Lone Wolf · $1 for luck",
  ].includes(text);
  if (sigmaBrand) {
    const garden = text === "Community Garden";
    const frog = text === "Pepe";
    const ink = garden || frog ? "#315745" : "#f5d591";
    g.fillStyle = garden || frog ? "#f8edcf" : "#202833";
    g.fillRect(0, 0, width, height);
    g.strokeStyle = ink;
    g.lineWidth = 5;
    g.strokeRect(9, 9, width - 18, height - 18);
    g.strokeRect(16, 16, width - 32, height - 32);
    g.fillStyle = ink;
    g.textAlign = "center";
    g.textBaseline = "middle";
    if (garden) {
      g.font = `${height * 0.23}px BarlowCondensed`;
      g.fillText("COMMUNITY", width * 0.23, height * 0.5);
      g.fillText("GARDEN", width * 0.78, height * 0.5);
      g.save();
      g.translate(width * 0.51, height * 0.5);
      g.scale(height * 0.36, height * 0.36);
      g.beginPath();
      for (const [i, [x, y]] of [
        [-0.7, -1],
        [0.7, -1],
        [0.7, -0.7],
        [-0.2, -0.7],
        [0.5, 0],
        [-0.2, 0.7],
        [0.7, 0.7],
        [0.7, 1],
        [-0.7, 1],
        [0.05, 0],
      ].entries())
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      g.closePath();
      g.fill();
      g.restore();
    } else {
      const cx = height * 0.6,
        cy = height * 0.5,
        r = height * 0.3;
      g.save();
      g.translate(cx, cy);
      g.lineWidth = 4;
      if (text === "Doge") {
        g.beginPath();
        g.moveTo(-r, -r);
        g.lineTo(-r * 0.3, -r * 0.45);
        g.lineTo(r * 0.3, -r * 0.45);
        g.lineTo(r, -r);
        g.lineTo(r * 0.85, r * 0.5);
        g.quadraticCurveTo(0, r * 1.3, -r * 0.85, r * 0.5);
        g.closePath();
        g.stroke();
        for (const x of [-0.4, 0.4]) {
          g.beginPath();
          g.arc(x * r, 0, r * 0.07, 0, 7);
          g.fill();
        }
        g.beginPath();
        g.arc(0, r * 0.45, r * 0.16, 0, 7);
        g.fill();
      } else if (frog) {
        g.beginPath();
        g.ellipse(0, r * 0.3, r, r * 0.65, 0, 0, 7);
        g.stroke();
        for (const x of [-0.5, 0.5]) {
          g.beginPath();
          g.arc(x * r, -r * 0.35, r * 0.4, 0, 7);
          g.stroke();
          g.beginPath();
          g.arc(x * r, -r * 0.35, r * 0.1, 0, 7);
          g.fill();
        }
        g.beginPath();
        g.moveTo(-r * 0.6, r * 0.4);
        g.quadraticCurveTo(0, r * 0.8, r * 0.6, r * 0.4);
        g.stroke();
      } else if (text === "Hawk Tuah") {
        for (let i = 0; i < 5; i++) {
          g.beginPath();
          g.moveTo(-r * 0.7, r * 0.7);
          g.quadraticCurveTo(
            -r + i * r * 0.4,
            -r,
            r * 0.8,
            -r * 0.7 + i * r * 0.12,
          );
          g.stroke();
        }
      } else {
        g.font = `${height * 0.62}px serif`;
        g.fillText(text === "Sigma Town" ? "Σ" : "☾", 0, 0);
      }
      g.restore();
      const label = text === "Lone Wolf · $1 for luck" ? "Lone Wolf" : text;
      const face = frog
        ? "Gaegu"
        : text === "Doge"
          ? "Bungee"
          : text === "Hawk Tuah"
            ? "Lobster"
            : "BarlowCondensed";
      let size = height * 0.48;
      g.font = `${size}px ${face}`;
      while (g.measureText(label).width > width - height * 1.3 && size > 12)
        g.font = `${--size}px ${face}`;
      g.fillText(label, height + (width - height) / 2, height * 0.46);
      if (text.startsWith("Lone Wolf")) {
        g.font = `${height * 0.16}px Nunito`;
        g.fillText("$1 FOR LUCK", height + (width - height) / 2, height * 0.77);
      }
    }
    return c;
  }
  const grocery = text === "Robertsons" || text === "Hardware & Grocer";
  const hat =
    text === "Thread & Thimble" || text === "A hat for every adventure";
  const bike = text === "SPOKE & SADDLE";
  const coffee = text === "Grindset";
  const paper = hat
    ? "#fff0c9"
    : bike
      ? "#f4e8d0"
      : grocery
        ? "#fff8ec"
        : "#252a31";
  const ink = hat
    ? "#56385f"
    : bike
      ? "#234a60"
      : grocery
        ? "#b62e38"
        : "#f4dba0";
  g.fillStyle = paper;
  g.fillRect(0, 0, width, height);
  // Deliberate subtle paper/paint grain, never across the letterforms.
  for (let i = 0; i < width; i += 7) {
    g.fillStyle = i % 3 ? "#ffffff0a" : "#00000005";
    g.fillRect(i, 0, 2, height);
  }
  g.strokeStyle = ink;
  g.lineWidth = height * 0.035;
  g.strokeRect(8, 8, width - 16, height - 16);
  let font = hat
    ? "HennyPenny"
    : bike
      ? "Bungee"
      : grocery
        ? "Lobster"
        : coffee
          ? "BarlowCondensed"
          : text === "Pepe"
            ? "Gaegu"
            : text === "Doge"
              ? "Bungee"
              : text === "Hawk Tuah"
                ? "Nunito"
                : "BarlowCondensed";
  let label = text === "Hardware & Grocer" ? "GROCERY & HARDWARE" : text;
  if (text === "Hardware & Grocer") font = "BarlowCondensed";
  const icon = grocery || hat || bike || coffee;
  const left = icon ? height * 0.94 : 24;
  let size = height * (hat ? 0.42 : 0.52);
  g.font = `${size}px ${font}`;
  while (g.measureText(label).width > width - left - 30 && size > 12)
    g.font = `${--size}px ${font}`;
  g.fillStyle = ink;
  g.textBaseline = "middle";
  g.textAlign = "center";
  if (hat && text === "Thread & Thimble") {
    const total = g.measureText(label).width;
    let x = left + (width - left) / 2 - total / 2;
    for (const [i, char] of [...label].entries()) {
      const advance = g.measureText(char).width;
      g.save();
      g.translate(
        x + advance / 2,
        height * 0.54 + ((i % 3) - 1) * height * 0.045,
      );
      g.rotate((i % 2 ? 1 : -1) * 0.06);
      g.fillText(char, 0, 0);
      g.restore();
      x += advance;
    }
  } else g.fillText(label, left + (width - left) / 2, height * 0.52);
  if (icon) {
    g.save();
    g.translate(height * 0.49, height * 0.51);
    const r = height * 0.26;
    g.lineWidth = height * 0.035;
    g.strokeStyle = ink;
    g.fillStyle = ink;
    if (grocery) {
      g.beginPath();
      g.roundRect(-r * 0.6, -r * 0.4, r * 1.2, r * 1.1, 4);
      g.stroke();
      g.beginPath();
      g.arc(0, -r * 0.4, r * 0.35, Math.PI, 0);
      g.stroke();
      g.beginPath();
      g.ellipse(0, -r * 0.73, r * 0.32, r * 0.14, -0.5, 0, 7);
      g.fill();
    }
    if (hat) {
      g.rotate(-0.18);
      g.fillRect(-r * 0.6, -r * 0.85, r * 1.2, r * 1.45);
      g.fillRect(-r, -r * 0.02, r * 2, r * 0.3);
      g.fillStyle = "#d8985d";
      g.fillRect(-r * 0.6, -r * 0.12, r * 1.2, r * 0.22);
      g.fillStyle = paper;
      g.font = `${r * 0.42}px HennyPenny`;
      g.fillText("10/6", 0, -r * 0.5);
    }
    if (bike) {
      for (const x of [-r * 0.55, r * 0.55]) {
        g.beginPath();
        g.arc(x, r * 0.2, r * 0.44, 0, 7);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(-r * 0.55, r * 0.2);
      g.lineTo(0, -r * 0.65);
      g.lineTo(r * 0.55, r * 0.2);
      g.lineTo(-r * 0.55, r * 0.2);
      g.lineTo(r * 0.1, -r * 0.35);
      g.stroke();
    }
    if (coffee) {
      g.beginPath();
      g.ellipse(0, 0, r * 0.6, r * 0.88, 0.5, 0, 7);
      g.stroke();
      g.beginPath();
      g.moveTo(-r * 0.3, r * 0.6);
      g.bezierCurveTo(r * 0.6, 0, -r * 0.5, 0, r * 0.3, -r * 0.6);
      g.stroke();
    }
    g.restore();
  }
  if (hat) {
    g.strokeStyle = "#b18471";
    g.lineWidth = 2;
    for (const x of [17, width - 17]) {
      g.beginPath();
      g.moveTo(x, 20);
      g.bezierCurveTo(
        x + 15,
        height * 0.3,
        x - 15,
        height * 0.7,
        x,
        height - 20,
      );
      g.stroke();
    }
  }
  return c;
}
