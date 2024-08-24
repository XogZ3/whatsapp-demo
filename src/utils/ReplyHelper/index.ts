/* eslint-disable unused-imports/no-unused-vars */

import {
  fetchWhatsAppImageAndUploadToFirebase,
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { whatsappStateTransition } from '@/modules/xstate/whatsappMachine';
import type { IUserMetaData } from '@/modules/xstate/whatsappMachine/types';

import { TRAINING_IMAGES_LIMIT } from '../constants';
import {
  getTranslation,
  type Language,
  translateSystemMessageToEnglish,
} from '../translations';
import {
  addTrainingImageURLandIncreaseCount,
  getPhotoCount,
  getUserDetails,
  setUserState,
} from './FirebaseHelpers';
import { extractImageID, extractText } from './MessageParsers';

async function sendUpdatedPhotoCount(
  clientid: string,
  language: Language,
  updatedPhotoCount: number,
) {
  const message = `${getTranslation(
    'photo received',
    language,
  )}: ${updatedPhotoCount || '1'} / ${TRAINING_IMAGES_LIMIT}`;
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

// eslint-disable-next-line consistent-return
export async function replyToUser(messageObject: any) {
  let message = 'cancel';
  const messageType = messageObject.message.type;
  const { clientid } = messageObject;

  const userDetails = await getUserDetails(clientid);
  const { state, name, language = 'english' } = userDetails;
  const userLanguage = language ?? 'english';

  if (!state) {
    message = extractText(messageObject);
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
        uploadedPhotosCount < TRAINING_IMAGES_LIMIT
      ) {
        const imageID = extractImageID(messageObject);
        const imageURL = await fetchWhatsAppImageAndUploadToFirebase(
          imageID,
          clientid,
        );
        const updatedPhotoCount = await addTrainingImageURLandIncreaseCount(
          clientid,
          imageURL,
        );
        console.log(
          '[+] # of photos uploaded to firebase: ',
          updatedPhotoCount,
        );
        // send photo count to user
        await sendUpdatedPhotoCount(clientid, userLanguage, updatedPhotoCount);

        message = 'Photo Received';
        if (updatedPhotoCount >= TRAINING_IMAGES_LIMIT)
          message = 'Generate Model';
      }
    }

    // Accept image for image-to-image generation
    else if (currentState === 'photoPrompting' && messageType === 'image') {
      // TODO: handle image generation with image reference
      message = 'FALLBACK';
    }
    // Reject images in all other cases
    else if (messageType === 'image') {
      // do nothing ?
      message = 'FALLBACK';
    } else message = extractText(messageObject);
  }

  const messageInEnglish = translateSystemMessageToEnglish(
    message,
    userLanguage,
  );
  console.log('[====] messageInEnglish: ', messageInEnglish);
  // console.log('[====]: ', JSON.stringify(messageObject, null, 2));
  const newState = await whatsappStateTransition(
    { type: 'text', text: messageInEnglish },
    { state, name, clientid, language: userLanguage } as IUserMetaData,
  );
  if (newState && newState !== state) {
    await setUserState(newState, clientid);
  }
}
