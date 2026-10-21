import * as T from "three";
import { DAY_SECONDS } from "./night";

/** The last sixty seconds of daylight, independent of frame rate. */
export function sunsetProgress(elapsed: number) {
  return Math.max(0, Math.min(1, (elapsed - (DAY_SECONDS - 60)) / 60));
}
export function createSunsetSky(scene: T.Scene) {
  const day = new T.Color("#bfd9d6"),
    night = new T.Color("#071525");
  const colors = ["#ff9b50", "#e26788", "#b84759", "#304778"].map(
    (c) => new T.Color(c),
  );
  const uniforms = {
    horizon: { value: day.clone() },
    pink: { value: day.clone() },
    red: { value: day.clone() },
    zenith: { value: day.clone() },
  };
  const material = new T.ShaderMaterial({
    side: T.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms,
    vertexShader: `varying vec3 direction;
      void main() {
        direction = position;
        vec4 clip = projectionMatrix * mat4(mat3(viewMatrix)) * vec4(position, 1.0);
        gl_Position = clip.xyww;
      }`,
    fragmentShader: `uniform vec3 horizon, pink, red, zenith;
      varying vec3 direction;
      void main() {
        float h = normalize(direction).y;
        vec3 color = mix(horizon, pink, smoothstep(-0.04, 0.16, h));
        color = mix(color, red, smoothstep(0.12, 0.32, h));
        color = mix(color, zenith, smoothstep(0.26, 0.65, h));
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const dome = new T.Mesh(new T.SphereGeometry(1, 24, 12), material);
  dome.name = "sunset-sky";
  dome.frustumCulled = false;
  dome.renderOrder = -1000;
  scene.add(dome);
  const bands = Object.values(uniforms);
  return {
    update(elapsed: number, dark: boolean, blend: number) {
      const t = sunsetProgress(elapsed);
      for (let i = 0; i < bands.length; i++) {
        target.copy(day).lerp(colors[i], t);
        if (dark) target.copy(night);
        bands[i].value.lerp(target, blend);
      }
    },
  };
}
const target = new T.Color();
