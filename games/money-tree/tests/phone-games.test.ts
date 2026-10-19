import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh } from "../src/game";
import { newMillionaire } from "../src/millionaire";
import {
  newPhoneGame,
  phoneCard,
  phoneDirection,
  tickPhoneGame,
  purchasePhoneBoost,
  claimPhoneReward,
} from "../src/phone-games";

test("actual memory matches earn a single dollar only after ten points", () => {
  const s = fresh();
  s.millionaire = { ...newMillionaire(), apps: [4] };
  const g = newPhoneGame(4);
  assert(!claimPhoneReward(s, g));
  for (let value = 0; value < 10; value++) {
    const pair = g.cards.flatMap((card, index) =>
      card === value ? [index] : [],
    );
    assert(phoneCard(g, pair[0]));
    assert(phoneCard(g, pair[1]));
    if (value < 9) assert(!claimPhoneReward(s, g));
  }
  assert.equal(g.score, 10);
  assert(claimPhoneReward(s, g));
  assert.equal(s.cash, 100);
  assert(!claimPhoneReward(s, g));
  assert.equal(s.cash, 100);
});

test("phone microtransactions debit only owned games and memory peek expires", () => {
  const s = fresh();
  s.cash = 100;
  s.millionaire = { ...newMillionaire(), apps: [4] };
  const g = newPhoneGame(4);
  assert(!purchasePhoneBoost(s, newPhoneGame(0)));
  assert.equal(s.cash, 100);
  assert(purchasePhoneBoost(s, g));
  assert.equal(s.cash, 0);
  assert(!purchasePhoneBoost(s, g));
  for (let i = 0; i < 13; i++) tickPhoneGame(g, 0.25);
  assert.equal(g.boosted, false);
  assert.equal(g.score, 0);
});

test("all six games bound suspended-tab work and reject invalid time", () => {
  for (let kind = 0; kind < 6; kind++) {
    const g = newPhoneGame(kind);
    tickPhoneGame(g, NaN);
    tickPhoneGame(g, -1);
    assert.equal(g.elapsed, 0);
    tickPhoneGame(g, 10000);
    assert(g.elapsed <= 0.251);
    assert.equal(g.score, 0);
  }
});

test("all six games can reach ten points through real gameplay and pay once", () => {
  for (let kind = 0; kind < 6; kind++) {
    const g = newPhoneGame(kind);
    if (kind === 4) {
      for (let v = 0; v < 10; v++)
        g.cards.forEach((card, i) => {
          if (card === v) phoneCard(g, i);
        });
    } else if (kind === 0 || kind === 2) {
      for (let step = 0; step < 2000 && !g.complete; step++) {
        const start = kind === 0 ? g.snake[0] : g.ball;
        const queue = [{ ...start, path: [] as number[][] }],
          seen = new Set<string>();
        let path: number[][] | undefined;
        for (let head = 0; head < queue.length; head++) {
          const p = queue[head];
          if (kind === 0 ? p.x === g.food.x && p.y === g.food.y : p.y < 0.1) {
            path = p.path;
            break;
          }
          if (kind === 2 && p.path.length >= 18) continue;
          for (const [x, y] of kind === 0
            ? [
                [1, 0],
                [0, 1],
                [-1, 0],
                [0, -1],
              ]
            : [
                [0, -1],
                [1, 0],
                [-1, 0],
                [0, 0],
                [0, 1],
              ]) {
            const a = {
              x:
                kind === 0
                  ? p.x + x
                  : Math.max(0.04, Math.min(0.96, p.x + x * 0.09)),
              y:
                kind === 0
                  ? p.y + y
                  : Math.max(0.03, Math.min(0.94, p.y + y * 0.14)),
              path: [...p.path, [x, y]],
            };
            const key = `${a.x.toFixed(2)},${a.y.toFixed(2)}${kind === 2 ? "," + a.path.length : ""}`;
            const collision =
              kind === 0
                ? a.x < 0 ||
                  a.x >= 20 ||
                  a.y < 0 ||
                  a.y >= 20 ||
                  g.snake.slice(0, -1).some((o) => o.x === a.x && o.y === a.y)
                : g.objects.some(
                    (o) =>
                      Math.abs(o.y - a.y) < 0.055 &&
                      [p.path.length * 0.125, a.path.length * 0.125].some(
                        (t) =>
                          Math.abs(((o.x + o.vx! * t + 1) % 1) - a.x) < 0.115,
                      ),
                  );
            if (collision || seen.has(key)) continue;
            seen.add(key);
            queue.push(a);
          }
        }
        if (path?.length) phoneDirection(g, path[0][0], path[0][1]);
        tickPhoneGame(g, kind === 0 ? 0.15 : 0.125);
      }
    } else {
      for (let step = 0; step < 60000 && !g.complete; step++) {
        if (kind === 5) {
          const fruit = g.objects
            .filter((o) => !o.bad)
            .sort((a, b) => b.y - a.y)[0];
          if (fruit) g.player = fruit.x;
        } else
          g.player = Math.max(
            0.07,
            Math.min(
              0.93,
              g.ball.x +
                (kind === 3
                  ? 0.065 * Math.sin(step * 0.015)
                  : 0.035 * Math.sin(step * 0.003)),
            ),
          );
        tickPhoneGame(g, 0.01);
      }
    }
    assert.equal(g.score, 10, `game ${kind} should be winnable`);
    const s = fresh();
    s.millionaire = {
      ...newMillionaire(),
      apps: [kind],
      member: "arms",
      titheAccepted: true,
    };
    assert(claimPhoneReward(s, g));
    assert.equal(s.cash, 100);
    assert.equal(s.millionaire.tithed, 0);
    assert(!claimPhoneReward(s, g));
    assert.equal(s.cash, 100);
  }
});
