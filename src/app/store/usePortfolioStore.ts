import { create } from 'zustand';
import { createStore } from 'zustand/vanilla';

import type {
  ChatMessage,
  SceneLocation,
  Vector3Tuple,
} from '../../lib/firebase/types';

export type PortfolioStoreState = {
  currentLocation: SceneLocation;
  chatHistory: ChatMessage[];
  isAdmin: boolean;
  isWorldLoading: boolean;
  playerPosition: Vector3Tuple;
  setCurrentLocation: (location: SceneLocation) => void;
  appendChatMessage: (message: ChatMessage) => void;
  replaceChatHistory: (messages: ChatMessage[]) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setWorldLoading: (isWorldLoading: boolean) => void;
  setPlayerPosition: (playerPosition: Vector3Tuple) => void;
  reset: () => void;
};

function createInitialState() {
  return {
    currentLocation: 'Hub' as SceneLocation,
    chatHistory: [] as ChatMessage[],
    isAdmin: false,
    isWorldLoading: true,
    playerPosition: [0, 0, 0] as Vector3Tuple,
  };
}

const createPortfolioState = (
  set: (
    partial:
      | Partial<PortfolioStoreState>
      | ((state: PortfolioStoreState) => Partial<PortfolioStoreState>),
  ) => void,
): PortfolioStoreState => ({
  ...createInitialState(),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  appendChatMessage: (message) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, message],
    })),
  replaceChatHistory: (chatHistory) => set({ chatHistory }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setWorldLoading: (isWorldLoading) => set({ isWorldLoading }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
  reset: () => set(createInitialState()),
});

export const createPortfolioStore = () =>
  createStore<PortfolioStoreState>()((set) => createPortfolioState(set));

export const usePortfolioStore = create<PortfolioStoreState>()((set) =>
  createPortfolioState(set),
);
