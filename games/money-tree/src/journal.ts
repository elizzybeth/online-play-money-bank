import type { State } from "./game";
import { hats, hatById } from "./hats";
export type JournalMemory = {
  day: number;
  events: string[];
  earned: number;
  available: number;
};
export type JournalContext = {
  day: number;
  page: number;
  events: string[];
  previous: string[];
  earned: number;
  available: number;
  cash: number;
  bank: number;
  remaining: number;
  daysNeeded: number | null;
  firstHarvest: boolean;
  boughtSeeds: boolean;
  hats: string[];
  worn: string | null;
  seed: number;
  garden: Record<string, number>;
  history: JournalMemory[];
  hasHarvested: boolean;
  inventory: {
    seeds: number;
    wateringCan: boolean;
    shovel: boolean;
    fertilizer: number;
  };
};
const dollars = (c: number) => `$${(c / 100).toFixed(2)}`;
export function journalContext(s: State): JournalContext {
  const earned = s.events
    .filter((e) => e.startsWith("Harvested"))
    .reduce(
      (n, e) => n + Math.round(Number(e.match(/\$([\d.]+)/)?.[1] ?? 0) * 100),
      0,
    );
  const available = s.cash + s.bank;
  const remaining = Math.max(0, 1_000_000 - available);
  return {
    day: s.day,
    page: s.journal.length,
    events: [...s.events],
    previous: [...s.journal],
    earned,
    available,
    cash: s.cash,
    bank: s.bank,
    remaining,
    daysNeeded: earned ? Math.ceil(remaining / earned) : null,
    firstHarvest: earned > 0 && !s.harvestReflected,
    boughtSeeds: s.boughtSeeds,
    hats: s.hats.map((id) => `${hatById(id)!.name}: ${hatById(id)!.power}`),
    worn: hatById(s.equippedHat)?.name ?? null,
    seed: Math.floor(Math.random() * 1_000_000_000),
    history: structuredClone((s.journalHistory ?? []).slice(-3)),
    hasHarvested: s.harvestReflected || earned > 0,
    inventory: {
      seeds: s.seeds,
      wateringCan: s.can,
      shovel: s.shovel,
      fertilizer: s.fertilizer,
    },
    garden: Object.fromEntries(
      ["empty", "planted", "growing", "ready", "harvested"].map((stage) => [
        stage,
        s.plots.filter((p) => p.stage === stage).length,
      ]),
    ),
  };
}
export function validJournalContext(c: unknown): c is JournalContext {
  if (!c || typeof c !== "object") return false;
  const x = c as JournalContext;
  const valid =
    !!x.inventory &&
    Number.isSafeInteger(x.inventory.seeds) &&
    x.inventory.seeds >= 0 &&
    Number.isSafeInteger(x.inventory.fertilizer) &&
    x.inventory.fertilizer >= 0 &&
    typeof x.inventory.wateringCan === "boolean" &&
    typeof x.inventory.shovel === "boolean" &&
    Array.isArray(x.history) &&
    x.history.every(validJournalMemory) &&
    typeof x.hasHarvested === "boolean" &&
    !!x.garden &&
    Object.values(x.garden).every(
      (n) => Number.isSafeInteger(n) && n >= 0 && n <= 5,
    ) &&
    [
      x.day,
      x.page,
      x.earned,
      x.available,
      x.cash,
      x.bank,
      x.remaining,
      x.seed,
    ].every((n) => Number.isSafeInteger(n) && n >= 0) &&
    x.day > 0 &&
    x.page > 0 &&
    (x.daysNeeded === null ||
      (Number.isSafeInteger(x.daysNeeded) && x.daysNeeded >= 0)) &&
    typeof x.firstHarvest === "boolean" &&
    typeof x.boughtSeeds === "boolean" &&
    [x.events, x.previous, x.hats].every(
      (a) =>
        Array.isArray(a) &&
        a.length <= 5000 &&
        a.every((v) => typeof v === "string" && v.length <= 20000),
    ) &&
    (x.worn === null || typeof x.worn === "string");
  if (!valid) return false;
  const earned = x.events
    .filter((e) => e.startsWith("Harvested"))
    .reduce(
      (n, e) => n + Math.round(Number(e.match(/\$([\d.]+)/)?.[1] ?? 0) * 100),
      0,
    );
  return (
    x.available === x.cash + x.bank &&
    x.remaining === Math.max(0, 1_000_000 - x.available) &&
    x.earned === earned &&
    x.daysNeeded === (earned ? Math.ceil(x.remaining / earned) : null) &&
    (!x.firstHarvest || (earned > 0 && x.hasHarvested)) &&
    (!earned || x.hasHarvested) &&
    Object.keys(x.garden).length === 5 &&
    ["empty", "planted", "growing", "ready", "harvested"].every((k) =>
      Number.isSafeInteger(x.garden[k]),
    ) &&
    Object.values(x.garden).reduce((a, b) => a + b, 0) === 5
  );
}
export function validJournalMemory(x: unknown): x is JournalMemory {
  if (!x || typeof x !== "object") return false;
  const m = x as JournalMemory;
  return (
    [m.day, m.earned, m.available].every(
      (n) => Number.isSafeInteger(n) && n >= 0,
    ) &&
    Array.isArray(m.events) &&
    m.events.every((e) => typeof e === "string" && e.length <= 10000)
  );
}
export function rememberDay(s: State): JournalMemory {
  const c = journalContext(s);
  return {
    day: c.day,
    earned: c.earned,
    available: c.available,
    events: [...new Set(c.events)],
  };
}
export const journalVoice = `Write a private diary entry by an eleven-year-old boy whose mom is ill. Her operation is expensive. He has found seeds that grow real dollar bills. Write in his voice, with contractions and ordinary words. Let him notice what matters to him and wonder about it. Mix sentence lengths naturally. He does not need to end with a lesson or a promise. It is bedtime at home. The home garden contains only five money-tree plots, with no vegetable crops. Seeds start growing only after watering. Hat powers work only while the hat is worn. He already knows the operation goal, which the notebook includes below; he worries about reaching it, not about what it costs.
Stay true to the supplied events. Ordinary details inherent in those actions are allowed, such as looking at a planted garden or counting harvested bills. Do not add conversations, reactions from Mom, symptoms, medical details, purchases, gardening actions, or magic powers. His fears, wishes, and unanswered questions are his own. No headings, em dashes, motivational slogans, or metaphors. Do not repeat earlier wording. Output only the entry body. Use {{income}}, {{total}}, {{cash}}, {{bank}}, or {{goal}} for money amounts. The notebook includes the first-harvest arithmetic and first-night seed costs separately.`;

