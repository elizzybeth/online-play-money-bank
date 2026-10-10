import type { State } from "./game";
export const sigmaPlots = [
  { x: 7, z: -76 },
  { x: 10, z: -76 },
  { x: 13, z: -76 },
  { x: 8, z: -72.5 },
  { x: 10, z: -69 },
  { x: 12, z: -65.5 },
  { x: 9, z: -62 },
  { x: 7, z: -58.5 },
  { x: 10, z: -58.5 },
  { x: 13, z: -58.5 },
];
export type Coin = {
  name: string;
  price: number;
  exactPrice?: number;
  units: number;
  invested: number;
  rng: number;
  elapsed: number;
  history: number[];
};
export type DrinkId = "sprint" | "dig" | "growth" | "yield" | "reach";
export const drinks: {
  id: DrinkId;
  name: string;
  cost: number;
  seconds: number;
  effect: string;
}[] = [
  {
    id: "sprint",
    name: "Hustle Espresso",
    cost: 200,
    seconds: 180,
    effect: "Move 30% faster for 3 minutes.",
  },
  {
    id: "dig",
    name: "Deep Work Mocha",
    cost: 300,
    seconds: 180,
    effect: "Plant twice as fast for 3 minutes.",
  },
  {
    id: "growth",
    name: "Compound Cold Brew",
    cost: 400,
    seconds: 180,
    effect:
      "50% chance to recover one seed per harvest for 3 minutes. Combines with Sprout Cap for 75%, never more than one seed.",
  },
  {
    id: "yield",
    name: "Bull Market Latte",
    cost: 500,
    seconds: 180,
    effect:
      "Harvest an extra $1 for 3 minutes, up to $7 normally or $9 for fertilized trees.",
  },
  {
    id: "reach",
    name: "Networking Tea",
    cost: 200,
    seconds: 180,
    effect: "Interact from farther away for 3 minutes.",
  },
];
export const buff = (s: State, id: DrinkId) =>
  s.drink?.id === id && s.drink.remaining > 0;
