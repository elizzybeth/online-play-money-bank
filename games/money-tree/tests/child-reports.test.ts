import { test } from "node:test";
import assert from "node:assert/strict";
import { childReport, normalizeChildReports } from "../src/child-reports";
import { fresh, decode } from "../src/game";
import { constructJournal } from "../src/branching-journal";
import { journalContext } from "../src/journal";

test("Children migration counts are spelled out and same-day reports are consolidated", () => {
  const one =
    "1 Child of Breath of Fire left the terraces to build lavish mansions. One of six now lives at the mountain’s foot.";
  const two =
    "1 Child of Breath of Fire left the terraces to build lavish mansions. 2 of six now live at the mountain’s foot.";
  const report = childReport(2, 2, "Breath of Fire");
  assert.equal(normalizeChildReports(`${one}\n\n${two}`), report);
  assert.equal(
    normalizeChildReports(`${one}\n\n${one}`),
    childReport(1, 1, "Breath of Fire"),
  );
  assert.equal(normalizeChildReports(report), report);
  for (let i = 1; i <= 6; i++)
    assert(!/\d/.test(childReport(i, i, "Breath of Fire")));
  const s = fresh();
  s.events = [one, two];
  const entry = constructJournal(journalContext(s)).entry;
  assert.equal(entry.match(/left the terraces/g)?.length, 1);
  assert(entry.includes(report));
  s.journal.push(`${one}\n\n${two}`);
  assert.equal(decode(JSON.stringify(s))!.journal.at(-1), report);
});
