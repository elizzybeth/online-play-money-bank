import type { HatId } from "./hats";
// Bonnet frames the face; ornaments rise above solid crowns. Sax outranks nest.
export const hatPriority = (id: HatId) =>
  id === "seedkeeper"
    ? -100
    : id === "alchemist"
      ? 100
      : id === "treasury"
        ? 90
        : id === "propeller"
          ? 80
          : id === "rabbit"
            ? 70
            : ["verdant", "trail", "inspector"].includes(id)
              ? 60
              : id === "lantern"
                ? 50
                : id === "harvest" || id === "dew" || id === "wizard"
                  ? 40
                  : 0;
export function arrangeHatStack<A extends { id: HatId; height: number }>(
  items: A[],
  level: number,
) {
  let y = 0;
  return [...items]
    .sort(
      (a, b) => hatPriority(a.id) - hatPriority(b.id) || a.height - b.height,
    )
    .map((item) => {
      const placed = { ...item, y };
      // Overlap crowns gently, never flatten a model or cap its unusual height.
      y += Math.min(
        item.height * 0.85,
        0.45 + Math.max(1, Math.min(3, level)) * 0.25,
      );
      return placed;
    });
}
