import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { gsap } from 'gsap';
import { Euler, PerspectiveCamera, Vector3 } from 'three';

import { usePortfolioStore } from '../../app/store/usePortfolioStore';
import { InspiredPortfolioRoute3D } from './InspiredPortfolioRoute3D';

type RoomId =
  | 'tech-dorm'
  | 'education'
  | 'experience'
  | 'music-studio'
  | 'contact';

type SceneMode = 'entrance' | 'corridor' | RoomId;
type TransitionPhase = 'idle' | 'closing' | 'opening';

type AchievementId =
  | 'bug_fixed'
  | 'corridor_enter'
  | 'corridor_explore'
  | 'tech_dorm_open'
  | 'music_studio_open'
  | 'contact_choose';

type RoomDetail = {
  id: RoomId;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  corridorNote: string;
  chips: string[];
  features: Array<{
    title: string;
    detail: string;
  }>;
  notes: string[];
};

type CorridorStop = {
  id: RoomId;
  label: string;
  side: 'left' | 'right';
  asset: string;
  paintedAsset: string;
  x: number;
  y: number;
};

type AssetImageProps = {
  alt?: string;
  className?: string;
  src: string;
  style?: CSSProperties;
};

type SketchButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

type RouteMapProps = {
  hoveredRoom: RoomId | null;
  onClose: () => void;
  onHoverRoom: (roomId: RoomId | null) => void;
  onSelectRoom: (roomId: RoomId) => void;
};

type AudioPanelProps = {
  isMuted: boolean;
  musicVolume: number;
  onClose: () => void;
  onMusicVolumeChange: (value: number) => void;
  onSfxVolumeChange: (value: number) => void;
  onToggleMuted: () => void;
  sfxVolume: number;
};

type RoomSceneProps = {
  detail: RoomDetail;
  onBack: () => void;
  onOpenMap: () => void;
};

type CorridorSceneProps = {
  onBackOutside: () => void;
  onExplore: () => void;
  onOpenRoom: (roomId: RoomId) => void;
};

type EntranceSceneProps = {
  bugSquashed: boolean;
  cursorOffset: {
    x: number;
    y: number;
  };
  debugTip: string | null;
  isWindowGreetingVisible: boolean;
  onAskDuck: () => void;
  onEnterCorridor: () => void;
  onPreviewStudio: () => void;
  onSquashBug: () => void;
  onWindowEnter: () => void;
  onWindowLeave: () => void;
};

type RectSpec = {
  center: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
};

const achievementStorageKey = 'danish_portfolio_achievements';
const assetRoot = '/itomdev-clone';
const motionEnabled = import.meta.env.MODE !== 'test';

const roomOrder: RoomId[] = [
  'education',
  'tech-dorm',
  'experience',
  'music-studio',
  'contact',
];

const roomDetails: Record<RoomId, RoomDetail> = {
  'tech-dorm': {
    id: 'tech-dorm',
    label: 'Tech Dorm',
    eyebrow: 'Projects Wing',
    title: 'Tech Dorm',
    summary:
      'A late-night builder room where Danish’s strongest technical signal lives: agentic systems thinking, cross-stack execution, and interfaces that feel shipped instead of staged.',
    corridorNote:
      'This door opens into Danish’s project gallery: agentic flows, product engineering depth, and end-to-end execution.',
    chips: ['Omni-Agent', 'React', 'React Native', 'Node.js', 'Python'],
    features: [
      {
        title: 'Featured Builds',
        detail:
          'Omni-Agent anchors the room as proof that Danish can orchestrate tools, route tasks, and design workflows that feel like products instead of isolated scripts.',
      },
      {
        title: 'Cross-Stack Delivery',
        detail:
          'Frontend polish and backend execution meet here through React, React Native, Node.js, Python, and Firebase used as practical delivery tools.',
      },
      {
        title: 'AI-Native Product Taste',
        detail:
          'The through-line is product instinct: smoother workflows, clearer interfaces, and experiments grounded in usable outcomes.',
      },
    ],
    notes: [
      'Best room for interviews about agentic systems, product engineering depth, and shipping instinct.',
      'Pairs well with Experience Row when the conversation turns to real-world proof.',
    ],
  },
  education: {
    id: 'education',
    label: 'Education',
    eyebrow: 'Study Hall',
    title: 'Education',
    summary:
      'A calm lecture-hall room framing the academic discipline behind the work: consistent performance, research curiosity, and technical growth.',
    corridorNote:
      'This room carries the academic backbone: TIET, school results, research curiosity, and long-run consistency.',
    chips: ['TIET', '7.4 CGPA', '83% CBSE', 'EV Research'],
    features: [
      {
        title: 'College Foundation',
        detail:
          'Danish is completing a B.E. in Computer Engineering at TIET and carrying a 7.4 CGPA into his final semester.',
      },
      {
        title: 'School Record',
        detail:
          'CBSE schooling finished with an 83 percent score, reinforcing the long-run consistency behind the portfolio.',
      },
      {
        title: 'Research Curiosity',
        detail:
          'The EV intrusion-detection thread points to applied systems thinking, security awareness, and curiosity beyond coursework.',
      },
    ],
    notes: [
      'Best room for conversations about fundamentals, growth potential, and research-minded engineering.',
      'It explains the discipline underneath the project work rather than repeating the same signals.',
    ],
  },
  experience: {
    id: 'experience',
    label: 'Experience Row',
    eyebrow: 'Internship Street',
    title: 'Experience Row',
    summary:
      'A recruiter-facing room that converts internships into fast proof: Danish can adapt, collaborate, and deliver in structured environments.',
    corridorNote:
      'This extra room extends the original four-door format so Danish can show real-team experience without flattening it into one paragraph.',
    chips: ['LivPal', 'Tel-Aviv University', 'TFU'],
    features: [
      {
        title: 'LivPal',
        detail:
          'Signals applied product and engineering execution in an environment where shipping value matters as much as technical correctness.',
      },
      {
        title: 'Tel-Aviv University',
        detail:
          'Represents research-adjacent rigor, technical depth exposure, and comfort with more demanding problem frames.',
      },
      {
        title: 'TFU',
        detail:
          'Shows domain adaptation, structured delivery, and the ability to contribute under different business constraints.',
      },
    ],
    notes: [
      'This room connects external validation with the self-driven work from Tech Dorm.',
      'Best room for readiness, ownership, and collaboration questions.',
    ],
  },
  'music-studio': {
    id: 'music-studio',
    label: 'Music Studio',
    eyebrow: 'Creative Chamber',
    title: 'Music Studio',
    summary:
      'A warm studio room that explains the discipline behind the engineering style: timing, composure, and long-horizon craft sharpened through music.',
    corridorNote:
      'This door shifts the mood: records, stage presence, and creative discipline mapped back to engineering.',
    chips: ['Sangeet Visharad', 'TEDx', 'Bansuri', 'Ustaad Mujtaba Hussain'],
    features: [
      {
        title: 'Sangeet Visharad',
        detail:
          'A marker of formal classical training and the ability to stay committed to a demanding discipline over time.',
      },
      {
        title: 'Performance Presence',
        detail:
          'TEDx performance experience strengthens the story around stage comfort, communication clarity, and composure under pressure.',
      },
      {
        title: 'Mentorship & Craft',
        detail:
          'Discipleship under Ustaad Mujtaba Hussain reflects rigor, patience, and mastery built through repetition.',
      },
    ],
    notes: [
      'This room makes the portfolio feel personal without losing professional relevance.',
      'It links creative discipline directly to patience and refinement in Danish’s engineering work.',
    ],
  },
  contact: {
    id: 'contact',
    label: 'Contact',
    eyebrow: 'Collaboration Desk',
    title: 'Contact',
    summary:
      'A final room focused on fit: what Danish wants to build next, what teams he aligns with, and how the conversation should continue.',
    corridorNote:
      'A softer final stop that works as a collaboration brief instead of a dead-end contact dump.',
    chips: ['Internships', 'Frontend Roles', 'AI-Native Products', 'Creative Web'],
    features: [
      {
        title: 'Best-Fit Roles',
        detail:
          'Danish is strongest in internships or early-career roles where frontend craft, AI-native product thinking, and execution quality all matter at once.',
      },
      {
        title: 'Best-Fit Teams',
        detail:
          'Developer tools, immersive interfaces, agentic systems, and product teams that value both taste and technical depth are the sweet spot.',
      },
      {
        title: 'Next Step',
        detail:
          'Public handles can be plugged in once finalized; until then, this room works as a clean collaboration brief for recruiters and founders.',
      },
    ],
    notes: [
      'No invented public links are shown here; this room stays honest until the preferred handles are ready.',
      'If the conversation is already warm, route back to Tech Dorm or Experience Row to reinforce the strongest proof points.',
    ],
  },
};

