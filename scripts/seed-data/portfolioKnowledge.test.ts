import { describe, expect, it } from 'vitest';

import {
  portfolioKnowledgeSeed,
  requiredKnowledgeDocumentIds,
} from './portfolioKnowledge';

describe('portfolio knowledge seed', () => {
  it('includes every required knowledge document with substantive recruiter-facing copy', () => {
    expect(Object.keys(portfolioKnowledgeSeed).sort()).toEqual(
      [...requiredKnowledgeDocumentIds].sort(),
    );

    for (const document of Object.values(portfolioKnowledgeSeed)) {
      expect(document.title.length).toBeGreaterThan(5);
      expect(document.summary.length).toBeGreaterThan(20);
      expect(document.facts.length).toBeGreaterThan(2);
    }
  });
});
