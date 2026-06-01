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

## 2026-06-01: P1 Drawer Visualization Slice 1

### Scope

- Started the core money visualization pass.
- Focused on making adjacent amount tiers read differently and making decreases feel like money actually leaves the register.

### Checks

- `node --check script.js`: passed.
- In-app browser sanity check:
  - `$10,000.00` renders medium-weight stacks.
  - `$100,000.00` renders thick stacks.
  - `$1,000,000.00` renders fat stacks plus money bricks.
  - Decreasing from `$1,000,000.00` to `$100.00` creates a 20-piece fly-out burst, then settles to the smaller drawer state.
  - No console errors.

### Changes

- Added bundle-weight classes so stacks get visibly thicker as each displayed stack represents more money.
- Preserved the symbol-only fake-money style while making `10,000`, `100,000`, and `1,000,000` silhouettes diverge more clearly.
- Scaled fly-out effects by decrease magnitude.
- Added coin fly-outs for tiny decreases, extra bills for larger decreases, and money-brick fly-outs for million-plus decreases.
- Lengthened fly-out animation so subtraction is easier to perceive.

### Remaining P1 Work

- Walk the full drawer ladder for USD and JPY: `0`, `0.01`, `1`, `100`, `1,000`, `10,000`, `100,000`, `1,000,000`, `1,000,000,000`, `1,000,000,000,000`, and `1,000,000,000,000,000`.
- Tune high-wealth overlay density so core controls remain readable long enough to interact.
- Add a more obvious currency-change transformation animation.
