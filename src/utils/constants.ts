export const VIDEOGPT_API_URL = 'https://api.videogptai.com';

export const TRAINING_IMAGES_LIMIT = 15;
export const DEFAULT_CREDITS = 1;

export function generateSamplePrompts(loraFilename: string) {
  const modelName = loraFilename.split('.')[0];

  const samplePrompts = [
    `Luxury penthouse, modern cityscape. ${modelName}, dressed in business attire, standing on balcony. Bright, natural lighting, bold colors. Confident, professional. Shot with medium format, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, dramatic.`,
    `editorial avant-garde dramatic action pose of ${modelName} wearing 60s round wacky sunglasses with gemstones hanging pulling glasses down looking forward, in Italy at sunset with a vibrant illustrated jacket surrounded by illustrations of flowers, smoke, flames, ice cream, sparkles, rock and roll`,
    `Urban rooftop, sunset. ${modelName}, dressed in trendy attire, standing at rooftop bar. Warm, golden lighting, vibrant colors. Sophisticated, urban. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, shallow depth of field, cinematic. LORA_MODEL`,
    `Vintage speakeasy, nighttime. ${modelName}, dressed in stylish attire, sipping cocktail at bar. Warm, golden lighting, rich colors. Sophisticated, exclusive. Shot with Hasselblad, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, cinematic. LORA_MODEL`,
    `Cozy coffee shop, morning. ${modelName}, dressed in casual attire, sipping coffee at table. Soft, warm lighting, cozy colors. Relaxed, intimate. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, depth of field, cinematic. LORA_MODEL`,
    `Art gallery, evening. ${modelName}, dressed in elegant attire, standing in front of modern art piece. Soft, warm lighting, bold colors. Sophisticated, cultured. Shot with medium format, F2.8, 1/125s, ISO 400. Soft focus, shallow depth of field, dramatic. LORA_MODEL`,
    `Luxury penthouse, evening. Figure, dressed in formal attire, standing on balcony overlooking city skyline. Soft, warm lighting, vibrant colors. Sophisticated, glamorous. Shot with Hasselblad, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, cinematic. LORA_MODEL`,
    `Vintage nightclub, nighttime. ${modelName}, dressed in stylish attire, dancing on dance floor. Bright, vibrant lighting, bold colors. Energetic, lively. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, shallow depth of field, cinematic. LORA_MODEL`,
    `Cozy wine cellar, evening. ${modelName}, dressed in elegant attire, sipping wine at table. Soft, warm lighting, rich colors. Intimate, sophisticated. Shot with medium format, F2.8, 1/125s, ISO 400. Soft focus, shallow depth of field, dramatic. LORA_MODEL`,
    `Urban park, daytime. ${modelName}, dressed in casual attire, sitting on bench. Soft, natural lighting, vibrant colors. Relaxed, peaceful. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, depth of field, cinematic. LORA_MODEL`,
    `Luxury yacht, daytime. ${modelName}, dressed in stylish attire, standing on deck overlooking ocean. Bright, sunny lighting, vibrant colors. Sophisticated, luxurious. Shot with Hasselblad, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, cinematic. LORA_MODEL`,
  ];
  return samplePrompts;
}
