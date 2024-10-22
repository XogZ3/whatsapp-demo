/* eslint-disable @typescript-eslint/naming-convention */
import * as fal from '@fal-ai/serverless-client';
import { DateTime } from 'luxon';
import { type NextRequest, NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { getBaseUrl } from '@/utils/helpers';
import {
  createAndUploadZipFile,
  getUserFields,
  type UserFieldsFirebase,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { sendMessageToTelegram } from '@/utils/telegram';
import { getTranslation, type Language } from '@/utils/translations';

const FAL_KEY = process.env.FAL_KEY!;

fal.config({
  credentials: FAL_KEY,
});
const firestore = firebase.getFirestore();

async function storeJobInFirestore(
  jobId: string,
  image_urls: string[],
  model_name: string,
  clientid: string,
) {
  try {
    const jobRef = firestore.collection('training_jobs').doc(jobId);
    await jobRef.set({
      image_urls,
      model_name,
      jobId,
      status: 'IN_QUEUE',
      clientid,
      createdAt: DateTime.now().toMillis(),
    });
    console.log(`Firestore document created for jobId: ${jobId}`);
  } catch (error) {
    console.error(`Error storing job in Firestore for jobId: ${jobId}`, error);
    throw error;
  }
}

async function notifyModelExists(
  clientid: string,
  language: Language,
  state: string,
) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  let stateJSON;

  try {
    stateJSON = state ? JSON.parse(state) : {}; // Handle null or undefined state
  } catch (error) {
    console.error('Error parsing state:', error);
    stateJSON = {}; // Fallback to empty state if parsing fails
  }

  // Update or initialize the state fields
  stateJSON.value = 'photoPrompting';

  const updates: Partial<UserFieldsFirebase> = {
    state: JSON.stringify(stateJSON),
    processing: false,
  };
  await clientDoc.set(updates, { merge: true });
  const message = getTranslation('model already exists', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}
async function notifyGeneratingModel(clientid: string, language: Language) {
  const message = getTranslation('please wait generating model', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

async function checkJobExists(model_name: string): Promise<boolean> {
  return firestore.runTransaction(async (transaction) => {
    const jobsRef = firestore.collection('training_jobs');
    const query = jobsRef
      .where('model_name', '==', model_name)
      .where('status', '==', 'IN_PROGRESS');

    const snapshot = await transaction.get(query);

    return !snapshot.empty;
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_urls, model_name, clientid } = body;

    if (!image_urls || !model_name || !clientid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Ensure image_urls has at least 15 URLs
    if (image_urls.length < 15) {
      const originalLength = image_urls.length;
      while (image_urls.length < 15) {
        const randomIndex = Math.floor(Math.random() * originalLength);
        image_urls.push(image_urls[randomIndex]);
      }
    }

    const {
      loraURL,
      loraFilename,
      language = 'english',
      state,
    } = await getUserFields(clientid);

    // Reject if model already exists
    const modelAlreadyExists = !!(loraURL && loraFilename);

    if (modelAlreadyExists) {
      await Promise.all([
        sendMessageToTelegram(`${clientid}: model already exists`),
        notifyModelExists(clientid, language, state),
      ]);
      return NextResponse.json(
        { error: 'Model already exists' },
        { status: 409 },
      );
    }

    // Reject if job already exists for client's model_name in 'IN_PROGRESS' status
    const jobExists = await checkJobExists(model_name);
    if (jobExists) {
      await notifyGeneratingModel(clientid, language);
      return NextResponse.json(
        { error: 'A training job for this model_name already exists' },
        { status: 409 },
      );
    }

    // Prepare training zip file containing images and corresponding ai generated captions
    const images_data_url = await createAndUploadZipFile(image_urls, clientid);

    // Create training job
    const falResponse = await fal.queue.submit(
      'fal-ai/flux-lora-fast-training',
      {
        input: {
          images_data_url,
          trigger_word: model_name,
        },
        webhookUrl: `${getBaseUrl()}/api/fal/webhook`,
      },
    );
    console.log('[+] falResponse: ', JSON.stringify(falResponse, null, 2));
    const { request_id } = falResponse;
    // Store information in Firestore
    await storeJobInFirestore(request_id, image_urls, model_name, clientid);

    return NextResponse.json(
      { request_id, status: 'IN_QUEUE' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error starting training job:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
