/* eslint-disable unused-imports/no-unused-vars */

import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { whatsappStateTransition } from '@/modules/xstate/whatsappMachine';
import type { IUserMetaData } from '@/modules/xstate/whatsappMachine/types';

import { firestore } from '../firebase';
import { extractText } from './MessageParsers';

async function setUserState(state: string, clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: any = { state };
  await clientDoc.set(updates, { merge: true });
}

async function getUserDetails(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const { state, name, lastupdatedat } = clientData.data() || {};
  return {
    state: state || '',
    name,
    phonenumber: clientid,
    lastupdatedat,
  };
}
// eslint-disable-next-line consistent-return
export async function replyToUser(messageObject: any) {
  const senderPhoneNumber =
    messageObject?.message?.from || process.env.TEST_PHONE_NUMBER;
  const message = extractText(messageObject);

  const payload: ICreateMessagePayload = {
    phoneNumber: senderPhoneNumber,
    text: true,
    msgBody: `ECHO: ${message}`,
  };
  await sendMessageToWhatsapp(payload);

  const { clientid } = messageObject;
  const userDetails = await getUserDetails(clientid);
  const { state, name, phonenumber } = userDetails;
  const newState = await whatsappStateTransition(
    { type: 'text', text: message },
    { state, name, phonenumber } as IUserMetaData,
  );
  if (newState && newState !== state) {
    await setUserState(newState, clientid);
  }
}
