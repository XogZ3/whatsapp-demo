// import { generateImagesUploadToFirebaseGetURL } from '@/modules/runpod';

// // eslint-disable-next-line import/no-extraneous-dependencies
// require('dotenv').config({
//   path: '.env',
// });

// jest.setTimeout(60000); // Increased timeout to 60 seconds as image generation and upload might take time

// describe('firebase uploader tests', () => {
//   describe('generate image and upload', () => {
//     it('should generate image, upload to Firebase, and return URL', async () => {
//       const RUNPOD_LORA_URL =
//         'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/testfolder%2Floras%2Fgokul.safetensors?alt=media&token=688d5ad0-7902-4a75-9d15-2d768034e76d';
//       const RUNPOD_LORA_FILENAME = 'gokul.safetensors';

//       const prompt = 'face of a man';
//       const mediaURLs = await generateImagesUploadToFirebaseGetURL(
//         RUNPOD_LORA_URL,
//         RUNPOD_LORA_FILENAME,
//         prompt,
//       );

//       console.log('Generated and uploaded image URLs:', mediaURLs);

//       // Assertions
//       expect(Array.isArray(mediaURLs)).toBe(true);
//       expect(mediaURLs.length).toBeGreaterThan(0);

//       // Check if each URL is a valid Firebase Storage URL
//       mediaURLs.forEach((url) => {
//         expect(url).toMatch(
//           /^https:\/\/storage\.googleapis\.com\/v0\/b\/.*\/o\/.*/,
//         );
//       });
//     });

//     it('should return an empty array when no images are generated', async () => {
//       // Mock the fetch function to simulate no images being generated
//       global.fetch = jest.fn().mockResolvedValue({
//         json: jest.fn().mockResolvedValue({ output: { images: [] } }),
//       });

//       const mediaURLs = await generateImagesUploadToFirebaseGetURL(
//         'mock_url',
//         'mock_filename',
//         'mock_prompt',
//       );

//       console.log('Result when no images generated:', mediaURLs);

//       expect(Array.isArray(mediaURLs)).toBe(true);
//       expect(mediaURLs.length).toBe(0);

//       // Restore the original fetch function
//       jest.restoreAllMocks();
//     });
//   });
// });

// const x =
//   '{"status":"stopped","context":{"message":"Create Photo","processing":false,"pendingPhotos":0,"creditsRemaining":1},"value":"photoPrompting","children":{},"historyValue":{},"tags":[]}';
