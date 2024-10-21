import archiver from 'archiver';
import axios from 'axios';
import { FieldValue } from 'firebase-admin/firestore';
import { DateTime } from 'luxon';
import { Readable } from 'stream';

import firebase from '@/modules/firebase';
import { getStorageInstance } from '@/modules/firebase/firebase';
import {
  generateImageCaptionUsingGroq,
  getAgeAndGenderFromImageURLUsingGroq,
} from '@/modules/groq';
import {
  type GenderAndAgeSchemaType,
  getAgeAndGenderFromImageURLUsingOpenAI,
} from '@/modules/openai';

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

export async function setUserTrainingToken(token: string, clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: any = { trainingToken: token, trainingState: 'trainingNow' };
  await clientDoc.set(updates, { merge: true });
}

export async function setSystemMessage(
  originalPayload: any,
  whatsappMessageID: string,
  seed?: number,
) {
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
    ...(whatsappMessageID !== undefined && { whatsappMessageID }),
    ...(seed !== undefined && { seed }),
    timestamp: DateTime.now().toMillis(),
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
  finalTrainingImageURLs: string[];
  age: number;
  gender: 'male' | 'female';
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
  customerId: string;
  subscriptionId: string;
  subscriptionStatus: string;
  whatsappExpiration: number;
  lastCancellationReqTime: number;
  couponUsed: string;
  paywallSentTimestamp: number;
  discountSent: boolean;
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
    finalTrainingImageURLs,
    age,
    gender,
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
    customerId,
    subscriptionId,
    subscriptionStatus,
    whatsappExpiration,
    lastCancellationReqTime,
    couponUsed,
    paywallSentTimestamp,
    discountSent,
  } = clientData.data() || {};
  const userLanguage = language || getLanguageFromPhoneNumber(clientid);

  return {
    state: state || '',
    name,
    clientid,
    lastupdatedat,
    language: userLanguage,
    trainingImageURLs,
    finalTrainingImageURLs,
    age,
    gender,
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
    customerId,
    subscriptionId,
    subscriptionStatus,
    whatsappExpiration,
    lastCancellationReqTime,
    couponUsed,
    paywallSentTimestamp,
    discountSent,
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
    processing: false,
    paid: false,
    discountSent: false,
    loraURL: '',
    loraFilename: '',
  };

  // Update the Firestore document with the new default values, merging with existing data
  await clientDoc.set(updates, { merge: true });
}

export async function setUserAgeAndGender(
  clientid: string,
  age: number,
  gender: 'male' | 'female',
) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: Partial<UserFieldsFirebase> = { age, gender };
  await clientDoc.set(updates, { merge: true });
}

export async function setPaywallSentTimestamp(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  await clientDoc.update({
    paywallSentTimestamp: DateTime.now().toMillis(),
    discountSent: false,
  });
}

export async function callTrainingAPI(
  clientid: string,
  imageURLs: string[],
): Promise<{ jobId?: string; status?: string; error?: string }> {
  const data = {
    image_urls: imageURLs,
    model_name: `person${clientid}`,
    clientid,
  };

  // TODO: Extract face from images
  const baseURL = getBaseUrl();
  const trainingAPIEndpoint =
    baseURL === 'https://fotolabs.ai' ? 'starttraining' : 'testtraining';
  try {
    const response = await fetch(`${baseURL}/api/fal/${trainingAPIEndpoint}`, {
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

export async function incrementPendingUploads(clientid: string) {
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

      transaction.update(clientDoc, {
        pendingUploads: FieldValue.increment(1),
      });
    });

    console.log('pendingUploads incremented:');
    return result;
  } catch (error) {
    console.error('Transaction failed: ', error);
  }
  return -1;
}
export async function addTrainingImageURLandIncreaseCountDecreasePendingUploads(
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
      const currentPendingUploads = doc.data()?.pendingUploads || 0;
      const newPhotosUploaded = currentPhotosUploaded + 1;
      const newPendingUploads = currentPendingUploads - 1;

      transaction.update(clientDoc, {
        trainingImageURLs: FieldValue.arrayUnion(imageURL),
        photosUploaded: newPhotosUploaded,
        pendingUploads: newPendingUploads,
      });

      return { newPhotosUploaded, newPendingUploads };
    });

    console.log('Updated photosUploaded count:', result);
    return result;
  } catch (error) {
    console.error('Transaction failed: ', error);
  }
  return { newPhotosUploaded: -1, newPendingUploads: -1 };
}

