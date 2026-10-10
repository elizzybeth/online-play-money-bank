import { extraTownLines } from "./town-dialogue";
import {
  buff,
  healthDay,
  tickSigma,
  unlockSigma,
  validCoin,
  drinks,
  sigmaPlots,
  type Coin,
  type DrinkId,
} from "./sigma";
import { momDialogue } from "./mom-dialogue";
import {
  writeBranchedDay,
  validNarrativeMemory,
  type NarrativeMemory,
} from "./branching-journal";
import {
  validJournalContext,
  validJournalMemory,
  rememberDay,
  type JournalMemory,
  type JournalContext,
} from "./journal";
import { hatById, type HatId } from "./hats";
export type Plot = {
  x?: number;
  z?: number;
  soilFilled?: boolean;
  community?: boolean;
  stage: "empty" | "planted" | "growing" | "ready" | "harvested";
  remaining: number;
  fertilized: boolean;
  yield: number;
};
export type State = {
  version: 1;
  coin?: Coin;
  drink?: { id: DrinkId; remaining: number };
  communityPlanted?: boolean;
  totalEarned?: number;
  hats: HatId[];
  equippedHat: HatId | null;
  equippedHats?: HatId[];
  momThoughts?: string[];
  birdhousesBuilt?: number;
  foundGardenSeeds?: boolean;
  foundTVSeeds?: boolean;
  foundMeditationSeeds?: boolean;
  foundStacySeeds?: boolean;
  metStacy?: boolean;
  pepeShowStarted?: boolean;
  pepeInflation?: number;
  pepePopped?: boolean;
  pepePackets?: number[];
  stacyConversations?: number;
  harvestReflected: boolean;
  day: number;
  cash: number;
  bank: number;
  seeds: number;
  shovel: boolean;
  can: boolean;
  fertilizer: number;
  gardenBeds?: number;
  soilBags?: number;
  awake: boolean;
  metMom: boolean;
  metRobertson: boolean;
  recovered: boolean;
  neighborChats: Record<string, number>;
  boughtSeeds: boolean;
  foundCapSeeds: boolean;
  seedStashSpot?: number;
  foundForestSeeds?: boolean;
  foundStoreSeeds?: boolean;
  plots: Plot[];
  events: string[];
  journal: string[];
  journalNarrative?: NarrativeMemory;
  journalDrafts?: JournalContext[];
  journalHistory?: JournalMemory[];
  rng: number;
  position: { x: number; z: number };
};
export const opening =
  "Need $ for mom's operation. Money doesn't grow on trees. Or does it? Ol' Man Robertson said something strange today. He said he'd have some seeds for me next time I see him.";
