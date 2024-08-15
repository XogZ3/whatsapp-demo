/* eslint-disable unused-imports/no-unused-vars */

import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { extractText } from './MessageParsers';

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
}
