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

## 6. Scene Visuals & World Layout
To ensure error-free rendering, the 3D world must follow strict visual and layout guidelines:

- **The Open World Hub:** A central outdoor plaza or stylized floating island. Bright, welcoming daylight.
  - *Assets:* Simple ground plane, stylized trees, and pathways leading to the 4 main buildings.
- **Tech-Dorm Building:** 
  - *Visuals:* Cyberpunk or neon-lit dorm room, dark mode aesthetic.
  - *Props:* A desk, glowing monitors showing code, a server rack. The NPC Danish sits at the desk typing.
- **School & College Building:**
  - *Visuals:* A clean, academic lecture hall or library. Soft, warm lighting.
  - *Props:* Bookshelves, a whiteboard (showing EV intrusion detection diagrams), and a badminton racket leaning on a desk.
- **Experience Row (3 Buildings):**
  - *Visuals:* A sleek, modern corporate street with 3 glass-front office buildings (LivPal, Tel-Aviv Uni, TFU).
  - *Props:* Corporate logos/signs on the buildings, stock market charts visible through the TFU window.
- **Music Studio:**
  - *Visuals:* A high-end soundproof recording studio. Warm, moody spotlights.
  - *Props:* Sound-absorbing wall panels, microphones, and an NPC Danish playing a bansuri (flute).

## 7. UI/UX Layout
- **3D Canvas:** Takes up 100% of the viewport width and height (`100vw`, `100vh`).
- **AI Chat Interface:** 
  - An absolute-positioned, glassmorphism-styled floating panel on the bottom-right of the screen.
  - Features an input box, a scrolling message history, and a header indicating the current context (e.g., "AI Assistant - Tech Dorm").
- **Movement Controls Help:** A subtle, semi-transparent overlay in the bottom-left showing "WASD to move, Mouse to look".
- **Admin Dashboard:** A full-screen standard 2D React layout (opaque, hiding the 3D canvas) with a sidebar for selecting the Firestore document to edit, and a main panel with form inputs.
