/* eslint-disable unused-imports/no-unused-vars */

import { fetchWhatsAppImageAndUploadToFirebase } from '@/modules/whatsapp/whatsapp';
import { whatsappStateTransition } from '@/modules/xstate/whatsappMachine';
import type { IUserMetaData } from '@/modules/xstate/whatsappMachine/types';

import { TRAINING_IMAGES_LIMIT } from '../constants';
import { translateSystemMessageToEnglish } from '../translations';
import {
  addTrainingImageURLandIncreaseCount,
  getPhotoCount,
  getUserDetails,
  setUserState,
} from './FirebaseHelpers';
import { extractImageID, extractText } from './MessageParsers';

// eslint-disable-next-line consistent-return
export async function replyToUser(messageObject: any) {
  let message = 'cancel';
  const messageType = messageObject.message.type;
  const { clientid } = messageObject;

  const userDetails = await getUserDetails(clientid);
  const { state, name, phonenumber, language = 'english' } = userDetails;
  if (!state) {
    message = extractText(messageObject);
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
        console.log(
          '[+] # of photos uploaded to firebase: ',
          uploadedPhotosCount,
        );
        const imageID = extractImageID(messageObject);
        const imageURL = await fetchWhatsAppImageAndUploadToFirebase(
          imageID,
          clientid,
        );
        await addTrainingImageURLandIncreaseCount(clientid, imageURL);
        message = 'Photo Received';
      }
      // Trigger generate model with sufficient images
      else if (
        // 1 less than required # of images, this will trigger model generation
        uploadedPhotosCount >=
        TRAINING_IMAGES_LIMIT - 1
      ) {
        console.log(
          '[+] # of photos uploaded to firebase: ',
          uploadedPhotosCount,
        );
        const imageID = extractImageID(messageObject);
        const imageURL = await fetchWhatsAppImageAndUploadToFirebase(
          imageID,
          clientid,
        );
        await addTrainingImageURLandIncreaseCount(clientid, imageURL);
        console.log(
          `[+] received ${uploadedPhotosCount} images, generating model now..`,
        );
        message = 'Generate Model';
      }
    }

    // Accept image for image-to-image generation
    else if (currentState === 'photoPrompting' && messageType === 'image') {
      // TODO: handle image generation with image reference
      message = 'cancel';
    }
    // Reject images in all other cases
    else if (messageType === 'image') {
      // do nothing ?
      message = 'cancel';
    } else message = extractText(messageObject);
  }

  const userLanguage = language ?? 'english';

  const messageInEnglish = translateSystemMessageToEnglish(
    message,
    userLanguage,
  );
  console.log('[====] messageInEnglish: ', messageInEnglish);
  // console.log('[====]: ', JSON.stringify(messageObject, null, 2));
  const newState = await whatsappStateTransition(
    { type: 'text', text: messageInEnglish },
    { state, name, phonenumber, language: userLanguage } as IUserMetaData,
  );
  if (newState && newState !== state) {
    await setUserState(newState, clientid);
  }
}