export const fresh = (): State => ({
  version: 1,
  communityPlanted: false,
  totalEarned: 0,
  hats: [],
  equippedHat: null,
  equippedHats: [],
  momThoughts: [],
  birdhousesBuilt: 0,
  foundGardenSeeds: false,
  foundTVSeeds: false,
  foundMeditationSeeds: false,
  foundStacySeeds: false,
  metStacy: false,
  pepeShowStarted: false,
  pepeInflation: 0,
  pepePopped: false,
  pepePackets: [],
  stacyConversations: 0,
  harvestReflected: false,
  day: 1,
  cash: 0,
  bank: 433,
  seeds: 0,
  shovel: false,
  can: false,
  fertilizer: 0,
  gardenBeds: 0,
  soilBags: 0,
  awake: false,
  metMom: false,
  metRobertson: false,
  recovered: false,
  neighborChats: {},
  boughtSeeds: false,
  foundCapSeeds: false,
  seedStashSpot: Math.floor(Math.random() * 5),
  foundForestSeeds: false,
  foundStoreSeeds: false,
  plots: Array.from({ length: 5 }, () => ({
    stage: "empty",
    remaining: 0,
    fertilized: false,
    yield: 0,
  })),
  events: [],
  journal: [opening],
  rng: 48271,
  position: { x: -15, z: 5 },
});
export const money = (c: number) => `$${(c / 100).toFixed(2)}`;
export function buy(
  s: State,
  item: "seeds" | "shovel" | "can" | "fertilizer",
): boolean {
  const costs = { seeds: 200, shovel: 100, can: 100, fertilizer: 500 };
  if (
    (item === "seeds" && s.boughtSeeds) ||
    s.cash < costs[item] ||
    ((item === "shovel" || item === "can") && s[item])
  )
    return false;
  s.cash -= costs[item];
  if (item === "seeds") {
    s.seeds += 5;
    s.boughtSeeds = true;
  } else if (item === "fertilizer") s.fertilizer += 5;
  else s[item] = true;
  s.events.push(
    `Bought ${item === "can" ? "a watering can" : item === "seeds" ? "five mysterious seeds" : item === "shovel" ? "a shovel" : "a box of five fertilizer doses"}.`,
  );
  return true;
}
export function noteHatPower(s: State, purpose: string, id?: HatId) {
  const hat = hatById(id ?? s.equippedHat);
  if (!hat) return;
  const event = `Used my ${hat.name} ${purpose}.`;
  if (!s.events.includes(event)) s.events.push(event);
}
export function plant(s: State, i: number) {
  if (
    !s.plots[i] ||
    s.plots[i].soilFilled === false ||
    !["empty", "harvested"].includes(s.plots[i].stage) ||
    s.seeds < 1
  )
    return false;
  if (wearing(s, "cap") || wearing(s, "hardhat"))
    noteHatPower(
      s,
      "to plant faster",
      wearing(s, "hardhat") ? "hardhat" : "cap",
    );
  s.seeds--;
  s.plots[i].stage = "planted";
  s.events.push("Planted a money seed.");
  if (s.plots[i].community) {
    s.communityPlanted = true;
    s.events.push("Planted in Sigma Town’s community garden.");
  }
  if (wearing(s, "rain") && s.can) {
    noteHatPower(s, "to water a new seed automatically", "rain");
    water(s, i);
  }
  return true;
}
export function water(s: State, i: number) {
  const p = s.plots[i];
  if (!p || !s.can || p.stage !== "planted") return false;
  p.stage = "growing";
  p.remaining = p.fertilized ? 120 : 180;
  p.yield = 0;
  s.events.push("Watered a money tree.");
  return true;
}
export function fertilize(s: State, i: number) {
  const p = s.plots[i];
  if (
    !p ||
    ["empty", "harvested"].includes(p.stage) ||
    p.stage === "ready" ||
    p.fertilized ||
    !s.fertilizer
  )
    return false;
  let conserve = false;
  if (wearing(s, "wizard")) {
    s.rng = (s.rng * 16807) % 2147483647;
    conserve = s.rng / 2147483647 < 0.5;
    noteHatPower(s, "to make my fertilizer last longer", "wizard");
  }
  if (!conserve) s.fertilizer--;
  else s.events.push("Saved a fertilizer dose with my Moonrise Wizard.");
  p.fertilized = true;
  if (p.stage === "growing") p.remaining *= 2 / 3;
  s.events.push("Fed a tree with fertilizer.");
  return true;
}
export function tick(s: State, dt: number) {
  if (!Number.isFinite(dt) || dt < 0) return;
  for (const p of s.plots) {
    if (p.stage === "growing") {
      p.remaining = Math.max(0, p.remaining - dt);
      if (!p.remaining) {
        p.stage = "ready";
        s.rng = (s.rng * 16807) % 2147483647;
        const r = s.rng / 2147483647;
        p.yield =
          (p.fertilized ? 4 + Math.floor(r * 6) : 2 + Math.floor(r * r * 6)) *
          100;
        if (wearing(s, "beekeeper") && p.fertilized)
          p.yield = Math.max(600, p.yield);
      }
    }
  }
}
export function harvest(s: State, i: number) {
  const p = s.plots[i];
  if (!p || p.stage !== "ready") return 0;
  const n = Math.min(
    p.fertilized ? 900 : 700,
    p.yield + (wearing(s, "banker") ? 100 : 0) + (buff(s, "yield") ? 100 : 0),
  );
  if (wearing(s, "banker"))
    noteHatPower(s, "to get an extra dollar from a harvest", "banker");
  s.cash += n;
  s.totalEarned = (s.totalEarned ?? 0) + n;
  if (wearing(s, "cap") || buff(s, "growth")) {
    s.rng = (s.rng * 16807) % 2147483647;
    if (
      s.rng / 2147483647 <
      (wearing(s, "cap") && buff(s, "growth") ? 0.75 : 0.5)
    ) {
      s.seeds++;
      s.events.push(
        wearing(s, "cap")
          ? "Saved a fresh seed in my Sprout Cap."
          : "Recovered a fresh seed after drinking Compound Cold Brew.",
      );
    }
  }
  p.stage = "harvested";
  p.yield = 0;
  p.fertilized = false;
  s.events.push(`Harvested ${money(n)} from a money tree.`);
  return n;
}
export const SURGERY_GOAL = 1_000_000;
export function summarizeDay(
  day: number,
  events: string[],
  reflection?: {
    firstHarvest: boolean;
    available: number;
    boughtSeeds: boolean;
  },
) {
  const count = (prefix: string) =>
    events.filter((e) => e.startsWith(prefix)).length;
  const planted = count("Planted"),
    watered = count("Watered"),
    fed = count("Fed"),
    harvests = events.filter((e) => e.startsWith("Harvested"));
  const earned = harvests.reduce(
    (sum, e) => sum + Math.round(Number(e.match(/\$([\d.]+)/)?.[1] ?? 0) * 100),
    0,
  );
  const lines: string[] = [];
  const people = events.flatMap((e) => {
    const match = e.match(/^Stopped to talk with (.+)\.$/);
    return match ? [match[1]] : [];
  });
  if (events.some((e) => e.includes("Talked with Mom")))
    lines.push("I checked in with Mom before heading out.");
  if (events.some((e) => e.includes("Mom was exhausted")))
    lines.push(
      "Mom was worn out on the couch when I came home. She tries to reassure me, but she seems so tired.",
    );
  const goodDay = events.find((e) => e.startsWith("Mom had energy for"));
  if (goodDay)
    lines.push(`${goodDay} We can’t take these good days for granted.`);
  if (people.length)
    lines.push(`I caught up with ${[...new Set(people)].join(", ")}.`);
  if (events.some((e) => e.includes("Visited Ol’ Man Robertson")))
    lines.push(
      "Robertson had that familiar twinkle in his eye when I stopped at the store.",
    );
  const supplies: string[] = [];
  if (count("Bought five")) supplies.push("money seeds");
  if (count("Bought a watering")) supplies.push("a watering can");
  if (count("Bought a shovel")) supplies.push("a shovel");
  if (events.some((e) => e.startsWith("Bought") && e.includes("fertilizer")))
    supplies.push("fertilizer");
  const newHats = events
    .filter((e) => e.startsWith("Bought the "))
    .map((e) => e.slice("Bought the ".length, -1));
  if (newHats.length)
    lines.push(
      `I tried a new look at Thread & Thimble and came home with ${newHats.join(", ")}. There’s more to these hats than meets the eye.`,
    );
  if (supplies.length)
    lines.push(`I picked up ${supplies.join(", ")} for the garden.`);
  if (events.some((e) => e.startsWith("Found five money seeds")))
    lines.push(
      "Five money seeds were hiding in a cap’s brim at Thread & Thimble. This town has more secrets than I thought.",
    );
  const savedSeeds = count("Saved a fresh seed");
  if (savedSeeds)
    lines.push(
      `The Sprout Cap caught ${savedSeeds} fresh ${savedSeeds === 1 ? "seed" : "seeds"} as I harvested. I can keep the garden going.`,
    );
  const work: string[] = [];
  if (planted)
    work.push(`planting ${planted} ${planted === 1 ? "seed" : "seeds"}`);
  if (watered)
    work.push(`watering ${watered} ${watered === 1 ? "time" : "times"}`);
  if (fed) work.push(`feeding ${fed} ${fed === 1 ? "tree" : "trees"}`);
  if (work.length)
    lines.push(`I spent time in the garden, ${work.join(", ")}.`);
  if (harvests.length)
    lines.push(
      `Harvested ${money(earned)} across ${harvests.length} ${harvests.length === 1 ? "harvest" : "harvests"}. The branches really did rustle with money.`,
    );
  if (events.some((e) => e.startsWith("Helped Robertson")))
    lines.push(
      "I helped Robertson with a delivery. He sent me home with supplies and a little kindness.",
    );
  if (!lines.length)
    lines.push(
      "A quiet day. Tomorrow is another chance to make a little progress.",
    );
  if (count("Bought five"))
    lines.push(
      "Money seeds? Actual money? I thought Robertson was joking. They look so ordinary. What on earth did he give me?",
    );
  if (reflection?.firstHarvest && earned > 0) {
    const needed = Math.max(0, SURGERY_GOAL - reflection.available);
    const days = Math.ceil(needed / earned);
    lines.push(
      `It really grew money. I pulled ${money(earned)} off those branches today. I keep counting it because I can hardly believe it. Mom’s surgery costs $10,000.00; ${money(earned)} is still a drop in the bucket. ${needed ? `We have ${money(reflection.available)} now, so we still need ${money(needed)}. If I can bring in ${money(earned)} every day, that’s ${days.toLocaleString("en-US")} more ${days === 1 ? "day" : "days"}. That’s a long time, but for the first time I can see a way.` : "We have enough saved. I can finally tell Mom we can pay for her surgery."}`,
    );
  } else if (
    day === 1 &&
    !harvests.length &&
    (reflection?.boughtSeeds || count("Bought five"))
  ) {
    lines.push(
      "I keep staring at those crazy seeds. Can money really grow on a tree? They cost $2.00, almost half my $4.33. This better work. If it doesn’t, we’ll have to move in with Auntie. I don’t want Mom to have to worry about that too.",
    );
  } else if (earned === 0) {
    lines.push(
      "I haven’t earned anything today. Mom still needs $10,000.00 for her surgery, and I haven’t brought us any closer. I need to find a way to help her.",
    );
  } else if (day === 1) {
    lines.push(
      `I made ${money(earned)} today. It’s only a drop in the bucket compared to the $10,000.00 Mom’s surgery will cost. I have to keep going.`,
    );
  }
  return `Day ${day}\n\n${lines.join("\n\n")}`.replaceAll("—", ". ");
}
export function sleep(s: State) {
  const entry = writeBranchedDay(s);
  (s.journalHistory ??= []).push(rememberDay(s));
  const firstHarvest =
    !s.harvestReflected && s.events.some((e) => e.startsWith("Harvested"));
  s.journal.push(entry);
  if (firstHarvest) s.harvestReflected = true;
  if (momStatus(s.day).activity === "birdhouses")
    s.birdhousesBuilt = Math.min(12, (s.birdhousesBuilt ?? 0) + 1);
  s.events = [];
  s.day++;
  tick(s, 180);
  tickSigma(s, 180);
}
export function momStatus(day: number) {
  const activities = [
    "cooking",
    "birdhouses",
    "painting",
    "reading",
    "garden",
    "mending",
    "puzzles",
    "music",
    "letters",
    "feeding",
  ] as const;
  const health = healthDay(day);
  const energetic = health.good;
  const activity = energetic
    ? activities[(health.ordinal - 1) % activities.length]
    : day % 4 === 3
      ? ("bedrest" as const)
      : ("resting" as const);
  const replies = {
    mending:
      "“I felt up to sewing today. I am fixing a loose button. Come choose some thread with me.”",
    puzzles:
      "“I am working on a puzzle today. Want to help me find an edge piece?”",
    music:
      "“I have a little energy for music today. I am trying a tune on my little keyboard.”",
    letters:
      "“I am writing a letter to Auntie. Is there anything you want me to tell her?”",
    feeding:
      "“I felt well enough to put some seed out for the birds. Let us see who visits.”",
    bedrest:
      "“I need to stay in bed today, sweetheart. Come sit nearby and tell me how you are.”",
    cooking:
      "“It’s a good day, sweetheart. I’ve got a little energy, so I thought I’d make us something warm. Smells good, doesn’t it?”",
    birdhouses:
      "“I’ve got some energy today. I’m building little birdhouses! Maybe we’ll have some new neighbors in the garden.”",
    painting:
      "“It’s a good day. I felt like painting something bright. Come see — I think this corner needs a little more yellow.”",
    reading:
      "“I feel a bit better today. I’m enjoying my book. It’s nice to get lost in somebody else’s adventure for a while.”",
    garden:
      "“I went out to look at your garden. Those money trees are kind of ugly, aren’t they? But thank you for all your work, sweetheart. It means so much.”",
    resting:
      "“I’m exhausted today, love. I just need to rest here a while. I’m glad you’re home.”",
  };
  const journal = {
    mending: "mending clothes",
    puzzles: "doing a jigsaw puzzle",
    music: "playing music",
    letters: "writing a letter",
    feeding: "feeding birds",
    bedrest: "resting in bed",
    cooking: "cooking",
    birdhouses: "building birdhouses",
    painting: "painting",
    reading: "reading a book",
    garden: "looking at the garden",
    resting: "resting",
  };
  return {
    energetic,
    activity,
    journal: journal[activity],
    reply: replies[activity],
    thought: energetic
      ? "We can’t take these good days for granted."
      : "She seems tired. More tired than she wants me to notice.",
  };
}
export function parseAmount(value: string) {
  const input = value.trim();
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(input)) return null;
  const [whole, fraction = ""] = input.split(".");
  const amount = Number(whole || 0) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}
