import * as T from "three";

/** Compose the original drawing without cropping or stretching its brushwork. */
export function bikeShopArtwork(url: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 2000;
  canvas.height = 720;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new T.CanvasTexture(canvas);
  const artwork = new Image();
  artwork.onload = () => {
    // Nine world units wide, with the original 4:3 proportions. The window
    // and doorway occupy the clear space to the right of the artwork.
    const width = 900;
    const height = (width * artwork.naturalHeight) / artwork.naturalWidth;
    context.drawImage(artwork, 100, (720 - height) / 2, width, height);
    texture.needsUpdate = true;
  };
  artwork.src = url;
  return texture;
}

/** Use only existing exterior triangles, preserving the window and doorway holes.
 * All pieces sample one facade-wide texture and inherit each wall's cutaway. */
export function paintBikeShopFacade(walls: T.Mesh[], texture: T.Texture) {
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new T.MeshStandardMaterial({
    map: texture,
    roughness: 0.95,
  });
  return walls.map((wall) => {
    const source = wall.geometry.index
      ? wall.geometry.toNonIndexed()
      : wall.geometry.clone();
    const p = source.attributes.position,
      n = source.attributes.normal;
    const positions: number[] = [],
      uv: number[] = [];
    for (let i = 0; i < p.count; i += 3) {
      if (n.getZ(i) < 0.99) continue;
      for (let j = i; j < i + 3; j++) {
        positions.push(p.getX(j), p.getY(j), p.getZ(j) + 0.004);
        uv.push(
          (p.getX(j) + wall.position.x + 28) / 20,
          (p.getY(j) + wall.position.y) / 7.2,
        );
      }
    }
    source.dispose();
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    const mural = new T.Mesh(geometry, material);
    mural.name = "pretty-good-bikes-mural";
    mural.userData.label = "PRETTY GOOD BIKES";
    mural.receiveShadow = true;
    wall.add(mural);
    return mural;
  });
}
