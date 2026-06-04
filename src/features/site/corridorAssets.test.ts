/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { corridorPreloadTexturePaths } from './inspiredPortfolioAssets';

describe('corridor assets', () => {
  it('ships a decodable avatar sketch image for the corridor intro', () => {
    const assetPath = join(
      process.cwd(),
      'public',
      'itomdev-clone',
      'textures',
      'corridor',
      'avatar_sketch.webp',
    );

    const asset = readFileSync(assetPath);
    const riffHeader = asset.subarray(0, 4).toString('ascii');
    const webpMarker = asset.subarray(8, 12).toString('ascii');

    expect(riffHeader).toBe('RIFF');
    expect(webpMarker).toBe('WEBP');
  });

  it('ships the cabin sketch font used by corridor 3D text labels', () => {
    const fontPath = join(
      process.cwd(),
      'public',
      'fonts',
      'CabinSketch-Bold.ttf',
    );

    const font = readFileSync(fontPath);

    expect(font.subarray(0, 4).toString('ascii')).toBe('\u0000\u0001\u0000\u0000');
    expect(font.length).toBeGreaterThan(1024);
  });

  it('preloads the core corridor textures needed before the first hallway frame paints', () => {
    expect(corridorPreloadTexturePaths).toEqual(
      expect.arrayContaining([
        '/textures/corridor/wall_texture.webp',
        '/textures/corridor/ceiling_texture.webp',
        '/textures/corridor/kawalekpodlogi.webp',
        '/textures/corridor/doors/frame_sketch.webp',
        '/textures/corridor/doors/drzwiprojekty.webp',
        '/textures/corridor/doors/drzwiprojekty_painted.webp',
        '/textures/corridor/avatar_anim/1.webp',
        '/textures/corridor/avatar_anim/9.webp',
        '/textures/gallery/floor.webp',
        '/textures/gallery/railing.webp',
        '/textures/gallery/domki.webp',
        '/textures/gallery/miastotlo.webp',
        '/textures/gallery/bird_gray.webp',
        '/textures/gallery/klamerka.webp',
      ]),
    );

    expect(new Set(corridorPreloadTexturePaths).size).toBe(
      corridorPreloadTexturePaths.length,
    );
  });
});
