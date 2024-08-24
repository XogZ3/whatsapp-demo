/* eslint-disable @typescript-eslint/naming-convention */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import { createTrainingJob } from '@/modules/runpod'; // Adjust the import path as needed
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { getUserDetails } from '@/utils/ReplyHelper/FirebaseHelpers';
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
  const message = getTranslation('model already exists', language);
  // TODO: implement language in buttons
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
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

    // Validate token here if needed

    // Reject if model already exists
    const { loraURL, loraFilename, language } = await getUserDetails(userid);
    // Check if both loraURL and loraFilename contain valid strings
    const modelAlreadyExists = !!(loraURL && loraFilename);

    if (modelAlreadyExists) {
      await notifyModelExists(userid, language);
      return NextResponse.json(
        { error: 'Model already exists' },
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
