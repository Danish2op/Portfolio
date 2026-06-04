import { MathUtils } from 'three';

export type CorridorDoorSide = 'left' | 'right';

export type CorridorDoorSlot = {
  side: CorridorDoorSide;
  z: number;
};

export type CorridorWallFiller = {
  side: CorridorDoorSide;
  x: number;
  z: number;
  width: number;
  trimLowZ: boolean;
  trimHighZ: boolean;
};

export type RepeatedCorridorDoorSlot = CorridorDoorSlot & {
  segmentIndex: number;
};

export const corridorSegmentLength = 64;
export const corridorSegmentAnchorZ = 10;
export const corridorOuterWallX = 3.5;
export const corridorBayInnerX = 1.7;
export const corridorDoorApproachInsetX = corridorOuterWallX - corridorBayInnerX;
export const corridorDoorApproachRunZ = 4;
export const corridorDoorRootOffsetZ = corridorDoorApproachRunZ / 2;
export const corridorDoorPlacementX =
  (corridorOuterWallX + corridorBayInnerX) / 2;
export const corridorDoorBayWidth = Math.hypot(
  corridorDoorApproachInsetX,
  corridorDoorApproachRunZ,
);
export const corridorDoorBayAngle = Math.atan2(
  corridorDoorApproachInsetX,
  corridorDoorApproachRunZ,
);
export const corridorDoorIdleOffset = 0.02;
export const corridorDoorHoverDelta = 0.1;

export function getCorridorSegmentIndex(
  cameraZ: number,
  segmentLength = corridorSegmentLength,
) {
  return Math.floor((corridorSegmentAnchorZ - cameraZ) / segmentLength);
}

export function getVisibleCorridorSegments(
  cameraZ: number,
  segmentLength = corridorSegmentLength,
) {
  const currentSegment = getCorridorSegmentIndex(cameraZ, segmentLength);
  return [currentSegment - 1, currentSegment, currentSegment + 1];
}

export function getRepeatedDoorInstances(
  baseDoors: CorridorDoorSlot[],
  segmentIndices: number[],
  segmentLength = corridorSegmentLength,
): RepeatedCorridorDoorSlot[] {
  return segmentIndices.flatMap((segmentIndex) =>
    baseDoors.map((door) => ({
      ...door,
      segmentIndex,
      z: door.z - segmentIndex * segmentLength,
    })),
  );
}

export function getCorridorDoorBaseYaw(side: CorridorDoorSide) {
  return side === 'left'
    ? Math.PI / 2 - corridorDoorBayAngle
    : -Math.PI / 2 + corridorDoorBayAngle;
}

export function getCorridorDoorHoverYaw(side: CorridorDoorSide) {
  const hoverInset = corridorDoorBayAngle + corridorDoorHoverDelta;
  return side === 'left'
    ? Math.PI / 2 - hoverInset
    : -Math.PI / 2 + hoverInset;
}

export function getCorridorDoorTransform(door: CorridorDoorSlot) {
  return {
    x:
      door.side === 'left'
        ? -corridorDoorPlacementX
        : corridorDoorPlacementX,
    z: door.z + corridorDoorRootOffsetZ,
    rotationY: getCorridorDoorBaseYaw(door.side),
  };
}

export function buildCorridorWallFillers(
  side: CorridorDoorSide,
  doors: CorridorDoorSlot[],
  segmentStartZ = corridorSegmentAnchorZ,
  segmentLength = corridorSegmentLength,
): CorridorWallFiller[] {
  const fillers: CorridorWallFiller[] = [];
  const x = side === 'left' ? -corridorOuterWallX : corridorOuterWallX;
  let cursor = segmentStartZ;
  const segmentEnd = segmentStartZ - segmentLength;

  for (const door of doors
    .filter((candidate) => candidate.side === side)
    .sort((a, b) => b.z - a.z)) {
    const openingFrontZ = door.z;
    const openingBackZ = door.z - corridorDoorApproachRunZ;

    if (openingFrontZ > cursor || openingBackZ < segmentEnd) {
      continue;
    }

    if (cursor > openingFrontZ) {
      const width = cursor - openingFrontZ;
      fillers.push({
        side,
        x,
        z: cursor - width / 2,
        width,
        trimLowZ: true,
        trimHighZ: false,
      });
    }

    cursor = openingBackZ;
  }

  if (cursor > segmentEnd) {
    const width = cursor - segmentEnd;
    fillers.push({
      side,
      x,
      z: cursor - width / 2,
      width,
      trimLowZ: false,
      trimHighZ: cursor !== segmentStartZ,
    });
  }

  return fillers.map((filler, index) => ({
    ...filler,
    trimLowZ: index === 0 ? filler.trimLowZ : false,
  }));
}

export function getCorridorGlanceBias(
  cameraZ: number,
  doors: CorridorDoorSlot[],
  glanceIntensity = 0.15,
) {
  let strongestStrength = 0;
  let strongestDirection = 0;

  for (const door of doors) {
    const deltaZ = cameraZ - door.z;
    let strength = 0;

    if (deltaZ > 8 && deltaZ < 15) {
      strength = (15 - deltaZ) / 7;
    } else if (deltaZ <= 8 && deltaZ > -2) {
      strength = (deltaZ + 2) / 10;
    }

    if (strength > 0) {
      const easedStrength = strength * (2 - strength);
      const direction = door.side === 'left' ? -1 : 1;

      if (easedStrength > strongestStrength) {
        strongestStrength = easedStrength;
        strongestDirection = direction;
      }
    }
  }

  return strongestDirection * strongestStrength * glanceIntensity * 3.5;
}

export function clampCorridorTurn(turn: number, limit = 0.26) {
  return MathUtils.clamp(turn, -limit, limit);
}
