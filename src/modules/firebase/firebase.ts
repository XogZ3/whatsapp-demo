import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getApp, initializeApp } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';
import { getStorage } from 'firebase-admin/storage';

let INITIALIZED = false;
let firebaseApp: App | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: Storage | null = null;

const createFirebaseApp = (): App => {
  try {
    return getApp();
  } catch (e) {
    try {
      const base64Key = process.env
        .FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 as string;
      const decodedKey = Buffer.from(base64Key, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(decodedKey);

      // const firebaseServiceAccountKey =
      //   process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      // if (!firebaseServiceAccountKey) {
      //   throw new Error(
      //     'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not defined',
      //   );
      // }

      // const unescapedKey = firebaseServiceAccountKey.replace(/\\"/g, '"');
      // const serviceAccount = JSON.parse(unescapedKey);

      if (!serviceAccount) {
        throw new Error('Service account key is not provided or is invalid.');
      }
      if (!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
        throw new Error('Firebase database URL is not provided.');
      }
      if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
        throw new Error('Firebase storage bucket is not provided.');
      }

      return initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (initError) {
      console.error('Failed to initialize Firebase app:', initError);
      throw initError;
    }
  }
};

export const getAdmin = () => {
  if (!INITIALIZED) {
    firebaseApp = createFirebaseApp();
    INITIALIZED = true;
  }
  return admin;
};

export const getFirestoreInstance = (): Firestore => {
  if (!firestoreInstance) {
    if (!firebaseApp) {
      firebaseApp = createFirebaseApp();
      INITIALIZED = true;
    }
    firestoreInstance = getFirestore(firebaseApp);
  }
  return firestoreInstance;
};

export const getStorageInstance = (): Storage => {
  if (!storageInstance) {
    if (!firebaseApp) {
      firebaseApp = createFirebaseApp();
      INITIALIZED = true;
    }
    storageInstance = getStorage(firebaseApp);
  }
  return storageInstance;
};
