import { type NextRequest, NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import { checkTrainingJob } from '@/modules/runpod'; // Adjust the import path as needed
import { getBaseUrl } from '@/utils/helpers';

const firestore = firebase.getFirestore();

async function updateTrainingStatus(
  token: string,
  clientid: string,
  loraURL: string,
  loraFilename: string,
) {
  const response = await fetch(`${getBaseUrl()}/api/training`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientid,
      loraURL,
      loraFilename: `${loraFilename}.safetensors`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update training status: ${response.statusText}`);
  }
}

export async function GET(request: NextRequest) {
  // Extract the api_key from the URL query parameters
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('api_key');

  // Check if the api_key is correct
  if (apiKey !== 'aDx1svckb2Q4OEpsQ') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const jobsRef = firestore.collection('training_jobs');
    const query = jobsRef.where('status', 'not-in', ['COMPLETED', 'FAILED']);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json(
        { message: 'No active training jobs found' },
        { status: 200 },
      );
    }

    const updatePromises = snapshot.docs.map(async (doc) => {
      const jobData = doc.data();
      const jobStatus = await checkTrainingJob(jobData.jobId);

      if (jobStatus === null) {
        // Job not found, skip updating
        return null;
      }

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

    const results = await Promise.all(updatePromises);
    const updatedCount = results.filter((result) => result !== null).length;

    return NextResponse.json(
      { message: `${updatedCount} jobs updated successfully` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
