import Groq from 'groq-sdk';

import type { GenderAndAgeSchemaType } from '../openai';

export const getGroqResult = async (
  query: string,
  systemPrompt: string,
  temperature: number = 0.2,
): Promise<string> => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const messages: any = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: query });
  const chatCompletion = await groq.chat.completions.create({
    messages,
    model: 'llama3-70b-8192',
    temperature,
  });
  return chatCompletion.choices[0]?.message?.content || '';
};

export const getImprovedPromptFromGroq = async ({
  prompt,
  age,
  gender,
  temperature = 0.7,
}: {
  prompt: string;
  age: number;
  gender: 'male' | 'female';
  temperature?: number;
}) => {
  const systemPrompt = `# CONTEXT #
You are an AI agent designed to transform simple user inputs into detailed, descriptive prompts for an advanced AI Image Generator. This generator specializes in creating photorealistic portraits and scenes involving human subjects. Users will provide basic ideas or concepts, and your task is to expand these into comprehensive, vivid descriptions that the AI Image Generator can use to produce high-quality, lifelike images.

# OBJECTIVE #
Analyze the USER INPUT, which will be a simple prompt describing a person or scene, and generate a detailed, vivid description that the AI Image Generator can use to create a photorealistic image. The expanded prompt should enhance the original idea while maintaining its core concept and incorporating specific elements that contribute to a high-quality, realistic portrait.

# INPUT FORMAT #
The input will always be a simple text prompt, such as "woman with gun" or "man on beach".

# STYLE #
- Specificity: Provide clear, detailed descriptions of the subject's appearance, clothing, pose, and surroundings.
- Realism: Focus on creating prompts that will result in photorealistic images.
- Creativity: Expand on the original prompt with interesting but plausible details.
- Clarity: Use precise, descriptive language that the AI Image Generator can interpret accurately.

# TONE #
Maintain a neutral, descriptive tone. Avoid subjective judgments or emotive language unless specifically requested by the user.

# AUDIENCE #
Users seeking to create photorealistic images of themselves or others in various scenarios or poses.

# RESPONSE FORMAT #
"detailed prompt string"

# INSTRUCTIONS #
1. Read and understand the simple user prompt.
2. Expand the prompt with specific details about the subject and scene, ensuring to cover the following elements:

   a) Subject Description:
      - Gender: Use "${gender}" as gender
      - Age: Use ${age} as age (if relevant, e.g., "young," "middle-aged," "elderly")
      - Ethnicity (if desired and appropriate)
      - Notable physical features (e.g., "tall," "muscular," "petite")

   b) Pose and Expression:
      - Body position (e.g., "standing confidently," "sitting casually," "leaning against a wall")
      - Facial expression (e.g., "smiling warmly," "with a determined look," "laughing joyfully")

   c) Clothing and Accessories:
      - Style (e.g., "casual," "formal," "bohemian," "sporty")
      - Specific garments (e.g., "wearing a crisp white shirt and tailored black pants")
      - Accessories (e.g., "with a leather watch," "sporting oversized sunglasses")

   d) Background and Setting:
      - Environment (e.g., "in a bustling city street," "on a serene beach," "in a cozy living room")
      - Relevant details (e.g., "with skyscrapers in the background," "surrounded by lush tropical plants")

   e) Lighting and Mood:
      - Light source and quality (e.g., "bathed in warm sunset light," "under bright studio lighting")
      - Atmosphere (e.g., "creating a moody, dramatic atmosphere," "in a cheerful, vibrant setting")

   f) Photography Style and Image Quality:
      - Technique (e.g., "captured in a candid street photography style," "in a polished fashion editorial look")
      - Technical aspects (e.g., "with sharp focus on the subject," "in ultra-high resolution")

3. Ensure the expanded prompt remains true to the original concept while adding depth and detail.
4. Aim for a length of 2-4 sentences for the expanded prompt.
5. Use language that is clear, specific, and easily interpretable by an AI system. Avoid abstract concepts or subjective terms that may be ambiguous.

# EXAMPLES OF INTERPRETABLE LANGUAGE #
- Instead of "beautiful": "with striking features, including high cheekbones and bright blue eyes"
- Instead of "cool": "wearing trendy streetwear, including ripped jeans and a vintage band t-shirt"
- Instead of "interesting background": "with a graffiti-covered brick wall in the background, adding urban texture to the scene"

# EXAMPLES #
Input: "woman with gun"
Output:
{
  "prompt": "A confident woman in her early 30s stands in a power pose, holding a modern pistol with both hands in a proper shooting stance. She's wearing a fitted black tactical outfit with a utility belt. Her expression is focused and determined. The setting is an indoor shooting range with target sheets visible in the background. The image is captured with sharp focus on the woman, using high-contrast lighting to create a dramatic, action-ready atmosphere."
}

Input: "man on beach"
Output:
{
  "prompt": "A fit man in his late 20s stands ankle-deep in the clear waters of a tropical beach. He's wearing vibrant blue swim shorts and has a lean, tanned physique. His hair is slightly tousled by the sea breeze, and he's smiling broadly at the camera. The background features pristine white sand and a few palm trees leaning over the water. The scene is bathed in the warm, golden light of sunset, creating a soft, flattering glow on the man's skin and the surrounding landscape. The image is captured in a lifestyle photography style with a shallow depth of field, focusing crispy on the subject while softly blurring the beautiful background."
}`;
  return getGroqResult(prompt, systemPrompt, temperature);
};

