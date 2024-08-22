/* eslint-disable unused-imports/no-unused-vars */

import { fetchWhatsAppImageAndUploadToFirebase } from '@/modules/whatsapp/whatsapp';
import { whatsappStateTransition } from '@/modules/xstate/whatsappMachine';
import type { IUserMetaData } from '@/modules/xstate/whatsappMachine/types';

import { TRAINING_IMAGES_LIMIT } from '../constants';
import { translateSystemMessageToEnglish } from '../translations';
import {
  addTrainingImageURL,
  getUserDetails,
  setUserLanguage,
  setUserState,
} from './FirebaseHelpers';
import { extractImageID, extractText } from './MessageParsers';

// eslint-disable-next-line consistent-return
export async function replyToUser(messageObject: any) {
  let message = 'cancel';
  const messageType = messageObject.message.type;
  const { clientid } = messageObject;

  const userDetails = await getUserDetails(clientid);
  const { state, name, phonenumber, language, trainingImageURLs } = userDetails;
  if (!state) {
    message = extractText(messageObject);
    // init default language
    await setUserLanguage('english', clientid);
  } else {
    const stateObj = JSON.parse(state);
    const currentState = stateObj.value;
    // Handle receiving images
    // Accept images in imagesIncomplete state
    if (currentState === 'imagesIncomplete' && messageType === 'image') {
      if (
        !trainingImageURLs || // Handles undefined or null
        (Array.isArray(trainingImageURLs) &&
          trainingImageURLs.length < TRAINING_IMAGES_LIMIT)
      ) {
        const imageIndex = trainingImageURLs ? trainingImageURLs.length : 0;
        console.log('[+] # of trainingImageURLs: ', imageIndex);
        const imageID = extractImageID(messageObject);
        const imageURL = await fetchWhatsAppImageAndUploadToFirebase(
          imageIndex,
          imageID,
          clientid,
        );
        await addTrainingImageURL(clientid, imageURL);
        message = 'Photo Received';
      }
      // Trigger generate model with sufficient images
      else if (
        Array.isArray(trainingImageURLs) &&
        // 1 less than required # of images, this will trigger model generation
        trainingImageURLs.length >= TRAINING_IMAGES_LIMIT - 1
      ) {
        const imageIndex = trainingImageURLs ? trainingImageURLs.length : 0;
        console.log('[+] # of trainingImageURLs: ', imageIndex);
        const imageID = extractImageID(messageObject);
        const imageURL = await fetchWhatsAppImageAndUploadToFirebase(
          imageIndex,
          imageID,
          clientid,
        );
        await addTrainingImageURL(clientid, imageURL);
        console.log(
          `[+] received ${imageIndex} images, generating model now..`,
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
