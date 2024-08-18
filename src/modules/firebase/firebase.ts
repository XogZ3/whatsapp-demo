import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getApp, initializeApp } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';
import { getStorage } from 'firebase-admin/storage';

import serviceAccount from './paparazzi-ai-firebase-admin-key.json';

let INITIALIZED = false;
let firebaseApp: App | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: Storage | null = null;

const createFirebaseApp = (): App => {
  try {
    return getApp();
  } catch (e) {
    try {
      return initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
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
