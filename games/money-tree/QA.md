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
- 104 camera samples across doorways, room corners, shop aisles, garden, and an exterior roof edge.
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

Desktop keyboard and mouse. No touch/gamepad support yet. Interiors use a roofless dollhouse presentation to keep small rooms navigable. Other stores are conversational storefronts. Audio is synthesized. Cross-engine results and physical-device performance are recorded separately; WebKit automation does not substitute for a complete Safari device certification. The mother's operation remains the motivation, with no invented target cost or ending. Saves are browser-local, not cloud accounts.
