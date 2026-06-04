export type CorridorDoorCard = {
  id: 'tech-dorm' | 'music-studio' | 'experience';
  label: string;
  eyebrow: string;
  side: 'left' | 'right';
  z: number;
  texture: string;
  paintedTexture: string;
};

export type CorridorAvatarFrameState = {
  frameIndex: number;
  isReversing: boolean;
};

export const corridorDoorCards: CorridorDoorCard[] = [
  {
    id: 'tech-dorm',
    label: 'Tech Dorm',
    eyebrow: '',
    side: 'left',
    z: -18,
    texture: '/textures/corridor/doors/drzwiprojekty.webp',
    paintedTexture: '/textures/corridor/doors/drzwiprojekty_painted.webp',
  },
  {
    id: 'music-studio',
    label: 'Music Studio',
    eyebrow: '',
    side: 'right',
    z: -32,
    texture: '/textures/corridor/doors/drzwisocial.webp',
    paintedTexture: '/textures/corridor/doors/drzwisocial_painted.webp',
  },
  {
    id: 'experience',
    label: 'Journey',
    eyebrow: '',
    side: 'left',
    z: -48,
    texture: '/textures/corridor/doors/drzwiabout.webp',
    paintedTexture: '/textures/corridor/doors/drzwiabout_painted.webp',
  },
];

function easePresence(progress: number) {
  return progress * (2 - progress);
}

export function getCorridorAvatarTargetOffset(cameraDeltaZ: number) {
  const forwardRange = 3;
  const center = 0;
  const backwardRange = -2;
  const maxOffset = -1.5;

  if (cameraDeltaZ > center && cameraDeltaZ < forwardRange) {
    const progress = (forwardRange - cameraDeltaZ) / (forwardRange - center);
    return maxOffset * easePresence(progress);
  }

  if (cameraDeltaZ <= center && cameraDeltaZ > backwardRange) {
    const progress = (cameraDeltaZ - backwardRange) / (center - backwardRange);
    return maxOffset * easePresence(progress);
  }

  return 0;
}

export function getCorridorDenTargetOffset(cameraDeltaZ: number) {
  const mirroredOffset = -getCorridorAvatarTargetOffset(cameraDeltaZ);

  return Object.is(mirroredOffset, -0) ? 0 : mirroredOffset;
}

export function advanceCorridorAvatarFrame(
  state: CorridorAvatarFrameState,
  frameCount: number,
): CorridorAvatarFrameState {
  if (frameCount <= 1) {
    return { frameIndex: 0, isReversing: false };
  }

  if (!state.isReversing) {
    if (state.frameIndex >= frameCount - 1) {
      return {
        frameIndex: frameCount - 2,
        isReversing: true,
      };
    }

    return {
      frameIndex: state.frameIndex + 1,
      isReversing: false,
    };
  }

  if (state.frameIndex <= 0) {
    return {
      frameIndex: 1,
      isReversing: false,
    };
  }

  return {
    frameIndex: state.frameIndex - 1,
    isReversing: true,
  };
}
