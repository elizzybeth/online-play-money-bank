import type { State } from "./game";

export type FamilyStory = {
  scheduledDay: number;
  surgeryDay: number;
  awakeSeconds: number;
  called: boolean;
  escort: boolean;
  teaStep: number;
  shopGoal: boolean;
};
export const surgeryCost = 1_000_000;
export const shopCost = 10_000_000;
export function storyPhase(s: Pick<State, "day" | "familyStory">) {
  const a = s.familyStory;
  if (!a) return "saving" as const;
  if (a.shopGoal) return "shop" as const;
  if (s.day < a.surgeryDay) return "scheduled" as const;
  if (s.day === a.surgeryDay)
    return a.called ? ("coming-home" as const) : ("surgery" as const);
  return "recovery" as const;
}
export const momAway = (s: Pick<State, "day" | "familyStory">) =>
  !!s.familyStory && s.day === s.familyStory.surgeryDay;
export const recoveryDays = (s: Pick<State, "day" | "familyStory">) =>
  s.familyStory ? Math.max(0, s.day - s.familyStory.surgeryDay) : 0;
export const canTellMom = (s: State) =>
  !s.familyStory && s.cash + s.bank >= surgeryCost;
export const canVisitBea = (s: State) =>
  !!s.familyStory && !s.familyStory.shopGoal && recoveryDays(s) >= 5;
export function scheduleSurgery(s: State) {
  if (!canTellMom(s)) return false;
  const pocket = Math.min(s.cash, surgeryCost);
  s.cash -= pocket;
  s.bank -= surgeryCost - pocket;
  s.familyStory = {
    scheduledDay: s.day,
    surgeryDay: s.day + 1,
    awakeSeconds: 0,
    called: false,
    escort: false,
    teaStep: 0,
    shopGoal: false,
  };
  s.events.push("Told Mom we had $10,000. Paid for her surgery.");
  s.events.push("Mom called the hospital. Her surgery is tomorrow.");
  return true;
}
export function tickSurgery(s: State, seconds: number) {
  if (
    !s.awake ||
    !momAway(s) ||
    !s.familyStory ||
    s.familyStory.called ||
    !Number.isFinite(seconds) ||
    seconds < 0
  )
    return false;
  s.familyStory.awakeSeconds = Math.min(
    120,
    s.familyStory.awakeSeconds + seconds,
  );
  return s.familyStory.awakeSeconds >= 120;
}
export function answerMomCall(s: State) {
  const a = s.familyStory;
  if (!a || !momAway(s) || a.called || a.awakeSeconds < 120) return false;
  a.called = true;
  s.events.push(
    "Mom called after surgery. It went well. Auntie is bringing her home tonight.",
  );
  return true;
}
export function beginBeaWalk(s: State) {
  if (!canVisitBea(s)) return false;
  s.familyStory!.escort = true;
  s.events.push("Walked with Mom to Bea’s for tea.");
  return true;
}
export function acceptShopGoal(s: State) {
  if (
    !s.familyStory?.escort ||
    s.familyStory.teaStep < 6 ||
    s.familyStory.shopGoal
  )
    return false;
  s.familyStory.shopGoal = true;
  s.familyStory.escort = false;
  s.events.push(
    "Bea said Robertson needs $100,000 to save his shop. I decided to help.",
  );
  return true;
}
export function validFamilyStory(a: unknown, day: number): a is FamilyStory {
  if (!a || typeof a !== "object") return false;
  const x = a as FamilyStory;
  return (
    Number.isSafeInteger(x.scheduledDay) &&
    x.scheduledDay > 0 &&
    x.scheduledDay <= day &&
    x.surgeryDay === x.scheduledDay + 1 &&
    Number.isFinite(x.awakeSeconds) &&
    x.awakeSeconds >= 0 &&
    x.awakeSeconds <= 120 &&
    typeof x.called === "boolean" &&
    (day <= x.surgeryDay || x.called) &&
    (!x.called || (day >= x.surgeryDay && x.awakeSeconds === 120)) &&
    typeof x.escort === "boolean" &&
    typeof x.shopGoal === "boolean" &&
    Number.isSafeInteger(x.teaStep) &&
    x.teaStep >= 0 &&
    x.teaStep <= 6 &&
    (x.teaStep === 0 || day >= x.surgeryDay + 5) &&
    (!x.shopGoal ||
      (day >= x.surgeryDay + 5 && x.teaStep === 6 && !x.escort)) &&
    (!x.escort || day >= x.surgeryDay + 5)
  );
}
export const surgeryThoughts = [
  "What are they doing right now?",
  "I wish I could go with her.",
  "The house is too quiet without Mom.",
  "I keep thinking I heard her in the kitchen.",
  "Auntie said she would call. I should keep the phone close.",
  "I hope she is not scared.",
  "The trees still need water. I can do that while I wait.",
  "What if the phone rings while I am outside?",
  "I want to hear her voice.",
  "I wonder if they have started yet.",
  "I hope somebody is being nice to her.",
  "I have checked the phone about a hundred times.",
  "I wish waiting did not take this long.",
  "She told me to keep doing my normal things. I am trying.",
  "I do not want another quiet dinner.",
  "I keep looking at her empty chair.",
  "Please let it go okay.",
  "I can tell her about the garden when she comes back.",
  "I am glad Auntie is there.",
  "It is hard to think about anything else today.",
];
export const recoveryReplies = [
  "It will be a few days before I have all my energy back, love, but I am feeling good. I am so happy to be home.",
  "I feel a little better than yesterday. I am still taking it slowly. Come tell me about your day.",
  "A bit better again today, sweetheart. I keep noticing little things that are easier.",
  "I am getting stronger each day. I still need breaks, but that is all right.",
  "Better again, love. I am starting to feel like myself. Thank you for staying so close.",
  "I am feeling better each day. Even on a couch day, I can feel the difference.",
  "Another small bit better today. I have plans again, but I am trying not to rush them.",
  "I am still improving, sweetheart. We have come such a long way together.",
];
export const teaConversation = [
  {
    who: "Bea",
    text: "Come in, both of you! Sit down at my table. I have the good tea out. How are you doing, dear?",
    reply: "Mom: Much better. I still get tired, but every day is easier.",
  },
  {
    who: "Bea",
    text: "Oh, I am so happy to hear that. We have all been thinking of you. Milk or sugar? There is no hurry here.",
    reply: "Mom: Thank you, Bea. How is everyone else in town doing?",
  },
  {
    who: "Bea",
    text: "I’m afraid I have some bad news. Ol’ Man Robertson is going to lose his shop. His landlord just raised his rent, and tariffs have really hit him hard.",
    reply: "How much does he need?",
  },
  {
    who: "Bea",
    text: "One hundred thousand dollars. He has tried to keep it quiet. That shop means everything to him.",
    reply: "Well, that’s not so bad.",
  },
  {
    who: "Mom",
    text: "You have that look again, sweetheart. I know you want to help. We can think it through together.",
    reply: "He helped us when we needed it. I want to help him.",
  },
  {
    who: "Bea",
    text: "He would be astonished. And very grateful. Let us finish our tea first. Even rescuing a shop can wait for one cup.",
    reply: "Save Ol’ Man Robertson’s shop · $100,000",
  },
];
