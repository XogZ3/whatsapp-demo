import { NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import { checkTrainingJob } from '@/modules/runpod'; // Adjust the import path as needed

const firestore = firebase.getFirestore();

async function updateTrainingStatus(
  token: string,
  clientid: string,
  loraURL: string,
  loraFilename: string,
) {
  const response = await fetch('https://fotolabs.ai/api/training', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clientid, loraURL, loraFilename }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update training status: ${response.statusText}`);
  }
}

export async function GET() {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const jobsRef = firestore.collection('training_jobs');
    const query = jobsRef.where('status', 'not-in', ['COMPLETED', 'FAILED']);

    const snapshot = await query.get();

    const updatePromises = snapshot.docs.map(async (doc) => {
      const jobData = doc.data();
      const jobStatus = await checkTrainingJob(jobData.jobId);

      let newStatus = jobStatus.status;
      if (newStatus === 'COMPLETED' && jobStatus.output?.firebase_url) {
        await updateTrainingStatus(
          jobData.token,
          jobData.userid,
          jobStatus.output.firebase_url,
          jobData.model_name,
        );
      } else if (
        new Date(jobData.createdAt).getTime() <= twoHoursAgo.getTime()
      ) {
        newStatus = 'FAILED';
      }

      return doc.ref.update({
        status: newStatus,
        output: jobStatus.output || null,
        updatedAt: Date.now(),
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json(
      { message: 'Jobs updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error checking and updating jobs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
