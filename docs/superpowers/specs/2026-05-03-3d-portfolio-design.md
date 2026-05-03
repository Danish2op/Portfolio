# 3D Interactive Open-World Portfolio Design Specification

## 1. Overview
Danish Sharma's portfolio will be an interactive 3D web application where users can explore a virtual hub using a 3rd-person avatar. The world acts as a spatial representation of Danish's resume, featuring distinct buildings that represent different aspects of his life (Education, Internships, Technical Projects, and Music). A persistent, context-aware AI Assistant will accompany the user to provide information.

## 2. Core Architecture & Tech Stack
- **Framework:** React + Vite (TypeScript) for fast builds and strong typing.
- **3D Engine:** React Three Fiber (R3F) wrapped around Three.js.
- **3D Utilities:** `@react-three/drei` (helpers, environment maps, camera controls) and `@react-three/rapier` (physics and collision detection).
- **State Management:** `zustand` to bridge state between the 3D canvas and the 2D UI.
- **Backend/Database:** Firebase Firestore (for RAG Knowledge Base and CMS) and Firebase Auth (Admin Portal access).
- **AI Integration:** OpenRouter API utilizing `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`.
- **Hosting:** Vercel (free-tier, instant deployments).

## 3. Database Schema & RAG Strategy (Firestore)
The application will use a "Scene-Based Context Injection" approach instead of a complex vector database to ensure zero-cost hosting and low latency.

**Collection:** `portfolio_knowledge`
- **Doc: `global_context`**
  - Contains core identity ("Danish Sharma, Final Semester Computer Engineering at TIET...").
  - Contains global navigation instructions (how to guide users to the Tech-Dorm, Music Studio, etc.).
- **Doc: `scene_tech_dorm`**
  - Contains projects (Omni-Agent, etc.) and technical skills (Python, Node.js, React Native).
- **Doc: `scene_education`**
  - Contains school scores (83% CBSE), TIET B.E. details (7.4 CGPA), research, and leadership roles.
- **Doc: `scene_experience`**
  - Contains LivPal, Tel-Aviv University, and TFU internship details.
- **Doc: `scene_music_studio`**
  - Contains Sangeet Visharad degree info, TedX performance, and Ustaad Mujtaba Hussain discipleship details.

**Prompt Construction:** `[System Rules] + [global_context] + [Current Scene Document] + [User Message]`. If asked an out-of-context question, the AI will use the global context to redirect the user to the appropriate building.

## 4. State Management, Rendering & Performance
- **Zustand Store:** Tracks variables like `currentLocation` (e.g., "Hub", "Tech-Dorm"), `chatHistory`, and `isAdmin`.
- **Trigger Zones:** Invisible collision boxes at building entrances update `currentLocation` in the Zustand store, immediately switching the AI's context.
- **Asset Optimization:** All 3D models (`.glb`) will be Draco-compressed.
- **Preloading:** R3F's `useGLTF.preload()` will cache assets in the background.
- **Loading UI:** An HTML/CSS overlay (e.g., terminal typing effect) will mask the initial load of the 3D engine.

## 5. Admin Portal
- **Route:** A secure `/admin` route handled by React Router.
- **Auth:** Protected by Firebase Authentication (Email/Password).
- **Functionality:** A React-based form interface directly reading and writing to the `portfolio_knowledge` Firestore collection.
- **Real-Time Updates:** Saving changes in the Admin Portal updates the Firestore documents, ensuring the AI Assistant instantly has the latest context without requiring a site rebuild.
