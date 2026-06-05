import { Text, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MathUtils,
  Vector3,
  type Group,
  type Mesh,
} from 'three';
import { gsap } from 'gsap';

import {
  musicStudioItems,
  platformConfigs,
  resolveMusicStudioItemSelection,
  type MusicStudioItem,
} from './musicStudioModel';

const assetRoot = '/itomdev-clone';
const roomGroupPosition = new Vector3(0, -0.7, -2);
const roomCameraIdlePosition = new Vector3(0, 0.5, -5.5);
const roomCameraLeavingPosition = new Vector3(1.2, 0.2, -28.0);
const roomCameraLookTarget = new Vector3(0, -1.8, -12.0);

function asset(relativePath: string) {
  return `${assetRoot}${relativePath}`;
}

function usePointerParallax() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return pointer;
}

// Particle Backdrop
type ParticleSymbol = {
  text: string;
  size: number;
  weight: number;
};

const symbols: ParticleSymbol[] = [
  { text: '♪', size: 0.8, weight: 3 },
  { text: '♫', size: 0.8, weight: 4 },
  { text: '♬', size: 0.8, weight: 3 },
  { text: '♩', size: 0.7, weight: 2 },
  { text: '♭', size: 0.6, weight: 2 },
  { text: '♯', size: 0.6, weight: 2 },
];

function getRandomSymbol() {
  const total = symbols.reduce((acc, s) => acc + s.weight, 0);
  let r = Math.random() * total;
  for (const s of symbols) {
    r -= s.weight;
    if (r <= 0) return s;
  }
  return symbols[0];
}

function MusicStudioBackdropParticles({
  towerRotation,
  fallOffset,
  isFocused,
}: {
  towerRotation: number;
  fallOffset: number;
  isFocused: boolean;
}) {
  const count = 100;
  const particles = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const sym = getRandomSymbol();
      const initialX = (Math.random() - 0.5) * 50;
      const initialY = (Math.random() - 0.5) * 25;
      const z = -6 - Math.random() * 5;
      list.push({
        id: i,
        symbol: sym,
        initialX,
        initialY,
        z,
        driftSpeed: 0.1 + Math.random() * 0.2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        parallaxFactor: 0.3 + Math.random() * 0.7,
        phaseOffset: Math.random() * Math.PI * 2,
        opacity: 0.18 * (0.5 + Math.random() * 0.5),
        rotationZ: Math.random() * Math.PI * 2,
      });
    }
    return list;
  }, []);

  const textRefs = useRef<(any)[]>([]);
  const yOffsets = useRef<number[]>(particles.map(() => 0));
  const smoothRotation = useRef(0);
  const [globalOpacity, setGlobalOpacity] = useState(1.0);

  useEffect(() => {
    const targetVal = isFocused ? 0.08 : 1.0;
    const obj = { val: globalOpacity };
    gsap.to(obj, {
      val: targetVal,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        setGlobalOpacity(obj.val);
      },
    });
  }, [isFocused]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    smoothRotation.current = MathUtils.lerp(smoothRotation.current, towerRotation, 0.08);

    const rangeX = 50;
    const halfX = rangeX / 2;
    const minY = -15;
    const maxY = 15;
    const rangeY = maxY - minY;

    particles.forEach((p, i) => {
      const textMesh = textRefs.current[i];
      if (!textMesh) return;

      yOffsets.current[i] -= fallOffset * delta * p.parallaxFactor * 1.5;
      const drift = Math.sin(time * p.driftSpeed + p.phaseOffset) * 0.3;
      let y = p.initialY + yOffsets.current[i] + drift;

      // Wrap Y
      while (y < minY) {
        yOffsets.current[i] += rangeY;
        y += rangeY;
      }
      while (y > maxY) {
        yOffsets.current[i] -= rangeY;
        y -= rangeY;
      }
      textMesh.position.y = y;

      // Parallax X based on tower rotation
      const rotationOffset = smoothRotation.current * 5;
      let x = p.initialX + rotationOffset * p.parallaxFactor;
      x = ((((x + halfX) % rangeX) + rangeX) % rangeX) - halfX;
      textMesh.position.x = x;
      textMesh.position.z = p.z;
      textMesh.rotation.z = p.rotationZ + time * p.rotationSpeed;
    });
  });

  return (
    <group position={[0, 0, -10]}>
      {particles.map((p, i) => (
        <Text
          key={p.id}
          ref={(el) => {
            textRefs.current[i] = el;
          }}
          position={[p.initialX, p.initialY, p.z]}
          fontSize={p.symbol.size}
          color="#1a1a1a"
          anchorX="center"
          anchorY="middle"
          fillOpacity={p.opacity * globalOpacity}
          font="/fonts/CabinSketch-Bold.ttf"
        >
          {p.symbol.text}
        </Text>
      ))}
    </group>
  );
}

