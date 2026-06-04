export function MusicStudioScene() {
  return (
    <group position={[0, 0, -34]}>
      <mesh receiveShadow position={[0, 0.14, 0]}>
        <cylinderGeometry args={[12, 13.4, 0.28, 40]} />
        <meshStandardMaterial color="#3f2c22" />
      </mesh>
      <mesh castShadow position={[0, 4.15, 0]}>
        <cylinderGeometry args={[8.6, 9.4, 8.1, 28]} />
        <meshStandardMaterial color="#5a3c2d" roughness={0.76} />
      </mesh>
      <mesh castShadow position={[0, 6.2, 0]}>
        <cylinderGeometry args={[7.6, 8.5, 0.45, 28]} />
        <meshStandardMaterial color="#2a1c14" />
      </mesh>

      {Array.from({ length: 14 }).map((_, index) => {
        const angle = (Math.PI * 2 * index) / 14;
        const x = Math.cos(angle) * 7.25;
        const z = Math.sin(angle) * 7.25;

        return (
          <mesh
            key={index}
            castShadow
            position={[x, 3.2, z]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.36, 5.2, 0.3]} />
            <meshStandardMaterial color="#d5a15b" emissive="#7c2d12" emissiveIntensity={0.18} />
          </mesh>
        );
      })}

      <mesh castShadow position={[0, 0.85, 2.1]}>
        <cylinderGeometry args={[0.1, 0.1, 1.7, 12]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh castShadow position={[0, 1.95, 2.1]}>
        <sphereGeometry args={[0.3, 18, 18]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh castShadow position={[2.45, 1.35, 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.16, 2.8, 14]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh castShadow position={[-2.6, 2.6, 3.6]}>
        <boxGeometry args={[1.4, 3.4, 0.16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#92400e" emissiveIntensity={0.5} />
      </mesh>
      <mesh castShadow position={[2.6, 2.6, 3.6]}>
        <boxGeometry args={[1.4, 3.4, 0.16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#92400e" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
