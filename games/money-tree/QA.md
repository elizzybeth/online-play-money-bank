# Development and release procedure

1. Keep gameplay rules independent of rendering. Validate integer-cent accounting, atomic purchases, tool gating, overnight crop transitions, bounded yields, repeat crops, journal generation, recovery, and save round trips.
2. Run seeded random action sequences and assert inventory and crop invariants. Record reproducible seeds for failures.
3. Use explicit collision volumes, subdivided movement, and line-of-sight interaction checks. Door lintels participate in camera occlusion but do not block walking.
4. Run browser tests through actual keys and visible purchase buttons. Use diagnostic teleport only to set up isolated system scenarios; a separate traversal test must exercise the connected world without teleporting.
5. Capture opening, bedroom, shop, and harvest screenshots. Inspect geometry, near-plane obstruction, labels, body proportions, and UI. Keep failure screenshots and traces in test-results. Do not approve baseline changes to hide a visual regression.
6. Rebuild after every final source change. Test the production build under /money-tree/, reload, and verify asset paths and save persistence.
7. Review a GitHub pull request containing source, generated static build, homepage link, and test workflow. Deploy only the reviewed artifact and verify the live URL. Revert the release commit to roll back; local game saves use a dedicated key.

## Automated coverage

- Complete opening economy and renewable crop cycle.
- Tool requirements, fertilizer, insufficient funds, and recovery.
- Invalid saves and invalid time inputs.
- Swept collision movement, wall sliding, and doorway clearance.
- 5,000 deterministic randomized actions.
- Browser opening, purchases, planting all five seeds, watering, harvest, banking, sleep, notebook, and reload.
- Browser wall collision and interaction occlusion.
- Entire home–town–home traversal using real movement input.
- Reachability of all interaction targets through the world’s collision geometry.
- 144 camera samples across doorways, room corners, shop aisles, garden, and an exterior roof edge.
- Valid and invalid save imports.
- Crop growth uses elapsed active time after a rendering stall; pausing prevents advancement.
- New tree colliders clear overlapping players and allow them to walk away.
- Pause-menu recovery preserves resources, crops, journal and day, cancels unfinished digging, and persists through reload.
- Mom and Robertson remind empty-pocket players to check the piggy bank; reminders stop after withdrawing savings.
- Robertson's sign boards have separate bounds; inspect the storefront screenshot for legibility.
- Opt-in visual regression images for opening, bedroom, and harvest-ready garden.

## Visual checks

Inspect the third-person sleeping body, third-person bedroom, door transitions, Mom on the couch, lane, commercial block, Robertson and shelves, all tree stages, morning harvest markers, and menus. Look for inaccessible prompts, camera intersections, detached props, unreadable text, and progression traps.

## Known scope limits

Desktop keyboard and mouse. No touch/gamepad support yet. Home and haberdashery roofs cut away indoors; Robertsons uses an open dollhouse interior. The bicycle shop remains a conversational storefront. Audio is synthesized. Cross-engine results and physical-device performance are recorded separately; WebKit automation does not substitute for a complete Safari device certification. Mom’s surgery target is $10,000 as specified; a funded-surgery ending is future work. Saves are browser-local, not cloud accounts.

## Hat shop and notebook regression checks
- Walk through the haberdashery’s actual entrance, inspect all ten stands, collect the cap’s seeds without payment, buy hats at exact prices, equip from the pictorial bag, and reload to verify ownership and equipment.
- Verify jump takeoff and landing, speed ratio using real input, longer interaction reach, growth reporting, auto-watering/tool gating, planting times, growth acceleration and bounded harvest bonuses.
- Sweep shop entrance, aisles and counter cameras through eight yaw angles; flood-fill all interaction targets to ensure reachability.
- Validate first-night doubts before harvest, first-harvest reflection after day one, exact remaining-goal arithmetic and ceiling to whole days, no em dashes, and legacy diary migration.
- Open latest notebook page by default, turn both directions with buttons and arrows, check first/last-page disabled controls and safe E-to-close, then reopen to latest.

