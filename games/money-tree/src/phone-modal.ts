import type { State } from "./game";
import { appNames } from "./millionaire";
import {
  newPhoneGame,
  phoneKey,
  phoneDirection,
  phoneCard,
  tickPhoneGame,
  purchasePhoneBoost,
  claimPhoneReward,
} from "./phone-games";
export function mountPhoneGame(
  root: HTMLElement,
  s: State,
  index: number,
  onChange: () => void,
) {
  if (!s.millionaire?.apps.includes(index))
    throw new Error("This app has not been purchased");
  const frame = document.createElement("div");
  frame.className = "millionaire-phone";
  frame.style.cssText =
    "max-width:340px;margin:auto;padding:16px;border:10px solid #303535;border-radius:30px;background:#e8efde;color:#263b31;box-sizing:border-box";
  const title = document.createElement("strong");
  title.textContent = appNames[index];
  frame.append(title);
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  frame.append(status);
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 360;
  canvas.style.cssText =
    "width:min(100%,32dvh);height:auto;aspect-ratio:5/6;margin:auto;display:block;background:#edf2df;touch-action:none;border:2px solid #4b6950";
  canvas.setAttribute("aria-label", `${appNames[index]} game board`);
  frame.append(canvas);
  const hint = document.createElement("p");
  hint.textContent =
    index === 4
      ? "WASD or arrows to move, Enter to flip. Match ten pairs to earn $1."
      : index === 2
        ? "Use WASD or the arrows to cross the road ten times. Ten points earns $1."
        : "Use WASD or the arrows or drag to move. Ten points earns $1.";
  frame.append(hint);
  const controls = document.createElement("div");
  controls.style.cssText =
    "display:flex;flex-wrap:wrap;justify-content:center;gap:6px";
  for (const [label, x, y] of [
    ["←", -1, 0],
    ["↑", 0, -1],
    ["↓", 0, 1],
    ["→", 1, 0],
  ] as const) {
    const button = document.createElement("button");
    button.textContent = label;
    button.setAttribute(
      "aria-label",
      `Game ${x < 0 ? "left" : x > 0 ? "right" : y < 0 ? "up" : "down"}`,
    );
    button.onclick = () => phoneDirection(game, x, y);
    controls.append(button);
  }
  if (index !== 4) frame.append(controls);
  const boost = document.createElement("button");
  const effects = [
    "One collision shield",
    "Wide paddle and a shield",
    "One traffic shield",
    "Wide paddle and a shield",
    "Peek at all cards for 3 seconds",
    "Wide basket and a shield",
  ];
  boost.textContent = `${effects[index]} · $1`;
  boost.onclick = () => {
    if (purchasePhoneBoost(s, game)) {
      onChange();
      draw();
    }
  };
  frame.append(boost);
  const replay = document.createElement("button");
  replay.textContent = "Play again";
  replay.hidden = true;
  replay.onclick = () => {
    game = newPhoneGame(index, 17 + session++);
    replay.hidden = true;
    last = performance.now();
    root.focus({ preventScroll: true });
    draw();
  };
  frame.append(replay);
  root.append(frame);
  root.tabIndex = 0;
  root.focus();
  let session = 1,
    game = newPhoneGame(index),
    last = performance.now(),
    disposed = false,
    request = 0;
  const c = canvas.getContext("2d")!;
  function rect(x: number, y: number, w: number, h: number, color: string) {
    c.fillStyle = color;
    c.fillRect((x - w / 2) * 300, (y - h / 2) * 360, w * 300, h * 360);
  }
  function dot(x: number, y: number, r: number, color: string) {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x * 300, y * 360, r * 300, r * 300, 0, 0, Math.PI * 2);
    c.fill();
  }
  function draw() {
    c.clearRect(0, 0, 300, 360);
    c.fillStyle = "#edf2df";
    c.fillRect(0, 0, 300, 360);
    if (index === 0) {
      c.strokeStyle = "#dae3ce";
      c.lineWidth = 1;
      for (let i = 0; i <= 20; i++) {
        c.beginPath();
        c.moveTo(i * 15, 0);
        c.lineTo(i * 15, 360);
        c.moveTo(0, i * 18);
        c.lineTo(300, i * 18);
        c.stroke();
      }
      game.snake.forEach((p, i) =>
        rect(
          (p.x + 0.5) / 20,
          (p.y + 0.5) / 20,
          0.043,
          0.043,
          i ? "#66915b" : "#304e37",
        ),
      );
      dot((game.food.x + 0.5) / 20, (game.food.y + 0.5) / 20, 0.023, "#dd7951");
    } else if (index === 1 || index === 3) {
      rect(game.player, 0.91, game.boosted ? 0.4 : 0.24, 0.035, "#435f56");
      dot(game.ball.x, game.ball.y, 0.025, "#d67d4d");
      if (index === 1) {
        rect(
          0.5 + Math.sin(game.elapsed * 1.35) * 0.32,
          0.045,
          0.26,
          0.035,
          "#9370a0",
        );
        c.strokeStyle = "#afc2a4";
        c.setLineDash([8, 8]);
        c.beginPath();
        c.moveTo(0, 180);
        c.lineTo(300, 180);
        c.stroke();
        c.setLineDash([]);
      } else
        for (const brick of game.objects)
          rect(
            brick.x,
            brick.y,
            0.17,
            0.075,
            ["#c67860", "#d7b862", "#779662"][
              Math.min(2, Math.round((brick.y - 0.14) / 0.1))
            ],
          );
    } else if (index === 2) {
      rect(0.5, 0.47, 1, 0.72, "#777d76");
      for (let row = 0; row < 5; row++) {
        c.strokeStyle = "#d2d5ad";
        c.setLineDash([12, 10]);
        c.beginPath();
        c.moveTo(0, (0.26 + row * 0.14) * 360);
        c.lineTo(300, (0.26 + row * 0.14) * 360);
        c.stroke();
      }
      c.setLineDash([]);
      game.objects.forEach((o) => {
        rect(o.x, o.y, 0.16, 0.08, o.vx! < 0 ? "#b2756b" : "#798ba4");
        rect(o.x, o.y, 0.07, 0.05, "#d9e9e7");
      });
      dot(game.ball.x, game.ball.y, 0.04, "#4c915a");
      dot(game.ball.x - 0.025, game.ball.y - 0.025, 0.012, "#e3edcb");
      dot(game.ball.x + 0.025, game.ball.y - 0.025, 0.012, "#e3edcb");
    } else if (index === 4) {
      const colors = [
        "#b35158",
        "#618fac",
        "#e1ac54",
        "#718e4e",
        "#a980b0",
        "#bb8461",
        "#5b9a91",
        "#c9779c",
        "#7d85b7",
        "#9a9958",
      ];
      game.cards.forEach((value, i) => {
        const x = (i % 4) * 75 + 4,
          y = Math.floor(i / 4) * 72 + 4;
        const face =
          game.matched.includes(i) || game.revealed.includes(i) || game.boosted;
        c.fillStyle = game.matched.includes(i)
          ? "#d6e3c7"
          : face
            ? "#fffbec"
            : "#456a57";
        c.fillRect(x, y, 67, 64);
        if (i === game.cursor) {
          c.strokeStyle = "#e3ac39";
          c.lineWidth = 3;
          c.strokeRect(x + 2, y + 2, 63, 60);
        }
        c.fillStyle = face ? colors[value] : "#e2e7ba";
        c.font = "bold 25px Georgia";
        c.textAlign = "center";
        c.fillText(face ? String(value + 1) : "?", x + 33, y + 41);
      });
    } else {
      game.objects.forEach((o) => {
        dot(o.x, o.y, 0.035, o.bad ? "#aa4545" : "#e1ae53");
        if (o.bad) {
          c.strokeStyle = "#fff6e8";
          c.beginPath();
          c.moveTo(o.x * 300 - 5, o.y * 360 - 5);
          c.lineTo(o.x * 300 + 5, o.y * 360 + 5);
          c.moveTo(o.x * 300 + 5, o.y * 360 - 5);
          c.lineTo(o.x * 300 - 5, o.y * 360 + 5);
          c.stroke();
        }
      });
      rect(game.player, 0.94, game.boosted ? 0.4 : 0.2, 0.05, "#52774c");
    }
    status.textContent = game.complete
      ? game.score >= 10
        ? "Ten points! $1.00 earned, all to your pocket."
        : "Out of lives. Try again."
      : `${game.score}/10 points${index === 4 ? "" : ` · ${game.lives} lives`}`;
    boost.disabled = game.complete || game.boosted || s.cash < 100;
    replay.hidden = !game.complete;
  }
  function key(e: KeyboardEvent) {
    if (
      e.target instanceof HTMLButtonElement &&
      (e.key === "Enter" || e.key === " ")
    )
      return;
    if (phoneKey(game, e.key)) {
      e.preventDefault();
      e.stopPropagation();
      draw();
    }
  }
  root.addEventListener("keydown", key);
  function pointer(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width,
      y = (e.clientY - r.top) / r.height;
    if (index === 4 && e.type === "pointerdown")
      phoneCard(
        game,
        Math.min(4, Math.max(0, Math.floor(y * 5))) * 4 +
          Math.min(3, Math.max(0, Math.floor(x * 4))),
      );
    else if (index !== 0 && index !== 2 && index !== 4)
      game.player = Math.max(0.07, Math.min(0.93, x));
  }
  canvas.addEventListener("pointerdown", pointer);
  canvas.addEventListener("pointermove", pointer);
  function animate(now: number) {
    if (disposed || !root.isConnected) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!document.hidden) tickPhoneGame(game, dt);
    if (claimPhoneReward(s, game)) onChange();
    draw();
    request = requestAnimationFrame(animate);
  }
  draw();
  request = requestAnimationFrame(animate);
  return () => {
    disposed = true;
    cancelAnimationFrame(request);
    root.removeEventListener("keydown", key);
    canvas.removeEventListener("pointerdown", pointer);
    canvas.removeEventListener("pointermove", pointer);
    frame.remove();
  };
}
