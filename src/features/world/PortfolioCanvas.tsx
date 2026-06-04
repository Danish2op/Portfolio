import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import { WorldScene } from './scene/WorldScene';
import type { InputMap } from './player/useInputMap';

export function PortfolioCanvas({ input }: { input: InputMap }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ fov: 50, near: 0.1, far: 220, position: [0, 6, 14] }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <Suspense fallback={null}>
          <WorldScene input={input} />
        </Suspense>
      </Canvas>
    </div>
  );
}
