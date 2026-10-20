import type { State } from "./game";
export const ingredients = [
  "eggs",
  "rice",
  "beans",
  "tortillas",
  "pepper",
  "tomato",
  "black beans",
  "red beans",
  "pinto beans",
  "corn",
  "carrot",
  "pumpkin",
  "cabbage",
  "beet",
  "lettuce",
  "radish",
  "onion",
  "eggplant",
  "strawberry",
  "potato",
] as const;
export type Ingredient = (typeof ingredients)[number];
export type FoodBuff = { recipe: number; remaining: number };
export type Meal = {
  name: string;
  seconds: number;
  power: "garden" | "discount" | "seed" | "harvest" | "speed";
  effect: string;
};
export const meals: Record<number, Meal> = {
  1: {
    name: "Golden omelette",
    seconds: 30,
    power: "speed",
    effect: "Move 20% faster",
  },
  2: {
    name: "Fried rice",
    seconds: 30,
    power: "garden",
    effect: "Plant, water and fertilize in one step",
  },
  3: {
    name: "Tamago sushi",
    seconds: 60,
    power: "discount",
    effect: "25% off shop purchases",
  },
  4: {
    name: "Slow-simmered beans",
    seconds: 30,
    power: "harvest",
    effect: "20% more money from trees",
  },
  5: {
    name: "Shakshuka",
    seconds: 60,
    power: "harvest",
    effect: "20% more money from trees",
  },
  6: {
    name: "Moros y cristianos",
    seconds: 60,
    power: "speed",
    effect: "Move 20% faster",
  },
  7: {
    name: "Better fried rice",
    seconds: 60,
    power: "garden",
    effect: "Plant, water and fertilize in one step",
  },
  8: {
    name: "Toasted tortilla chips",
    seconds: 30,
    power: "seed",
    effect: "50% chance to keep a seed when planting",
  },
  9: {
    name: "Huevos rancheros",
    seconds: 60,
    power: "discount",
    effect: "25% off shop purchases",
  },
  10: {
    name: "Crispy rice wraps",
    seconds: 60,
    power: "garden",
    effect: "Plant, water and fertilize in one step",
  },
  11: {
    name: "Breakfast burrito",
    seconds: 60,
    power: "seed",
    effect: "50% chance to keep a seed when planting",
  },
  12: {
    name: "Bean tacos",
    seconds: 60,
    power: "harvest",
    effect: "20% more money from trees",
  },
  13: {
    name: "Egg and bean tostadas",
    seconds: 120,
    power: "discount",
    effect: "25% off shop purchases",
  },
  14: {
    name: "Moros burrito",
    seconds: 120,
    power: "speed",
    effect: "Move 20% faster",
  },
  15: {
    name: "Better breakfast burrito",
    seconds: 180,
    power: "seed",
    effect: "50% chance to keep a seed when planting",
  },
};
// Preserve the original fifteen recipes; vegetables add combinations without
// changing their bit positions in existing saves.
for (let mask = 16; mask < 64; mask++) {
  const pepper = !!(mask & 16),
    tomato = !!(mask & 32),
    base = mask & 15;
  const name =
    pepper && tomato
      ? base & 8
        ? "Garden fajitas"
        : base & 1
          ? "Garden shakshuka"
          : "Pepper and tomato stew"
      : pepper
        ? base & 2
          ? "Stuffed peppers"
          : base & 1
            ? "Pepper omelette"
            : "Roasted pepper supper"
        : base & 8
          ? "Tomato tostadas"
          : base & 2
            ? "Tomato rice"
            : "Slow-roasted tomato supper";
  meals[mask] = {
    name,
    seconds: 180,
    power: base & 1 ? "harvest" : base & 2 ? "garden" : "seed",
    effect:
      base & 1
        ? "20% more money from trees"
        : base & 2
          ? "Plant, water and fertilize in one step"
          : "50% chance to keep a seed when planting",
  };
}
meals[64] = {
  name: "Market garden supper",
  seconds: 180,
  power: "harvest",
  effect: "20% more money from trees",
};
export function mealMask(s: State) {
  if (ingredients.slice(6).some((k) => (s.groceries?.[k] ?? 0) > 0)) return 64;
  return ingredients
    .slice(0, 6)
    .reduce((n, k, i) => n + ((s.groceries?.[k] ?? 0) > 0 ? 1 << i : 0), 0);
}
export function foodPower(s: State, power: Meal["power"]) {
  return (
    !!s.foodBuff &&
    s.foodBuff.remaining > 0 &&
    meals[s.foodBuff.recipe]?.power === power
  );
}
export function purchasePrice(s: State, cents: number) {
  return foodPower(s, "discount") ? Math.round(cents * 0.75) : cents;
}
export function buyGrocery(s: State, item: Ingredient) {
  const cost = purchasePrice(s, 100);
  if (!ingredients.includes(item) || s.cash < cost) return false;
  s.cash -= cost;
  s.groceries ??= {};
  s.groceries[item] = (s.groceries[item] ?? 0) + 1;
  s.events.push(`Bought ${item} for cooking with Mom.`);
  return true;
}
export function startMeal(s: State) {
  const recipe = mealMask(s);
  if (!recipe || s.pendingMeal) return 0;
  ingredients.forEach((k, i) => {
    if (
      (recipe === 64 && (s.groceries?.[k] ?? 0) > 0) ||
      (recipe !== 64 && i < 6 && recipe & (1 << i))
    )
      s.groceries![k]!--;
  });
  s.pendingMeal = recipe;
  return recipe;
}
export function finishMeal(s: State) {
  const recipe = s.pendingMeal;
  if (!recipe || !meals[recipe]) return;
  s.foodBuff = { recipe, remaining: meals[recipe].seconds };
  delete s.pendingMeal;
  s.events.push(
    `Cooked and shared ${meals[recipe].name} with Mom. ${meals[recipe].effect}.`,
  );
}
export function tickFood(s: State, dt: number) {
  if (s.foodBuff) {
    s.foodBuff.remaining = Math.max(0, s.foodBuff.remaining - dt);
    if (!s.foodBuff.remaining) delete s.foodBuff;
  }
}
export function validFood(s: any) {
  return (
    (s.groceries === undefined ||
      (s.groceries &&
        typeof s.groceries === "object" &&
        !Array.isArray(s.groceries) &&
        Object.entries(s.groceries).every(
          ([k, v]) =>
            ingredients.includes(k as Ingredient) &&
            Number.isSafeInteger(v) &&
            Number(v) >= 0,
        ))) &&
    (s.pendingMeal === undefined ||
      (Number.isInteger(s.pendingMeal) && !!meals[s.pendingMeal])) &&
    (s.foodBuff === undefined ||
      (s.foodBuff &&
        Number.isInteger(s.foodBuff.recipe) &&
        !!meals[s.foodBuff.recipe] &&
        Number.isFinite(s.foodBuff.remaining) &&
        s.foodBuff.remaining > 0 &&
        s.foodBuff.remaining <= meals[s.foodBuff.recipe].seconds))
  );
}
