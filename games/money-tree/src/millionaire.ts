import { childReport } from "./child-reports";
import { purchasePrice } from "./meals";
import type { State } from "./game";
import { mountainPlots, fertileMountainSoil } from "./millionaire-land";
export const fellowships = [
  {
    id: "arms",
    name: "Massive Investment Arms",
    mascot: "Octavia",
    color: "#cf8cc9",
    invitation:
      "A family, a purpose, and eight helping hands. Come build something lasting with us.",
    tithe:
      "Our family sets aside a tenth to support the work. Stewardship means putting your resources behind your convictions.",
  },
  {
    id: "bridge",
    name: "Bridge to Total Freedom",
    mascot: "Zeno",
    color: "#81bcae",
    invitation:
      "You are more than your circumstances. Come discover your limitless potential with us.",
    tithe:
      "Each contribution supports another step on the bridge. A tenth of your earnings helps our children pursue their next level.",
  },
  {
    id: "fire",
    name: "Breath of Fire",
    mascot: "Lotus & Ember",
    color: "#e3a762",
    invitation:
      "Breathe. Move. Make room for change. Come find your balance with us.",
    tithe:
      "Money is a tangible form of energy. Holding it too tightly creates blocks. Giving a tenth opens the floodgates, allowing that energy to flow.",
  },
] as const;
export type Fellowship = (typeof fellowships)[number]["id"];
export const fellowship = (id: Fellowship) =>
  fellowships.find((f) => f.id === id)!;
