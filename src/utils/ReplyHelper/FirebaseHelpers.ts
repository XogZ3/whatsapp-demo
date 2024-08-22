import { FieldValue } from 'firebase-admin/firestore';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

import firebase from '@/modules/firebase';
import { getStorageInstance } from '@/modules/firebase/firebase';

import { getBaseUrl, getLanguageCodeFromPhoneNumber } from '../helpers';
import type { Language } from '../translations';

const firestore = firebase.getFirestore();

export async function setUserState(state: string, clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: any = { state };
  await clientDoc.set(updates, { merge: true });
}
export async function setUserLanguage(language: Language, clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: any = { language };
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

export async function getUserDetails(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const { state, name, lastupdatedat, language, trainingImageURLs } =
    clientData.data() || {};
  const userLanguage = language || getLanguageCodeFromPhoneNumber(clientid);

  return {
    state: state || '',
    name,
    phonenumber: clientid,
    lastupdatedat,
    language: userLanguage,
    trainingImageURLs,
  };
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

export async function addTrainingImageURL(clientid: string, imageURL: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  await clientDoc.update({
    trainingImageURLs: FieldValue.arrayUnion(imageURL),
  });
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

export async function incrementPhotoCount(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  await clientDoc.update({
    photosUploaded: FieldValue.increment(1),
  });
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
  loraURL: any;
  loraFilename: any;
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
  filename: string,
): Promise<string> {
  const storage = getStorageInstance();
  const bucket = storage.bucket();

  const buffer = Buffer.from(base64Content, 'base64');
  const readableStream = Readable.from(buffer);

  const filePath = `runpod_images/${clientid}/${filename}`;

  const file = bucket.file(filePath);
  await new Promise((resolve, reject) => {
    readableStream
      .pipe(
        file.createWriteStream({
          metadata: {
            contentType: 'image/png',
          },
        }),
      )
      .on('error', reject)
      .on('finish', resolve);
  });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60, // 1 hour
  });

  return url;
}

export async function uploadFileToFirebaseGetPermanentURL(
  base64Content: string,
  clientid: string,
  filename: string,
): Promise<string> {
  const storage = getStorageInstance();
  const bucket = storage.bucket();

  const buffer = Buffer.from(base64Content, 'base64');
  const readableStream = Readable.from(buffer);

  const filePath = `training_images/person${clientid}/${filename}`;

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
