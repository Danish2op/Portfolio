export type TechDormPosterId =
  | 'digi-vi'
  | 'omni-agent-v2'
  | 'for-friends-on-the-go'
  | 'lets-talk';

export type TechDormGalleryPoster = {
  id: TechDormPosterId;
  title: string;
  kicker: string;
  summary: string;
  detail: string;
  techStack: readonly string[];
  accent: string;
  timeline?: string;
  proofHref?: string | null;
  githubHref?: string | null;
};

export const techDormGalleryEnvironmentTexturePaths = [
  '/textures/gallery/floor.webp',
  '/textures/gallery/railing.webp',
  '/textures/gallery/domki.webp',
  '/textures/gallery/miastotlo.webp',
  '/textures/gallery/bird_gray.webp',
  '/textures/gallery/klamerka.webp',
] as const;

export const techDormGalleryPosters: readonly TechDormGalleryPoster[] = [
  {
    id: 'digi-vi',
    title: 'DIGI-VI',
    kicker: 'Digital Village Intelligence Platform',
    summary:
      'A campus-facing intelligence dashboard for organizing operational data with Django, Python, Google Sheets API, and Plotly.',
    detail:
      'Built from Jan 2024 to Jan 2025, it turns spreadsheet-fed records into clear reporting flows and visual analysis for decision-making.',
    techStack: ['Django', 'Python', 'Google Sheets API', 'Plotly'],
    accent: '#c7e7ff',
    timeline: 'Jan 2024 - Jan 2025',
    proofHref: 'https://dv-portal.thapar.edu:8443',
    githubHref: null,
  },
  {
    id: 'omni-agent-v2',
    title: 'Omni-Agent V2',
    kicker: 'Cognitive AI System',
    summary:
      'A cognitive AI system that combines Python, FastAPI, Next.js, PostgreSQL, and Supabase into one product surface.',
    detail:
      'Shipped in Apr 2026 with orchestration, retrieval, and full-stack delivery designed around dependable product behavior.',
    techStack: ['Python', 'FastAPI', 'Next.js', 'PostgreSQL', 'Supabase'],
    accent: '#f7e5b2',
    timeline: 'Apr 2026',
    proofHref: 'https://omniagent.danis.live',
    githubHref: 'https://github.com/Danish2op/Omni-Assistant',
  },
  {
    id: 'for-friends-on-the-go',
    title: 'For Friends On The Go',
    kicker: 'Live mobile coordination tool',
    summary:
      'A React Native, Firebase, Tamagui, and Maps API build for friends coordinating plans while moving through the city.',
    detail:
      'Presented as a live product build, it focuses on location-aware coordination, mobile UX, and reliable sync between friends.',
    techStack: ['React Native', 'Firebase', 'Tamagui', 'Maps API'],
    accent: '#d6f3d2',
    timeline: 'Live product build',
    proofHref: null,
    githubHref: 'https://github.com/Danish2op/For-Friends-On-The-Go',
  },
  {
    id: 'lets-talk',
    title: 'LetsTalk',
    kicker: 'Real-time Chatroom App',
    summary:
      'A real-time chatroom based chat app built as a quick project that uses Streamlit for frontend and Firebase for backend.',
    detail:
      'A lightweight and fast messaging dashboard. Pair a clean Streamlit interface with a real-time database to manage instant communication and multi-user chatrooms.',
    techStack: ['Streamlit', 'Firebase', 'Python', 'Realtime DB'],
    accent: '#f7dcd2',
    timeline: 'Quick project',
    proofHref: 'https://github.com/Danish2op/LetsTalk',
    githubHref: 'https://github.com/Danish2op/LetsTalk',
  },
] as const;

export function resolveTechDormPosterSelection(
  currentPosterId: TechDormPosterId | null,
  nextPosterId: TechDormPosterId,
) {
  return currentPosterId === nextPosterId ? null : nextPosterId;
}

