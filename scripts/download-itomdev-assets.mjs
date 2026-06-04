import { mkdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';

const assetPaths = [
  '/textures/paper-texture.webp',
  '/textures/doors/frame_sketch.webp',
  '/textures/doors/door_left_sketch.webp',
  '/textures/doors/door_right_sketch.webp',
  '/textures/doors/door_back_left_sketch.webp',
  '/textures/doors/door_back.webp',
  '/textures/doors/pien.webp',
  '/textures/doors/pien_sketch.webp',
  '/textures/doors/handle_left_sketch.webp',
  '/textures/doors/handle_right_sketch.webp',
  '/textures/doors/door_left_painted.webp',
  '/textures/doors/door_right_painted.webp',
  '/textures/doors/handle_left_painted.webp',
  '/textures/doors/handle_right_painted.webp',
  '/textures/entrance/avatar_window.webp',
  '/textures/entrance/tree_sketch.webp',
  '/textures/entrance/wall_bricks_2.webp',
  '/textures/entrance/floor_paper.webp',
  '/textures/entrance/window_sketch.webp',
  '/textures/entrance/sign.webp',
  '/textures/entrance/stone-path.webp',
  '/textures/entrance/bug_sketch.webp',
  '/textures/entrance/pot_with_duck.webp',
  '/textures/entrance/mouse_hanging.webp',
  '/textures/entrance/speech_bubble.webp',
  '/textures/entrance/belka.webp',
  '/textures/entrance/cat_front_body.webp',
  '/textures/corridor/wall_texture.webp',
  '/textures/corridor/ceiling_texture.webp',
  '/textures/corridor/kawalekpodlogi.webp',
  '/textures/corridor/texturadoprogow.webp',
  '/textures/corridor/pustatabliczka.webp',
  '/textures/corridor/avatar_sketch.webp',
  '/textures/corridor/ramkanazdjecieduza.webp',
  '/textures/corridor/ramkanazdjecieduza_painted.webp',
  '/textures/corridor/doors/frame_sketch.webp',
  '/textures/corridor/doors/doorrleft.webp',
  '/textures/corridor/doors/dorright.webp',
  '/textures/corridor/doors/backsingledoors.webp',
  '/textures/corridor/doors/klamkadodrzwi.webp',
  '/textures/corridor/doors/klamkadodrzwi_painted.webp',
  '/textures/corridor/doors/drzwiprojekty.webp',
  '/textures/corridor/doors/drzwiprojekty_painted.webp',
  '/textures/corridor/doors/drzwisocial.webp',
  '/textures/corridor/doors/drzwisocial_painted.webp',
  '/textures/corridor/doors/drzwiabout.webp',
  '/textures/corridor/doors/drzwiabout_painted.webp',
  '/textures/corridor/doors/drzwikontakt.webp',
  '/textures/corridor/doors/drzwikontakt_painted.webp',
  '/textures/corridor/avatar_anim/1.webp',
  '/textures/corridor/avatar_anim/2.webp',
  '/textures/corridor/avatar_anim/3.webp',
  '/textures/corridor/avatar_anim/4.webp',
  '/textures/corridor/avatar_anim/5.webp',
  '/textures/corridor/avatar_anim/6.webp',
  '/textures/corridor/avatar_anim/7.webp',
  '/textures/corridor/avatar_anim/8.webp',
  '/textures/corridor/avatar_anim/9.webp',
  '/textures/gallery/floor.webp',
  '/textures/gallery/railing.webp',
  '/textures/gallery/domki.webp',
  '/textures/gallery/miastotlo.webp',
  '/textures/gallery/bird_gray.webp',
  '/textures/gallery/klamerka.webp',
  '/images/ink-splash.webp',
  '/images/map.webp',
  '/images/map_about_painted.webp',
  '/images/map_gallery_painted.webp',
  '/images/map_contact_painted.webp',
  '/images/map_studio_painted.webp',
  '/images/pin.webp',
  '/images/pin-slot.webp',
  '/sounds/pencil.mp3',
  '/sounds/cfl_turningpages-belem-breeze-487596.ogg',
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
  '/sounds/szummonitorow.mp3',
  '/textures/about/GSAPduzybalon.webp',
  '/textures/about/GSAPduzybalon_painted.webp',
  '/textures/about/JSSREDNIBALON.webp',
  '/textures/about/JSSREDNIBALON_painted.webp',
  '/textures/about/SOTD.webp',
  '/textures/about/SOTDAYYOUNGMULTICSSWINNER.webp',
  '/textures/about/SOTDAYYOUNGMULTIDESIGNNOMINESS.webp',
  '/textures/about/SOTDAYYOUNGMULTIGSAP.webp',
  '/textures/about/SOTDAYYOUNGMULTIORPETRON.webp',
  '/textures/about/SOTD_painted.webp',
  '/textures/about/SOTM.webp',
  '/textures/about/SOTM_painted.webp',
  '/textures/about/SOTY.webp',
  '/textures/about/SOTY_painted.webp',
  '/textures/about/awatarnachmurce.webp',
  '/textures/about/button.webp',
  '/textures/about/button_painted.webp',
  '/textures/about/csssrednibalon.webp',
  '/textures/about/csssrednibalon_painted.webp',
  '/textures/about/figmamalybalon.webp',
  '/textures/about/figmamalybalon_painted.webp',
  '/textures/about/firebasemalybalon.webp',
  '/textures/about/firebasemalybalon_painted.webp',
  '/textures/about/freelancewyspa.webp',
  '/textures/about/gitmalybalon.webp',
  '/textures/about/gitmalybalon_painted.webp',
  '/textures/about/htmlmalybalon.webp',
  '/textures/about/htmlmalybalon_painted.webp',
  '/textures/about/nextjssrednibalon.webp',
  '/textures/about/nextjssrednibalon_painted.webp',
  '/textures/about/reactduzybalon.webp',
  '/textures/about/reactduzybalon_painted.webp',
  '/textures/about/threejsduzybalon.webp',
  '/textures/about/threejsduzybalon_painted.webp',
  '/textures/about/uowyspa.webp',
  '/textures/clouds/1131c3eb-dfae-423f-924b-ff39d8ccd6dc.webp',
  '/textures/clouds/254b8ec8-d6f7-4275-956f-7bab65b2ce2d.webp',
  '/textures/clouds/2cc88dd1-483c-466d-b07e-f8308c61ccbe.webp',
  '/textures/clouds/5606fcc0-3252-447d-a58a-7bcbac73229a.webp',
  '/textures/clouds/7882dc72-3d01-41fb-ac0e-d07b0184ebc1.webp',
  '/textures/clouds/9b2ca72f-7bd0-473b-ba6e-dd9e0eb79d35.webp',
  '/textures/clouds/c83293c6-d90c-4a32-8d9d-5ac9af7e2296.webp',
  '/textures/clouds/f6e358bc-d27c-41dd-95f4-6787a835c41e.webp',
];

const baseUrl = 'https://itomdev.com';
const outputRoot = path.resolve('public/itomdev-clone');

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadAsset(assetPath) {
  const response = await fetch(`${baseUrl}${assetPath}`);

  if (!response.ok) {
    throw new Error(`Failed to download ${assetPath}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const destinationPath = path.join(outputRoot, assetPath);

  await mkdir(path.dirname(destinationPath), {
    recursive: true,
  });
  await writeFile(destinationPath, buffer);
}

async function main() {
  await mkdir(outputRoot, {
    recursive: true,
  });

  for (const assetPath of assetPaths) {
    const destinationPath = path.join(outputRoot, assetPath);

    if (await fileExists(destinationPath)) {
      console.log(`skip ${assetPath}`);
      continue;
    }

    console.log(`download ${assetPath}`);
    await downloadAsset(assetPath);
  }

  console.log(`downloaded ${assetPaths.length} assets into ${outputRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
