import { describe, expect, it } from 'vitest';

import {
  advanceCorridorAvatarFrame,
  corridorDoorCards,
  getCorridorAvatarTargetOffset,
  getCorridorDenTargetOffset,
} from './corridorPresentation';

describe('corridor presentation', () => {
  it('keeps the corridor copy to the three intended door labels', () => {
    expect(
      corridorDoorCards.map((door) => ({
        label: door.label,
        eyebrow: door.eyebrow,
      })),
    ).toEqual([
      { label: 'Tech Dorm', eyebrow: '' },
      { label: 'Music Studio', eyebrow: '' },
      { label: 'Journey', eyebrow: '' },
    ]);
  });

  it('matches the source corridor stop spacing so the hallway keeps its depth', () => {
    expect(
      corridorDoorCards.map((door) => ({
        id: door.id,
        side: door.side,
        z: door.z,
      })),
    ).toEqual([
      { id: 'tech-dorm', side: 'left', z: -18 },
      { id: 'music-studio', side: 'right', z: -32 },
      { id: 'experience', side: 'left', z: -48 },
    ]);
  });

  it('animates the corridor avatar with the same near-camera drift shape as the reference', () => {
    expect(getCorridorAvatarTargetOffset(4)).toBe(0);
    expect(getCorridorAvatarTargetOffset(1.5)).toBeCloseTo(-1.125, 3);
    expect(getCorridorAvatarTargetOffset(0)).toBeCloseTo(-1.5, 3);
    expect(getCorridorAvatarTargetOffset(-1)).toBeCloseTo(-1.125, 3);
    expect(getCorridorAvatarTargetOffset(-3)).toBe(0);
  });

  it("mirrors the avatar drift for the corridor's Danish's Den title", () => {
    expect(getCorridorDenTargetOffset(4)).toBe(0);
    expect(getCorridorDenTargetOffset(1.5)).toBeCloseTo(1.125, 3);
    expect(getCorridorDenTargetOffset(0)).toBeCloseTo(1.5, 3);
    expect(getCorridorDenTargetOffset(-1)).toBeCloseTo(1.125, 3);
    expect(getCorridorDenTargetOffset(-3)).toBe(0);
  });

  it('ping-pongs corridor avatar frames instead of snapping back to frame one', () => {
    expect(advanceCorridorAvatarFrame({ frameIndex: 0, isReversing: false }, 9)).toEqual({
      frameIndex: 1,
      isReversing: false,
    });

    expect(advanceCorridorAvatarFrame({ frameIndex: 8, isReversing: false }, 9)).toEqual({
      frameIndex: 7,
      isReversing: true,
    });

    expect(advanceCorridorAvatarFrame({ frameIndex: 0, isReversing: true }, 9)).toEqual({
      frameIndex: 1,
      isReversing: false,
    });
  });
});
