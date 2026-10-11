# Money Tree thread request audit

Reviewed against the current source and regression suite, October 10, 2026. This records gameplay coverage, not an inference about which account or rate-limit interruption caused a gap. The earlier release records confirm Level 3 is merged (PR17); the current town-polish batch is being completed separately.

## Corrections that govern the result

- Mom's replies retain **Love you too**, including when she expressed love indirectly. The later restoration supersedes the request to remove those replies.
- Drink effects **end at sleep**. The drink menu warns about this; sleep requires confirmation while an effect is active. This supersedes the earlier awake-time-only duration request.
- The old inspector hat is now **Twin Planter**, with a distinct blue model and two adjoining beds planted together. Overnight growth supersedes real-time tree countdowns.
- Thread & Thimble's arrow reads **Angry Haberdasher**, superseding Angry Milliner.
- Five extra coin indicators mean **five additional price factors**, not five extra HUD prices.
- Stacy's chapters are shortened, and player choices directly ask the next question; the old 'I'd like to hear more / what else' detour is removed.

## Historical requirements checked

| Request group | Implementation evidence | Regression evidence |
|---|---|---|
| Doorway direction, smooth camera, scroll to first person, below-roof views, invisible nearby walls without stopping camera motion, camera entering town | `main.ts`, `camera-walls.ts`, `world.ts`; continuous camera-relative movement and independent indoor cutaways | `zoom.spec.ts`, `controls.spec.ts`, `navigation.spec.ts`, `garden-wildlife.spec.ts`, `camera-walls.test.ts` |
| Larger Robertsons showroom, accessible signs/tools, no camera snap around counters; lane-side meme entrances | `world.ts`, `sigma-world.ts`; shop layout and lane door openings | `regressions.spec.ts`, `zoom.spec.ts`, `navigation.spec.ts` |
| Sign depth / Z-fighting, taller Sigma entry, Ralphs-style Robertsons, Mad Hatter arrows | `signage.ts`, `world.ts`, `sigma-world.ts`; offset/deep panels | `family-story.spec.ts`, `regressions.spec.ts` |
| Sigma hidden before unlock, no leaked Chad plate; ATM clear of hedge | conditional world/nameplate visibility and hedge gap; `main.ts`, `sigma-world.ts` | `sigma.spec.ts`, `coin-atm.spec.ts`, `millionaire.spec.ts` |
| Wandering Chads explore varied routes, avoid one another and barista; shop/meme staff remain stationed | `wandering.ts`, `main.ts` | `wandering.test.ts`, `latest.spec.ts`, `family-story.spec.ts` |
| Varied neighbor plots, exotic flowers including gerbera, carnivorous plants, succulents, sunflowers, orchids, kangaroo paw, birds of paradise; hydrangeas, varied trees and fuller woods | `world.ts`, distinct species geometry and varied bed arrangements | `garden-wildlife.spec.ts`, `overnight.spec.ts` |
| Birds visit trees and Mom's birdhouses, butterflies visit yards | `wildlife.ts`, `world.ts` | `garden-wildlife.spec.ts` |
| Vegetable-letter community garden sign in wrought iron with large sigma at back | `garden-sign.ts`, `world.ts` | `family-story.spec.ts` |
| Seven $50–$500 bicycles including training wheels/tassels, penny farthing, cruiser and carbon road bike; wall/floor displays; all exceed running | `bikes.ts`, `bike-models.ts`, `world.ts` | `bikes.test.ts`, `bikes.spec.ts` |
| H mount/dismount, hands/handlebars, speed computer, B bell, locked vertical bike camera; talk/harvest mounted, block dig/plant/fertilize | `bike-cockpit.ts`, `main.ts` | `bikes.spec.ts`, `family-story.spec.ts` |
| Personal coin ATM appears on coin creation, giant coin, green buy/red sell, quantity and candlestick history; partial selling and five new price factors | `main.ts`, `sigma.ts`, `coin-chart.ts`; beds, birdhouses, discoveries, bicycles and tools affect drift | `coin-atm.spec.ts`, `coin-chart.test.ts`, `sigma.test.ts` |
| Money-tree seed packet art/count, pocket and piggy bank art, bottom HUD, Daily Net signed red/down for losses; one drink indicator | resource HUD in `main.ts`, `style.css`, `seed-packet.ts`, `daily-net.ts` | `family-story.spec.ts`, `garden-wildlife.spec.ts`, `daily-net.test.ts` |
| Inventory/money toasts and distinct sound for recovered harvest seed | `inventory-events.ts`, delta snapshots and harvest chime in `main.ts` | `inventory-events.test.ts`, `latest.spec.ts` |
| Doge meditation and corrected drug conversation, speech without quotation marks, seed handoff; Stacy and Doge unlock Pepe | `main.ts`, `sigma-world.ts` | `meditation.spec.ts`, `sigma.spec.ts`, `pepe.spec.ts` |
| Cowboy hat Hawk Tuah building, blonde-wig/cowboy-hat Stacy seated, dark floor, actual offered chair, ten empathetic short first-person chapters and direct curious questions, history and angled/aligned bubbles | `stacy.ts`, `sigma-world.ts`, `main.ts`, `style.css` | `stacy.spec.ts`, `dialogue.spec.ts` |
| Seed hints suppressed during Stacy/Doge/Pepe interactions | `seed-hints.ts`, interaction guard in `main.ts` | `seed-hints.test.ts`, `seed-hunt.spec.ts` |
| Pepe inflation dialogue, balloon growth/transparency/audio/pop, 100 rubber fragments including 25 seed packets scattered randomly, post-pop question | `pepe-event.ts`, `sigma-world.ts`, `balloon-audio.ts`, `main.ts` | `pepe.test.ts`, `pepe.spec.ts`, `balloon-audio.test.ts` |
| Unique notebook doodles, sticky controls outside pages, full-screen fit without content under buttons; garden familiarity after first few days | `notebook-doodles.ts`, `branching-journal.ts`, `style.css` | `notebook-fit.spec.ts`, `garden-wildlife.spec.ts`, `tv-news.test.ts`, `branching-journal.test.ts` |
| Couch faces TV; interactive cartoon/news channel about recent unlocks/shop/Pepe events | `main.ts`, `tv-news.ts`, `world.ts` | `town-update.spec.ts`, `overnight.spec.ts`, `tv-news.test.ts` |
| Rabbit hat jumps counters/items; shovel stays in hand; watering animation and dark soil ring; fertilizer application; trees mature at sleep and harvest in morning | `main.ts`, `world.ts`, `game.ts` | `mobility.spec.ts`, `digging.spec.ts`, `watering.spec.ts`, `overnight.spec.ts`, `latest.spec.ts` |
| Hat powers readable on rack; Sprout Cap stops seed-surprise hint after collection; distinct Twin Planter style and two-bed planting | `hats.ts`, `main.ts`, `hat-models.ts` | `hats.test.ts`, `hats.spec.ts`, `overnight.spec.ts`, current `town-polish.spec.ts` |
| Mom's room roof fit, Colorku puzzle, rainbow body/roof painting for both birdhouses, installation via actual door | `world.ts`, `main.ts`, `color-puzzle.ts`, `scene-route.ts`, `main.ts` | `color-puzzle.spec.ts`, `overnight.spec.ts`, doorway route assertions |
| $10k tell-Mom option; celebration with neighbors/birds/butterflies; next-day surgery absence and two-minute call; Auntie return, improved recovery without bed days, five-day Bea outing; tea/doily interior and $100k shop-saving goal | `family-story.ts`, `main.ts`, `world.ts`; new outside escort override below | `family-story.test.ts`, `family-story.spec.ts`, current `town-polish.spec.ts` |
| Complete Level 3 unlock/guru/assessment/all three detailed mascots/reclassification/card/seeds/guided trip/tall terraces/pagoda/tithing/automatic fertilizer/six residents and mansions/cars/yachts/excuses/six games/payments/microtransactions | `millionaire*.ts`, `phone-games.ts`, `phone-modal.ts`; separate detailed acceptance review in `work/millionaire-acceptance.md` | `millionaire.test.ts`, `millionaire-land.test.ts`, `phone-games.test.ts`, four `millionaire.spec.ts` full playthroughs; PR17 all twelve CI shards and public playthroughs passed |