### Branching journal release checks
- Run the corpus lint, context/money validation, emotion and health-transition tests, one-time milestone checks and 10,000-night simulation. Inspect coverage for absent, tired and energetic Mom observations; do not infer unseen symptoms.
- Review multi-day sequences for careful gardening, spending on hats, exploration and missed visits. Read paragraphs together for pronoun references, tonal consistency and repeated sentence shapes.
- Sleep writes immediately; reload/reopening preserve exact prose. Legacy pending model jobs are retired while pages, balances and crops remain. New-game reset clears narrative memory.
- Capture the notebook and inspect page numbering, latest-page default and long-page scrolling. Observe browser requests: no Hugging Face, model worker, model weights or inference wasm should be requested. Verify the production build contains only the game, Three.js, CSS and logo assets.
- Finite passages can eventually repeat. Recent phrase checks, use memory, structural variation and optional omissions reduce repetition; do not claim unlimited originality.

## Seed hunt, Mom and surface detail
- Five saved forest stash candidates are checked for reachable collection, one-time pickup, and progression into a one-time stash inside Robertson's.
- Repeat Mom visits use saved conversation counters; only tired days cough. E selects the non-destructive speech choice. Seated feet extend beyond the couch and the torso starts above the cushion.
- Up/down arrows tilt the camera without moving; WASD moves and left/right arrows turn.
- Cached procedural textures cover paths, grass, bark, foliage, hair, clothing, plaster and shingles. Garden beds include distinct daisies, tulips, lavender, sunflowers and ferns with clear entrances. Wood-grain shop signs use branch ornament and painted lettering.
- Garden expansion tests cover exact $30/$10 costs, rejected property/obstacle/overlap placements without consuming inventory, soil gating, planting, reload and reset cleanup. Journal contexts carry the actual expanded plot count while older five-plot contexts remain valid.
- Inspected local screenshots of the textured neighbor gardens, clothing/hair, grass, paths, plaster, roof shingles and readable shop sign. Static garden meshes are merged by material to reduce draw calls.
- Software-renderer detection lowers render resolution and disables shadows while retaining textures; hardware rendering keeps full quality. Arrow and mouse tilt override the automatic indoor overhead angle, while doorway changes remain eased.
- Money-tree silhouettes use crooked tapered trunks, thin irregular forks and pointed twigs, with deterministic variation per plot and bills attached to twig tips. Withered trees droop and lose bills. Merged bark geometry keeps draw calls low; bounds/determinism tests and a garden screenshot check the model.

### Family, clothing, and town regression checks
- 200 distinct thoughts are selected only from eligible situations and do not repeat before exhaustion. Mom's 200 added dialogue lines remain activity-compatible.
- Three hat slots preserve all powers, cap the stack, migrate old equipped hats, and allow individual rack swaps. Sprout Cap is tested over 10,000 harvests for a 50% seed-return distribution and no duplicate reward.
- Sit/stand uses real E input; seated heads do not intersect; standing restores movement. Check sleeping and seated screenshots against compact chibi references.
- Enter Mom's bedroom, observe a bed day, check grounded journal wording, and verify finished birdhouses persist.
- Collect fourth/fifth hidden packets once, in order, and reload without losing their flags.
- Inspect the rebuilt home sidewalk L connection, texture alignment, vegetable rows, tropical planting, and absent residential signs.
- Check doorway cameras below roofs with wall clearance in the home, Mom's room, hardware store, and hat shop.
- Journal regression covers repeated “I liked that” across health/activity passages over 199 seeds, alongside the 10,000-night coherence simulation.

### Sigma Town regression coverage
- Locked hedge rejects walking north; fifth packet opens the lane and creates ten unique Σ plots without resetting owned beds or resources.
- Flood-fill reachability now includes the unlocked north extension and all Chad, barista, statue and public-bed targets.
- Full browser loop: walk through hedge, get fresh Chad lines, plant a public seed while stationary, type a coin name containing E without triggering gameplay, invest a partial amount, buy coffee, reload, and throw $1 to the statue.
- Unit tests cover conservative buy/sell balances, invalid names and optional-save data, deterministic market/reload, bounded history/prices, actual engagement signals, coffee replacement/expiration, and grounded public-garden journal text.
- Manually inspect the Σ silhouette, meme-house doorways/cutaways, barista counter and howling-wolf statue before release.

