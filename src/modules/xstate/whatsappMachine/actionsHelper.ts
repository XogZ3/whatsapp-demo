import { DateTime } from 'luxon';

import type { CreatePaymentLinkResult } from '@/app/api/stripe/createPaymentLink/route';
import firebase from '@/modules/firebase';
import { generateImagesWithReplicateUploadToFirebase } from '@/modules/replicate';
import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import { DAILY_CREDITS_LIMIT } from '@/utils/constants';
import { getBaseUrl } from '@/utils/helpers';
import type { UserFieldsFirebase } from '@/utils/ReplyHelper/FirebaseHelpers';

import type { IMachineConfig } from './types';

const firestore = firebase.getFirestore();

export async function getCreditsAvailability(clientid: string) {
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
  console.log('Daily limit reached');
  return false;
}
export async function getMembershipAvailability(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();

  const { membershipEndDate } = clientData.data() || {};

  if (DateTime.now() > DateTime.fromMillis(membershipEndDate)) return false;

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

  console.log('[+] receveid runpod urls: ', generatedImageURLs);
  if (generatedImageURLs.length > 0) {
    const sendPromises = generatedImageURLs.map(async (url) => {
      const payload: ICreateMessagePayload = {
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
  const message =
    'Uh-oh. Something went wrong, please try again after some time.';
  const payload: ICreateMessagePayload = {
    phoneNumber: config.userMetaData.clientid,
    text: true,
    msgBody: message,
  };
  await config.whatsappInstance.send(payload);
  return false; // Indicate failure
}

export async function wipProcessAndSendImages(
  config: IMachineConfig,
  prompt: string,
) {
  const generatedImageURLs: string[] =
    await generateImagesWithReplicateUploadToFirebase(
      prompt,
      config.userMetaData.clientid,
    );

  let payload: ICreateMessagePayload;

  console.log('[+] receveid runpod urls: ', generatedImageURLs);
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
  const message =
    'Uh-oh. Something went wrong, please try again after some time.';
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
