import { heritageSign, robertsonsLabels } from "./heritage-signs";
// Original shop identities, drawn at texture resolution with bundled fonts.
export function signCanvas(text: string, width = 768, height = 192) {
  if (text === "Hardware & Grocer") return heritageSign(text, 1536, 640, true);
  if (
    robertsonsLabels.has(text) ||
    /^(WATERING CAN|SHOVEL|FERTILIZER|Garden bed|Soil) ·/.test(text)
  )
    return heritageSign(text, Math.max(width, 1536), Math.max(height, 512));
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const g = c.getContext("2d")!;
  if (text === "CORN MAZE ENTRANCE") {
    g.fillStyle = "#785437";
    g.fillRect(width * 0.46, 0, width * 0.08, height);
    for (const [label, y] of [
      ["CORN", 0.21],
      ["MAZE", 0.55],
    ] as const) {
      g.fillStyle = "#f8e1a1";
      g.fillRect(width * 0.05, height * (y - 0.17), width * 0.9, height * 0.3);
      g.fillStyle = "#ce503c";
      g.fillRect(
        width * 0.07,
        height * (y - 0.15),
        width * 0.86,
        height * 0.26,
      );
      g.fillStyle = "#ffe8ab";
      g.font = `${height * 0.24}px HennyPenny`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label, width / 2, height * y, width * 0.8);
    }
    g.fillStyle = "#e4c677";
    g.beginPath();
    g.moveTo(width * 0.08, height * 0.79);
    g.lineTo(width * 0.8, height * 0.79);
    g.lineTo(width * 0.94, height * 0.88);
    g.lineTo(width * 0.8, height * 0.97);
    g.lineTo(width * 0.08, height * 0.97);
    g.lineTo(width * 0.16, height * 0.88);
    g.closePath();
    g.fill();
    g.fillStyle = "#503b28";
    g.font = `${height * 0.115}px Lobster`;
    g.fillText("Entrance", width * 0.5, height * 0.885, width * 0.7);
    return c;
  }
  if (text === "Grindset") {
    g.fillStyle = "#143f38";
    g.fillRect(0, 0, width, height);
    g.save();
    g.translate(height * 0.18, height * 0.1);
    g.scale(height * 0.011, height * 0.011);
    g.lineCap = "round";
    g.strokeStyle = "#6b4630";
    g.lineWidth = 3.5;
    g.stroke(
      new Path2D(
        "M23 12c-5-4 5-6 0-10M33 12c-5-4 5-6 0-10M43 12c-5-4 5-6 0-10",
      ),
    );
    const path = (d: string, fill: string, stroke?: string) => {
      const p = new Path2D(d);
      g.fillStyle = fill;
      g.fill(p);
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = 3;
        g.stroke(p);
      }
    };
    path("m13 25 5 40q1 5 6 5h19q5 0 6-5l5-40", "#ffe0b2", "#6b4630");
    path("m15 37 2 20h33l2-20", "#bd8054");
    path("m15 17-2 8h41l-2-8z", "#76523e", "#6b4630");
    path("M10 25h47v6H10z", "#8e6651", "#6b4630");
    g.fillStyle = "#67452f";
    g.beginPath();
    g.ellipse(33, 47, 5, 8, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#cf996d";
    g.lineWidth = 2;
    g.stroke(new Path2D("m34 40-3 14"));
    g.restore();
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.font = `900 ${height * 0.63}px BarlowCondensed`;
    g.lineWidth = height * 0.014;
    for (let depth = 10; depth >= 0; depth--) {
      g.fillStyle = depth ? "#081f1b" : "#fff5e1";
      g.fillText(
        "GRINDSET",
        height * 1.03 + depth,
        height * 0.46 + depth,
        width - height * 1.1,
      );
    }
    g.fillStyle = "#ead0a0";
    g.font = `${height * 0.1}px sans-serif`;
    g.fillText("SIP • HODL • ASCEND", height * 1.08, height * 0.87);
    return c;
  }
  if (/spanakopita|food of the gods/i.test(text)) {
    g.fillStyle = "#f5fcff";
    g.fillRect(0, 0, width, height);
    g.strokeStyle = g.fillStyle = "#173c82";
    g.lineWidth = 6;
    g.strokeRect(9, 9, width - 18, height - 18);
    for (let x = 20; x < width - 20; x += 30) {
      g.stroke(new Path2D(`M${x} 22h18v14h-10v-7h5`));
      g.stroke(new Path2D(`M${x} ${height - 22}h18v-14h-10v7h5`));
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 ${height * 0.37}px Bungee`;
    g.fillText(text.toUpperCase(), width / 2, height * 0.53, width * 0.9);
    return c;
  }
  if (text === "Robertsons") {
    g.fillStyle = "#e64131";
    g.beginPath();
    g.ellipse(
      width / 2,
      height / 2,
      width * 0.485,
      height * 0.44,
      0,
      0,
      Math.PI * 2,
    );
    g.fill();
    g.strokeStyle = "#fff6df";
    g.lineWidth = 4;
    g.stroke();
    g.fillStyle = "#fff9ed";
    g.textAlign = "center";
    g.textBaseline = "middle";
    let size = height * 0.78;
    g.font = `${size}px Lobster`;
    while (g.measureText(text).width > width * 0.82 && size > 12)
      g.font = `${--size}px Lobster`;
    g.fillText(text, width * 0.5, height * 0.49);
    return c;
  }
  if (["Thread & Thimble", "Angry Haberdasher", "This Way"].includes(text)) {
    const left = text !== "Angry Haberdasher";
    const colors: Record<string, string> = {
      "Thread & Thimble": "#a9ced6",
      "Angry Haberdasher": "#dfa3be",
      "This Way": "#e4d28d",
    };
    g.save();
    if (left) {
      g.translate(width, 0);
      g.scale(-1, 1);
    }
    g.beginPath();
    g.moveTo(12, height * 0.12);
    g.lineTo(width * 0.83, height * 0.1);
    g.lineTo(width * 0.82, height * 0.02);
    g.lineTo(width - 8, height * 0.5);
    g.lineTo(width * 0.82, height * 0.97);
    g.lineTo(width * 0.83, height * 0.89);
    g.lineTo(10, height * 0.87);
    g.lineTo(16, height * 0.57);
    g.closePath();
    g.fillStyle = colors[text];
    g.fill();
    g.strokeStyle = "#645349";
    g.lineWidth = 3;
    g.stroke();
    g.clip();
    for (let line = 0; line < 7; line++) {
      g.strokeStyle = line % 2 ? "#ffffff35" : "#49352b19";
      g.beginPath();
      g.moveTo(0, 20 + (line * height) / 8);
      g.quadraticCurveTo(
        width * 0.5,
        (line * height) / 8 + 12,
        width,
        (line * height) / 8 + 22,
      );
      g.stroke();
    }
    g.restore();
    g.fillStyle = "#3d3042";
    g.textAlign = "center";
    g.textBaseline = "middle";
    let size = height * 0.43;
    g.font = `${size}px HennyPenny`;
    while (g.measureText(text).width > width * 0.76 && size > 12)
      g.font = `${--size}px HennyPenny`;
    g.fillText(text, width * (left ? 0.57 : 0.43), height * 0.53);
    return c;
  }
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
    text === "Thread & Thimble" ||
    text === "Haberdashery" ||
    text === "A hat for every adventure";
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
