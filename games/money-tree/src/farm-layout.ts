import type { Rect } from "./game";
// A seeded spanning-tree maze: exactly two openings, with branches and dead ends.
export const maze = { cols: 11, rows: 5, cell: 3.2, left: -88, top: -47.5 };
export const mazeCenter = (col: number, row: number) => ({
  x: maze.left + (col + 0.5) * maze.cell,
  z: maze.top + (row + 0.5) * maze.cell,
});
const passages = new Set<string>();
const edge = (a: number, b: number) => `${Math.min(a, b)}:${Math.max(a, b)}`;
let seed = 7319;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const seen = new Set<number>([54]),
  stack = [54];
while (stack.length) {
  const a = stack.at(-1)!,
    x = a % maze.cols,
    y = Math.floor(a / maze.cols);
  const next = [
    x > 0 ? a - 1 : -1,
    x < 10 ? a + 1 : -1,
    y > 0 ? a - 11 : -1,
    y < 4 ? a + 11 : -1,
  ].filter((b) => b >= 0 && !seen.has(b));
  if (!next.length) {
    stack.pop();
    continue;
  }
  const b = next[Math.floor(random() * next.length)];
  passages.add(edge(a, b));
  seen.add(b);
  stack.push(b);
}
export const mazePassages = passages;
export const mazeWalls: Rect[] = [];
const wall = (x: number, z: number, w: number, d: number) =>
  mazeWalls.push({ x, z, w, d });
for (let row = 0; row < maze.rows; row++)
  for (let col = 0; col < maze.cols; col++) {
    const p = mazeCenter(col, row),
      a = row * maze.cols + col;
    if (col === 0) wall(p.x - maze.cell / 2, p.z, 0.7, maze.cell + 0.7);
    if (row === 0) wall(p.x, p.z - maze.cell / 2, maze.cell + 0.7, 0.7);
    if (col < maze.cols - 1 && !passages.has(edge(a, a + 1)))
      wall(p.x + maze.cell / 2, p.z, 0.7, maze.cell + 0.7);
    if (row < maze.rows - 1 && !passages.has(edge(a, a + maze.cols)))
      wall(p.x, p.z + maze.cell / 2, maze.cell + 0.7, 0.7);
    if (row === maze.rows - 1)
      wall(p.x, p.z + maze.cell / 2, maze.cell + 0.7, 0.7);
    if (col === maze.cols - 1 && row !== 0 && row !== maze.rows - 1)
      wall(p.x + maze.cell / 2, p.z, 0.7, maze.cell + 0.7);
  }
export const mazeEntrance = {
  x: maze.left + maze.cols * maze.cell + 1.4,
  z: mazeCenter(10, 4).z,
};
export const mazeExit = {
  x: maze.left + maze.cols * maze.cell,
  z: mazeCenter(10, 0).z,
};
// Place the reward two cells before the finish along the actual solution.
const route = [54],
  parents = new Map<number, number>([[54, -1]]);
for (let i = 0; i < route.length; i++) {
  const a = route[i];
  for (let b = 0; b < 55; b++)
    if (!parents.has(b) && passages.has(edge(a, b))) {
      parents.set(b, a);
      route.push(b);
    }
}
const before = parents.get(parents.get(10)!)!;
export const mazePacket = mazeCenter(
  before % maze.cols,
  Math.floor(before / maze.cols),
);
export const mabelHome = { x: -39, z: -25 };
