import type { CreatePaymentLinkResult } from '@/app/api/stripe/createPaymentLink/route';
import { generateImagesUploadToFirebaseGetURL } from '@/modules/runpod';
import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import { getBaseUrl } from '@/utils/helpers';
import { getTranslation } from '@/utils/translations';

import type { IMachineConfig } from './types';

export async function sendPleaseWait(event: any, config: IMachineConfig) {
  const language = event?.context?.language;
  const message = getTranslation('please wait', language);
  // TODO: implement language in buttons
  const payload: ICreateMessagePayload = {
    phoneNumber: config.userMetaData.clientid,
    text: true,
    msgBody: message,
  };
  await config.whatsappInstance.send(payload);
}

export async function processAndSendImages(
  config: IMachineConfig,
  prompt: string,
) {
  const generatedImageURLs: string[] =
    await generateImagesUploadToFirebaseGetURL(
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
    await generateImagesUploadToFirebaseGetURL(
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
    const response = await fetch(`${getBaseUrl()}/api/createPaymentLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientid }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        `Failed to create stripe payment link: ${errorResponse.error || response.statusText}`,
      );
    }

    const result: CreatePaymentLinkResult = await response.json();

    console.log('Stripe payment link created successfully:', result);

    return result.paymentLink;
  } catch (error) {
    console.error('Error creating stripe payment link:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return errorMessage;
  }
}
