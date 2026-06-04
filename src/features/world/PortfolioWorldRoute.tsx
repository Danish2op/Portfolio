import { useEffect } from 'react';

import { usePortfolioStore } from '../../app/store/usePortfolioStore';
import type { SceneLocation } from '../../lib/firebase/types';
import { usePreloadAssets } from './assets/usePreloadAssets';
import { LoadingOverlay } from './loading/LoadingOverlay';
import { useInputMap } from './player/useInputMap';
import { PortfolioCanvas } from './PortfolioCanvas';

const sceneDescriptions: Record<SceneLocation, string> = {
  Hub: 'A central floating plaza that branches into every part of Danish Sharma’s story.',
  'Tech-Dorm':
    'A neon-lit builder cave focused on AI systems, product engineering, and shipping velocity.',
  Education:
    'An academic hall that frames coursework, research curiosity, and disciplined growth.',
  'Experience Row':
    'A polished street of internship stories, execution proof, and domain breadth.',
  'Music Studio':
    'A warm performance space connecting classical discipline with creative confidence.',
};

function ControlButton({
  label,
  bind,
  className,
}: {
  label: string;
  bind: ReturnType<ReturnType<typeof useInputMap>['bindDirection']>;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`touch-none flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-stone-100/25 bg-[#0d1b2a]/70 text-lg font-semibold text-white shadow-panel backdrop-blur-md transition hover:bg-[#15273a]/85 ${className ?? ''}`}
      {...bind}
    >
      {label}
    </button>
  );
}

export function PortfolioWorldRoute() {
  const currentLocation = usePortfolioStore((state) => state.currentLocation);
  const setCurrentLocation = usePortfolioStore(
    (state) => state.setCurrentLocation,
  );
  const setPlayerPosition = usePortfolioStore(
    (state) => state.setPlayerPosition,
  );

  const input = useInputMap();

  usePreloadAssets();

  useEffect(() => {
    setCurrentLocation('Hub');
    setPlayerPosition([0, 0, 0]);
  }, [setCurrentLocation, setPlayerPosition]);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-ink text-white"
      data-testid="portfolio-world-shell"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.12),_transparent_34%),linear-gradient(180deg,_rgba(251,250,245,0),_rgba(5,13,24,0.12))]" />

      <PortfolioCanvas input={input} />
      <LoadingOverlay />

      <section className="pointer-events-none absolute inset-x-0 top-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-[26rem] rounded-[1.6rem] border border-stone-100/15 bg-[#0b1726]/52 p-4 shadow-panel backdrop-blur-md sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.42em] text-amber-200/75">
              Danish Sharma
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[2.1rem]">
              Portfolio World
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200/85">
              Walk the island to move between work, education, experience, and music.
            </p>
          </div>

          <div className="hidden max-w-[20rem] rounded-[1.3rem] border border-stone-100/12 bg-[#0b1726]/44 p-4 shadow-panel backdrop-blur-md md:block">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-200/70">
              Current Scene
            </p>
            <p className="mt-2 text-xl font-semibold text-white">{currentLocation}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300/90">
              {sceneDescriptions[currentLocation]}
            </p>
          </div>
        </div>
      </section>

      <aside className="pointer-events-none absolute bottom-4 left-4 w-[min(17rem,calc(100vw-2rem))] rounded-[1.35rem] border border-stone-100/12 bg-[#0b1726]/46 p-4 shadow-panel backdrop-blur-md sm:bottom-6 sm:left-6">
        <p className="text-[11px] uppercase tracking-[0.35em] text-amber-200/70">
          Controls
        </p>
        <p className="mt-2 text-sm text-white">WASD or arrow keys</p>
        <p className="mt-1 text-sm text-slate-300">
          Touch controls appear on small screens only.
        </p>
      </aside>

      <aside className="absolute bottom-4 right-4 grid w-[10.5rem] grid-cols-3 gap-2 sm:bottom-6 sm:right-6 md:hidden">
        <div />
        <ControlButton
          label="W"
          bind={input.bindDirection('forward')}
          className="pointer-events-auto"
        />
        <div />
        <ControlButton
          label="A"
          bind={input.bindDirection('left')}
          className="pointer-events-auto"
        />
        <ControlButton
          label="S"
          bind={input.bindDirection('backward')}
          className="pointer-events-auto"
        />
        <ControlButton
          label="D"
          bind={input.bindDirection('right')}
          className="pointer-events-auto"
        />
      </aside>
    </main>
  );
}
