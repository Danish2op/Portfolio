import { describe, expect, it } from 'vitest';

import {
  musicStudioItems,
  platformConfigs,
  resolveMusicStudioItemSelection,
} from './musicStudioModel';

describe('music studio model', () => {
  it('curates Danish-specific music studio items', () => {
    expect(
      musicStudioItems.map((item) => ({
        id: item.id,
        platform: item.platform,
        title: item.title,
      })),
    ).toEqual([
      { id: 'ms-yt-tv-001', platform: 'youtube-tv', title: "Danish's Flute YouTube Channel" },
      { id: 'ms-yt-mon-001', platform: 'youtube-monitor', title: 'Aandolan - Band Performance' },
      { id: 'ms-ig-001', platform: 'instagram', title: 'Sangeet Visharad Classical Training' },
      { id: 'ms-ig-002', platform: 'instagram', title: 'TEDx Performance' },
      { id: 'ms-ig-003', platform: 'instagram', title: 'Performed with Naalayak at Hardrock Cafe' },
    ]);
  });

  it('maps platform tags to the correct physical 3D device shapes', () => {
    expect(platformConfigs['youtube-tv'].shape).toBe('tv');
    expect(platformConfigs['youtube-monitor'].shape).toBe('monitor');
    expect(platformConfigs['instagram'].shape).toBe('phone');
  });

  it('resolves item selection state updates correctly', () => {
    expect(resolveMusicStudioItemSelection(null, 'ms-yt-tv-001')).toBe('ms-yt-tv-001');
    expect(resolveMusicStudioItemSelection('ms-yt-tv-001', 'ms-yt-tv-001')).toBeNull();
    expect(resolveMusicStudioItemSelection('ms-yt-tv-001', 'ms-ig-001')).toBe('ms-ig-001');
  });
});
