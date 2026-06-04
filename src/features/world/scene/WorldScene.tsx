import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

import { CharacterController } from '../player/CharacterController';
import type { InputMap } from '../player/useInputMap';
import { HubScene } from './scenes/HubScene';
import { TechDormScene } from './scenes/TechDormScene';
import { EducationScene } from './scenes/EducationScene';
import { ExperienceRowScene } from './scenes/ExperienceRowScene';
import { MusicStudioScene } from './scenes/MusicStudioScene';
import { SceneTrigger } from '../triggers/SceneTrigger';

function AtmosphereLayer() {
  const cloudBand = useRef<Group>(null);

  useFrame((state) => {
    if (cloudBand.current) {
      cloudBand.current.rotation.y = state.clock.elapsedTime * 0.025;
    }
  });

  return (
    <group ref={cloudBand}>
      {[
        [-40, 20, -30, 9, '#ffffff'],
        [36, 16, -26, 7, '#fef3c7'],
        [-10, 18, 32, 8, '#ffffff'],
        [24, 23, 28, 10, '#f8fafc'],
        [-32, 14, 8, 6, '#fefce8'],
      ].map(([x, y, z, scale, color], index) => (
        <group
          key={index}
          position={[x, y, z] as [number, number, number]}
          scale={scale as number}
        >
          <mesh>
            <sphereGeometry args={[1, 18, 18]} />
            <meshStandardMaterial color={color as string} transparent opacity={0.68} />
          </mesh>
          <mesh position={[1.2, 0.2, 0.4]}>
            <sphereGeometry args={[0.75, 18, 18]} />
            <meshStandardMaterial color={color as string} transparent opacity={0.58} />
          </mesh>
          <mesh position={[-1.05, -0.1, 0.2]}>
            <sphereGeometry args={[0.68, 18, 18]} />
            <meshStandardMaterial color={color as string} transparent opacity={0.58} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function WorldScene({ input }: { input: InputMap }) {
  return (
    <>
      <color attach="background" args={['#cae8f6']} />
      <fog attach="fog" args={['#cae8f6', 48, 148]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight
        color="#fff7ed"
        groundColor="#1e293b"
        intensity={0.9}
      />
      <directionalLight
        castShadow
        intensity={2.9}
        position={[38, 42, 16]}
        shadow-camera-bottom={-70}
        shadow-camera-far={140}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />
      <pointLight color="#f59e0b" intensity={14} position={[0, 12, 0]} />
      <AtmosphereLayer />

      <group>
        <mesh receiveShadow position={[0, -2.8, 0]}>
          <cylinderGeometry args={[60, 72, 8.4, 56]} />
          <meshStandardMaterial color="#6f7d5a" roughness={0.98} />
        </mesh>
        <mesh receiveShadow position={[0, -0.65, 0]}>
          <cylinderGeometry args={[64, 69, 4.1, 56]} />
          <meshStandardMaterial color="#8ea16f" roughness={0.94} />
        </mesh>
        <mesh receiveShadow position={[0, 0, 0]}>
          <circleGeometry args={[62, 64]} />
          <meshStandardMaterial color="#d9d0bd" roughness={0.95} />
        </mesh>
        <mesh receiveShadow position={[0, -4.35, 0]}>
          <cylinderGeometry args={[86, 86, 0.6, 64]} />
          <meshStandardMaterial color="#88c9df" transparent opacity={0.72} />
        </mesh>

        {[
          [0, 0.05, -18, 8, 36],
          [0, 0.05, 15, 8, 26],
          [-17, 0.05, -4, 28, 8],
          [17, 0.05, -5, 26, 8],
        ].map(([x, y, z, width, depth], index) => (
          <mesh
            key={index}
            receiveShadow
            position={[x, y, z] as [number, number, number]}
          >
            <boxGeometry args={[width as number, 0.1, depth as number]} />
            <meshStandardMaterial color="#c2935c" roughness={0.9} />
          </mesh>
        ))}

        {[
          [-20, 0.55, -4],
          [-14, 0.55, -4],
          [14, 0.55, -5],
          [20, 0.55, -5],
          [-6, 0.55, 17],
          [0, 0.55, 17],
          [6, 0.55, 17],
        ].map((position, index) => (
          <mesh
            key={index}
            castShadow
            position={position as [number, number, number]}
          >
            <cylinderGeometry args={[0.18, 0.18, 1.1, 12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        ))}
      </group>

      <Physics gravity={[0, -20, 0]}>
        <RigidBody colliders={false} type="fixed">
          <CuboidCollider args={[62, 1.4, 62]} position={[0, -0.8, 0]} />
        </RigidBody>

        <HubScene />
        <TechDormScene />
        <EducationScene />
        <ExperienceRowScene />
        <MusicStudioScene />
        <CharacterController input={input} />
      </Physics>

      <SceneTrigger
        center={[0, 1.4, 0]}
        scene="Hub"
        size={[18, 4, 18]}
      />
      <SceneTrigger
        center={[28, 1.4, -10]}
        scene="Tech-Dorm"
        size={[18, 5, 16]}
      />
      <SceneTrigger
        center={[-28, 1.4, -8]}
        scene="Education"
        size={[18, 5, 16]}
      />
      <SceneTrigger
        center={[0, 1.4, 28]}
        scene="Experience Row"
        size={[40, 5, 16]}
      />
      <SceneTrigger
        center={[0, 1.4, -34]}
        scene="Music Studio"
        size={[20, 5, 18]}
      />
    </>
  );
}
