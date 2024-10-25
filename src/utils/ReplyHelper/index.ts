/* eslint-disable unused-imports/no-unused-vars */

import { getPromptFromImageURLUsingOpenAI } from '@/modules/openai';
import { fetchWhatsAppImageAndUploadToFirebase } from '@/modules/whatsapp/whatsapp';
import { whatsappStateTransition } from '@/modules/xstate/whatsappMachine';
import { nonImageAcceptingStates } from '@/modules/xstate/whatsappMachine/messageHandler';
import type { IUserMetaData } from '@/modules/xstate/whatsappMachine/types';

import {
  TRAINING_IMAGES_LOWER_LIMIT,
  TRAINING_IMAGES_UPPER_LIMIT,
} from '../constants';
import { getLanguageFromPhoneNumber } from '../helpers';
import {
  addTrainingImageURLandIncreaseCountDecreasePendingUploads,
  getCountTrainingImageURLs,
  getIsExperimentCount,
  getPendingUploadsCount,
  getPhotoCount,
  getUserFields,
  incrementPendingUploads,
  setDefaultUserFields,
  setIsExperimentTrue,
  setProcessingFlag,
  setUserState,
  updateImageIntoImageMessageFromUser,
} from './FirebaseHelpers';
import {
  sendAnalyzingPhotoAndSetProcessingTrue,
  sendErrorMessageForImagePrompt,
  sendMachineBusy,
  sendSamplePhotos,
  sendUpdatedPhotoCount,
  sendUpdatedPhotoCountWithFinishOption,
  sendWaitForUploadToComplete,
} from './MessageHelpers';
import {
  extractImageID,
  extractText,
  isContextImageMessage,
} from './MessageParsers';

