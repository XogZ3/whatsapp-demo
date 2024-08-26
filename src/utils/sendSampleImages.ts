import { generateImagesUploadToFirebaseGetURL } from '@/modules/runpod';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { generateSamplePrompts } from './constants';
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
export async function sendPromptingInstruction(
  clientid: string,
  language: Language,
) {
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
  loraFilename: string,
  clientid: string,
  language: Language,
) {
  const samplePrompts = generateSamplePrompts(loraFilename);
  try {
    // Generate images for all prompts in parallel
    const imageUrlArrays = await Promise.all(
      samplePrompts.map((prompt) =>
        generateImagesUploadToFirebaseGetURL(prompt, clientid),
      ),
    );
    // Flatten the array of arrays into a single array of URLs
    const allImageUrls = imageUrlArrays.flat();

    if (allImageUrls.length > 0) {
      // Use promise chaining for sequential execution
      return await allImageUrls
        .reduce(async (promise, url) => {
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
        }, Promise.resolve())
        .then(() => {
          console.log('All model images sent successfully');
          return sendModelGeneratedSuccess(clientid, language || 'english');
        })
        .then(() => {
          console.log('Model generated success message sent');
          return sendPromptingInstruction(clientid, language || 'english');
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