const roomShowcaseArt: Record<
  RoomId,
  {
    accentClass: string;
    hero: string;
  }
> = {
  'tech-dorm': {
    accentClass: 'room-panel--tech-dorm',
    hero: asset('/textures/corridor/doors/drzwiprojekty_painted.webp'),
  },
  education: {
    accentClass: 'room-panel--education',
    hero: asset('/textures/corridor/doors/drzwiabout_painted.webp'),
  },
  experience: {
    accentClass: 'room-panel--experience',
    hero: asset('/textures/corridor/ramkanazdjecieduza_painted.webp'),
  },
  'music-studio': {
    accentClass: 'room-panel--music-studio',
    hero: asset('/textures/corridor/doors/drzwisocial_painted.webp'),
  },
  contact: {
    accentClass: 'room-panel--contact',
    hero: asset('/textures/corridor/doors/drzwikontakt_painted.webp'),
  },
};

const corridorStops: CorridorStop[] = [
  {
    id: 'tech-dorm',
    label: 'Tech Dorm',
    side: 'left',
    asset: asset('/textures/corridor/doors/drzwiprojekty.webp'),
    paintedAsset: asset('/textures/corridor/doors/drzwiprojekty_painted.webp'),
    x: 250,
    y: 132,
  },
  {
    id: 'music-studio',
    label: 'Music Studio',
    side: 'right',
    asset: asset('/textures/corridor/doors/drzwisocial.webp'),
    paintedAsset: asset('/textures/corridor/doors/drzwisocial_painted.webp'),
    x: 820,
    y: 178,
  },
  {
    id: 'education',
    label: 'Education',
    side: 'left',
    asset: asset('/textures/corridor/doors/drzwiabout.webp'),
    paintedAsset: asset('/textures/corridor/doors/drzwiabout_painted.webp'),
    x: 1360,
    y: 132,
  },
  {
    id: 'contact',
    label: 'Contact',
    side: 'right',
    asset: asset('/textures/corridor/doors/drzwikontakt.webp'),
    paintedAsset: asset('/textures/corridor/doors/drzwikontakt_painted.webp'),
    x: 1910,
    y: 178,
  },
  {
    id: 'experience',
    label: 'Experience Row',
    side: 'left',
    asset: asset('/textures/corridor/pustatabliczka.webp'),
    paintedAsset: asset('/textures/corridor/ramkanazdjecieduza_painted.webp'),
    x: 2470,
    y: 132,
  },
];

const achievementCopy: Record<
  AchievementId,
  {
    title: string;
    label: string;
  }
> = {
  bug_fixed: {
    title: 'Bug fixed',
    label: 'You squashed the wall bug before stepping inside.',
  },
  corridor_enter: {
    title: 'Explorer',
    label: 'The front door opened and the corridor is now yours to explore.',
  },
  corridor_explore: {
    title: 'Wanderer',
    label: 'Hallway unlocked! Keep exploring to find Danish’s projects and journey.',
  },
  tech_dorm_open: {
    title: 'Builder Mode',
    label: 'Tech Dorm is open. Time to inspect how Danish ships.',
  },
  music_studio_open: {
    title: 'Stage Presence',
    label: 'Music Studio is open and the creative side is now in view.',
  },
  contact_choose: {
    title: 'Connector',
    label: 'You found the room that turns interest into a real conversation.',
  },
};

const duckDebugTips = [
  'Have you tried console.log()?',
  'Did you clear the cache?',
  'It works on my machine!',
  'Maybe it is a CSS issue?',
  'Check the error message first.',
  'Works in production!',
];

function asset(relativePath: string) {
  return `${assetRoot}${relativePath}`;
}

const AssetImage = forwardRef<HTMLImageElement, AssetImageProps>(function AssetImage(
  { alt = '', className = '', src, style },
  ref,
) {
  return (
    <img
      alt={alt}
      className={className}
      draggable={false}
      ref={ref}
      src={src}
      style={style}
    />
  );
});

function SketchButton({
  children,
  className = '',
  type = 'button',
  ...props
}: SketchButtonProps) {
  return (
    <button className={`itom-button ${className}`.trim()} type={type} {...props}>
      {children}
    </button>
  );
}

function loadUnlockedAchievements(): AchievementId[] {
  if (
    typeof window === 'undefined' ||
    !window.localStorage ||
    typeof window.localStorage.getItem !== 'function'
  ) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(achievementStorageKey);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is AchievementId => value in achievementCopy);
  } catch {
    return [];
  }
}

function isRoomScene(scene: SceneMode): scene is RoomId {
  return roomOrder.includes(scene as RoomId);
}