// eslint-disable-next-line consistent-return
export async function replyToUser(messageObject: any) {
  let message = extractText(messageObject);
  console.log('[~] extracted received text: ', message);

  const messageType = messageObject.message.type;
  const whatsappMessageID = messageObject.message.id;
  const { clientid } = messageObject;

  const userDetails = await getUserFields(clientid);
  const { age = 26, gender = 'male', state, name, language } = userDetails;
  const userLanguage = language || getLanguageFromPhoneNumber(clientid);

  if (!state) {
    console.log('[m] No state, setting default user fields');
    await setDefaultUserFields(clientid);
    await sendSamplePhotos(clientid);
    if (messageObject.message.type === 'image') message = 'FALLBACK';
  } else {
    const stateObj = JSON.parse(state);
    const currentState = stateObj.value;
    const uploadedPhotosCount = await getPhotoCount(clientid);
    // Handle receiving images
    // Accept images in imagesIncomplete state
    if (currentState === 'onBoarding' && messageType === 'image') {
      console.log('[m] onBoarding image');
      message = 'UPLOAD';
    } else if (currentState === 'imagesIncomplete' && messageType === 'image') {
      console.log('[m] imagesIncomplete image');
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
        const photoUpdates =
          await addTrainingImageURLandIncreaseCountDecreasePendingUploads(
            clientid,
            imageURL,
          );
        await updateImageIntoImageMessageFromUser(
          clientid,
          whatsappMessageID,
          imageURL,
        );
        const updatedPhotoCount = photoUpdates.newPhotosUploaded;
        const updatedPendingUploads = photoUpdates.newPendingUploads;
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
        if (
          updatedPhotoCount >= TRAINING_IMAGES_UPPER_LIMIT &&
          updatedPendingUploads === 0
        ) {
          console.log('[m] imagesIncomplete image - > upper limit reached 1');
          const isExperiment = (await getIsExperimentCount()) < 20;
          if (isExperiment) {
            await setIsExperimentTrue(clientid);
            message = 'experiment free images';
          } else {
            message = 'paywall';
          }
        }
      } else if (uploadedPhotosCount >= TRAINING_IMAGES_UPPER_LIMIT) {
        console.log('[m] imagesIncomplete image - > upper limit reached 2');
        const isExperiment = (await getIsExperimentCount()) < 20;
        if (isExperiment) {
          await setIsExperimentTrue(clientid);
          message = 'experiment free images';
        } else {
          message = 'paywall';
        }
      }
    }
    // Handle NON-Images in 'imagesIncomplete' state - Cancel or Fallback
    else if (currentState === 'imagesIncomplete' && messageType !== 'image') {
      console.log('[m] imagesIncomplete non-image');
      const currentPhotoCount = await getPhotoCount(clientid);
      const currentPendingUploadsCount = await getPendingUploadsCount(clientid);
      if (currentPhotoCount >= TRAINING_IMAGES_LOWER_LIMIT) {
        if (currentPendingUploadsCount === 0) {
          const isExperiment = (await getIsExperimentCount()) < 20;
          if (isExperiment) {
            await setIsExperimentTrue(clientid);
            message = 'experiment free images';
          } else {
            message = 'paywall';
          }
        } else {
          // photo upload incomplete, ask user to wait and then click "finish upload"
          await sendWaitForUploadToComplete(clientid, userLanguage);
          return;
        }
      }
    }
    // Handle images confirmation, for paid users, if they deleted all images and want to upload again
    else if (
      currentState === 'imagesIncompletePaid' &&
      messageType === 'image'
    ) {
      console.log('[m] imagesIncompletePaid image');
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
        const photoUpdates =
          await addTrainingImageURLandIncreaseCountDecreasePendingUploads(
            clientid,
            imageURL,
          );
        await updateImageIntoImageMessageFromUser(
          clientid,
          whatsappMessageID,
          imageURL,
        );
        const updatedPhotoCount = photoUpdates.newPhotosUploaded;
        const updatedPendingUploads = photoUpdates.newPendingUploads;
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
        if (
          updatedPhotoCount >= TRAINING_IMAGES_UPPER_LIMIT &&
          updatedPendingUploads === 0
        )
          message = 'generate model';
      }
    }
    // Handle NON-Images in 'imagesIncompletePaid' state - Cancel or Fallback
    else if (
      currentState === 'imagesIncompletePaid' &&
      messageType !== 'image'
    ) {
      console.log('[m] imagesIncompletePaid non-image');
      const currentPhotoCount = await getPhotoCount(clientid);
      const currentTrainingImageCount =
        await getCountTrainingImageURLs(clientid);
      const currentPendingUploadsCount = await getPendingUploadsCount(clientid);
      if (
        currentPhotoCount >= TRAINING_IMAGES_LOWER_LIMIT &&
        currentTrainingImageCount >= TRAINING_IMAGES_LOWER_LIMIT
      ) {
        if (currentPendingUploadsCount === 0) {
          message = 'generate model';
        } else {
          // photo upload incomplete, ask user to wait and then click "finish upload"
          await sendWaitForUploadToComplete(clientid, userLanguage);
          return;
        }
      }
    }
    // photoPrompting machine availability check
    else if (
      currentState === 'photoPrompting' &&
      // (await getProcessingFlag(clientid)) === true &&
      userDetails.processing === true
    ) {
      // Inform machine busy
      console.log('[m] machine busy in replyHelper');
      await sendMachineBusy(clientid, userLanguage);
      return;
    }
    // Handle images selected as context
    else if (
      currentState === 'photoPrompting' &&
      isContextImageMessage(messageObject)
    ) {
      console.log('[m] photoPrompting context image');

      const contextMessageID = messageObject.message.context.id;
      const contextMessageJSON = {
        type: 'context_message',
        contextMessageID,
        message: extractText(messageObject),
      };
      message = JSON.stringify(contextMessageJSON);
      console.log('[@] prompted with image as context', message);
    }
    // Handle images in 'photoPrompting' state - derive prompt from image
    else if (currentState === 'photoPrompting' && messageType === 'image') {
      console.log('[m] photoPrompting image');

      await sendAnalyzingPhotoAndSetProcessingTrue(clientid, userLanguage);
      const imageID = extractImageID(messageObject);
      const imageURL = await fetchWhatsAppImageAndUploadToFirebase(
        imageID,
        clientid,
        true, // imagePrompt flag, so it uploads to prompt_images folder
      );
      await updateImageIntoImageMessageFromUser(
        clientid,
        whatsappMessageID,
        imageURL,
      );
      const imageCaption = extractText(messageObject);
      const promptResult = await getPromptFromImageURLUsingOpenAI(
        imageURL,
        imageCaption,
      );
      await setProcessingFlag(clientid, false);
      if (!promptResult) {
        await sendErrorMessageForImagePrompt(clientid, userLanguage);
        return;
      }
      message = promptResult.promptText;
    }
    // Accept image for image-to-image generation
    else if (
      nonImageAcceptingStates.includes(currentState) &&
      !['text', 'interactive', 'button'].includes(messageType)
    ) {
      console.log('[m] non-image accepting state with non-text message');

      // TODO: handle image generation with image reference
      message = 'FALLBACK';
    }
    // Reject images in all other cases
    else if (messageType === 'image') {
      console.log('[m] image in other states');

      const imageID = extractImageID(messageObject);
      const imageURL = await fetchWhatsAppImageAndUploadToFirebase(
        imageID,
        clientid,
      );
      await updateImageIntoImageMessageFromUser(
        clientid,
        whatsappMessageID,
        imageURL,
      );
      // do nothing ?
      message = 'FALLBACK';
    } else {
      console.log('[m] default case - extracting text');
      message = extractText(messageObject);
    }
  }

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
