import { journalContext, type JournalContext } from "./journal";
import type { State } from "./game";
import { hats } from "./hats";
import { passages } from "./journal-passages";
export const emotionNames = [
  "worry",
  "hope",
  "confidence",
  "frustration",
  "connection",
  "fatigue",
] as const;
export type Emotions = Record<(typeof emotionNames)[number], number>;
export type NarrativeMemory = {
  version: 1;
  seed: number;
  emotions: Emotions;
  used: string[];
  lastMom: "good" | "tired" | null;
  lastMomDay: number;
  firstHarvestWritten: boolean;
  goalWritten?: boolean;
};
const initial: Emotions = {
  worry: 45,
  hope: 20,
  confidence: 10,
  frustration: 10,
  connection: 30,
  fatigue: 0,
};
export function newNarrativeMemory(seed: number): NarrativeMemory {
  return {
    version: 1,
    seed: seed >>> 0,
    emotions: { ...initial },
    used: [],
    lastMom: null,
    lastMomDay: 0,
    firstHarvestWritten: false,
    goalWritten: false,
  };
}
export function validNarrativeMemory(value: unknown): value is NarrativeMemory {
  if (!value || typeof value !== "object") return false;
  const m = value as NarrativeMemory;
  return (
    m.version === 1 &&
    Number.isSafeInteger(m.seed) &&
    m.seed >= 0 &&
    m.seed <= 4294967295 &&
    !!m.emotions &&
    emotionNames.every(
      (k) =>
        Number.isFinite(m.emotions[k]) &&
        m.emotions[k] >= 0 &&
        m.emotions[k] <= 100,
    ) &&
    Array.isArray(m.used) &&
    m.used.length <= 160 &&
    m.used.every(
      (x) => typeof x === "string" && /^[a-zA-Z0-9-]+:\d+$/.test(x),
    ) &&
    [null, "good", "tired"].includes(m.lastMom) &&
    Number.isSafeInteger(m.lastMomDay) &&
    m.lastMomDay >= 0 &&
    typeof m.firstHarvestWritten === "boolean" &&
    (m.goalWritten === undefined || typeof m.goalWritten === "boolean")
  );
}
const dollars = (n: number) => `$${(n / 100).toFixed(2)}`;
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const count = (c: JournalContext, prefix: string) =>
  c.events.filter((e) => e.startsWith(prefix)).length;
const has = (c: JournalContext, pattern: RegExp) =>
  c.events.some((e) => pattern.test(e));
