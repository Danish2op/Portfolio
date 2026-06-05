import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Text, useTexture, Billboard, Plane } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Euler,
  MathUtils,
  Path,
  RepeatWrapping,
  Shape,
  ShapeGeometry,
  Vector3,
  type Group,
  type Mesh,
  type Texture,
} from 'three';
import { gsap } from 'gsap';

import { usePortfolioStore } from '../../app/store/usePortfolioStore';
import {
  buildCorridorWallFillers,
  clampCorridorTurn,
  corridorDoorApproachRunZ,
  corridorDoorBayWidth,
  corridorSegmentLength,
  getCorridorDoorBaseYaw,
  getCorridorGlanceBias,
  getCorridorDoorHoverYaw,
  getCorridorDoorTransform,
  getCorridorSegmentIndex,
  getRepeatedDoorInstances,
  getVisibleCorridorSegments,
  type CorridorDoorSlot,
} from './corridorMath';
import {
  advanceCorridorAvatarFrame,
  corridorDoorCards,
  getCorridorAvatarTargetOffset,
  getCorridorDenTargetOffset,
  type CorridorDoorCard,
} from './corridorPresentation';
import { preloadInspiredPortfolioAssets } from './inspiredPortfolioAssets';
import {
  corridorAvatarBasePosition,
  getCorridorDoorPreviewRotationY,
  getCorridorDoorPreviewTarget,
  resolveCorridorDoorSelection,
  type CorridorFocusedDoor,
} from './corridorRuntimeModel';
import { TechDormGalleryRoom } from './TechDormGalleryRoom';
import { MusicStudioRoom } from './MusicStudioRoom';
import { AboutRoom } from './AboutRoom';
import { type MusicStudioItem, platformConfigs } from './musicStudioModel';

type RoomId =
  | 'tech-dorm'
  | 'education'
  | 'experience'
  | 'music-studio';

type RuntimeMode = 'entrance' | 'corridor';
type AchievementId =
  | 'bug_fixed'
  | 'corridor_enter'
  | 'corridor_explore'
  | 'tech_dorm_open'
  | 'music_studio_open'
  | 'contact_choose';

type RoomDetail = {
  id: RoomId;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  chips: string[];
  features: Array<{
    title: string;
    detail: string;
  }>;
  notes: string[];
  hero: string;
  accentClass: string;
};

type CorridorDoorInstance = CorridorDoorCard & {
  segmentIndex: number;
  worldZ: number;
};

const assetRoot = '/itomdev-clone';
const achievementStorageKey = 'danish_portfolio_achievements_runtime';
const pathWidth = 2.04;
const pathHeight = 5.62;
const doorWidth = 0.94;
const doorHeight = 2.4;
const frameHeight = pathWidth * (877 / 718);
const baseDoorX = 0.94;
const corridorWidth = 7;
const corridorHeight = 3.5;
const corridorCameraStartZ = 11;
const corridorTrimUnit = (1582 / 94) * 0.15;
const corridorDoorWallRootX = corridorWidth / 2;
const corridorDoorHoverDistanceFar = 15;
const corridorDoorHoverDistanceNear = 3;
const corridorDoorLabelFont = '/fonts/CabinSketch-Bold.ttf';

const duckDebugTips = [
  'Have you tried console.log()?',
  'Did you clear the cache?',
  'It works on my machine! 🤷',
  'Maybe it is a CSS issue?',
  'Check the error message first.',
  'Works in production! 🚀',
];

function asset(relativePath: string) {
  return `${assetRoot}${relativePath}`;
}

function getCorridorDoorPlaqueLines(label: string) {
  if (label === 'Connect') {
    return ['Connect'];
  }

  return label.split(' ');
}

const roomDetails: Record<RoomId, RoomDetail> = {
  'tech-dorm': {
    id: 'tech-dorm',
    label: 'Tech Dorm',
    eyebrow: 'Projects Wing',
    title: 'Tech Dorm',
    summary:
      'A late-night builder room where Danish’s strongest technical signal lives: agentic systems thinking, cross-stack execution, and interfaces that feel shipped instead of staged.',
    chips: ['Omni-Agent', 'React', 'React Native', 'Node.js', 'Python'],
    features: [
      {
        title: 'Featured Builds',
        detail:
          'Omni-Agent anchors the room as proof that Danish can orchestrate tools, route tasks, and design workflows that feel like products instead of isolated scripts.',
      },
      {
        title: 'Cross-Stack Delivery',
        detail:
          'Frontend polish and backend execution meet here through React, React Native, Node.js, Python, and Firebase used as practical delivery tools.',
      },
      {
        title: 'AI-Native Product Taste',
        detail:
          'The through-line is product instinct: smoother workflows, clearer interfaces, and experiments grounded in usable outcomes.',
      },
    ],
    notes: [
      'Best room for interviews about agentic systems, product engineering depth, and shipping instinct.',
      'Pairs well with Experience Wing when the conversation turns to real-world proof.',
    ],
    hero: asset('/textures/corridor/doors/drzwiprojekty_painted.webp'),
    accentClass: 'room-panel--tech-dorm',
  },
  education: {
    id: 'education',
    label: 'Education',
    eyebrow: 'Study Hall',
    title: 'Education',
    summary:
      'A calm lecture-hall room framing the academic discipline behind the work: consistent performance, research curiosity, and technical growth.',
    chips: ['TIET', '7.4 CGPA', '83% CBSE', 'EV Research'],
    features: [
      {
        title: 'College Foundation',
        detail:
          'Danish is completing a B.E. in Computer Engineering at TIET and carrying a 7.4 CGPA into his final semester.',
      },
      {
        title: 'School Record',
        detail:
          'CBSE schooling finished with an 83 percent score, reinforcing the long-run consistency behind the portfolio.',
      },
      {
        title: 'Research Curiosity',
        detail:
          'The EV intrusion-detection thread points to applied systems thinking, security awareness, and curiosity beyond coursework.',
      },
    ],
    notes: [
      'Best room for conversations about fundamentals, growth potential, and research-minded engineering.',
      'It explains the discipline underneath the project work rather than repeating the same signals.',
    ],
    hero: asset('/textures/corridor/doors/drzwiabout_painted.webp'),
    accentClass: 'room-panel--education',
  },
  experience: {
    id: 'experience',
    label: 'Experience Wing',
    eyebrow: 'Internship Street',
    title: 'Experience Wing',
    summary:
      'A recruiter-facing room that converts internships into fast proof: Danish can adapt, collaborate, and deliver in structured environments.',
    chips: ['LivPal', 'Tel-Aviv University', 'TFU'],
    features: [
      {
        title: 'LivPal',
        detail:
          'Signals applied product and engineering execution in an environment where shipping value matters as much as technical correctness.',
      },
      {
        title: 'Tel-Aviv University',
        detail:
          'Represents research-adjacent rigor, technical depth exposure, and comfort with more demanding problem frames.',
      },
      {
        title: 'TFU',
        detail:
          'Shows domain adaptation, structured delivery, and the ability to contribute under different business constraints.',
      },
    ],
    notes: [
      'This room connects external validation with the self-driven work from Tech Dorm.',
      'Best room for readiness, ownership, and collaboration questions.',
    ],
    hero: asset('/textures/corridor/ramkanazdjecieduza_painted.webp'),
    accentClass: 'room-panel--experience',
  },
  'music-studio': {
    id: 'music-studio',
    label: 'Music Studio',
    eyebrow: 'Creative Chamber',
    title: 'Music Studio',
    summary:
      'A warm studio room that explains the discipline behind the engineering style: timing, composure, and long-horizon craft sharpened through music.',
    chips: ['Sangeet Visharad', 'TEDx', 'Bansuri', 'Ustaad Mujtaba Hussain'],
    features: [
      {
        title: 'Sangeet Visharad',
        detail:
          'A marker of formal classical training and the ability to stay committed to a demanding discipline over time.',
      },
      {
        title: 'Performance Presence',
        detail:
          'TEDx performance experience strengthens the story around stage comfort, communication clarity, and composure under pressure.',
      },
      {
        title: 'Mentorship & Craft',
        detail:
          'Discipleship under Ustaad Mujtaba Hussain reflects rigor, patience, and mastery built through repetition.',
      },
    ],
    notes: [
      'This room makes the portfolio feel personal without losing professional relevance.',
      'It links creative discipline directly to patience and refinement in Danish’s engineering work.',
    ],
    hero: asset('/textures/corridor/doors/drzwisocial_painted.webp'),
    accentClass: 'room-panel--music-studio',
  },
};

const achievementCopy: Record<
  AchievementId,
  {
    title: string;
    label: string;
  }
> = {
  bug_fixed: {
    title: 'Bug fixed',
    label: 'You squashed the wall bug before stepping inside.',
  },
  corridor_enter: {
    title: 'Explorer',
    label: 'The front door opened and the corridor is now yours to explore.',
  },
  corridor_explore: {
    title: 'Wanderer',
    label: 'Hallway unlocked! Keep walking to find Danish’s projects and journey.',
  },
  tech_dorm_open: {
    title: 'Builder Mode',
    label: 'Tech Dorm is open. Time to inspect how Danish ships.',
  },
  music_studio_open: {
    title: 'Stage Presence',
    label: 'Music Studio is open and the creative side is now in view.',
  },
  contact_choose: {
    title: 'Connector',
    label: 'You found the room that turns interest into a real conversation.',
  },
};

function loadUnlockedAchievements(): AchievementId[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(achievementStorageKey);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is AchievementId => value in achievementCopy)
      : [];
  } catch {
    return [];
  }
}

function useCursorLock(isActive: boolean) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.style.cursor = isActive ? 'pointer' : 'auto';

    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [isActive]);
}

