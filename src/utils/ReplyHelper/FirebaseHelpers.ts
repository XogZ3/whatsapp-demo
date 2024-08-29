import { FieldValue } from 'firebase-admin/firestore';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

import firebase from '@/modules/firebase';
import { getStorageInstance } from '@/modules/firebase/firebase';

import { getBaseUrl, getLanguageFromPhoneNumber } from '../helpers';
import { type Language } from '../translations';

const firestore = firebase.getFirestore();

export async function setUserState(state: string, clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: Partial<UserFieldsFirebase> = { state, processing: false };
  await clientDoc.set(updates, { merge: true });
}

export async function setUserLanguage(language: Language, clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: Partial<UserFieldsFirebase> = { language };
  await clientDoc.set(updates, { merge: true });
}

async function setUserTrainingToken(token: string, clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: any = { trainingToken: token, trainingState: 'trainingNow' };
  await clientDoc.set(updates, { merge: true });
}

export async function setSystemMessage(originalPayload: any, seed?: number) {
  const wabaId = process.env.WABA_ID;
  const clientid = originalPayload.to;

  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  // Create a new object by merging the seed into the payload
  const payload = {
    ...originalPayload,
    ...(seed !== undefined && { seed }),
  };

  await clientDoc.collection('messages').add(payload);
}

export type UserFieldsFirebase = {
  state: string;
  name: string;
  clientid: string;
  lastupdatedat: number;
  language: Language;
  trainingImageURLs: any;
  loraURL: string;
  loraFilename: string;
  trainingToken?: string;
  creditsUsedLifetime: number;
  creditsUsedToday: number;
  creditsResetDate: number;
  paid: boolean;
  processing: boolean;
  membershipStartDate: number;
  membershipEndDate: number;
  lastStripeEventId: string;
  retriedModelGenFlag: boolean;
};

export async function getUserFields(
  clientid: string,
): Promise<UserFieldsFirebase> {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const {
    state,
    name,
    lastupdatedat,
    language,
    trainingImageURLs,
    loraURL,
    loraFilename,
    creditsUsedLifetime,
    creditsUsedToday,
    creditsResetDate,
    paid,
    processing,
    membershipStartDate,
    membershipEndDate,
    lastStripeEventId,
    retriedModelGenFlag,
  } = clientData.data() || {};
  const userLanguage = language || getLanguageFromPhoneNumber(clientid);

  return {
    state: state || '',
    name,
    clientid,
    lastupdatedat,
    language: userLanguage,
    trainingImageURLs,
    loraURL,
    loraFilename,
    creditsUsedLifetime,
    creditsUsedToday: creditsUsedToday || 0,
    creditsResetDate,
    paid: paid || false,
    processing: processing || false,
    membershipStartDate,
    membershipEndDate,
    lastStripeEventId,
    retriedModelGenFlag,
  };
}

export async function setDefaultUserFields(clientid: string): Promise<void> {
  // No need to return anything, so the return type is void
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  // Set default language and credits
  const userLanguage: Language =
    getLanguageFromPhoneNumber(clientid) || 'english';

  // Prepare the updates object
  const updates: Partial<UserFieldsFirebase> = {
    language: userLanguage,
  };

  // Update the Firestore document with the new default values, merging with existing data
  await clientDoc.set(updates, { merge: true });
}

export async function callTrainingAPI(
  clientid: string,
  imageURLs: string[],
): Promise<{ jobId?: string; status?: string; error?: string }> {
  const token = uuidv4();
  const data = {
    image_urls: imageURLs,
    model_name: `person${clientid}`,
    token,
    userid: clientid,
  };

  try {
    const response = await fetch(`${getBaseUrl()}/api/starttraining`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        `Failed to start training: ${errorResponse.error || response.statusText}`,
      );
    }

    const result = await response.json();

    console.log('Training job started successfully:', result);

    // saving token for validation for /api/training
    await setUserTrainingToken(token, clientid);

    return { jobId: result.jobId, status: result.status };
  } catch (error) {
    console.error('Error calling training API:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}

export async function addTrainingImageURLandIncreaseCount(
  clientid: string,
  imageURL: string,
) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  try {
    const result = await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(clientDoc);
      if (!doc.exists) {
        throw new Error('Client document does not exist!');
      }

      const currentPhotosUploaded = doc.data()?.photosUploaded || 0;
      const newPhotosUploaded = currentPhotosUploaded + 1;

      transaction.update(clientDoc, {
        trainingImageURLs: FieldValue.arrayUnion(imageURL),
        photosUploaded: newPhotosUploaded,
      });

      return newPhotosUploaded;
    });

    console.log('Updated photosUploaded count:', result);
    return result;
  } catch (error) {
    console.error('Transaction failed: ', error);
  }
  return -1;
}
export async function getPhotoCount(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const { photosUploaded } = clientData.data() || {};

  return photosUploaded;
}

