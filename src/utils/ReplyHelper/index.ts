/* eslint-disable unused-imports/no-unused-vars */

import {
  fetchWhatsAppImageAndUploadToFirebase,
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { whatsappStateTransition } from '@/modules/xstate/whatsappMachine';
import { nonImageAcceptingStates } from '@/modules/xstate/whatsappMachine/messageHandler';
import type { IUserMetaData } from '@/modules/xstate/whatsappMachine/types';

import {
  samplePhotoURLs,
  TRAINING_IMAGES_LOWER_LIMIT,
  TRAINING_IMAGES_UPPER_LIMIT,
} from '../constants';
import { getLanguageFromPhoneNumber } from '../helpers';
import { getTranslation, type Language } from '../translations';
import {
  addTrainingImageURLandIncreaseCountDecreasePendingUploads,
  getPendingUploadsCount,
  getPhotoCount,
  getUserFields,
  incrementPendingUploads,
  setDefaultUserFields,
  setUserState,
} from './FirebaseHelpers';
import { extractImageID, extractText } from './MessageParsers';

async function sendSamplePhotos(clientid: string) {
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

async function sendUpdatedPhotoCount(
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
async function sendUpdatedPhotoCountWithFinishOption(
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
async function sendWaitForUploadToComplete(
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

// eslint-disable-next-line consistent-return
export async function replyToUser(messageObject: any) {
  let message = extractText(messageObject);
  console.log('[~] extracted received text: ', message);

  const messageType = messageObject.message.type;
  const { clientid } = messageObject;

  const userDetails = await getUserFields(clientid);
  const { age = 26, gender = 'male', state, name, language } = userDetails;
  const userLanguage = language || getLanguageFromPhoneNumber(clientid);

  if (!state) {
    await setDefaultUserFields(clientid);
    await sendSamplePhotos(clientid);
    if (messageObject.message.type === 'image') message = 'FALLBACK';
  } else {
    const stateObj = JSON.parse(state);
    const currentState = stateObj.value;
    const uploadedPhotosCount = await getPhotoCount(clientid);
    // Handle receiving images
    // Accept images in imagesIncomplete state
    if (currentState === 'imagesIncomplete' && messageType === 'image') {
      if (
        !uploadedPhotosCount || // Handles undefined or null
        uploadedPhotosCount < TRAINING_IMAGES_UPPER_LIMIT
      ) {
        await incrementPendingUploads(clientid);
        const imageID = extractImageID(messageObject);
        const imageURL = await fetchWhatsAppImageAndUploadToFirebase(
          imageID,
          clientid,
        );
        const updatedPhotoCount =
          await addTrainingImageURLandIncreaseCountDecreasePendingUploads(
            clientid,
            imageURL,
          );
        console.log(
          '[+] # of photos uploaded to firebase: ',
          updatedPhotoCount,
        );

        // send photo count to user and give option to finish upload
        if (updatedPhotoCount >= TRAINING_IMAGES_LOWER_LIMIT) {
          await sendUpdatedPhotoCountWithFinishOption(
            clientid,
            userLanguage,
            updatedPhotoCount,
          );
        } else {
          // send photo count to user
          await sendUpdatedPhotoCount(
            clientid,
            userLanguage,
            updatedPhotoCount,
          );
        }

        message = 'Photo Received';
        if (updatedPhotoCount >= TRAINING_IMAGES_UPPER_LIMIT)
          message = 'Generate Model';
      }
    }
    // Handle NON-Images in 'imagesIncomplete' state - Cancel or Fallback
    else if (currentState === 'imagesIncomplete' && messageType !== 'image') {
      const currentPhotoCount = await getPhotoCount(clientid);
      const currentPendingUploadsCount = await getPendingUploadsCount(clientid);
      if (currentPhotoCount >= TRAINING_IMAGES_LOWER_LIMIT) {
        if (currentPendingUploadsCount === 0) {
          // just generate model if have 5 images ffs
          message = 'Generate Model';
        } else {
          // photo upload incomplete, ask user to wait and then click "finish upload"
          await sendWaitForUploadToComplete(clientid, userLanguage);
          return;
        }
      }
    }
    // Accept image for image-to-image generation
    else if (
      nonImageAcceptingStates.includes(currentState) &&
      !['text', 'interactive', 'button'].includes(messageType)
    ) {
      // TODO: handle image generation with image reference
      message = 'FALLBACK';
    }
    // Reject images in all other cases
    else if (messageType === 'image') {
      // do nothing ?
      message = 'FALLBACK';
    } else message = extractText(messageObject);
  }

  console.log('[~] sending text to xstate: ', message);

  const newState = await whatsappStateTransition(
    { type: 'text', text: message },
    {
      age,
      gender,
      state,
      name,
      clientid,
      language: userLanguage,
    } as IUserMetaData,
  );
  if (newState && newState !== state) {
    await setUserState(newState, clientid);
  }
}
