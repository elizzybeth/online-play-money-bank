import { test } from "node:test";
import assert from "node:assert/strict";
import { playerMomResponse, momDialogue } from "../src/mom-dialogue";
test("the player hears affection in every Mom line", () => {
  for (const energetic of [true, false])
    for (const line of Object.values(momDialogue).flat())
      assert.equal(playerMomResponse(line, energetic), "Love you too");
});
