import * as T from "three";
import { craterHeight } from "./millionaire-land";
export function makeMeteorCrater(x: number, z: number) {
  const root = new T.Group();
  root.name = "meteor-impact-crater";
  root.position.set(x, 0, z);
  const vertices: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const segments = 96,
    rings = 28;
  for (let ring = 0; ring <= rings; ring++)
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2,
        r = (ring / rings) * 10;
      const ripple =
        Math.sin(angle * 17 + r * 2.8) * 0.06 * Math.sin((r / 10) * Math.PI);
      vertices.push(
        Math.cos(angle) * r,
        craterHeight(r) + ripple,
        Math.sin(angle) * r,
      );
      const scorch =
        Math.max(0, 1 - r / 7) * 0.85 +
        Math.max(0, Math.sin(angle * 19 + Math.sin(angle * 7) * 2)) *
          0.22 *
          Math.sin((r / 10) * Math.PI);
      const c = new T.Color("#af9170").lerp(
        new T.Color("#302c2b"),
        Math.min(1, scorch),
      );
      c.multiplyScalar(0.88 + 0.12 * Math.sin(r * 7 + angle * 9));
      colors.push(c.r, c.g, c.b);
    }
  for (let ring = 0; ring < rings; ring++)
    for (let i = 0; i < segments; i++) {
      const n = ring * (segments + 1) + i;
      indices.push(
        n,
        n + 1,
        n + segments + 1,
        n + 1,
        n + segments + 2,
        n + segments + 1,
      );
    }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const bowl = new T.Mesh(
    geometry,
    new T.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1,
      side: T.DoubleSide,
    }),
  );
  bowl.name = "scorched-impact-bowl";
  bowl.receiveShadow = true;
  root.add(bowl);
  const debris = new T.InstancedMesh(
    new T.IcosahedronGeometry(1, 0),
    new T.MeshStandardMaterial({ color: "#75604e", roughness: 1 }),
    112,
  );
  debris.name = "jagged-rim-and-ejecta";
  debris.castShadow = debris.receiveShadow = true;
  const dummy = new T.Object3D();
  for (let i = 0; i < 112; i++) {
    const angle = i * 2.39996,
      r =
        i < 80
          ? 7.2 + (Math.sin(i * 4.7) + 1) * 0.85
          : 3 + (Math.sin(i * 1.9) + 1) * 1.7;
    const h =
      i < 80
        ? 0.2 + (Math.sin(i * 2.3) + 1) * 0.23
        : 0.1 + (Math.sin(i) + 1) * 0.08;
    dummy.position.set(
      Math.cos(angle) * r,
      craterHeight(r) + h * 0.7,
      Math.sin(angle) * r,
    );
    dummy.rotation.set(i * 0.7, i * 1.3, i * 0.13);
    dummy.scale.set(h * 1.5, h, h * 1.2);
    dummy.updateMatrix();
    debris.setMatrixAt(i, dummy.matrix);
  }
  root.add(debris);
  const meteor = new T.Mesh(
    new T.IcosahedronGeometry(0.9, 1),
    new T.MeshStandardMaterial({
      color: "#29272a",
      roughness: 0.65,
      metalness: 0.65,
      emissive: "#6b2410",
      emissiveIntensity: 0.25,
    }),
  );
  meteor.name = "embedded-meteorite";
  meteor.scale.set(1.2, 0.85, 1);
  meteor.rotation.set(0.2, 0.7, 0.4);
  meteor.position.set(2.1, craterHeight(2.1) + 0.45, -0.6);
  meteor.castShadow = true;
  root.add(meteor);
  return root;
}
