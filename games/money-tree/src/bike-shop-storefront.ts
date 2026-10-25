import * as T from "three";
import { makeBike } from "./bike-models";

export const bikeShopGold = "#f2b35e";
export const bikeShopEntrance = { x: -10.65, z: -21, width: 4.5, height: 4.65 };
export const bikeShopWindow = { x: -15.5, y: 2.445, width: 4.5, height: 4.65 };

/** Fixed-open glass doors keep the entrance visibly and physically welcoming. */
export function makeBikeShopStorefront() {
  const group = new T.Group();
  group.name = "pretty-good-bikes-storefront";
  const metal = new T.MeshStandardMaterial({
    color: "#e6e4dc",
    metalness: 0.55,
    roughness: 0.32,
  });
  const glass = new T.MeshStandardMaterial({
    color: "#bddfe2",
    transparent: true,
    opacity: 0.23,
    depthWrite: false,
    roughness: 0.12,
    side: T.DoubleSide,
  });
  const gold = new T.MeshStandardMaterial({
    color: bikeShopGold,
    roughness: 0.9,
    side: T.DoubleSide,
  });
  function box(
    parent: T.Object3D,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    material: T.Material,
  ) {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  const { x, z, width, height } = bikeShopEntrance;
  for (const side of [-1, 1]) {
    box(
      group,
      x + (side * width) / 2,
      height / 2,
      z + 0.16,
      0.1,
      height,
      0.16,
      metal,
    );
    const leaf = new T.Group();
    leaf.name = `open-glass-door-${side}`;
    leaf.position.set(x + (side * width) / 2, 0, z + 0.18);
    leaf.rotation.y = side * Math.PI * 0.46;
    group.add(leaf);
    const w = width / 2 - 0.1,
      center = (-side * w) / 2;
    const pane = box(
      leaf,
      center,
      height / 2,
      0,
      w - 0.14,
      height - 0.2,
      0.035,
      glass,
    );
    pane.castShadow = false;
    for (const edge of [0, -side * w])
      box(leaf, edge, height / 2, 0, 0.075, height, 0.1, metal);
    for (const y of [0.08, height - 0.05])
      box(leaf, center, y, 0, w, 0.1, 0.1, metal);
    box(leaf, -side * (w - 0.22), 1.9, 0.1, 0.06, 0.7, 0.09, metal);
  }
  box(group, x, height + 0.04, z + 0.16, width + 0.15, 0.14, 0.18, metal);
  const canopy = box(group, -13, 4.96, -20.2, 9.9, 0.12, 1.8, gold);
  canopy.name = "logo-gold-awning";
  canopy.rotation.x = 0.14;
  box(group, -13, 4.72, -19.31, 9.9, 0.3, 0.09, gold);
  for (const x of [-17.65, -8.45])
    box(group, x, 4.72, -20.13, 0.065, 0.065, 1.65, metal);
  const bicycle = makeBike("road", bikeShopGold);
  bicycle.name = "gold-bicycle-shop-sign";
  bicycle.rotation.y = Math.PI / 2;
  bicycle.scale.setScalar(1.28);
  bicycle.position.set(-10.65, 5.25, -20.63);
  group.add(bicycle);
  for (const x of [-11.7, -9.6])
    box(group, x, 5.75, -20.85, 0.065, 0.065, 0.45, metal);
  return group;
}
