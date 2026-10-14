# Development and release checklist

For each feature: review save compatibility and scene cleanup, run the relevant unit/browser checks, build the Pages artifact, inspect any changed visuals, and require full cross-browser CI before merging. Verify deployed assets and a focused live smoke test afterward. The user has authorized publishing completed requested changes and merging after CI passes; do not wait for another merge confirmation.

Every third feature batch, and whenever a player reports hiccups or growing storage, perform an efficiency review:

- Observe mutations for stationary HUD, day, location, prompts and labels; unchanged text, attributes and styles should produce no mutations.
- Profile idle and active play in town and Level 3. Check frame allocations, repeated scene traversals, layout reads and work that runs before its timer is due.
- Inspect IndexedDB size, compressed snapshot sizes, the bounded backup count and write frequency. Test legacy migration, refresh, rejected saves and storage failures.
- Check retained geometry, materials, textures, listeners and DOM after repeated interactions.
- Record measured before/after evidence; distinguish reduced work from an FPS claim. Add a regression for a confirmed bottleneck, then run the normal release checks.
