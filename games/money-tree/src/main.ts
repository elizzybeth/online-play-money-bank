import {
  generateJournal,
  journalContext,
  temporaryEntry,
  type JournalCompletion,
} from "./journal";
import { hats, hatById, type HatId } from "./hats";
import { makeHat } from "./hat-models";
import "./style.css";
import { inventoryIcon } from "./icons";
import * as T from "three";
import {
  buyGardenSupply,
  canPlaceBed,
  placeGardenBed,
  fillGardenBed,
  noteHatPower,
  buyHat,
  equipHat,
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
const world = createWorld(scene),
  camera = new T.PerspectiveCamera(52, innerWidth / innerHeight, 0.08, 110),
  ray = new T.Raycaster();
world.syncBeds(s.plots);
if (
  blocked(s.position.x, s.position.z, world.rects) ||
  Math.abs(s.position.x) > 38 ||
  s.position.z > 38 ||
  s.position.z < -39
)
  s.position = { x: -16, z: 4 };
world.player.position.set(s.position.x, 0, s.position.z);
world.setMomDay(
  s.day,
  s.position.x < -9 &&
    s.position.x > -22 &&
    s.position.z > -2 &&
    s.position.z < 14,
);
let frameNumber = 0;
let followAngle = 0.42;
const cameraAim = new T.Vector3(-7, 1, 10);
function visit(text: string) {
  if (!s.events.includes(text)) s.events.push(text);
}
let begun = false,
  paused = false,
  yaw = 0,
  pitch = 0.42,
  cameraTilted = false,
  near: Target | undefined,
  action:
    | {
        id: number;
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
const atHome = () =>
  s.position.x < -9 &&
  s.position.x > -22 &&
  s.position.z > -2 &&
  s.position.z < 14;
let wasHome = atHome(),
  visitedOutside = s.awake && !wasHome;
const thought = document.createElement("div");
thought.id = "thought";
thought.setAttribute("role", "status");
thought.hidden = true;
document.body.append(thought);
let thoughtTime = 0;
function askMom() {
  const status = momStatus(s.day);
  const reply = momReply(s);
  visit(
    status.energetic
      ? `Mom had energy for ${status.journal} today.`
      : `Mom was exhausted on the couch when I ${visitedOutside ? "came home" : "checked on her"}.`,
  );
  visit(`Heard Mom: ${reply}`);
  save();
  speak("mom", `<p>${reply}</p>`);
  thought.textContent = `Your thought: ${status.thought}`;
  thought.hidden = false;
  thoughtTime = 9;
}
function returnToMom() {
  s.metMom = true;
  visit("Checked in with Mom after coming home.");
  const badDay = !momStatus(s.day).energetic;
  const count = s.neighborChats["mom-home"] ?? 0;
  s.neighborChats["mom-home"] = count + 1;
  const greeting = [
    "You’re home, sweetheart.",
    "There you are! How was your walk?",
    "It’s good to see you, love.",
    "Come tell me what you found today.",
  ][count % 4];
  if (badDay) visit("Heard Mom coughing when I got home.");
  save();
  world.mom.userData.coughTime = badDay ? 2 : 0;
  speak(
    "mom",
    `<p>${badDay ? "<em>*cough, cough*</em> " : ""}“${greeting}”</p>`,
    [{ label: "How are you doing?", run: askMom }],
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
  if (choices.length) releaseMouse();
  toastTime = 0;
  $("#toast").style.opacity = "0";
  dismissSpeech();
  const element = document.createElement("section");
  element.className = "speech-bubble";
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
  for (const choice of choices) {
    const button = document.createElement("button");
    button.textContent = choice.label;
    button.disabled = !!choice.disabled;
    button.onclick = choice.run;
    button.dataset.safeDefault = String(!choice.destructive);
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
      .intersectObjects(world.occluders, false)
      .some((hit) => hit.distance < distance - 0.15);
    anchor.project(camera);
    const hidden =
      !begun ||
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
      bubble.style.top = `${Math.max(bubble.offsetHeight + 12, y - 16)}px`;
    }
  });
}
function save() {
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
let journalWriting = false;
let journalStatus = "";
let journalRun = 0;
let stopModel: (() => void) | undefined;
function cancelJournalWriter() {
  journalRun++;
  journalWriting = false;
  stopModel?.();
  journalStatus = "";
}
function refreshJournalStatus() {
  const status = document.querySelector<HTMLElement>("#journal-status");
  if (status) status.textContent = journalStatus;
}
async function continueJournalWriting() {
  if (journalWriting || !s.journalDrafts?.length || !begun) return;
  const state = s,
    run = ++journalRun;
  journalWriting = true;
  journalStatus = "Getting the journal writer ready...";
  refreshJournalStatus();
  try {
    while (state.journalDrafts?.length && run === journalRun && s === state) {
      const stored = state.journalDrafts[0];
      stored.seed = Math.floor(Math.random() * 1_000_000_000);
      save();
      const context = {
        ...stored,
        previous: state.journal.slice(0, stored.page),
      };
      const diagnostic = new URLSearchParams(location.search).has("test");
      const injected = diagnostic
        ? (window as unknown as { journalTestComplete?: JournalCompletion })
            .journalTestComplete
        : undefined;
      if (
        diagnostic &&
        !injected &&
        !new URLSearchParams(location.search).has("local-journal")
      )
        throw new Error(
          "The local writer is disabled in this diagnostic session. Your temporary entry is saved.",
        );
      let result: string;
      if (injected) result = await generateJournal(context, injected);
      else {
        const backend = await import("./journal-model");
        if (s !== state || run !== journalRun) return;
        stopModel = backend.stopJournalModel;
        result = await backend.writeLocalJournal(context, (text) => {
          if (run !== journalRun || s !== state) return;
          journalStatus = text;
          refreshJournalStatus();
        });
      }
      if (run !== journalRun || s !== state) return;
      if (state.journalDrafts.some((c) => c.page === context.page)) {
        state.journal[context.page] = result;
        state.journalDrafts = state.journalDrafts.filter(
          (c) => c.page !== context.page,
        );
        save();
        const openPage =
          document.querySelector<HTMLElement>(".notebook-page")?.dataset.page;
        if (openPage !== undefined) notebook(Number(openPage));
      }
    }
    journalStatus = "";
    toast("I've written about today. Your new page is in the notebook.");
  } catch (error) {
    if (run !== journalRun || s !== state) return;
    journalStatus =
      error instanceof Error
        ? error.message
        : "The local writer is unavailable. Your entry is saved; you can retry.";
  } finally {
    if (run === journalRun && s === state) {
      stopModel?.();
      journalWriting = false;
      const page =
        document.querySelector<HTMLElement>(".notebook-page")?.dataset.page;
      if (page !== undefined) notebook(Number(page));
    }
  }
}
function notebook(page = s.journal.length - 1, direction = 0) {
  page = T.MathUtils.clamp(page, 0, s.journal.length - 1);
  const entry = s.journal[page];
  const title = `Day ${page + 1}`;
  const pending = s.journalDrafts?.some((c) => c.page === page);
  const paragraphs = entry.replace(/^Day \d+\s*/, "").split(/\n\n/);
  panel(
    "Your notebook",
    `<div class="notebook-page" data-page="${page}"><h3>${title}</h3>${paragraphs.map((e) => `<p>${esc(e)}</p>`).join("")}</div><p class="page-number">Page ${page + 1} of ${s.journal.length}</p>` +
      `<p class="fine">Today's entry will be written when you go to sleep.</p>` +
      (pending
        ? `<p id="journal-status" role="status" class="fine">${esc(journalStatus || "This is a temporary entry. The local writer can make a fresh page from what happened today.")}</p>`
        : ""),
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
      ...(pending
        ? [
            {
              label: "Try writing again",
              disabled: journalWriting,
              run: () => {
                void continueJournalWriting();
                notebook(page);
              },
            },
            {
              label: "Keep this entry",
              run: () => {
                cancelJournalWriter();
                s.journalDrafts = s.journalDrafts?.filter(
                  (c) => c.page !== page,
                );
                save();
                notebook(page);
                void continueJournalWriting();
              },
            },
          ]
        : []),
      { label: "Close notebook", default: true, run: close },
    ],
    "YOUR NOTEBOOK",
  );
  const paper = $("#modal .panel");
  paper.classList.add("notebook-paper");
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
  paper.insertAdjacentHTML(
    "afterbegin",
    `<svg class="notebook-doodles" viewBox="0 0 150 90" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M26 72 Q20 54 30 33 M29 51 Q9 49 13 36 Q28 33 29 51 M29 43 Q48 43 48 28 Q31 27 29 43 M13 73 Q28 68 45 73"/>
    <circle cx="112" cy="24" r="13"/><path d="M112 4v-4 M112 44v5 M91 24h-5 M133 24h5 M97 9l-4-4 M127 9l4-4 M98 39l-4 4 M127 39l4 4 M107 28q5 5 10 0"/>
    <circle cx="107" cy="22" r="1" fill="currentColor"/><circle cx="117" cy="22" r="1" fill="currentColor"/>
    <path d="M82 68q-2-14 14-15q17-1 21 12l7 1v10l-8 1l-3 7h-5l-1-6H94l-2 6h-5l-2-9q-9 1-8-5q0-5 5-2 M96 53l-1-7l10 6 M95 58h10"/>
    <circle cx="113" cy="63" r="1" fill="currentColor"/><path d="M62 18l2 5l5 1l-5 3l-1 5l-3-5l-5-1l5-3z M60 59l2 3l4 1l-3 2l-1 4l-2-3l-4-1l3-2z"/>
  </svg>`,
  );
}
const hatPortraits = new Map<HatId, string>();
function hatPortrait(id: HatId) {
  if (hatPortraits.has(id)) return hatPortraits.get(id)!;
  const preview = new T.Scene();
  preview.background = new T.Color("#f1e4c9");
  preview.add(new T.HemisphereLight("#ffffff", "#776852", 3));
  const light = new T.DirectionalLight("#fff3d2", 3);
  light.position.set(-3, 5, 4);
  preview.add(light);
  const model = makeHat(id);
  preview.add(model);
  const cam = new T.PerspectiveCamera(35, 1, 0.1, 20);
  cam.position.set(1.5, 1.3, 2.6);
  cam.lookAt(0, 0.2, 0);
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
    `<img class="hat-portrait" src="${hatPortrait(id)}" alt="${hat.name}"><p>${hat.power}</p><p>${money(hat.price)} · Your pocket: ${money(s.cash)}</p>`,
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
          ? s.equippedHat === id
            ? "Already wearing"
            : "Put on this hat"
          : `Buy & wear · ${money(hat.price)}`,
        disabled: s.hats.includes(id)
          ? s.equippedHat === id
          : s.cash < hat.price,
        run: () => {
          if (s.hats.includes(id) ? equipHat(s, id) : buyHat(s, id)) {
            save();
            close();
            toast(`Wearing ${hat.name}. ${hat.power}`);
          }
        },
      },
      { label: "Keep looking", run: close },
    ],
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
      value: `${s.fertilizer} ${s.fertilizer === 1 ? "application" : "applications"}`,
      available: s.fertilizer > 0,
    },
  ];
  panel(
    "Your bag",
    `<div class="inventory-grid">${items.map((item) => `<div class="inventory-card ${item.available ? "" : "empty"}" data-item="${item.id}">${inventoryIcon(item.id)}<span>${item.label}</span><b>${item.value}</b></div>`).join("")}</div><div class="hat-bag">${s.hats.map((id) => `<button type="button" data-hat="${id}"><img src="${hatPortrait(id)}" alt=""><span>${hatById(id)!.name}</span><small>${hatById(id)!.power}</small><b>${s.equippedHat === id ? "Wearing" : "Equip"}</b></button>`).join("")}</div>`,
    [
      ...(s.equippedHat
        ? [
            {
              label: "Take off hat",
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
              run: () => {
                close();
                placingBed = true;
                toast(
                  "Walk to a clear spot around your house. E places the bed; Escape cancels. Green means it fits.",
                );
              },
            },
          ]
        : []),
      { label: "Back to the day", default: true, run: close },
    ],
    "YOUR LITTLE COLLECTION",
  );
  if (s.hats.length) $("#modal .panel").classList.add("inventory-panel");
  document.querySelectorAll<HTMLButtonElement>("[data-hat]").forEach(
    (b) =>
      (b.onclick = () => {
        equipHat(s, b.dataset.hat as HatId);
        save();
        bag();
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
      fertilizer: "Fertilizer · one application",
    },
    prices = { seeds: 200, can: 100, shovel: 100, fertilizer: 500 };
  panel(
    names[item],
    `<p>${item === "seeds" ? "“That'll be $2.” Robertson slides a little paper bag across the counter." : item === "can" ? "A well-loved can. Just what a thirsty seed needs." : item === "shovel" ? "For less time digging and more time dreaming." : "One fertilizer application: faster growth and richer harvests for one tree."}</p><p>Price: <b>${money(prices[item])}</b> · You carry <b>${money(s.cash)}</b>.</p>`,
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
                "<p>“You seem pretty new to this. You might want some other supplies. Want to take a look around?”</p>",
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
  const count = s.neighborChats["mom-greeting"] ?? 0;
  s.neighborChats["mom-greeting"] = count + 1;
  const lines = [
    "You headed into town? OK, love you!",
    "Heading out, sweetheart? Tell me about it when you get back.",
    "Have a good walk, love. I’ll be here.",
    "Off exploring again? Love you. See you soon.",
  ];
  const reminder =
    s.cash === 0 && s.bank > 0
      ? " Take some money with you. I think you've got some in your piggy bank."
      : "";
  return `“${lines[count % lines.length]}${reminder}”`;
}
function robertson() {
  visit("Visited Ol’ Man Robertson at the store.");
  s.metRobertson = true;
  save();
  speak(
    "robertson",
    s.boughtSeeds
      ? `<p>“How’s the garden going? Those trees wither after you pick their bills. You’ll need fresh seeds.”</p><p>“I’ve no more to sell you. Go find some yourself! Try the haberdasher’s — check the brim of a cap.”</p><p class="fine">“Fertilizer’s still $5. Take a look around.”</p>`
      : `<p>“Well, look who it is! Lovely day for a little dirt under your nails.”</p>${s.cash === 0 ? "<p>“No money with you? Head back home and check your piggy bank. You might have some saved in there.”</p>" : ""}<p>“How’s the garden going? You still looking to buy some seeds?”</p><p class="fine">Watering can $1 · Shovel $1 · Fertilizer $5</p>`,
    [
      ...(!s.boughtSeeds
        ? [{ label: "Yes, seeds please · $2", run: () => shop("seeds") }]
        : []),
      { label: "Garden bed · $30", run: () => gardenSupply("bed") },
      { label: "Soil for one bed · $10", run: () => gardenSupply("soil") },
      { label: "Look around", run: dismissSpeech },
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
const bedPosition = () => ({
  x: Math.round((s.position.x - Math.sin(yaw) * 2.5) * 4) / 4,
  z: Math.round((s.position.z - Math.cos(yaw) * 2.5) * 4) / 4,
});
const bedObstacles = () => world.rects.concat(world.paths, world.doorways);
function pauseMenu() {
  panel(
    "Take a little breather",
    `<p>Day ${s.day} · Your progress saves automatically.</p><p class="fine">WASD to walk. Click the game to capture the mouse and look around; left/right arrows turn; up/down arrows tilt the camera. Hold Shift to run. Escape releases the mouse. E interacts. J opens the notebook. I opens your bag.<br>Growth pauses while menus are open or the tab is hidden.</p>`,
    [
      { label: "Keep playing", run: close },
      ...(s.awake
        ? [
            {
              label: "I'm stuck — return home",
              run: () => {
                action = undefined;
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
            cancelJournalWriter();
            s = next;
            wasHome = atHome();
            visitedOutside = s.awake && !wasHome;
            if (
              blocked(s.position.x, s.position.z, world.rects) ||
              Math.abs(s.position.x) > 38 ||
              s.position.z > 38 ||
              s.position.z < -39
            )
              s.position = { x: -16, z: 4 };
            plotVersions.length = 0;
            save();
            close();
            void continueJournalWriting();
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
                  cancelJournalWriter();
                  s = fresh();
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
function interact() {
  if (!begun || paused || action) return;
  if (!s.awake) {
    s.awake = true;
    s.position = { x: -16, z: 4 };
    save();
    toast("Take a look around your room. Your notebook is open on the desk.");
    return;
  }
  near = selectTarget();
  if (!near) return;
  const id = near.id;
  if (id === "notebook") return notebook();
  if (id === "bank") return bank();
  if (id === "robertson") return robertson();
  if (["can", "shovel", "fertilizer"].includes(id))
    return shop(id as "can" | "shovel" | "fertilizer");
  if (id === "bed")
    return panel(
      "Tomorrow is another chance",
      "<p>End the day, write in your notebook, and wake up to a fresh morning. Watered trees will finish growing overnight.</p><p class='fine'>Fresh notebook entries are written on your device. The first use downloads a local language model (about 5.2 GB), which needs a browser with WebGPU. You can keep playing while it writes. If it cannot run, your day is saved as a temporary entry with a retry button.</p>",
      [
        {
          label: "Sleep until tomorrow",
          run: () => {
            const context = journalContext(s);
            sleep(s);
            s.journal[context.page] = temporaryEntry(context);
            (s.journalDrafts ??= []).push({ ...context, previous: [] });
            visitedOutside = false;
            wasHome = true;
            momSpoke = false;
            s.position = { x: -16, z: 4 };
            save();
            close();
            toast(
              `Good morning. Day ${s.day} begins. I’m writing in my notebook.`,
            );
            void continueJournalWriting();
          },
        },
        { label: "Stay up a little longer", run: close },
      ],
      "YOUR BED",
    );
  if (id === "forest-seeds" || id === "store-seeds") {
    if (findHiddenSeeds(s, id === "forest-seeds" ? "forest" : "store")) {
      save();
      toast("Five money seeds! Another chance for the garden.");
    }
    return;
  }
  if (id === "mom") {
    s.metMom = true;
    visit("Talked with Mom before heading out.");
    const greeting = momGreeting();
    visit(`Heard Mom: ${greeting}`);
    save();
    return speak("mom", `<p>${greeting}</p>`, [
      { label: "How are you doing?", run: askMom },
      { label: "Love you too", run: dismissSpeech },
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
      "“Try the hats on the stands! Each has a little talent of its own. The green cap has a curious brim…”",
    ],
    bicycle: [
      "Spoke & Saddle",
      "“A good bike makes a small town feel big. We’ll have something for you soon.”",
    ],
  };
  if (dialogue[id]) {
    visit(`Stopped to talk with ${dialogue[id][0]}.`);
    const line = id.startsWith("npc") ? neighborLine(s, id) : dialogue[id][1];
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
            ? "You need fresh seeds. Try looking around the haberdashery."
            : "You need seeds. Robertson sells five for $2.",
        );
      action = {
        id: i,
        elapsed: 0,
        duration: plantingSeconds(s),
        origin: { ...s.position },
      };
      toast(`Digging… Stand still for ${plantingSeconds(s)} seconds to plant.`);
    } else if (p.stage === "ready") {
      const n = harvest(s, i);
      save();
      chime();
      toast(
        `Harvested ${money(n)}! The tree withers. Plant a fresh seed for another tree.`,
      );
    } else if (p.stage === "growing") {
      if (s.fertilizer && !p.fertilized) {
        fertilize(s, i);
        save();
        toast("A little nourishment. This tree will grow faster.");
      } else
        toast(
          `Growing · ${Math.ceil(p.remaining)} seconds left. Go explore a little.`,
        );
    } else {
      if (!s.can)
        return toast("You need a watering can. Robertson sells one for $1.");
      water(s, i);
      save();
      toast(
        s.fertilizer && !p.fertilized
          ? "Watered! Press E to add fertilizer (one application)."
          : "A splash of water… something stirs beneath the soil.",
      );
    }
  }
}
let audio: AudioContext | undefined;
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
          cancelJournalWriter();
          s = fresh();
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
  void continueJournalWriting();
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
  if (
    key === " " &&
    s.awake &&
    s.equippedHat === "rabbit" &&
    jumpHeight === 0 &&
    !action
  ) {
    jumpVelocity = 5.5;
    noteHatPower(s, "to jump");
  } else if (key === "e") {
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
      ".choices button:not(:disabled)",
    );
    if (choice && choice.dataset.safeDefault === "true") choice.click();
    else interact();
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
    yaw -= e.movementX * 0.006;
    cameraTilted = true;
    pitch = T.MathUtils.clamp(pitch + e.movementY * 0.004, 0.15, 1.1);
  }
});
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
function selectTarget() {
  const { x, z } = s.position;
  return world.targets
    .filter(
      (t) =>
        (t.id !== "forest-seeds" ||
          (!!s.foundCapSeeds && !s.foundForestSeeds)) &&
        (t.id !== "store-seeds" ||
          (!!s.foundForestSeeds && !s.foundStoreSeeds)) &&
        Math.hypot(x - t.x, z - t.z) <
          (s.equippedHat === "lantern" ? 3 : 2.1) &&
        hasSight(t),
    )
    .sort(
      (a, b) => Math.hypot(x - a.x, z - a.z) - Math.hypot(x - b.x, z - b.z),
    )[0];
}
function hasSight(t: Target) {
  const a = new T.Vector3(s.position.x, 1.1, s.position.z),
    b = new T.Vector3(t.x, 1.1, t.z),
    dir = b.sub(a),
    d = dir.length();
  if (d < 0.01) return true;
  ray.set(a, dir.normalize());
  ray.far = d;
  return !ray
    .intersectObjects(world.occluders, false)
    .some((h) => h.distance < d - 0.1);
}
const treeReport = document.createElement("aside");
treeReport.id = "tree-report";
treeReport.setAttribute("aria-label", "Tree growth report");
document.body.append(treeReport);
function updateUI() {
  treeReport.hidden = !begun || !s.awake || s.equippedHat !== "inspector";
  if (!treeReport.hidden && !paused)
    noteHatPower(s, "to check how my trees were growing");
  if (!treeReport.hidden)
    treeReport.innerHTML = `<strong>Garden report</strong>${s.plots.map((p, i) => `<div>Tree ${i + 1} · ${p.stage === "growing" ? `${Math.floor(Math.ceil(p.remaining) / 60)}:${String(Math.ceil(p.remaining) % 60).padStart(2, "0")} remaining` : p.stage === "harvested" ? "Withered" : p.stage === "ready" ? "Ready to harvest!" : p.stage === "planted" ? "Needs water" : "Empty planter"}</div>`).join("")}`;
  const total = s.cash + s.bank;
  $("#stats").innerHTML =
    `Day ${s.day} &nbsp; ☀<br><b>${money(s.cash)}</b> pocket &nbsp; ${money(s.bank)} saved${s.equippedHat ? `<br><span class="equipped-hat">${hatById(s.equippedHat)!.name}${s.equippedHat === "rabbit" ? " · Space to jump" : ""}</span>` : ""}`;
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
      "Watch the timers, explore the neighborhood, or sleep until tomorrow.";
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
          ? "Your Sprout Cap can find seeds when you harvest. Keep exploring."
          : "Look carefully around Robertson’s shelves for another seed packet."
        : "Look for a small seed packet out among the trees."
      : "Robertson has no more seeds. Look in the brim of a cap at Thread & Thimble.";
  } else if (s.metRobertson) {
    objective = "Seeds of possibility";
    hint = "Buy five seeds for $2. A shovel makes planting quicker.";
  }
  $("#objective").textContent = objective;
  $("#hint").textContent = hint;
  const { x, z } = s.position;
  $("#location").textContent =
    x < -9 && x > -22 && z > -2 && z < 14
      ? "Home, sweet home"
      : x < -8 && x > -23 && z >= 14 && z < 24
        ? "Your little garden"
        : z < -22 && x > 2 && x < 14
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
    if (near.id.startsWith("plot")) {
      const p = s.plots[+near.id.slice(4)];
      unavailable =
        (["empty", "harvested"].includes(p.stage) && !s.seeds) ||
        (p.stage === "planted" && !s.can);
      label = ["empty", "harvested"].includes(p.stage)
        ? s.seeds
          ? `Plant seeds · stand still (${s.shovel ? 2 : 8}s)`
          : "Plant seeds (need seeds)"
        : p.stage === "ready"
          ? "Harvest money tree"
          : p.stage === "growing"
            ? s.fertilizer && !p.fertilized
              ? "Apply fertilizer"
              : `Growing · ${Math.ceil(p.remaining)}s`
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
    prompt = `<kbd>E</kbd> ${label}`;
  }
  if (placingBed)
    prompt = canPlaceBed(s, bedPosition().x, bedPosition().z, bedObstacles())
      ? "<kbd>E</kbd> Place garden bed · Escape cancels"
      : "Find clear ground on your property · Escape cancels";
  $("#prompt").innerHTML = prompt;
  $("#prompt").classList.toggle("unavailable", unavailable);
  $("#prompt").setAttribute("aria-disabled", String(unavailable));
  $("#progress").hidden = !action;
  if (action)
    $("#progress span").style.width =
      `${(action.elapsed / action.duration) * 100}%`;
}
function frame(now: number) {
  frameNumber++;
  world.setHat(s.equippedHat);
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
    world.setMomDay(s.day, atHome()) &&
    s.awake &&
    blocked(s.position.x, s.position.z, world.rects)
  )
    s.position = clearPosition(s.position, world.rects);
  const homeDistance = Math.hypot(
    Math.max(-21 - s.position.x, 0, s.position.x + 9),
    Math.max(-2 - s.position.z, 0, s.position.z - 14),
  );
  const wantedRoof = begun ? Math.min(1, homeDistance / 1.2) : 1;
  const roofMaterial = world.homeRoof.material as T.MeshStandardMaterial;
  roofMaterial.opacity +=
    (wantedRoof - roofMaterial.opacity) *
    (reducedMotion ? 1 : 1 - Math.exp(-dt * 9));
  world.homeRoof.visible = roofMaterial.opacity > 0.02;
  world.homeRoof.castShadow = roofMaterial.opacity > 0.95;
  roofMaterial.depthWrite = roofMaterial.opacity > 0.95;
  const roofIndex = world.occluders.indexOf(world.homeRoof);
  if (wantedRoof > 0.95 && roofMaterial.opacity > 0.95) {
    if (roofIndex < 0) world.occluders.push(world.homeRoof);
  } else if (roofIndex >= 0) world.occluders.splice(roofIndex, 1);
  const active = begun && !paused && !document.hidden;
  if (active) {
    if (s.awake) {
      if (keys.has("arrowleft")) yaw += dt * 1.8;
      if (keys.has("arrowright")) yaw -= dt * 1.8;
      if (keys.has("arrowup") || keys.has("arrowdown")) cameraTilted = true;
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
      const n = Math.hypot(f, r);
      if (n) {
        if (s.equippedHat === "propeller")
          noteHatPower(s, "to get around faster");
        f /= n;
        r /= n;
        const dx =
            (r * Math.cos(yaw) - f * Math.sin(yaw)) *
            dt *
            movementSpeed(s, keys.has("shift")),
          dz =
            (-r * Math.sin(yaw) - f * Math.cos(yaw)) *
            dt *
            movementSpeed(s, keys.has("shift"));
        move(s.position, dx, dz, world.rects);
        world.player.rotation.y = Math.atan2(dx, dz);
        walk += dt * (keys.has("shift") ? 17.5 : 10);
        world.player.position.y = reducedMotion ? 0 : Math.sin(walk) * 0.045;
      } else world.player.position.y = 0;
      if (
        s.position.z > 17.3 &&
        s.position.z < 20.7 &&
        s.plots.some((_, i) => Math.abs(s.position.x - (-20 + i * 2)) < 0.85)
      )
        world.player.position.y += 0.29;
      jumpHeight = Math.max(0, jumpHeight + jumpVelocity * dt);
      if (jumpHeight > 0) jumpVelocity -= 13 * dt;
      else jumpVelocity = 0;
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
            plant(s, plantedId);
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
      const homeNow = atHome();
      if (wasHome && !homeNow) visitedOutside = true;
      if (!wasHome && homeNow && visitedOutside) {
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
        !momSpoke &&
        s.position.z > 6 &&
        s.position.z < 14 &&
        s.position.x < -9 &&
        s.position.x > -21
      ) {
        momSpoke = true;
        s.metMom = true;
        visit("Talked with Mom before heading out.");
        const greeting = momGreeting();
        visit(`Heard Mom: ${greeting}`);
        speak("mom", `<p>${greeting}</p>`, [
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
  world.player.position.x = s.position.x;
  world.player.position.z = s.position.z;
  world.player.visible = s.awake || !begun;
  world.sleeping.visible = begun && !s.awake;
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
    blocked(s.position.x, s.position.z, world.rects)
  ) {
    s.position = clearPosition(s.position, world.rects);
    world.player.position.set(s.position.x, 0, s.position.z);
    save();
  }
  for (let i = 0; i < s.plots.length; i++) {
    const p = s.plots[i];
    world.plots[i].scale.setScalar(
      p.stage === "growing"
        ? 0.35 + 0.65 * (1 - p.remaining / (p.fertilized ? 120 : 180))
        : 1,
    );
  }
  for (const b of world.bills) {
    if (b.parent && !reducedMotion)
      b.rotation.z = Math.sin(now * 0.002 + b.userData.phase) * 0.12;
  }
  if (!begun) {
    camera.position.set(-5, 15, 35);
    cameraAim.set(-7, 1, 10);
    camera.lookAt(cameraAim);
  } else if (!s.awake) {
    camera.position.set(-19.1, 1.85, -0.75);
    cameraAim.set(-19.1, 1.1, 1.05);
    camera.lookAt(cameraAim);
  } else {
    const indoors =
      (s.position.x < -9 &&
        s.position.x > -22 &&
        s.position.z > -2 &&
        s.position.z < 14) ||
      (s.position.x > 2 && s.position.x < 14 && s.position.z < -23) ||
      inHatShop;
    const wantedAngle =
      indoors && !cameraTilted ? Math.max(0.95, pitch) : pitch;
    const easing = reducedMotion ? 1 : 1 - Math.exp(-dt * 6);
    followAngle += (wantedAngle - followAngle) * easing;
    const angle = followAngle;
    const target = new T.Vector3(
        s.position.x,
        1.4 + jumpHeight * 0.7,
        s.position.z,
      ),
      desired = target
        .clone()
        .add(
          new T.Vector3(
            Math.sin(yaw) * Math.cos(angle) * 5.8,
            Math.sin(angle) * 5.8 + 1,
            Math.cos(yaw) * Math.cos(angle) * 5.8,
          ),
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
      const hits = ray.intersectObjects(world.occluders, false);
      if (hits.length)
        distance = Math.min(distance, Math.max(0.4, hits[0].distance - 0.4));
    }
    const ideal = target.clone().addScaledVector(direction, distance);
    // Gradually lift above nearby obstacles instead of switching to a top-down view.
    const overhead = T.MathUtils.smoothstep(distance, 1.0, 3.0);
    if (overhead < 1) {
      const up = new T.Vector3(0, 5.8, 0.25),
        upLength = up.length();
      up.normalize();
      ray.set(target, up);
      ray.far = upLength;
      const above = ray.intersectObjects(world.occluders, false);
      const clear = above.length
        ? Math.max(0.12, above[0].distance - 0.35)
        : upLength;
      ideal.lerp(target.clone().addScaledVector(up, clear), 1 - overhead);
    }
    const next = camera.position.clone().lerp(ideal, easing);
    // Sweep the camera itself and slide along obstacles. Clamping the sightline
    // back toward the player would cause a sudden zoom under doorway lintels.
    const bounds = world.occluders.map((o) => {
      o.updateWorldMatrix(true, false);
      return new T.Box3().setFromObject(o).expandByScalar(0.14);
    });
    for (let pass = 0; pass < 3; pass++)
      for (const box of bounds) {
        const step = next.clone().sub(camera.position),
          length = step.length();
        if (length < 0.0001) continue;
        const segment = new T.Ray(camera.position, step.normalize());
        const hit = segment.intersectBox(box, new T.Vector3());
        if (hit && hit.distanceTo(camera.position) <= length + 0.001) {
          const axes = ["x", "y", "z"] as const;
          const faces = axes
            .flatMap((axis) => [
              {
                axis,
                value: box.min[axis] - 0.02,
                distance: Math.abs(hit[axis] - box.min[axis]),
              },
              {
                axis,
                value: box.max[axis] + 0.02,
                distance: Math.abs(hit[axis] - box.max[axis]),
              },
            ])
            .sort((a, b) => a.distance - b.distance);
          next[faces[0].axis] = faces[0].value;
        }
        if (box.containsPoint(next)) {
          const axes = ["x", "y", "z"] as const;
          const faces = axes
            .flatMap((axis) => [
              {
                axis,
                value: box.min[axis] - 0.02,
                distance: Math.abs(next[axis] - box.min[axis]),
              },
              {
                axis,
                value: box.max[axis] + 0.02,
                distance: Math.abs(next[axis] - box.max[axis]),
              },
            ])
            .sort((a, b) => a.distance - b.distance);
          next[faces[0].axis] = faces[0].value;
        }
      }
    camera.position.copy(next);
    cameraAim.lerp(target, easing);
    camera.lookAt(cameraAim);
  }

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
      !["growing", "ready"].includes(p.stage);
    el.style.left = `${(position.x * 0.5 + 0.5) * innerWidth}px`;
    el.style.top = `${(-position.y * 0.5 + 0.5) * innerHeight}px`;
    el.textContent =
      p.stage === "ready"
        ? "$ Ready to harvest"
        : `♧ ${Math.ceil(p.remaining)}s`;
  }
  if (thoughtTime > 0 && active) {
    thoughtTime -= dt;
    if (thoughtTime <= 0) thought.hidden = true;
  }
  thought.style.display = paused ? "none" : "";
  updateSpeech(active ? dt : 0);
  updateUI();
  if (toastTime > 0) {
    toastTime -= dt;
    if (toastTime <= 0) $("#toast").style.opacity = "0";
  }
  if (!document.hidden) renderer.render(scene, camera);
}
requestAnimationFrame(frame);
// Explicitly enabled diagnostic harness; absent from ordinary production sessions.
if (new URLSearchParams(location.search).has("test")) {
  (window as unknown as { game: unknown }).game = {
    state: () => structuredClone(s),
    journalContext: () => journalContext(s),
    writeJournal: (context: ReturnType<typeof journalContext>) =>
      import("./journal-model").then((m) =>
        m.writeLocalJournal(context, (text) => {
          journalStatus = text;
          refreshJournalStatus();
        }),
      ),
    teleport: (x: number, z: number) => {
      if (blocked(x, z, world.rects)) throw Error("Blocked test position");
      s.position = { x, z };
    },
    advance: (dt: number) => tick(s, dt),
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
    paths: world.paths,
    doorways: world.doorways,
    boundaryHedges: () =>
      world.boundaryHedges.map((mesh) => {
        const bounds = new T.Box3().setFromObject(mesh);
        return { min: bounds.min.toArray(), max: bounds.max.toArray() };
      }),
    targets: world.targets,
    homeRoof: () => ({
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
        return { min: bounds.min.toArray(), max: bounds.max.toArray() };
      }),
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
    cameraPitch: () => pitch,
    frame: () => frameNumber,
    camera: () => ({
      position: camera.position.toArray(),
      near: camera.near,
      penetrationDetails: world.occluders
        .filter(
          (o) =>
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
          !o.userData.roof &&
          new T.Box3()
            .setFromObject(o)
            .expandByScalar(0.08)
            .containsPoint(camera.position),
      ).length,
    }),
    reset: () => {
      placingBed = false;
      cancelJournalWriter();
      s = fresh();
      close();
    },
    setYaw: (n: number) => (yaw = n),
  };
}