function projectRectToPercentages(
  camera: PerspectiveCamera,
  spec: RectSpec,
): CSSProperties {
  const [width, height] = spec.size;
  const [x, y, z] = spec.center;
  const [rx = 0, ry = 0, rz = 0] = spec.rotation ?? [];
  const rotation = new Euler(rx, ry, rz);

  const corners = [
    new Vector3(-width / 2, height / 2, 0),
    new Vector3(width / 2, height / 2, 0),
    new Vector3(width / 2, -height / 2, 0),
    new Vector3(-width / 2, -height / 2, 0),
  ].map((corner) => corner.applyEuler(rotation).add(new Vector3(x, y, z)));

  const projected = corners.map((corner) => corner.project(camera));
  const xs = projected.map((corner) => (corner.x + 1) * 50);
  const ys = projected.map((corner) => (1 - corner.y) * 50);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  return {
    height: `${bottom - top}%`,
    left: `${left}%`,
    top: `${top}%`,
    width: `${right - left}%`,
  };
}

function useEntranceLayout(stageRef: { current: HTMLDivElement | null }) {
  const [layout, setLayout] = useState<Record<string, CSSProperties>>({});

  useLayoutEffect(() => {
    const stageElement = stageRef.current;

    if (!stageElement) {
      return;
    }

    const updateLayout = () => {
      const rect = stageElement.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        return;
      }

      const camera = new PerspectiveCamera(60, rect.width / rect.height, 0.1, 150);
      camera.position.set(0, 0.2, 28);
      camera.lookAt(0, 0.2, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      const worldZ = 22;
      const atWorldZ = (x: number, y: number, z: number): [number, number, number] => [
        x,
        y,
        worldZ + z,
      ];

      setLayout({
        wall: projectRectToPercentages(camera, {
          center: atWorldZ(0, 2.25, 0.15),
          size: [16, 8],
        }),
        path: projectRectToPercentages(camera, {
          center: atWorldZ(0, -1.73, 2.81),
          rotation: [-Math.PI / 2, 0, 0],
          size: [2.04, 5.62],
        }),
        tree: projectRectToPercentages(camera, {
          center: atWorldZ(-2.9, 0.95, 1),
          size: [6, 8],
        }),
        beam: projectRectToPercentages(camera, {
          center: atWorldZ(-0.05, 2.05, 0.65),
          size: [2.7, 0.4],
        }),
        sign: projectRectToPercentages(camera, {
          center: atWorldZ(0, 1.4, 0.6),
          size: [2, 1],
        }),
        frame: projectRectToPercentages(camera, {
          center: atWorldZ(0, -0.505, 0.12),
          size: [2.04, 2.491643454038997],
        }),
        leftDoor: projectRectToPercentages(camera, {
          center: atWorldZ(-0.47, -0.55, 0.06),
          size: [0.94, 2.4],
        }),
        rightDoor: projectRectToPercentages(camera, {
          center: atWorldZ(0.47, -0.55, 0.06),
          size: [0.94, 2.4],
        }),
        window: projectRectToPercentages(camera, {
          center: atWorldZ(2.5, 0, 0.3),
          size: [1.5, 1.5],
        }),
        avatar: projectRectToPercentages(camera, {
          center: atWorldZ(3.5, 0, 0.04),
          size: [1.5, 1.5],
        }),
        duck: projectRectToPercentages(camera, {
          center: atWorldZ(2.5, -1.3, 0.4),
          size: [3, 1.8],
        }),
        bug: projectRectToPercentages(camera, {
          center: atWorldZ(2.5, 1.05, 0.16),
          size: [0.4, 0.4],
        }),
        splash: projectRectToPercentages(camera, {
          center: atWorldZ(2.5, 1.05, 0.17),
          size: [2, 2],
        }),
        cat: projectRectToPercentages(camera, {
          center: atWorldZ(-1.5, -1.15, 0.8),
          size: [1.5, 1.5],
        }),
        mouse: projectRectToPercentages(camera, {
          center: atWorldZ(-2.92, 0.97, 1),
          size: [6, 8],
        }),
      });
    };

    updateLayout();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            updateLayout();
          })
        : null;

    resizeObserver?.observe(stageElement);
    window.addEventListener('resize', updateLayout);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateLayout);
    };
  }, [stageRef]);

  return layout;
}

function RouteMap({
  hoveredRoom,
  onClose,
  onHoverRoom,
  onSelectRoom,
}: RouteMapProps) {
  const paintedOverlay = useMemo(() => {
    if (hoveredRoom === 'tech-dorm') {
      return asset('/images/map_gallery_painted.webp');
    }

    if (hoveredRoom === 'education') {
      return asset('/images/map_about_painted.webp');
    }

    if (hoveredRoom === 'music-studio') {
      return asset('/images/map_studio_painted.webp');
    }

    if (hoveredRoom === 'contact') {
      return asset('/images/map_contact_painted.webp');
    }

    return null;
  }, [hoveredRoom]);

  return (
    <div
      aria-labelledby="corridor-map-title"
      aria-modal="true"
      className="overlay-backdrop"
      role="dialog"
    >
      <div className="overlay-card route-map-card">
        <div className="overlay-card__header">
          <div>
            <p className="overlay-card__eyebrow">Navigation</p>
            <h2 id="corridor-map-title">Corridor Map</h2>
          </div>
          <SketchButton aria-label="Close corridor map" onClick={onClose}>
            Close
          </SketchButton>
        </div>

        <p className="overlay-card__copy">
          The interaction model stays very close to the source website, but each
          destination is remapped around Danish&apos;s work and story.
        </p>

        <div className="route-map-shell">
          <AssetImage className="route-map-shell__base" src={asset('/images/map.webp')} />
          {paintedOverlay ? (
            <AssetImage className="route-map-shell__overlay" src={paintedOverlay} />
          ) : null}
          <AssetImage className="route-map-shell__pin-slot" src={asset('/images/pin-slot.webp')} />
          <AssetImage className="route-map-shell__pin" src={asset('/images/pin.webp')} />

          <button
            className="route-map-shell__zone route-map-shell__zone--education"
            onBlur={() => onHoverRoom(null)}
            onClick={() => onSelectRoom('education')}
            onFocus={() => onHoverRoom('education')}
            onMouseEnter={() => onHoverRoom('education')}
            onMouseLeave={() => onHoverRoom(null)}
            type="button"
          >
            Education
          </button>
          <button
            className="route-map-shell__zone route-map-shell__zone--tech-dorm"
            onBlur={() => onHoverRoom(null)}
            onClick={() => onSelectRoom('tech-dorm')}
            onFocus={() => onHoverRoom('tech-dorm')}
            onMouseEnter={() => onHoverRoom('tech-dorm')}
            onMouseLeave={() => onHoverRoom(null)}
            type="button"
          >
            Tech Dorm
          </button>
          <button
            className="route-map-shell__zone route-map-shell__zone--music-studio"
            onBlur={() => onHoverRoom(null)}
            onClick={() => onSelectRoom('music-studio')}
            onFocus={() => onHoverRoom('music-studio')}
            onMouseEnter={() => onHoverRoom('music-studio')}
            onMouseLeave={() => onHoverRoom(null)}
            type="button"
          >
            Music Studio
          </button>
          <button
            className="route-map-shell__zone route-map-shell__zone--contact"
            onBlur={() => onHoverRoom(null)}
            onClick={() => onSelectRoom('contact')}
            onFocus={() => onHoverRoom('contact')}
            onMouseEnter={() => onHoverRoom('contact')}
            onMouseLeave={() => onHoverRoom(null)}
            type="button"
          >
            Contact
          </button>
          <button
            className="route-map-shell__zone route-map-shell__zone--experience"
            onBlur={() => onHoverRoom(null)}
            onClick={() => onSelectRoom('experience')}
            onFocus={() => onHoverRoom('experience')}
            onMouseEnter={() => onHoverRoom('experience')}
            onMouseLeave={() => onHoverRoom(null)}
            type="button"
          >
            Experience Row
          </button>
        </div>
      </div>
    </div>
  );
}