const powers: Record<string, string> = {
  cap: "plant a little faster and have a one-in-two chance to save a seed at harvest",
  propeller: "walk and run faster",
  rabbit: "jump",
  inspector: "see how all my trees are growing",
  hardhat: "plant seeds faster",
  wizard: "help the trees grow faster while I wear it",
  rain: "water new seeds automatically when I have my watering can",
  banker: "get an extra dollar from a tree, up to seven dollars",
  beekeeper:
    "get at least six dollars from a fertilized tree if I wear it when the tree finishes growing",
  lantern: "reach things from farther away and use its light",
};
export function constructJournal(
  c: JournalContext,
  prior = newNarrativeMemory(c.seed),
) {
  const memory = structuredClone(prior),
    e = memory.emotions;
  const first = c.firstHarvest && !prior.firstHarvestWritten;
  const goal = c.remaining === 0 && !prior.goalWritten;
  const good = has(c, /^Mom had energy for/),
    tired = has(c, /^Mom was exhausted/),
    cough = has(c, /^Heard Mom coughing/);
  const chatted =
    good ||
    tired ||
    has(c, /^(Talked with Mom|Checked in with Mom|Heard Mom:)/);
  const planted = count(c, "Planted"),
    watered = count(c, "Watered"),
    fed = count(c, "Fed"),
    work = planted + watered + fed + count(c, "Harvested");
  const yesterday = c.history.find((m) => m.day === c.day - 1);
  const spentDown =
    !!yesterday && c.available < yesterday.available && has(c, /^Bought/);
  const purchased = has(c, /^Bought/),
    neighbors = [
      ...new Set(
        c.events
          .filter((x) => x.startsWith("Stopped to talk with "))
          .map((x) =>
            x
              .slice(21)
              .replace(/\.$/, "")
              .replace("Thread & Thimble", "the hat-shop owner"),
          ),
      ),
    ];
  // Carry feelings across days, easing towards a baseline. Today modifies rather than replaces them.
  for (const k of emotionNames) e[k] += (initial[k] - e[k]) * 0.15;
  if (tired) e.worry += 13;
  if (cough) e.worry += 6;
  if (good) {
    e.worry -= 9;
    e.hope += 8;
  }
  if (chatted) e.connection += 8;
  else if (c.day > 1) e.connection -= 5;
  if (neighbors.length) e.connection += 4;
  if (first) {
    e.hope += 28;
    e.confidence += 20;
  } else if (c.earned) {
    e.hope += 9;
    e.confidence += 7;
    e.frustration -= 7;
  }
  if (work) e.confidence += Math.min(8, work);
  if (!c.earned && purchased) {
    e.frustration += 10;
    e.hope -= 3;
  }
  if (spentDown) e.frustration += 8;
  if (!c.earned && !work && c.hasHarvested) e.frustration += 8;
  e.fatigue = Math.min(100, work * 5);
  for (const k of emotionNames)
    e[k] = Math.round(Math.max(0, Math.min(100, e[k])));
  let seed = (memory.seed ^ Math.imul(c.day, 2654435761)) >>> 0;
  const random = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  const slots: Record<string, string> = {
    income: dollars(c.earned),
    total: dollars(c.available),
    planted: `${planted} ${planted === 1 ? "seed" : "seeds"}`,
    watered: `${watered} ${watered === 1 ? "tree" : "trees"}`,
    fed: `${fed} ${fed === 1 ? "tree" : "trees"}`,
    neighbors: neighbors.join(", ").replace(/, ([^,]+)$/, " and $1"),
  };
  const selections: string[] = [],
    paragraphs: string[] = [];
  const recentPages = c.previous.slice(-8).map(normalize);
  const repeatsPhrase = (text: string) => {
    const words = normalize(text).split(" ");
    return words.some(
      (_, i) =>
        i + 7 <= words.length &&
        recentPages.some((page) =>
          page.includes(words.slice(i, i + 7).join(" ")),
        ),
    );
  };
  const choose = (
    family: string,
    options = passages[family],
    required = false,
  ) => {
    if (!options?.length) throw Error("Unknown journal family " + family);
    const candidates = options.map((text, i) => ({
      id: `${family}:${i}`,
      text: text.replace(/\{(\w+)\}/g, (_, k) => {
        if (!(k in slots)) throw Error("Unknown slot " + k);
        return slots[k];
      }),
    }));
    const existing = paragraphs.map(normalize);
    const repeatedWithinPage = (text: string) => {
      const words = normalize(text).split(" ");
      return words.some(
        (_, i) =>
          i + 3 <= words.length &&
          existing.some((p) =>
            ` ${p} `.includes(` ${words.slice(i, i + 3).join(" ")} `),
          ),
      );
    };
    const fresh = candidates.filter(
      (p) =>
        !repeatsPhrase(p.text) &&
        !paragraphs.includes(p.text) &&
        !repeatedWithinPage(p.text),
    );
    if (!fresh.length && !required) return false;
    const pool = fresh.length ? fresh : candidates;
    const unused = pool.filter((p) => !memory.used.includes(p.id));
    let choices = unused.length
      ? unused
      : [...pool]
          .sort(
            (a, b) =>
              memory.used.lastIndexOf(a.id) - memory.used.lastIndexOf(b.id),
          )
          .slice(0, Math.max(1, Math.ceil(pool.length / 2)));
    const picked = choices[Math.floor(random() * choices.length)];
    selections.push(picked.id);
    memory.used.push(picked.id);
    paragraphs.push(picked.text);
    return true;
  };
  // Choose a central subject. The first real harvest replaces all pre-harvest doubt.
  if (goal) {
    choose("goal", undefined, true);
    memory.goalWritten = true;
    if (first) memory.firstHarvestWritten = true;
  } else if (first) {
    choose("first", undefined, true);
    memory.firstHarvestWritten = true;
  } else if (c.earned) choose("income", undefined, true);
  else if (has(c, /^Sold my pretend coin/))
    choose(
      "sigmaSale",
      [
        "I sold the coin and got money back in my pocket. I can stop watching the tracker for a while.",
        "My coins are sold now. I want to get back to something I can plant and water.",
        "I turned the coin holding into pocket money. I need to think about what to save before I spend it.",
        "Chad bought my coins back. Holding real bills feels different from watching that number.",
        "I sold my coins today. I am glad I could get the money out when I wanted it.",
        "The coins are gone from my holding. I keep checking my pocket to make sure the money is there.",
        "I sold what I had in the coin. At least I know how much money I actually have now.",
        "My money came out of the coin today. I would rather count it at home than listen to another speech from Chad.",
      ],
      true,
    );
  else if (c.hasHarvested) {
    if (!choose("noIncome")) choose("quiet", undefined, true);
  } else if (has(c, /^Bought five mysterious seeds/))
    choose("unproven", undefined, true);
  else if (c.garden.growing + c.garden.ready > 0)
    choose("waiting", undefined, true);
  else if (c.garden.planted > 0) choose("dry", undefined, true);
  else if (c.boughtSeeds) {
    const family = c.inventory.seeds > 0 ? "unstarted" : "uncertain";
    if (!choose(family)) choose("quiet", undefined, true);
  } else if (!c.events.length) choose("quiet", undefined, true);
  else choose("before", undefined, true);
  // Observations are the only source of claims about Mom's health and activity.
  const momParagraphs = paragraphs.length;
  if (tired) {
    choose(
      has(c, /^Mom was exhausted in bed/)
        ? "momBed"
        : cough
          ? "cough"
          : "tired",
    );
    if (memory.lastMom === "good" && memory.lastMomDay === c.day - 1)
      choose("setback");
  } else if (good) {
    const activity = c.events.find((x) => x.startsWith("Mom had energy for"))!;
    const family = /birdhouses/.test(activity)
      ? "birdhouses"
      : /painting/.test(activity)
        ? "painting"
        : /reading/.test(activity)
          ? "reading"
          : /garden/.test(activity)
            ? "garden"
            : /mending/.test(activity)
              ? "mending"
              : /jigsaw/.test(activity)
                ? "puzzles"
                : /music/.test(activity)
                  ? "music"
                  : /letter/.test(activity)
                    ? "letters"
                    : /feeding/.test(activity)
                      ? "feeding"
                      : "cooking";
    choose(family);
    if (family === "garden" && has(c, /^Heard Mom:.*ugly.*(?:thank|Thank)/))
      choose("ugly");
    else if (memory.lastMom === "tired" && memory.lastMomDay === c.day - 1)
      choose("relief");
  } else if (chatted) choose("greeting");
  else if (c.day > 1 && random() < 0.45) choose("missed");
  if (
    !first &&
    (good || tired) &&
    paragraphs.length > momParagraphs &&
    random() < 0.4
  ) {
    const momBlock = paragraphs.splice(momParagraphs);
    paragraphs.unshift(...momBlock);
  }
  if (good || tired) {
    memory.lastMom = tired ? "tired" : "good";
    memory.lastMomDay = c.day;
  }
  // One extra subject, not a full activity log. Discoveries outrank routine chores.
  const hat =
    hats.find((h) =>
      has(
        c,
        new RegExp(
          `^Bought the ${h.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.$`,
        ),
      ),
    ) ??
    hats.find((h) => c.events.some((x) => x.startsWith(`Used my ${h.name} `)));
  const limit = paragraphs.length < 4;
  if (limit) {
    if (has(c, /^Named my pretend coin/))
      choose("sigmaCoin", [
        "Chad let me name a coin. I wanted to name something besides a tree for once. I still do not know if his idea is any good.",
        "I picked a name for Chad’s coin. That part was fun. Deciding what to do with my money is harder.",
        "There is a coin with a name I chose now. Mom needs real money, so I have to remember the difference.",
        "Chad says my coin could be a big deal. He says that about his coffee too.",
        "Naming the coin made it feel like mine. That does not mean it will go up.",
        "I chose a coin name at Grindset. I wish knowing what happens next was as easy as naming it.",
        "My coin has a name now. It looks strange seeing something I made up on that little tracker.",
        "Chad gave me a coin to name. I am pretty sure he would call anything a business opportunity.",
      ]);
    else if (has(c, /^Invested .*pretend coin/))
      choose("sigmaInvest", [
        "I put some money into Chad’s coin. Watching the number change makes me nervous. I need to keep enough for the garden.",
        "Chad talks like his coin cannot lose. The price still goes down sometimes. I can see it myself.",
        "I tried investing at Grindset. Trees take water and time. This thing just changes numbers.",
        "Part of my money is in the coin now. I am not counting that as money for Mom until I sell it.",
        "I bought some of the coin. Chad smiled a lot. I will have to watch it myself.",
        "The coin price goes both ways. I wish Chad spent more time explaining that part.",
        "Investing felt exciting for about a minute. Then I started thinking about the things I could have bought instead.",
        "I tried Chad’s investment. It is strange hoping for a number to change instead of a seed to grow.",
      ]);
    else if (has(c, /^Planted in Sigma Town/))
      choose("sigmaGarden", [
        "I planted in the community garden. A Chad said sharing soil was not sigma. The seeds did not seem to mind.",
        "There were ten dead trees in that garden. I gave one plot a new seed. I would rather try than argue with Chad.",
        "The garden beds make a big funny shape. I planted there anyway. Empty soil is still soil.",
        "Chad does not like the word community. I do not think he has figured out the word garden either.",
        "I used a community plot today. If the trees grow money there too, maybe other people can use them.",
        "I started a tree on the other side of the hedge. Chad made a face when I told him where.",
        "Those dead trees looked like ours after a harvest. It felt good putting a fresh seed in one of the beds.",
        "The community garden has room to grow things. I took care of a plot while the Chads talked about success.",
      ]);
    else if (has(c, /^Bought .* at Grindset/))
      choose("sigmaCoffee", [
        "I bought a drink at Grindset. It helped for a little while. Chad acted like he had invented drinking.",
        "The coffee shop sells drinks with strange powers. At least I can tell when one is working.",
        "My drink will wear off in a few minutes. I should plan the garden work before buying one.",
        "I tried one of Chad’s drinks. Three minutes is not very long, but a little help is useful.",
        "Grindset has a whole menu of helpful drinks. I still have to do the work myself.",
        "I paid for a drink in Sigma Town. There are easier ways to get advice than listening to Chad over the counter.",
        "The drink gives me a short bonus. I want to use those minutes well.",
        "Chad calls the drinks productivity tools. I call them expensive if I forget to use the bonus.",
      ]);
    else if (has(c, /^Stopped to talk with Chad/))
      choose("sigmaVisit", [
        "Everyone I met in Sigma Town was called Chad. It makes remembering names easy, at least.",
        "Sigma Town is on the other side of the hedge. The Chads have a lot of advice. None of them asked about Mom.",
        "One house looks like a dog and another looks like a frog. The people there still act very serious.",
        "I talked to some Chads. They kept saying lone wolf. I wondered who they talk to when they feel scared.",
        "The houses in Sigma Town are ridiculous. I tried not to laugh while Chad explained success to me.",
        "Chad told me to work harder. I have already been digging all day. Maybe he should try it.",
        "I visited the new town. Everybody has an answer for how to make money, but their garden is dead.",
        "The Chads talk about winning a lot. I mostly want Mom to get better.",
      ]);
    else if (has(c, /^Found five money seeds among/)) choose("forest");
    else if (has(c, /^Found five money seeds hidden/)) choose("store");
    else if (has(c, /^Found five money seeds in a neighbor/))
      choose("neighborSeeds", [
        "I found money seeds in a neighbor's flowerbed. I almost walked right past them.",
        "A neighbor's flowers were hiding another packet of money seeds. I wonder who put it there.",
        "I spotted money seeds between the flowers next door. I should look more carefully when I walk around.",
        "There were seeds tucked into a neighbor's flowerbed. I took the packet and left the flowers alone.",
        "I found another five seeds by the flowers. This town keeps hiding them in odd places.",
        "The next packet was in a flowerbed. I was looking at the plants when I noticed it.",
        "I came home with money seeds from a neighbor's garden. I still don't know why they were there.",
        "Somebody left money seeds among the flowers. I am glad I looked closely enough to find them.",
      ]);
    else if (has(c, /^Found five money seeds behind the TV/))
      choose("tvSeeds", [
        "I found money seeds behind our TV. How long had they been in our house?",
        "Another packet was hiding behind the television. I was home the whole time and never noticed.",
        "There were five money seeds behind the TV. I do not know how they got there.",
        "I checked behind the television and found more seeds. Even our living room has surprises.",
        "The next seeds were at home, behind the TV. I had been walking past them every day.",
        "I came looking for seeds and found them behind our own television. That is a strange place for them.",
        "I found a packet behind the TV today. I thought I knew where everything was in this house.",
        "Our television was hiding money seeds. I keep wondering who could have left them there.",
      ]);
    else if (has(c, /^Found five.*(?:cap|brim)/i)) choose("cap");
    else if (hat) {
      const used = c.events.some((x) => x.startsWith(`Used my ${hat.name} `));
      const action = used
        ? `I used my ${hat.name} to ${powers[hat.id]}.`
        : `I bought the ${hat.name}. Wearing it lets me ${powers[hat.id]}.`;
      choose(`hat-${hat.id}`, [
        `${action} I hope it was a good choice for the money.`,
        `${action} I like having something that helps with the work.`,
        `${action} I wish I'd known about hats like this before.`,
        `${action} It's a strange thing to spend money on, but it could be useful.`,
        `${action} I want to get plenty of use out of it.`,
        `${action} I keep wondering who thought of making it.`,
        `${action} I don't want it to sit in my bag doing nothing.`,
        `${action} There's a lot about this town I still don't understand.`,
      ]);
    } else if (has(c, /^Saw Mom’s finished birdhouses/))
      choose("finishedBirdhouses");
    else if (has(c, /^Placed a new garden bed/)) choose("expansion");
    else if (planted) choose("planting");
    else if (fed) choose("fertilizer");
    else if (watered) choose("watering");
    else if (neighbors.length) choose("neighbors");
  }
  // A short reflection is optional. No compulsory hopeful moral at the end.
  if (paragraphs.length < 4 && !first && !goal) {
    if (spentDown) choose("spending");
    else if (e.fatigue >= 65) choose("fatigue");
    else if (e.worry >= 58 && (good || tired || chatted)) choose("worry");
    else if (e.frustration >= 32) choose("frustration");
    else if (e.connection <= 22 && !chatted && !neighbors.length)
      choose("lonely");
    else if (e.confidence >= 50 && random() < 0.5) choose("confidence");
    else if (e.hope >= 45) choose("hope");
  }
  if (first) {
    const math = `Mom needs $10,000.00 for her surgery. We have ${dollars(c.available)}, so we still need ${dollars(c.remaining)}. If I can save ${dollars(c.earned)} every day, that's ${c.daysNeeded?.toLocaleString("en-US")} more days. That means saving it, not spending it.`;
    paragraphs.push(
      c.remaining
        ? `I harvested ${dollars(c.earned)} today. ${math}`
        : `I harvested ${dollars(c.earned)} today. We have ${dollars(c.available)} now, enough for Mom's $10,000.00 surgery. I want to tell her.`,
    );
  } else if (c.day === 1 && c.boughtSeeds && !c.earned) {
    choose(
      "seed-cost",
      [
        `The five seeds cost $2.00 out of my $4.33. Almost half my money. This better work. If it doesn't, we'll have to move in with Auntie.`,
        `I spent almost half my $4.33 on the seeds. $2.00 for the bag. This better work, or we'll have to go live with Auntie.`,
        `Those seeds took $2.00 of my $4.33. Almost half. This better work. Otherwise we might have to move in with Auntie.`,
        `Five seeds for $2.00, and I started with $4.33. That's almost half. This better work. If it doesn't, Auntie's place might be where we have to go.`,
      ],
      true,
    );
  }
  if (selections.length === 1 && momParagraphs === 1 && !first) choose("worry");
  memory.used = memory.used.slice(-160);
  return {
    entry: `Day ${c.day}\n\n${paragraphs.join("\n\n")}`,
    memory,
    selections,
  };
}
export function writeBranchedDay(s: State) {
  const c = journalContext(s);
  const prior =
    s.journalNarrative ??
    newNarrativeMemory(Math.floor(Math.random() * 4294967296));
  if (!s.journalNarrative) {
    const observation = (s.journalHistory ?? [])
      .filter(
        (m) =>
          m.day < s.day &&
          m.events.some((e) => /^(Mom had energy|Mom was exhausted)/.test(e)),
      )
      .at(-1);
    if (observation) {
      prior.lastMom = observation.events.some((e) =>
        /^Mom was exhausted/.test(e),
      )
        ? "tired"
        : "good";
      prior.lastMomDay = observation.day;
      if (prior.lastMom === "tired") prior.emotions.worry += 8;
      else prior.emotions.hope += 5;
    }
  }
  // Old saves already know the first harvest. Do not rediscover it after migration.
  if (s.harvestReflected) prior.firstHarvestWritten = true;
  const result = constructJournal(c, prior);
  s.journalNarrative = result.memory;
  return result.entry;
}
