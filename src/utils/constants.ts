export const VIDEOGPT_API_URL = 'https://api.videogptai.com';

export const TRAINING_IMAGES_LIMIT = 15;
export const DEFAULT_CREDITS = 5;
export const DAILY_CREDITS_LIMIT = 100;

export const STRIPE_PAYMENT_LINK_100_CREDITS =
  'https://buy.stripe.com/test_4gwg2LbB41ob4Tu288';

export function generateSamplePrompts(loraFilename: string) {
  const modelName = loraFilename.split('.')[0];

  const samplePrompts = [
    `Luxury penthouse, modern cityscape. ${modelName}, dressed in business attire, standing on balcony. Bright, natural lighting, bold colors. Confident, professional. Shot with medium format, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, dramatic.`,
    `editorial avant-garde dramatic action pose of ${modelName} wearing 60s round wacky sunglasses with gemstones hanging pulling glasses down looking forward, in Italy at sunset with a vibrant illustrated jacket surrounded by illustrations of flowers, smoke, flames, ice cream, sparkles, rock and roll`,
    `Vintage speakeasy, nighttime. ${modelName}, dressed in stylish attire, sipping cocktail at bar. Warm, golden lighting, rich colors. Sophisticated, exclusive. Shot with Hasselblad, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, cinematic. LORA_MODEL`,
    `Cozy coffee shop, morning. ${modelName}, dressed in casual attire, sipping coffee at table. Soft, warm lighting, cozy colors. Relaxed, intimate. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, depth of field, cinematic. LORA_MODEL`,
    `Urban park, daytime. ${modelName}, dressed in casual attire, sitting on bench. Soft, natural lighting, vibrant colors. Relaxed, peaceful. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, depth of field, cinematic. LORA_MODEL`,
    `Luxury yacht, daytime. ${modelName}, dressed in stylish attire, standing on deck overlooking ocean. Bright, sunny lighting, vibrant colors. Sophisticated, luxurious. Shot with Hasselblad, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, cinematic. LORA_MODEL`,
  ];
  return samplePrompts;
}