function EntranceHouse({
  bugSquashed,
  debugTip,
  onAskDuck,
  onBugFixed,
  onEnterCorridor,
  onToggleWindowGreeting,
}: {
  bugSquashed: boolean;
  debugTip: string | null;
  onAskDuck: () => void;
  onBugFixed: () => void;
  onEnterCorridor: () => void;
  onToggleWindowGreeting: (visible: boolean) => void;
}) {
  const { camera, pointer } = useThree();
  const wall = useTexture(asset('/textures/entrance/wall_bricks_2.webp'));
  const path = useTexture(asset('/textures/entrance/stone-path.webp'));
  const frame = useTexture(asset('/textures/doors/frame_sketch.webp'));
  const leftDoor = useTexture(asset('/textures/doors/door_left_sketch.webp'));
  const rightDoor = useTexture(asset('/textures/doors/door_right_sketch.webp'));
  const leftDoorPainted = useTexture(asset('/textures/doors/door_left_painted.webp'));
  const rightDoorPainted = useTexture(asset('/textures/doors/door_right_painted.webp'));
  const leftHandle = useTexture(asset('/textures/doors/handle_left_sketch.webp'));
  const rightHandle = useTexture(asset('/textures/doors/handle_right_sketch.webp'));
  const leftHandlePainted = useTexture(asset('/textures/doors/handle_left_painted.webp'));
  const rightHandlePainted = useTexture(asset('/textures/doors/handle_right_painted.webp'));
  const backDoor = useTexture(asset('/textures/doors/door_back_left_sketch.webp'));
  const post = useTexture(asset('/textures/doors/pien.webp'));
  const windowTexture = useTexture(asset('/textures/entrance/window_sketch.webp'));
  const avatarWindow = useTexture(asset('/textures/entrance/avatar_window.webp'));
  const duck = useTexture(asset('/textures/entrance/pot_with_duck.webp'));
  const speech = useTexture(asset('/textures/entrance/speech_bubble.webp'));
  const bug = useTexture(asset('/textures/entrance/bug_sketch.webp'));
  const splash = useTexture(asset('/images/ink-splash.webp'));
  const tree = useTexture(asset('/textures/entrance/tree_sketch.webp'));
  const mouse = useTexture(asset('/textures/entrance/mouse_hanging.webp'));
  const cat = useTexture(asset('/textures/entrance/cat_front_body.webp'));
  const sign = useTexture(asset('/textures/entrance/sign.webp'));
  const beam = useTexture(asset('/textures/entrance/belka.webp'));
  const letterboxSketch = useTexture(asset('/textures/entrance/letterbox_sketch.png'));
  const letterboxPainted = useTexture(asset('/textures/entrance/letterbox_painted.png'));

  const leftDoorGroup = useRef<Group>(null);
  const rightDoorGroup = useRef<Group>(null);
  const leftHandleGroup = useRef<Group>(null);
  const rightHandleGroup = useRef<Group>(null);
  const leftDoorPaint = useRef<Mesh>(null);
  const rightDoorPaint = useRef<Mesh>(null);
  const leftDoorSketch = useRef<Mesh>(null);
  const rightDoorSketch = useRef<Mesh>(null);
  const leftHandlePaintMesh = useRef<Mesh>(null);
  const rightHandlePaintMesh = useRef<Mesh>(null);
  const leftHandleSketchMesh = useRef<Mesh>(null);
  const rightHandleSketchMesh = useRef<Mesh>(null);
  const avatarMesh = useRef<Group>(null);
  const bugMesh = useRef<Mesh>(null);
  const splashMesh = useRef<Group>(null);
  const treeGroup = useRef<Group>(null);
  const mouseGroup = useRef<Group>(null);
  const leftEye = useRef<Mesh>(null);
  const rightEye = useRef<Mesh>(null);
  const letterboxSketchMesh = useRef<Mesh>(null);
  const letterboxPaintMesh = useRef<Mesh>(null);
  const isDoorHovered = useRef(false);
  const isWindowHovered = useRef(false);
  const isDoorAnimating = useRef(false);
  const bugLabelTimeoutRef = useRef<number | null>(null);
  const [debugTipVisible, setDebugTipVisible] = useState(false);
  const [showBugFixedLabel, setShowBugFixedLabel] = useState(false);
  const [isLetterboxHovered, setIsLetterboxHovered] = useState(false);

  useCursorLock(
    isDoorHovered.current ||
      isWindowHovered.current ||
      isLetterboxHovered ||
      !!debugTipVisible,
  );

  useEffect(() => {
    if (!debugTip) {
      setDebugTipVisible(false);
      return;
    }

    setDebugTipVisible(true);
  }, [debugTip]);

  useEffect(() => {
    camera.position.set(0, 0.2, 28);
    camera.lookAt(0, 0.2, 12);
  }, [camera]);

  useEffect(() => {
    return () => {
      if (bugLabelTimeoutRef.current) {
        window.clearTimeout(bugLabelTimeoutRef.current);
      }
    };
  }, []);

  const animateDoorHover = useCallback((hovered: boolean) => {
    if (isDoorAnimating.current) {
      return;
    }

    isDoorHovered.current = hovered;

    gsap.to(leftDoorGroup.current?.rotation ?? {}, {
      duration: 0.3,
      ease: 'power2.out',
      y: hovered ? -0.08 : 0,
    });
    gsap.to(rightDoorGroup.current?.rotation ?? {}, {
      duration: 0.3,
      ease: 'power2.out',
      y: hovered ? 0.08 : 0,
    });
    gsap.to(leftHandleGroup.current?.rotation ?? {}, {
      duration: 0.2,
      ease: 'power2.out',
      z: hovered ? 0.1 : 0,
    });
    gsap.to(rightHandleGroup.current?.rotation ?? {}, {
      duration: 0.2,
      ease: 'power2.out',
      z: hovered ? -0.1 : 0,
    });

    const nextOpacity = hovered ? 1 : 0;
    [leftDoorPaint, rightDoorPaint, leftHandlePaintMesh, rightHandlePaintMesh].forEach(
      (ref) => {
        if (ref.current?.material && 'opacity' in ref.current.material) {
          gsap.to(ref.current.material, {
            duration: hovered ? 0.8 : 0.5,
            ease: 'power2.out',
            opacity: nextOpacity,
          });
        }
      },
    );

    const baseOpacity = hovered ? 0.42 : 1;
    [leftDoorSketch, rightDoorSketch, leftHandleSketchMesh, rightHandleSketchMesh].forEach(
      (ref) => {
        if (ref.current?.material && 'opacity' in ref.current.material) {
          gsap.to(ref.current.material, {
            duration: hovered ? 0.45 : 0.35,
            ease: 'power2.out',
            opacity: baseOpacity,
          });
        }
      },
    );
  }, []);

  const animateLetterboxHover = useCallback((hovered: boolean) => {
    setIsLetterboxHovered(hovered);

    if (letterboxPaintMesh.current?.material && 'opacity' in letterboxPaintMesh.current.material) {
      gsap.to(letterboxPaintMesh.current.material, {
        duration: hovered ? 0.8 : 0.5,
        ease: 'power2.out',
        opacity: hovered ? 1 : 0,
      });
    }
    if (letterboxSketchMesh.current?.material && 'opacity' in letterboxSketchMesh.current.material) {
      gsap.to(letterboxSketchMesh.current.material, {
        duration: hovered ? 0.45 : 0.35,
        ease: 'power2.out',
        opacity: hovered ? 0.3 : 1,
      });
    }
  }, []);

  const handleDoorOpen = useCallback(() => {
    if (isDoorAnimating.current) {
      return;
    }

    isDoorAnimating.current = true;
    animateDoorHover(false);

    const timeline = gsap.timeline({
      onComplete: () => {
        onEnterCorridor();
      },
    });

    timeline.to(leftHandleGroup.current?.rotation ?? {}, {
      z: 0.4,
      duration: 0.15,
      ease: 'power2.out',
    });
    timeline.to(
      rightHandleGroup.current?.rotation ?? {},
      {
        z: -0.4,
        duration: 0.15,
        ease: 'power2.out',
      },
      0,
    );
    timeline.to(
      leftDoorGroup.current?.rotation ?? {},
      {
        y: -Math.PI * 0.55,
        duration: 0.9,
        ease: 'power2.out',
      },
      0.1,
    );
    timeline.to(
      rightDoorGroup.current?.rotation ?? {},
      {
        y: Math.PI * 0.55,
        duration: 0.9,
        ease: 'power2.out',
      },
      0.1,
    );
    timeline.to(
      camera.position,
      {
        z: corridorCameraStartZ,
        y: 0.2,
        duration: 1.8,
        ease: 'power2.inOut',
      },
      0.3,
    );
  }, [animateDoorHover, camera.position, onEnterCorridor]);

  const handleBugClick = useCallback(() => {
    if (bugSquashed) {
      return;
    }

    onBugFixed();

    if (splashMesh.current) {
      splashMesh.current.visible = true;
      gsap.fromTo(
        splashMesh.current.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: 0.8,
          y: 0.8,
          z: 1,
          duration: 0.4,
          ease: 'back.out(1.7)',
        },
      );
      if (splashMesh.current.children[0]) {
        const splashMaterial = (splashMesh.current.children[0] as Mesh).material as {
          opacity?: number;
          transparent?: boolean;
        };
        splashMaterial.transparent = true;
        splashMaterial.opacity = 1;
        gsap.to(splashMaterial, {
          opacity: 0,
          duration: 1,
          delay: 1.5,
          ease: 'power2.out',
        });
      }
    }

    setShowBugFixedLabel(true);
    if (bugLabelTimeoutRef.current) {
      window.clearTimeout(bugLabelTimeoutRef.current);
    }
    bugLabelTimeoutRef.current = window.setTimeout(() => {
      setShowBugFixedLabel(false);
      bugLabelTimeoutRef.current = null;
    }, 1800);
  }, [bugSquashed, onBugFixed]);

  useFrame((state) => {
    if (leftEye.current && rightEye.current) {
      const offsetX = pointer.x * 0.03;
      const offsetY = pointer.y * 0.03;
      leftEye.current.position.x = MathUtils.lerp(
        leftEye.current.position.x,
        -0.075 + offsetX,
        0.1,
      );
      leftEye.current.position.y = MathUtils.lerp(
        leftEye.current.position.y,
        0.28 + offsetY,
        0.1,
      );
      rightEye.current.position.x = MathUtils.lerp(
        rightEye.current.position.x,
        0.043 + offsetX,
        0.1,
      );
      rightEye.current.position.y = MathUtils.lerp(
        rightEye.current.position.y,
        0.28 + offsetY,
        0.1,
      );
    }

    if (treeGroup.current) {
      treeGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }

    if (mouseGroup.current) {
      mouseGroup.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }

    if (bugMesh.current && !bugSquashed) {
      const t = state.clock.elapsedTime;
      const driftX = Math.sin(t * 0.8) * 0.3 + Math.sin(t * 1.5) * 0.1;
      const driftY = Math.cos(t * 0.6) * 0.2 + Math.cos(t * 1.1) * 0.1;
      bugMesh.current.position.x = 2.5 + driftX;
      bugMesh.current.position.y = 1.05 + driftY;
      bugMesh.current.rotation.z = Math.sin(t * 5) * 0.1;
    }

    if (avatarMesh.current) {
      avatarMesh.current.position.x = MathUtils.lerp(
        avatarMesh.current.position.x,
        isWindowHovered.current ? 2.5 : 3.5,
        isWindowHovered.current ? 0.12 : 0.1,
      );
      avatarMesh.current.rotation.z = MathUtils.lerp(
        avatarMesh.current.rotation.z,
        isWindowHovered.current ? 0.1 : 0,
        0.12,
      );
    }
  });

  return (
    <group position={[0, 0, 22]}>
      <mesh position={[0, -1.73, pathHeight / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[pathWidth, pathHeight]} />
        <meshBasicMaterial map={path} transparent />
      </mesh>

      <mesh position={[-(pathWidth / 2 + (15 - pathWidth) / 4), 2.25, 0]}>
        <boxGeometry args={[(15 - pathWidth) / 2, 8, 0.07]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.95} />
      </mesh>
      <mesh position={[(pathWidth / 2 + (15 - pathWidth) / 4), 2.25, 0]}>
        <boxGeometry args={[(15 - pathWidth) / 2, 8, 0.07]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.45, 0]}>
        <boxGeometry args={[pathWidth * 2, 5.6, 0.07]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.95} />
      </mesh>

      <mesh position={[0, 2.25, 0.15]}>
        <planeGeometry args={[16, 8]} />
        <meshBasicMaterial map={wall} transparent alphaTest={0.01} />
      </mesh>
      <mesh position={[0, -0.504, 0.12]}>
        <planeGeometry args={[pathWidth * 2, frameHeight]} />
        <meshBasicMaterial map={frame} transparent alphaTest={0.1} depthWrite={false} />
      </mesh>

      <group ref={leftDoorGroup} position={[-baseDoorX, -0.55, 0]}>
        <mesh
          position={[doorWidth / 2, 0, 0.06]}
          onClick={handleDoorOpen}
          onPointerEnter={() => animateDoorHover(true)}
          onPointerLeave={() => animateDoorHover(false)}
        >
          <boxGeometry args={[doorWidth, doorHeight, 0.04]} />
          <meshBasicMaterial color="#e0e0e0" map={post} />
        </mesh>
        <mesh ref={leftDoorPaint} position={[doorWidth / 2, 0, 0.092]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshBasicMaterial
            map={leftDoorPainted}
            transparent
            alphaTest={0.5}
            depthWrite={false}
            opacity={0}
          />
        </mesh>
        <mesh ref={leftDoorSketch} position={[doorWidth / 2, 0, 0.089]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshBasicMaterial
            map={leftDoor}
            transparent
            alphaTest={0.5}
            depthWrite={false}
            opacity={1}
          />
        </mesh>
        <mesh position={[doorWidth / 2, 0, 0.03]} rotation={[0, Math.PI, 0]} scale={[-1, 1, 1]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshBasicMaterial
            map={backDoor}
            transparent
            alphaTest={0.5}
            side={2}
          />
        </mesh>
        <group ref={leftHandleGroup} position={[doorWidth / 2 + 0.357, -0.099, 0.1]}>
          <mesh ref={leftHandleSketchMesh} position={[-0.357, 0.099, 0]}>
            <planeGeometry args={[doorWidth, doorHeight]} />
            <meshBasicMaterial
              map={leftHandle}
              transparent
              alphaTest={0.5}
              depthWrite={false}
              opacity={1}
            />
          </mesh>
          <mesh ref={leftHandlePaintMesh} position={[-0.357, 0.099, 0.001]}>
            <planeGeometry args={[doorWidth, doorHeight]} />
            <meshBasicMaterial
              map={leftHandlePainted}
              transparent
              alphaTest={0.5}
              depthWrite={false}
              opacity={0}
            />
          </mesh>
        </group>
      </group>

      <group ref={rightDoorGroup} position={[baseDoorX, -0.55, 0]}>
        <mesh
          position={[-doorWidth / 2, 0, 0.06]}
          onClick={handleDoorOpen}
          onPointerEnter={() => animateDoorHover(true)}
          onPointerLeave={() => animateDoorHover(false)}
        >
          <boxGeometry args={[doorWidth, doorHeight, 0.04]} />
          <meshBasicMaterial color="#e0e0e0" map={post} />
        </mesh>
        <mesh ref={rightDoorPaint} position={[-doorWidth / 2, 0, 0.092]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshBasicMaterial
            map={rightDoorPainted}
            transparent
            alphaTest={0.5}
            depthWrite={false}
            opacity={0}
          />
        </mesh>
        <mesh ref={rightDoorSketch} position={[-doorWidth / 2, 0, 0.089]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshBasicMaterial
            map={rightDoor}
            transparent
            alphaTest={0.5}
            depthWrite={false}
            opacity={1}
          />
        </mesh>
        <mesh position={[-doorWidth / 2, 0, 0.03]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshBasicMaterial map={backDoor} transparent alphaTest={0.5} />
        </mesh>
        <group ref={rightHandleGroup} position={[-doorWidth / 2 - 0.357, -0.099, 0.1]}>
          <mesh ref={rightHandleSketchMesh} position={[0.357, 0.099, 0]}>
            <planeGeometry args={[doorWidth, doorHeight]} />
            <meshBasicMaterial
              map={rightHandle}
              transparent
              alphaTest={0.5}
              depthWrite={false}
              opacity={1}
            />
          </mesh>
          <mesh ref={rightHandlePaintMesh} position={[0.357, 0.099, 0.001]}>
            <planeGeometry args={[doorWidth, doorHeight]} />
            <meshBasicMaterial
              map={rightHandlePainted}
              transparent
              alphaTest={0.5}
              depthWrite={false}
              opacity={0}
            />
          </mesh>
        </group>
      </group>

      <group
        position={[2.5, 0, 0.1]}
        onPointerEnter={() => {
          isWindowHovered.current = true;
          onToggleWindowGreeting(true);
        }}
        onPointerLeave={() => {
          isWindowHovered.current = false;
          onToggleWindowGreeting(false);
        }}
      >
        <mesh position={[0, 0, 0.2]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={windowTexture} transparent />
        </mesh>
      </group>
      <group ref={avatarMesh} position={[3.5, 0, 0.04]}>
        <mesh>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={avatarWindow} transparent />
        </mesh>
      </group>

      <group position={[2.5, -1.3, 0.4]}>
        <mesh>
          <planeGeometry args={[3, 1.8]} />
          <meshBasicMaterial map={duck} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
        <mesh
          position={[0.38, 0.1, 0.01]}
          onClick={(event) => {
            event.stopPropagation();
            onAskDuck();
          }}
          onPointerEnter={() => {
            setDebugTipVisible(true);
          }}
          onPointerLeave={() => {
            setDebugTipVisible(Boolean(debugTip));
          }}
        >
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {debugTip ? (
          <group position={[0.9, 0.8, 0.1]} scale={debugTipVisible ? 1 : 0}>
            <mesh>
              <planeGeometry args={[1.8, 1.2]} />
              <meshBasicMaterial map={speech} transparent alphaTest={0.01} depthWrite={false} />
            </mesh>
            <Text
              anchorX="center"
              anchorY="middle"
              color="#1a1a1a"
              fontSize={0.07}
              maxWidth={1.4}
              position={[0, 0.1, 0.01]}
              textAlign="center"
            >
              {debugTip}
            </Text>
          </group>
        ) : null}
      </group>

      <group
        position={[1.15, -0.4, 0.18]}
        onPointerEnter={() => animateLetterboxHover(true)}
        onPointerLeave={() => animateLetterboxHover(false)}
        onClick={(event) => {
          event.stopPropagation();
          window.open('https://resume-service-lime.vercel.app/api/download', '_blank');
        }}
      >
        <mesh ref={letterboxSketchMesh}>
          <planeGeometry args={[0.55, 0.55]} />
          <meshBasicMaterial
            map={letterboxSketch}
            transparent
            alphaTest={0.01}
            depthWrite={false}
            opacity={1}
          />
        </mesh>
        <mesh ref={letterboxPaintMesh} position={[0, 0, 0.001]}>
          <planeGeometry args={[0.55, 0.55]} />
          <meshBasicMaterial
            map={letterboxPainted}
            transparent
            alphaTest={0.01}
            depthWrite={false}
            opacity={0}
          />
        </mesh>
        {isLetterboxHovered ? (
          <Text
            position={[0, 0.35, 0.01]}
            font="/fonts/CabinSketch-Bold.ttf"
            fontSize={0.08}
            color="#2f2b24"
            anchorX="center"
            anchorY="middle"
          >
            My Resume
          </Text>
        ) : null}
      </group>

      {!bugSquashed ? (
        <mesh
          ref={bugMesh}
          position={[2.5, 1.05, 0.16]}
          onClick={(event) => {
            event.stopPropagation();
            handleBugClick();
          }}
        >
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial map={bug} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
      ) : null}
      <group ref={splashMesh} position={[2.5, 1.05, 0.17]} scale={[0, 0, 0]} visible={false}>
        <mesh>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial map={splash} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
      </group>
      {showBugFixedLabel ? (
        <Html
          transform
          position={[2.54, 1.02, 0.22]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="entrance-bug-fixed-label">BUG FIXED!</div>
        </Html>
      ) : null}

      <group position={[-2.9, 0.95, 1]}>
        <mesh renderOrder={12}>
          <planeGeometry args={[6, 8]} />
          <meshBasicMaterial map={tree} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
        <group ref={mouseGroup} position={[0.341, -0.436, 0]}>
          <mesh position={[-0.351, 0.456, 0]} renderOrder={13}>
            <planeGeometry args={[6, 8]} />
            <meshBasicMaterial map={mouse} transparent alphaTest={0.01} depthWrite={false} />
          </mesh>
        </group>
      </group>

      <group position={[-1.5, -1.15, 0.8]}>
        <mesh>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={cat} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
        <mesh ref={leftEye} position={[-0.063, 0.27, -0.02]}>
          <circleGeometry args={[0.02, 32]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh ref={rightEye} position={[0.0615, 0.27, -0.02]}>
          <circleGeometry args={[0.02, 32]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>

      <group position={[0, 0, 0]}>
        <mesh position={[-0.05, 2.2, 0.24]} renderOrder={4}>
          <planeGeometry args={[2.7, 0.4]} />
          <meshBasicMaterial map={beam} transparent side={2} depthWrite={false} />
        </mesh>
        <group ref={treeGroup} position={[0, 2.04, 0.23]}>
          <mesh position={[0, -0.5, 0]}>
            <planeGeometry args={[2, 1]} />
            <meshBasicMaterial
              map={sign}
              transparent
              side={2}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function CorridorDoor3D({
  door,
  isFocused,
  isRoomExiting,
  onActivate,
  onOpen,
}: {
  door: CorridorDoorInstance;
  isFocused: boolean;
  isRoomExiting: boolean;
  onActivate: (door: CorridorDoorInstance) => boolean;
  onOpen: (roomId: RoomId) => void;
}) {
  const { camera } = useThree();
  const baseTexture = useTexture(door.texture);
  const paintedTexture = useTexture(door.paintedTexture);
  const frameTexture = useTexture(asset('/textures/corridor/doors/frame_sketch.webp'));
  const backTexture = useTexture(asset('/textures/corridor/doors/backsingledoors.webp'));
  const handleTexture = useTexture(asset('/textures/corridor/doors/klamkadodrzwi.webp'));
  const handlePaintedTexture = useTexture(
    asset('/textures/corridor/doors/klamkadodrzwi_painted.webp'),
  );
  const wallTexture = useTexture(asset('/textures/corridor/wall_texture.webp'));
  const plaqueTexture = useTexture(asset('/textures/corridor/pustatabliczka.webp'));
  const trimTexture = useTexture(asset('/textures/corridor/texturadoprogow.webp'));
  const rootRef = useRef<Group>(null);
  const leafRef = useRef<Group>(null);
  const handleRef = useRef<Group>(null);
  const paintedRef = useRef<Mesh>(null);
  const paintedHandleRef = useRef<Mesh>(null);
  const sketchRef = useRef<Mesh>(null);
  const sketchHandleRef = useRef<Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const plaqueLines = useMemo(
    () => getCorridorDoorPlaqueLines(door.label),
    [door.label],
  );
  const doorPanelWidth = door.id === 'music-studio' ? 1.086 : 1.05;
  const doorPanelHeight = 2.5;
  const frameWidth = 1.25;
  const frameHeight = 2.5;
  const doorTransform = useMemo(
    () => getCorridorDoorTransform({ side: door.side, z: door.worldZ }),
    [door.side, door.worldZ],
  );
  const doorRootZ = doorTransform.z;
  const wallInsetX = door.side === 'left' ? corridorDoorBayWidth / 2 : -corridorDoorBayWidth / 2;
  const leafAnchorX = door.side === 'left' ? -doorPanelWidth / 2 : doorPanelWidth / 2;
  const leafPlaneX = -leafAnchorX;
  const handleDirection = door.side === 'left' ? 1 : -1;
  const handleOffsetX = leafPlaneX + handleDirection * 0.45;
  const doorTextureScaleX = door.side === 'right' && door.id !== 'music-studio' ? -1 : 1;
  const baseYaw = useMemo(() => getCorridorDoorBaseYaw(door.side), [door.side]);
  const hoverYaw = useMemo(() => getCorridorDoorHoverYaw(door.side), [door.side]);
  const yawRef = useRef(baseYaw);
  const wallTextureClone = useMemo(() => {
    const clone = wallTexture.clone();
    clone.needsUpdate = true;
    clone.wrapS = RepeatWrapping;
    clone.wrapT = RepeatWrapping;
    clone.repeat.set(0.5, 0.5);
    clone.offset.set(0.5, 0.5);
    return clone;
  }, [wallTexture]);
  const thresholdTrimTexture = useMemo(() => {
    const clone = trimTexture.clone();
    clone.needsUpdate = true;
    clone.wrapS = RepeatWrapping;
    clone.wrapT = RepeatWrapping;
    clone.repeat.set(1.1 / corridorTrimUnit, 1);
    return clone;
  }, [trimTexture]);
  const sideTrimTexture = useMemo(() => {
    const clone = trimTexture.clone();
    clone.needsUpdate = true;
    clone.wrapS = RepeatWrapping;
    clone.wrapT = RepeatWrapping;
    clone.repeat.set(((corridorDoorBayWidth - 1.1) / 2) / corridorTrimUnit, 1);
    return clone;
  }, [trimTexture]);
  const wallGeometry = useMemo(() => {
    const wallShape = new Shape();
    const halfWidth = corridorDoorBayWidth / 2;
    const halfHeight = corridorHeight / 2;

    wallShape.moveTo(-halfWidth, -halfHeight);
    wallShape.lineTo(halfWidth, -halfHeight);
    wallShape.lineTo(halfWidth, halfHeight);
    wallShape.lineTo(-halfWidth, halfHeight);
    wallShape.lineTo(-halfWidth, -halfHeight);

    const holeWidth = doorPanelWidth - 0.03;
    const holeHeight = doorPanelHeight - 0.1;
    const holeHalfWidth = holeWidth / 2;
    const holeHalfHeight = holeHeight / 2;
    const holeCenterY = -0.55;
    const holePath = new Path();

    holePath.moveTo(-holeHalfWidth, holeCenterY - holeHalfHeight);
    holePath.lineTo(holeHalfWidth, holeCenterY - holeHalfHeight);
    holePath.lineTo(holeHalfWidth, holeCenterY + holeHalfHeight);
    holePath.lineTo(-holeHalfWidth, holeCenterY + holeHalfHeight);
    holePath.lineTo(-holeHalfWidth, holeCenterY - holeHalfHeight);
    wallShape.holes.push(holePath);

    return new ShapeGeometry(wallShape);
  }, [doorPanelHeight, doorPanelWidth]);

  const isPainted = isHovered || isFocused || isOpening;

  useCursorLock(isHovered || isFocused || isOpening);

  useEffect(() => {
    yawRef.current = baseYaw;
    if (rootRef.current) {
      rootRef.current.rotation.y = baseYaw;
    }
  }, [baseYaw]);

  useEffect(() => {
    if (isOpening || isRoomExiting) {
      return;
    }

    if (!leafRef.current) {
      return;
    }

    gsap.to(leafRef.current.rotation, {
      duration: 0.24,
      ease: 'power2.out',
      y: 0,
      overwrite: true,
    });

    gsap.to(handleRef.current?.rotation ?? {}, {
      duration: 0.18,
      ease: 'power2.out',
      z: 0,
      overwrite: true,
    });

    if (paintedRef.current?.material && 'opacity' in paintedRef.current.material) {
      gsap.to(paintedRef.current.material, {
        duration: isPainted ? 0.8 : 0.5,
        ease: 'power2.out',
        opacity: isPainted ? 1 : 0,
      });
    }

    if (sketchRef.current?.material && 'opacity' in sketchRef.current.material) {
      gsap.to(sketchRef.current.material, {
        duration: isPainted ? 0.55 : 0.4,
        ease: 'power2.out',
        opacity: isPainted ? 0 : 1,
      });
    }

    if (
      paintedHandleRef.current?.material &&
      'opacity' in paintedHandleRef.current.material
    ) {
      gsap.to(paintedHandleRef.current.material, {
        duration: isPainted ? 0.8 : 0.5,
        ease: 'power2.out',
        opacity: isPainted ? 1 : 0,
      });
    }

    if (
      sketchHandleRef.current?.material &&
      'opacity' in sketchHandleRef.current.material
    ) {
      gsap.to(sketchHandleRef.current.material, {
        duration: isPainted ? 0.5 : 0.35,
        ease: 'power2.out',
        opacity: isPainted ? 0 : 1,
      });
    }
  }, [handleDirection, isPainted]);

  useEffect(() => {
    if (!isRoomExiting) {
      return;
    }

    if (leafRef.current) {
      leafRef.current.rotation.y = handleDirection * (Math.PI * 0.6);
    }
    if (handleRef.current) {
      handleRef.current.rotation.z = handleDirection * 0.4;
    }

    gsap.to(handleRef.current?.rotation ?? {}, {
      z: 0,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: true,
    });
    gsap.to(leafRef.current?.rotation ?? {}, {
      y: 0,
      duration: 0.55,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: () => {
        setIsOpening(false);
      },
    });
  }, [isRoomExiting, handleDirection]);

  useFrame(() => {
    if (!rootRef.current || isOpening) {
      return;
    }

    let targetYaw = baseYaw;

    if (isFocused) {
      targetYaw = hoverYaw;
    } else {
      const distance = Math.abs(camera.position.z - doorRootZ);

      if (
        distance < corridorDoorHoverDistanceFar &&
        distance > corridorDoorHoverDistanceNear
      ) {
        const progress =
          (corridorDoorHoverDistanceFar - distance) /
          (corridorDoorHoverDistanceFar - corridorDoorHoverDistanceNear);
        const eased = progress * (2 - progress);
        targetYaw = MathUtils.lerp(baseYaw, hoverYaw, eased);
      } else if (distance <= corridorDoorHoverDistanceNear) {
        targetYaw = hoverYaw;
      }
    }

    yawRef.current = MathUtils.lerp(yawRef.current, targetYaw, 0.06);
    rootRef.current.rotation.y = yawRef.current;

    const sinY = Math.abs(Math.sin(yawRef.current));
    const scaleX =
      sinY > 0.1
        ? MathUtils.clamp(
            (corridorDoorApproachRunZ - 0.01) / (corridorDoorBayWidth * sinY),
            0.8,
            1.1,
          )
        : 1;

    rootRef.current.scale.set(scaleX, 1, 1);
  });

  const handleOpen = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();

      if (isOpening) {
        return;
      }

      const shouldEnter = onActivate(door);

      if (!shouldEnter) {
        return;
      }

      setIsOpening(true);
      setIsHovered(false);

      const timeline = gsap.timeline({
        onComplete: () => {
          onOpen(door.id);
        },
      });

      timeline.to(handleRef.current?.rotation ?? {}, {
        z: handleDirection * 0.4,
        duration: 0.15,
        ease: 'power2.out',
      });
      timeline.to(
        leafRef.current?.rotation ?? {},
        {
          y: handleDirection * (Math.PI * 0.6),
          duration: 0.55,
          ease: 'power2.out',
        },
        0.08,
      );
    },
    [door, handleDirection, isOpening, onActivate, onOpen],
  );

  return (
    <group
      position={[
        door.side === 'left' ? -corridorDoorWallRootX : corridorDoorWallRootX,
        0,
        doorRootZ,
      ]}
    >
      <group ref={rootRef}>
        <mesh position={[wallInsetX, 0, 0]} geometry={wallGeometry}>
          <meshBasicMaterial
            color="#e0e0e0"
            map={wallTextureClone}
            side={2}
            transparent
          />
        </mesh>

        <mesh position={[wallInsetX - 1.4 * handleDirection, -(corridorHeight / 2) + 0.075, 0.02]}>
          <planeGeometry args={[(corridorDoorBayWidth - 1.1) / 2, 0.15]} />
          <meshBasicMaterial color="#e0e0e0" map={sideTrimTexture} side={2} />
        </mesh>
        <mesh position={[wallInsetX + 1.4 * handleDirection, -(corridorHeight / 2) + 0.075, 0.02]}>
          <planeGeometry args={[(corridorDoorBayWidth - 1.1) / 2, 0.15]} />
          <meshBasicMaterial color="#e0e0e0" map={sideTrimTexture} side={2} />
        </mesh>
        <mesh
          position={[wallInsetX, -(corridorHeight / 2) + 0.005, 0.02]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1.1, 0.15]} />
          <meshBasicMaterial color="#e0e0e0" map={thresholdTrimTexture} side={2} />
        </mesh>

        <group position={[wallInsetX, -0.4, 0]}>
          <group position={[0, doorPanelHeight / 2 + 0.45, 0.08]}>
            <mesh>
              <planeGeometry args={[1.3, 0.65]} />
              <meshBasicMaterial
                color="#e0e0e0"
                map={plaqueTexture}
                transparent
                alphaTest={0.1}
              />
            </mesh>
            {plaqueLines.map((line, index) => {
              const offset = plaqueLines.length === 1 ? 0 : index === 0 ? 0.12 : -0.12;

              return (
                <Text
                  key={`${door.id}-${line}`}
                  anchorX="center"
                  anchorY="middle"
                  color="#111111"
                  font={corridorDoorLabelFont}
                  fontSize={line.length > 10 ? 0.14 : 0.18}
                  maxWidth={1}
                  position={[0, offset, 0.01]}
                  textAlign="center"
                >
                  {line}
                </Text>
              );
            })}
          </group>

          <mesh position={[0, -0.1, 0.04]} scale={[door.side === 'right' ? -1 : 1, 1, 1]}>
            <planeGeometry args={[frameWidth, frameHeight]} />
            <meshBasicMaterial map={frameTexture} transparent alphaTest={0.05} />
          </mesh>

          <group ref={leafRef} position={[leafAnchorX, 0, 0.01]}>
            <mesh
              position={[leafPlaneX, -0.2, 0.005]}
              onClick={handleOpen}
              onPointerEnter={() => {
                if (!isOpening) {
                  setIsHovered(true);
                }
              }}
              onPointerLeave={() => {
                if (!isOpening) {
                  setIsHovered(false);
                }
              }}
            >
              <planeGeometry args={[doorPanelWidth, doorPanelHeight]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <mesh
              ref={paintedRef}
              position={[leafPlaneX, -0.2, -0.001]}
              scale={[doorTextureScaleX, 1, 1]}
            >
              <planeGeometry args={[doorPanelWidth, doorPanelHeight]} />
              <meshBasicMaterial
                map={paintedTexture}
                transparent
                alphaTest={0.05}
                depthWrite={false}
                opacity={0}
              />
            </mesh>
            <mesh
              ref={sketchRef}
              position={[leafPlaneX, -0.2, 0]}
              scale={[doorTextureScaleX, 1, 1]}
            >
              <planeGeometry args={[doorPanelWidth, doorPanelHeight]} />
              <meshBasicMaterial
                map={baseTexture}
                transparent
                alphaTest={0.05}
                depthWrite={false}
                opacity={1}
              />
            </mesh>
            <mesh
              position={[leafPlaneX, -0.2, -0.01]}
              rotation={[0, Math.PI, 0]}
              scale={[-handleDirection, 1, 1]}
            >
              <planeGeometry args={[doorPanelWidth, doorPanelHeight]} />
              <meshBasicMaterial
                map={backTexture}
                transparent
                alphaTest={0.05}
                side={2}
              />
            </mesh>
            <group ref={handleRef} position={[handleOffsetX, -0.29, 0.03]}>
              <mesh
                ref={paintedHandleRef}
                position={[handleDirection === 1 ? -0.5 : 0.5, 0.14, -0.001]}
                scale={[handleDirection === -1 ? -1 : 1, 1, 1]}
              >
                <planeGeometry args={[doorPanelWidth, doorPanelHeight]} />
                <meshBasicMaterial
                  map={handlePaintedTexture}
                  transparent
                  alphaTest={0.05}
                  depthWrite={false}
                  opacity={0}
                />
              </mesh>
              <mesh
                ref={sketchHandleRef}
                position={[handleDirection === 1 ? -0.5 : 0.5, 0.14, 0]}
                scale={[handleDirection === -1 ? -1 : 1, 1, 1]}
              >
                <planeGeometry args={[doorPanelWidth, doorPanelHeight]} />
                <meshBasicMaterial
                  map={handleTexture}
                  transparent
                  alphaTest={0.05}
                  depthWrite={false}
                  opacity={1}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function CorridorRepeatedPlane({
  baseTexture,
  color = '#e0e0e0',
  opacity = 1,
  position,
  repeat,
  rotation,
  size,
}: {
  baseTexture: Texture;
  color?: string;
  opacity?: number;
  position?: [number, number, number];
  repeat: [number, number];
  rotation?: [number, number, number];
  size: [number, number];
}) {
  const texture = useMemo(() => {
    const clone = baseTexture.clone();
    clone.needsUpdate = true;
    clone.wrapS = RepeatWrapping;
    clone.wrapT = RepeatWrapping;
    clone.repeat.set(repeat[0], repeat[1]);
    return clone;
  }, [baseTexture, repeat]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        color={color}
        map={texture}
        transparent
        opacity={opacity}
        side={2}
      />
    </mesh>
  );
}

function CorridorAvatar() {
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const frameStateRef = useRef({
    frameIndex: 0,
    isReversing: false,
  });
  const frameTimerRef = useRef(0);
  const driftRef = useRef(0);
  const frames = useTexture(
    Array.from({ length: 9 }, (_, index) =>
      asset(`/textures/corridor/avatar_anim/${index + 1}.webp`),
    ),
  );

  const planeSize = useMemo(() => {
    const image = frames[0]?.image as
      | { width?: number; height?: number }
      | undefined;

    if (image?.width && image.height) {
      const height = 2.3;
      return [height * (image.width / image.height), height] as const;
    }

    return [2.3, 2.3] as const;
  }, [frames]);

  useEffect(() => {
    frames.forEach((texture) => {
      texture.needsUpdate = true;
    });

    const material = meshRef.current?.material as
      | {
          map?: Texture | null;
          needsUpdate?: boolean;
        }
      | undefined;

    if (material) {
      material.map = frames[0] ?? null;
      material.needsUpdate = true;
    }
  }, [frames]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetOffset = getCorridorAvatarTargetOffset(
        camera.position.z - corridorAvatarBasePosition.z,
      );
      driftRef.current = MathUtils.lerp(driftRef.current, targetOffset, 0.08);
      groupRef.current.position.x = corridorAvatarBasePosition.x + driftRef.current;
      groupRef.current.position.y = corridorAvatarBasePosition.y;
    }

    frameTimerRef.current += delta;

    if (frameTimerRef.current < 1 / 20) {
      return;
    }

    frameTimerRef.current = 0;
    frameStateRef.current = advanceCorridorAvatarFrame(frameStateRef.current, frames.length);

    const material = meshRef.current?.material as
      | {
          map?: Texture | null;
          needsUpdate?: boolean;
        }
      | undefined;

    if (material) {
      material.map = frames[frameStateRef.current.frameIndex] ?? frames[0] ?? null;
      material.needsUpdate = true;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[
        corridorAvatarBasePosition.x,
        corridorAvatarBasePosition.y,
        corridorAvatarBasePosition.z,
      ]}
    >
      <mesh ref={meshRef}>
        <planeGeometry args={planeSize} />
        <meshBasicMaterial transparent alphaTest={0.01} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CorridorDenTitle() {
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);
  const driftRef = useRef(0);
  const leftWordRef = useRef<Mesh>(null);
  const rightWordRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }

    const targetOffset = getCorridorDenTargetOffset(
      camera.position.z - corridorAvatarBasePosition.z,
    );
    driftRef.current = MathUtils.lerp(driftRef.current, targetOffset, 0.08);
    groupRef.current.position.x = corridorAvatarBasePosition.x + driftRef.current;

    const spread = Math.abs(driftRef.current) * 0.24;
    if (leftWordRef.current) {
      leftWordRef.current.position.x = MathUtils.lerp(
        leftWordRef.current.position.x,
        -1.22 - spread,
        0.12,
      );
    }
    if (rightWordRef.current) {
      rightWordRef.current.position.x = MathUtils.lerp(
        rightWordRef.current.position.x,
        1.02 + spread,
        0.12,
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={[corridorAvatarBasePosition.x, -0.08, corridorAvatarBasePosition.z - 0.3]}
    >
      <Text
        ref={leftWordRef}
        anchorX="center"
        anchorY="middle"
        color="#2f2b24"
        font={corridorDoorLabelFont}
        fontSize={0.34}
        maxWidth={2.3}
        position={[-1.22, 0, 0]}
        textAlign="center"
      >
        Danish&apos;s
      </Text>
      <Text
        ref={rightWordRef}
        anchorX="center"
        anchorY="middle"
        color="#2f2b24"
        font={corridorDoorLabelFont}
        fontSize={0.38}
        maxWidth={1.8}
        position={[1.02, 0, 0]}
        textAlign="center"
      >
        Den
      </Text>
    </group>
  );
}

function CorridorPhotoFrame({
  side,
  x,
  y,
  z,
  rotationY,
  frameWidth,
  frameHeight,
  artWidth,
  artHeight,
  sketchFrameTex,
  paintedFrameTex,
  sketchArtTex,
  paintedArtTex,
}: {
  side: 'left' | 'right';
  x: number;
  y: number;
  z: number;
  rotationY: number;
  frameWidth: number;
  frameHeight: number;
  artWidth: number;
  artHeight: number;
  sketchFrameTex: Texture;
  paintedFrameTex: Texture;
  sketchArtTex: Texture;
  paintedArtTex: Texture;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const sketchFrameRef = useRef<Mesh>(null);
  const paintedFrameRef = useRef<Mesh>(null);
  const sketchArtRef = useRef<Mesh>(null);
  const paintedArtRef = useRef<Mesh>(null);

  useCursorLock(isHovered);

  useEffect(() => {
    const isPainted = isHovered;

    if (paintedFrameRef.current?.material && 'opacity' in paintedFrameRef.current.material) {
      gsap.to(paintedFrameRef.current.material, {
        duration: isPainted ? 0.8 : 0.5,
        ease: 'power2.out',
        opacity: isPainted ? 1 : 0,
      });
    }
    if (sketchFrameRef.current?.material && 'opacity' in sketchFrameRef.current.material) {
      gsap.to(sketchFrameRef.current.material, {
        duration: isPainted ? 0.55 : 0.4,
        ease: 'power2.out',
        opacity: isPainted ? 0 : 1,
      });
    }

    if (paintedArtRef.current?.material && 'opacity' in paintedArtRef.current.material) {
      gsap.to(paintedArtRef.current.material, {
        duration: isPainted ? 0.8 : 0.5,
        ease: 'power2.out',
        opacity: isPainted ? 1 : 0,
      });
    }
    if (sketchArtRef.current?.material && 'opacity' in sketchArtRef.current.material) {
      gsap.to(sketchArtRef.current.material, {
        duration: isPainted ? 0.55 : 0.4,
        ease: 'power2.out',
        opacity: isPainted ? 0 : 1,
      });
    }
  }, [isHovered]);

  return (
    <group
      position={[x, y, z]}
      rotation={[0, rotationY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
    >
      {/* Sketch Frame */}
      <mesh ref={sketchFrameRef}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshBasicMaterial
          color="#e0e0e0"
          map={sketchFrameTex}
          transparent
          alphaTest={0.05}
        />
      </mesh>
      {/* Painted Frame */}
      <mesh ref={paintedFrameRef}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshBasicMaterial
          color="#ffffff"
          map={paintedFrameTex}
          transparent
          alphaTest={0.05}
          opacity={0}
        />
      </mesh>

      {/* Sketch Art */}
      <mesh
        ref={sketchArtRef}
        position={[0, 0, 0.01]}
        scale={[side === 'left' ? -1 : 1, 1, 1]}
      >
        <planeGeometry args={[artWidth, artHeight]} />
        <meshBasicMaterial
          color="#e0e0e0"
          map={sketchArtTex}
          transparent
          alphaTest={0.05}
        />
      </mesh>
      {/* Painted Art */}
      <mesh
        ref={paintedArtRef}
        position={[0, 0, 0.02]}
        scale={[side === 'left' ? -1 : 1, 1, 1]}
      >
        <planeGeometry args={[artWidth, artHeight]} />
        <meshBasicMaterial
          color="#ffffff"
          map={paintedArtTex}
          transparent
          alphaTest={0.05}
          opacity={0}
        />
      </mesh>
    </group>
  );
}

function CorridorSmallFrame({
  position,
  rotation,
  sketchFrameTex,
  paintedFrameTex,
  rysunekTex,
  flipArt = false,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  sketchFrameTex: Texture;
  paintedFrameTex: Texture;
  rysunekTex: Texture;
  flipArt?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const sketchFrameRef = useRef<Mesh>(null);
  const paintedFrameRef = useRef<Mesh>(null);
  const sketchArtRef = useRef<Mesh>(null);

  useCursorLock(isHovered);

  useEffect(() => {
    const isPainted = isHovered;

    if (paintedFrameRef.current?.material && 'opacity' in paintedFrameRef.current.material) {
      gsap.to(paintedFrameRef.current.material, {
        duration: isPainted ? 0.8 : 0.5,
        ease: 'power2.out',
        opacity: isPainted ? 1 : 0,
      });
    }
    if (sketchFrameRef.current?.material && 'opacity' in sketchFrameRef.current.material) {
      gsap.to(sketchFrameRef.current.material, {
        duration: isPainted ? 0.55 : 0.4,
        ease: 'power2.out',
        opacity: isPainted ? 0 : 1,
      });
    }
    if (sketchArtRef.current?.material && 'color' in sketchArtRef.current.material) {
      gsap.to((sketchArtRef.current.material as any).color, {
        duration: isPainted ? 0.8 : 0.5,
        r: isPainted ? 0.0 : 0.54,
        g: isPainted ? 0.0 : 0.51,
        b: isPainted ? 0.0 : 0.46,
      });
    }
  }, [isHovered]);

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
    >
      {/* Sketch Frame */}
      <mesh ref={sketchFrameRef}>
        <planeGeometry args={[0.3, 0.3 / 0.758]} />
        <meshBasicMaterial
          color="#e0e0e0"
          map={sketchFrameTex}
          transparent
          alphaTest={0.05}
          side={2}
        />
      </mesh>
      {/* Painted Frame */}
      <mesh ref={paintedFrameRef}>
        <planeGeometry args={[0.3, 0.3 / 0.758]} />
        <meshBasicMaterial
          color="#ffffff"
          map={paintedFrameTex}
          transparent
          alphaTest={0.05}
          opacity={0}
          side={2}
        />
      </mesh>
      {/* Drawing inside frame */}
      <mesh
        ref={sketchArtRef}
        position={[0, 0, 0.005]}
        scale={[flipArt ? -1 : 1, 1, 1]}
      >
        <planeGeometry args={[0.18, 0.36]} />
        <meshBasicMaterial
          color="#8a8275"
          map={rysunekTex}
          transparent
          alphaTest={0.05}
          side={2}
        />
      </mesh>
    </group>
  );
}

function CorridorDecorSet({ segmentStartZ }: { segmentStartZ: number }) {

  const frameTexture = useTexture(asset('/textures/corridor/ramkanazdjecieduza.webp'));
  const framePaintedTexture = useTexture(asset('/textures/corridor/ramkanazdjecieduza_painted.webp'));
  const smallFrameTexture = useTexture(asset('/textures/corridor/ramkanazdjeciemala.webp'));
  const smallFramePaintedTexture = useTexture(asset('/textures/corridor/ramkanazdjeciemala_painted.webp'));
  
  const aandolanTex = useTexture(asset('/textures/studio/Aandolan.png'));
  const aandolanPaintedTex = useTexture(asset('/textures/studio/Aandolan_painted.jpg'));
  const illustrationTex = useTexture(asset('/textures/studio/Illustration.png'));
  const illustrationPaintedTex = useTexture(asset('/textures/studio/Illustration_painted.jpg'));
  const tedxTex = useTexture(asset('/textures/studio/TedX.png'));
  const tedxPaintedTex = useTexture(asset('/textures/studio/TedX_painted.jpg'));
  const naalayakTex = useTexture(asset('/textures/studio/Naalayak.png'));
  const naalayakPaintedTex = useTexture(asset('/textures/studio/Naalayak_painted.jpg'));
  
  const rysunekTex = useTexture(asset('/textures/corridor/rysuneknaobraz1.webp'));
  const duckTex = useTexture(asset('/textures/entrance/pot_with_duck.webp'));

  const wallX = corridorWidth / 2 - 0.01;
  const floorY = -corridorHeight / 2;
  const ceilingY = corridorHeight / 2;

  const artTextureMap = {
    aandolan: aandolanTex,
    illustration: illustrationTex,
    tedx: tedxTex,
    naalayak: naalayakTex,
  };

  const artPaintedTextureMap = {
    aandolan: aandolanPaintedTex,
    illustration: illustrationPaintedTex,
    tedx: tedxPaintedTex,
    naalayak: naalayakPaintedTex,
  };

  const lightZs = useMemo(() => {
    const lights: number[] = [];
    const segmentEnd = segmentStartZ - corridorSegmentLength + 10;

    for (let z = segmentStartZ - 5; z > segmentEnd; z -= 15) {
      lights.push(z);
    }

    return lights;
  }, [segmentStartZ]);

  const frameConfigs = useMemo(
    () => [
      {
        id: 'frame-1',
        side: 'right' as const,
        z: segmentStartZ - 10,
        y: 0.0,
        isPortrait: false,
        artWidth: 1.6,
        artHeight: 0.9,
        artTextureKey: 'aandolan' as const,
      },
      {
        id: 'frame-2',
        side: 'left' as const,
        z: segmentStartZ - 21,
        y: 0.0,
        isPortrait: true,
        artWidth: 0.95,
        artHeight: 1.7,
        artTextureKey: 'illustration' as const,
      },
      {
        id: 'frame-3',
        side: 'right' as const,
        z: segmentStartZ - 35,
        y: 0.0,
        isPortrait: true,
        artWidth: 0.95,
        artHeight: 1.7,
        artTextureKey: 'tedx' as const,
      },
      {
        id: 'frame-4',
        side: 'left' as const,
        z: segmentStartZ - 51,
        y: 0.0,
        isPortrait: true,
        artWidth: 0.95,
        artHeight: 1.7,
        artTextureKey: 'naalayak' as const,
      },
    ],
    [segmentStartZ],
  );

  return (
    <group>
      {lightZs.map((z) => (
        <group key={`light-${z}`} position={[0, ceilingY, z]}>
          <mesh position={[0, -0.03, 0]}>
            <boxGeometry args={[2, 0.06, 0.5]} />
            <meshStandardMaterial color="#e8e8e8" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.059, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.9, 0.4]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} side={2} />
          </mesh>
        </group>
      ))}

      {frameConfigs.map((frame) => {
        const x = frame.side === 'left' ? -wallX + 0.1 : wallX - 0.1;
        const rotationY = frame.side === 'left' ? Math.PI / 2 : -Math.PI / 2;
        const frameWidth = frame.isPortrait ? 1.25 : 2.5;
        const frameHeight = frame.isPortrait ? 2.5 : 2.5 / 1.785;
        const sketchFrameTex = frame.isPortrait ? smallFrameTexture : frameTexture;
        const paintedFrameTex = frame.isPortrait ? smallFramePaintedTexture : framePaintedTexture;
        const sketchArtTex = artTextureMap[frame.artTextureKey];
        const paintedArtTex = artPaintedTextureMap[frame.artTextureKey];

        return (
          <CorridorPhotoFrame
            key={frame.id}
            side={frame.side}
            x={x}
            y={frame.y}
            z={frame.z}
            rotationY={rotationY}
            frameWidth={frameWidth}
            frameHeight={frameHeight}
            artWidth={frame.artWidth}
            artHeight={frame.artHeight}
            sketchFrameTex={sketchFrameTex}
            paintedFrameTex={paintedFrameTex}
            sketchArtTex={sketchArtTex}
            paintedArtTex={paintedArtTex}
          />
        );
      })}

      {/* Table */}
      <group position={[-wallX + 0.42, floorY, segmentStartZ - 35]} rotation={[0, Math.PI / 2, 0]}>
        {[
          [-0.9, -0.3],
          [0.9, -0.3],
          [-0.9, 0.3],
          [0.9, 0.3],
        ].map(([lx, lz], index) => (
          <mesh key={`table-leg-${index}`} position={[lx, 0.5, lz]}>
            <boxGeometry args={[0.16, 1, 0.16]} />
            <meshStandardMaterial color="#d8d0c1" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 1.04, 0]}>
          <boxGeometry args={[2, 0.08, 0.8]} />
          <meshStandardMaterial color="#e8dfd0" roughness={0.7} />
        </mesh>
        <CorridorSmallFrame
          position={[-0.4, 1.28, 0]}
          rotation={[0, -Math.PI / 4, 0]}
          sketchFrameTex={smallFrameTexture}
          paintedFrameTex={smallFramePaintedTexture}
          rysunekTex={rysunekTex}
        />
      </group>

      {/* Pedestal / Box */}
      <group position={[wallX - 0.26, floorY + 0.5, segmentStartZ - 51]}>
        <mesh>
          <boxGeometry args={[0.5, 1, 0.8]} />
          <meshStandardMaterial color="#e2d8c8" roughness={0.8} />
        </mesh>
        <CorridorSmallFrame
          position={[0, 0.7, 0.09]}
          rotation={[0, -Math.PI / 2 + 0.2, 0]}
          sketchFrameTex={smallFrameTexture}
          paintedFrameTex={smallFramePaintedTexture}
          rysunekTex={rysunekTex}
          flipArt={true}
        />
      </group>
    </group>
  );
}

function CorridorSegmentShell({
  segmentIndex,
  ceilingTexture,
  floorTexture,
  segmentDoors,
  trimTexture,
  wallTexture,
}: {
  segmentIndex: number;
  ceilingTexture: Texture;
  floorTexture: Texture;
  segmentDoors: CorridorDoorSlot[];
  trimTexture: Texture;
  wallTexture: Texture;
}) {
  const segmentStartZ = 10 - segmentIndex * corridorSegmentLength;
  const segmentCenterZ = segmentStartZ - corridorSegmentLength / 2;
  const segmentEndZ = segmentStartZ - corridorSegmentLength;
  const wallFillers = useMemo(
    () => [
      ...buildCorridorWallFillers(
        'left',
        segmentDoors,
        segmentStartZ,
        corridorSegmentLength,
      ),
      ...buildCorridorWallFillers(
        'right',
        segmentDoors,
        segmentStartZ,
        corridorSegmentLength,
      ),
    ],
    [segmentDoors, segmentStartZ],
  );
  const floorTileCenters = useMemo(() => {
    const centers: number[] = [];
    let z = Math.floor(segmentStartZ / 10) * 10 - 3;

    while (z + 5 > segmentEndZ) {
      centers.push(z);
      z -= 10;
    }

    return centers;
  }, [segmentEndZ, segmentStartZ]);
  const floorLeftTexture = useMemo(() => {
    const clone = floorTexture.clone();
    clone.needsUpdate = true;
    clone.repeat.set(1, 0.2);
    clone.offset.set(0, 0);
    return clone;
  }, [floorTexture]);
  const floorRightTexture = useMemo(() => {
    const clone = floorTexture.clone();
    clone.needsUpdate = true;
    clone.repeat.set(1, 0.2);
    clone.offset.set(0, 0.8);
    return clone;
  }, [floorTexture]);
  const ceilingTileTexture = useMemo(() => {
    const clone = ceilingTexture.clone();
    clone.needsUpdate = true;
    clone.wrapS = RepeatWrapping;
    clone.wrapT = RepeatWrapping;
    clone.repeat.set(corridorWidth / 2, 10 / 2);
    return clone;
  }, [ceilingTexture]);

  return (
    <group>
      {floorTileCenters.map((z, index) => {
        const flip = Math.abs(Math.round(z / 10)) % 2 === 1;
        const rotationZ = Math.PI / 2 + (flip ? Math.PI : 0);
        const scaleX = flip ? -1 : 1;

        return (
          <group key={`${segmentIndex}-floor-${z}-${index}`}>
            <mesh
              position={[0, -1.75, z]}
              rotation={[-Math.PI / 2, 0, rotationZ]}
              scale={[scaleX, 1, 1]}
            >
              <planeGeometry args={[10, 5]} />
              <meshBasicMaterial
                map={floorTexture}
                color="#e0e0e0"
                transparent
                alphaTest={0.1}
                side={2}
              />
            </mesh>
            <mesh
              position={[-3, -1.75, z]}
              rotation={[-Math.PI / 2, 0, rotationZ]}
              scale={[scaleX, 1, 1]}
            >
              <planeGeometry args={[10, 1]} />
              <meshBasicMaterial
                map={floorLeftTexture}
                color="#e0e0e0"
                transparent
                alphaTest={0.1}
                side={2}
              />
            </mesh>
            <mesh
              position={[3, -1.75, z]}
              rotation={[-Math.PI / 2, 0, rotationZ]}
              scale={[scaleX, 1, 1]}
            >
              <planeGeometry args={[10, 1]} />
              <meshBasicMaterial
                map={floorRightTexture}
                color="#e0e0e0"
                transparent
                alphaTest={0.1}
                side={2}
              />
            </mesh>
            <mesh
              position={[0, 1.75, z]}
              rotation={[Math.PI / 2, 0, flip ? Math.PI : 0]}
              scale={[flip ? -1 : 1, 1, 1]}
            >
              <planeGeometry args={[corridorWidth, 10]} />
              <meshBasicMaterial
                map={ceilingTileTexture}
                color="#e0e0e0"
                transparent
                opacity={0.68}
                side={2}
              />
            </mesh>
          </group>
        );
      })}

      {wallFillers.map((filler, index) => (
        <group
          key={`${segmentIndex}-${filler.side}-${filler.z}-${index}`}
          position={[filler.x, 0, filler.z]}
          rotation={[0, filler.side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          <CorridorRepeatedPlane
            baseTexture={wallTexture}
            repeat={[filler.width / 2, corridorHeight / 2]}
            size={[filler.width, corridorHeight]}
          />
          <CorridorRepeatedPlane
            baseTexture={trimTexture}
            position={[0, -(corridorHeight / 2) + 0.075, 0.01]}
            repeat={[filler.width / corridorTrimUnit, 1]}
            size={[filler.width, 0.15]}
          />
        </group>
      ))}

      {segmentIndex === 0 ? (
        <group>
          <Text
            position={[0, -1.74, 6.2]}
            rotation={[-Math.PI / 2, 0, 0]}
            font="/fonts/CabinSketch-Bold.ttf"
            fontSize={0.32}
            color="#5c5647"
            maxWidth={5}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
          >
            SCROLL OR USE ARROWS TO WALK
          </Text>
          <Text
            position={[0, -1.74, 5.3]}
            rotation={[-Math.PI / 2, 0, 0]}
            font="/fonts/CabinSketch-Bold.ttf"
            fontSize={0.45}
            color="#5c5647"
            anchorX="center"
            anchorY="middle"
          >
            ▼
          </Text>
        </group>
      ) : null}

      <CorridorDecorSet segmentStartZ={segmentStartZ} />
    </group>
  );
}

function CorridorNavigator({
  activeRoom,
  exitingRoomId,
  focusedDoor,
  setFocusedDoor,
  onOpenRoom,
  onExplore,
  onRoomExitComplete,
}: {
  activeRoom: RoomId | null;
  exitingRoomId: RoomId | null;
  focusedDoor: CorridorFocusedDoor | null;
  setFocusedDoor: (door: CorridorFocusedDoor | null) => void;
  onOpenRoom: (roomId: RoomId) => void;
  onExplore: () => void;
  onRoomExitComplete: () => void;
}) {
  const { camera } = useThree();
  const targetZ = useRef(
    exitingRoomId && focusedDoor
      ? getCorridorDoorPreviewTarget(focusedDoor).z
      : corridorCameraStartZ,
  );
  const targetParallax = useRef(new Vector3());
  const parallax = useRef(new Vector3());
  const extraTurn = useRef(0);
  const glanceBias = useRef(0);
  const scrollEnabled = activeRoom === null && focusedDoor === null;
  const [visibleSegments, setVisibleSegments] = useState(() =>
    getVisibleCorridorSegments(
      exitingRoomId && focusedDoor ? focusedDoor.worldZ : corridorCameraStartZ,
      corridorSegmentLength,
    ),
  );
  const currentSegment = useRef(
    getCorridorSegmentIndex(
      exitingRoomId && focusedDoor ? focusedDoor.worldZ : corridorCameraStartZ,
      corridorSegmentLength,
    ),
  );
  const exitCompletionRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    if (exitingRoomId && focusedDoor) {
      const startX = focusedDoor.side === 'left' ? -2.3 : 2.3;
      camera.position.set(startX, 0.2, focusedDoor.worldZ);
      const previewRotationY = getCorridorDoorPreviewRotationY(focusedDoor);
      camera.rotation.set(0, previewRotationY, 0);
    } else {
      camera.position.set(0, 0.2, corridorCameraStartZ);
      camera.lookAt(0, 0.13, corridorCameraStartZ - 10);
    }
  }, [camera, exitingRoomId, focusedDoor]);

  useEffect(() => {
    if (!exitingRoomId) {
      exitCompletionRef.current = false;
    }
  }, [exitingRoomId]);

  useEffect(() => {
    if (!scrollEnabled) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      targetZ.current -= event.deltaY * 0.025;
      if (targetZ.current < corridorCameraStartZ - 2) {
        onExplore();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      targetParallax.current.set(x * 0.4, -y * 0.2, 0);
    };

    let touchX = 0;
    let touchY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      touchX = event.touches[0]?.clientX ?? 0;
      touchY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const nextX = event.touches[0]?.clientX ?? touchX;
      const nextY = event.touches[0]?.clientY ?? touchY;
      targetZ.current -= (touchY - nextY) * 0.0375;
      extraTurn.current = clampCorridorTurn(
        extraTurn.current + (touchX - nextX) * 0.0015,
      );
      touchX = nextX;
      touchY = nextY;
      if (targetZ.current < corridorCameraStartZ - 2) {
        onExplore();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyDelta: Record<string, number> = {
        ArrowDown: 2.5,
        ArrowUp: -2.5,
        PageDown: 10,
        PageUp: -10,
        ' ': 5,
      };

      if (event.key in keyDelta) {
        event.preventDefault();
        targetZ.current -= keyDelta[event.key];
        if (targetZ.current < corridorCameraStartZ - 2) {
          onExplore();
        }
      }

      if (event.key === 'ArrowLeft') {
        extraTurn.current = clampCorridorTurn(extraTurn.current - 0.08);
      }

      if (event.key === 'ArrowRight') {
        extraTurn.current = clampCorridorTurn(extraTurn.current + 0.08);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExplore, scrollEnabled]);

  const wallTexture = useTexture(asset('/textures/corridor/wall_texture.webp'));
  const ceilingTexture = useTexture(asset('/textures/corridor/ceiling_texture.webp'));
  const floorTexture = useTexture(asset('/textures/corridor/kawalekpodlogi.webp'));
  const trimTexture = useTexture(asset('/textures/corridor/texturadoprogow.webp'));

  useEffect(() => {
    [wallTexture, ceilingTexture, trimTexture].forEach((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
    });
    ceilingTexture.repeat.set(corridorWidth / 2, corridorSegmentLength / 20);
  }, [ceilingTexture, trimTexture, wallTexture]);

  const repeatedDoors = useMemo<CorridorDoorInstance[]>(
    () =>
      visibleSegments.flatMap((segmentIndex) =>
        corridorDoorCards.map((door) => ({
          ...door,
          segmentIndex,
          worldZ: door.z - segmentIndex * corridorSegmentLength,
          texture: asset(door.texture),
          paintedTexture: asset(door.paintedTexture),
        })),
      ),
    [visibleSegments],
  );

  const repeatedDoorSlots = useMemo(
    () =>
      getRepeatedDoorInstances(
        corridorDoorCards.map((door) => ({ side: door.side, z: door.z })),
        visibleSegments,
        corridorSegmentLength,
      ),
    [visibleSegments],
  );

  const handleDoorActivate = useCallback(
    (door: CorridorDoorInstance) => {
      const nextFocusedDoor = {
        id: door.id,
        side: door.side,
        worldZ: door.worldZ,
      } satisfies CorridorFocusedDoor;

      const resolution = resolveCorridorDoorSelection(focusedDoor, nextFocusedDoor);
      setFocusedDoor(resolution.focusedDoor);

      return resolution.shouldEnter;
    },
    [focusedDoor, setFocusedDoor],
  );

  useFrame((_, delta) => {
    if (exitingRoomId && focusedDoor) {
      const previewTarget = getCorridorDoorPreviewTarget(focusedDoor);
      const previewRotationY = getCorridorDoorPreviewRotationY(focusedDoor);

      camera.position.x = MathUtils.lerp(
        camera.position.x,
        previewTarget.x,
        1 - Math.exp(-delta * 4.7),
      );
      camera.position.y = MathUtils.lerp(
        camera.position.y,
        0.2,
        1 - Math.exp(-delta * 4.7),
      );
      camera.position.z = MathUtils.lerp(
        camera.position.z,
        previewTarget.z,
        1 - Math.exp(-delta * 4.2),
      );

      const segmentIndex = getCorridorSegmentIndex(
        camera.position.z,
        corridorSegmentLength,
      );
      if (segmentIndex !== currentSegment.current) {
        currentSegment.current = segmentIndex;
        setVisibleSegments(
          getVisibleCorridorSegments(camera.position.z, corridorSegmentLength),
        );
      }

      camera.rotation.x = MathUtils.lerp(
        camera.rotation.x,
        0,
        1 - Math.exp(-delta * 4.7),
      );
      camera.rotation.y = MathUtils.lerp(
        camera.rotation.y,
        previewRotationY,
        1 - Math.exp(-delta * 4.7),
      );
      camera.rotation.z = MathUtils.lerp(
        camera.rotation.z,
        0,
        1 - Math.exp(-delta * 4.7),
      );

      const exitDistance = Math.abs(camera.position.z - previewTarget.z);
      const exitSideDistance = Math.abs(camera.position.x - previewTarget.x);

      if (
        exitDistance < 0.08 &&
        exitSideDistance < 0.08 &&
        !exitCompletionRef.current
      ) {
        exitCompletionRef.current = true;
        targetZ.current = previewTarget.z;
        targetParallax.current.set(0, 0, 0);
        parallax.current.set(0, 0, 0);
        extraTurn.current = 0;
        onRoomExitComplete();
      }

      return;
    }

    if (activeRoom && activeRoom !== 'tech-dorm' && activeRoom !== 'music-studio') {
      camera.position.lerp(new Vector3(0, 0.35, 8), 1 - Math.exp(-delta * 5));
      camera.lookAt(0, 0.1, -4);
      return;
    }

    if (focusedDoor) {
      const previewTarget = getCorridorDoorPreviewTarget(focusedDoor);
      const previewRotationY = getCorridorDoorPreviewRotationY(focusedDoor);

      camera.position.x = MathUtils.lerp(
        camera.position.x,
        previewTarget.x,
        1 - Math.exp(-delta * 5.2),
      );
      camera.position.y = MathUtils.lerp(
        camera.position.y,
        0.2,
        1 - Math.exp(-delta * 5.2),
      );
      camera.position.z = MathUtils.lerp(
        camera.position.z,
        previewTarget.z,
        1 - Math.exp(-delta * 4.6),
      );

      const segmentIndex = getCorridorSegmentIndex(
        camera.position.z,
        corridorSegmentLength,
      );
      if (segmentIndex !== currentSegment.current) {
        currentSegment.current = segmentIndex;
        setVisibleSegments(
          getVisibleCorridorSegments(camera.position.z, corridorSegmentLength),
        );
      }

      camera.rotation.x = MathUtils.lerp(
        camera.rotation.x,
        0,
        1 - Math.exp(-delta * 5.2),
      );
      camera.rotation.y = MathUtils.lerp(
        camera.rotation.y,
        previewRotationY,
        1 - Math.exp(-delta * 5.2),
      );
      camera.rotation.z = MathUtils.lerp(
        camera.rotation.z,
        0,
        1 - Math.exp(-delta * 5.2),
      );
      return;
    }

    parallax.current.lerp(targetParallax.current, 1 - Math.exp(-delta * 4.8));
    camera.position.z = MathUtils.lerp(
      camera.position.z,
      targetZ.current,
      1 - Math.exp(-delta * 6),
    );
    camera.position.x = MathUtils.lerp(
      camera.position.x,
      parallax.current.x,
      1 - Math.exp(-delta * 5.6),
    );
    camera.position.y = MathUtils.lerp(
      camera.position.y,
      0.2 + parallax.current.y,
      1 - Math.exp(-delta * 5.6),
    );

    const segmentIndex = getCorridorSegmentIndex(
      camera.position.z,
      corridorSegmentLength,
    );
    if (segmentIndex !== currentSegment.current) {
      currentSegment.current = segmentIndex;
      setVisibleSegments(
        getVisibleCorridorSegments(camera.position.z, corridorSegmentLength),
      );
    }

    const nextGlanceBias = getCorridorGlanceBias(
      camera.position.z,
      repeatedDoorSlots,
      0.15,
    );
    const glanceLerpSpeed =
      Math.abs(nextGlanceBias) < Math.abs(glanceBias.current) ? 0.08 : 0.03;
    glanceBias.current = MathUtils.lerp(
      glanceBias.current,
      nextGlanceBias,
      glanceLerpSpeed,
    );

    camera.lookAt(
      parallax.current.x * 0.3 + glanceBias.current * 3 + extraTurn.current * 4,
      0.13 + parallax.current.y,
      camera.position.z - 10,
    );
  });

  return (
    <group>
      {visibleSegments.map((segmentIndex) => (
        <CorridorSegmentShell
          key={segmentIndex}
          ceilingTexture={ceilingTexture}
          floorTexture={floorTexture}
          segmentDoors={repeatedDoors
            .filter((door) => door.segmentIndex === segmentIndex)
            .map((door) => ({ side: door.side, z: door.worldZ }))}
          segmentIndex={segmentIndex}
          trimTexture={trimTexture}
          wallTexture={wallTexture}
        />
      ))}

      <CorridorAvatar />
      <CorridorDenTitle />

      {repeatedDoors.map((door) => (
        <CorridorDoor3D
          key={`${door.id}-${door.segmentIndex}-${door.worldZ}`}
          door={door}
          isFocused={
            focusedDoor?.id === door.id &&
            focusedDoor.side === door.side &&
            focusedDoor.worldZ === door.worldZ
          }
          isRoomExiting={
            exitingRoomId === door.id &&
            focusedDoor?.id === door.id &&
            focusedDoor.side === door.side &&
            focusedDoor.worldZ === door.worldZ
          }
          onActivate={handleDoorActivate}
          onOpen={onOpenRoom}
        />
      ))}
    </group>
  );
}

function RoomBackdrop({ room }: { room: RoomDetail }) {
  const { camera } = useThree();
  const heroTexture = useTexture(room.hero);
  const wallTexture = useTexture(asset('/textures/corridor/wall_texture.webp'));
  const floorTexture = useTexture(asset('/textures/corridor/kawalekpodlogi.webp'));
  const backDoor = useTexture(asset('/textures/doors/door_back.webp'));

  wallTexture.wrapS = wallTexture.wrapT = 1000;
  floorTexture.wrapS = floorTexture.wrapT = 1000;
  wallTexture.repeat.set(5, 1);
  floorTexture.repeat.set(5, 5);

  useFrame((_, delta) => {
    camera.position.lerp(new Vector3(0, 0.35, 8), 1 - Math.exp(-delta * 5));
    camera.lookAt(0, 0.1, -4);
  });

  return (
    <group>
      <mesh position={[0, 0, -6]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial map={wallTexture} transparent />
      </mesh>
      <mesh position={[0, -2, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 16]} />
        <meshStandardMaterial map={floorTexture} color="#e0e0e0" transparent alphaTest={0.1} />
      </mesh>
      <mesh position={[-4.6, -0.25, -2.8]}>
        <planeGeometry args={[2.4, 4.2]} />
        <meshBasicMaterial map={backDoor} transparent alphaTest={0.05} />
      </mesh>
      <mesh position={[3.2, -0.2, -3.3]}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial map={heroTexture} transparent alphaTest={0.01} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.9, -5.8]}>
        <planeGeometry args={[8.6, 2.2]} />
        <meshBasicMaterial color="#fff9ee" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function ExperienceScene({
  bugSquashed,
  currentRoom,
  debugTip,
  exitingRoomId,
  mode,
  onAskDuck,
  onBugFixed,
  onEnterCorridor,
  onExplore,
  onOpenRoom,
  onRequestRoomExit,
  onRoomExitComplete,
  onToggleWindowGreeting,
  focusedDoor,
  setFocusedDoor,
  isTechDormExiting,
  isMusicStudioExiting,
  focusedDevice,
  onFocusDevice,
  onReady,
}: {
  bugSquashed: boolean;
  currentRoom: RoomId | null;
  debugTip: string | null;
  exitingRoomId: RoomId | null;
  mode: RuntimeMode;
  onAskDuck: () => void;
  onBugFixed: () => void;
  onEnterCorridor: () => void;
  onExplore: () => void;
  onOpenRoom: (roomId: RoomId) => void;
  onRequestRoomExit: () => void;
  onRoomExitComplete: () => void;
  onToggleWindowGreeting: (visible: boolean) => void;
  focusedDoor: CorridorFocusedDoor | null;
  setFocusedDoor: (door: CorridorFocusedDoor | null) => void;
  isTechDormExiting: boolean;
  isMusicStudioExiting: boolean;
  focusedDevice: MusicStudioItem | null;
  onFocusDevice: (item: MusicStudioItem | null) => void;
  onReady?: () => void;
}) {
  return (
    <>
      <color attach="background" args={['#faf7f0']} />
      <fog attach="fog" args={['#faf7f0', 12, 95]} />
      <ambientLight intensity={1.35} />
      <directionalLight intensity={2.2} position={[8, 10, 18]} />

      {mode === 'entrance' ? (
        <EntranceHouse
          bugSquashed={bugSquashed}
          debugTip={debugTip}
          onAskDuck={onAskDuck}
          onBugFixed={onBugFixed}
          onEnterCorridor={onEnterCorridor}
          onToggleWindowGreeting={onToggleWindowGreeting}
        />
      ) : null}

      {mode === 'corridor' && (!currentRoom || Boolean(exitingRoomId)) ? (
        <CorridorNavigator
          activeRoom={currentRoom}
          exitingRoomId={exitingRoomId}
          focusedDoor={focusedDoor}
          setFocusedDoor={setFocusedDoor}
          onExplore={onExplore}
          onOpenRoom={onOpenRoom}
          onRoomExitComplete={onRoomExitComplete}
        />
      ) : null}

      {currentRoom === 'tech-dorm' && !exitingRoomId ? (
        <TechDormGalleryRoom
          onRequestExit={onRequestRoomExit}
          triggerExit={isTechDormExiting}
          onReady={onReady}
        />
      ) : null}

      {currentRoom === 'music-studio' && !exitingRoomId ? (
        <MusicStudioRoom
          onRequestExit={onRequestRoomExit}
          triggerExit={isMusicStudioExiting}
          focusedDevice={focusedDevice}
          onFocusDevice={onFocusDevice}
          onReady={onReady}
        />
      ) : null}

      {currentRoom === 'experience' && !exitingRoomId ? (
        <AboutRoom
          onRequestExit={onRequestRoomExit}
          triggerExit={isTechDormExiting || isMusicStudioExiting} // Can add specific exiting state later
          onReady={onReady}
        />
      ) : null}

      {currentRoom && !exitingRoomId ? (
        currentRoom === 'tech-dorm' || currentRoom === 'music-studio' || currentRoom === 'experience' ? null : <RoomBackdrop room={roomDetails[currentRoom]} />
      ) : null}
    </>
  );
}

function RoomOverlay({
  room,
  onBack,
}: {
  room: RoomDetail;
  onBack: () => void;
}) {
  return (
    <div className="room-runtime-panel__shell">
      <section className={`room-runtime-panel ${room.accentClass}`}>
        <div className="room-runtime-panel__header">
          <div>
            <p className="overlay-card__eyebrow">{room.eyebrow}</p>
            <h2>{room.title}</h2>
          </div>
          <button
            type="button"
            className="itom-button room-runtime-panel__back"
            onClick={onBack}
          >
            Back to corridor
          </button>
        </div>

        <p className="room-runtime-panel__summary">{room.summary}</p>

        <div className="room-runtime-panel__chips">
          {room.chips.map((chip) => (
            <span key={chip} className="room-panel__chip">
              {chip}
            </span>
          ))}
        </div>

        <div className="room-runtime-panel__grid">
          <div className="room-runtime-panel__features">
            {room.features.map((feature) => (
              <article key={feature.title} className="room-runtime-panel__feature">
                <p className="room-panel__feature-title">{feature.title}</p>
                <p>{feature.detail}</p>
              </article>
            ))}
          </div>

          <div className="room-runtime-panel__notes">
            {room.notes.map((note) => (
              <div key={note} className="room-panel__note">
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function RouteMapOverlay({
  onClose,
  onSelectRoom,
}: {
  onClose: () => void;
  onSelectRoom: (roomId: RoomId) => void;
}) {
  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="map-title">
      <div className="overlay-card route-map-card">
        <div className="overlay-card__header">
          <div>
            <p className="overlay-card__eyebrow">Navigation</p>
            <h2 id="map-title">Corridor Map</h2>
          </div>
          <button type="button" className="itom-button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="route-map-shell">
          <img className="route-map-shell__base" src={asset('/images/map.webp')} alt="" />
          <img className="route-map-shell__pin-slot" src={asset('/images/pin-slot.webp')} alt="" />
          <img className="route-map-shell__pin" src={asset('/images/pin.webp')} alt="" />
          <button
            className="route-map-shell__zone route-map-shell__zone--tech-dorm"
            type="button"
            onClick={() => onSelectRoom('tech-dorm')}
          >
            Tech Dorm
          </button>
          <button
            className="route-map-shell__zone route-map-shell__zone--music-studio"
            type="button"
            onClick={() => onSelectRoom('music-studio')}
          >
            Music Studio
          </button>
          <button
            className="route-map-shell__zone route-map-shell__zone--experience"
            type="button"
            onClick={() => onSelectRoom('experience')}
          >
            Journey
          </button>
        </div>
      </div>
    </div>
  );
}

export function InspiredPortfolioRoute3D() {
  const setCurrentLocation = usePortfolioStore((state) => state.setCurrentLocation);
  const setWorldLoading = usePortfolioStore((state) => state.setWorldLoading);
  const [mode, setMode] = useState<RuntimeMode>('entrance');
  const [currentRoom, setCurrentRoom] = useState<RoomId | null>(null);
  const [exitingRoomId, setExitingRoomId] = useState<RoomId | null>(null);
  const [focusedDoor, setFocusedDoor] = useState<CorridorFocusedDoor | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'closing' | 'opening'>('idle');
  const [isTechDormExiting, setIsTechDormExiting] = useState(false);
  const [isMusicStudioExiting, setIsMusicStudioExiting] = useState(false);
  const [focusedDevice, setFocusedDevice] = useState<MusicStudioItem | null>(null);
  const transitionTimeoutsRef = useRef<number[]>([]);
  const roomReadyTimeoutRef = useRef<number | null>(null);
  const [debugTip, setDebugTip] = useState<string | null>(null);
  const [bugSquashed, setBugSquashed] = useState(false);
  const [isWindowGreetingVisible, setIsWindowGreetingVisible] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [latestAchievement, setLatestAchievement] = useState<AchievementId | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementId[]>(
    loadUnlockedAchievements,
  );

  const latestAchievementCopy = latestAchievement ? achievementCopy[latestAchievement] : null;

  useEffect(() => {
    setWorldLoading(false);
  }, [setWorldLoading]);

  useEffect(() => {
    preloadInspiredPortfolioAssets();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      setCurrentLocation(roomDetails[currentRoom].label as never);
      return;
    }

    setCurrentLocation(mode === 'corridor' ? 'Hub' : 'Hub');
  }, [currentRoom, mode, setCurrentLocation]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      achievementStorageKey,
      JSON.stringify(unlockedAchievements),
    );
  }, [unlockedAchievements]);

  useEffect(() => {
    if (!latestAchievement) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setLatestAchievement(null);
    }, 2600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [latestAchievement]);

  const unlockAchievement = useCallback((achievementId: AchievementId) => {
    setLatestAchievement(achievementId);
    setUnlockedAchievements((current) =>
      current.includes(achievementId) ? current : [...current, achievementId],
    );
  }, []);

  const motionEnabled = import.meta.env.MODE !== 'test';

  useEffect(() => {
    return () => {
      transitionTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      transitionTimeoutsRef.current = [];
      if (roomReadyTimeoutRef.current) {
        window.clearTimeout(roomReadyTimeoutRef.current);
      }
    };
  }, []);

  const handleRoomReady = useCallback(() => {
    setTransitionPhase('opening');
    if (roomReadyTimeoutRef.current) {
      window.clearTimeout(roomReadyTimeoutRef.current);
    }
    roomReadyTimeoutRef.current = window.setTimeout(() => {
      setTransitionPhase('idle');
      roomReadyTimeoutRef.current = null;
    }, 600);
  }, []);

  const openRoom = useCallback(
    (roomId: RoomId) => {
      transitionTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      transitionTimeoutsRef.current = [];
      setIsMapOpen(false);

      const doorCard = corridorDoorCards.find((door) => door.id === roomId);
      if (doorCard) {
        setFocusedDoor({
          id: doorCard.id,
          side: doorCard.side,
          worldZ: doorCard.z,
        });
      }

      const triggerActivation = () => {
        if (roomId === 'tech-dorm') {
          unlockAchievement('tech_dorm_open');
        }

        if (roomId === 'music-studio') {
          unlockAchievement('music_studio_open');
        }

        setExitingRoomId(null);
        setCurrentRoom(roomId);
      };

      if (!motionEnabled) {
        triggerActivation();
        setTransitionPhase('idle');
        return;
      }

      setTransitionPhase('closing');

      transitionTimeoutsRef.current.push(
        window.setTimeout(() => {
          triggerActivation();
        }, 220),
      );
    },
    [unlockAchievement, motionEnabled],
  );

  const requestRoomExit = useCallback(() => {
    if (!currentRoom) {
      return;
    }

    transitionTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    transitionTimeoutsRef.current = [];

    const triggerExitTransition = () => {
      setExitingRoomId(currentRoom);
      setCurrentRoom(null);
      setIsTechDormExiting(false);
      setIsMusicStudioExiting(false);
      setFocusedDevice(null);
    };

    if (!motionEnabled) {
      triggerExitTransition();
      setTransitionPhase('idle');
      return;
    }

    setTransitionPhase('closing');

    transitionTimeoutsRef.current.push(
      window.setTimeout(() => {
        triggerExitTransition();
        setTransitionPhase('opening');
      }, 220),
    );

    transitionTimeoutsRef.current.push(
      window.setTimeout(() => {
        setTransitionPhase('idle');
        transitionTimeoutsRef.current = [];
      }, 820),
    );
  }, [currentRoom, motionEnabled]);

  const completeRoomExit = useCallback(() => {
    setExitingRoomId(null);
    setCurrentRoom(null);
    setFocusedDoor(null);
  }, []);

  const handleAskDuck = useCallback(() => {
    const tip =
      duckDebugTips[Math.floor(Math.random() * duckDebugTips.length)] ??
      duckDebugTips[0];
    setDebugTip(tip);

    window.setTimeout(() => {
      setDebugTip((current) => (current === tip ? null : current));
    }, 3000);
  }, []);

  return (
    <main className="itom-shell itom-shell--runtime3d" data-testid="inspired-portfolio-shell">
      <div
        aria-hidden="true"
        className="itom-shell__paper"
        style={{
          backgroundImage: `url(${asset('/textures/paper-texture.webp')})`,
        }}
      />

      <div className="runtime-canvas">
        <Canvas camera={{ position: [0, 0.2, 28], fov: 60, near: 0.1, far: 150 }}>
          <ExperienceScene
            bugSquashed={bugSquashed}
            currentRoom={currentRoom}
            debugTip={debugTip}
            mode={mode}
            onAskDuck={handleAskDuck}
            onBugFixed={() => {
              setBugSquashed(true);
              unlockAchievement('bug_fixed');
            }}
            onEnterCorridor={() => {
              unlockAchievement('corridor_enter');
              setMode('corridor');
            }}
            onExplore={() => unlockAchievement('corridor_explore')}
            onOpenRoom={openRoom}
            onRequestRoomExit={requestRoomExit}
            onRoomExitComplete={completeRoomExit}
            exitingRoomId={exitingRoomId}
            onToggleWindowGreeting={setIsWindowGreetingVisible}
            focusedDoor={focusedDoor}
            setFocusedDoor={setFocusedDoor}
            isTechDormExiting={isTechDormExiting}
            isMusicStudioExiting={isMusicStudioExiting}
            focusedDevice={focusedDevice}
            onFocusDevice={setFocusedDevice}
            onReady={handleRoomReady}
          />
        </Canvas>
      </div>

      {mode === 'corridor' && !currentRoom ? (
        <header className="itom-shell__topbar">
          <div className="itom-shell__controls">
            <button
              type="button"
              className="itom-button"
              onClick={() => setIsMapOpen(true)}
            >
              Open route map
            </button>
            <button
              type="button"
              className="itom-button"
              onClick={() => openRoom('music-studio')}
            >
              Open Music Studio
            </button>
          </div>
        </header>
      ) : null}

      {mode === 'entrance' ? (
        <aside className="runtime-note-card runtime-note-card--left">
          <p className="overlay-card__eyebrow">Entrance</p>
          <p>
            {isWindowGreetingVisible
              ? 'Danish waves from the window.'
              : 'Hover the window, squash the bug, then click the door.'}
          </p>
        </aside>
      ) : null}



      {currentRoom ? (
        exitingRoomId ? null : (
          currentRoom === 'tech-dorm' || currentRoom === 'music-studio' || currentRoom === 'experience' ? null : (
            <RoomOverlay room={roomDetails[currentRoom]} onBack={requestRoomExit} />
          )
        )
      ) : null}

      {(currentRoom === 'tech-dorm' || currentRoom === 'music-studio' || currentRoom === 'experience') && !exitingRoomId && transitionPhase === 'idle' ? (
        <button
          type="button"
          className="itom-button"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 50,
          }}
          onClick={() => {
            if (currentRoom === 'tech-dorm') {
              setIsTechDormExiting(true);
            } else {
              setIsMusicStudioExiting(true);
            }
          }}
        >
          Back to corridor
        </button>
      ) : null}

      {focusedDevice ? (
        <>
          <div className="focused-backdrop" />
          <div className="focused-split-container" role="dialog" aria-modal="true">
            <div
              className="focused-left-area"
              onClick={() => setFocusedDevice(null)}
              title="Click to zoom out"
              aria-label="Zoom out"
            />
            <div className="focused-right-panel">
              <div className="overlay-card__header">
                <div>
                  <p className="overlay-card__eyebrow">
                    {platformConfigs[focusedDevice.platform].name}
                  </p>
                  <h2 className="overlay-card__title" style={{ fontSize: '2.2rem', fontFamily: "'Cabin Sketch', 'Trebuchet MS', sans-serif", margin: '0.2rem 0 0' }}>
                    {focusedDevice.title}
                  </h2>
                </div>
                <button
                  type="button"
                  className="overlay-card__close"
                  aria-label="Close"
                  onClick={() => setFocusedDevice(null)}
                  style={{ fontSize: '1.8rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                >
                  ✕
                </button>
              </div>
              <div className="overlay-card__content" style={{ marginTop: '24px', color: '#1a1a1a' }}>
                <p style={{ fontSize: '1.25rem', lineHeight: '1.65', marginBottom: '24px', fontFamily: "'Cabin Sketch', 'Trebuchet MS', sans-serif" }}>
                  {focusedDevice.description}
                </p>
                <div style={{ display: 'flex', gap: '15px', fontSize: '1.05rem', color: '#444', marginBottom: '32px', fontFamily: "'Cabin Sketch', 'Trebuchet MS', sans-serif" }}>
                  {focusedDevice.views && <span>👁 {focusedDevice.views} views</span>}
                  {focusedDevice.likes && <span>♥ {focusedDevice.likes} likes</span>}
                  {focusedDevice.duration && <span>⏱ {focusedDevice.duration}</span>}
                  {focusedDevice.date && <span>📅 {focusedDevice.date}</span>}
                </div>
                {focusedDevice.url && (
                  <a
                    href={focusedDevice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="itom-button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      textDecoration: 'none',
                      padding: '0.8rem 1.6rem',
                      fontSize: '1.1rem',
                    }}
                  >
                    Open {platformConfigs[focusedDevice.platform].name} {platformConfigs[focusedDevice.platform].icon}
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {isMapOpen ? (
        <RouteMapOverlay
          onClose={() => setIsMapOpen(false)}
          onSelectRoom={openRoom}
        />
      ) : null}

      {transitionPhase !== 'idle' ? (
        <div
          aria-hidden="true"
          className={`paper-transition paper-transition--${transitionPhase}`}
        >
          <div className="paper-transition__half paper-transition__half--top" />
          <div className="paper-transition__half paper-transition__half--bottom" />
        </div>
      ) : null}
    </main>
  );
}