function AudioPanel({
  isMuted,
  musicVolume,
  onClose,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onToggleMuted,
  sfxVolume,
}: AudioPanelProps) {
  return (
    <section
      aria-labelledby="audio-panel-title"
      className="audio-panel"
      role="complementary"
    >
      <div className="overlay-card__header">
        <div>
          <p className="overlay-card__eyebrow">AUDIO SETTINGS</p>
          <h2 id="audio-panel-title">Paper Sound Desk</h2>
        </div>
        <SketchButton aria-label="Close audio settings" onClick={onClose}>
          Hide
        </SketchButton>
      </div>

      <p className="audio-panel__status">
        Audio is currently <strong>{isMuted ? 'OFF' : 'ON'}</strong>
      </p>

      <label className="audio-panel__control">
        <span>Music</span>
        <input
          aria-label="Music volume"
          max={100}
          min={0}
          onChange={(event) => onMusicVolumeChange(Number(event.target.value))}
          type="range"
          value={musicVolume}
        />
      </label>

      <label className="audio-panel__control">
        <span>SFX</span>
        <input
          aria-label="SFX volume"
          max={100}
          min={0}
          onChange={(event) => onSfxVolumeChange(Number(event.target.value))}
          type="range"
          value={sfxVolume}
        />
      </label>

      <SketchButton aria-label="Toggle muted audio" onClick={onToggleMuted}>
        {isMuted ? 'Unmute' : 'Mute'}
      </SketchButton>
    </section>
  );
}

