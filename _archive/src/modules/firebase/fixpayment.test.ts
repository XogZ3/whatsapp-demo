// import { DateTime } from 'luxon';
// import { number } from 'zod';

// import type { UserFieldsFirebase } from '@/utils/ReplyHelper/FirebaseHelpers';

// import firebase from '.';

// // eslint-disable-next-line import/no-extraneous-dependencies
// require('dotenv').config({
//   path: '.env',
// });

// const firestore = firebase.getFirestore();

// jest.setTimeout(60000); // Increased timeout to 60 seconds as image generation and upload might take time

// describe('fixpayment test', () => {
//   describe('update membership start and end date', () => {
//     it('should update membership start and end date for all clients', async () => {
//       const clientIds = [
//         '918056977300',
//         '918447612122',
//         '918750241550',
//         '918754535859',
//         '918800544186',
//         '918828365480',
//         '919560866490',
//         '919643401602',
//         '919650146566',
//         '919654892776',
//         '919718039733',
//         '919790751851',
//         '919871746577',
//         '919911651004',
//         '971509467558',
//         '971542462122',
//         '971554641556',
//       ]; // Replace with your array of client IDs
//       const wabaId = process.env.WABA_ID!;
//       const promises = clientIds.map(async (clientid) => {
//         const clientDoc = firestore
//           .collection('apps')
//           .doc(wabaId)
//           .collection('clients')
//           .doc(clientid);
//         const clientData = await clientDoc.get();
//         const { language = 'english' } = clientData.data() || {};
//         const stateJSON = {
//           status: 'stopped',
//           context: {
//             language: language || 'english',
//             modelGenerated: true,
//           },
//           value: 'photoPrompting',
//           children: {},
//           historyValue: {},
//           tags: [],
//         };
//         const startDate = DateTime.now().toMillis();
//         const endDate = DateTime.fromMillis(startDate)
//           .plus({ days: 30 })
//           .toMillis();
//         const updates: Partial<UserFieldsFirebase> = {
//           state: JSON.stringify(stateJSON),
//           paid: true,
//           processing: false,
//           creditsUsedToday: 0,
//           creditsResetDate: DateTime.now().toMillis(),
//           membershipStartDate: startDate,
//           membershipEndDate: endDate,
//           lastStripeEventId: '0000000000000', // Store the last processed event ID
//         };
//         return clientDoc.set(updates, { merge: true });
//       });
//       const results = await Promise.all(promises);
//       results.forEach((res) => {
//         const hasRes = res?.writeTime?.seconds;
//         expect(typeof hasRes).toBe('number');
//       });
//     });
//   });
// });
