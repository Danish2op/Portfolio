export const techDormGallerySceneModel = {
  title: {
    position: {
      x: 0,
      y: 4.8,
      z: -4.18,
    },
    anchorX: 'center' as const,
    anchorY: 'middle' as const,
  },
  hangingCable: {
    position: {
      x: 0,
      y: 3.58,
      z: -4.3,
    },
    width: 5.8,
  },
  poster: {
    positions: [
      {
        x: -3.6,
        y: 3.6,
        z: -9.27,
      },
      {
        x: -1.2,
        y: 3.43,
        z: -8.86,
      },
      {
        x: 1.2,
        y: 3.43,
        z: -8.86,
      },
      {
        x: 3.6,
        y: 3.6,
        z: -9.27,
      },
    ],
    openPosition: {
      x: 0,
      y: 1.18,
      z: 1.62,
    },
    size: {
      width: 1.98,
      height: 2.52,
    },
    stringDrop: 0.74,
    focusScale: 1.84,
    stringWidth: 0.012,
    stringOffsetX: 0.31,
  },
  railing: {
    height: 1.15,
    position: {
      x: 0,
      y: 0.58,
      z: -3.82,
    },
    width: 19.5,
  },
  floor: {
    frontDepth: 4,
    backDepth: 2,
    innerWidth: 1.1,
    outerWidth: 7.5,
  },
} as const;