export type Millionaire = {
  afterPepe: number;
  unlocked: boolean;
  answers: number[];
  result?: Fellowship;
  member?: Fellowship;
  welcomeSeed: boolean;
  summitSeeds: boolean;
  titheAccepted: boolean;
  mountainEarned: number;
  tithed: number;
  apps: number[];
  chats: Record<string, number>;
};
export function newMillionaire(): Millionaire {
  return {
    afterPepe: 0,
    unlocked: false,
    answers: [],
    welcomeSeed: false,
    summitSeeds: false,
    titheAccepted: false,
    mountainEarned: 0,
    tithed: 0,
    apps: [],
    chats: {},
  };
}
// Older saves did not have the Level 3 ledger. Recover only earnings whose
// position in the journal proves they happened after the balloon burst.
export function migrateMillionaire(s: State) {
  if (!s.pepePopped || s.millionaire) return false;
  s.millionaire = newMillionaire();
  let observedPop = false,
    earned = 0;
  const history = [
    ...new Map((s.journalHistory ?? []).map((day) => [day.day, day])).values(),
  ].sort((a, b) => a.day - b.day);
  for (const day of history) {
    if (observedPop) earned += day.earned;
    else {
      const pop = day.events.findIndex((event) =>
        event.startsWith("The giant Pepe balloon popped."),
      );
      if (pop >= 0) {
        observedPop = true;
        // Historical event lists deduplicate equal harvests. Counting just the
        // known post-pop entries is conservative for the boundary day.
        earned += harvestAmounts(day.events.slice(pop + 1));
      }
    }
  }
  const pop = s.events.findIndex((event) =>
    event.startsWith("The giant Pepe balloon popped."),
  );
  if (observedPop || pop >= 0)
    earned += harvestAmounts(s.events.slice(observedPop ? 0 : pop + 1));
  if (Number.isSafeInteger(earned) && earned > 0) recordEarnings(s, earned);
  return true;
}
function harvestAmounts(events: string[]) {
  return events.reduce((total, event) => {
    const value = event.match(/^Harvested \$(\d+(?:\.\d{2})?)/)?.[1];
    const amount = value === undefined ? 0 : Math.round(Number(value) * 100);
    return total + (Number.isSafeInteger(amount) && amount > 0 ? amount : 0);
  }, 0);
}
export function markPepeBaseline(s: State) {
  s.millionaire ??= newMillionaire();
}
export function recordEarnings(
  s: State,
  gross: number,
  mountain = false,
  treeIncome = true,
) {
  if (!Number.isSafeInteger(gross) || gross <= 0) return 0;
  const m = s.millionaire;
  if (!m) return gross;
  if (s.pepePopped) {
    m.afterPepe += gross;
    if (!m.unlocked && m.afterPepe >= 10000) {
      m.unlocked = true;
      s.events.push(
        "After earning $100 since Pepe popped, a gap opened behind Sigma Town. A path leads into a grove of willows.",
      );
    }
  }
  if (mountain && m.member) {
    const before = mansionCount(m);
    m.mountainEarned += gross;
    const after = mansionCount(m);
    if (after > before)
      s.events.push(
        childReport(after - before, after, fellowship(m.member!).name),
      );
  }
  const tithe =
    treeIncome && m.member && m.titheAccepted ? Math.round(gross / 10) : 0;
  if (tithe) {
    m.tithed += tithe;
    s.events.push(
      `Contributed ${(tithe / 100).toFixed(2)} dollars to the Children of ${fellowship(m.member!).name}.`,
    );
  }
  return gross - tithe;
}
export const assessment = [
  [
    "A surprise $50 arrives. Your first thought?",
    "Put it toward the family plan.",
    "Invest in a course that changes my future.",
    "Make space for a restorative experience.",
  ],
  [
    "How do you decide what to save for?",
    "A clear goal we agree on together.",
    "The next level of personal growth.",
    "Whatever brings my life back into balance.",
  ],
  [
    "A neighbor asks for help with a project.",
    "Let’s organize a dependable team.",
    "I want to learn a new skill while helping.",
    "I’ll bring energy and listen to what’s needed.",
  ],
  [
    "What makes an opportunity feel trustworthy?",
    "People who live by shared principles.",
    "A system that promises measurable progress.",
    "A practice that feels connected to nature.",
  ],
  [
    "Your money tree has a disappointing harvest.",
    "Follow the plan; consistency matters.",
    "Find the hidden limitation and work on it.",
    "Take a breath, move, then try again.",
  ],
  [
    "How would you celebrate a big achievement?",
    "Dinner with everyone who helped.",
    "Set an ambitious new personal milestone.",
    "A long walk somewhere beautiful.",
  ],
  [
    "A mentor offers guidance. What draws you in?",
    "Certainty and a lasting community.",
    "Tools for becoming a better version of myself.",
    "Transformation through movement and awareness.",
  ],
  [
    "How do you prefer to earn money?",
    "Build useful things with reliable people.",
    "Develop skills that unlock new possibilities.",
    "Work in a way that supports a healthy life.",
  ],
  [
    "Your schedule is suddenly empty.",
    "Make time for family and service.",
    "Study something I’ve always wanted to master.",
    "Exercise outdoors and recharge.",
  ],
  [
    "What would make giving money feel meaningful?",
    "Supporting a community with shared standards.",
    "Helping others advance through a learning system.",
    "Keeping resources flowing instead of clinging.",
  ],
  [
    "Which advice would you put on your wall?",
    "Build a life you can share.",
    "Your circumstances don’t define your potential.",
    "Stay rooted; keep moving.",
  ],
  [
    "What do you want success to feel like?",
    "Belonging, stability, and a clear purpose.",
    "Freedom, confidence, and continuous improvement.",
    "Balance, vitality, and a deeper connection.",
  ],
] as const;
export function answerAssessment(s: State, answer: number) {
  const m = s.millionaire;
  if (
    !m?.unlocked ||
    !Number.isInteger(answer) ||
    answer < 0 ||
    answer > 2 ||
    m.answers.length >= assessment.length
  )
    return false;
  m.answers.push(answer);
  if (m.answers.length === assessment.length) {
    const scores = [0, 0, 0];
    m.answers.forEach((a) => scores[a]++);
    // Stable first-answer tie break rather than quietly favouring one fellowship.
    const maximum = Math.max(...scores);
    const winner = m.answers.find((a) => scores[a] === maximum)!;
    m.result = fellowships[winner].id;
    s.events.push(
      `The willow-grove assessment matched me with ${fellowship(m.result).name}.`,
    );
  }
  return true;
}
export function retakeAssessment(s: State) {
  if (!s.millionaire?.unlocked) return false;
  s.millionaire.answers = [];
  delete s.millionaire.result;
  return true;
}
export function joinFellowship(s: State, id: Fellowship) {
  const m = s.millionaire;
  if (!m || m.result !== id || m.member === id) return false;
  if (m.member && (m.titheAccepted || m.chats["visited-summit"])) {
    (s.adventure ??= {}).churchChange = { from: m.member, heardBy: [] };
  }
  m.member = id;
  ensureMountainPlots(s);
  if (!m.welcomeSeed) {
    m.welcomeSeed = true;
    s.seeds++;
  }
  s.events.push(
    `Joined ${fellowship(id).name} and received a membership card.`,
  );
  return true;
}
export function acceptTithe(s: State) {
  const m = s.millionaire;
  if (!m?.member || m.titheAccepted) return false;
  m.titheAccepted = true;
  if (!m.summitSeeds) {
    m.summitSeeds = true;
    s.seeds += 25;
  }
  s.events.push(
    `Agreed to contribute 10% of Money Tree earnings to the Children of ${fellowship(m.member).name}; received 25 seed packets.`,
  );
  return true;
}
export const mansionCount = (m?: Millionaire) =>
  m ? Math.min(6, Math.floor(m.mountainEarned / (100000 / 6))) : 0;
