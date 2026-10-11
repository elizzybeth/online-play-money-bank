const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six"];
const count = (s: string) =>
  /^\d+$/.test(s)
    ? Number(s)
    : words.findIndex((w) => w.toLowerCase() === s.toLowerCase());
export function childReport(moved: number, total: number, religion: string) {
  return `${words[moved]} ${moved === 1 ? "Child" : "Children"} of ${religion} left the terraces to build lavish mansions. ${words[total]} of six now ${total === 1 ? "lives" : "live"} at the mountain’s foot.`;
}
/** Consolidate same-day transitions, including older saved journal wording. */
export function normalizeChildReports(text: string) {
  const pattern =
    /\b(\d+|One|Two|Three|Four|Five|Six) (?:Child|Children) of (Massive Investment Arms|Bridge to Total Freedom|Breath of Fire) left the terraces to build lavish mansions\.\s*(\d+|One|Two|Three|Four|Five|Six) of six now (?:lives|live) at the mountain[’']s foot\./gi;
  const reports = new Map<
    string,
    { moved: number; total: number; seen: Set<number> }
  >();
  for (const match of text.matchAll(pattern)) {
    const total = count(match[3]),
      moved = count(match[1]);
    if (total < 1 || total > 6 || moved < 1 || moved > 6) continue;
    const r = reports.get(match[2]) ?? {
      moved: 0,
      total: 0,
      seen: new Set<number>(),
    };
    if (!r.seen.has(total)) r.moved += moved;
    r.total = Math.max(r.total, total);
    r.seen.add(total);
    reports.set(match[2], r);
  }
  const emitted = new Set<string>();
  return text
    .replace(pattern, (original, _moved, religion) => {
      const r = reports.get(religion);
      if (!r) return original;
      if (emitted.has(religion)) return "";
      emitted.add(religion);
      return childReport(Math.min(r.moved, r.total), r.total, religion);
    })
    .replace(/\n(?:[ \t]*\n){2,}/g, "\n\n")
    .trim();
}
