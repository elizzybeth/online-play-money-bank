import "./style.css";
import * as T from "three";
import {
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
let frameNumber = 0;
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
const keys = new Set<string>();
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
  toastTime = 4;
}
function close() {
  last = performance.now();
  $("#modal").hidden = true;
  paused = false;
  keys.clear();
  ($("#world") as HTMLCanvasElement).focus();
}
function panel(
  title: string,
  text: string,
  choices: { label: string; run: () => void; disabled?: boolean }[],
  subtitle = "MONEY TREE",
) {
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
  for (const c of choices) {
    const b = document.createElement("button");
    b.textContent = c.label;
    b.disabled = !!c.disabled;
    b.onclick = c.run;
    row.append(b);
  }
  p.append(row);
  modal.append(p);
  row.querySelector("button")?.focus();
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
}
function bag() {
  panel(
    "Your little collection",
    `<div class="inventory-row"><span>Carried money</span><b>${money(s.cash)}</b></div><div class="inventory-row"><span>Mysterious seeds</span><b>${s.seeds}</b></div><div class="inventory-row"><span>Shovel</span><b>${s.shovel ? "Owned" : "Not yet"}</b></div><div class="inventory-row"><span>Watering can</span><b>${s.can ? "Owned" : "Not yet"}</b></div><div class="inventory-row"><span>Fertilizer applications</span><b>${s.fertilizer}</b></div>`,
    [{ label: "Back to the day", run: close }],
    "INVENTORY",
  );
}
function bank() {
  panel(
    "A penny at a time",
    `<p>Your piggy bank holds <b>${money(s.bank)}</b>.<br>You are carrying <b>${money(s.cash)}</b>.</p><p class="fine">Take your starting savings into town. Bring your harvest home to keep it safe.</p>`,
    [
      {
        label: "Withdraw savings",
        disabled: !s.bank,
        run: () => {
          withdraw(s);
          save();
          bank();
        },
      },
      {
        label: "Deposit all",
        disabled: !s.cash,
        run: () => {
          deposit(s);
          save();
          bank();
        },
      },
      { label: "Close", run: close },
    ],
    "PIGGY BANK",
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
    `<p>${item === "seeds" ? "“That'll be $2.” Robertson slides a little paper bag across the counter." : item === "can" ? "A well-loved can. Just what a thirsty seed needs." : item === "shovel" ? "For less time digging and more time dreaming." : "A little boost: faster growth and richer harvests."}</p><p>Price: <b>${money(prices[item])}</b> · You carry <b>${money(s.cash)}</b>.</p>`,
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
function robertson() {
  visit("Visited Ol’ Man Robertson at the store.");
  s.metRobertson = true;
  save();
  panel(
    "Ol’ Man Robertson",
    `<p>“Well, look who it is! Lovely day for a little dirt under your nails.”</p><p>“How’s the garden going? You still looking to buy some seeds?”</p><p class="fine">Watering can $1 · Shovel $1 · Fertilizer $5<br>“You seem pretty new to this. You might want some other supplies.”</p>`,
    [
      { label: "Yes, seeds please · $2", run: () => shop("seeds") },
      { label: "Look around", run: close },
      ...(!s.can && s.cash + s.bank < 100 && !s.recovered
        ? [
            {
              label: "Help sort a delivery",
              run: () => {
                recover(s);
                save();
                close();
                toast(
                  "Robertson: “Thanks, kid. Take this watering can, and seeds if you need them.”",
                );
              },
            },
          ]
        : []),
    ],
    "HARDWARE, GROCERIES & A LITTLE MAGIC",
  );
}
function pauseMenu() {
  panel(
    "Take a little breather",
    `<p>Day ${s.day} · Your progress saves automatically.</p><p class="fine">WASD to walk. Drag to rotate the camera; arrow keys also work. E interacts. J opens the notebook. I opens your bag.<br>Growth pauses while menus are open or the tab is hidden.</p>`,
    [
      { label: "Keep playing", run: close },
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
            s = next;
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
                run: () => {
                  s = fresh();
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
    toast("A new day. Maybe Robertson really does have something for you.");
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
    return panel(
      "Mom",
      "<p>“You headed into town? OK, love you!”</p>",
      [{ label: "Love you too", run: close }],
      "HOME",
    );
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
    return panel(
      dialogue[id][0],
      `<p>${dialogue[id][1]}</p>`,
      [{ label: "See you around", run: close }],
      "AROUND TOWN",
    );
  }
  if (id.startsWith("plot")) {
    const i = +id.slice(4),
      p = s.plots[i];
    if (p.stage === "empty") {
      if (!s.seeds)
        return toast("You need seeds. Robertson sells five for $2.");
      action = {
        id: i,
        elapsed: 0,
        duration: s.shovel ? 2 : 8,
        origin: { ...s.position },
      };
      toast(
        s.shovel
          ? "Digging a little home for a seed…"
          : "Digging by hand… a shovel would make this easier.",
      );
    } else if (p.stage === "ready") {
      const n = harvest(s, i);
      save();
      chime();
      toast(`Harvested ${money(n)}! The branches rustle softly.`);
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
      if (s.fertilizer && !p.fertilized) fertilize(s, i);
      water(s, i);
      save();
      toast("A splash of water… something stirs beneath the soil.");
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
  if (paused || !begun) return;
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
let dragging = false;
$("#world").addEventListener("pointerdown", (e) => {
  if (begun && !paused) {
    dragging = true;
    ($("#world") as HTMLCanvasElement).setPointerCapture(
      (e as PointerEvent).pointerId,
    );
  }
});
addEventListener("pointerup", () => (dragging = false));
addEventListener("pointermove", (e) => {
  if (dragging) {
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
    objective = "A pocketful of change";
    hint =
      "Your piggy bank is on the desk. Withdraw your savings for supplies.";
  } else if (s.seeds > 0 && !s.plots.some((p) => p.stage !== "empty")) {
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
  } else if (
    s.plots.some((p) => p.stage === "planted" || p.stage === "harvested")
  ) {
    objective = "A little water, a little hope";
    hint = s.can
      ? "Water your trees to start their next crop."
      : "Robertson has a watering can for $1.";
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
  if (!s.awake) prompt = "<kbd>E</kbd> Get out of bed";
  else if (action)
    prompt = `Planting… ${Math.ceil(action.duration - action.elapsed)}s · move to cancel`;
  else if (near) {
    let label = near.label;
    if (near.id.startsWith("plot")) {
      const p = s.plots[+near.id.slice(4)];
      label =
        p.stage === "empty"
          ? s.seeds
            ? "Plant seeds"
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
            (keys.has("shift") ? 1.2 : 4),
          dz =
            (-r * Math.sin(yaw) - f * Math.cos(yaw)) *
            dt *
            (keys.has("shift") ? 1.2 : 4);
        move(s.position, dx, dz, world.rects);
        world.player.rotation.y = Math.atan2(dx, dz);
        walk += dt * 10;
        world.player.position.y = reducedMotion ? 0 : Math.sin(walk) * 0.045;
      } else world.player.position.y = 0;
      if (action) {
        if (
          Math.hypot(
            s.position.x - action.origin.x,
            s.position.z - action.origin.z,
          ) > 0.2
        ) {
          action = undefined;
          toast("Planting cancelled. Your seed is safe.");
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
        toast("Mom: “You headed into town? OK, love you!”");
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
  for (let i = 0; i < 5; i++) {
    const p = s.plots[i],
      v = `${p.stage}:${p.fertilized}`;
    if (v !== plotVersions[i]) {
      world.moneyTree(i, p.stage, p.fertilized);
      plotVersions[i] = v;
    }
  }
  for (let i = 0; i < 5; i++) {
    const p = s.plots[i];
    world.plots[i].scale.setScalar(
      p.stage === "growing"
        ? 0.35 + 0.65 * (1 - p.remaining / (p.fertilized ? 60 : 90))
        : 1,
    );
  }
  for (const b of world.bills) {
    if (b.parent && !reducedMotion)
      b.rotation.z = Math.sin(now * 0.002 + b.userData.phase) * 0.12;
  }
  if (!begun) {
    camera.position.set(-5, 15, 35);
    camera.lookAt(-7, 1, 10);
  } else if (!s.awake) {
    camera.position.set(-19.1, 1.35, -0.15);
    camera.lookAt(-19.1, 0.85, 1.8);
  } else {
    const indoors =
      (s.position.x < -9 &&
        s.position.x > -22 &&
        s.position.z > -2 &&
        s.position.z < 14) ||
      (s.position.x > 2 && s.position.x < 14 && s.position.z < -23);
    const angle = indoors ? Math.max(0.95, pitch) : pitch;
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
    if (distance < 2.4) {
      const up = new T.Vector3(0, 5.8, 0.25);
      const upLength = up.length();
      up.normalize();
      ray.set(target, up);
      ray.far = upLength;
      const above = ray.intersectObjects(world.occluders, false);
      const clear = above.length
        ? Math.max(0.4, above[0].distance - 0.35)
        : upLength;
      camera.position.copy(target.clone().addScaledVector(up, clear));
    } else
      camera.position.copy(target.clone().addScaledVector(direction, distance));
    camera.lookAt(target);
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
    targets: world.targets,
    frame: () => frameNumber,
    camera: () => ({
      position: camera.position.toArray(),
      near: camera.near,
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
