# Money Tree

A single-player 3D browser game for Online Play Money Bank. TypeScript + Three.js. 3D models are procedural; the title logo is a bundled illustrated asset. Gameplay assets are bundled. No accounts or paid services are required; the branching notebook works offline without a model download.

## Play

WASD walks relative to the camera. Click the game view to capture the mouse and look freely; Escape and interactive menus release it. Drag the view or use left/right arrows if pointer lock is unavailable. E interacts and activates the highlighted safe default action in a menu. Save replacement/reset actions require an explicit selection. Space jumps while wearing Spring Hare. J opens the notebook, I opens the bag, Escape pauses. Hold Shift to run. Your bag shows illustrated item cards with quantities and tool ownership. The pause menu includes sound, graphics, and reduced-motion controls. Start in bed, withdraw the $4.33 from the piggy bank on your desk, visit Robertson in the shop at the north end of the lane, withdraw a chosen dollar-and-cent amount or all your savings, buy five seeds ($2), a can ($1), and a shovel ($1), then return to the five garden plots behind your house.

Planting takes 2 seconds with the shovel or 8 by hand; press E and stand still until it finishes. Moving cancels planting without spending a seed. Watered seeds stay small until you sleep, then become harvest-ready in the morning. There are no crop countdowns. Fertilizer costs $5 for a box of five doses. After watering, press E again when prompted to fertilize that tree, improving its overnight harvest. Trees yield $2–$7, or up to $9 when fertilized, then wither after harvesting. Plant a new seed in the withered plot. Robertson sells only the first bag; the next five seeds are tucked into the brim of a cap inside Thread & Thimble. The brim’s five seeds can be collected once without buying the cap. Sleep in bed to finish watered crops and write a personal reflection on a new notebook page. The notebook opens to the latest page; turn pages with the buttons or left/right arrows. First-night doubts and the first harvested night’s surprise reflect on Mom’s $10,000 surgery goal, including the days needed at that day’s harvest income. Return home to check in with Mom: tired days find her resting on the couch, and good days find her cooking, building birdhouses, painting, reading, or visiting the garden. Your private thoughts appear separately from her speech. NPC names and conversations appear over their heads; walking continues during conversations. Neighbors rotate through new lines and remember their dialogue progress in the save. Inventory, notebook, shopping and pause menus, plus hidden tabs, pause active gameplay. Existing activity-log journal entries are condensed into short reflections when loaded. Saves are local to this browser; use the pause menu to export/import them.

## Develop

If you get stuck, press Escape and choose **I'm stuck — return home**. This cancels unfinished digging and returns you to clear ground in your bedroom without resetting your day, money, inventory, notebook, or garden. Newly growing trees also move an overlapping player onto nearby clear ground automatically.

Use Node 22+ and pnpm 11.

```
pnpm install
pnpm dev
pnpm test
pnpm test:e2e
pnpm test:visual
pnpm build
```

Local browser tests use installed Google Chrome on macOS. Set MONEY_TREE_BROWSER=firefox or MONEY_TREE_BROWSER=webkit for those engines after installing them with Playwright. CI uses Playwright Chromium (`pnpm exec playwright install --with-deps chromium`). `?test` explicitly enables a diagnostic harness with controlled clock and scene inspection. Normal sessions omit that harness.

`src/game.ts` holds renderer-independent gameplay, save validation, and movement collision. `src/world.ts` builds the neighborhood, collision shapes, targets, and art. `src/main.ts` connects real controls, camera, UI, audio, and persistence.

Visual tests are opt-in: `pnpm test:visual` compares against reviewed macOS Chrome screenshots with reduced motion. Baselines are platform-specific; inspect diffs before updating them. The CI matrix runs gameplay, navigation, camera, and save tests in Chromium, Firefox, and WebKit without imposing one platform’s font rasterization on another.

## Hosting

`pnpm build` produces `dist/` with relative asset URLs. Copy the contents to the existing site's `money-tree/` directory. Source and tests belong in `games/money-tree/` in the host repository. Keep the existing root `CNAME` and publishing method. The checked-in build avoids changing the site's publishing configuration.

## QA

See QA.md for the release checklist, automated coverage, and remaining scope. This is an initial playable release. Mobile touch controls, full voiceover, real multiplayer, disease, pests, extra shop systems are future work.