export async function updateImageIntoImageMessageFromUser(
  clientid: string,
  whatsappMessageID: string,
  imageURL: string,
) {
  const wabaId = process.env.WABA_ID;
  const messagesCollection = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid)
    .collection('messages');

  try {
    await firestore.runTransaction(async (transaction) => {
      const messageQuery = messagesCollection.where(
        'message.id',
        '==',
        whatsappMessageID,
      );
      const messageSnapshot = await transaction.get(messageQuery);

      if (messageSnapshot.empty) {
        throw new Error('Message not found');
      }
      const messageDoc = messageSnapshot.docs[0];
      if (messageDoc) {
        transaction.update(messageDoc.ref, {
          type: 'image',
          image: { link: imageURL },
        });
      } else {
        throw new Error('Message document not found');
      }
    });

    console.log('Image message updated successfully');
  } catch (error) {
    console.error('Failed to update image message:', error);
  }
}

export async function addFinalTrainingImageURL(
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
    await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(clientDoc);
      if (!doc.exists) {
        throw new Error('Client document does not exist!');
      }

      transaction.update(clientDoc, {
        finalTrainingImageURLs: FieldValue.arrayUnion(imageURL),
      });
    });
  } catch (error) {
    console.error('addFinalTrainingImageURL Transaction failed: ', error);
  }
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

  return photosUploaded || 0;
}

export async function getPendingUploadsCount(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const { pendingUploads } = clientData.data() || {};

  return pendingUploads || 0;
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

export async function uploadImageFileToFirebase(
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

export async function uploadImageFileToFirebaseWithRetry(
  base64Content: string,
  clientid: string,
  foldername: string,
  filename: string,
  retries: number = 5,
): Promise<string> {
  let attempt = 0;
  const delay = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  while (attempt < retries) {
    try {
      // Attempt to upload the image
      // eslint-disable-next-line no-await-in-loop
      return await uploadImageFileToFirebase(
        base64Content,
        clientid,
        foldername,
        filename,
      );
    } catch (error) {
      attempt += 1;
      if (attempt >= retries) {
        // If the final retry fails, throw the error
        throw new Error(
          `Failed to upload image after ${retries} attempts: ${JSON.stringify(error, null, 2)}`,
        );
      }

      // Implementing exponential backoff
      const backoffTime = 2 ** attempt * 1000; // Delay increases exponentially
      console.log(
        `Attempt ${attempt} failed, retrying in ${backoffTime / 1000} seconds...`,
      );
      // eslint-disable-next-line no-await-in-loop
      await delay(backoffTime);
    }
  }

  throw new Error('Unexpected error: Retries exhausted.');
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

function getFileExtensionFromUrl(url: string): string {
  // Extract the file name from the URL
  const urlParts = url.split('/');
  const fileNameWithParams = urlParts[urlParts.length - 1];

  // Remove query parameters
  const fileName = fileNameWithParams?.split('?')[0];

  // Extract extension
  const extensionMatch = fileName?.match(/\.[0-9a-z]+$/i);
  return extensionMatch ? extensionMatch[0].toLowerCase() : '.jpeg';
}

async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error);
    throw error;
  }
}

