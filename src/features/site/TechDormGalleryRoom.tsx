import { Line, Text, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CatmullRomCurve3,
  MathUtils,
  RepeatWrapping,
  Shape,
  ShapeGeometry,
  TubeGeometry,
  Vector3,
  type Group,
  type Mesh,
  type Texture,
} from 'three';
import { gsap } from 'gsap';

import {
  createGithubBannerSvg,
  createTechDormPosterBackSvg,
  createTechDormPosterFrontSvg,
  resolveTechDormPosterSelection,
  techDormGalleryPosters,
  type TechDormGalleryPoster,
  type TechDormPosterId,
} from './techDormGalleryModel';
import { techDormGallerySceneModel } from './techDormGallerySceneModel';

const assetRoot = '/itomdev-clone';
const roomGroupPosition = new Vector3(0, -0.7, -2);
const galleryRigPosition = new Vector3(0, 1.6, -5.8);
const roomCameraIdlePosition = new Vector3(0, 1.18, 1.0);
const roomCameraLeavingPosition = new Vector3(0, 1.05, 4.8);
const roomCameraLookTarget = new Vector3(0, 1.55, -4.6);
const posterOpenTarget = new Vector3(0, 0.45, -1);

type ScenePoint = {
  x: number;
  y: number;
  z: number;
};

type TechDormGallerySceneModel = typeof techDormGallerySceneModel & {
  hangingCable?: {
    position: ScenePoint;
    width: number;
  };
  poster: typeof techDormGallerySceneModel.poster & {
    openPosition?: ScenePoint;
    positions?: readonly ScenePoint[];
  };
};

const sceneModel = techDormGallerySceneModel as TechDormGallerySceneModel;
const defaultPosterHangPoints = [
  new Vector3(-2.6, 2.3, -4),
  new Vector3(0, 1.7, -3.2),
  new Vector3(2.6, 2.3, -4),
];
const defaultHangingCablePosition = new Vector3(0, 3.58, -4.3);

function pointToVector(point: ScenePoint | undefined, fallback: Vector3) {
  if (!point) {
    return fallback.clone();
  }

  return new Vector3(point.x, point.y, point.z);
}

function asset(relativePath: string) {
  return `${assetRoot}${relativePath}`;
}

type HoverMesh = Mesh & {
  material: {
    opacity: number;
  };
};

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

function birdStep(positionRef: { current: Group | null }, delta: number) {
  if (!positionRef.current) {
    return;
  }

  positionRef.current.position.x += 2.4 * delta;
  if (positionRef.current.position.x > 20) {
    positionRef.current.position.x = -20;
    positionRef.current.position.y = 4.3;
    positionRef.current.rotation.z = 0;
  }

  const yFloat = Math.sin(positionRef.current.position.x * 0.45) * 0.2;
  positionRef.current.position.y = MathUtils.lerp(
    positionRef.current.position.y,
    4.8 + yFloat,
    0.12,
  );
  positionRef.current.rotation.z = MathUtils.lerp(
    positionRef.current.rotation.z,
    Math.sin(positionRef.current.position.x * 0.35) * 0.12,
    0.18,
  );
}

function getCurvePointAtX(curve: CatmullRomCurve3, targetX: number): Vector3 {
  let minT = 0, maxT = 1;
  const temp = new Vector3();
  for (let i = 0; i < 20; i++) {
    const midT = (minT + maxT) / 2;
    curve.getPoint(midT, temp);
    if (temp.x < targetX) {
      minT = midT;
    } else {
      maxT = midT;
    }
  }
  return curve.getPoint((minT + maxT) / 2);
}

