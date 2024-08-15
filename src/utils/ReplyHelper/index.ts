/* eslint-disable unused-imports/no-unused-vars */

import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { extractText } from './MessageParsers';

// eslint-disable-next-line consistent-return
export async function replyToUser(messageObject: any) {
  console.log(JSON.stringify(messageObject, null, 2));
  const message = extractText(messageObject);
  console.log(message);
  // const message = messageObject.message?.text?.body;
  const { TEST_PHONE_NUMBER } = process.env;
  const payload: ICreateMessagePayload = {
    phoneNumber: TEST_PHONE_NUMBER,
    template: true,
    templateName: 'hello_world',
    templateLanguageCode: 'en_US',
  };
  const res = await sendMessageToWhatsapp(payload);
  console.log(JSON.stringify(res, null, 2));
}
