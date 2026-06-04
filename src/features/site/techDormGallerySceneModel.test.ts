import { describe, expect, it } from 'vitest';

import { techDormGallerySceneModel } from './techDormGallerySceneModel';

describe('tech dorm gallery scene model', () => {
  it('keeps the Tech Dorm title centered at the top of the room', () => {
    expect(techDormGallerySceneModel.title.position.x).toBe(0);
    expect(techDormGallerySceneModel.title.position.y).toBeGreaterThan(4);
    expect(techDormGallerySceneModel.title.position.y).toBeLessThan(4.9);
    expect(techDormGallerySceneModel.title.anchorX).toBe('center');
  });

  it('hangs all three posters from one shared top cable with balanced spacing', () => {
    expect(techDormGallerySceneModel.hangingCable.position.x).toBe(0);
    expect(techDormGallerySceneModel.hangingCable.position.y).toBeGreaterThan(3.4);
    expect(techDormGallerySceneModel.hangingCable.position.z).toBeLessThan(-4);
    expect(techDormGallerySceneModel.hangingCable.width).toBeGreaterThan(5);
    expect(techDormGallerySceneModel.poster.positions).toEqual([
      { x: -3.6, y: 3.6, z: -9.27 },
      { x: -1.2, y: 3.43, z: -8.86 },
      { x: 1.2, y: 3.43, z: -8.86 },
      { x: 3.6, y: 3.6, z: -9.27 },
    ]);
  });

  it('adds real hanging-string drops and enlarges posters for inspection', () => {
    expect(techDormGallerySceneModel.poster.stringDrop).toBeGreaterThan(0.45);
    expect(techDormGallerySceneModel.poster.size.width).toBeGreaterThan(1.7);
    expect(techDormGallerySceneModel.poster.size.height).toBeGreaterThan(2.2);
    expect(techDormGallerySceneModel.poster.focusScale).toBeGreaterThan(1.7);
    expect(techDormGallerySceneModel.poster.openPosition.x).toBe(0);
    expect(techDormGallerySceneModel.poster.openPosition.y).toBeLessThan(1.5);
    expect(techDormGallerySceneModel.poster.openPosition.z).toBeGreaterThan(1.45);
  });

  it('tones down the balcony so it supports the posters instead of swallowing the frame', () => {
    expect(techDormGallerySceneModel.railing.height).toBeGreaterThan(0.9);
    expect(techDormGallerySceneModel.railing.height).toBeLessThan(1.35);
    expect(techDormGallerySceneModel.railing.position.y).toBeGreaterThan(0.45);
    expect(techDormGallerySceneModel.floor.frontDepth).toBeGreaterThan(3.5);
    expect(techDormGallerySceneModel.floor.frontDepth).toBeLessThan(4.5);
    expect(techDormGallerySceneModel.floor.backDepth).toBeGreaterThan(1.5);
    expect(techDormGallerySceneModel.floor.backDepth).toBeLessThan(2.5);
    expect(techDormGallerySceneModel.floor.outerWidth).toBeGreaterThan(7);
    expect(techDormGallerySceneModel.floor.outerWidth).toBeLessThan(8);
  });
});