function RoomScene({ detail, onBack, onOpenMap }: RoomSceneProps) {
  const roomArt = roomShowcaseArt[detail.id];

  return (
    <section className={`room-scene ${roomArt.accentClass}`}>
      <div className="room-scene__hud">
        <div className="room-scene__hud-copy">
          <p className="overlay-card__eyebrow">{detail.eyebrow}</p>
          <h2>{detail.title}</h2>
        </div>

        <div className="room-scene__hud-actions">
          <SketchButton aria-label="Go back to corridor" onClick={onBack}>
            Back to corridor
          </SketchButton>
          <SketchButton aria-label="Open route map" onClick={onOpenMap}>
            Open route map
          </SketchButton>
        </div>
      </div>

      <div className="room-scene__stage">
        <div className="room-scene__parallax room-scene__parallax--back" />
        <div className="room-scene__parallax room-scene__parallax--front" />
        <div className="room-scene__floor" />
        <AssetImage
          className="room-scene__portal"
          src={asset('/textures/doors/door_back.webp')}
        />
        <AssetImage className="room-scene__hero" src={roomArt.hero} />

        <div className="room-scene__summary-note">
          <p className="overlay-card__eyebrow">Why this room matters</p>
          <p className="room-scene__summary">{detail.summary}</p>
        </div>

        <div className="room-scene__chips">
          {detail.chips.map((chip) => (
            <span key={chip} className="room-panel__chip">
              {chip}
            </span>
          ))}
        </div>

        <div className="room-scene__features">
          {detail.features.map((feature, index) => (
            <article
              key={feature.title}
              className={`room-scene__feature room-scene__feature--${index + 1}`}
            >
              <p className="room-panel__feature-title">{feature.title}</p>
              <p>{feature.detail}</p>
            </article>
          ))}
        </div>

        <div className="room-scene__notes">
          {detail.notes.map((note) => (
            <div key={note} className="room-panel__note">
              {note}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CorridorDoor({
  asset,
  detail,
  paintedAsset,
  side,
  x,
  y,
  onOpen,
}: CorridorStop & {
  detail: RoomDetail;
  onOpen: (roomId: RoomId) => void;
}) {
  const doorRef = useRef<HTMLButtonElement | null>(null);
  const paintedRef = useRef<HTMLImageElement | null>(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const doorElement = doorRef.current;
    const paintedElement = paintedRef.current;

    if (!doorElement || !paintedElement) {
      return;
    }

    if (!motionEnabled) {
      paintedElement.style.opacity = isHoveringRef.current ? '1' : '0';
      doorElement.style.transform = 'translateZ(0)';
      return;
    }

    if (isHoveringRef.current) {
      gsap.to(doorElement, {
        duration: 0.28,
        ease: 'power2.out',
        rotate: side === 'left' ? -4 : 4,
        y: -10,
      });
      gsap.to(paintedElement, {
        duration: 0.8,
        ease: 'power2.out',
        opacity: 1,
      });
      return;
    }

    gsap.to(doorElement, {
      duration: 0.28,
      ease: 'power2.out',
      rotate: 0,
      y: 0,
    });
    gsap.to(paintedElement, {
      duration: 0.5,
      ease: 'power2.out',
      opacity: 0,
    });
  });

  return (
    <div
      className={`corridor-stop corridor-stop--${side}`}
      style={{
        left: x,
        top: y,
      }}
    >
      <button
        aria-label={`Open ${detail.label}`}
        className="corridor-stop__door-button"
        onBlur={() => {
          isHoveringRef.current = false;
        }}
        onClick={() => onOpen(detail.id)}
        onFocus={() => {
          isHoveringRef.current = true;
        }}
        onMouseEnter={() => {
          isHoveringRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveringRef.current = false;
        }}
        ref={doorRef}
        type="button"
      >
        <AssetImage className="corridor-stop__door-image" src={asset} />
        <AssetImage
          className="corridor-stop__door-image corridor-stop__door-image--painted"
          ref={paintedRef}
          src={paintedAsset}
        />
      </button>

      <div className="corridor-stop__meta">
        <p className="corridor-stop__eyebrow">{detail.eyebrow}</p>
        <h3>{detail.label}</h3>
      </div>
    </div>
  );
}

function CorridorScene({ onBackOutside, onExplore, onOpenRoom }: CorridorSceneProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [avatarFrame, setAvatarFrame] = useState(1);
  const dragStateRef = useRef<{
    isDragging: boolean;
    lastX: number;
    pointerId: number | null;
  }>({
    isDragging: false,
    lastX: 0,
    pointerId: null,
  });

  const advanceCorridor = useCallback(
    (delta: number) => {
      const scrollElement = scrollRef.current;

      if (!scrollElement) {
        return;
      }

      scrollElement.scrollLeft += delta;

      if (scrollElement.scrollLeft > 120) {
        onExplore();
      }
    },
    [onExplore],
  );

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      advanceCorridor(event.deltaY * 1.18);
    };

    scrollElement.addEventListener('wheel', handleWheel, {
      passive: false,
    });

    return () => {
      scrollElement.removeEventListener('wheel', handleWheel);
    };
  }, [advanceCorridor]);

  useEffect(() => {
    if (!motionEnabled) {
      return;
    }

    const interval = window.setInterval(() => {
      setAvatarFrame((current) => (current === 9 ? 1 : current + 1));
    }, 50);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="corridor-scene">
      <div className="corridor-scene__copy">
        <p className="overlay-card__eyebrow">Explorer</p>
        <h2>Explore the corridor</h2>
        <p>
          Scroll through the hand-drawn hallway, let the doors paint themselves
          on hover, and open the room that best answers the question being asked
          about Danish.
        </p>
        <div className="corridor-scene__actions">
          <SketchButton aria-label="Return to the entrance" onClick={onBackOutside}>
            Return outside
          </SketchButton>
        </div>
      </div>

      <div className="corridor-stage">
        <div className="corridor-stage__ceiling" />
        <div className="corridor-stage__floor" />
        <div
          className="corridor-stage__track"
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
              event.preventDefault();
              advanceCorridor(180);
            }

            if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
              event.preventDefault();
              advanceCorridor(-180);
            }
          }}
          onPointerDown={(event) => {
            dragStateRef.current = {
              isDragging: true,
              lastX: event.clientX,
              pointerId: event.pointerId,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (
              !dragStateRef.current.isDragging ||
              dragStateRef.current.pointerId !== event.pointerId
            ) {
              return;
            }

            const deltaX = dragStateRef.current.lastX - event.clientX;
            dragStateRef.current.lastX = event.clientX;
            advanceCorridor(deltaX * 1.8);
          }}
          onPointerUp={(event) => {
            if (dragStateRef.current.pointerId === event.pointerId) {
              dragStateRef.current = {
                isDragging: false,
                lastX: 0,
                pointerId: null,
              };
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          ref={scrollRef}
          tabIndex={0}
        >
          <div className="corridor-stage__track-inner">
            <AssetImage
              className="corridor-stage__avatar"
              src={asset(`/textures/corridor/avatar_anim/${avatarFrame}.webp`)}
            />

            {corridorStops.map((stop) => (
              <CorridorDoor
                key={stop.id}
                {...stop}
                detail={roomDetails[stop.id]}
                onOpen={onOpenRoom}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EntranceScene({
  bugSquashed,
  cursorOffset,
  debugTip,
  isWindowGreetingVisible,
  onAskDuck,
  onEnterCorridor,
  onPreviewStudio,
  onSquashBug,
  onWindowEnter,
  onWindowLeave,
}: EntranceSceneProps) {
  const stageShellRef = useRef<HTMLDivElement | null>(null);
  const leftDoorRef = useRef<HTMLDivElement | null>(null);
  const rightDoorRef = useRef<HTMLDivElement | null>(null);
  const leftDoorPaintRef = useRef<HTMLImageElement | null>(null);
  const rightDoorPaintRef = useRef<HTMLImageElement | null>(null);
  const leftHandlePaintRef = useRef<HTMLImageElement | null>(null);
  const rightHandlePaintRef = useRef<HTMLImageElement | null>(null);
  const windowAvatarRef = useRef<HTMLDivElement | null>(null);
  const bugRef = useRef<HTMLButtonElement | null>(null);
  const splashRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<HTMLImageElement | null>(null);
  const speechBubbleRef = useRef<HTMLDivElement | null>(null);
  const [bugRevealProgress, setBugRevealProgress] = useState(0);
  const [isDoorHovered, setIsDoorHovered] = useState(false);
  const [isDoorOpening, setIsDoorOpening] = useState(false);
  const entranceLayout = useEntranceLayout(stageShellRef);

  useEffect(() => {
    const avatarElement = windowAvatarRef.current;

    if (!avatarElement) {
      return;
    }

    if (!motionEnabled) {
      avatarElement.style.transform = isWindowGreetingVisible
        ? 'translateX(-1rem) rotate(5deg)'
        : 'translateX(0) rotate(0deg)';
      return;
    }

    gsap.to(avatarElement, {
      duration: isWindowGreetingVisible ? 0.5 : 0.4,
      ease: isWindowGreetingVisible ? 'back.out(1.7)' : 'power2.in',
      x: isWindowGreetingVisible ? -16 : 0,
      rotate: isWindowGreetingVisible ? 6 : 0,
    });
  }, [isWindowGreetingVisible]);

  useEffect(() => {
    const swingTarget = mouseRef.current;
    const bugElement = bugRef.current;
    let frame = 0;
    let animationFrame = 0;

    const animate = () => {
      frame += 0.018;

      if (swingTarget) {
        const angle = Math.sin(frame * 1.6) * 6;
        swingTarget.style.transform = `translateY(${Math.cos(frame * 1.1) * 4}px) rotate(${angle}deg)`;
      }

      if (bugElement && !bugSquashed) {
        const driftX = Math.sin(frame * 1.9) * 18 + Math.sin(frame * 0.75) * 8;
        const driftY = Math.cos(frame * 1.6) * 10 + Math.sin(frame * 1.1) * 6;
        const rotation = Math.sin(frame * 5) * 6;
        bugElement.style.transform = `translate(${driftX}px, ${driftY}px) rotate(${rotation}deg)`;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [bugSquashed]);

  useEffect(() => {
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const leftPaint = leftDoorPaintRef.current;
    const rightPaint = rightDoorPaintRef.current;
    const leftHandlePaint = leftHandlePaintRef.current;
    const rightHandlePaint = rightHandlePaintRef.current;

    if (
      !leftDoor ||
      !rightDoor ||
      !leftPaint ||
      !rightPaint ||
      !leftHandlePaint ||
      !rightHandlePaint ||
      isDoorOpening
    ) {
      return;
    }

    if (!motionEnabled) {
      leftPaint.style.opacity = isDoorHovered ? '1' : '0';
      rightPaint.style.opacity = isDoorHovered ? '1' : '0';
      leftHandlePaint.style.opacity = isDoorHovered ? '1' : '0';
      rightHandlePaint.style.opacity = isDoorHovered ? '1' : '0';
      return;
    }

    if (isDoorHovered) {
      gsap.to(leftDoor, {
        duration: 0.3,
        ease: 'power2.out',
        rotate: -8,
      });
      gsap.to(rightDoor, {
        duration: 0.3,
        ease: 'power2.out',
        rotate: 8,
      });
      gsap.to([leftPaint, rightPaint, leftHandlePaint, rightHandlePaint], {
        duration: 0.8,
        ease: 'power2.out',
        opacity: 1,
      });
      return;
    }

    gsap.to(leftDoor, {
      duration: 0.3,
      ease: 'power2.out',
      rotate: 0,
    });
    gsap.to(rightDoor, {
      duration: 0.3,
      ease: 'power2.out',
      rotate: 0,
    });
    gsap.to([leftPaint, rightPaint, leftHandlePaint, rightHandlePaint], {
      duration: 0.5,
      ease: 'power2.out',
      opacity: 0,
    });
  }, [isDoorHovered, isDoorOpening]);

  useEffect(() => {
    const bubbleElement = speechBubbleRef.current;

    if (!bubbleElement || !debugTip) {
      return;
    }

    if (!motionEnabled) {
      bubbleElement.style.opacity = '1';
      bubbleElement.style.transform = 'scale(1)';
      return;
    }

    gsap.fromTo(
      bubbleElement,
      {
        opacity: 0,
        scale: 0,
      },
      {
        duration: 0.3,
        ease: 'back.out(1.7)',
        opacity: 1,
        scale: 1,
      },
    );
  }, [debugTip]);

  const handleDoorOpen = () => {
    if (isDoorOpening) {
      return;
    }

    setIsDoorOpening(true);
    setIsDoorHovered(false);

    if (!motionEnabled) {
      onEnterCorridor();
      return;
    }

    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const leftPaint = leftDoorPaintRef.current;
    const rightPaint = rightDoorPaintRef.current;

    if (!leftDoor || !rightDoor || !leftPaint || !rightPaint) {
      onEnterCorridor();
      return;
    }

    const timeline = gsap.timeline({
      onComplete: onEnterCorridor,
    });

    timeline.to([leftPaint, rightPaint], {
      duration: 0.15,
      opacity: 1,
    });
    timeline.to(
      leftDoor,
      {
        duration: 0.9,
        ease: 'power2.out',
        rotate: -58,
      },
      0.1,
    );
    timeline.to(
      rightDoor,
      {
        duration: 0.9,
        ease: 'power2.out',
        rotate: 58,
      },
      0.1,
    );
  };

  const handleSquashBug = () => {
    onSquashBug();

    if (!motionEnabled) {
      setBugRevealProgress(1);
      return;
    }

    const splashElement = splashRef.current;

    if (splashElement) {
      gsap.fromTo(
        splashElement,
        {
          opacity: 0,
          scale: 0,
        },
        {
          duration: 0.4,
          ease: 'back.out(1.7)',
          opacity: 1,
          scale: 0.8,
        },
      );
      gsap.to(splashElement, {
        delay: 1.5,
        duration: 1,
        ease: 'power2.out',
        opacity: 0,
      });
    }

    const progress = {
      value: 0,
    };

    gsap.to(progress, {
      duration: 0.8,
      ease: 'power1.inOut',
      value: 1,
      onUpdate: () => {
        setBugRevealProgress(progress.value);
      },
    });
  };

  return (
    <section className="entrance-scene">
      <div className="entrance-copy">
        <p className="overlay-card__eyebrow">Outside the house</p>
        <h1>Welcome to Danish Sharma&apos;s Digital Universe</h1>
        <p>
          This version keeps the exterior-house arrival from the source site, but
          the story inside is Danish&apos;s: AI-native product work, academic depth,
          real-team experience, and music-driven discipline.
        </p>

        <div className="entrance-copy__chips">
          <span>AI-native builder</span>
          <span>TIET final semester</span>
          <span>Creative web taste</span>
          <span>Music &amp; systems</span>
        </div>

        <div className="entrance-copy__actions">
          <SketchButton aria-label="Preview the music studio" onClick={onPreviewStudio}>
            Preview the studio
          </SketchButton>
          <SketchButton aria-label="Walk inside" onClick={handleDoorOpen}>
            Walk inside
          </SketchButton>
        </div>
      </div>

      <div className="entrance-stage">
        <div className="entrance-stage__paper" />
        <div className="entrance-stage__house-shell" ref={stageShellRef}>
          <AssetImage
            className="entrance-stage__wall"
            style={entranceLayout.wall}
            src={asset('/textures/entrance/wall_bricks_2.webp')}
          />
          <AssetImage
            className="entrance-stage__floor"
            src={asset('/textures/entrance/floor_paper.webp')}
          />
          <AssetImage
            className="entrance-stage__path"
            style={entranceLayout.path}
            src={asset('/textures/entrance/stone-path.webp')}
          />
          <AssetImage
            className="entrance-stage__tree"
            style={entranceLayout.tree}
            src={asset('/textures/entrance/tree_sketch.webp')}
          />
          <AssetImage
            className="entrance-stage__beam"
            style={entranceLayout.beam}
            src={asset('/textures/entrance/belka.webp')}
          />
          <AssetImage
            className="entrance-stage__sign"
            style={entranceLayout.sign}
            src={asset('/textures/entrance/sign.webp')}
          />
          <AssetImage
            className="entrance-stage__frame"
            style={entranceLayout.frame}
            src={asset('/textures/doors/frame_sketch.webp')}
          />
          <AssetImage
            className="entrance-stage__mouse"
            ref={mouseRef}
            src={asset('/textures/entrance/mouse_hanging.webp')}
          />

          <div className="entrance-stage__window-wrap" style={entranceLayout.window}>
            <button
              aria-label="Look through the window"
              className="entrance-stage__window-hit"
              onBlur={onWindowLeave}
              onFocus={onWindowEnter}
              onMouseEnter={onWindowEnter}
              onMouseLeave={onWindowLeave}
              type="button"
            >
              <span className="sr-only">Look through the window</span>
            </button>
            <AssetImage
              className="entrance-stage__window"
              src={asset('/textures/entrance/window_sketch.webp')}
            />
            <div
              className="entrance-stage__avatar"
              ref={windowAvatarRef}
              style={entranceLayout.avatar}
            >
              <AssetImage
                className="entrance-stage__avatar-image"
                src={asset('/textures/entrance/avatar_window.webp')}
              />
            </div>
          </div>

          <button
            aria-label="Enter the corridor"
            className="entrance-stage__door-hit"
            onBlur={() => setIsDoorHovered(false)}
            onClick={handleDoorOpen}
            onFocus={() => setIsDoorHovered(true)}
            onMouseEnter={() => setIsDoorHovered(true)}
            onMouseLeave={() => setIsDoorHovered(false)}
            style={{
              left: '43.6%',
              top: '52.2%',
              width: '13%',
              height: '27%',
            }}
            type="button"
          >
            <span className="sr-only">Enter the corridor</span>
          </button>

          <div
            className="entrance-stage__door entrance-stage__door--left"
            ref={leftDoorRef}
            style={entranceLayout.leftDoor}
          >
            <AssetImage
              className="entrance-stage__door-image"
              src={asset('/textures/doors/door_left_sketch.webp')}
            />
            <AssetImage
              className="entrance-stage__door-image entrance-stage__door-image--painted"
              ref={leftDoorPaintRef}
              src={asset('/textures/doors/door_left_painted.webp')}
            />
            <AssetImage
              className="entrance-stage__handle-image"
              src={asset('/textures/doors/handle_left_sketch.webp')}
            />
            <AssetImage
              className="entrance-stage__handle-image entrance-stage__handle-image--painted"
              ref={leftHandlePaintRef}
              src={asset('/textures/doors/handle_left_painted.webp')}
            />
          </div>

          <div
            className="entrance-stage__door entrance-stage__door--right"
            ref={rightDoorRef}
            style={entranceLayout.rightDoor}
          >
            <AssetImage
              className="entrance-stage__door-image"
              src={asset('/textures/doors/door_right_sketch.webp')}
            />
            <AssetImage
              className="entrance-stage__door-image entrance-stage__door-image--painted"
              ref={rightDoorPaintRef}
              src={asset('/textures/doors/door_right_painted.webp')}
            />
            <AssetImage
              className="entrance-stage__handle-image"
              src={asset('/textures/doors/handle_right_sketch.webp')}
            />
            <AssetImage
              className="entrance-stage__handle-image entrance-stage__handle-image--painted"
              ref={rightHandlePaintRef}
              src={asset('/textures/doors/handle_right_painted.webp')}
            />
          </div>

          <div className="entrance-stage__duck-wrap" style={entranceLayout.duck}>
            <AssetImage
              className="entrance-stage__duck"
              src={asset('/textures/entrance/pot_with_duck.webp')}
            />
            <button
              aria-label="Ask the duck for a debug tip"
              className="entrance-stage__duck-hit"
              onClick={onAskDuck}
              type="button"
            >
              <span className="sr-only">Ask the duck for a debug tip</span>
            </button>

            <div
              className={`entrance-stage__speech ${debugTip ? 'is-visible' : ''}`}
              ref={speechBubbleRef}
            >
              <AssetImage
                className="entrance-stage__speech-image"
                src={asset('/textures/entrance/speech_bubble.webp')}
              />
              <span className="entrance-stage__speech-text">{debugTip ?? ''}</span>
            </div>
          </div>

          <div className="entrance-stage__bug-area" style={entranceLayout.bug}>
            {!bugSquashed ? (
              <button
                aria-label="Squash the bug"
                className="entrance-stage__bug-hit"
                onClick={handleSquashBug}
                ref={bugRef}
                type="button"
              >
                <AssetImage
                  className="entrance-stage__bug"
                  src={asset('/textures/entrance/bug_sketch.webp')}
                />
              </button>
            ) : null}

            <div className="entrance-stage__bug-splash" ref={splashRef}>
              <AssetImage src={asset('/images/ink-splash.webp')} />
            </div>
            <div className="entrance-stage__bug-banner">
              <span
                className="entrance-stage__bug-banner-text"
                style={{
                  clipPath: `inset(0 ${Math.max(0, 100 - bugRevealProgress * 100)}% 0 0)`,
                }}
              >
                BUG FIXED!
              </span>
            </div>
          </div>

          <div className="entrance-stage__cat" style={entranceLayout.cat}>
            <AssetImage
              className="entrance-stage__cat-image"
              src={asset('/textures/entrance/cat_front_body.webp')}
            />
            <span
              className="entrance-stage__cat-eye entrance-stage__cat-eye--left"
              style={{
                transform: `translate(${cursorOffset.x * 0.18}px, ${cursorOffset.y * 0.18}px)`,
              }}
            />
            <span
              className="entrance-stage__cat-eye entrance-stage__cat-eye--right"
              style={{
                transform: `translate(${cursorOffset.x * 0.18}px, ${cursorOffset.y * 0.18}px)`,
              }}
            />
          </div>
        </div>

        <div className="entrance-stage__note entrance-stage__note--window">
          {isWindowGreetingVisible
            ? 'Danish waves from the window.'
            : 'Hover near the window to wake the avatar.'}
        </div>
        <div className="entrance-stage__note entrance-stage__note--bug">
          {bugSquashed
            ? 'The wall bug is gone.'
            : 'There is a tiny wall bug to squash.'}
        </div>
      </div>
    </section>
  );
}

export function InspiredPortfolioRoute() {
  if (import.meta.env.MODE !== 'test') {
    return <InspiredPortfolioRoute3D />;
  }

  const setCurrentLocation = usePortfolioStore((state) => state.setCurrentLocation);
  const setWorldLoading = usePortfolioStore((state) => state.setWorldLoading);

  const [scene, setScene] = useState<SceneMode>('entrance');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(72);
  const [sfxVolume, setSfxVolume] = useState(68);
  const [bugSquashed, setBugSquashed] = useState(false);
  const [isWindowGreetingVisible, setIsWindowGreetingVisible] = useState(false);
  const [hoveredMapRoom, setHoveredMapRoom] = useState<RoomId | null>(null);
  const [latestAchievement, setLatestAchievement] = useState<AchievementId | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementId[]>(
    loadUnlockedAchievements,
  );
  const [debugTip, setDebugTip] = useState<string | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle');
  const [cursorOffset, setCursorOffset] = useState({
    x: 0,
    y: 0,
  });

  const achievementTimeoutRef = useRef<number | null>(null);
  const debugTipTimeoutRef = useRef<number | null>(null);
  const transitionTimeoutsRef = useRef<number[]>([]);

  const activeRoom = isRoomScene(scene) ? roomDetails[scene] : null;

  useEffect(() => {
    setWorldLoading(false);
  }, [setWorldLoading]);

  useEffect(() => {
    if (scene === 'tech-dorm') {
      setCurrentLocation('Tech-Dorm');
      return;
    }

    if (scene === 'education') {
      setCurrentLocation('Education');
      return;
    }

    if (scene === 'experience') {
      setCurrentLocation('Experience Row');
      return;
    }

    if (scene === 'music-studio') {
      setCurrentLocation('Music Studio');
      return;
    }

    setCurrentLocation('Hub');
  }, [scene, setCurrentLocation]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !window.localStorage ||
      typeof window.localStorage.setItem !== 'function'
    ) {
      return;
    }

    window.localStorage.setItem(
      achievementStorageKey,
      JSON.stringify(unlockedAchievements),
    );
  }, [unlockedAchievements]);

  useEffect(() => {
    if (!latestAchievement) {
      return;
    }

    if (achievementTimeoutRef.current !== null) {
      window.clearTimeout(achievementTimeoutRef.current);
    }

    achievementTimeoutRef.current = window.setTimeout(() => {
      setLatestAchievement(null);
    }, motionEnabled ? 2600 : 10);

    return () => {
      if (achievementTimeoutRef.current !== null) {
        window.clearTimeout(achievementTimeoutRef.current);
      }
    };
  }, [latestAchievement]);

  useEffect(() => {
    return () => {
      if (achievementTimeoutRef.current !== null) {
        window.clearTimeout(achievementTimeoutRef.current);
      }

      if (debugTipTimeoutRef.current !== null) {
        window.clearTimeout(debugTipTimeoutRef.current);
      }

      transitionTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const unlockAchievement = useCallback((achievementId: AchievementId) => {
    setLatestAchievement(achievementId);
    setUnlockedAchievements((current) =>
      current.includes(achievementId) ? current : [...current, achievementId],
    );
  }, []);

  const openRoom = useCallback(
    (roomId: RoomId) => {
      let achievementId: AchievementId | null = null;

      if (roomId === 'tech-dorm') {
        achievementId = 'tech_dorm_open';
      }

      if (roomId === 'music-studio') {
        achievementId = 'music_studio_open';
      }

      if (roomId === 'contact') {
        achievementId = 'contact_choose';
      }

      if (achievementId) {
        unlockAchievement(achievementId);
      }

      transitionTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      transitionTimeoutsRef.current = [];
      setIsMapOpen(false);

      if (!motionEnabled) {
        setScene(roomId);
        setTransitionPhase('idle');
        return;
      }

      setTransitionPhase('closing');

      transitionTimeoutsRef.current.push(
        window.setTimeout(() => {
          setScene(roomId);
          setTransitionPhase('opening');
        }, 220),
      );

      transitionTimeoutsRef.current.push(
        window.setTimeout(() => {
          setTransitionPhase('idle');
          transitionTimeoutsRef.current = [];
        }, 820),
      );
    },
    [unlockAchievement],
  );

  const transitionToScene = useCallback((nextScene: SceneMode) => {
    transitionTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    transitionTimeoutsRef.current = [];
    setIsMapOpen(false);

    if (!motionEnabled) {
      setScene(nextScene);
      setTransitionPhase('idle');
      return;
    }

    setTransitionPhase('closing');

    transitionTimeoutsRef.current.push(
      window.setTimeout(() => {
        setScene(nextScene);
        setTransitionPhase('opening');
      }, 220),
    );

    transitionTimeoutsRef.current.push(
      window.setTimeout(() => {
        setTransitionPhase('idle');
        transitionTimeoutsRef.current = [];
      }, 820),
    );
  }, []);

  const handleAskDuck = useCallback(() => {
    const nextTip =
      duckDebugTips[Math.floor(Math.random() * duckDebugTips.length)] ??
      duckDebugTips[0];

    setDebugTip(nextTip);

    if (debugTipTimeoutRef.current !== null) {
      window.clearTimeout(debugTipTimeoutRef.current);
    }

    debugTipTimeoutRef.current = window.setTimeout(() => {
      setDebugTip(null);
    }, motionEnabled ? 3000 : 1000);
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

    setCursorOffset({
      x: Math.max(-10, Math.min(10, normalizedX * 24)),
      y: Math.max(-8, Math.min(8, normalizedY * 20)),
    });
  };

  const latestAchievementCopy = latestAchievement
    ? achievementCopy[latestAchievement]
    : null;

  return (
    <main
      className="itom-shell"
      data-testid="inspired-portfolio-shell"
      onPointerMove={handlePointerMove}
    >
      <div
        aria-hidden="true"
        className="itom-shell__paper"
        style={{
          backgroundImage: `url(${asset('/textures/paper-texture.webp')})`,
        }}
      />

      <header className="itom-shell__topbar">
        <div className="itom-shell__brand">
          <p className="overlay-card__eyebrow">Danish Sharma</p>
          <h2>AI Native Innovation Engineer</h2>
          <p>
            Final-semester Computer Engineering student at TIET, building
            AI-native products, immersive interfaces, and practical systems with
            a strong bias toward shipping.
          </p>
        </div>

        <div className="itom-shell__controls">
          <SketchButton aria-label="Open route map" onClick={() => setIsMapOpen(true)}>
            Open route map
          </SketchButton>
          <SketchButton
            aria-label={isAudioOpen ? 'Hide audio settings' : 'Show audio settings'}
            onClick={() => setIsAudioOpen((current) => !current)}
          >
            Audio settings
          </SketchButton>
          <SketchButton aria-label="Open Music Studio" onClick={() => openRoom('music-studio')}>
            Open Music Studio
          </SketchButton>
        </div>
      </header>



      {scene === 'entrance' ? (
        <EntranceScene
          bugSquashed={bugSquashed}
          cursorOffset={cursorOffset}
          debugTip={debugTip}
          isWindowGreetingVisible={isWindowGreetingVisible}
          onAskDuck={handleAskDuck}
          onEnterCorridor={() => {
            unlockAchievement('corridor_enter');
            transitionToScene('corridor');
          }}
          onPreviewStudio={() => openRoom('music-studio')}
          onSquashBug={() => {
            setBugSquashed(true);
            unlockAchievement('bug_fixed');
          }}
          onWindowEnter={() => setIsWindowGreetingVisible(true)}
          onWindowLeave={() => setIsWindowGreetingVisible(false)}
        />
      ) : null}

      {scene === 'corridor' ? (
        <CorridorScene
          onBackOutside={() => transitionToScene('entrance')}
          onExplore={() => unlockAchievement('corridor_explore')}
          onOpenRoom={openRoom}
        />
      ) : null}

      {activeRoom ? (
        <RoomScene
          detail={activeRoom}
          onBack={() => transitionToScene('corridor')}
          onOpenMap={() => setIsMapOpen(true)}
        />
      ) : null}

      {isMapOpen ? (
        <RouteMap
          hoveredRoom={hoveredMapRoom}
          onClose={() => setIsMapOpen(false)}
          onHoverRoom={setHoveredMapRoom}
          onSelectRoom={openRoom}
        />
      ) : null}

      {isAudioOpen ? (
        <AudioPanel
          isMuted={isMuted}
          musicVolume={musicVolume}
          onClose={() => setIsAudioOpen(false)}
          onMusicVolumeChange={setMusicVolume}
          onSfxVolumeChange={setSfxVolume}
          onToggleMuted={() => setIsMuted((current) => !current)}
          sfxVolume={sfxVolume}
        />
      ) : null}

      {transitionPhase !== 'idle' ? (
        <div
          aria-hidden="true"
          className={`paper-transition paper-transition--${transitionPhase}`}
        >
          <div className="paper-transition__half paper-transition__half--top" />
          <div className="paper-transition__half paper-transition__half--bottom" />
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {scene === 'entrance'
          ? 'Outside the portfolio house.'
          : scene === 'corridor'
            ? 'Entered the corridor.'
            : `Entered ${activeRoom?.title ?? 'room'}.`}
      </p>
    </main>
  );
}
