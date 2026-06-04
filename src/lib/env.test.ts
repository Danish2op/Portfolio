import { describe, expect, it } from 'vitest';

import { readFirebaseClientEnv } from './env';

describe('firebase client env', () => {
  it('returns a typed firebase config object when all required values exist', () => {
    const config = readFirebaseClientEnv({
      VITE_FIREBASE_API_KEY: 'key',
      VITE_FIREBASE_AUTH_DOMAIN: 'portfolio.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'portfolio',
      VITE_FIREBASE_STORAGE_BUCKET: 'portfolio.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123',
      VITE_FIREBASE_APP_ID: 'app-id',
      VITE_FIREBASE_MEASUREMENT_ID: 'measurement-id',
    });

    expect(config.projectId).toBe('portfolio');
    expect(config.measurementId).toBe('measurement-id');
  });
});
