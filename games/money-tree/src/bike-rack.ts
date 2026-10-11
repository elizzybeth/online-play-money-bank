import * as T from "three";
import { bikes, type BikeId } from "./bikes";
import { makeBike } from "./bike-models";
export function makeBikeRack() {
  const object = new T.Group();
  object.name = "owned-bike-rack";
  const wood = new T.MeshStandardMaterial({ color: "#a87c51", roughness: 0.8 });
  const metal = new T.MeshStandardMaterial({
    color: "#377d83",
    metalness: 0.45,
    roughness: 0.4,
  });
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), wood);
    m.position.set(x, y, z);
    object.add(m);
  };
  box(0, 0.075, 0, 7, 0.15, 3.2);
  for (const x of [-3.35, 3.35]) box(x, 0.7, -1.15, 0.16, 1.4, 0.16);
  box(0, 1.35, -1.15, 6.8, 0.13, 0.15);
  const displays = bikes.map((b, i) => {
    const x = (i - 3) * 0.96;
    const hoop = new T.Mesh(
      new T.TorusGeometry(0.21, 0.025, 6, 20, Math.PI),
      metal,
    );
    hoop.position.set(x, 0.08, -0.85);
    object.add(hoop);
    const model = makeBike(b.id);
    model.position.set(x, 0.15, 0);
    model.visible = false;
    object.add(model);
    return model;
  });
  return {
    object,
    displays,
    sync(owned: readonly BikeId[], away?: BikeId) {
      for (const model of displays)
        model.visible =
          owned.includes(model.userData.bikeId) &&
          model.userData.bikeId !== away;
    },
  };
}