// Model currently does not support JSON structured response
export const getAgeAndGenderFromImageURLUsingGroq = async (
  imageURL: string,
): Promise<GenderAndAgeSchemaType | null> => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image and provide the gender and approximate age of the person in the image. If multiple people are present, focus on the most prominent individual. Give the result in a json format with gender (male or female) and age (number)',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageURL,
            },
          },
        ],
      },
    ],
    model: 'llava-v1.5-7b-4096-preview',
    temperature: 0,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
    stop: null,
  });
  // Asserting gender and age JSON response
  try {
    const result = JSON.parse(chatCompletion.choices[0]?.message?.content!);
    if (
      result &&
      (result.gender === 'male' || result.gender === 'female') &&
      typeof result.age === 'number'
    ) {
      // Return the extracted gender and age
      return {
        gender: result.gender,
        age: result.age,
      };
    }
    return null;
  } catch (error) {
    console.error(
      'Error parsing response in getAgeAndGenderFromImageURLUsingGroq:',
      error,
    );
    return null;
  }
};

export const generateImageCaptionUsingGroq = async (imageURL: string) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this image and provide a caption of the image. If multiple people are present, focus on the most prominent individual.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageURL,
            },
          },
        ],
      },
    ],
    model: 'llava-v1.5-7b-4096-preview',
    temperature: 0,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
    stop: null,
  });
  const caption = chatCompletion.choices[0]?.message?.content;
  const captionWithTriggerWord = caption
    ?.replace(/\bman\b/g, '[trigger]')
    .replace(/\bwoman\b/g, '[trigger]');
  return captionWithTriggerWord!;
};

export const getCronDailyImagePromptFromGroq = async ({
  location,
  temperature = 0.7,
}: {
  location: string;
  temperature?: number;
}) => {
  const systemPrompt = `You are an AI agent designed to transform simple location input into detailed, descriptive prompts for an advanced AI Image Generator. This generator specializes in creating photorealistic portraits and scenes involving human subjects. Users will provide location, and your task is to expand these it comprehensive, vivid descriptions that the AI Image Generator can use to produce high-quality, lifelike images.

# OBJECTIVE #
Analyze the USER LOCATION INPUT, which will be a simple prompt describing a location, and generate a detailed, vivid description that the AI Image Generator can use to create a photorealistic image. The expanded prompt should enhance the original idea while maintaining its core concept and incorporating specific elements that contribute to a high-quality, realistic portrait.

# INPUT FORMAT #
The input will always be a simple location text prompt, such as "Pyramids of Giza, Egypt" or "Grand Canyon, USA".

# STYLE #
- Specificity: Provide clear, detailed descriptions of the subject's appearance, clothing, pose, and surroundings.
- Realism: Focus on creating prompts that will result in photorealistic images.
- Creativity: Expand on the original prompt with interesting but plausible details.
- Clarity: Use precise, descriptive language that the AI Image Generator can interpret accurately.

# TONE #
Maintain a neutral, descriptive tone. Avoid subjective judgments or emotive language unless specifically requested by the user.

# AUDIENCE #
Users seeking to create photorealistic images of themselves or others in various scenarios or poses.

# INSTRUCTIONS #
1. Read and understand the simple user location prompt.
2. Expand the prompt with specific details about the subject and scene, ensuring to cover the following elements:

   a) Pose and Expression:
      - Body position (e.g., "standing confidently," "sitting casually," "leaning against a wall")
      - Facial expression (e.g., "smiling warmly," "with a determined look," "laughing joyfully")

   b) Clothing and Accessories:
      - Style (e.g., "casual," "formal," "bohemian," "sporty")
      - Specific garments (e.g., "wearing a crisp white shirt and tailored black pants")
      - Accessories (e.g., "with a leather watch," "sporting oversized sunglasses")

   c) Background and Setting:
      - Environment - use the location ${location} (e.g., "in a bustling new york city street," "on a Blue Lagoon, Iceland," "in a cozy living room in Burj Khalifa, Dubai")
      - Relevant details (e.g., "with skyscrapers in the background," "surrounded by lush tropical plants")

   d) Lighting and Mood:
      - Light source and quality (e.g., "bathed in warm sunset light," "under bright studio lighting")
      - Atmosphere (e.g., "creating a moody, dramatic atmosphere," "in a cheerful, vibrant setting")

   e) Photography Style and Image Quality:
      - Technique (e.g., "captured in a candid street photography style," "in a polished fashion editorial look")
      - Technical aspects (e.g., "with sharp focus on the subject," "in ultra-high resolution")

3. Ensure the expanded prompt remains true to the original concept while adding depth and detail.
4. Aim for a length of 2-4 sentences for the expanded prompt.
5. Use language that is clear, specific, and easily interpretable by an AI system. Avoid abstract concepts or subjective terms that may be ambiguous.

# EXAMPLES OF INTERPRETABLE LANGUAGE #
- Instead of "beautiful": "with striking features, including high cheekbones and bright blue eyes"
- Instead of "cool": "wearing trendy streetwear, including ripped jeans and a vintage band t-shirt"
- Instead of "interesting background": "with a graffiti-covered brick wall in the background, adding urban texture to the scene"

# EXAMPLES #
Input: "Galapagos Islands, Ecuador"
Output: "Portrait of a person on pristine Galapagos beach. Warm, golden light, soft focus. The person is wearing vibrant blue swim shorts and has a lean, tanned physique. His hair is slightly tousled by the sea breeze, and they are smiling broadly at the camera. The background features pristine white sand and a few palm trees leaning over the water. The scene is bathed in the warm, golden light of sunset, creating a soft, flattering glow on the man's skin and the surrounding landscape. The image is captured in a lifestyle photography style with a shallow depth of field, focusing crispy on the subject while softly blurring the beautiful background."
`;
  return getGroqResult(location, systemPrompt, temperature);
};

