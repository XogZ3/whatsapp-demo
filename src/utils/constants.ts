export const VIDEOGPT_API_URL = 'https://api.videogptai.com';

export const TRAINING_IMAGES_LIMIT = 15;
export const DEFAULT_CREDITS = 1;

export function generateSamplePrompts(loraFilename: string) {
  const modelName = loraFilename.split('.')[0];

  const samplePrompts = [
    `${modelName}`,
    `Vintage sci-fi illustration, futuristic cityscape. Robotic ${modelName}, metallic body, standing on rooftop. Neon lights, dark sky. Low-key lighting, muted colors, blue accents. Alluring, futuristic. Shot with DSLR, F1.4, 1/800s, ISO 100. Sharp focus, depth of field, cinematic.`,
    `Garden party, sunny afternoon. ${modelName}, dressed in elegant attire, sitting on garden bench. Soft, warm lighting, pastel colors. Elegant, refined. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, depth of field, cinematic.`,
    `Retro-futuristic diner, neon lights. ${modelName}, dressed in 1950s-style attire, serving milkshake. Bright, colorful lighting, bold colors. Fun, playful. Shot with Hasselblad, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, cinematic.`,
    `Tropical beach, sunny day. ${modelName}, dressed in colorful swimwear, playing with beach balls. Bright, warm lighting, vibrant colors. Fun, carefree. Shot with DSLR, F2.8, 1/800s, ISO 100. Sharp focus, shallow depth of field, cinematic.`,
    `Luxury penthouse, modern cityscape. ${modelName}, dressed in business attire, standing on balcony. Bright, natural lighting, bold colors. Confident, professional. Shot with medium format, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, dramatic.`,
  ];
  return samplePrompts;
}
