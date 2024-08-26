/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
const MULTI_LORA_TEMP_MODEL =
  'lucataco/flux-dev-multi-lora:a738942df15c8c788b076ddd052256ba7923aade687b12109ccc64b2c3483aa1';
const REALISM_LORA_URL =
  'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/private%2Fcustom_models%2Fflux_realism_lora.safetensors?alt=media&token=e390b666-4c3a-4726-b94a-41395a9d98aa&filename=realismlora.safetensors';

async function main() {
  const lora_url =
    'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/testfolder%2Floras%2Fgokul1.safetensors?alt=media&token=6ecb7f52-abd2-449a-85ca-d0f37ecaab19';
  const file_name = 'persongokul.safetensors';

  const output = await replicate.run(MULTI_LORA_TEMP_MODEL, {
    input: {
      prompt: 'portrait photoshoot, photography, 35mm photo',
      hf_loras: [`${lora_url}&filename=${file_name}`, REALISM_LORA_URL],
      num_outputs: 1,
      aspect_ratio: '16:9',
      output_format: 'png',
      guidance_scale: 3.5,
      output_quality: 80,
      num_inference_steps: 28,
    },
  });
  console.log('Output received from Replicate:');
  if (Array.isArray(output) && output.length > 0) {
    for (let i = 0; i < output.length; i++) {
      const imageUrl = output[i];
      console.log(`Image ${i + 1} URL:`, imageUrl);

      // Fetch the image
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate a unique filename
      const filename = `replicate_output_${Date.now()}_${i}.ignore.png`;

      // Save the image
      fs.writeFileSync(filename, buffer);
      console.log(`Saved image ${i + 1} to:`, filename);
    }
  } else {
    console.log('No images were generated or the output format is unexpected.');
  }
  console.log(output);
}

main().catch(console.error);
