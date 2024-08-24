import { generateImagesUploadToFirebaseGetURL } from '@/modules/runpod';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { getTranslation, type Language } from './translations';

async function sendModelGeneratedSuccess(clientid: string, language: Language) {
  const message = getTranslation('model generated', language);
  // TODO: implement language in buttons
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}
async function sendPromptingInstruction(clientid: string, language: Language) {
  const message = getTranslation('prompting instruction', language);
  // TODO: implement language in buttons
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

export async function generateAndSendModelImages(
  prompts: string[],
  clientid: string,
  language: Language,
): Promise<boolean> {
  try {
    // Generate images for all prompts in parallel
    const imageUrlResults = await Promise.all(
      prompts.map((prompt) =>
        generateImagesUploadToFirebaseGetURL(prompt, clientid),
      ),
    );

    // Ensure each result is an array and flatten
    const allImageUrls = imageUrlResults
      .flatMap((result) => (Array.isArray(result) ? result : [result]))
      .filter((url): url is string => typeof url === 'string');

    if (allImageUrls.length > 0) {
      // Use promise chaining for sequential execution
      return await sendModelGeneratedSuccess(clientid, language)
        .then(() => {
          console.log('Model generated success message sent');
          // Send images sequentially
          return allImageUrls.reduce((promise, url) => {
            return promise.then(() => {
              const payload: ICreateMessagePayload = {
                phoneNumber: clientid,
                image: true,
                imageLink: url,
              };
              return sendMessageToWhatsapp(payload).then(() => {
                console.log(`Image sent: ${url}`);
              });
            });
          }, Promise.resolve());
        })
        .then(() => {
          console.log('All model images sent successfully');
          return sendPromptingInstruction(clientid, language);
        })
        .then(() => {
          console.log('Prompting instruction sent');
          return true; // Indicate success
        });
    }
    const errorMessage = 'No images were generated. Please try again later.';
    const payload: ICreateMessagePayload = {
      phoneNumber: clientid,
      text: true,
      msgBody: errorMessage,
    };
    await sendMessageToWhatsapp(payload);
    return false; // Indicate failure
  } catch (error) {
    console.error('Error in generating and sending model images:', error);
    const errorMessage = 'An error occurred. Please try again later.';
    const payload: ICreateMessagePayload = {
      phoneNumber: clientid,
      text: true,
      msgBody: errorMessage,
    };
    await sendMessageToWhatsapp(payload);
    return false; // Indicate failure
  }
}
