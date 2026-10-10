export const paintColors = [
  { name: "Cherry", hex: "#e64d53" },
  { name: "Tangerine", hex: "#f49a42" },
  { name: "Sunshine", hex: "#f6d660" },
  { name: "Leaf", hex: "#67ab69" },
  { name: "Turquoise", hex: "#54bab1" },
  { name: "Sky", hex: "#67a9dc" },
  { name: "Indigo", hex: "#6266b0" },
  { name: "Violet", hex: "#ac7abc" },
  { name: "Rose", hex: "#e8a1bc" },
  { name: "Cream", hex: "#f4e8c8" },
];
export type BirdhousePaint = { body: string; roof: string };
export function validBirdhousePaint(value: unknown): value is BirdhousePaint[] {
  return (
    Array.isArray(value) &&
    value.length <= 12 &&
    value.every(
      (p) =>
        p &&
        [p.body, p.roof].every((c) => paintColors.some((v) => v.hex === c)),
    )
  );
}
export function birdhousePreview(paint: BirdhousePaint) {
  return `<svg viewBox="0 0 160 145" role="img" aria-label="Painted birdhouse"><path d="M37 54H123V132H37Z" fill="${paint.body}" stroke="#514735" stroke-width="3"/><path d="M20 59L80 14L140 59Z" fill="${paint.roof}" stroke="#514735" stroke-width="3"/><circle cx="80" cy="86" r="16" fill="#433d36"/><path d="M80 115V139" stroke="#8f6847" stroke-width="7"/></svg>`;
}
