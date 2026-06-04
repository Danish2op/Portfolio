# 3D Portfolio Gated Spec-Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a production-ready React + Vite + TypeScript 3D portfolio with Firebase-backed scene-aware RAG chat, an authenticated admin CMS, responsive support across devices, and a gated verification checkpoint after every delivery phase.

**Architecture:** The application will use a Vite React SPA for all user-facing routes, React Three Fiber for the 3D world, Zustand for cross-layer app state, Firebase client SDKs for auth and Firestore access, and a Vercel serverless `api/chat.ts` proxy so the OpenRouter API key never ships to the browser. Scene context changes will be driven by trigger zones in the 3D world and mirrored into the store for the chat overlay and RAG pipeline.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS, React Router, Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, Zustand, Firebase, Vitest, React Testing Library, Vercel Functions

---

## Delivery Rules

- [ ] Create and stay on feature branch `codex/3d-open-world-portfolio` in the isolated worktree at `/tmp/portfolio-3d-open-world`.
- [ ] Keep `gated spec-order` sequencing: do not start a later phase until the current phase passes its build and test gate.
- [ ] Use TDD for all new behavior that can be verified with unit, component, integration, or route smoke tests.
- [ ] Keep OpenRouter access server-side only through `api/chat.ts`.
- [ ] Treat mobile as fully navigable for v1, not just responsive view-only.
- [ ] Seed Firestore with real launch copy, not placeholder lorem ipsum.

### Task 1: Foundation and Tooling Baseline

**Files:**
- Create: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `tailwind.config.ts`, `postcss.config.js`
- Create: `src/app/router.tsx`, `src/app/providers.tsx`
- Create: `vitest.config.ts`, `src/test/setup.ts`

