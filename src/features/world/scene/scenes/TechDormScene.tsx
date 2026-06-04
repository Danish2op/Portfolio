export function TechDormScene() {
  return (
    <group position={[28, 0, -10]}>
      <mesh receiveShadow position={[0, 0.14, 0]}>
        <boxGeometry args={[18, 0.28, 14]} />
        <meshStandardMaterial color="#101827" />
      </mesh>
      <mesh receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[12.5, 0.14, 8.5]} />
        <meshStandardMaterial color="#152436" />
      </mesh>

      <mesh castShadow position={[0, 4.9, 0.2]}>
        <boxGeometry args={[11, 9.2, 8]} />
        <meshStandardMaterial color="#111827" metalness={0.18} roughness={0.48} />
      </mesh>
      <mesh castShadow position={[0, 6.5, 3.8]}>
        <boxGeometry args={[9.4, 0.26, 1.2]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0e7490" emissiveIntensity={0.85} />
      </mesh>
      <mesh castShadow position={[-4.3, 2.8, 3.78]}>
        <boxGeometry args={[1.35, 4.1, 0.18]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#0ea5e9" emissiveIntensity={0.75} />
      </mesh>
      <mesh castShadow position={[-2.2, 2.8, 3.78]}>
        <boxGeometry args={[1.35, 4.1, 0.18]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.75} />
      </mesh>
      <mesh castShadow position={[0, 2.8, 3.78]}>
        <boxGeometry args={[1.35, 4.1, 0.18]} />
        <meshStandardMaterial color="#5eead4" emissive="#0f766e" emissiveIntensity={0.72} />
      </mesh>
      <mesh castShadow position={[2.2, 2.8, 3.78]}>
        <boxGeometry args={[1.35, 4.1, 0.18]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.75} />
      </mesh>
      <mesh castShadow position={[4.3, 2.8, 3.78]}>
        <boxGeometry args={[1.35, 4.1, 0.18]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#0ea5e9" emissiveIntensity={0.75} />
      </mesh>

      <mesh castShadow position={[-4.2, 1.15, 1.85]}>
        <boxGeometry args={[2.8, 0.16, 1.25]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh castShadow position={[-4.2, 1.85, 1.25]}>
        <boxGeometry args={[2.1, 1.05, 0.12]} />
        <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.68} />
      </mesh>
      <mesh castShadow position={[-1.8, 1.8, 1.3]}>
        <boxGeometry args={[1.15, 1.6, 1.15]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh castShadow position={[-1.8, 3.35, 1.3]}>
        <boxGeometry args={[1.15, 1.25, 1.15]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      <mesh castShadow position={[4.8, 4.4, -2.4]}>
        <boxGeometry args={[1.15, 8.2, 1.15]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh castShadow position={[4.8, 8.75, -2.4]}>
        <cylinderGeometry args={[0.06, 0.06, 2.2, 10]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh castShadow position={[4.8, 9.95, -2.4]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}