export async function createZipFromImages(
  imageUrls: string[],
  clientid: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const buffers: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => buffers.push(chunk));
    archive.on('end', () => {
      resolve(Buffer.concat(buffers as Uint8Array[]));
    });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      reject(err);
    });
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        console.error('Archive warning:', err);
        reject(err);
      }
    });

    const processImage = async (url: string, index: number) => {
      try {
        const imageBuffer = await downloadImage(url);
        const caption = await generateImageCaptionUsingGroq(url);
        const prefixedCaption = `a photo of person${clientid}. ${caption}`;

        const extension = getFileExtensionFromUrl(url);
        const imageName = `person${clientid}_${index + 1}${extension}`;
        const textName = `person${clientid}_${index + 1}.txt`;

        archive.append(imageBuffer, { name: imageName });
        archive.append(prefixedCaption, { name: textName });
      } catch (error) {
        console.error(`Error processing image ${url}:`, error);
      }
    };

    Promise.all(imageUrls.map((url, index) => processImage(url, index)))
      .then(() => {
        archive.finalize();
      })
      .catch((error) => {
        console.error('Error in processing images:', error);
        reject(error);
      });
  });
}

export async function uploadZipFileToFirebase(
  zipBuffer: Buffer,
  zipFileName: string,
): Promise<string> {
  const storage = getStorageInstance();
  const bucket = storage.bucket();
  const filePath = `training_images_captioned_zipped/${zipFileName}`;
  const file = bucket.file(filePath);

  const readableStream = Readable.from(zipBuffer);

  await new Promise((resolve, reject) => {
    readableStream
      .pipe(
        file.createWriteStream({
          metadata: { contentType: 'application/zip' },
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

export async function createAndUploadZipFile(
  trainingImageURLs: string[],
  clientid: string,
): Promise<string> {
  // const trainingImageURLs = await getTrainingImageURLs(clientid);
  if (trainingImageURLs.length === 0) {
    throw new Error('No training images found.');
  }

  // Create zip file from images
  const zipBuffer = await createZipFromImages(trainingImageURLs, clientid);

  // Upload zip file to Firebase
  const zipFileURL = await uploadZipFileToFirebase(
    zipBuffer,
    `person${clientid}.zip`,
  );

  return zipFileURL;
}

export async function uploadLoraFileToFirebase(
  loraURL: string,
  fileName: string,
): Promise<string> {
  const storage = getStorageInstance();
  const bucket = storage.bucket();
  const filePath = `private/lora_models/${fileName}`;
  const file = bucket.file(filePath);

  // Fetch the LoRA file from the given URL using native fetch
  const response = await fetch(loraURL);
  if (!response.ok) {
    throw new Error(`Failed to fetch LoRA file from ${loraURL}`);
  }

  const fileBuffer = await response.arrayBuffer();
  const readableStream = Readable.from(Buffer.from(fileBuffer));

  // Upload the LoRA file to Firebase Storage
  await new Promise((resolve, reject) => {
    readableStream
      .pipe(
        file.createWriteStream({
          metadata: { contentType: 'application/octet-stream' },
        }),
      )
      .on('error', reject)
      .on('finish', resolve);
  });

  // Generate a signed URL for the uploaded file (valid for 1 year)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
  });

  return url;
}

export async function generateAndSaveShortURLMap(
  longURL: string,
  clientid: string,
) {
  const apiUrl = `${getBaseUrl()}/api/createShortURL`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        longURL,
        clientid,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const urlResponse = await response.json();

    if (!urlResponse.shortURL) {
      throw new Error('Short URL not received in response');
    }

    return urlResponse.shortURL;
  } catch (error) {
    console.error('Error in generating and saving short URL:', error);
    return null;
  }
}

export async function getEligibleClientidArray() {
  const wabaId = process.env.WABA_ID as string;

  const now = DateTime.now().toMillis();

  const clientRef = firestore
    .collection('apps')
    .doc(wabaId)
    .collection('clients');

  const query = clientRef
    .where('subscriptionStatus', '==', 'active')
    .where('membershipEndDate', '>', now);

  const snapshot = await query.get();

  if (snapshot.empty) {
    return [];
  }

  // Extract the client IDs from the snapshot
  const eligibleClientIds = snapshot.docs
    .filter((doc) => {
      const data = doc.data();
      return data.loraFilename && data.loraURL; // Check if both exist and are non-empty
    })
    .map((doc) => doc.id);

  return eligibleClientIds;
}

export async function getSeedUsingWhatsappMsgID(
  clientid: string,
  messageID: string,
): Promise<number> {
  const wabaId = process.env.WABA_ID as string;

  const messagesRef = firestore
    .collection('apps')
    .doc(wabaId)
    .collection('clients')
    .doc(clientid)
    .collection('messages');

  try {
    console.log(
      'getSeedUsingWhatsappMsgID - Querying with clientid, messageID: ',
      clientid,
      messageID,
    );
    const query = messagesRef.where('whatsappMessageID', '==', messageID);

    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log('[!] No document found for given messageID');
      return 0; // Return null if no document is found
    }

    // Since you expect only one result, get the first document
    const doc = snapshot.docs[0];
    const data = doc?.data();

    // Return the 'seed' field from the document, or null if it doesn't exist
    return data?.seed || 0;
  } catch (error) {
    console.error('[!] Error in getSeedUsingWhatsappMsgID:', error);
    return 0;
  }
}

export async function setStateKeyValue(
  clientid: string,
  key: string,
  value: any,
) {
  const clientDocRef = firestore
    .collection('apps')
    .doc(process.env.WABA_ID as string)
    .collection('clients')
    .doc(clientid);

  const clientDocSnapshot = await clientDocRef.get();

  if (!clientDocSnapshot.exists) {
    console.error('Client does not exist');
    return;
  }

  const state =
    clientDocSnapshot.get('state') || JSON.stringify({ context: {} });
  const stateObj = JSON.parse(state);

  if (!stateObj.context) {
    stateObj.context = {};
  }
  console.log('Setting state key:', key, 'with value:', value);

  stateObj.context[key] = value;

  await clientDocRef.update({
    state: JSON.stringify(stateObj),
  });
}

export async function setStatePhotoPrompting(clientid: string) {
  const clientDocRef = firestore
    .collection('apps')
    .doc(process.env.WABA_ID as string)
    .collection('clients')
    .doc(clientid);

  const clientDocSnapshot = await clientDocRef.get();

  if (!clientDocSnapshot.exists) {
    console.error('Client does not exist');
    return;
  }

  const state =
    clientDocSnapshot.get('state') || JSON.stringify({ context: {} });
  const stateObj = JSON.parse(state);

  if (!stateObj.context) {
    stateObj.context = {};
  }

  stateObj.value = 'photoPrompting';
  stateObj.context.modelGenerated = true;

  await clientDocRef.update({
    state: JSON.stringify(stateObj),
  });
}

export async function saveAgeAndGender(clientid: string) {
  try {
    const imageUrls = await getTrainingImageURLs(clientid);
    if (imageUrls.length === 0) {
      throw new Error('No training image URLs available.');
    }
    const randomImageUrl =
      imageUrls[Math.floor(Math.random() * imageUrls.length)];

    if (!randomImageUrl) {
      throw new Error('Failed to select a random image URL.');
    }

    let result: GenderAndAgeSchemaType | null = null;
    // Try Groq API first, then fallback to OpenAI if necessary
    result =
      (await getAgeAndGenderFromImageURLUsingGroq(randomImageUrl)) ||
      (await getAgeAndGenderFromImageURLUsingOpenAI(randomImageUrl));

    if (!result) {
      console.warn('Failed to get age and gender from the image.');
      return;
    }

    const { age, gender } = result;
    await setUserAgeAndGender(clientid, age, gender);

    const clientDocRef = firestore
      .collection('apps')
      .doc(process.env.WABA_ID as string)
      .collection('clients')
      .doc(clientid);

    const clientDocSnapshot = await clientDocRef.get();

    if (!clientDocSnapshot.exists) {
      console.error('Client does not exist');
      return;
    }

    const state =
      clientDocSnapshot.get('state') || JSON.stringify({ context: {} });
    const stateObj = JSON.parse(state);

    if (!stateObj.context) {
      stateObj.context = {};
    }

    stateObj.context.age = age;
    stateObj.context.gender = gender;

    await clientDocRef.update({
      state: JSON.stringify(stateObj),
    });

    console.log('Age and gender saved successfully.');
  } catch (error) {
    console.error('Error in saveAgeAndGender:', error);
  }
}
