/* eslint-disable @typescript-eslint/naming-convention */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import { createTrainingJob } from '@/modules/runpod'; // Adjust the import path as needed
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { getUserFields } from '@/utils/ReplyHelper/FirebaseHelpers';
import { getTranslation, type Language } from '@/utils/translations';

const firestore = firebase.getFirestore();

async function storeJobInFirestore(
  jobId: string,
  image_urls: string[],
  model_name: string,
  token: string,
  userid: string,
) {
  try {
    const jobRef = firestore.collection('training_jobs').doc(jobId);
    await jobRef.set({
      image_urls,
      model_name,
      token,
      jobId,
      status: 'IN_QUEUE',
      userid,
      createdAt: Date.now(),
    });
    console.log(`Firestore document created for jobId: ${jobId}`);
  } catch (error) {
    console.error(`Error storing job in Firestore for jobId: ${jobId}`, error);
    throw error;
  }
}

async function notifyModelExists(clientid: string, language: Language) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  const updates: any = {
    state: `{"status":"stopped","context":{"creditsRemaining":1,"language":${language || 'english'},"modelGenerated":true},"value":"photoPrompting","children":{},"historyValue":{},"tags":[]}`,
  };
  await clientDoc.set(updates, { merge: true });
  const message = getTranslation('model already exists', language);
  // TODO: implement language in buttons
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}
async function notifyGeneratingModel(clientid: string, language: Language) {
  const message = getTranslation('please wait', language);
  // TODO: implement language in buttons
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

async function checkJobExists(model_name: string): Promise<boolean> {
  try {
    const jobsRef = firestore.collection('training_jobs');
    const query = jobsRef.where('model_name', '==', model_name);

    const snapshot = await query.get();
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking existing job:', error);
    throw error;
  }
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

    // Reject if job already exists for userid
    const jobExists = await checkJobExists(model_name);
    if (jobExists) {
      await notifyGeneratingModel(userid, language);
      return NextResponse.json(
        { error: 'A training job for this model_name already exists' },
        { status: 409 },
      );
    }

    // Create training job
    const jobId = await createTrainingJob(image_urls, model_name);

    // Store information in Firestore
    await storeJobInFirestore(jobId, image_urls, model_name, token, userid);

    return NextResponse.json({ jobId, status: 'IN_QUEUE' }, { status: 200 });
  } catch (error) {
    console.error('Error starting training job:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
