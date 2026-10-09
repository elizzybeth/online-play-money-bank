import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode, noteHatPower } from "../src/game";
import {
  journalContext,
  journalPrompt,
  writingIssues,
  generateJournal,
  temporaryEntry,
} from "../src/journal";
const natural =
  "I didn't earn any money today. I kept thinking about Mom while I was outside. I wanted to ask her if the operation would hurt, but I got scared and didn't ask. I don't know why it's easier to dig in the dirt than to say something like that. Maybe tomorrow I can sit with her for a bit. I miss when she could come everywhere with me.";
test("journal captures immutable facts, exact arithmetic and hat use", () => {
  const s = fresh();
  s.bank = 0;
  s.cash = 733;
  s.hats = ["propeller"];
  s.equippedHat = "propeller";
  s.events = ["Harvested $7.00 from a money tree.", "Bought the Whirligig."];
  noteHatPower(s, "to get around faster");
  noteHatPower(s, "to get around faster");
  const c = journalContext(s);
  assert.equal(c.earned, 700);
  assert.equal(c.daysNeeded, 1428);
  assert(c.firstHarvest);
  assert.equal(c.events.filter((e) => e.startsWith("Used")).length, 1);
  s.events = [];
  assert.equal(c.events.length, 3);
  assert(journalPrompt(c).includes("firstHarvest"));
  assert(journalPrompt(c).includes("25% faster"));
  assert(journalPrompt(c).includes("Used my Whirligig"));
});
test("voice lint rejects em dashes, stock phrases, prose reuse, invented amounts and medical events", () => {
  const c = journalContext(fresh());
  assert.deepEqual(writingIssues(natural, c), []);
  assert(
    writingIssues(
      natural +
        " A glimmer of hope filled my heavy heart — a journey of resilience.",
      c,
    ).length,
  );
  c.previous.push(natural);
  assert(writingIssues(natural, c).some((s) => s.includes("repeated")));
  c.previous = [];
  assert(
    writingIssues(natural + " I harvested $50.00 and Mom was cured.", c)
      .length >= 2,
  );
});
test("model gets prior pages and repairs rejected draft before publishing", async () => {
  const c = journalContext(fresh());
  c.previous.push("I went to town yesterday.");
  c.history.push({
    day: 0,
    events: ["Mom was exhausted on the couch when I came home."],
    earned: 0,
    available: 433,
  });
  const calls: any[] = [];
  const text = await generateJournal(c, async (messages) => {
    calls.push(structuredClone(messages));
    return JSON.stringify({
      entry: calls.length === 1 ? natural + " A glimmer of hope." : natural,
    });
  });
  assert.equal(calls.length, 2);
  assert(calls[0][1].content.includes("Mom was exhausted on the couch"));
  assert(calls[1].at(-1).content.includes("stock AI"));
  assert(text.startsWith("Day 2\n\n"));
  assert(!text.includes("glimmer"));
});
test("failed or malformed drafts never become journal prose", async () => {
  const c = journalContext(fresh());
  let calls = 0;
  await assert.rejects(
    generateJournal(c, async () => {
      calls++;
      return "not JSON";
    }),
  );
  assert.equal(calls, 4);
  const first = temporaryEntry(c);
  c.previous.push(first);
  assert.notEqual(temporaryEntry(c), first);
});
test("pending journal work compacts legacy snapshots and preserves valid progress", () => {
  const s = fresh();
  s.day = 201;
  s.journal = Array.from(
    { length: 200 },
    (_, i) => `Day ${i + 1}\n${"A remembered day. ".repeat(30)}`,
  );
  s.journalHistory = Array.from({ length: 199 }, (_, i) => ({
    day: i + 1,
    events: ["Talked with Mom."],
    earned: 0,
    available: 433,
  }));
  const c = journalContext(s);
  assert.equal(c.history.length, 3);
  s.journal.push(temporaryEntry(c));
  s.day++;
  s.journalDrafts = [c, c, { ...c, earned: -5 }];
  const restored = decode(JSON.stringify(s))!;
  assert.equal(restored.bank, 433);
  assert.deepEqual(restored.journal, s.journal);
  assert.equal(restored.journalDrafts!.length, 1);
  assert.deepEqual(restored.journalDrafts![0].previous, []);
  assert.equal(restored.journalDrafts![0].history.length, 3);
  assert(JSON.stringify(restored.journalDrafts).length < 5000);
});
test("first discovery requires exact goal math and first seed doubts require Auntie", () => {
  const s = fresh();
  s.bank = 0;
  s.cash = 733;
  s.events = ["Harvested $7.00 from a money tree."];
  const c = journalContext(s);
  assert(writingIssues(natural, c).some((x) => x.includes("remaining days")));
  const seeds = journalContext({ ...fresh(), boughtSeeds: true });
  assert(writingIssues(natural, seeds).some((x) => x.includes("Auntie")));
});
test("first-harvest numbers are composed from state while the model writes feelings", async () => {
  const s = fresh();
  s.bank = 0;
  s.cash = 733;
  s.events = ["Harvested $7.00 from a money tree."];
  const c = journalContext(s);
  const body =
    "I keep thinking about how a leaf can turn into money. It feels impossible even now. I want to show Mom and then put them somewhere safe. I don't know if she'll believe me at first. I wouldn't have believed it either. I wish she could have been standing there when I found out. I was smiling so much my face hurt.";
  const entry = await generateJournal(c, async () =>
    JSON.stringify({ entry: body }),
  );
  assert(entry.includes("1,428 more days"));
  assert(entry.includes("$9992.67"));
  assert(entry.includes(body));
  assert(!entry.includes("—"));
});