### Gardens, wildlife, and stable headings
- Verify seventeen neighbor beds include flytrap/pitcher/sundew, rosette/aloe/cactus, sunflower, vegetable and tropical families. Confirm more than 35 trees with four crown varieties.
- Birds must use real tree anchors and visit visible completed birdhouses; butterflies stay attached to garden centers and animate over time. Reduced-motion settings freeze wildlife without changing resources.
- Hold W crossing the home and shop doorways in both directions: wall avoidance must preserve the input heading. Sweep corners to confirm camera clearance, visibility and gradual travel.
- Open a long notebook entry at a short viewport: scrolling the spread must not move the page controls. Adjacent pages have different sketches, and revisiting a page restores its sketches.
- The HUD seed packet has loaded artwork and the exact inventory count. Store display interactions and every hidden seed pickup remain reachable after expanding the shop.

## Bicycle release checks

- Walk into the relocated showroom and reach every physical display. Confirm four floor displays, three wall displays, distinct geometry, readable prices, and a clear central aisle.
- Purchase all seven bikes with sufficient cash, reject an unaffordable purchase and a duplicate, choose previously owned bikes, and reload. Preserve exact cash, ownership, selected bike, existing garden and journal.
- H mounts outdoors and refuses indoors or while digging, seated, airborne or rolling. Verify cockpit hands, handlebar bell and legible computer. B rings only while mounted and respects sound-off.
- Test slowest bike against fully boosted running, steering, braking/reverse, wall collision at speed, and automatic dismount through a real shop door. Restore walking and third-person view with H.
- Journal purchases and stationary mounting must not invent a ride. Record riding only after moving at least one world unit on the bicycle.
- Early meditation exit stays in Doge and cancels both fee and reward; normal completion still charges once. Perched birds remain above their actual canopy. Sound-off also silences the balloon audio context, and nonfinite balloon elapsed time leaves saves valid.

## Save and interaction regressions

- The pre-plant prompt uses the same duration as the digging action, including hand digging and stacked hardhat/mocha bonuses.
- Start a bed preview, open Pause using the header, and import a valid save that also owns a bed. The previous preview must disappear without consuming either bed.
- Unlock Sigma and stand east of the original garden. Extra plot indices must not raise the player over empty lawn. A placed bed at another coordinate must raise the feet onto its soil.
- Import a save with an empty journal. Reject it before replacing the current state; preserve cash and avoid uncaught page errors.
- Mount a bicycle without moving: no riding journal event. Pedal away: record exactly one event for that bike.
- Grindset's customer point must have six world units of clearance from other street-Chad interaction targets. Approach from the front and both sides; E must open the barista's drinks conversation.
- Spoke & Saddle's sign plane must sit at least 0.15 units in front of the roof fascia, with no shared depth or flickering along the top edge.

## Camera, Sigma conversations and coin ATM regressions

- Scroll smoothly from third person to eye height and back, keeping WASD heading unchanged. Sample 144 wall/corner views and both doorway directions for penetration and sudden travel.
- Walk through Doge’s lane-facing east entrance and back out. Flood-fill all town targets, including both Stacy chairs and the coin ATM.
- Stacy sits on a chair over a dark floor; the player sits opposite. E advances directly to the next question, Previous messages returns to the same conversation, reload retains completed chapters, and seed gifts remain one-time.
- Doge and Stacy hand over a modeled seed packet with an animated reach. No wrapping quotation marks in their speech bubbles.
- Seed hints suspend during Stacy/Doge/Pepe speech, meditation and balloon show, then resume their active-time clock.
- Naming a coin reveals its terminal beside Grindset and a giant gold coin. Green Buy/red Sell buttons accept partial dollar amounts; invalid purchases preserve balances. Candles use actual recorded prices and survive save/reload.

