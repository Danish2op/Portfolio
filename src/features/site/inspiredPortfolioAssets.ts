import { useTexture } from '@react-three/drei';

import { corridorDoorCards } from './corridorPresentation';
import { techDormGalleryEnvironmentTexturePaths } from './techDormGalleryModel';

const assetRoot = '/itomdev-clone';

function asset(relativePath: string) {
  return `${assetRoot}${relativePath}`;
}

const corridorAvatarFrameTexturePaths = Array.from(
  { length: 9 },
  (_, index) => `/textures/corridor/avatar_anim/${index + 1}.webp`,
);

const corridorStaticTexturePaths = [
  '/textures/corridor/wall_texture.webp',
  '/textures/corridor/ceiling_texture.webp',
  '/textures/corridor/kawalekpodlogi.webp',
  '/textures/corridor/texturadoprogow.webp',
  '/textures/corridor/pustatabliczka.webp',
  '/textures/corridor/doors/frame_sketch.webp',
  '/textures/corridor/doors/backsingledoors.webp',
  '/textures/corridor/doors/klamkadodrzwi.webp',
  '/textures/corridor/doors/klamkadodrzwi_painted.webp',
  '/textures/corridor/ramkanazdjecieduza.webp',
  '/textures/corridor/ramkanazdjeciemala.webp',
  '/textures/studio/Aandolan.png',
  '/textures/studio/Illustration.png',
  '/textures/studio/TedX.png',
  '/textures/studio/Naalayak.png',
] as const;

export const musicStudioTexturePaths = [
  '/textures/studio/monitor_front.webp',
  '/textures/studio/monitor_front_painted.webp',
  '/textures/studio/monitor_back.webp',
  '/textures/studio/monitor_top.webp',
  '/textures/studio/monitor_bottom.webp',
  '/textures/studio/monitor_left.webp',
  '/textures/studio/monitor_right.webp',
  '/textures/studio/monitor_back_painted.webp',
  '/textures/studio/monitor_top_painted.webp',
  '/textures/studio/monitor_bottom_painted.webp',
  '/textures/studio/monitor_left_painted.webp',
  '/textures/studio/monitor_right_painted.webp',
  '/textures/studio/tv_front.webp',
  '/textures/studio/tv_front_painted.webp',
  '/textures/studio/tv_back.webp',
  '/textures/studio/tv_top.webp',
  '/textures/studio/tv_bottom.webp',
  '/textures/studio/tv_side.webp',
  '/textures/studio/tv_back_painted.webp',
  '/textures/studio/tv_top_painted.webp',
  '/textures/studio/tv_bottom_painted.webp',
  '/textures/studio/tv_side_painted.webp',
  '/textures/studio/phone_front.webp',
  '/textures/studio/phone_front_painted.webp',
  '/textures/studio/phone_back.webp',
  '/textures/studio/phone_side.webp',
  '/textures/studio/phone_back_painted.webp',
  '/textures/studio/phone_side_painted.webp',
  '/textures/studio/tvfront_filmikprojektdlamultiego.webp',
  '/textures/studio/tvfront_filmikprojektdlamultiego_painted.webp',
  '/textures/studio/tvfront_filmikedytowaniezdjec.webp',
  '/textures/studio/tvfront_filmikedytowaniezdjec_painted.webp',
  '/textures/studio/monitorfront_postnafbdoublewinner.webp',
  '/textures/studio/monitorfront_postnafbdoublewinner_painted.webp',
  '/textures/studio/phonefront_followmeontiktok.webp',
  '/textures/studio/phonefront_followmeontiktok_painted.webp',
] as const;

export const corridorPreloadTexturePaths = [
  ...new Set([
    ...corridorDoorCards.flatMap((door) => [door.texture, door.paintedTexture]),
    ...corridorAvatarFrameTexturePaths,
    ...corridorStaticTexturePaths,
    ...techDormGalleryEnvironmentTexturePaths,
    ...musicStudioTexturePaths,
  ]),
];

export function preloadInspiredPortfolioAssets() {
  corridorPreloadTexturePaths.forEach((relativePath) => {
    useTexture.preload(asset(relativePath));
  });
}

