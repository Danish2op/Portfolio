import { Text, Billboard, Plane, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MathUtils,
  Vector3,
  Color,
  DoubleSide,
  type Group,
  BufferGeometry,
  Float32BufferAttribute,
  Texture,
  CanvasTexture,
} from 'three';
import { gsap } from 'gsap';

import {
  aboutRoomConfig,
  aboutRoomSegments,
  aiSkills,
  educationCards,
  internshipCards,
  hashRandom,
  type SkillBalloon,
} from './aboutRoomModel';
import { RevealBasicMaterial } from './shaders/RevealBasicMaterial';

const sketchFont = '/fonts/CabinSketch-Bold.ttf';

// Color palette from the sketch theme - strictly monochrome paper & ink
const colors = {
  paper: '#e4e3dd',
  paperDark: '#d5d0c8',
  ink: '#171717',
  inkLight: '#444444',
  inkFaint: '#666666', // slightly darker for better text contrast
  warmGlow: '#f0e6d2',
};

const assetRoot = '/itomdev-clone';
function asset(relativePath: string) {
  return `${assetRoot}${relativePath}`;
}

// Generates an empty hand-drawn sketchy balloon outline filled with paper color (no logo)
function generateSketchBalloonTexture(): CanvasTexture {
  const width = 256;
  const height = 360;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new CanvasTexture(canvas);

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = 130;
  const rx = 80;
  const ry = 100;

  // Fill oval with paper color
  ctx.fillStyle = '#e4e3dd';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Also fill knot
  ctx.beginPath();
  ctx.moveTo(cx, cy + ry);
  ctx.lineTo(cx - 12, cy + ry + 15);
  ctx.lineTo(cx + 12, cy + ry + 15);
  ctx.closePath();
  ctx.fill();

  // Draw a sketchy oval balloon body (loose double outlines)
  ctx.strokeStyle = '#171717';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    const offset = () => (Math.random() - 0.5) * 2.5;
    ctx.ellipse(cx + offset(), cy + offset(), rx + offset(), ry + offset(), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw the knot at the bottom (small triangle)
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    const offset = () => (Math.random() - 0.5) * 1.5;
    const kx = cx + offset();
    const ky = cy + ry + offset();
    ctx.moveTo(kx, ky);
    ctx.lineTo(kx - 12, ky + 15);
    ctx.lineTo(kx + 12, ky + 15);
    ctx.closePath();
    ctx.stroke();
  }

  // Draw the string (wavy pencil line)
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 1.8;
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    let sx = cx;
    let sy = cy + ry + 15;
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(
      sx - 20 + Math.random() * 10, sy + 60,
      sx + 20 + Math.random() * 10, sy + 120,
      sx + Math.random() * 5, height - 10
    );
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Generates the hover painted version of the generic hand-drawn balloon
function generateSketchBalloonPaintedTexture(): CanvasTexture {
  const width = 256;
  const height = 360;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new CanvasTexture(canvas);

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = 130;
  const rx = 80;
  const ry = 100;

  // Fill oval with a light gray/cream paint wash matching the painted theme
  ctx.fillStyle = '#d5d0c8';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, cy + ry);
  ctx.lineTo(cx - 12, cy + ry + 15);
  ctx.lineTo(cx + 12, cy + ry + 15);
  ctx.closePath();
  ctx.fill();

  // Draw outline
  ctx.strokeStyle = '#171717';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    const offset = () => (Math.random() - 0.5) * 2.5;
    ctx.ellipse(cx + offset(), cy + offset(), rx + offset(), ry + offset(), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Knot
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    const offset = () => (Math.random() - 0.5) * 1.5;
    const kx = cx + offset();
    const ky = cy + ry + offset();
    ctx.moveTo(kx, ky);
    ctx.lineTo(kx - 12, ky + 15);
    ctx.lineTo(kx + 12, ky + 15);
    ctx.closePath();
    ctx.stroke();
  }

  // String
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 1.8;
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    let sx = cx;
    let sy = cy + ry + 15;
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(
      sx - 20 + Math.random() * 10, sy + 60,
      sx + 20 + Math.random() * 10, sy + 120,
      sx + Math.random() * 5, height - 10
    );
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Paper plane geometry (a folded paper airplane shape)
function createPaperPlaneGeometry(): BufferGeometry {
  const geo = new BufferGeometry();
  
  // 6 vertices of a folded 3D paper airplane:
  // Nose: [0, 0, -0.5]
  // Left Wing Tip: [-0.4, 0.05, 0.25]
  // Left Fold: [-0.04, -0.02, 0.22]
  // Crease: [0, -0.09, 0.24]
  // Right Fold: [0.04, -0.02, 0.22]
  // Right Wing Tip: [0.4, 0.05, 0.25]
  
  const vertices = new Float32Array([
    // Left Wing (0, 1, 2)
    0, 0, -0.5,
    -0.4, 0.05, 0.25,
    -0.04, -0.02, 0.22,

    // Right Wing (3, 4, 5)
    0, 0, -0.5,
    0.04, -0.02, 0.22,
    0.4, 0.05, 0.25,

    // Left Fuselage (6, 7, 8)
    0, 0, -0.5,
    -0.04, -0.02, 0.22,
    0, -0.09, 0.24,

    // Right Fuselage (9, 10, 11)
    0, 0, -0.5,
    0, -0.09, 0.24,
    0.04, -0.02, 0.22,
  ]);

  const indices = [
    0, 1, 2,     // Left wing
    3, 4, 5,     // Right wing
    6, 7, 8,     // Left fuselage
    9, 10, 11,   // Right fuselage
  ];

  geo.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const uvs = new Float32Array([
    0.5, 1.0, 0.0, 0.0, 0.45, 0.0, // Left wing
    0.5, 1.0, 0.55, 0.0, 1.0, 0.0, // Right wing
    0.5, 1.0, 0.45, 0.0, 0.5, 0.0,  // Left fuselage
    0.5, 1.0, 0.5, 0.0, 0.55, 0.0,  // Right fuselage
  ]);
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

  return geo;
}

// Paper plane sketch ink outline geometry
function createPaperPlaneOutlineGeometry(): BufferGeometry {
  const geo = new BufferGeometry();
  
  const nose = [0, 0, -0.5];
  const leftWingTip = [-0.4, 0.05, 0.25];
  const leftFold = [-0.04, -0.02, 0.22];
  const crease = [0, -0.09, 0.24];
  const rightFold = [0.04, -0.02, 0.22];
  const rightWingTip = [0.4, 0.05, 0.25];

  const vertices = new Float32Array([
    // Left Wing Outer
    ...nose, ...leftWingTip,
    ...leftWingTip, ...leftFold,
    
    // Right Wing Outer
    ...nose, ...rightWingTip,
    ...rightWingTip, ...rightFold,
    
    // Folds
    ...nose, ...leftFold,
    ...nose, ...rightFold,
    ...nose, ...crease,
    
    // Back edges
    ...leftFold, ...crease,
    ...crease, ...rightFold,
  ]);

  geo.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  return geo;
}

// ——————————————————————————————————————————————
// Segment Container: Handles position wrapping and fade-in/fade-out culling
// ——————————————————————————————————————————————
function SegmentContainer({
  segmentZ,
  scrollProgressRef,
  children,
}: {
  segmentZ: number;
  scrollProgressRef: React.MutableRefObject<number>;
  children: React.ReactNode;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    const scrollVal = scrollProgressRef.current;
    // Relative position of this segment to the camera
    const relPos = scrollVal + segmentZ;

    // Wrap the segment forward by 160 units once it passes 12 units behind the camera
    const shift = relPos > 12.0 ? Math.floor((relPos - 12.0) / 160) + 1 : 0;
    const wrappedZ = segmentZ - shift * 160;
    groupRef.current.position.z = wrappedZ;

    // Relative Z to camera (camera is static at z = 2 in world coordinates)
    const relZ = wrappedZ + scrollVal - 2.0;

    // Compute opacity based on relative distance
    let opacity = 0;
    if (relZ < 0) {
      // Ahead of the camera: fade in between 50 and 20 units away
      opacity = MathUtils.smoothstep(relZ, -50, -20);
    } else {
      // Behind the camera: fade out between 2 and 12 units behind
      opacity = 1.0 - MathUtils.smoothstep(relZ, 2, 12);
    }

    groupRef.current.visible = opacity > 0.001;

    // Apply computed opacity recursively to child materials
    groupRef.current.traverse((child) => {
      if ('material' in child && (child as any).material) {
        const mat = (child as any).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            m.transparent = true;
            m.opacity = opacity;
          });
        } else {
          mat.transparent = true;
          mat.opacity = opacity;
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, segmentZ]}>
      {children}
    </group>
  );
}

