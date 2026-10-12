import * as T from "three";
/** Open cast-iron skillet with a removable red silicone grip. */
export function makeCookingPan() {
  const root = new T.Group();
  root.name = "cast-iron-red-handle-pan";
  const iron = new T.MeshStandardMaterial({
    color: "#242426",
    roughness: 0.82,
    metalness: 0.3,
  });
  const profile = [
    [0, 0],
    [0.42, 0],
    [0.52, 0.06],
    [0.54, 0.17],
    [0.51, 0.17],
    [0.49, 0.07],
    [0, 0.055],
  ].map(([x, y]) => new T.Vector2(x, y));
  root.add(new T.Mesh(new T.LatheGeometry(profile, 40), iron));
  const stem = new T.Mesh(new T.BoxGeometry(0.7, 0.075, 0.13), iron);
  stem.position.set(0.82, 0.12, 0);
  root.add(stem);
  const grip = new T.Mesh(
    new T.CapsuleGeometry(0.075, 0.48, 6, 12),
    new T.MeshStandardMaterial({ color: "#d61937", roughness: 0.65 }),
  );
  grip.rotation.z = Math.PI / 2;
  grip.scale.z = 1.35;
  grip.position.set(0.96, 0.13, 0);
  root.add(grip);
  const groove = new T.Mesh(
    new T.BoxGeometry(0.39, 0.012, 0.045),
    new T.MeshStandardMaterial({ color: "#9f102b" }),
  );
  groove.position.set(0.96, 0.203, 0);
  root.add(groove);
  const helper = new T.Mesh(new T.TorusGeometry(0.13, 0.025, 6, 16), iron);
  helper.rotation.x = Math.PI / 2;
  helper.position.set(-0.54, 0.13, 0);
  root.add(helper);
  return root;
}
