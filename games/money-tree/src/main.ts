import { sceneRoute, routeLength, alongRoute, type Point } from "./scene-route";
import { newsReports } from "./tv-news";
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
  bikeById,
  buyBike,
  selectBike,
  inBikeShop,
  bikeShopBounds,
  type BikeId,
} from "./bikes";
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
} from "./game";
import { createWorld, type Target } from "./world";
const $ = (s: string) => document.querySelector<HTMLElement>(s)!;
const SAVE = "money-tree-v1";
const seedHud = document.createElement("div");
seedHud.id = "seed-hud";
seedHud.innerHTML = `<img src="${seedPacketImage()}" alt="Money Tree seed packet"><strong>0</strong>`;
const resourceHud = document.createElement("div");
resourceHud.id = "resource-hud";
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
drinkHud.hidden = true;
resourceHud.append(cashHud, bankHud, netHud, seedHud, drinkHud);
$("#app").append(resourceHud);

let s: State;
try {
  s = load(localStorage.getItem(SAVE));
} catch {
  s = fresh();
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
scene.add(new T.HemisphereLight("#fff5de", "#819b74", 2.3));
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
  ["Gaegu", "Nunito", "Lobster", "HennyPenny", "Bungee", "BarlowCondensed"].map(
    (f) => document.fonts.load(`${f === "Nunito" ? "italic " : ""}24px ${f}`),
  ),
).catch(() => {});
const world = createWorld(scene),
  camera = new T.PerspectiveCamera(52, innerWidth / innerHeight, 0.08, 110),
  ray = new T.Raycaster();
unlockSigma(s);
world.setSigmaUnlocked(!!s.foundTVSeeds);
world.sigma.updateATM(s.coin?.name);
world.syncBeds(s.plots);
if (
  blocked(s.position.x, s.position.z, world.rects) ||
  Math.abs(s.position.x) > 38 ||
  s.position.z > 38 ||
  s.position.z < (s.foundTVSeeds ? -89 : -39)
)
  s.position = clearPosition(
    s.position,
    world.rects,
    s.foundTVSeeds ? -89 : -39,
  );
world.player.position.set(s.position.x, 0, s.position.z);
world.setMomDay(s.day, homeContains(s.position), false, s.familyStory);
if (s.familyStory?.escort) {
  const p = clearPosition(
    { x: s.position.x - 1.5, z: s.position.z },
    world.rects,
    s.foundTVSeeds ? -89 : -39,
  );
  positionStoryMom(p.x, p.z);
}
scene.add(camera);
const bikeCockpit = makeBikeCockpit();
camera.add(bikeCockpit.object);
let riding = false,
  rideSpeed = 0,
  actualRideSpeed = 0,
  bellRings = 0;
let rideTransition = 0;
let walkingPitch = 0.42;
let rideDistance = 0;
const rideEyeHeight = () => (s.selectedBike === "penny" ? 2.45 : 1.7);
const rideCameraOffset = new T.Vector3();
let parkedBike: T.Group | undefined, parkedBikeId: BikeId | undefined;
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
function mountBike() {
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
  parkedBike!.visible = false;
  riding = true;
  walkingPitch = pitch;
  pitch = 0.42;
  rideSpeed = actualRideSpeed = 0;
  rideTransition = 0;
  rideDistance = 0;
  rideCameraOffset
    .copy(camera.position)
    .sub(new T.Vector3(s.position.x, rideEyeHeight(), s.position.z));
  dismissSpeech();
  toast(
    "W/S to pedal or brake. A/D to steer. H to dismount. B rings the bell.",
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
    `<img class="bike-portrait" src="${hatPortrait(id)}" alt="${bike.name} bicycle"><p>${bike.description}</p><p>${money(bike.price)} · ${Math.round(bike.speed * 3.6)} km/h</p><p>H mounts or dismounts. B rings your bell. Every bicycle is faster than running.</p>`,
    [
      {
        label: owned
          ? "Choose this bicycle"
          : `Buy bicycle · ${money(bike.price)}`,
        disabled: !owned && s.cash < bike.price,
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
inventoryToasts.setAttribute("aria-live", "polite");
inventoryToasts.setAttribute("aria-label", "Inventory changes");
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
  inventoryToasts.hidden = !begun || !s.awake || !content;
}
const cameraWalls = new CameraWalls();
let followInitialized = false;
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
let wasHome = atHome(),
  visitedOutside = s.awake && !wasHome;
const thought = document.createElement("div");
thought.id = "thought";
thought.setAttribute("role", "status");
thought.hidden = true;
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
    s.foundTVSeeds ? -89 : -39,
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
          thought.hidden = true;
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
          .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      }),
  );
}
function askMom() {
  if (momAway(s)) return;
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
      { label: "Love you too", run: dismissSpeech },
    ]);
    return;
  }
  const status = momStatus(s.day, s.familyStory);
  const reply = momReply(s);
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
    ...(status.activity === "puzzles"
      ? [{ label: "Let’s play the color puzzle", run: playMomPuzzle }]
      : []),
    { label: playerMomResponse(reply, status.energetic), run: dismissSpeech },
  ]);
  thought.textContent = chooseMomThought(s);
  save();
  thought.hidden = false;
  thoughtTime = 9;
}

let celebration:
  | {
      elapsed: number;
      origin: { x: number; z: number };
      people: { object: T.Object3D; position: T.Vector3; rotation: T.Euler }[];
      wildlife: { object: T.Object3D; position: T.Vector3 }[];
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
  thought.hidden = true;
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
    .map((n) => ({
      object: n.object,
      position: n.object.position.clone(),
      rotation: n.object.rotation.clone(),
    }));
  const wildlife = [...world.wildlife.birds, ...world.wildlife.butterflies].map(
    (b) => ({ object: b.object, position: b.object.position.clone() }),
  );
  celebration = { elapsed: 0, origin: { ...s.position }, people, wildlife };
  positionStoryMom(world.mom.position.x, world.mom.position.z);
  s.position = { x: -16, z: 25 };
  visit(
    "Jumped and danced with Mom, our neighbors, the birds and butterflies.",
  );
  save();
  chime();
  toast("Mom: We did it! Oh, sweetheart, thank you!");
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
    world.player.rotation.y = Math.PI;
    world.setPlayerSeated(true);
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
                thought.hidden = false;
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
      button.setAttribute(
        "aria-label",
        `Row ${row + 1}, column ${col + 1}: ${value ? puzzleColors[value - 1].name : "empty"}${board.clues[index] ? ", fixed" : ""}`,
      );
      button.setAttribute("aria-pressed", String(index === selected));
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
      button.setAttribute("aria-label", `Place ${color.name}`);
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
    ],
  );
}

