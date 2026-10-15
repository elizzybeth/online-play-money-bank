import type { State } from "./game";
import { purchasePrice } from "./meals";
export type SoyProduct = "burger" | "milk";
export const soyProducts = [
  {
    id: "burger" as const,
    name: "Impossible Burger",
    cost: 800,
    effect: "Grow twice as big for 120 seconds.",
  },
  {
    id: "milk" as const,
    name: "Soy milk",
    cost: 400,
    effect: "Add a Serious Hat above your stack for 120 seconds.",
  },
];
export function buySoy(s: State, id: SoyProduct) {
  const product = soyProducts.find((p) => p.id === id);
  if (!s.foundTVSeeds || !product || s.cash < purchasePrice(s, product.cost))
    return false;
  s.cash -= purchasePrice(s, product.cost);
  (s.soyEffects ??= {})[id] = 120;
  s.events.push(`Bought ${product.name} at Soyjak Party.`);
  return true;
}
