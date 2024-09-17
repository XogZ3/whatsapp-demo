/* eslint-disable @typescript-eslint/naming-convention */
import * as fal from '@fal-ai/serverless-client';
import { type NextRequest, NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import {
  createAndUploadZipFile,
  getUserFields,
  type UserFieldsFirebase,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { getTranslation, type Language } from '@/utils/translations';

const FAL_KEY = process.env.FAL_KEY!;

fal.config({
  credentials: FAL_KEY,
});
const firestore = firebase.getFirestore();

// async function storeJobInFirestore(
//   jobId: string,
//   image_urls: string[],
//   model_name: string,
//   token: string,
//   userid: string,
// ) {
//   try {
//     const jobRef = firestore.collection('training_jobs').doc(jobId);
//     await jobRef.set({
//       image_urls,
//       model_name,
//       token,
//       jobId,
//       status: 'IN_QUEUE',
//       userid,
//       createdAt: Date.now(),
//     });
//     console.log(`Firestore document created for jobId: ${jobId}`);
//   } catch (error) {
//     console.error(`Error storing job in Firestore for jobId: ${jobId}`, error);
//     throw error;
//   }
// }

async function notifyModelExists(clientid: string, language: Language) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  const stateJSON = {
    status: 'stopped',
    context: {
      language: language || 'english',
      modelGenerated: true,
    },
    value: 'photoPrompting',
    children: {},
    historyValue: {},
    tags: [],
  };

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
    const { image_urls, model_name, token, userid } = body;

    if (!image_urls || !model_name || !token || !userid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }
    const {
      loraURL,
      loraFilename,
      language = 'english',
    } = await getUserFields(userid);

    // Validate token here if needed

    // Reject if model already exists
    const modelAlreadyExists = !!(loraURL && loraFilename);

    if (modelAlreadyExists) {
      await notifyModelExists(userid, language);
      return NextResponse.json(
        { error: 'Model already exists' },
        { status: 409 },
      );
    }

    // Reject if job already exists for userid in 'IN_PROGRESS' status
    const jobExists = await checkJobExists(model_name);
    if (jobExists) {
      await notifyGeneratingModel(userid, language);
      return NextResponse.json(
        { error: 'A training job for this model_name already exists' },
        { status: 409 },
      );
    }

    // Prepare training zip file
    const images_data_url = await createAndUploadZipFile(userid);

    return NextResponse.json({ images_data_url }, { status: 200 });

    // // Create training job
    // const { request_id } = await fal.queue.submit(
    //   'fal-ai/flux-lora-fast-training',
    //   {
    //     input: {
    //       images_data_url,
    //     },
    //     webhookUrl: 'https://optional.webhook.url/for/results',
    //   },
    // );

    // // Store information in Firestore
    // await storeJobInFirestore(
    //   request_id,
    //   image_urls,
    //   model_name,
    //   token,
    //   userid,
    // );

    // return NextResponse.json(
    //   { request_id, status: 'IN_QUEUE' },
    //   { status: 200 },
    // );
  } catch (error) {
    console.error('Error starting training job:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
