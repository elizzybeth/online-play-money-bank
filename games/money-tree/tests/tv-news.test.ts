import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import { newsReports } from "../src/tv-news";
import { journalContext } from "../src/journal";
import { constructJournal } from "../src/branching-journal";
test("news covers actual recent events and retires old headlines", () => {
  const s = fresh();
  assert(newsReports(s).some((n) => n.headline.includes("Spoke")));
  s.day = 8;
  s.events = [
    "Found five money seeds behind the TV at home.",
    "Chad asked me about inflation, then started inflating an enormous Pepe balloon.",
    "The giant Pepe balloon popped. Green scraps and twenty-five seed packets scattered across Sigma Town.",
  ];
  assert.equal(newsReports(s).length, 3);
  assert(newsReports(s).some((n) => n.headline.includes("Sigma Town")));
  s.journalHistory = [{ day: 8, events: s.events, earned: 0, available: 433 }];
  s.events = [];
  s.day = 11;
  assert.equal(newsReports(s).length, 1);
  assert.equal(newsReports(s)[0].headline, "A quiet day in town");
  s.tvChannel = "news";
  assert.equal(decode(JSON.stringify(s))!.tvChannel, "news");
});
test("community garden familiarity lasts beyond the three-day journal context", () => {
  const s = fresh();
  s.day = 12;
  s.events = ["Planted in Sigma Town’s community garden."];
  s.journalHistory = [1, 2].map((day) => ({
    day,
    events: [...s.events],
    earned: 0,
    available: 433,
  }));
  const c = journalContext(s);
  assert.equal(c.communityDays, 2);
  for (let seed = 1; seed < 30; seed++) {
    c.seed = seed;
    const result = constructJournal(c);
    assert(!result.selections.some((x) => /^sigmaGarden:/.test(x)));
    assert.doesNotMatch(
      result.entry,
      /more room.*expected|feels strange leaving|big funny shape|find out what this seed/,
    );
  }
});

test("news feed reuses unchanged reports and refreshes on events, rollover and save replacement", async () => {
  const { createNewsFeed } = await import("../src/tv-news");
  const s = fresh();
  s.day = 8;
  const feed = createNewsFeed();
  const original = feed.read(s);
  for (let i = 0; i < 300; i++) assert.equal(feed.read(s), original);
  assert.equal(feed.builds, 1);
  s.events.push("Found five money seeds behind the TV at home.");
  assert.equal(feed.read(s)[0].headline, "A path to Sigma Town");
  assert.equal(feed.builds, 2);
  s.events = ["The giant Pepe balloon popped."];
  assert.equal(feed.read(s)[0].headline, "Green scraps across Sigma");
  s.journalHistory = [
    {
      day: 8,
      events: ["Picked paint colors for two birdhouses."],
      earned: 0,
      available: 0,
    },
  ];
  s.events = [];
  assert.equal(feed.read(s)[0].headline, "New homes for local birds");
  s.day = 11;
  assert.equal(feed.read(s)[0].headline, "A quiet day in town");
  const restored = structuredClone(s);
  restored.events = ["Found five money seeds behind the TV at home."];
  assert.equal(feed.read(restored)[0].headline, "A path to Sigma Town");
});
