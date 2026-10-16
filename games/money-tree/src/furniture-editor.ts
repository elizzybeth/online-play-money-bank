import { furnitureById, type FurnishingId } from "./furnishings";
export type EditorEntry = {
  item: FurnishingId;
  index?: number;
  quantity?: number;
};
export function createFurnitureEditor(actions: {
  entries: () => EditorEntry[];
  portrait: (id: FurnishingId) => string;
  select: (entry: EditorEntry) => void;
  browse: () => void;
  confirm: () => void;
  cancel: () => void;
  retrieve: () => void;
  exit: () => void;
}) {
  const root = document.createElement("aside");
  root.id = "furniture-editor";
  root.hidden = true;
  root.setAttribute("aria-label", "Furniture editor");
  root.innerHTML = `<header><h2>Furniture editor <small>F5</small></h2><button data-edit="exit" aria-label="Close furniture editor">×</button></header><div class="editor-browser" role="dialog" aria-label="Choose furniture"><p>Choose a model to try in your home. You can keep walking while you preview.</p><div class="editor-stock"></div></div><div class="editor-preview" hidden><h3></h3><p class="editor-status" role="status"></p><p>WASD walk · drag to look<br>R rotate · Shift+R fine rotate<br>Wheel moves nearer/farther<br>L locks preview · arrows fine position<br>Page Up/Down adjusts height<br>E place · Esc cancel preview</p><button data-edit="confirm">Place furnishing</button><button data-edit="browse">Browse furniture</button><button data-edit="retrieve">Put back in bag</button><button data-edit="cancel">Cancel preview</button></div>`;
  root.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-edit]",
    );
    if (button) actions[button.dataset.edit as "exit"]();
  });
  document.body.append(root);
  const browser = root.querySelector<HTMLElement>(".editor-browser")!;
  const preview = root.querySelector<HTMLElement>(".editor-preview")!;
  const status = root.querySelector<HTMLElement>(".editor-status")!;
  let lastStatus = "";
  return {
    root,
    browse() {
      root.hidden = false;
      browser.hidden = false;
      preview.hidden = true;
      const stock = root.querySelector(".editor-stock")!;
      stock.replaceChildren();
      const entries = actions.entries();
      for (const entry of entries) {
        const button = document.createElement("button");
        button.className = "editor-card";
        button.setAttribute(
          "aria-label",
          `${entry.index === undefined ? "Preview" : "Move"} ${furnitureById(entry.item).name}`,
        );
        const img = document.createElement("img");
        img.src = actions.portrait(entry.item);
        img.alt = "";
        const label = document.createElement("span");
        label.textContent = furnitureById(entry.item).name;
        const count = document.createElement("small");
        count.textContent =
          entry.index === undefined
            ? `In bag: ${entry.quantity}`
            : "Placed · move or put away";
        button.append(img, label, count);
        button.onclick = () => actions.select(entry);
        stock.append(button);
      }
      if (!entries.length)
        stock.textContent =
          "Your furniture collection is empty. Visit Robertsons or Mansion Marvels.";
    },
    preview(item: FurnishingId, existing: boolean) {
      root.hidden = false;
      browser.hidden = true;
      preview.hidden = false;
      preview.querySelector("h3")!.textContent = furnitureById(item).name;
      preview.querySelector<HTMLButtonElement>(
        '[data-edit="retrieve"]',
      )!.hidden = !existing;
    },
    status(valid: boolean, locked: boolean) {
      const text = `${valid ? "Fits here" : "Blocked or outside your home"} · ${locked ? "Preview locked in place" : "Preview follows your aim"}`;
      if (text === lastStatus) return;
      lastStatus = text;
      status.textContent = text;
      (
        preview.querySelector('[data-edit="confirm"]') as HTMLButtonElement
      ).disabled = !valid;
    },
    close() {
      root.hidden = true;
    },
  };
}
