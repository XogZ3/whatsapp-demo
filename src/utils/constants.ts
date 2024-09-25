export const TRAINING_IMAGES_LOWER_LIMIT = 5;
export const TRAINING_IMAGES_UPPER_LIMIT = 15;
export const DEFAULT_CREDITS = 5;
export const DAILY_CREDITS_LIMIT = 100;

export const samplePhotoURLs = [
  'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/sample_images%2Fwoman_studio_ft_compressed.png?alt=media&token=24c4c0aa-393e-4552-8445-0279b57d9bb4',
  'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/sample_images%2Fbrazil-man.jpeg?alt=media&token=30f06317-15e3-443b-be6d-a8b6f7ac40ee',
  'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/sample_images%2Fwoman_angel-fs8.png?alt=media&token=ae14c2dc-849e-4974-ba18-6a3bb6f2e1c1',
  'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/sample_images%2Fbrazil-man-2.jpeg?alt=media&token=b2bac655-47cf-4bba-acb2-178f51737e4d',
];

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
  const genderHeShe = gender === 'male' ? 'he' : 'she';
  const genderHisHer = gender === 'male' ? 'his' : 'her';
  const genderManWoman = gender === 'male' ? 'man' : 'woman';

  const samplePrompts = [
    `A stylish ${genderManWoman} ${modelName} around ${age} years old, a travel blogger with sun-kissed skin and tousled beach waves, sitting on a tropical beach at sunset. ${genderHeShe} is wearing crisp white clothes and holding up a weathered postcard with only "FotoLabs AI" written clearly and legibly in neat handwriting. The scene is bathed in warm, golden hour lighting.`,

    `Long photo shot of ${genderManWoman} ${modelName}, Portrait photography, professional boudoir photo shoot, saloon ${genderManWoman} cosplay, 1800’s aesthetic, beautiful body type, cute face and smile, beautiful skin, saloon background, dust-filled sun rays sun coming through window at an angle, golden-hour light, realistic, stand, very high angle shot, hyper realistic, ultra-detailed, 8k, realism, Super photoreal, hyperreal, photorealistic, colored photo, very close shot, open mouth`,

    `Realistc photograph of ${modelName}, who is ${age} years old, with short hair. BREAK black sweater BREAK shopping in an outdoor market, autumn, extremely intricate details, masterpiece, clear shadows and highlights, realistic, enhanced contrast, highly detailed skin, f/2.8, bokeh.`,

    `A serious ${genderManWoman} ${modelName} around ${age} years old, in a tailored suit, posing candidly for a professional realistc photoshoot. The office lobby’s modern architecture is reflected in ${genderHisHer} glasses.`,

    `Realistc editorial avant-garde dramatic action pose of ${genderManWoman} ${modelName}, who is ${age} years old, wearing 60s round wacky sunglasses with gemstones hanging pulling glasses down looking forward, in Italy at sunset with a vibrant illustrated jacket surrounded by illustrations of flowers, smoke, flames, ice cream, sparkles, rock and roll.`,

    `a beautiful cute joyful and playful ${age} year old ${genderManWoman} ${modelName} view from bottom, dressed in a cozy sherpa jacket over a turtleneck and skinny jeans,in the street of paris at night eiffel tower in background,detailed masterpiece most beautiful artwork in the world Ultrarealistic,Sony A7,Nostalgic lighting`,

    // Backup Prompts

    // `A charismatic speaker, around ${age} years old, is captured mid-speech. ${modelName} wears [rounded rectangular glasses with dark rims]. ${genderHeShe} is holding a black microphone in the right hand, speaking passionately. ${genderHisHer} expression is animated as ${genderHeShe} gestures with the left hand. Dressed in [a light blue sweater over a white t-shirt]. The background is blurred, showcasing a white banner with logos and text, including ["FotoLabs AI"], suggesting a professional [conference] setting.`,

    // `Candid image, photography, natural textures, highly realistic light, editorial, Capture the essence of 90s studio fashion editorials with a contemporary twist. Envision a minimalist studio with bold, clean backgrounds, showcasing ${gender} ${modelName} as the centerpiece. ${genderHeShe} is dressed in vibrant, postmodernist ensembles, mixing textures and bright colors. Create dramatic lighting producing sharp, contrasting shadows. Emulate the visual quality of a high-end medium format camera, with a wide dynamic range and crisp details. Emphasize textures in clothing and skin for a hyperrealistic finish. The overall composition should exude a blend of retro glamour and modern sophistication.nostalgic scenes, medium body shot, mid distance ${gender} wide shot`,
  ];

  return samplePrompts;
}
