# Online Play Money Bank MVP Hardening Plan

## Goal

Make Pretend Rich Mode feel complete, resilient, and toy-delightful before adding store or game systems.

## MVP Acceptance Checklist

- User can enter any amount, including decimals.
- User can choose USD, EUR, GBP, JPY, CAD, and AUD.
- Register display updates instantly and uses selected currency formatting.
- Money visually accumulates in the drawer.
- Visual scale increases clearly from tiny amounts through ridiculous wealth.
- Increasing amounts animate into the drawer.
- Decreasing amounts animate out of the drawer.
- Currency changes update visible money symbols.
- Balance and currency persist after refresh.
- Disclaimer is visible.
- The app works smoothly at desktop widths.
- The app remains usable at common phone and tablet widths.
- The experience reads as toy-like, not finance-like.

## QA Matrix

### Viewports

- 390 x 844: phone portrait
- 480 x 900: large phone portrait
- 768 x 1024: tablet portrait
- 1024 x 768: tablet landscape
- 1366 x 768: laptop
- 1920 x 1080: desktop

### Amounts

- 0
- 0.01
- 1
- 100
- 1,000
- 10,000
- 100,000
- 1,000,000
- 1,000,000,000
- 1,000,000,000,000
- 1,000,000,000,000,000

### Currencies

- USD
- EUR
- GBP
- JPY
- CAD
- AUD

### Interactions

- Type an amount manually.
- Use each preset button.
- Use calculator digits and operators.
- Clear the register.
- Open the drawer.
- Change currency after setting a large balance.
- Refresh and confirm persisted state.
- Decrease from a large balance to a smaller balance.

## Current Priority Backlog

### P0: Layout Stability

- Verify register scaling on phone, tablet, laptop, and wide desktop.
- Ensure the receipt always emerges from the receipt slot.
- Ensure the display, keypad, drawer, and receipt do not overlap unexpectedly.
- Ensure the control panel buttons do not overflow at wide or narrow widths.

### P1: Core Money Visualization

- Make each amount tier visibly distinct.
- Tune non-USD currency denominations, especially JPY coins and notes.
- Make decreasing balances visibly remove money from the drawer.
- Keep ridiculous wealth effects dramatic without hiding the core controls too early.

### P1: Interaction Quality

- Improve calculator operation feedback on the receipt.
- Make currency-switch animation more visible.
- Verify localStorage state restoration across all supported currencies.

### P2: Accessibility

- Add/verify visible focus states.
- Confirm keyboard-only operation for input, presets, currency select, calculator, clear, and open.
- Confirm live text updates are useful and not noisy.

## Done Definition

For each fix:

- Reproduce or identify the issue.
- Make the smallest code change that addresses the behavior.
- Verify in browser or with a relevant automated check.
- Commit with a clear message.
- Push to GitHub Pages.

