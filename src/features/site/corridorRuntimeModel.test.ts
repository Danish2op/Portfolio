import { describe, expect, it } from 'vitest';

import {
  corridorAvatarBasePosition,
  getCorridorDoorPreviewRotationY,
  getCorridorDoorPreviewTarget,
  resolveCorridorDoorSelection,
  type CorridorFocusedDoor,
} from './corridorRuntimeModel';

describe('corridor runtime model', () => {
  it('anchors the corridor avatar far enough ahead of the entry camera', () => {
    expect(corridorAvatarBasePosition).toEqual({
      x: 0,
      y: -0.61,
      z: 7.7,
    });
  });

  it('focuses a new door on first click and enters only on second click', () => {
    const techDoor: CorridorFocusedDoor = {
      id: 'tech-dorm',
      side: 'left',
      worldZ: -18,
    };

    expect(resolveCorridorDoorSelection(null, techDoor)).toEqual({
      focusedDoor: techDoor,
      shouldEnter: false,
    });

    expect(resolveCorridorDoorSelection(techDoor, techDoor)).toEqual({
      focusedDoor: techDoor,
      shouldEnter: true,
    });
  });

  it('treats repeated copies of the same door id as distinct corridor stops', () => {
    const nearTechDoor: CorridorFocusedDoor = {
      id: 'tech-dorm',
      side: 'left',
      worldZ: -18,
    };
    const farTechDoor: CorridorFocusedDoor = {
      id: 'tech-dorm',
      side: 'left',
      worldZ: -98,
    };

    expect(resolveCorridorDoorSelection(nearTechDoor, farTechDoor)).toEqual({
      focusedDoor: farTechDoor,
      shouldEnter: false,
    });
  });

  it('moves the preview camera to the opposite shoulder so the selected door stays centered', () => {
    expect(
      getCorridorDoorPreviewTarget({
        id: 'music-studio',
        side: 'right',
        worldZ: -32,
      }),
    ).toEqual({
      x: -1.2,
      z: -30,
    });

    expect(
      getCorridorDoorPreviewTarget({
        id: 'experience',
        side: 'left',
        worldZ: -48,
      }),
    ).toEqual({
      x: 1.2,
      z: -46,
    });
  });

  it('uses the source-like preview yaw for left and right corridor doors', () => {
    expect(
      getCorridorDoorPreviewRotationY({
        id: 'tech-dorm',
        side: 'left',
        worldZ: -18,
      }),
    ).toBeCloseTo(Math.PI * 0.334, 3);

    expect(
      getCorridorDoorPreviewRotationY({
        id: 'music-studio',
        side: 'right',
        worldZ: -62,
      }),
    ).toBeCloseTo(-Math.PI * 0.334, 3);
  });

});
