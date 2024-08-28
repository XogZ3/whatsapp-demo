export const TRAINING_IMAGES_LOWER_LIMIT = 5;
export const TRAINING_IMAGES_UPPER_LIMIT = 15;
export const DEFAULT_CREDITS = 5;
export const DAILY_CREDITS_LIMIT = 100;

export function generateSamplePrompts(loraFilename: string) {
  const modelName = loraFilename.split('.')[0];

  const samplePrompts = [
    `A bohemian-style ${modelName} travel blogger with sun-kissed skin and messy beach waves, sitting on a tropical beach at sunset. ${modelName} is wearing crisp white clothes and holding up a weathered postcard with “WanderlustDreamer” scrawled on it. Golden hour lighting bathes the scene in warm tones.`,

    `A portrait of ${modelName}, facing the camera directly. Soft side lighting casts gentle shadows on ${modelName}'s serene, neutral expression. The mood is calm and focused on ${modelName}'s striking eyes. vibrant.`,

    `Photograph of ${modelName}, 24 years old, with short hair. BREAK black sweater BREAK shopping in an outdoor market, autumn, extremely intricate details, masterpiece, clear shadows and highlights, realistic, enhanced contrast, highly detailed skin, f/2.8, bokeh.`,

    `A serious ${modelName} in a tailored suit, posing candidly for a professional photoshoot. The office lobby’s modern architecture is reflected in ${modelName}'s glasses.`,

    `editorial avant-garde dramatic action pose of ${modelName} wearing 60s round wacky sunglasses with gemstones hanging pulling glasses down looking forward, in Italy at sunset with a vibrant illustrated jacket surrounded by illustrations of flowers, smoke, flames, ice cream, sparkles, rock and roll`,

    `A charismatic speaker is captured mid-speech. ${modelName} wears [rounded rectangular glasses with dark rims]. ${modelName} is holding a black microphone in right hand, speaking passionately. ${modelName}'s expression is animated as they gestures with the left hand. Dressed in [a light blue sweater over a white t-shirt]. The background is blurred, showcasing a white banner with logos and text, including ["FotoLabs AI"], suggesting a professional [conference] setting.`,

    `Luxury yacht, daytime. ${modelName}, dressed in stylish attire, standing on deck overlooking ocean. Bright, sunny lighting, vibrant colors. Sophisticated, luxurious. Shot with Hasselblad, F2.8, 1/125s, ISO 400. Sharp focus, shallow depth of field, cinematic.`,
  ];
  return samplePrompts;
}
