import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

import firebase from '@/modules/firebase';
import { getStorageInstance } from '@/modules/firebase/firebase';

import { TRAINING_IMAGES_LIMIT } from '../constants';

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

export async function getUserDetails(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const { state, name, lastupdatedat } = clientData.data() || {};
  return {
    state: state || '',
    name,
    phonenumber: clientid,
    lastupdatedat,
  };
}

export async function callTrainingAPI(
  token: string,
  clientid: string,
  imageURLs: string[],
) {
  // const trainingURL = '';
  const data = {
    token,
    clientid,
    imageURLs,
  };
  console.log('Calling training api..', JSON.stringify(data, null, 2));

  // TODO: Update actual api

  // try {
  //   const ret = await fetch(trainingURL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(data),
  //   });
  //   if (ret.ok) {
  //     const responseData = await ret.json();
  //     return responseData;
  //   }
  //   return ret;
  // } catch (error) {
  //   console.log('TRAINING SERVICE FAILED', error);
  //   return error;
  // }
}

export async function addTrainingImageURL(clientid: string, imageURL: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  const clientData = await clientDoc.get();
  const existingURLs: string[] =
    (clientData.exists && clientData.data()?.trainingImageURLs) || [];

  // After enough photos, update trainingState and call api
  if (existingURLs.length >= TRAINING_IMAGES_LIMIT) {
    await clientDoc.set({ trainingState: 'trainingNow' }, { merge: true });
    const token = uuidv4();
    await callTrainingAPI(token, clientid, existingURLs);
    return;
  }

  const updatedURLs = [...existingURLs, imageURL];
  await clientDoc.set({ trainingImageURLs: updatedURLs }, { merge: true });
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
