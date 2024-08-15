import console from 'console';
import process from 'process';

import type { ICreateMessagePayload } from './whatsapp';
import { sendMessageToWhatsapp } from './whatsapp';

require('dotenv').config({
  path: '.env.local',
});

console.log(process.env.WHATSAPP_TOKEN);
jest.setTimeout(20000);
const { TEST_PHONE_NUMBER } = process.env;

describe('Whatsapp Tests', () => {
  describe('send various messages', () => {
    it('should send hello_world template', async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        template: true,
        templateName: 'hello_world',
        templateLanguageCode: 'en_US',
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send text hello', async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        text: true,
        msgBody: 'Hello World!',
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send text hello with 1 button', async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        quickReply: true,
        button1: 'OK',
        msgBody: 'Hello World!',
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send text hello with 2 buttons', async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        quickReply: true,
        button1: 'YES',
        button2: 'NO',
        msgBody: 'Hello World!',
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });
  });
});
