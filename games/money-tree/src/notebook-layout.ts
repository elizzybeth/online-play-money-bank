/** Wrap before pagination so no printed line crosses the notebook's binding. */
export function notebookLines(
  paragraphs: string[],
  width: number,
  measure: (s: string) => number,
) {
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;
    if (lines.length) lines.push("");
    let line = "";
    for (const word of paragraph.trim().split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (measure(next) <= width) {
        line = next;
        continue;
      }
      if (line) lines.push(line);
      if (measure(word) <= width) {
        line = word;
        continue;
      }
      line = "";
      for (const character of word) {
        if (line && measure(line + character) > width) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}
export function notebookSpreads(lines: string[], rows: number) {
  const capacity = Math.max(2, rows) * 2;
  return Array.from(
    { length: Math.max(1, Math.ceil(lines.length / capacity)) },
    (_, i) => [
      lines.slice(i * capacity, i * capacity + capacity / 2),
      lines.slice(i * capacity + capacity / 2, (i + 1) * capacity),
    ],
  );
}
