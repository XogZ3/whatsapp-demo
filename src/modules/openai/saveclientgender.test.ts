// import firebase from '../firebase';
// import { getAgeAndGenderFromImageURL } from '.';

// const firestore = firebase.getFirestore();

// jest.setTimeout(60000); // Increased timeout to 60 seconds as image processing might take time

// describe('genderer test', () => {
//   describe('analyze and update age and gender from training images', () => {
//     it('should retrieve trainingImageURLs, analyze age and gender, and update the client document', async () => {
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
//       ];
//       const wabaId = process.env.WABA_ID!;

//       const promises = clientIds.map(async (clientid) => {
//         const clientDoc = firestore
//           .collection('apps')
//           .doc(wabaId)
//           .collection('clients')
//           .doc(clientid);

//         const clientData = await clientDoc.get();
//         const trainingImageURLs = clientData.data()?.trainingImageURLs;

//         if (!trainingImageURLs || trainingImageURLs.length === 0) {
//           console.warn(`No trainingImageURLs found for client ID ${clientid}`);
//           return;
//         }

//         // Assuming you want to analyze the first image URL
//         const imageURL = trainingImageURLs[0];
//         const analysisResult = await getAgeAndGenderFromImageURL(imageURL);

//         if (analysisResult) {
//           const updates = {
//             age: analysisResult.age,
//             gender: analysisResult.gender,
//           };

//           await clientDoc.set(updates, { merge: true });
//           console.log(clientid, analysisResult.age, analysisResult.gender);
//         } else {
//           console.warn(
//             `Failed to get analysis result for client ID ${clientid}`,
//           );
//         }
//       });

//       await Promise.all(promises);

//       // You can add more assertions here if needed
//     });
//   });
// });
