import * as admin from 'firebase-admin';
import { getApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { Env } from '@/libs/Env.mjs';

const createFirebaseApp = () => {
  try {
    return getApp();
  } catch (e) {
    const serviceAccount = JSON.parse(
      Env.FIREBASE_SERVICE_ACCOUNT_KEY as string,
    );
    return initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: Env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  }
};

const app = createFirebaseApp();
const db = getFirestore(app);

export { app, db };
