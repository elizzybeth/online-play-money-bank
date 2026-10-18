import * as T from "three";
/** Readable screen-space TV dialogue with a hand-drawn attribution line. */
export function createTVCaptions(screen: T.Object3D) {
  const caption = document.createElement("aside");
  caption.id = "tv-news-caption";
  caption.hidden = true;
  caption.setAttribute("aria-label", "Television captions");
  const heading = document.createElement("strong"),
    text = document.createElement("p");
  caption.append(heading, text);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "tv-caption-attribution";
  svg.setAttribute("aria-hidden", "true");
  svg.style.display = "none";
  const path = document.createElementNS(svg.namespaceURI, "path");
  svg.append(path);
  document.body.append(svg, caption);
  const anchor = new T.Vector3();
  let content = "",
    layout = "",
    height = 100,
    lastWidth = 0;
  return {
    update(
      camera: T.Camera,
      headline: string,
      report: string,
      visible: boolean,
    ) {
      screen.getWorldPosition(anchor);
      const close = anchor.distanceToSquared(camera.position) < 400;
      camera.updateMatrixWorld();
      anchor.project(camera);
      const shown =
        visible &&
        close &&
        anchor.z >= -1 &&
        anchor.z <= 1 &&
        Math.abs(anchor.x) < 1 &&
        Math.abs(anchor.y) < 1;
      if (caption.hidden === shown) caption.hidden = !shown;
      const display = shown ? "" : "none";
      if (svg.style.display !== display) svg.style.display = display;
      if (!shown) return;
      const key = headline + "\n" + report;
      if (content !== key || lastWidth !== innerWidth) {
        heading.textContent = headline;
        text.textContent = report;
        content = key;
        lastWidth = innerWidth;
        height = caption.offsetHeight;
      }
      const ax = Math.round((anchor.x * 0.5 + 0.5) * innerWidth),
        ay = Math.round((-anchor.y * 0.5 + 0.5) * innerHeight);
      const width = Math.min(380, innerWidth - 32),
        x = Math.max(16, Math.min(innerWidth - width - 16, ax - width - 48));
      const y = Math.max(
        100,
        Math.min(innerHeight - height - 120, ay - height - 45),
      );
      const bx = x + width * 0.8,
        by = y + height,
        dx = ax - bx,
        dy = ay - by;
      const next = [x, y, ax, ay, width, height, innerWidth, innerHeight].join(
        ":",
      );
      if (next === layout) return;
      layout = next;
      caption.style.left = x + "px";
      caption.style.top = y + "px";
      svg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
      path.setAttribute(
        "d",
        `M ${bx} ${by} Q ${bx + dx * 0.2 + 10} ${by + dy * 0.25} ${bx + dx * 0.4} ${by + dy * 0.4} T ${bx + dx * 0.7 + 7} ${by + dy * 0.7} T ${ax} ${ay}`,
      );
    },
  };
}
