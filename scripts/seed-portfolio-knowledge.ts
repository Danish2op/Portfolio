import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { readFirebaseAdminEnv } from '../src/lib/env';
import { portfolioKnowledgeSeed } from './seed-data/portfolioKnowledge';

async function seedKnowledgeCollection() {
  const adminEnv = readFirebaseAdminEnv(process.env as Record<string, string | undefined>);
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: adminEnv.projectId,
        clientEmail: adminEnv.clientEmail,
        privateKey: adminEnv.privateKey,
      }),
      projectId: adminEnv.projectId,
    });

  const firestore = getFirestore(app);
  const collection = firestore.collection('portfolio_knowledge');
  const seededAt = new Date().toISOString();

  for (const document of Object.values(portfolioKnowledgeSeed)) {
    await collection.doc(document.id).set(
      {
        ...document,
        seededAt,
      },
      { merge: true },
    );
  }

  console.info(
    `Seeded ${Object.keys(portfolioKnowledgeSeed).length} portfolio knowledge documents.`,
  );
}

seedKnowledgeCollection().catch((error) => {
  console.error('Failed to seed portfolio knowledge.', error);
  process.exitCode = 1;
});
