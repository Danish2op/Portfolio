# ITomDev Faithful Clone Runtime Spec

## Goal
Rebuild the `https://itomdev.com` interaction model with much higher fidelity, then replace only the identity, room content, and room mapping with Danish Sharma's information.

This document is based on:
- live HTML from `https://itomdev.com`
- live CSS from `/assets/index-7YSu33UF.css`
- live shell bundle from `/assets/index-DV-1WFZA.js`
- live scene chunk from `/assets/Experience-QKEGsRXt.js`

## Runtime Architecture
- The app is a React + R3F experience, not a styled static site.
- The shell bundle lazy-loads `Experience-QKEGsRXt.js` via `React.lazy`.
- Scene transitions are managed through a teleport state machine with:
  - `currentRoom`
  - `hasEntered`
  - `isInRoom`
  - `teleportTarget`
  - `isTeleporting`
  - `teleportPhase`
  - `pendingDoorClick`
  - `exitRequested`
- The paper transition overlay is separate from the scene and opens/closes during teleports.

## Global Motion Stack
- GSAP is used extensively for entrance, door, and overlay animations.
- GSAP `Observer` drives corridor navigation from wheel, touch, and pointer gestures.
- R3F `useFrame` is used for continuous per-frame motion:
  - cat pupil tracking
  - hanging mouse swing
  - corridor camera smoothing
  - subtle prop oscillations
- CSS handles overlay transitions, achievement popups, paper-card styling, and UI reveal/hide states.

## Exact Entrance Scene Contract

### 1. Front Door
- The entrance room component is `su`.
- Two physical doors exist as left and right meshes.
- Hover behavior:
  - sets cursor to pointer
  - rotates left/right doors slightly (`y: -0.08` and `y: 0.08`)
  - rotates handle groups slightly (`z: 0.1` and `z: -0.1`)
  - reveals painted textures by animating `uProgress` on reveal materials to `1`
  - shows painted handles while hovered
- Hover exit behavior:
  - resets rotations to `0`
  - animates `uProgress` back to `0`
  - hides painted handles after a short delayed call
- Click behavior:
  - unlocks achievement `corridor_enter`
  - plays audio through `vi()`
  - drives a GSAP timeline:
    - handle groups rotate quickly first
    - doors swing open to roughly `+- Math.PI * 0.55`
    - camera moves to `z: 11`, `y: 0.2` over `1.8s`
  - on completion, the scene marks the corridor as entered

### 2. Cat
- The cat is not full-body tracking.
- Two pupil meshes are animated every frame.
- Base pupil offsets are approximately:
  - left eye: `x: -0.075`, `y: 0.28`
  - right eye: `x: 0.043`, `y: 0.28`
- Pointer tracking:
  - reads R3F pointer coordinates each frame
  - lerps pupils toward offsets derived from pointer `x` and `y`
  - this creates the “eyes follow the cursor” effect

### 3. Window Avatar
- The avatar plane uses `/textures/entrance/avatar_window.webp`.
- The hover zone is the window plane using `/textures/entrance/window_sketch.webp`.
- Hover behavior:
  - cursor becomes pointer
  - avatar slides from `x: 3.5` to `x: 2.5`
  - avatar rotates slightly on `z`
- Hover exit behavior:
  - avatar returns to `x: 3.5`
  - rotation resets to `0`
- This is a subtle peek/wave moment, not a large modal interaction.

### 4. Bug
- The bug plane uses `/textures/entrance/bug_sketch.webp`.
- Click behavior:
  - only works once
  - stores current bug position
  - spawns an ink splash plane from `/images/ink-splash.webp`
  - scales splash from `0` to visible with a GSAP `back.out` ease
  - triggers text reveal for `BUG FIXED!`
  - text reveal is done with animated clip rect progress from `0` to `1`
  - splash fades away after about `1.5s`
- This is not just a text toggle; it is a timed mini-animation.

### 5. Speech Bubble / Duck Pot Interaction
- The duck-pot area is clickable.
- Clicking it shows a speech bubble using `/textures/entrance/speech_bubble.webp`.
- Bubble content is random from a predefined array of debug-joke strings such as:
  - `Have you tried console.log()?`
  - `Did you clear the cache?`
  - `Works in production! 🚀`
- Bubble animation:
  - scale from `0` to visible with `back.out`
  - auto-hide after about `3s`
  - scale back down on exit

### 6. Hanging Mouse / Tree Props
- The hanging mouse prop oscillates using `sin` and `cos` in `useFrame`.
- The tree group also gets subtle animated motion.
- These props make the exterior feel alive even without direct interaction.

## Exact Corridor Contract

