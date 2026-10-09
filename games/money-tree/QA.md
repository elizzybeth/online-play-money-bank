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

### Journal release checks
- Unit checks cover event snapshots, exact first-harvest math, immutable facts, phrase reuse, style lint, words-as-money, invalid drafts and persistent jobs.
- Browser checks exercise sleep-to-generation, page numbering, retry after failure/reload, saved output and ignoring responses after reset.
- Evaluate the actual model on a seed-only night, the first harvested night and a later day with a new hat and a different observed Mom activity. Review voice and chronology; reject invented money, dialogue, repeated discoveries, adult motivational endings and repeated phrases.
- Confirm loading is visible, closing the notebook keeps gameplay responsive, unsupported GPU or network failure leaves an honest temporary entry, and no generated text affects gameplay resources.
- Verify the bundled worker and lazy model module resolve under `/money-tree/` on Pages. Test in isolated browser contexts so the user's real save is untouched.

Browser-model QA on a 16 GB Apple Silicon Mac used real Chrome WebGPU, a 2,048-token context, and two three-day sequences with different seeds. Reviewed entries cover waiting for the first bills, the first successful harvest ($7; $7.33 saved; $9,992.67 remaining; 1,428 further days at that income), and a later $6 day with Whirligig use and Mom painting after a tired day. A model-generated factual critic was tested and removed because it wrongly rejected valid reflections. Production checks use game facts and text guards. Repeat this qualitative check when changing the model or prompt; mocked CI completion is not evidence of prose quality.
