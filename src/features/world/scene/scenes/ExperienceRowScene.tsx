export function ExperienceRowScene() {
  const offices = [
    { accent: '#22c55e', offset: -12, height: 8.8 },
    { accent: '#38bdf8', offset: 0, height: 10.6 },
    { accent: '#f59e0b', offset: 12, height: 9.6 },
  ];

  return (
    <group position={[0, 0, 28]}>
      <mesh receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[38, 0.24, 12]} />
        <meshStandardMaterial color="#cad5df" />
      </mesh>
      <mesh receiveShadow position={[0, 0.2, -2.8]}>
        <boxGeometry args={[36, 0.08, 2.4]} />
        <meshStandardMaterial color="#56667c" />
      </mesh>

      {offices.map(({ accent, height, offset }) => (
        <group key={offset} position={[offset, 0, 0]}>
          <mesh castShadow position={[0, height / 2 + 0.35, 0]}>
            <boxGeometry args={[8.2, height, 7.6]} />
            <meshStandardMaterial
              color="#d7e8f3"
              metalness={0.25}
              roughness={0.2}
              opacity={0.92}
              transparent
            />
          </mesh>
          <mesh castShadow position={[0, height + 0.8, 3.85]}>
            <boxGeometry args={[5.6, 1.05, 0.16]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.52} />
          </mesh>
          <mesh castShadow position={[0, 2.1, 3.7]}>
            <boxGeometry args={[5.8, 3.1, 0.12]} />
            <meshStandardMaterial color="#ffffff" opacity={0.22} transparent />
          </mesh>
          <mesh castShadow position={[0, 0.95, 3.6]}>
            <boxGeometry args={[6.4, 0.18, 1.2]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
