# Money Tree

A single-player 3D browser game for Online Play Money Bank. TypeScript + Three.js. 3D models are procedural; the title logo is a bundled illustrated asset. Gameplay assets are bundled. No accounts or paid services are required; the branching notebook works offline without a model download.

## Play
WASD walks relative to the camera. Click the game view to capture the mouse and look freely; Escape and interactive menus release it. Drag the view or use left/right arrows if pointer lock is unavailable. E interacts and activates the highlighted safe default action in a menu. Save replacement/reset actions require an explicit selection. Space jumps while wearing Spring Hare. J opens the notebook, I opens the bag, Escape pauses. Hold Shift to run. Your bag shows illustrated item cards with quantities and tool ownership. The pause menu includes sound, graphics, and reduced-motion controls. Start in bed, withdraw the $4.33 from the piggy bank on your desk, visit Robertson in the shop at the north end of the lane, withdraw a chosen dollar-and-cent amount or all your savings, buy five seeds ($2), a can ($1), and a shovel ($1), then return to the five garden plots behind your house.

Planting takes 2 seconds with the shovel or 8 by hand; press E and stand still until it finishes. Moving cancels planting without spending a seed. Water starts a three-minute crop timer (two minutes when fertilized). Fertilizer costs $5 for a box of five doses. After watering, press E again when prompted to fertilize that tree, speeding growth and improving its harvest. Trees yield $2–$7, or up to $9 when fertilized, then wither after harvesting. Plant a new seed in the withered plot. Robertson sells only the first bag; the next five seeds are tucked into the brim of a cap inside Thread & Thimble. The brim’s five seeds can be collected once without buying the cap. Sleep in bed to finish watered crops and write a personal reflection on a new notebook page. The notebook opens to the latest page; turn pages with the buttons or left/right arrows. First-night doubts and the first harvested night’s surprise reflect on Mom’s $10,000 surgery goal, including the days needed at that day’s harvest income. Return home to check in with Mom: tired days find her resting on the couch, and good days find her cooking, building birdhouses, painting, reading, or visiting the garden. Your private thoughts appear separately from her speech. NPC names and conversations appear over their heads; walking and growth continue during conversations. Neighbors rotate through new lines and remember their dialogue progress in the save. Inventory, notebook, shopping and pause menus, plus hidden tabs, pause growth. Existing activity-log journal entries are condensed into short reflections when loaded. Saves are local to this browser; use the pause menu to export/import them.

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

## Thread & Thimble
Walk through the shop’s doorway from Market Lane. Ten original procedural hats have distinct stitching, brims, bands, lenses, ears, stars, veil, feather and lamp details. Inspect a stand to read the price and ability; buy to wear it, or equip/take off owned hats from the illustrated bag. Ownership and up to three equipped hats persist in saves. Their powers work together. The bedroom hat rack lets you hang up individual hats and put others on. Taller hats sit higher, with rabbit ears and the whirligig prioritized at the top. Old saves retain their previously equipped hat.

| Hat | Price | Power while worn |
| --- | ---: | --- |
| Sprout Cap | $2 | Plant 15% faster and have a 50% chance of recovering one seed per harvest; its brim hides the second seed batch |
| Whirligig | $8 | Walk/run 25% faster |
| Spring Hare | $12 | Jump with Space |
| Garden Inspector | $15 | On-screen stages and countdowns for all five plots |
| Digging Helmet | $20 | Plant in half the usual time |
| Moonrise Wizard | $30 | Active trees grow 25% faster |
| Rainy Day Sou’wester | $40 | Auto-water newly planted seeds if a can is owned |
| Lucky Tallboy | $60 | Add $1 to harvests, capped at $7 |
| Honey Keeper | $80 | Fertilized trees maturing while worn yield at least $6 |
| Night Gardener | $100 | Three-metre interaction reach and glowing lamp |

Powers apply only while equipped. Jumping keeps horizontal wall and world-boundary collisions intact. Gardening yield powers preserve the $7 maximum.

## Branching journal
At bedtime, the game immediately writes a permanent page from observed events and a reviewed passage library. No LLM, API key, model weights or WebGPU is needed for the notebook. Existing pages remain readable; old pending model jobs are retired without rewriting their pages. The opening page is Day 1; subsequent pages count upward and open to the latest page.

`journal.ts` captures immutable facts and exact money calculations. `branching-journal.ts` selects passages from `journal-passages.ts`, with explicit triggers for story milestones, Mom's observed activities, consecutive-day health changes, gardening, discoveries, neighbors and actual hat powers. Saved worry, hope, confidence, frustration, connection and fatigue influence reflections. Emotions ease towards a baseline and are modified by today rather than replaced. Observed Mom health and dates are remembered; missed visits never invent her condition. Older saves initialize conservatively from structured history.

