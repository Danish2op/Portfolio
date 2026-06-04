type FirebaseClientEnvKey =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID';

type FirebaseClientEnvSource = Record<FirebaseClientEnvKey, string | undefined> & {
  VITE_FIREBASE_MEASUREMENT_ID?: string | undefined;
};

const requiredFirebaseClientEnvKeys: FirebaseClientEnvKey[] = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

export type FirebaseAdminEnv = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

export type FirebaseAdminEnvSource = Record<string, string | undefined>;

function requireEnvValue(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function readFirebaseClientEnv(
  source: FirebaseClientEnvSource = import.meta.env,
): FirebaseClientConfig {
  for (const key of requiredFirebaseClientEnvKeys) {
    requireEnvValue(key, source[key]);
  }

  return {
    apiKey: source.VITE_FIREBASE_API_KEY!,
    authDomain: source.VITE_FIREBASE_AUTH_DOMAIN!,
    projectId: source.VITE_FIREBASE_PROJECT_ID!,
    storageBucket: source.VITE_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: source.VITE_FIREBASE_MESSAGING_SENDER_ID!,
    appId: source.VITE_FIREBASE_APP_ID!,
    measurementId: source.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

export function readFirebaseAdminEnv(
  source: FirebaseAdminEnvSource,
): FirebaseAdminEnv {
  return {
    projectId: requireEnvValue('FIREBASE_PROJECT_ID', source.FIREBASE_PROJECT_ID),
    clientEmail: requireEnvValue(
      'FIREBASE_CLIENT_EMAIL',
      source.FIREBASE_CLIENT_EMAIL,
    ),
    privateKey: requireEnvValue(
      'FIREBASE_PRIVATE_KEY',
      source.FIREBASE_PRIVATE_KEY,
    ).replace(/\\n/g, '\n'),
  };
}
