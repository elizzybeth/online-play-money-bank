import * as T from "three";
/** Render the actual purchase model with a fitted camera, using the game's renderer. */
export function productPortrait(renderer: T.WebGLRenderer, model: T.Object3D) {
  const preview = new T.Scene();
  preview.background = new T.Color("#f1e4c9");
  preview.add(new T.HemisphereLight("#ffffff", "#776852", 3));
  const light = new T.DirectionalLight("#fff3d2", 3);
  light.position.set(3, 5, 4);
  preview.add(light, model);
  const bounds = new T.Box3().setFromObject(model);
  const center = bounds.getCenter(new T.Vector3());
  const span = bounds.getSize(new T.Vector3()).length() * 0.62;
  const camera = new T.OrthographicCamera(-span, span, span, -span, 0.01, 200);
  camera.position
    .copy(center)
    .add(
      new T.Vector3(3, 2.4, 4)
        .normalize()
        .multiplyScalar(Math.max(3, span * 4)),
    );
  camera.lookAt(center);
  const target = new T.WebGLRenderTarget(192, 192);
  target.texture.colorSpace = T.SRGBColorSpace;
  const old = renderer.getRenderTarget();
  try {
    renderer.setRenderTarget(target);
    renderer.render(preview, camera);
    const pixels = new Uint8Array(192 * 192 * 4);
    renderer.readRenderTargetPixels(target, 0, 0, 192, 192, pixels);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 192;
    const ctx = canvas.getContext("2d")!;
    const image = ctx.createImageData(192, 192);
    for (let y = 0; y < 192; y++)
      image.data.set(
        pixels.subarray((191 - y) * 768, (192 - y) * 768),
        y * 768,
      );
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL();
  } finally {
    renderer.setRenderTarget(old);
    target.dispose();
    model.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        for (const mat of Array.isArray(o.material)
          ? o.material
          : [o.material]) {
          (mat as T.MeshStandardMaterial).map?.dispose();
          mat.dispose();
        }
      }
    });
  }
}
