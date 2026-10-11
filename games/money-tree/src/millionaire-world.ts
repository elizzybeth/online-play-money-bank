import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { State, Rect } from "./game";
import type { Target } from "./world";
import { makeGuru, makeMascot } from "./millionaire-models";
import { fellowships, mansionCount, type Fellowship } from "./millionaire";
import {
  mountainTerraces,
  terrainHeight,
  mansionSites,
} from "./millionaire-land";
export function createMillionaireWorld(
  scene: T.Scene,
  rects: Rect[],
  occluders: T.Object3D[],
  targets: Target[],
  speakers: { id: string; name: string; object: T.Object3D }[],
) {
  const group = new T.Group();
  group.name = "Mount Millionaire";
  group.visible = false;
  scene.add(group);
  const material = (color: string, metalness = 0) =>
    new T.MeshStandardMaterial({
      color,
      roughness: metalness ? 0.3 : 0.9,
      metalness,
    });
  const materials = new Map<string, T.Material>();
  const part = (
    geometry: T.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = group,
  ) => {
    if (!materials.has(color))
      materials.set(color, material(color, color === "#c9a447" ? 0.7 : 0));
    const mesh = new T.Mesh(geometry, materials.get(color)!);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    parent: T.Object3D = group,
  ) => part(new T.BoxGeometry(w, h, d), color, x, y, z, parent);
  const ball = (
    x: number,
    y: number,
    z: number,
    r: number,
    color: string,
    parent: T.Object3D = group,
  ) => part(new T.SphereGeometry(r, 10, 7), color, x, y, z, parent);
  box(30, -0.3, -285, 270, 0.5, 390, "#618b4e");
  box(34, 0.01, -108, 4, 0.08, 36, "#c5b48d");
  const guidedPath = new T.Group();
  group.add(guidedPath);
  box(34, 0.01, -249, 4, 0.08, 182, "#c5b48d", guidedPath);
  const bend = new T.CatmullRomCurve3([
    new T.Vector3(34, 0.08, -125),
    new T.Vector3(42, 0.08, -122),
    new T.Vector3(42, 0.08, -145),
    new T.Vector3(34, 0.08, -158),
  ]);
  const vertices: number[] = [];
  for (let i = 0; i < 40; i++) {
    const a = bend.getPoint(i / 40),
      b = bend.getPoint((i + 1) / 40),
      d = b.clone().sub(a).normalize();
    const n = new T.Vector3(-d.z, 0, d.x).multiplyScalar(2);
    for (const v of [
      a.clone().add(n),
      a.clone().sub(n),
      b.clone().add(n),
      a.clone().sub(n),
      b.clone().sub(n),
      b.clone().add(n),
    ])
      vertices.push(v.x, v.y, v.z);
  }
  const bendGeometry = new T.BufferGeometry();
  bendGeometry.setAttribute(
    "position",
    new T.Float32BufferAttribute(vertices, 3),
  );
  bendGeometry.computeVertexNormals();
  part(bendGeometry, "#c5b48d", 0, 0, 0, guidedPath);
  function willow(x: number, z: number, size: number) {
    const root = new T.Group();
    root.position.set(x, 0, z);
    group.add(root);
    part(
      new T.CylinderGeometry(size * 0.08, size * 0.12, size * 0.7, 9),
      "#75604b",
      0,
      size * 0.35,
      0,
      root,
    );
    const wood: T.BufferGeometry[] = [],
      leaves: T.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const radius = size * (0.3 + (i % 3) * 0.025);
      const curve = new T.CatmullRomCurve3([
        new T.Vector3(0, size * 0.55, 0),
        new T.Vector3(
          Math.cos(a) * radius * 0.5,
          size * 0.9,
          Math.sin(a) * radius * 0.5,
        ),
        new T.Vector3(Math.cos(a) * radius, size * 0.75, Math.sin(a) * radius),
      ]);
      wood.push(new T.TubeGeometry(curve, 10, size * 0.025, 5, false));
      for (let j = 0; j < 5; j++) {
        const leaf = new T.SphereGeometry(1, 7, 5);
        leaf.scale(size * 0.075, size * (0.19 + j * 0.004), size * 0.065);
        leaf.translate(
          Math.cos(a + 0.13 * j) * radius,
          size * (0.65 - j * 0.08),
          Math.sin(a + 0.13 * j) * radius,
        );
        leaves.push(leaf);
      }
    }
    part(mergeGeometries(wood)!, "#75604b", 0, 0, 0, root);
    part(mergeGeometries(leaves)!, "#669b55", 0, 0, 0, root);
    wood.concat(leaves).forEach((g) => g.dispose());
    rects.push({
      x,
      z,
      w: size * 0.25,
      d: size * 0.25,
      clearHeight: size * 0.7,
    });
  }
  willow(34, -135, 18);
  for (let i = 0; i < 36; i++) {
    const row = Math.floor(i / 6),
      col = i % 6;
    const x = 4 + col * 12 + Math.sin(i * 2.3) * 3,
      z = -108 - row * 9 + Math.cos(i * 1.7) * 2;
    if (Math.abs(x - 34) > 8) willow(x, z, 7 + (i % 4));
  }
  const guru = makeGuru();
  guru.position.set(34, 0, -130);
  group.add(guru);
  speakers.push({ id: "willow-guru", name: "The Willow Guru", object: guru });
  targets.push({
    id: "willow-guru",
    x: 34,
    z: -127.8,
    label: "Talk to the willow guru",
  });
  const hosts = fellowships.map((f, i) => {
    const o = makeMascot(f.id);
    o.position.set([28, 40, 40][i], 0, [-130, -130, -124][i]);
    o.visible = false;
    group.add(o);
    speakers.push({ id: `fellowship-${f.id}`, name: f.mascot, object: o });
    targets.push({
      id: `fellowship-${f.id}`,
      x: o.position.x,
      z: o.position.z + 1.3,
      label: `Talk to ${f.mascot}`,
    });
    return o;
  });
  for (const terrace of mountainTerraces) {
    // Solid limestone all the way to the ground, with a clear climbing lane.
    for (const side of [-1, 1]) {
      const a = Math.acos(3 / terrace.rx);
      const startAngle = side < 0 ? Math.PI - a : -a;
      const endAngle = side < 0 ? Math.PI + a : a;
      const shape = new T.Shape();
      shape.absellipse(
        0,
        0,
        terrace.rx,
        terrace.rz,
        startAngle,
        endAngle,
        false,
        0,
      );
      shape.closePath();
      const geometry = new T.ExtrudeGeometry(shape, {
        depth: terrace.y + 6,
        bevelEnabled: false,
        curveSegments: 32,
        steps: 1,
      });
      const stone = part(geometry, "#f0efe0", terrace.x, -6, terrace.z);
      stone.rotation.x = -Math.PI / 2;
      const points = Array.from({ length: 65 }, (_, i) => {
        const angle = startAngle + ((endAngle - startAngle) * i) / 64;
        return new T.Vector3(
          terrace.x + Math.cos(angle) * terrace.rx,
          terrace.y + 0.06,
          terrace.z + Math.sin(angle) * terrace.rz,
        );
      });
      part(
        new T.TubeGeometry(new T.CatmullRomCurve3(points), 64, 0.08, 5, false),
        "#d9ddca",
        0,
        0,
        0,
      );
    }
  }
  const ramp = new T.BufferGeometry();
  ramp.setAttribute(
    "position",
    new T.Float32BufferAttribute(
      [
        31, 0.08, -340, 37, 0.08, -340, 37, 42.08, -445, 31, 0.08, -340, 37,
        42.08, -445, 31, 42.08, -445,
      ],
      3,
    ),
  );
  ramp.computeVertexNormals();
  part(ramp, "#e2d9c0", 0, 0, 0);
  const pagoda = new T.Group();
  pagoda.position.set(34, 42, -451);
  group.add(pagoda);
  box(0, 0.12, 0, 14, 0.24, 12, "#eae3cb", pagoda);
  for (const x of [-5, 5])
    for (const z of [-4, 4]) {
      part(
        new T.CylinderGeometry(0.32, 0.4, 6.5, 10),
        "#c9a447",
        x,
        3.35,
        z,
        pagoda,
      );
      rects.push({ x: 34 + x, z: -451 + z, w: 0.8, d: 0.8 });
    }
  for (let tier = 0; tier < 3; tier++) {
    const roof = part(
      new T.ConeGeometry(10 - tier * 2, 2.7, 4),
      "#38756d",
      0,
      7.2 + tier * 2.1,
      0,
      pagoda,
    );
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = 0.85;
    occluders.push(roof);
    part(
      new T.CylinderGeometry(0.18, 0.35, 0.8, 10),
      "#c9a447",
      0,
      12.8,
      0,
      pagoda,
    );
  }
  const summitHost = new T.Group();
  summitHost.position.set(34, 42.25, -452);
  group.add(summitHost);
  speakers.push({
    id: "millionaire-summit",
    name: "Community Guide",
    object: summitHost,
  });
  targets.push({
    id: "millionaire-summit",
    x: 34,
    z: -448,
    label: "Talk about planting on Mt. Millionaire",
  });
  const children = Array.from({ length: 6 }, (_, i) => {
    const o = new T.Group();
    group.add(o);
    speakers.push({
      id: `millionaire-child-${i}`,
      name: `Child ${i + 1}`,
      object: o,
    });
    const terrace = mountainTerraces[i + 1];
    o.position.set(34 + (i % 2 ? -12 : 12), terrace.y, terrace.z);
    targets.push({
      id: `millionaire-child-${i}`,
      x: o.position.x,
      z: o.position.z + 1.5,
      label: "Greet a child of the community",
    });
    return o;
  });
  const mansions = mansionSites.map((site, i) => {
    const home = new T.Group();
    home.position.set(site.x, 0, site.z);
    home.visible = false;
    group.add(home);
    const color = [
      "#f4e4d2",
      "#e6d7ee",
      "#f8edc8",
      "#dbe4e9",
      "#f0d6db",
      "#e2ebd4",
    ][i];
    box(-21.75, 8, 0, 0.5, 16, 30, color, home);
    box(21.75, 8, 0, 0.5, 16, 30, color, home);
    box(0, 8, -14.75, 44, 16, 0.5, color, home);
    for (const x of [-12, 12]) box(x, 8, 14.75, 20, 16, 0.5, color, home);
    box(0, 11, 14.75, 4, 10, 0.5, color, home);
    box(0, 16, 0, 44, 0.3, 30, color, home);
    box(0, 0.05, 0, 44, 0.1, 30, "#e7d8bd", home);
    // Front doorway, flanked by deep porticoes and gilded columns.
    box(0, 3, 15.08, 4, 6, 0.2, "#5b4638", home).name = "mansion-door";
    for (const x of [-16, -8, 8, 16]) {
      part(new T.CylinderGeometry(0.7, 0.9, 12, 12), "#f5f0df", x, 6, 17, home);
      for (const y of [0.5, 11.5])
        part(
          new T.CylinderGeometry(1.15, 1.15, 0.5, 12),
          "#c9a447",
          x,
          y,
          17,
          home,
        );
    }
    box(0, 12.5, 17, 40, 1, 8, "#f6eed8", home);
    const pediment = part(
      new T.ConeGeometry(26, 6, 4),
      "#c9a447",
      0,
      17,
      0,
      home,
    );
    pediment.rotation.y = Math.PI / 4;
    pediment.scale.z = 0.8;
    for (const x of [-17, -10, 10, 17])
      for (const y of [4.5, 10.5]) {
        box(x, y, 15.13, 4.2, 4.4, 0.3, "#c9a447", home);
        box(x, y, 15.32, 3.7, 3.9, 0.15, "#5a8590", home);
        box(x, y, 15.44, 0.12, 3.9, 0.1, "#f2e5bf", home);
        box(x, y, 15.44, 3.7, 0.12, 0.1, "#f2e5bf", home);
      }
    for (const x of [-10, 10]) {
      const dome = part(
        new T.SphereGeometry(4, 12, 8),
        "#c9a447",
        x,
        17,
        0,
        home,
      );
      dome.scale.y = 0.7;
    }
    // Balconies, gold pilasters and side windows make these extravagant estates.
    box(0, 6.3, 16.5, 38, 0.35, 3, "#f7eed7", home);
    for (const y of [6.5, 8]) box(0, y, 18, 38, 0.18, 0.18, "#c9a447", home);
    for (let x = -18; x <= 18; x += 2)
      part(
        new T.CylinderGeometry(0.12, 0.2, 1.5, 7),
        "#c9a447",
        x,
        7.25,
        18,
        home,
      );
    for (const side of [-1, 1]) {
      box(side * 21, 8.5, 15.2, 0.65, 17, 0.6, "#c9a447", home);
      for (const z of [-9, -2, 5, 11])
        for (const y of [4.5, 10.5]) {
          box(side * 22.06, y, z, 0.2, 4.5, 4.2, "#c9a447", home);
          box(side * 22.2, y, z, 0.14, 3.9, 3.6, "#5a8590", home);
          box(side * 22.3, y, z, 0.1, 3.9, 0.1, "#f2e5bf", home);
        }
    }
    box(0, 0.08, 25, 9, 0.12, 18, "#dcd3bb", home);
    const car = new T.Group();
    car.name = "mansion-car";
    car.position.set(-14, 0.4, 23);
    home.add(car);
    box(0, 0.5, 0, 3.8, 0.9, 7, "#3d2e43", car);
    box(0, 1.2, -0.4, 3.2, 0.9, 3.3, "#6f9da7", car);
    for (const x of [-1.9, 1.9])
      for (const z of [-2, 2]) {
        const wheel = part(
          new T.CylinderGeometry(0.65, 0.65, 0.3, 12),
          "#292e30",
          x,
          0,
          z,
          car,
        );
        wheel.rotation.z = Math.PI / 2;
      }
    const yacht = new T.Group();
    yacht.name = "mansion-yacht";
    yacht.position.set(14, 1, 24);
    home.add(yacht);
    const hull = part(
      new T.SphereGeometry(1, 14, 8),
      "#fff5dd",
      0,
      0,
      0,
      yacht,
    );
    hull.scale.set(3, 1.8, 7);
    box(0, 1.8, 0, 4, 2, 6, "#e9e7da", yacht);
    box(0, 2.2, 0.4, 4.05, 1, 3.5, "#527d8a", yacht);
    for (const z of [-4, 4]) box(0, 3, z, 4, 0.15, 0.15, "#c9a447", yacht);
    home.children.forEach((o) => {
      if (o instanceof T.Mesh && o.position.y > 2) occluders.push(o);
    });
    const obstacles = [{ x: site.x, z: site.z, w: 44, d: 30 }];
    return { home, car, yacht, obstacles };
  });
  const bodies = [guru, ...hosts, summitHost, ...children].map((object) => ({
    object,
    rect: { x: 0, z: 0, w: 1.4, d: 1.4, clearHeight: 3 },
  }));
  let previousCount = -1;
  const migrations = new Map<
    number,
    { step: number; build: number; stops: number[][] }
  >();
  const greeted = new Set<number>();
  function disposeModel(root: T.Object3D) {
    root.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        for (const material of Array.isArray(o.material)
          ? o.material
          : [o.material]) {
          if (material.map) material.map.dispose();
          material.dispose();
        }
      }
    });
    root.clear();
  }
  let member: Fellowship | undefined,
    guide = false;
  let guideStep = 0,
    guideWait = 0;
  const guideStops = [
    [42, -122],
    [42, -145],
    [34, -155],
    [34, -340],
  ];
  function followGuide() {
    guide = true;
    guideStep = -1;
    guideWait = 2;
  }
  function update(s: State, dt: number) {
    const m = s.millionaire;
    group.visible = !!m?.unlocked;
    if (!group.visible) {
      for (const rect of [
        ...bodies.map((b) => b.rect),
        ...mansions.flatMap((h) => h.obstacles),
      ]) {
        const at = rects.indexOf(rect);
        if (at >= 0) rects.splice(at, 1);
      }
      previousCount = -1;
      migrations.clear();
      greeted.clear();
      return;
    }
    guidedPath.visible = !!m?.member;
    hosts.forEach((o) => (o.visible = !!(m?.result || m?.member)));
    summitHost.visible = !!m?.member;
    children.forEach((o) => (o.visible = !!m?.member));
    if (m?.member !== member) {
      member = m?.member;
      for (const root of [summitHost, ...children]) {
        disposeModel(root);
        if (member) root.add(makeMascot(member));
      }
    }
    guideWait = Math.max(0, guideWait - dt);
    if (guide && m?.member && !guideWait) {
      const host = hosts[fellowships.findIndex((f) => f.id === m.member)];
      host.visible = true;
      if (guideStep === -1)
        guideStep =
          host.position.z > -150
            ? 0
            : guideStops.findIndex((stop) => stop[1] < host.position.z - 0.2);
      if (guideStep < 0) {
        guide = false;
        return;
      }
      const distance = Math.hypot(
        host.position.x - s.position.x,
        host.position.z - s.position.z,
      );
      if (distance < 12) {
        const stop = guideStops[guideStep];
        const dx = stop[0] - host.position.x,
          dz = stop[1] - host.position.z;
        const length = Math.hypot(dx, dz);
        const step = Math.min(length, dt * 7);
        if (length > 0) {
          host.position.x += (dx / length) * step;
          host.position.z += (dz / length) * step;
          host.rotation.y = Math.atan2(dx, dz);
        }
        if (length <= step) {
          guideStep++;
          if (guideStep === guideStops.length) guide = false;
        }
      }
      const target = targets.find((t) => t.id === `fellowship-${m.member}`)!;
      target.x = host.position.x;
      target.z = host.position.z + 1.3;
    }
    const count = mansionCount(m);
    if (previousCount >= 0 && count > previousCount) {
      for (let i = previousCount; i < count; i++) {
        const site = mansionSites[i],
          root = children[i];
        migrations.set(i, {
          step: 0,
          build: 0,
          stops: [
            [34, root.position.z],
            [34, -300],
            [site.x + (site.x > 34 ? 29 : -29), -280],
            [site.x + (site.x > 34 ? 29 : -29), site.z + 35],
            [site.x, site.z + 35],
            [site.x, site.z + 19],
          ],
        });
      }
    }
    previousCount = count;
    mansions.forEach((house, i) => {
      const built = i < count;
      const migration = migrations.get(i);
      if (migration) migration.build = Math.min(1, migration.build + dt / 12);
      house.home.visible = built;
      house.home.scale.y = migration ? Math.max(0.02, migration.build) : 1;
      house.car.visible =
        built &&
        m!.mountainEarned >= Math.min(100000, (i + 1) * (100000 / 6) + 5000);
      house.yacht.visible =
        built &&
        m!.mountainEarned >= Math.min(100000, (i + 1) * (100000 / 6) + 10000);
      for (const obstacle of house.obstacles) {
        const at = rects.indexOf(obstacle);
        if (built && at < 0) rects.push(obstacle);
        if (!built && at >= 0) rects.splice(at, 1);
      }
      if (!member) return;
      const root = children[i];
      const site = mansionSites[i];
      const terrace = mountainTerraces[i + 1];
      if (built && migration) {
        const stop = migration.stops[migration.step];
        const dx = stop[0] - root.position.x,
          dz = stop[1] - root.position.z;
        const length = Math.hypot(dx, dz),
          step = Math.min(length, dt * 7);
        if (length > 0) {
          root.position.x += (dx / length) * step;
          root.position.z += (dz / length) * step;
          root.rotation.y = Math.atan2(dx, dz);
        }
        root.position.y = terrainHeight(root.position.x, root.position.z);
        if (length <= step && dt > 0) migration.step++;
        if (migration.step === migration.stops.length) migrations.delete(i);
        house.home.getObjectByName("mansion-door")!.visible = false;
      } else if (built) {
        const approaching =
          Math.hypot(s.position.x - site.x, s.position.z - (site.z + 19)) < 18;
        house.home.getObjectByName("mansion-door")!.visible = !approaching;
        const wanted = new T.Vector3(
          site.x,
          0,
          site.z + (approaching ? 19 : 5),
        );
        if (root.position.y > 0) root.position.set(site.x, 0, site.z + 5);
        root.position.lerp(wanted, 1 - Math.exp(-dt * 2));
        root.rotation.y = 0;
      } else
        root.position.set(
          34 + (i % 2 ? -12 : 12),
          terrainHeight(34 + (i % 2 ? -12 : 12), terrace.z),
          terrace.z,
        );
      const target = targets.find((t) => t.id === `millionaire-child-${i}`)!;
      target.x = root.position.x;
      target.z = root.position.z + 1.5;
      target.label = built
        ? "Visit the mansion owner"
        : "Greet a child of the community";
    });
    for (const { object, rect } of bodies) {
      rect.x = object.position.x;
      rect.z = object.position.z;
      const visible = group.visible && object.visible;
      const at = rects.indexOf(rect);
      if (visible && at < 0) rects.push(rect);
      else if (!visible && at >= 0) rects.splice(at, 1);
    }
  }
  function greeting(s: State) {
    for (let i = 0; i < mansionCount(s.millionaire); i++) {
      const site = mansionSites[i],
        root = children[i];
      const distance = Math.hypot(
        s.position.x - site.x,
        s.position.z - (site.z + 19),
      );
      if (distance > 25) greeted.delete(i);
      if (
        distance < 4 &&
        Math.abs(root.position.z - (site.z + 19)) < 0.5 &&
        !migrations.has(i) &&
        !greeted.has(i)
      ) {
        greeted.add(i);
        return i;
      }
    }
    return undefined;
  }
  return {
    group,
    guru,
    hosts,
    summitHost,
    children,
    mansions,
    update,
    followGuide,
    greeting,
  };
}