## Thread & Thimble

Walk through the shop’s doorway from Market Lane. Ten original procedural hats have distinct stitching, brims, bands, lenses, ears, stars, veil, feather and lamp details. Inspect a stand to read the price and ability; buy to wear it, or equip/take off owned hats from the illustrated bag. Ownership and up to three equipped hats persist in saves. Their powers work together. The bedroom hat rack lets you hang up individual hats and put others on. Taller hats sit higher, with rabbit ears and the whirligig prioritized at the top. Old saves retain their previously equipped hat.

| Hat                  | Price | Power while worn                                                                                                |
| -------------------- | ----: | --------------------------------------------------------------------------------------------------------------- |
| Sprout Cap           |    $2 | Plant 15% faster and have a 50% chance of recovering one seed per harvest; its brim hides the second seed batch |
| Whirligig            |    $8 | Walk/run 25% faster                                                                                             |
| Spring Hare          |   $12 | Jump with Space                                                                                                 |
| Twin Planter         |   $15 | Plant two adjoining beds in one action, spending two seeds                                                      |
| Digging Helmet       |   $20 | Plant in half the usual time                                                                                    |
| Moonrise Wizard      |   $30 | 50% chance to conserve a fertilizer dose                                                                        |
| Rainy Day Sou’wester |   $40 | Auto-water newly planted seeds if a can is owned                                                                |
| Lucky Tallboy        |   $60 | Add $1 to harvests, capped at $7                                                                                |
| Honey Keeper         |   $80 | Fertilized trees maturing while worn yield at least $6                                                          |
| Night Gardener       |  $100 | Three-metre interaction reach and glowing lamp                                                                  |

Powers apply only while equipped. Jumping keeps horizontal wall and world-boundary collisions intact. Gardening yield powers preserve the $7 maximum.

## Branching journal

At bedtime, the game immediately writes a permanent page from observed events and a reviewed passage library. No LLM, API key, model weights or WebGPU is needed for the notebook. Existing pages remain readable; old pending model jobs are retired without rewriting their pages. The opening page is Day 1; subsequent pages count upward and open to the latest page.

`journal.ts` captures immutable facts and exact money calculations. `branching-journal.ts` selects passages from `journal-passages.ts`, with explicit triggers for story milestones, Mom's observed activities, consecutive-day health changes, gardening, discoveries, neighbors and actual hat powers. Saved worry, hope, confidence, frustration, connection and fatigue influence reflections. Emotions ease towards a baseline and are modified by today rather than replaced. Observed Mom health and dates are remembered; missed visits never invent her condition. Older saves initialize conservatively from structured history.

A per-playthrough random seed, bounded passage-use memory and recent seven-word phrase checks provide variation while preserving reload stability. Repeated alternatives are avoided when eligible fresh options exist; optional passages are omitted when their pool is exhausted. First-harvest arithmetic uses the actual harvest and available balance against the $10,000 goal. No-income days never claim financial progress. Page bodies contain no em dashes or motivational stock phrases.

Tests simulate 10,000 nights across varied seeds and check facts, narrative milestones, emotional transitions, prose variety and save stability. Manual multi-day reviews cover careful gardening, hat purchases and distracted play. Browser checks verify sleep, page navigation, reload, legacy pages, reset and absence of model/network downloads. The finite library is deliberately editable: adding gameplay requires adding observed events and tested passage conditions.

Garden expansion: Robertson sells a portable wooden bed for $30 and a bag of soil for $10. Open the bag and choose Place a garden bed, walk to clear ground on your property, then press E while the preview is green. Escape keeps the bed in your bag. Paths, doors, scenery and existing beds are reserved. Press E at the empty bed to use one soil bag before planting. Bed positions and supplies persist in saves.

After the cap seeds, a one-time five-seed packet appears at a saved random spot in the western trees. Collecting it unlocks another five-seed packet behind tins in Robertson's store. Up/down arrows tilt the camera; WASD walks. Mom's saved conversation counters provide changing replies, with coughing restricted to tired days.

## Family and town update

Mom has ten good-day activities: cooking, birdhouses, painting, reading, gardening, mending, jigsaws, music, letters, and feeding birds. Some tired days she rests in her new bedroom. Completed birdhouses remain hanging in outdoor trees. E at the couch sits the player beside Mom or alone; E again stands. The wake-up scene shows the complete character lying down in third person.

