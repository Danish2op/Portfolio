import { beforeEach, describe, expect, it } from 'vitest';

import { createPortfolioStore } from './usePortfolioStore';

describe('portfolio store', () => {
  beforeEach(() => {
    createPortfolioStore().getState().reset();
  });

  it('starts with the expected visitor defaults and supports state updates', () => {
    const store = createPortfolioStore();

    expect(store.getState().currentLocation).toBe('Hub');
    expect(store.getState().chatHistory).toEqual([]);
    expect(store.getState().isAdmin).toBe(false);
    expect(store.getState().isWorldLoading).toBe(true);
    expect(store.getState().playerPosition).toEqual([0, 0, 0]);

    store.getState().setCurrentLocation('Tech-Dorm');
    store.getState().appendChatMessage({
      id: 'assistant-1',
      role: 'assistant',
      content: 'Welcome to the tech dorm.',
    });
    store.getState().setIsAdmin(true);
    store.getState().setWorldLoading(false);
    store.getState().setPlayerPosition([18, 1.1, -14]);

    expect(store.getState().currentLocation).toBe('Tech-Dorm');
    expect(store.getState().chatHistory).toHaveLength(1);
    expect(store.getState().isAdmin).toBe(true);
    expect(store.getState().isWorldLoading).toBe(false);
    expect(store.getState().playerPosition).toEqual([18, 1.1, -14]);
  });
});