export function withdraw(s: State, amount = s.bank) {
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > s.bank)
    return false;
  s.cash += amount;
  s.bank -= amount;
  return true;
}
export function deposit(s: State, amount = s.cash) {
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > s.cash)
    return false;
  s.bank += amount;
  s.cash -= amount;
  return true;
}
export function recover(s: State) {
  if (s.recovered || s.cash + s.bank >= 100 || s.can) return false;
  s.can = true;
  if (!s.seeds && !s.plots.some((p) => p.stage !== "empty")) s.seeds = 5;
  s.recovered = true;
  s.events.push("Helped Robertson sort a delivery. He gave me supplies.");
  return true;
}
export function decode(raw: string | null): State | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (
      s.version !== 1 ||
      !Number.isSafeInteger(s.day) ||
      s.day < 1 ||
      !["cash", "bank", "seeds", "fertilizer"].every(
        (k) => Number.isSafeInteger(s[k]) && s[k] >= 0,
      ) ||
      !["shovel", "can", "awake", "metMom", "metRobertson", "recovered"].every(
        (k) => typeof s[k] === "boolean",
      ) ||
      !Array.isArray(s.plots) ||
      s.plots.length < 5 ||
      s.plots.length > 60 ||
      !s.plots.every(
        (p: Plot) =>
          ["empty", "planted", "growing", "ready", "harvested"].includes(
            p.stage,
          ) &&
          Number.isFinite(p.remaining) &&
          p.remaining >= 0 &&
          typeof p.fertilized === "boolean" &&
          Number.isSafeInteger(p.yield) &&
          p.yield >= 0 &&
          p.yield <= (p.fertilized ? 900 : 700),
      ) ||
      !["events", "journal"].every(
        (k) =>
          Array.isArray(s[k]) &&
          s[k].every((x: unknown) => typeof x === "string"),
      ) ||
      !Number.isSafeInteger(s.rng) ||
      s.rng <= 0 ||
      s.rng >= 2147483647 ||
      !s.position ||
      !Number.isFinite(s.position.x) ||
      !Number.isFinite(s.position.z)
    )
      return null;
    // Optional writer metadata must never discard otherwise valid game progress.
    if (
      !validNarrativeMemory(s.journalNarrative) ||
      s.journalNarrative.lastMomDay >= s.day
    )
      delete s.journalNarrative;
    if (s.journalDrafts !== undefined) s.journalDrafts = []; // Preserve pages, retire model jobs.
    if (s.journalHistory !== undefined)
      s.journalHistory = Array.isArray(s.journalHistory)
        ? s.journalHistory.filter(
            (m: unknown) => validJournalMemory(m) && m.day < s.day,
          )
        : [];
    const pendingPages = new Set<number>();
    if (s.journalDrafts !== undefined)
      s.journalDrafts = Array.isArray(s.journalDrafts)
        ? s.journalDrafts
            .filter((c: unknown) => {
              if (
                !validJournalContext(c) ||
                c.page >= s.journal.length ||
                c.day >= s.day ||
                pendingPages.has(c.page)
              )
                return false;
              pendingPages.add(c.page);
              return true;
            })
            .map((c: JournalContext) => ({
              ...c,
              previous: [],
              history: c.history.slice(-3),
            }))
        : [];
    // Preserve the growth percentage of pre-update saves when doubling crop duration.
    if (s.boughtSeeds === undefined)
      for (const plot of s.plots)
        if (plot.stage === "growing") plot.remaining *= 2;
    s.boughtSeeds ??=
      s.events
        .concat(s.journal)
        .some((entry: string) =>
          entry.includes("Bought five mysterious seeds"),
        ) || s.plots.some((p: Plot) => p.stage !== "empty");
    // Condense old activity-log entries while preserving the opening page.
    s.journal = s.journal.map((entry: string) => {
      const match = entry.match(/^Day (\d+) — (.+)$/s);
      return match &&
        /(?:Planted a money seed\.|Watered a money tree\.|Bought fertilizer\.)/.test(
          match[2],
        )
        ? summarizeDay(Number(match[1]), match[2].split(/(?<=\.)\s+(?=[A-Z])/))
        : entry;
    });
    // Migrate existing version-one saves without losing progress.
    s.gardenBeds ??= 0;
    s.soilBags ??= 0;
    if (
      ![s.gardenBeds, s.soilBags].every(
        (n) => Number.isSafeInteger(n) && n >= 0 && n <= 1000,
      )
    )
      return null;
    if (
      !s.plots.every(
        (p: Plot, i: number) =>
          (p.soilFilled === undefined || typeof p.soilFilled === "boolean") &&
          (p.soilFilled !== false || p.stage === "empty") &&
          (i < 5 ||
            (Number.isFinite(p.x) &&
              Number.isFinite(p.z) &&
              (p.community === true
                ? sigmaPlots.some((q) => q.x === p.x && q.z === p.z)
                : withinProperty(p.x!, p.z!)))),
      )
    )
      return null;
    s.neighborChats ??= {};
    if (
      !s.neighborChats ||
      Array.isArray(s.neighborChats) ||
      typeof s.neighborChats !== "object" ||
      !Object.entries(s.neighborChats).every(
        ([key, value]) =>
          ([
            "npc1",
            "npc2",
            "npc3",
            "mom-home",
            "mom-greeting",
            "mom-out",
            "robertson",
            "haberdashery",
            "bicycle",
            "grindset",
          ].includes(key) ||
            /^sigma-chad-[0-5]$/.test(key) ||
            /^mom-reply-(resting|bedrest|cooking|birdhouses|painting|reading|garden|mending|puzzles|music|letters|feeding)$/.test(
              key,
            )) &&
          Number.isSafeInteger(value) &&
          Number(value) >= 0,
      )
    )
      return null;
    s.foundCapSeeds ??= false;
    s.seedStashSpot ??= Math.floor(Math.random() * seedStashSpots.length);
    s.foundForestSeeds ??= false;
    s.foundStoreSeeds ??= false;
    if (
      !Number.isInteger(s.seedStashSpot) ||
      s.seedStashSpot < 0 ||
      s.seedStashSpot >= seedStashSpots.length ||
      typeof s.foundForestSeeds !== "boolean" ||
      typeof s.foundStoreSeeds !== "boolean"
    )
      return null;
    if (
      typeof s.boughtSeeds !== "boolean" ||
      typeof s.foundCapSeeds !== "boolean"
    )
      return null;
    s.journal = s.journal.map((entry: string) =>
      entry
        .replace(
          /I made \$0\.00 today\. It[’']s only a drop in the bucket compared to (?:what Mom[’']s surgery will cost|the \$10,000\.00 Mom[’']s surgery will cost)\.\s*(?:Still, it[’']s a beginning\.\s*)?(?:I have to keep going\.)?/g,
          "I haven’t earned anything today. Mom still needs $10,000.00 for her surgery, and I haven’t brought us any closer. I need to find a way to help her.",
        )
        .replace(/^Day (\d+) — /, "Day $1\n\n")
        .replaceAll("—", ". "),
    );
    s.harvestReflected ??= s.journal.some(
      (entry: string) =>
        entry.includes("It really grew money.") ||
        /(?:Harvested|I made|I got|money was|I counted) \$(?!0\.00)[\d,.]+/.test(
          entry,
        ),
    );
    if (typeof s.harvestReflected !== "boolean") return null;
    s.hats ??= [];
    s.equippedHat ??= null;
    if (
      !Array.isArray(s.hats) ||
      !s.hats.every((id: unknown) => hatById(id)) ||
      new Set(s.hats).size !== s.hats.length ||
      (s.equippedHat !== null && !s.hats.includes(s.equippedHat))
    )
      return null;
    s.equippedHats ??= s.equippedHat ? [s.equippedHat] : [];
    if (
      Array.isArray(s.equippedHats) &&
      !s.equippedHats.length &&
      s.equippedHat
    )
      s.equippedHats = [s.equippedHat];
    if (
      !Array.isArray(s.equippedHats) ||
      s.equippedHats.length > 3 ||
      new Set(s.equippedHats).size !== s.equippedHats.length ||
      !s.equippedHats.every((id: HatId) => s.hats.includes(id))
    )
      return null;
    s.birdhousesBuilt ??= Math.max(
      0,
      Math.min(12, Math.floor((s.day - 5) / 20) + 1),
    );
    if (
      !Number.isInteger(s.birdhousesBuilt) ||
      s.birdhousesBuilt < 0 ||
      s.birdhousesBuilt > 12
    )
      return null;
    s.foundGardenSeeds ??= false;
    s.foundTVSeeds ??= false;
    s.foundMeditationSeeds ??= false;
    s.metStacy ??= !!s.stacyConversations;
    s.pepeShowStarted ??= false;
    s.pepeInflation ??= 0;
    s.pepePopped ??= false;
    s.pepePackets ??= [];
    if (
      typeof s.metStacy !== "boolean" ||
      typeof s.pepeShowStarted !== "boolean" ||
      typeof s.pepePopped !== "boolean" ||
      !Number.isFinite(s.pepeInflation) ||
      s.pepeInflation < 0 ||
      s.pepeInflation > 12 ||
      !Array.isArray(s.pepePackets) ||
      s.pepePackets.length > 25 ||
      new Set(s.pepePackets).size !== s.pepePackets.length ||
      s.pepePackets.some(
        (i: unknown) =>
          !Number.isInteger(i) || (i as number) < 0 || (i as number) >= 25,
      ) ||
      (!s.pepePopped && s.pepePackets.length > 0) ||
      (s.pepePopped && (!s.pepeShowStarted || s.pepeInflation !== 12))
    )
      return null;
    s.foundStacySeeds ??= false;
    s.stacyConversations ??= 0;
    if (
      typeof s.foundStacySeeds !== "boolean" ||
      !Number.isInteger(s.stacyConversations) ||
      s.stacyConversations < 0 ||
      s.stacyConversations > 10
    )
      return null;
    if (typeof s.foundMeditationSeeds !== "boolean") return null;
    if (
      typeof s.foundGardenSeeds !== "boolean" ||
      typeof s.foundTVSeeds !== "boolean"
    )
      return null;
    if (
      !Array.isArray(s.momThoughts) ||
      !s.momThoughts.every((id: unknown) => typeof id === "string")
    )
      s.momThoughts = [];
    s.momThoughts = s.momThoughts.slice(-200);
    if (s.coin !== undefined && !validCoin(s.coin)) delete s.coin;
    if (
      s.drink &&
      (!drinks.some((d) => d.id === s.drink.id) ||
        !Number.isFinite(s.drink.remaining) ||
        s.drink.remaining <= 0 ||
        s.drink.remaining > 180)
    )
      delete s.drink;
    s.communityPlanted = !!s.communityPlanted;
    s.totalEarned =
      Number.isSafeInteger(s.totalEarned) && s.totalEarned >= 0
        ? s.totalEarned
        : (s.journalHistory ?? []).reduce(
            (sum: number, m: JournalMemory) => sum + m.earned,
            0,
          );
    if (s.plots.some((p: Plot) => p.community) && !s.foundTVSeeds) return null;
    if (
      s.plots.filter((p: Plot) => p.community).length &&
      (s.plots.filter((p: Plot) => p.community).length !== 10 ||
        new Set(
          s.plots
            .filter((p: Plot) => p.community)
            .map((p: Plot) => `${p.x},${p.z}`),
        ).size !== 10)
    )
      return null;
    unlockSigma(s);
    return s;
  } catch {
    return null;
  }
}
export function load(raw: string | null): State {
  return decode(raw) ?? fresh();
}
export type Rect = {
  x: number;
  z: number;
  w: number;
  d: number;
  clearHeight?: number;
};
export const airborneRects = (rects: Rect[], height: number) =>
  rects.filter(
    (r) => r.clearHeight === undefined || height <= r.clearHeight + 0.1,
  );