// ——————————————————————————————————————————————
// Sky Chunk: Loads and displays the 8 real cloud textures
// ——————————————————————————————————————————————
function SkyChunk({
  chunkIndex,
  scrollProgressRef,
  cloudTextures,
}: {
  chunkIndex: number;
  scrollProgressRef: React.MutableRefObject<number>;
  cloudTextures: Texture[];
}) {
  const groupRef = useRef<Group>(null);

  const clouds = useMemo(() => {
    const count = 8 + Math.floor(hashRandom(chunkIndex * 17) * 5);
    const result = [];
    for (let i = 0; i < count; i++) {
      const seed = chunkIndex * 137 + i;
      let x = (hashRandom(seed) - 0.5) * 44;
      if (Math.abs(x) < 3.5) {
        x += Math.sign(x || 1) * 4.0;
      }
      const y = (hashRandom(seed + 1) - 0.5) * 14 + 1;
      const z =
        -(chunkIndex * aboutRoomConfig.chunkSize) -
        hashRandom(seed + 2) * aboutRoomConfig.chunkSize;
      const texIdx = Math.floor(hashRandom(seed + 3) * cloudTextures.length);
      const scale = 2.0 + hashRandom(seed + 4) * 2.8;
      const driftSpeed = 0.08 + hashRandom(seed + 5) * 0.25;
      const phase = hashRandom(seed + 6) * Math.PI * 2;
      const opacity = 0.45 + hashRandom(seed + 7) * 0.45;
      result.push({ x, y, z, texIdx, scale, driftSpeed, phase, opacity });
    }
    return result;
  }, [chunkIndex, cloudTextures.length]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const c = clouds[i];
      if (!c) return;

      // Wind drift and bobbing
      const windX = Math.sin(time * c.driftSpeed + c.phase) * 2.0;
      const bobY = Math.sin(time * c.driftSpeed * 0.6 + c.phase + 1.5) * 0.9;

      child.position.x = c.x + windX;
      child.position.y = c.y + bobY;

      // Fly-by separation when getting close to camera
      const relZ = c.z + scrollProgressRef.current;
      if (relZ > -10 && relZ < 4) {
        const transition = MathUtils.smoothstep(relZ, -10, 4);
        child.position.x += Math.sign(c.x || 1) * transition * 24.0;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <Billboard key={i} position={[c.x, c.y, c.z]}>
          <Plane args={[c.scale * 1.9, c.scale]}>
            <meshBasicMaterial
              map={cloudTextures[c.texIdx]}
              transparent
              depthWrite={false}
              opacity={c.opacity}
              color={colors.paper}
            />
          </Plane>
        </Billboard>
      ))}
    </group>
  );
}

