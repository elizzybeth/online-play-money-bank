import * as T from "three";
/** Carve a real opening through a wall and fit glass inside its thickness. */
export function fitWindow(
  wall: T.Mesh,
  alongX: boolean,
  length: number,
  height: number,
  thickness: number,
  panes?: { x: number; y: number; width: number; height: number }[],
) {
  const openings = panes ?? [
    {
      x: 0,
      y: 1.95 - wall.position.y,
      width: Math.min(2.4, length * 0.55),
      height: 1.45,
    },
  ];
  const outline = new T.Shape();
  outline.moveTo(-length / 2, -height / 2);
  outline.lineTo(length / 2, -height / 2);
  outline.lineTo(length / 2, height / 2);
  outline.lineTo(-length / 2, height / 2);
  outline.closePath();
  for (const { x, y, width, height: paneHeight } of openings) {
    const hole = new T.Path();
    hole.moveTo(x - width / 2, y - paneHeight / 2);
    hole.lineTo(x - width / 2, y + paneHeight / 2);
    hole.lineTo(x + width / 2, y + paneHeight / 2);
    hole.lineTo(x + width / 2, y - paneHeight / 2);
    hole.closePath();
    outline.holes.push(hole);
  }
  const geometry = new T.ExtrudeGeometry(outline, {
    depth: thickness,
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -thickness / 2);
  if (!alongX) geometry.rotateY(Math.PI / 2);
  wall.geometry.dispose();
  wall.geometry = geometry;
  wall.name ||= "wall-with-inset-window";
  for (const { x, y: centerY, width, height: paneHeight } of openings) {
    const window = new T.Group();
    window.name = "inset-window";
    window.position.set(alongX ? x : 0, centerY, alongX ? 0 : -x);
    if (!alongX) window.rotation.y = Math.PI / 2;
    wall.add(window);
    const pane = new T.Mesh(
      new T.BoxGeometry(width, paneHeight, Math.min(0.035, thickness * 0.2)),
      new T.MeshStandardMaterial({
        color: "#b6dbd9",
        transparent: true,
        opacity: 0.19,
        depthWrite: false,
        roughness: 0.08,
        side: T.DoubleSide,
      }),
    );
    pane.name = "translucent-glass";
    window.add(pane);
    const material = new T.MeshStandardMaterial({
      color: "#f2e4c5",
      roughness: 0.8,
    });
    for (const [x, y, w, h] of [
      [-width / 2, 0, 0.08, paneHeight + 0.12],
      [width / 2, 0, 0.08, paneHeight + 0.12],
      [0, -paneHeight / 2, width + 0.12, 0.08],
      [0, paneHeight / 2, width + 0.12, 0.08],
      [0, 0, 0.045, paneHeight],
    ]) {
      const trim = new T.Mesh(
        new T.BoxGeometry(w, h, thickness * 1.12),
        material,
      );
      trim.position.set(x, y, 0);
      window.add(trim);
    }
  }
}
export function pitchedRoof(width: number, depth: number, rise = 2.1) {
  const shape = new T.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(0, rise);
  shape.lineTo(width / 2, 0);
  shape.closePath();
  const geometry = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}
