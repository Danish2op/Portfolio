export const sceneLocations = [
  'Hub',
  'Tech-Dorm',
  'Education',
  'Experience Row',
  'Music Studio',
] as const;

export type SceneLocation = (typeof sceneLocations)[number];

export type ChatRole = 'assistant' | 'system' | 'user';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type Vector3Tuple = [x: number, y: number, z: number];

export const requiredKnowledgeDocumentIds = [
  'global_context',
  'scene_tech_dorm',
  'scene_education',
  'scene_experience',
  'scene_music_studio',
] as const;

export type KnowledgeDocumentId = (typeof requiredKnowledgeDocumentIds)[number];

export type PortfolioKnowledgeDocument = {
  id: KnowledgeDocumentId;
  scene: SceneLocation | 'Global';
  title: string;
  summary: string;
  facts: string[];
  navigationHints: string[];
  audience: 'recruiters';
};
