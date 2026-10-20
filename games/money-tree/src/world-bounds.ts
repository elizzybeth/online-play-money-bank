type BoundaryState = {
  position: { x: number; z: number };
  millionaire?: { unlocked: boolean };
  foundTVSeeds?: boolean;
};
export function playableBounds(s: BoundaryState) {
  const level3 = !!s.millionaire?.unlocked;
  const eastMarket = s.position.x > 50 && s.position.z >= -90;
  const eastAccess = s.position.z >= -39 && s.position.z <= 2;
  const north = level3 && s.position.z < -90;
  return {
    left: north ? -94 : -129,
    right: eastMarket || eastAccess ? 130 : level3 ? (north ? 160 : 50) : 38,
    top: eastMarket
      ? -40
      : level3
        ? -470
        : s.position.x < -39
          ? -63.5
          : s.foundTVSeeds
            ? -89
            : -39,
    bottom: eastMarket ? 2 : 38,
  };
}
export function withinPlayableBounds(s: BoundaryState) {
  const b = playableBounds(s),
    p = s.position;
  return p.x >= b.left && p.x <= b.right && p.z >= b.top && p.z <= b.bottom;
}
