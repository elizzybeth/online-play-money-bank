import { withinProperty, type State } from "./game";

export type MomHomeStory = {
  mansionStage?: number;
  gardenStage?: number;
  gardenDay?: number;
};
export const mansionConversation = [
  {
    text: "You bought a mansion? Why, love?",
    replies: [
      "I wanted to give you something wonderful.",
      "I thought a bigger house would mean a better life.",
      "I wanted to know what it felt like to make it.",
      "Honestly, Mom, I’m not sure anymore.",
    ],
  },
  {
    text: "Oh, sweetheart. I’m happy here at home.",
    replies: [
      "You could have your own room, and all the space you want.",
      "We could bring the chickens and your birdhouses with us.",
      "I just want to take care of you. Would you try it, for me?",
      "The view is beautiful. Maybe you’d love it if you saw it.",
    ],
  },
  {
    text: "I love our little house, the chickens, and the birdhouses. This is my home, love. I don’t want to move.",
    replies: [
      "Then this is where you should be. I love you, Mom.",
      "You don’t have to move. I’ll keep coming home.",
      "All right. Maybe bigger isn’t the same as better.",
    ],
  },
];
export const gardenConversation = [
  {
    text: "Oh, sweetheart, look at the garden! It looks beautiful.",
    replies: [
      "I wanted to grow something just for you.",
      "Flowers for you, and vegetables for us to cook together.",
      "I thought our little home deserved a beautiful garden.",
    ],
  },
  {
    text: "It’s lovely, love. But can we afford it? Those beds used to grow money.",
    replies: [
      "You’re worth it, Mom.",
      "We’ll find a way. You’re worth it.",
      "Not everything has to make money. You’re worth it, Mom.",
    ],
  },
];
export function canTellMomAboutMansion(s: State) {
  return (
    s.housing?.status === "owned" && (s.momHomeStory?.mansionStage ?? 0) < 4
  );
}
export function homeGardenReplanted(s: State) {
  return s.plots.some((p, i) => {
    const x = p.x ?? -20 + i * 2,
      z = p.z ?? 19;
    return (
      !!p.crop &&
      !p.mountain &&
      !p.community &&
      !p.meteor &&
      p.soilFilled !== false &&
      ["planted", "growing", "ready"].includes(p.stage) &&
      withinProperty(x, z)
    );
  });
}
export function beginMansionConversation(s: State) {
  if (!canTellMomAboutMansion(s)) return false;
  (s.momHomeStory ??= {}).mansionStage ||= 1;
  return true;
}
export function replyToMom(
  s: State,
  kind: "mansion" | "garden",
  choice: number,
) {
  const story = s.momHomeStory;
  const stage = kind === "mansion" ? story?.mansionStage : story?.gardenStage;
  const chapters =
    kind === "mansion" ? mansionConversation : gardenConversation;
  if (
    !stage ||
    !Number.isInteger(choice) ||
    !chapters[stage - 1]?.replies[choice]
  )
    return false;
  s.events.push(
    `Talking with Mom about ${kind === "mansion" ? "the mansion" : "our garden"}, I said: ${chapters[stage - 1].replies[choice]}`,
  );
  if (kind === "mansion") story!.mansionStage = stage + 1;
  else {
    story!.gardenStage = stage + 1;
    if (story!.gardenStage === 3) story!.gardenDay = s.day;
  }
  return true;
}
export function validMomHomeStory(
  value: unknown,
  day: number,
): value is MomHomeStory | undefined {
  if (value === undefined) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as MomHomeStory;
  return (
    (v.mansionStage === undefined ||
      (Number.isInteger(v.mansionStage) &&
        v.mansionStage >= 0 &&
        v.mansionStage <= 4)) &&
    (v.gardenStage === undefined ||
      (Number.isInteger(v.gardenStage) &&
        v.gardenStage >= 0 &&
        v.gardenStage <= 3)) &&
    (v.gardenDay === undefined ||
      (Number.isSafeInteger(v.gardenDay) &&
        v.gardenDay >= 1 &&
        v.gardenDay <= day &&
        v.gardenStage === 3))
  );
}