Mom has 200 additional authored activity-specific replies in `src/mom-dialogue.ts`. The 200 authored thoughts in `src/mom-thoughts.ts` use observed health/activity, gardening progress, money, and occasion; saved selection history prevents repeats until eligible lines are exhausted. Thoughts appear in a cloud with round trailing bubbles anchored above the player's head.

Hidden seed packets progress through the cap, the woods, Robertson's shelves, a neighbor's flowerbed, and behind the TV. Each gives five seeds once. Robertson explains the search immediately after the initial purchase. Neighbor gardens include distinct vegetable rows and tropical clusters. A single union mesh with world-aligned UVs prevents sidewalk overlap flicker. Indoor cameras rise above exterior walls and aim within the current building.

Journal selection rejects repeated three-word phrases within the same page, in addition to tracking recent passages across days. Additional journal families cover the new activities, bedroom rest, observed birdhouses, and the two new seed discoveries. Existing pages and balances remain intact when saves migrate.

## Sigma Town

The fifth hidden packet (behind the home TV) opens the hedge at the end of the lane past Thread & Thimble. A new footpath leads to Sigma Town. Its seven male Chads have grayscale, broad-shouldered chibi models and independent dialogue counters: each pool has 144 distinct combinations of twelve role-specific jokes and twelve closing quips. The community-garden Chad criticizes sharing, while Grindset's barista calls the same work entrepreneurial.

Ten public beds form a large Σ. They start with withered money trees and use the normal seed, watering, fertilizer and harvest rules. Existing saves get the beds once when unlocked; up to fifty home plots can coexist with ten community plots. The Doge, Pepe and Hawk Tuah houses are original modeled silhouettes with walk-in doorways and roof cutaways. The lone wolf statue takes exactly $1 without granting any luck or changing yields.

Grindset sells five drinks, each lasting 180 seconds of active play: $2 Hustle Espresso (30% movement), $3 Deep Work Mocha (half planting time), $4 Compound Cold Brew (50% chance to recover a seed per harvest), $5 Bull Market Latte (+$1 harvest, capped at $7 normally or $9 when fertilized), $2 Networking Tea (three-meter interaction reach). A new drink replaces the previous effect. Effects persist in saves, pause with the game, and advance overnight.

Planting a public bed unlocks the barista's coin offer. The player chooses a validated 1–24-character name and gets a top-right tracker. Investments spend pocket cash at the displayed price; selling realizes the current value. Prices move every fifteen active seconds using a separate saved RNG, bounded at $0.01–$1,000.00. Random moves outweigh the small drift from total harvest earnings, bank savings, Mom's current health, unique neighbors met, active trees and her longest good-day streak. After the original twenty-day activity rotation, Mom's health schedule includes varied runs of good and bad days. This system is entirely in-game and has no wallets, tokens, network calls or real purchases. New journal branches respond to actual visits, public planting, drinks, naming and investing.

The neighborhood has seventeen planted beds, including carnivorous plants, succulents, sunflowers, vegetables, and tropical foliage. Woodland trees vary between oaks, pines, maples, and birches; berry bushes, junipers, and flowering shrubs fill the yards and edges. Birds visit tree perches and completed birdhouses, while butterflies follow garden-local flight paths. Wildlife has no collisions or save-state effects and respects reduced motion. The HUD shows a seed packet and seed count. Notebook sketches vary by page, and page controls remain outside the scrolling entry.

## Spoke & Saddle bicycles

Spoke & Saddle is a 20 by 18 metre walk-in showroom west of Robertsons. Four bikes stand on floor platforms and three hang on the back wall. Seven styles range from $50 to $500: Ribbon Rider with training wheels and tassels, High Society penny-farthing, Sunday Cruiser, Little Ripper BMX, Town Courier, Trail Fox mountain bike, and Carbon Comet road bike. Each has a distinct model and speed. Even Ribbon Rider beats running with both speed bonuses.

