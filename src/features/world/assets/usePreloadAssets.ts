import { useEffect, useRef } from 'react';

import { usePortfolioStore } from '../../../app/store/usePortfolioStore';
import { primeAssetRegistry } from './assetRegistry';

const minimumBootDurationMs = 850;

export function usePreloadAssets() {
  const setWorldLoading = usePortfolioStore((state) => state.setWorldLoading);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    setWorldLoading(true);
    primeAssetRegistry();

    const timer = window.setTimeout(() => {
      setWorldLoading(false);
    }, minimumBootDurationMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [setWorldLoading]);
}
