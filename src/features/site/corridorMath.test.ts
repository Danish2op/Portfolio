import { describe, expect, it } from 'vitest';

import {
  buildCorridorWallFillers,
  getCorridorDoorBaseYaw,
  getCorridorDoorHoverYaw,
  getCorridorDoorTransform,
  getCorridorSegmentIndex,
  getRepeatedDoorInstances,
  getVisibleCorridorSegments,
  type CorridorDoorSlot,
} from './corridorMath';

describe('corridor math', () => {
  it('matches the reference segment indexing anchored at z=10', () => {
    expect(getCorridorSegmentIndex(11)).toBe(-1);
    expect(getCorridorSegmentIndex(10)).toBe(0);
    expect(getCorridorSegmentIndex(-6)).toBe(0);
    expect(getCorridorSegmentIndex(-70)).toBe(1);
    expect(getCorridorSegmentIndex(-150)).toBe(2);
  });

  it('keeps the previous, current, and next segments mounted around the camera', () => {
    expect(getVisibleCorridorSegments(11)).toEqual([-2, -1, 0]);
    expect(getVisibleCorridorSegments(-85)).toEqual([0, 1, 2]);
  });

  it('repeats door slots by shifting them backward one full segment each time', () => {
    const baseDoors: CorridorDoorSlot[] = [
      { side: 'left', z: -6 },
      { side: 'right', z: -20 },
    ];

    expect(getRepeatedDoorInstances(baseDoors, [0, 1])).toEqual([
      { side: 'left', z: -6, segmentIndex: 0 },
      { side: 'right', z: -20, segmentIndex: 0 },
      { side: 'left', z: -70, segmentIndex: 1 },
      { side: 'right', z: -84, segmentIndex: 1 },
    ]);
  });

  it('uses the source-like idle and hover yaw angles for corridor doors', () => {
    expect(getCorridorDoorBaseYaw('left')).toBeCloseTo(1.1479, 3);
    expect(getCorridorDoorBaseYaw('right')).toBeCloseTo(-1.1479, 3);
    expect(getCorridorDoorHoverYaw('left')).toBeCloseTo(1.0479, 3);
    expect(getCorridorDoorHoverYaw('right')).toBeCloseTo(-1.0479, 3);
  });

  it('places door roots on the slanted bay entrance, not on the flat outer wall', () => {
    expect(getCorridorDoorTransform({ side: 'left', z: -18 })).toEqual({
      x: -2.6,
      z: -16,
      rotationY: expect.closeTo(1.1479, 0.001),
    });
    expect(getCorridorDoorTransform({ side: 'right', z: -32 })).toEqual({
      x: 2.6,
      z: -30,
      rotationY: expect.closeTo(-1.1479, 0.001),
    });
  });

  it('cuts outer wall filler strips around door openings instead of leaving one solid wall', () => {
    const fillers = buildCorridorWallFillers(
      'left',
      [
        { side: 'left', z: -6 },
        { side: 'left', z: -36 },
      ],
      10,
      80,
    );

    expect(fillers).toEqual([
      { side: 'left', x: -3.5, z: 2, width: 16, trimLowZ: true, trimHighZ: false },
      { side: 'left', x: -3.5, z: -23, width: 26, trimLowZ: false, trimHighZ: false },
      { side: 'left', x: -3.5, z: -55, width: 30, trimLowZ: false, trimHighZ: true },
    ]);
  });
});