export const getCronImagePromptFromGroq = async ({
  age,
  gender,
  location,
  temperature = 0.7,
}: {
  age: number;
  gender: 'male' | 'female';
  location: string;
  temperature?: number;
}) => {
  const systemPrompt = `You are an AI assistant specializing in creating image prompts for the FLUX AI Image model. When given a "location" input, generate a detailed, vivid image prompt within 256 characters. Follow these guidelines:
1. Incorporate location: ${location}.
2. Use specific, descriptive language to enhance visual details.
3. Include style, lighting, and composition details when relevant.
4. Mention camera settings or photographic techniques if appropriate.
5. Add artistic references or mood descriptors to guide the image's feel.
6. Ensure the prompt is coherent and focused on a single, strong concept.
7. Prioritize elements to fit within the 256-character limit.
8. Use descriptive adjectives for subjects (e.g., "gorgeous," "slender," "toned").
9. Specify location and setting details (e.g., "burlesque club," "smoky room").
10. Include lighting descriptors (e.g., "dark lit," "low key," "rim light").
11. Mention color palettes or specific color elements (e.g., "muted colors," "red color pop").
12. Add style references (e.g., "cabaret style," "photorealistic," "cinematic composition").
13. Include specific camera settings when relevant (e.g., "F1.4, 1/800s, ISO 100").
14. Incorporate artistic techniques (e.g., "depth of field," "sharp focus").
15. Use evocative mood words (e.g., "alluring," "seductive").
16. Include the age as ${age} and use gendered language for gender "${gender}" in the generated prompt (e.g., "photo of 26 year old woman as she runs", "30 year old man, he is smiling")
17. Add some good clothing descriptors that is coherent with the overall prompt (e.g., "summer dress", "tailored suit", "sweater", "swimsuit", "white shirt").
18. Ensure that the prompt does NOT result in NSFW images. Keep it safe for work.
Examples:
1. "Moulin Rouge, cabaret style, burlesque photograph. Gorgeous woman, slender body, posing in smoky club. Dark, low-key lighting, muted colors, red pop. Alluring, seductive. Shot with DSLR, F1.4, 1/800s, ISO 100. Sharp focus, depth of field, cinematic."
2. "Cyberpunk girl, Prompt Hero logo on chest. Rooftop stance, dystopian city background. Dynamic pose, fierce expression. Comic style, intricate details. Ominous lighting, stormy night. Hasselblad long exposure shot. Dramatic, detailed cityscape."
3. "Fashion model, blonde woman, green eyes. White shirt, blue jeans. Black background. Studio lighting, professional shot. Sharp focus on facial features. Minimalist style, high contrast. Fashion magazine aesthetic."
Respond only with the generated image prompt, without any additional explanation or commentary. If no input is given, generate a random prompt while following guidelines`;
  return getGroqResult(location, systemPrompt, temperature);
};
