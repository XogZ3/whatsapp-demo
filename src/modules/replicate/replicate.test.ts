// import Replicate from 'replicate';

// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_KEY,
// });

// jest.setTimeout(60000);

// describe('Replicate API tests', () => {
//   it('should get output', async () => {
//     try {
//       const output = await replicate.run(
//         'lucataco/flux-dev-multi-lora:a738942df15c8c788b076ddd052256ba7923aade687b12109ccc64b2c3483aa1',
//         {
//           input: {
//             prompt:
//               'A medium-shot realistic photograph of person918056977300 wearing navybluefloralshirt. The background is white.',
//             hf_loras: [
//               'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/private%2Flora_models%2Fperson918056977300_qwerty.safetensors?alt=media&token=d8b431c2-bd40-444a-ae05-4bab1f8f8997&filename=person918056977300_qwerty.safetensors',
//               'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/private%2Fcustom_models%2Fflux_realism_lora.safetensors?alt=media&token=e390b666-4c3a-4726-b94a-41395a9d98aa&filename=realismlora.safetensors',
//               'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/private%2Fclothes_lora_models%2Fnavybluefloralshirt.safetensors?alt=media&token=cfa70730-de07-4294-8759-721ae1f118c4&filename=navybluefloralshirt.safetensors',
//             ],
//             num_outputs: 1,
//             aspect_ratio: '9:16',
//             output_format: 'png',
//             guidance_scale: 3.5,
//             output_quality: 80,
//             num_inference_steps: 28,
//             disable_safety_checker: true,
//           },
//         },
//       );

//       console.log('[+] Replicate output:', JSON.stringify(output, null, 2));

//       // Test assertions
//       expect(Array.isArray(output)).toBe(true);
//     } catch (error) {
//       console.error('Error occurred:', error);
//       throw error; // Rethrow to fail the test on error
//     }
//   });
// });
