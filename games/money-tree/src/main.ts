import { completeMeditation } from "./sigma";
import { TEA_SEAT_HEIGHT, seatForTea } from "./tea-pose";
import { nightDialogue, hasAlternateChadTopic } from "./night-dialogue";
import { farmFields, forageFarm } from "./farm-fields";
import { riverDistance } from "./river-land";
import {
  DAY_SECONDS,
  NIGHT_SECONDS,
  MAX_HP,
  isNight,
  nightState,
  tickNight,
  NightCombat,
} from "./night";
import { createNightWorld } from "./night-world";
import { createTVCaptions } from "./tv-captions";
import { profiling } from "./profiling";
import { relocateRiverBeds } from "./river-gardens";
import {
  canTellMomAboutMansion,
  beginMansionConversation,
  mansionConversation,
  gardenConversation,
  replyToMom,
  homeGardenReplanted,
} from "./mom-home-story";
import { createFurnitureEditor } from "./furniture-editor";
import { collectMeteorPacket } from "./adventure";
import { buySoy, soyProducts } from "./soyjak";
import {
  crops,
  isFlower,
  seedCount,
  activePlantingSeed,
  selectPlantingSeed,
  seedOffers,
  buyGardenSeeds,
  plantCrop,
  harvestCrop,
  type Crop,
} from "./garden-crops";
import { createMountainShop, mountainShopOpen } from "./mountain-shop";
import { mountainHat, mountainHats } from "./hats";
import { makeEstate } from "./estate-models";
import {
  shopRescueActive,
  shopProgress,
  canSaveShop,
  nextRobertsonHistory,
  chooseShopPlan,
  reportShopProgress,
  saveRobertsons,
} from "./robertson-story";
import { playableBounds, withinPlayableBounds } from "./world-bounds";
import { makeChickenFeather } from "./chicken-feather";
import { debugActions, applyDebugAction, type DebugAction } from "./debug-menu";
import { IndexedSaveStore } from "./indexed-save-store";
import { depthAudit } from "./depth-audit";
import { makeGrocery } from "./grocery-models";
import { makeCrop } from "./crop-model";
import { moneySkeleton } from "./money-tree-model";
import { productPortrait, cloneProductModel } from "./product-portrait";
import { createNeighborGardens } from "./neighbor-gardens";
import { createEstateWorld } from "./estate-world";
import { makeTruck, makeRepoMan } from "./estate-models";
import {
  buyMansion,
  sellMansion,
  housingSaleValue,
  mansionPrice,
  mansionLot,
  marvelsLot,
  type MansionStyle,
} from "./housing";
import { createMeteorWorld } from "./meteor-world";
import {
  chooseDesertReflection,
  shuffledAnswers,
  onMillionaireApproach,
} from "./desert-reflections";
import { requestFeather, noteChickenCuddle, giveFeather } from "./adventure";
import { registerTraders, traderDialogue, rangePrices } from "./market";
import { makeCookingPan } from "./cooking-pan";
import {
  ingredients,
  meals,
  mealMask,
  buyGrocery,
  startMeal,
  finishMeal,
  tickFood,
  purchasePrice,
} from "./meals";
import { makeDish, makeIngredient, foodIllustration } from "./food-models";
import {
  furnishingCatalog,
  furnitureById,
  homeLevel,
  canPlaceFurniture,
  type FurnishingId,
  type PlacedFurniture,
  type WallSpace,
} from "./furnishings";
import { makeFurnishing } from "./furnishing-models";
import { notebookLines, notebookSpreads } from "./notebook-layout";
import {
  compostFertilizer,
  buySpanakopita,
  shareSpanakopita,
  gardenBatch,
} from "./town-life";
import { makeMascot } from "./millionaire-models";
import { HomeAudio } from "./home-audio";
import { sceneRoute, routeLength, alongRoute, type Point } from "./scene-route";
import {
  fellowships,
  fellowship,
  assessment,
  answerAssessment,
  retakeAssessment,
  joinFellowship,
  acceptTithe,
  mansionCount,
  buyApp,
  appNames,
  ensureMountainPlots,
  addMountainPlot,
  type Fellowship,
} from "./millionaire";
import {
  terraceLine,
  mansionLine,
  summitConversation,
} from "./millionaire-dialogue";
import { terrainHeight, fertileMountainSoil } from "./millionaire-land";
import { mountPhoneGame } from "./phone-modal";
import { createNewsFeed } from "./tv-news";
import { inBeaHouse } from "./bea-room";
import {
  storyPhase,
  momAway,
  recoveryDays,
  canTellMom,
  canVisitBea,
  scheduleSurgery,
  tickSurgery,
  answerMomCall,
  beginBeaWalk,
  acceptShopGoal,
  surgeryThoughts,
  recoveryReplies,
  teaConversation,
} from "./family-story";
import {
  paintColors,
  birdhousePreview,
  type BirdhousePaint,
} from "./birdhouse-paint";
import { plantingBatch, plantBatch } from "./game";
import { colorPuzzle, puzzleColors, puzzleConflicts } from "./color-puzzle";
import { DailyNetLedger } from "./daily-net";
import { inventorySnapshot, inventoryChanges } from "./inventory-events";
import { CameraWalls } from "./camera-walls";
import { playerMomResponse } from "./mom-dialogue";
import { coinChart } from "./coin-chart";
import { notebookDoodles } from "./notebook-doodles";
import {
  bikes,
  bikeFeatures,
  bikeById,
  buyBike,
  selectBike,
  inBikeShop,
  bikeShopBounds,
  type BikeId,
} from "./bikes";
import { createBikeFeatures } from "./bike-features";
import { makeBike, makeBikeCockpit } from "./bike-models";
import { seedPacketImage } from "./seed-packet";
import {
  canEnterPepe,
  startPepeShow,
  tickPepeShow,
  collectPepePacket,
} from "./pepe-event";
import {
  enableBalloonAudio,
  balloonSound,
  setBalloonMuted,
} from "./balloon-audio";
import { stacyStory } from "./stacy-dialogue";
import { SeedSearchClock } from "./seed-hints";
import {
  buff,
  unlockSigma,
  buyDrink,
  drinks,
  chadLine,
  createCoin,
  investCoin,
  sellCoin,
  coinValue,
  marketSignals,
  tickSigma,
} from "./sigma";
import { chooseMomThought } from "./mom-thoughts";
import { journalContext } from "./journal";
import { constructJournal } from "./branching-journal";
import { hats, hatById, hatPower, type HatId } from "./hats";
import { makeHat } from "./hat-models";
import "./style.css";
import { inventoryIcon } from "./icons";
import * as T from "three";
import {
  airborneRects,
  homeContains,
  seedSearchHint,
  buyGardenSupply,
  canPlaceBed,
  placeGardenBed,
  fillGardenBed,
  noteHatPower,
  buyHat,
  equipHat,
  wornHats,
  hatCapacity,
  wearing,
  removeHat,
  plantingSeconds,
  movementSpeed,
  parseAmount,
  neighborLine,
  momStatus,
  momReply,
  seedStashSpots,
  findHiddenSeeds,
  collectMazeSeeds,
  walkingStepHeight,
  findCapSeeds,
  fresh,
  load,
  decode,
  money,
  buy,
  plant,
  water,
  fertilize,
  tick,
  harvest,
  sleep,
  withdraw,
  deposit,
  recover,
  move,
  blocked,
  clearPosition,
  type State,
  type Rect,
} from "./game";
import { createWorld, type Target } from "./world";
const newsFeed = createNewsFeed();
const $ = (s: string) => document.querySelector<HTMLElement>(s)!;
const SAVE = "money-tree-v1";
const seedHud = document.createElement("div");
seedHud.id = "seed-hud";
seedHud.innerHTML = `<img src="${seedPacketImage()}" alt="Money Tree seed packet"><strong>0</strong>`;
const resourceHud = document.createElement("div");
resourceHud.id = "resource-hud";
document.body.append($("#stats"), $("#location"));
const cashHud = document.createElement("div"),
  bankHud = document.createElement("div");
cashHud.id = "cash-hud";
bankHud.id = "bank-hud";
cashHud.className = bankHud.className = "money-counter";
cashHud.innerHTML =
  '<img src="./pocket.svg" alt="Pocket"><span><small>Pocket</small><strong></strong></span>';
bankHud.innerHTML =
  '<img src="./piggy.svg" alt="Piggy bank"><span><small>Saved</small><strong></strong></span>';
const netHud = document.createElement("div");
netHud.id = "daily-net-hud";
netHud.className = "money-counter";
netHud.innerHTML =
  '<span aria-hidden="true" class="daily-net-icon">↗</span><span><small>Daily Net</small><strong></strong></span>';
const drinkHud = document.createElement("div");
drinkHud.id = "drink-hud";
drinkHud.className = "money-counter";
drinkHud.innerHTML =
  '<img src="./drink.svg" alt="Coffee"><span><small></small><strong></strong></span>';
setHidden(drinkHud, true);
const soyHud = document.createElement("div");
soyHud.id = "soy-effects-hud";
soyHud.className = "money-counter";
soyHud.innerHTML = "<span><small>Soyjak Party</small><strong></strong></span>";
setHidden(soyHud, true);

const compostHud = document.createElement("div");
compostHud.id = "compost-hud";
compostHud.className = "money-counter";
compostHud.innerHTML = `<span aria-hidden="true" style="font-size:30px">♻</span><span><small>Compost</small><strong>0</strong></span>`;
const mortgageHud = document.createElement("div");
mortgageHud.className = "money-counter";
mortgageHud.id = "mortgage-hud";
setHidden(mortgageHud, true);
const membershipHud = document.createElement("button");
membershipHud.id = "membership-hud";
membershipHud.className = "money-counter";
setHidden(membershipHud, true);
membershipHud.onclick = phoneLibrary;
const fertilizerHud = document.createElement("div");
fertilizerHud.id = "fertilizer-hud";
fertilizerHud.className = "money-counter";
fertilizerHud.innerHTML = `<svg class="fertilizer-icon" aria-hidden="true" viewBox="0 0 48 56" width="34" height="40"><path d="M10 3h28l-2 8 6 39q-18 6-36 0l6-39z" fill="#ead8aa" stroke="#8c7652" stroke-width="2"/><path d="M8 19h32l2 23H6z" fill="#4d7957"/><path d="M24 39V25m0 7q-10 0-10-8 10 0 10 8m0-3q0-9 10-9 0 9-10 9" fill="#bcd38e" stroke="#bcd38e" stroke-width="2"/></svg><span><small>Fertilizer</small><strong>0</strong></span>`;
resourceHud.append(
  cashHud,
  bankHud,
  netHud,
  seedHud,
  fertilizerHud,
  compostHud,
  drinkHud,
  soyHud,
  membershipHud,
  mortgageHud,
);
$("#app").append(resourceHud);

let s: State;
addEventListener("pagehide", () => {
  if (s) void saveStore?.emergency(s);
});
addEventListener("beforeunload", () => {
  if (s) void saveStore?.emergency(s);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && s) void saveStore?.emergency(s);
});
let saveStore: IndexedSaveStore | undefined;
try {
  saveStore = await IndexedSaveStore.open();
  s = await saveStore.read();
} catch {
  saveStore = undefined;
  s = fresh();
  const notice = document.createElement("p");
  notice.textContent =
    "Saved progress could not be opened. Existing data is preserved; this session cannot save. Reload to try again.";
  document.querySelector(".intro-card")!.append(notice);
}
if (saveStore?.protected || saveStore?.recovered) {
  const notice = document.createElement("p");
  setAttr(notice, "role", "status");
  notice.textContent = saveStore.protected
    ? "Your saved data could not be read. It has been preserved and will not be overwritten."
    : "Recovered your last valid backup. The unreadable save has also been preserved.";
  document.querySelector(".intro-card")!.append(notice);
}
let muted = false,
  lowQuality = false,
  reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let storageWarning = false;
const scene = new T.Scene();
scene.background = new T.Color("#bfd9d6");
scene.fog = new T.Fog("#bfd9d6", 35, 90);
let renderer: T.WebGLRenderer;
try {
  renderer = new T.WebGLRenderer({
    canvas: $("#world") as HTMLCanvasElement,
    antialias: true,
  });
} catch {
  $("#intro").innerHTML =
    '<div class="panel"><h2>We need a little graphics magic.</h2><p>This browser could not start WebGL. Try a recent desktop browser with hardware acceleration enabled.</p></div>';
  throw new Error("WebGL unavailable");
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
const graphicsContext = renderer.getContext();
const rendererInfo = graphicsContext.getExtension("WEBGL_debug_renderer_info");
const softwareRenderer =
  rendererInfo &&
  /swiftshader|llvmpipe|software|basic render/i.test(
    String(graphicsContext.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)),
  );
if (softwareRenderer) {
  lowQuality = true;
  renderer.shadowMap.enabled = false;
  renderer.setPixelRatio(0.75);
}

renderer.outputColorSpace = T.SRGBColorSpace;
const hemisphere = new T.HemisphereLight("#fff5de", "#819b74", 2.3);
scene.add(hemisphere);
const sun = new T.DirectionalLight("#ffe7b9", 3);
sun.position.set(-14, 35, 16);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, {
  left: -45,
  right: 45,
  top: 45,
  bottom: -45,
  near: 0.1,
  far: 100,
});
sun.shadow.bias = -0.001;
scene.add(sun);
await Promise.all(
  [
    "Gaegu",
    "Nunito",
    "Lobster",
    "HennyPenny",
    "Bungee",
    "BarlowCondensed",
    "Rye",
    "GlassAntiqua",
  ].map((f) =>
    document.fonts.load(`${f === "Nunito" ? "italic " : ""}24px ${f}`),
  ),
).catch(() => {});
const world = createWorld(scene),
  camera = new T.PerspectiveCamera(52, innerWidth / innerHeight, 0.08, 700),
  ray = new T.Raycaster();
relocateRiverBeds(s, world.rects);
unlockSigma(s);
ensureMountainPlots(s);
world.setSigmaUnlocked(!!s.foundTVSeeds);
world.sigma.updateATM(s.coin?.name);
world.setMillionaireOpen(!!s.millionaire?.unlocked);
world.millionaire.update(s, 0);
world.syncBeds(s.plots);
if (
  blocked(s.position.x, s.position.z, world.rects) ||
  !withinPlayableBounds(s)
)
  s.position = clearPosition(
    s.position,
    world.rects,
    s.millionaire?.unlocked ? -470 : s.foundTVSeeds ? -89 : -39,
  );
world.player.position.set(s.position.x, 0, s.position.z);
world.setMomDay(s.day, homeContains(s.position), false, s.familyStory);
if (s.familyStory?.escort) {
  const p = clearPosition(
    { x: s.position.x - 1.5, z: s.position.z },
    world.rects,
    s.millionaire?.unlocked ? -470 : s.foundTVSeeds ? -89 : -39,
  );
  positionStoryMom(p.x, p.z);
}
const tvCaptions = createTVCaptions(world.tvScreen);
const nightCombat = new NightCombat();
const nightWorld = createNightWorld(scene);
const shelterLamp = new T.PointLight("#ffc77f", 0, 20, 2);
scene.add(shelterLamp);
const nightShelters = [
  { x: -15, z: 6, w: 12, d: 16 },
  { x: -5, z: 10, w: 8, d: 8 },
  { x: 12, z: 15, w: 6.8, d: 5.8 },
  { x: 12, z: 1, w: 6.8, d: 5.8 },
  { x: -39, z: -25, w: 6.8, d: 5.8 },
  { x: 6, z: -30, w: 19.6, d: 17.6 },
  { x: 24, z: -29, w: 11.6, d: 13.6 },
  {
    x: (bikeShopBounds.left + bikeShopBounds.right) / 2,
    z: (bikeShopBounds.north + bikeShopBounds.south) / 2,
    w: bikeShopBounds.right - bikeShopBounds.left,
    d: bikeShopBounds.south - bikeShopBounds.north,
  },
  { x: -69, z: -15, w: 7.6, d: 6.6 },
  { x: 32, z: -79, w: 7.6, d: 5.6 },
  ...world.sigma.houseBounds,
];
const mansionShelter = { x: mansionLot.x, z: mansionLot.z, w: 32, d: 22 };
const marvelsShelter = { x: marvelsLot.x, z: marvelsLot.z, w: 19.6, d: 17.6 };
function nightShelterAt(x: number, z: number) {
  const contains = (r: { x: number; z: number; w: number; d: number }) =>
    Math.abs(x - r.x) < r.w / 2 - 0.12 && Math.abs(z - r.z) < r.d / 2 - 0.12;
  return (
    nightShelters.find(contains) ??
    (s.housing?.status === "owned" && contains(mansionShelter)
      ? mansionShelter
      : undefined) ??
    (s.housing?.storeOpened && contains(marvelsShelter)
      ? marvelsShelter
      : undefined)
  );
}
const nightHud = document.createElement("aside");
nightHud.id = "night-hud";
nightHud.hidden = true;
nightHud.innerHTML =
  '<strong id="night-phase"></strong><span id="night-health" role="meter" aria-label="Health" aria-valuemin="0" aria-valuemax="10"></span><small id="night-ammo"></small>';
const nightHelp = document.createElement("aside");
nightHelp.id = "night-help";
nightHelp.hidden = true;
nightHelp.textContent =
  "V or click · Throw $1 (1 damage) · Run indoors for safety · Talk, rest and edit furniture indoors";
document.body.append(nightHud, nightHelp);
const nightPhase = nightHud.querySelector("#night-phase")!,
  nightHealth = nightHud.querySelector("#night-health")!,
  nightAmmo = nightHud.querySelector("#night-ammo")!;
let nightWasActive = isNight(s);
const daySky = new T.Color("#bfd9d6"),
  nightSky = new T.Color("#071525"),
  moonColor = new T.Color("#9bb7ec"),
  daySunColor = new T.Color("#ffe7b9");
function nightBlocked(x: number, z: number) {
  return (
    !!nightShelterAt(x, z) ||
    !withinPlayableBounds({
      millionaire: s.millionaire,
      foundTVSeeds: s.foundTVSeeds,
      position: { x, z },
    }) ||
    riverDistance(x, z) < 3.4 ||
    blocked(x, z, world.rects, 0.55)
  );
}
function throwNightBill() {
  if (
    !begun ||
    paused ||
    !s.awake ||
    !isNight(s) ||
    nightShelterAt(s.position.x, s.position.z)
  )
    return;
  const direction = viewForward();
  if (nightCombat.throwBill(s, direction.x, direction.z)) {
    save();
  } else if (s.cash < 100)
    toast(
      "You need $1 in pocket money to throw a bill. Get indoors or keep moving.",
    );
}
function finishNight(died: boolean) {
  sleep(s, true);
  if (died) {
    s.position = { x: -16, z: 4 };
    s.awake = false;
  }
  resetTransientMotion();
  dismissSpeech();
  close();
  nightWasActive = false;
  save();
  toast(
    died
      ? `You woke safely in your bed. Good morning, Day ${s.day}. Health restored to 10.`
      : `Dawn. Day ${s.day} begins. Interactions are available again.`,
  );
}
function updateNight(dt: number, clockActive: boolean) {
  const started = profiling.start();
  const transition = clockActive ? tickNight(s, dt) : undefined;
  if (transition === "dawn") {
    finishNight(false);
    profiling.end("night", started);
    return;
  }
  const dark = isNight(s),
    shelter = nightShelterAt(s.position.x, s.position.z);
  if (dark && !nightWasActive) {
    action = undefined;
    placingBed = false;
    bedGhost.visible = false;
    dismissSpeech();
    if (sitting && !shelter) standUp();
    world.life.cancelInteractions();
    toast(
      "Nightfall. Wallets and cash cows roam outside. V or click throws a $1 bill; interiors are safe.",
    );
    save();
  }
  if (!dark && nightWasActive) nightCombat.reset();
  nightWasActive = dark;
  if (dark && clockActive) {
    const result = nightCombat.update(s, dt, !!shelter, nightBlocked, (x, z) =>
      blocked(x, z, world.rects, 0.05),
    );
    if (result.died) {
      finishNight(true);
      profiling.end("night", started);
      return;
    }
    if (result.collected) {
      toast(`Picked up ${money(result.collected)} from defeated monsters.`);
      save();
    }
  }
  nightWorld.update(nightCombat, dark, reducedMotion);
  const blend = 1 - Math.exp(-dt * 3);
  const sky = scene.background as T.Color;
  sky.lerp(dark ? nightSky : daySky, blend);
  (scene.fog as T.Fog).color.copy(sky);
  hemisphere.intensity += ((dark ? 0.28 : 2.3) - hemisphere.intensity) * blend;
  sun.intensity += ((dark ? 0.15 : 3) - sun.intensity) * blend;
  sun.color.lerp(dark ? moonColor : daySunColor, blend);
  shelterLamp.intensity = dark && shelter ? 140 : 0;
  if (shelter)
    shelterLamp.position.set(
      shelter.x,
      terrainHeight(shelter.x, shelter.z) + 2.7,
      shelter.z,
    );
  setHidden(nightHud, !begun || !s.awake);
  setHidden(nightHelp, !begun || !dark || paused || !s.awake);
  const n = nightState(s),
    remaining = Math.max(
      0,
      Math.ceil((dark ? DAY_SECONDS + NIGHT_SECONDS : DAY_SECONDS) - n.elapsed),
    );
  setText(
    nightPhase,
    `${dark ? "Night" : "Daylight"} · ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}${dark && shelter ? " · Safe indoors" : ""}`,
  );
  const health = nightHealth;
  setText(health, `${n.hp} / ${MAX_HP} HP`);
  setAttr(health, "aria-valuenow", String(n.hp));
  setAttr(nightHud, "data-hurt", String(nightCombat.hurtFor > 0));
  setText(
    nightAmmo,
    dark
      ? `${Math.floor(s.cash / 100)} dollar bills · $1 per throw`
      : "Night arrives after five minutes of daylight",
  );
  profiling.count("night.enemies", nightCombat.enemies.length);
  profiling.end("night", started);
}

scene.add(camera);
const bikeCockpit = makeBikeCockpit();
camera.add(bikeCockpit.object);
let bikeMountTime = 0;
let bikeHopFrom = new T.Vector3(),
  bikeHopTo = new T.Vector3();
let riding = false,
  rideSpeed = 0,
  actualRideSpeed = 0,
  bellRings = 0;
let rideTransition = 0;
let walkingPitch = 0.42;
let rideDistance = 0;
const rideEyeHeight = () => (s.selectedBike === "penny" ? 2.8 : 2.1);
const rideCameraOffset = new T.Vector3();
let parkedBike: T.Group | undefined, parkedBikeId: BikeId | undefined;
const bikeSpecial = createBikeFeatures(scene);
function returnBikeToRack() {
  if (riding) dismountBike();
  if (parkedBike) {
    scene.remove(parkedBike);
    parkedBike.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        (o.material as T.Material).dispose();
      }
    });
  }
  parkedBike = undefined;
  parkedBikeId = undefined;
}
function bikeRackMenu() {
  returnBikeToRack();
  world.bikeRack.sync(s.bikes ?? []);
  panel(
    "Your bike rack",
    `<p>Keep every bicycle you buy. Choose one to take for a ride.</p><div class="hat-bag">${
      (s.bikes ?? [])
        .map((id) => {
          const bike = bikeById(id)!,
            feature = bikeFeatures[id];
          return `<button data-rack-bike="${id}"><img src="${hatPortrait(id)}" alt=""><span>${bike.name}</span><p class="hat-power">${Math.round(bike.speed * 3.6)} km/h<br>${feature.name}: ${feature.description}</p><b>Take for a ride</b></button>`;
        })
        .join("") || "<p>Your rack is waiting for its first bicycle.</p>"
    }</div>`,
    [{ label: "Back to the day", default: true, run: close }],
  );
  document.querySelectorAll<HTMLButtonElement>("[data-rack-bike]").forEach(
    (button) =>
      (button.onclick = () => {
        selectBike(s, button.dataset.rackBike as BikeId);
        save();
        close();
        mountBike();
      }),
  );
}
function activateBikeFeature() {
  if (!riding || !s.selectedBike) return;
  const id = s.selectedBike,
    feature = bikeFeatures[id];
  if (
    !bikeSpecial.activate(
      id,
      new T.Vector3(
        s.position.x,
        terrainHeight(s.position.x, s.position.z),
        s.position.z,
      ),
      yaw,
      rideEyeHeight(),
    )
  )
    return toast(
      `${feature.name} is ready in ${Math.ceil(bikeSpecial.cooldown(id))} seconds.`,
    );
  toast(`${feature.name}! ${feature.description}`);
  if (id === "city" && audio && !muted) {
    const t = audio.currentTime;
    for (const frequency of [523.25, 659.25, 783.99]) {
      const tone = audio.createOscillator(),
        gain = audio.createGain();
      tone.type = "triangle";
      tone.frequency.value = frequency;
      gain.gain.setValueAtTime(0.025, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      tone.connect(gain);
      gain.connect(audio.destination);
      tone.start(t);
      tone.stop(t + 0.55);
    }
  }
}
const ridingIndoors = () =>
  atHome() ||
  inBikeShop(s.position) ||
  (s.position.x > -4 &&
    s.position.x < 16 &&
    s.position.z > -39 &&
    s.position.z < -21) ||
  (s.position.x > 18 &&
    s.position.x < 30 &&
    s.position.z > -36 &&
    s.position.z < -22) ||
  !!world.sigma.houseBounds.find(
    (h) =>
      Math.abs(s.position.x - h.x) < h.w / 2 &&
      Math.abs(s.position.z - h.z) < h.d / 2,
  );
function dismountBike() {
  if (!riding) return;
  riding = false;
  bikeSpecial.cancel();
  pitch = walkingPitch;
  rideSpeed = actualRideSpeed = 0;
  bikeCockpit.object.visible = false;
  if (parkedBike) {
    parkedBike.position.set(s.position.x, 0, s.position.z);
    const side = new T.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    for (const sign of [1, -1]) {
      const x = s.position.x + side.x * sign * 1.1,
        z = s.position.z + side.z * sign * 1.1;
      if (!blocked(x, z, world.rects, 0.85)) {
        parkedBike.position.set(x, 0, z);
        break;
      }
    }
    parkedBike.rotation.y = yaw;
    parkedBike.visible = true;
  }
}
function mountBike(complete = false) {
  if (bikeMountTime > 0 && !complete) return;
  if (riding) {
    dismountBike();
    return;
  }
  if (s.familyStory?.escort)
    return toast("Walk with Mom to Bea’s before getting back on your bike.");
  if (!s.selectedBike)
    return toast(
      "Spoke & Saddle sells bicycles. Buy one, then press H to ride.",
    );
  if (
    !s.awake ||
    sitting ||
    action ||
    jumpHeight > 0 ||
    rollTime > 0 ||
    placingBed
  )
    return toast("Stand on clear ground before mounting your bike.");
  if (ridingIndoors())
    return toast("Walk outside, then press H to mount your bicycle.");
  if (parkedBikeId !== s.selectedBike) {
    if (parkedBike) {
      scene.remove(parkedBike);
      parkedBike.traverse((o) => {
        if (o instanceof T.Mesh) {
          o.geometry.dispose();
          (o.material as T.Material).dispose();
        }
      });
    }
    parkedBike = makeBike(s.selectedBike);
    parkedBikeId = s.selectedBike;
    scene.add(parkedBike);
  }
  if (!complete) {
    bikeHopFrom.set(
      s.position.x,
      terrainHeight(s.position.x, s.position.z),
      s.position.z,
    );
    const nearby =
      parkedBike!.visible && parkedBike!.position.distanceTo(bikeHopFrom) < 2;
    if (!nearby) {
      parkedBike!.position.copy(bikeHopFrom);
      parkedBike!.rotation.y = yaw;
    } else yaw = parkedBike!.rotation.y;
    // Bike models face local -Z; the character faces local +Z.
    world.player.rotation.y = yaw + Math.PI;
    bikeHopTo.copy(parkedBike!.position);
    parkedBike!.visible = true;
    bikeMountTime = 1;
    keys.clear();
    dismissSpeech();
    toast("Hopping onto your bicycle…");
    return;
  }
  parkedBike!.visible = false;
  riding = true;
  walkingPitch = pitch;
  pitch = 0.42;
  rideSpeed = actualRideSpeed = 0;
  rideTransition = 0;
  rideDistance = 0;
  rideCameraOffset
    .copy(camera.position)
    .sub(
      new T.Vector3(
        s.position.x,
        rideEyeHeight() +
          bikeSpecial.lift +
          terrainHeight(s.position.x, s.position.z),
        s.position.z,
      ),
    );
  dismissSpeech();
  toast(
    "W/S to pedal or brake. A/D to steer. H to dismount. B rings the bell. F activates your special feature.",
  );
}
function ringBikeBell() {
  if (!riding) return;
  bellRings++;
  if (!audio || muted) return;
  const t = audio.currentTime;
  for (const frequency of [880, 1320]) {
    const tone = audio.createOscillator(),
      gain = audio.createGain();
    tone.type = "sine";
    tone.frequency.value = frequency;
    gain.gain.setValueAtTime(0.055, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    tone.connect(gain);
    gain.connect(audio.destination);
    tone.start(t);
    tone.stop(t + 0.75);
  }
}
function showBike(id: BikeId) {
  const bike = bikeById(id)!;
  const owned = (s.bikes ?? []).includes(id);
  panel(
    bike.name,
    `<img class="bike-portrait" src="${hatPortrait(id)}" alt="${bike.name} bicycle"><p>${bike.description}</p><p><strong>${bikeFeatures[id].name}</strong>: ${bikeFeatures[id].description} Press F while riding.</p><p>You can own every bike. Store and swap them at the rack outside.</p><p>${money(purchasePrice(s, bike.price))} · ${Math.round(bike.speed * 3.6)} km/h</p><p>H mounts or dismounts. B rings your bell. Every bicycle is faster than running.</p>`,
    [
      {
        label: owned
          ? "Choose this bicycle"
          : `Buy bicycle · ${money(purchasePrice(s, bike.price))}`,
        disabled: !owned && s.cash < purchasePrice(s, bike.price),
        run: () => {
          const ok = owned ? selectBike(s, id) : buyBike(s, id);
          if (ok) {
            dismountBike();
            save();
            close();
            toast(`${bike.name} ready. Press H outside to ride.`);
          }
        },
      },
      { label: "Keep looking", run: close },
    ],
  );
}

let frameNumber = 0;
let followAngle = 0.42;
let zoomDistance = 5.8,
  followDistance = 5.8;
const cameraAim = new T.Vector3(-7, 1, 10);
function visit(text: string) {
  if (!s.events.includes(text)) s.events.push(text);
}
const inventoryToasts = document.createElement("aside");
inventoryToasts.id = "inventory-toasts";
setAttr(inventoryToasts, "aria-live", "polite");
setAttr(inventoryToasts, "aria-label", "Inventory changes");
document.body.append(inventoryToasts);
const dailyNetLedger = new DailyNetLedger(s);
let inventoryState = s;
let inventoryBefore = inventorySnapshot(s);
const inventoryNotices: { text: string; remaining: number }[] = [];
function updateInventoryNotices(dt: number) {
  dailyNetLedger.update(s);
  const next = inventorySnapshot(s);
  if (inventoryState === s) {
    const changes = inventoryChanges(inventoryBefore, next);
    if (changes.length)
      inventoryNotices.push({ text: changes.join(" · "), remaining: 5 });
  }
  inventoryState = s;
  inventoryBefore = next;
  for (const notice of inventoryNotices) notice.remaining -= dt;
  while (
    inventoryNotices.length &&
    (inventoryNotices[0].remaining <= 0 || inventoryNotices.length > 4)
  )
    inventoryNotices.shift();
  const content = inventoryNotices.map((n) => n.text).join("\n");
  if (inventoryToasts.textContent !== content)
    inventoryToasts.textContent = content;
  setHidden(inventoryToasts, !begun || !s.awake || !content);
}
const cameraWalls = new CameraWalls();
let followInitialized = false;
let phoneCleanup: (() => void) | undefined;
let fertilizerAnimation: { elapsed: number; x: number; z: number } | undefined;
let wateringAnimation: { elapsed: number; x: number; z: number } | undefined;
let begun = false,
  paused = false,
  yaw = 0,
  pitch = 0.42,
  cameraTilted = false,
  lastLookInput = -Infinity,
  near: Target | undefined,
  action:
    | {
        id: number;
        ids: number[];
        crop?: Crop;
        elapsed: number;
        duration: number;
        origin: { x: number; z: number };
      }
    | undefined,
  toastTime = 0,
  saveTime = 0,
  last = performance.now(),
  momSpoke = false,
  walk = 0;
const atHome = () => homeContains(s.position);
let momHomeDialogue = false;
let momGardenVisit:
  | {
      route: Point[];
      distance: number;
      length: number;
      arrived: boolean;
      offered: boolean;
      day: number;
    }
  | undefined;
let gardenRetryAt = 0;
let gardenAwaitDeparture = false;
let wasHome = atHome(),
  visitedOutside = s.awake && !wasHome;
const thought = document.createElement("div");
thought.id = "thought";
setAttr(thought, "role", "status");
setHidden(thought, true);
document.body.append(thought);
let thoughtTime = 0;
let couchZoom: number | undefined;
let sitting = false;
let sittingWithStacy = false;
function standUp() {
  const leavingTea = teaSeated;
  teaSeated = false;
  if (leavingTea && s.familyStory?.shopGoal)
    world.setMomDay(s.day, atHome(), true, s.familyStory);
  const leavingMeditation = meditationTime > 0;
  meditationTime = 0;
  sitting = false;
  s.position = clearPosition(
    leavingTea
      ? { x: 13.6, z: 16.9 }
      : leavingMeditation
        ? { x: -18, z: -45.7 }
        : sittingWithStacy
          ? { x: -16.3, z: -79.5 }
          : { x: -17.1, z: 11.2 },
    world.rects,
    s.millionaire?.unlocked ? -470 : s.foundTVSeeds ? -89 : -39,
  );
  sittingWithStacy = false;
  if (couchZoom !== undefined) {
    zoomDistance = couchZoom;
    couchZoom = undefined;
  }
  world.setPlayerSeated(false);
  if (leavingMeditation) toast("You leave the meditation early. No charge.");
  save();
}
let birdhouseScene:
  | {
      elapsed: number;
      origin: { x: number; z: number };
      start: number;
      carried: T.Group[];
      segments: {
        player: Point[];
        mom: Point[];
        duration: number;
        hang?: number;
      }[];
      duration: number;
      placed: number;
    }
  | undefined;
function paintBirdhouses() {
  dismissSpeech();
  const paints: BirdhousePaint[] = [
    { body: paintColors[0].hex, roof: paintColors[5].hex },
    { body: paintColors[3].hex, roof: paintColors[8].hex },
  ];
  panel(
    "Paint birdhouses with Mom",
    `<p>Pick a body color and a roof color for each house. Then we’ll hang them together.</p><div class="birdhouse-paint-grid">${paints.map((p, i) => `<section><h3>Birdhouse ${i + 1}</h3><div id="paint-preview-${i}">${birdhousePreview(p)}</div>${(["body", "roof"] as const).map((part) => `<fieldset><legend>${part === "body" ? "Body" : "Roof"} color</legend><div class="paint-palette">${paintColors.map((c) => `<button type="button" data-house="${i}" data-part="${part}" data-color="${c.hex}" aria-label="Birdhouse ${i + 1} ${part}: ${c.name}" aria-pressed="${p[part] === c.hex}" style="--paint:${c.hex}"></button>`).join("")}</div></fieldset>`).join("")}</section>`).join("")}</div>`,
    [
      {
        label: "Let’s hang them together",
        run: () => {
          const start = Math.min(10, s.birdhousesBuilt ?? 0);
          const origin = { ...s.position };
          const momOrigin = {
            x: world.mom.position.x,
            z: world.mom.position.z,
          };
          const solids = world.rects.filter((r) => r !== world.momCollider);
          const actors = [origin, momOrigin];
          const stops = [start, start + 1].map((i) => {
            const tree = world.outdoorBirdhouses[i].position;
            return [
              clearPosition({ x: tree.x - 1.3, z: tree.z + 1.8 }, solids),
              clearPosition({ x: tree.x + 1.3, z: tree.z + 1.8 }, solids),
            ];
          });
          const segments: {
            player: Point[];
            mom: Point[];
            duration: number;
            hang?: number;
          }[] = [];
          let current = actors;
          for (let i = 0; i < 3; i++) {
            const next = i < 2 ? stops[i] : actors;
            const routes = current.map((point, j) =>
              sceneRoute(point, next[j], solids),
            );
            if (routes.some((route) => !route.length))
              return toast(
                "Let's make a little room by the door, then try hanging the houses together.",
              );
            segments.push({
              player: routes[0],
              mom: routes[1],
              duration: Math.max(
                0.5,
                ...routes.map((route) => routeLength(route) / 3.2),
              ),
            });
            if (i < 2)
              segments.push({
                player: [next[0]],
                mom: [next[1]],
                duration: 4,
                hang: i,
              });
            current = next;
          }
          const stored = (s.birdhousePaint ??= []);
          while (stored.length < start)
            stored.push({ body: paintColors[9].hex, roof: paintColors[1].hex });
          stored.splice(start, 2, ...paints);
          s.birdhousesBuilt = Math.max(s.birdhousesBuilt ?? 0, start + 2);
          s.birdhousePaintDay = s.day;
          visit(
            "Picked paint colors for two birdhouses and hung them in the trees with Mom.",
          );
          world.showBirdhouses(s.birdhousesBuilt, stored);
          const carried = [start, start + 1].map((i) => {
            const model = world.outdoorBirdhouses[i].clone();
            model.visible = true;
            scene.add(model);
            return model;
          });
          birdhouseScene = {
            elapsed: 0,
            origin,
            start,
            carried,
            segments,
            duration: segments.reduce(
              (sum, segment) => sum + segment.duration,
              0,
            ),
            placed: 0,
          };
          close();
          keys.clear();
          setHidden(thought, true);
          thoughtTime = 0;
          save();
        },
      },
      { label: "Maybe later", run: close },
    ],
  );
  document.querySelectorAll<HTMLButtonElement>("[data-house]").forEach(
    (button) =>
      (button.onclick = () => {
        const i = Number(button.dataset.house),
          part = button.dataset.part as "body" | "roof";
        paints[i][part] = button.dataset.color!;
        document.querySelector(`#paint-preview-${i}`)!.innerHTML =
          birdhousePreview(paints[i]);
        document
          .querySelectorAll<HTMLButtonElement>(
            `[data-house="${i}"][data-part="${part}"]`,
          )
          .forEach((b) => setAttr(b, "aria-pressed", String(b === button)));
      }),
  );
}
function letterToAuntie() {
  dismissSpeech();
  panel(
    "A letter to Auntie",
    `<label for="auntie-letter">What would you like Mom to add?</label><textarea id="auntie-letter" maxlength="1000" rows="4"></textarea>`,
    [
      {
        label: "Add to the letter",
        run: () => {
          close();
          speak("mom", "<p>Beautiful sentiment. I’ll add that.</p>", [
            { label: "Love you too", run: dismissSpeech },
          ]);
          visit("Added a sentiment to Mom’s letter to Auntie.");
          save();
        },
      },
      { label: "Maybe later", run: close },
    ],
  );
  document.getElementById("auntie-letter")!.focus();
}
function momStorySpeech(text: string, choices: Choice[]) {
  momHomeDialogue = true;
  speak("mom", `<p>${text}</p>`, choices);
  momHomeDialogue = false;
}
function showMomMansionConversation() {
  const stage = s.momHomeStory?.mansionStage ?? 0;
  const chapter = mansionConversation[stage - 1];
  if (!chapter) return;
  momStorySpeech(
    chapter.text,
    chapter.replies.map((label, choice) => ({
      label,
      run: () => {
        if (!replyToMom(s, "mansion", choice)) return;
        save();
        if (s.momHomeStory!.mansionStage === 4) dismissSpeech();
        else showMomMansionConversation();
      },
    })),
  );
}
function showMomGardenConversation() {
  world.mom.rotation.y = Math.atan2(
    s.position.x - world.mom.position.x,
    s.position.z - world.mom.position.z,
  );
  const stage = s.momHomeStory?.gardenStage ?? 1;
  const chapter = gardenConversation[stage - 1];
  if (!chapter) return;
  momStorySpeech(
    chapter.text,
    chapter.replies.map((label, choice) => ({
      label,
      run: () => {
        if (!replyToMom(s, "garden", choice)) return;
        save();
        if (s.momHomeStory!.gardenStage === 3) {
          momGardenVisit = undefined;
          momStorySpeech(
            "Thank you, sweetheart. I love our little garden. Come sit with me for a bit.",
            [{ label: "I love you, Mom.", run: dismissSpeech }],
          );
        } else showMomGardenConversation();
      },
    })),
  );
}
function updateMomGardenVisit(dt: number) {
  // Sleeping can advance the day while animation time is paused.
  if (
    momGardenVisit &&
    (momGardenVisit.day !== s.day || momAway(s) || s.familyStory?.escort)
  ) {
    momGardenVisit = undefined;
    gardenAwaitDeparture = true;
    world.setMomDay(
      s.day,
      atHome(),
      true,
      s.familyStory,
      s.momHomeStory?.gardenDay === s.day,
    );
    return;
  }
  if (dt <= 0) return;
  if (gardenAwaitDeparture) {
    if (Math.hypot(s.position.x + 15, s.position.z - 20) <= 9) return;
    gardenAwaitDeparture = false;
  }
  if (momGardenVisit) {
    const visit = momGardenVisit;
    if (visit.arrived) {
      if (
        !visit.offered &&
        !speaking &&
        Math.hypot(
          s.position.x - world.mom.position.x,
          s.position.z - world.mom.position.z,
        ) < 6
      ) {
        visit.offered = true;
        showMomGardenConversation();
      }
      return;
    }
    if (speaking || cookingScene || world.life.busy) return;
    visit.distance = Math.min(visit.length, visit.distance + dt * 2);
    const point = alongRoute(
      visit.route,
      visit.length ? visit.distance / visit.length : 1,
    );
    const dx = point.x - world.mom.position.x,
      dz = point.z - world.mom.position.z;
    positionStoryMom(point.x, point.z);
    if (Math.hypot(dx, dz) > 0.001) world.mom.rotation.y = Math.atan2(dx, dz);
    if (visit.distance >= visit.length) {
      visit.arrived = true;
      if (Math.hypot(s.position.x - point.x, s.position.z - point.z) < 6) {
        visit.offered = true;
        showMomGardenConversation();
      }
    }
    return;
  }
  if (
    (s.momHomeStory?.gardenStage ?? 0) >= 3 ||
    speaking ||
    momAway(s) ||
    s.familyStory?.escort ||
    teaSeated ||
    sitting ||
    cookingScene ||
    kitchenPrepared ||
    world.life.busy ||
    featherHandoff ||
    furnitureEditorOpen ||
    action ||
    riding ||
    Math.hypot(s.position.x + 15, s.position.z - 20) > 9 ||
    performance.now() < gardenRetryAt
  )
    return;
  gardenRetryAt = performance.now() + 3000;
  if (!homeGardenReplanted(s)) return;
  const origin =
    world.mom.userData.activity === "bedrest"
      ? { x: -2.5, z: 10 }
      : { x: world.mom.position.x, z: world.mom.position.z };
  const destination = { x: -10.2, z: 18 };
  const route = sceneRoute(
    origin,
    destination,
    world.rects.filter((r) => r !== world.momCollider),
  );
  if (!route.length) return;
  (s.momHomeStory ??= {}).gardenStage ||= 1;
  world.setMomDay(s.day, true, true, s.familyStory, true);
  positionStoryMom(origin.x, origin.z);
  momGardenVisit = {
    route,
    distance: 0,
    length: routeLength(route),
    arrived: false,
    offered: false,
    day: s.day,
  };
  save();
}

function askMom() {
  if (momAway(s)) return;
  if (momGardenVisit?.arrived && (s.momHomeStory?.gardenStage ?? 0) < 3)
    return showMomGardenConversation();
  if (
    (s.momHomeStory?.mansionStage ?? 0) > 0 &&
    canTellMomAboutMansion(s) &&
    atHome()
  )
    return showMomMansionConversation();
  if (s.adventure?.feather) {
    const name = s.adventure.feather.chicken;
    return speak("mom", "<p>What have you brought me, sweetheart?</p>", [
      {
        label: `I brought you a feather from ${name}, Mom.`,
        run: startFeatherHandoff,
      },
    ]);
  }
  if (offerCooking()) return;
  s.momLastTalkDay = s.day;
  momSpoke = true;
  if (storyPhase(s) === "scheduled")
    return speak(
      "mom",
      "<p>I called the hospital, love. Tomorrow! I am so excited, and so grateful. We did this together.</p>",
      [{ label: "Love you too", run: dismissSpeech }],
    );
  if (s.familyStory && recoveryDays(s) > 0) {
    const age = recoveryDays(s),
      count = s.neighborChats["mom-recovery"] ?? 0;
    s.neighborChats["mom-recovery"] = count + 1;
    const reply =
      recoveryReplies[
        age === 1 ? 0 : 1 + ((age - 2 + count) % (recoveryReplies.length - 1))
      ] +
      (canVisitBea(s) && !s.familyStory.escort
        ? " I feel up for an outing. Would you walk with me over to Bea’s?"
        : "");
    visit(`Heard Mom recovering: ${reply}`);
    save();
    speak("mom", `<p>${reply}</p>`, [
      ...(canVisitBea(s) && !s.familyStory.escort
        ? [{ label: "Let’s walk to Bea’s together", run: walkToBea }]
        : []),
      ...(s.spanakopita
        ? [{ label: "Share spanakopita with Mom", run: shareWithMom }]
        : []),
      { label: "Love you too", run: dismissSpeech },
    ]);
    return;
  }
  const status = momStatus(s.day, s.familyStory);
  if (status.activity === "bacon" && s.millionaire?.member === "fire") {
    speak(
      "mom",
      "<p>Are you ready for the best bacon sandwich of your life, sweetheart?</p>",
      [
        {
          label: "Love you too. I’ve gone plant-based, Mom",
          run: () =>
            speak(
              "mom",
              "<p>Of course, love. I’ll make something plant-based for you. Thank you for reminding me.</p>",
              [{ label: "Love you too", run: dismissSpeech }],
            ),
        },
      ],
    );
    return;
  }
  const featherRequest = s.day % 4 === 2 && requestFeather(s);
  const reply =
    (kitchenClearedDay === s.day
      ? kitchenPrepared || cookingScene || s.pendingMeal
        ? "The stove is ready, love. I’ve put my things away so we can cook together."
        : "It was lovely cooking together, sweetheart. I’m glad we had that time."
      : momReply(s)) +
    (featherRequest ? " Cuddle a chicken for me when you go out, love." : "");
  visit(
    status.energetic
      ? `Mom had energy for ${status.journal} today.`
      : `Mom was exhausted ${status.activity === "bedrest" ? "in bed" : "on the couch"} when I ${visitedOutside ? "came home" : "checked on her"}.`,
  );
  visit(`Heard Mom: ${reply}`);
  save();
  speak("mom", `<p>${reply}</p>`, [
    ...(canTellMom(s)
      ? [{ label: "Tell Mom you've got $10k", destructive: true, run: tellMom }]
      : []),
    ...(status.activity === "birdhouses" && s.birdhousePaintDay !== s.day
      ? [{ label: "Let’s pick the paint colors", run: paintBirdhouses }]
      : []),
    ...(status.activity === "letters"
      ? [{ label: "Add something to Auntie’s letter", run: letterToAuntie }]
      : []),
    ...(status.activity === "puzzles"
      ? [{ label: "Let’s play the color puzzle", run: playMomPuzzle }]
      : []),
    ...(s.spanakopita
      ? [{ label: "Share spanakopita with Mom", run: shareWithMom }]
      : []),
    ...(featherRequest
      ? [
          {
            label: "I’ll cuddle a chicken for you",
            run: () => {
              dismissSpeech();
              toast("Mom asked me to cuddle a chicken for her.");
            },
          },
        ]
      : []),
    { label: playerMomResponse(reply, status.energetic), run: dismissSpeech },
  ]);
  thought.textContent = chooseMomThought(s);
  save();
  setHidden(thought, false);
  thoughtTime = 9;
}

function capturePartyActor(object: T.Object3D) {
  return {
    object,
    parent: object.parent,
    position: object.position.clone(),
    worldPosition: object.getWorldPosition(new T.Vector3()),
    rotation: object.rotation.clone(),
    scale: object.scale.clone(),
    visible: object.visible,
  };
}
function restoreParty(party: NonNullable<typeof celebration>) {
  for (const p of [...party.people, ...party.wildlife]) {
    if (p.parent) p.parent.add(p.object);
    else p.object.removeFromParent();
    p.object.position.copy(p.position);
    p.object.rotation.copy(p.rotation);
    p.object.scale.copy(p.scale);
    p.object.visible = p.visible;
  }
}
let celebration:
  | {
      kind: "mom" | "shop";
      center: { x: number; z: number };
      elapsed: number;
      origin: { x: number; z: number };
      people: ReturnType<typeof capturePartyActor>[];
      wildlife: (ReturnType<typeof capturePartyActor> & { ground?: boolean })[];
    }
  | undefined;
let storyThoughtClock = 0,
  storyThoughtIndex = 0,
  teaSeated = false;
let momTrail: { x: number; z: number }[] = [];
function tellMom() {
  if (!scheduleSurgery(s)) return;
  dismountBike();
  dismissSpeech();
  keys.clear();
  setHidden(thought, true);
  thoughtTime = 0;
  const people = world.speakers
    .filter((n) =>
      [
        "mom",
        "npc1",
        "npc2",
        "npc3",
        "robertson",
        "haberdashery",
        "bicycle",
      ].includes(n.id),
    )
    .map((n) => capturePartyActor(n.object));
  const wildlife = [...world.wildlife.birds, ...world.wildlife.butterflies].map(
    (b) => capturePartyActor(b.object),
  );
  celebration = {
    kind: "mom",
    center: { x: -16, z: 25 },
    elapsed: 0,
    origin: { ...s.position },
    people,
    wildlife,
  };
  for (const p of [...people, ...wildlife]) scene.attach(p.object);
  positionStoryMom(world.mom.position.x, world.mom.position.z);
  s.position = { x: -16, z: 25 };
  visit(
    "Jumped and danced with Mom, our neighbors, the birds and butterflies.",
  );
  save();
  chime();
  toast("Mom: We did it! Oh, sweetheart, thank you!");
}
function updateCelebration(dt: number) {
  if (celebration) {
    const { x: cx, z: cz } = celebration.center;
    if (!paused && !document.hidden) celebration.elapsed += dt;
    const t = celebration.elapsed,
      rush = Math.min(1, t / 3);
    world.player.visible = true;
    world.player.position.set(
      cx,
      reducedMotion ? 0 : Math.abs(Math.sin(t * 5)) * 0.7,
      cz,
    );
    celebration.people.forEach((p, i) => {
      const a = (i * Math.PI * 2) / celebration!.people.length;
      const destination = new T.Vector3(
        cx +
          Math.sin(a) *
            (celebration!.kind === "shop" ? 2.4 + (i % 2) * 0.8 : 3),
        reducedMotion ? 0 : Math.abs(Math.sin(t * 5 + i)) * 0.55,
        cz +
          Math.cos(a) *
            (celebration!.kind === "shop" ? 2.4 + (i % 2) * 0.8 : 3),
      );
      p.object.visible = true;
      p.object.position.copy(p.worldPosition).lerp(destination, rush);
      p.object.rotation.set(0, a + Math.PI, 0);
    });
    celebration.wildlife.forEach((b, i) => {
      const a = t * 0.8 + i * 0.6,
        r = celebration!.kind === "shop" ? 2.7 : i < 10 ? 4 : 2.5;
      const destination = new T.Vector3(
        cx + Math.sin(a) * r,
        b.ground
          ? reducedMotion
            ? 0
            : Math.abs(Math.sin(t * 6 + i)) * 0.25
          : 2.1 + Math.sin(a * 2) * 0.4,
        cz + Math.cos(a) * r,
      );
      b.object.visible = true;
      b.object.position.copy(b.worldPosition).lerp(destination, rush);
      if (b.ground) b.object.rotation.y = -a;
    });
    if (t >= 14) {
      const ended = celebration;
      celebration = undefined;
      restoreParty(ended);
      followInitialized = false;
      s.position = clearPosition(
        ended.origin,
        world.rects,
        s.millionaire?.unlocked ? -470 : s.foundTVSeeds ? -89 : -39,
      );
      world.setMomDay(s.day, atHome(), true, s.familyStory);
      save();
      if (ended.kind === "shop") {
        speak(
          "robertson",
          "<p>I thought I was going to lose everything Dad built. Now there will be another morning, and another, with our door open. Thank you, kid. This town is something special.</p>",
          [
            {
              label:
                "Robertsons belongs in this town. I’m glad you’re staying.",
              default: true,
              run: dismissSpeech,
            },
          ],
        );
      } else {
        speak(
          "mom",
          "<p>I called the hospital. They can do the surgery tomorrow! Oh, sweetheart, thank you. I am so excited. Auntie will go with me.</p>",
          [{ label: "We did it, Mom. Love you!", run: dismissSpeech }],
        );
      }
    }
  }
}
function walkToBea() {
  if (!beginBeaWalk(s)) return;
  dismountBike();
  dismissSpeech();
  save();
  momTrail = [{ ...s.position }];
  toast(
    "Mom: I feel up for a little outing. Let’s walk over to Bea’s together.",
  );
}
function positionStoryMom(x: number, z: number, seated = false) {
  if (momAway(s)) {
    world.mom.visible = false;
    return;
  }
  world.mom.visible = true;
  world.mom.rotation.x = 0;
  world.mom.position.set(x, seated ? 0.6 : 0, z);
  const legs = world.mom.getObjectByName("seated-legs");
  if (legs) legs.visible = seated;
  for (const foot of world.mom.children.filter((o) => o.name === "foot")) {
    foot.position.y = seated ? 0.53 : 0.16;
    foot.position.z = seated ? 0.4 : 0;
    foot.scale.set(seated ? 1.1 : 1, seated ? 1.35 : 1, seated ? 0.8 : 1.5);
  }
  world.momCollider.x = x;
  world.momCollider.z = z;
  world.momCollider.w = world.momCollider.d = 0.96;
  const t = world.targets.find((t) => t.id === "mom")!;
  t.x = x + 1;
  t.z = z;
}
let beaGuide: { route: Point[]; distance: number } | undefined;
function guideIntoBea() {
  const solids = world.rects.filter(
    (r) =>
      Math.hypot(r.x - world.bea.position.x, r.z - world.bea.position.z) >
        0.1 && r !== world.momCollider,
  );
  const route = sceneRoute(
    { x: world.bea.position.x, z: world.bea.position.z },
    { x: 10.25, z: 15.2 },
    solids,
  );
  if (!route.length) return toast("Come around to the front door, dears.");
  beaGuide = { route, distance: 0 };
  dismissSpeech();
}
function beaTea(step = s.familyStory?.teaStep ?? 0) {
  if (!s.familyStory?.escort) return;
  if (
    !teaSeated &&
    Math.hypot(world.mom.position.x - 12, world.mom.position.z - 16.9) > 4
  )
    return toast("Mom is catching up. Wait here for her before you sit down.");
  if (!teaSeated) {
    dismountBike();
    teaSeated = sitting = true;
    sittingWithStacy = false;
    s.position = { x: 12, z: 16.9 };
    world.setPlayerSeated(true);
    seatForTea(world.player, true);
    world.player.rotation.y = Math.PI;
    positionStoryMom(12, 13.6, true);
    world.mom.rotation.y = 0;
  }
  const chapter = teaConversation[Math.min(step, 5)];
  const id = chapter.who === "Mom" ? "mom" : "npc1";
  speak(id, `<p>${chapter.text}</p>`, [
    {
      label: chapter.reply,
      run: () => {
        s.familyStory!.teaStep = Math.min(6, step + 1);
        save();
        if (step < 5) beaTea(step + 1);
        else {
          acceptShopGoal(s);
          save();
          dismissSpeech();
          toast("New goal: save Ol’ Man Robertson’s shop. $100,000.");
        }
      },
    },
  ]);
}
function momPhone() {
  panel("Your phone is ringing", "<p>Mom is calling from the hospital.</p>", [
    {
      label: "Answer Mom",
      run: () => {
        if (!answerMomCall(s)) return;
        save();
        panel(
          "Mom on the phone",
          "<p>Hi, sweetheart! I’m out of surgery. It went well. I’m ready to come home. Auntie is bringing me back tonight.</p>",
          [
            {
              label: "Oh, Mom! I’m so glad. Love you.",
              run: () => {
                close();
                thought.textContent = "She is okay. She is really okay.";
                setHidden(thought, false);
                thoughtTime = 10;
              },
            },
          ],
        );
      },
    },
  ]);
}
function playMomPuzzle() {
  dismissSpeech();
  const board = colorPuzzle(s.day);
  if (!s.colorPuzzle || s.colorPuzzle.day !== s.day)
    s.colorPuzzle = { day: s.day, cells: [...board.clues] };
  let selected = -1;
  let numbered = false;
  visit("Worked on Mom's color puzzle.");
  save();
  panel(
    "Mom’s color puzzle",
    '<p>Use each color once in every row, column, and outlined 3×3 box. Click an empty space, then choose a color. Dark-rimmed pieces stay put.</p><div id="color-puzzle-grid" role="group" aria-label="Color Sudoku board"></div><div id="color-puzzle-palette"></div><p id="color-puzzle-status" role="status"></p>',
    [
      {
        label: "Show numbers",
        run: () => {
          numbered = !numbered;
          render();
        },
      },
      {
        label: "Clear selected space",
        run: () => {
          if (selected >= 0 && !board.clues[selected]) {
            s.colorPuzzle!.cells[selected] = 0;
            save();
            render();
          }
        },
      },
      { label: "Back to Mom", default: true, run: close },
    ],
  );
  $("#modal .panel").classList.add("color-puzzle-panel");
  function render() {
    const cells = s.colorPuzzle!.cells;
    const conflicts = puzzleConflicts(cells);
    const grid = $("#color-puzzle-grid");
    grid.replaceChildren();
    cells.forEach((value, index) => {
      const button = document.createElement("button");
      const row = Math.floor(index / 9),
        col = index % 9;
      button.className = `color-puzzle-cell${board.clues[index] ? " fixed" : ""}${index === selected ? " selected" : ""}${conflicts.has(index) ? " conflict" : ""}`;
      button.style.borderRightWidth = col === 2 || col === 5 ? "3px" : "1px";
      button.style.borderBottomWidth = row === 2 || row === 5 ? "3px" : "1px";
      setAttr(
        button,
        "aria-label",
        `Row ${row + 1}, column ${col + 1}: ${value ? puzzleColors[value - 1].name : "empty"}${board.clues[index] ? ", fixed" : ""}`,
      );
      setAttr(button, "aria-pressed", String(index === selected));
      button.disabled = !!board.clues[index];
      if (value)
        button.innerHTML = `<span style="background:${puzzleColors[value - 1].color}">${numbered ? value : ""}</span>`;
      button.onclick = () => {
        selected = index;
        render();
      };
      grid.append(button);
    });
    const palette = $("#color-puzzle-palette");
    palette.replaceChildren();
    puzzleColors.forEach((color, index) => {
      const button = document.createElement("button");
      setAttr(button, "aria-label", `Place ${color.name}`);
      button.innerHTML = `<span style="background:${color.color}">${numbered ? index + 1 : ""}</span>`;
      button.onclick = () => {
        if (selected < 0) return;
        s.colorPuzzle!.cells[selected] = index + 1;
        save();
        render();
      };
      palette.append(button);
    });
    const solved = cells.every(
      (value, index) => value === board.solution[index],
    );
    $("#color-puzzle-status").textContent = solved
      ? "We did it! Mom smiles. Thanks for doing this with me, love."
      : conflicts.size
        ? "Some colors appear twice in a row, column, or box. Try another spot."
        : selected < 0
          ? "Choose a space to start."
          : "Choose a color below.";
    if (solved) {
      visit("Finished the color puzzle with Mom.");
      save();
    }
  }
  render();
}
function returnToMom() {
  if (momAway(s)) return;
  if (
    s.adventure?.feather ||
    (canTellMomAboutMansion(s) && (s.momHomeStory?.mansionStage ?? 0) > 0)
  )
    return askMom();
  if (offerCooking()) return;
  if (s.familyStory) return askMom();
  s.metMom = true;
  visit("Checked in with Mom after coming home.");
  const badDay = !momStatus(s.day, s.familyStory).energetic;
  const greeting = neighborLine(s, "mom-home").slice(1, -1);
  if (badDay) visit("Heard Mom coughing when I got home.");
  save();
  world.mom.userData.coughTime = badDay ? 2 : 0;
  speak(
    "mom",
    `<p>${badDay ? "<em>*cough, cough*</em> " : ""}“${greeting}”</p>`,
    [
      ...(canTellMom(s)
        ? [
            {
              label: "Tell Mom you've got $10k",
              destructive: true,
              run: tellMom,
            },
          ]
        : []),
      { label: "How are you doing?", run: askMom },
      ...(s.spanakopita
        ? [{ label: "Share spanakopita with Mom", run: shareWithMom }]
        : []),
    ],
  );
}

const keys = new Set<string>();
let modalDefault: HTMLButtonElement | undefined;
let plotVersions = new WeakMap<T.Group, string>();
const timerLayer = document.createElement("div");
timerLayer.id = "timers";
document.body.append(timerLayer);
const timers = s.plots.map(() => {
  const el = document.createElement("div");
  el.className = "tree-timer";
  timerLayer.append(el);
  return el;
});
type Choice = {
  label: string;
  run: () => void;
  disabled?: boolean;
  destructive?: boolean;
  default?: boolean;
};
const speechLayer = document.createElement("div");
speechLayer.id = "speech-layer";
document.body.append(speechLayer);
const nameLabels = world.speakers.map((speaker) => {
  const label = document.createElement("div");
  label.className = "npc-name";
  label.textContent = speaker.name;
  setHidden(label, true);
  speechLayer.append(label);
  return label;
});
let speaking:
  { id: string; element: HTMLElement; remaining: number } | undefined;
function dismissSpeech() {
  speaking?.element.remove();
  speaking = undefined;
}
function speak(id: string, text: string, choices: Choice[] = []) {
  if (isNight(s) && s.awake && !nightShelterAt(s.position.x, s.position.z))
    return;
  choices = choices.map((c) => ({
    ...c,
    label: c.label.replaceAll("—", ". "),
  }));
  if (
    id === "mom" &&
    !isNight(s) &&
    !momHomeDialogue &&
    !momAway(s) &&
    atHome() &&
    canTellMomAboutMansion(s)
  )
    choices.push({
      label: "Mom, I bought a mansion.",
      run: () => {
        beginMansionConversation(s);
        save();
        showMomMansionConversation();
      },
    });
  if (
    id === "mom" &&
    s.spanakopita &&
    !world.life.sharing &&
    !choices.some((c) => c.label === "Share spanakopita with Mom")
  )
    choices.splice(Math.max(0, choices.length - 1), 0, {
      label: "Share spanakopita with Mom",
      run: shareWithMom,
    });
  if (id === "stacy" && (s.stacyConversations ?? 0) > 0) {
    const responses = choices.filter((c) => c.label !== "Previous messages");
    choices = [
      ...responses,
      {
        label: "Previous messages",
        run: () => {
          panel(
            "Conversation with Stacy",
            `<div class="stacy-transcript">${stacyStory
              .slice(0, s.stacyConversations)
              .map(
                (chapter) =>
                  `<p class="transcript-question"><strong>You</strong><br>${escapeHTML(chapter.question)}</p><p><strong>Stacy</strong><br>${escapeHTML(chapter.answer)}</p>`,
              )
              .join("")}</div>`,
            [
              {
                label: "Back to our conversation",
                run: () => {
                  close();
                  speak("stacy", text, responses);
                },
              },
            ],
          );
          $("#modal .panel").classList.add("conversation-history");
          const transcript = $(".stacy-transcript");
          transcript.scrollTop = transcript.scrollHeight;
        },
      },
    ];
  }
  if (choices.length) releaseMouse();
  if (furnitureEditorOpen) closeFurnitureEditor();
  toastTime = 0;
  setCss($("#toast").style, "opacity", "0");
  dismissSpeech();
  const element = document.createElement("section");
  element.className = "speech-bubble";
  if (id === "stacy") element.classList.add("stacy-conversation");
  setAttr(element, "role", "region");
  setAttr(
    element,
    "aria-label",
    `${world.speakers.find((n) => n.id === id)?.name ?? id} says`,
  );
  const content = document.createElement("div");
  content.innerHTML = text.replaceAll("—", ". ");
  setAttr(content, "aria-live", "polite");
  element.append(content);
  const row = document.createElement("div");
  row.className = "choices";
  const explicitDefault = choices.findIndex((c) => c.default);
  const defaultIndex =
    explicitDefault >= 0
      ? explicitDefault
      : choices.findIndex((c) => !c.disabled && !c.destructive);
  for (const [index, choice] of choices.entries()) {
    const button = document.createElement("button");
    button.textContent = choice.label;
    button.disabled = !!choice.disabled;
    button.onclick = choice.run;
    button.dataset.safeDefault = String(
      index === defaultIndex && !choice.destructive && !choice.disabled,
    );
    if (button.dataset.safeDefault === "true") {
      button.classList.add("default-action");
      const hint = document.createElement("kbd");
      hint.textContent = "E";
      setAttr(hint, "aria-hidden", "true");
      button.append(hint);
    }
    row.append(button);
  }
  const end = document.createElement("button");
  end.className = "speech-close";
  end.textContent = "×";
  setAttr(end, "aria-label", "End conversation");
  end.onclick = dismissSpeech;
  element.append(end);
  if (choices.length) element.append(row);
  speechLayer.append(element);
  speaking = {
    id,
    element,
    remaining: choices.length ? Infinity : Math.max(8, text.length / 15),
  };
  setHidden(thought, true);
  setCss(thought.style, "display", "none");
  updateSpeech(0);
}
function effectivelyVisible(object: T.Object3D) {
  for (let node: T.Object3D | null = object; node; node = node.parent)
    if (!node.visible) return false;
  return true;
}
function updateSpeech(dt: number) {
  world.capSeeds.visible = !s.foundCapSeeds;
  const spot = seedStashSpots[s.seedStashSpot ?? 0];
  world.forestSeeds.position.set(spot.x, 0, spot.z);
  const forestTarget = world.targets.find((t) => t.id === "forest-seeds")!;
  forestTarget.x = spot.x;
  forestTarget.z = spot.z;
  world.forestSeeds.visible = !!s.foundCapSeeds && !s.foundForestSeeds;
  world.storeSeeds.visible = false;
  if (speaking) {
    speaking.remaining -= dt;
    if (speaking.remaining <= 0) dismissSpeech();
  }
  world.speakers.forEach((speaker, i) => {
    const head = speaker.object.getObjectByName("head")!;
    if (
      celebration?.kind === "shop" ||
      !head ||
      !effectivelyVisible(speaker.object)
    ) {
      setHidden(nameLabels[i], true);
      if (speaking?.id === speaker.id) setHidden(speaking.element, true);
      return;
    }
    const anchor = head
      .getWorldPosition(new T.Vector3())
      .add(new T.Vector3(0, 0.48 * speaker.object.scale.y + 0.17, 0));
    const d = Math.hypot(
      speaker.object.position.x - s.position.x,
      speaker.object.position.z - s.position.z,
    );
    const direction = anchor.clone().sub(camera.position),
      distance = direction.length();
    ray.set(camera.position, direction.normalize());
    ray.far = Math.max(0, distance - 0.15);
    const obscured = ray
      .intersectObjects(
        world.occluders.filter((o) => cameraWalls.visibleForInteraction(o)),
        false,
      )
      .some((hit) => hit.distance < distance - 0.15);
    anchor.project(camera);
    const hidden =
      !begun ||
      !effectivelyVisible(speaker.object) ||
      !s.awake ||
      paused ||
      d > 13 ||
      anchor.z > 1 ||
      anchor.z < -1 ||
      Math.abs(anchor.x) > 1 ||
      Math.abs(anchor.y) > 1 ||
      obscured;
    const label = nameLabels[i];
    setHidden(label, hidden);
    const x = (anchor.x * 0.5 + 0.5) * innerWidth,
      y = (-anchor.y * 0.5 + 0.5) * innerHeight;
    setCss(label.style, "left", `${x}px`);
    setCss(label.style, "top", `${y}px`);
    if (speaking?.id === speaker.id) {
      if (d > 9) {
        dismissSpeech();
        return;
      }
      const bubble = speaking.element;
      // Keep an established conversation usable even if a wall or the camera
      // obscures the speaker's nameplate. Interaction reach already gates it.
      setHidden(bubble, !begun || !s.awake || paused);
      const half = bubble.offsetWidth / 2;
      setCss(
        bubble.style,
        "left",
        `${Math.max(half + 12, Math.min(innerWidth - half - 12, x))}px`,
      );
      const hudTop = resourceHud.getBoundingClientRect().top;
      setCss(
        bubble.style,
        "maxHeight",
        `${Math.max(100, Math.min(innerHeight * 0.65, hudTop - 24))}px`,
      );
      setCss(
        bubble.style,
        "top",
        `${Math.max(bubble.offsetHeight + 12, Math.min(y - 16, hudTop - 12))}px`,
      );
    }
  });
}
function exportSave() {
  save();
  const a = document.createElement("a");
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(s)], { type: "application/json" }),
  );
  a.href = url;
  a.download = "money-tree-save.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Game state downloaded.");
}
let spanakopitaShot: { position: T.Vector3; aim: T.Vector3 } | undefined;
function shareWithMom() {
  dismissSpeech();
  if (world.life.busy || !shareSpanakopita(s)) return;
  keys.clear();
  spanakopitaShot = {
    position: camera.position.clone(),
    aim: cameraAim.clone(),
  };
  world.life.share();
  save();
  speak(
    "mom",
    "<p>Oh, this is delicious! You thought of me. Thank you, sweetheart. Sharing it with you is the best part.</p>",
    [{ label: "Love you too", run: dismissSpeech }],
  );
}
function foodOfTheGods() {
  speak(
    "gigachad",
    "<p>Food of the Gods, bro. Fresh spanakopita, $3 a piece.</p>",
    [
      {
        label: "Buy spanakopita for $3",
        disabled: s.cash < 300,
        run: () => {
          if (buySpanakopita(s)) {
            save();
            dismissSpeech();
            toast("Spanakopita in your bag. You can share it with Mom.");
          }
        },
      },
      {
        label: "What does spanakopita do?",
        run: () =>
          speak(
            "gigachad",
            "<p>Do? It’s spanakopita, bro. Spinach, phyllo, feta. What more could you want?</p>",
            [
              {
                label: "I dunno, dill?",
                run: () =>
                  speak("gigachad", "<p>Whoa. Great idea.</p>", [
                    {
                      label: "One spanakopita, please",
                      disabled: s.cash < 300,
                      run: () => {
                        if (buySpanakopita(s)) {
                          save();
                          dismissSpeech();
                        }
                      },
                    },
                    { label: "See you, bro", run: dismissSpeech },
                  ]),
              },
              { label: "Sounds good", run: dismissSpeech },
            ],
          ),
      },
      ...(s.coin
        ? [
            {
              label: "Tell me about your trading strategy",
              run: () => tradingConversation("gigachad"),
            },
          ]
        : []),
      { label: "See you, bro", run: dismissSpeech },
    ],
  );
}
async function save() {
  profiling.count("saveRequests");
  updateInventoryNotices(0);
  world.updateNotebook(s.journal.at(-1)!, s.journal.length);
  try {
    if (!saveStore || !(await saveStore.write(s))) {
      if (!storageWarning) {
        storageWarning = true;
        toast(
          "Your previous save is preserved. This game state could not be saved; export your progress from the pause menu.",
        );
      }
      return;
    }
  } catch {
    if (!storageWarning) {
      storageWarning = true;
      toast(
        "Browser storage is unavailable. Export your save from the pause menu.",
      );
    }
  }
}
const seedSearchClock = new SeedSearchClock();
let millionairePathNoticed = !!s.millionaire?.unlocked;
function toast(text: string) {
  $("#toast").textContent = text;
  setCss($("#toast").style, "opacity", "1");
  toastTime = Math.max(4, Math.min(10, text.length / 18));
}
function close() {
  phoneCleanup?.();
  phoneCleanup = undefined;
  last = performance.now();
  modalDefault = undefined;
  setHidden($("#modal"), true);
  paused = false;
  keys.clear();
  ($("#world") as HTMLCanvasElement).focus();
}
function panel(
  title: string,
  text: string,
  choices: Choice[],
  _subtitle = "MONEY TREE",
) {
  if (furnitureEditorOpen) closeFurnitureEditor();
  toastTime = 0;
  setCss($("#toast").style, "opacity", "0");
  title = title.replaceAll("—", ". ");
  choices = choices.map((c) => ({
    ...c,
    label: c.label.replaceAll("—", ". "),
  }));
  releaseMouse();
  dismissSpeech();
  paused = true;
  keys.clear();
  const modal = $("#modal");
  setHidden(modal, false);
  modal.innerHTML = "";
  const p = document.createElement("section");
  p.className = "panel";
  setAttr(p, "role", "dialog");
  setAttr(p, "aria-modal", "true");
  setAttr(p, "aria-label", title);
  p.innerHTML = `<h2>${title}</h2>`;
  const content = document.createElement("div");
  content.innerHTML = text.replaceAll("—", ". ");
  p.append(content);
  const row = document.createElement("div");
  row.className = "choices";
  const explicit = choices.findIndex((c) => c.default);
  const defaultIndex =
    explicit >= 0
      ? explicit
      : choices.findIndex((c) => !c.disabled && !c.destructive);
  modalDefault = undefined;
  for (const [index, c] of choices.entries()) {
    const b = document.createElement("button");
    b.textContent = c.label;
    setAttr(b, "aria-label", c.label);
    if (index === defaultIndex && !c.disabled && !c.destructive) {
      modalDefault = b;
      b.classList.add("default-action");
      const hint = document.createElement("kbd");
      hint.textContent = "E";
      setAttr(hint, "aria-hidden", "true");
      b.append(hint);
    }
    b.disabled = !!c.disabled;
    b.onclick = c.run;
    row.append(b);
  }
  p.append(row);
  modal.append(p);
  (modalDefault ?? row.querySelector("button"))?.focus({ preventScroll: true });
}
const esc = (str: string) =>
  str.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function notebook(page = s.journal.length - 1, direction = 0, leaf = 0) {
  page = T.MathUtils.clamp(page, 0, s.journal.length - 1);
  const entry = s.journal[page],
    title = `Day ${page + 1}`;
  let spreads: string[][][] = [];
  const previous = () =>
    leaf > 0 ? notebook(page, -1, leaf - 1) : notebook(page - 1, -1, -1);
  const next = () =>
    leaf + 1 < spreads.length
      ? notebook(page, 1, leaf + 1)
      : notebook(page + 1, 1);
  panel(
    "Your notebook",
    `<div class="notebook-spread notebook-page" data-page="${page}"><section class="notebook-leaf notebook-left"><h3>${title}</h3><p></p></section><section class="notebook-leaf notebook-right"><div class="notebook-continuation" aria-hidden="true"></div><p></p></section></div><p class="page-number"></p><p class="fine">Today's entry will be written when you go to sleep.</p>`,
    [
      { label: "Previous page", run: previous },
      { label: "Next page", run: next },
      { label: "Close notebook", default: true, run: close },
    ],
    "YOUR NOTEBOOK",
  );
  const paper = $("#modal .panel");
  paper.classList.add("notebook-paper");
  paper
    .querySelector(".notebook-spread")!
    .parentElement!.classList.add("notebook-content");
  const render = () => {
    const left = paper.querySelector<HTMLElement>(".notebook-leaf")!,
      style = getComputedStyle(left);
    const rule = parseFloat(style.getPropertyValue("--rule")) || 30;
    const width =
      left.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    const height =
      left.clientHeight -
      parseFloat(style.paddingTop) -
      parseFloat(style.paddingBottom);
    const font = parseFloat(style.getPropertyValue("--writing-size")) || 24;
    const context = document.createElement("canvas").getContext("2d")!;
    context.font = `${font}px Gaegu`;
    const lines = notebookLines(
      entry
        .replace(/^Day \d+\s*/, "")
        .replaceAll("—", ". ")
        .split(/\n\n/),
      Math.max(20, width - 4),
      (text) => context.measureText(text).width,
    );
    // Reserve two ruled rows for the date and one for the paragraph margin.
    spreads = notebookSpreads(
      lines,
      Math.max(2, Math.floor(height / rule) - 3),
    );
    leaf = leaf < 0 ? spreads.length - 1 : Math.min(leaf, spreads.length - 1);
    paper
      .querySelectorAll<HTMLParagraphElement>(".notebook-leaf p")
      .forEach(
        (p, i) =>
          (p.innerHTML = spreads[leaf][i]
            .map((line) => (line ? esc(line) : "&nbsp;"))
            .join(" <br>")),
      );
    const buttons =
      paper.querySelectorAll<HTMLButtonElement>(".choices button");
    buttons[0].disabled = page === 0 && leaf === 0;
    buttons[1].disabled =
      page === s.journal.length - 1 && leaf === spreads.length - 1;
    paper.querySelector(".page-number")!.textContent =
      `Page ${page + 1} of ${s.journal.length}${spreads.length > 1 ? ` · Spread ${leaf + 1} of ${spreads.length}` : ""}`;
  };
  render();
  document.fonts.ready.then(() => {
    if (paper.isConnected) render();
  });
  const resize = () => {
    if (!paper.isConnected) {
      removeEventListener("resize", resize);
      return;
    }
    render();
  };
  addEventListener("resize", resize);
  world.updateNotebook(entry, page + 1);
  if (direction && !reducedMotion)
    paper.animate(
      [
        {
          transform: `perspective(900px) rotateY(${direction * 12}deg)`,
          opacity: 0.55,
        },
        { transform: "perspective(900px) rotateY(0deg)", opacity: 1 },
      ],
      { duration: 240, easing: "ease-out" },
    );
  paper.onkeydown = (e) => {
    if (e.key === "ArrowLeft" && (page > 0 || leaf > 0)) {
      e.preventDefault();
      previous();
    }
    if (
      e.key === "ArrowRight" &&
      (page < s.journal.length - 1 || leaf + 1 < spreads.length)
    ) {
      e.preventDefault();
      next();
    }
  };
  paper.tabIndex = -1;
  paper.focus({ preventScroll: true });
}

const hatPortraits = new Map<HatId | BikeId | Fellowship, string>();
function hatPortrait(id: HatId | BikeId | Fellowship) {
  if (hatPortraits.has(id)) return hatPortraits.get(id)!;
  const preview = new T.Scene();
  preview.background = new T.Color("#f1e4c9");
  preview.add(new T.HemisphereLight("#ffffff", "#776852", 3));
  const light = new T.DirectionalLight("#fff3d2", 3);
  light.position.set(-3, 5, 4);
  preview.add(light);
  const isMascot = fellowships.some((f) => f.id === id);
  const model = isMascot
    ? makeMascot(id as Fellowship)
    : bikeById(id)
      ? makeBike(id as BikeId)
      : makeHat(id as HatId);
  preview.add(model);
  const cam = new T.PerspectiveCamera(35, 1, 0.1, 20);
  const viewpoint = bikeById(id) ? [3.2, 2.1, 3.6] : [1.5, 1.3, 2.6];
  cam.position.set(viewpoint[0], viewpoint[1], viewpoint[2]);
  cam.lookAt(0, bikeById(id) ? 0.85 : 0.2, 0);
  if (isMascot) {
    const bounds = new T.Box3().setFromObject(model),
      center = bounds.getCenter(new T.Vector3());
    const span = bounds.getSize(new T.Vector3()).length();
    cam.far = 40;
    cam.position
      .copy(center)
      .add(new T.Vector3(span * 0.45, span * 0.2, span * 1.6));
    cam.lookAt(center);
    cam.updateProjectionMatrix();
  }
  const target = new T.WebGLRenderTarget(160, 160);
  target.texture.colorSpace = T.SRGBColorSpace;
  const old = renderer.getRenderTarget();
  renderer.setRenderTarget(target);
  renderer.render(preview, cam);
  const pixels = new Uint8Array(160 * 160 * 4);
  renderer.readRenderTargetPixels(target, 0, 0, 160, 160, pixels);
  renderer.setRenderTarget(old);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 160;
  const ctx = canvas.getContext("2d")!,
    image = ctx.createImageData(160, 160);
  for (let y = 0; y < 160; y++)
    image.data.set(pixels.subarray((159 - y) * 640, (160 - y) * 640), y * 640);
  ctx.putImageData(image, 0, 0);
  const url = canvas.toDataURL();
  hatPortraits.set(id, url);
  target.dispose();
  model.traverse((o) => {
    if (o instanceof T.Mesh) {
      o.geometry.dispose();
      (o.material as T.Material).dispose();
    }
  });
  return url;
}
function showHat(id: HatId) {
  const hat = hatById(id)!;
  panel(
    hat.name,
    `<img class="hat-portrait" src="${hatPortrait(id)}" alt="${hat.name}"><p>${hatPower(id, s.foundCapSeeds)}</p><p>${money(purchasePrice(s, hat.price))} · Your pocket: ${money(s.cash)}</p>`,
    [
      ...(id === "cap" && !s.foundCapSeeds
        ? [
            {
              label: "Check the brim",
              run: () => {
                if (findCapSeeds(s)) {
                  save();
                  chime();
                  close();
                  toast(
                    "Five money seeds! They were tucked into the brim of the cap.",
                  );
                } else
                  toast(
                    "Come back after trying Robertson’s seeds. There’s something tucked into this brim.",
                  );
              },
            },
          ]
        : []),
      {
        label: s.hats.includes(id)
          ? wearing(s, id)
            ? "Already wearing"
            : "Put on this hat"
          : `Buy & ${wornHats(s).length >= hatCapacity(s) ? "keep" : "wear"} · ${money(purchasePrice(s, hat.price))}`,
        disabled: s.hats.includes(id)
          ? wearing(s, id) || wornHats(s).length >= hatCapacity(s)
          : s.cash < purchasePrice(s, hat.price),
        run: () => {
          if (s.hats.includes(id) ? equipHat(s, id) : buyHat(s, id)) {
            save();
            close();
            toast(
              wearing(s, id)
                ? `Wearing ${hat.name}. ${hatPower(id, s.foundCapSeeds)}`
                : `${hat.name} is in your bag. Visit your bedroom hat rack to swap hats.`,
            );
          }
        },
      },
      { label: "Keep looking", run: close },
    ],
  );
}
function beginBedPlacement() {
  if (riding)
    return toast("Press H to get off your bike before placing a garden bed.");
  close();
  placingBed = true;
  toast(
    "Walk to a clear spot around your house. E places the bed; Escape cancels. Green means it fits.",
  );
}
function bag() {
  const items = [
    {
      id: "bed",
      label: "Garden beds",
      value: String(s.gardenBeds ?? 0),
      available: !!s.gardenBeds,
    },
    {
      id: "soil",
      label: "Soil bags",
      value: String(s.soilBags ?? 0),
      available: !!s.soilBags,
    },
    {
      id: "money",
      label: "Pocket money",
      value: money(s.cash),
      available: s.cash > 0,
    },
    {
      id: "seeds",
      label: "Money seeds",
      value: `${s.seeds} ${s.seeds === 1 ? "seed" : "seeds"}`,
      available: s.seeds > 0,
    },
    {
      id: "shovel",
      label: "Shovel",
      value: s.shovel ? "Owned" : "Not owned",
      available: s.shovel,
    },
    {
      id: "can",
      label: "Watering can",
      value: s.can ? "Owned" : "Not owned",
      available: s.can,
    },
    {
      id: "compost",
      label: "Compost scraps",
      value: String(s.compostScraps ?? 0),
      available: !!s.compostScraps,
    },
    {
      id: "spanakopita",
      label: "Spanakopita",
      value: String(s.spanakopita ?? 0),
      available: !!s.spanakopita,
    },
    {
      id: "fertilizer",
      label: "Fertilizer",
      value: `${s.fertilizer} ${s.fertilizer === 1 ? "dose" : "doses"}`,
      available: s.fertilizer > 0,
    },
  ];
  panel(
    "Your bag",
    `<div class="inventory-grid">${items.map((item) => `<${item.id === "bed" ? 'button type="button"' : "div"} class="inventory-card ${item.available ? "" : "empty"}" data-item="${item.id}" ${item.id === "bed" ? `aria-label="Place a garden bed from your bag" ${item.available ? "" : "disabled"}` : ""}>${inventoryIcon(item.id)}<span>${item.label}</span><b>${item.value}</b>${item.id === "bed" && item.available ? "<small>Click to place</small>" : ""}</${item.id === "bed" ? "button" : "div"}>`).join("")}</div><div class="inventory-grid" aria-label="Flower and vegetable seeds">${crops
      .filter((c) => seedCount(s, c) > 0)
      .map(
        (c) =>
          `<div class="inventory-card ${seedCount(s, c) ? "" : "empty"}"><img src="${seedPortrait(c)}" alt="${c} plant model"><span>${c} seeds</span><b>${seedCount(s, c)}</b><small>${activePlantingSeed(s) === c ? "Selected for planting" : ""}</small></div>`,
      )
      .join(
        "",
      )}</div><div class="hat-bag">${s.hats.map((id) => `<button type="button" data-hat="${id}"><img src="${hatPortrait(id)}" alt=""><span>${hatById(id)!.name}</span><small>${hatPower(id, s.foundCapSeeds)}</small><b>${wearing(s, id) ? "Wearing" : "Equip"}</b></button>`).join("")}</div>`,
    [
      ...(s.equippedHat
        ? [
            {
              label: "Take off hats",
              run: () => {
                equipHat(s, null);
                save();
                bag();
              },
            },
          ]
        : []),
      ...(s.gardenBeds
        ? [
            {
              label: "Place a garden bed",
              run: beginBedPlacement,
            },
          ]
        : []),
      ...Object.entries(s.farmProduce ?? {})
        .filter(([, n]) => n > 0)
        .map(([crop, n]) => ({ label: `${crop}: ${n} harvested`, run: bag })),
      ...ingredients
        .filter((k) => !!s.groceries?.[k])
        .map((k) => ({ label: `${k}: ${s.groceries![k]} in bag`, run: bag })),
      { label: "Furniture editor · F5", run: openFurnitureEditor },
      { label: "Back to the day", default: true, run: close },
    ],
    "YOUR LITTLE COLLECTION",
  );
  if (s.hats.length || s.bikes?.length)
    $("#modal .panel").classList.add("inventory-panel");
  const bicycleCards = document.createElement("div");
  bicycleCards.className = "hat-bag";
  for (const id of s.bikes ?? []) {
    const bike = bikeById(id)!;
    const card = document.createElement("button");
    card.type = "button";
    card.dataset.bicycle = id;
    card.innerHTML = `<img src="${hatPortrait(id)}" alt=""><span>${bike.name}</span><small>${Math.round(bike.speed * 3.6)} km/h</small><b>${s.selectedBike === id ? "Selected · Ride" : "Choose and ride"}</b>`;
    card.onclick = () => {
      dismountBike();
      selectBike(s, id);
      save();
      close();
      mountBike();
    };
    bicycleCards.append(card);
  }
  document.querySelector("#modal .hat-bag")!.after(bicycleCards);
  const bedCard =
    document.querySelector<HTMLButtonElement>('[data-item="bed"]');
  if (bedCard) bedCard.onclick = beginBedPlacement;
  document.querySelectorAll<HTMLButtonElement>("[data-hat]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!equipHat(s, b.dataset.hat as HatId))
          toast(
            `Your ${hatCapacity(s)} hat slots are full! Visit a hat rack to swap.`,
          );
        save();
        bag();
      }),
  );
}
let hatHanging:
  | {
      id: HatId;
      elapsed: number;
      model: T.Group;
      from: T.Vector3;
      to: T.Vector3;
    }
  | undefined;
function hangHat(id: HatId) {
  const model = makeHat(id);
  const from = world.wornHat.getWorldPosition(new T.Vector3());
  removeHat(s, id);
  const index = s.hats.filter((h) => !wearing(s, h)).indexOf(id);
  const mountainRack = s.position.z < -300;
  const to = new T.Vector3(
    (mountainRack ? -22.7 : -20.2) + (index % 2 ? 0.36 : -0.36),
    0.6 + Math.floor((mountainRack ? index % 6 : index) / 2) * 0.46,
    mountainRack ? -312.03 : 4.97,
  );
  model.position.copy(from);
  scene.add(model);
  hatHanging = { id, model, from, to, elapsed: 0 };
  world.player.rotation.y = Math.atan2(
    to.x - s.position.x,
    to.z - s.position.z,
  );
  close();
  keys.clear();
  save();
}
function hatRack() {
  panel(
    "Your hat rack",
    `<p>Wear up to ${hatCapacity(s)} hats. Their powers work together. Each new level adds a slot.</p><div class="hat-bag">${s.hats.map((id) => `<button data-rack-hat="${id}"><img src="${hatPortrait(id)}" alt=""><span>${hatById(id)!.name}</span><p class="hat-power">${hatPower(id, s.foundCapSeeds)}</p><b>${wearing(s, id) ? "Hang on rack" : "Put on"}</b></button>`).join("") || "<p>Your rack is waiting for its first hat.</p>"}</div>`,
    [{ label: "Back to the day", default: true, run: close }],
  );
  document.querySelectorAll<HTMLButtonElement>("[data-rack-hat]").forEach(
    (button) =>
      (button.onclick = () => {
        const id = button.dataset.rackHat as HatId;
        if (wearing(s, id)) {
          hangHat(id);
          return;
        } else if (!equipHat(s, id))
          toast(
            `Your ${hatCapacity(s)} hat slots are full! Hang one on the rack first.`,
          );
        save();
        hatRack();
      }),
  );
}
function bank(afterTransfer = false) {
  const transfer = (direction: "withdraw" | "deposit", all = false) => {
    const available = direction === "withdraw" ? s.bank : s.cash;
    const amount = all
      ? available
      : parseAmount(($("#bank-amount") as HTMLInputElement).value);
    if (amount === null || amount > available || amount <= 0) {
      $("#bank-error").textContent =
        `Enter an amount from $0.01 to ${money(available)}.`;
      return;
    }
    const ok =
      direction === "withdraw" ? withdraw(s, amount) : deposit(s, amount);
    if (ok) {
      save();
      bank(true);
    }
  };
  panel(
    "A penny at a time",
    `<div class="bank-balances"><div><span>Piggy bank</span><b>${money(s.bank)}</b></div><div><span>Your pocket</span><b>${money(s.cash)}</b></div></div><label class="amount-label" for="bank-amount">Transfer amount ($)</label><input id="bank-amount" inputmode="decimal" type="text" autocomplete="off" value="${((s.bank || s.cash) / 100).toFixed(2)}" aria-describedby="bank-error"/><p id="bank-error" role="status"></p><p class="fine">Savings earn 5% interest each game day. Move just what you need, or choose an all-money option.</p>`,
    [
      {
        label: "Withdraw amount",
        disabled: !s.bank,
        default: !afterTransfer && s.bank > 0,
        run: () => transfer("withdraw"),
      },
      {
        label: "Deposit amount",
        disabled: !s.cash,
        default: !afterTransfer && !s.bank && s.cash > 0,
        run: () => transfer("deposit"),
      },
      {
        label: "Withdraw savings (all)",
        disabled: !s.bank,
        run: () => transfer("withdraw", true),
      },
      {
        label: "Deposit all",
        disabled: !s.cash,
        run: () => transfer("deposit", true),
      },
      {
        label: "Close",
        default: afterTransfer || (!s.bank && !s.cash),
        run: close,
      },
    ],
    "YOUR PIGGY BANK",
  );
}
const productPortraits = new Map<string, string>();
function shopPortrait(id: string, model: () => T.Object3D) {
  if (!productPortraits.has(id))
    productPortraits.set(id, productPortrait(renderer, model()));
  return productPortraits.get(id)!;
}
function homeShop(department: "groceries" | "furnishings" = "furnishings") {
  const groceries = department === "groceries";
  const stock = groceries
    ? ingredients.slice(0, 4).map((id) => ({
        id,
        name: id[0].toUpperCase() + id.slice(1),
        price: 100,
        image: () => makeGrocery(id),
        quantity: s.groceries?.[id] ?? 0,
        buy: () => buyGrocery(s, id),
      }))
    : furnishingCatalog
        .filter((f) => f.level <= homeLevel(s) && f.level < 4)
        .map((f) => ({
          ...f,
          image: () => makeFurnishing(f.id),
          quantity: (s.furnitureBag ?? []).filter((id) => id === f.id).length,
          buy: () => {
            const price = purchasePrice(s, f.price);
            if (s.cash < price) return false;
            s.cash -= price;
            (s.furnitureBag ??= []).push(f.id);
            s.events.push(`Bought ${f.name} for home.`);
            return true;
          },
        }));
  panel(
    groceries ? "Robertsons: Groceries" : "Robertsons: Home Furnishings",
    `<p>${groceries ? "Bring groceries home to cook with Mom. Food bonuses last until sleep." : "Choose furnishings for your home. New items arrive as you explore."}</p><p>Your pocket: <b>${money(s.cash)}</b></p><div class="inventory-grid shop-grid">${stock.map((item) => `<button type="button" class="inventory-card shop-card" data-product="${item.id}" aria-label="${item.name} · ${money(purchasePrice(s, item.price))}" ${s.cash < purchasePrice(s, item.price) ? "disabled" : ""}><img src="${shopPortrait(item.id, item.image)}" alt="${item.name}"><span>${item.name}</span><small>In bag: ${item.quantity}</small><b>Buy · ${money(purchasePrice(s, item.price))}</b></button>`).join("")}</div>`,
    [
      {
        label: groceries ? "Home Furnishings" : "Groceries",
        run: () => homeShop(groceries ? "furnishings" : "groceries"),
      },
      { label: "Back to the day", default: true, run: close },
    ],
  );
  $("#modal .panel").classList.add("inventory-panel", "shop-panel");
  document
    .querySelectorAll<HTMLButtonElement>("[data-product]")
    .forEach((button) => {
      button.onclick = () => {
        const item = stock.find((item) => item.id === button.dataset.product)!;
        if (!item.buy()) return;
        save();
        homeShop(department);
        const next = document.querySelector<HTMLButtonElement>(
          `[data-product="${item.id}"]`,
        );
        if (next && !next.disabled) next.focus();
      };
    });
}
let placingFurniture:
  | {
      item: FurnishingId;
      ghost: T.Group;
      rotation: number;
      point?: PlacedFurniture;
      valid: boolean;
      sourceIndex?: number;
      sourceRect?: Rect;
      locked?: boolean;
      distance: number;
      outline: T.BoxHelper;
      previewUpdated?: boolean;
      previewUpdates: number;
      obstacles: Rect[];
      walls: WallSpace[];
      placed: PlacedFurniture[];
    }
  | undefined;
let furnitureEditorOpen = false;
const furnitureEditor = createFurnitureEditor({
  entries: () => [
    ...[...new Set(s.furnitureBag ?? [])].map((item) => ({
      item,
      quantity: s.furnitureBag!.filter((id) => id === item).length,
    })),
    ...(s.furniture ?? []).map((p, index) => ({ item: p.item, index })),
  ],
  portrait: (id) => shopPortrait(id, () => makeFurnishing(id)),
  select: (entry) => beginFurniture(entry.item, entry.index),
  browse: browseFurniture,
  confirm: commitFurniture,
  cancel: () => {
    cancelFurniture();
    furnitureEditor.browse();
  },
  retrieve: retrieveFurniture,
  exit: closeFurnitureEditor,
});
function cancelFurniture() {
  const f = placingFurniture;
  if (!f) return;
  if (f.sourceIndex !== undefined && furnishingRoot.children[f.sourceIndex])
    furnishingRoot.children[f.sourceIndex].visible = true;
  if (f.sourceRect && !world.rects.includes(f.sourceRect))
    world.rects.push(f.sourceRect);
  disposeAnimation(f.ghost);
  f.outline.removeFromParent();
  f.outline.geometry.dispose();
  (f.outline.material as T.Material).dispose();
  placingFurniture = undefined;
}
function browseFurniture() {
  cancelFurniture();
  furnitureEditor.browse();
}
function closeFurnitureEditor() {
  cancelFurniture();
  furnitureEditorOpen = false;
  furnitureEditor.close();
  keys.clear();
}
function openFurnitureEditor() {
  if (isNight(s) && !nightShelterAt(s.position.x, s.position.z)) {
    toast("Go indoors to arrange furniture safely at night.");
    return;
  }
  if (
    !begun ||
    !s.awake ||
    birdhouseScene ||
    world.life.busy ||
    cookingScene ||
    featherHandoff ||
    hatHanging ||
    estateFilm ||
    celebration
  )
    return;
  if (sitting) return toast("Stand up before arranging furniture.");
  releaseMouse();
  dismissSpeech();
  close();
  if (riding) mountBike();
  furnitureEditorOpen = true;
  placingBed = false;
  browseFurniture();
}
function retrieveFurniture() {
  const f = placingFurniture;
  if (f?.sourceIndex === undefined) return;
  const source = s.furniture?.[f.sourceIndex];
  if (!source) return;
  if ((s.furnitureBag?.length ?? 0) >= 200)
    return toast(
      "Your furniture bag is full. Place an item before putting another away.",
    );
  if (source.seed !== undefined)
    return toast("Mom’s paintings can be moved, but stay on display.");
  const index = f.sourceIndex;
  cancelFurniture();
  (s.furnitureBag ??= []).push(source.item);
  s.furniture!.splice(index, 1);
  syncFurnishings();
  save();
  furnitureEditor.browse();
}
const furnishingRoot = new T.Group();
scene.add(furnishingRoot);
let furnishingVersion = "";
let furnishingRects: Rect[] = [];
function syncFurnishings() {
  const version = JSON.stringify(s.furniture ?? []);
  if (version === furnishingVersion) return;
  furnishingVersion = version;
  for (const r of furnishingRects) {
    const i = world.rects.indexOf(r);
    if (i >= 0) world.rects.splice(i, 1);
  }
  furnishingRects = [];
  for (const child of [...furnishingRoot.children]) disposeAnimation(child);
  for (const p of s.furniture ?? []) {
    const model = makeFurnishing(p.item, p.seed);
    model.position.set(p.x, p.y, p.z);
    model.rotation.y = p.rotation;
    furnishingRoot.add(model);
    const f = furnitureById(p.item);
    if (!f.wall && !p.item.includes("rug")) {
      const r = {
        x: p.x,
        z: p.z,
        w:
          Math.abs(Math.cos(p.rotation)) * f.w +
          Math.abs(Math.sin(p.rotation)) * f.d,
        d:
          Math.abs(Math.sin(p.rotation)) * f.w +
          Math.abs(Math.cos(p.rotation)) * f.d,
      };
      furnishingRects.push(r);
      world.rects.push(r);
    }
  }
}
function homeWalls(): WallSpace[] {
  const result: WallSpace[] =
    s.housing?.status === "owned" ? [...estateWorld.walls] : [];
  for (const o of world.occluders) {
    if (
      !(o instanceof T.Mesh) ||
      !o.userData.cameraWall ||
      o.position.x < -21.3 ||
      o.position.x > -0.7 ||
      o.position.z < -2.3 ||
      o.position.z > 14.3
    )
      continue;
    const dims = o.userData.boxDimensions;
    if (!dims) continue;
    const { w, h, d } = dims as { w: number; h: number; d: number };
    if (h < 2.6) continue;
    const axis = w < d ? "x" : "z",
      value = o.position[axis],
      mid = axis === "x" ? o.position.z : o.position.x,
      length = Math.max(w, d);
    const windows: WallSpace["windows"] = [];
    o.updateMatrixWorld(true);
    o.traverse((child) => {
      if (child.name === "inset-window") {
        const b = new T.Box3().setFromObject(child);
        windows.push({
          from: axis === "x" ? b.min.z : b.min.x,
          to: axis === "x" ? b.max.z : b.max.x,
          bottom: b.min.y,
          top: b.max.y,
        });
      }
    });
    const existingArt = world.homeDecor.getObjectByName("moms-wall-painting");
    if (existingArt && axis === "x" && Math.abs(value + 9) < 0.3) {
      const b = new T.Box3().setFromObject(existingArt);
      windows.push({
        from: b.min.z,
        to: b.max.z,
        bottom: b.min.y,
        top: b.max.y,
      });
    }
    for (const sign of [-1, 1])
      result.push({
        axis,
        value: value + sign * 0.15,
        from: mid - length / 2,
        to: mid + length / 2,
        rotation:
          axis === "x" ? (sign * Math.PI) / 2 : sign === 1 ? 0 : Math.PI,
        windows,
      });
  }
  return result;
}
function furnishingObstacles() {
  return world.rects
    .filter((r) => !furnishingRects.includes(r))
    .concat([
      { x: -12.1, z: 6.42, w: 2.6, d: 0.7 },
      { x: -18, z: 7.4, w: 1.3, d: 1.3 },
      ...[-20.35, -9.65, -20.2, -1.65].map((x, i) => ({
        x,
        z: [7, 13.3, -1, 13.2][i],
        w: 0.7,
        d: 0.7,
      })),
    ]);
}
function beginFurniture(item: FurnishingId, sourceIndex?: number) {
  if (sourceIndex === undefined && !s.furnitureBag?.includes(item)) return;
  if (sourceIndex === undefined && (s.furniture?.length ?? 0) >= 200)
    return toast(
      "Your home has 200 furnishings. Put one away before adding another.",
    );
  cancelFurniture();
  close();
  furnitureEditorOpen = true;
  const source =
    sourceIndex === undefined ? undefined : s.furniture?.[sourceIndex];
  const sourceRect =
    source && !furnitureById(source.item).wall && !source.item.includes("rug")
      ? furnishingRects.find((r) => r.x === source.x && r.z === source.z)
      : undefined;
  if (sourceRect) {
    const index = world.rects.indexOf(sourceRect);
    if (index >= 0) world.rects.splice(index, 1);
  }
  const ghost = makeFurnishing(item, source?.seed);
  ghost.traverse((o) => {
    if (o instanceof T.Mesh) {
      for (const material of Array.isArray(o.material)
        ? o.material
        : [o.material]) {
        material.transparent = true;
        material.opacity = 0.78;
      }
    }
  });
  scene.add(ghost);
  const outline = new T.BoxHelper(ghost, "#e55e64");
  scene.add(outline);
  placingFurniture = {
    item,
    ghost,
    outline,
    rotation: source?.rotation ?? 0,
    valid: false,
    previewUpdates: 0,
    sourceIndex,
    sourceRect,
    distance: 2.2,
    obstacles: furnishingObstacles(),
    walls: homeWalls(),
    placed: (s.furniture ?? []).filter((_, i) => i !== sourceIndex),
    locked: !!source,
    point: source ? { ...source } : undefined,
  };
  if (source && furnishingRoot.children[sourceIndex!])
    furnishingRoot.children[sourceIndex!].visible = false;
  furnitureEditor.preview(item, sourceIndex !== undefined);
  ($("#world") as HTMLCanvasElement).focus();
}
function updateFurniturePlacement() {
  const f = placingFurniture;
  if (!f) return;
  const facing = viewForward();
  let point: PlacedFurniture = {
    item: f.item,
    x: s.position.x + facing.x * f.distance,
    z: s.position.z + facing.z * f.distance,
    y: 0,
    rotation: f.rotation,
    ...(f.locked && f.point ? f.point : {}),
  };
  point.rotation = f.rotation;
  if (!f.locked && furnitureById(f.item).wall) {
    const walls = f.walls;
    const candidates = walls
      .map((w) => {
        const origin = w.axis === "x" ? s.position.x : s.position.z,
          dir = w.axis === "x" ? facing.x : facing.z,
          t = (w.value - origin) / dir;
        return { w, t };
      })
      .filter((a) => a.t > 0 && a.t < 5)
      .sort((a, b) => a.t - b.t);
    if (candidates[0]) {
      const { w, t } = candidates[0];
      point = {
        item: f.item,
        x: s.position.x + facing.x * t,
        z: s.position.z + facing.z * t,
        y: T.MathUtils.clamp(2 - (pitch - 0.42) * 2, 1, 2.5),
        rotation: w.rotation,
      };
    } else point.y = -10;
  }
  if (
    f.previewUpdated &&
    f.ghost.position.x === point.x &&
    f.ghost.position.y === point.y &&
    f.ghost.position.z === point.z &&
    f.ghost.rotation.y === point.rotation
  ) {
    furnitureEditor.status(f.valid, !!f.locked);
    return;
  }
  f.previewUpdated = true;
  f.previewUpdates++;
  f.point = point;
  f.valid = canPlaceFurniture(
    point,
    f.obstacles,
    f.walls,
    f.placed,
    s.housing?.status === "owned",
  );
  const original =
    f.sourceIndex === undefined ? undefined : s.furniture?.[f.sourceIndex];
  if (original?.seed !== undefined) point.seed = original.seed;
  f.ghost.position.set(point.x, point.y, point.z);
  f.ghost.rotation.y = point.rotation;
  f.outline.update();
  (f.outline.material as T.LineBasicMaterial).color.set(
    f.valid ? "#63d684" : "#e55e64",
  );
  furnitureEditor.status(f.valid, !!f.locked);
}
function commitFurniture() {
  const f = placingFurniture;
  if (!f?.valid || !f.point)
    return toast(
      "Choose a clear wall without a window, or unoccupied floor space.",
    );
  if (f.sourceIndex !== undefined) s.furniture![f.sourceIndex] = { ...f.point };
  else {
    const at = s.furnitureBag?.indexOf(f.item) ?? -1;
    if (at < 0) return;
    s.furnitureBag!.splice(at, 1);
    (s.furniture ??= []).push({ ...f.point });
  }
  s.events.push(`Hung or placed ${furnitureById(f.item).name} at home.`);
  cancelFurniture();
  syncFurnishings();
  save();
  toast("A little more personality for home.");
  furnitureEditor.browse();
}
function hangMomCanvases() {
  for (const day of s.momCanvasDays ?? []) {
    if (s.furniture?.some((p) => p.seed === day)) continue;
    let hung = false;
    for (const wall of homeWalls()) {
      for (
        let along = wall.from + 0.85;
        along < wall.to - 0.85;
        along += 1.35
      ) {
        const point: PlacedFurniture = {
          item: (
            ["sunset", "botanical", "geometric", "seascape"] as FurnishingId[]
          )[day % 4],
          x: wall.axis === "x" ? wall.value : along,
          z: wall.axis === "z" ? wall.value : along,
          y: 2.1,
          rotation: wall.rotation,
          seed: day,
        };
        if (canPlaceFurniture(point, [], homeWalls(), s.furniture ?? [])) {
          (s.furniture ??= []).push(point);
          s.events.push(
            `Mom painted a new, unique canvas and we put it on a clear wall.`,
          );
          hung = true;
          save();
          break;
        }
      }
      if (hung) break;
    }
  }
}
let kitchenPrepared = false;
let kitchenClearedDay = 0;
const preparedPan = makeCookingPan();
preparedPan.name = "player-cooking-pan";
preparedPan.position.set(-12.5, 1.13, 12.8);
preparedPan.visible = false;
scene.add(preparedPan);
world.targets.push({
  id: "player-stove",
  x: -12.5,
  z: 11.2,
  label: "Cook with Mom",
});
let cookingScene:
  | {
      recipe: number;
      elapsed: number;
      route: Point[];
      root: T.Group;
      dish: T.Group;
      momOrigin: T.Vector3;
      playerOrigin: Point;
      bed: boolean;
    }
  | undefined;
const foodHud = document.createElement("div");
foodHud.id = "food-effect";
foodHud.className = "money-counter";
resourceHud.append(foodHud);
function offerCooking() {
  if (
    !s.awake ||
    momAway(s) ||
    !mealMask(s) ||
    ["cooking", "bacon"].includes(momStatus(s.day, s.familyStory).activity) ||
    kitchenPrepared ||
    cookingScene
  )
    return false;
  speak(
    "mom",
    "<p>You brought groceries home! Would you like to cook together? I can clear the stove and get a pan ready for you.</p>",
    [
      {
        label: "Yes, let’s cook",
        run: () => {
          kitchenPrepared = true;
          kitchenClearedDay = s.day;
          world.cookingProps.forEach((p) => (p.visible = false));
          if (
            !["bedrest", "resting", "reading"].includes(
              momStatus(s.day, s.familyStory).activity,
            )
          )
            world.mom.position.x -= 1.5;
          world.momCollider.x = world.mom.position.x;
          dismissSpeech();
          toast(
            "Mom has prepared the stove. Walk to the pan and press E to cook.",
          );
        },
      },
      { label: "Maybe later", run: dismissSpeech },
    ],
  );
  return true;
}
function beginCooking() {
  if (!kitchenPrepared && !s.pendingMeal) return;
  const recipe = s.pendingMeal ?? startMeal(s);
  if (!recipe) return;
  const bed = momStatus(s.day, s.familyStory).activity === "bedrest",
    end = bed ? { x: -6.6, z: 11.45 } : { x: -17.2, z: 10.9 };
  const start = { x: -12.5, z: 11.2 };
  const route = sceneRoute(
    start,
    end,
    world.rects.filter((r) => r !== world.momCollider),
  );
  if (!route.length) {
    toast("The way to our seats needs to be clear.");
    return;
  }
  kitchenPrepared = false;
  keys.clear();
  s.position = start;
  world.player.position.set(start.x, 0, start.z);
  world.cookingProps.forEach((p) => (p.visible = false));
  const root = new T.Group();
  scene.add(root);
  const dish = makeDish(recipe);
  dish.position.set(-12.5, 1.15, 12.8);
  root.add(dish);
  ingredients.forEach((_, i) => {
    if (recipe & (1 << i)) {
      const piece = makeIngredient(i);
      piece.position.set(-12.5, 1.8, 12.4);
      piece.userData.addAt = i;
      root.add(piece);
    }
  });
  const second = makeDish(recipe);
  second.name = "moms-meal-plate";
  second.visible = false;
  root.add(second);
  const pan = makeCookingPan();
  pan.position.set(-12.5, 1.11, 12.8);
  root.add(pan);
  const momOrigin = world.mom.position.clone();
  cookingScene = {
    recipe,
    elapsed: 0,
    route,
    root,
    dish,
    momOrigin,
    playerOrigin: start,
    bed,
  };
  save();
  toast(`Cooking ${meals[recipe].name}. We’ll eat together after it sizzles.`);
}
function updateCooking(dt: number) {
  const c = cookingScene;
  if (!c) return;
  c.elapsed += dt;
  keys.clear();
  const t = c.elapsed;
  world.cookingProps.forEach((p) => (p.visible = false));
  for (const piece of c.root.children.filter((p) =>
    p.name.startsWith("ingredient-"),
  )) {
    const stage = t - piece.userData.addAt;
    piece.visible = stage >= 0 && stage < 1.2;
    piece.position.y = 1.8 - Math.max(0, stage) * 0.5;
    piece.position.z = 12.4 + Math.min(1, Math.max(0, stage)) * 0.4;
  }
  const second = c.root.getObjectByName("moms-meal-plate")!;
  second.visible = t >= 13;
  if (t < 9) {
    world.player.rotation.y = 0;
    world.player.position.set(-12.5, 0, 11.2);
    c.dish.scale.setScalar(Math.min(1, 0.15 + t / 6));
    c.dish.position.y =
      1.15 +
      (t < 4 ? Math.abs(Math.sin(t * 3)) * 0.16 : Math.sin(t * 18) * 0.003);
  } else if (t < 13) {
    const p = alongRoute(c.route, (t - 9) / 4);
    s.position = { x: p.x, z: p.z };
    world.player.position.set(p.x, 0, p.z);
    c.dish.position
      .copy(world.player.position)
      .add(new T.Vector3(0, 1.05, 0.5));
  } else {
    s.position = c.bed ? { x: -6.6, z: 10.2 } : { x: -18.9, z: 10.9 };
    world.player.position.set(s.position.x, 0.62, s.position.z);
    world.player.rotation.y = c.bed ? Math.PI / 2 : Math.PI / 2;
    world.setPlayerSeated(true);
    if (!c.bed) {
      world.mom.position.set(-18.9, 0.69, 9.3);
      world.mom.rotation.set(0, Math.PI / 2, 0);
    }
    c.dish.position
      .copy(world.player.position)
      .add(new T.Vector3(0.45, 0.8, 0));
    c.dish.scale.setScalar(Math.max(0.35, 1 - (t - 13) * 0.08));
  }
  const hand = world.player.getObjectByName("hand-1");
  if (t >= 13) {
    // Both actors hold a plate and lift a small bite to their mouths.
    world.player.updateMatrixWorld(true);
    world.mom.updateMatrixWorld(true);
    c.dish.position.copy(
      world.player.localToWorld(new T.Vector3(-0.2, 0.85, 0.48)),
    );
    second.position.copy(
      world.mom.localToWorld(new T.Vector3(-0.2, c.bed ? 0.7 : 0.85, 0.48)),
    );
    second.scale.setScalar(Math.max(0.35, 1 - (t - 13) * 0.08));
    for (const [actor, offset] of [
      [world.player, 0],
      [world.mom, 0.6],
    ] as const) {
      const lift = (1 - Math.cos((t - 13 + offset) * Math.PI)) / 2;
      actor
        .getObjectByName("hand--1")
        ?.position.set(-0.25, c.bed && actor === world.mom ? 0.65 : 0.8, 0.48);
      const eatingHand = actor.getObjectByName("hand-1");
      eatingHand?.position.set(0.25 - lift * 0.17, 0.88 + lift * 0.55, 0.48);
      actor.updateMatrixWorld(true);
      const morselName =
        actor === world.player ? "player-meal-bite" : "mom-meal-bite";
      let morsel = c.root.getObjectByName(morselName);
      if (!morsel) {
        morsel = new T.Mesh(
          new T.SphereGeometry(0.055, 10, 8),
          new T.MeshStandardMaterial({
            color: c.recipe & 1 ? "#f4be35" : "#eac68b",
          }),
        );
        morsel.name = morselName;
        c.root.add(morsel);
      }
      morsel.visible = lift > 0.15 && lift < 0.98;
      if (eatingHand)
        morsel.position
          .copy(eatingHand.getWorldPosition(new T.Vector3()))
          .add(new T.Vector3(0, 0.04, 0));
    }
  } else if (hand) {
    hand.position.set(0.35, 1.1 + Math.sin(t * 4) * 0.06, 0.65);
  }
  if (
    t >= 4 &&
    t < 9 &&
    Math.floor(t * 8) !== Math.floor((t - dt) * 8) &&
    audio &&
    !muted
  ) {
    const o = audio.createOscillator(),
      g = audio.createGain(),
      now = audio.currentTime;
    o.type = "triangle";
    o.frequency.value = 700 + Math.sin(t * 87) * 300;
    g.gain.setValueAtTime(0.012, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(now + 0.08);
  }
  if (t >= 20) {
    finishMeal(s);
    disposeAnimation(c.root);
    cookingScene = undefined;
    world.setPlayerSeated(false);
    for (const side of [-1, 1])
      world.mom
        .getObjectByName(`hand-${side}`)
        ?.position.set(side * 0.43, 0.79, 0);
    world.mom.position.copy(c.momOrigin);
    world.setMomDay(s.day, true, true, s.familyStory);
    s.position = c.bed ? { x: -6.6, z: 11.45 } : { x: -17.2, z: 10.9 };
    world.player.position.set(s.position.x, 0, s.position.z);
    save();
    toast(
      `${meals[c.recipe].name}: ${meals[c.recipe].effect} for ${meals[c.recipe].seconds} seconds. Mom loved sharing it with you.`,
    );
  }
}
let desertClock = 12,
  desertLast = new T.Vector2();
let desertThoughtText: string | undefined;
function updateDesertThought(dt: number) {
  const m = s.millionaire;
  if (!m?.member || !onMillionaireApproach(s.position)) {
    if (desertThoughtText && thought.textContent === desertThoughtText) {
      setHidden(thought, true);
      thoughtTime = 0;
    }
    desertThoughtText = undefined;
    desertLast.set(s.position.x, s.position.z);
    return;
  }
  if (dt <= 0 || speaking) return;
  const moved = desertLast.distanceTo(
    new T.Vector2(s.position.x, s.position.z),
  );
  desertLast.set(s.position.x, s.position.z);
  if (moved > 0.01) desertClock += dt;
  if (desertClock < 12 || thoughtTime > 0) return;
  desertClock = 0;
  thought.textContent = desertThoughtText = chooseDesertReflection(s);
  save();
  setHidden(thought, false);
  thoughtTime = 6;
}

function shop(item: "seeds" | "can" | "shovel" | "fertilizer") {
  const names = {
      seeds: "Five mysterious seeds",
      can: "Watering can",
      shovel: "Shovel",
      fertilizer: "Fertilizer · five doses",
    },
    prices = {
      seeds: purchasePrice(s, 200),
      can: purchasePrice(s, 100),
      shovel: purchasePrice(s, 100),
      fertilizer: purchasePrice(s, 500),
    };
  panel(
    names[item],
    `${
      item === "fertilizer"
        ? `<img class="hat-portrait" src="${shopPortrait("fertilizer", () => {
            return cloneProductModel(world.fertilizerBox);
          })}" alt="Fertilizer box · five doses">`
        : ""
    }<p>${item === "seeds" ? "“That'll be $2.” Robertson slides a little paper bag across the counter." : item === "can" ? "A well-loved can. Just what a thirsty seed needs." : item === "shovel" ? "For less time digging and more time dreaming." : "Five doses per box. Each dose feeds one tree for overnight harvests up to $9."}</p><p>Price: <b>${money(prices[item])}</b> · You carry <b>${money(s.cash)}</b>.</p>`,
    [
      {
        label: `Buy · ${money(prices[item])}`,
        disabled:
          s.cash < prices[item] ||
          ((item === "can" || item === "shovel") && s[item]),
        run: () => {
          if (buy(s, item)) {
            save();
            close();
            toast(
              item === "seeds"
                ? "Money seeds? Actual money? I thought he was joking. What on earth did Robertson just give me?"
                : "Purchase tucked into your bag.",
            );
            if (item === "seeds")
              speak(
                "robertson",
                "<p>“That’s all the seeds I have for you. When you need more, you’ll have to look around town. Check the brim of a cap at the haberdasher’s.”</p><p>“You might want some other supplies. Want to take a look around?”</p>",
              );
          }
        },
      },
      { label: "Maybe later", run: close },
    ],
    "ROBERTSONS",
  );
}
function momGreeting() {
  const line = neighborLine(s, "mom-out").slice(1, -1);
  const reminder =
    s.cash === 0 && s.bank > 0
      ? " Take some money with you. I think you've got some in your piggy bank."
      : "";
  return `“${line}${reminder}”`;
}
function shopConversationChoices() {
  return [
    { label: "Groceries", run: () => homeShop("groceries") },
    { label: "Home Furnishings", run: () => homeShop("furnishings") },
    { label: "Look around", run: dismissSpeech },
  ];
}
function celebrateShop() {
  if (!s.familyStory?.shopSaved || s.familyStory.shopCelebrated || celebration)
    return;
  s.familyStory.shopCelebrated = true;
  dismountBike();
  world.life.cancelInteractions();
  dismissSpeech();
  keys.clear();
  setHidden(thought, true);
  thoughtTime = 0;
  const people = [...new Set(world.speakers.map((n) => n.object))].map(
    capturePartyActor,
  );
  const wildlife = [
    ...[...world.wildlife.birds, ...world.wildlife.butterflies].map((b) =>
      capturePartyActor(b.object),
    ),
    ...world.houseBirds.map(capturePartyActor),
    ...world.life.chickens.map((c) => ({
      ...capturePartyActor(c.object),
      ground: true,
    })),
  ];
  for (const p of [...people, ...wildlife]) scene.attach(p.object);
  celebration = {
    kind: "shop",
    center: { x: 6, z: -28 },
    elapsed: 0,
    origin: { ...s.position },
    people,
    wildlife,
  };
  s.position = { ...celebration.center };
  camera.position.set(12, 7, -22);
  followInitialized = false;
  visit(
    "The whole town, birds, butterflies and chickens danced together inside Robertsons to celebrate saving the store.",
  );
  save();
  chime();
  toast("Robertson: The shop is staying! Everybody, come on in!");
}
function tellRobertsonSaved() {
  const secret = s.familyStory?.shopPlan !== "told";
  if (!saveRobertsons(s)) return robertsonRescue();
  save();
  speak(
    "robertson",
    `<p>${
      secret
        ? "You did what? A hundred thousand dollars? For Robertsons? You’ve been doing this all along, without a word? Oh, kid… I never imagined. You saved Dad’s shop!"
        : "You did it? You really did it! A hundred thousand dollars… Oh, kid, you never gave up on us. Dad’s shop can stay!"
    }</p><p>I could dance! I think I will. Come in, everybody! There’s room for all of us!</p>`,
    [{ label: "Let’s celebrate!", default: true, run: celebrateShop }],
  );
}
function robertsonRescue() {
  const a = s.familyStory!;
  if (a.shopSaved) {
    speak(
      "robertson",
      "<p>Every time I open this door, I think of what you did for us. Robertsons is here to stay. Thank you, kid.</p>",
      [
        ...(!a.shopCelebrated
          ? [{ label: "Let’s celebrate!", default: true, run: celebrateShop }]
          : []),
        ...shopConversationChoices(),
      ],
    );
    return;
  }
  const history = nextRobertsonHistory(s)!;
  save();
  const ready = canSaveShop(s);
  const choices = [
    ...(ready
      ? [
          {
            label: "I saved $100,000 for your store. It’s yours.",
            default: true,
            run: tellRobertsonSaved,
          },
        ]
      : []),
    ...(a.shopPlan === "told"
      ? [
          {
            label: "Here’s exactly where I am",
            default: !ready,
            run: () => {
              const progress = shopProgress(s);
              reportShopProgress(s, true);
              save();
              speak(
                "robertson",
                `<p>${money(progress.saved)} saved, and ${money(progress.remaining)} still to go. Thank you for telling me. That’s real progress, kid. Whatever happens, I’m grateful you’re fighting for us.</p>`,
                shopConversationChoices(),
              );
            },
          },
          {
            label: "I’m still working on it",
            run: () => {
              reportShopProgress(s, false);
              save();
              speak(
                "robertson",
                "<p>No need to give me every number. Knowing you’re in our corner means more than I can say. Thank you, kid.</p>",
                shopConversationChoices(),
              );
            },
          },
        ]
      : [
          {
            label: "I’m fighting to save your store",
            run: () => {
              chooseShopPlan(s, true);
              save();
              speak(
                "robertson",
                "<p>You are? For this old store? Oh, kid, thank you. I don’t know what to say. I won’t take that kindness for granted.</p>",
                shopConversationChoices(),
              );
            },
          },
          {
            label: "Keep it a surprise",
            default: !ready,
            run: () => {
              chooseShopPlan(s, false);
              save();
              dismissSpeech();
            },
          },
        ]),
    ...shopConversationChoices(),
  ];
  speak(
    "robertson",
    `<p>${history}</p>${a.shopPlan === "told" ? "<p>How’s it going, kid? How are you getting on with saving the store?</p>" : ""}`,
    choices,
  );
}
function robertson() {
  visit("Visited Ol’ Man Robertson at the store.");
  s.metRobertson = true;
  if (s.familyStory?.shopGoal) return robertsonRescue();
  const greeting = neighborLine(s, "robertson");
  save();
  speak(
    "robertson",
    `<p>${greeting}</p>` +
      (s.boughtSeeds
        ? `<p>“How’s the garden going? Those trees wither after you pick their bills. You’ll need fresh seeds.”</p><p>“I’ve no more to sell you. Go find some yourself! ${seedSearchHint(s)}”</p><p class="fine">“Fertilizer’s still $5. Take a look around.”</p>`
        : `${s.cash === 0 ? "<p>“No money with you? Head back home and check your piggy bank. You might have some saved in there.”</p>" : ""}<p>“How’s the garden going? You still looking to buy some seeds?”</p><p class="fine">Watering can $1 · Shovel $1 · Fertilizer $5</p>`),
    [
      ...(!s.boughtSeeds
        ? [{ label: "Yes, seeds please · $2", run: () => shop("seeds") }]
        : []),
      { label: "Groceries", run: () => homeShop("groceries") },
      { label: "Home Furnishings", run: () => homeShop("furnishings") },
      { label: "Look around", default: !!s.boughtSeeds, run: dismissSpeech },
      ...(!s.can && s.cash + s.bank < 100 && !s.recovered
        ? [
            {
              label: "Help sort a delivery",
              run: () => {
                recover(s);
                save();
                speak(
                  "robertson",
                  "<p>“Thanks, kid. Take this watering can, and seeds if you need them.”</p>",
                );
              },
            },
          ]
        : []),
    ],
  );
}
function gardenSupply(item: "bed" | "soil") {
  panel(
    item === "bed" ? "A new garden bed" : "Soil for a garden bed",
    `${item === "bed" ? `<img class="hat-portrait" src="${shopPortrait("garden-bed", () => cloneProductModel(world.gardenBedDisplay))}" alt="Wooden garden bed model">` : ""}<p>${item === "bed" ? "A wooden bed to carry home and place on your property. Fill it with soil before planting." : "One bag fills one empty bed. Stand near the bed and press E to add it."}</p><p>Price: ${money(item === "bed" ? 3000 : 1000)}. Pocket: ${money(s.cash)}.</p>`,
    [
      {
        label: item === "bed" ? "Buy garden bed · $30" : "Buy soil · $10",
        disabled: s.cash < purchasePrice(s, item === "bed" ? 3000 : 1000),
        run: () => {
          if (buyGardenSupply(s, item)) {
            save();
            close();
            toast(
              item === "bed"
                ? "Garden bed packed. Open your bag to place it at home."
                : "Soil packed. Press E at an empty bed to fill it.",
            );
          }
        },
      },
      { label: "Keep looking", run: close },
    ],
  );
}
let placingBed = false;
const bedGhost = new T.Mesh(
  new T.BoxGeometry(1.6, 0.18, 3.1),
  new T.MeshBasicMaterial({
    color: 0x77b67a,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  }),
);
bedGhost.visible = false;
scene.add(bedGhost);
function viewForward() {
  // Only player look input changes the control heading. Wall avoidance and
  // doorway elevation must never reverse a held movement direction.
  return new T.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
}

const bedPosition = () => {
  const direction = viewForward();
  return {
    x: Math.round((s.position.x + direction.x * 2.5) * 4) / 4,
    z: Math.round((s.position.z + direction.z * 2.5) * 4) / 4,
  };
};

const bedObstacles = () =>
  world.rects.concat(world.paths, world.doorways, [
    { x: -15, z: 6, w: 12, d: 16 },
    { x: -5, z: 10, w: 8, d: 8 },
  ]);
function debugMenu(group?: string, message = "") {
  const run = async (id: DebugAction) => {
    const next = structuredClone(s);
    applyDebugAction(next, id);
    if (!decode(JSON.stringify(next))) {
      debugMenu(
        group,
        "That change could not be saved. Your current progress is unchanged.",
      );
      return;
    }
    try {
      if (!saveStore) throw Error("Storage unavailable");
      await saveStore.debugBackup(s);
    } catch {
      debugMenu(
        group,
        "Could not preserve a pre-debug backup. Export your save before testing.",
      );
      return;
    }
    try {
      if (!(await saveStore?.write(next))) {
        debugMenu(
          group,
          "That change could not be stored. Your current progress is unchanged.",
        );
        return;
      }
    } catch {
      debugMenu(
        group,
        "Browser storage could not save that change. Your current progress is unchanged.",
      );
      return;
    }
    s = next;
    resetTransientMotion();
    sitting = false;
    world.setPlayerSeated(false);
    world.setSigmaUnlocked(!!s.foundTVSeeds);
    world.syncBeds(s.plots);
    plotVersions = new WeakMap<T.Group, string>();
    save();
    debugMenu(
      group,
      debugActions.find((a) => a.id === id)!.label + " — applied.",
    );
  };
  panel(
    group ? `Debug: ${group}` : "Debug menu",
    `<p>Testing tools change this save and save automatically. A pre-debug backup is kept in this browser.</p><p role="status">${escapeHTML(message)}</p>`,
    [
      ...(group
        ? debugActions
            .filter((a) => a.group === group)
            .map((a) => ({ label: a.label, run: () => run(a.id) }))
        : [...new Set(debugActions.map((a) => a.group))].map((name) => ({
            label: name,
            run: () => debugMenu(name),
          }))),
      { label: "Export current save", run: exportSave },
      {
        label: "Export pre-debug backup",
        run: async () => {
          const raw = await saveStore?.readDebugBackup();
          if (!raw) {
            debugMenu(group, "Use a testing tool first to create the backup.");
            return;
          }
          const url = URL.createObjectURL(
            new Blob([raw], { type: "application/json" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = "money-tree-before-debug.json";
          a.click();
          URL.revokeObjectURL(url);
        },
      },
      {
        label: group ? "Back to debug menu" : "Back to pause",
        run: () => (group ? debugMenu() : pauseMenu()),
      },
      { label: "Keep playing", run: close },
    ],
    "TESTING",
  );
}
function pauseMenu() {
  panel(
    "Take a little breather",
    `<p>Day ${s.day} · Your progress saves automatically.</p><p class="fine">WASD to walk. Click the game to capture the mouse and look around; left/right arrows turn; up/down arrows tilt the camera. Hold Shift to run. R rolls forward. Q downloads a JSON quicksave. H mounts or dismounts a bicycle; B rings its bell; F activates its special feature while riding. With Spring Hare equipped, Space jumps over beds and hedges. Escape releases the mouse. E interacts. J opens the notebook. I opens your bag.<br>Growth pauses while menus are open or the tab is hidden.</p>`,
    [
      { label: "Keep playing", run: close },
      { label: "Debug menu", run: () => debugMenu() },
      ...(s.awake
        ? [
            {
              label: "I'm stuck. Return home",
              run: () => {
                resetTransientMotion();
                sitting = false;
                world.setPlayerSeated(false);
                s.position = { x: -16, z: 4 };
                yaw = 0;
                pitch = 0.42;
                save();
                close();
                toast(
                  "Back on safe ground at home. Your money, garden, and progress are safe.",
                );
              },
            },
          ]
        : []),
      {
        label: muted ? "Sound: off" : "Sound: on",
        run: () => {
          muted = !muted;
          setBalloonMuted(muted);
          if (audio) muted ? audio.suspend() : audio.resume();
          pauseMenu();
        },
      },
      {
        label: lowQuality ? "Graphics: low" : "Graphics: standard",
        run: () => {
          lowQuality = !lowQuality;
          renderer.setPixelRatio(
            lowQuality ? 0.75 : Math.min(devicePixelRatio, 1.25),
          );
          renderer.shadowMap.enabled = !lowQuality;
          pauseMenu();
        },
      },
      {
        label: reducedMotion ? "Motion: reduced" : "Motion: standard",
        run: () => {
          reducedMotion = !reducedMotion;
          pauseMenu();
        },
      },
      {
        label: "Export save",
        run: () => {
          exportSave();
        },
      },
      {
        label: "Import save",
        destructive: true,
        run: importSave,
      },
      {
        label: "Start a new garden",
        run: () =>
          panel(
            "Start over?",
            "<p>This replaces your current save. Export it first if you want to keep it.</p>",
            [
              { label: "Keep my garden", run: pauseMenu },
              {
                label: "Start fresh",
                destructive: true,
                run: async () => {
                  action = undefined;
                  momSpoke = false;
                  world.player.userData.farewell = false;

                  const next = fresh();
                  if (!(await saveStore?.write(next, true))) return;
                  s = next;
                  resetTransientMotion();
                  sitting = false;
                  world.setPlayerSeated(false);
                  wasHome = true;
                  visitedOutside = false;
                  plotVersions = new WeakMap<T.Group, string>();
                  save();
                  close();
                },
              },
            ],
          ),
      },
    ],
    "PAUSED",
  );
}

const escapeHTML = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function grindset() {
  visit("Stopped to talk with Chad in Sigma Town.");
  save();
  const choices: Choice[] = [
    { label: "See the drinks", default: true, run: coffeeMenu },
  ];
  if (s.coin)
    choices.push({
      label: "Tell me about your trading strategy",
      run: () => tradingConversation("grindset"),
    });
  if (s.communityPlanted)
    choices.push({
      label: s.coin ? "My coin" : "Your entrepreneurial spirit?",
      run: coinMenu,
    });
  choices.push({ label: "See you around", run: dismissSpeech });
  speak(
    "grindset",
    `<p>Welcome to Grindset. What can I get you to drink?</p>${s.communityPlanted && !s.coin ? "<p>I noticed your entrepreneurial spirit in the community garden. Want to name my brand-new cryptocurrency and invest?</p>" : ""}`,
    choices,
  );
}
function coffeeMenu() {
  panel(
    "Grindset drinks",
    `<p>Pocket: ${money(s.cash)}. Each drink lasts up to 3 minutes of active play. Sleeping ends your drink effect, even if time remains. A new drink replaces the current bonus.</p>${s.drink ? `<p>Current: ${drinks.find((d) => d.id === s.drink!.id)!.name}, ${Math.ceil(s.drink.remaining)} seconds left.</p>` : ""}`,
    [
      ...drinks.map((d) => ({
        label: `${d.name} · ${money(purchasePrice(s, d.cost))} · ${d.effect}`,
        disabled: s.cash < purchasePrice(s, d.cost),
        destructive: true,
        run: () => {
          if (buyDrink(s, d.id)) {
            save();
            close();
            toast(`${d.name}: ${d.effect}`);
          }
        },
      })),
      { label: "Back", run: grindsetClose },
    ],
  );
}
function grindsetClose() {
  close();
  grindset();
}
function guruConversation() {
  const m = s.millionaire;
  if (!m?.unlocked) return;
  speak("willow-guru", "<p>Do you want a personality assessment?</p>", [
    {
      label: m.result
        ? "Retake the assessment"
        : m.answers.length
          ? "Continue the assessment"
          : "Yes, I'd like an assessment",
      run: () => {
        if (m.result) retakeAssessment(s);
        dismissSpeech();
        save();
        assessmentLanding();
      },
    },
    { label: "Maybe another time", run: dismissSpeech },
  ]);
}
function assessmentLanding() {
  panel(
    "WHICH MASCOT ARE YOU?",
    `<div class="mascot-lineup">${fellowships.map((f) => `<figure style="--mascot-color:${f.color}"><img src="${hatPortrait(f.id)}" alt="${escapeHTML(f.mascot)}"><figcaption>${escapeHTML(f.mascot)}</figcaption></figure>`).join("")}</div><p class="quiz-intro">Your money habits. Your hopes. Your very own spiritual mascot.</p>`,
    [
      { label: "Enter test", run: assessmentQuestion },
      { label: "Take a break", run: close },
    ],
  );
  styleAssessment(true);
}
function styleAssessment(landing = false) {
  const paper = document.querySelector("#modal .panel")!;
  paper.classList.add("mascot-quiz");
  paper.classList.toggle("quiz-landing", landing);
  paper.querySelector("h2")!.innerHTML = "WHICH <span>MASCOT</span> ARE YOU?";
  paper
    .querySelector(".choices button:last-child")!
    .classList.add("quiz-break");
}
function assessmentQuestion() {
  const m = s.millionaire!;
  if (m.answers.length === assessment.length) {
    close();
    world.millionaire.update(s, 0);
    world.millionaire.approachPlayer(m.result!);
    toast("Your mascot is coming over to meet you.");
    return;
  }
  const question = assessment[m.answers.length];
  panel(
    "WHICH MASCOT ARE YOU?",
    `<p class="fine">Question ${m.answers.length + 1} of ${assessment.length}</p><p>${escapeHTML(question[0])}</p>`,
    [
      ...shuffledAnswers(
        question.slice(1).map((label, index) => ({ label, index })),
      ).map(({ label, index }) => ({
        label,
        run: () => {
          answerAssessment(s, index);
          save();
          assessmentQuestion();
        },
      })),
      { label: "Take a break", run: close },
    ],
  );
  styleAssessment();
}
function fellowshipConversation(
  id: Fellowship,
  introduction = false,
  skipHousing = false,
): void {
  if (
    churchGreeting(`fellowship-${id}`, () =>
      fellowshipConversation(id, introduction),
    )
  )
    return;
  const m = s.millionaire;
  if (!m?.unlocked) return;
  if (!skipHousing && m.member === id && childrenHomesBuilt())
    return mansionOffer(`fellowship-${id}`, () =>
      fellowshipConversation(id, introduction, true),
    );
  const f = fellowship(id);
  const host =
    world.millionaire.hosts[fellowships.findIndex((f) => f.id === id)];
  if (m.member === id && m.titheAccepted && host.position.z < -330)
    return religionConversation(id, `fellowship-${id}`, "escort", skipHousing);
  if (m.result !== id)
    return speak(
      `fellowship-${id}`,
      `<p>If your feelings change, we would be happy to have you join ${escapeHTML(f.name)}. ${escapeHTML(f.invitation)} You can retake the guru’s assessment whenever you like.</p>`,
      [{ label: "Thank you", run: dismissSpeech }],
    );
  speak(
    `fellowship-${id}`,
    `<p>Welcome to ${escapeHTML(f.name)}! ${escapeHTML(f.invitation)} Follow me up Mount Millionaire!</p>`,
    [
      {
        label: m.member === id ? "Lead the way" : "I'd like to join",
        run: () => {
          const before = s.seeds;
          joinFellowship(s, id);
          world.millionaire.update(s, 0);
          world.syncBeds(s.plots);
          syncTimers();
          if (s.seeds > before) {
            world.sigma.handSeeds(
              `fellowship-${id}`,
              s.position.x,
              s.position.z,
              terrainHeight(s.position.x, s.position.z) + 1.1,
            );
            toast(
              `${f.mascot} is delighted! A membership card for ${f.name} and one packet of seeds. Welcome!`,
            );
          }
          world.millionaire.followGuide();
          save();
          dismissSpeech();
        },
      },
      {
        label: "I'll think about it",
        run: dismissSpeech,
      },
    ],
  );
}
function religionConversation(
  id: Fellowship,
  speaker: string,
  key: string,
  skipHousing = false,
): void {
  if (churchGreeting(speaker, () => religionConversation(id, speaker, key)))
    return;
  if (!skipHousing && childrenHomesBuilt())
    return mansionOffer(speaker, () =>
      religionConversation(id, speaker, key, true),
    );
  const m = s.millionaire!;
  const chat = `lesson-${key}`,
    count = m.chats[chat] ?? 0;
  m.chats[chat] = count + 1;
  save();
  speak(
    speaker,
    `<p>${escapeHTML(terraceLine(id, count, true))}</p><p class="fine">One hundred terrace sites. Plant, sleep, harvest. Automatically watered; apply fertilizer yourself for a larger harvest.</p>`,
    [
      { label: "Thank you", default: true, run: dismissSpeech },
      {
        label: "Tell me more",
        run: () => religionConversation(id, speaker, key),
      },
    ],
  );
}
function summitDialogue(step = 0) {
  const m = s.millionaire;
  if (!m?.member) return;
  if (!m.chats["visited-summit"]) {
    m.chats["visited-summit"] = 1;
    save();
    toast(
      "Terrace Threads is now open at the mountain foot, with advanced hats, a seed ATM and a composter.",
    );
  }
  if (m.titheAccepted)
    return religionConversation(m.member, "millionaire-summit", "summit");
  const chapters = summitConversation(m.member),
    chapter = chapters[step];
  speak("millionaire-summit", `<p>${escapeHTML(chapter[0])}</p>`, [
    {
      label: chapter[1],
      run: () => {
        if (step < chapters.length - 1) return summitDialogue(step + 1);
        if (acceptTithe(s)) {
          world.sigma.handSeeds(
            "millionaire-summit",
            s.position.x,
            s.position.z,
            terrainHeight(s.position.x, s.position.z) + 1.1,
          );
          save();
          toast(
            "25 seed packets received. New earnings now contribute 10% to your community.",
          );
        }
        dismissSpeech();
      },
    },
  ]);
}
function childConversation(index: number): void {
  if (
    churchGreeting(`millionaire-child-${index}`, () => childConversation(index))
  )
    return;
  const m = s.millionaire;
  if (!m?.member || !Number.isInteger(index) || index < 0 || index > 5) return;
  const key = `child-${index}`,
    count = m.chats[key] ?? 0;
  m.chats[key] = count + 1;
  save();
  const id = `millionaire-child-${index}`;
  if (index >= mansionCount(m))
    return speak(
      id,
      `<p>${escapeHTML(terraceLine(m.member, count + index * 2, !!m.titheAccepted))}</p>`,
      [{ label: "It's good to meet you", run: dismissSpeech }],
    );
  const visits = m.chats["mansion-visits"] ?? 0;
  m.chats["mansion-visits"] = visits + 1;
  const houseVisits = m.chats[`mansion-${index}`] ?? 0;
  m.chats[`mansion-${index}`] = houseVisits + 1;
  s.events.push(
    `A Child at a mansion offered me ${appNames[index]}, a phone app costing $5. The house was enormous compared with ours.`,
  );
  if (houseVisits === 1)
    s.events.push(
      "I looked inside one of the mansions, and it was just totally empty. The Child was sitting in the middle of an empty room, all alone. How sad.",
    );
  save();
  speak(id, `<p>${escapeHTML(mansionLine(m.member, visits))}</p>`, [
    {
      label: m.apps.includes(index)
        ? `Open ${appNames[index]}`
        : `Buy ${appNames[index]} for $5`,
      disabled: !m.apps.includes(index) && s.cash < 500,
      destructive: !m.apps.includes(index),
      run: () => {
        if (m.apps.includes(index) || buyApp(s, index)) {
          save();
          phoneGame(index);
        }
      },
    },
    {
      label: "No thanks",
      run: () => {
        s.events.push(
          "Five dollars is kind of a lot for an app. That could buy a whole box of fertilizer.",
        );
        save();
        dismissSpeech();
      },
    },
  ]);
}
function phoneLibrary() {
  const m = s.millionaire;
  if (!m?.member) return;
  const f = fellowship(m.member);
  panel(
    "Membership card",
    `<div class="membership-card" style="border-color:${f.color}"><small>MT. MILLIONAIRE</small><h3>${escapeHTML(f.name)}</h3><p>Welcome, member</p></div><p>${m.apps.length ? "Choose a phone app." : "The mansion owners sell phone apps. Each one costs $5; scoring ten points earns $1."}</p><p class="fine">Community contributions: ${money(m.tithed)}</p>`,
    [
      ...m.apps.map((index) => ({
        label: appNames[index],
        run: () => phoneGame(index),
      })),
      { label: "Close", run: close },
    ],
  );
}
function phoneGame(index: number) {
  s.events.push(
    `I played ${appNames[index]}, a little ${["snake", "pong", "frogger", "brick-breaking", "memory-matching", "falling-object catching"][index]} game on the Child’s phone app.`,
  );
  save();
  phoneCleanup?.();
  phoneCleanup = undefined;
  panel(appNames[index], '<div id="phone-game"></div>', [
    { label: "Put phone away", run: close },
  ]);
  $("#modal .panel").classList.add("phone-panel");
  phoneCleanup = mountPhoneGame($("#phone-game"), s, index, () => {
    save();
    updateUI();
  });
}
function syncTimers() {
  while (timers.length < s.plots.length) {
    const el = document.createElement("div");
    el.className = "tree-timer";
    timerLayer.append(el);
    timers.push(el);
  }
}

let coinRange: "current" | "day" | "three" = "current";
function coinMenu() {
  if (!s.communityPlanted) return;
  if (!s.coin) {
    panel(
      "Name your coin",
      `<p>Chad calls it entrepreneurial spirit. You still get to choose the name.</p><label>Coin name <input id="coin-name" maxlength="24" autocomplete="off" placeholder="Up to 24 characters"></label><p id="coin-error" role="status"></p>`,
      [
        {
          label: "Name it",
          run: () => {
            const name = ($("#coin-name") as HTMLInputElement).value;
            if (!createCoin(s, name)) {
              $("#coin-error").textContent =
                "Start with a letter or number. Use up to 24 letters, numbers, spaces, periods, apostrophes or hyphens.";
              return;
            }
            save();
            coinMenu();
          },
        },
        { label: "Maybe later", run: close },
      ],
    );
    ($("#coin-name") as HTMLInputElement).focus();
    return;
  }
  const c = s.coin,
    q = marketSignals(s);
  panel(
    `${escapeHTML(c.name)} coin`,
    `<label>Price history <select id="coin-range"><option value="current" ${coinRange === "current" ? "selected" : ""}>Current view</option><option value="day" ${coinRange === "day" ? "selected" : ""}>Last day</option><option value="three" ${coinRange === "three" ? "selected" : ""}>Last three days</option></select></label>${coinChart(rangePrices(s, coinRange), c.price, coinRange === "current" ? undefined : `${coinRange === "day" ? "Last day" : "Last three days"} · recorded game prices`)}<div class="coin-balances"><p>Price <strong>${money(c.price)}</strong> per coin</p><p>You own ${(c.units / 1e6).toFixed(4)} coins, worth <strong>${money(coinValue(s))}</strong></p><p>Pocket <strong>${money(s.cash)}</strong> · Total invested ${money(c.invested)}</p></div><label>Buy amount $ <input id="coin-amount" inputmode="decimal" value="1.00"></label><label>Sell amount $ <input id="coin-sell-amount" inputmode="decimal" value="1.00"></label><p id="coin-error" role="status"></p><details><summary>What moves the price?</summary><p>Prices move every 15 seconds of game time. Random swings mix with earnings, savings, conversations, trees, Mom’s good days, active community beds, birdhouses, seed discoveries, bicycles owned and garden tools, and whether you have talked with Mom in the last two days, spanakopita and time since the last chicken cuddle. Chicken cuddles have a small influence. Chad trades move prices, sharp falls attract recovery toward a game-activity valuation, and meteors cause brief selloffs, with occasional bigger crashes. The Chads target average growth of 2% per game day. Negative factors are ignored below $1 and for three minutes of game time after a crash. Prices can spike or fall.</p><p>${money(q.earned)} earned · ${money(q.saved)} saved · ${q.neighbors} neighbors met · ${q.trees} growing trees · Mom has a ${q.health ? "good" : "tired"} day · longest good streak ${q.longestGoodStreak}.</p><p>${q.communityBeds} active community beds · ${q.birdhouses} birdhouses · ${q.discoveries} seed discoveries · ${q.bicycles} bicycles owned · ${q.tools} garden tools · Talked to Mom recently: ${q.momRecent ? "yes" : "no"} · ${q.spanakopita} spanakopita in your bag · ${q.spanakopitaShared} shared with Mom · ${q.chickenCuddles} chicken cuddles.</p></details>`,
    [
      {
        label: "Sell this amount",
        destructive: true,
        disabled: !c.units,
        run: () => {
          const amount = parseAmount(
            ($("#coin-sell-amount") as HTMLInputElement).value,
          );
          if (amount === null || !sellCoin(s, amount)) {
            $("#coin-error").textContent =
              "Enter an amount within your coin holding.";
            return;
          }
          save();
          coinMenu();
        },
      },
      {
        label: "Invest this amount",
        destructive: true,
        run: () => {
          const amount = parseAmount(
            ($("#coin-amount") as HTMLInputElement).value,
          );
          if (amount === null || !investCoin(s, amount)) {
            $("#coin-error").textContent =
              "Enter an amount you have in your pocket.";
            return;
          }
          save();
          coinMenu();
        },
      },
      {
        label: "Sell all my coins",
        disabled: !c.units,
        destructive: true,
        run: () => {
          if (sellCoin(s)) {
            save();
            coinMenu();
          }
        },
      },
      { label: "Leave", run: close },
    ],
  );
  $("#modal .panel").classList.add("coin-panel");
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("#modal button"),
  );
  for (const button of buttons) {
    if (button.textContent?.includes("Invest this amount")) {
      button.classList.add("coin-buy");
      button.textContent = "Buy";
      setAttr(button, "aria-label", "Buy");
      button.parentElement!.prepend(button);
    }
    if (button.textContent?.includes("Sell this amount")) {
      button.classList.add("coin-sell");
      button.textContent = "Sell";
      setAttr(button, "aria-label", "Sell");
    }
  }
  $("#coin-range").addEventListener("change", (e) => {
    coinRange = (e.target as HTMLSelectElement).value as typeof coinRange;
    coinMenu();
  });
}
const coinTracker = document.createElement("aside");
coinTracker.id = "coin-tracker";
setHidden(coinTracker, true);
const topRightHud = document.createElement("div");
topRightHud.id = "top-right-hud";
const bankHudStack = document.createElement("div");
bankHudStack.id = "bank-hud-stack";
bankHudStack.append(cashHud, bankHud);
topRightHud.append($("header"), $("#quest"), coinTracker, bankHudStack);
document.body.append(topRightHud);
function setHidden(element: HTMLElement, hidden: boolean) {
  if (element.hidden !== hidden) element.hidden = hidden;
}
function setAttr(element: Element, name: string, value: string) {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}
function setCss(style: CSSStyleDeclaration, property: string, value: string) {
  // CSSStyleDeclaration uses kebab-case names, including max-height.
  if (/^-?\d+\.\d+(px|%)$/.test(value))
    value = value.replace(/^-?\d+\.\d+/, (n) => Number(n).toFixed(2));
  const name = property.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  if (style.getPropertyValue(name) !== value) style.setProperty(name, value);
}
new ResizeObserver(() =>
  setCss(
    document.documentElement.style,
    "--resource-height",
    `${resourceHud.offsetHeight}px`,
  ),
).observe(resourceHud);
const hudMarkup = new WeakMap<HTMLElement, string>();
function setText(element: Node, text: string) {
  if (element.textContent !== text) element.textContent = text;
}
function setHudHTML(element: HTMLElement, html: string) {
  if (hudMarkup.get(element) === html) return;
  element.innerHTML = html;
  hudMarkup.set(element, html);
}

function updateCoinTracker() {
  setHidden(coinTracker, !begun || !s.coin);
  if (!s.coin) return;
  const c = s.coin,
    old = c.history.at(-2) ?? c.price,
    trend = c.price > old ? "▲" : c.price < old ? "▼" : "•";
  setHudHTML(
    coinTracker,
    `<strong>${escapeHTML(c.name)}</strong><br>${trend} ${money(c.price)} / coin<br>Holding ${money(coinValue(s))}`,
  );
  setAttr(
    coinTracker,
    "title",
    "An in-game coin. Use the ATM beside Grindset to buy or sell.",
  );
}

function sitWithStacy() {
  sitting = true;
  sittingWithStacy = true;
  s.position = { x: -18, z: -79.5 };
  world.setPlayerSeated(true);
  world.player.rotation.y = Math.PI;
}
function leaveStacy() {
  dismissSpeech();
  if (sittingWithStacy) standUp();
}
function stacyChapter(count: number) {
  const chapter = stacyStory[count];
  s.stacyConversations = count + 1;
  visit(`Asked Stacy: ${chapter.question}`);
  save();
  speak("stacy", `<p>${escapeHTML(chapter.answer)}</p>`, [
    {
      label:
        count === 9
          ? "Thanks for sharing that with me"
          : stacyStory[count + 1].question,
      run: () => (count === 9 ? stacyConversation() : stacyChapter(count + 1)),
    },
    { label: "I’ll come back and hear the rest", run: leaveStacy },
  ]);
}
function stacyConversation() {
  s.metStacy = true;
  save();
  const count = s.stacyConversations ?? 0;
  if (count >= 10) {
    if (s.foundStacySeeds)
      return speak(
        "stacy",
        "<p>Good to see you, honey. I hope your mom’s havin’ a gentler day.</p>",
        [{ label: "Thanks, Stacy", run: leaveStacy }],
      );
    return speak(
      "stacy",
      "<p>Thanks for bein’ such a good conversationalist, honey. Say, do you do tree?</p>",
      [
        {
          label: "What do you mean, do tree?",
          run: () => {
            if (!s.foundStacySeeds) {
              s.foundStacySeeds = true;
              s.seeds += 5;
              visit(
                "Stacy thanked me for listening to her story and gave me five money seeds.",
              );
              world.sigma.handSeeds(
                "stacy",
                s.position.x,
                s.position.z,
                sittingWithStacy ? 1.5 : 1.1,
              );
              save();
            }
            speak(
              "stacy",
              `<p>You know. They say it makes ${escapeHTML(s.coin?.name ?? "your coin")} go up and to the right.</p>`,
              [{ label: "Thanks for telling me your story", run: leaveStacy }],
            );
          },
        },
      ],
    );
  }
  speak(
    "stacy",
    count === 0
      ? "<p>Hey, darlin’. I’m Stacy around here. Pull up that chair. There’s more to a person than one little joke.</p><p class='fine'>Stacy is a fictional parody. Her dialogue is imagined.</p>"
      : "<p>Pull up your chair again, honey.</p>",
    [
      {
        label: stacyStory[count].question,
        run: () => {
          sitWithStacy();
          stacyChapter(count);
        },
      },
      { label: "Maybe another time", run: leaveStacy },
    ],
  );
}
let pepeGreeted = false,
  pepeViewHold = 0,
  pepeReturning = false;
function pepeConversation(step = 0) {
  const lines = [
    "Is inflation in our world a good thing or not a good thing?",
    "Inflation. Would you say that’s a good thing, or not a good thing?",
    "Okay, okay. What kind of fun are we going to have today?",
    "Abracadabra, one, two three... now it’s time to see what we see!",
  ];
  const replies = [
    "...",
    "Um... I guess it depends? I’m not sure...",
    "Lots of fun?",
    "Let’s see!",
  ];
  speak("pepe-show", `<p>“${lines[step]}”</p>`, [
    {
      label: replies[step],
      run: () => {
        if (step < 3) pepeConversation(step + 1);
        else {
          dismissSpeech();
          enableBalloonAudio();
          if (startPepeShow(s)) save();
        }
      },
    },
  ]);
}
let meditationTime = 0,
  dogeGreeted = false;
const meditationChants = [
  "Om. Compound calmly.",
  "Breathe in. Grind out.",
  "May all beings find peace. And passive income.",
  "No thoughts. Only long-term holdings.",
  "Om. The lone wolf has diversified.",
  "Let go of attachment. Keep the receipts.",
];
function offerMeditation() {
  speak("doge-meditator-0", "<p>Shh. Sit down and join the meditation.</p>", [
    {
      label: "Sit down",
      run: () => {
        dismissSpeech();
        sitting = true;
        world.setPlayerSeated(true);
        s.position = { x: -18, z: -47 };
        meditationTime = 30;
        toast(meditationChants[0]);
      },
    },
    { label: "Maybe later", run: dismissSpeech },
  ]);
}
function finishMeditation() {
  sitting = false;
  world.setPlayerSeated(false);
  s.position = { x: -18, z: -45.7 };
  world.sigma.handSeeds("doge-meditator-0", s.position.x, s.position.z);
  const meditationFee = completeMeditation(s);
  if (meditationFee === undefined) return;
  visit(
    `Joined the Chads for thirty seconds of meditation in Doge. They accepted $${(meditationFee / 100).toFixed(2)} and gave me five money seeds.`,
  );
  save();
  speak(
    "doge-meditator-0",
    `<p>${meditationFee === 300 ? "That’s $3 for the meditation." : "Don’t worry about the fee. Everyone is welcome."} You did a great job. I found this crazy new drug. You’ve got to try it.</p>`,
    [
      {
        label: "Have you really been snorting this shit?",
        run: () =>
          speak(
            "doge-meditator-0",
            `<p>For sure, man. Since I started snorting it, ${escapeHTML(s.coin?.name ?? "my coin")} has been all up and to the right.</p>`,
            [{ label: "Well thanks man", run: dismissSpeech }],
          ),
      },
    ],
  );
}
function tvMenu() {
  const news = newsFeed.read(s);
  panel(
    "What’s on TV?",
    `<p>Current channel: ${s.tvChannel === "news" ? "Town News" : "Bunny cartoons"}.</p><p>Town News reports on the last three days.</p>${s.tvChannel === "news" ? news.map((n) => `<p><strong>Day ${n.day}: ${n.headline}</strong><br>${n.report}</p>`).join("") : ""}`,
    [
      {
        label: "Watch Town News",
        run: () => {
          s.tvChannel = "news";
          save();
          close();
        },
      },
      {
        label: "Watch bunny cartoons",
        run: () => {
          s.tvChannel = "cartoons";
          save();
          close();
        },
      },
      { label: "Leave TV", run: close },
    ],
  );
}

function wackyConversation() {
  if (!s.pepePopped) return;
  const line = world.sigma.wacky.interact(s.position.x, s.position.z);
  speak("mr-wacky", `<p>“${line}”</p>`, [
    { label: "Again!", run: wackyConversation },
    { label: "See you, Mr Wacky", run: dismissSpeech, default: true },
  ]);
}
function interact(skipTrader = false): void {
  if (isNight(s) && s.awake && !nightShelterAt(s.position.x, s.position.z)) {
    toast(
      "Go indoors to talk, rest or arrange furniture. V or click throws a $1 bill outside.",
    );
    return;
  }
  if (world.life.cuddling !== undefined) {
    world.life.putDown();
    return;
  }
  if (cookingScene) return;
  if (
    (kitchenPrepared || s.pendingMeal) &&
    Math.hypot(s.position.x + 12.5, s.position.z - 11.2) < 2
  )
    return beginCooking();
  if (
    !riding &&
    parkedBike?.visible &&
    !atBikeRack() &&
    Math.hypot(
      parkedBike.position.x - s.position.x,
      parkedBike.position.z - s.position.z,
    ) < 2
  )
    return mountBike();
  if (world.life.busy || featherHandoff) return;
  if (birdhouseScene || celebration || hatHanging || estateFilm) return;
  if (!begun || paused || action || meditationTime > 0) return;
  if (!s.awake) {
    s.awake = true;
    s.position = { x: -16, z: 4 };
    save();
    toast("Take a look around your room. Your notebook is open on the desk.");
    return;
  }
  if (sitting) {
    standUp();
    return;
  }
  near = selectTarget();
  if (!near && !riding && s.millionaire?.titheAccepted && s.seeds) {
    const direction = viewForward();
    const x = s.position.x + direction.x * 1.4,
      z = s.position.z + direction.z * 1.4;
    if (!blocked(x, z, world.rects, 0.8) && addMountainPlot(s, x, z)) {
      world.syncBeds(s.plots);
      syncTimers();
      near = world.targets.at(-1);
      save();
    }
  }
  if (!near) return;
  const id = near.id;
  if (isNight(s) && world.speakers.some((n) => n.id === id)) {
    return speak(id, `<p>${escapeHTML(nightDialogue(id))}</p>`, [
      { label: "Stay safe", run: dismissSpeech },
    ]);
  }
  if (id === "mountain-seed-atm") return seedATM();
  if (s.coin && !skipTrader) {
    const ids = world.speakers
      .filter((n) => n.object.userData.chad)
      .map((n) => n.id);
    registerTraders(s, ids);
    if (ids.includes(id) && !["grindset", "gigachad", "soyjak"].includes(id)) {
      save();
      return tradingConversation(id);
    }
  }

  if (
    id.startsWith("plot") &&
    s.plots[+id.slice(4)]?.mountain &&
    !s.millionaire?.titheAccepted
  )
    return toast(
      "Talk to the Community Guardian in the pagoda before planting here.",
    );
  if (pickUpSeedPacket(id)) return;
  if (id === "mansion-marvels") return mansionShop();
  if (id === "player-mansion") {
    if (s.housing?.status !== "owned")
      return toast("The house is locked. Nobody lives there now.");
    return panel(
      "My mansion",
      "<p>Press F5 to open the furniture editor and arrange your furnishings. Your little house is still home to Mom, the chickens, and the birdhouses.</p>",
      [
        { label: "Open my Bag", run: bag },
        { label: "Back", run: close },
      ],
    );
  }
  if (id === "willow-guru") return guruConversation();
  if (id.startsWith("fellowship-"))
    return fellowshipConversation(id.slice(11) as Fellowship);
  if (id === "millionaire-summit") return summitDialogue();
  if (id.startsWith("millionaire-child-"))
    return childConversation(Number(id.slice(18)));

  if (
    riding &&
    id.startsWith("plot") &&
    (["empty", "harvested", "growing"].includes(s.plots[+id.slice(4)].stage) ||
      s.plots[+id.slice(4)].soilFilled === false)
  )
    return toast(
      "Press H to get off your bike before working in a garden bed.",
    );
  if (
    riding &&
    ["couch", "hat-rack", "bed", "garden-bed", "garden-soil"].includes(id)
  )
    return toast("Press H to get off your bike first.");
  if (id === "bea-chair") {
    if (s.familyStory?.escort) return beaTea();
    return speak(
      "npc1",
      `<p>${isNight(s) ? nightDialogue("npc1") : "Come sit down, dear. I have a cup of tea for you."}</p>`,
      [
        {
          label: "Sit for tea",
          run: () => {
            teaSeated = sitting = true;
            s.position = { x: 12, z: 16.9 };
            world.setPlayerSeated(true);
            seatForTea(world.player, true);
            world.player.rotation.y = Math.PI;
            dismissSpeech();
          },
        },
        { label: "Maybe later", run: dismissSpeech },
      ],
    );
  }
  if (id === "npc1" && s.familyStory?.escort && inBeaHouse(s.position))
    return speak(
      "npc1",
      "<p>Welcome, both of you! Come sit down at my table. I will pour the tea.</p>",
      [{ label: "Sit down with Mom", run: () => beaTea() }],
    );
  if (id === "npc1" && s.familyStory?.escort)
    return speak(
      "npc1",
      "<p>Oh, how wonderful to see you both! You’re looking brighter, dear. Come along, let’s go inside for tea.</p>",
      [{ label: "Lead us in", run: guideIntoBea }],
    );
  if (id === "robertsons-home") return homeShop("furnishings");
  if (id === "robertsons-groceries") return homeShop("groceries");
  if (id === "bike-rack") return bikeRackMenu();
  if (id.startsWith("bike-")) return showBike(id.slice(5) as BikeId);
  if (id === "bicycle") {
    const line = neighborLine(s, "bicycle");
    save();
    return speak(
      "bicycle",
      `<p>${line}</p><p>“Seven bikes to try. Take a look around! H to ride once you own one, B for your bell.”</p>`,
      [{ label: "I’ll have a look", run: dismissSpeech }],
    );
  }
  if (id === "couch") {
    sitting = true;
    couchZoom = zoomDistance;
    zoomDistance = followDistance = 0;
    yaw = Math.atan2(-18.9 + 10.16, 11.15 - 10);
    pitch = 0.513;
    camera.position.set(-18.9, 2.39, 11.15);
    cameraAim.set(-10.16, 1.65, 10);
    cameraTilted = true;
    jumpHeight = jumpVelocity = 0;
    s.position = { x: -18.9, z: 11.15 };
    world.setPlayerSeated(true);
    visit(
      momStatus(s.day, s.familyStory).activity === "resting" ||
        momStatus(s.day, s.familyStory).activity === "reading"
        ? "Sat beside Mom on the couch."
        : "Sat on the couch for a while.",
    );
    if (
      momStatus(s.day, s.familyStory).activity === "resting" ||
      momStatus(s.day, s.familyStory).activity === "reading"
    ) {
      thought.textContent = chooseMomThought(s, "sitting");
      setHidden(thought, false);
      thoughtTime = 9;
    }
    toast("E to stand up. T to change the TV channel.");
    save();
    return;
  }
  if (id.startsWith("chicken-")) {
    dismountBike();
    keys.clear();
    const i = Number(id.slice(8));
    if (i === 5) {
      if (world.life.tossBerry()) {
        roosterGreeting();
        visit("Tossed Fancy Chicken a berry. He pecked it up with a buh-dup.");
        save();
        toast("Fancy Chicken: buh-dup!");
      }
      return;
    }
    if (world.life.cuddle(i)) {
      noteChickenCuddle(s, world.life.chickens[i].name);
      visit(`Cuddled ${world.life.chickens[i].name} the chicken.`);
      save();
      toast(`A warm cuddle with ${world.life.chickens[i].name}.`);
    }
    return;
  }
  if (id === "mom-chair") {
    sitting = true;
    s.position = { x: -6.6, z: 10.2 };
    world.setPlayerSeated(true);
    world.player.rotation.y = Math.PI / 2;
    keys.clear();
    save();
    toast(
      !momAway(s) && momStatus(s.day, s.familyStory).activity === "bedrest"
        ? "A quiet moment nearby Mom. Press E to stand up."
        : "A quiet moment. Press E to stand up.",
    );
    return;
  }
  if (id === "composter" || id === "mountain-composter")
    return panel(
      "Community compost",
      `<p>You have ${s.compostScraps ?? 0} scraps. Replanting dead money trees adds 1 to 3 scraps. Trade 25 scraps for one fertilizer dose.</p>`,
      [
        {
          label: `Trade all scraps for ${Math.floor((s.compostScraps ?? 0) / 25)} fertilizer doses`,
          default: true,
          disabled: (s.compostScraps ?? 0) < 25,
          run: () => {
            const bags = Math.floor((s.compostScraps ?? 0) / 25);
            if (compostFertilizer(s, true)) {
              save();
              close();
              toast(`${bags} fertilizer doses from our community compost.`);
            }
          },
        },
        {
          label: "Trade 25 scraps for fertilizer",
          disabled: (s.compostScraps ?? 0) < 25,
          run: () => {
            if (compostFertilizer(s)) {
              save();
              close();
              toast("One fertilizer dose from our community compost.");
            }
          },
        },
        { label: "Leave", run: close },
      ],
    );
  if (id === "soyjak")
    return speak(
      "soyjak",
      "<p>Hey, fellow soy boy!</p><p>Don’t believe the haters. Scientists say there’s no evidence for the claim that soy disrupts hormones.</p><p>You want some delicious soy food?</p><p>Each effect lasts 120 seconds of active play. Buying again refreshes that effect; sleeping ends both.</p>",
      [
        ...soyProducts.map((product) => ({
          label: `${product.name} · ${money(purchasePrice(s, product.cost))} · ${product.effect}`,
          disabled: s.cash < purchasePrice(s, product.cost),
          run: () => {
            if (buySoy(s, product.id)) {
              save();
              dismissSpeech();
              toast(product.effect);
            }
          },
        })),
        { label: "Maybe later", run: dismissSpeech },
      ],
    );
  if (id === "gigachad") return foodOfTheGods();
  if (id === "wolf") {
    if (s.cash < 100)
      return toast("The wolf wants $1. It offers no guarantees.");
    s.cash -= 100;
    visit("Threw $1.00 to the lone wolf statue. Nothing happened.");
    save();
    toast("The dollar drops in. Nothing happens.");
    return;
  }
  if (id === "meditate" || id.startsWith("doge-meditator-")) {
    if (s.foundMeditationSeeds)
      return speak(
        "doge-meditator-0",
        "<p>“Quiet gains, brother. Quiet gains.”</p>",
        [{ label: "I’ll leave you to it", run: dismissSpeech }],
      );
    return offerMeditation();
  }
  if (id === "pepe-door")
    return toast(
      canEnterPepe(s)
        ? "Pepe’s door is open."
        : "Meet Stacy and finish the Doge meditation to enter Pepe.",
    );
  if (id === "mr-wacky") return wackyConversation();
  if (id === "pepe-show") {
    if (!canEnterPepe(s) && !s.pepePopped) return;
    if (s.pepePopped)
      return speak(
        "pepe-show",
        "<p>So, what do you think? Inflation, a good thing? Or not?</p>",
        [
          {
            label: "I’m still thinking about it",
            run: dismissSpeech,
            default: true,
          },
        ],
      );
    if (s.pepeShowStarted)
      return toast(
        s.pepePopped
          ? "Seed packets are scattered all around Sigma Town!"
          : "That balloon is still getting bigger...",
      );
    return pepeConversation();
  }
  if (id === "stacy") return stacyConversation();
  if (id === "stacy-chair") return stacyConversation();
  if (id === "coin-atm") return coinMenu();
  if (id === "grindset") return grindset();
  if (id.startsWith("sigma-chad-")) {
    visit("Stopped to talk with Chad in Sigma Town.");
    const line = chadLine(s, id);
    visit(`Heard Chad: ${line}`);
    save();
    return speak(id, `<p>${line}</p>`, [
      { label: "See you around", run: dismissSpeech },
    ]);
  }
  if (id === "tv") return tvMenu();
  if (id === "notebook") return notebook();
  if (id === "hat-rack" || id === "mountain-hat-rack") {
    hatRack();
    return;
  }
  if (id === "bank") return bank();
  if (id === "robertson") return robertson();
  if (id === "garden-bed") return gardenSupply("bed");
  if (id === "garden-soil") return gardenSupply("soil");
  if (["can", "shovel", "fertilizer"].includes(id))
    return shop(id as "can" | "shovel" | "fertilizer");
  if (id === "bed")
    if (!isNight(s) && momAway(s) && !s.familyStory?.called)
      return panel(
        "Waiting for Mom",
        "<p>I want to hear how Mom’s surgery went before I go to sleep. I can keep doing my usual jobs while I wait for her call.</p>",
        [{ label: "Stay up and wait", run: close }],
      );
  if (id === "bed")
    return panel(
      "Tomorrow is another chance",
      `<p>End the day, write in your notebook, and wake up to a fresh morning. Watered trees will finish growing overnight.</p>${s.drink ? `<p><strong>Sleeping will cancel your ${drinks.find((d) => d.id === s.drink!.id)!.name} effect.</strong> You still have ${Math.ceil(s.drink.remaining)} seconds left.</p>` : ""}`,
      [
        {
          label: s.drink
            ? "Sleep and cancel drink effect"
            : "Sleep until tomorrow",
          destructive: !!s.drink,
          run: () => {
            const completedDay = s.day;
            if (!sleep(s, isNight(s))) return;
            visitedOutside = false;
            wasHome = true;
            momSpoke = false;
            s.position = { x: -16, z: 4 };
            save();
            close();
            toast(
              `Good morning. Day ${s.day} begins. My notebook has a new page.`,
            );
            if (completedDay % 3 === 0 && s.exportReminderDay !== s.day) {
              s.exportReminderDay = s.day;
              save();
              panel(
                "Keep a copy of your garden",
                "<p>Three days have passed. Would you like to download a JSON backup? Your game also saves automatically in this browser.</p>",
                [
                  {
                    label: "Download game state",
                    run: () => {
                      exportSave();
                      close();
                    },
                  },
                  { label: "Maybe later", run: close },
                ],
              );
            }
          },
        },
        { label: "Stay up a little longer", run: close },
      ],
      "YOUR BED",
    );
  if (id === "mom") {
    s.momLastTalkDay = s.day;
    momSpoke = true;
    if (s.familyStory || canTellMom(s)) return askMom();
    const metBefore = s.metMom;
    s.metMom = true;
    if (
      metBefore ||
      ["bedrest", "bacon"].includes(momStatus(s.day, s.familyStory).activity)
    )
      return askMom();
    visit("Talked with Mom before heading out.");
    const greeting = momGreeting();
    visit(`Heard Mom: ${greeting}`);
    save();
    return speak("mom", `<p>${greeting}</p>`, [
      { label: "How are you doing?", run: askMom },
      ...(s.spanakopita
        ? [{ label: "Share spanakopita with Mom", run: shareWithMom }]
        : []),
      {
        label: playerMomResponse(
          greeting,
          momStatus(s.day, s.familyStory).energetic,
        ),
        run: dismissSpeech,
      },
    ]);
  }
  const dialogue: Record<string, [string, string]> = {
    npc1: ["Bea", "“I talk to my flowers. They’re very good listeners.”"],
    npc2: [
      "Jun",
      "“Robertson knows more than he lets on. Especially about gardens.”",
    ],
    npc3: [
      "Mabel",
      "“Funny rustling in the wind last night. Sounded like paper.”",
    ],
    haberdashery: [
      "Thread & Thimble",
      s.foundCapSeeds
        ? "“Try the hats on the stands! Each has a little talent of its own.”"
        : "“Try the hats on the stands! Each has a little talent of its own. The green cap has a curious brim…”",
    ],
    bicycle: [
      "Spoke & Saddle",
      "“A good bike makes a small town feel big. We’ll have something for you soon.”",
    ],
  };
  if (dialogue[id]) {
    visit(`Stopped to talk with ${dialogue[id][0]}.`);
    const line = neighborLine(s, id) || dialogue[id][1];
    save();
    return speak(id, `<p>${line}</p>`, [
      { label: "See you around", run: dismissSpeech },
    ]);
  }
  if (id === "cap" || id.startsWith("hat-"))
    return showHat(id === "cap" ? "cap" : (id.slice(4) as HatId));
  if (id.startsWith("plot")) {
    const i = +id.slice(4),
      p = s.plots[i];
    if (p.soilFilled === false) {
      if (fillGardenBed(s, i)) {
        save();
        world.syncBeds(s.plots);
        toast("Soil added. This bed is ready for seeds.");
      } else toast("This bed needs soil. Robertson sells a bag for $10.");
      return;
    }
    if (p.crop && p.stage === "ready") {
      if (harvestCrop(s, i)) {
        save();
        toast(
          p.crop === "pepper" || p.crop === "tomato"
            ? "Fresh vegetables in your bag. Cook with Mom to try a new recipe."
            : `Harvested ${p.crop}. Your farm produce is in your bag.`,
        );
      } else
        panel(
          p.crop === "iris" ? "Mom’s irises" : `${p.crop} flowers`,
          "<p>These flowers can stay in bloom here, or you can clear this bed.</p>",
          [
            { label: "Keep the flowers", run: close },
            {
              label: "Clear the bed",
              run: () => {
                p.stage = "empty";
                delete p.crop;
                save();
                close();
              },
            },
          ],
        );
      return;
    }
    if (["empty", "harvested"].includes(p.stage)) {
      if (!p.mountain && !p.meteor && activePlantingSeed(s) !== "money")
        return startGardenPlant(i, activePlantingSeed(s) as Crop);
      if (!s.seeds)
        return toast(
          s.boughtSeeds
            ? `You need fresh seeds. ${seedSearchHint(s)}`
            : "You need seeds. Robertson sells five for $2.",
        );
      action = {
        id: i,
        ids: plantingBatch(s, i),
        elapsed: 0,
        duration: plantingSeconds(s),
        origin: { ...s.position },
      };
      world.player.rotation.y = Math.atan2(
        (p.x ?? -20 + i * 2) - s.position.x,
        (p.z ?? 19) - s.position.z,
      );
      toast(
        p.mountain
          ? `Planting directly in terrace soil… Stand still for ${plantingSeconds(s)} seconds. Automatically watered. Fertilizer is optional and applied separately.`
          : s.shovel
            ? `Digging… Stand still for ${plantingSeconds(s)} seconds to plant ${action.ids.length === 2 ? "both adjoining beds" : "this bed"}.`
            : `Digging by hand takes ${Number(plantingSeconds(s).toFixed(1))} seconds. A $1 shovel from Robertsons cuts it to ${Number(plantingSeconds({ ...s, shovel: true }).toFixed(1))} seconds. Stand still to plant.`,
      );
    } else if (p.stage === "ready") {
      const seedsBeforeHarvest = s.seeds;
      const titheBeforeHarvest = s.millionaire?.tithed ?? 0;
      const ids = gardenBatch(s, i, "harvest");
      const n = ids.reduce((total, j) => total + harvest(s, j), 0);
      const contribution = (s.millionaire?.tithed ?? 0) - titheBeforeHarvest;
      save();
      chime();
      if (s.seeds > seedsBeforeHarvest) seedChime();
      toast(
        `Harvested ${money(n + contribution)}! ${contribution ? `${money(contribution)} contributed to your community; ${money(n)} added to your funds. ` : ""}The tree withers. Plant a fresh seed for another tree.`,
      );
    } else if (p.stage === "growing") {
      if (s.fertilizer && !p.fertilized) {
        const ids = gardenBatch(s, i, "fertilize");
        ids.forEach((j) => fertilize(s, j));
        fertilizerAnimation = {
          elapsed: 0,
          x: p.x ?? -20 + i * 2,
          z: p.z ?? 19,
        };
        world.player.rotation.y = Math.atan2(
          fertilizerAnimation.x - s.position.x,
          fertilizerAnimation.z - s.position.z,
        );
        save();
        toast(
          ids.length > 1
            ? `Fertilized ${ids.length} trees on this terrace. Each can grow up to $9 overnight.`
            : "A little nourishment. This tree can grow up to $9 overnight.",
        );
      } else
        toast(
          p.mountain
            ? "This terrace tree is automatically watered. Apply fertilizer for a larger harvest, then sleep."
            : "Watered. This tree will be ready after you sleep.",
        );
    } else {
      if (!s.can)
        return toast("You need a watering can. Robertson sells one for $1.");
      gardenBatch(s, i, "water").forEach((j) => water(s, j));
      fertilizerAnimation = undefined;
      wateringAnimation = { elapsed: 0, x: p.x ?? -20 + i * 2, z: p.z ?? 19 };
      world.player.rotation.y = Math.atan2(
        wateringAnimation.x - s.position.x,
        wateringAnimation.z - s.position.z,
      );
      save();
      toast(
        s.fertilizer && !p.fertilized
          ? "Watered! Press E to add fertilizer (one dose)."
          : "A splash of water… something stirs beneath the soil.",
      );
    }
  }
}
let audio: AudioContext | undefined;
let seedChimes = 0;
const keyboardAudio = new HomeAudio();
function seedChime() {
  if (!audio || muted) return;
  seedChimes++;
  for (const [index, frequency] of [1046.5, 1568, 2093].entries()) {
    const tone = audio.createOscillator(),
      gain = audio.createGain();
    const start = audio.currentTime + 0.18 + index * 0.09;
    tone.type = "sine";
    tone.frequency.setValueAtTime(frequency, start);
    tone.frequency.exponentialRampToValueAtTime(frequency * 1.08, start + 0.16);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.045, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    tone.connect(gain);
    gain.connect(audio.destination);
    tone.start(start);
    tone.stop(start + 0.36);
  }
}
function chime() {
  if (!audio || muted) return;
  for (const [i, f] of [523, 659, 784].entries()) {
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.frequency.value = f;
    g.gain.setValueAtTime(0.035, audio.currentTime + i * 0.1);
    g.gain.exponentialRampToValueAtTime(
      0.001,
      audio.currentTime + 0.6 + i * 0.1,
    );
    o.connect(g);
    g.connect(audio.destination);
    o.start(audio.currentTime + i * 0.1);
    o.stop(audio.currentTime + 0.7 + i * 0.1);
  }
}
function importSave() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    let next: State | null;
    try {
      next = decode(await file.text());
      if (!next) {
        toast("That save could not be read. Your current garden is safe.");
        return;
      }
      relocateRiverBeds(next, world.rects);
      if (
        blocked(next.position.x, next.position.z, world.rects) ||
        !withinPlayableBounds(next)
      )
        next.position = { x: -16, z: 4 };
      if (!(await saveStore?.write(next, true))) {
        toast(
          "That save could not be stored. Your current garden is unchanged.",
        );
        return;
      }
    } catch {
      toast(
        "Could not import that save. Check browser storage and keep your exported file. Your current garden is unchanged.",
      );
      return;
    }
    action = undefined;
    momSpoke = false;
    world.player.userData.farewell = false;

    s = next;
    resetTransientMotion();
    wasHome = atHome();
    visitedOutside = s.awake && !wasHome;
    plotVersions = new WeakMap<T.Group, string>();
    save();
    close();
    if (!begun) $("#begin").click();
  };
  input.click();
}

function cancelNewGame() {
  close();
  setHidden($("#intro"), false);
  $("#new-game").focus();
}
$("#new-game").onclick = () => {
  setHidden($("#intro"), true);
  panel(
    "Start a new game?",
    "<p>This replaces your saved garden, money, and notebook. You’ll begin in bed with $4.33 in your piggy bank.</p>",
    [
      { label: "Keep my game", run: cancelNewGame },
      {
        label: "Start new game",
        destructive: true,
        run: async () => {
          action = undefined;
          momSpoke = false;
          world.player.userData.farewell = false;

          const next = fresh();
          if (!(await saveStore?.write(next, true))) return;
          s = next;
          resetTransientMotion();
          sitting = false;
          world.setPlayerSeated(false);
          wasHome = true;
          visitedOutside = false;
          yaw = 0;
          pitch = 0.42;
          thoughtTime = 0;
          setHidden(thought, true);
          plotVersions = new WeakMap<T.Group, string>();
          save();
          close();
          $("#begin").click();
        },
      },
    ],
  );
};
$("#begin").onclick = () => {
  if (saveStore?.protected) {
    setHidden($("#intro"), true);
    panel(
      "Your saved game needs recovery",
      "<p>Your original saved data has been kept unchanged. Export it for recovery, or use Start new game only if you want to replace it.</p>",
      [
        {
          label: "Export preserved save",
          disabled: !saveStore?.rejected,
          run: () => {
            const url = URL.createObjectURL(
              new Blob([saveStore!.rejected!], { type: "application/json" }),
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = "money-tree-preserved-save.json";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          },
        },
        { label: "Import save", run: importSave },
        {
          label: "Back",
          default: true,
          run: () => {
            close();
            setHidden($("#intro"), false);
            $("#begin").focus();
          },
        },
      ],
    );
    return;
  }
  begun = true;

  last = performance.now();
  setHidden($("#intro"), true);
  try {
    audio?.close();
    audio = new AudioContext();
  } catch {}
  toast(
    s.awake
      ? "Welcome back. Your garden is waiting."
      : "Press E to get out of bed.",
  );
};
$("#journal").onclick = () => {
  if (begun) notebook();
};
$("#inventory").onclick = () => {
  if (begun) bag();
};
$("#pause").onclick = () => {
  if (begun) pauseMenu();
};
addEventListener("keydown", (e) => {
  // Reserve the game's shortcut even in text fields and during key repeat.
  if (e.key.toLowerCase() === "f5") {
    e.preventDefault();
    if (!e.repeat)
      furnitureEditorOpen ? closeFurnitureEditor() : openFurnitureEditor();
    return;
  }
  if (
    e.target instanceof HTMLElement &&
    (e.target.matches("input,textarea") || e.target.isContentEditable) &&
    e.key !== "Escape"
  )
    return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
    e.preventDefault();
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  if (key === "escape") {
    if (placingFurniture) {
      cancelFurniture();
      furnitureEditor.browse();
      return;
    }
    if (furnitureEditorOpen) {
      closeFurnitureEditor();
      return;
    }
    if (placingBed) {
      placingBed = false;
      bedGhost.visible = false;
      toast("Bed placement cancelled. It is still in your bag.");
      return;
    }
    if (!begun && paused) return cancelNewGame();
    if (begun) paused ? close() : pauseMenu();
    return;
  }
  if (key === "q" && begun) {
    e.preventDefault();
    exportSave();
    return;
  }
  if (paused) {
    if (key === "e") {
      e.preventDefault();
      if (modalDefault && !modalDefault.disabled) modalDefault.click();
    }
    return;
  }
  if (
    isNight(s) &&
    s.awake &&
    !nightShelterAt(s.position.x, s.position.z) &&
    ["e", "g", "h", "t", "f", "b"].includes(key)
  ) {
    toast("Interactions resume at dawn. V or click throws a $1 bill.");
    return;
  }
  if (key === "v") {
    throwNightBill();
    return;
  }
  if (key === "e" && world.life.cuddling !== undefined) {
    world.life.putDown();
    return;
  }
  if (placingFurniture) {
    const f = placingFurniture;
    if (key === "r") f.rotation += e.shiftKey ? Math.PI / 36 : Math.PI / 2;
    else if (key === "l") f.locked = !f.locked;
    else if ((key === "pageup" || key === "pagedown") && f.point) {
      e.preventDefault();
      f.locked = true;
      f.point.y = T.MathUtils.clamp(
        f.point.y + (key === "pageup" ? 0.1 : -0.1),
        0,
        3.4,
      );
    } else if (key.startsWith("arrow") && f.point) {
      f.locked = true;
      const step = e.shiftKey ? 0.02 : 0.1;
      if (key === "arrowleft") f.point.x -= step;
      if (key === "arrowright") f.point.x += step;
      if (key === "arrowup") f.point.z -= step;
      if (key === "arrowdown") f.point.z += step;
    } else if (key === "e") commitFurniture();
    else if (["w", "a", "s", "d", "shift"].includes(key)) keys.add(key);
    return;
  }
  if (furnitureEditorOpen && key === "e") return;
  if (
    !begun ||
    world.life.busy ||
    cookingScene ||
    featherHandoff ||
    bikeMountTime > 0
  )
    return;
  if (celebration) return;
  if ((s.pepeShowStarted && !s.pepePopped) || pepeViewHold > 0) return;
  if (
    key === "g" &&
    !riding &&
    !action &&
    near?.id.startsWith("plot") &&
    !s.plots[+near.id.slice(4)].mountain &&
    !s.plots[+near.id.slice(4)].meteor &&
    crops.some((c) => seedCount(s, c) > 0)
  ) {
    e.preventDefault();
    chooseGardenSeed(+near.id.slice(4));
    return;
  }
  if (key === "h") {
    mountBike();
    return;
  }
  if (key === "t" && sitting && couchZoom !== undefined) {
    e.preventDefault();
    tvMenu();
    return;
  }
  if (key === "f") {
    activateBikeFeature();
    return;
  }
  if (key === "b") {
    ringBikeBell();
    return;
  }
  if (
    key === " " &&
    s.awake &&
    !sitting &&
    !riding &&
    wearing(s, "rabbit") &&
    jumpHeight === 0 &&
    rollTime <= 0 &&
    !action
  ) {
    jumpVelocity = 10;
    noteHatPower(s, "to jump", "rabbit");
  } else if (
    key === "r" &&
    s.awake &&
    !sitting &&
    !riding &&
    jumpHeight === 0 &&
    rollCooldown <= 0
  ) {
    rollDirection.copy(viewForward());
    rollTime = 0.45;
    rollCooldown = 1.1;
  } else if (key === "e" && rollTime <= 0) {
    if (placingBed) {
      const p = bedPosition();
      if (placeGardenBed(s, p.x, p.z, bedObstacles())) {
        placingBed = false;
        world.syncBeds(s.plots);
        save();
        toast(
          "Bed placed! Bring a $10 bag of soil from Robertson’s and press E at this bed.",
        );
      } else
        toast(
          "Choose clear ground on your property, away from paths, doors and other beds.",
        );
      return;
    }

    const choice = speaking?.element.querySelector<HTMLButtonElement>(
      '.choices button[data-safe-default="true"]:not(:disabled)',
    );
    const speaker = world.speakers.find((n) => n.id === speaking?.id);
    const closeEnough =
      speaker &&
      Math.hypot(
        speaker.object.position.x - s.position.x,
        speaker.object.position.z - s.position.z,
      ) < 8;
    if (choice && choice.dataset.safeDefault === "true" && closeEnough)
      choice.click();
    else if (sitting) standUp();
    else if (speaking && closeEnough) {
      if (!choice && !speaking.element.querySelector(".choices"))
        dismissSpeech();
    } else interact();
  } else if (key === "j") notebook();
  else if (key === "i") bag();
  else keys.add(key);
});
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
addEventListener("blur", () => {
  keys.clear();
  save();
});
document.addEventListener("visibilitychange", () => {
  keys.clear();
  last = performance.now();
  save();
});
let jumpHeight = 0,
  jumpVelocity = 0;
let rollTime = 0,
  rollCooldown = 0;
const rollDirection = new T.Vector3();
let rollPose: T.Group | undefined;
function updateRollPose() {
  if (rollTime > 0 && !rollPose) {
    rollPose = new T.Group();
    rollPose.position.y = 0.9;
    rollPose.scale.setScalar(0.65);
    for (const child of [...world.player.children]) {
      child.position.y -= 1;
      rollPose.add(child);
    }
    world.player.add(rollPose);
  }
  if (rollPose && rollTime > 0)
    rollPose.rotation.x = reducedMotion
      ? 0.5
      : (1 - rollTime / 0.45) * Math.PI * 2;
  if (rollPose && rollTime <= 0) {
    for (const child of [...rollPose.children]) {
      child.position.y += 1;
      world.player.add(child);
    }
    world.player.remove(rollPose);
    rollPose = undefined;
  }
}
function disposeAnimation(root: T.Object3D) {
  root.removeFromParent();
  root.traverse((o) => {
    if (o instanceof T.Mesh) {
      o.geometry.dispose();
      for (const material of Array.isArray(o.material)
        ? o.material
        : [o.material])
        material.dispose();
    }
  });
}

function resetTransientMotion() {
  nightCombat.reset();
  world.sigma.resetPepeAnimation();
  pickupCheckIn = 0;
  world.life.cancelInteractions();
  if (cookingScene) disposeAnimation(cookingScene.root);
  cookingScene = undefined;
  kitchenPrepared = false;
  if (estateFilm) {
    disposeAnimation(estateFilm.truck);
    if (estateFilm.actor) disposeAnimation(estateFilm.actor);
  }
  estateFilm = undefined;
  featherHandoff = undefined;
  spanakopitaShot = undefined;
  world.player.add(featherModel);
  featherModel.position.copy(featherHairPosition);
  featherModel.rotation.set(0.2, 0.6, -0.35);
  featherModel.visible = !!s.adventure?.feather;
  for (const actor of [world.player, world.mom])
    for (const side of [-1, 1])
      actor.getObjectByName(`hand-${side}`)?.position.set(side * 0.43, 0.79, 0);
  closeFurnitureEditor();
  keyboardAudio.stop();
  beaGuide = undefined;
  momGardenVisit = undefined;
  gardenAwaitDeparture = false;
  momHomeDialogue = false;
  if (hatHanging) {
    scene.remove(hatHanging.model);
    hatHanging.model.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        (o.material as T.Material).dispose();
      }
    });
    hatHanging = undefined;
  }
  cameraWalls.restore();
  followInitialized = false;
  inventoryState = s;
  inventoryBefore = inventorySnapshot(s);
  inventoryNotices.length = 0;
  fertilizerAnimation = undefined;
  wateringAnimation = undefined;
  world.setWatering(false, 0, 0, 0);
  birdhouseScene?.carried.forEach((g) => scene.remove(g));
  birdhouseScene = undefined;
  if (celebration) {
    restoreParty(celebration);
    celebration = undefined;
  }
  teaSeated = false;
  storyThoughtClock = storyThoughtIndex = 0;
  momTrail = [];
  world.setMomDay(s.day, atHome(), true, s.familyStory);
  world.setFertilizing(false, 0, 0, 0);
  world.sigma.cancelHandoff();
  sittingWithStacy = false;
  couchZoom = undefined;
  dismountBike();
  placingBed = false;
  bedGhost.visible = false;
  thoughtTime = 0;
  setHidden(thought, true);
  returnBikeToRack();
  bikeSpecial.reset();
  action = undefined;
  pepeViewHold = 0;
  pepeReturning = false;
  pepeGreeted = false;
  dogeGreeted = false;
  meditationTime = 0;
  rollTime = 0;
  rollCooldown = 0;
  jumpHeight = 0;
  jumpVelocity = 0;
  updateRollPose();

  sitting = false;
  world.setPlayerSeated(false);
  keys.clear();
}
let dragging = false,
  intentionalUnlock = false,
  wasMouseCaptured = false;
function releaseMouse() {
  dragging = false;
  if (document.pointerLockElement) {
    intentionalUnlock = true;
    document.exitPointerLock();
  }
}
async function captureMouse() {
  if (!begun || paused || !s.awake) return;
  const canvas = $("#world") as HTMLCanvasElement;
  if (typeof canvas.requestPointerLock !== "function") return;
  dismissSpeech();
  try {
    await canvas.requestPointerLock();
  } catch {
    toast(
      "Mouse capture wasn’t available. Drag the view or use the arrow keys.",
    );
  }
}
$("#world").addEventListener("pointerdown", (e) => {
  if (!begun || paused) return;
  dragging = true;
  if (isNight(s) && (e as PointerEvent).button === 0) throwNightBill();
  if (s.awake) void captureMouse();
  else
    ($("#world") as HTMLCanvasElement).setPointerCapture(
      (e as PointerEvent).pointerId,
    );
});
document.addEventListener("pointerlockchange", () => {
  const captured = document.pointerLockElement === $("#world");
  $("#mouse-look").textContent = captured
    ? "Mouse · Look"
    : "Click to look / ← →";
  if (captured) {
    dragging = false;
    if (paused) releaseMouse();
  } else if (wasMouseCaptured) {
    dragging = false;
    if (!intentionalUnlock || paused) keys.clear();
    if (!intentionalUnlock && begun && !paused) pauseMenu();
    intentionalUnlock = false;
  }
  wasMouseCaptured = captured;
});
addEventListener("pointerup", () => (dragging = false));
addEventListener("pointermove", (e) => {
  if (
    begun &&
    !paused &&
    s.awake &&
    (document.pointerLockElement === $("#world") || dragging)
  ) {
    lastLookInput = performance.now();
    yaw -= e.movementX * 0.006;
    if (!riding) {
      cameraTilted = true;
      pitch = T.MathUtils.clamp(pitch + e.movementY * 0.004, 0.15, 1.1);
    }
  }
});
$("#world").addEventListener(
  "wheel",
  (event) => {
    const e = event as WheelEvent;
    if (!begun || paused || !s.awake || riding) return;
    e.preventDefault();
    const units = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
    if (placingFurniture) {
      placingFurniture.locked = false;
      placingFurniture.distance = T.MathUtils.clamp(
        placingFurniture.distance + e.deltaY * units * 0.005,
        0.7,
        6,
      );
      return;
    }
    zoomDistance = T.MathUtils.clamp(
      zoomDistance + e.deltaY * units * 0.006,
      0,
      8,
    );
    lastLookInput = performance.now();
  },
  { passive: false },
);
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
function interactionPoint(t: Target) {
  if (t.footprint) {
    const { w, d, rotation } = t.footprint,
      c = Math.cos(rotation),
      sn = Math.sin(rotation);
    const dx = s.position.x - t.x,
      dz = s.position.z - t.z;
    const x = T.MathUtils.clamp(c * dx - sn * dz, -w / 2, w / 2);
    const z = T.MathUtils.clamp(sn * dx + c * dz, -d / 2, d / 2);
    return { x: t.x + c * x + sn * z, z: t.z - sn * x + c * z };
  }
  if (!t.id.startsWith("plot")) return t;
  const bed = world.plots[+t.id.slice(4)].position;
  return {
    x: T.MathUtils.clamp(s.position.x, bed.x - 0.8, bed.x + 0.8),
    z: T.MathUtils.clamp(s.position.z, bed.z - 1.5, bed.z + 1.5),
  };
}
function targetDistance(t: Target) {
  const point = interactionPoint(t);
  return Math.hypot(s.position.x - point.x, s.position.z - point.z);
}
const bikeRackTarget = world.targets.find((t) => t.id === "bike-rack")!;
function atBikeRack() {
  return (
    Math.hypot(
      s.position.x - bikeRackTarget.x,
      s.position.z - bikeRackTarget.z,
    ) < 1.5
  );
}
function selectTarget() {
  if (isNight(s) && s.awake && !nightShelterAt(s.position.x, s.position.z))
    return;
  const { x, z } = s.position;
  const shelter = isNight(s) ? nightShelterAt(x, z) : undefined;
  if (atBikeRack()) return bikeRackTarget;
  if (
    !riding &&
    parkedBike?.visible &&
    Math.hypot(parkedBike.position.x - x, parkedBike.position.z - z) < 2
  )
    return {
      id: "parked-bike",
      x: parkedBike.position.x,
      z: parkedBike.position.z,
      label: "Mount bicycle",
    };
  let best: Target | undefined;
  let bestScore = Infinity;
  for (const t of world.targets) {
    if (isNight(s) && nightShelterAt(t.x, t.z) !== shelter) continue;
    let distance = 0;
    if (
      (t.id !== "player-stove" || kitchenPrepared || !!s.pendingMeal) &&
      ((!t.id.startsWith("willow-") &&
        !t.id.startsWith("fellowship-") &&
        !t.id.startsWith("millionaire-")) ||
        !!s.millionaire?.unlocked) &&
      (!t.id.startsWith("fellowship-") ||
        !!s.millionaire?.result ||
        !!s.millionaire?.member) &&
      (!t.id.startsWith("millionaire-") || !!s.millionaire?.member) &&
      (!t.id.startsWith("fellowship-") ||
        effectivelyVisible(
          world.speakers.find((o) => o.id === t.id)!.object,
        )) &&
      (t.id !== "mom" || !momAway(s)) &&
      (t.id !== "bea-chair" || inBeaHouse(s.position)) &&
      (s.foundTVSeeds ||
        (!t.id.startsWith("sigma-chad-") &&
          t.id !== "grindset" &&
          t.id !== "gigachad" &&
          t.id !== "soyjak" &&
          t.id !== "composter" &&
          t.id !== "wolf")) &&
      ((!t.id.startsWith("mountain-") &&
        !(t.id.startsWith("hat-") && mountainHat(t.id.slice(4) as HatId))) ||
        mountainShopOpen(s)) &&
      (t.id !== "coin-atm" || !!s.coin) &&
      (t.id !== "forest-seeds" || (!!s.foundCapSeeds && !s.foundForestSeeds)) &&
      t.id !== "store-seeds" &&
      (t.id !== "garden-seeds" ||
        (!!s.foundForestSeeds && !s.foundGardenSeeds)) &&
      (!t.id.startsWith("pepe-seed-") ||
        (!!s.pepePopped && !s.pepePackets?.includes(Number(t.id.slice(10))))) &&
      (t.id !== "pepe-door" || !canEnterPepe(s)) &&
      t.id !== "tv-seeds" &&
      (t.id !== "maze-seeds" || !(s.mazeSeedCooldown ?? 0)) &&
      (distance = targetDistance(t)) <
        (t.id.startsWith("bike-") && t.id !== "bike-rack"
          ? 4.5
          : t.id === "mom" &&
              momStatus(s.day, s.familyStory).activity === "bedrest"
            ? 3.8
            : wearing(s, "reach")
              ? 4.5
              : wearing(s, "lantern") || buff(s, "reach")
                ? 3
                : 2.1)
    ) {
      const score =
        distance -
        (t.id.startsWith("meteor-seed-") && distance < 1
          ? 0.6
          : t.id.startsWith("plot") && s.plots[+t.id.slice(4)].stage === "ready"
            ? 0.35
            : 0);
      if (score < bestScore && hasSight(t)) {
        best = t;
        bestScore = score;
      }
    }
  }
  return best;
}
function hasSight(t: Target) {
  const a = new T.Vector3(
      s.position.x,
      terrainHeight(s.position.x, s.position.z) + 1.1,
      s.position.z,
    ),
    b = new T.Vector3(
      interactionPoint(t).x,
      terrainHeight(t.x, t.z) + 1.1,
      interactionPoint(t).z,
    ),
    dir = b.sub(a),
    d = dir.length();
  if (d < 0.01) return true;
  ray.set(a, dir.normalize());
  ray.far = d;
  return !ray
    .intersectObjects(
      world.occluders.filter((o) => cameraWalls.visibleForInteraction(o)),
      false,
    )
    .some((h) => h.distance < d - 0.1);
}
function updateUI() {
  setHidden(mortgageHud, !s.housing?.mortgage || s.housing.status !== "owned");
  if (!mortgageHud.hidden) {
    const h = s.housing!;
    setHudHTML(
      mortgageHud,
      `<span>⌂</span><span><small>Mortgage · $10/day</small><strong>${money(h.balance)}</strong><small>${money(h.principalPaid)} principal paid · $6 principal / $4 interest</small></span>`,
    );
  }

  setHidden(
    fertilizerHud,
    !(
      s.fertilizerPurchased ||
      s.fertilizer > 0 ||
      s.events.some((e) => e.includes("fertilizer")) ||
      s.journalHistory?.some((d) =>
        d.events.some((e) => e.includes("fertilizer")),
      )
    ),
  );
  setText(fertilizerHud.querySelector("strong")!, String(s.fertilizer));
  setHidden(membershipHud, !s.millionaire?.member);
  if (s.millionaire?.member) {
    const f = fellowship(s.millionaire.member);
    setHudHTML(
      membershipHud,
      `<span class="membership-icon" aria-hidden="true">▣</span><span><small>Membership</small><strong>${f.id === "arms" ? "M.I.A." : f.id === "bridge" ? "Bridge" : "Breath of Fire"}</strong></span>`,
    );
    setAttr(
      membershipHud,
      "title",
      `${f.name} membership card. Open your phone apps.`,
    );
    setAttr(
      membershipHud,
      "aria-label",
      `${f.name} membership card and phone apps`,
    );
  }
  setHidden(drinkHud, !s.drink);
  if (s.drink) {
    const drink = drinks.find((d) => d.id === s.drink!.id)!;
    setText(drinkHud.querySelector("small")!, drink.name);
    setText(
      drinkHud.querySelector("strong")!,
      `${Math.ceil(s.drink.remaining)}s`,
    );
    setAttr(drinkHud, "title", drink.effect);
    setAttr(
      drinkHud,
      "aria-label",
      `${drink.name}, ${Math.ceil(s.drink.remaining)} seconds remaining. ${drink.effect}`,
    );
  }
  const burgerSeconds = Math.ceil(s.soyEffects?.burger ?? 0);
  const milkSeconds = Math.ceil(s.soyEffects?.milk ?? 0);
  setHidden(soyHud, !burgerSeconds && !milkSeconds);
  if (burgerSeconds || milkSeconds)
    setText(
      soyHud.querySelector("strong")!,
      [
        burgerSeconds ? `2× size · ${burgerSeconds}s` : "",
        milkSeconds ? `Serious Hat · ${milkSeconds}s` : "",
      ]
        .filter(Boolean)
        .join(" / "),
    );
  mountainShop.update(s);
  setHidden(compostHud, !s.foundTVSeeds);
  setText(compostHud.querySelector("strong")!, String(s.compostScraps ?? 0));
  setAttr(compostHud, "aria-label", `${s.compostScraps ?? 0} compost scraps`);
  const total = s.cash + s.bank;
  updateCoinTracker();
  setText(seedHud.querySelector("strong")!, String(s.seeds));
  setAttr(seedHud, "aria-label", `${s.seeds} money tree seeds`);
  dailyNetLedger.update(s);
  const net = s.dailyNet ?? 0;
  setText(netHud.querySelector(".daily-net-icon")!, net < 0 ? "↘" : "↗");
  netHud.classList.toggle("negative", net < 0);
  setText(
    netHud.querySelector("strong")!,
    `${net < 0 ? "−" : "+"}${money(Math.abs(net))}`,
  );
  setAttr(
    netHud,
    "aria-label",
    `${net < 0 ? "−" : "+"}${money(Math.abs(net))} Daily Net`,
  );
  setText(cashHud.querySelector("strong")!, money(s.cash));
  setText(bankHud.querySelector("strong")!, money(s.bank));
  setAttr(cashHud, "aria-label", `${money(s.cash)} pocket money`);
  setAttr(bankHud, "aria-label", `${money(s.bank)} saved in the piggy bank`);
  setText($("#stats"), `Day ${s.day}`);
  let objective = "Visit Ol’ Man Robertson",
    hint =
      "Take your $4.33 from the piggy bank, then follow the lane north into town.";
  if (!s.awake) {
    objective = "One small beginning";
    hint = "Press E to get out of bed. Your notebook is open on the desk.";
  } else if (!s.metRobertson && s.cash === 0 && s.bank > 0) {
    objective = "Take a look around";
    hint =
      "Your notebook is open on the desk. There’s a piggy bank beside it, too.";
  } else if (
    s.seeds > 0 &&
    !s.plots.some((p) => ["planted", "growing", "ready"].includes(p.stage))
  ) {
    objective = "Bring a little magic home";
    hint = `${s.can ? "Your watering can is ready." : "Pick up a watering can for $1."} Plant your seeds in the garden behind your house.`;
  } else if (s.plots.some((p) => p.stage === "ready")) {
    objective = "Money really grows on trees";
    hint =
      "Your bills are ready. Harvest them, then bring your money to the piggy bank.";
  } else if (s.plots.some((p) => p.stage === "growing")) {
    objective = "Let your garden grow";
    hint =
      "Your watered trees will be ready in the morning. Sleep in your bed when you’re done for today.";
  } else if (s.plots.some((p) => p.stage === "planted")) {
    objective = "A little water, a little hope";
    hint = s.can
      ? "Water your seeds to start them growing."
      : "Robertson has a watering can for $1.";
  } else if (s.boughtSeeds && !s.seeds) {
    objective = "Find fresh seeds";
    hint = !s.foundCapSeeds
      ? "Look in the brim of a cap at Thread & Thimble."
      : !s.foundForestSeeds
        ? "Search among the trees around town."
        : !s.foundGardenSeeds
          ? "Look in Bea’s flowerbeds beside her house."
          : "Visit Robertson’s corn maze, or explore Sigma Town for more seeds.";
  } else if (s.metRobertson) {
    objective = "Seeds of possibility";
    hint = "Buy five seeds for $2. A shovel makes planting quicker.";
  }
  if (
    s.awake &&
    s.foundTVSeeds &&
    !s.communityPlanted &&
    !s.plots.some((p) => p.stage === "ready")
  ) {
    objective = "A path through the hedge";
    hint =
      "Past Thread & Thimble, the lane opens into Sigma Town. Its ten community beds need fresh seeds.";
  }
  if (s.awake && s.millionaire?.unlocked && !s.millionaire.member) {
    objective = "A path into the willows";
    hint =
      "Follow the gap beside the coin ATM in Sigma Town’s east hedge, between the ATM and town entrance. A guru is waiting beneath the great willow.";
  } else if (s.awake && s.millionaire?.member && !s.millionaire.titheAccepted) {
    objective = "Follow your community to Mt. Millionaire";
    hint =
      "Follow your mascot along the willow path and all the way to the pagoda on top of the white terraces.";
  } else if (s.awake && s.millionaire?.titheAccepted && s.position.z < -330) {
    objective = "A hundred places to plant";
    hint =
      "The dead trees mark fertile terrace soil. Plant seeds, then sleep at home and harvest in the morning. The terraces supply water; apply fertilizer separately for larger harvests.";
  }
  if (s.adventure?.meteors?.some((m) => m.landed && !m.harvested)) {
    objective = "Something fell from the sky";
    hint =
      "Investigate the meteor craters in the desert. A ready Money Tree grows at each new landing site.";
  }
  const phase = storyPhase(s);
  if (phase !== "saving") {
    const aims = {
      scheduled: [
        "Mom’s surgery is tomorrow",
        "The surgery is paid for. Enjoy this day together.",
      ],
      surgery: [
        "Waiting for Mom’s call",
        "Mom is at the hospital with Auntie. Keep up your routine while you wait.",
      ],
      "coming-home": [
        "Mom is coming home tonight",
        "Her surgery went well. Auntie will bring her back.",
      ],
      recovery: [
        s.familyStory?.escort
          ? "Walk with Mom to Bea’s"
          : "Mom is getting better",
        s.familyStory?.escort
          ? "Bea’s front door is at the south side of her pink house. Come in and sit down for tea."
          : canVisitBea(s)
            ? "Mom feels ready for an outing. Ask her about visiting Bea."
            : "Take things slowly together. Mom is feeling better each day.",
      ],
      "shop-saved": [
        "Robertsons is here to stay",
        "You saved the general store. Go see Ol’ Man Robertson anytime.",
      ],
      shop: [
        "Save Ol’ Man Robertson’s shop",
        `${money(total)} saved · ${money(Math.max(0, 10_000_000 - total))} left toward $100,000.`,
      ],
    };
    objective = aims[phase][0];
    hint = aims[phase][1];
  } else if (canTellMom(s)) {
    objective = "Tell Mom you’ve got $10k";
    hint =
      "You have enough in your pocket and savings to pay for her surgery. Go see Mom.";
  }
  if (s.adventure?.meteors?.some((m) => m.landed && !m.harvested)) {
    objective = "Something fell from the sky";
    hint =
      "Investigate the meteor craters in the desert. A ready Money Tree grows at each new landing site.";
  }
  if (canSaveShop(s)) {
    objective = "Go tell Ol’ Man Robertson";
    hint =
      "You have $100,000 to save his shop. Find him at Robertsons and give him the good news.";
  } else if (s.familyStory?.shopSaved) {
    objective = "Robertsons is here to stay";
    hint = "You saved the general store. Go see Ol’ Man Robertson anytime.";
  }
  if (s.millionaire?.unlocked && !s.housing && s.position.z < -90) {
    const m = s.millionaire;
    if (!m.result) {
      objective = "Meet the Willow Guru";
      hint =
        "Take the assessment in Willow Grove to meet your community and reach Mt. Millionaire.";
    } else if (!m.member) {
      objective = "Meet your community";
      hint =
        "Talk to your assessment’s community mascot and ask them to lead you up the mountain.";
    } else if (!m.titheAccepted) {
      objective = "Meet the Community Guardian";
      hint =
        "Follow the central mountain path to the summit pagoda. The Guardian explains terrace planting.";
    } else if (m.mountainEarned < 100000) {
      objective = "Grow your terrace garden";
      hint = `Plant terrace sites, sleep, then harvest. ${money(Math.max(0, 100000 - m.mountainEarned))} in mountain harvests until home-buying opens. Visit Terrace Threads at the foot for hats and seeds.`;
    } else if (!m.chats["mansion-declined"]) {
      objective = "Talk to the Community Guardian about a home";
      hint =
        "Your mountain harvests opened home-buying. Return to the summit Guardian to ask about mansions.";
    }
  }
  setText($("#objective"), objective);
  setText($("#hint"), hint);
  const { x, z } = s.position;
  setText(
    $("#location"),
    x < -44 && z > -65 && z < 35
      ? "Robertson’s Farm"
      : s.housing?.status === "owned" &&
          Math.abs(x - mansionLot.x) < 16 &&
          Math.abs(z - mansionLot.z) < 11
        ? `${s.housing.style === "hearst" ? "Magnate Mansion" : "Presidential Palace"} · Home`
        : s.housing?.storeOpened && x > -48 && x < -28 && z > -327 && z < -309
          ? "Mansion Marvels"
          : s.millionaire?.unlocked && z < -90
            ? z < -335
              ? "Mt. Millionaire"
              : "The Willow Grove"
            : s.foundTVSeeds && z < -40
              ? "Sigma Town"
              : atHome()
                ? "Home, Sweet Home"
                : x < -8 && x > -23 && z >= 14 && z < 24
                  ? "Your Little Garden"
                  : z < -21 && z > -39 && x > -4 && x < 16
                    ? "Robertsons"
                    : z < -23 && z > -35 && x > 18 && x < 30
                      ? "Thread & Thimble"
                      : z < -13
                        ? "Market Lane"
                        : "Willow Lane",
  );
  near = selectTarget();
  let prompt =
    s.millionaire?.titheAccepted && !riding && fertileMountainSoil(x, z)
      ? "E Plant directly in this fertile terrace"
      : "";
  let unavailable = false;
  if (!s.awake) prompt = "<kbd>E</kbd> Get out of bed";
  else if (isNight(s) && !nightShelterAt(x, z))
    prompt = "<kbd>V</kbd> Throw $1 · Go indoors to talk or rest";
  else if (action)
    prompt = `Planting… ${Math.ceil(action.duration - action.elapsed)}s · stand still (moving cancels)`;
  else if (near) {
    let label = near.label;
    if (near.id === "mom-chair")
      label =
        !momAway(s) && momStatus(s.day, s.familyStory).activity === "bedrest"
          ? "Sit nearby Mom"
          : "Sit";
    if (
      riding &&
      near.id.startsWith("plot") &&
      ["empty", "harvested", "growing"].includes(
        s.plots[+near.id.slice(4)].stage,
      )
    ) {
      unavailable = true;
      label = "Press H to dismount before working in this bed";
    }
    if (near.id.startsWith("plot") && !unavailable) {
      const p = s.plots[+near.id.slice(4)];
      unavailable =
        (["empty", "harvested"].includes(p.stage) &&
          !s.seeds &&
          (p.mountain ||
            !!p.meteor ||
            !crops.some((c) => (s.cropSeeds?.[c] ?? 0) > 0))) ||
        (p.stage === "planted" && !s.can);
      label = ["empty", "harvested"].includes(p.stage)
        ? s.seeds ||
          (!p.mountain &&
            !p.meteor &&
            crops.some((c) => (s.cropSeeds?.[c] ?? 0) > 0))
          ? `${plantingBatch(s, +near.id.slice(4)).length > 2 ? "Plant terrace" : plantingBatch(s, +near.id.slice(4)).length === 2 ? "Plant two adjoining beds" : "Plant seeds"} · stand still (${Number(plantingSeconds(s).toFixed(1))}s)`
          : "Plant seeds (need seeds)"
        : p.stage === "ready"
          ? p.crop && isFlower(p.crop)
            ? `Admire ${p.crop === "iris" ? "Mom’s irises" : p.crop}`
            : p.crop
              ? `Pick ${p.crop}s for cooking`
              : "Harvest money tree"
          : p.stage === "growing"
            ? s.fertilizer && !p.fertilized
              ? p.mountain && wearing(s, "alchemist")
                ? "Fertilize terrace"
                : "Apply fertilizer"
              : "Ready tomorrow"
            : s.can
              ? "Water seeds / tree"
              : "Water seeds (need watering can)";
      if (p.soilFilled === false) {
        label = s.soilBags
          ? "Fill bed with soil"
          : "Fill bed (need $10 soil bag)";
        unavailable = !s.soilBags;
      }
    }
    prompt = label === "Ready tomorrow" ? label : `<kbd>E</kbd> ${label}`;
    if (near.id.startsWith("plot") && !riding) {
      const p = s.plots[+near.id.slice(4)];
      if (!p.mountain && !p.meteor && crops.some((c) => seedCount(s, c) > 0))
        prompt += ` · <kbd>G</kbd> Choose seed · ${activePlantingSeed(s)} selected`;
    }
  }
  if (furnitureEditorOpen && !placingFurniture)
    prompt = "Furniture editor · Choose a model · F5 finishes";
  if (placingFurniture)
    prompt = placingFurniture.valid
      ? "<kbd>E</kbd> Place furnishing · R rotate · L lock · F5 editor"
      : "Find clear wall or floor space · Escape cancels";
  if (world.life.cuddling !== undefined)
    prompt = "<kbd>E</kbd> Put chicken down";
  if (placingBed)
    prompt = canPlaceBed(s, bedPosition().x, bedPosition().z, bedObstacles())
      ? "<kbd>E</kbd> Place garden bed · Escape cancels"
      : "Find clear ground on your property · Escape cancels";
  if (sitting)
    prompt =
      meditationTime > 0
        ? `Meditating · ${Math.ceil(meditationTime)}s`
        : `<kbd>E</kbd> Stand up${couchZoom !== undefined ? " · <kbd>T</kbd> TV channel" : ""}`;
  if ((s.pepeShowStarted && !s.pepePopped) || pepeViewHold > 0)
    prompt = s.pepePopped
      ? "Seed packets are falling!"
      : `Pepe is inflating · ${Math.ceil(12 - (s.pepeInflation ?? 0))}s`;
  if (cookingScene)
    prompt =
      cookingScene.elapsed < 9
        ? "Cooking together…"
        : cookingScene.elapsed < 13
          ? "Taking our plates to Mom…"
          : "Sharing our meal…";
  const promptElement = $("#prompt");
  if (promptElement.innerHTML !== prompt) promptElement.innerHTML = prompt;
  $("#prompt").classList.toggle("unavailable", unavailable);
  $("#prompt").classList.toggle("seated", sitting);
  setAttr($("#prompt"), "aria-disabled", String(unavailable));
  setHidden($("#progress"), !action);
  if (action)
    setCss(
      $("#progress span").style,
      "width",
      `${(action.elapsed / action.duration) * 100}%`,
    );
}
const timerPosition = new T.Vector3();
function frame(now: number) {
  const frameStarted = profiling.start();
  frameNumber++;
  world.setHat(
    wornHats(s),
    !!s.soyEffects?.milk,
    s.millionaire?.unlocked ? 3 : s.foundTVSeeds ? 2 : 1,
  );
  world.player.scale.setScalar(s.soyEffects?.burger ? 2 : 1);
  world.setRackHats(
    s.hats.filter((id) => !wearing(s, id) && id !== hatHanging?.id),
  );
  world.setFertilizerMarkers(s.plots, s.day);
  world.showBirdhouses(s.birdhousesBuilt ?? 0, s.birdhousePaint);
  if (birdhouseScene)
    world.outdoorBirdhouses.forEach((g, i) => {
      if (i >= birdhouseScene!.start && i < birdhouseScene!.start + 2)
        g.visible = i - birdhouseScene!.start < birdhouseScene!.placed;
    });
  if (
    begun &&
    s.awake &&
    world.outdoorBirdhouses.some(
      (g) =>
        g.visible &&
        Math.hypot(g.position.x - s.position.x, g.position.z - s.position.z) <
          7,
    )
  )
    visit("Saw Mom’s finished birdhouses hanging in the trees.");
  world.gardenSeeds.visible = !!s.foundForestSeeds && !s.foundGardenSeeds;
  world.tvSeeds.visible = false;
  world.farm.seed.visible = !(s.mazeSeedCooldown ?? 0);
  world.farm.update(s.position);
  const inHatShop =
    s.position.x > 18 &&
    s.position.x < 30 &&
    s.position.z < -22 &&
    s.position.z > -36;
  const shopDistance = Math.hypot(
    Math.max(18 - s.position.x, 0, s.position.x - 30),
    Math.max(-35 - s.position.z, 0, s.position.z + 23),
  );
  const shopOpacity = begun ? Math.min(1, shopDistance / 1.5) : 1;
  const shopMaterial = world.hatShopRoof.material as T.MeshStandardMaterial;
  shopMaterial.opacity +=
    (shopOpacity - shopMaterial.opacity) *
    (reducedMotion
      ? 1
      : 1 - Math.exp(-Math.min((now - last) / 1000, 0.25) * 9));
  world.hatShopRoof.visible = shopMaterial.opacity > 0.02;
  world.hatShopRoof.castShadow = shopMaterial.opacity > 0.95;
  shopMaterial.depthWrite = shopMaterial.opacity > 0.95;
  for (const model of [...world.hatDisplays, world.wornHat]) {
    const blade = model.getObjectByName("propeller");
    if (blade && !reducedMotion) blade.rotation.y = now * 0.006;
  }
  const shopRoofIndex = world.occluders.indexOf(world.hatShopRoof);
  if ((shopOpacity < 0.95 || shopMaterial.opacity < 0.95) && shopRoofIndex >= 0)
    world.occluders.splice(shopRoofIndex, 1);
  if (shopOpacity > 0.95 && shopMaterial.opacity > 0.95 && shopRoofIndex < 0)
    world.occluders.push(world.hatShopRoof);
  requestAnimationFrame(frame);
  const elapsed = Math.max(0, (now - last) / 1000);
  const dt = Math.min(elapsed, 0.25);
  last = now;
  if (
    !celebration &&
    !teaSeated &&
    !cookingScene &&
    !kitchenPrepared &&
    world.setMomDay(
      s.day,
      atHome(),
      false,
      s.familyStory,
      !!momGardenVisit || s.momHomeStory?.gardenDay === s.day,
    ) &&
    s.awake &&
    !sitting &&
    blocked(s.position.x, s.position.z, world.rects)
  )
    s.position = clearPosition(
      s.position,
      world.rects,
      s.millionaire?.unlocked ? -470 : s.foundTVSeeds ? -89 : -39,
    );
  const distanceToRoom = (
    left: number,
    right: number,
    north: number,
    south: number,
  ) =>
    Math.hypot(
      Math.max(left - s.position.x, 0, s.position.x - right),
      Math.max(north - s.position.z, 0, s.position.z - south),
    );
  const homeDistance = Math.min(
    distanceToRoom(-21, -9, -2, 14),
    distanceToRoom(-9, -1, 6, 14),
  );
  const wantedRoof = begun ? Math.min(1, homeDistance / 1.2) : 1;
  const roofMaterial = world.homeRoof.material as T.MeshStandardMaterial;
  roofMaterial.opacity +=
    (wantedRoof - roofMaterial.opacity) *
    (reducedMotion ? 1 : 1 - Math.exp(-dt * 9));
  world.homeRoof.visible = roofMaterial.opacity > 0.02;
  world.homeRoof.castShadow = roofMaterial.opacity > 0.95;
  world.momRoof.visible = world.homeRoof.visible;
  world.momRoof.castShadow = world.homeRoof.castShadow;
  roofMaterial.depthWrite = roofMaterial.opacity > 0.95;
  const roofIndex = world.occluders.indexOf(world.homeRoof);
  if (wantedRoof > 0.95 && roofMaterial.opacity > 0.95) {
    if (roofIndex < 0) world.occluders.push(world.homeRoof);
  } else if (roofIndex >= 0) world.occluders.splice(roofIndex, 1);
  if (world.life.busy || cookingScene || featherHandoff || bikeMountTime > 0)
    keys.clear();
  const active =
    begun &&
    !paused &&
    !document.hidden &&
    !birdhouseScene &&
    !celebration &&
    !hatHanging &&
    !estateFilm;
  updateNight(
    dt,
    active &&
      s.awake &&
      !speaking &&
      !cookingScene &&
      !featherHandoff &&
      !world.life.busy &&
      bikeMountTime <= 0,
  );
  updateMomGardenVisit(active && s.awake && !isNight(s) ? dt : 0);
  if (beaGuide) {
    if (
      active &&
      Math.hypot(
        s.position.x - world.bea.position.x,
        s.position.z - world.bea.position.z,
      ) < 7
    )
      beaGuide.distance += dt * 2.6;
    const point = alongRoute(
      beaGuide.route,
      beaGuide.distance / routeLength(beaGuide.route),
    );
    const dx = point.x - world.bea.position.x,
      dz = point.z - world.bea.position.z;
    if (Math.hypot(dx, dz) > 0.001) world.bea.rotation.y = Math.atan2(dx, dz);
    world.bea.position.set(point.x, 0, point.z);
    const target = world.targets.find((t) => t.id === "npc1")!;
    target.x = point.x;
    target.z = point.z + 1;
    world.beaCollider.x = point.x;
    world.beaCollider.z = point.z;
    if (beaGuide.distance >= routeLength(beaGuide.route)) {
      beaGuide = undefined;
      world.setBeaInside(true);
      speak("npc1", "<p>Come sit down, both of you. I’ll pour the tea.</p>", [
        { label: "Sit down with Mom", run: () => beaTea() },
      ]);
    }
  } else if (!celebration)
    world.setBeaInside(inBeaHouse(s.position) || teaSeated);
  const beaRoof = scene.getObjectByName("bea-house-roof") as T.Mesh;
  if (beaRoof) {
    const m = beaRoof.material as T.MeshStandardMaterial;
    m.opacity +=
      ((inBeaHouse(s.position) ? 0 : 1) - m.opacity) * (1 - Math.exp(-dt * 9));
    beaRoof.visible = m.opacity > 0.02;
    m.depthWrite = m.opacity > 0.95;
    beaRoof.castShadow = m.opacity > 0.95;
  }
  if (
    active &&
    s.awake &&
    canSaveShop(s) &&
    !s.familyStory!.shopReadyNotified
  ) {
    s.familyStory!.shopReadyNotified = true;
    save();
    toast("You did it! Go tell Ol’ Man Robertson you can save his shop.");
  }
  if (s.familyStory?.escort && !teaSeated && !celebration) {
    if (!momTrail.length) momTrail.push({ ...s.position });
    const last = momTrail.at(-1)!;
    if (Math.hypot(last.x - s.position.x, last.z - s.position.z) > 0.55)
      momTrail.push({ ...s.position });
    while (
      momTrail.length > 1 &&
      Math.hypot(
        world.mom.position.x - momTrail[0].x,
        world.mom.position.z - momTrail[0].z,
      ) < 0.6
    )
      momTrail.shift();
    const destination = momTrail[0];
    const distance = Math.hypot(
      world.mom.position.x - destination.x,
      world.mom.position.z - destination.z,
    );
    const gap = momTrail.length > 1 ? 0.15 : 1.7;
    if (active && distance > gap) {
      const dx = destination.x - world.mom.position.x,
        dz = destination.z - world.mom.position.z;
      const step = Math.min(distance - gap, dt * 3.6);
      const p = { x: world.mom.position.x, z: world.mom.position.z };
      move(
        p,
        (dx / distance) * step,
        (dz / distance) * step,
        world.rects.filter((r) => r !== world.momCollider),
      );
      positionStoryMom(p.x, p.z);
      world.mom.rotation.y = Math.atan2(dx, dz);
    }
  }
  const bikeDistance = Math.hypot(
    Math.max(
      bikeShopBounds.left - s.position.x,
      0,
      s.position.x - bikeShopBounds.right,
    ),
    Math.max(
      bikeShopBounds.north - s.position.z,
      0,
      s.position.z - bikeShopBounds.south,
    ),
  );
  const bikeRoofMat = world.bikeShopRoof.material as T.MeshStandardMaterial;
  bikeRoofMat.opacity +=
    ((begun ? Math.min(1, bikeDistance / 1.5) : 1) - bikeRoofMat.opacity) *
    (reducedMotion ? 1 : 1 - Math.exp(-dt * 9));
  world.bikeShopRoof.visible = bikeRoofMat.opacity > 0.02;
  bikeRoofMat.depthWrite = bikeRoofMat.opacity > 0.95;
  world.bikeShopRoof.castShadow = bikeRoofMat.opacity > 0.95;
  world.bikeShopSign.visible = !inBikeShop(s.position);
  const balloonView =
    !!s.pepeShowStarted && (!s.pepePopped || pepeViewHold > 0);
  const farPlane = s.position.z < -90 ? 700 : balloonView ? 250 : 110;
  if (camera.far !== farPlane) {
    camera.far = farPlane;
    camera.updateProjectionMatrix();
  }
  const fog = scene.fog as T.Fog;
  fog.near +=
    ((balloonView ? 90 : s.position.z < -90 ? 140 : 35) - fog.near) *
    (1 - Math.exp(-dt * 3));
  fog.far +=
    ((balloonView ? 220 : s.position.z < -90 ? 500 : 90) - fog.far) *
    (1 - Math.exp(-dt * 3));
  setCss(speechLayer.style, "visibility", balloonView ? "hidden" : "");
  if (active) {
    if (s.awake) {
      if (tickSurgery(s, elapsed)) {
        save();
        momPhone();
      }
      if (momAway(s) && !s.familyStory?.called) {
        storyThoughtClock += elapsed;
        if (storyThoughtClock >= 18) {
          storyThoughtClock = 0;
          thought.textContent =
            surgeryThoughts[storyThoughtIndex++ % surgeryThoughts.length];
          setHidden(thought, false);
          thoughtTime = 11;
        }
      }
      pepeViewHold = Math.max(0, pepeViewHold - dt);
      const inPepe =
        canEnterPepe(s) &&
        Math.abs(s.position.x + 18) < 6.5 &&
        Math.abs(s.position.z + 65) < 6.5;
      if (!inPepe) pepeGreeted = false;
      if (!isNight(s) && inPepe && !pepeGreeted && !s.pepeShowStarted) {
        pepeGreeted = true;
        pepeConversation();
      }
      if (s.pepeShowStarted && !s.pepePopped) {
        const before = s.pepeInflation ?? 0;
        const popped = tickPepeShow(s, dt);
        if (popped) {
          pepeViewHold = 2.25;
          pepeReturning = true;
          balloonSound(true);
          save();
          toast(
            "POP! Seed packets everywhere. Time to make room for more beds!",
          );
        } else if (Math.floor(before) !== Math.floor(s.pepeInflation ?? 0))
          balloonSound();
      }
      const inDoge =
        s.foundTVSeeds &&
        Math.abs(s.position.x + 18) < 6.5 &&
        s.position.z > -56 &&
        s.position.z < -42;
      if (!inDoge) dogeGreeted = false;
      if (
        inDoge &&
        !dogeGreeted &&
        !s.foundMeditationSeeds &&
        meditationTime <= 0
      ) {
        dogeGreeted = true;
        toast("Me: Hi, everyone!");
        offerMeditation();
      }
      if (meditationTime > 0) {
        const previous = meditationTime;
        meditationTime = Math.max(0, meditationTime - dt);
        if (
          Math.floor((30 - previous) / 5) !==
            Math.floor((30 - meditationTime) / 5) &&
          meditationTime > 0
        )
          toast(
            meditationChants[
              Math.min(5, Math.floor((30 - meditationTime) / 5))
            ],
          );
        if (meditationTime === 0) finishMeditation();
      }
      const seedConversation =
        speaking?.id === "stacy" ||
        speaking?.id === "pepe-show" ||
        speaking?.id.startsWith("doge-meditator-") ||
        meditationTime > 0 ||
        (s.pepeShowStarted && !s.pepePopped) ||
        pepeViewHold > 0;
      const searchHint = seedSearchClock.update(
        s,
        elapsed,
        !!seedConversation ||
          momAway(s) ||
          !!s.familyStory?.escort ||
          speaking?.id.startsWith("millionaire-") ||
          speaking?.id.startsWith("fellowship-") ||
          speaking?.id === "willow-guru",
      );
      if (searchHint) toast(searchHint);
      if (
        ["arrowleft", "arrowright", "arrowup", "arrowdown"].some((k) =>
          keys.has(k),
        )
      )
        lastLookInput = now;
      if (keys.has("arrowleft")) yaw += dt * 1.8;
      if (keys.has("arrowright")) yaw -= dt * 1.8;
      if (!riding && (keys.has("arrowup") || keys.has("arrowdown")))
        cameraTilted = true;
      if (!riding)
        pitch = T.MathUtils.clamp(
          pitch +
            ((keys.has("arrowdown") ? 1 : 0) - (keys.has("arrowup") ? 1 : 0)) *
              dt *
              0.8,
          0.15,
          1.1,
        );
      let f = (keys.has("w") ? 1 : 0) - (keys.has("s") ? 1 : 0),
        r = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
      rollCooldown = Math.max(0, rollCooldown - dt);
      const wasAirborne = jumpHeight > 0;
      jumpHeight = Math.max(0, jumpHeight + jumpVelocity * dt);
      if (jumpHeight > 0) jumpVelocity -= 13 * dt;
      else jumpVelocity = 0;
      const movementRects = airborneRects(world.rects, jumpHeight);
      if (
        wasAirborne &&
        jumpHeight === 0 &&
        blocked(s.position.x, s.position.z, world.rects)
      )
        s.position = clearPosition(
          s.position,
          world.rects,
          s.millionaire?.unlocked ? -470 : s.foundTVSeeds ? -89 : -39,
        );
      const rolling = rollTime > 0;
      if (riding) {
        yaw -= r * dt * 1.6;
        const wanted =
          f *
          bikeById(s.selectedBike)!.speed *
          bikeSpecial.speedMultiplier *
          (f < 0 ? 0.45 : 1);
        rideSpeed += (wanted - rideSpeed) * (1 - Math.exp(-dt * (f ? 4 : 10)));
        const origin = { ...s.position },
          forward = viewForward();
        move(
          s.position,
          forward.x * rideSpeed * dt,
          forward.z * rideSpeed * dt,
          world.rects,
        );
        actualRideSpeed =
          dt > 0
            ? Math.hypot(s.position.x - origin.x, s.position.z - origin.z) / dt
            : 0;
        rideDistance += Math.hypot(
          s.position.x - origin.x,
          s.position.z - origin.z,
        );
        if (rideDistance >= 1)
          visit(`Rode my ${bikeById(s.selectedBike)!.name} bicycle.`);
        if (actualRideSpeed < Math.abs(rideSpeed) * 0.2) rideSpeed = 0;
        if (ridingIndoors()) {
          dismountBike();
          toast("Hop off your bike to go inside. H mounts it again outside.");
        }
      }
      const n =
        sitting ||
        riding ||
        rolling ||
        (s.pepeShowStarted && !s.pepePopped) ||
        pepeViewHold > 0
          ? 0
          : Math.hypot(f, r);
      if (n) {
        if (wearing(s, "propeller"))
          noteHatPower(s, "to get around faster", "propeller");
        f /= n;
        r /= n;
        const direction = viewForward(),
          speed = dt * movementSpeed(s, keys.has("shift"));
        const dx = (f * direction.x - r * direction.z) * speed,
          dz = (f * direction.z + r * direction.x) * speed;
        move(
          s.position,
          dx,
          dz,
          movementRects,
          walkingStepHeight(s, jumpHeight),
        );
        world.player.rotation.y = Math.atan2(dx, dz);
        walk += dt * (keys.has("shift") ? 17.5 : 10);
        world.player.position.y = reducedMotion ? 0 : Math.sin(walk) * 0.045;
      } else
        world.player.position.y = sitting
          ? meditationTime > 0
            ? 0.15
            : sittingWithStacy
              ? 0.52
              : teaSeated
                ? TEA_SEAT_HEIGHT
                : 0.69
          : 0;
      if (rolling) {
        move(
          s.position,
          rollDirection.x * Math.min(dt, rollTime) * 10,
          rollDirection.z * Math.min(dt, rollTime) * 10,
          world.rects,
        );
        world.player.rotation.y = Math.atan2(rollDirection.x, rollDirection.z);
        rollTime = Math.max(0, rollTime - dt);
      }
      if (
        s.plots.some(
          (p, i) =>
            p.soilFilled !== false &&
            Math.abs(s.position.x - (p.x ?? -20 + i * 2)) < 0.85 &&
            Math.abs(s.position.z - (p.z ?? 19)) < 1.7,
        )
      )
        world.player.position.y += 0.29;
      world.player.position.y +=
        jumpHeight + terrainHeight(s.position.x, s.position.z);
      if (action) {
        if (
          Math.hypot(
            s.position.x - action.origin.x,
            s.position.z - action.origin.z,
          ) > 0.2
        ) {
          action = undefined;
          toast(
            "Planting cancelled. Your seed is safe. Press E, then stand still to plant.",
          );
        } else {
          action.elapsed += elapsed;
          if (action.elapsed >= action.duration) {
            const plantedId = action.id;
            if (action.crop) plantCrop(s, action.id, action.crop);
            else plantBatch(s, action.ids);
            action = undefined;
            save();
            toast(
              s.plots[plantedId]?.stage === "growing"
                ? s.plots[plantedId].mountain
                  ? "Planted in fertile terrace soil. Ready after sleep."
                  : "Seed watered. Add fertilizer if you have some."
                : "A seed, a promise. Now give it some water.",
            );
          }
        }
      }
      tick(s, elapsed);
      if (!isNight(s)) {
        const found = forageFarm(s, dt, !riding && jumpHeight < 0.3);
        if (found) {
          seedChime();
          toast(`Picked up a bag of 5 ${found} seeds in Robertson’s fields.`);
          save();
        }
      }
      registerTraders(
        s,
        world.speakers.filter((n) => n.object.userData.chad).map((n) => n.id),
      );
      tickSigma(s, elapsed);
      if (!cookingScene) tickFood(s, elapsed);
      const homeNow = atHome();
      const momInside =
        !momGardenVisit &&
        s.momHomeStory?.gardenDay !== s.day &&
        !momAway(s) &&
        !s.familyStory?.escort &&
        !teaSeated &&
        momStatus(s.day, s.familyStory).activity !== "garden";
      if (wasHome && !homeNow) visitedOutside = true;
      if (!isNight(s) && !wasHome && homeNow && visitedOutside && momInside) {
        momSpoke = true;
        returnToMom();
      }
      wasHome = homeNow;
      if (world.mom.userData.coughTime > 0) {
        world.mom.userData.coughTime = Math.max(
          0,
          world.mom.userData.coughTime - dt,
        );
        world.mom.rotation.z = Math.sin(now * 0.035) * 0.07;
      } else world.mom.rotation.z = 0;
      if (
        !isNight(s) &&
        !momSpoke &&
        atHome() &&
        s.position.z > 6 &&
        momInside
      ) {
        momSpoke = true;
        s.metMom = true;
        visit("Talked with Mom before heading out.");
        const greeting = momGreeting();
        visit(`Heard Mom: ${greeting}`);
        if (
          s.familyStory ||
          s.adventure?.feather ||
          (canTellMomAboutMansion(s) && (s.momHomeStory?.mansionStage ?? 0) > 0)
        )
          askMom();
        else
          speak("mom", `<p>${greeting}</p>`, [
            ...(canTellMom(s)
              ? [
                  {
                    label: "Tell Mom you've got $10k",
                    destructive: true,
                    run: tellMom,
                  },
                ]
              : []),
            { label: "How are you doing?", run: askMom },
            ...(s.spanakopita
              ? [{ label: "Share spanakopita with Mom", run: shareWithMom }]
              : []),
          ]);
      }
      if (
        s.metRobertson &&
        s.position.z > -23 &&
        s.position.z < -21 &&
        s.position.x > 5 &&
        s.position.x < 9
      ) {
        if (!world.player.userData.farewell) {
          toast("Robertson: “Come back anytime!”");
          world.player.userData.farewell = true;
        }
      }
    }
    saveTime += elapsed;
    if (saveTime > 10) {
      save();
      saveTime = 0;
    }
  }
  const bounds = playableBounds(s);
  s.position.x = T.MathUtils.clamp(s.position.x, bounds.left, bounds.right);
  s.position.z = T.MathUtils.clamp(s.position.z, bounds.top, bounds.bottom);
  world.bikeRack.sync(
    s.bikes ?? [],
    parkedBikeId && (riding || bikeMountTime > 0 || parkedBike?.visible)
      ? parkedBikeId
      : undefined,
  );
  bikeSpecial.update(
    active && s.awake ? dt : 0,
    new T.Vector3(
      s.position.x,
      terrainHeight(s.position.x, s.position.z),
      s.position.z,
    ),
    yaw,
    rideEyeHeight(),
    riding,
  );
  world.player.position.x = s.position.x;
  world.player.position.z = s.position.z;
  world.player.visible = (s.awake || !begun) && !riding && followDistance > 0.9;
  bikeCockpit.object.visible = begun && riding;
  document.body.classList.toggle("riding", riding);
  setHidden($("#bike-bell-help"), !riding);
  setHidden($("#bike-special-help"), !riding);
  if (riding && s.selectedBike)
    setText(
      $("#bike-special-name"),
      `${bikeFeatures[s.selectedBike].name}${bikeSpecial.cooldown(s.selectedBike) > 0 ? ` (${Math.ceil(bikeSpecial.cooldown(s.selectedBike))}s)` : ""}`,
    );
  if (riding) bikeCockpit.update(active ? actualRideSpeed : 0, s.selectedBike!);
  world.sleeping.visible = begun && !s.awake;
  world.setSigmaUnlocked(!!s.foundTVSeeds);
  world.setMillionaireOpen(!!s.millionaire?.unlocked);
  world.millionaire.update(s, active && s.awake ? dt : 0);
  if (s.millionaire?.unlocked && !millionairePathNoticed && begun) {
    toast(
      "A gap has opened in Sigma Town’s east hedge, between the ATM and town entrance. Follow the path into the willow grove. You can now wear five hats at once.",
    );
    millionairePathNoticed = true;
  } else if (!s.millionaire?.unlocked) millionairePathNoticed = false;
  if (active && s.awake && !speaking && !paused && !isNight(s)) {
    const greeting = world.millionaire.approachGreeting(s, dt);
    if (greeting) fellowshipConversation(greeting);
    const owner = world.millionaire.greeting(s);
    if (owner !== undefined) childConversation(owner);
  }
  world.sigma.updateWalkers(
    active && s.awake && s.foundTVSeeds && !reducedMotion ? dt : 0,
    s.position.x,
    s.position.z,
    speaking?.id,
  );
  world.sigma.updateHandoff(dt, reducedMotion);
  world.sigma.updateATM(s.coin?.name);
  world.sigma.updateRoofs(s.position.x, s.position.z);
  world.sigma.updatePepe(
    canEnterPepe(s),
    s.pepeInflation ?? 0,
    !!s.pepePopped,
    s.pepePackets ?? [],
    active ? dt : 0,
    reducedMotion,
  );
  meteorWorld.update(s, active && s.awake ? dt : 0);
  world.syncBeds(s.plots);
  profiling.count("plotSyncPasses");

  while (timers.length < s.plots.length) {
    const el = document.createElement("div");
    el.className = "tree-timer";
    timerLayer.append(el);
    timers.push(el);
  }
  while (timers.length > s.plots.length) {
    timers.pop()!.remove();
  }
  if (placingBed && !s.gardenBeds) placingBed = false;
  bedGhost.visible = placingBed && begun && !paused;
  if (placingBed) {
    const p = bedPosition();
    bedGhost.position.set(p.x, 0.2, p.z);
    bedGhost.material.color.set(
      canPlaceBed(s, p.x, p.z, bedObstacles()) ? 0x77b67a : 0xc76862,
    );
  }
  let treesChanged = false;
  for (let i = 0; i < s.plots.length; i++) {
    const p = s.plots[i],
      v = `${p.stage}:${p.fertilized}:${p.crop ?? "money"}`;
    if (v !== plotVersions.get(world.plots[i])) {
      world.moneyTree(i, p.stage, p.fertilized, p.crop);
      profiling.count("treeModelsBuilt");
      plotVersions.set(world.plots[i], v);
      treesChanged = true;
    }
  }
  if (
    treesChanged &&
    s.awake &&
    !sitting &&
    blocked(s.position.x, s.position.z, world.rects)
  ) {
    s.position = clearPosition(
      s.position,
      world.rects,
      s.millionaire?.unlocked ? -470 : s.foundTVSeeds ? -89 : -39,
    );
    world.player.position.set(s.position.x, 0, s.position.z);
    save();
  }
  for (const plot of world.plots) plot.scale.setScalar(1);
  for (const b of world.bills) {
    if (b.parent && !reducedMotion)
      b.rotation.z = Math.sin(now * 0.002 + b.userData.phase) * 0.12;
  }
  if (!begun) {
    followInitialized = false;
    camera.position.set(-5, 15, 35);
    cameraAim.set(-7, 1, 10);
    camera.lookAt(cameraAim);
  } else if (birdhouseScene) {
    // The birdhouse film owns the camera for the whole frame.
  } else if (celebration) {
    const center = celebration.center;
    camera.position.lerp(
      new T.Vector3(
        center.x + (celebration.kind === "shop" ? 6 : 7),
        celebration.kind === "shop" ? 7 : 8,
        center.z + (celebration.kind === "shop" ? 6 : 9),
      ),
      1 - Math.exp(-dt * 4),
    );
    cameraAim.set(center.x, 1, center.z);
    camera.lookAt(cameraAim);
  } else if (s.pepeShowStarted && (!s.pepePopped || pepeViewHold > 0)) {
    const fraction = (s.pepeInflation ?? 0) / 12;
    const ease = reducedMotion ? 1 : 1 - Math.exp(-dt * 4);
    camera.position.lerp(
      new T.Vector3(
        18 + fraction * 32,
        24 + fraction * 25,
        -33 + fraction * 24,
      ),
      ease,
    );
    cameraAim.lerp(new T.Vector3(-18, 7.2, -65), ease);
    camera.lookAt(cameraAim);
  } else if (!s.awake) {
    followInitialized = false;
    camera.position.set(-16.8, 3.8, 4.2);
    cameraAim.set(-19.1, 1.35, 0.75);
    camera.lookAt(cameraAim);
  } else if (world.life.cuddling !== undefined) {
    const center = world.player.position.clone().add(new T.Vector3(0, 1.35, 0));
    const front = new T.Vector3(0, 0.45, 3.1).applyAxisAngle(
      new T.Vector3(0, 1, 0),
      world.player.rotation.y,
    );
    camera.position.lerp(
      center.clone().add(front),
      reducedMotion ? 1 : 1 - Math.exp(-dt * 5),
    );
    cameraAim.copy(center);
    camera.lookAt(cameraAim);
  } else if (world.life.sharing || featherHandoff) {
    const center = world.player.position
      .clone()
      .lerp(world.mom.position, 0.5)
      .add(new T.Vector3(0, 1.1, 0));
    const separation = world.player.position.distanceTo(world.mom.position);
    const shot = center
      .clone()
      .add(new T.Vector3(3 + separation * 0.3, 2, 4 + separation * 0.4));
    cameraWalls.update(world.occluders, center, camera.position, shot);
    camera.position.lerp(shot, reducedMotion ? 1 : 1 - Math.exp(-dt * 6));
    cameraAim.copy(center);
    camera.lookAt(cameraAim);
  } else if (spanakopitaShot) {
    camera.position.copy(spanakopitaShot.position);
    cameraAim.copy(spanakopitaShot.aim);
    camera.lookAt(cameraAim);
    spanakopitaShot = undefined;
    followInitialized = true;
  } else if (teaSeated) {
    // An interior view of all three chairs and the tea table.
    const easing = reducedMotion ? 1 : 1 - Math.exp(-dt * 7);
    camera.position.lerp(new T.Vector3(14.5, 3.6, 17.2), easing);
    cameraAim.lerp(new T.Vector3(11.7, 1.5, 15.2), easing);
    camera.lookAt(cameraAim);
  } else if (riding) {
    rideTransition = Math.min(1, rideTransition + dt / 0.4);
    const eye = new T.Vector3(
      s.position.x,
      rideEyeHeight() +
        bikeSpecial.lift +
        terrainHeight(s.position.x, s.position.z),
      s.position.z,
    );
    camera.position
      .copy(eye)
      .addScaledVector(
        rideCameraOffset,
        reducedMotion ? 0 : Math.pow(1 - rideTransition, 3),
      );
    const tilt = T.MathUtils.clamp((pitch - 0.42) * 0.9, -0.35, 0.6),
      forward = viewForward();
    const aim = eye
      .clone()
      .add(
        new T.Vector3(
          forward.x * Math.cos(tilt),
          -Math.sin(tilt),
          forward.z * Math.cos(tilt),
        ).multiplyScalar(6),
      );
    cameraAim.lerp(aim, reducedMotion ? 1 : 1 - Math.exp(-dt * 16));
    camera.lookAt(cameraAim);
  } else {
    const wantedAngle = pitch;
    const easing = reducedMotion
      ? 1
      : 1 - Math.exp(-dt * (now - lastLookInput < 500 ? 16 : 6));
    followAngle += (wantedAngle - followAngle) * easing;
    const stackHeight =
      (world.wornHat.userData.height ?? 0) * (s.soyEffects?.burger ? 2 : 1);
    const displayDistance =
      zoomDistance > 3
        ? Math.max(zoomDistance, stackHeight * 1.65 + 1.8)
        : zoomDistance;
    followDistance +=
      (displayDistance - followDistance) *
      (reducedMotion ? 1 : 1 - Math.exp(-dt * 12));
    if (Math.abs(followDistance - displayDistance) < 0.01)
      followDistance = displayDistance;
    const angle = followAngle;
    const firstPerson = 1 - T.MathUtils.smoothstep(followDistance, 0, 1.5);
    const target = new T.Vector3(
        s.position.x,
        terrainHeight(s.position.x, s.position.z) +
          (s.soyEffects?.burger ? 2.8 : 1.4) +
          firstPerson * 0.3 +
          (zoomDistance > 3 ? Math.max(0, stackHeight - 1.4) * 0.35 : 0) +
          jumpHeight +
          (sitting
            ? sittingWithStacy
              ? 0.52
              : meditationTime > 0
                ? 0.15
                : 0.69
            : 0),
        s.position.z -
          (speaking?.id.startsWith("doge-meditator-") ||
          speaking?.id === "pepe-show" ||
          meditationTime > 0
            ? 3
            : 0),
      ),
      desired = target
        .clone()
        .add(
          new T.Vector3(
            Math.sin(yaw) * Math.cos(angle) * followDistance,
            (Math.sin(angle) + 1 / 5.8) * followDistance,
            Math.cos(yaw) * Math.cos(angle) * followDistance,
          ),
        );
    cameraWalls.update(world.occluders, target, camera.position, desired);
    const cameraSolids = world.occluders.filter(
      (object) => effectivelyVisible(object) && !object.userData.cameraWall,
    );
    const direction = desired.clone().sub(target),
      length = direction.length();
    ray.set(target, direction.normalize());
    ray.far = length + 0.3;
    let distance = length;
    for (const offset of [
      new T.Vector3(),
      new T.Vector3(0.3, 0, 0),
      new T.Vector3(-0.3, 0, 0),
      new T.Vector3(0, 0.45, 0),
      new T.Vector3(0, -0.3, 0),
    ]) {
      ray.set(target.clone().add(offset), direction);
      ray.far = length + 0.3;
      const hits = ray.intersectObjects(cameraSolids, false);
      if (hits.length)
        distance = Math.min(distance, Math.max(0.4, hits[0].distance - 0.4));
    }
    const ideal = target.clone().addScaledVector(direction, distance);
    if (pepeReturning && camera.position.distanceTo(target) < 12)
      pepeReturning = false;
    const cameraJump =
      !followInitialized ||
      (camera.position.distanceTo(target) > length + 1.5 && !pepeReturning);
    followInitialized = true;
    const next = cameraJump
      ? ideal.clone()
      : camera.position.clone().lerp(ideal, easing);
    if (
      !reducedMotion &&
      !cameraJump &&
      (camera.position.distanceTo(target) < 20 || pepeReturning)
    ) {
      const travel = next.clone().sub(camera.position);
      if (travel.length() > dt * 12)
        next.copy(camera.position).add(travel.setLength(dt * 12));
    }
    // Shorten the boom on the player's current side of a wall. Sweeping the
    // old camera from outside can strand it on the wrong side of a doorway.
    const sight = next.clone().sub(target);
    if (sight.length() > 0.001) {
      ray.set(target, sight.clone().normalize());
      ray.far = sight.length();
      const hit = ray.intersectObjects(cameraSolids, false)[0];
      if (hit)
        next
          .copy(target)
          .addScaledVector(ray.ray.direction, Math.max(0, hit.distance - 0.2));
    }
    for (let pass = 0; pass < 3; pass++)
      for (const object of cameraSolids) {
        const box = cameraWalls.bounds(object).clone().expandByScalar(0.14);
        if (!box.containsPoint(next)) continue;
        const faces = (["x", "y", "z"] as const)
          .flatMap((axis) => [
            {
              axis,
              value: box.min[axis] - 0.02,
              d: next[axis] - box.min[axis],
            },
            {
              axis,
              value: box.max[axis] + 0.02,
              d: box.max[axis] - next[axis],
            },
          ])
          .sort((a, b) => a.d - b.d);
        next[faces[0].axis] = faces[0].value;
      }
    // Containment correction must never strand the camera outside its follow boom.
    if (!pepeReturning && next.distanceTo(target) > length + 0.5)
      next
        .sub(target)
        .setLength(length + 0.5)
        .add(target);
    if (
      s.adventure?.meteors?.some(
        (m) =>
          m.landed && Math.hypot(s.position.x - m.x, s.position.z - m.z) < 10,
      )
    )
      next.y = Math.max(next.y, 2.2, terrainHeight(next.x, next.z) + 0.65);
    camera.position.copy(next);
    const tilt = T.MathUtils.clamp((pitch - 0.42) * 0.9, -0.35, 0.6);
    const forward = viewForward();
    const aim = target
      .clone()
      .lerp(
        target
          .clone()
          .add(
            new T.Vector3(
              forward.x * Math.cos(tilt),
              -Math.sin(tilt),
              forward.z * Math.cos(tilt),
            ).multiplyScalar(6),
          ),
        firstPerson,
      );
    aim.y += 0.38 * (1 - firstPerson);
    if (cameraJump) cameraAim.copy(aim);
    else cameraAim.lerp(aim, easing);
    camera.lookAt(cameraAim);
  }

  // Exterior branding stays outside the cutaway interior view.
  const insideRobertsons =
    s.position.x > -4 &&
    s.position.x < 16 &&
    s.position.z < -21 &&
    s.position.z > -39;
  for (const name of ["robertsons-name", "robertsons-trade"])
    scene.getObjectByName(name)!.visible = !insideRobertsons;
  const roof = world.robertsonsRoof;
  const roofMat = roof.material as T.MeshStandardMaterial;
  roofMat.opacity +=
    ((insideRobertsons ? 0 : 1) - roofMat.opacity) * (1 - Math.exp(-dt * 9));
  roof.visible = roofMat.opacity > 0.02;
  roofMat.depthWrite = roofMat.opacity > 0.95;
  roof.castShadow = roofMat.opacity > 0.95;
  const news = newsFeed.read(s);
  const report = news[Math.floor(now / 18000) % news.length];
  const soundsActive =
    begun && s.awake && !paused && !document.hidden && !muted && atHome();
  const keyboardDistance = Math.hypot(
    s.position.x - world.mom.position.x,
    s.position.z - world.mom.position.z,
  );
  keyboardAudio.update(
    audio,
    soundsActive &&
      !momAway(s) &&
      world.mom.userData.activity === "music" &&
      keyboardDistance < 10
      ? "keyboard"
      : "",
    Math.max(0, 1 - keyboardDistance / 10) * 0.04,
  );
  world.updateCartoon(
    reducedMotion ? 0 : now / 1000,
    s.tvChannel ?? "cartoons",
    report.headline,
    report.report,
  );
  world.wildlife.update(reducedMotion ? 0 : now / 1000);
  world.setDigging(!!action, !!s.shovel, action?.elapsed ?? 0);
  if (wateringAnimation && active) {
    wateringAnimation.elapsed += dt;
    if (
      wateringAnimation.elapsed >= 0.9 ||
      action ||
      fertilizerAnimation ||
      riding ||
      sitting ||
      !s.awake
    )
      wateringAnimation = undefined;
  }
  world.setWatering(
    !!wateringAnimation && !riding,
    wateringAnimation?.elapsed ?? 0,
    wateringAnimation?.x ?? 0,
    wateringAnimation?.z ?? 0,
  );
  if (fertilizerAnimation && active) {
    fertilizerAnimation.elapsed += dt;
    if (fertilizerAnimation.elapsed >= 1.6 || action || riding || sitting)
      fertilizerAnimation = undefined;
  }
  world.setFertilizing(
    !!fertilizerAnimation,
    fertilizerAnimation?.elapsed ?? 0,
    fertilizerAnimation?.x ?? 0,
    fertilizerAnimation?.z ?? 0,
  );
  updateRollPose();
  if (hatHanging) {
    if (!paused && !document.hidden) hatHanging.elapsed += dt;
    const a = hatHanging,
      progress = Math.min(1, a.elapsed / 1.8),
      q = progress * progress * (3 - 2 * progress);
    a.model.position.copy(a.from).lerp(a.to, q);
    a.model.position.y += Math.sin(progress * Math.PI) * 0.35;
    a.model.scale.setScalar(1 - q * 0.54);
    a.model.rotation.y = q * 0.3;
    world.player
      .getObjectByName("hand-1")!
      .position.copy(world.player.worldToLocal(a.model.position.clone()));
    if (progress === 1) {
      scene.remove(a.model);
      a.model.traverse((o) => {
        if (o instanceof T.Mesh) {
          o.geometry.dispose();
          (o.material as T.Material).dispose();
        }
      });
      hatHanging = undefined;
    }
  }
  for (let i = 0; i < s.plots.length; i++) {
    const el = timers[i];
    if (
      !begun ||
      !s.awake ||
      s.plots[i].stage !== "ready" ||
      (s.plots[i].crop && isFlower(s.plots[i].crop!))
    ) {
      if (!el.hidden) setHidden(el, true);
      continue;
    }
    timerPosition.copy(world.plots[i].position);
    timerPosition.y += 0.45;
    if (timerPosition.distanceToSquared(camera.position) > 17 * 17) {
      if (!el.hidden) setHidden(el, true);
      continue;
    }
    timerPosition.project(camera);
    if (timerPosition.z > 1) {
      if (!el.hidden) setHidden(el, true);
      continue;
    }
    if (el.hidden) setHidden(el, false);
    setCss(el.style, "left", `${(timerPosition.x * 0.5 + 0.5) * innerWidth}px`);
    setCss(
      el.style,
      "top",
      `${(-timerPosition.y * 0.5 + 0.5) * innerHeight}px`,
    );
    if (el.textContent !== "$ Ready to harvest")
      el.textContent = "$ Ready to harvest";
  }
  updateDesertThought(active && s.awake ? dt : 0);
  if (thoughtTime > 0 && active && !speaking) {
    thoughtTime -= dt;
    if (thoughtTime <= 0) setHidden(thought, true);
  }
  if (thoughtTime > 0) {
    const anchor = world.player.position
      .clone()
      .add(
        new T.Vector3(
          0,
          2.35 +
            new T.Box3().setFromObject(world.wornHat).getSize(new T.Vector3())
              .y,
          0,
        ),
      );
    anchor.project(camera);
    const anchorX = (anchor.x * 0.5 + 0.5) * innerWidth;
    const anchorY = Math.max(
      140,
      Math.min(innerHeight - 80, (-anchor.y * 0.5 + 0.5) * innerHeight),
    );
    const width = thought.offsetWidth || 300,
      height = thought.offsetHeight || 112;
    let center = Math.max(
      width / 2 + 20,
      Math.min(innerWidth - width / 2 - 20, anchorX),
    );
    const spoken = speaking?.element.getBoundingClientRect();
    if (
      spoken &&
      center + width / 2 > spoken.left &&
      center - width / 2 < spoken.right &&
      anchorY > spoken.top &&
      anchorY - height < spoken.bottom
    ) {
      center = Math.max(
        width / 2 + 20,
        Math.min(
          innerWidth - width / 2 - 20,
          anchorX >= (spoken.left + spoken.right) / 2
            ? spoken.right + width / 2 + 12
            : spoken.left - width / 2 - 12,
        ),
      );
    }
    const left = center - width / 2;
    const edge = Math.max(left + 20, Math.min(left + width - 20, anchorX));
    setCss(
      thought.style,
      "--tail-large",
      `${edge + (anchorX - edge) * 0.4 - left}px`,
    );
    setCss(
      thought.style,
      "--tail-small",
      `${edge + (anchorX - edge) * 0.8 - left}px`,
    );
    if (riding || (s.position.z < -170 && s.position.z > -330))
      center = innerWidth / 2;
    setCss(thought.style, "left", `${center}px`);
    setCss(
      thought.style,
      "top",
      `${riding || (s.position.z < -170 && s.position.z > -330) ? innerHeight * 0.28 : Math.min(anchorY, resourceHud.getBoundingClientRect().top - 24)}px`,
    );
    const inDesert = riding || (s.position.z < -170 && s.position.z > -330);
    if (inDesert) {
      setCss(thought.style, "--tail-large", `${width / 2}px`);
      setCss(thought.style, "--tail-small", `${width / 2}px`);
    }
    setCss(
      thought.style,
      "display",
      paused || !!speaking || (!inDesert && anchor.z > 1) ? "none" : "",
    );
  }
  setCss(
    $("#quest").style,
    "visibility",
    speaking || thoughtTime > 0 ? "hidden" : "",
  );
  neighborGardens.update(
    active ? dt : 0,
    speaking?.id,
    !!beaGuide || teaSeated || inBeaHouse(s.position),
    !!celebration,
  );
  featherModel.visible = !!s.adventure?.feather;
  if (
    active &&
    s.awake &&
    childrenHomesBuilt() &&
    !s.housing &&
    !s.millionaire!.chats["housing-ready"]
  ) {
    s.millionaire!.chats["housing-ready"] = 1;
    save();
    toast(
      "You can now buy a home on Mt. Millionaire. Talk to the Community Guardian in the summit pagoda.",
    );
  }
  estateWorld.update(s);
  world.life.update(active && !featherHandoff ? dt : 0, now / 1000);
  world.updateTea(active ? dt : 0, teaSeated, reducedMotion);
  hangMomCanvases();
  syncFurnishings();
  updateFurniturePlacement();
  if (active) {
    updateFeatherHandoff(dt);
    updateCooking(dt);
    if (bikeMountTime > 0) {
      bikeMountTime = Math.max(0, bikeMountTime - dt);
      world.player.position.lerpVectors(
        bikeHopFrom,
        bikeHopTo,
        1 - bikeMountTime,
      );
      world.player.position.y += Math.sin((1 - bikeMountTime) * Math.PI) * 0.5;
      s.position = { x: world.player.position.x, z: world.player.position.z };
      if (!bikeMountTime) mountBike(true);
    }
  }
  if (kitchenPrepared) {
    preparedPan.visible = true;
  } else preparedPan.visible = false;
  setHidden(foodHud, !s.foodBuff);
  if (s.foodBuff) {
    const f = meals[s.foodBuff.recipe];
    setHudHTML(
      foodHud,
      `${foodIllustration(s.foodBuff.recipe)}<span>${f.name}<br>${Math.ceil(s.foodBuff.remaining)}s</span>`,
    );
    setAttr(foodHud, "title", f.effect);
  }
  world.updateHouseBirds(now / 1000);
  world.sigma.fountain.update(now / 1000);
  updateCelebration(dt);
  updateSpeech(active ? dt : 0);
  if (
    active &&
    s.awake &&
    !action &&
    !celebration &&
    !birdhouseScene &&
    !cookingScene &&
    !sitting
  ) {
    if (!isNight(s)) collectWalkoverPackets(dt);
  }
  const uiStarted = profiling.start();
  updateUI();
  updateInventoryNotices(dt);
  profiling.end("ui", uiStarted);
  if (toastTime > 0) {
    toastTime -= dt;
    if (toastTime <= 0) setCss($("#toast").style, "opacity", "0");
  }
  if (birdhouseScene) {
    const film = birdhouseScene;
    if (!paused && !document.hidden) film.elapsed += dt;
    let localTime = film.elapsed;
    let segment = film.segments[film.segments.length - 1];
    film.placed = 0;
    for (const candidate of film.segments) {
      if (localTime < candidate.duration) {
        segment = candidate;
        break;
      }
      if (candidate.hang !== undefined) film.placed = candidate.hang + 1;
      localTime -= candidate.duration;
    }
    const fraction = Math.min(1, localTime / segment.duration);
    for (const [actor, route] of [
      [world.player, segment.player],
      [world.mom, segment.mom],
    ] as const) {
      const point = alongRoute(route, fraction),
        ahead = alongRoute(route, Math.min(1, fraction + 0.02));
      actor.visible = true;
      actor.position.set(point.x, 0, point.z);
      if (Math.hypot(ahead.x - point.x, ahead.z - point.z) > 0.001)
        actor.rotation.y = Math.atan2(ahead.x - point.x, ahead.z - point.z);
    }
    s.position = { x: world.player.position.x, z: world.player.position.z };
    film.carried.forEach((model, i) => {
      const destination = world.outdoorBirdhouses[film.start + i].position;
      const actor = i === 0 ? world.player : world.mom;
      const progress =
        segment.hang === i
          ? Math.max(0, Math.min(1, (localTime - 2.5) / 1.5))
          : 0;
      model.visible = i >= film.placed;
      model.position
        .copy(actor.position)
        .add(new T.Vector3(0.15, 1.25, 0.4))
        .lerp(destination, progress);
    });
    const center = world.player.position.clone().lerp(world.mom.position, 0.5);
    const shot = center.clone().add(new T.Vector3(7, 5, 8));
    cameraWalls.update(
      world.occluders,
      center.clone().add(new T.Vector3(0, 1.2, 0)),
      camera.position,
      shot,
    );
    camera.position.lerp(shot, 1 - Math.exp(-dt * 5));
    camera.lookAt(center.x, 1.1, center.z);
    setText(
      $("#prompt"),
      segment.hang === undefined
        ? film.placed === 2
          ? "We walk home together."
          : "We carry the birdhouses outside together."
        : segment.hang === 0
          ? "A home for the birds. Mom holds it steady while I help."
          : "One more. We picked these colors together.",
    );
    if (film.elapsed >= film.duration) {
      s.position = film.origin;
      film.carried.forEach((g) => scene.remove(g));
      birdhouseScene = undefined;
      world.setMomDay(s.day, true, true, s.familyStory);
      world.player.position.set(s.position.x, 0, s.position.z);
      followInitialized = false;
      save();
      toast("Our birdhouses are up. I hope somebody moves in soon.");
    }
  }
  updateEstateFilm(paused || document.hidden ? 0 : dt);
  if (momAway(s)) world.mom.visible = false;
  tvCaptions.update(
    camera,
    world.tvScreen.userData.headline ?? "Town News",
    world.tvScreen.userData.caption ?? "",
    begun &&
      s.awake &&
      !paused &&
      !speaking &&
      !celebration &&
      atHome() &&
      s.tvChannel === "news",
  );
  const renderStarted = profiling.start();
  if (!document.hidden) renderer.render(scene, camera);
  profiling.end("renderSubmit", renderStarted);
  profiling.end("frame", frameStarted);
}
requestAnimationFrame(frame);
// Explicitly enabled diagnostic harness; absent from ordinary production sessions.
if (profiling.enabled) (window as any).moneyTreeProfile = profiling;
if (new URLSearchParams(location.search).has("test")) {
  (window as unknown as { game: unknown }).game = {
    level3Entrance: () => ({
      bushes: world.level3PathBushes.map((b) => b.visible),
      path: (() => {
        const b = new T.Box3().setFromObject(
          scene.getObjectByName("millionaire-town-path-connection")!,
        );
        return { min: b.min.toArray(), max: b.max.toArray() };
      })(),
    }),
    bikeRack: () =>
      world.bikeRack.displays
        .filter((g) => g.visible)
        .map((g) => g.userData.bikeId),
    bikeSpecial: () => ({
      active: bikeSpecial.active,
      remaining: bikeSpecial.remaining,
      uses: bikeSpecial.uses,
      particles: bikeSpecial.particles,
      lift: bikeSpecial.lift,
      multiplier: bikeSpecial.speedMultiplier,
    }),
    bicycle: () => ({
      facade: [world.bikeShopSign, world.bikeShopRoof].map((o) => {
        const b = new T.Box3().setFromObject(o);
        return { min: b.min.toArray(), max: b.max.toArray() };
      }),
      riding,
      speed: actualRideSpeed,
      bellRings,
      firstPerson: bikeCockpit.object.visible,
      displays: world.bikeDisplays.map((g) => ({
        id: g.userData.bikeId,
        hung: g.userData.hung,
        position: g.position.toArray(),
      })),
    }),
    homeLiving: () => ({
      walls: homeWalls(),
      prepared: kitchenPrepared,
      cooking: cookingScene
        ? {
            elapsed: cookingScene.elapsed,
            recipe: cookingScene.recipe,
            bed: cookingScene.bed,
            route: cookingScene.route,
          }
        : null,
      placing: placingFurniture
        ? {
            valid: placingFurniture.valid,
            point: placingFurniture.point,
            updates: placingFurniture.previewUpdates,
          }
        : null,
      models: furnishingRoot.children.length,
      mounting: bikeMountTime,
      playerHeading: world.player.rotation.y,
      parkedHeading: parkedBike?.rotation.y,
      parked: parkedBike?.visible ? parkedBike.position.toArray() : null,
    }),
    spaceEstate: () => ({
      housing: s.housing,
      film: estateFilm ? { kind: estateFilm.kind, t: estateFilm.t } : null,
      meteors: s.adventure?.meteors ?? [],
      meteorSyncs: meteorWorld.stats(),
      craterParticles: scene.getObjectByName("uninvestigated-crater-particles")
        ?.visible,
      mom: world.mom.position.toArray(),
      momActivity: world.mom.userData.activity,
      gardenVisit: momGardenVisit
        ? { arrived: momGardenVisit.arrived, distance: momGardenVisit.distance }
        : null,
      feather: featherModel.visible,
      featherHandoff: featherHandoff?.t ?? null,
      featherParent: featherModel.parent?.name,
      featherOwner:
        featherModel.parent?.parent === world.mom ? "mom" : "player",
      featherPosition: featherModel.getWorldPosition(new T.Vector3()).toArray(),
      draws: renderer.info.render.calls,
    }),
    meteorIdleUpdates: (count: number) => {
      for (let i = 0; i < count; i++) meteorWorld.update(s, 0);
      return meteorWorld.stats();
    },
    advanceSpace: (dt: number) => {
      meteorWorld.update(s, dt);
      world.syncBeds(s.plots);
      syncTimers();
      save();
    },
    craterView: () => {
      const m = s.adventure?.meteors?.find((m) => m.landed);
      if (!m) return;
      camera.position.set(m.x + 13, 10, m.z + 16);
      camera.lookAt(m.x, -1, m.z);
      renderer.render(scene, camera);
    },
    estateView: () => {
      camera.position.set(mansionLot.x, 14, mansionLot.z + 42);
      camera.lookAt(mansionLot.x, 5, mansionLot.z);
      renderer.render(scene, camera);
    },
    bedLifecycleCheck: () => {
      const memory = () => ({ ...renderer.info.memory });
      const savedPosition = camera.position.clone(),
        savedRotation = camera.quaternion.clone();
      camera.position.set(-16, 9, 27);
      camera.lookAt(-16, 0, 19);
      const snapshots = [];
      try {
        renderer.render(scene, camera);
        snapshots.push(memory());
        for (let cycle = 0; cycle < 4; cycle++) {
          world.syncBeds([
            ...s.plots,
            {
              stage: "empty",
              remaining: 0,
              fertilized: false,
              yield: 0,
              x: -16,
              z: 19,
            },
          ]);
          renderer.render(scene, camera);
          world.syncBeds(s.plots);
          renderer.render(scene, camera);
          snapshots.push(memory());
        }
      } finally {
        camera.position.copy(savedPosition);
        camera.quaternion.copy(savedRotation);
      }
      return snapshots;
    },
    pepePackets: () =>
      world.sigma.debris.slice(0, 25).map((d) => ({
        visible: d.object.visible,
        position: d.object.position.toArray(),
      })),
    renderStats: () => ({
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
      programs: renderer.info.programs?.length,
      cameraBounds: cameraWalls.stats(),
    }),
    state: () => structuredClone(s),
    night: () => ({
      state: structuredClone(nightState(s)),
      dark: isNight(s),
      safe: !!nightShelterAt(s.position.x, s.position.z),
      enemies: structuredClone(nightCombat.enemies),
      bills: structuredClone(nightCombat.bills),
      loot: structuredClone(nightCombat.loot),
      sky: (scene.background as T.Color).getHexString(),
      ambient: hemisphere.intensity,
      warmLight: shelterLamp.intensity,
    }),
    nightClock: (seconds: number) => {
      const transition = tickNight(s, seconds);
      if (transition === "dawn") finishNight(false);
    },
    nightSpawn: (kind: "wallet" | "cow", x: number, z: number) =>
      nightCombat.spawn(kind, x, z),
    nightLifecycleCheck: () => {
      const combat = new NightCombat();
      const snapshots = [];
      try {
        for (let cycle = 0; cycle < 4; cycle++) {
          for (const kind of ["wallet", "cow"] as const) {
            combat.reset();
            for (let i = 0; i < 8; i++)
              combat.spawn(
                kind,
                s.position.x + (i % 4) - 2,
                s.position.z - 3 - Math.floor(i / 4),
              );
            nightWorld.update(combat, true, true);
            renderer.render(scene, camera);
          }
          snapshots.push({ ...renderer.info.memory });
        }
      } finally {
        nightWorld.update(nightCombat, isNight(s), reducedMotion);
      }
      return snapshots;
    },
    nightHurt: (hp: number) => {
      nightState(s).hp = hp;
      if (hp <= 0) finishNight(true);
    },
    storageFlush: () => saveStore?.flush(),
    savedRaw: (key?: string) => saveStore?.readRaw(key),
    savedState: async (key?: string) =>
      JSON.parse((await saveStore?.readRaw(key)) ?? "null"),
    playerPosition: () => world.player.position.toArray(),
    seated: () => sitting,
    rollPose: () => ({ angle: rollPose?.rotation.x ?? 0, remaining: rollTime }),
    seedHandoff: () => world.sigma.handoffPacket.visible,
    stacySeating: () => ({
      guest: world.sigma.guestChair.position.toArray(),
      host: world.sigma.stacyChair.position.toArray(),
    }),
    playerVisibility: () =>
      ["head", "body"].map((name) => {
        const point = world.player
          .getObjectByName(name)!
          .getWorldPosition(new T.Vector3());
        const direction = point.clone().sub(camera.position);
        const distance = direction.length();
        const sight = new T.Raycaster(
          camera.position,
          direction.normalize(),
          0,
          distance - 0.08,
        );
        return (
          sight.intersectObjects(
            world.occluders.filter((o) => o.visible && !o.userData.roof),
            false,
          ).length === 0
        );
      }),
    wildlife: () => ({
      birds: world.wildlife.birds.map((b) => ({
        position: b.object.position.toArray(),
        state: b.state,
        perch: b.perch,
      })),
      butterflies: world.wildlife.butterflies.map((b) => ({
        position: b.object.position.toArray(),
        garden: b.garden,
      })),
      gardens: world.neighborGardens.map((g) => ({
        position: g.position.toArray(),
        types: g.userData.plantTypes,
        layoutSeed: g.userData.layoutSeed,
        bounds: (() => {
          const b = new T.Box3().setFromObject(g);
          return { min: b.min.toArray(), max: b.max.toArray() };
        })(),
      })),
    }),
    townLife: () => ({
      chickens: world.life.chickens.map((c) => ({
        name: c.name,
        x: c.object.getWorldPosition(new T.Vector3()).x,
        z: c.object.getWorldPosition(new T.Vector3()).z,
      })),
      cuddling: world.life.cuddling,
      sharing: world.life.sharing,
      composter: world.sigma.composter.userData,
      bacon: scene.getObjectByName("bacon-sandwich-cooking")?.visible,
      spatula: scene.getObjectByName("moms-spatula")?.visible,
    }),
    birdhouses: () => world.outdoorBirdhouses.filter((g) => g.visible).length,
    hatStack: () =>
      world.wornHat.children.map((o) => ({
        id: o.userData.hatId,
        y: o.position.y,
        scale: o.scale.toArray(),
        bounds: (() => {
          const b = new T.Box3().setFromObject(o);
          return { min: b.min.toArray(), max: b.max.toArray() };
        })(),
      })),
    sleepingBounds: () => {
      const b = new T.Box3().setFromObject(world.sleeping);
      return { min: b.min.toArray(), max: b.max.toArray() };
    },
    journalContext: () => journalContext(s),
    writeJournal: (context: ReturnType<typeof journalContext>) =>
      Promise.resolve(constructJournal(context).entry),
    teleport: (x: number, z: number) => {
      if (blocked(x, z, world.rects)) throw Error("Blocked test position");
      s.position = { x, z };
    },
    sleep: () => {
      sleep(s);
      save();
    },
    advance: (dt: number) => {
      tick(s, dt);
      tickSigma(s, dt);
    },
    mountainShopOverview: () => {
      camera.position.set(-1, 7.5, -291);
      camera.lookAt(-6, 3, -315);
      renderer.render(scene, camera);
    },
    mountainShopInterior: () => {
      const fov = camera.fov;
      camera.fov = 78;
      camera.updateProjectionMatrix();
      camera.position.set(-6, 4.1, -312.1);
      camera.lookAt(-6, 2.9, -321);
      renderer.render(scene, camera);
      camera.fov = fov;
      camera.updateProjectionMatrix();
    },
    bridgeOverview: () => {
      camera.position.set(60, 8, -58);
      camera.lookAt(46, 0, -82);
      renderer.render(scene, camera);
    },
    sigmaOverview: () => {
      camera.position.set(17, 30, -53);
      camera.lookAt(10, 0, -67);
      renderer.render(scene, camera);
    },
    plotModels: () =>
      world.plots.map((plot, index) => {
        plot.updateWorldMatrix(true, true);
        const bounds = new T.Box3().setFromObject(plot);
        let meshes = 0;
        plot.traverseVisible((o) => {
          if (o instanceof T.Mesh) meshes++;
        });
        return {
          index,
          uuid: plot.uuid,
          stage: s.plots[index]?.stage,
          position: plot.position.toArray(),
          meshes,
          bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
          attached: plot.parent === scene,
        };
      }),
    millionaire: () => ({
      visible: world.millionaire.group.visible,
      draws: renderer.info.render.calls,
      state: s.millionaire,
      player: world.player.position.toArray(),
      mountainPlots: s.plots.filter((p) => p.mountain),
      mansions: world.millionaire.mansions.map((m) => ({
        visible: m.home.visible,
        car: m.car.visible,
        yacht: m.yacht.visible,
        builtHeight: m.home.scale.y,
        architecture: m.home.userData.architecture ?? "palatial",
      })),
      children: world.millionaire.children.map((o) => o.position.toArray()),
      guide: world.millionaire.hosts.map((o) => ({
        visible: o.visible,
        position: o.position.toArray(),
      })),
    }),
    renderShopHomeReview: (view: string) => {
      const shots: Record<string, number[][]> = {
        bed: [
          [-7.7, 2.7, 11.3],
          [-3.6, 1.1, 7.6],
        ],
        shop: [
          [4, 3.3, -29],
          [-3, 1.5, -30],
        ],
        memes: [
          [-1, 12, -34],
          [-18, 10, -65],
        ],
        guru: [
          [34, 2.0, -126],
          [34, 1.35, -130],
        ],
        pan: [
          [-11.1, 2.25, 13.5],
          [-12.3, 1.25, 12.8],
        ],
      };
      const [position, aim] = shots[view];
      camera.position.fromArray(position);
      camera.lookAt(new T.Vector3().fromArray(aim));
      const visible = world.millionaire.group.visible;
      if (view === "guru") world.millionaire.group.visible = true;
      renderer.render(scene, camera);
      world.millionaire.group.visible = visible;
    },
    shopHomeReview: () => {
      const bounds = (name: string) => {
        const object = scene.getObjectByName(name)!;
        object.updateWorldMatrix(true, true);
        const b = new T.Box3().setFromObject(object);
        return {
          min: b.min.toArray(),
          max: b.max.toArray(),
          position: object.position.toArray(),
        };
      };
      return {
        bed: bounds("moms-bed-frame"),
        pan: bounds("player-cooking-pan"),
        display: bounds("robertsons-groceries-and-furnishings"),
        groceries: bounds("grocery-wall-display"),
        furnishings: bounds("furnishing-wall-display"),
        necklace: bounds("guru-beaded-necklace"),
        bracelet: bounds("guru-wrist-bracelet"),
        rooster: world.life.roosterCharge,
      };
    },
    sigma: () => ({
      entranceSign: world.sigma.entranceSign.position.toArray(),
      walkers: world.sigma.walkers.map((w) => ({
        id: w.id,
        position: w.object.position.toArray(),
        target: { ...w.target },
      })),
      visible: world.sigma.town.visible,
      paths: world.sigma.paths,
      pavement: Array.from(
        world.sigma.walkway.geometry.attributes.position.array,
      ),
      plots: s.plots.filter((p) => p.community),
      signals: marketSignals(s),
    }),
    hatDisplays: () =>
      world.hatDisplays.map((o) => ({
        name: o.name,
        meshes: o.children.length,
        position: o.position.toArray(),
      })),
    jumpHeight: () => jumpHeight,
    marvelsSignReview: () => {
      camera.position.set(-31, 5.3, -295);
      camera.lookAt(-34, 4.3, -309);
      renderer.render(scene, camera);
    },
    marvelsReview: () => {
      const roof = scene.getObjectByName("marvels-roof");
      if (roof) roof.visible = false;
      camera.position.set(-25.7, 5.8, -310.7);
      camera.lookAt(-35.5, 1.4, -320);
      renderer.render(scene, camera);
    },
    marvelsStats: () => {
      let meshes = 0;
      scene.getObjectByName("Mansion Marvels")?.traverse((o) => {
        if (o instanceof T.Mesh) meshes++;
      });
      const geometries = new Set<T.BufferGeometry>();
      scene.traverse((o) => {
        if (o instanceof T.Mesh) geometries.add(o.geometry);
      });
      return {
        meshes,
        geometries: geometries.size,
        uploadedGeometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        portraits: productPortraits.size,
      };
    },
    marvelsStock: () => {
      const ids: string[] = [];
      scene.getObjectByName("Mansion Marvels")?.traverse((o) => {
        if (o.userData.marvelsProduct) ids.push(o.userData.marvelsProduct);
      });
      return ids;
    },
    soyjakPlayerReview: () => {
      camera.position.set(s.position.x + 5, 4, s.position.z + 8);
      camera.lookAt(s.position.x, 3, s.position.z);
      renderer.render(scene, camera);
    },
    soyjakReview: () => {
      camera.position.set(25.7, 3, -73);
      camera.lookAt(25.7, 1.9, -79.5);
      const visible = world.player.visible;
      world.player.visible = false;
      renderer.render(scene, camera);
      world.player.visible = visible;
    },
    desertThoughtStep: (dt: number) => updateDesertThought(dt),
    soyEffectsView: () => ({
      scale: world.player.scale.x,
      serious: !!world.wornHat.getObjectByName("temporary-serious-hat"),
    }),
    wornHatHeight: () => {
      const bounds = new T.Box3().setFromObject(world.wornHat);
      return bounds.max.y - world.player.position.y;
    },
    equipHat: (id: HatId | null) => {
      equipHat(s, id);
      save();
    },
    rects: world.rects,
    scenery: world.scenery,
    paths: world.paths.concat(world.sigma.paths),
    doorways: world.doorways,
    boundaryHedges: () =>
      world.boundaryHedges.map((mesh) => {
        const bounds = new T.Box3().setFromObject(mesh);
        return {
          min: bounds.min.toArray(),
          max: bounds.max.toArray(),
          visible: mesh.visible,
        };
      }),
    mrWacky: () => world.sigma.wacky.stats(),
    mrWackyReview: () => {
      camera.position.set(-15, 3.8, -60.2);
      camera.lookAt(-18, 1.6, -65);
      renderer.render(scene, camera);
    },
    diamondHands: () => {
      const chads: {
        id: string;
        hands: number;
        diamonds: number;
        ordinary: number;
      }[] = [];
      world.sigma.town.traverse((o) => {
        if (!o.userData.chad) return;
        let hands = 0,
          diamonds = 0,
          ordinary = 0;
        o.traverseVisible((child) => {
          if (child.name.startsWith("diamond-hand-")) hands++;
          if (child.name === "palm-diamond") diamonds++;
          if (child.name.startsWith("ordinary-hand-")) ordinary++;
        });
        chads.push({ id: o.uuid, hands, diamonds, ordinary });
      });
      return chads;
    },
    diamondHandsReview: () => {
      camera.position.set(27, 2.2, -44.7);
      camera.lookAt(27, 1.1, -48);
      renderer.render(scene, camera);
    },
    river: () => ({
      bridges: world.river.bridges,
      colliders: world.river.colliders,
      vegetation: world.river.vegetation.children.map((o) => ({
        name: o.name,
        count: (o as T.InstancedMesh).count,
      })),
    }),
    riverOverview: (view: "village" | "grove" | "east") => {
      const p =
        view === "village"
          ? [-5, -8]
          : view === "grove"
            ? [46, -98]
            : [48, -61];
      camera.position.set(p[0] + 20, 32, p[1] + 25);
      camera.lookAt(p[0], 0, p[1]);
      renderer.render(scene, camera);
    },
    riverCrossingReview: (view: "grove" | "bend" | "rack") => {
      if (view === "grove") {
        camera.position.set(46, 2.4, -87);
        camera.lookAt(46, 0.7, -108);
      } else if (view === "bend") {
        camera.position.set(43, 2.3, -60);
        camera.lookAt(50, 0.9, -60);
      } else {
        camera.position.set(0, 3.4, 22);
        camera.lookAt(-4.7, 1.5, 16.1);
      }
      renderer.render(scene, camera);
    },
    farmReview: (view: "overview" | "house" | "maze" | "sign" | "shop") => {
      const views = {
        overview: [-85, 82, -4, -85, 0, -35],
        house: [-56, 8, -4, -69, 2, -15],
        maze: [-56, 2.2, -34.7, -75, 2.3, -34.7],
        sign: [8, 5, -14, 8, 6, -21],
        shop: [-7, 4, -13, -12, 2, -25],
      };
      const a = views[view];
      camera.position.set(a[0], a[1], a[2]);
      camera.lookAt(a[3], a[4], a[5]);
      const fog = scene.fog;
      scene.fog = null;
      renderer.render(scene, camera);
      scene.fog = fog;
    },
    farm: () => ({
      fields: farmFields,
      cropModels: world.farm.root.children
        .filter((o) => o.name.startsWith("farm-field-"))
        .map((o) => ({
          name: o.name,
          plants: o.children.filter((p) => p instanceof T.InstancedMesh).length,
        })),
      cropBounds: world.farm.root.children
        .filter((o) => o.name.startsWith("farm-") || o.name === "carrot-tops")
        .map((o) => {
          const b = new T.Box3().setFromObject(o);
          return { name: o.name, min: b.min.toArray(), max: b.max.toArray() };
        }),
      packet: world.farm.seed.position.toArray(),
      visible: world.farm.seed.visible,
      cooldown: s.mazeSeedCooldown,
      cornMeshes: world.farm.root.children.filter(
        (o) => o instanceof T.InstancedMesh,
      ).length,
    }),
    riverDrought: (dry: boolean) => world.river.setDrought(dry),
    depthAudit: () => depthAudit(scene, { taggedOnly: true, upwardOnly: true }),
    targets: world.targets,
    homeBugShot: (view: "bookcase" | "mabel" | "exit") => {
      const shots = {
        bookcase: [-11, 2.3, 9.8, -12.1, 1.4, 6.8],
        mabel: [-31, 4, -19, -39, 2, -25],
        exit: [-49, 2, -55, -51.1, 1.4, -61.7],
      };
      const p = shots[view];
      camera.position.set(p[0], p[1], p[2]);
      camera.lookAt(p[3], p[4], p[5]);
      renderer.render(scene, camera);
    },
    homeBugReview: () => ({
      cups: scene
        .getObjectByName("bea-tea-room")!
        .children.filter((o) => o.name === "floral-teacup")
        .map((o) => o.position.toArray()),
      teaLegs: world.bea.getObjectByName("tea-legs")?.visible,
      playerTeaLegs: world.player.getObjectByName("tea-legs")?.visible,
      mabelWindows: scene.children
        .find(
          (o) =>
            o.position.x === -39 &&
            o.position.z === -22 &&
            o.userData.windowsFitted,
        )
        ?.children.filter((o) => o.name === "inset-window").length,
      mabelRoof: (() => {
        const roof = scene.getObjectByName("mabel-house-roof")!;
        return { cutaway: roof.userData.cameraWall, visible: roof.visible };
      })(),
      exit: (() => {
        const sign = scene.getObjectByName("corn-maze-exit-sign")!;
        return {
          position: sign.position.toArray(),
          pointsTo: sign.userData.pointsTo,
        };
      })(),
    }),
    homeDesign: () => ({
      furnishings: world.homeDecor.children.length,
      tv: {
        caption: world.tvScreen.userData.caption,
        headline: world.tvScreen.userData.headline,
        eating: world.tvScreen.userData.rabbitEating,
      },
      tumbleweeds: world.millionaire.tumbleweeds.map((o) =>
        o.position.toArray(),
      ),
      terraces: s.plots.filter((p) => p.mountain).length,
    }),
    notebookModel: () => world.notebookPages.userData.writingBounds,
    birdhouseFilm: () =>
      birdhouseScene
        ? {
            elapsed: birdhouseScene.elapsed,
            duration: birdhouseScene.duration,
            player: world.player.position.toArray(),
            mom: world.mom.position.toArray(),
            segments: birdhouseScene.segments,
            obstacles: world.rects.filter((r) => r !== world.momCollider),
          }
        : null,
    digging: () => ({
      active: !!action,
      shovel: world.diggingTool.visible,
      hands: world.player.children
        .filter((o) => o.name.startsWith("hand-"))
        .map((o) => o.position.toArray()),
    }),
    homeRoof: () => ({
      wingBounds: (() => {
        const box = new T.Box3().setFromObject(world.momRoof);
        return { min: box.min.toArray(), max: box.max.toArray() };
      })(),
      opacity: (world.homeRoof.material as T.MeshStandardMaterial).opacity,
      visible: world.homeRoof.visible,
      bounds: (() => {
        const b = new T.Box3().setFromObject(world.homeRoof);
        return { min: b.min.toArray(), max: b.max.toArray() };
      })(),
    }),
    shopSigns: () =>
      ["robertsons-name", "robertsons-trade"].map((name) => {
        const mesh = scene.getObjectByName(name) as T.Mesh;
        const bounds = new T.Box3().setFromObject(mesh);
        return {
          min: bounds.min.toArray(),
          max: bounds.max.toArray(),
          visible: mesh.visible,
        };
      }),
    signFaces: () =>
      scene.children
        .filter(
          (o) =>
            o.name.startsWith("milliner-arrow-") ||
            o.name === "haberdasher-arrow-post" ||
            o.name === "thread-thimble-haberdashery-sign",
        )
        .map((o) => {
          const b = new T.Box3().setFromObject(o);
          return { name: o.name, min: b.min.toArray(), max: b.max.toArray() };
        }),
    memeSigns: () => {
      const signs: any[] = [],
        walls: any[] = [];
      scene.traverse((o) => {
        if (!o.userData.houseSign && !o.userData.cameraWall) return;
        const b = new T.Box3().setFromObject(o);
        (o.userData.houseSign ? signs : walls).push({
          name: o.name,
          min: b.min.toArray(),
          max: b.max.toArray(),
        });
      });
      return { signs, walls };
    },
    updateWork: () => ({
      newsBuilds: newsFeed.builds,
      momUpdates: world.momUpdates,
    }),
    momEscortReturnCheck: () => {
      const story = {
        scheduledDay: 1,
        surgeryDay: 2,
        awakeSeconds: 0,
        called: true,
        escort: false,
        teaStep: 0,
        shopGoal: false,
      };
      world.setMomDay(4, true, true, story);
      const home = world.mom.position.toArray();
      const before = world.momUpdates;
      for (let i = 0; i < 300; i++) world.setMomDay(4, true, false, story);
      const idleUpdates = world.momUpdates - before;
      story.escort = true;
      world.setMomDay(4, true, false, story);
      world.mom.position.set(12, 0, 16.9);
      story.escort = false;
      const restored = world.setMomDay(4, true, false, story);
      const returned = world.mom.position.toArray();
      world.setMomDay(
        s.day,
        atHome(),
        true,
        s.familyStory,
        s.momHomeStory?.gardenDay === s.day,
      );
      return { home, returned, restored, idleUpdates };
    },
    family: () => ({
      phase: storyPhase(s),
      celebrating: !!celebration,
      party: celebration
        ? {
            kind: celebration.kind,
            center: celebration.center,
            people: celebration.people.length,
            birds:
              world.wildlife.birds.length +
              (celebration.kind === "shop" ? world.houseBirds.length : 0),
            butterflies: world.wildlife.butterflies.length,
            chickens: celebration.wildlife.filter((p) => p.ground).length,
            positions: [...celebration.people, ...celebration.wildlife].map(
              (p) => p.object.getWorldPosition(new T.Vector3()).toArray(),
            ),
          }
        : null,
      actors: world.speakers
        .filter((n) => ["mom", "npc1", "npc2", "npc3"].includes(n.id))
        .map((n) => {
          n.object.updateWorldMatrix(true, true);
          const b = new T.Box3().setFromObject(n.object);
          return {
            id: n.id,
            visible: effectivelyVisible(n.object),
            position: n.object.position.toArray(),
            rotation: n.object.rotation.toArray(),
            head: n.object
              .getObjectByName("head")!
              .getWorldPosition(new T.Vector3())
              .toArray(),
            body: n.object
              .getObjectByName("body")!
              .getWorldPosition(new T.Vector3())
              .toArray(),
            height: b.max.y - b.min.y,
          };
        }),
      momVisible: world.mom.visible,
      momPosition: world.mom.position.toArray(),
      activity: momStatus(s.day, s.familyStory).activity,
      rackModels: world.rackHats.children.length,
      teaSeated,
    }),
    wander: (seconds: number) => {
      const starts = world.sigma.walkers.map((w) => w.object.position.clone());
      let minDistance = Infinity;
      for (
        let i = 0;
        i < Math.min(6000, Math.max(0, Math.floor(seconds * 10)));
        i++
      ) {
        world.sigma.updateWalkers(0.1, s.position.x, s.position.z);
        const walkers = world.sigma.walkers;
        for (let j = 0; j < walkers.length; j++)
          for (let k = j + 1; k < walkers.length; k++)
            minDistance = Math.min(
              minDistance,
              walkers[j].object.position.distanceTo(walkers[k].object.position),
            );
      }
      return {
        minDistance,
        walkers: world.sigma.walkers.map((w, i) => ({
          start: starts[i].toArray(),
          position: w.object.position.toArray(),
          journeys: w.roaming.journeys,
        })),
      };
    },
    gardenSign: () => {
      const fence = scene.getObjectByName("community-garden-iron-fence")!;
      const sigma = fence.getObjectByName("wrought-iron-sigma")!;
      return {
        text: fence.userData.text,
        position: fence.position.toArray(),
        letters: fence.children.filter((o) =>
          o.name.startsWith("vegetable-letter-"),
        ).length,
        sigmaBounds: new T.Box3()
          .setFromObject(sigma)
          .getSize(new T.Vector3())
          .toArray(),
      };
    },
    drinksBoard: () =>
      scene.getObjectByName("grindset-drinks-board")?.userData.text,
    npcHeadPenetrations: () => {
      const sphere = (g: T.Object3D) => {
        const head = g.getObjectByName("head") as T.Mesh;
        head.geometry.computeBoundingSphere();
        return head.geometry
          .boundingSphere!.clone()
          .applyMatrix4(head.matrixWorld);
      };
      const player = sphere(world.player);
      return scene.children
        .filter((g) => g.userData.isNPC)
        .filter((g) => {
          const npc = sphere(g);
          return (
            npc.center.distanceTo(player.center) <
            npc.radius + player.radius - 0.01
          );
        }).length;
    },
    bedPreview: () => ({
      position: bedPosition(),
      valid: canPlaceBed(s, bedPosition().x, bedPosition().z, bedObstacles()),
    }),
    momPose: () => ({
      y: world.mom.position.y,
      scale: world.mom.scale.y,
      feet: world.mom.children
        .filter((o) => o.name === "foot")
        .map((o) => o.getWorldPosition(new T.Vector3()).toArray()),
    }),
    polish: () => ({
      fertilizerMarkers: world.fertilizerMarkers.children.map((o) => ({
        name: o.name,
        grains: o.children.length,
      })),
      rack: world.rackHats.children.map((o) => o.name),
      hanging: !!hatHanging,
      hangingDestination: hatHanging?.to.toArray(),
      guiding: !!beaGuide,
      windows: scene.getObjectsByProperty("name", "inset-window").length,
      roofs: [world.robertsonsRoof, world.hatShopRoof, world.bikeShopRoof].map(
        (o) => ({
          name: o.name,
          base: o.position.y,
          top: new T.Box3().setFromObject(o).max.y,
        }),
      ),
    }),
    fertilizerAnimation: () => ({
      active: !!fertilizerAnimation,
      visible: world.fertilizerBox.visible,
      grains: world.fertilizerGrains.visible,
    }),
    wateringAnimation: () => ({
      active: !!wateringAnimation,
      visible: world.wateringTool.visible,
      drops: world.waterDrops.children
        .filter((o) => world.waterDrops.visible && o.visible)
        .map((o) => o.position.toArray()),
      canPosition: world.wateringTool.position.toArray(),
      soilRings: world.plots.map(
        (plot) => !!plot.getObjectByName("watered-soil-ring"),
      ),
    }),
    cameraWalls: () =>
      world.occluders
        .filter((o) => o.userData.cameraWall)
        .map((o) => ({ visible: o.visible, position: o.position.toArray() })),
    cameraPitch: () => pitch,
    seedChimes: () => seedChimes,
    frame: () => frameNumber,
    camera: () => ({
      position: camera.position.toArray(),
      forward: viewForward().toArray(),
      near: camera.near,
      penetrationDetails: world.occluders
        .filter(
          (o) =>
            o.visible &&
            !o.userData.cameraWall &&
            !o.userData.roof &&
            new T.Box3()
              .setFromObject(o)
              .expandByScalar(0.08)
              .containsPoint(camera.position),
        )
        .map((o) => ({
          position: o.position.toArray(),
          min: new T.Box3().setFromObject(o).min.toArray(),
          max: new T.Box3().setFromObject(o).max.toArray(),
        })),
      penetrations: world.occluders.filter(
        (o) =>
          o.visible &&
          !o.userData.cameraWall &&
          !o.userData.roof &&
          new T.Box3()
            .setFromObject(o)
            .expandByScalar(0.08)
            .containsPoint(camera.position),
      ).length,
    }),
    reset: () => {
      placingBed = false;

      s = fresh();
      resetTransientMotion();
      sitting = false;
      world.setPlayerSeated(false);
      close();
    },
    setYaw: (n: number) => (yaw = n),
  };
}

function churchGreeting(id: string, continuation: () => void) {
  const change = s.adventure?.churchChange;
  if (!change || change.heardBy.includes(id)) return false;
  change.heardBy.push(id);
  save();
  speak(
    id,
    `<p>What happened to the Children of ${escapeHTML(fellowship(change.from).name)} that were here before?</p><p>I’m not sure who you mean. We have always been here.</p>`,
    [{ label: "Oh. I see.", run: continuation }],
  );
  return true;
}

function roosterGreeting() {
  if (!audio || muted) return;
  const t = audio.currentTime;
  for (const [delay, freq] of [
    [0, 180],
    [0.14, 340],
  ]) {
    const oscillator = audio.createOscillator(),
      gain = audio.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(freq, t + delay);
    oscillator.frequency.exponentialRampToValueAtTime(
      freq * 0.6,
      t + delay + 0.12,
    );
    gain.gain.setValueAtTime(0.0001, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.1, t + delay + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.14);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(t + delay);
    oscillator.stop(t + delay + 0.15);
  }
}

const meteorWorld = createMeteorWorld(
  scene,
  () => {
    world.syncBeds(s.plots);
    syncTimers();
    save();
    toast(
      "A meteor struck the desert! Investigate its crater: a ready Money Tree and ten seed packets wait at the center.",
    );
  },
  world.targets,
);

const estateWorld = createEstateWorld(
  scene,
  world.rects,
  world.occluders,
  world.targets,
);
let estateFilm:
  | {
      kind: "repo";
      t: number;
      truck: T.Group;
      actor?: T.Group;
      camera: T.Vector3;
      aim: T.Vector3;
    }
  | undefined;
function mansionOffer(speaker: string, back: () => void): void {
  const h = s.housing;
  if (h?.status === "evicted")
    return speak(
      speaker,
      "<p>Your mansion was repossessed. The house is locked and empty.</p>",
      [{ label: "I understand", run: back }],
    );
  if (h?.status === "owned")
    return speak(
      speaker,
      `<p>The Church can buy your house back. Your downpayment and principal paid, multiplied by the housing market, are worth ${money(housingSaleValue(s))}. The housing market follows the coin with a delay.</p>`,
      [
        {
          label: `Sell my mansion for ${money(housingSaleValue(s))}`,
          destructive: true,
          run: () => {
            sellMansion(s);
            s.furniture = s.furniture?.filter((p) => p.z > -300);
            s.position = { x: mansionLot.x, z: mansionLot.z + 15 };
            save();
            estateWorld.update(s);
            world.setMomDay(s.day, false, true, s.familyStory);
            dismissSpeech();
          },
        },
        { label: "Keep my home", run: back },
      ],
    );
  speak(speaker, "<p>When are you going to build a mansion?</p>", [
    {
      label: "How much does it cost?",
      default: true,
      run: () => mansionPriceDialogue(speaker, back),
    },
    {
      label: "I don’t want a mansion",
      run: () => {
        if (s.millionaire) s.millionaire.chats["mansion-declined"] = 1;
        save();
        speak(speaker, "<p>Well, let me know if you change your mind.</p>", [
          { label: "I will", run: back },
        ]);
      },
    },
  ]);
}
function mansionPriceDialogue(speaker: string, back: () => void) {
  speak(speaker, "<p>One million dollars.</p>", [
    {
      label: "I have a million. Buy outright",
      disabled: s.cash + s.bank < mansionPrice,
      run: () => chooseMansion(false, speaker),
    },
    {
      label: "I don’t have a million",
      run: () =>
        speak(
          speaker,
          "<p>Well, we can loan you the money. A one thousand dollar downpayment and $10 a day, until you pay it off.</p>",
          [
            {
              label: "But that will take 100,000 days!",
              default: true,
              run: () =>
                speak(
                  speaker,
                  "<p>Actually, 166,667 days. Because 40% of each payment goes to interest.</p><p class='fine'>With your $1,000 downpayment deducted, the remaining $999,000 takes 166,500 daily payments. You can also sell the house back later.</p>",
                  [
                    {
                      label: "Take the mortgage",
                      disabled: s.cash + s.bank < 100000,
                      run: () => chooseMansion(true, speaker),
                    },
                    { label: "No mortgage", run: back },
                  ],
                ),
            },
            { label: "No mortgage", run: back },
          ],
        ),
    },
    { label: "Not today", run: back },
  ]);
}

function chooseMansion(mortgage: boolean, speaker: string) {
  speak(
    speaker,
    `<p>Which house would you like?</p><div class="mansion-previews">${(["hearst", "vernon"] as const).map((style) => `<figure><img src="${shopPortrait(`estate-${style}`, () => makeEstate(style).root)}" alt="${style === "hearst" ? "Magnate Mansion" : "Presidential Palace"} model"><figcaption>${style === "hearst" ? "Magnate Mansion" : "Presidential Palace"}</figcaption></figure>`).join("")}</div>`,
    (
      [
        ["hearst", "Magnate Mansion"],
        ["vernon", "Presidential Palace"],
      ] as const
    ).map(([style, label]) => ({
      label,
      run: () => {
        if (!buyMansion(s, style, mortgage))
          return toast("You need enough for the purchase or downpayment.");
        s.furniture = s.furniture?.filter((p) => p.z > -300);
        estateWorld.update(s);
        save();
        dismissSpeech();
        toast(
          "The mansion is yours. You can tell Mom about it next time you go home.",
        );
      },
    })),
  );
}
function mansionShop() {
  const stock = furnishingCatalog.filter((f) => f.level === 4);
  panel(
    "Mansion Marvels",
    `<p>Explore the showroom, then choose furniture for your mansion. Every displayed piece is available here.</p><p>Your pocket: <b>${money(s.cash)}</b></p><div class="inventory-grid shop-grid">${stock.map((f) => `<button type="button" class="inventory-card shop-card" data-marvels="${f.id}" aria-label="${f.name} · ${money(f.price)}" ${s.cash < f.price ? "disabled" : ""}><img src="${shopPortrait(f.id, () => makeFurnishing(f.id))}" alt="${f.name}"><span>${f.name}</span><small>In bag: ${(s.furnitureBag ?? []).filter((id) => id === f.id).length}</small><b>Buy · ${money(f.price)}</b></button>`).join("")}</div>`,
    [{ label: "Back", run: close }],
  );
  $("#modal .panel").classList.add("inventory-panel", "shop-panel");
  document.querySelectorAll<HTMLButtonElement>("[data-marvels]").forEach(
    (button) =>
      (button.onclick = () => {
        const f = stock.find((f) => f.id === button.dataset.marvels);
        if (!f || s.cash < f.price) return;
        s.cash -= f.price;
        (s.furnitureBag ??= []).push(f.id);
        s.events.push(`Bought ${f.name} at Mansion Marvels.`);
        save();
        mansionShop();
        document
          .querySelector<HTMLButtonElement>(`[data-marvels="${f.id}"]`)
          ?.focus();
      }),
  );
}

function beginEstateFilm(kind: "repo") {
  if (estateFilm) return;
  dismountBike();
  keys.clear();
  const truck = makeTruck(kind === "repo");
  scene.add(truck);
  const actor = kind === "repo" ? makeRepoMan() : undefined;
  if (actor) scene.add(actor);
  estateFilm = {
    kind,
    t: 0,
    truck,
    actor,
    camera: camera.position.clone(),
    aim: cameraAim.clone(),
  };
  s.position = { x: mansionLot.x, z: mansionLot.z + 14 };
  world.player.position.set(s.position.x, 0, s.position.z);
}
function updateEstateFilm(dt: number) {
  const h = s.housing;
  if (!h) return;
  if (!estateFilm && begun && s.awake && !paused && !speaking) {
    if (h.status === "evicted" && !h.evictionSeen) {
      s.furniture = s.furniture?.filter((p) => p.z > -300);
      syncFurnishings();
      beginEstateFilm("repo");
    }
  }
  if (!estateFilm) return;
  const film = estateFilm;
  film.t += dt;
  film.truck.position.set(
    mansionLot.x - 7,
    0,
    mansionLot.z + 18 + Math.max(0, 1 - film.t / 3) * 20,
  );
  camera.position.set(mansionLot.x + 15, 9, mansionLot.z + 30);
  camera.lookAt(mansionLot.x, 2, mansionLot.z + 10);
  world.player.position.set(mansionLot.x, 0, mansionLot.z + 14);
  if (film.actor) {
    const progress = T.MathUtils.clamp((film.t - 3) / 2, 0, 1);
    film.actor.visible = film.t > 3;
    film.actor.position.set(
      mansionLot.x - 7 * (1 - progress),
      0,
      mansionLot.z + 16 - 1.3 * progress,
    );
    film.actor.rotation.y = Math.PI / 2;
  }
  if (film.t > 3 && film.t < 3 + dt)
    toast(
      "REPO MAN: You failed to make your mortgage payment. You’re losing the house. The doors are locked.",
    );
  if (film.t >= 8) {
    disposeAnimation(film.truck);
    if (film.kind === "repo") h.evictionSeen = true;
    if (film.actor) disposeAnimation(film.actor);
    estateFilm = undefined;
    followInitialized = false;
    camera.position.copy(film.camera);
    cameraAim.copy(film.aim);
    save();
  }
}

const neighborGardens = createNeighborGardens(
  scene,
  world.speakers,
  world.targets,
  world.rects,
  world.player,
);
const featherModel = makeChickenFeather();
featherModel.name = "chicken-feather-in-hair";
featherModel.visible = !!s.adventure?.feather;
world.player.add(featherModel);
const featherHairPosition = new T.Vector3(0.62, 1.95, 0.16);
featherModel.position.copy(featherHairPosition);
featherModel.rotation.set(0.2, 0.6, -0.35);
let featherHandoff:
  { t: number; playerRotation: number; momRotation: number } | undefined;
function startFeatherHandoff() {
  if (
    !s.adventure?.feather ||
    featherHandoff ||
    world.life.busy ||
    cookingScene
  )
    return;
  dismissSpeech();
  keys.clear();
  if (riding) dismountBike();
  spanakopitaShot = {
    position: camera.position.clone(),
    aim: cameraAim.clone(),
  };
  featherHandoff = {
    t: 0,
    playerRotation: world.player.rotation.y,
    momRotation: world.mom.rotation.y,
  };
  world.player.rotation.y = Math.atan2(
    world.mom.position.x - world.player.position.x,
    world.mom.position.z - world.player.position.z,
  );
  world.mom.rotation.y = world.player.rotation.y + Math.PI;
}
function updateFeatherHandoff(dt: number) {
  const film = featherHandoff;
  if (!film) return;
  film.t += dt;
  const t = film.t;
  const playerHand = world.player.getObjectByName("hand-1")!;
  const momHand = world.mom.getObjectByName("hand-1")!;
  const reach = Math.min(1, t / 0.8);
  playerHand.position.lerpVectors(
    new T.Vector3(0.43, 0.79, 0),
    featherHairPosition,
    reach,
  );
  if (t >= 0.8) {
    const pass = Math.min(1, (t - 0.8) / 1.2);
    world.mom.updateMatrixWorld(true);
    const receiving = world.player.worldToLocal(
      world.mom.localToWorld(new T.Vector3(0.25, 1.1, 0.5)),
    );
    playerHand.position.lerpVectors(featherHairPosition, receiving, pass);
    momHand.position.set(0.25, 1.1, 0.5);
    if (featherModel.parent === world.player) {
      world.player.updateMatrixWorld(true);
      playerHand.attach(featherModel);
      featherModel.position.set(0, 0.14, 0.04);
      featherModel.rotation.set(0, 0, -0.3);
    }
    if (t >= 2 && featherModel.parent !== momHand) {
      momHand.attach(featherModel);
      featherModel.position.set(0, 0.14, 0.04);
    }
  }
  if (t < 3) return;
  world.player.add(featherModel);
  featherModel.position.copy(featherHairPosition);
  featherModel.rotation.set(0.2, 0.6, -0.35);
  featherModel.visible = false;
  playerHand.position.set(0.43, 0.79, 0);
  momHand.position.set(0.43, 0.79, 0);
  world.player.rotation.y = film.playerRotation;
  world.mom.rotation.y = film.momRotation;
  featherHandoff = undefined;
  giveFeather(s);
  save();
  speak("mom", "<p>Thank you, love! It will bring you good luck.</p>", [
    { label: "Love you too", run: dismissSpeech },
  ]);
}

function childrenHomesBuilt() {
  return (
    mansionCount(s.millionaire) === 6 &&
    world.millionaire.mansions.every(
      (m) => m.home.visible && m.home.scale.y === 1,
    )
  );
}

const mountainShop = createMountainShop(
  scene,
  world.rects,
  world.targets,
  world.occluders,
);
function tradingConversation(id: string, more = false) {
  registerTraders(
    s,
    world.speakers.filter((n) => n.object.userData.chad).map((n) => n.id),
  );
  const line = chadLine(s, id);
  save();
  speak(
    id,
    `<p>${escapeHTML(line)}</p>${more ? "" : `<p>${escapeHTML(traderDialogue(s, id) ?? "I’m still working out my strategy.")}</p>`}`,
    [
      { label: "Tell me more", run: () => tradingConversation(id, true) },
      ...(hasAlternateChadTopic(id)
        ? [
            {
              label: "Something else",
              run: () => {
                dismissSpeech();
                interact(true);
              },
            },
          ]
        : []),
      { label: "See you around", run: dismissSpeech },
    ],
  );
}

function seedPortrait(seed: "money" | Crop) {
  if (!productPortraits.has(`plant-seed-${seed}`))
    profiling.count("seedPortraitBuilds");
  return shopPortrait(`plant-seed-${seed}`, () => {
    if (seed !== "money") return makeCrop(seed, true);
    const group = new T.Group();
    const skeleton = moneySkeleton(
      0,
      1.7,
      new T.MeshStandardMaterial({ color: "#443a2e" }),
    );
    group.add(skeleton.trunk, skeleton.branches);
    for (const tip of skeleton.tips) {
      const bill = new T.Mesh(
        new T.BoxGeometry(0.35, 0.18, 0.025),
        new T.MeshStandardMaterial({ color: "#93c276" }),
      );
      bill.position.copy(tip);
      group.add(bill);
    }
    return group;
  });
}
function pickUpSeedPacket(id: string) {
  let collected = false;
  let message = "Five money seeds! Another chance for the garden.";
  if (id.startsWith("meteor-seed-")) {
    const [, , meteor, packet] = id.split("-");
    collected = collectMeteorPacket(s, Number(meteor), Number(packet));
  } else if (id.startsWith("pepe-seed-"))
    collected = collectPepePacket(s, Number(id.slice(10)));
  else if (id === "maze-seeds") {
    collected = collectMazeSeeds(s);
    message =
      "Five money seeds! A new packet will grow here in five minutes of active play.";
  } else if (["forest-seeds", "garden-seeds"].includes(id)) {
    collected = findHiddenSeeds(s, id.split("-")[0] as "forest" | "garden");
    if (id === "garden-seeds")
      message =
        "Five seeds! A path has opened past Thread & Thimble. Sigma Town is through the hedge. You can now wear four hats at once.";
  } else return false;
  if (collected) {
    world.setSigmaUnlocked(!!s.foundTVSeeds);
    world.syncBeds(s.plots);
    save();
    seedChime();
    toast(message);
  }
  return true;
}
let pickupX = Infinity,
  pickupZ = Infinity,
  pickupCheckIn = 0;
function collectWalkoverPackets(dt: number) {
  pickupCheckIn -= dt;
  if (
    Math.hypot(s.position.x - pickupX, s.position.z - pickupZ) < 0.05 &&
    pickupCheckIn > 0
  )
    return;
  // A packet can land or respawn underfoot while the player stands still.
  // Idle checks are bounded to four per second; movement still checks promptly.
  pickupCheckIn = 0.25;
  profiling.count("seedPickupScans");
  pickupX = s.position.x;
  pickupZ = s.position.z;
  const ground = terrainHeight(s.position.x, s.position.z);
  const tryPacket = (id: string, x: number, y: number, z: number) => {
    if (
      Math.hypot(s.position.x - x, s.position.z - z) < 0.8 &&
      Math.abs(ground - y) < 1
    )
      pickUpSeedPacket(id);
  };
  for (const [id, object] of [
    ["forest-seeds", world.forestSeeds],
    ["garden-seeds", world.gardenSeeds],
    ["maze-seeds", world.farm.seed],
  ] as const)
    if (object.visible)
      tryPacket(id, object.position.x, object.position.y, object.position.z);
  if (s.pepePopped)
    for (let i = 0; i < 25; i++) {
      const d = world.sigma.debris[i];
      if (d.object.visible && d.object.position.y < 0.65)
        tryPacket(
          `pepe-seed-${i}`,
          d.object.position.x,
          d.object.position.y,
          d.object.position.z,
        );
    }
  for (const t of world.targets)
    if (t.id.startsWith("meteor-seed-"))
      tryPacket(t.id, t.x, terrainHeight(t.x, t.z), t.z);
}
function seedATM() {
  panel(
    "Mountain Seed ATM",
    `<p>Always in stock. Irises are Mom’s favorite; peppers and tomatoes open up new dishes to cook together.</p><p>Pocket: ${money(s.cash)}</p><div class="inventory-grid shop-grid">${seedOffers.map((o) => `<button class="inventory-card shop-card" data-seed-offer="${o.id}" aria-label="${escapeHTML(o.name)} · 5 for ${money(o.price)}" ${s.cash < o.price ? "disabled" : ""}><img src="${seedPortrait(o.id)}" alt=""><span>${escapeHTML(o.name)}</span><small>In bag: ${seedCount(s, o.id)}</small><b>5 for ${money(o.price)}</b></button>`).join("")}</div>`,
    [{ label: "Back", run: close }],
  );
  document.querySelectorAll<HTMLButtonElement>("[data-seed-offer]").forEach(
    (button) =>
      (button.onclick = () => {
        if (buyGardenSeeds(s, button.dataset.seedOffer!)) {
          save();
          seedATM();
        }
      }),
  );
}
function chooseGardenSeed(i: number) {
  panel(
    "Choose your planting seed",
    `<p>Choose the seed to use next. Press E at an empty bed to plant it. Flowers stay in bloom; vegetables become cooking ingredients.</p><div class="inventory-grid shop-grid">${seedOffers
      .filter((o) => o.id === "money" || seedCount(s, o.id) > 0)
      .map(
        (o) =>
          `<button class="inventory-card shop-card" data-planting-seed="${o.id}" aria-label="Select ${o.id} seeds · ${seedCount(s, o.id)} available" aria-pressed="${activePlantingSeed(s) === o.id}" ${seedCount(s, o.id) ? "" : "disabled"}><img src="${seedPortrait(o.id)}" alt=""><span>${escapeHTML(o.name)}</span><b>${seedCount(s, o.id)} seeds</b></button>`,
      )
      .join("")}</div>`,
    [{ label: "Back", run: close }],
  );
  document.querySelectorAll<HTMLButtonElement>("[data-planting-seed]").forEach(
    (button) =>
      (button.onclick = () => {
        if (
          selectPlantingSeed(s, button.dataset.plantingSeed as "money" | Crop)
        ) {
          save();
          close();
          toast(`${s.activeSeed} seeds selected. Press E at the bed to plant.`);
        }
      }),
  );
}
function startGardenPlant(i: number, crop?: Crop) {
  close();
  action = {
    id: i,
    ids: crop ? [i] : plantingBatch(s, i),
    crop,
    elapsed: 0,
    duration: plantingSeconds(s),
    origin: { ...s.position },
  };
  toast(`Planting ${crop ?? "money"} seeds. Stand still.`);
}

// Save loading is asynchronous; expose start actions only after boot is complete.
$("#begin").removeAttribute("disabled");
$("#new-game").removeAttribute("disabled");

$(".intro-actions").removeAttribute("inert");
