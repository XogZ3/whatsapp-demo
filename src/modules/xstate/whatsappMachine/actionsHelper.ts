import { DateTime } from 'luxon';

import type { CreatePaymentLinkResult } from '@/app/api/stripe/createPaymentLink/route';
import firebase from '@/modules/firebase';
import { generateImagesWithReplicateUploadToFirebase } from '@/modules/replicate';
import { checkTrainingJob } from '@/modules/runpod';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { DAILY_CREDITS_LIMIT, DEFAULT_CREDITS } from '@/utils/constants';
import { getBaseUrl } from '@/utils/helpers';
import {
  getUserFields,
  type UserFieldsFirebase,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { updateTrainingStatus } from '@/utils/trainingHelpers';
import {
  getTranslation,
  type Language,
  type TranslationKeys,
} from '@/utils/translations';

import type { State } from './messageHandler';
import type { IMachineConfig } from './types';

const firestore = firebase.getFirestore();

export async function getCreditsAvailability(
  clientid: string,
  currentState: string,
) {
  // Don't check credits usage for free trial, checking it in freeTrialCredits in context instead
  if (currentState === 'modelGeneratedFreeTrial') return true;

  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();

  const data = clientData.data() as UserFieldsFirebase;

  const { creditsUsedToday, creditsResetDate } = data;

  const today = DateTime.now().startOf('day');

  let resetRequired = false;
  try {
    if (
      DateTime.fromMillis(creditsResetDate).startOf('day').toMillis() !==
      today.toMillis()
    ) {
      resetRequired = true;
    }

    if (resetRequired) {
      // Reset the count and update the date
      await clientDoc.update({
        creditsUsedToday: 0,
        creditsResetDate: today.toMillis(),
      });
      return true;
    }
    if (creditsUsedToday < DAILY_CREDITS_LIMIT) {
      return true;
    }
  } catch (error) {
    console.error('[!] Error in credits check: ', error);
  }
  return false;
}
export async function getMembershipAvailability(
  clientid: string,
  currentState: string,
) {
  // Don't check membership for free trial
  if (currentState === 'modelGeneratedFreeTrial') return true;

  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();

  const { membershipEndDate } = clientData.data() || {};

  try {
    if (DateTime.now() > DateTime.fromMillis(membershipEndDate || 0)) {
      return false;
    }
  } catch (error) {
    console.error('[!] Error in membership check: ', error);
  }
  return true;
}

export async function processAndSendImages(
  config: IMachineConfig,
  prompt: string,
) {
  const generatedImageURLs: string[] =
    await generateImagesWithReplicateUploadToFirebase(
      prompt,
      config.userMetaData.clientid,
    );

  let payload: ICreateMessagePayload;

  console.log('[+] receveid urls: ', generatedImageURLs);
  if (generatedImageURLs.length > 0) {
    const sendPromises = generatedImageURLs.map(async (url) => {
      payload = {
        phoneNumber: config.userMetaData.clientid,
        image: true,
        imageLink: url,
      };
      await config.whatsappInstance.send(payload);
    });
    await Promise.all(sendPromises);

    console.log('All images sent successfully.');
    return true; // Indicate success
  }
  const message = getTranslation('unknown error', config.userMetaData.language);
  payload = {
    phoneNumber: config.userMetaData.clientid,
    text: true,
    msgBody: message,
  };
  await config.whatsappInstance.send(payload);
  return false; // Indicate failure
}

export async function createStripeLink(clientid: string) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/stripe/createPaymentLink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientid }),
      },
    );

    const contentType = response.headers.get('Content-Type');
    if (!response.ok) {
      let errorMessage = `Failed to create stripe payment link: ${response.statusText}`;
      if (contentType && contentType.includes('application/json')) {
        const errorResponse = await response.json();
        errorMessage = errorResponse.error || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes('application/json')) {
      const result: CreatePaymentLinkResult = await response.json();
      return result.paymentLink;
    }
    const textResponse = await response.text();
    throw new Error(`Unexpected response format: ${textResponse}`);
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return errorMessage;
  }
}

