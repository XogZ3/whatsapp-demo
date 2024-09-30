import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { samplePhotoURLs } from '../constants';
import { getTranslation, type Language } from '../translations';
import { setProcessingFlag } from './FirebaseHelpers';

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
