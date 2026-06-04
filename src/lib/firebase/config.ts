import { readFirebaseClientEnv } from '../env';

export function getFirebaseClientConfig() {
  return readFirebaseClientEnv();
}