export function blocked(x: number, z: number, rects: Rect[], radius = 0.48) {
  return rects.some(
    (r) =>
      x + radius > r.x - r.w / 2 &&
      x - radius < r.x + r.w / 2 &&
      z + radius > r.z - r.d / 2 &&
      z - radius < r.z + r.d / 2,
  );
}
// A new tree collider can appear around the player. Find nearby clear ground
// instead of trapping movement inside the expanded collision volume.
export function clearPosition(
  pos: { x: number; z: number },
  rects: Rect[],
  north = -39,
) {
  const clear = (x: number, z: number) =>
    Math.abs(x) <= 38 && z >= north && z <= 38 && !blocked(x, z, rects);
  if (clear(pos.x, pos.z)) return pos;
  for (let radius = 0.15; radius <= 3; radius += 0.15) {
    for (let step = 0; step < 32; step++) {
      const angle = (step * Math.PI * 2) / 32;
      const x = pos.x + Math.sin(angle) * radius;
      const z = pos.z + Math.cos(angle) * radius;
      if (clear(x, z)) return { x, z };
    }
  }
  return { x: -16, z: 4 };
}
export function move(
  pos: { x: number; z: number },
  dx: number,
  dz: number,
  rects: Rect[],
) {
  if (blocked(pos.x, pos.z, rects))
    Object.assign(pos, clearPosition(pos, rects, Math.min(-39, pos.z - 3)));
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.12));
  for (let i = 0; i < n; i++) {
    const x = pos.x + dx / n,
      z = pos.z + dz / n;
    if (!blocked(x, pos.z, rects)) pos.x = x;
    if (!blocked(pos.x, z, rects)) pos.z = z;
  }
  return pos;
}

