/* eslint-disable @typescript-eslint/naming-convention */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import firebase from '@/modules/firebase';

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

    // Create training job
    // const jobId = await createTrainingJob(image_urls, model_name);
    const jobId = uuidv4();

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
