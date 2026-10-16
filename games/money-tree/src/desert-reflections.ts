import type { State } from "./game";
import { mansionCount } from "./millionaire";
// Five sets of twenty; eligibility follows the player's actual discoveries.
export const desertReflections = [
  [
    "sand",
    [
      "The desert looks like somebody forgot to finish the garden.",
      "All this dust, and a mountain that grows money. What a strange place.",
      "The road seems much more certain of its destination than I am.",
      "There is enough empty space here for an enormous silence.",
      "The mountain looks cultivated. Everything below it looks abandoned.",
      "The wind has no interest in my savings account.",
      "I miss the small familiar noises of Willow Lane.",
      "This sand has probably outlasted every grand plan anyone made here.",
      "How did a fertile mountain end up in the middle of this dry country?",
      "The horizon makes every person look temporary.",
      "There is a lot of room here to get lost in a thought.",
      "The road is neat; the desert refuses to be.",
      "I wonder what this place looked like before anybody gave it a price.",
      "The shadows feel larger than the things casting them.",
      "The cactus seems comfortable here. I am still deciding.",
      "Those branching trees look like hands asking the sky a question.",
      "Nothing about this landscape says sensible investment.",
      "A little green on the terraces feels almost theatrical.",
      "The mountain stands there like it knows something I do not.",
      "Home is smaller than this place, but much easier to understand.",
    ],
  ],
  [
    "children",
    [
      "All the Children seem to have the same face.",
      "Do they buy those matching clothes together?",
      "If I stay here long enough, will I begin to look like them?",
      "I keep thinking I recognize somebody, and then there are six of them.",
      "Perhaps belonging is easier when nobody stands out.",
      "I would like to belong without losing my own face.",
      "They sound cheerful. I cannot tell whether they sound convinced.",
      "The same smile appears in rather a lot of places.",
      "I wonder whether they recognize one another more easily than I do.",
      "There must be different people inside those matching outfits.",
      "Their certainty makes my questions feel unusually loud.",
      "Would Mom recognize me if I started dressing like that?",
      "Sameness looks peaceful from a distance and odd up close.",
      "Everyone calls them Children. They do not look particularly young.",
      "I wonder whether anyone here ever disagrees about lunch.",
      "A matching coat would not make my worries match theirs.",
      "They move as if they already know how this story ends.",
      "I have never met so many familiar strangers.",
      "There is a difference between finding a community and becoming a copy.",
      "Perhaps they are looking at me and wondering why I look different.",
    ],
  ],
  [
    "tithe",
    [
      "Ten percent is a small phrase for a lot of harvests.",
      "The soil asks for no watering. The community asks for a tenth.",
      "Would I earn more at home, or just feel more independent?",
      "A generous contribution can still be difficult to afford.",
      "I agreed to this. That does not stop me doing the arithmetic again.",
      "Fertile soil and obligations seem to grow together here.",
      "I wonder how much of my future I have promised away.",
      "Every tenth bill has a destination before it reaches my pocket.",
      "The mountain is productive. Is productive the same thing as good?",
      "I could plant more, but then I would owe more too.",
      "Maybe the easy harvest is worth the difficult question.",
      "Helping a community should feel different from paying admission.",
      "I would like to know exactly what my contribution builds.",
      "At home I water the trees myself. Here somebody else sets the terms.",
      "A tenth leaves nine tenths. I keep reminding myself of that.",
      "I am not sure whether my doubts are stinginess or caution.",
      "The mountain gives me time back. What is that time worth?",
      "I hope generosity does not require me to stop asking questions.",
      "Even free seeds can lead to an expensive commitment.",
      "Perhaps I should count both the money and the breathing room.",
    ],
  ],
  [
    "mansions",
    [
      "That house could swallow our whole street.",
      "Those columns are larger than any sensible need I can imagine.",
      "How many rooms can one lonely person use?",
      "The architecture is beautiful. The amount of it is bewildering.",
      "I wonder if I will ever afford anything like that.",
      "The windows promise a lot of life. Is there any inside?",
      "An enormous house must make a small silence echo.",
      "A yacht in the desert seems like a particularly expensive question.",
      "The sports car is very shiny. The road is still just a road.",
      "I used to think a bigger room would solve everything.",
      "Does wealth feel different once everybody can see it?",
      "The balcony has a better view than anyone needs twice.",
      "Those towers look like they are competing with the mountain.",
      "How much of that house came from our ten-percent contributions?",
      "I hope the owner has somebody to invite over.",
      "An empty mansion sounds less comfortable than our crowded little home.",
      "Would I want this house if nobody else could see it?",
      "There is a lot of stone between the owner and their neighbors.",
      "Each new mansion makes the desert look a little less like itself.",
      "Perhaps enough is a harder number to find than a million.",
    ],
  ],
  [
    "home",
    [
      "I have a mansion now. I still feel like me.",
      "The mortgage turns tomorrow into a very long list of payments.",
      "I bought space, but I still have to decide how to live in it.",
      "Mom is happy in our little house. I can still come home.",
      "I hope this house becomes a home before it becomes a burden.",
      "A front door this impressive deserves someone kind behind it.",
      "The neighbors look no less strange from my own doorstep.",
      "I can afford the first day. That is not the same as all the days.",
      "Those windows will look warmer with something inside.",
      "Mom’s chickens and birdhouses are waiting back home.",
      "I wonder what our old street would think of this.",
      "Owning a tower has not made me any taller.",
      "There is room here for more than furniture. I hope there is room for doubt.",
      "The house is mine today. Tomorrow still has its own arithmetic.",
      "I want this place to feel lived in rather than displayed.",
      "A fancy chair might be nice. A conversation would be better.",
      "I do not want a big house to make me a small neighbor.",
      "The moving boxes were ordinary. That was reassuring.",
      "Perhaps a home is what happens after the purchase.",
      "The desert is still the desert, even from a mansion window.",
    ],
  ],
] as const;
export function chooseDesertReflection(s: State, random = Math.random) {
  const a = (s.adventure ??= {});
  const eligible = desertReflections
    .flatMap(([kind, lines], group) =>
      lines.map((text, i) => ({ kind, text, id: group * 20 + i })),
    )
    .filter(
      (r) =>
        r.kind === "sand" ||
        (r.kind === "children" &&
          !!s.millionaire?.member &&
          (!!s.millionaire.titheAccepted ||
            !!s.millionaire.chats["visited-summit"] ||
            Object.keys(s.millionaire.chats).some((k) =>
              k.startsWith("child-"),
            ))) ||
        (r.kind === "tithe" && !!s.millionaire?.titheAccepted) ||
        (r.kind === "mansions" &&
          mansionCount(s.millionaire) > 0 &&
          (r.id !== 64 ||
            (s.housing?.status !== "owned" && s.cash + s.bank < 100000000))) ||
        (r.kind === "home" &&
          s.housing?.status === "owned" &&
          (r.id !== 81 || s.housing.mortgage)),
    );
  let choices = eligible.filter((r) => !a.reflections?.includes(r.id));
  if (!choices.length) {
    a.reflections = [];
    choices = eligible;
  }
  const choice =
    choices[
      Math.min(
        choices.length - 1,
        Math.floor(Math.max(0, random()) * choices.length),
      )
    ];
  (a.reflections ??= []).push(choice.id);
  return choice.text;
}
export function shuffledAnswers<T>(values: T[], random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(Math.max(0, random()) * (i + 1)));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// The four-metre-wide onward lane, from the grove clearing to the mountain foot.
export function onMillionaireApproach(position: { x: number; z: number }) {
  return (
    Math.abs(position.x - 34) <= 2 && position.z < -144 && position.z > -340
  );
}
