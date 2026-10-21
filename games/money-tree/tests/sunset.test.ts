import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { createSunsetSky, sunsetProgress } from "../src/sunset";
test("sunset begins only in the final daylight minute and reuses its sky resources", () => {
  assert.equal(sunsetProgress(0), 0);
  assert.equal(sunsetProgress(239), 0);
  assert.equal(sunsetProgress(240), 0);
  assert.equal(sunsetProgress(270), 0.5);
  assert.equal(sunsetProgress(300), 1);
  const scene = new T.Scene(),
    sky = createSunsetSky(scene);
  const mesh = scene.getObjectByName("sunset-sky") as T.Mesh<
    T.SphereGeometry,
    T.ShaderMaterial
  >;
  const geometry = mesh.geometry,
    material = mesh.material;
  sky.update(285, false, 1);
  const bands = Object.values(material.uniforms).map((u) => u.value.getHex());
  assert.equal(new Set(bands).size, 4);
  for (let i = 0; i < 100; i++) sky.update(285, false, 0.1);
  assert.equal(scene.children.length, 1);
  assert.equal(mesh.geometry, geometry);
  assert.equal(mesh.material, material);
  sky.update(301, true, 1);
  assert(
    Object.values(material.uniforms).every(
      (u) => u.value.getHexString() === "071525",
    ),
  );
  sky.update(0, false, 1);
  assert(
    Object.values(material.uniforms).every(
      (u) => u.value.getHexString() === "bfd9d6",
    ),
  );
});
