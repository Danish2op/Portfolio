import { Vector3 } from 'three';

export type AboutStorySegment = {
  id: string;
  z: number;
};

export const aboutRoomSegments = {
  header: { id: 'header', z: -15 },
  education: { id: 'education', z: -55 },
  internship: { id: 'internship', z: -95 },
  skills: { id: 'skills', z: -135 }
};

export const aboutRoomConfig = {
  scrollDamping: 0.95,
  flightWavelength: 40, // Ls
  chunkSize: 40, // En
  totalLength: 160, // Cr
};

// Procedural random generator
export function hashRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export type SkillBalloon = {
  id: string;
  label: string;
  xOffset: number;
  yOffset: number;
  zOffset: number;
  size: 'large' | 'medium' | 'small';
};

export const aiSkills: SkillBalloon[] = [
  { id: 'claude', label: 'Claude Code', xOffset: -4.0, yOffset: 2.0, zOffset: 3.0, size: 'large' },
  { id: 'agentic', label: 'Agentic AI', xOffset: 4.0, yOffset: 2.5, zOffset: 1.0, size: 'large' },
  { id: 'python', label: 'Python', xOffset: -2.0, yOffset: -1.5, zOffset: 5.0, size: 'medium' },
  { id: 'react', label: 'React', xOffset: 2.0, yOffset: -2.0, zOffset: 4.0, size: 'medium' },
  { id: 'ts', label: 'TypeScript', xOffset: 3.5, yOffset: -0.5, zOffset: -2.0, size: 'medium' },
  { id: 'nextjs', label: 'Next.js', xOffset: -3.0, yOffset: 0.0, zOffset: -1.0, size: 'medium' },
  { id: 'firebase', label: 'Firebase', xOffset: -4.5, yOffset: -1.2, zOffset: -4.0, size: 'small' },
  { id: 'figma', label: 'Figma', xOffset: 0.0, yOffset: 1.8, zOffset: -3.0, size: 'small' },
  { id: 'gsap', label: 'GSAP', xOffset: 1.5, yOffset: -1.0, zOffset: -5.0, size: 'small' },
  { id: 'git', label: 'Git', xOffset: -1.5, yOffset: 2.5, zOffset: -2.0, size: 'small' },
];

export const educationCards = [
  { id: 'tiet', label: 'TIET Patiala', title: 'B.E. Computer Eng', dates: '2022 - 2026' },
  { id: 'iitp', label: 'IIT Patna', title: 'M.Tech AI & DS', dates: '2026 - 2028' },
  { id: 'pkk', label: 'Pracheen Kala Kendra', title: 'Visharad in Flute', dates: '' },
];

export const internshipCards = [
  { id: 'livpal', label: 'LivPal', title: 'Product Manager', xOffset: -3.8, yOffset: -1.0 },
  { id: 'tau', label: 'TelAviv University', title: 'Data Science and SDE Intern\n(Nov 2024 - Nov 2025)', xOffset: 0, yOffset: -0.5 },
  { id: 'tfu', label: 'SuperTrading by TFU', title: 'AI Native Intern\n(Jan 2026 - Jul 2026)', xOffset: 3.8, yOffset: -1.0 },
];