Buy at a physical display, choose an owned bicycle in the illustrated bag, and press H outside to mount or dismount. W/S pedals or brakes/reverses; A/D steers; mouse and arrows look. B rings the handlebar bell. Riding uses a first-person view with hands, handlebars, and a km/h computer reporting actual movement, including zero when stopped against a wall. Entering a building dismounts automatically; jumping and rolling require dismounting. Ownership and selection survive reload; riding itself is temporary. Old saves migrate without resetting the garden or notebook.

Scroll over the game to zoom from third person into first person; scroll back to pull away. Sigma's three meme buildings open toward the lane, with a path along their east side. A named coin unlocks its ATM beside Grindset, including partial Buy/Sell and recorded-price candles. Stacy's chair conversation advances directly through questions; Previous messages lets you reread completed chapters. Pocket cash, piggy-bank savings, and seeds each have a pictorial HUD counter.

Structural walls cut away when they obstruct the camera and return when it moves clear. This does not let the player walk through walls. Applying fertilizer animates a shaken box and falling granules. Inventory changes appear in a separate notification stack, and hat rack cards show every hat's effects.

Daily Net shows realized money earned minus spent during the current day. Piggy-bank transfers are neutral. Drink bonuses keep their remaining time overnight. On puzzle days, Mom invites you to play a saved color Sudoku; the game pauses while its board is open.

Drinks last up to three awake minutes and end when you sleep. The drink menu explains this; sleeping with an active drink requires an explicit confirmation, with staying awake as the E default. On birdhouse days, pick body and roof paint for two houses and join Mom in a short hanging scene. Choices and finished houses persist. Bea has a red, orange and yellow gerbera bed. Pepe scatters packets irregularly onto clear ground, with stable positions after reload.

Interact with the living-room TV to switch between bunny cartoons and Town News. The animated anchor and captions recap the last three in-game days, including the Sigma passage, bike-shop opening, Pepe demonstration, and birdhouse hanging. Grindset has a wood counter, white brick backdrop, coffee machinery, shelf mugs and bags, hanging plants, pendant bulbs, and a readable drinks board. Wildflower clumps are modeled daisies, buttercups, and bluebells. Community-garden journal reflections become familiar after two planting days.

## Surgery, recovery and Bea’s tea

At $10,000 in pocket money plus savings, tell Mom the good news. Surgery is paid once, the neighborhood celebrates, and Mom schedules the following day. She is absent on surgery day; after two minutes of active, awake play the phone rings. Answer before sleeping. Mom returns the following morning, gradually improves, and still has couch days but no bed days. Five days after surgery, walk with her to Bea’s house and sit at the tea table. The complete conversation reveals Robertson’s $100,000 shop-saving goal. Progress, payments and conversation stages persist in saves; journal passages follow the current story phase.

Bicycle riders can talk, harvest and water. Planting, digging and fertilizer require dismounting with H. Vertical camera controls lock while mounted and restore on dismount. Owned hat models appear on the bedroom rack.

Pocket money, savings, seeds, Daily Net and active drinks sit along the bottom of the screen, with interaction prompts above them. Thread & Thimble’s middle arrow reads Angry Haberdasher. Its rotated arrows are spaced apart; meme-building signs stand clear of their walls and roof details. The browser regression checks test actual sign bounds and bottom-HUD layout at desktop and narrow widths.

The Community Garden has modeled vegetable-shaped lettering built into an iron fence behind the plots, with a large iron Sigma above it. Street Chads choose fresh two-dimensional routes, pause and change direction, keep personal space, and leave Grindset’s counter clear. The back chalkboard simply reads Drinks. Stacy’s replies have an angled top-right corner; player replies and history entries are right-aligned with an angled bottom-right corner.

## Level 3: Mt. Millionaire

Earn $100 in new income after Pepe pops to open the back hedge beside the coin ATM. Follow the lane into a dense willow grove, meet the orange-robed guru, and answer twelve money-and-values questions. The assessment introduces Massive Investment Arms (octopus with investment toys), Bridge to Total Freedom (alien with an E-meter), and Breath of Fire (double-headed lotus serpent). All three appear; the matched host welcomes you. Retaking can change membership without duplicating gifts.

