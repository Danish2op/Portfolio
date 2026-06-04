import { useEffect } from 'react';

import { usePortfolioStore } from '../../../app/store/usePortfolioStore';
import type { SceneLocation, Vector3Tuple } from '../../../lib/firebase/types';

function isInsideTrigger(
  playerPosition: Vector3Tuple,
  center: Vector3Tuple,
  size: Vector3Tuple,
) {
  return (
    Math.abs(playerPosition[0] - center[0]) <= size[0] / 2 &&
    Math.abs(playerPosition[1] - center[1]) <= size[1] / 2 &&
    Math.abs(playerPosition[2] - center[2]) <= size[2] / 2
  );
}

export function SceneTrigger({
  center,
  scene,
  size,
}: {
  center: Vector3Tuple;
  scene: SceneLocation;
  size: Vector3Tuple;
}) {
  const currentLocation = usePortfolioStore((state) => state.currentLocation);
  const playerPosition = usePortfolioStore((state) => state.playerPosition);
  const setCurrentLocation = usePortfolioStore(
    (state) => state.setCurrentLocation,
  );

  useEffect(() => {
    if (
      currentLocation !== scene &&
      isInsideTrigger(playerPosition, center, size)
    ) {
      setCurrentLocation(scene);
    }
  }, [center, currentLocation, playerPosition, scene, setCurrentLocation, size]);

  return null;
}
