# Fresh Agent Handoff

## Use This Prompt

You are taking over the project at `/Users/danishsharma/Projects/Portfolio`.

Before changing any code, read these files in order:

1. `/Users/danishsharma/Projects/Portfolio/docs/agent-handoff/2026-05-15-fresh-agent-handoff.md`
2. `/Users/danishsharma/Projects/Portfolio/docs/superpowers/specs/2026-05-03-3d-portfolio-design.md`
3. `/Users/danishsharma/Projects/Portfolio/docs/research/components/itomdev-faithful-clone-spec.md`
4. `/Users/danishsharma/Projects/Portfolio/docs/research/itomdev.com/live-runtime/Experience-QKEGsRXt.js`

Project goal:
- Build a near-faithful `itomdev.com`-style interactive portfolio for Danish Sharma.
- Keep the same hand-drawn scene language and interaction model, but replace identity and room content with Danish's content.

Critical constraints:
- Do not touch or read `resume-service/`. Another agent is working there.
- Do not revert unrelated user changes.
- Keep working in `/Users/danishsharma/Projects/Portfolio`.
- Preserve the existing hand-drawn / paper / sketch visual language.
- Prefer real runtime verification over assumptions. Use local preview and Playwright or equivalent local inspection.

Current priority:
- Fix the first room (`Tech Dorm`) so it matches the inspiration site's first room (`gallery`) much more closely.

What is already done:
- Entrance scene exists and is close enough for now.
- Corridor loads and is explorable.
- A dedicated `Tech Dorm` room scene exists instead of the old generic overlay.
- Gallery assets from `itomdev` have been downloaded into `public/itomdev-clone/textures/gallery/`.
- Local tests and build pass.

What is still pending and should be treated as the active task list:

1. Fix `Tech Dorm` room composition.
   - The room currently opens, but the settled camera framing is still wrong.
   - The railing and floor dominate the scene too much.
   - Posters are too faint / too far back in the settled view.
   - The room does not yet feel as convincing or as spatial as the reference gallery room.

2. Match the inspiration room interaction more faithfully.
   - Entering the room should feel like a deliberate scene transition, not just a route jump.
   - Poster interaction should feel closer to the source gallery behavior: hover, focus, move forward, inspect, and return.
   - Exiting should feel like a real return-to-corridor motion, not a shortcut.

3. Tune first-room camera and staging.
   - The settled room camera should frame posters as the hero.
   - The exit board should remain visible but not dominate.
   - The room title should support the scene, not flatten it.

4. Improve room realism.
   - Add or refine the room dressing that makes it read as an actual place, not just a foreground platform.
   - Use the source gallery ideas: railing, skyline, layered background, hanging cards, depth cues.
   - If needed, make the floor/railing geometry lighter and use better camera height and look target.

5. Keep validation tight.
   - After each meaningful change, run focused tests and `npm run build`.
   - Also verify the real flow locally: entrance -> corridor -> Tech Dorm -> poster interaction -> exit to corridor.

Important current code locations:
- Main runtime: `/Users/danishsharma/Projects/Portfolio/src/features/site/InspiredPortfolioRoute3D.tsx`
- Dedicated Tech Dorm room: `/Users/danishsharma/Projects/Portfolio/src/features/site/TechDormGalleryRoom.tsx`
- Tech Dorm poster/content model: `/Users/danishsharma/Projects/Portfolio/src/features/site/techDormGalleryModel.ts`
- Asset preload list: `/Users/danishsharma/Projects/Portfolio/src/features/site/inspiredPortfolioAssets.ts`
- Asset downloader: `/Users/danishsharma/Projects/Portfolio/scripts/download-itomdev-assets.mjs`

Verification baseline before you start:
- `npm test` passed: 34/34
- `npm run build` passed
- Local preview route used during verification: `http://127.0.0.1:4173/`

Specific warning from the previous pass:
- The old issue where the corridor shell rendered underneath the room was fixed.
- The room now isolates correctly, but the visual composition is still not good enough.
- The next agent should not waste time rebuilding from zero; the current work is structurally useful but visually under-tuned.

Definition of success for the next pass:
- The first room feels recognizably like the `itomdev` gallery-room experience.
- The user can enter `Tech Dorm`, see a believable room with hanging project posters, interact with them, and exit back to the corridor cleanly.
- The result should look intentional enough that the user stops calling it a broken placeholder.

## Project Memory

This section is the condensed memory of how the project got here.

### High-level history

- The project originally started as a more generic 3D portfolio based on a written 3D open-world spec.
- That direction was rejected by the user because it looked fake, generic, and nothing like the visual quality they wanted.
- The user then explicitly redirected the project to use `https://itomdev.com` as the base inspiration, and later clarified they wanted something very close to a clone with Danish's information replacing Tomasz's.
- A large amount of time was spent correcting entrance behavior, corridor behavior, and scene layering to get closer to the source runtime.

### Important user preferences

- The user prefers near-literal adaptation over loose inspiration.
- They care a lot about exact placement, feel, motion, and layering.
- They are willing to reuse or copy visual artifacts from the source site.
- They want content customized to them, but structure and interaction very close to `itomdev`.
- They get frustrated quickly when placeholders are presented as finished.

### Important constraints

- `resume-service/` must not be touched or read.
- Git/GitHub setup is not the priority right now.
- Focus is the local experience first.
- The user wants to inspect locally before any deployment concerns.

### What was learned from reverse-engineering the source

- The source site is not a static page. It is a React Three Fiber runtime with GSAP-driven interaction.
- The first room in the source is a gallery room, not a modal overlay.
- That source room uses:
  - a distinct spatial scene
  - floor and railing
  - layered skyline / city background
  - hanging cards / posters
  - poster motion and focus interactions
  - room-specific entry / exit choreography

### Current implementation state

- Entrance:
  - Functional enough for now.
  - The hanging sign remains from the source art, but the custom Danish sign text was removed because it was not layering correctly.
  - Entrance controls and note clutter were reduced.

- Corridor:
  - Corridor renders and can be entered.
  - Corridor still needs more fidelity later, but it is not the active task right now.
  - The user explicitly shifted focus to the first room comparison.

- First room / Tech Dorm:
  - A dedicated room component now exists in `/Users/danishsharma/Projects/Portfolio/src/features/site/TechDormGalleryRoom.tsx`.
  - The old generic `RoomOverlay` approach is bypassed for `tech-dorm`.
  - Danish-specific poster content was introduced in `/Users/danishsharma/Projects/Portfolio/src/features/site/techDormGalleryModel.ts`.
  - Gallery textures from the source were added to the asset download pipeline and preload pipeline.
  - The room currently opens via route map and scene flow, but composition is still poor.

### Concrete current problem

- The current settled Tech Dorm screenshot still looks wrong:
  - camera is not flattering
  - railing still steals too much attention
  - posters are too subtle
  - room does not yet feel as alive or spatial as the source room

### Recommended next move

- Continue refining the current `TechDormGalleryRoom` instead of throwing it away.
- Use local runtime screenshots after each meaningful adjustment.
- Prioritize:
  1. camera pose
  2. poster prominence
  3. exit board placement
  4. room depth and staging
  5. poster interaction polish

### Last verified status

- `npm test` passes.
- `npm run build` passes.
- Preview was available at `http://127.0.0.1:4173/`.