export function unlockSigma(s: State) {
  if (!s.foundTVSeeds) return false;
  if (s.plots.some((p) => p.community)) return false;
  s.plots.push(
    ...sigmaPlots.map((p) => ({
      ...p,
      community: true,
      soilFilled: true,
      stage: "harvested" as const,
      remaining: 0,
      fertilized: false,
      yield: 0,
    })),
  );
  return true;
}
export function buyDrink(s: State, id: DrinkId) {
  const d = drinks.find((d) => d.id === id);
  if (!s.foundTVSeeds || !d || s.cash < d.cost) return false;
  s.cash -= d.cost;
  s.drink = { id, remaining: d.seconds };
  s.events.push(`Bought ${d.name} at Grindset.`);
  return true;
}
export function coinName(raw: string) {
  const name = raw.trim().replace(/\s+/g, " ");
  return /^[\p{L}\p{N}][\p{L}\p{N} .'-]{0,23}$/u.test(name) ? name : null;
}
export function createCoin(s: State, raw: string) {
  const name = coinName(raw);
  if (!name || s.coin || !s.foundTVSeeds || !s.communityPlanted) return false;
  s.coin = {
    name,
    price: 100,
    exactPrice: 100,
    units: 0,
    invested: 0,
    rng: 97213,
    elapsed: 0,
    history: [100],
  };
  s.events.push(`Named my pretend coin ${name}.`);
  return true;
}
export function investCoin(s: State, amount: number) {
  if (!s.coin || !Number.isSafeInteger(amount) || amount < 1 || amount > s.cash)
    return false;
  const units = Math.floor((amount * 1_000_000) / s.coin.price);
  if (
    !units ||
    !Number.isSafeInteger(s.coin.invested + amount) ||
    !Number.isSafeInteger(s.coin.units + units) ||
    s.coin.units + units > 1e10
  )
    return false;
  s.cash -= amount;
  s.coin.units += units;
  s.coin.invested += amount;
  s.events.push(`Invested $${(amount / 100).toFixed(2)} in my pretend coin.`);
  return true;
}
export const coinValue = (s: State) =>
  s.coin ? Math.floor((s.coin.units * s.coin.price) / 1_000_000) : 0;
export function sellCoin(s: State, amount?: number) {
  if (!s.coin || !s.coin.units) return false;
  const holding = coinValue(s);
  const value = amount ?? holding;
  if (
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > holding ||
    !Number.isSafeInteger(s.cash + value)
  )
    return false;
  const sold =
    value === holding
      ? s.coin.units
      : Math.ceil((value * 1_000_000) / s.coin.price);
  s.cash += value;
  s.coin.units -= sold;
  s.events.push(`Sold my pretend coin for $${(value / 100).toFixed(2)}.`);
  return true;
}
// These are game signals, not a simulation of actual finance. Noise dominates drift.
export function marketSignals(s: State) {
  const chats = Object.entries(s.neighborChats).filter(
    ([id, n]) => /^(npc\d|sigma-chad-\d|grindset)$/.test(id) && n > 0,
  ).length;
  const managed = s.plots.filter((p) =>
    ["planted", "growing", "ready"].includes(p.stage),
  ).length;
  const good = healthDay(s.day).good;
  return {
    earned: s.totalEarned ?? 0,
    saved: s.bank,
    neighbors: chats,
    trees: managed,
    health: good,
    longestGoodStreak: healthDay(s.day).longest,
  };
}
export function healthDay(day: number) {
  // First twenty days retain the established activity schedule. Later days vary.
  const pattern = [
    true,
    true,
    false,
    true,
    false,
    false,
    true,
    true,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    true,
    true,
  ];
  if (day <= 20)
    return {
      good: day % 2 === 0,
      ordinal: Math.floor(day / 2),
      longest: day >= 2 ? 1 : 0,
    };
  const n = day - 21,
    cycles = Math.floor(n / pattern.length),
    tail = n % pattern.length;
  const ordinal =
    10 +
    cycles * pattern.filter(Boolean).length +
    pattern.slice(0, tail + 1).filter(Boolean).length;
  let streak = 1,
    longest = 1;
  const history =
    cycles >= 2
      ? pattern.concat(pattern)
      : cycles
        ? pattern.concat(pattern.slice(0, tail + 1))
        : pattern.slice(0, tail + 1);
  for (const good of history) {
    streak = good ? streak + 1 : 0;
    longest = Math.max(longest, streak);
  }
  return { good: pattern[tail], ordinal, longest };
}
export function tickSigma(s: State, dt: number) {
  if (!Number.isFinite(dt) || dt <= 0) return;
  if (s.drink) {
    s.drink.remaining = Math.max(0, s.drink.remaining - dt);
    if (!s.drink.remaining) delete s.drink;
  }
  if (!s.coin) return;
  const c = s.coin;
  c.elapsed = Math.min(10800, c.elapsed + dt);
  // Bound catch-up work, preserving the remainder. Active play / sleep only.
  const steps = Math.min(720, Math.floor(c.elapsed / 15));
  c.elapsed -= steps * 15;
  const q = marketSignals(s),
    drift =
      Math.min(
        0.012,
        q.earned / 1e8 +
          q.saved / 1e8 +
          q.neighbors * 0.0002 +
          q.trees * 0.00015 +
          q.longestGoodStreak * 0.0001,
      ) + (q.health ? 0.001 : -0.001);
  for (let i = 0; i < steps; i++) {
    c.rng = (c.rng * 16807) % 2147483647;
    c.exactPrice = Math.max(
      1,
      Math.min(
        100000,
        (c.exactPrice ?? c.price) *
          (1 + (c.rng / 2147483647 - 0.5) * 0.16 + drift),
      ),
    );
    c.price = Math.round(c.exactPrice);
    c.history.push(c.price);
    c.history = c.history.slice(-24);
  }
}
const roles = [
  [
    "Wake up before your alarm. Then apologize to it for outperforming.",
    "My morning routine has its own morning routine.",
    "I schedule my leisure time in a spreadsheet.",
    "Success starts with shoes. I own two.",
    "The mirror is my accountability partner.",
    "Never follow the crowd. Unless it is heading to lunch.",
    "I call walking to the mailbox a strategic retreat.",
    "I have optimized my nod. It takes half a second.",
    "My shoulders carry my entire personal brand.",
    "I do not chase validation. I power-walk after it.",
    "Every setback is a podcast episode I have not recorded.",
    "I told my pillow I am moving on.",
  ],
  [
    "A community garden? Sharing soil is not very sigma.",
    "I prefer lone-wolf gardening. The carrots find it lonely.",
    "Ten beds and no CEO? This garden lacks leadership.",
    "Helping people grow food is suspiciously cooperative.",
    "A true lone wolf waters nobody else’s plot. That is why mine died.",
    "I tried to disrupt photosynthesis. The trees were unimpressed.",
    "Community soil does not appear on my balance sheet.",
    "I planted a business plan. Nothing grew.",
    "Those dead trees are waiting for a pivot.",
    "I call weeds unsolicited growth opportunities.",
    "Watering together would be collectivist hydration.",
    "If everyone benefits, who gets to brag?",
  ],
  [
    "Doge architecture. Such house. Many mortgage.",
    "My roof is bullish. The gutters are bearish.",
    "I call my front door a decentralized entrance.",
    "My dog has a stronger portfolio than me. Mostly sticks.",
    "The best investment I made was a warm blanket. Do not quote me.",
    "I bought a dip. It was onion flavored.",
    "My dog refuses to network unless snacks are involved.",
    "Much discipline. Very spreadsheet. Wow.",
    "I asked the dog for financial advice. He rolled over.",
    "I diversified into chew toys.",
    "The dog is my cofounder. He owns all the cushions.",
    "My house has floppy ears. That is my competitive moat.",
  ],
  [
    "Pepe taught me to stay green. The paint bill is substantial.",
    "I meditate beside my lily pad. It is a welcome mat.",
    "A frog never explains its grind. It just sits there.",
    "My amphibious mindset adapts to rain.",
    "I leap toward opportunity. Usually a fly.",
    "My pond is liquid capital. Literally liquid.",
    "The market croaks. I listen.",
    "My vision board is green construction paper.",
    "I hired a fly as a consultant. Very brief engagement.",
    "I practice stillness until something tasty goes past.",
    "The lily pad is my satellite office.",
    "I believe in growth. Specifically algae.",
  ],
  [
    "Hawk mindset. Look far ahead. Check for windows.",
    "My catchphrase is my entire business plan.",
    "A winged roof means I am scaling.",
    "I fly solo. Except when I need someone to hold the ladder.",
    "Brand recognition is mostly people saying what is that house.",
    "I built a nest egg. The hawk moved in.",
    "Keep your eyes on the horizon and your feet off my flowerbed.",
    "I do not follow trends. I perch above them.",
    "The roof has wings. The house still refuses to take off.",
    "My elevator pitch is a bird noise.",
    "I aim high, especially when repairing the chimney.",
    "Going viral is easier than fixing a leaking roof.",
  ],
  [
    "Throw a dollar to the lone wolf. It will silently judge your allocation.",
    "The wolf is howling because nobody installed a coffee machine.",
    "Luck has no receipts. That should concern you.",
    "I tried to manifest a second statue. Still one.",
    "My spirit animal is a wolf with a calendar app.",
    "Even lone wolves need dental appointments.",
    "A pack is just a networking event with teeth.",
    "The statue is my mentor. Very low maintenance.",
    "I asked the moon for a promotion. No response.",
    "The wolf never clocks out. It is made of stone.",
    "A dollar buys a wish. Results remain exactly the same.",
    "The moon is not a key performance indicator.",
  ],
  [
    "Welcome to Grindset. We grind beans and unrealistic expectations.",
    "My espresso machine is the hardest-working Chad here.",
    "Buy a drink, get a temporary competitive advantage. The cup is reusable.",
    "I call decaf a strategic deload.",
    "A community garden is not very sigma. Your planting is entrepreneurial, though. Funny how that works.",
    "I put a growth chart next to the milk frother.",
    "My coffee has a three-minute business plan.",
    "An empty cup is just capacity waiting to be monetized.",
    "I tried accepting motivational quotes as payment. The rent disagreed.",
    "Our beans are independently minded. Still have to grind them.",
    "I call cleaning the counter optimizing the customer journey.",
    "My new cryptocurrency has no caffeine. Very different investment.",
  ],
];
const moreRoleLines = [
  [
    "I timed my morning stretch. Then spent twice as long writing the result down.",
    "My to-do list includes making a shorter to-do list.",
    "I call a nap horizontal strategy.",
    "The gym mirror does not subscribe to my newsletter.",
    "I own a stopwatch but still miss the bus.",
    "I stopped saying hustle to the toaster. It burns the bread anyway.",
    "A lone wolf needs someone to spot him at the gym. Awkward branding.",
    "I put my goals on sticky notes. Now I cannot see the window.",
  ],
  [
    "I refuse communal watering cans. Mine is empty, but independent.",
    "Sharing compost is not very sigma. Buying compost together is apparently a startup.",
    "I wrote keep off on my plot. Nothing else grows there either.",
    "I asked these trees for quarterly results. They gave me splinters.",
    "The community garden has no subscription tier. Missed opportunity.",
    "I called the soil underperforming. It remained soil.",
    "I will not join a watering rota. I do keep borrowing the hose.",
    "The sprouts have no personal brand. Somehow they manage.",
  ],
  [
    "The dog ate my prospectus. His strongest analysis yet.",
    "My house looks excited when I come home. That helps.",
    "I tried explaining scarcity to a dog with twelve tennis balls.",
    "My dog diversifies into every muddy puddle.",
    "The welcome mat says wow. Saves me a lot of introductions.",
    "I call fetching sticks asset retrieval.",
    "The dog sleeps through market updates. I envy him.",
    "My best business partner works for biscuits.",
  ],
  [
    "My green door is camouflage for unpaid invoices.",
    "I asked the frog to pivot. It faced the other way.",
    "A lily pad has an excellent work-life balance.",
    "My fountain is a cash flow problem without the cash.",
    "I renamed the pond liquidity management. It still needs cleaning.",
    "I scheduled a leap of faith. The frog arrived early.",
    "I do not cry over red candles. I sulk in a green house.",
    "An amphibian has two habitats. That is diversification.",
  ],
  [
    "A catchy name is easier to make than a useful product.",
    "I bought a microphone before I worked out what to say.",
    "My brand strategy is a cap and remarkable confidence.",
    "I posted a motivational video. My uncle asked me to fix his gutter.",
    "The house is recognisable. The plumber charged extra for that.",
    "I tried monetizing an echo. It repeated the offer.",
    "My audience engagement is mostly people asking about the roof.",
    "I have a slogan. The rest of the business is still loading.",
  ],
  [
    "The wolf has not answered my business proposal. Excellent boundaries.",
    "I offered the statue equity. It preferred standing still.",
    "The moon has never once endorsed my morning routine.",
    "I howled for motivation. A neighbour shut the window.",
    "That dollar is a luck budget with no audit trail.",
    "I track my wishes in a spreadsheet. The returns are unclear.",
    "A lone wolf statue is heavy. Took several of us to move it.",
    "I called the moon my north star. Someone corrected me.",
  ],
  [
    "I adjusted the grinder. That is an actual grindset achievement.",
    "Foam art is branding you can accidentally drink.",
    "The coffee queue is my only reliable growth chart.",
    "I tried calling a small cup premium scarcity. Nobody was fooled.",
    "I name drinks after finance. The sugar still costs extra to buy.",
    "I rinse the cups myself. A very hands-on founder.",
    "Customers keep asking for good coffee instead of a motivational speech.",
    "My most successful investment is the dishcloth.",
  ],
];
roles.forEach((lines, i) => lines.push(...moreRoleLines[i]));
export const chadLibrary = roles.map((lines) => [...lines]);
export function chadLine(s: State, id: string) {
  const role =
    id === "grindset"
      ? 6
      : Math.min(5, Math.max(0, Number(id.split("-").at(-1))));
  const count = s.neighborChats[id] ?? 0;
  s.neighborChats[id] = count + 1;
  const pool = chadLibrary[role];
  return pool[count % pool.length];
}
export function validCoin(c: unknown): c is Coin {
  if (!c || typeof c !== "object") return false;
  const x = c as Coin;
  return (
    typeof x.name === "string" &&
    coinName(x.name) === x.name &&
    Number.isInteger(x.price) &&
    x.price >= 1 &&
    x.price <= 100000 &&
    (x.exactPrice === undefined ||
      (Number.isFinite(x.exactPrice) &&
        x.exactPrice >= 1 &&
        x.exactPrice <= 100000)) &&
    Number.isSafeInteger(x.units) &&
    x.units >= 0 &&
    x.units <= 1e10 &&
    Number.isSafeInteger(x.invested) &&
    x.invested >= 0 &&
    Number.isInteger(x.rng) &&
    x.rng > 0 &&
    x.rng < 2147483647 &&
    Number.isFinite(x.elapsed) &&
    x.elapsed >= 0 &&
    x.elapsed < 10815 &&
    Array.isArray(x.history) &&
    x.history.length <= 24 &&
    x.history.every((n) => Number.isInteger(n) && n >= 1 && n <= 100000)
  );
}
