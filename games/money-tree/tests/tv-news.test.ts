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