export function findCapSeeds(s: State) {
  if (!s.boughtSeeds || s.foundCapSeeds) return false;
  s.foundCapSeeds = true;
  s.seeds += 5;
  s.events.push(
    "Found five money seeds tucked into the brim of a cap at Thread & Thimble.",
  );
  return true;
}

const neighborLines: Record<string, string[]> = {
  npc1: [
    "I talk to my flowers. They’re very good listeners.",
    "The bees are busy today. I like to think they’re gossiping about us.",
    "A little soil under your nails is a sign of a lovely afternoon.",
    "My marigolds refuse to grow in a straight line. I respect that.",
    "I found a snail asleep under a leaf. Even gardeners need a nap.",
    "You can’t hurry a garden. You can keep it company, though.",
    "I’m saving the prettiest flowers for your mom. Tell her I said hello.",
    "My seedlings are tiny, but they’re trying. I think that counts.",
  ],
  npc2: [
    "Robertson knows more than he lets on. Especially about gardens.",
    "I heard a strange rustling last night. Paper? Leaves? I can’t decide.",
    "Thread & Thimble always has something tucked away. Look closely.",
    "That lane looks short until you walk it three times in an afternoon.",
    "I tried counting the clouds. They kept changing their minds.",
    "Your garden is getting interesting. Robertson must be pleased.",
    "I’m fixing a squeaky gate. So far the gate is winning.",
    "The best things in this town usually start with a little curiosity.",
  ],
  npc3: [
    "Funny rustling in the wind last night. Sounded like paper.",
    "I’ve lived here ages, and this town still finds ways to surprise me.",
    "Your mom has a good eye for color. Her paintings always make me smile.",
    "A bird inspected my windowsill this morning. Very stern little landlord.",
    "Don’t forget to enjoy the walk home. The garden will wait a moment.",
    "I put the kettle on and forgot why. Tea seems reason enough.",
    "You’re working hard in that garden. Remember to rest your own roots.",
    "The evening light makes even the crooked fences look lovely.",
  ],
};
export function neighborLine(s: State, id: string) {
  const lines = [
    ...(neighborLines[id] ?? []),
    ...(extraTownLines[id] ?? []),
  ].filter(
    (line) =>
      !(
        id === "haberdashery" &&
        s.foundCapSeeds &&
        line.includes("curious brim")
      ),
  );
  if (!lines.length) return "";
  const count = s.neighborChats[id] ?? 0;
  s.neighborChats[id] = count >= Number.MAX_SAFE_INTEGER ? 1 : count + 1;
  return `“${lines[count % lines.length]}”`;
}

