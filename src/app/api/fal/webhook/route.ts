/* eslint-disable @typescript-eslint/naming-convention */
import * as fal from '@fal-ai/serverless-client';
import { DateTime } from 'luxon';
import { type NextRequest, NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { createReferralPromoCode } from '@/modules/xstate/whatsappMachine/actionsHelper';
import { RandomStringGenerator } from '@/utils/helpers';
import {
  getUserFields,
  uploadLoraFileToFirebase,
  type UserFieldsFirebase,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { generateAndSendModelImages } from '@/utils/sendSampleImages';
import { sendMessageToTelegram } from '@/utils/telegram';
import { getTranslation } from '@/utils/translations';

const FAL_KEY = process.env.FAL_KEY!;

fal.config({
  credentials: FAL_KEY,
});

const firestore = firebase.getFirestore();

interface FalWebhookPayload {
  url: string;
  content_type: string;
  file_name: string;
  file_size: number;
}

interface FalWebhookBody {
  request_id: string;
  gateway_request_id: string;
  status: string;
  error: string | null;
  payload: {
    diffusers_lora_file: FalWebhookPayload;
    config_file: FalWebhookPayload;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: FalWebhookBody = await request.json();
    console.log('[+] fal webhook: ', JSON.stringify(body, null, 2));

    // Extract the necessary data from the webhook payload
    const { request_id, status, payload } = body;

    // Check if the status is OK and if payload exists
    if (status === 'OK' && payload) {
      const { diffusers_lora_file, config_file } = payload;
      const loraURL = diffusers_lora_file?.url;
      const configFileUrl = config_file?.url;

      // Update Firestore with the status, LoRA URL, and config file URL
      const trainingJobsRef = firestore
        .collection('training_jobs')
        .doc(request_id);
      const trainingJobsDoc = await trainingJobsRef.get();

      if (!trainingJobsDoc.exists) {
        throw new Error(
          `Document ${request_id} not found in collection training_jobs`,
        );
      }
      const trainingJobsData = trainingJobsDoc.data();

      // Find corresponding clientid to the fal job
      const clientid = trainingJobsData?.clientid;

      const generator = new RandomStringGenerator();
      const randomString = generator.generate();
      const fileName = `person${clientid}_${randomString}.safetensors`;

      const [fotolabsLoraURL, fotolabsConfigFileURL] = await Promise.all([
        uploadLoraFileToFirebase(loraURL, fileName),
        uploadLoraFileToFirebase(configFileUrl, `zconfig_${fileName}`),
      ]);

      console.log(
        `[+] Training job ${request_id} completed. LoRA URL: ${fotolabsLoraURL}`,
      );

      const { age, gender, state, language } = await getUserFields(clientid);

      let stateJSON;

      try {
        stateJSON = state ? JSON.parse(state) : {}; // Handle null or undefined state
      } catch (error) {
        console.error('Error parsing state:', error);
        stateJSON = {
          status: 'stopped',
          context: {
            language: language || 'english',
            modelGenerated: true,
            age,
            gender,
          },
          value: 'photoPrompting',
          children: {},
          historyValue: {},
          tags: [],
        };
      }

      // Update or initialize the state fields
      stateJSON.value = 'photoPrompting';

      const updates: Partial<UserFieldsFirebase> = {
        state: JSON.stringify(stateJSON),
        loraURL: fotolabsLoraURL,
        loraFilename: fileName,
        processing: false,
      };

      // batch updates
      const batch = firestore.batch();
      batch.update(trainingJobsRef, {
        status: 'COMPLETED',
        loraURL: fotolabsLoraURL,
        configFileUrl: fotolabsConfigFileURL,
        completedAt: DateTime.now().toMillis(),
      });
      const wabaId = process.env.WABA_ID;
      const clientDoc = firestore
        .collection('apps')
        .doc(wabaId as string)
        .collection('clients')
        .doc(clientid);
      batch.set(clientDoc, updates, { merge: true });
      await batch.commit();

      generateAndSendModelImages({
        age,
        gender,
        loraFilename: fileName,
        clientid,
        language,
      })
        .then(async () => {
          const message = getTranslation('model generated', language);
          const whatsappPayload: ICreateMessagePayload = {
            phoneNumber: clientid,
            text: true,
            msgBody: message,
          };
          await sendMessageToWhatsapp(whatsappPayload);
          console.log('[+] Prompt msg sent');
        })
        .then(async () => {
          const promoCode = await createReferralPromoCode(clientid);
          const message = `${getTranslation('referral 1', language)} *${promoCode}* ${getTranslation('referral 2', language)}`;
          const whatsappPayload: ICreateMessagePayload = {
            phoneNumber: clientid,
            text: true,
            msgBody: message,
          };
          await sendMessageToWhatsapp(whatsappPayload);
          console.log('[+] Prompt msg sent');
        })
        .catch(async (error) => {
          console.error(
            'Error in api/training/route.ts',
            JSON.stringify(error, null, 2),
          );
          await sendMessageToTelegram(
            `${clientid}: Error in api/training/route.ts: ${JSON.stringify(error, null, 2)}`,
          );
        });

      return NextResponse.json({ status: 200 });
    }
    await sendMessageToTelegram(
      `Status Error in api/fal/webhook: ${request_id}`,
    );
    console.log(`[+] Training job ${request_id} status: ${status}`);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error('[!] Error in fal webhook: ', JSON.stringify(error, null, 2));
    await sendMessageToTelegram(
      `Error in api/fal/webhook: ${JSON.stringify(error, null, 2)}`,
    );
    return NextResponse.json({ status: 404 });
  }
}

// Firestore document created for jobId: a6823810-a615-4ac8-aca3-5d2546aa81b8
// [+] fal webhook:  {
//   "request_id": "a6823810-a615-4ac8-aca3-5d2546aa81b8",
//   "gateway_request_id": "a6823810-a615-4ac8-aca3-5d2546aa81b8",
//   "status": "OK",
//   "error": null,
//   "payload": {
//     "diffusers_lora_file": {
//       "url": "https://storage.googleapis.com/fal-flux-lora/728f7b04bf3a4736a10d3c6a6329a8f2_pytorch_lora_weights.safetensors",
//       "content_type": "application/octet-stream",
//       "file_name": "pytorch_lora_weights.safetensors",
//       "file_size": 89745224
//     },
//     "config_file": {
//       "url": "https://storage.googleapis.com/fal-flux-lora/939e2804d8d6488cbe99a383111015b8_config.json",
//       "content_type": "application/octet-stream",
//       "file_name": "config.json",
//       "file_size": 942
//     }
//   }
// }