Joining gives a HUD membership card and one seed packet. Your host leads along a roughly thirty-second running route to the white terraced mountain; the central ascent takes about fifteen seconds at normal running speed. Meet six members on the terraces and the guide inside the summit pagoda. The guide explains the automatic fertilizer benefit and the ten-percent contribution, then gives twenty-five packets. Plant in the prepared terrace patches or press E over clear fertile terrace soil to create another planting patch. Mountain trees grow in fertile terrace soil without watering or fertilizer.

New earnings contribute 10% after accepting the summit agreement. Harvest income, phone-game rewards and realized coin profits qualify; withdrawals, deposits and recovered coin principal do not. Gross mountain harvest income funds the six residents' visible moves and rising mansions, with all six estates unlocked by $1,000. Cars and yachts follow as their wealth increases. Mansion owners come out to thank you, give rotating excuses for not inviting you in, and sell six distinct $5 smartphone games. Each game's ten-point win earns $1 before the contribution; an optional $1 purchase gives a real advantage. Purchased apps remain available from your membership card. All amounts are fictional game money.

The October 10 town polish adds persistent fertilizer granules and a dose HUD, physical hat-hanging with unworn-only rack displays, doubled-height shops with roofs, recessed translucent windows, localized keyboard/TV audio, Auntie letter input, a Sigma coffee crest, and Bea’s recovery-visit doorway escort. Active conversations keep their choices visible if a camera angle obscures the speaker. The complete earlier request audit is recorded with the release notes.

### Mt. Millionaire gardening and homes

Talk to the Community Guardian in the summit pagoda to open **Terrace Threads** at the mountain foot. Its ten hats are Terrace Conductor (plant or harvest a terrace), Verdant Sprout (faster planting and 60% seed recovery), Seedkeeper’s Bonnet (80% mountain seed recovery), Golden Harvest Crown (20% mountain harvest bonus), Compost Curator (double scraps), Terrace Surveyor (4.5-metre reach), Summit Strider (35% faster mountain travel), Soil Alchemist (75% fertilizer conservation), Dewdrop Tiara (automatic watering), and Nest Egg Topper (bank 25% of net harvests). The existing three-hat limit applies.

The outside Seed ATM always stocks five money seeds for $50, five iris seeds for $10, and five pepper or tomato seeds for $15. Plant the new crops in soil-filled home beds. Water them and sleep; irises remain in bloom, while vegetables yield cooking ingredients. A neighboring composter exchanges 25 scraps for soil.

Follow the guru assessment, community invitation, summit conversation, and terrace harvest prompts. After $1,000 in gross mountain harvests and the six community homes have appeared, the game prompts you to ask the Guardian about your own home. Magnate Mansion and Presidential Palace have previews rendered from their actual models. You can decline, pay $1 million outright, or put $1,000 down on a $10/day mortgage; 40% of payments is interest.

Chad traders rebalance around a valuation target that grows 2% per game day. This is a target, not a guaranteed return. Randomness and game events still cause spikes and crashes. Below $1, negative price factors are ignored until recovery. A crash also suspends negative factors for three minutes of game time; the remaining protection is saved.

Soyjak Party sits between Food of the Gods and Grindset. An $8 Impossible Burger doubles the character’s model size for 120 seconds; $4 soy milk adds a folded Serious Hat above the equipped stack for 120 seconds. The effects coexist with each other and coffee, refresh independently on repeat purchase, persist through reload, and end on sleep. Movement clearance remains unchanged so growing cannot trap the player in a doorway.

Terrace Threads stays available once terrace planting is unlocked, even in saves without the old Guardian greeting marker. Mansion Marvels now has fourteen purchasable display pieces with model previews, including an emerald Chesterfield, linen sectional, pleated petal chair and bentwood arc lamp. Furnishings enter the Bag and can be arranged with the F5 furniture editor; existing item IDs and placed furniture remain compatible.

### Furniture editor and desert seed falls

Press **F5** (or choose Furniture editor in the Bag) to browse model thumbnails of bag and placed furniture. Select a model and walk around while previewing it. E confirms, R rotates (Shift+R for fine rotation), the mouse wheel changes distance, L locks the preview in world space, arrows nudge its position, and Page Up/Down adjusts height. Escape cancels a preview without altering the saved item; F5 exits. Placed models can be moved or returned to the bag. Placement still rejects walls, windows, obstructions and locations outside your home. Mom’s paintings can be moved but remain on display.

