import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { farmFields } from "./farm-fields";
import { makeCrop } from "./crop-model";
/** Bake a crop prototype once per section, then instance its rows by material. */
export function addFarmFields(root: T.Group) {
  const soilGeometry = new T.BoxGeometry(1, 0.06, 1),
    soilMaterial = new T.MeshStandardMaterial({
      color: "#80613f",
      roughness: 1,
    });
  for (const field of farmFields.filter((f) => !f.existing)) {
    const group = new T.Group();
    group.name = `farm-field-${field.crop}`;
    group.position.set(field.x, 0, field.z);
    root.add(group);
    const soil = new T.Mesh(soilGeometry, soilMaterial);
    soil.position.y = 0.005;
    soil.scale.set(field.w, 1, field.d);
    soil.receiveShadow = true;
    group.add(soil);
    const model = makeCrop(field.crop, true, true);
    model.updateMatrixWorld(true);
    const batches = new Map<
      string,
      { geometries: T.BufferGeometry[]; material: T.MeshStandardMaterial }
    >();
    const originals = new Set<T.BufferGeometry>(),
      materials = new Set<T.Material>();
    model.traverse((o) => {
      if (!(o instanceof T.Mesh)) return;
      const material = o.material as T.MeshStandardMaterial,
        key = `${material.color.getHexString()}:${material.map?.uuid ?? ""}:${material.side}`;
      const batch = batches.get(key) ?? { geometries: [], material };
      const geometry = o.geometry.index
        ? o.geometry.toNonIndexed()
        : o.geometry.clone();
      geometry.applyMatrix4(o.matrixWorld);
      batch.geometries.push(geometry);
      batches.set(key, batch);
      originals.add(o.geometry);
      materials.add(material);
    });
    const columns = Math.floor(field.w / 2),
      rows = Math.floor(field.d / 1.7),
      count = columns * rows;
    const transform = new T.Object3D();
    for (const { geometries, material } of batches.values()) {
      const geometry = mergeGeometries(geometries)!;
      const plants = new T.InstancedMesh(geometry, material, count);
      plants.name = `farm-${field.crop}-rows`;
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < columns; col++) {
          transform.position.set(
            -field.w / 2 + 1 + col * 2,
            0.05,
            -field.d / 2 + 0.8 + row * 1.7,
          );
          transform.rotation.y = ((row + col) % 3) * 0.17;
          transform.updateMatrix();
          plants.setMatrixAt(row * columns + col, transform.matrix);
        }
      plants.castShadow = plants.receiveShadow = true;
      plants.computeBoundingSphere();
      group.add(plants);
      geometries.forEach((g) => g.dispose());
      materials.delete(material);
    }
    originals.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    model.clear();
  }
}
