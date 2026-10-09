# Money Tree

A single-player 3D browser game for Online Play Money Bank. TypeScript + Three.js. All visuals are procedural; no asset servers, accounts, or paid services are required.

## Play
WASD walks relative to the camera. Drag the view or use left/right arrows to look. E interacts, J opens the notebook, I opens the bag, Escape pauses. Hold Shift to walk slowly. The pause menu includes sound, graphics, and reduced-motion controls. Start in bed, withdraw the $4.33 from the piggy bank on your desk, visit Robertson in the shop at the north end of the lane, buy five seeds ($2), a can ($1), and a shovel ($1), then return to the five garden plots behind your house.

Planting takes 2 seconds with the shovel or 8 by hand. Moving cancels planting without spending a seed. Water starts a 90-second crop timer. Fertilizer supplies five applications, speeds growth, and improves harvests. Trees yield $2–$7, stay planted after harvesting, and produce another crop when watered again. Sleep in bed to finish watered crops and write the daily notebook entry. Browser menus and hidden tabs pause growth. Saves are local to this browser; use the pause menu to export/import them.

## Develop
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