## Camera cutaways, gardening effects and inventory notices
- Camera booms and camera movement pass through structural walls. Walls within the expanded boom/swept-camera bounds disappear with their shadows and return when the camera moves clear. Player collision remains solid. Furniture still uses camera clearance.
- Exercise low camera angles in bedroom/store corners, continuous doorway heading, first-person scroll zoom, and wall visibility restoration. Inspect actual rendered cutaways rather than treating hidden-wall intersections as clipping.
- Apply fertilizer beside a growing plot. Check the box in the player's hand, shaking arm and scattered grains; exactly one dose is consumed unless a hat conserves it. Animation ends and resets on new game/import.
- Inventory notifications report integer-cent pocket/savings changes and seed, fertilizer, tool, bed, soil, hat and bicycle gains/losses. Equipment swaps and loading existing saves do not report fictitious transactions.
- Inspect cobalt Twin Planter from above and hat rack power descriptions. All neighbor beds have distinct layouts, scales and plant arrangements. Inspect orchids, kangaroo paw, birds of paradise and clustered hydrangea blooms.
- After the Pepe balloon has popped, interacting with its presenter uses the inflation follow-up speech bubble.
- Daily Net tracks realized money received minus spent, survives saves, ignores pocket/piggy-bank transfers and resets on the next day. Unrealized coin price changes do not alter it. Mom's default reply is intentionally “Love you too” for every line.
- Mom's color-puzzle invitation opens a paused 9×9 color Sudoku. Test all rows/columns/boxes, fixed clues, conflicts, color placement, optional numbers, clear-cell action, save/reload, and safe E-to-return. Each day's transformed board retains the base puzzle's single solution.
- Sleep matures watered trees, advances the coin market, and ends drink effects after explicit confirmation. The pictorial cup HUD exposes the effect and awake-time countdown.
- Inspect the lower lean-to roof on Mom's bedroom from outside; it sits beneath the main eaves rather than intersecting two peaked roofs.
- Inspect the original red-oval Robertsons identity and three pastel arrow boards on Thread & Thimble. Lettering remains readable and arrows do not obstruct the entrance.
- A distinct rising seed chime plays only when a harvest increases the seed count; it obeys Sound Off. Confirm the matching resource notice and Daily Net harvest gain.
- Street Chads pace along collision-checked short routes, pause near the player or while speaking, and keep colliders and interaction targets aligned. No walker enters the Grindset customer area. Shopkeepers, Stacy, meditators and Pepe's presenter stay put. Reduced motion stops pacing.
- Sprout Cap's brim hint retires from shop, bag and rack descriptions after collecting its packet. Its actual harvest/planting powers remain described.
- Sigma Town's entrance board is raised to 4.8 units, with taller matching posts.

- Confirm E in the active-drink sleep modal stays awake; clicking Sleep and cancel removes the drink and matures only watered trees.
- Twin Planter requires two seeds and adjoining empty or withered, soil-filled beds. Moving cancels both without spending seeds.
- Paint both birdhouses independently, watch the paired hanging scene, reload and verify colors/counts; sleeping that day must not add an extra house.
- All 25 irregularly scattered Pepe packets must be reachable and persist after reload. Inspect Bea’s layered red/orange/yellow gerbera flowers.

## Family story, bottom HUD and sign clearance
- `family-story.test.ts`: one-time surgery payment, awake-only two-minute phone call, save validation, recovery without bed days, five-day outing, completed tea conversation and $100k goal-aware journals.
- `family-story.spec.ts`: rotated arrow/post clearance and meme sign/wall clearance; bottom resources at 1280/600/390px; mounted pitch, harvesting, conversations and planting restrictions; physical rack hats; surgery/phone/recovery persistence; seated tea conversation and goal persistence.
- Review Bea’s modeled tea table, floral cups, lace doily and three chairs; verify camera and doorway movement, recovery dialogue and worried surgery-day thoughts.

## Level 3 release checks

- Post-Pepe earnings threshold excludes prior savings; the real hedge gap can be crossed only after earning the new $100.
- All three assessment outcomes, retaking, and one-time membership and summit seed gifts are covered by persistent rules tests.
- Browser checks cover the full guru-to-pagoda route, smooth ascent, membership HUD, actual digging/watering/overnight harvest, automatic fertilizer and contribution accounting.
- Mansion construction rises progressively while a resident walks down the terraces. All six mansions become available by $1,000 of gross mountain income. Owners leave through a visible doorway; six minigames have actual controls, scoring and paid advantages.
- All six game engines have gameplay-driven ten-point wins and once-per-run reward tests. Browser checks complete Memory Ministry through actual clicks and check its 90-cent net payout, ownership, replay access and responsive canvas.
- Save reload retains fellowship, plots, apps and contribution totals. Coin-sale cost basis excludes principal and transfers from tithing. News and journal entries reflect the willow path and mansion growth.
