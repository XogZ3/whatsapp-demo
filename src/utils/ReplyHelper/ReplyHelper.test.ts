/* eslint-disable jest/no-commented-out-tests */
import { replyToUser } from '.';

require('dotenv').config({
  path: '.env.local',
});

jest.setTimeout(20000);

describe('ReplyHelper tests', () => {
  describe('replyToUser', () => {
    it('should send responses', async () => {
      const mockMessage = {
        pricing: null,
        metadata: {
          phone_number_id: '108211218882868',
          display_phone_number: '919868438386',
        },
        messaging_product: 'whatsapp',
        message: {
          from: '918447612122',
          timestamp: Math.floor(Date.now() / 1e3),
          type: 'text',
          text: {
            body: `show task list`,
          },
          id: 'wamid.HBgMOTE4NzU0NTM1ODU5FQIAEhgUM0ExRDE1RTg4QkYxNzgwMjAzODMA',
        },
        type: 'message',
        timestamp: Date.now(),
        origin: null,
        error: null,
        contact: {
          profile: { name: 'Manish' },
          wa_id: '918447612122',
        },
        status_raw: null,
        status: null,
        clientid: '918447612122',
      };

      const res = await replyToUser(mockMessage);
      // eslint-disable-next-line no-console
      console.log(`Result: ${res}`);
      expect(res).not.toEqual(null);
    });
  });
});

// describe('print firebase message', () => {
//   describe('printLastMsg', () => {
//     it('should send Last Msg', async () => {
//       const res = await replyToUser(
//         `${process.env.TEST_PHONE_NUMBER}`,
//         'arabic'
//       );
//       // eslint-disable-next-line no-console
//       console.log(`Quote: ${res}`);
//       expect(res).not.toEqual(null);
//     });
//   });
// });
