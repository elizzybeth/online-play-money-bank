# Money Tree

A single-player 3D browser game for Online Play Money Bank. TypeScript + Three.js. All visuals are procedural; no asset servers, accounts, or paid services are required.

## Play
WASD walks relative to the camera. Click the game view to capture the mouse and look freely; Escape and interactive menus release it. Drag the view or use left/right arrows if pointer lock is unavailable. E interacts and activates the highlighted safe default action in a menu. Save replacement/reset actions require an explicit selection. J opens the notebook, I opens the bag, Escape pauses. Hold Shift to run. Your bag shows illustrated item cards with quantities and tool ownership. The pause menu includes sound, graphics, and reduced-motion controls. Start in bed, withdraw the $4.33 from the piggy bank on your desk, visit Robertson in the shop at the north end of the lane, withdraw a chosen dollar-and-cent amount or all your savings, buy five seeds ($2), a can ($1), and a shovel ($1), then return to the five garden plots behind your house.

Planting takes 2 seconds with the shovel or 8 by hand; press E and stand still until it finishes. Moving cancels planting without spending a seed. Water starts a three-minute crop timer (two minutes when fertilized). Fertilizer costs $5 for one application. After watering, press E again when prompted to fertilize that tree, speeding growth and improving its harvest. Trees yield $2–$7, then wither after harvesting. Plant a new seed in the withered plot. Robertson sells only the first bag; the next five seeds are tucked into the brim of a cap outside Thread & Thimble. The cap can be collected once. Sleep in bed to finish watered crops and write a short, grouped reflection in your notebook. Return home to check in with Mom: tired days find her resting on the couch, and good days find her cooking, building birdhouses, painting, reading, or visiting the garden. Your private thoughts appear separately from her speech. NPC names and conversations appear over their heads; walking and growth continue during conversations. Neighbors rotate through new lines and remember their dialogue progress in the save. Inventory, notebook, shopping and pause menus, plus hidden tabs, pause growth. Existing activity-log journal entries are condensed into short reflections when loaded. Saves are local to this browser; use the pause menu to export/import them.

## Develop
If you get stuck, press Escape and choose **I'm stuck — return home**. This cancels unfinished digging and returns you to clear ground in your bedroom without resetting your day, money, inventory, notebook, or garden. Newly growing trees also move an overlapping player onto nearby clear ground automatically.

Use Node 22+ and pnpm 11.

```
pnpm install
pnpm dev
pnpm test
pnpm test:e2e
pnpm test:visual
pnpm build
```

Local browser tests use installed Google Chrome on macOS. Set MONEY_TREE_BROWSER=firefox or MONEY_TREE_BROWSER=webkit for those engines after installing them with Playwright. CI uses Playwright Chromium (`pnpm exec playwright install --with-deps chromium`). `?test` explicitly enables a diagnostic harness with controlled clock and scene inspection. Normal sessions omit that harness.

`src/game.ts` holds renderer-independent gameplay, save validation, and movement collision. `src/world.ts` builds the neighborhood, collision shapes, targets, and art. `src/main.ts` connects real controls, camera, UI, audio, and persistence.

Visual tests are opt-in: `pnpm test:visual` compares against reviewed macOS Chrome screenshots with reduced motion. Baselines are platform-specific; inspect diffs before updating them. The CI matrix runs gameplay, navigation, camera, and save tests in Chromium, Firefox, and WebKit without imposing one platform’s font rasterization on another.

## Hosting
`pnpm build` produces `dist/` with relative asset URLs. Copy the contents to the existing site's `money-tree/` directory. Source and tests belong in `games/money-tree/` in the host repository. Keep the existing root `CNAME` and publishing method. The checked-in build avoids changing the site's publishing configuration.

## QA
See QA.md for the release checklist, automated coverage, and remaining scope. This is an initial playable release. Mobile touch controls, full voiceover, real multiplayer, disease, pests, extra shop systems, and the surgery funding ending are future work.
