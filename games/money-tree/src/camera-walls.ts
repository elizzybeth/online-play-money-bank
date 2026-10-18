import * as T from "three";
/** Cut away walls crossed by the camera boom or its movement, without moving
 * the camera or changing the player's heading. Player collision stays solid. */
export class CameraWalls {
  private boundsCache = new WeakMap<
    T.Object3D,
    {
      matrix: T.Matrix4;
      geometry: T.BufferGeometry;
      version: number;
      box: T.Box3;
    }
  >();
  private boundsRequests = 0;
  private boundsBuilds = 0;
  stats() {
    return {
      boundsRequests: this.boundsRequests,
      boundsBuilds: this.boundsBuilds,
    };
  }
  bounds(object: T.Object3D) {
    this.boundsRequests++;
    // Only leaf meshes can be cached by their own geometry and world transform.
    if (!(object instanceof T.Mesh) || object.children.length) {
      this.boundsBuilds++;
      return new T.Box3().setFromObject(object);
    }
    object.updateWorldMatrix(true, false);
    const geometry = object.geometry as T.BufferGeometry,
      attribute = geometry.attributes.position;
    const version =
      attribute instanceof T.InterleavedBufferAttribute
        ? attribute.data.version
        : (attribute?.version ?? 0);
    const cached = this.boundsCache.get(object);
    if (
      cached &&
      cached.geometry === geometry &&
      cached.version === version &&
      cached.matrix.equals(object.matrixWorld)
    )
      return cached.box;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!.clone().applyMatrix4(object.matrixWorld);
    this.boundsBuilds++;
    this.boundsCache.set(object, {
      matrix: object.matrixWorld.clone(),
      geometry,
      version,
      box,
    });
    return box;
  }
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
      const box = this.bounds(wall);
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
      // Actual wall bounds distinguish player proximity from camera obstruction.
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
