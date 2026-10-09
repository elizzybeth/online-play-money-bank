export type Plot = {
  stage: "empty" | "planted" | "growing" | "ready" | "harvested";
  remaining: number;
  fertilized: boolean;
  yield: number;
};
export type State = {
  version: 1;
  day: number;
  cash: number;
  bank: number;
  seeds: number;
  shovel: boolean;
  can: boolean;
  fertilizer: number;
  awake: boolean;
  metMom: boolean;
  metRobertson: boolean;
  recovered: boolean;
  neighborChats: Record<string, number>;
  boughtSeeds: boolean;
  foundCapSeeds: boolean;
  plots: Plot[];
  events: string[];
  journal: string[];
  rng: number;
  position: { x: number; z: number };
};
export const opening =
  "Need $ for mom's operation. Money doesn't grow on trees. Or does it? Ol' Man Robertson said something strange today. He said he'd have some seeds for me next time I see him.";
export const fresh = (): State => ({
  version: 1,
  day: 1,
  cash: 0,
  bank: 433,
  seeds: 0,
  shovel: false,
  can: false,
  fertilizer: 0,
  awake: false,
  metMom: false,
  metRobertson: false,
  recovered: false,
  neighborChats: {},
  boughtSeeds: false,
  foundCapSeeds: false,
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
  } else if (item === "fertilizer") s.fertilizer += 1;
  else s[item] = true;
  s.events.push(
    `Bought ${item === "can" ? "a watering can" : item === "seeds" ? "five mysterious seeds" : item === "shovel" ? "a shovel" : "one fertilizer application"}.`,
  );
  return true;
}
export function plant(s: State, i: number) {
  if (
    !s.plots[i] ||
    !["empty", "harvested"].includes(s.plots[i].stage) ||
    s.seeds < 1
  )
    return false;
  s.seeds--;
  s.plots[i].stage = "planted";
  s.events.push("Planted a money seed.");
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
  s.fertilizer--;
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
          (p.fertilized ? 4 + Math.floor(r * 4) : 2 + Math.floor(r * r * 6)) *
          100;
      }
    }
  }
}
export function harvest(s: State, i: number) {
  const p = s.plots[i];
  if (!p || p.stage !== "ready") return 0;
  const n = p.yield;
  s.cash += n;
  p.stage = "harvested";
  p.yield = 0;
  p.fertilized = false;
  s.events.push(`Harvested ${money(n)} from a money tree.`);
  return n;
}
export function summarizeDay(day: number, events: string[]) {
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
  if (supplies.length)
    lines.push(`I picked up ${supplies.join(", ")} for the garden.`);
  if (events.some((e) => e.startsWith("Found five money seeds")))
    lines.push(
      "Five money seeds were hiding in a cap’s brim at Thread & Thimble. This town has more secrets than I thought.",
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
  if (day === 1)
    lines.push(
      `I made ${money(earned)} today. It’s only a drop in the bucket compared to what Mom’s surgery will cost. Still, it’s a beginning. I have to keep going.`,
    );
  return `Day ${day} — ${lines.join(" ")}`;
}
export function sleep(s: State) {
  s.journal.push(summarizeDay(s.day, s.events));
  s.events = [];
  s.day++;
  tick(s, 180);
}
export function momStatus(day: number) {
  const activities = [
    "cooking",
    "birdhouses",
    "painting",
    "reading",
    "garden",
  ] as const;
  const energetic = day % 2 === 0;
  const activity = energetic
    ? activities[(Math.floor(day / 2) - 1) % activities.length]
    : "resting";
  const replies = {
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
      s.plots.length !== 5 ||
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
          p.yield <= 700,
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
    s.neighborChats ??= {};
    if (
      !s.neighborChats ||
      Array.isArray(s.neighborChats) ||
      typeof s.neighborChats !== "object" ||
      !Object.entries(s.neighborChats).every(
        ([key, value]) =>
          ["npc1", "npc2", "npc3"].includes(key) &&
          Number.isSafeInteger(value) &&
          Number(value) >= 0,
      )
    )
      return null;
    s.foundCapSeeds ??= false;
    if (
      typeof s.boughtSeeds !== "boolean" ||
      typeof s.foundCapSeeds !== "boolean"
    )
      return null;
    return s;
  } catch {
    return null;
  }
}
export function load(raw: string | null): State {
  return decode(raw) ?? fresh();
}
export type Rect = { x: number; z: number; w: number; d: number };
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
export function clearPosition(pos: { x: number; z: number }, rects: Rect[]) {
  const clear = (x: number, z: number) =>
    Math.abs(x) <= 38 && z >= -39 && z <= 38 && !blocked(x, z, rects);
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
  const lines = neighborLines[id];
  if (!lines) return "";
  const count = s.neighborChats[id] ?? 0;
  const extras = [
    "",
    "Have a lovely walk.",
    "There’s always something new around here.",
    "I wonder what tomorrow will bring.",
    "It’s nice to see you again.",
  ];
  s.neighborChats[id] = count >= Number.MAX_SAFE_INTEGER ? 1 : count + 1;
  return `“${lines[count % lines.length]} ${extras[Math.floor(count / lines.length) % extras.length]}”`.replace(
    " ”",
    "”",
  );
}