function escapeSvgText(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function wrapSvgText(value: string, maxLineLength: number) {
  const words = value.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxLineLength) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function encodeSvg(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderStackPills(stack: readonly string[]) {
  return stack
    .map((item, index) => {
      const x = 52 + (index % 2) * 260;
      const y = 612 + Math.floor(index / 2) * 58;
      return `
        <rect x="${x}" y="${y}" width="212" height="38" rx="18" fill="#fffef8" stroke="#1d1d1d" stroke-width="3" />
        <text x="${x + 106}" y="${y + 25}" text-anchor="middle" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="20" fill="#1d1d1d">${escapeSvgText(item)}</text>
      `;
    })
    .join('');
}

function renderWrappedTextBlock(
  lines: string[],
  x: number,
  y: number,
  width: number,
  fontSize: number,
  lineGap: number,
) {
  return lines
    .map(
      (line, index) => `
        <text x="${x}" y="${y + index * lineGap}" text-anchor="middle" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="${fontSize}" fill="#1f1f1f" width="${width}">
          ${escapeSvgText(line)}
        </text>
      `,
    )
    .join('');
}

export function createTechDormPosterFrontSvg(
  poster: TechDormGalleryPoster,
  painted = false,
) {
  const summaryLines = wrapSvgText(poster.summary, 28).slice(0, 4);
  const accentOpacity = painted ? 0.92 : 0.18;
  const background = painted ? '#fff8e9' : '#fcfbf4';
  const titleFill = painted ? '#121212' : '#1f1f1f';

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024">
      <rect width="768" height="1024" rx="34" fill="${background}" />
      <rect x="24" y="24" width="720" height="976" rx="30" fill="none" stroke="#1e1e1e" stroke-width="8" />
      <path d="M58 182 C188 118 314 104 710 146 L710 292 C524 334 204 370 58 352 Z" fill="${poster.accent}" opacity="${accentOpacity}" />
      <text x="72" y="118" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="34" fill="#3d3d3d">${escapeSvgText(poster.kicker)}</text>
      <text x="72" y="214" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="72" fill="${titleFill}">${escapeSvgText(poster.title)}</text>
      <line x1="72" y1="246" x2="684" y2="246" stroke="#1d1d1d" stroke-width="5" stroke-linecap="round" />
      <rect x="68" y="294" width="632" height="278" rx="28" fill="#fffef8" stroke="#1d1d1d" stroke-width="4" />
      ${renderWrappedTextBlock(summaryLines, 384, 370, 560, 33, 46)}
      <text x="70" y="704" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="32" fill="#2b2b2b">Stack</text>
      ${renderStackPills(poster.techStack)}
      <rect x="70" y="898" width="628" height="76" rx="28" fill="${painted ? poster.accent : '#fffef8'}" stroke="#1d1d1d" stroke-width="4" />
      <text x="384" y="946" text-anchor="middle" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="34" fill="#1d1d1d">Tap to inspect</text>
    </svg>
  `);
}

export function createTechDormPosterBackSvg(poster: TechDormGalleryPoster) {
  const detailLines = wrapSvgText(poster.detail, 30).slice(0, 5);

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024">
      <rect width="768" height="1024" rx="34" fill="#f9f7ef" />
      <rect x="24" y="24" width="720" height="976" rx="30" fill="none" stroke="#1e1e1e" stroke-width="8" />
      <rect x="60" y="74" width="648" height="102" rx="24" fill="${poster.accent}" opacity="0.78" />
      <text x="384" y="140" text-anchor="middle" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="56" fill="#171717">${escapeSvgText(poster.title)}</text>
      <text x="384" y="250" text-anchor="middle" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="30" fill="#333">Project notes</text>
      <rect x="70" y="292" width="628" height="344" rx="28" fill="#fffef8" stroke="#1d1d1d" stroke-width="4" />
      ${renderWrappedTextBlock(detailLines, 384, 380, 552, 31, 45)}
      <text x="70" y="730" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="30" fill="#333">Core tools</text>
      ${renderStackPills(poster.techStack)}
      ${
        poster.githubHref
          ? `
      <rect x="160" y="804" width="448" height="74" rx="24" fill="${poster.accent}" stroke="#1d1d1d" stroke-width="4" />
      <text x="384" y="850" text-anchor="middle" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="32" fill="#111">View on GitHub</text>
      `
          : ''
      }
      <rect x="160" y="902" width="448" height="74" rx="24" fill="#fffef8" stroke="#1d1d1d" stroke-width="4" />
      <text x="384" y="948" text-anchor="middle" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="32" fill="#111">Tap again to hang it back</text>
    </svg>
  `);
}

export function createGithubBannerSvg(painted = false) {
  const background = painted ? '#fff8e9' : '#fcfbf4';
  const strokeColor = '#1d1d1d';
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="160" viewBox="0 0 512 160">
      <rect width="512" height="160" rx="16" fill="${background}" />
      <rect x="8" y="8" width="496" height="144" rx="12" fill="none" stroke="${strokeColor}" stroke-width="4" />
      <g transform="translate(64, 80) scale(0.9)">
        <path d="M 0 -40 C -25 -40 -45 -20 -45 5 C -45 25 -30 42 -10 48 C -8 48 -9 45 -9 43 C -25 45 -30 30 -30 30 C -33 22 -38 20 -38 20 C -43 17 -37 17 -37 17 C -32 17 -29 22 -29 22 C -24 30 -16 28 -12 26 C -12 22 -10 19 -8 17 C -22 15 -36 10 -36 -14 C -36 -21 -33 -27 -29 -32 C -30 -34 -32 -41 -28 -50 C -28 -50 -23 -52 -12 -44 C -7 -46 0 -46 5 -46 C 10 -46 15 -46 20 -44 C 31 -52 36 -50 36 -50 C 40 -41 38 -34 37 -32 C 41 -27 44 -21 44 -14 C 44 10 30 15 16 17 C 18 19 20 23 20 29 C 20 37 19 43 19 45 C 19 47 18 48 20 48 C 40 42 55 25 55 5 C 55 -20 35 -40 0 -40 Z" fill="${strokeColor}" />
        <path d="M -30 -35 L -42 -55 L -20 -43 Z" fill="${strokeColor}" />
        <path d="M 30 -35 L 42 -55 L 20 -43 Z" fill="${strokeColor}" />
      </g>
      <text x="290" y="78" text-anchor="middle" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="36" font-weight="bold" fill="#111">My GitHub Profile</text>
      <text x="290" y="122" text-anchor="middle" font-family="'Cabin Sketch', 'Trebuchet MS', sans-serif" font-size="28" fill="#444">github.com/Danish2op</text>
    </svg>
  `);
}
