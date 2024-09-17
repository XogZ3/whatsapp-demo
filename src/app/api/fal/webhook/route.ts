/* eslint-disable @typescript-eslint/naming-convention */
import * as fal from '@fal-ai/serverless-client';
import type { NextRequest } from 'next/server';

import firebase from '@/modules/firebase';

const FAL_KEY = process.env.FAL_KEY!;

fal.config({
  credentials: FAL_KEY,
});

const firestore = firebase.getFirestore();

interface FalOutputSchema {
  diffusers_lora_file: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  config_file: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[+] fal webhook: ', JSON.stringify(body, null, 2));

    // Extract the request ID and status from the webhook payload
    const { request_id, status } = body;

    if (status === 'COMPLETED' || status === 'OK') {
      const result: FalOutputSchema = await fal.queue.result(
        'fal-ai/flux-lora-fast-training',
        {
          requestId: request_id,
        },
      );

      const { diffusers_lora_file } = result;
      const loraUrl = diffusers_lora_file?.url;

      // Update Firestore with the status and LoRA URL
      const docRef = firestore.collection('training_jobs').doc(request_id);
      await docRef.update({
        status: 'COMPLETED',
        loraUrl,
        completedAt: new Date(),
      });
      console.log(
        `[+] Training job ${request_id} completed. LoRA URL: ${loraUrl}`,
      );
    } else {
      // If the status is not completed, you can log or update other statuses (optional)
      console.log(`[+] Training job ${request_id} status: ${status}`);
    }
  } catch (error) {
    console.error('[!] error in fal webhook: ', JSON.stringify(error, null, 2));
  }
}
