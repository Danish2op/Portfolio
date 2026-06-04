export type MusicStudioPlatform = 'youtube-tv' | 'youtube-monitor' | 'instagram';
export type MusicStudioShape = 'tv' | 'monitor' | 'phone';

export type MusicStudioItem = {
  id: string;
  platform: MusicStudioPlatform;
  title: string;
  description: string;
  frontTexture?: string | null;
  paintedFrontTexture?: string | null;
  url: string;
  date: string;
  views?: string;
  likes?: string;
  readTime?: string;
  duration?: string;
};

export type PlatformConfig = {
  name: string;
  shape: MusicStudioShape;
  color: string;
  accentColor: string;
  icon: string;
};

export const platformConfigs: Record<MusicStudioPlatform, PlatformConfig> = {
  'youtube-tv': {
    name: 'YouTube',
    shape: 'tv',
    color: '#FF0000',
    accentColor: '#282828',
    icon: '📺',
  },
  'youtube-monitor': {
    name: 'YouTube',
    shape: 'monitor',
    color: '#FF0000',
    accentColor: '#1d1d1d',
    icon: '💻',
  },
  'instagram': {
    name: 'Instagram',
    shape: 'phone',
    color: '#E1306C',
    accentColor: '#405DE6',
    icon: '🎵',
  },
};

export const musicStudioItems: readonly MusicStudioItem[] = [
  {
    id: 'ms-yt-tv-001',
    platform: 'youtube-tv',
    title: "Danish's Flute YouTube Channel",
    description: 'I post few Flute videos on Youtube',
    url: 'https://www.youtube.com/@bamboonotes927',
    date: '2026-05-26',
    views: '10K',
    duration: 'Various',
  },
  {
    id: 'ms-yt-mon-001',
    platform: 'youtube-monitor',
    title: 'Aandolan - Band Performance',
    description: 'Official music video release and live performances of my band Aandolan.',
    frontTexture: '/textures/studio/Aandolan_painted.jpg',
    url: 'https://youtu.be/mrZAYqd0Upk?si=rQbwloSyGTTJALwK',
    date: '2026-05-26',
    views: '150K',
    duration: '4:15',
  },
  {
    id: 'ms-ig-001',
    platform: 'instagram',
    title: 'Sangeet Visharad Classical Training',
    description: 'Over 8 years of formal classical training in Bansuri under my Guru Ustaad Mujtaba Hussain.',
    frontTexture: '/textures/studio/Illustration_painted.jpg',
    url: 'https://instagram.com/danish._.sharma1',
    date: '2026-05-26',
    likes: '1.2K',
  },
  {
    id: 'ms-ig-002',
    platform: 'instagram',
    title: 'TEDx Performance',
    description: 'performed bollywood/classical set with beatbox fusion at TEDx event.',
    frontTexture: '/textures/studio/TedX_painted.jpg',
    url: 'https://www.instagram.com/reel/DVgqLaRjHeW/?igsh=MTNvNjBxNHF0a3RycA==',
    date: 'July 2025',
  },
  {
    id: 'ms-ig-003',
    platform: 'instagram',
    title: 'Performed with Naalayak at Hardrock Cafe',
    description: 'Collaborative live stage performance with Naalayak at Hardrock Cafe.',
    frontTexture: '/textures/studio/Naalayak_painted.jpg',
    url: 'https://www.instagram.com/reel/DYu8KapzYlw/?igsh=MXZlcDlpeHRjb2kwOA==',
    date: 'May 2026',
  },
] as const;

export function resolveMusicStudioItemSelection(
  currentItemId: string | null,
  nextItemId: string,
) {
  return currentItemId === nextItemId ? null : nextItemId;
}
