type BoundaryState = {
  position: { x: number; z: number };
  millionaire?: { unlocked: boolean };
  foundTVSeeds?: boolean;
};
export function playableBounds(s: BoundaryState) {
  const level3 = !!s.millionaire?.unlocked;
  const north = level3 && s.position.z < -90;
  return {
    left: north ? -94 : -129,
    right: level3 ? (north ? 160 : 50) : 38,
    top: level3
      ? -470
      : s.position.x < -39
        ? -63.5
        : s.foundTVSeeds
          ? -89
          : -65,
    bottom: 38,
  };
}
export function withinPlayableBounds(s: BoundaryState) {
  const b = playableBounds(s),
    p = s.position;
  return p.x >= b.left && p.x <= b.right && p.z >= b.top && p.z <= b.bottom;
}
