import { getAdmin, getFirestoreInstance, getStorageInstance } from './firebase';
import storage from './storage';

let INITIALIZED = false;

async function initFirebase() {
  if (INITIALIZED) return;
  INITIALIZED = true;
  console.log(`\n\n//// ===== INITIALIZING FIREBASE STARTED ===== ////\n`);

  console.log(`storage initializing...`);
  await storage.init(getStorageInstance());
  console.log(`storage initialized...`);

  console.log(`\n//// ===== INITIALIZING FIREBASE ENDED ===== ////\n\n`);
}

const firebase = {
  init: initFirebase,
  getAdmin,
  getFirestore: getFirestoreInstance,
  getStorage: getStorageInstance,
  storage,
};

export default firebase;
