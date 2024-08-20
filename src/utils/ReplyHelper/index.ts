/* eslint-disable unused-imports/no-unused-vars */

import { getImageURLFromWhatsapp } from '@/modules/whatsapp/whatsapp';
import { whatsappStateTransition } from '@/modules/xstate/whatsappMachine';
import type { IUserMetaData } from '@/modules/xstate/whatsappMachine/types';

import { translateSystemMessageToEnglish } from '../translations';
import {
  addTrainingImageURL,
  getUserDetails,
  setUserState,
} from './FirebaseHelpers';
import { extractImageID, extractText } from './MessageParsers';

// eslint-disable-next-line consistent-return
export async function replyToUser(messageObject: any) {
  let message;
  const messageObjectType = messageObject.type;
  const { clientid } = messageObject;
  // Handle receiving images
  if (messageObjectType === 'image') {
    const imageID = extractImageID(messageObject);
    const imageURL = await getImageURLFromWhatsapp(imageID);
    console.log('imageURL', imageURL);
    await addTrainingImageURL(clientid, imageURL);
    message = 'Photo Received';
  } else message = extractText(messageObject);

  const userDetails = await getUserDetails(clientid);
  const { state, name, phonenumber, language } = userDetails;

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
