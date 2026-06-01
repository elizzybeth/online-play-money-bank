# QA Log

## 2026-06-01: P0 Layout Stability Slice 1

### Scope

- Started the MVP hardening pass from `docs/mvp-hardening-plan.md`.
- Focused on phone and narrow-layout risk after the register canvas scaling change.

### Checks

- `node --check script.js`: passed.
- In-app browser sanity check at available viewport:
  - Register frame fits viewport.
  - Receipt tape still emerges from the receipt slot.
  - Receipt tape does not overlap the display.
  - No console errors.

### Changes

- Added explicit phone breakpoints for 400px and 360px widths so the register does not exceed narrow phone viewports.
- Compacted top bar spacing, brand size, and badge size under 520px.
- Made the currency controls flex within the available top-bar width.
- Reduced control-panel padding and border weight under 520px.
- Switched preset buttons to one column under 400px to avoid crowded labels.

### Remaining P0 Work

- Verify actual screenshots at 390, 480, 768, 1024, 1366, and 1920 widths when a viewport-capable browser runner is available.
- Check high-wealth overlays at phone widths, especially trillion and quadrillion.
- Check control-panel readability with the longest preset labels at 390px.

