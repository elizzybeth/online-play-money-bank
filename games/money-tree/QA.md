# Development and release procedure

1. Keep gameplay rules independent of rendering. Validate integer-cent accounting, atomic purchases, tool gating, timer transitions, bounded yields, repeat crops, journal generation, recovery, and save round trips.
2. Run seeded random action sequences and assert inventory and timer invariants. Record reproducible seeds for failures.
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

Inspect the opening feet view, third-person bedroom, door transitions, Mom on the couch, lane, commercial block, Robertson and shelves, all tree stages, tree timers, and menus. Look for inaccessible prompts, camera intersections, detached props, unreadable text, and progression traps.

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
