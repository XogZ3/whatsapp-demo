import { generateImagesWithReplicateUploadToFirebase } from '@/modules/replicate';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { generateSamplePrompts } from './constants';
import { sendMessageToTelegram } from './telegram';
import { getTranslation, type Language } from './translations';

async function sendErrorMessage(clientid: string, language: Language) {
  const message = getTranslation('unknown error', language);
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
      // Send images serially
      for (const url of allImageUrls) {
        const payload: ICreateMessagePayload = {
          phoneNumber: clientid,
          image: true,
          imageLink: url,
        };
        // eslint-disable-next-line no-await-in-loop
        await sendMessageToWhatsapp(payload);
        console.log(`Image sent: ${url}`);
      }
      console.log('All sample images sent successfully');
      return true;
    }
    await sendErrorMessage(clientid, language || 'english');
    return false; // Indicate failure
  } catch (error) {
    console.error('Error in generating and sending model images:', error);
    await Promise.all([
      sendErrorMessage(clientid, language || 'english'),
      sendMessageToTelegram(`Error in generating and sending model images for ${clientid}
${JSON.stringify(error, null, 2)}}`),
    ]);
    return false; // Indicate failure
  }
}
