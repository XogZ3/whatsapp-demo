/* eslint-disable no-console */
import * as admin from 'firebase-admin';
import { getApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const createFirebaseApp = () => {
  try {
    return getApp();
  } catch (e) {
    // console.log('Firebase app not initialized yet, attempting to initialize.');
    try {
      const firebaseServiceAccountKey =
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (!firebaseServiceAccountKey) {
        throw new Error(
          'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not defined',
        );
      }

      // Unescape the JSON string
      const unescapedKey = firebaseServiceAccountKey.replace(/\\"/g, '"');

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(unescapedKey);
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw jsonError;
      }

      if (!serviceAccount) {
        throw new Error('Service account key is not provided or is invalid.');
      }
      if (!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
        throw new Error('Firebase database URL is not provided.');
      }

      return initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    } catch (initError) {
      console.error('Failed to initialize Firebase app:', initError);
      throw initError;
    }
  }
};

try {
  createFirebaseApp();
  // console.log('Firebase app initialized successfully.');
} catch (error) {
  console.error('Error during Firebase app initialization:', error);
}

export const firestore = getFirestore();