// ——————————————————————————————————————————————
// Education Card: Uses certificate textures and hover Reveal shader
// ——————————————————————————————————————————————
function EducationCard({
  card,
  index,
  sketchTex,
  paintedTex,
}: {
  card: (typeof educationCards)[number];
  index: number;
  sketchTex: Texture;
  paintedTex: Texture;
}) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const revealProgress = useRef(0);

  const revealMat = useMemo(() => {
    return new RevealBasicMaterial({
      map: sketchTex,
      transparent: true,
      depthWrite: false,
    });
  }, [sketchTex]);

  useFrame((state, delta) => {
    // Smooth reveal sweep on hover
    const target = hovered ? 1.0 : 0.0;
    revealProgress.current = MathUtils.lerp(
      revealProgress.current,
      target,
      1 - Math.pow(0.01, delta),
    );
    revealMat.uProgress.value = revealProgress.current;

    // Card bobbing
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(time * 0.45 + index * 2.0) * 0.15;
    }
  });

  const baseX = (index - 1) * 5.8;

  return (
    <group
      ref={groupRef}
      position={[baseX, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
    >
      {/* Base Painted Certificate */}
      <mesh>
        <planeGeometry args={[4.5, 3.3]} />
        <meshBasicMaterial map={paintedTex} transparent side={DoubleSide} />
      </mesh>

      {/* Overlay Sketch Certificate (revealed/discarded on hover) */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[4.5, 3.3]} />
        <primitive object={revealMat} attach="material" />
      </mesh>

      {/* Institution Text */}
      <Text
        position={[0, 1.0, 0.02]}
        fontSize={0.24}
        font={sketchFont}
        color={colors.ink}
        anchorX="center"
        anchorY="middle"
        maxWidth={3.8}
        textAlign="center"
      >
        {card.label}
      </Text>

      {/* Title / Program Text */}
      <Text
        position={[0, 0.0, 0.02]}
        fontSize={0.2}
        font={sketchFont}
        color={colors.inkLight}
        anchorX="center"
        anchorY="middle"
        maxWidth={3.8}
        textAlign="center"
      >
        {card.title}
      </Text>

      {/* Dates Text - High contrast dark ink color for perfect readability */}
      {card.dates ? (
        <Text
          position={[0, -1.0, 0.02]}
          fontSize={0.22}
          font={sketchFont}
          color={colors.ink}
          anchorX="center"
          anchorY="middle"
        >
          {card.dates}
        </Text>
      ) : null}
    </group>
  );
}

// ——————————————————————————————————————————————
// Internship Island: Renders floating hand-drawn island textures
// ——————————————————————————————————————————————
function InternshipIsland({
  card,
  islandTex,
}: {
  card: (typeof internshipCards)[number];
  islandTex: Texture;
}) {
  const groupRef = useRef<Group>(null);
  const phaseOffset = hashRandom(card.id.charCodeAt(0)) * Math.PI * 2;

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Floating island bobbing and tilting
    const bob = Math.sin(time * 0.35 + phaseOffset) * 0.22;
    const tilt = Math.sin(time * 0.2 + phaseOffset) * 0.035;
    groupRef.current.position.y = card.yOffset + bob;
    groupRef.current.rotation.z = tilt;
  });

  return (
    <group ref={groupRef} position={[card.xOffset, card.yOffset, 0]}>
      {/* 2D Hand-drawn Island Mesh */}
      <mesh position={[0, -0.9, -0.1]}>
        <planeGeometry args={[4.4, 2.2]} />
        <meshBasicMaterial map={islandTex} transparent />
      </mesh>



      {/* Paper Card displaying Internship Details */}
      <group position={[0, -0.1, 0.02]}>
        {/* Shadow Card */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[3.3, 1.9]} />
          <meshBasicMaterial color={colors.inkLight} transparent opacity={0.15} />
        </mesh>
        {/* Main Card */}
        <mesh>
          <planeGeometry args={[3.2, 1.8]} />
          <meshBasicMaterial color={colors.paper} transparent opacity={0.92} />
        </mesh>

        <Text
          position={[0, 0.4, 0.02]}
          fontSize={0.34}
          font={sketchFont}
          color={colors.ink}
          anchorX="center"
          anchorY="middle"
          maxWidth={3.0}
        >
          {card.label}
        </Text>
        <Text
          position={[0, -0.2, 0.02]}
          fontSize={0.2}
          font={sketchFont}
          color={colors.inkLight}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.9}
          textAlign="center"
        >
          {card.title}
        </Text>
      </group>
    </group>
  );
}

