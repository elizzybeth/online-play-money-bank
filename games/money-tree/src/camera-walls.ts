import * as T from "three";
/** Cut away walls crossed by the camera boom or its movement, without moving
 * the camera or changing the player's heading. Player collision stays solid. */
export class CameraWalls {
  private hidden = new Map<T.Object3D, { visible: boolean; shadow: boolean }>();
  visibleForInteraction(object: T.Object3D) {
    for (let node: T.Object3D | null = object; node; node = node.parent)
      if (!(this.hidden.get(node)?.visible ?? node.visible)) return false;
    return true;
  }
  restore() {
    for (const [wall, before] of this.hidden) {
      wall.visible = before.visible;
      wall.castShadow = before.shadow;
    }
    this.hidden.clear();
  }
  update(
    objects: T.Object3D[],
    target: T.Vector3,
    current: T.Vector3,
    desired: T.Vector3,
  ) {
    this.restore();
    for (const wall of objects) {
      if (!wall.userData.cameraWall || !wall.visible) continue;
      const box = new T.Box3().setFromObject(wall).expandByScalar(0.6);
      const crosses = (a: T.Vector3, b: T.Vector3) => {
        if (box.containsPoint(a) || box.containsPoint(b)) return true;
        const direction = b.clone().sub(a);
        const distance = direction.length();
        if (distance < 0.001) return false;
        const hit = new T.Ray(a, direction.normalize()).intersectBox(
          box,
          new T.Vector3(),
        );
        return !!hit && hit.distanceTo(a) <= distance;
      };
      if (
        crosses(target, desired) ||
        crosses(target, current) ||
        crosses(current, desired)
      ) {
        this.hidden.set(wall, {
          visible: wall.visible,
          shadow: wall.castShadow,
        });
        wall.visible = false;
        wall.castShadow = false;
      }
    }
  }
}