// Exit Plaque
// Exit board removed in favor of HTML button.

// 3D Devices in tornado
function MusicStudioDevice({
  item,
  onDeviceClick,
  isSelected,
  disabled,
  textures,
}: {
  item: any;
  onDeviceClick: (item: any) => void;
  isSelected: boolean;
  disabled: boolean;
  textures: any;
}) {
  const paintedMeshRef = useRef<Mesh>(null);
  const paintedScreenRef = useRef<Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [deviceOpacity, setDeviceOpacity] = useState(1.0);

  // Fade out when another device is focused
  useEffect(() => {
    const targetVal = disabled && !isSelected ? 0.12 : 1.0;
    const obj = { val: deviceOpacity };
    gsap.to(obj, {
      val: targetVal,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        setDeviceOpacity(obj.val);
      },
    });
  }, [disabled, isSelected]);

  // Smooth hover to painted transition
  useEffect(() => {
    const shouldShowPaint = isHovered || isSelected;
    const targets = [];
    if (paintedMeshRef.current) {
      const mats = Array.isArray(paintedMeshRef.current.material)
        ? paintedMeshRef.current.material
        : [paintedMeshRef.current.material];
      targets.push(...mats);
    }
    if (paintedScreenRef.current) {
      targets.push(paintedScreenRef.current.material);
    }

    targets.forEach((mat: any) => {
      if (mat) {
        gsap.to(mat, {
          opacity: shouldShowPaint ? 1 : 0,
          duration: shouldShowPaint ? 0.6 : 0.45,
          ease: 'power2.out',
          overwrite: true,
        });
      }
    });
  }, [isHovered, isSelected]);

  // Extract main box materials
  const frontTex = useMemo(() => {
    if (item.shape === 'tv') {
      return { sketch: textures.tvFront, painted: textures.tvFrontPainted };
    }
    if (item.shape === 'monitor') {
      return { sketch: textures.monitorFront, painted: textures.monitorFrontPainted };
    }
    return { sketch: textures.phoneFront, painted: textures.phoneFrontPainted };
  }, [item.shape, textures]);

  const materials = useMemo(() => {
    if (item.shape === 'monitor') {
      return {
        sketch: [
          textures.monitorRight,
          textures.monitorLeft,
          textures.monitorTop,
          textures.monitorBottom,
          frontTex.sketch,
          textures.monitorBack,
        ],
        painted: [
          textures.monitorRightPainted,
          textures.monitorLeftPainted,
          textures.monitorTopPainted,
          textures.monitorBottomPainted,
          frontTex.painted,
          textures.monitorBackPainted,
        ],
      };
    }
    if (item.shape === 'tv') {
      return {
        sketch: [
          textures.tvSide,
          textures.tvSide,
          textures.tvTop,
          textures.tvBottom,
          frontTex.sketch,
          textures.tvBack,
        ],
        painted: [
          textures.tvSidePainted,
          textures.tvSidePainted,
          textures.tvTopPainted,
          textures.tvBottomPainted,
          frontTex.painted,
          textures.tvBackPainted,
        ],
      };
    }
    // Phone
    return {
      sketch: [
        textures.phoneSide,
        textures.phoneSide,
        textures.phoneSide,
        textures.phoneSide,
        frontTex.sketch,
        textures.phoneBack,
      ],
      painted: [
        textures.phoneSidePainted,
        textures.phoneSidePainted,
        textures.phoneSidePainted,
        textures.phoneSidePainted,
        frontTex.painted,
        textures.phoneBackPainted,
      ],
    };
  }, [item.shape, frontTex, textures]);

  // Extract screen textures (always-visible)
  const screenTex = useMemo(() => {
    if (item.id.startsWith('ms-yt-tv-001')) {
      return { sketch: textures.tvCustom1, painted: textures.tvCustom1Painted };
    }
    if (item.id.startsWith('ms-yt-mon-001')) {
      return { sketch: textures.bandCustom, painted: textures.bandCustom };
    }
    if (item.id.startsWith('ms-ig-001')) {
      return { sketch: textures.illustrationCustom, painted: textures.illustrationCustom };
    }
    if (item.id.startsWith('ms-ig-002')) {
      return { sketch: textures.tedxCustom, painted: textures.tedxCustom };
    }
    if (item.id.startsWith('ms-ig-003')) {
      return { sketch: textures.naalayakCustom, painted: textures.naalayakCustom };
    }
    return null;
  }, [item.id, textures]);

  const handlePointerOver = useCallback(
    (e: any) => {
      if (disabled) return;
      e.stopPropagation();
      setIsHovered(true);
      document.body.style.cursor = 'pointer';
    },
    [disabled],
  );

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  const handlePointerUp = useCallback(
    (e: any) => {
      if (disabled) return;
      e.stopPropagation();
      onDeviceClick(item);
    },
    [disabled, onDeviceClick, item],
  );

  // Screen plane geometry parameters
  const { screenW, screenH, offsetZ } = useMemo(() => {
    let screenW = item.width;
    let screenH = item.height;
    let offsetZ = item.depth / 2 + 0.002;

    if (item.shape === 'phone') {
      screenW = item.width - 0.08;
      screenH = item.height - 0.12;
    } else if (item.shape === 'monitor') {
      screenW = item.width - 0.1;
      screenH = item.height - 0.1;
    } else if (item.shape === 'tv') {
      screenW = item.width - 0.22;
      screenH = item.height - 0.22;
    }
    return { screenW, screenH, offsetZ };
  }, [item.width, item.height, item.depth, item.shape]);

  return (
    <group
      position={[item.x, item.baseY, item.z]}
      rotation={[0, item.rot, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerUp={handlePointerUp}
    >
      {/* Solid Backing Box to prevent transparency/ghosting */}
      <mesh>
        <boxGeometry args={[item.width - 0.02, item.height - 0.02, item.depth - 0.02]} />
        <meshBasicMaterial color="#faf7f0" transparent opacity={deviceOpacity} />
      </mesh>

      {/* Sketch (Unpainted) Device Casing */}
      <mesh>
        <boxGeometry args={[item.width, item.height, item.depth]} />
        {materials.sketch.map((map: any, i: number) => (
          <meshBasicMaterial
            key={`s-${i}`}
            attach={`material-${i}`}
            map={map}
            transparent
            opacity={deviceOpacity}
            alphaTest={0.05}
          />
        ))}
      </mesh>

      {/* Painted Device Casing Overlay */}
      <mesh ref={paintedMeshRef}>
        <boxGeometry args={[item.width, item.height, item.depth]} />
        {materials.painted.map((map: any, i: number) => (
          <meshBasicMaterial
            key={`p-${i}`}
            attach={`material-${i}`}
            map={map}
            transparent
            opacity={0}
            alphaTest={0.05}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        ))}
      </mesh>

      {/* Phone Casing Detailing */}
      {item.shape === 'phone' && (
        <group>
          {/* Side Power Button */}
          <mesh position={[item.width / 2 + 0.005, 0.1, 0]}>
            <boxGeometry args={[0.01, 0.12, 0.02]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={deviceOpacity} />
          </mesh>
          {/* Side Volume Buttons */}
          <mesh position={[-item.width / 2 - 0.005, 0.2, 0]}>
            <boxGeometry args={[0.01, 0.18, 0.02]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={deviceOpacity} />
          </mesh>
          {/* Camera Notch/Punch-hole */}
          <mesh position={[0, item.height / 2 - 0.06, item.depth / 2 + 0.003]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.001, 16]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={deviceOpacity} />
          </mesh>
          {/* Speaker Grill */}
          <mesh position={[0, item.height / 2 - 0.02, item.depth / 2 + 0.003]}>
            <planeGeometry args={[0.1, 0.008]} />
            <meshBasicMaterial color="#333333" transparent opacity={deviceOpacity} />
          </mesh>
          {/* Outer Black Bezel Overlay */}
          <mesh position={[0, 0, item.depth / 2 + 0.001]}>
            <planeGeometry args={[item.width - 0.04, item.height - 0.06]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={deviceOpacity} />
          </mesh>
        </group>
      )}

      {/* Monitor Casing Detailing (Stand & Base) */}
      {item.shape === 'monitor' && (
        <group>
          {/* Monitor Neck */}
          <mesh position={[0, -item.height / 2 - 0.1, -0.02]}>
            <boxGeometry args={[0.08, 0.2, 0.04]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={deviceOpacity} />
          </mesh>
          {/* Monitor Base */}
          <mesh position={[0, -item.height / 2 - 0.2, 0]}>
            <boxGeometry args={[0.3, 0.01, 0.2]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={deviceOpacity} />
          </mesh>
          {/* Outer Black Bezel Overlay */}
          <mesh position={[0, 0, item.depth / 2 + 0.001]}>
            <planeGeometry args={[item.width - 0.06, item.height - 0.06]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={deviceOpacity} />
          </mesh>
        </group>
      )}

      {/* TV Casing Detailing */}
      {item.shape === 'tv' && (
        <group>
          {/* Outer Black Bezel Overlay */}
          <mesh position={[0, 0, item.depth / 2 + 0.001]}>
            <planeGeometry args={[item.width - 0.12, item.height - 0.12]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={deviceOpacity} />
          </mesh>
        </group>
      )}

      {/* Custom Screen plane overlay (always-visible) */}
      {screenTex && (
        <group>
          {/* Sketch Front Screen (Always visible, maps custom/photo texture) */}
          <mesh position={[0, 0, offsetZ]}>
            <planeGeometry args={[screenW, screenH]} />
            <meshBasicMaterial
              map={screenTex.sketch}
              transparent
              opacity={deviceOpacity}
              alphaTest={0.05}
            />
          </mesh>

          {/* Painted Front Screen (Fades in on hover) */}
          <mesh ref={paintedScreenRef} position={[0, 0, offsetZ + 0.001]}>
            <planeGeometry args={[screenW, screenH]} />
            <meshBasicMaterial
              map={screenTex.painted}
              transparent
              opacity={0}
              alphaTest={0.05}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Main Music Studio Room
export function MusicStudioRoom({
  onRequestExit,
  triggerExit,
  onFocusDevice,
  focusedDevice,
  onReady,
}: {
  onRequestExit: () => void;
  triggerExit?: boolean;
  onFocusDevice: (item: MusicStudioItem | null) => void;
  focusedDevice: MusicStudioItem | null;
  onReady?: () => void;
}) {
  const { camera, size, gl } = useThree();
  const pointer = usePointerParallax();
  const roomGroupRef = useRef<Group>(null);
  const towerRef = useRef<Group>(null);

  const [isLeaving, setIsLeaving] = useState(false);
  const hasTriggeredExit = useRef(false);
  const isFirstFrameRef = useRef(true);



  useEffect(() => {
    if (triggerExit) {
      setIsLeaving(true);
    }
  }, [triggerExit]);

  // Load textures
  const textures = {
    // Monitor
    monitorFront: useTexture(asset('/textures/studio/monitor_front.webp')),
    monitorFrontPainted: useTexture(asset('/textures/studio/monitor_front_painted.webp')),
    monitorBack: useTexture(asset('/textures/studio/monitor_back.webp')),
    monitorTop: useTexture(asset('/textures/studio/monitor_top.webp')),
    monitorBottom: useTexture(asset('/textures/studio/monitor_bottom.webp')),
    monitorLeft: useTexture(asset('/textures/studio/monitor_left.webp')),
    monitorRight: useTexture(asset('/textures/studio/monitor_right.webp')),
    monitorBackPainted: useTexture(asset('/textures/studio/monitor_back_painted.webp')),
    monitorTopPainted: useTexture(asset('/textures/studio/monitor_top_painted.webp')),
    monitorBottomPainted: useTexture(asset('/textures/studio/monitor_bottom_painted.webp')),
    monitorLeftPainted: useTexture(asset('/textures/studio/monitor_left_painted.webp')),
    monitorRightPainted: useTexture(asset('/textures/studio/monitor_right_painted.webp')),

    // TV
    tvFront: useTexture(asset('/textures/studio/tv_front.webp')),
    tvFrontPainted: useTexture(asset('/textures/studio/tv_front_painted.webp')),
    tvBack: useTexture(asset('/textures/studio/tv_back.webp')),
    tvTop: useTexture(asset('/textures/studio/tv_top.webp')),
    tvBottom: useTexture(asset('/textures/studio/tv_bottom.webp')),
    tvSide: useTexture(asset('/textures/studio/tv_side.webp')),
    tvBackPainted: useTexture(asset('/textures/studio/tv_back_painted.webp')),
    tvTopPainted: useTexture(asset('/textures/studio/tv_top_painted.webp')),
    tvBottomPainted: useTexture(asset('/textures/studio/tv_bottom_painted.webp')),
    tvSidePainted: useTexture(asset('/textures/studio/tv_side_painted.webp')),

    // Phone
    phoneFront: useTexture(asset('/textures/studio/phone_front.webp')),
    phoneFrontPainted: useTexture(asset('/textures/studio/phone_front_painted.webp')),
    phoneBack: useTexture(asset('/textures/studio/phone_back.webp')),
    phoneSide: useTexture(asset('/textures/studio/phone_side.webp')),
    phoneBackPainted: useTexture(asset('/textures/studio/phone_back_painted.webp')),
    phoneSidePainted: useTexture(asset('/textures/studio/phone_side_painted.webp')),

    // Custom
    tvCustom1: useTexture(asset('/textures/studio/tvfront_filmikprojektdlamultiego.webp')),
    tvCustom1Painted: useTexture(asset('/textures/studio/tvfront_filmikprojektdlamultiego_painted.webp')),
    illustrationCustom: useTexture(asset('/textures/studio/Illustration_painted.jpg')),
    bandCustom: useTexture(asset('/textures/studio/Aandolan_painted.jpg')),
    tedxCustom: useTexture(asset('/textures/studio/TedX_painted.jpg')),
    naalayakCustom: useTexture(asset('/textures/studio/Naalayak_painted.jpg')),
  };

  // Set texture filtering and anisotropy once on mount
  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    [
      textures.monitorFront, textures.monitorFrontPainted, textures.monitorBack,
      textures.monitorTop, textures.monitorBottom, textures.monitorLeft,
      textures.monitorRight, textures.monitorBackPainted, textures.monitorTopPainted,
      textures.monitorBottomPainted, textures.monitorLeftPainted, textures.monitorRightPainted,
      textures.tvFront, textures.tvFrontPainted, textures.tvBack,
      textures.tvTop, textures.tvBottom, textures.tvSide,
      textures.tvBackPainted, textures.tvTopPainted, textures.tvBottomPainted,
      textures.tvSidePainted, textures.phoneFront, textures.phoneFrontPainted,
      textures.phoneBack, textures.phoneSide, textures.phoneBackPainted,
      textures.phoneSidePainted, textures.tvCustom1, textures.tvCustom1Painted,
      textures.illustrationCustom, textures.bandCustom,
      textures.tedxCustom, textures.naalayakCustom
    ].forEach((tex) => {
      if (tex) {
        tex.anisotropy = maxAnisotropy;
        tex.minFilter = 1008; // LinearMipmapLinearFilter
        tex.magFilter = 1006; // LinearFilter
        tex.generateMipmaps = true;
        tex.needsUpdate = true;
      }
    });
  }, [gl]);

  const isMobile = size.width < 768;
  const isTablet = size.width < 1024 && size.width >= 768;
  const towerRadius = isMobile ? 1.5 : isTablet ? 1.8 : 2.2;
  const zoomDistance = isMobile ? 2.0 : isTablet ? 3.0 : 3.0;
  const panRight = isMobile ? 0 : isTablet ? 0.7 : 1.15;
  const panDown = isMobile ? 0.38 : 0;
  const yOffset = isMobile ? 2.5 : isTablet ? -3.0 : -6.0;

  // Build coordinate items in a vertical spiral (helix) with duplicated items
  const { items, totalHeight } = useMemo(() => {
    const list: any[] = [];
    const repetitions = 3; // Repeat the 5 items 3 times to get 15 items in the tornado
    for (let r = 0; r < repetitions; r++) {
      musicStudioItems.forEach((item) => {
        list.push({
          ...item,
          id: `${item.id}-rep-${r}`,
        });
      });
    }

    const len = list.length;
    const heightSpacing = 1.3; // Closer vertical spacing for a denser tornado
    const processed = [];

    for (let i = 0; i < len; i++) {
      const item = list[i];
      // Distribute angles around the cylinder so they spiral continuously with Danish's Flute channel at front-center on start
      const angle = i * 1.35 + Math.PI / 2; 
      const x = Math.cos(angle) * towerRadius;
      const z = Math.sin(angle) * towerRadius;
      const baseY = i * heightSpacing;

      // Shape sizes
      let width = 1.4;
      let height = 1.0;
      let depth = 0.6;
      const config = platformConfigs[item.platform as keyof typeof platformConfigs];

      if (config.shape === 'tv') {
        width = 1.6;
        height = 1.187;
        depth = 1.0;
      } else if (config.shape === 'monitor') {
        width = 1.6;
        height = 1.0;
        depth = 0.15;
      } else if (config.shape === 'phone') {
        width = 0.6;
        height = 1.139;
        depth = 0.1;
      }

      processed.push({
        ...item,
        index: i,
        x,
        baseY,
        z,
        width,
        height,
        depth,
        angle,
        rot: -angle + Math.PI / 2,
        shape: config.shape,
        color: config.color,
        accentColor: config.accentColor,
      });
    }

    const computedTotalHeight = len * heightSpacing;

    return { items: processed, totalHeight: computedTotalHeight };
  }, [towerRadius]);

  const entryProgress = useRef(0);
  const leaveProgress = useRef(0);
  const entryStartPosition = useRef(camera.position.clone());
  const currentLookAt = useRef(new Vector3(0, 0.15, camera.position.z - 10));
  const targetLookAt = useRef(roomCameraLookTarget.clone());

  // Tornado physics variables
  const isDragging = useRef(false);
  const startPointerX = useRef(0);
  const startPointerY = useRef(0);
  const dragProgressX = useRef(0);
  const spinVelocity = useRef(0.12);
  const verticalDriftVelocity = useRef(0.3); // fallOffset
  const yOffsets = useRef<number[]>(items.map(() => 0));

  // Camera zoom coordinates
  const savedCameraPos = useRef<Vector3 | null>(null);

  // Drag and Wheel controls
  const handlePointerDown = useCallback((event: any) => {
    if (focusedDevice) return;
    event.stopPropagation();
    isDragging.current = true;
    startPointerX.current = event.clientX;
    startPointerY.current = event.clientY;
    dragProgressX.current = 0;
    spinVelocity.current = 0;
    document.body.style.cursor = 'grabbing';
  }, [focusedDevice]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging.current || !towerRef.current || focusedDevice) return;
      const deltaX = event.clientX - startPointerX.current;
      const deltaY = event.clientY - startPointerY.current;

      startPointerX.current = event.clientX;
      startPointerY.current = event.clientY;

      dragProgressX.current += Math.abs(deltaX) + Math.abs(deltaY);

      // Rotate tower
      towerRef.current.rotation.y += deltaX * 0.008;
      // Vertically slide tornado
      verticalDriftVelocity.current += deltaY * 0.005;
    };

    const handlePointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'auto';
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (focusedDevice) return;
      verticalDriftVelocity.current += event.deltaY * 0.006;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [focusedDevice]);

  // Click on monitor: Zoom to target
  const handleDeviceClick = useCallback((item: any) => {
    if (isDragging.current && dragProgressX.current > 5) return;
    if (focusedDevice || !towerRef.current) return;

    onFocusDevice(item);
    spinVelocity.current = 0;

    // Rotate tower so item faces camera
    let targetRot = -item.rot;
    let currentRot = towerRef.current.rotation.y % (Math.PI * 2);
    if (currentRot < 0) currentRot += Math.PI * 2;
    while (targetRot < 0) targetRot += Math.PI * 2;
    targetRot = targetRot % (Math.PI * 2);

    let diff = targetRot - currentRot;
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;

    const newTowerRot = towerRef.current.rotation.y + diff;

    // Trigger GSAP zoom sequence
    gsap.to(towerRef.current.rotation, {
      y: newTowerRot,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        if (!savedCameraPos.current) {
          savedCameraPos.current = camera.position.clone();
        }

        const deviceWorldY = -5.7 + (item.baseY + yOffsets.current[item.index]);
        const deviceWorldZ = -12.0 + towerRadius;
        const isMobile = size.width < 768;

        // Custom responsive zoom distance based on device shape
        let customZoomDistance = 2.2;
        if (item.shape === 'phone') {
          customZoomDistance = isMobile ? 1.6 : 2.2;
        } else if (item.shape === 'monitor') {
          customZoomDistance = isMobile ? 2.2 : 3.0;
        } else if (item.shape === 'tv') {
          customZoomDistance = isMobile ? 2.4 : 3.4;
        }

        const zoomX = panRight;
        const zoomY = deviceWorldY - panDown;
        const zoomZ = deviceWorldZ + customZoomDistance;

        gsap.to(camera.position, {
          x: zoomX,
          y: zoomY,
          z: zoomZ,
          duration: 0.8,
          ease: 'power2.inOut',
        });
      },
    });
  }, [camera, focusedDevice, onFocusDevice, size.width, towerRadius, panRight, panDown]);

  // Unzoom camera
  useEffect(() => {
    if (!focusedDevice && savedCameraPos.current) {
      gsap.to(camera.position, {
        x: savedCameraPos.current.x,
        y: savedCameraPos.current.y,
        z: savedCameraPos.current.z,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          savedCameraPos.current = null;
        },
      });
    }
  }, [focusedDevice, camera]);

  // Frame animation loops
  useFrame((_, delta) => {
    if (isFirstFrameRef.current) {
      isFirstFrameRef.current = false;
      onReady?.();
    }

    if (roomGroupRef.current) {
      roomGroupRef.current.position.lerp(roomGroupPosition, 1 - Math.exp(-delta * 8));
    }

    // Exiting room
    if (isLeaving) {
      leaveProgress.current = Math.min(1, leaveProgress.current + delta * 2.5);
      const leaveEase = 1 - Math.pow(1 - leaveProgress.current, 3);
      const parallaxMultiplier = 0.18 * (1 - leaveEase);

      const leavingPosition = new Vector3(
        roomCameraLeavingPosition.x + pointer.current.x * parallaxMultiplier,
        roomCameraLeavingPosition.y - pointer.current.y * parallaxMultiplier * 0.45,
        roomCameraLeavingPosition.z,
      );

      camera.position.lerp(leavingPosition, 1 - Math.exp(-delta * 6));
      targetLookAt.current.lerp(new Vector3(1.2, 0.6, -2.8), 1 - Math.exp(-delta * 6));
      currentLookAt.current.lerp(targetLookAt.current, 1 - Math.exp(-delta * 7));
      camera.lookAt(currentLookAt.current);

      if (leaveProgress.current > 0.98 && !hasTriggeredExit.current) {
        hasTriggeredExit.current = true;
        onRequestExit();
      }
      return;
    }

    // Normal continuous tornado spin & camera tracking
    if (towerRef.current && !isDragging.current && !focusedDevice) {
      // Tower spin velocity friction
      towerRef.current.rotation.y += spinVelocity.current * delta;
      spinVelocity.current = MathUtils.lerp(spinVelocity.current, 0.12, delta * 2);

      // Vertical drift friction
      const targetDriftVel = verticalDriftVelocity.current > 0 ? 0.3 : -0.3;
      verticalDriftVelocity.current = MathUtils.lerp(verticalDriftVelocity.current, targetDriftVel, 0.015);

      // Apply vertical drift & wrap items
      items.forEach((item, index) => {
        yOffsets.current[index] -= verticalDriftVelocity.current * delta;
        const currentY = item.baseY + yOffsets.current[index];

        if (currentY < -2 && verticalDriftVelocity.current > 0) {
          yOffsets.current[index] += totalHeight;
        } else if (currentY > totalHeight - 2 && verticalDriftVelocity.current < 0) {
          yOffsets.current[index] -= totalHeight;
        }

        const meshEl = towerRef.current?.children[index + 1] as Group; // skip invisible cylinder
        if (meshEl) {
          meshEl.position.y = item.baseY + yOffsets.current[index];
        }
      });
    }

    // Camera lookAt tracking
    if (focusedDevice) {
      const deviceWorldY = -5.7 + ((focusedDevice as any).baseY + yOffsets.current[(focusedDevice as any).index]);
      const targetX = camera.position.x - (panRight * 0.45);
      const targetY = deviceWorldY;
      const targetZ = -12.0 + towerRadius;

      targetLookAt.current.set(targetX, targetY, targetZ);
      currentLookAt.current.lerp(targetLookAt.current, 1 - Math.exp(-delta * 8));
      camera.lookAt(currentLookAt.current);
    } else {
      const roomParallaxScale = 0.18;
      const lookTarget = new Vector3(
        roomCameraLookTarget.x + pointer.current.x * roomParallaxScale * 0.2,
        roomCameraLookTarget.y - pointer.current.y * roomParallaxScale * 0.12,
        roomCameraLookTarget.z,
      );
      currentLookAt.current.lerp(lookTarget, 1 - Math.exp(-delta * 8));
      camera.lookAt(currentLookAt.current);
    }

    // Entry camera interpolation
    if (!focusedDevice && !savedCameraPos.current) {
      entryProgress.current = Math.min(1, entryProgress.current + delta * 1.4);
      const entryEase = 1 - Math.pow(1 - entryProgress.current, 3);
      const roomParallaxScale = 0.18;
      const targetPosition = new Vector3(
        roomCameraIdlePosition.x + pointer.current.x * roomParallaxScale,
        roomCameraIdlePosition.y - pointer.current.y * roomParallaxScale * 0.4,
        roomCameraIdlePosition.z,
      );

      camera.position.lerpVectors(entryStartPosition.current, targetPosition, entryEase);
    }

    if (towerRef.current) {
      items.forEach((item, index) => {
        const meshEl = towerRef.current?.children[index + 1] as Group;
        if (meshEl) {
          if (focusedDevice && focusedDevice.id === item.id) {
            // Face the camera directly when focused
            const deviceWorldZ = -12.0 + towerRadius;
            const dx = camera.position.x;
            const dz = camera.position.z - deviceWorldZ;
            const lookAngle = Math.atan2(dx, dz);
            meshEl.rotation.y = lookAngle - towerRef.current!.rotation.y;
          } else {
            // Normal billboarding
            const currentAngle = item.angle + towerRef.current!.rotation.y;
            const rx = Math.cos(currentAngle) * towerRadius;
            const rz = Math.sin(currentAngle) * towerRadius;
            const lookAngle = Math.atan2(camera.position.x - rx, 4.5 - rz);
            meshEl.rotation.y = lookAngle - towerRef.current!.rotation.y;
          }
        }
      });
    }
  });

  const displayTowerRotation = towerRef.current?.rotation.y ?? 0;
  const displayFallOffset = verticalDriftVelocity.current;

  return (
    <group ref={roomGroupRef} position={roomGroupPosition.toArray()}>
      {/* Tornado Group */}
      <group
        ref={towerRef}
        position={[0, -5, -10]}
        onPointerDown={handlePointerDown}
      >
        {/* Invisible cylinder physics zone */}
        <mesh visible={false}>
          <cylinderGeometry args={[towerRadius + 0.5, towerRadius + 0.5, 18, 16]} />
          <meshBasicMaterial color="#e0e0e0" />
        </mesh>

        {items.map((item, index) => (
          <MusicStudioDevice
            key={item.id}
            item={item}
            isSelected={focusedDevice?.id === item.id}
            onDeviceClick={handleDeviceClick}
            disabled={Boolean(focusedDevice)}
            textures={textures}
          />
        ))}
      </group>

      {/* Code symbol background particles */}
      <MusicStudioBackdropParticles
        towerRotation={displayTowerRotation}
        fallOffset={displayFallOffset}
        isFocused={Boolean(focusedDevice)}
      />

      {/* Room Title */}
      <Text
        position={[0, 4.3, -11.0]}
        font="/fonts/CabinSketch-Bold.ttf"
        fontSize={0.62}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        fillOpacity={focusedDevice ? 0.05 : 1.0}
      >
        Music Studio
      </Text>
      <Text
        position={[0, 3.5, -11.0]}
        font="/fonts/CabinSketch-Bold.ttf"
        fontSize={0.24}
        color="#4a4a4a"
        anchorX="center"
        anchorY="middle"
        fillOpacity={focusedDevice ? 0.05 : 1.0}
      >
        Swipe to spin the tornado • Touch a screen to inspect
      </Text>
    </group>
  );
}
