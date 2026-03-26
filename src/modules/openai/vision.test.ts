// import OpenAI from 'openai';
// import { zodResponseFormat } from 'openai/helpers/zod';
// import { z } from 'zod';

// // eslint-disable-next-line import/no-extraneous-dependencies
// require('dotenv').config({
//   path: '.env',
// });

// const openai = new OpenAI({
//   apiKey:
//     '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',
// });

// const GenderAndAge = z.object({
//   gender: z.enum(['male', 'female']), // assuming the API returns these specific values
//   age: z.number(), // Matches a range like "18-24"
// });

// jest.setTimeout(60000); // Increased timeout to 60 seconds as image generation and upload might take time

// describe('openai vision tests', () => {
//   describe('get gender and age', () => {
//     it('should get gender and age of the person in the photo', async () => {
//       const completion = await openai.beta.chat.completions.parse({
//         model: 'gpt-4o-2024-08-06',
//         messages: [
//           {
//             role: 'system',
//             content:
//               'Analyze this image and provide the gender and approximate age range of the person in the image. If multiple people are present, focus on the most prominent individual.',
//           },
//           {
//             role: 'user',
//             content: [
//               {
//                 type: 'image_url',
//                 image_url: {
//                   url: 'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/training_images%2Fperson918800544186%2Fphotograph_of_person918800544186_30d78601-5e89-4b27-b3ac-56cb040b1b1d.jpeg?alt=media&token=993daa64-0513-424e-8ad9-6ec169e6ff96',
//                 },
//               },
//             ],
//           },
//         ],
//         response_format: zodResponseFormat(GenderAndAge, 'particulars'),
//       });
//       const event = completion?.choices[0]?.message?.parsed;
//       console.log(JSON.stringify(completion?.choices[0]?.message, null, 2));
//       console.log(JSON.stringify(event, null, 2));

//       expect(event).toMatch('fwf');
//     });
//   });
// });
