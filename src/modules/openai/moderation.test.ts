// import OpenAI from 'openai';
// import Replicate from 'replicate';

// import { getFlaggedCategories } from '.';

// // eslint-disable-next-line import/no-extraneous-dependencies
// require('dotenv').config({
//   path: '.env',
// });

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_KEY,
// });

// jest.setTimeout(18000000);

// const prompt =
//   'realistic photograph of person918754535859 bleeding from forehead after being attacked by a knife.';

// describe('OpenAI moderation tests', () => {
//   it('should get image and text moderation output', async () => {
//     const imageUrlArray = (await replicate.run(
//       'lucataco/flux-dev-multi-lora:a738942df15c8c788b076ddd052256ba7923aade687b12109ccc64b2c3483aa1',
//       {
//         input: {
//           prompt,
//           hf_loras: [
//             'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/private%2Flora_models%2Fperson918754535859_SGbOyM.safetensors?alt=media&token=33ea24f9-07ca-4a5c-8569-8a4f1500fa0b&filename=person918754535859_SGbOyM.safetensors',
//             'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/private%2Fcustom_models%2Fflux_realism_lora.safetensors?alt=media&token=e390b666-4c3a-4726-b94a-41395a9d98aa&filename=realismlora.safetensors',
//           ],
//           num_outputs: 1,
//           aspect_ratio: '9:16',
//           output_format: 'png',
//           guidance_scale: 3.5,
//           output_quality: 80,
//           num_inference_steps: 28,
//           disable_safety_checker: true,
//         },
//       },
//     )) as string[];
//     const imageURL = imageUrlArray[0];
//     console.log('[+] Replicate output:', imageURL);

//     const output = await openai.moderations.create({
//       model: 'omni-moderation-latest',
//       input: [
//         { type: 'text', text: prompt },
//         {
//           type: 'image_url',
//           image_url: {
//             url: imageURL!,
//           },
//         },
//       ],
//     });
//     console.log(JSON.stringify(output, null, 2));

//     expect(output.results[0]?.flagged).toBe(false);
//   });

//   it('should get text moderation  output', async () => {
//     const output = await openai.moderations.create({
//       model: 'omni-moderation-latest',
//       input: prompt,
//     });
//     console.log(JSON.stringify(output, null, 2));

//     const comments = getFlaggedCategories(output);
//     console.log(comments);

//     expect(output.results[0]?.flagged).toBe(false);
//   });
// });