## Gaps addressed in the current batch

- Fertilizer grains now persist on an applied bed until sleep, survive a save/reload, and have a purchased-dose HUD counter.
- Rack descriptions now contrast with the dark background. Hanging a hat closes the modal and animates the hat from the head to a hook. Only owned, unworn hats occupy rack hooks.
- Robertsons, Thread & Thimble and Spoke & Saddle have doubled wall heights, full pitched roofs and indoor cutaways.
- Windows are openings through wall geometry with glass inside the wall thickness. This also replaces the decorative opaque mansion window plaques.
- Mom's keyboard and TV have finite, positional sounds; the persistent noise loop is removed. News uses a muffled synthesized voice.
- Mom's Auntie-letter activity opens a text input and answers 'Beautiful sentiment. I’ll add that.'
- Grindset has a green/gold hexagonal coffee crest with Sigma, money-tree, and ascending-chart elements.
- Drink effects appear once in the resource HUD; the duplicate coin-tracker line is removed.
- Bed-rest Mom has a wider interaction reach.
- The recovery outing takes precedence over ordinary Bea dialogue. Bea welcomes both characters outside, leads through the front door, and offers the tea chairs.

## Release verification

Pending current-batch cross-browser CI and live verification. Coverage above identifies executable evidence, not a claim that every cosmetic detail is automatically proven by tests. Rate-limit/account history cannot establish the cause of any missing feature; source review establishes the implementation state.