test("prose written amounts and old actions cannot contradict today's facts", () => {
  const c = journalContext(fresh());
  assert(
    writingIssues(natural + " I paid five bucks for seeds.", c).some((x) =>
      x.includes("written as words"),
    ),
  );
  assert(
    writingIssues(natural + " I kept watering my trees.", c).some((x) =>
      x.includes("did not happen"),
    ),
  );
  c.earned = 700;
  assert(
    writingIssues(natural + " I'm still not sure if they're real.", c).some(
      (x) => x.includes("confirmed real"),
    ),
  );
});

test("plans cannot invent hats, faster rewatering, or rediscover proven trees", () => {
  const c = journalContext(fresh());
  assert(
    writingIssues(natural + " I will wear a green hat tomorrow.", c).some((x) =>
      x.includes("no hat"),
    ),
  );
  assert(
    writingIssues(natural + " More water will make them grow faster.", c).some(
      (x) => x.includes("Watering again"),
    ),
  );
  c.hasHarvested = true;
  assert(
    writingIssues(natural + " Will they really grow money?", c).some((x) =>
      x.includes("already proved"),
    ),
  );
});

test("whole-day drafts must reflect Mom's observed activity and the new hat's actual power", async () => {
  const s = fresh();
  s.day = 3;
  s.harvestReflected = true;
  s.hats = ["propeller"];
  s.equippedHat = "propeller";
  s.events = [
    "Mom had energy for painting today.",
    "Bought the Whirligig.",
    "Used my Whirligig to get around faster.",
    "Harvested $6.00 from a money tree.",
  ];
  const c = journalContext(s);
  let calls = 0;
  const prompts: string[] = [];
  const good =
    "I wish days when Mom has energy could last longer. I want to be home more, but I also want to get the money she needs. The Whirligig lets me run faster, so getting home takes less time. I wonder if that will make the days feel less rushed. There is always something I could be doing for the garden.";
  const text = await generateJournal(c, async (messages) => {
    prompts.push(messages[1].content);
    return ++calls === 1 ? natural + " A glimmer of hope." : good;
  });
  assert.equal(calls, 2);
  assert(/Mom.*painting/.test(text));
  assert(text.includes("Whirligig lets me run faster"));
  assert(prompts[0].includes("painting"));
  assert(prompts[0].includes("25% faster"));
  assert(prompts[1].includes("stock AI"));
});

test("narrative checks reject nonexistent crops, false growing rules, and a forgotten goal", () => {
  const c = journalContext(fresh());
  assert(
    writingIssues(natural + " I watered my tomato plants.", c).some((issue) =>
      issue.includes("vegetable crops"),
    ),
  );
  assert(
    writingIssues(natural + " These seeds only need air.", c).some((issue) =>
      issue.includes("require watering"),
    ),
  );
  assert(
    writingIssues(
      natural + " I wish I knew how much money I needed to help her.",
      c,
    ).some((issue) => issue.includes("already knows")),
  );
});

test("private hopes are not mistaken for completed harvests", () => {
  const c = journalContext(fresh());
  assert.deepEqual(
    writingIssues(
      natural +
        " I hope the seeds grow real money soon. I'm glad I tried, but I'm scared it won't work.",
      c,
    ),
    [],
  );
  assert(
    writingIssues(natural + " The tree grew real money today.", c).some(
      (issue) => issue.includes("before it happens"),
    ),
  );
});

test("pending journal snapshots reject inconsistent money and garden counts", () => {
  const s = fresh(),
    c = journalContext(s);
  s.journal.push(temporaryEntry(c));
  s.day++;
  for (const changed of [
    { available: 900 },
    { remaining: 0 },
    { earned: 700 },
    { garden: { ...c.garden, growing: 1 } },
  ]) {
    s.journalDrafts = [{ ...c, ...changed }];
    const restored = decode(JSON.stringify(s))!;
    assert.equal(restored.bank, s.bank);
    assert.deepEqual(restored.journal, s.journal);
    assert.deepEqual(restored.journalDrafts, []);
  }
});

test("an observed cough enters the writer facts without inventing Mom's energy", async () => {
  const s = fresh();
  s.events = ["Heard Mom coughing when I got home."];
  const c = journalContext(s);
  await generateJournal(c, async (messages) => {
    assert(/Mom.*cough|cough.*Mom/.test(messages[1].content));
    assert(!messages[1].content.includes("exhausted"));
    return natural;
  });
});

test("expanded gardens retain exact journal facts without invalidating legacy contexts", () => {
  const s = fresh();
  s.plots.push({
    x: -24,
    z: 19,
    soilFilled: false,
    stage: "empty",
    remaining: 0,
    fertilized: false,
    yield: 0,
  });
  const c = journalContext(s);
  s.journal.push(temporaryEntry(c));
  s.day++;
  s.journalDrafts = [c];
  assert(decode(JSON.stringify(s)));
  assert.equal(c.garden.empty, 6);
  assert.equal(c.plotCount, 6);
});