export function wornHats(s: State): HatId[] {
  return s.equippedHats?.length
    ? s.equippedHats
    : s.equippedHat
      ? [s.equippedHat]
      : [];
}
export const wearing = (s: State, id: HatId) => wornHats(s).includes(id);
export function removeHat(s: State, id: HatId) {
  s.equippedHats = wornHats(s).filter((h) => h !== id);
  s.equippedHat = s.equippedHats.at(-1) ?? null;
}
export function buyHat(s: State, id: HatId) {
  const hat = hatById(id);
  if (!hat || s.hats.includes(id) || s.cash < hat.price) return false;
  s.cash -= hat.price;
  s.hats.push(id);
  equipHat(s, id);
  s.events.push(`Bought the ${hat.name}.`);
  return true;
}
export function equipHat(s: State, id: HatId | null) {
  if (id !== null && !s.hats.includes(id)) return false;
  const stack = [...wornHats(s)];
  if (id === null) s.equippedHats = [];
  else {
    if (!stack.includes(id) && stack.length >= 3) return false;
    s.equippedHats = stack.includes(id) ? stack : [...stack, id];
  }
  s.equippedHat = s.equippedHats.at(-1) ?? null;
  return true;
}
export const plantingSeconds = (s: State) =>
  (s.shovel ? 2 : 8) *
  (wearing(s, "hardhat") ? 0.5 : wearing(s, "cap") ? 0.85 : 1) *
  (buff(s, "dig") ? 0.5 : 1);
