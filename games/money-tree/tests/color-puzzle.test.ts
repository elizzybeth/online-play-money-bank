import { test } from "node:test";
import assert from "node:assert/strict";
import {
  colorPuzzle,
  validColorPuzzle,
  puzzleConflicts,
} from "../src/color-puzzle";
import { fresh, decode, sleep } from "../src/game";
import { tickSigma } from "../src/sigma";
test("daily color puzzles preserve clues and valid rows, columns and boxes", () => {
  const boards = new Set<string>();
  for (let day = 1; day <= 30; day++) {
    const { clues, solution } = colorPuzzle(day);
    assert.equal(clues.filter(Boolean).length, 30);
    assert.equal(puzzleConflicts(solution).size, 0);
    assert(solution.every((v) => v >= 1 && v <= 9));
    assert(clues.every((v, i) => !v || v === solution[i]));
    boards.add(clues.join(""));
    assert(validColorPuzzle({ day, cells: clues }));
  }
  assert.equal(boards.size, 30);
});
test("puzzle progress migrates safely and conflicts identify both duplicates", () => {
  const s = fresh(),
    board = colorPuzzle(14);
  s.colorPuzzle = { day: 14, cells: [...board.clues] };
  const empty = board.clues.findIndex((v) => !v);
  s.colorPuzzle.cells[empty] = board.solution[empty];
  assert.deepEqual(decode(JSON.stringify(s))!.colorPuzzle, s.colorPuzzle);
  s.colorPuzzle.cells[0] = 99;
  assert.equal(decode(JSON.stringify(s))!.colorPuzzle, undefined);
  const cells = Array(81).fill(0);
  cells[0] = cells[1] = 4;
  assert.deepEqual([...puzzleConflicts(cells)], [0, 1]);
});
test("sleep ends drink effects; awake play still consumes their duration", () => {
  const s = fresh();
  s.awake = true;
  s.drink = { id: "sprint", remaining: 155 };
  tickSigma(s, 5);
  assert.equal(s.drink.remaining, 150);
  sleep(s);
  assert.equal(s.drink, undefined);
  assert.equal(decode(JSON.stringify(s))!.drink, undefined);
});