A per-playthrough random seed, bounded passage-use memory and recent seven-word phrase checks provide variation while preserving reload stability. Repeated alternatives are avoided when eligible fresh options exist; optional passages are omitted when their pool is exhausted. First-harvest arithmetic uses the actual harvest and available balance against the $10,000 goal. No-income days never claim financial progress. Page bodies contain no em dashes or motivational stock phrases.

Tests simulate 10,000 nights across varied seeds and check facts, narrative milestones, emotional transitions, prose variety and save stability. Manual multi-day reviews cover careful gardening, hat purchases and distracted play. Browser checks verify sleep, page navigation, reload, legacy pages, reset and absence of model/network downloads. The finite library is deliberately editable: adding gameplay requires adding observed events and tested passage conditions.

Garden expansion: Robertson sells a portable wooden bed for $30 and a bag of soil for $10. Open the bag and choose Place a garden bed, walk to clear ground on your property, then press E while the preview is green. Escape keeps the bed in your bag. Paths, doors, scenery and existing beds are reserved. Press E at the empty bed to use one soil bag before planting. Bed positions and supplies persist in saves.

After the cap seeds, a one-time five-seed packet appears at a saved random spot in the western trees. Collecting it unlocks another five-seed packet behind tins in Robertson's store. Up/down arrows tilt the camera; WASD walks. Mom's saved conversation counters provide changing replies, with coughing restricted to tired days.

## Family and town update
Mom has ten good-day activities: cooking, birdhouses, painting, reading, gardening, mending, jigsaws, music, letters, and feeding birds. Some tired days she rests in her new bedroom. Completed birdhouses remain hanging in outdoor trees. E at the couch sits the player beside Mom or alone; E again stands. The wake-up scene shows the complete character lying down in third person.

Mom has 200 additional authored activity-specific replies in `src/mom-dialogue.ts`. The 200 authored thoughts in `src/mom-thoughts.ts` use observed health/activity, gardening progress, money, and occasion; saved selection history prevents repeats until eligible lines are exhausted. Thoughts appear in a cloud with round trailing bubbles anchored above the player's head.

Hidden seed packets progress through the cap, the woods, Robertson's shelves, a neighbor's flowerbed, and behind the TV. Each gives five seeds once. Robertson explains the search immediately after the initial purchase. Neighbor gardens include distinct vegetable rows and tropical clusters. A single union mesh with world-aligned UVs prevents sidewalk overlap flicker. Indoor cameras rise above exterior walls and aim within the current building.

Journal selection rejects repeated three-word phrases within the same page, in addition to tracking recent passages across days. Additional journal families cover the new activities, bedroom rest, observed birdhouses, and the two new seed discoveries. Existing pages and balances remain intact when saves migrate.

## Sigma Town
The fifth hidden packet (behind the home TV) opens the hedge at the end of the lane past Thread & Thimble. A new footpath leads to Sigma Town. Its seven male Chads have grayscale, broad-shouldered chibi models and independent dialogue counters: each pool has 144 distinct combinations of twelve role-specific jokes and twelve closing quips. The community-garden Chad criticizes sharing, while Grindset's barista calls the same work entrepreneurial.

Ten public beds form a large Σ. They start with withered money trees and use the normal seed, watering, fertilizer and harvest rules. Existing saves get the beds once when unlocked; up to fifty home plots can coexist with ten community plots. The Doge, Pepe and Hawk Tuah houses are original modeled silhouettes with walk-in doorways and roof cutaways. The lone wolf statue takes exactly $1 without granting any luck or changing yields.

Grindset sells five drinks, each lasting 180 seconds of active play: $2 Hustle Espresso (30% movement), $3 Deep Work Mocha (half planting time), $4 Compound Cold Brew (50% growth), $5 Bull Market Latte (+$1 harvest, capped at $7), $2 Networking Tea (three-meter interaction reach). A new drink replaces the previous effect. Effects persist in saves, pause with the game, and advance overnight.

Planting a public bed unlocks the barista's coin offer. The player chooses a validated 1–24-character name and gets a top-right tracker. Investments spend pocket cash at the displayed price; selling realizes the current value. Prices move every fifteen active seconds using a separate saved RNG, bounded at $0.01–$1,000.00. Random moves outweigh the small drift from total harvest earnings, bank savings, Mom's current health, unique neighbors met, active trees and her longest good-day streak. After the original twenty-day activity rotation, Mom's health schedule includes varied runs of good and bad days. This system is entirely in-game and has no wallets, tokens, network calls or real purchases. New journal branches respond to actual visits, public planting, drinks, naming and investing.

The neighborhood has seventeen planted beds, including carnivorous plants, succulents, sunflowers, vegetables, and tropical foliage. Woodland trees vary between oaks, pines, maples, and birches; berry bushes, junipers, and flowering shrubs fill the yards and edges. Birds visit tree perches and completed birdhouses, while butterflies follow garden-local flight paths. Wildlife has no collisions or save-state effects and respects reduced motion. The HUD shows a seed packet and seed count. Notebook sketches vary by page, and page controls remain outside the scrolling entry.
