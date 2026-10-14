import type { State } from "./game";
import { shopCost } from "./family-story";

export const robertsonHistory = [
  "Dad started Robertsons back in the 1800s. He had a wife and three children to provide for. This counter was the heart of our family’s life.",
  "The town was different then. Lots more farms, and fewer people living in town. But those farms needed tools, seed, feed and all sorts of farming goods. There was more demand than you might think.",
  "We used to sell penny candy. Children would come in with a coin held tight in their fist and spend ages deciding. Dad never hurried them.",
  "I started working behind this counter when I was just five years old. Dad would be balancing the books, and I would help the customers. I needed a little stool to see over the counter.",
  "A general store, that’s what this is. A bit of everything, and somebody who knows your name. You don’t see the old general-store idea around much anymore.",
  "The shop still makes enough to keep up my own farm. But there’s not much left at the end of the month to put away. There hasn’t been for a long time.",
  "When COVID hit, I had to sell the property and start renting it back. That got me out of the worst of my debt. It hurt to let the building go, but I thought it would keep the doors open.",
  "Now I’m still living hand-to-mouth, with the rent going up and everything costing more. I can’t imagine where I’m going to find enough to save the store. I just keep opening the door each morning.",
];
export function shopRescueActive(s: State) {
  return !!s.familyStory?.shopGoal && !s.familyStory.shopSaved;
}
export function shopProgress(s: State) {
  const saved = s.cash + s.bank;
  return { saved, remaining: Math.max(0, shopCost - saved) };
}
export function canSaveShop(s: State) {
  return shopRescueActive(s) && shopProgress(s).remaining === 0;
}
export function nextRobertsonHistory(s: State) {
  if (!shopRescueActive(s)) return null;
  const a = s.familyStory!;
  const step = a.shopStoryStep ?? 0;
  a.shopStoryStep = (step + 1) % robertsonHistory.length;
  s.events.push(`Robertson remembered: ${robertsonHistory[step]}`);
  return robertsonHistory[step];
}
export function chooseShopPlan(s: State, tell: boolean) {
  if (!shopRescueActive(s)) return false;
  s.familyStory!.shopPlan = tell ? "told" : "secret";
  s.events.push(
    tell
      ? "Told Robertson I’m fighting to save his store."
      : "Decided to keep saving Robertson’s store a surprise.",
  );
  return true;
}
export function reportShopProgress(s: State, exact: boolean) {
  if (!shopRescueActive(s) || s.familyStory!.shopPlan !== "told") return false;
  const { saved, remaining } = shopProgress(s);
  s.events.push(
    exact
      ? `Told Robertson exactly: $${(saved / 100).toFixed(2)} saved, $${(remaining / 100).toFixed(2)} left to save his store.`
      : "Told Robertson I’m still working on saving his store, without giving numbers.",
  );
  return true;
}
export function saveRobertsons(s: State) {
  if (!canSaveShop(s)) return false;
  const pocket = Math.min(s.cash, shopCost);
  s.cash -= pocket;
  s.bank -= shopCost - pocket;
  s.familyStory!.shopSaved = true;
  s.events.push(
    s.familyStory!.shopPlan === "told"
      ? "Brought Robertson $100,000 and saved his store. He was overjoyed."
      : "Surprised Robertson with $100,000 and saved his store. He could hardly believe it.",
  );
  return true;
}
