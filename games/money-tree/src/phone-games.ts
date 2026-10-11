import type { State } from "./game";
import { recordEarnings } from "./millionaire";
export type Dot = {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  bad?: boolean;
};
export type PhoneGame = {
  kind: number;
  score: number;
  lives: number;
  complete: boolean;
  paid: boolean;
  boosted: boolean;
  peekUntil?: number;
  nextHopAt?: number;
  elapsed: number;
  timer: number;
  rng: number;
  player: number;
  direction: { x: number; y: number };
  snake: Dot[];
  food: Dot;
  ball: Dot;
  objects: Dot[];
  cards: number[];
  revealed: number[];
  matched: number[];
};
const random = (g: PhoneGame) => {
  g.rng = (g.rng * 16807) % 2147483647;
  return g.rng / 2147483647;
};
export function newPhoneGame(kind: number, seed = 17): PhoneGame {
  if (!Number.isInteger(kind) || kind < 0 || kind > 5)
    throw new Error("Unknown phone game");
  const g: PhoneGame = {
    kind,
    score: 0,
    lives: 3,
    complete: false,
    paid: false,
    boosted: false,
    elapsed: 0,
    timer: 0,
    rng: Math.max(1, seed % 2147483647),
    player: 0.5,
    direction: { x: 1, y: 0 },
    snake: [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ],
    food: { x: 12, y: 10 },
    ball: { x: 0.5, y: 0.55, vx: 0.22, vy: 0.4 },
    objects: [],
    cards: [],
    revealed: [],
    matched: [],
  };
  if (kind === 2) {
    g.player = 0.5;
    g.ball = { x: 0.5, y: 0.94 };
    for (let row = 0; row < 5; row++)
      for (let i = 0; i < 3; i++)
        g.objects.push({
          x: (i + random(g)) / 3,
          y: 0.19 + row * 0.14,
          vx: (row % 2 ? -1 : 1) * (0.1 + row * 0.025),
        });
  }
  if (kind === 3)
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 5; col++)
        g.objects.push({ x: 0.1 + col * 0.2, y: 0.14 + row * 0.1 });
  if (kind === 4) {
    g.cards = Array.from({ length: 20 }, (_, i) => i % 10);
    for (let i = 19; i > 0; i--) {
      const j = Math.floor(random(g) * (i + 1));
      [g.cards[i], g.cards[j]] = [g.cards[j], g.cards[i]];
    }
  }
  return g;
}
function score(g: PhoneGame) {
  g.score++;
  if (g.score >= 10) g.complete = true;
}
function hit(g: PhoneGame) {
  if (g.boosted) {
    g.boosted = false;
    return;
  }
  g.lives--;
  if (g.lives <= 0) g.complete = true;
}
export function phoneDirection(g: PhoneGame, x: number, y: number) {
  if (g.complete || !Number.isFinite(x) || !Number.isFinite(y)) return;
  x = Math.sign(x);
  y = Math.sign(y);
  if (
    g.kind === 0 &&
    Math.abs(x) + Math.abs(y) === 1 &&
    (x !== -g.direction.x || y !== -g.direction.y)
  )
    g.direction = { x, y };
  else if (g.kind === 2) {
    if (g.elapsed < (g.nextHopAt ?? 0)) return;
    g.nextHopAt = g.elapsed + 0.12;
    g.ball.x = Math.max(0.04, Math.min(0.96, g.ball.x + x * 0.09));
    g.ball.y = Math.max(0.03, Math.min(0.94, g.ball.y + y * 0.14));
    if (
      g.objects.some(
        (o) =>
          Math.abs(o.y - g.ball.y) < 0.055 && Math.abs(o.x - g.ball.x) < 0.1,
      )
    ) {
      hit(g);
      g.ball = { x: 0.5, y: 0.94 };
      return;
    }
    if (g.ball.y < 0.1) {
      score(g);
      g.ball = { x: 0.5, y: 0.94 };
    }
  } else g.player = Math.max(0.07, Math.min(0.93, g.player + x * 0.075));
}
export function phoneCard(g: PhoneGame, index: number) {
  if (
    g.kind !== 4 ||
    g.complete ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= 20 ||
    g.revealed.length === 2 ||
    g.matched.includes(index) ||
    g.revealed.includes(index)
  )
    return false;
  g.revealed.push(index);
  if (g.revealed.length === 2) {
    const [a, b] = g.revealed;
    if (g.cards[a] === g.cards[b]) {
      g.matched.push(a, b);
      g.revealed = [];
      score(g);
    } else g.timer = 0.8;
  }
  return true;
}
function step(g: PhoneGame, dt: number) {
  g.elapsed += dt;
  if (g.kind === 4 && g.boosted && g.elapsed >= (g.peekUntil ?? 0))
    g.boosted = false;
  if (g.kind === 0) {
    g.timer += dt;
    if (g.timer < 0.15) return;
    g.timer -= 0.15;
    const head = {
      x: g.snake[0].x + g.direction.x,
      y: g.snake[0].y + g.direction.y,
    };
    const eating = head.x === g.food.x && head.y === g.food.y;
    if (
      head.x < 0 ||
      head.x >= 20 ||
      head.y < 0 ||
      head.y >= 20 ||
      g.snake
        .slice(0, eating ? undefined : -1)
        .some((p) => p.x === head.x && p.y === head.y)
    ) {
      hit(g);
      g.snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 },
      ];
      g.direction = { x: 1, y: 0 };
      return;
    }
    g.snake.unshift(head);
    if (!eating) g.snake.pop();
    else {
      score(g);
      do {
        g.food = {
          x: Math.floor(random(g) * 20),
          y: Math.floor(random(g) * 20),
        };
      } while (g.snake.some((p) => p.x === g.food.x && p.y === g.food.y));
    }
  } else if (g.kind === 1 || g.kind === 3) {
    const b = g.ball;
    b.x += b.vx! * dt;
    b.y += b.vy! * dt;
    if (b.x < 0.025 || b.x > 0.975) {
      b.x = Math.max(0.025, Math.min(0.975, b.x));
      b.vx! *= -1;
    }
    if (
      b.y > 0.87 &&
      b.vy! > 0 &&
      Math.abs(b.x - g.player) < (g.boosted ? 0.2 : 0.12)
    ) {
      b.y = 0.87;
      b.vy! *= -1;
      b.vx = (b.x - g.player) * 2.5;
    }
    if (b.y > 1) {
      hit(g);
      g.ball = { x: 0.5, y: 0.55, vx: (random(g) - 0.5) * 0.5, vy: 0.4 };
      return;
    }
    if (g.kind === 1) {
      const opponent = 0.5 + Math.sin(g.elapsed * 1.35) * 0.32;
      if (b.y < 0.09 && b.vy! < 0) {
        if (Math.abs(b.x - opponent) < 0.13) {
          b.y = 0.09;
          b.vy! *= -1;
        } else {
          score(g);
          g.ball = { x: 0.5, y: 0.55, vx: (random(g) - 0.5) * 0.7, vy: 0.4 };
        }
      }
    } else {
      if (b.y < 0.025) {
        b.y = 0.025;
        b.vy! *= -1;
      }
      const index = g.objects.findIndex(
        (o) => Math.abs(o.x - b.x) < 0.09 && Math.abs(o.y - b.y) < 0.045,
      );
      if (index >= 0) {
        g.objects.splice(index, 1);
        b.vy! *= -1;
        score(g);
      }
    }
  } else if (g.kind === 2) {
    for (const o of g.objects) {
      o.x = (o.x + o.vx! * dt + 1) % 1;
      if (Math.abs(o.y - g.ball.y) < 0.055 && Math.abs(o.x - g.ball.x) < 0.1) {
        hit(g);
        g.ball = { x: 0.5, y: 0.94 };
        break;
      }
    }
  } else if (g.kind === 4) {
    if (g.revealed.length === 2) {
      g.timer -= dt;
      if (g.timer <= 0) g.revealed = [];
    }
  } else {
    g.timer -= dt;
    if (g.timer <= 0) {
      g.timer = 0.55;
      g.objects.push({
        x: 0.07 + random(g) * 0.86,
        y: 0,
        vy: 0.25 + random(g) * 0.15,
        bad: random(g) < 0.2,
      });
    }
    for (const o of g.objects) {
      o.y += o.vy! * dt;
      if (
        o.y > 0.88 &&
        o.y < 0.98 &&
        Math.abs(o.x - g.player) < (g.boosted ? 0.2 : 0.1)
      ) {
        if (o.bad) hit(g);
        else score(g);
        o.y = 2;
      } else if (o.y > 1 && !o.bad) {
        hit(g);
        o.y = 2;
      }
    }
    g.objects = g.objects.filter((o) => o.y < 1.05);
  }
}
export function tickPhoneGame(g: PhoneGame, dt: number) {
  if (g.complete || !Number.isFinite(dt) || dt <= 0) return;
  // Fixed short steps prevent tunnelling and bound work after tab suspension.
  for (let remaining = Math.min(dt, 0.25); remaining > 0 && !g.complete;) {
    const amount = Math.min(remaining, 1 / 120);
    step(g, amount);
    remaining -= amount;
  }
}
export function purchasePhoneBoost(s: State, g: PhoneGame) {
  if (
    g.complete ||
    g.boosted ||
    s.cash < 100 ||
    !s.millionaire?.apps.includes(g.kind)
  )
    return false;
  s.cash -= 100;
  g.boosted = true;
  if (g.kind === 4) g.peekUntil = g.elapsed + 3;
  s.events.push("Bought a $1 phone-game advantage.");
  return true;
}
export function claimPhoneReward(s: State, g: PhoneGame) {
  if (
    !g.complete ||
    g.score < 10 ||
    g.paid ||
    !s.millionaire?.apps.includes(g.kind)
  )
    return false;
  g.paid = true;
  const net = recordEarnings(s, 100, false, false);
  s.cash += net;
  s.totalEarned = (s.totalEarned ?? 0) + 100;
  s.events.push("Won $1 by scoring ten points in a phone game.");
  return true;
}
