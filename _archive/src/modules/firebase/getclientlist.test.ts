// import firebase from '.';

// // eslint-disable-next-line import/no-extraneous-dependencies
// require('dotenv').config({
//   path: '.env',
// });

// const firestore = firebase.getFirestore();

// jest.setTimeout(60000); // Increased timeout to 60 seconds as image generation and upload might take time

// describe('getclients test', () => {
//   describe('get client IDs from Firestore', () => {
//     it('should retrieve an array of client IDs', async () => {
//       const wabaId = process.env.WABA_ID!;
//       const clientsCollection = firestore
//         .collection('apps')
//         .doc(wabaId)
//         .collection('clients');

//       const snapshot = await clientsCollection.get();

//       // Extract client IDs from the snapshot
//       const clientIds = snapshot.docs.map((doc) => doc.id);

//       console.log('Retrieved client IDs:', clientIds); // Optional: log the IDs for debugging

//       // Check that we retrieved an array of client IDs
//       expect(Array.isArray(clientIds)).toBe(true);
//       expect(clientIds.length).toBeGreaterThan(0);

//       // Optionally, add further expectations
//       clientIds.forEach((clientId) => {
//         expect(typeof clientId).toBe('string');
//       });
//     });
//   });
// });
