export function EducationScene() {
  return (
    <group position={[-28, 0, -8]}>
      <mesh receiveShadow position={[0, 0.14, 0]}>
        <boxGeometry args={[18, 0.28, 13]} />
        <meshStandardMaterial color="#e7dcc8" />
      </mesh>
      <mesh castShadow position={[0, 4.4, 0]}>
        <boxGeometry args={[13, 8.2, 9]} />
        <meshStandardMaterial color="#f2e7d4" roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, 6.1, 3.95]}>
        <boxGeometry args={[10.2, 2.5, 0.22]} />
        <meshStandardMaterial color="#f9f4ea" />
      </mesh>

      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <mesh key={x} castShadow position={[x, 1.9, 3.6]}>
          <cylinderGeometry args={[0.35, 0.35, 3.8, 12]} />
          <meshStandardMaterial color="#caa779" />
        </mesh>
      ))}

      <mesh castShadow position={[0, 2.5, -2.9]}>
        <boxGeometry args={[6.2, 2.6, 0.14]} />
        <meshStandardMaterial color="#d8ecf0" />
      </mesh>
      <mesh castShadow position={[0, 2.45, -2.8]}>
        <boxGeometry args={[5.1, 1.6, 0.08]} />
        <meshStandardMaterial color="#0f766e" emissive="#134e4a" emissiveIntensity={0.25} />
      </mesh>

      {[-4.8, -3.6].map((x) => (
        <group key={x} position={[x, 0, -0.4]}>
          <mesh castShadow position={[0, 1.6, 0]}>
            <boxGeometry args={[0.55, 3.2, 4.8]} />
            <meshStandardMaterial color="#8b6b4d" />
          </mesh>
          <mesh castShadow position={[0.1, 1.5, 0]}>
            <boxGeometry args={[0.12, 2.6, 4.25]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        </group>
      ))}

      <mesh castShadow position={[4.25, 1.05, 1.4]}>
        <boxGeometry args={[3.6, 0.16, 1.8]} />
        <meshStandardMaterial color="#7a5a3a" />
      </mesh>
      <mesh castShadow position={[5.05, 1.75, 1.4]}>
        <boxGeometry args={[0.1, 1.2, 0.1]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh castShadow position={[5.55, 0.7, 1.4]} rotation={[0, 0, 0.78]}>
        <cylinderGeometry args={[0.07, 0.07, 1.5, 10]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}
