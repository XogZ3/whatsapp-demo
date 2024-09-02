export const TRAINING_IMAGES_LOWER_LIMIT = 5;
export const TRAINING_IMAGES_UPPER_LIMIT = 15;
export const DEFAULT_CREDITS = 5;
export const DAILY_CREDITS_LIMIT = 100;

export function generateSamplePrompts({
  age,
  gender,
  loraFilename,
}: {
  age: number;
  gender: 'male' | 'female';
  loraFilename: string;
}) {
  const modelName = loraFilename.split('.')[0];
  const genderPronoun = gender === 'male' ? 'he' : 'she';
  const genderPronounOther = gender === 'male' ? 'his' : 'her';
  const genderCommon = gender === 'male' ? 'man' : 'woman';

  const samplePrompts = [
    `A stylish ${genderCommon} ${modelName} around ${age} years old, a travel blogger with sun-kissed skin and tousled beach waves, sitting on a tropical beach at sunset. ${genderPronoun} is wearing crisp white clothes and holding up a weathered postcard with 'FotoLabs AI' written clearly and legibly in neat handwriting. The scene is bathed in warm, golden hour lighting.`,

    `A portrait of ${modelName}, who is ${age} years old, facing the camera directly. Soft side lighting casts gentle shadows on ${genderPronounOther} serene, neutral expression. The mood is calm and focused on ${genderPronounOther} striking eyes, with vibrant colors.`,

    `Photograph of ${modelName}, who is ${age} years old, with short hair. BREAK black sweater BREAK shopping in an outdoor market, autumn, extremely intricate details, masterpiece, clear shadows and highlights, realistic, enhanced contrast, highly detailed skin, f/2.8, bokeh.`,

    `A serious ${genderCommon} ${modelName} around ${age} years old, in a tailored suit, posing candidly for a professional photoshoot. The office lobby’s modern architecture is reflected in ${genderPronounOther} glasses.`,

    `Editorial avant-garde dramatic action pose of ${genderCommon} ${modelName}, who is ${age} years old, wearing 60s round wacky sunglasses with gemstones hanging pulling glasses down looking forward, in Italy at sunset with a vibrant illustrated jacket surrounded by illustrations of flowers, smoke, flames, ice cream, sparkles, rock and roll.`,

    `A charismatic speaker, around ${age} years old, is captured mid-speech. ${modelName} wears [rounded rectangular glasses with dark rims]. ${genderPronoun} is holding a black microphone in the right hand, speaking passionately. ${genderPronounOther} expression is animated as ${genderPronoun} gestures with the left hand. Dressed in [a light blue sweater over a white t-shirt]. The background is blurred, showcasing a white banner with logos and text, including ["FotoLabs AI"], suggesting a professional [conference] setting.`,
  ];

  return samplePrompts;
}
