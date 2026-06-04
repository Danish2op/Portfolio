import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';

export function HubScene() {
  const beacon = useRef<Group>(null);
  const orb = useRef<Mesh>(null);

  useFrame((state) => {
    if (beacon.current) {
      beacon.current.rotation.y = state.clock.elapsedTime * 0.25;
    }

    if (orb.current) {
      orb.current.position.y = 3.25 + Math.sin(state.clock.elapsedTime * 1.6) * 0.18;
    }
  });

  return (
    <group>
      <mesh receiveShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[12.5, 14, 0.35, 48]} />
        <meshStandardMaterial color="#efe3c8" roughness={0.96} />
      </mesh>
      <mesh receiveShadow position={[0, 0.32, 0]}>
        <cylinderGeometry args={[6.5, 7.8, 0.38, 40]} />
        <meshStandardMaterial color="#f6edd9" roughness={0.92} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.95, 0]}>
        <cylinderGeometry args={[2.6, 3.2, 0.9, 28]} />
        <meshStandardMaterial color="#bc7a3f" metalness={0.14} roughness={0.58} />
      </mesh>

      <group ref={beacon}>
        {[
          [0, 1.7, 2.1],
          [2.1, 1.7, 0],
          [0, 1.7, -2.1],
          [-2.1, 1.7, 0],
        ].map((position, index) => (
          <mesh
            key={index}
            castShadow
            position={position as [number, number, number]}
          >
            <boxGeometry args={[0.36, 2.35, 0.36]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        ))}
        <mesh castShadow position={[0, 2.9, 0]}>
          <torusGeometry args={[2.55, 0.1, 18, 64]} />
          <meshStandardMaterial color="#f59e0b" emissive="#78350f" />
        </mesh>
      </group>

      <mesh castShadow position={[0, 3.25, 0]} ref={orb}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color="#8ce8ff"
          emissive="#0ea5e9"
          emissiveIntensity={0.55}
          metalness={0.25}
          roughness={0.18}
        />
      </mesh>

      {[
        [-7.2, 0.75, -7],
        [7.3, 0.75, -6.8],
        [-6.6, 0.75, 7.4],
        [6.8, 0.75, 7.2],
      ].map((position, index) => (
        <group key={index} position={position as [number, number, number]}>
          <mesh castShadow position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.38, 0.5, 1.2, 10]} />
            <meshStandardMaterial color="#8b6b4d" />
          </mesh>
          <mesh castShadow position={[0, 1.65, 0]}>
            <sphereGeometry args={[1.15, 14, 14]} />
            <meshStandardMaterial color="#7ecf92" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
