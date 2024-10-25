import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { generateImagesWithReplicateUploadToFirebase } from '@/modules/replicate';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { generateSamplePrompts } from './constants';
import { uploadImageFileToFirebaseWithRetry } from './ReplyHelper/FirebaseHelpers';
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
  isExperiment,
}: {
  age: number;
  gender: 'male' | 'female';
  loraFilename: string;
  clientid: string;
  language: Language;
  isExperiment?: boolean;
}) {
  let samplePrompts = generateSamplePrompts({ age, gender, loraFilename });
  if (isExperiment) {
    samplePrompts = samplePrompts.slice(0, 5);
  }
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
        .reduce(async (promise, url, index) => {
          return promise.then(async () => {
            let imageToSend = url;

            // Blur the last image if isExperiment is true
            if (isExperiment && index === allImageUrls.length - 1) {
              const response = await fetch(url);
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              const blurredImageBuffer = await sharp(buffer)
                .blur(75) // Adjust the blur amount as needed
                .toBuffer();
              const base64Content =
                Buffer.from(blurredImageBuffer).toString('base64');

              const foldername = 'replicate_images';
              const filename = `${clientid || 'test'}_${uuidv4()}_blurred.png`;

              imageToSend = await uploadImageFileToFirebaseWithRetry(
                base64Content,
                clientid,
                foldername,
                filename,
              );
            }

            const payload: ICreateMessagePayload = {
              phoneNumber: clientid,
              image: true,
              imageLink: imageToSend,
            };
            return sendMessageToWhatsapp(payload).then(() => {
              console.log(`Image sent: ${imageToSend}`);
            });
          });
        }, Promise.resolve())
        .then(async () => {
          console.log('All sample images sent successfully');
          return true;
        });
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