export const movementSpeed = (s: State, running: boolean) =>
  (running ? 7 : 4) *
  (wearing(s, "propeller") ? 1.25 : 1) *
  (buff(s, "sprint") ? 1.3 : 1);

export const seedStashSpots = [
  { x: -29, z: -33 },
  { x: -29, z: -23 },
  { x: -29, z: -13 },
  { x: -29, z: 7 },
  { x: -29, z: 27 },
];
export function findHiddenSeeds(
  s: State,
  location: "forest" | "store" | "garden" | "tv",
) {
  const fields = {
    forest: "foundForestSeeds",
    store: "foundStoreSeeds",
    garden: "foundGardenSeeds",
    tv: "foundTVSeeds",
  } as const;
  const previous = {
    forest: s.foundCapSeeds,
    store: s.foundForestSeeds,
    garden: s.foundStoreSeeds,
    tv: s.foundGardenSeeds,
  };
  if (!previous[location] || s[fields[location]]) return false;
  s[fields[location]] = true;
  if (location === "tv") unlockSigma(s);
  s.seeds += 5;
  const places = {
    forest: "among the trees",
    store: "hidden in Robertson’s store",
    garden: "in a neighbor’s flowerbed",
    tv: "behind the TV at home",
  };
  s.events.push(`Found five money seeds ${places[location]}.`);
  return true;
}
export function momReply(s: State) {
  const status = momStatus(s.day);
  const alternatives: Record<string, string[]> = {
    bedrest: [
      "I am having a bed day. You can pull up a chair, love.",
      "I need a quiet room today. I am glad you came to see me.",
      "I wish I could get up. Tell me what is happening outside.",
    ],
    mending: [
      "A button came loose. I can manage a little sewing today.",
      "Do you like this thread color? I want your opinion.",
      "This is a small job. It feels good to finish something.",
    ],
    puzzles: [
      "I am looking for the piece with a bit of blue on it.",
      "Come help me find the corners. We do not need to finish today.",
      "It is nice to work on something with you.",
    ],
    music: [
      "I keep missing that note. I will try it slowly.",
      "Would you like to try a few notes with me?",
      "I am enjoying making a little music today.",
    ],
    letters: [
      "I want Auntie to hear from us. What should I tell her?",
      "Would you draw something to put in this letter?",
      "I like taking time to write to somebody.",
    ],
    feeding: [
      "We can watch quietly and see whether a bird comes.",
      "I like having the birds visit outside the window.",
      "A little seed and a little patience. That is all we need.",
    ],
    resting: [
      "I’m tired, love. Will you sit with me for a minute?",
      "I wanted to get up, but the couch won today. Tell me what you’ve been doing.",
      "I’m taking it slowly today. It helps having you here.",
    ],
    cooking: [
      "Could you pass me that spoon? I’m glad I felt up to cooking today.",
      "Something warm for dinner sounded good. There’s enough for both of us.",
      "The kitchen smells better than the sofa. I’m enjoying being up today.",
    ],
    birdhouses: [
      "Do you think a bird will like this little house? I’m still working on the roof.",
      "I’ve got enough energy for a few more nails. Want to help me pick a color?",
      "These little houses are keeping my hands busy. I like making things.",
    ],
    painting: [
      "I’m trying a bit of blue here. What do you think?",
      "It feels good to have my paints out again. Come have a look.",
      "I’m still deciding what this picture needs. I’m happy to be painting today.",
    ],
    reading: [
      "I’m at a good bit in my book. Let me finish this page and you can tell me about your day.",
      "Reading suits me today. I can rest and have an adventure at the same time.",
      "I’ve been enjoying this book. Maybe we can read some together later.",
    ],
    garden: [
      "Those money trees look a little spooky. Thank you for taking such good care of the garden.",
      "I like being out here with you. The trees aren’t very pretty, but you’ve worked hard.",
      "I’m glad I could look at your garden today. Thank you, sweetheart.",
    ],
  };
  const key = `mom-reply-${status.activity}`,
    count = s.neighborChats[key] ?? 0;
  s.neighborChats[key] = count + 1;
  const additional =
    (momDialogue as Record<string, readonly string[]>)[
      status.activity === "bedrest" ? "resting" : status.activity
    ] ?? [];
  const pool = [...alternatives[status.activity], ...additional].filter(
    (line) =>
      status.activity !== "bedrest" ||
      !/couch|television|feet up|sofa/.test(line),
  );
  return count === 0 ? status.reply : `“${pool[(count - 1) % pool.length]}”`;
}

