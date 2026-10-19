import * as T from "three";
export const TEA_SEAT_HEIGHT = 0.28;
/** Standard person geometry has its hip 0.31 units above its origin. */
export function seatForTea(actor: T.Object3D, seated: boolean) {
  actor.position.y = seated ? TEA_SEAT_HEIGHT : 0;
  let legs = actor.getObjectByName("tea-legs");
  if (!legs && seated) {
    legs = new T.Group();
    legs.name = "tea-legs";
    const material = (actor.getObjectByName("body") as T.Mesh).material;
    for (const side of [-1, 1]) {
      const thigh = new T.Mesh(
        new T.CapsuleGeometry(0.12, 0.3, 3, 8),
        material,
      );
      thigh.rotation.x = Math.PI / 2;
      thigh.position.set(side * 0.15, 0.43, 0.24);
      const shin = new T.Mesh(
        new T.CapsuleGeometry(0.09, 0.22, 3, 8),
        material,
      );
      shin.position.set(side * 0.15, 0.27, 0.48);
      legs.add(thigh, shin);
    }
    actor.add(legs);
  }
  if (legs) legs.visible = seated;
  for (const foot of actor.children.filter((o) => o.name === "foot")) {
    foot.position.y = seated ? 0.15 : 0.16;
    foot.position.z = seated ? 0.48 : 0;
    foot.scale.set(seated ? 1.1 : 1, seated ? 1.35 : 1, seated ? 0.8 : 1.5);
  }
}
export function teaSipAmount(seconds: number) {
  const phase = ((seconds % 7) + 7) % 7;
  const t =
    phase < 1
      ? 0
      : phase < 2
        ? phase - 1
        : phase < 3
          ? 1
          : phase < 4
            ? 4 - phase
            : 0;
  return t * t * (3 - 2 * t);
}
/** Move the existing porcelain cup, sharing geometry and materials throughout. */
export function createTeaDrinking(actor: T.Object3D, cup: T.Object3D) {
  const home = cup.position.clone(),
    rotation = cup.rotation.clone();
  const hand = actor.getObjectByName("hand-1");
  const handHome = hand?.position.clone();
  const mouth = new T.Vector3();
  let elapsed = 0,
    wasActive = false;
  return (dt: number, active: boolean, reducedMotion = false) => {
    if (!active && !wasActive) return;
    wasActive = active;
    elapsed = active ? elapsed + Math.max(0, dt) : 0;
    const sip = active && !reducedMotion ? teaSipAmount(elapsed) : 0;
    actor.updateWorldMatrix(true, false);
    mouth.set(0.18, 1.08, 0.52);
    actor.localToWorld(mouth);
    cup.parent!.worldToLocal(mouth);
    cup.position.lerpVectors(home, mouth, sip);
    cup.rotation.copy(rotation);
    cup.rotation.y += actor.rotation.y * sip;
    cup.rotation.x += 0.3 * sip;
    if (hand && handHome) {
      hand.position.copy(handHome);
      hand.position.lerp(mouth.set(0.24, 1.02, 0.5), sip);
    }
  };
}
