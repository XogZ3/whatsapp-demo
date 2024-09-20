import { generateImagesWithReplicateUploadToFirebase } from '@/modules/replicate';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { generateSamplePrompts } from './constants';
import { sendMessageToTelegram } from './telegram';
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
export async function sendPhotoUploadInstruction(
  clientid: string,
  language: Language,
) {
  const message = getTranslation('photo upload instruction', language);
  // TODO: implement language in buttons
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

export async function generateAndSendModelImages({
  age,
  gender,
  loraFilename,
  clientid,
  language,
}: {
  age: number;
  gender: 'male' | 'female';
  loraFilename: string;
  clientid: string;
  language: Language;
}) {
  const samplePrompts = generateSamplePrompts({ age, gender, loraFilename });
  try {
    // Generate images for all prompts in parallel
    const imageUrlArrays = await Promise.all(
      samplePrompts.map((prompt) =>
        generateImagesWithReplicateUploadToFirebase(prompt, clientid),
      ),
    );
    // Flatten the array of arrays into a single array of URLs
    const allImageUrls = imageUrlArrays.flat();

    if (allImageUrls.length > 0) {
      // Use promise chaining for sequential execution
      return await allImageUrls
        .reduce(async (promise, url) => {
          return promise.then(async () => {
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
        .then(async () => {
          console.log('All sample images sent successfully');
          await sendModelGeneratedSuccess(clientid, language || 'english');
          return true;
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
    await Promise.all([
      sendMessageToWhatsapp(payload),
      sendMessageToTelegram(`Error in generating and sending model images for ${clientid}
${JSON.stringify(error, null, 2)}}`),
    ]);
    return false; // Indicate failure
  }
}
