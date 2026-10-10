export const puzzleColors = [
  { name: "red", color: "#d84f52" },
  { name: "orange", color: "#e18a37" },
  { name: "yellow", color: "#efcc4c" },
  { name: "green", color: "#65a763" },
  { name: "turquoise", color: "#5cb8b0" },
  { name: "blue", color: "#507dc4" },
  { name: "purple", color: "#9370b5" },
  { name: "pink", color: "#e29fb8" },
  { name: "cream", color: "#f1e6ce" },
];
export type ColorPuzzle = { day: number; cells: number[] };
// A uniquely solvable Sudoku. Rotation, transpose and color permutations keep
// each day's board different without changing its single solution.
export function colorPuzzle(day: number) {
  const given =
    "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
  const solved =
    "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
  const transform = (text: string) => {
    const values = Array(81).fill(0);
    for (let i = 0; i < 81; i++) {
      let row = Math.floor(i / 9),
        col = i % 9;
      if (day % 2) [row, col] = [col, row];
      for (let turn = 0; turn < Math.floor(day / 2) % 4; turn++)
        [row, col] = [col, 8 - row];
      const value = Number(text[i]);
      values[row * 9 + col] = value ? ((value - 1 + (day % 9)) % 9) + 1 : 0;
    }
    return values;
  };
  return { clues: transform(given), solution: transform(solved) };
}
export function validColorPuzzle(value: unknown): value is ColorPuzzle {
  if (!value || typeof value !== "object") return false;
  const p = value as ColorPuzzle;
  if (
    !Number.isSafeInteger(p.day) ||
    p.day < 1 ||
    !Array.isArray(p.cells) ||
    p.cells.length !== 81
  )
    return false;
  const clues = colorPuzzle(p.day).clues;
  return p.cells.every(
    (v, i) =>
      Number.isInteger(v) && v >= 0 && v <= 9 && (!clues[i] || clues[i] === v),
  );
}
export function puzzleConflicts(cells: number[]) {
  const conflicts = new Set<number>();
  for (let i = 0; i < 81; i++) {
    if (!cells[i]) continue;
    const row = Math.floor(i / 9),
      col = i % 9;
    for (let j = i + 1; j < 81; j++) {
      if (cells[j] !== cells[i]) continue;
      const r = Math.floor(j / 9),
        c = j % 9;
      if (
        row === r ||
        col === c ||
        (Math.floor(row / 3) === Math.floor(r / 3) &&
          Math.floor(col / 3) === Math.floor(c / 3))
      ) {
        conflicts.add(i);
        conflicts.add(j);
      }
    }
  }
  return conflicts;
}
