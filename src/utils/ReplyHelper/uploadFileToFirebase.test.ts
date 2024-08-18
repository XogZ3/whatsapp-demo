// import * as firebase from 'firebase-admin'; // or wherever your Firebase is initialized
// import { v4 as uuidv4 } from 'uuid';

// import { uploadFileToFirebase } from './FirebaseHelpers';

// // Initialize Firebase if not already initialized
// if (!firebase.apps.length) {
//   firebase.initializeApp({
//     // Your Firebase config
//     credential: firebase.credential.applicationDefault(),
//     storageBucket: 'your-bucket-name.appspot.com',
//   });
// }

// describe('uploadFileToFirebase', () => {
//   it('should upload a file to Firebase Storage and return a valid URL', async () => {
//     // Create a small base64 encoded PNG
//     const base64Content =
//       'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

//     const filename = `test_image_${uuidv4()}.png`;

//     try {
//       const url = await uploadFileToFirebase(base64Content, filename);

//       // Log the URL for debugging
//       console.log('Uploaded file URL:', url);

//       // Check if the returned value is a string
//       expect(typeof url).toBe('string');

//       // Check if the URL is a valid URL (or other relevant checks)
//       expect(url).toMatch(/^https?:\/\//); // Adjust this regex as needed
//     } catch (error) {
//       // Fail the test if there's an error during the upload
//       fail(`Upload failed with error: ${error.message}`);
//     }
//   });
// });