export function journalPrompt(c: JournalContext): string {
  const history = c.history.slice(-4).map((m) => ({
    day: m.day,
    facts: m.events.map((e) => e.replace(/\$[\d.]+/g, "money")),
  }));
  return JSON.stringify({
    stage: c.firstHarvest
      ? "firstHarvest"
      : c.hasHarvested
        ? "moneyAlreadyProven"
        : c.boughtSeeds
          ? "unprovenSeeds"
          : "beforeSeeds",
    pastDays: history,
    ownedHats: c.hats,
    wearing: c.worn,
    currentFacts: c.events.map((e) => e.replace(/\$[\d.]+/g, "money")),
    rules: [
      "A planted seed grows after watering. Watering again does not speed it up.",
      "Only owned hats exist in this story. Never invent a hat or a power.",
    ],
  });
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export function writingIssues(
  body: string,
  c: JournalContext,
  part = false,
  repetitionBody = body,
): string[] {
  const issues: string[] = [];
  if (
    /\b(?:my|our) (?:tomato|carrot|potato|cabbage|vegetable|corn|lettuce)\b/i.test(
      body,
    )
  )
    issues.push(
      "The home garden has only money-tree plots, not vegetable crops.",
    );
  if (
    /(?:these|money|the) seeds.{0,45}(?:only|just) need.{0,20}air|grow.{0,20}without (?:any )?water/i.test(
      body,
    )
  )
    issues.push("Money seeds require watering to start growing.");
  if (
    /wish I knew how much money I (?:needed|need)|don[’']t know (?:what|how much) (?:the operation|Mom[’']s operation|it) costs/i.test(
      body,
    )
  )
    issues.push(
      "He already knows the operation goal. Worry about reaching it rather than not knowing the cost.",
    );
  const words = body.trim().split(/\s+/).length;
  if (words < (part ? 15 : 45) || words > (part ? 90 : 230))
    issues.push("Keep to the requested paragraph length, at least 15 words.");
  if (
    /[—–]|\*|^\s*#|^\s*Day \d|<[^>]+>|Her actual words|Heard Mom:|Observed fact|STORY MEMORY/i.test(
      body,
    )
  )
    issues.push("No dashes, markup, or headings.");
  if (
    /drop in the bucket|glimmer of hope|heavy heart|heart.{0,15}heavy|little did I know|one step closer|\bjourney\b|tapestry|testament|\breminder\b|bittersweet|resilien|amidst|couldn[’']t help but|not (?:just|only)[^.!?\n]{0,70}but|silver lining|in that moment|a beginning|only time will tell|sense of (?:hope|purpose|accomplishment)/i.test(
      body,
    )
  )
    issues.push("Remove stock AI phrases and adult inspirational language.");
  if (
    !c.hats.length &&
    /\bhat\b|\bcap\b/i.test(body) &&
    !c.events.some((e) => e.startsWith("Found five"))
  )
    issues.push("He owns no hat. Do not invent one, even in a plan.");
  for (const hat of hats)
    if (
      body.includes(hat.name) &&
      !c.hats.some((h) => h.startsWith(hat.name + ":")) &&
      !c.events.some((e) => e.includes(hat.name))
    )
      issues.push(`He does not own the ${hat.name}.`);
  if (
    /water.{0,45}(?:faster|speed|more money)|(?:faster|speed).{0,35}water/i.test(
      body,
    )
  )
    issues.push(
      "Watering again does not make trees grow faster or produce more money.",
    );
  if (
    c.hasHarvested &&
    !c.firstHarvest &&
    /(?:will|might|can|could) (?:they |these |the trees )?(?:really |actually )?(?:grow|make|produce) money|whether.{0,30}(?:grow|make) money/i.test(
      body,
    )
  )
    issues.push(
      "Money trees already proved real. Reflect on today's work rather than discovering them again.",
    );
  if (
    c.day === 1 &&
    /for (?:days|weeks)|yesterday|last night|past few days|another day/.test(
      body,
    )
  )
    issues.push("This is the first day; do not invent earlier gardening days.");
  if (
    c.garden.growing > 0 &&
    /nothing.{0,20}grow|nothing.{0,20}changed/.test(body)
  )
    issues.push(
      "A watered tree is already growing. Waiting for bills is different from nothing growing.",
    );
  const observedMom = c.events.some((e) =>
    /^(Mom had energy|Mom was exhausted)/.test(e),
  );
  if (
    !observedMom &&
    /(?:Mom|She|she|Her|her) (?:looked|was|seemed|looks|eyes were).{0,20}(?:tired|exhausted|on the couch|sunken)|her face was|her eyes looked/.test(
      body,
    )
  )
    issues.push(
      "No Mom condition was observed; do not invent one from a simple greeting.",
    );
  const previous = c.previous.map(normalize);
  const current = normalize(repetitionBody).split(" ");
  for (let i = 0; i + 8 <= current.length; i++) {
    const phrase = current.slice(i, i + 8).join(" ");
    // Required numerical facts may recur; emotional/action prose may not.
    if (!/\d/.test(phrase) && previous.some((p) => p.includes(phrase))) {
      issues.push("Rewrite the repeated eight-word phrase: " + phrase);
      break;
    }
  }
  const amounts = new Set([
    "$10,000.00",
    "$10000.00",
    dollars(c.earned),
    dollars(c.available),
    dollars(c.cash),
    dollars(c.bank),
    dollars(c.remaining),
    ...(c.boughtSeeds ? ["$2.00", "$4.33"] : []),
    ...[...c.events, ...c.hats].flatMap(
      (e) => e.match(/\$[\d,]+(?:\.\d{2})?/g) ?? [],
    ),
  ]);
  const wordNumbers: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };
  const allowedCents = new Set(
    [...amounts].map((n) => Math.round(Number(n.replace(/[$,]/g, "")) * 100)),
  );
  if (
    (body.match(/\$[\d,]+(?:\.\d{2})?/g) ?? []).some(
      (n) =>
        !allowedCents.has(Math.round(Number(n.replace(/[$,]/g, "")) * 100)),
    )
  )
    issues.push(
      "Use only the supplied money amounts; $10,000 is the operation goal, not current savings.",
    );
  for (const match of body.matchAll(
    /(?:^|[.!?]\s+)(?:I|We)(?:[’']ve)?\s+(?:(?:only|still|now|just)\s+)?(?:have|got|have saved)\s+(?:only\s+)?(\$[\d,]+(?:\.\d{2})?)([^.!?]{0,35})/g,
  )) {
    const amount = Math.round(Number(match[1].replace(/[$,]/g, "")) * 100),
      where = match[2];
    if (
      /\b(?:I|We) got \$/.test(match[0]) &&
      /today|harvest|from (?:the|a) tree/.test(where) &&
      amount === c.earned
    )
      continue;
    const actual = /piggy|bank|saved/.test(where)
      ? c.bank
      : /pocket|wallet/.test(where)
        ? c.cash
        : c.available;
    if (amount !== actual && !/started|used to|before|yesterday/.test(where))
      issues.push(
        `Current money is ${dollars(c.cash)} in pocket and ${dollars(c.bank)} in the piggy bank; do not confuse it with starting money or previous income.`,
      );
  }
  const priorSentences = c.previous.flatMap((p) =>
    p.split(/[.!?]+/).map(normalize),
  );
  if (
    repetitionBody
      .split(/[.!?]+/)
      .map(normalize)
      .some(
        (sentence) =>
          sentence.split(" ").length >= 3 &&
          !/\d/.test(sentence) &&
          priorSentences.includes(sentence),
      )
  )
    issues.push(
      "Rewrite copied sentences, even short ones like today's opening.",
    );

  for (const match of body.matchAll(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(?:bucks|dollars)\b/gi,
  ))
    if (
      !allowedCents.has(
        (wordNumbers[match[1].toLowerCase()] ?? Number(match[1])) * 100,
      )
    )
      issues.push(
        "Do not invent amounts written as words, including bucks or dollars.",
      );
  if (c.available > 0 && /spent all my money|used up all my money/i.test(body))
    issues.push("He still has money; do not say he spent all of it.");
  for (const [event, action] of [
    [
      "Watered",
      /I (?:kept )?watered|(?:I kept|I've been|I have been) watering/i,
    ],
    ["Planted", /I (?:just |finally )?planted/i],
    ["Fed", /I (?:just )?fertilized|I fed (?:the|a|my) tree/i],
  ] as const)
    if (
      !c.events.some((e) => e.startsWith(event)) &&
      action.test(body) &&
      !/yesterday|last night|before today/i.test(body)
    )
      issues.push(
        `Do not claim ${event.toLowerCase()} today; it did not happen today.`,
      );
  if (
    c.earned > 0 &&
    /didn[’']t (?:earn|make|get|harvest) (?:any )?money|still not sure.{0,50}(?:real|sticks)|not sure if they[’']re real|might actually work|don[’']t really have money/i.test(
      body,
    )
  )
    issues.push(
      "A harvest has confirmed real money. Do not repeat pre-harvest doubts or claim no income.",
    );
  if (
    c.events.some((e) => e.startsWith("Mom had energy for")) &&
    /Mom (?:was|looked|seemed).{0,20}(?:exhausted|worn out|on the couch)/i.test(
      body,
    ) &&
    !/yesterday|last night/i.test(body)
  )
    issues.push(
      "Mom had energy today; do not replace her observed condition with yesterday's tired day.",
    );
  if (
    c.earned === 0 &&
    /(?:harvested|earned|made|picked|collected|pulled|brought in)\s+(?:a total of\s+)?\$(?!0\.00)/i.test(
      body,
    )
  )
    issues.push("No money was harvested today.");
  if (
    c.earned === 0 &&
    !c.hasHarvested &&
    body
      .split(/[.!?]+/)
      .some(
        (sentence) =>
          /(?:I|we) (?:got|made|earned|harvested|collected|picked|pulled).{0,35}(?:money|bills)|(?:tree|trees|seeds) (?:really |actually )?(?:grew|gave|produced) (?:real )?(?:money|bills)|(?:I|we)(?:[’']re| are| got) (?:closer to|making progress toward)/i.test(
            sentence,
          ) &&
          !/hope|wish|what if|could|might|would|will|maybe|not sure/i.test(
            sentence,
          ),
      )
  )
    issues.push(
      "Do not claim a harvest or financial progress before it happens.",
    );
  if (
    /each seed.{0,20}\$2|\$2(?:\.00)?\s*(?:each|per seed)|buy(?:ing)? (?:a |the |her |mom.{0,5})?(?:new )?operation|(?:Robertson|Bea|Jun|Mabel).{0,15}(?:said|told|asked|promised)|doctor|hospital|appointment|diagnos/i.test(
      body,
    )
  )
    issues.push(
      "Do not invent dialogue or medical visits; $2 bought the whole seed bag, and an operation is medical care, not an item to buy.",
    );
  if (
    !c.events.some((e) => e.startsWith("Heard Mom:")) &&
    /Mom.{0,15}(?:said|told|asked|promised)/i.test(body)
  )
    issues.push("No Mom dialogue was recorded today; don't invent her words.");
  if (
    /I (?:hugged|gave Mom a hug|gave her a hug)|I gave Mom a (?:big )?hug|seed (?:bag|packet).{0,25}will (?:now )?(?:get|give|make).{0,20}\$/i.test(
      body,
    )
  )
    issues.push(
      "No hug or promised seed payout was recorded; don't invent those events.",
    );
  if (
    /I (?:showed|told|promised|asked) Mom|Mom (?:was|felt|seemed).{0,20}worried|she (?:looked|felt) (?:surprised|happy)|I (?:tried to )?cheer(?:ed)? her up/i.test(
      body,
    )
  )
    issues.push(
      "Do not invent conversations, showing Mom money, or her feelings; write the boy's own thoughts and the observed Mom activity.",
    );
  if (
    c.remaining > 0 &&
    /more than (?:what )?Mom needs|enough (?:money )?for (?:her|Mom.{0,3}) (?:operation|surgery)/i.test(
      body,
    )
  )
    issues.push(
      "The goal has not been reached; this harvest is smaller than the cost of surgery.",
    );
  if (
    /(?:I (?:just )?want|I can[’']t wait) to (?:get|go) home/i.test(body) &&
    !/tomorrow|next time|earlier|before|while I was out/i.test(body)
  )
    issues.push(
      "He is already home writing at bedtime; don't say he wants to get home now.",
    );
  if (
    /(?:picked|pulled up) (?:a|the|my) (?:withered |dollar |money )*tree/i.test(
      body,
    )
  )
    issues.push(
      "He picks bills off a tree, not the tree itself. It withers after harvesting.",
    );
  if (
    /\b(?:Mom|She|she) (?:said|told|asked)|I heard (?:Mom|her) say|Watering again (?:cannot|won't)|first day playing|(?:appearance|energy).{0,15}(?:not observed|not listed)/i.test(
      body,
    )
  )
    issues.push(
      "Write private reflection, not dialogue recitation, game rules, or prompt metadata.",
    );
  if (
    /hat list|symptoms listed|the rules say|zero hats|no hats yet|no hat (?:right now|today)|Her actual words|I wore it all day/i.test(
      body,
    )
  )
    issues.push(
      "Remove prompt metadata, unneeded empty-inventory reports, and invented durations.",
    );
  if (/grow(?:s)? back|tree.{0,20}come back to life/i.test(body))
    issues.push("Harvested trees do not grow back. A new seed is needed.");
  if (
    /mom.{0,25}(?:died|dead|cured|healthy again)|funeral|chemotherapy|cancer|doctor (?:said|told)|hospital (?:today|yesterday)|surgery (?:tomorrow|today)|operation (?:tomorrow|today)/i.test(
      body,
    )
  )
    issues.push("Do not invent medical events or a diagnosis.");
  if (!part && c.firstHarvest) {
    for (const fact of [
      dollars(c.earned),
      dollars(c.available),
      dollars(c.remaining),
    ])
      if (!body.includes(fact)) issues.push(`Include exact amount ${fact}.`);
    if (!/\$10,000(?:\.00)?|\$10000(?:\.00)?/.test(body))
      issues.push("Include the $10,000 surgery goal.");
    if (c.remaining && !body.includes(c.daysNeeded!.toLocaleString("en-US")))
      issues.push("Include the exact calculated number of remaining days.");
  }
  if (
    !part &&
    c.day === 1 &&
    c.boughtSeeds &&
    !c.earned &&
    (!/Auntie/i.test(body) ||
      !body.includes("$2.00") ||
      !body.includes("$4.33") ||
      !/better work/i.test(body))
  )
    issues.push(
      "Include the seed price, half the starting money, this better work, and Auntie.",
    );
  if (!part) {
    const bought = c.events
      .filter((e) => e.startsWith("Bought the "))
      .map((e) => e.slice("Bought the ".length, -1));
    const mom = c.events.find((e) => e.startsWith("Mom had energy for"));
    const activity = mom?.match(/Mom had energy for (\w+)/)?.[1];
    if (activity && !body.toLowerCase().includes(activity.replace(/ing$/, "")))
      issues.push(`Reflect on seeing Mom ${activity}.`);
    if (
      c.events.some((e) => e.includes("Mom was exhausted")) &&
      !/tired|exhausted|couch|worn out|resting/.test(body)
    )
      issues.push("Reflect on seeing Mom exhausted on the couch.");
    const focus = bought.includes(c.worn ?? "") ? c.worn : bought.at(-1);
    if (
      focus === "Whirligig" &&
      !/walk|run|move|travel|get around|get home/i.test(body)
    )
      issues.push(
        "Whirligig speeds walking and running; reflect on that actual power.",
      );
    if (focus && !body.includes(focus))
      issues.push(`Mention the new hat ${focus} and what it lets him do.`);
    if (
      c.events.some((e) => /^(Mom |Talked with Mom)/.test(e)) &&
      !/\bMom\b/.test(body)
    )
      issues.push("Reflect on seeing Mom today instead of omitting her.");
  }
  return [...new Set(issues)];
}
export function finishEntry(body: string, c: JournalContext): string {
  let closing = "";
  if (c.firstHarvest) {
    const open = [
      `I got ${dollars(c.earned)} today. Mom needs $10,000.00. We have ${dollars(c.available)} now.`,
      `Today's money was ${dollars(c.earned)}. I counted what we have: ${dollars(c.available)}. The operation costs $10,000.00.`,
      `I wrote the numbers down: ${dollars(c.earned)} today, ${dollars(c.available)} altogether, $10,000.00 for Mom's operation.`,
    ][c.seed % 3];
    closing =
      open +
      (c.remaining
        ? ` We still need ${dollars(c.remaining)}. At ${dollars(c.earned)} a day, that's ${c.daysNeeded!.toLocaleString("en-US")} more days. That only works if I can save that much every day.`
        : " We have enough for it. I want to tell Mom.");
  } else if (c.day === 1 && c.boughtSeeds && !c.earned) {
    closing = [
      "The whole bag cost $2.00. I started with $4.33, so that's almost half. This better work. If it doesn't, we'll have to move in with Auntie.",
      "I only had $4.33 to start with. Five seeds for $2.00 took almost half of it. This better work, or we'll have to go live with Auntie.",
      "Almost half my money went on those seeds: $2.00 out of $4.33. This better work. Otherwise we might need to move in with Auntie.",
    ][c.seed % 3];
  }
  return closing ? body + "\n\n" + closing : body;
}
export type JournalCompletion = (
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  seed: number,
) => Promise<string>;
function hatThoughtPower(name: string): string {
  const hat = hats.find((h) => h.name === name);
  const powers: Record<string, string> = {
    cap: "plant 15% faster and get a seed back with each harvest.",
    propeller: "walk and run 25% faster.",
    rabbit: "jump.",
    inspector: "check how all the trees are growing.",
    hardhat: "plant seeds in half the time.",
    wizard: "make the trees grow 25% faster.",
    rain: "water a seed automatically when I plant it, if I have a watering can.",
    banker: "get an extra $1 from each tree, up to $7 per harvest.",
    beekeeper:
      "get at least $6 from a fertilized tree if I wear it when it finishes growing.",
    lantern: "reach things from farther away and light them with my headlamp.",
  };
  return hat ? powers[hat.id] : "try its power.";
}
export function journalOpening(c: JournalContext): string {
  const choose = (options: string[]) => {
    const fresh = options.filter(
      (text) =>
        !c.previous.some((page) => normalize(page).includes(normalize(text))),
    );
    return (fresh.length ? fresh : options)[
      c.seed % (fresh.length || options.length)
    ];
  };
  const lines: string[] = [];
  const mom = c.events.find((e) => e.startsWith("Mom had energy for"));
  const activity = mom?.match(/Mom had energy for (.+) today\./)?.[1];
  if (activity)
    lines.push(
      choose([
        `Mom had energy for ${activity} today.`,
        `Today Mom was busy with ${activity}.`,
        `Mom spent some of today ${activity}.`,
      ]),
    );
  else if (c.events.some((e) => e.includes("Mom was exhausted")))
    lines.push(
      choose([
        "Mom was worn out on the couch when I got home.",
        "When I came home, Mom was exhausted on the couch.",
        "Mom was resting on the couch. She looked tired.",
      ]),
    );
  if (
    !activity &&
    !c.events.some((e) => e.includes("Mom was exhausted")) &&
    c.events.some((e) => e.startsWith("Talked with Mom"))
  )
    lines.push("I checked in with Mom before going out.");
  if (c.events.some((e) => e.startsWith("Heard Mom coughing")))
    lines.push(
      choose([
        "I heard Mom coughing when I came home.",
        "Mom was coughing when I got back.",
        "When I got home, I heard Mom cough.",
      ]),
    );
  if (c.firstHarvest)
    lines.push(
      choose([
        "I picked real dollar bills off a tree today.",
        "The money tree actually gave me dollar bills.",
        "I harvested my first money tree. The bills are real.",
      ]),
    );
  else if (c.earned)
    lines.push(`I harvested ${dollars(c.earned)} from the garden today.`);
  else if (c.boughtSeeds && !c.hasHarvested)
    lines.push(
      c.garden.growing
        ? choose([
            ` ${c.garden.growing === 1 ? "One seed is" : `${c.garden.growing} seeds are`} growing, but there aren't any bills to harvest yet.`.trim(),
            "A tree is growing in the garden. I'm still waiting for its bills.",
          ])
        : choose([
            "I have those strange seeds, but I haven't harvested any money yet.",
            "No money from the seeds yet.",
          ]),
    );
  else if (c.hasHarvested)
    lines.push(
      choose([
        "I didn't harvest any money today.",
        "No money came in from the garden today.",
      ]),
    );
  const fed = c.events.filter((e) => e.startsWith("Fed ")).length;
  const planted = c.events.filter((e) => e.startsWith("Planted ")).length;
  if (fed)
    lines.push(`I used fertilizer on ${fed} ${fed === 1 ? "tree" : "trees"}.`);
  else if (planted && c.hasHarvested)
    lines.push(`I planted ${planted} new ${planted === 1 ? "seed" : "seeds"}.`);
  const bought = c.events
    .filter((e) => e.startsWith("Bought the "))
    .map((e) => e.slice("Bought the ".length, -1));
  const focus = bought.includes(c.worn ?? "") ? c.worn : bought.at(-1);
  if (bought.length > 1)
    lines.push(`I came home with ${bought.length} new hats.`);
  if (focus)
    lines.push(
      `I bought the ${focus}. Wearing it lets me ${hatThoughtPower(focus)}`,
    );
  return lines.join(" ");
}
export async function generateJournal(
  c: JournalContext,
  complete: JournalCompletion,
): Promise<string> {
  const slots: Record<string, string> = {
    income: dollars(c.earned),
    total: dollars(c.available),
    cash: dollars(c.cash),
    bank: dollars(c.bank),
    goal: "$10,000.00",
  };
  const past = c.history.slice(-3).map((m) => ({
    day: m.day,
    mom: m.events.find((e) => /^(Mom had energy|Mom was exhausted)/.test(e)),
    harvested: m.earned > 0,
  }));
  const opening = journalOpening(c);
  const stage =
    c.remaining === 0
      ? "The boy has enough saved for Mom’s operation. She is still ill; no operation or cure has happened yet. He is thinking about what happens next."
      : c.firstHarvest
        ? "TODAY IS THE FIRST SUCCESSFUL HARVEST. The boy has already picked real bills off a tree. The seeds worked. He is amazed and thinking about earning enough for Mom."
        : c.hasHarvested
          ? "The boy already knows money trees work. Today's concern is earning enough and caring for Mom."
          : c.boughtSeeds
            ? "The boy has never harvested money. He is wondering whether the seeds will work."
            : "The boy has not bought the seeds yet. He worries about his sick mom.";
  const boughtHats = c.events
    .filter((e) => e.startsWith("Bought the "))
    .map((e) => e.slice("Bought the ".length, -1));
  const newHat = boughtHats.includes(c.worn ?? "") ? c.worn : boughtHats.at(-1);
  const usedHat =
    newHat && c.events.some((e) => e.startsWith(`Used my ${newHat} `));
  const focus = newHat
    ? `Reflect on how this hat’s actual power helps me. Its name is already in the opening; you do not need to repeat it. Also think about Mom's observed activity. Spend less time repeating worries about the operation's cost. ${usedHat ? "I already used its power today. Reflect on how it helped, rather than whether it will work." : ""}`
    : c.firstHarvest
      ? "The reflection must express surprise that the tree really grew money. Think about what this means for Mom."
      : "";
  const angle = [
    "Write about a question I can't stop thinking about.",
    "Write about something I wish were different.",
    "Write about what I want tomorrow to be like.",
    "Write about a thought I am afraid to say out loud.",
    "Write about what seems hard to believe.",
    "Write about why I care about today's observation.",
  ][c.seed % 6];
  let feedback = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const messages: Parameters<JournalCompletion>[0] = [
      { role: "system", content: journalVoice + "\n" + stage + "\n" + focus },
      {
        role: "user",
        content: `My entry already starts with these true observations: ${opening || "Mom is ill and her operation is expensive."}
Continue with 45-70 words of MY PRIVATE THOUGHTS, in one connected paragraph. Do not retell events, add actions or dialogue, or repeat the observations. Write what I wonder, wish, or fear about them. Keep my voice ordinary and specific. No list, lesson, or cheerful ending. Gameplay day ${c.day}. ${c.firstHarvest ? "This is the first time I have seen real money growing on a tree. I am amazed it worked." : c.hasHarvested ? "Money trees have already proved real. I am worried about earning enough, not whether they exist." : c.boughtSeeds ? "I have never harvested a bill. I wonder if these crazy seeds will work." : "I have not bought the seeds yet."}
Past days for continuity only: ${JSON.stringify(past)}. ${angle} No prices or arithmetic. ${feedback}`,
      },
    ];
    const raw = (await complete(messages, c.seed + attempt)).trim();
    let body = raw
      .replace(/^<think>[\s\S]*?<\/think>\s*/, "")
      .replace(/[—–]/g, ". ")
      .replace(/^```(?:json)?\s*|\s*```$/g, "");
    if (/^\{\s*"|^\[/.test(body)) {
      try {
        const result = JSON.parse(body);
        body = typeof result.entry === "string" ? result.entry.trim() : "";
      } catch {
        body = "";
      }
    }
    let issues: string[] = [];
    if (!body) issues.push("Only output the diary body.");
    if (
      /\$\d|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(?:bucks|dollars|cents)\b/i.test(
        body,
      )
    )
      issues.push("No money amounts; use the given slots if necessary.");
    if ([...body.matchAll(/{{([^}]+)}}/g)].some((m) => !slots[m[1]]))
      issues.push("Use only the supplied money slots.");
    body = body.replace(/{{([^}]+)}}/g, (_, name) => slots[name] ?? "");
    const firstWords = normalize(body).split(" ").slice(0, 4).join(" ");
    if (
      firstWords &&
      c.previous
        .slice(1)
        .some((page) =>
          page
            .split(/\n\n/)
            .some((paragraph) => normalize(paragraph).startsWith(firstWords)),
        )
    )
      issues.push(
        `Do not start with "${firstWords}". That opening was already used on an earlier page.`,
      );
    if (
      /\b(?:Mom|she).{0,60}\bin pain|\bher pain|she(?:['’]s| is)? (?:always )?saying|Mom (?:always )?says/i.test(
        body,
      )
    )
      issues.push(
        "Do not invent Mom's pain or what she says. Only her recorded condition is known.",
      );
    const reflectionWords = body.split(/\s+/).length;
    if (reflectionWords < 30 || reflectionWords > 110)
      issues.push("Write 45-70 words of private reflection.");
    const page = finishEntry([opening, body].filter(Boolean).join("\n\n"), c);
    issues.push(...writingIssues(page, c, false, body));
    if (
      new URLSearchParams(
        typeof location !== "undefined" ? location.search : "",
      ).has("test")
    )
      console.debug("journal-evaluation issues", issues);
    if (!issues.length) return `Day ${c.page + 1}\n\n${page}`;
    feedback = `A previous draft failed. Write a fresh entry fixing these issues: ${[...new Set(issues)].map((issue) => (issue.startsWith("Rewrite the repeated") ? issue.replace("Rewrite the repeated eight-word phrase:", "Do not use this word sequence:") : issue)).join(" ")}`;
  }
  throw new Error(
    "The journal draft needs another try. Your temporary entry is saved.",
  );
}

// An honest temporary page if the model is unavailable. Select wording not used in recent pages.
export function temporaryEntry(c: JournalContext): string {
  const pick = (options: string[]) =>
    options.find(
      (text) => !c.previous.some((p) => normalize(p).includes(normalize(text))),
    ) ?? options[c.seed % options.length];
  const lines: string[] = [];
  if (c.events.some((e) => e.includes("Mom was exhausted")))
    lines.push(
      pick([
        "Mom was on the couch again. I wanted to ask if she was scared, but I didn't.",
        "Mom looked tired when I got back. I wish I could do something that would help right now.",
        "I hate seeing Mom so worn out. I keep checking on her, even when she says she's okay.",
      ]),
    );
  const good = c.events.find((e) => e.startsWith("Mom had energy for"));
  if (good)
    lines.push(
      `${good.replace(/^Mom had energy for /, "Mom was busy with ")} ${pick(["I liked hearing her move around the house.", "I wanted today to last longer.", "It felt good to see her doing something she likes."])}`,
    );
  const planted = c.events.filter((e) => e.startsWith("Planted")).length;
  if (planted)
    lines.push(
      pick([
        `I planted ${planted} ${planted === 1 ? "seed" : "seeds"}. Now I keep going back to look at the dirt.`,
        `There are ${planted} new ${planted === 1 ? "seed" : "seeds"} in the garden. I want to know what's happening under there.`,
      ]),
    );
  const newHats = c.events.filter((e) => e.startsWith("Bought the "));
  for (const e of newHats) {
    const name = e.slice("Bought the ".length, -1);
    lines.push(
      `I got the ${name}. Wearing it lets me ${hatThoughtPower(name)}`,
    );
  }
  if (c.firstHarvest)
    lines.push(
      `I picked ${dollars(c.earned)} off a tree. Real money. I counted it twice. Mom needs $10,000.00, and we have ${dollars(c.available)}. ${c.remaining ? `That leaves ${dollars(c.remaining)}. If I get ${dollars(c.earned)} every day, it will take ${c.daysNeeded!.toLocaleString("en-US")} more days. That's if every day goes like this one. I wish I could make it happen faster.` : "We have enough. I want to tell her."}`,
    );
  else if (c.day === 1 && c.boughtSeeds && !c.earned)
    lines.push(
      pick([
        "Those seeds cost $2.00. Almost half my $4.33, for seeds that might be a joke. This better work. Otherwise we might have to move in with Auntie. I don't know how I'd tell Mom.",
        "I paid $2.00 out of my $4.33 for those crazy seeds. That's almost half. Can they really grow money? This better work, or we'll have to go live with Auntie. I can't stop thinking about it.",
      ]),
    );
  else if (c.earned)
    lines.push(
      pick([
        `The trees gave me ${dollars(c.earned)} today. I put the bills in order before counting them.`,
        `I counted ${dollars(c.earned)} from the garden. It still feels strange to say that.`,
      ]),
    );
  else
    lines.push(
      pick([
        "I didn't earn any money today. I don't like writing that down, but it's true.",
        "No money came in today. I keep thinking about the operation when I'm supposed to be asleep.",
        "I wish I had some money to show Mom tonight. I haven't got it yet.",
        "I haven't earned anything today. Tomorrow I need to spend less time standing around worrying.",
      ]),
    );
  return `Day ${c.page + 1}\n\n${lines.join("\n\n")}`;
}