function GithubBirdBanner() {
  const [isHovered, setIsHovered] = useState(false);
  const [bannerSketch] = useState(() => createGithubBannerSvg(false));
  const [bannerPainted] = useState(() => createGithubBannerSvg(true));
  const sketchTex = useTexture(bannerSketch);
  const paintedTex = useTexture(bannerPainted);

  return (
    <group>
      {/* Trailing strings */}
      <Line
        points={[[-0.2, -0.05, 0.005], [-1.0, 0.18, 0.005]]}
        color="#1d1d1d"
        lineWidth={1.5}
      />
      <Line
        points={[[-0.2, -0.15, 0.005], [-1.0, -0.18, 0.005]]}
        color="#1d1d1d"
        lineWidth={1.5}
      />

      {/* Rectangular Banner */}
      <mesh
        position={[-2.1, 0, 0.01]}
        onClick={(e) => {
          e.stopPropagation();
          window.open('https://github.com/Danish2op', '_blank');
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setIsHovered(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
          setIsHovered(false);
        }}
      >
        <planeGeometry args={[2.2, 0.69]} />
        <meshBasicMaterial
          map={isHovered ? paintedTex : sketchTex}
          transparent
          alphaTest={0.05}
          side={2}
        />
      </mesh>
    </group>
  );
}

function TechDormPoster({
  anchor,
  backTexture,
  clothespinTexture,
  frontPaintedTexture,
  frontSketchTexture,
  isSelected,
  onSelect,
  poster,
}: {
  anchor: Vector3;
  backTexture: Texture;
  clothespinTexture: Texture;
  frontPaintedTexture: Texture;
  frontSketchTexture: Texture;
  isSelected: boolean;
  onSelect: (posterId: TechDormPosterId) => void;
  poster: TechDormGalleryPoster;
}) {
  const rootRef = useRef<Group>(null);
  const cardRef = useRef<Group>(null);
  const paintedFrontRef = useRef<HoverMesh>(null);
  const sketchFrontRef = useRef<HoverMesh>(null);
  const cardShadowRef = useRef<Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const phase = useMemo(() => Math.random() * 10, []);
  const posterSize = sceneModel.poster.size;
  const posterScale = Math.max(sceneModel.poster.focusScale, 1.72);
  const stringOffsetX = sceneModel.poster.stringOffsetX;
  const stringWidth = sceneModel.poster.stringWidth;
  const basePosition = useMemo(() => new Vector3(0, -1.30, 0.28), []);
  const openPosition = useMemo(
    () => {
      const openTarget = pointToVector(sceneModel.poster.openPosition, posterOpenTarget);
      return new Vector3(
        openTarget.x - anchor.x,
        openTarget.y - anchor.y,
        openTarget.z - anchor.z,
      );
    },
    [anchor],
  );

  useEffect(() => {
    if (!cardRef.current) {
      return;
    }

    const timeline = gsap.timeline();

    if (isSelected) {
      timeline
        .to(
          cardRef.current.rotation,
          {
            x: 0.05,
            y: Math.PI,
            z: 0,
            duration: 0.4,
            ease: 'power1.out',
          },
          0,
        )
        .to(
          cardRef.current.position,
          {
            x: openPosition.x,
            y: openPosition.y,
            z: openPosition.z,
            duration: 0.4,
            ease: 'power1.out',
          },
          0,
        )
        .to(
          cardRef.current.scale,
          {
            x: posterScale,
            y: posterScale,
            z: posterScale,
            duration: 0.4,
            ease: 'power1.out',
          },
          0,
        );
    } else {
      timeline
        .to(cardRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.35,
          ease: 'power2.in',
        }, 0)
        .to(
          cardRef.current.rotation,
          {
            x: 0.04,
            y: 0.15,
            z: -0.03,
            duration: 0.35,
            ease: 'power2.in',
          },
          0,
        )
        .to(cardRef.current.position, {
          x: basePosition.x,
          y: basePosition.y,
          z: basePosition.z,
          duration: 0.35,
          ease: 'power2.in',
        }, 0)
        .to(cardRef.current.rotation, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.35,
          ease: 'power2.in',
        }, 0);
    }

    return () => {
      timeline.kill();
    };
  }, [basePosition, isSelected, openPosition, posterScale]);

  useEffect(() => {
    const shouldShowPaint = isHovered || isSelected;

    if (paintedFrontRef.current?.material) {
      gsap.to(paintedFrontRef.current.material, {
        opacity: shouldShowPaint ? 1 : 0,
        duration: shouldShowPaint ? 0.8 : 0.45,
        ease: 'power2.out',
        overwrite: true,
      });
    }

    if (sketchFrontRef.current?.material) {
      gsap.to(sketchFrontRef.current.material, {
        opacity: shouldShowPaint ? 0 : 1,
        duration: shouldShowPaint ? 0.55 : 0.35,
        ease: 'power2.out',
        overwrite: true,
      });
    }
  }, [isHovered, isSelected]);

  useFrame(({ clock }, delta) => {
    if (!rootRef.current) {
      return;
    }

    const time = clock.getElapsedTime() + phase;
    rootRef.current.position.set(
      anchor.x,
      anchor.y + Math.sin(time * 0.7) * 0.03,
      anchor.z,
    );

    if (!isSelected) {
      rootRef.current.rotation.z = Math.sin(time * 0.9) * 0.025;
      if (cardShadowRef.current) {
        const hoverScale = isHovered ? 1.03 : 1;
        cardShadowRef.current.scale.x = MathUtils.lerp(
          cardShadowRef.current.scale.x,
          hoverScale,
          1 - Math.exp(-delta * 10),
        );
        cardShadowRef.current.scale.y = MathUtils.lerp(
          cardShadowRef.current.scale.y,
          hoverScale,
          1 - Math.exp(-delta * 10),
        );
      }
      return;
    }

    rootRef.current.rotation.z = MathUtils.lerp(
      rootRef.current.rotation.z,
      0,
      1 - Math.exp(-delta * 10),
    );
  });

  const handlePointerEnter = useCallback((event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback((event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    document.body.style.cursor = 'auto';
    setIsHovered(false);
  }, []);

  return (
    <group ref={rootRef}>
      {/* Clothespin directly on the wire */}
      <mesh position={[0, -0.08, 0.15]} rotation={[0, 0, Math.PI]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshBasicMaterial map={clothespinTexture} transparent alphaTest={0.1} side={2} />
      </mesh>

      <group
        ref={cardRef}
        position={[basePosition.x, basePosition.y, basePosition.z]}
        onClick={(event: any) => {
          event.stopPropagation();
          if (isSelected && poster.githubHref && event.uv) {
            const { x, y } = event.uv;
            if (x >= 0.21 && x <= 0.79 && y >= 0.14 && y <= 0.22) {
              window.open(poster.githubHref, '_blank');
              return;
            }
          }
          onSelect(poster.id);
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <group ref={cardShadowRef}>
          <mesh ref={paintedFrontRef} position={[0, 0, -0.002]}>
            <planeGeometry args={[posterSize.width, posterSize.height]} />
            <meshBasicMaterial
              map={frontPaintedTexture}
              transparent
              opacity={0}
              side={2}
              alphaTest={0.05}
              depthWrite={false}
            />
          </mesh>

          <mesh ref={sketchFrontRef} position={[0, 0, 0]}>
            <planeGeometry args={[posterSize.width, posterSize.height]} />
            <meshBasicMaterial
              map={frontSketchTexture}
              transparent
              opacity={1}
              side={2}
              alphaTest={0.05}
              depthWrite={false}
            />
          </mesh>

          <mesh position={[0, 0, -0.003]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[posterSize.width, posterSize.height]} />
            <meshBasicMaterial
              map={backTexture}
              transparent
              side={2}
              alphaTest={0.05}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function TechDormGalleryRoom({
  onRequestExit,
  triggerExit,
  onReady,
}: {
  onRequestExit: () => void;
  triggerExit?: boolean;
  onReady?: () => void;
}) {
  const { camera } = useThree();
  const pointer = usePointerParallax();
  const roomGroupRef = useRef<Group>(null);
  const birdRef = useRef<Group>(null);
  const [selectedPosterId, setSelectedPosterId] = useState<TechDormPosterId | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const hasTriggeredExit = useRef(false);

  useEffect(() => {
    if (triggerExit) {
      setIsLeaving(true);
    }
  }, [triggerExit]);
  const entryProgress = useRef(0);
  const leaveProgress = useRef(0);
  const entryStartPosition = useRef(camera.position.clone());
  const currentLookAt = useRef(new Vector3(0, 0.15, camera.position.z - 10));
  const targetLookAt = useRef(roomCameraLookTarget.clone());
  const isFirstFrameRef = useRef(true);

  const floorTexture = useTexture(asset('/textures/gallery/floor.webp'));
  const railingTexture = useTexture(asset('/textures/gallery/railing.webp'));
  const housesTexture = useTexture(asset('/textures/gallery/domki.webp'));
  const skylineTexture = useTexture(asset('/textures/gallery/miastotlo.webp'));
  const birdTexture = useTexture(asset('/textures/gallery/bird_gray.webp'));
  const clothespinTexture = useTexture(asset('/textures/gallery/klamerka.webp'));

  const housesRightTexture = useMemo(() => {
    const clone = housesTexture.clone();
    clone.offset.x = 0.2;
    clone.repeat.x = 0.8;
    clone.needsUpdate = true;
    return clone;
  }, [housesTexture]);

  const posterFrontSketchUris = useMemo(
    () => techDormGalleryPosters.map((poster) => createTechDormPosterFrontSvg(poster, false)),
    [],
  );
  const posterFrontPaintedUris = useMemo(
    () => techDormGalleryPosters.map((poster) => createTechDormPosterFrontSvg(poster, true)),
    [],
  );
  const posterBackUris = useMemo(
    () => techDormGalleryPosters.map(createTechDormPosterBackSvg),
    [],
  );

  const frontSketchTextures = useTexture(posterFrontSketchUris) as Texture[];
  const frontPaintedTextures = useTexture(posterFrontPaintedUris) as Texture[];
  const backTextures = useTexture(posterBackUris) as Texture[];

  useEffect(() => {
    [floorTexture, railingTexture].forEach((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
    });
    floorTexture.repeat.set(0.05, 0.09);
    railingTexture.repeat.set(10, 1);
    floorTexture.needsUpdate = true;
    railingTexture.needsUpdate = true;
  }, [floorTexture, railingTexture]);

  const balconyFloor = sceneModel.floor;
  const balconyRailing = sceneModel.railing;

  const floorShape = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-balconyFloor.innerWidth, -balconyFloor.backDepth);
    shape.lineTo(balconyFloor.innerWidth, -balconyFloor.backDepth);
    shape.lineTo(balconyFloor.outerWidth, balconyFloor.frontDepth);
    shape.lineTo(-balconyFloor.outerWidth, balconyFloor.frontDepth);
    shape.lineTo(-balconyFloor.innerWidth, -balconyFloor.backDepth);
    return new ShapeGeometry(shape);
  }, [balconyFloor.backDepth, balconyFloor.frontDepth, balconyFloor.innerWidth, balconyFloor.outerWidth]);

  const sharedCableCurve = useMemo(
    () => {
      return new CatmullRomCurve3([
        new Vector3(-16, 3.5, -6),
        new Vector3(-8, 2.5, -4.5),
        new Vector3(0, 1.8, -3),
        new Vector3(8, 2.5, -4.5),
        new Vector3(16, 3.5, -6),
      ]);
    },
    [],
  );

  const posterHangPoints = useMemo(() => {
    return [-3.6, -1.2, 1.2, 3.6].map((x) => getCurvePointAtX(sharedCableCurve, x));
  }, [sharedCableCurve]);

  const hangingCablePosition = useMemo(
    () => pointToVector(sceneModel.hangingCable?.position, defaultHangingCablePosition),
    [],
  );

  const hangingCableWidth = sceneModel.hangingCable?.width ?? 5.8;

  useFrame((_, delta) => {
    if (isFirstFrameRef.current) {
      isFirstFrameRef.current = false;
      onReady?.();
    }
    birdStep(birdRef, delta);

    if (roomGroupRef.current) {
      roomGroupRef.current.position.lerp(
        roomGroupPosition,
        1 - Math.exp(-delta * 8),
      );
    }

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
      targetLookAt.current.lerp(new Vector3(-1.2, 0.6, -2.8), 1 - Math.exp(-delta * 6));
      currentLookAt.current.lerp(targetLookAt.current, 1 - Math.exp(-delta * 7));
      camera.lookAt(currentLookAt.current);

      if (leaveProgress.current > 0.98 && !hasTriggeredExit.current) {
        hasTriggeredExit.current = true;
        onRequestExit();
      }

      return;
    }

    entryProgress.current = Math.min(1, entryProgress.current + delta * 1.4);
    const entryEase = 1 - Math.pow(1 - entryProgress.current, 3);
    const roomParallaxScale = selectedPosterId ? 0.06 : 0.18;
    const targetPosition = new Vector3(
      roomCameraIdlePosition.x + pointer.current.x * roomParallaxScale,
      roomCameraIdlePosition.y - pointer.current.y * roomParallaxScale * 0.4,
      roomCameraIdlePosition.z,
    );

    camera.position.lerpVectors(entryStartPosition.current, targetPosition, entryEase);

    const lookTarget = new Vector3(
      roomCameraLookTarget.x + pointer.current.x * roomParallaxScale * 0.2,
      roomCameraLookTarget.y - pointer.current.y * roomParallaxScale * 0.12,
      roomCameraLookTarget.z,
    );
    currentLookAt.current.lerp(lookTarget, 1 - Math.exp(-delta * 7));
    camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      <group ref={roomGroupRef} position={roomGroupPosition.toArray()}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={floorShape}>
          <meshBasicMaterial
            map={floorTexture}
            color="#e4e3dd"
            transparent
            alphaTest={0.1}
            side={2}
          />
        </mesh>

        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[balconyFloor.outerWidth * 2, 0.015, 0.02]} />
          <meshBasicMaterial color="#a39f97" />
        </mesh>

        <mesh position={[0, 0.625, -3.9]}>
          <planeGeometry args={[20, 1.25]} />
          <meshBasicMaterial
            map={railingTexture}
            color="#e6e5df"
            transparent
            opacity={0.78}
            alphaTest={0.1}
            side={2}
          />
        </mesh>

        <mesh position={[0, 0.01, -3.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 0.15]} />
          <meshBasicMaterial color="#ebe9e2" transparent opacity={0.88} />
        </mesh>

        <group position={galleryRigPosition.toArray()}>
          <mesh position={[0, 0, 0]}>
            <tubeGeometry args={[sharedCableCurve, 64, 0.012, 6, false]} />
            <meshBasicMaterial color="#666666" transparent opacity={0.92} />
          </mesh>

          {techDormGalleryPosters.map((poster, index) => (
            <TechDormPoster
              key={poster.id}
              anchor={posterHangPoints[index]}
              backTexture={backTextures[index] ?? backTextures[0]}
              clothespinTexture={clothespinTexture}
              frontPaintedTexture={frontPaintedTextures[index] ?? frontPaintedTextures[0]}
              frontSketchTexture={frontSketchTextures[index] ?? frontSketchTextures[0]}
              isSelected={selectedPosterId === poster.id}
              onSelect={(posterId) => {
                setSelectedPosterId((current) =>
                  resolveTechDormPosterSelection(current, posterId),
                );
              }}
              poster={poster}
            />
          ))}
        </group>

        <mesh position={[0, -1, -9]}>
          <planeGeometry args={[15, 15 / 2.357]} />
          <meshBasicMaterial
            map={housesTexture}
            color="#e0e0e0"
            transparent
            alphaTest={0.1}
            side={2}
          />
        </mesh>
        <mesh position={[-15, -1, -9]} scale={[-1, 1, 1]}>
          <planeGeometry args={[15, 15 / 2.357]} />
          <meshBasicMaterial
            map={housesTexture}
            color="#e0e0e0"
            transparent
            alphaTest={0.1}
            side={2}
          />
        </mesh>
        <mesh position={[13.5, -1, -9]} scale={[-1, 1, 1]}>
          <planeGeometry args={[12, 15 / 2.357]} />
          <meshBasicMaterial
            map={housesRightTexture}
            color="#e0e0e0"
            transparent
            alphaTest={0.1}
            side={2}
          />
        </mesh>

        <mesh position={[0, 3.4, -17]}>
          <planeGeometry args={[30, 30 / 2.357]} />
          <meshBasicMaterial
            map={skylineTexture}
            color="#e0e0e0"
            transparent
            alphaTest={0.1}
            side={2}
          />
        </mesh>
        <mesh position={[-30, 3.4, -17]} scale={[-1, 1, 1]}>
          <planeGeometry args={[30, 30 / 2.357]} />
          <meshBasicMaterial
            map={skylineTexture}
            color="#e0e0e0"
            transparent
            alphaTest={0.1}
            side={2}
          />
        </mesh>
        <mesh position={[30, 3.4, -17]} scale={[-1, 1, 1]}>
          <planeGeometry args={[30, 30 / 2.357]} />
          <meshBasicMaterial
            map={skylineTexture}
            color="#e0e0e0"
            transparent
            alphaTest={0.1}
            side={2}
          />
        </mesh>

        <group ref={birdRef} position={[-18, 4.8, -10]}>
          <mesh scale={[0.49, 0.35, 1]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial
              map={birdTexture}
              color="#e0e0e0"
              transparent
              alphaTest={0.1}
              side={2}
              depthWrite={false}
            />
          </mesh>
          <GithubBirdBanner />
        </group>

        <Text
          position={[
            techDormGallerySceneModel.title.position.x,
            techDormGallerySceneModel.title.position.y,
            techDormGallerySceneModel.title.position.z,
          ]}
          font="/fonts/CabinSketch-Bold.ttf"
          fontSize={0.62}
          color="#1a1a1a"
          anchorX={techDormGallerySceneModel.title.anchorX}
          anchorY={techDormGallerySceneModel.title.anchorY}
        >
          Tech Dorm
        </Text>
        <Text
          position={[
            techDormGallerySceneModel.title.position.x,
            techDormGallerySceneModel.title.position.y - 0.8,
            techDormGallerySceneModel.title.position.z,
          ]}
          font="/fonts/CabinSketch-Bold.ttf"
          fontSize={0.24}
          color="#4a4a4a"
          anchorX={techDormGallerySceneModel.title.anchorX}
          anchorY={techDormGallerySceneModel.title.anchorY}
        >
          Touch a poster to pull it forward
        </Text>
      </group>

    </>
  );
}
