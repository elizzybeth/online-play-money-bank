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

- Walk the full drawer ladder for all currencies: `0`, `0.01`, `1`, `100`, `1,000`, `10,000`, `100,000`, `1,000,000`, `1,000,000,000`, `1,000,000,000,000`, and `1,000,000,000,000,000`.
- Tune high-wealth overlay density so core controls remain readable long enough to interact.
- Add a more obvious currency-change transformation animation.

## 2026-06-01: P1 Drawer Visualization Slice 2

### Scope

- Extended drawer ladder hardening from USD/JPY to all MVP currencies: USD, EUR, GBP, JPY, CAD, and AUD.
- Focused on making equivalent tiers feel intentionally different for every selected currency.

### Checks

- `node --check script.js`: passed.
- Local render-function harness walked all six currencies across the amount ladder.
- In-app browser smoke checked `10,000` for USD, EUR, GBP, JPY, CAD, and AUD with no console errors.
- Confirmed representative fixes:
  - JPY `1` renders as a small coin.
  - JPY `100` renders as a medium coin.
  - EUR `1` and GBP `1` render as toy coins, not note-styled coins.
  - EUR `10,000` and GBP `1,000` now render as stacks instead of loose single notes.
  - Million tiers still add money bricks.

### Changes

- Made note bundle calculation use ceiling division so high-denomination currencies stack sooner.
- Added currency-specific toy note color palettes for USD, EUR, GBP, CAD, AUD, and JPY.
- Applied proper coin sizing classes across coin-using currencies.
- Marked fractional coin pieces as tiny toy coins.

### Remaining P1 Work

- Live-check the full ladder visually when a viewport-capable browser runner is available.
- Tune high-wealth overlay density so the core controls remain readable long enough to interact.
- Add a more obvious currency-change transformation animation.

## 2026-06-01: P1 Currency Change Animation Slice 1

### Scope

- Implemented the spec requirement that currency changes should visibly transform existing money and sparkle.

### Checks

- `node --check script.js`: passed.
- In-app browser checked currency switches at:
  - Medium balance: `10,000`.
  - High balance: `1,000,000,000`.
- Confirmed during each switch:
  - Register receives the temporary currency-swap animation class.
  - Drawer/display money animates.
  - Eight currency-symbol tokens appear.
  - Fourteen sparkle particles appear.
  - Receipt logs `CUR old->new amount`.
  - Temporary class and tokens clean up after animation.
  - No console errors.

### Changes

- Added a currency-swap animation on the display and drawer money.
- Added currency-symbol token bursts over the register.
- Updated receipt logging from a plain currency line to `CUR previous->next amount`.

### Remaining P1 Work

- Tune high-wealth overlay density so the core controls remain readable long enough to interact.
- Add reduced-motion behavior before increasing animation complexity further.

## 2026-06-01: Settings and Reduced Motion Slice 1

### Scope

- Made the top-right settings button functional for MVP instead of a dead future-use control.
- Added reduced-motion support before adding more animation-heavy features.

### Checks

- `node --check script.js`: passed.
- In-app browser verified:
  - Settings dialog opens from the gear button.
  - Settings dialog closes with the Close button.
  - Reduced animation toggle adds the reduced-motion state.
  - Reduced animation persists after reload.
  - Wealth effects are hidden while reduced animation is enabled.
  - Reset saved state returns to `$1,000,000.00` USD.
  - Reset preserves the current reduced-motion preference.
  - Receipt logs `MOTION LOW`, `MOTION FULL`, and `RESET ...` events.
  - No console errors.

### Changes

- Added a native settings dialog.
- Added a reduced animation toggle.
- Added a reset saved state button.
- Persisted the reduced-motion setting with the existing app state.
- Suppressed generated wealth effects and fly-in/fly-out animation when reduced animation is enabled.
