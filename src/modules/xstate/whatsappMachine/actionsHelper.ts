import * as fal from '@fal-ai/serverless-client';
import { DateTime } from 'luxon';

import type { CreatePaymentLinkResult } from '@/app/api/stripe/createPaymentLink/route';
import type { CreateReferralPromoCodeResult } from '@/app/api/stripe/createReferralPromoCode/route';
import firebase from '@/modules/firebase';
import {
  generateImagesWithReplicateUploadToFirebase,
  testClothing,
} from '@/modules/replicate';
import {
  type ICreateMessagePayload,
  makeRequestToWhatsapp,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import {
  DAILY_CREDITS_LIMIT,
  TRAINING_IMAGES_LOWER_LIMIT,
} from '@/utils/constants';
import { getBaseUrl } from '@/utils/helpers';
import {
  getPhotoCount,
  getUserFields,
  setSystemMessage,
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

export async function notifyPendingPhotos(
  clientid: string,
  language: Language,
  updatedPhotoCount: number,
) {
  const pendingPhotos =
    TRAINING_IMAGES_LOWER_LIMIT - updatedPhotoCount ||
    TRAINING_IMAGES_LOWER_LIMIT;
  const message = `${getTranslation(
    'notify pending photos 1',
    language,
  )}: ${pendingPhotos} ${getTranslation('notify pending photos 2', language)}`;
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

export async function checkExistingSubscription(config: IMachineConfig) {
  const { clientid } = config.userMetaData;
  const userMetaDataLanguage = config.userMetaData.language;
  let finalLanguage: Language = userMetaDataLanguage;
  try {
    const clientDocRef = firestore
      .collection('apps')
      .doc(process.env.WABA_ID!)
      .collection('clients')
      .doc(clientid);

    const clientDocSnapshot = await clientDocRef.get();

    const clientData = clientDocSnapshot.data();

    // Check if active subscription exists
    if (clientData?.subscriptionStatus !== 'active') return false;

    // If subscription is active, manually fixing state value based on lora availability
    let stateJSON: { value?: string } = {}; // Initialize stateJSON

    const { language, loraFilename, loraURL, state } = clientData;
    finalLanguage = language;

    // Check if both loraFilename and loraURL exist
    if (loraFilename && loraURL) {
      stateJSON = state ? JSON.parse(state) : {};
      stateJSON.value = 'photoPrompting';
    } else {
      stateJSON.value = 'imagesIncomplete';
    }

    const updates: Partial<UserFieldsFirebase> = {
      state: JSON.stringify(stateJSON),
    };

    // Merge updates with the existing document
    await clientDocRef.set(updates, { merge: true });

    if (stateJSON.value === 'imagesIncomplete') {
      getPhotoCount(clientid).then(async (currentPhotoCount: number) => {
        await notifyPendingPhotos(clientid, finalLanguage, currentPhotoCount);
      });
    } else if (stateJSON.value === 'photoPrompting') {
      const message = getTranslation('prompting instruction', finalLanguage);
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    }
    return true;
  } catch (error) {
    console.error(
      '[!] Error checkExistingSubscription: ',
      JSON.stringify(error, null, 2),
    );
    return false;
  }
}

export async function getCreditsAvailability(clientData: UserFieldsFirebase) {
  const { clientid, creditsUsedToday = 0, creditsResetDate } = clientData;

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
      await firestore
        .collection('apps')
        .doc(process.env.WABA_ID as string)
        .collection('clients')
        .doc(clientid)
        .update({
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
  clientData: UserFieldsFirebase,
) {
  try {
    if (
      DateTime.now() > DateTime.fromMillis(clientData.membershipEndDate || 0) ||
      clientData.subscriptionStatus !== 'active'
    ) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('[!] Error in membership check: ', error);
    return false;
  }
}

function generateRandomSeed(): number {
  // Generate a random integer between 0 and the maximum safe integer in JavaScript (2^53 - 1)
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

async function sendImageMessageWithSeed(
  clientid: string,
  imageLink: string,
  seed: number,
) {
  const data: ICreateMessagePayload = {
    phoneNumber: clientid,
    image: true,
    imageLink,
  };
  await sendMessageToWhatsapp(data, seed);
}

export async function processAndSendImages(
  config: IMachineConfig,
  prompt: string,
  seed?: number,
) {
  let generatedImageURLs: string[];
  const useSeed = seed || generateRandomSeed();

  if (['971562457525'].includes(config.userMetaData.clientid)) {
    generatedImageURLs = await testClothing(
      prompt,
      config.userMetaData.clientid,
      useSeed,
    );
  } else {
    generatedImageURLs = await generateImagesWithReplicateUploadToFirebase(
      prompt,
      config.userMetaData.clientid,
      useSeed,
    );
  }
  if (generatedImageURLs.length > 0) {
    const sendPromises = generatedImageURLs.map(async (url) => {
      await sendImageMessageWithSeed(
        config.userMetaData.clientid,
        url,
        useSeed,
      );
    });
    await Promise.all(sendPromises);
    return true;
  }
  const message = getTranslation('unknown error', config.userMetaData.language);
  const payload: ICreateMessagePayload = {
    phoneNumber: config.userMetaData.clientid,
    text: true,
    msgBody: message,
  };
  await config.whatsappInstance.send(payload);
  return false;
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

export async function createReferralPromoCode(clientid: string) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/stripe/createReferralPromoCode`,
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
      let errorMessage = `Failed to create referral promo code: ${response.statusText}`;
      if (contentType && contentType.includes('application/json')) {
        const errorResponse = await response.json();
        errorMessage = errorResponse.error || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes('application/json')) {
      const result: CreateReferralPromoCodeResult = await response.json();
      return result.code;
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
  const tenMinutesAgo = DateTime.now().toMillis() - 10 * 60 * 1000 * 1000;
  return createdAt <= tenMinutesAgo;
}

export async function checkTrainingJob(requestId: string) {
  const FAL_KEY = process.env.FAL_KEY!;

  fal.config({
    credentials: FAL_KEY,
  });
  try {
    const falStatus = await fal.queue.status('fal-ai/flux-lora-fast-training', {
      requestId,
      logs: true,
    });
    return falStatus;
  } catch (error) {
    // Only re-throw for non-404 errors
    if (error instanceof Error && !error.message.includes('404')) {
      throw error;
    }
    return null;
  }
}

interface FalResult {
  diffusers_lora_file: {
    url: string;
    content_type: 'image/png';
    file_name: string;
    file_size: number;
  };
  config_file: {
    url: string;
    content_type: 'image/png';
    file_name: string;
    file_size: number;
  };
}

export async function getFalResult(requestId: string) {
  const FAL_KEY = process.env.FAL_KEY!;
  fal.config({
    credentials: FAL_KEY,
  });
  try {
    const result: FalResult = await fal.queue.result(
      'fal-ai/flux-lora-fast-training',
      {
        requestId,
      },
    );

    return result.diffusers_lora_file.url;
  } catch (error) {
    // Only re-throw for non-404 errors
    if (error instanceof Error && !error.message.includes('404')) {
      throw error;
    }
    return null;
  }
}

export async function checkTrainingJobForClient(clientid: string) {
  // Log the start of the process
  console.log(`[I] Checking training job status for client ${clientid}...`);

  // Fetch user details from the database
  const { language, loraFilename, loraURL, retriedModelGenFlag, state } =
    await getUserFields(clientid);
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
      stateValue: 'photoPrompting',
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
          stateValue: 'photoPrompting',
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
      case 'IN_QUEUE':
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
        if (newStatus === 'COMPLETED') {
          const newLoraURL = await getFalResult(jobData.jobId);
          await updateTrainingStatus(
            jobData.token,
            clientid,
            newLoraURL!,
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
          updatedAt: DateTime.now().toMillis(),
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

function extractPath(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.substring(1); // Remove the leading '/'
  } catch (error) {
    console.error('Invalid URL', error);
    return null;
  }
}

export async function sendIntroTemplateMessage(
  clientid: string,
  langauge: Language,
  stripeLink: string,
) {
  let whatsappLanguageCode: 'en' | 'pt_br' | 'ar';
  let whatsappTemplateName:
    | 'fotolabs_intro_en'
    | 'fotolabs_intro_pt_br'
    | 'fotolabs_intro_ar';
  switch (langauge) {
    case 'english':
      whatsappLanguageCode = 'en';
      whatsappTemplateName = 'fotolabs_intro_en';
      break;
    case 'arabic':
      whatsappLanguageCode = 'ar';
      whatsappTemplateName = 'fotolabs_intro_ar';
      break;
    case 'portuguese':
      whatsappLanguageCode = 'pt_br';
      whatsappTemplateName = 'fotolabs_intro_pt_br';
      break;
    default:
      whatsappLanguageCode = 'en';
      whatsappTemplateName = 'fotolabs_intro_en';
      break;
  }
  const stripePath = extractPath(stripeLink);

  console.log(
    '[~] sending intro template: lang, template, stripe path',
    whatsappLanguageCode,
    whatsappTemplateName,
    stripePath,
  );

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: clientid,
    type: 'template',
    template: {
      name: whatsappTemplateName,
      language: {
        code: whatsappLanguageCode,
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: '29.99',
            },
            {
              type: 'text',
              text: '19.99',
            },
          ],
        },
        {
          type: 'button',
          sub_type: 'URL',
          index: '0',
          parameters: [
            {
              type: 'text',
              text: stripePath,
            },
          ],
        },
        {
          type: 'button',
          sub_type: 'QUICK_REPLY',
          index: '1',
          parameters: [
            {
              type: 'payload',
              payload: 'language',
            },
          ],
        },
        {
          type: 'button',
          sub_type: 'QUICK_REPLY',
          index: '2',
          parameters: [
            {
              type: 'payload',
              payload: 'tutorial',
            },
          ],
        },
      ],
    },
  };
  const res = await makeRequestToWhatsapp(payload);
  const whatsappMessageID = res?.messages[0]?.id;
  if (res) await setSystemMessage(payload, whatsappMessageID);
}

export async function sendContactInfoMessage(clientid: string) {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: clientid,
    type: 'contacts',
    contacts: [
      {
        emails: [
          {
            email: 'hello@fotolabs.ai',
            type: 'Work',
          },
        ],
        name: {
          formatted_name: 'FotoLabs AI',
          first_name: 'FotoLabs',
          last_name: 'AI',
        },
        phones: [
          {
            phone: '+971505072100',
            type: 'Mobile',
            wa_id: '971505072100',
          },
        ],
        urls: [
          {
            url: 'https://fotolabs.ai',
            type: 'Company',
          },
        ],
      },
    ],
  };
  const res = await makeRequestToWhatsapp(payload);
  const whatsappMessageID = res?.messages[0]?.id;
  if (res) await setSystemMessage(payload, whatsappMessageID);
}

export async function sendIntroOptionsQuickReplyMessage(
  clientid: string,
  message: string,
  languageButtonText: string,
  tutorialButtonText: string,
) {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: clientid,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: {
        type: 'image',
        image: {
          link: 'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/sample_images%2Fopengraph-image.png?alt=media&token=ed50e70e-540d-4f0a-a7f5-0c7c4fbbf2f5',
        },
      },
      body: {
        text: message,
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'language',
              title: languageButtonText,
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'tutorial',
              title: tutorialButtonText,
            },
          },
        ],
      },
    },
  };
  const res = await makeRequestToWhatsapp(payload);
  const whatsappMessageID = res?.messages[0]?.id;
  if (res) await setSystemMessage(payload, whatsappMessageID);
}

export async function sendIntroQuickReplyMessage(
  clientid: string,
  message: string,
  uploadPhotosButtonText: string,
  languageButtonText: string,
  tutorialButtonText: string,
) {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: clientid,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: {
        type: 'image',
        image: {
          link: 'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/sample_images%2Fopengraph-image.png?alt=media&token=ed50e70e-540d-4f0a-a7f5-0c7c4fbbf2f5',
        },
      },
      body: {
        text: message,
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'upload',
              title: uploadPhotosButtonText,
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'language',
              title: languageButtonText,
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'tutorial',
              title: tutorialButtonText,
            },
          },
        ],
      },
    },
  };
  const res = await makeRequestToWhatsapp(payload);
  const whatsappMessageID = res?.messages[0]?.id;
  if (res) await setSystemMessage(payload, whatsappMessageID);
}

async function getSubscriptionId(clientid: any) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/stripe/getSubscription?clientid=${clientid.replace('+', '')}`,
    );
    if (!response.ok) throw new Error('Failed to fetch subscription info');

    const data = await response.json();
    return data.subscriptionId;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return error;
  }
}

async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/stripe/cancelSubscription`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      },
    );

    if (!response.ok) throw new Error('Failed to cancel subscription');

    const data = await response.json();
    console.log('[!] cancellation res: ', JSON.stringify(data, null, 2));
    return data.cancellationStatus;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return error;
  }
}

export async function callCancelSubscription(clientid: string) {
  const subscriptionId = await getSubscriptionId(clientid);
  const cancellationStatus = await cancelSubscription(subscriptionId);
  return cancellationStatus;
}

export async function sendWhatsappRefreshTemplate(clientid: string) {
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    template: true,
    templateLanguageCode: 'en',
    templateName: 'fotolabs_whatsapp_refresh',
  };
  await sendMessageToWhatsapp(payload);
}

export function checkSeedInMessage(message: string): boolean {
  // Regular expression to match 'seed <number>'
  const seedPattern = /seed\s\d+/;

  // Test if the message contains the pattern
  return seedPattern.test(message);
}

export function extractSeedAndPrompt(
  message: string,
): { seed: number; prompt: string } | null {
  // Regular expression to match 'seed <number>' and capture the seed and the prompt
  const seedPattern = /seed\s(\d+)\s(.+)/;

  // Execute the regex on the message
  const match = seedPattern.exec(message);

  // Check if the match was successful
  if (match && match[1] && match[2]) {
    const seed = parseInt(match[1], 10); // Extracted seed number
    const prompt = match[2]; // Remaining prompt text
    return { seed, prompt };
  }

  // Return null if the pattern was not found
  return null;
}