// ——————————————————————————————————————————————
// Skill Balloon Mesh: Renders 2D balloon textures & hover Reveal shader
// ——————————————————————————————————————————————
function SkillBalloonMesh({
  skill,
  pointerRef,
  sketchTex,
  paintedTex,
}: {
  skill: SkillBalloon;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  sketchTex: Texture;
  paintedTex: Texture;
}) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isPopped, setIsPopped] = useState(false);
  const poppedScale = useRef(1);
  const textOpacity = useRef(0);
  const revealProgress = useRef(0);

  const width = skill.size === 'large' ? 2.3 : skill.size === 'medium' ? 1.75 : 1.3;
  const height = width * 1.42;

  const revealMat = useMemo(() => {
    return new RevealBasicMaterial({
      map: sketchTex,
      transparent: true,
      depthWrite: false,
    });
  }, [sketchTex]);

  const phaseOffset = hashRandom(skill.id.charCodeAt(0) * 7) * Math.PI * 2;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Floating drift + bobbing physics
    const floatY = Math.sin(time * 0.55 + phaseOffset) * 0.28;
    const floatX = Math.sin(time * 0.3 + phaseOffset * 1.4) * 0.14;

    groupRef.current.position.y = skill.yOffset + floatY;
    groupRef.current.position.x = skill.xOffset + floatX;

    // Pointer-reactive wiggle (balloon leans away slightly from mouse)
    const dx = (pointerRef.current.x * 5.0 - groupRef.current.position.x) * 0.04;
    const dy = (pointerRef.current.y * 3.0 - groupRef.current.position.y) * 0.04;
    groupRef.current.position.x += dx;
    groupRef.current.position.y += dy;

    // Hover reveal transition
    const target = hovered ? 1.0 : 0.0;
    revealProgress.current = MathUtils.lerp(
      revealProgress.current,
      target,
      1 - Math.pow(0.01, delta),
    );
    revealMat.uProgress.value = revealProgress.current;

    // Pop scale transition
    if (isPopped) {
      poppedScale.current = MathUtils.lerp(poppedScale.current, 0, 0.18);
      textOpacity.current = MathUtils.lerp(textOpacity.current, 1, 0.08);
    }

    const scale = isPopped ? poppedScale.current : 1.0;
    groupRef.current.scale.setScalar(Math.max(0.001, scale));
  });

  const handleClick = useCallback(() => {
    if (!isPopped) {
      setIsPopped(true);
      // Play pop sound
      const audio = new Audio(asset('/sounds/baloonpoop.mp3'));
      audio.volume = 0.25;
      audio.play().catch(() => {});
    }
  }, [isPopped]);

  return (
    <group
      ref={groupRef}
      position={[skill.xOffset, skill.yOffset, skill.zOffset]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
    >
      {/* Base Painted Balloon (Rendered in white to prevent color tints) */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={paintedTex} transparent depthWrite={false} color="#ffffff" />
      </mesh>

      {/* Overlay Sketch Balloon */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <primitive object={revealMat} attach="material" />
      </mesh>

      {/* Skill Label */}
      <Text
        position={[0, width * 0.12, 0.02]}
        fontSize={width * 0.14}
        font={sketchFont}
        color={colors.ink}
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.85}
        textAlign="center"
      >
        {skill.label}
      </Text>

      {/* Floating text revealed post-pop */}
      {isPopped ? (
        <Text
          position={[0, 1.4, 0.1]}
          fontSize={0.45}
          font={sketchFont}
          color={colors.ink}
          anchorX="center"
          anchorY="middle"
        >
          {skill.label}
        </Text>
      ) : null}
    </group>
  );
}

// ——————————————————————————————————————————————
// Sky Dome: Flat, textureless drawing-paper backdrop (ensures perfect readability)
// ——————————————————————————————————————————————
function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[95, 16, 16]} />
      <meshBasicMaterial
        color={colors.paper}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ——————————————————————————————————————————————
