export const VIDEOGPT_API_URL = 'https://api.videogptai.com';

export const TRAINING_IMAGES_LIMIT = 15;
export const DEFAULT_CREDITS = 1;

export function generateSamplePrompts(loraFilename: string) {
  const modelName = loraFilename.split('.')[0];

  const samplePrompts = [
    `Vintage sci-fi illustration, futuristic cityscape. Robotic ${modelName}, metallic body, standing on rooftop. Neon lights, dark sky. Low-key lighting, muted colors, blue accents. Alluring, futuristic. Shot with DSLR, F1.4, 1/800s, ISO 100. Sharp focus, depth of field, cinematic.`,
    `Garden party, sunny afternoon. ${modelName}, dressed in elegant attire, sitting on garden bench. Soft, warm lighting, pastel colors. Elegant, refined. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, depth of field, cinematic.`,
    `Beachside cafe, morning. ${modelName}, dressed in casual attire, sipping coffee on beachside patio. Soft, warm lighting, vibrant colors. Cozy, relaxed. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, depth of field, cinematic.`,
    `Desert oasis, sunset. ${modelName}, dressed in flowing attire, standing in front of palm trees. Warm, golden lighting, vibrant colors. Serene, peaceful. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, shallow depth of field, cinematic.`,
    `Luxury penthouse, modern cityscape. ${modelName}, dressed in business attire, standing on balcony. Bright, natural lighting, bold colors. Confident, professional. Shot with medium format, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, dramatic.`,
    `Hot air balloon, sunrise. ${modelName}, dressed in adventurous attire, floating above clouds. Soft, warm lighting, vibrant colors. Breathtaking, serene. Shot with medium format, F2.8, 1/125s, ISO 400. Soft focus, shallow depth of field, dramatic`,
    `Surfside, sunset. ${modelName}, dressed in beachy attire, riding waves. Warm, golden lighting, vibrant colors. Dynamic, exhilarating. Shot with Hasselblad, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, cinematic`,
    `editorial avant-garde dramatic action pose of a ${modelName} wearing 60s round wacky sunglasses with gemstones hanging pulling glasses down looking forward, in Italy at sunset with a vibrant illustrated jacket surrounded by illustrations of flowers, smoke, flames, ice cream, sparkles, rock and roll`,
    `Festival of lights, nighttime. ${modelName}, dressed in colorful attire, surrounded by twinkling lights. Bright, vibrant lighting, bold colors. Magical, enchanting. Shot with medium format, F2.8, 1/125s, ISO 400. Soft focus, shallow depth of field, dramatic`,
    `Beachside bonfire, nighttime. ${modelName}, dressed in cozy attire, sitting around campfire. Warm, golden lighting, vibrant colors. Cozy, intimate. Shot with medium format, F2.8, 1/125s, ISO 400. Soft focus, shallow depth of field, dramatic`,
  ];
  return samplePrompts;
}
