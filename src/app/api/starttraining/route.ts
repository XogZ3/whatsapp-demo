/* eslint-disable @typescript-eslint/naming-convention */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import { createTrainingJob } from '@/modules/runpod'; // Adjust the import path as needed

const firestore = firebase.getFirestore();

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
    const jobId = await createTrainingJob(image_urls, model_name);

    // Store information in Firestore
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

    return NextResponse.json({ jobId, status: 'IN_QUEUE' }, { status: 200 });
  } catch (error) {
    console.error('Error starting training job:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