export const appNames = [
  "Holy Snake",
  "Blessed Pong",
  "Faithful Frog",
  "Brick Revelation",
  "Memory Ministry",
  "Heavenly Catch",
];
export function ensureMountainPlots(s: State) {
  if (!s.millionaire?.member) return false;
  let changed = false;
  // Older saves could contain freely placed sites outside the smaller terraces.
  for (const p of s.plots.filter((p) => p.mountain)) {
    if (!fertileMountainSoil(p.x!, p.z!)) {
      const site = mountainPlots.find(
        (q) =>
          !s.plots.some(
            (other) => other.mountain && other.x === q.x && other.z === q.z,
          ),
      );
      if (site) {
        p.x = site.x;
        p.z = site.z;
        changed = true;
      }
    }
    if (p.stage === "planted") {
      p.stage = "growing";
      p.remaining = p.fertilized ? 120 : 180;
      changed = true;
    }
  }
  const missing = mountainPlots
    .filter(
      (q) => !s.plots.some((p) => p.mountain && p.x === q.x && p.z === q.z),
    )
    .slice(0, Math.max(0, 180 - s.plots.filter((p) => p.mountain).length));
  if (!missing.length) return changed;
  s.plots.push(
    ...missing.map(({ x, z }) => ({
      x,
      z,
      mountain: true,
      soilFilled: true,
      stage:
        mountainPlots.findIndex((p) => p.x === x && p.z === z) >= 100
          ? ("ready" as const)
          : ("harvested" as const),
      remaining: 0,
      fertilized: false,
      yield:
        mountainPlots.findIndex((p) => p.x === x && p.z === z) >= 100 ? 700 : 0,
    })),
  );
  return true;
}
export function addMountainPlot(s: State, x: number, z: number) {
  if (
    !s.millionaire?.titheAccepted ||
    s.plots.filter((p) => p.mountain).length >= 180 ||
    !Number.isFinite(x) ||
    !Number.isFinite(z) ||
    !fertileMountainSoil(x, z) ||
    s.plots.some((p) => p.x !== undefined && Math.hypot(p.x - x, p.z! - z) < 2)
  )
    return false;
  s.plots.push({
    x,
    z,
    mountain: true,
    soilFilled: true,
    stage: "harvested",
    remaining: 0,
    fertilized: false,
    yield: 0,
  });
  return true;
}
export function buyApp(s: State, index: number) {
  const m = s.millionaire;
  if (
    !m?.member ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= mansionCount(m) ||
    m.apps.includes(index) ||
    s.cash < purchasePrice(s, 500)
  )
    return false;
  s.cash -= purchasePrice(s, 500);
  m.apps.push(index);
  s.events.push(`Bought ${appNames[index]} for $5.`);
  return true;
}
export function validMillionaire(m: unknown): m is Millionaire {
  if (!m || typeof m !== "object") return false;
  const v = m as Millionaire;
  const id = (x: unknown) =>
    x === undefined || fellowships.some((f) => f.id === x);
  return (
    ["afterPepe", "mountainEarned", "tithed"].every(
      (k) => Number.isSafeInteger((v as any)[k]) && (v as any)[k] >= 0,
    ) &&
    ["unlocked", "welcomeSeed", "summitSeeds", "titheAccepted"].every(
      (k) => typeof (v as any)[k] === "boolean",
    ) &&
    Array.isArray(v.answers) &&
    v.answers.length <= assessment.length &&
    v.answers.every((a) => Number.isInteger(a) && a >= 0 && a < 3) &&
    id(v.result) &&
    id(v.member) &&
    (v.answers.length === assessment.length) === !!v.result &&
    (!v.member || (v.welcomeSeed && v.unlocked)) &&
    (!v.titheAccepted || !!v.member) &&
    (!v.mountainEarned || v.titheAccepted) &&
    (!v.tithed || v.titheAccepted) &&
    v.summitSeeds === v.titheAccepted &&
    (!v.unlocked || v.afterPepe >= 10000) &&
    Array.isArray(v.apps) &&
    new Set(v.apps).size === v.apps.length &&
    v.apps.every((a) => Number.isInteger(a) && a >= 0 && a < mansionCount(v)) &&
    !!v.chats &&
    typeof v.chats === "object" &&
    !Array.isArray(v.chats) &&
    Object.values(v.chats).every((a) => Number.isSafeInteger(a) && a >= 0)
  );
}

export const mountainRetailOpen = (s: State) =>
  !!(s.millionaire?.titheAccepted || s.millionaire?.chats["visited-summit"]);
