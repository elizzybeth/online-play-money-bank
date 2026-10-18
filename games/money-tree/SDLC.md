# Development and release checklist

For each feature: review save compatibility and scene cleanup, run the relevant unit/browser checks, build the Pages artifact, inspect any changed visuals, and require full cross-browser CI before merging. Verify deployed assets and a focused live smoke test afterward. The user has authorized publishing completed requested changes and merging after CI passes; do not wait for another merge confirmation.

Every third feature batch, and whenever a player reports hiccups or growing storage, perform an efficiency review:

- Observe mutations for stationary HUD, day, location, prompts and labels; unchanged text, attributes and styles should produce no mutations.
- Profile idle and active play in town and Level 3. Check frame allocations, repeated scene traversals, layout reads and work that runs before its timer is due.
- Inspect IndexedDB size, compressed snapshot sizes, the bounded backup count and write frequency. Test legacy migration, refresh, rejected saves and storage failures.
- Check retained geometry, materials, textures, listeners and DOM after repeated interactions.
- Record measured before/after evidence; distinguish reduced work from an FPS claim. Add a regression for a confirmed bottleneck, then run the normal release checks.

## Profiling on every resume

At every Money Tree resume, run instrumented game measurements alongside native profiles before choosing optimizations. `node --import tsx tools/profile-game.mjs` uses a fresh browser save and collects opt-in frame/UI/render timings, DevTools CPU/heap/timeline profiles, renderer resource counts, network transfers and browser storage size in town, the maze and Level 3. `node tools/profile-tests.mjs` records the unit workload with Node CPU and heap profilers. Set `MONEY_TREE_PROFILE_DIR` to a private local output directory; never publish raw profiles or internal QA notes. Use the same scenario before and after changes, warm caches before retention comparisons, and distinguish software rendering from hardware performance. Inspect repeated interaction/resource retention and save failures with the existing efficiency/storage browser checks. Keep the ordinary release suite intact; profiling does not replace behavior tests.

Shared unit, type/build and compiled-artifact checks run once in the CI core job. Eighteen browser shards retain complete Chromium, Firefox and WebKit coverage, splitting individual tests across six shards per engine with one worker each. They serve the compiled Pages artifact directly instead of repeating Vite transforms. Each shard uploads a small timing report; failure screenshots and lightweight traces are retained. Set MONEY_TREE_FULL_TRACE=1 when DOM snapshots and screenshot tracing are needed for diagnosis. Reference screenshots from the farm review run only in Chromium; browser behavior assertions still run in every engine. Include assertions about model proportions, actual interaction results, save round trips and route clearance rather than treating screenshots alone as automated checks.
