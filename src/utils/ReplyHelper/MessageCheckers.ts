import { getFirestore } from 'firebase-admin/firestore';

import { Env } from '@/libs/Env.mjs';

import * as ReplyConstants from './ReplyConstants';

interface MessageObject {
  timestamp: number;
  type: string;
  clientid: any;
  messaging_product: any;
  metadata: any;
  status_raw: any;
  pricing: any;
  status: any;
  origin: any;
  message: any;
  contact: any;
  error: any;
}

export async function isMessageValid(
  messageObject: MessageObject,
): Promise<boolean> {
  // TODO: Handle interactive messages properly
  // HACK
  if (messageObject?.message && !messageObject?.message.text)
    // eslint-disable-next-line no-param-reassign
    messageObject.message.text = {
      body: messageObject.message?.interactive?.button_reply?.title,
    };
  if (
    messageObject.type !== 'message' ||
    !messageObject.clientid ||
    !messageObject.message ||
    !messageObject.message.text
  ) {
    return false;
  }
  return true;
}

export async function isMessageWelcome(message: string): Promise<boolean> {
  if (
    ReplyConstants.USER_WELCOME_MESSAGES.indexOf(
      message.toLowerCase().trim(),
    ) !== -1
  ) {
    return true;
  }
  return false;
}

export async function isMessageVerse(message: string): Promise<boolean> {
  if (ReplyConstants.VERSE_PROMPTS.indexOf(message.toLowerCase().trim()))
    return true;
  return false;
}

export async function isMessageArabic(message: string): Promise<boolean> {
  if (message === ReplyConstants.QUICK_REPLY_ARABIC) return true;
  return false;
}

export async function isMessageLatest(
  clientid: any,
  message: any,
): Promise<boolean> {
  const wabaId = Env.WABA_ID;
  const clientDoc = getFirestore()
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  // Check if message is duplicated due to timeout errors
  const latestMessage = await (await clientDoc.get()).data()?.latestmsg;
  if (message !== latestMessage) {
    return true;
  }
  return false;
}
