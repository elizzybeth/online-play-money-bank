import "./style.css";
import { inventoryIcon } from "./icons";
import * as T from "three";
import {
  parseAmount,
  neighborLine,
  momStatus,
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
  visit(
    status.energetic
      ? `Mom had energy for ${status.journal} today.`
      : "Mom was exhausted on the couch when I came home.",
  );
  save();
  speak("mom", `<p>${status.reply}</p>`);
  thought.textContent = `Your thought: ${status.thought}`;
  thought.hidden = false;
  thoughtTime = 9;
}
function returnToMom() {
  s.metMom = true;
  visit("Checked in with Mom after coming home.");
  save();
  world.mom.userData.coughTime = 2;
  speak("mom", "<p><em>*cough, cough*</em> “You’re home, sweetheart.”</p>", [
    { label: "How are you doing?", run: askMom },
  ]);
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
  subtitle = "MONEY TREE",
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
  p.innerHTML = `<small>${subtitle}</small><h2>${title}</h2>`;
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
  (modalDefault ?? row.querySelector("button"))?.focus();
}
const esc = (str: string) =>
  str.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function notebook() {
  panel(
    "A little hope",
    s.journal
      .map(
        (e, i) =>
          `<div class="entry"><small>${i ? "A DAY TO REMEMBER" : "THE FIRST PAGE"}</small><p>${esc(e)}</p></div>`,
      )
      .join("") +
      `<p class="fine">Today's entry will be written when you go to sleep.</p>`,
    [{ label: "Close notebook", run: close }],
    "YOUR NOTEBOOK",
  );
  const paper = $("#modal .panel");
  paper.classList.add("notebook-paper");
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
function bag() {
  const items = [
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
    `<div class="inventory-grid">${items.map((item) => `<div class="inventory-card ${item.available ? "" : "empty"}" data-item="${item.id}">${inventoryIcon(item.id)}<span>${item.label}</span><b>${item.value}</b></div>`).join("")}</div>`,
    [{ label: "Back to the day", run: close }],
    "YOUR LITTLE COLLECTION",
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
      fertilizer: "Fertilizer · five applications",
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
                ? "Five mysterious seeds tucked into your bag. Robertson: “You seem pretty new to this. Want to take a look around?”"
                : "Purchase tucked into your bag.",
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
  return s.cash === 0 && s.bank > 0
    ? "“You headed into town? Take some money with you. I think you've got some in your piggy bank. OK, love you!”"
    : "“You headed into town? OK, love you!”";
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
function pauseMenu() {
  panel(
    "Take a little breather",
    `<p>Day ${s.day} · Your progress saves automatically.</p><p class="fine">WASD to walk. Click the game to capture the mouse and look around; arrow keys also work. Hold Shift to run. Escape releases the mouse. E interacts. J opens the notebook. I opens your bag.<br>Growth pauses while menus are open or the tab is hidden.</p>`,
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
      "<p>End the day, write in your notebook, and wake up to a fresh morning. Watered trees will finish growing overnight.</p>",
      [
        {
          label: "Sleep until tomorrow",
          run: () => {
            sleep(s);
            visitedOutside = false;
            wasHome = true;
            momSpoke = false;
            s.position = { x: -16, z: 4 };
            save();
            close();
            toast(`Good morning. Day ${s.day} begins.`);
          },
        },
        { label: "Stay up a little longer", run: close },
      ],
      "YOUR BED",
    );
  if (id === "mom") {
    s.metMom = true;
    visit("Talked with Mom before heading out.");
    save();
    return speak("mom", `<p>${momGreeting()}</p>`, [
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
      "“Come back when you fancy a new look. I’m getting the next collection ready.”",
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
  if (id === "cap") {
    if (findCapSeeds(s)) {
      save();
      chime();
      return toast(
        "Five money seeds! They were tucked into the brim of the cap.",
      );
    }
    return toast(
      s.foundCapSeeds
        ? "The cap’s brim is empty now."
        : "A soft little cap. Something is tucked into its brim…",
    );
  }
  if (id.startsWith("plot")) {
    const i = +id.slice(4),
      p = s.plots[i];
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
        duration: s.shovel ? 2 : 8,
        origin: { ...s.position },
      };
      toast(
        s.shovel
          ? "Digging a little home for a seed… Stand still for 2 seconds."
          : "Digging by hand… Stand still for 8 seconds. A shovel would make this quicker.",
      );
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
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
    e.preventDefault();
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  if (key === "escape") {
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
  if (key === "e") interact();
  else if (key === "j") notebook();
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
    .filter((t) => Math.hypot(x - t.x, z - t.z) < 2.1 && hasSight(t))
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
function updateUI() {
  const total = s.cash + s.bank;
  $("#stats").innerHTML =
    `DAY ${s.day} &nbsp; ☀<br><b>${money(s.cash)}</b> pocket &nbsp; ${money(s.bank)} saved`;
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
      ? "Keep exploring town for more seeds. Harvested trees wither."
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
    }
    prompt = `<kbd>E</kbd> ${label}`;
  }
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
      let f =
          (keys.has("w") || keys.has("arrowup") ? 1 : 0) -
          (keys.has("s") || keys.has("arrowdown") ? 1 : 0),
        r = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
      const n = Math.hypot(f, r);
      if (n) {
        f /= n;
        r /= n;
        const dx =
            (r * Math.cos(yaw) - f * Math.sin(yaw)) *
            dt *
            (keys.has("shift") ? 7 : 4),
          dz =
            (-r * Math.sin(yaw) - f * Math.cos(yaw)) *
            dt *
            (keys.has("shift") ? 7 : 4);
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
            plant(s, action.id);
            action = undefined;
            save();
            toast("A seed, a promise. Now give it some water.");
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
        speak("mom", `<p>${momGreeting()}</p>`);
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
  let treesChanged = false;
  for (let i = 0; i < 5; i++) {
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
  for (let i = 0; i < 5; i++) {
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
      (s.position.x > 2 && s.position.x < 14 && s.position.z < -23);
    const wantedAngle = indoors ? Math.max(0.95, pitch) : pitch;
    const easing = reducedMotion ? 1 : 1 - Math.exp(-dt * 6);
    followAngle += (wantedAngle - followAngle) * easing;
    const angle = followAngle;
    const target = new T.Vector3(s.position.x, 1.4, s.position.z),
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

  for (let i = 0; i < 5; i++) {
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
    teleport: (x: number, z: number) => {
      if (blocked(x, z, world.rects)) throw Error("Blocked test position");
      s.position = { x, z };
    },
    advance: (dt: number) => tick(s, dt),
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
      s = fresh();
      close();
    },
    setYaw: (n: number) => (yaw = n),
  };
}