Meteor strikes now recur every 240–360 seconds of active awake play, averaging five minutes, without requiring sleep. The timer persists across refresh and pauses while the game is paused or asleep. Each impact grows a ready money tree and scatters ten packets of five money seeds around it. Each packet is collectible once and remains collected after refresh; the six crater sites and their packet sets stay bounded when sites are struck again. Old saves migrate from the former one-to-three-sleep schedule without losing their craters.

The mountain has 162 prepared tree sites, including 62 additional outer terrace trees. Existing coordinates and progress are retained. Terrace Threads also has a hat-management rack. Chad strategy dialogue describes each trader’s individual approach without announcing the market’s internal growth target. The Serious Hat has childlike lettering on both slopes and both end faces; Soyjak Party uses a sharper sign texture. Birdhouse hanging uses a single camera controller for the entire animation.


Mom remains at the little house after a mansion purchase, including in legacy saves that placed a bed for her. There is no moving-truck scene or bed requirement. At home, choose “Mom, I bought a mansion.” Her conversation has several reasons and invitations to choose from; she is happy with the little house, chickens and birdhouses, and does not want to move. The exchange can resume after closing or reloading.

Replanting a home money-tree bed with irises, peppers or tomatoes brings Mom outside to admire the garden. She asks whether you can afford to give up the money trees; the player can tell her she is worth it. This one-time conversation saves its progress, waits while Mom is away at the hospital or on an outing, and leaves her enjoying the garden that day before her normal home activities resume.

### Efficiency review, October 16

TV news now rebuilds when its day, event log or archived history changes, rather than scanning the journal every frame. Mom’s setup changes only when her day, recovery schedule, escort or garden mode changes. Stationary browser checks record zero repeated news/Mom setup rebuilds and zero mutations across nine HUD regions and hidden bed labels.

Scene routes use exact segment clearance against expanded collision rectangles, so smoothing cannot clip narrow obstacle corners. Clear paths skip the grid search. A measured open-route case dropped from 9,540 collision reads to one; 300 route-length queries dropped from 300 temporary array copies to none. These are reduced-work counts, not FPS claims. An unfinished garden visit now yields to the following day’s schedule, and ending an escort restores Mom’s home pose without requiring a forced refresh. Save format, compressed storage and backup bounds are unchanged.

### River and mountain alleys, October 16

A river follows the player's sketched route past Willow Grove, down Sigma Town's east edge, and through the village. Two wooden bridges keep the intended roads connected. The Willow Grove bridge continues straight along the approach; the east end of the Thread & Thimble road has no river crossing. Open fencing closes the riverside turn without hiding the water. The channel is cut out of terrain and pavement, with sloped banks, reeds, shrubs, flowers and trees. Bank greenery and water have a separate drought state for the future restrictions story; no restrictions begin in this release. Existing custom garden beds affected by the channel move to dry lawn while retaining their crops and harvest state. Mabel gardens beside her house on dry ground.

Mansion Marvels moves four units east and Terrace Threads six, leaving alleys beside the community mansion row and between the shops. Their paths, service stations, hat rack, collision and interaction points move together. Fertilizer at Robertson's now includes a preview of its actual model. After the player launches a meme coin, all Chads, including café staff and Soyjak, switch together to golden open hands with blue diamond facets. They retain ordinary hands before launch.

After Pepe's balloon pops, Mr Wacky appears in the center of the room while the host stands aside. Interact to start his inflatable dance and hear “Good clean fun!”, “Legal fun!”, “Illegal fun!”, “Sexy fun!” or “Inflatable fun!”; “Again!” cycles the sayings. The character returns from existing popped-Pepe saves without adding save fields, and reduced-motion mode softens the dance.


### Expanding hat stacks and the home bike rack

The starting hat limit is three. Opening Sigma Town adds a fourth slot; opening Mt. Millionaire adds a fifth. Both racks, shop purchases, the bag and save validation use the same derived limit. Existing saves retain their stacks and automatically gain the slots they have unlocked. The temporary Serious Hat remains an extra cosmetic effect.

The owned-bike rack stands at the house's southeast corner, clear of its doors and the main lane. Its post-mounted charcoal sign has a white border, tall BIKE RACK lettering and a bicycle pictogram. Choosing, storing and mounting bicycles still use the same saved ownership.