const keys = new Set<string>();
let modalDefault: HTMLButtonElement | undefined;
const plotVersions: string[] = [];
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
  label.hidden = true;
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
  toastTime = 0;
  $("#toast").style.opacity = "0";
  dismissSpeech();
  const element = document.createElement("section");
  element.className = "speech-bubble";
  if (id === "stacy") element.classList.add("stacy-conversation");
  element.setAttribute("role", "region");
  element.setAttribute(
    "aria-label",
    `${world.speakers.find((n) => n.id === id)?.name ?? id} says`,
  );
  const content = document.createElement("div");
  content.innerHTML = text;
  content.setAttribute("aria-live", "polite");
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
      hint.setAttribute("aria-hidden", "true");
      button.append(hint);
    }
    row.append(button);
  }
  const end = document.createElement("button");
  end.className = "speech-close";
  end.textContent = "×";
  end.setAttribute("aria-label", "End conversation");
  end.onclick = dismissSpeech;
  element.append(end);
  if (choices.length) element.append(row);
  speechLayer.append(element);
  speaking = {
    id,
    element,
    remaining: choices.length ? Infinity : Math.max(8, text.length / 15),
  };
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
  world.storeSeeds.visible = !!s.foundForestSeeds && !s.foundStoreSeeds;
  if (speaking) {
    speaking.remaining -= dt;
    if (speaking.remaining <= 0) dismissSpeech();
  }
  world.speakers.forEach((speaker, i) => {
    const head = speaker.object.getObjectByName("head")!;
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
        world.occluders.filter((o) => o.visible),
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
    label.hidden = hidden;
    const x = (anchor.x * 0.5 + 0.5) * innerWidth,
      y = (-anchor.y * 0.5 + 0.5) * innerHeight;
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    if (speaking?.id === speaker.id) {
      if (d > 9) {
        dismissSpeech();
        return;
      }
      const bubble = speaking.element;
      bubble.hidden = hidden;
      const half = bubble.offsetWidth / 2;
      bubble.style.left = `${Math.max(half + 12, Math.min(innerWidth - half - 12, x))}px`;
      const hudTop = resourceHud.getBoundingClientRect().top;
      bubble.style.maxHeight = `${Math.max(100, Math.min(innerHeight * 0.65, hudTop - 24))}px`;
      bubble.style.top = `${Math.max(bubble.offsetHeight + 12, Math.min(y - 16, hudTop - 12))}px`;
    }
  });
}
function save() {
  updateInventoryNotices(0);
  world.updateNotebook(s.journal.at(-1)!, s.journal.length);
  try {
    localStorage.setItem(SAVE, JSON.stringify(s));
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
function toast(text: string) {
  $("#toast").textContent = text;
  $("#toast").style.opacity = "1";
  toastTime = Math.max(4, Math.min(10, text.length / 18));
}
function close() {
  last = performance.now();
  modalDefault = undefined;
  $("#modal").hidden = true;
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
  releaseMouse();
  dismissSpeech();
  paused = true;
  keys.clear();
  const modal = $("#modal");
  modal.hidden = false;
  modal.innerHTML = "";
  const p = document.createElement("section");
  p.className = "panel";
  p.setAttribute("role", "dialog");
  p.setAttribute("aria-modal", "true");
  p.setAttribute("aria-label", title);
  p.innerHTML = `<h2>${title}</h2>`;
  const content = document.createElement("div");
  content.innerHTML = text;
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
    b.setAttribute("aria-label", c.label);
    if (index === defaultIndex && !c.disabled && !c.destructive) {
      modalDefault = b;
      b.classList.add("default-action");
      const hint = document.createElement("kbd");
      hint.textContent = "E";
      hint.setAttribute("aria-hidden", "true");
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
function notebook(page = s.journal.length - 1, direction = 0) {
  page = T.MathUtils.clamp(page, 0, s.journal.length - 1);
  const entry = s.journal[page];
  const title = `Day ${page + 1}`;

  const paragraphs = entry.replace(/^Day \d+\s*/, "").split(/\n\n/);
  panel(
    "Your notebook",
    `<div class="notebook-spread"><div class="notebook-left" aria-hidden="true"><span>My notebook</span><span class="pencil-note">for Mom</span></div><div class="notebook-page" data-page="${page}"><h3>${title}</h3>${paragraphs.map((e) => `<p>${esc(e)}</p>`).join("")}</div></div><p class="page-number">Page ${page + 1} of ${s.journal.length}</p>` +
      `<p class="fine">Today's entry will be written when you go to sleep.</p>`,
    [
      {
        label: "Previous page",
        disabled: page === 0,
        run: () => notebook(page - 1, -1),
      },
      {
        label: "Next page",
        disabled: page === s.journal.length - 1,
        run: () => notebook(page + 1, 1),
      },
      { label: "Close notebook", default: true, run: close },
    ],
    "YOUR NOTEBOOK",
  );
  world.updateNotebook(entry, page + 1);
  const paper = $("#modal .panel");
  paper.classList.add("notebook-paper");
  paper
    .querySelector(".notebook-spread")!
    .parentElement!.classList.add("notebook-content");
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
    if (e.key === "ArrowLeft" && page > 0) {
      e.preventDefault();
      notebook(page - 1, -1);
    }
    if (e.key === "ArrowRight" && page < s.journal.length - 1) {
      e.preventDefault();
      notebook(page + 1, 1);
    }
  };
  paper.tabIndex = -1;
  paper.focus({ preventScroll: true });
  paper.scrollTop = 0;
  paper
    .querySelector(".notebook-left")!
    .insertAdjacentHTML("beforeend", notebookDoodles(page));
}
const hatPortraits = new Map<HatId | BikeId, string>();
function hatPortrait(id: HatId | BikeId) {
  if (hatPortraits.has(id)) return hatPortraits.get(id)!;
  const preview = new T.Scene();
  preview.background = new T.Color("#f1e4c9");
  preview.add(new T.HemisphereLight("#ffffff", "#776852", 3));
  const light = new T.DirectionalLight("#fff3d2", 3);
  light.position.set(-3, 5, 4);
  preview.add(light);
  const model = bikeById(id) ? makeBike(id as BikeId) : makeHat(id as HatId);
  preview.add(model);
  const cam = new T.PerspectiveCamera(35, 1, 0.1, 20);
  const viewpoint = bikeById(id) ? [3.2, 2.1, 3.6] : [1.5, 1.3, 2.6];
  cam.position.set(viewpoint[0], viewpoint[1], viewpoint[2]);
  cam.lookAt(0, bikeById(id) ? 0.85 : 0.2, 0);
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
    `<img class="hat-portrait" src="${hatPortrait(id)}" alt="${hat.name}"><p>${hatPower(id, s.foundCapSeeds)}</p><p>${money(hat.price)} · Your pocket: ${money(s.cash)}</p>`,
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
          : `Buy & ${wornHats(s).length >= 3 ? "keep" : "wear"} · ${money(hat.price)}`,
        disabled: s.hats.includes(id)
          ? wearing(s, id) || wornHats(s).length >= 3
          : s.cash < hat.price,
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
      id: "fertilizer",
      label: "Fertilizer",
      value: `${s.fertilizer} ${s.fertilizer === 1 ? "dose" : "doses"}`,
      available: s.fertilizer > 0,
    },
  ];
  panel(
    "Your bag",
    `<div class="inventory-grid">${items.map((item) => `<${item.id === "bed" ? 'button type="button"' : "div"} class="inventory-card ${item.available ? "" : "empty"}" data-item="${item.id}" ${item.id === "bed" ? `aria-label="Place a garden bed from your bag" ${item.available ? "" : "disabled"}` : ""}>${inventoryIcon(item.id)}<span>${item.label}</span><b>${item.value}</b>${item.id === "bed" && item.available ? "<small>Click to place</small>" : ""}</${item.id === "bed" ? "button" : "div"}>`).join("")}</div><div class="hat-bag">${s.hats.map((id) => `<button type="button" data-hat="${id}"><img src="${hatPortrait(id)}" alt=""><span>${hatById(id)!.name}</span><small>${hatPower(id, s.foundCapSeeds)}</small><b>${wearing(s, id) ? "Wearing" : "Equip"}</b></button>`).join("")}</div>`,
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
          toast("Three hats already! Visit your bedroom hat rack.");
        save();
        bag();
      }),
  );
}
function hatRack() {
  panel(
    "Your hat rack",
    `<p>Wear up to three hats. Their powers work together.</p><div class="hat-bag">${s.hats.map((id) => `<button data-rack-hat="${id}"><img src="${hatPortrait(id)}" alt=""><span>${hatById(id)!.name}</span><p class="hat-power">${hatPower(id, s.foundCapSeeds)}</p><b>${wearing(s, id) ? "Hang on rack" : "Put on"}</b></button>`).join("") || "<p>Your rack is waiting for its first hat.</p>"}</div>`,
    [{ label: "Back to the day", default: true, run: close }],
  );
  document.querySelectorAll<HTMLButtonElement>("[data-rack-hat]").forEach(
    (button) =>
      (button.onclick = () => {
        const id = button.dataset.rackHat as HatId;
        if (wearing(s, id)) removeHat(s, id);
        else if (!equipHat(s, id))
          toast("Three hats already! Hang one on the rack first.");
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
    `<div class="bank-balances"><div><span>Piggy bank</span><b>${money(s.bank)}</b></div><div><span>Your pocket</span><b>${money(s.cash)}</b></div></div><label class="amount-label" for="bank-amount">Transfer amount ($)</label><input id="bank-amount" inputmode="decimal" type="text" autocomplete="off" value="${((s.bank || s.cash) / 100).toFixed(2)}" aria-describedby="bank-error"/><p id="bank-error" role="status"></p><p class="fine">Move just what you need, or choose an all-money option.</p>`,
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
function shop(item: "seeds" | "can" | "shovel" | "fertilizer") {
  const names = {
      seeds: "Five mysterious seeds",
      can: "Watering can",
      shovel: "Shovel",
      fertilizer: "Fertilizer · five doses",
    },
    prices = { seeds: 200, can: 100, shovel: 100, fertilizer: 500 };
  panel(
    names[item],
    `<p>${item === "seeds" ? "“That'll be $2.” Robertson slides a little paper bag across the counter." : item === "can" ? "A well-loved can. Just what a thirsty seed needs." : item === "shovel" ? "For less time digging and more time dreaming." : "Five doses per box. Each dose feeds one tree for overnight harvests up to $9."}</p><p>Price: <b>${money(prices[item])}</b> · You carry <b>${money(s.cash)}</b>.</p>`,
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
function robertson() {
  visit("Visited Ol’ Man Robertson at the store.");
  s.metRobertson = true;
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
    `<p>${item === "bed" ? "A wooden bed to carry home and place on your property. Fill it with soil before planting." : "One bag fills one empty bed. Stand near the bed and press E to add it."}</p><p>Price: ${money(item === "bed" ? 3000 : 1000)}. Pocket: ${money(s.cash)}.</p>`,
    [
      {
        label: item === "bed" ? "Buy garden bed · $30" : "Buy soil · $10",
        disabled: s.cash < (item === "bed" ? 3000 : 1000),
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
function pauseMenu() {
  panel(
    "Take a little breather",
    `<p>Day ${s.day} · Your progress saves automatically.</p><p class="fine">WASD to walk. Click the game to capture the mouse and look around; left/right arrows turn; up/down arrows tilt the camera. Hold Shift to run. Q dodge-rolls. H mounts or dismounts a bicycle; B rings its bell. With Spring Hare equipped, Space jumps over beds and hedges. Escape releases the mouse. E interacts. J opens the notebook. I opens your bag.<br>Growth pauses while menus are open or the tab is hidden.</p>`,
    [
      { label: "Keep playing", run: close },
      ...(s.awake
        ? [
            {
              label: "I'm stuck — return home",
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
          save();
          const a = document.createElement("a");
          a.href = URL.createObjectURL(
            new Blob([JSON.stringify(s)], { type: "application/json" }),
          );
          a.download = "money-tree-save.json";
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        },
      },
      {
        label: "Import save",
        destructive: true,
        run: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json";
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const next = decode(await file.text());
            if (!next) {
              toast(
                "That save could not be read. Your current garden is safe.",
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
            if (
              blocked(s.position.x, s.position.z, world.rects) ||
              Math.abs(s.position.x) > 38 ||
              s.position.z > 38 ||
              s.position.z < (s.foundTVSeeds ? -89 : -39)
            )
              s.position = { x: -16, z: 4 };
            plotVersions.length = 0;
            save();
            close();
          };
          input.click();
        },
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
                run: () => {
                  action = undefined;
                  momSpoke = false;
                  world.player.userData.farewell = false;

                  s = fresh();
                  resetTransientMotion();
                  sitting = false;
                  world.setPlayerSeated(false);
                  wasHome = true;
                  visitedOutside = false;
                  plotVersions.length = 0;
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
  const line = chadLine(s, "grindset");
  visit(`Heard Chad: ${line}`);
  save();
  const choices: Choice[] = [{ label: "See the drinks", run: coffeeMenu }];
  if (s.communityPlanted)
    choices.push({
      label: s.coin ? "My coin" : "Your entrepreneurial spirit?",
      run: coinMenu,
    });
  choices.push({ label: "See you around", run: dismissSpeech });
  speak(
    "grindset",
    `<p>${line}</p>${s.communityPlanted && !s.coin ? "<p>I noticed your entrepreneurial spirit in the community garden. Want to name my brand-new cryptocurrency and invest?</p>" : ""}`,
    choices,
  );
}
function coffeeMenu() {
  panel(
    "Grindset drinks",
    `<p>Pocket: ${money(s.cash)}. Each drink lasts up to 3 minutes of active play. Sleeping ends your drink effect, even if time remains. A new drink replaces the current bonus.</p>${s.drink ? `<p>Current: ${drinks.find((d) => d.id === s.drink!.id)!.name}, ${Math.ceil(s.drink.remaining)} seconds left.</p>` : ""}`,
    [
      ...drinks.map((d) => ({
        label: `${d.name} · ${money(d.cost)} · ${d.effect}`,
        disabled: s.cash < d.cost,
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
    `${coinChart(c.history, c.price)}<div class="coin-balances"><p>Price <strong>${money(c.price)}</strong> per coin</p><p>You own ${(c.units / 1e6).toFixed(4)} coins, worth <strong>${money(coinValue(s))}</strong></p><p>Pocket <strong>${money(s.cash)}</strong> · Total invested ${money(c.invested)}</p></div><label>Buy amount $ <input id="coin-amount" inputmode="decimal" value="1.00"></label><label>Sell amount $ <input id="coin-sell-amount" inputmode="decimal" value="1.00"></label><p id="coin-error" role="status"></p><details><summary>What moves the price?</summary><p>Prices move every 15 seconds of game time. Random swings mix with earnings, savings, conversations, trees, Mom’s good days, active community beds, birdhouses, seed discoveries, bicycles owned and garden tools. Prices can fall.</p><p>${money(q.earned)} earned · ${money(q.saved)} saved · ${q.neighbors} neighbors met · ${q.trees} growing trees · Mom has a ${q.health ? "good" : "tired"} day · longest good streak ${q.longestGoodStreak}.</p><p>${q.communityBeds} active community beds · ${q.birdhouses} birdhouses · ${q.discoveries} seed discoveries · ${q.bicycles} bicycles owned · ${q.tools} garden tools.</p></details>`,
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
      button.setAttribute("aria-label", "Buy");
      button.parentElement!.prepend(button);
    }
    if (button.textContent?.includes("Sell this amount")) {
      button.classList.add("coin-sell");
      button.textContent = "Sell";
      button.setAttribute("aria-label", "Sell");
    }
  }
}
const coinTracker = document.createElement("aside");
coinTracker.id = "coin-tracker";
coinTracker.hidden = true;
document.body.append(coinTracker);
function updateCoinTracker() {
  coinTracker.hidden = !begun || !s.coin;
  if (!s.coin) return;
  const c = s.coin,
    old = c.history.at(-2) ?? c.price,
    trend = c.price > old ? "▲" : c.price < old ? "▼" : "•";
  coinTracker.innerHTML = `<strong>${escapeHTML(c.name)}</strong><br>${trend} ${money(c.price)} / coin<br>Holding ${money(coinValue(s))}`;
  coinTracker.title =
    "An in-game coin. Use the ATM beside Grindset to buy or sell.";
  if (s.drink)
    coinTracker.innerHTML += `<br>${drinks.find((d) => d.id === s.drink!.id)!.name}: ${Math.ceil(s.drink.remaining)}s`;
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
        if (s.cash < 300) {
          toast("Chad whispers that you need $3 in your pocket to join.");
          return;
        }
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
  if (s.foundMeditationSeeds) return;
  s.cash -= 300;
  s.seeds += 5;
  s.foundMeditationSeeds = true;
  visit(
    "Joined the Chads for thirty seconds of meditation in Doge. They charged $3.00 afterward and gave me five money seeds.",
  );
  save();
  speak(
    "doge-meditator-0",
    "<p>That’s $3 for the meditation. You did a great job. I found this crazy new drug. You’ve got to try it.</p>",
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
  const news = newsReports(s);
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
const tvCaption = document.createElement("aside");
tvCaption.id = "tv-news-caption";
tvCaption.hidden = true;
document.body.append(tvCaption);
function interact() {
  if (birdhouseScene || celebration) return;
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
  if (!near) return;
  const id = near.id;
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
      "<p>Come sit down, dear. I have a cup of tea for you.</p>",
      [
        {
          label: "Sit for tea",
          run: () => {
            teaSeated = sitting = true;
            s.position = { x: 12, z: 16.9 };
            world.setPlayerSeated(true);
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
      thought.hidden = false;
      thoughtTime = 9;
    }
    toast("E to stand up. You can stay a while.");
    save();
    return;
  }
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
  if (id === "pepe-show") {
    if (!canEnterPepe(s)) return;
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
  if (id.startsWith("pepe-seed-")) {
    if (collectPepePacket(s, Number(id.slice(10)))) {
      save();
      toast("Five money seeds! There are more packets scattered around Sigma.");
    }
    return;
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
  if (id === "hat-rack") {
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
    if (momAway(s) && !s.familyStory?.called)
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
            if (!sleep(s)) return;
            visitedOutside = false;
            wasHome = true;
            momSpoke = false;
            s.position = { x: -16, z: 4 };
            save();
            close();
            toast(
              `Good morning. Day ${s.day} begins. My notebook has a new page.`,
            );
          },
        },
        { label: "Stay up a little longer", run: close },
      ],
      "YOUR BED",
    );
  if (
    ["forest-seeds", "store-seeds", "garden-seeds", "tv-seeds"].includes(id)
  ) {
    if (
      findHiddenSeeds(
        s,
        id.split("-")[0] as "forest" | "store" | "garden" | "tv",
      )
    ) {
      save();
      world.setSigmaUnlocked(!!s.foundTVSeeds);
      world.syncBeds(s.plots);
      toast(
        id === "tv-seeds"
          ? "Five seeds! A path has opened past Thread & Thimble. Sigma Town is through the hedge."
          : "Five money seeds! Another chance for the garden.",
      );
    }
    return;
  }
  if (id === "mom") {
    if (s.familyStory || canTellMom(s)) return askMom();
    const metBefore = s.metMom;
    s.metMom = true;
    if (metBefore || momStatus(s.day, s.familyStory).activity === "bedrest")
      return askMom();
    visit("Talked with Mom before heading out.");
    const greeting = momGreeting();
    visit(`Heard Mom: ${greeting}`);
    save();
    return speak("mom", `<p>${greeting}</p>`, [
      { label: "How are you doing?", run: askMom },
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
    if (["empty", "harvested"].includes(p.stage)) {
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
        s.shovel
          ? `Digging… Stand still for ${plantingSeconds(s)} seconds to plant ${action.ids.length === 2 ? "both adjoining beds" : "this bed"}.`
          : `Digging by hand takes ${Number(plantingSeconds(s).toFixed(1))} seconds. A $1 shovel from Robertsons cuts it to ${Number(plantingSeconds({ ...s, shovel: true }).toFixed(1))} seconds. Stand still to plant.`,
      );
    } else if (p.stage === "ready") {
      const seedsBeforeHarvest = s.seeds;
      const n = harvest(s, i);
      save();
      chime();
      if (s.seeds > seedsBeforeHarvest) seedChime();
      toast(
        `Harvested ${money(n)}! The tree withers. Plant a fresh seed for another tree.`,
      );
    } else if (p.stage === "growing") {
      if (s.fertilizer && !p.fertilized) {
        fertilize(s, i);
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
        toast("A little nourishment. This tree can grow up to $9 overnight.");
      } else toast("Watered. This tree will be ready after you sleep.");
    } else {
      if (!s.can)
        return toast("You need a watering can. Robertson sells one for $1.");
      water(s, i);
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
function cancelNewGame() {
  close();
  $("#intro").hidden = false;
  $("#new-game").focus();
}
$("#new-game").onclick = () => {
  $("#intro").hidden = true;
  panel(
    "Start a new game?",
    "<p>This replaces your saved garden, money, and notebook. You’ll begin in bed with $4.33 in your piggy bank.</p>",
    [
      { label: "Keep my game", run: cancelNewGame },
      {
        label: "Start new game",
        destructive: true,
        run: () => {
          action = undefined;
          momSpoke = false;
          world.player.userData.farewell = false;

          s = fresh();
          resetTransientMotion();
          sitting = false;
          world.setPlayerSeated(false);
          wasHome = true;
          visitedOutside = false;
          yaw = 0;
          pitch = 0.42;
          thoughtTime = 0;
          thought.hidden = true;
          plotVersions.length = 0;
          save();
          close();
          $("#begin").click();
        },
      },
    ],
  );
};
$("#begin").onclick = () => {
  begun = true;

  last = performance.now();
  $("#intro").hidden = true;
  try {
    audio = new AudioContext();
    const noise = audio.createBuffer(1, audio.sampleRate * 3, audio.sampleRate),
      data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const breeze = audio.createBufferSource();
    breeze.buffer = noise;
    breeze.loop = true;
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    const volume = audio.createGain();
    volume.gain.value = 0.012;
    breeze.connect(filter);
    filter.connect(volume);
    volume.connect(audio.destination);
    breeze.start();
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
  if (paused) {
    if (key === "e") {
      e.preventDefault();
      if (modalDefault && !modalDefault.disabled) modalDefault.click();
    }
    return;
  }
  if (!begun) return;
  if (celebration) return;
  if ((s.pepeShowStarted && !s.pepePopped) || pepeViewHold > 0) return;
  if (key === "h") {
    mountBike();
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
    key === "q" &&
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
      ? -0.5
      : -(1 - rollTime / 0.45) * Math.PI * 2;
  if (rollPose && rollTime <= 0) {
    for (const child of [...rollPose.children]) {
      child.position.y += 1;
      world.player.add(child);
    }
    world.player.remove(rollPose);
    rollPose = undefined;
  }
}
function resetTransientMotion() {
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
    for (const p of celebration.people) {
      p.object.position.copy(p.position);
      p.object.rotation.copy(p.rotation);
    }
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
  thought.hidden = true;
  if (parkedBike) parkedBike.visible = false;
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
function targetScore(t: Target) {
  const ready =
    t.id.startsWith("plot") && s.plots[+t.id.slice(4)].stage === "ready";
  return targetDistance(t) - (ready ? 0.35 : 0);
}
function selectTarget() {
  const { x, z } = s.position;
  return world.targets
    .filter(
      (t) =>
        (t.id !== "mom" || !momAway(s)) &&
        (t.id !== "bea-chair" || inBeaHouse(s.position)) &&
        (s.foundTVSeeds ||
          (!t.id.startsWith("sigma-chad-") &&
            t.id !== "grindset" &&
            t.id !== "wolf")) &&
        (t.id !== "coin-atm" || !!s.coin) &&
        (t.id !== "forest-seeds" ||
          (!!s.foundCapSeeds && !s.foundForestSeeds)) &&
        (t.id !== "store-seeds" ||
          (!!s.foundForestSeeds && !s.foundStoreSeeds)) &&
        (t.id !== "garden-seeds" ||
          (!!s.foundStoreSeeds && !s.foundGardenSeeds)) &&
        (!t.id.startsWith("pepe-seed-") ||
          (!!s.pepePopped &&
            !s.pepePackets?.includes(Number(t.id.slice(10))))) &&
        (t.id !== "pepe-door" || !canEnterPepe(s)) &&
        (t.id !== "tv-seeds" || (!!s.foundGardenSeeds && !s.foundTVSeeds)) &&
        targetDistance(t) <
          (wearing(s, "lantern") || buff(s, "reach") ? 3 : 2.1) &&
        hasSight(t),
    )
    .sort((a, b) => targetScore(a) - targetScore(b))[0];
}
function hasSight(t: Target) {
  const a = new T.Vector3(s.position.x, 1.1, s.position.z),
    b = new T.Vector3(interactionPoint(t).x, 1.1, interactionPoint(t).z),
    dir = b.sub(a),
    d = dir.length();
  if (d < 0.01) return true;
  ray.set(a, dir.normalize());
  ray.far = d;
  return !ray
    .intersectObjects(world.occluders, false)
    .some((h) => h.distance < d - 0.1);
}
function updateUI() {
  drinkHud.hidden = !s.drink;
  if (s.drink) {
    const drink = drinks.find((d) => d.id === s.drink!.id)!;
    drinkHud.querySelector("small")!.textContent = drink.name;
    drinkHud.querySelector("strong")!.textContent =
      `${Math.ceil(s.drink.remaining)}s`;
    drinkHud.title = drink.effect;
    drinkHud.setAttribute(
      "aria-label",
      `${drink.name}, ${Math.ceil(s.drink.remaining)} seconds remaining. ${drink.effect}`,
    );
  }
  const total = s.cash + s.bank;
  updateCoinTracker();
  seedHud.querySelector("strong")!.textContent = String(s.seeds);
  seedHud.setAttribute("aria-label", `${s.seeds} money tree seeds`);
  dailyNetLedger.update(s);
  const net = s.dailyNet ?? 0;
  netHud.querySelector(".daily-net-icon")!.textContent = net < 0 ? "↘" : "↗";
  netHud.classList.toggle("negative", net < 0);
  netHud.querySelector("strong")!.textContent =
    `${net < 0 ? "−" : "+"}${money(Math.abs(net))}`;
  netHud.setAttribute(
    "aria-label",
    `${net < 0 ? "−" : "+"}${money(Math.abs(net))} Daily Net`,
  );
  cashHud.querySelector("strong")!.textContent = money(s.cash);
  bankHud.querySelector("strong")!.textContent = money(s.bank);
  cashHud.setAttribute("aria-label", `${money(s.cash)} pocket money`);
  bankHud.setAttribute(
    "aria-label",
    `${money(s.bank)} saved in the piggy bank`,
  );
  $("#stats").innerHTML = `Day ${s.day} &nbsp; ☀${
    s.equippedHat
      ? `<br><span class="equipped-hat">${wornHats(s)
          .map((id) => hatById(id)!.name)
          .join(
            " + ",
          )} · Q to roll${wearing(s, "rabbit") ? " · Space to jump" : ""}</span>`
      : ""
  }`;
  document.documentElement.style.setProperty(
    "--resource-height",
    `${resourceHud.offsetHeight}px`,
  );
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
    hint = s.foundCapSeeds
      ? s.foundForestSeeds
        ? s.foundStoreSeeds
          ? !s.foundGardenSeeds
            ? "Look closely in your neighbors’ flowerbeds."
            : !s.foundTVSeeds
              ? "Something may be tucked behind the TV at home."
              : "Your Sprout Cap has a 50% chance to save a seed at harvest. Keep exploring."
          : "Look carefully around Robertson’s shelves for another seed packet."
        : "Look for a small seed packet out among the trees."
      : "Robertson has no more seeds. Look in the brim of a cap at Thread & Thimble.";
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
  $("#objective").textContent = objective;
  $("#hint").textContent = hint;
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
      shop: [
        "Save Ol’ Man Robertson’s shop",
        `${money(total)} saved · ${money(Math.max(0, 10_000_000 - total))} left toward $100,000.`,
      ],
    };
    $("#objective").textContent = aims[phase][0];
    $("#hint").textContent = aims[phase][1];
  } else if (canTellMom(s)) {
    $("#objective").textContent = "Tell Mom you’ve got $10k";
    $("#hint").textContent =
      "You have enough in your pocket and savings to pay for her surgery. Go see Mom.";
  }
  const { x, z } = s.position;
  $("#location").textContent =
    s.foundTVSeeds && z < -40
      ? "Sigma Town"
      : atHome()
        ? "Home, sweet home"
        : x < -8 && x > -23 && z >= 14 && z < 24
          ? "Your little garden"
          : z < -21 && z > -39 && x > -4 && x < 16
            ? "Robertsons"
            : z < -23 && z > -35 && x > 18 && x < 30
              ? "Thread & Thimble"
              : z < -13
                ? "Market lane"
                : "Willow lane";
  near = selectTarget();
  let prompt = "";
  let unavailable = false;
  if (!s.awake) prompt = "<kbd>E</kbd> Get out of bed";
  else if (action)
    prompt = `Planting… ${Math.ceil(action.duration - action.elapsed)}s · stand still (moving cancels)`;
  else if (near) {
    let label = near.label;
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
        (["empty", "harvested"].includes(p.stage) && !s.seeds) ||
        (p.stage === "planted" && !s.can);
      label = ["empty", "harvested"].includes(p.stage)
        ? s.seeds
          ? `${plantingBatch(s, +near.id.slice(4)).length === 2 ? "Plant two adjoining beds" : "Plant seeds"} · stand still (${Number(plantingSeconds(s).toFixed(1))}s)`
          : "Plant seeds (need seeds)"
        : p.stage === "ready"
          ? "Harvest money tree"
          : p.stage === "growing"
            ? s.fertilizer && !p.fertilized
              ? "Apply fertilizer"
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
  }
  if (placingBed)
    prompt = canPlaceBed(s, bedPosition().x, bedPosition().z, bedObstacles())
      ? "<kbd>E</kbd> Place garden bed · Escape cancels"
      : "Find clear ground on your property · Escape cancels";
  if (sitting)
    prompt =
      meditationTime > 0
        ? `Meditating · ${Math.ceil(meditationTime)}s`
        : "<kbd>E</kbd> Stand up";
  if ((s.pepeShowStarted && !s.pepePopped) || pepeViewHold > 0)
    prompt = s.pepePopped
      ? "Seed packets are falling!"
      : `Pepe is inflating · ${Math.ceil(12 - (s.pepeInflation ?? 0))}s`;
  $("#prompt").innerHTML = prompt;
  $("#prompt").classList.toggle("unavailable", unavailable);
  $("#prompt").classList.toggle("seated", sitting);
  $("#prompt").setAttribute("aria-disabled", String(unavailable));
  $("#progress").hidden = !action;
  if (action)
    $("#progress span").style.width =
      `${(action.elapsed / action.duration) * 100}%`;
}
function frame(now: number) {
  frameNumber++;
  world.setHat(wornHats(s));
  world.setRackHats(s.hats);
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
  world.gardenSeeds.visible = !!s.foundStoreSeeds && !s.foundGardenSeeds;
  world.tvSeeds.visible = !!s.foundGardenSeeds && !s.foundTVSeeds;
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
    world.setMomDay(s.day, atHome(), false, s.familyStory) &&
    s.awake &&
    !sitting &&
    blocked(s.position.x, s.position.z, world.rects)
  )
    s.position = clearPosition(
      s.position,
      world.rects,
      s.foundTVSeeds ? -89 : -39,
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
  const active =
    begun && !paused && !document.hidden && !birdhouseScene && !celebration;
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
  const fog = scene.fog as T.Fog;
  fog.near += ((balloonView ? 90 : 35) - fog.near) * (1 - Math.exp(-dt * 3));
  fog.far += ((balloonView ? 220 : 90) - fog.far) * (1 - Math.exp(-dt * 3));
  speechLayer.style.visibility = balloonView ? "hidden" : "";
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
          thought.hidden = false;
          thoughtTime = 11;
        }
      }
      pepeViewHold = Math.max(0, pepeViewHold - dt);
      const inPepe =
        canEnterPepe(s) &&
        Math.abs(s.position.x + 18) < 6.5 &&
        Math.abs(s.position.z + 65) < 6.5;
      if (!inPepe) pepeGreeted = false;
      if (inPepe && !pepeGreeted && !s.pepeShowStarted) {
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
        !!seedConversation || momAway(s) || !!s.familyStory?.escort,
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
          s.foundTVSeeds ? -89 : -39,
        );
      const rolling = rollTime > 0;
      if (riding) {
        yaw -= r * dt * 1.6;
        const wanted = f * bikeById(s.selectedBike)!.speed * (f < 0 ? 0.45 : 1);
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
        move(s.position, dx, dz, movementRects);
        world.player.rotation.y = Math.atan2(dx, dz);
        walk += dt * (keys.has("shift") ? 17.5 : 10);
        world.player.position.y = reducedMotion ? 0 : Math.sin(walk) * 0.045;
      } else
        world.player.position.y = sitting
          ? meditationTime > 0
            ? 0.15
            : sittingWithStacy
              ? 0.52
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
      world.player.position.y += jumpHeight;
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
            plantBatch(s, action.ids);
            action = undefined;
            save();
            toast(
              s.plots[plantedId]?.stage === "growing"
                ? "Your rain hat watered the seed. Add fertilizer if you have some."
                : "A seed, a promise. Now give it some water.",
            );
          }
        }
      }
      tick(s, elapsed);
      tickSigma(s, elapsed);
      const homeNow = atHome();
      const momInside =
        !momAway(s) &&
        !s.familyStory?.escort &&
        !teaSeated &&
        momStatus(s.day, s.familyStory).activity !== "garden";
      if (wasHome && !homeNow) visitedOutside = true;
      if (!wasHome && homeNow && visitedOutside && momInside) {
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
      if (!momSpoke && atHome() && s.position.z > 6 && momInside) {
        momSpoke = true;
        s.metMom = true;
        visit("Talked with Mom before heading out.");
        const greeting = momGreeting();
        visit(`Heard Mom: ${greeting}`);
        if (s.familyStory) askMom();
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
    if (saveTime > 3) {
      save();
      saveTime = 0;
    }
  }
  s.position.x = T.MathUtils.clamp(s.position.x, -38, 38);
  s.position.z = T.MathUtils.clamp(
    s.position.z,
    s.foundTVSeeds ? -89 : -39,
    38,
  );
  world.player.position.x = s.position.x;
  world.player.position.z = s.position.z;
  world.player.visible = (s.awake || !begun) && !riding && followDistance > 0.9;
  bikeCockpit.object.visible = begun && riding;
  document.body.classList.toggle("riding", riding);
  $("#bike-bell-help").hidden = !riding;
  if (riding) bikeCockpit.update(active ? actualRideSpeed : 0, s.selectedBike!);
  world.sleeping.visible = begun && !s.awake;
  world.setSigmaUnlocked(!!s.foundTVSeeds);
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
  if (world.syncBeds(s.plots)) plotVersions.splice(5);
  while (timers.length < s.plots.length) {
    const el = document.createElement("div");
    el.className = "tree-timer";
    timerLayer.append(el);
    timers.push(el);
  }
  while (timers.length > s.plots.length) {
    timers.pop()!.remove();
    plotVersions.pop();
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
      v = `${p.stage}:${p.fertilized}`;
    if (v !== plotVersions[i]) {
      world.moneyTree(i, p.stage, p.fertilized);
      plotVersions[i] = v;
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
      s.foundTVSeeds ? -89 : -39,
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
  } else if (celebration) {
    camera.position.lerp(new T.Vector3(-9, 8, 34), 1 - Math.exp(-dt * 4));
    cameraAim.set(-16, 1, 25);
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
  } else if (teaSeated) {
    // An interior view of all three chairs and the tea table.
    const easing = reducedMotion ? 1 : 1 - Math.exp(-dt * 7);
    camera.position.lerp(new T.Vector3(14.5, 3.6, 17.2), easing);
    cameraAim.lerp(new T.Vector3(11.7, 1.5, 15.2), easing);
    camera.lookAt(cameraAim);
  } else if (riding) {
    rideTransition = Math.min(1, rideTransition + dt / 0.4);
    const eye = new T.Vector3(s.position.x, rideEyeHeight(), s.position.z);
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
    followDistance +=
      (zoomDistance - followDistance) *
      (reducedMotion ? 1 : 1 - Math.exp(-dt * 12));
    if (Math.abs(followDistance - zoomDistance) < 0.01)
      followDistance = zoomDistance;
    const angle = followAngle;
    const firstPerson = 1 - T.MathUtils.smoothstep(followDistance, 0, 1.5);
    const target = new T.Vector3(
        s.position.x,
        1.4 +
          firstPerson * 0.3 +
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
      (object) => object.visible && !object.userData.cameraWall,
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
      (camera.position.distanceTo(target) > 20 && !pepeReturning);
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
        const box = new T.Box3().setFromObject(object).expandByScalar(0.14);
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
  const news = newsReports(s);
  const report = news[Math.floor(now / 18000) % news.length];
  world.updateCartoon(
    reducedMotion ? 0 : now / 1000,
    s.tvChannel ?? "cartoons",
    report.headline,
  );
  tvCaption.hidden =
    !begun ||
    !s.awake ||
    s.tvChannel !== "news" ||
    paused ||
    !!speaking ||
    thoughtTime > 0 ||
    !!birdhouseScene ||
    !atHome() ||
    Math.hypot(s.position.x + 10.1, s.position.z - 10) > 10;
  tvCaption.innerHTML = `<strong>Town News · ${report.headline}</strong><p>${report.report}</p>`;
  world.wildlife.update(reducedMotion ? 0 : now / 1000);
  if (celebration) {
    if (!paused && !document.hidden) celebration.elapsed += dt;
    const t = celebration.elapsed,
      rush = Math.min(1, t / 3);
    world.player.visible = true;
    world.player.position.set(
      -16,
      reducedMotion ? 0 : Math.abs(Math.sin(t * 5)) * 0.7,
      25,
    );
    celebration.people.forEach((p, i) => {
      const a = (i * Math.PI * 2) / celebration!.people.length;
      const destination = new T.Vector3(
        -16 + Math.sin(a) * 3,
        reducedMotion ? 0 : Math.abs(Math.sin(t * 5 + i)) * 0.55,
        25 + Math.cos(a) * 3,
      );
      p.object.position.copy(p.position).lerp(destination, rush);
      p.object.rotation.y = a + Math.PI;
    });
    celebration.wildlife.forEach((b, i) => {
      const a = t * 0.8 + i * 0.6,
        r = i < 10 ? 4 : 2.5;
      const destination = new T.Vector3(
        -16 + Math.sin(a) * r,
        2.4 + Math.sin(a * 2) * 0.5,
        25 + Math.cos(a) * r,
      );
      b.object.position.copy(b.position).lerp(destination, rush);
    });
    if (t >= 14) {
      const ended = celebration;
      celebration = undefined;
      ended.people.forEach((p) => {
        p.object.position.copy(p.position);
        p.object.rotation.copy(p.rotation);
      });
      s.position = clearPosition(
        ended.origin,
        world.rects,
        s.foundTVSeeds ? -89 : -39,
      );
      world.setMomDay(s.day, atHome(), true, s.familyStory);
      save();
      speak(
        "mom",
        "<p>I called the hospital. They can do the surgery tomorrow! Oh, sweetheart, thank you. I am so excited. Auntie will go with me.</p>",
        [{ label: "We did it, Mom. Love you!", run: dismissSpeech }],
      );
    }
  }
  world.setDigging(!!action, !!s.shovel, action?.elapsed ?? 0);
  if (wateringAnimation && active) {
    wateringAnimation.elapsed += dt;
    if (
      wateringAnimation.elapsed >= 1.8 ||
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
  for (let i = 0; i < s.plots.length; i++) {
    const p = s.plots[i],
      el = timers[i];
    const position = world.plots[i].position
      .clone()
      .add(new T.Vector3(0, 0.45, 0));
    const distance = position.distanceTo(camera.position);
    position.project(camera);
    el.hidden =
      !begun ||
      !s.awake ||
      distance > 17 ||
      position.z > 1 ||
      p.stage !== "ready";
    el.style.left = `${(position.x * 0.5 + 0.5) * innerWidth}px`;
    el.style.top = `${(-position.y * 0.5 + 0.5) * innerHeight}px`;
    el.textContent =
      p.stage === "ready" ? "$ Ready to harvest" : "Ready tomorrow";
  }
  if (thoughtTime > 0 && active) {
    thoughtTime -= dt;
    if (thoughtTime <= 0) thought.hidden = true;
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
    thought.style.setProperty(
      "--tail-large",
      `${edge + (anchorX - edge) * 0.4 - left}px`,
    );
    thought.style.setProperty(
      "--tail-small",
      `${edge + (anchorX - edge) * 0.8 - left}px`,
    );
    thought.style.left = `${center}px`;
    thought.style.top = `${Math.min(anchorY, resourceHud.getBoundingClientRect().top - 24)}px`;
    thought.style.display = paused || anchor.z > 1 ? "none" : "";
  }
  $("#quest").style.visibility = speaking || thoughtTime > 0 ? "hidden" : "";
  updateSpeech(active ? dt : 0);
  updateUI();
  updateInventoryNotices(dt);
  if (toastTime > 0) {
    toastTime -= dt;
    if (toastTime <= 0) $("#toast").style.opacity = "0";
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
    $("#prompt").innerText =
      segment.hang === undefined
        ? film.placed === 2
          ? "We walk home together."
          : "We carry the birdhouses outside together."
        : segment.hang === 0
          ? "A home for the birds. Mom holds it steady while I help."
          : "One more. We picked these colors together.";
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
  if (!document.hidden) renderer.render(scene, camera);
}
requestAnimationFrame(frame);
// Explicitly enabled diagnostic harness; absent from ordinary production sessions.
if (new URLSearchParams(location.search).has("test")) {
  (window as unknown as { game: unknown }).game = {
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
    state: () => structuredClone(s),
    playerPosition: () => world.player.position.toArray(),
    seated: () => sitting,
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
      })),
    }),
    birdhouses: () => world.outdoorBirdhouses.filter((g) => g.visible).length,
    hatStack: () =>
      world.wornHat.children.map((o) => ({
        id: o.userData.hatId,
        y: o.position.y,
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
    sigmaOverview: () => {
      camera.position.set(17, 30, -53);
      camera.lookAt(10, 0, -67);
      renderer.render(scene, camera);
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
    targets: world.targets,
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
            o.name === "haberdasher-arrow-post",
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
    family: () => ({
      phase: storyPhase(s),
      celebrating: !!celebration,
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
