import { corridorDoorRootOffsetZ } from './corridorMath';

export type CorridorFocusedDoor = {
  id: string;
  side: 'left' | 'right';
  worldZ: number;
};

export const corridorAvatarBasePosition = {
  x: 0,
  y: -0.61,
  z: 7.7,
} as const;

export const corridorDoorPreviewOffsetX = 1.2;
export const corridorDoorPreviewRotationY = Math.PI * 0.334;

export function resolveCorridorDoorSelection(
  current: CorridorFocusedDoor | null,
  next: CorridorFocusedDoor,
) {
  if (
    current?.id === next.id &&
    current.side === next.side &&
    current.worldZ === next.worldZ
  ) {
    return {
      focusedDoor: current,
      shouldEnter: true,
    };
  }

  return {
    focusedDoor: next,
    shouldEnter: false,
  };
}

export function getCorridorDoorPreviewTarget(door: CorridorFocusedDoor) {
  return {
    x: door.side === 'left' ? corridorDoorPreviewOffsetX : -corridorDoorPreviewOffsetX,
    z: door.worldZ + corridorDoorRootOffsetZ,
  };
}

export function getCorridorDoorPreviewRotationY(
  door: CorridorFocusedDoor,
  parentYaw = 0,
) {
  return (
    (door.side === 'left'
      ? corridorDoorPreviewRotationY
      : -corridorDoorPreviewRotationY) - parentYaw
  );
}