export async function setProcessingFlag(clientid: string, value: boolean) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  await firestore.runTransaction(async (transaction) => {
    transaction.update(clientDoc, { processing: value });
  });
}

export async function getProcessingFlag(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const processing: boolean =
    (clientData.exists && clientData.data()?.processing) || false;

  return processing;
}
export async function setRetriedFlag(clientid: string, value: boolean) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  await firestore.runTransaction(async (transaction) => {
    transaction.update(clientDoc, { retried: value });
  });
}

export async function getRetriedFlag(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const retried: boolean =
    (clientData.exists && clientData.data()?.retried) || false;

  return retried;
}

export async function incrementCreditsUsedTodayAndSetProcessingFlagFalse(
  clientid: string,
): Promise<void> {
  const wabaId = process.env.WABA_ID as string;
  const clientDocRef = firestore
    .collection('apps')
    .doc(wabaId)
    .collection('clients')
    .doc(clientid);

  try {
    await firestore.runTransaction(async (transaction) => {
      const clientDoc = await transaction.get(clientDocRef);

      if (!clientDoc.exists) {
        throw new Error('Client document does not exist.');
      }

      const data = clientDoc.data() as UserFieldsFirebase;
      const currentCreditsUsed = data.creditsUsedToday || 0;
      const creditsUsedLifetime = data.creditsUsedLifetime || 0;

      // Increment creditsUsedToday by 1
      transaction.update(clientDocRef, {
        creditsUsedToday: currentCreditsUsed + 1,
        creditsUsedLifetime: creditsUsedLifetime + 1,
        processing: false,
      });
    });

    console.log('Successfully updated client data.');
  } catch (error) {
    console.error('Transaction failed: ', error);
  }
}

export async function getTrainingImageURLs(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  const clientData = await clientDoc.get();
  const trainingImageURLs: string[] =
    (clientData.exists && clientData.data()?.trainingImageURLs) || [];

  return trainingImageURLs;
}

export async function getUserLoraDetails(clientid: string): Promise<{
  loraURL: string;
  loraFilename: string;
}> {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const { loraURL, loraFilename } = clientData.data() || {};
  return {
    loraURL,
    loraFilename,
  };
}

export async function uploadFileToFirebase(
  base64Content: string,
  clientid: string,
  foldername: string,
  filename: string,
): Promise<string> {
  const storage = getStorageInstance();
  const bucket = storage.bucket();

  const buffer = Buffer.from(base64Content, 'base64');
  const readableStream = Readable.from(buffer);

  const filePath = `${foldername}/person${clientid}/${filename}`;

  const file = bucket.file(filePath);
  await new Promise((resolve, reject) => {
    readableStream
      .pipe(
        file.createWriteStream({
          metadata: {
            contentType: filename.endsWith('.jpeg')
              ? 'image/jpeg'
              : 'image/png',
          },
        }),
      )
      .on('error', reject)
      .on('finish', resolve);
  });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
  });

  return url;
}

export async function uploadFileToFirebaseGetPermanentURL(
  base64Content: string,
  clientid: string,
  foldername: string,
  filename: string,
): Promise<string> {
  const storage = getStorageInstance();
  const bucket = storage.bucket();

  const buffer = Buffer.from(base64Content, 'base64');
  const readableStream = Readable.from(buffer);

  const filePath = `${foldername}/person${clientid}/${filename}`;

  const file = bucket.file(filePath);
  await new Promise((resolve, reject) => {
    readableStream
      .pipe(
        file.createWriteStream({
          metadata: {
            contentType: filename.endsWith('.jpeg')
              ? 'image/jpeg'
              : 'image/png',
          },
        }),
      )
      .on('error', reject)
      .on('finish', resolve);
  });

  // Make the file publicly accessible
  await file.makePublic();

  // Get the permanent public URL
  const publicUrl = file.publicUrl();

  return publicUrl;
}

export async function getClientList() {
  const wabaId = process.env.WABA_ID;
  const clientList = await firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .orderBy('lastupdatedat', 'desc')
    .get();

  return clientList;
}
export async function getClientMessages(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const messages = await firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid)
    .collection('messages')
    .where('type', 'in', ['message', 'template'])
    .where('timestamp', '>', 0)
    .orderBy('timestamp', 'desc')
    .get();

  return messages;
}
export async function getClientFields(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientfield = await firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid)
    .get();

  return clientfield;
}