export const withinProperty = (x: number, z: number) =>
  Number.isFinite(x) &&
  Number.isFinite(z) &&
  x >= -30.1 &&
  x <= -8.9 &&
  z >= -4.4 &&
  z <= 22.4;
export function buyGardenSupply(s: State, item: "bed" | "soil") {
  const cost = item === "bed" ? 3000 : 1000;
  if (
    s.cash < cost ||
    (item === "bed" &&
      s.plots.filter((p) => !p.community).length + (s.gardenBeds ?? 0) >= 50) ||
    (item === "soil" && (s.soilBags ?? 0) >= 1000)
  )
    return false;
  s.cash -= cost;
  if (item === "bed") s.gardenBeds = (s.gardenBeds ?? 0) + 1;
  else s.soilBags = (s.soilBags ?? 0) + 1;
  s.events.push(
    item === "bed"
      ? "Bought a new garden bed for $30.00."
      : "Bought soil to fill a garden bed for $10.00.",
  );
  return true;
}
export function canPlaceBed(s: State, x: number, z: number, obstacles: Rect[]) {
  return (
    withinProperty(x, z) &&
    s.plots.filter((p) => !p.community).length < 50 &&
    !obstacles.some(
      (r) =>
        Math.abs(x - r.x) < 0.9 + r.w / 2 && Math.abs(z - r.z) < 1.6 + r.d / 2,
    ) &&
    !s.plots.some(
      (p, i) =>
        Math.abs(x - (p.x ?? -20 + i * 2)) < 1.9 &&
        Math.abs(z - (p.z ?? 19)) < 3.3,
    )
  );
}
export function placeGardenBed(
  s: State,
  x: number,
  z: number,
  obstacles: Rect[],
) {
  if (!(s.gardenBeds ?? 0) || !canPlaceBed(s, x, z, obstacles)) return false;
  s.gardenBeds!--;
  s.plots.push({
    x,
    z,
    soilFilled: false,
    stage: "empty",
    remaining: 0,
    fertilized: false,
    yield: 0,
  });
  s.events.push("Placed a new garden bed on our property.");
  return true;
}
export function fillGardenBed(s: State, i: number) {
  const p = s.plots[i];
  if (!p || p.soilFilled !== false || !(s.soilBags ?? 0)) return false;
  s.soilBags!--;
  p.soilFilled = true;
  s.events.push("Filled a new garden bed with soil.");
  return true;
}

export function homeContains(p: { x: number; z: number }) {
  return (
    (p.x >= -21 && p.x <= -9 && p.z > -2 && p.z < 14) ||
    (p.x >= -9 && p.x < -1 && p.z > 6 && p.z < 14)
  );
}
export function seedSearchHint(s: State) {
  if (!s.foundCapSeeds)
    return "Try the haberdasher’s — check the brim of a cap.";
  if (!s.foundForestSeeds)
    return "You already found the cap packet. Try looking among the trees around town.";
  if (!s.foundStoreSeeds)
    return "A packet might have slipped behind the groceries. Take a careful look around my store.";
  if (!s.foundGardenSeeds)
    return "Have a look around the neighbors’ flowerbeds. Little things turn up in surprising places.";
  if (!s.foundTVSeeds)
    return "You might find something you missed at home. Try looking behind the furniture.";
  return "Keep exploring. A Sprout Cap sometimes saves a seed when you harvest, too.";
}