// MAIN ABOUT ROOM COMPONENT
// ——————————————————————————————————————————————
export function AboutRoom({
  onRequestExit,
  triggerExit,
  onReady,
}: {
  onRequestExit: () => void;
  triggerExit?: boolean;
  onReady?: () => void;
}) {
  const { camera } = useThree();
  const roomGroupRef = useRef<Group>(null);
  const planeRef = useRef<Group>(null);
  const scrollProgress = useRef(0);
  const scrollVelocity = useRef(0);
  const isLeavingRef = useRef(false);
  const hasTriggeredExit = useRef(false);
  const isFirstFrameRef = useRef(true);

  const currentRoll = useRef(0);
  const currentPitch = useRef(0);
  const baselineRotation = useRef({ x: 0, y: 0, z: 0 });

  const pointer = useRef({ x: 0, y: 0 });
  const [activeChunks, setActiveChunks] = useState<number[]>([0, 1, 2, 3]);

  // Load common assets
  const paperTex = useTexture(asset('/textures/paper-texture.webp'));
  const avatarTex = useTexture(asset('/textures/about/awatarnachmurce.webp'));
  const uowyspa = useTexture(asset('/textures/about/uowyspa.webp'));
  const freelancewyspa = useTexture(asset('/textures/about/freelancewyspa.webp'));

  // Pre-load all 8 cloud textures
  const cloudTextures = [
    useTexture(asset('/textures/clouds/1131c3eb-dfae-423f-924b-ff39d8ccd6dc.webp')),
    useTexture(asset('/textures/clouds/254b8ec8-d6f7-4275-956f-7bab65b2ce2d.webp')),
    useTexture(asset('/textures/clouds/2cc88dd1-483c-466d-b07e-f8308c61ccbe.webp')),
    useTexture(asset('/textures/clouds/5606fcc0-3252-447d-a58a-7bcbac73229a.webp')),
    useTexture(asset('/textures/clouds/7882dc72-3d01-41fb-ac0e-d07b0184ebc1.webp')),
    useTexture(asset('/textures/clouds/9b2ca72f-7bd0-473b-ba6e-dd9e0eb79d35.webp')),
    useTexture(asset('/textures/clouds/c83293c6-d90c-4a32-8d9d-5ac9af7e2296.webp')),
    useTexture(asset('/textures/clouds/f6e358bc-d27c-41dd-95f4-6787a835c41e.webp')),
  ];

  // Pre-load certificate textures
  const certTextures = {
    sotd: useTexture(asset('/textures/about/SOTD.webp')),
    sotdPainted: useTexture(asset('/textures/about/SOTD_painted.webp')),
    sotm: useTexture(asset('/textures/about/SOTM.webp')),
    sotmPainted: useTexture(asset('/textures/about/SOTM_painted.webp')),
    soty: useTexture(asset('/textures/about/SOTY.webp')),
    sotyPainted: useTexture(asset('/textures/about/SOTY_painted.webp')),
  };

  // Pre-load skill balloon textures
  const balloonTexs = {
    react: useTexture(asset('/textures/about/reactduzybalon.webp')),
    reactPainted: useTexture(asset('/textures/about/reactduzybalon_painted.webp')),
    nextjs: useTexture(asset('/textures/about/nextjssrednibalon.webp')),
    nextjsPainted: useTexture(asset('/textures/about/nextjssrednibalon_painted.webp')),
    figma: useTexture(asset('/textures/about/figmamalybalon.webp')),
    figmaPainted: useTexture(asset('/textures/about/figmamalybalon_painted.webp')),
    firebase: useTexture(asset('/textures/about/firebasemalybalon.webp')),
    firebasePainted: useTexture(asset('/textures/about/firebasemalybalon_painted.webp')),
    git: useTexture(asset('/textures/about/gitmalybalon.webp')),
    gitPainted: useTexture(asset('/textures/about/gitmalybalon_painted.webp')),
    html: useTexture(asset('/textures/about/htmlmalybalon.webp')),
    htmlPainted: useTexture(asset('/textures/about/htmlmalybalon_painted.webp')),
    css: useTexture(asset('/textures/about/csssrednibalon.webp')),
    cssPainted: useTexture(asset('/textures/about/csssrednibalon_painted.webp')),
    gsap: useTexture(asset('/textures/about/GSAPduzybalon.webp')),
    gsapPainted: useTexture(asset('/textures/about/GSAPduzybalon_painted.webp')),
  };

  // Memoize generated empty sketch balloons for custom/AI skills (Claude Code, Agentic AI, Python, TS)
  const genericSketchBalloon = useMemo(() => generateSketchBalloonTexture(), []);
  const genericPaintedBalloon = useMemo(() => generateSketchBalloonPaintedTexture(), []);

  // Maps skills to balloon textures, routing custom skills to generic logo-less sketch balloons
  const getBalloonTextures = useCallback((id: string) => {
    switch (id) {
      case 'react':
        return { sketch: balloonTexs.react, painted: balloonTexs.reactPainted };
      case 'nextjs':
        return { sketch: balloonTexs.nextjs, painted: balloonTexs.nextjsPainted };
      case 'firebase':
        return { sketch: balloonTexs.firebase, painted: balloonTexs.firebasePainted };
      case 'figma':
        return { sketch: balloonTexs.figma, painted: balloonTexs.figmaPainted };
      case 'gsap':
        return { sketch: balloonTexs.gsap, painted: balloonTexs.gsapPainted };
      case 'git':
        return { sketch: balloonTexs.git, painted: balloonTexs.gitPainted };
      case 'html':
        return { sketch: balloonTexs.html, painted: balloonTexs.htmlPainted };
      default:
        // Claude Code, Agentic AI, Python, and TS use empty generic sketch balloons to avoid wrong logos
        return { sketch: genericSketchBalloon, painted: genericPaintedBalloon };
    }
  }, [balloonTexs, genericSketchBalloon, genericPaintedBalloon]);

  const paperPlaneGeo = useMemo(() => createPaperPlaneGeometry(), []);
  const paperPlaneOutlineGeo = useMemo(() => createPaperPlaneOutlineGeometry(), []);

  // ---- ENTRANCE SEQUENCE ----
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Camera targets looking forward along -Z
    const targetPos = new Vector3(0, 0.5, 2);

    gsap.to(camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    gsap.to(camera.rotation, {
      x: -0.05, // slight downward look
      y: 0,
      z: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        baselineRotation.current = {
          x: camera.rotation.x,
          y: camera.rotation.y,
          z: camera.rotation.z,
        };
      },
    });

    // Pointer position mapping
    const handleMouseMove = (e: MouseEvent) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    // Wheel inputs
    const handleWheel = (e: WheelEvent) => {
      if (isLeavingRef.current) return;
      e.preventDefault();
      scrollVelocity.current += e.deltaY * 0.0022;
    };

    // Mobile touch inputs
    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isLeavingRef.current) return;
      const currentY = e.touches[0]?.clientY ?? 0;
      const delta = lastTouchY - currentY;
      scrollVelocity.current += delta * 0.0055;
      lastTouchY = currentY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [camera]);

  // ---- EXIT HANDLING ----
  useEffect(() => {
    if (triggerExit && !isLeavingRef.current) {
      isLeavingRef.current = true;
    }
  }, [triggerExit]);

  // ---- RENDER/FRAME LOOP ----
  useFrame((state, delta) => {
    if (isFirstFrameRef.current) {
      isFirstFrameRef.current = false;
      onReady?.();
    }

    // Exit transition (fly backwards into corridor)
    if (isLeavingRef.current) {
      camera.position.z += delta * 9.0;
      if (camera.position.z > 12.0 && !hasTriggeredExit.current) {
        hasTriggeredExit.current = true;
        onRequestExit();
      }
      return;
    }

    // Scroll deceleration
    scrollVelocity.current *= aboutRoomConfig.scrollDamping;
    if (Math.abs(scrollVelocity.current) < 0.0005) {
      scrollVelocity.current = 0;
    }

    // Accumulate scroll
    scrollProgress.current += scrollVelocity.current * delta * 60;

    // Scrolling backwards past 0 triggers exit
    if (scrollProgress.current < -2.5) {
      isLeavingRef.current = true;
    }

    // Shift world backward based on scroll progress
    if (roomGroupRef.current) {
      roomGroupRef.current.position.z = MathUtils.lerp(
        roomGroupRef.current.position.z,
        scrollProgress.current,
        1 - Math.exp(-delta * 9.5),
      );
    }

    // Turbulence & Flight banking
    if (scrollProgress.current > 0.5) {
      const phase =
        (scrollProgress.current % aboutRoomConfig.flightWavelength) /
        aboutRoomConfig.flightWavelength;

      let targetRoll = Math.sin(phase * Math.PI * 2.0) * 0.12;
      let targetPitch = Math.sin(phase * Math.PI * 4.0) * 0.055;

      // Smooth fade over first 5 units
      const fade = Math.min(1.0, (scrollProgress.current - 0.5) / 5.0);
      targetRoll *= fade;
      targetPitch *= fade;

      const lerpFactor = 1 - Math.pow(0.015, delta);
      currentRoll.current = MathUtils.lerp(
        currentRoll.current,
        targetRoll,
        lerpFactor,
      );
      currentPitch.current = MathUtils.lerp(
        currentPitch.current,
        targetPitch,
        lerpFactor,
      );

      // Rotate camera
      camera.rotation.x = baselineRotation.current.x + currentPitch.current;
      camera.rotation.z = baselineRotation.current.z + currentRoll.current;
    }

    // Lock paper plane perfectly in front of the camera, bobbing and banking
    if (planeRef.current) {
      planeRef.current.position.copy(camera.position);

      // Offset by 0.75 units forward, 0.22 units down
      const dir = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      planeRef.current.position.addScaledVector(dir, 0.75);
      planeRef.current.position.addScaledVector(up, -0.22);

      // Orientation matches camera, with banking wiggles
      planeRef.current.quaternion.copy(camera.quaternion);
      planeRef.current.rotateZ(-currentRoll.current * 2.0);
      planeRef.current.rotateX(currentPitch.current * 3.0 + 0.08);

      // Add simple float bobbing
      const time = state.clock.getElapsedTime();
      planeRef.current.position.y += Math.sin(time * 2.2) * 0.018;
    }

    // Update active chunks
    const chunkIdx = Math.floor(
      scrollProgress.current / aboutRoomConfig.chunkSize,
    );
    const newChunks = [chunkIdx - 1, chunkIdx, chunkIdx + 1, chunkIdx + 2];
    if (
      newChunks[0] !== activeChunks[0] ||
      newChunks[1] !== activeChunks[1]
    ) {
      setActiveChunks(newChunks);
    }
  });

  return (
    <>
      {/* Flat textureless paper background (guarantees readable text contrast) */}
      <SkyDome />

      {/* Ambient lighting */}
      <ambientLight intensity={0.9} color={colors.warmGlow} />
      <directionalLight position={[5, 10, 5]} intensity={0.3} />

      {/* Paper Plane vehicle */}
      <group ref={planeRef}>
        <mesh geometry={paperPlaneGeo} scale={[0.55, 0.55, 0.55]}>
          <meshBasicMaterial
            map={paperTex}
            color={colors.paper}
            side={DoubleSide}
            transparent
            opacity={0.96}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
        <lineSegments geometry={paperPlaneOutlineGeo} scale={[0.55, 0.55, 0.55]}>
          <lineBasicMaterial
            color="#2d2a22"
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      {/* Scrollable World Group */}
      <group ref={roomGroupRef}>
        {/* Dynamic Cloud Chunks */}
        {activeChunks.map((idx) => (
          <SkyChunk
            key={`chunk-${idx}`}
            chunkIndex={idx}
            scrollProgressRef={scrollProgress}
            cloudTextures={cloudTextures}
          />
        ))}

        {/* Segment 1: Header */}
        <SegmentContainer
          segmentZ={aboutRoomSegments.header.z}
          scrollProgressRef={scrollProgress}
        >
          <Text
            position={[0, 3.4, 0]}
            fontSize={1.3}
            font={sketchFont}
            color={colors.ink}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            DANISH SHARMA
          </Text>
          <Text
            position={[0, 2.3, 0]}
            fontSize={0.52}
            font={sketchFont}
            color={colors.inkLight}
            anchorX="center"
            anchorY="middle"
          >
            {'( AI Engineer & Musician )'}
          </Text>

          {/* Cloud Profile Avatar */}
          <mesh position={[0, 0.8, 0]}>
            <planeGeometry args={[5.2, 2.8]} />
            <meshBasicMaterial map={avatarTex} transparent />
          </mesh>

          {/* Large, high-contrast, perfectly readable description */}
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.34}
            font={sketchFont}
            color={colors.ink}
            anchorX="center"
            anchorY="middle"
            maxWidth={8.5}
            textAlign="center"
          >
            Building intelligent systems that bridge creativity and engineering
          </Text>
        </SegmentContainer>

        {/* Segment 2: Education */}
        <SegmentContainer
          segmentZ={aboutRoomSegments.education.z}
          scrollProgressRef={scrollProgress}
        >
          <Text
            position={[0, 4.4, 0]}
            fontSize={1.4}
            font={sketchFont}
            color={colors.ink}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            EDUCATION
          </Text>
          <Text
            position={[0, 3.4, 0]}
            fontSize={0.34}
            font={sketchFont}
            color={colors.inkLight}
            anchorX="center"
            anchorY="middle"
          >
            The foundations of the craft
          </Text>

          <group position={[0, 0.8, 0]}>
            <EducationCard
              card={educationCards[0]!}
              index={0}
              sketchTex={certTextures.sotd}
              paintedTex={certTextures.sotdPainted}
            />
            <EducationCard
              card={educationCards[1]!}
              index={1}
              sketchTex={certTextures.sotm}
              paintedTex={certTextures.sotmPainted}
            />
            <EducationCard
              card={educationCards[2]!}
              index={2}
              sketchTex={certTextures.soty}
              paintedTex={certTextures.sotyPainted}
            />
          </group>
        </SegmentContainer>

        {/* Segment 3: Internship / Journey */}
        <SegmentContainer
          segmentZ={aboutRoomSegments.internship.z}
          scrollProgressRef={scrollProgress}
        >
          <Text
            position={[0, 4.4, 0]}
            fontSize={1.4}
            font={sketchFont}
            color={colors.ink}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            JOURNEY
          </Text>
          <Text
            position={[0, 3.4, 0]}
            fontSize={0.34}
            font={sketchFont}
            color={colors.inkLight}
            anchorX="center"
            anchorY="middle"
          >
            My path so far...
          </Text>

          <group position={[0, 0.8, 0]}>
            <InternshipIsland card={internshipCards[0]!} islandTex={uowyspa} />
            <InternshipIsland card={internshipCards[1]!} islandTex={uowyspa} />
            <InternshipIsland card={internshipCards[2]!} islandTex={freelancewyspa} />
          </group>
        </SegmentContainer>

        {/* Segment 4: Skills */}
        <SegmentContainer
          segmentZ={aboutRoomSegments.skills.z}
          scrollProgressRef={scrollProgress}
        >
          <Text
            position={[0, 4.6, 0]}
            fontSize={1.4}
            font={sketchFont}
            color={colors.ink}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            SKILLS
          </Text>
          <Text
            position={[0, 3.6, 0]}
            fontSize={0.34}
            font={sketchFont}
            color={colors.inkLight}
            anchorX="center"
            anchorY="middle"
          >
            Technologies I love working with
          </Text>

          <group position={[0, 0.4, 0]}>
            {aiSkills.map((skill) => {
              const { sketch, painted } = getBalloonTextures(skill.id);
              return (
                <SkillBalloonMesh
                  key={skill.id}
                  skill={skill}
                  pointerRef={pointer}
                  sketchTex={sketch}
                  paintedTex={painted}
                />
              );
            })}
          </group>
        </SegmentContainer>
      </group>
    </>
  );
}
