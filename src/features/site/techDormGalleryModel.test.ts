import { describe, expect, it } from 'vitest';

import {
  resolveTechDormPosterSelection,
  techDormGalleryEnvironmentTexturePaths,
  techDormGalleryPosters,
} from './techDormGalleryModel';

describe('tech dorm gallery model', () => {
  it('curates Danish-specific posters instead of the reference site projects', () => {
    expect(
      techDormGalleryPosters.map((poster) => ({
        id: poster.id,
        title: poster.title,
      })),
    ).toEqual([
      { id: 'digi-vi', title: 'DIGI-VI' },
      { id: 'omni-agent-v2', title: 'Omni-Agent V2' },
      { id: 'for-friends-on-the-go', title: 'For Friends On The Go' },
      { id: 'lets-talk', title: 'LetsTalk' },
    ]);
  });

  it('anchors every poster in the user-provided project stack instead of placeholders', () => {
    expect(techDormGalleryPosters.map((poster) => poster.techStack.length)).toEqual([4, 5, 4, 4]);
    expect(
      techDormGalleryPosters.flatMap((poster) => poster.techStack),
    ).toEqual(
      expect.arrayContaining([
        'Django',
        'Google Sheets API',
        'Plotly',
        'FastAPI',
        'Next.js',
        'PostgreSQL',
        'Supabase',
        'React Native',
        'Tamagui',
        'Maps API',
        'Python',
        'Firebase',
        'Streamlit',
        'Realtime DB',
      ]),
    );
  });

  it('preserves the timeline and deployment proof for each real project card', () => {
    expect(
      techDormGalleryPosters.map((poster) => ({
        title: poster.title,
        timeline: poster.timeline,
        proofHref: poster.proofHref,
      })),
    ).toEqual([
      {
        title: 'DIGI-VI',
        timeline: 'Jan 2024 - Jan 2025',
        proofHref: 'https://dv-portal.thapar.edu:8443',
      },
      {
        title: 'Omni-Agent V2',
        timeline: 'Apr 2026',
        proofHref: 'https://omniagent.danis.live',
      },
      {
        title: 'For Friends On The Go',
        timeline: 'Live product build',
        proofHref: null,
      },
      {
        title: 'LetsTalk',
        timeline: 'Quick project',
        proofHref: 'https://github.com/Danish2op/LetsTalk',
      },
    ]);
  });

  it('matches the reference gallery interaction rule where clicking the same poster closes it', () => {
    expect(resolveTechDormPosterSelection(null, 'digi-vi')).toBe('digi-vi');
    expect(resolveTechDormPosterSelection('digi-vi', 'digi-vi')).toBeNull();
    expect(
      resolveTechDormPosterSelection('digi-vi', 'omni-agent-v2'),
    ).toBe('omni-agent-v2');
  });

  it('prepares the reference gallery environment textures needed to make the room feel like a room', () => {
    expect(techDormGalleryEnvironmentTexturePaths).toEqual([
      '/textures/gallery/floor.webp',
      '/textures/gallery/railing.webp',
      '/textures/gallery/domki.webp',
      '/textures/gallery/miastotlo.webp',
      '/textures/gallery/bird_gray.webp',
      '/textures/gallery/klamerka.webp',
    ]);
  });
});
