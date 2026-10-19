# Development and release checklist

For each feature: review save compatibility and scene cleanup, run relevant fast unit/integration checks and the small browser smoke, build the Pages artifact, inspect changed visuals, and require the routine core and browser-smoke CI jobs before merging. Verify deployed assets and a focused live smoke test afterward. The user has authorized publishing completed requested changes and merging after CI passes; do not wait for another merge confirmation.

Every third feature batch, and whenever a player reports hiccups or growing storage, perform an efficiency review:

- Observe mutations for stationary HUD, day, location, prompts and labels; unchanged text, attributes and styles should produce no mutations.
- Profile idle and active play in town and Level 3. Check frame allocations, repeated scene traversals, layout reads and work that runs before its timer is due.
- Inspect IndexedDB size, compressed snapshot sizes, the bounded backup count and write frequency. Test legacy migration, refresh, rejected saves and storage failures.
- Check retained geometry, materials, textures, listeners and DOM after repeated interactions.
- Record measured before/after evidence; distinguish reduced work from an FPS claim. Add a regression for a confirmed bottleneck, then run the normal release checks.

## Profiling on every resume

At every Money Tree resume, run instrumented game measurements alongside native profiles before choosing optimizations. `node --import tsx tools/profile-game.mjs` uses a fresh browser save and collects opt-in frame/UI/render timings, DevTools CPU/heap/timeline profiles, renderer resource counts, network transfers and browser storage size in town, the maze and Level 3. `node tools/profile-tests.mjs` records the unit workload with Node CPU and heap profilers. Set `MONEY_TREE_PROFILE_DIR` to a private local output directory; never publish raw profiles or internal QA notes. Use the same scenario before and after changes, warm caches before retention comparisons, and distinguish software rendering from hardware performance. Inspect repeated interaction/resource retention and save failures with the existing efficiency/storage browser checks. Keep the ordinary release suite intact; profiling does not replace behavior tests.

## Fast feedback and browser coverage

Routine PR CI has two independent jobs: core (all Node unit/integration tests, types, build and exact compiled-artifact comparison) and browser-smoke (one headless Chromium test against that artifact). Aim for about one minute of warm-run feedback; record actual job timing rather than promising a hard wall-clock limit that includes runner queues and cold setup.

Use `pnpm test` for domain rules and integration journeys: economy, quests, crop growth, inventory, save validation/failures, collision/movement and Three.js geometry all run without WebGL. Unit files compile into content-hashed bundles and run in at most three bounded workers. Source, test helpers, tools and lockfile edits invalidate the cache; a completed-build marker prevents partial bundles being reused. Tests must restore any global stubs. Test real modules together instead of recreating game logic in mocks.

Use `pnpm test:smoke` (or `MONEY_TREE_BUILD_DIR=dist pnpm test:smoke`) for the actual renderer, DOM/keyboard wiring, model portrait upload and IndexedDB/save-worker/reload boundary. It uses one small viewport, one game session plus a reload, and a few controlled frames. Do not add whole-game story playback or animation settling loops to this gate. Inspect affected visuals locally when visual changes warrant it.

The existing full browser suite remains an optional regression archive: `pnpm test:e2e`, with `MONEY_TREE_BROWSER=firefox` or `webkit` when relevant. The workflow's manual `full_review` option runs it for a selected engine (Chromium by default); choosing `all` deliberately requests the expensive three-engine run. It is not a prerequisite for routine iteration. Add a browser regression only for behavior that cannot be adequately checked in Node or by the smoke; keep layout, geometry and state-transition assertions in fast tests whenever possible.

PR updates cancel obsolete runs. CI does not repeat on the merge push: it has already validated the exact artifact in the PR. Keep Pages deployment and the focused live verification. Browser failures retain screenshots and lightweight traces; timing reports retain wall time, driver CPU and memory. Raw native profiles and internal QA notes stay local.

Fast feedback targets are under 1 second for the warm unit command and under 10 seconds for the browser command on a warm machine; report cold compilation, runner setup and profiling overhead separately. Do not weaken assertions to meet a timing target. `pnpm test:stress` retains the 10,000-night journal simulation and full 1,000-seed sweeps; routine tests use representative histories and stratified seeds, while corpus reachability stops once all eight alternatives have actually been observed.

The smoke lets Chrome select its graphics backend instead of forcing SwiftShader. It keeps a real renderer at a small viewport, waits explicitly for asynchronous boot readiness, then checks DOM keyboard routing, a genuine model portrait, committed IndexedDB data and a full reload. Record the actual CI result; hardware-backed local timings are not a promise about software-rendered runners.
