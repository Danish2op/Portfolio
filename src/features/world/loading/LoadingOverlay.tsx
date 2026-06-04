import { useEffect, useState } from 'react';

import { usePortfolioStore } from '../../../app/store/usePortfolioStore';

const bootLines = [
  'Initializing world renderer',
  'Warming physics runtime',
  'Priming trigger zones',
  'Spinning up scene context bridge',
];

export function LoadingOverlay() {
  const isWorldLoading = usePortfolioStore((state) => state.isWorldLoading);
  const [visibleLineCount, setVisibleLineCount] = useState(1);

  useEffect(() => {
    if (!isWorldLoading) {
      return;
    }

    setVisibleLineCount(1);

    const interval = window.setInterval(() => {
      setVisibleLineCount((current) =>
        current >= bootLines.length ? current : current + 1,
      );
    }, 220);

    return () => {
      window.clearInterval(interval);
    };
  }, [isWorldLoading]);

  if (!isWorldLoading) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute right-4 top-4 z-20 w-[min(24rem,calc(100vw-2rem))] sm:right-6 sm:top-6"
      data-testid="loading-overlay"
    >
      <div className="rounded-[1.5rem] border border-cyan-200/15 bg-[#07111f]/82 p-4 shadow-panel backdrop-blur-md sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-cyan-200/75">
          Boot Sequence
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          Warming the scene. You should still be able to see the world behind this.
        </p>
        <div className="mt-4 space-y-2 rounded-[1.15rem] border border-cyan-200/10 bg-black/20 p-3 font-mono text-xs text-cyan-100/90">
          {bootLines.slice(0, visibleLineCount).map((line) => (
            <p key={line}>
              <span className="text-cyan-300">$</span> {line}
            </p>
          ))}
          <p className="animate-pulse text-cyan-300/85">_</p>
        </div>
      </div>
    </div>
  );
}