### 1. Camera Movement
- Corridor camera control is handled by `fu`.
- Input sources:
  - wheel scroll
  - touch drag
  - keyboard: `ArrowUp`, `ArrowDown`, `PageUp`, `PageDown`, `Space`
  - pointer parallax
  - device orientation on supported devices
- Core motion:
  - scroll adjusts target `camera.z`
  - actual camera position lerps toward target
  - pointer parallax affects `camera.x` and `camera.y`
  - corridor “glance” adds lateral bias when near doors
- Corridor exploration unlocks achievement `corridor_explore`.

### 2. Segment System
- Corridor is segmented and repeated.
- Segment length is `80`.
- Visible door depths are roughly:
  - `-18`
  - `-32`
  - `-48`
  - `-62`
- Doors alternate sides left/right.
- The camera system computes current segment based on `camera.z`.

### 3. Room Doors
- Door card component uses painted and unpainted textures.
- Hover behavior:
  - reveals painted version by animating `uProgress`
  - changes cursor to pointer
  - displays readable room labels
- Room labels in the original are:
  - `THE GALLERY`
  - `THE STUDIO`
  - `THE ABOUT`
  - `LET'S CONNECT`
- Click behavior:
  - enters room / triggers teleport flow
  - honors `pendingDoorClick`
  - supports fast teleport and map navigation

## Teleport and Room Transition Contract
- `TeleportRoom` uses fixed room `z` targets:
  - `gallery: -6`
  - `studio: -20`
  - `about: -36`
  - `contact: -50`
- On `teleportPhase === "teleporting"`:
  - camera is repositioned near target room
  - then either `completeTeleport()` or `openTeleportTransition()` is called after a short timeout
- Transition phases are:
  - `closing`
  - `teleporting`
  - `opening`
  - `null`

## Overlay Contract

### 1. Achievement Popup
- CSS class: `.achievement-popup`
- Position: fixed near bottom center
- Enter animation: `popupEnter`
- Exit animation: `popupExit`
- Card uses torn-paper clip-path and paper texture background.

### 2. Achievements Panel
- CSS class: `.achievements-panel`
- Slides from top-right
- Uses transform and opacity transitions
- Locked achievements are dimmed

### 3. Navigation UI
- CSS class: `.navigation-ui`
- Persistent overlay layer
- Holds map, audio, and achievement controls

### 4. Map Panel
- Uses painted overlay images:
  - `map_about_painted.webp`
  - `map_gallery_painted.webp`
  - `map_contact_painted.webp`
  - `map_studio_painted.webp`
- Pins and slot images:
  - `pin.webp`
  - `pin-slot.webp`
- Map buttons trigger room teleports, not content modals.

### 5. Audio Panel
- CSS class: `.audio-panel`
- Includes separate `Music` and `SFX` controls
- Slides and fades as an overlay, not as page content

### 6. Preloader / Paper Transition
- CSS classes:
  - `.preloader`
  - `.preloader__half`
  - `.preloader__overlay`
- Paper texture is used on both halves
- Transition is part of the identity of the site and must remain in the clone

## Interior Room Interaction Contract

### Gallery
- Project cards are spatial 3D cards, not modal buttons on a flat page.
- Hover reveals painted card state.
- Click opens or flips active card details.
- Unlocks achievement `gallery_inspect`.

### About
- Scroll/flight-driven spatial storytelling with balloons and cloud layers.
- Unlocks achievement `about_fly`.

### Contact
- Floating barrel contact props and paper-form treatment.
- Unlocks achievement `contact_choose`.

### Studio
- Rotatable monitor / phone / TV props.
- Hover reveals painted monitor states.
- Drag / browse interaction drives achievement `studio_interact`.

## Danish Adaptation Mapping
- Keep the interaction model almost intact.
- Replace only:
  - branding text
  - room naming where necessary
  - room content and project information
  - selected room labels if Danish’s mapping differs from ITom’s
- Strong recommended mapping:
  - `gallery` -> `Tech Dorm`
  - `studio` -> `Music Studio`
  - `about` -> `Education`
  - `contact` -> `Contact`
  - extra internship proof can be introduced as an adapted corridor room or by remapping one original room into `Experience Row`

## What Must Change In The Next Implementation Pass
- Stop using modal cards as the primary room metaphor.
- Reintroduce a real exterior entrance scene before the corridor.
- Make corridor exploration scroll-driven, not just button-driven.
- Use hover-to-painted transitions on doors and room props.
- Add the speech-bubble joke interaction, true bug-fix animation, and subtle prop motion.
- Preserve the layered overlay system: achievements, map, audio, paper transitions.