export async function setUserStateAndInform({
  clientid,
  language,
  stateValue,
  reason,
}: {
  clientid: string;
  language: Language;
  stateValue: keyof typeof State;
  reason: TranslationKeys;
}) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  const stateJSON = {
    status: 'stopped',
    context: {
      freeTrialCredits: DEFAULT_CREDITS,
      language: language || 'english',
      modelGenerated: true,
    },
    value: stateValue,
    children: {},
    historyValue: {},
    tags: [],
  };
  const updates: Partial<UserFieldsFirebase> = {
    state: JSON.stringify(stateJSON),
    processing: false,
  };
  await clientDoc.set(updates, { merge: true });

  const message = getTranslation(reason, language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

async function sendModelGenerationFailedWithRetryButton(
  clientid: string,
  language: Language,
) {
  const message = getTranslation('model generation failed', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    quickReply: true,
    button1id: 'retry',
    button1: getTranslation('retry', language),
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

async function sendModelGenerationFailedWithSupportEmail(
  clientid: string,
  language: Language,
) {
  const message = getTranslation('support email', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

async function handleModelGenerationFailedBasedOnRetriedFlag(
  retriedModelGenFlag: boolean,
  clientid: string,
  language: Language,
) {
  if (!retriedModelGenFlag) {
    await sendModelGenerationFailedWithRetryButton(clientid, language);
    console.log('No active training jobs found for this client, allow RETRY');
  } else {
    await sendModelGenerationFailedWithSupportEmail(clientid, language);
    console.log(
      'No active training jobs found for this client, allow SUPPORT MAIL',
    );
  }
}

function isJobTimedOut(createdAt: number): boolean {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  return createdAt <= twoHoursAgo;
}

export async function checkTrainingJobForClient(clientid: string) {
  // Log the start of the process
  console.log(`[I] Checking training job status for client ${clientid}...`);

  // Fetch user details from the database
  const userDetails = await getUserFields(clientid);
  const { language, loraFilename, loraURL, retriedModelGenFlag, state } =
    userDetails;
  const stateObj = JSON.parse(state);
  const currentState = stateObj.value;

  // Check if the user's state is still 'generatingModel'
  // If not, exit the function (race condition handling)
  if (currentState !== 'generatingModel') return;

  // Check if the model already exists
  // If so, update the user's state and exit
  if (loraFilename && loraURL) {
    await setUserStateAndInform({
      clientid,
      language,
      stateValue: 'modelGeneratedFreeTrial',
      reason: 'model already exists',
    });
    return;
  }

  try {
    // Query the latest training job for the client
    const jobsRef = firestore.collection('training_jobs');
    const query = jobsRef
      .where('model_name', '==', `person${clientid}`)
      .orderBy('createdAt', 'desc')
      .limit(1);

    const snapshot = await query.get();
    const jobDoc = snapshot.docs[0];

    // If no job exists, handle the failure based on the retry flag
    if (snapshot.empty || !jobDoc) {
      await handleModelGenerationFailedBasedOnRetriedFlag(
        retriedModelGenFlag,
        clientid,
        language,
      );
      return;
    }

    const jobData = jobDoc.data();

    let jobStatus;
    let newStatus;
    let message;
    let payload: ICreateMessagePayload;

    // Handle different job statuses
    switch (jobData.status) {
      case 'COMPLETED':
        // If job is completed, update user state
        await setUserStateAndInform({
          clientid,
          language,
          stateValue: 'modelGeneratedFreeTrial',
          reason: 'model already exists',
        });
        break;

      case 'FAILED':
        // If job failed, handle failure based on retry flag
        await handleModelGenerationFailedBasedOnRetriedFlag(
          retriedModelGenFlag,
          clientid,
          language,
        );
        break;

      case 'IN_PROGRESS':
        // If job is in progress, send a wait message to the user
        message = getTranslation('please wait generating model', language);
        payload = {
          phoneNumber: clientid,
          text: true,
          msgBody: message,
        };
        await sendMessageToWhatsapp(payload);

        // Check the current status of the training job
        jobStatus = await checkTrainingJob(jobData.jobId);

        // If job not found, handle as a failure
        if (jobStatus === null) {
          console.log(`Job not found for client ${clientid}`);
          await handleModelGenerationFailedBasedOnRetriedFlag(
            retriedModelGenFlag,
            clientid,
            language,
          );
          return;
        }

        newStatus = jobStatus.status;

        // If job completed successfully, update the training status
        if (newStatus === 'COMPLETED' && jobStatus.output?.firebase_url) {
          await updateTrainingStatus(
            jobData.token,
            clientid,
            jobStatus.output.firebase_url,
            jobData.model_name,
          );
        } else if (isJobTimedOut(jobData.createdAt)) {
          // If job timed out, mark as failed and handle accordingly
          newStatus = 'FAILED';
          await handleModelGenerationFailedBasedOnRetriedFlag(
            retriedModelGenFlag,
            clientid,
            language,
          );
        }

        // Update the job document with the new status
        await jobDoc.ref.update({
          status: newStatus,
          output: jobStatus.output || null,
          updatedAt: Date.now(),
        });

        break;

      default:
        // Log unexpected status
        console.log(
          `Unexpected status for client ${clientid}: ${jobData.status}`,
        );
    }
  } catch (error) {
    // Handle and log any errors that occur during the process
    console.error(`Error checking training job for client ${clientid}:`, error);
    throw new Error('Internal Server Error');
  }
}
