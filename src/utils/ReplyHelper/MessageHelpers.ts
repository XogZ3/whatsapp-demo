import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { samplePhotoURLs } from '../constants';
import { sendMessageToTelegram } from '../telegram';
import { getTranslation, type Language } from '../translations';
import { getUserFields, setProcessingFlag } from './FirebaseHelpers';

export async function sendSamplePhotos(clientid: string) {
  let payload: ICreateMessagePayload;
  await Promise.all(
    samplePhotoURLs.map((URL: string) => {
      payload = {
        phoneNumber: clientid,
        image: true,
        imageLink: URL,
      };
      return sendMessageToWhatsapp(payload);
    }),
  );
}

export async function sendUpdatedPhotoCount(
  clientid: string,
  language: Language,
  updatedPhotoCount: number,
) {
  const message = `${updatedPhotoCount || '1'} ${getTranslation(
    'photo received',
    language,
  )}`;
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}
export async function sendUpdatedPhotoCountWithFinishOption(
  clientid: string,
  language: Language,
  updatedPhotoCount: number,
) {
  const message = `${updatedPhotoCount || '1'} ${getTranslation(
    'photo received',
    language,
  )}`;
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    quickReply: true,
    button1id: 'finish upload',
    button1: getTranslation('finish upload', language),
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}
export async function sendWaitForUploadToComplete(
  clientid: string,
  language: Language,
) {
  const message = getTranslation('uploading please wait', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    quickReply: true,
    button1id: 'finish upload',
    button1: getTranslation('finish upload', language),
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

export async function sendErrorMessageForImagePrompt(
  clientid: string,
  language: Language,
) {
  const message = getTranslation('uploading please wait', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    quickReply: true,
    button1id: 'finish upload',
    button1: getTranslation('finish upload', language),
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

export async function sendAnalyzingPhotoAndSetProcessingTrue(
  clientid: string,
  language: Language,
) {
  const message = getTranslation('analyzing photo', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await Promise.all([
    setProcessingFlag(clientid, true),
    sendMessageToWhatsapp(payload),
  ]);
}

export async function sendMachineBusy(clientid: string, language: Language) {
  const message = getTranslation('please wait machine busy', language);
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
  const photoInstructionImageLink =
    'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/sample_images%2Fphoto_instruction.png?alt=media&token=5982c2d9-8ccf-47c1-8a03-eef5ab61d280';
  const message = getTranslation('photo upload instruction', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    image: true,
    imageLink: photoInstructionImageLink,
    imageCaption: message,
  };
  await sendMessageToWhatsapp(payload);
}

export async function sendUploadedImagesConfirmationUsingTrainingImageURLs(
  clientid: string,
  language: Language,
) {
  try {
    const userFields = await getUserFields(clientid);
    const trainingImageURLs = userFields.trainingImageURLs || [];

    let payload: ICreateMessagePayload;
    let message: string;

    if (trainingImageURLs.length > 0) {
      message = `${getTranslation('uploaded images confirmation 1', language)} ${trainingImageURLs.length} ${getTranslation('uploaded images confirmation 2', language)}`;
      payload = {
        phoneNumber: clientid,
        quickReply: true,
        button1id: 'confirm',
        button1: getTranslation('confirm', language),
        button2id: 'delete',
        button2: getTranslation('delete', language),
        msgBody: message,
      };
      console.log(
        `Sending confirmation message for ${trainingImageURLs.length} images`,
      );
      await sendMessageToWhatsapp(payload);
    } else {
      console.log('No training images found, sending photo upload instruction');
      await sendPhotoUploadInstruction(clientid, language);
    }
  } catch (error) {
    console.error(
      'Error in sendUploadedImagesConfirmationUsingTrainingImageURLs:',
      error,
    );
    await sendMessageToTelegram(
      `Error in sendUploadedImagesConfirmationUsingTrainingImageURLs: ${error}`,
    );
  }
}
