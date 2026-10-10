import * as T from "three";
import { surfaceMaterial } from "./textures";
export function makeGardenTool(kind: "can" | "shovel") {
  const g = new T.Group();
  g.name = `display-${kind}`;
  const metal = new T.MeshStandardMaterial({
    color: kind === "can" ? "#659b89" : "#8d9b9d",
    metalness: 0.35,
    roughness: 0.46,
  });
  const dark = new T.MeshStandardMaterial({ color: "#34443f", roughness: 0.9 });
  const wood = surfaceMaterial("#ac8150", "wood");
  const part = (
    geo: T.BufferGeometry,
    mat: T.Material,
    x: number,
    y: number,
    z: number,
  ) => {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    g.add(m);
    return m;
  };
  if (kind === "can") {
    part(new T.CylinderGeometry(0.33, 0.38, 0.6, 16), metal, 0, 0.34, 0);
    part(new T.CylinderGeometry(0.24, 0.28, 0.16, 16), metal, 0, 0.7, 0);
    part(new T.CylinderGeometry(0.18, 0.18, 0.012, 16), dark, 0, 0.79, 0);
    part(new T.TorusGeometry(0.2, 0.035, 6, 18), metal, 0, 0.8, 0).rotation.x =
      Math.PI / 2;
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(0.25, 0.2, 0),
      new T.Vector3(0.5, 0.28, 0),
      new T.Vector3(0.72, 0.5, 0),
      new T.Vector3(0.95, 0.64, 0),
    ]);
    part(new T.TubeGeometry(curve, 12, 0.07, 8, false), metal, 0, 0, 0);
    part(
      new T.CylinderGeometry(0.17, 0.11, 0.11, 14),
      metal,
      1,
      0.66,
      0,
    ).rotation.z = -Math.PI / 2;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      part(
        new T.SphereGeometry(0.017, 5, 4),
        dark,
        1.06,
        0.66 + Math.sin(a) * 0.105,
        Math.cos(a) * 0.105,
      );
    }
    const handle = new T.CatmullRomCurve3([
      new T.Vector3(-0.25, 0.65, 0),
      new T.Vector3(-0.57, 0.75, 0),
      new T.Vector3(-0.72, 0.43, 0),
      new T.Vector3(-0.58, 0.13, 0),
      new T.Vector3(-0.3, 0.12, 0),
    ]);
    part(new T.TubeGeometry(handle, 18, 0.045, 7, false), metal, 0, 0, 0);
    for (const y of [0.12, 0.57])
      part(new T.TorusGeometry(0.35, 0.018, 5, 16), metal, 0, y, 0).rotation.x =
        Math.PI / 2;
  } else {
    part(new T.CylinderGeometry(0.052, 0.062, 1.42, 10), wood, 0, 1.14, 0);
    const shape = new T.Shape();
    shape.moveTo(-0.25, 0.63);
    shape.quadraticCurveTo(-0.3, 0.22, 0, 0.03);
    shape.quadraticCurveTo(0.3, 0.22, 0.25, 0.63);
    shape.lineTo(0.1, 0.7);
    shape.lineTo(-0.1, 0.7);
    shape.closePath();
    part(
      new T.ExtrudeGeometry(shape, {
        depth: 0.055,
        bevelEnabled: true,
        bevelSize: 0.018,
        bevelThickness: 0.016,
        bevelSegments: 1,
        steps: 1,
      }),
      metal,
      0,
      0,
      -0.027,
    );
    part(new T.BoxGeometry(0.045, 0.4, 0.026), metal, 0, 0.43, 0.045);
    part(new T.CylinderGeometry(0.079, 0.067, 0.2, 10), metal, 0, 0.72, 0);
    part(new T.TorusGeometry(0.17, 0.035, 7, 18), metal, 0, 1.94, 0);
    part(
      new T.CylinderGeometry(0.048, 0.048, 0.33, 10),
      wood,
      0,
      2.06,
      0,
    ).rotation.z = Math.PI / 2;
  }
  return g;
}