- [ ] Scaffold a Vite React TypeScript app in the repo root without overwriting the existing `docs/` directory.
- [ ] Install runtime dependencies: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `zustand`, `firebase`, `react-router-dom`.
- [ ] Install styling and test dependencies: `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
- [ ] Add a minimal app shell with router wiring, Tailwind entrypoint, and a placeholder split between `/` and `/admin`.
- [ ] Add a first route smoke test that fails until the root app renders the portfolio shell and the admin route renders an admin placeholder.
- [ ] Run the smoke test to confirm red, implement the minimum app shell, then rerun the test to confirm green.
- [ ] Gate Phase 1 with `npm run test` and `npm run build`.

### Task 2: Firebase and Global Store

**Files:**
- Create: `src/lib/firebase/client.ts`, `src/lib/firebase/config.ts`, `src/lib/firebase/types.ts`
- Create: `src/lib/env.ts`, `src/vite-env.d.ts`
- Create: `src/app/store/usePortfolioStore.ts`
- Create: `src/app/store/usePortfolioStore.test.ts`
- Create: `scripts/seed-portfolio-knowledge.ts`
- Create: `scripts/seed-data/portfolioKnowledge.ts`

- [ ] Add typed environment handling for Firebase and OpenRouter-related variables, separating browser-safe values from server-only secrets.
- [ ] Write a failing store test that asserts `currentLocation`, `chatHistory`, and `isAdmin` can be initialized and updated predictably.
- [ ] Implement the Zustand store with actions for navigation context, chat state, auth state, loading state, and scene registration.
- [ ] Initialize Firebase app, Firestore, and Auth in a single reusable client module.
- [ ] Author the Firestore seed payload for `global_context`, `scene_tech_dorm`, `scene_education`, `scene_experience`, and `scene_music_studio` using real launch copy aimed at recruiters.
- [ ] Add a seeding script that upserts the knowledge collection documents safely.
- [ ] Gate Phase 2 with `npm run test`, `npm run build`, and a dry-run validation that the seed payload compiles without runtime type errors.

### Task 3: 3D Engine, Scene Skeletons, and Character Systems

**Files:**
- Create: `src/features/world/PortfolioCanvas.tsx`
- Create: `src/features/world/scene/WorldScene.tsx`
- Create: `src/features/world/scene/scenes/HubScene.tsx`
- Create: `src/features/world/scene/scenes/TechDormScene.tsx`
- Create: `src/features/world/scene/scenes/EducationScene.tsx`
- Create: `src/features/world/scene/scenes/ExperienceRowScene.tsx`
- Create: `src/features/world/scene/scenes/MusicStudioScene.tsx`
- Create: `src/features/world/player/CharacterController.tsx`
- Create: `src/features/world/player/useInputMap.ts`
- Create: `src/features/world/triggers/SceneTrigger.tsx`
- Create: `src/features/world/assets/assetRegistry.ts`
- Create: `src/features/world/assets/usePreloadAssets.ts`
- Create: `src/features/world/loading/LoadingOverlay.tsx`
- Create: `src/features/world/world.test.tsx`

- [ ] Write a failing integration test that asserts the portfolio route mounts the loading overlay and world shell without crashing.
- [ ] Build the base `<Canvas>` composition with physics, lights, camera rig, suspense boundaries, and an HTML loading overlay.
- [ ] Implement primitive-only layouts for the five required world areas first, using clear trigger zones to update `currentLocation`.
- [ ] Implement keyboard/mouse movement and mobile touch controls behind one input abstraction so full mobile roaming is supported from the same controller layer.
- [ ] Add an asset registry with `useGLTF.preload()` hooks and a placeholder Draco loader pipeline so final `.glb` assets can slot in without architecture changes.
- [ ] Keep placeholder art low-cost: primitives, simple materials, and minimal post-processing until performance gates are stable.
- [ ] Gate Phase 3 with `npm run test`, `npm run build`, and a manual interaction smoke check on desktop and responsive mobile viewport sizes.

### Task 4: Chat Overlay, RAG Pipeline, and AI Streaming

**Files:**
- Create: `src/features/chat/ChatPanel.tsx`
- Create: `src/features/chat/ChatMessageList.tsx`
- Create: `src/features/chat/ChatComposer.tsx`
- Create: `src/features/chat/chat.test.tsx`
- Create: `src/lib/rag/sceneContext.ts`
- Create: `src/lib/rag/promptBuilder.ts`
- Create: `src/lib/rag/firestoreKnowledge.ts`
- Create: `api/chat.ts`

- [ ] Write a failing test that asserts the chat header reflects the active scene and that a send action appends a pending assistant message.
- [ ] Build the glassmorphism chat overlay with scrollable history, current-context header, composer, loading state, and graceful empty/error states.
- [ ] Implement Firestore reads that fetch `global_context` plus the scene document selected by `currentLocation`.
- [ ] Build the prompt assembly pipeline as `[system rules] + [global context] + [scene context] + [user message]`.
- [ ] Implement `api/chat.ts` as a Vercel serverless function that proxies OpenRouter streaming responses using the configured `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` model.
- [ ] Add out-of-context handling so questions outside the current scene are redirected using the global navigation context instead of failing silently.
- [ ] Gate Phase 4 with `npm run test`, `npm run build`, and a local end-to-end manual check that scene changes alter chat context correctly.

### Task 5: Admin Portal and Live CMS Editing

**Files:**
- Create: `src/features/admin/AdminLayout.tsx`
- Create: `src/features/admin/AdminLogin.tsx`
- Create: `src/features/admin/KnowledgeEditor.tsx`
- Create: `src/features/admin/admin.test.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/app/store/usePortfolioStore.ts`

- [ ] Write a failing route test that asserts unauthenticated users are redirected away from `/admin` and authenticated users can see the editor shell.
- [ ] Implement Firebase email/password sign-in for a single-owner admin workflow.
- [ ] Add protected routing and auth synchronization into the global store so `isAdmin` reflects real session state.
- [ ] Build the real-time CMS interface with document selection, editable form fields, optimistic save feedback, and live Firestore updates.
- [ ] Preserve a clean separation between visitor UI and admin UI so `/admin` is a full-screen 2D route that hides the 3D canvas.
- [ ] Gate Phase 5 with `npm run test`, `npm run build`, and a manual auth/edit/save smoke test against Firestore.

### Task 6: Final Assets, Visual Polish, and Performance Hardening

**Files:**
- Create: `src/features/world/assets/generated/` (generated low-poly `.glb` assets and metadata)
- Modify: `src/features/world/scene/scenes/*`
- Modify: `src/features/world/assets/assetRegistry.ts`
- Modify: `src/features/world/loading/LoadingOverlay.tsx`

- [ ] Replace primitive hero structures with generated low-poly Draco-compressed `.glb` assets that match the approved hub, tech dorm, education, experience row, and music studio visual language.
- [ ] Keep props and materials stylized and lightweight; prefer baked lighting cues and simple shader/material setups over expensive runtime effects.
- [ ] Tune the loading overlay copy and animation so the initial experience feels premium while assets and physics initialize.
- [ ] Profile mobile and desktop performance, then simplify geometry, materials, and dynamic lights wherever frame time is unstable.
- [ ] Gate Phase 6 with `npm run test`, `npm run build`, and a manual performance pass across desktop and mobile-sized viewports.

### Task 7: Deployment and Production Verification

**Files:**
- Create: `vercel.json` if routing or function config requires it
- Create: `.env.example`
- Create: `README.md`

- [ ] Add a clear environment template documenting Firebase public keys, Firebase auth/firestore requirements, and the server-only OpenRouter key.
- [ ] Add Vercel configuration only if the default Vite + `api/` function routing is insufficient.
- [ ] Verify SPA routing, admin protection, chat proxy behavior, and asset loading in a production build.
- [ ] Deploy the branch to Vercel and validate the live site with the same smoke checklist used locally.
- [ ] Record final launch verification notes covering route behavior, Firebase reads/writes, auth, scene context switching, and chat responses.

## Verification Matrix

- [ ] `npm run test` passes after every phase gate.
- [ ] `npm run build` passes after every phase gate.
- [ ] Root route renders 3D shell without crashing.
- [ ] `/admin` is protected when signed out and functional when signed in.
- [ ] Scene trigger transitions update `currentLocation` and the chat context header.
- [ ] Firestore seed script populates the five required knowledge documents.
- [ ] OpenRouter traffic stays server-side and never exposes the API key in client bundles.
- [ ] Desktop and mobile navigation both function before calling the project production-ready.

## Assumptions Locked for Implementation

- The existing spec at `docs/superpowers/specs/2026-05-03-3d-portfolio-design.md` is the approved product spec.
- Delivery follows the spec’s phase order, but every phase must satisfy an explicit verification gate before continuing.
- V1 targets recruiters as the primary audience.
- V1 must be responsive on all devices and support full mobile roaming rather than a read-only mobile fallback.
- V1 admin support is limited to a single owner account for Danish Sharma.
- Firebase and Vercel accounts are assumed available during implementation, even if projects still need to be created.
