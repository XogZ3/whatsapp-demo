import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const GenderAndAgeSchema = z.object({
  gender: z.enum(['male', 'female']),
  age: z.number(),
});
export type GenderAndAgeSchemaType = z.infer<typeof GenderAndAgeSchema>;

export async function getAgeAndGenderFromImageURLUsingOpenAI(
  imageURL: string,
): Promise<GenderAndAgeSchemaType | null> {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content:
            'Analyze this image and provide the gender and approximate age of the person in the image. If multiple people are present, focus on the most prominent individual.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageURL,
              },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(GenderAndAgeSchema, 'particulars'),
    });

    if (completion?.choices?.[0]?.message?.parsed) {
      return completion.choices[0].message.parsed as GenderAndAgeSchemaType;
    }
    console.warn('Parsed response is not available');
    return null;
  } catch (error) {
    console.error('Error processing the image:', error);
    return null;
  }
}

const PromptSchema = z.object({
  prompt: z.string(),
});
export type PromptSchemaType = z.infer<typeof PromptSchema>;

export async function getImprovedPromptFromOpenAI({
  prompt,
  age,
  gender,
}: {
  prompt: string;
  age: number;
  gender: 'male' | 'female';
}): Promise<PromptSchemaType> {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: `# CONTEXT #
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
Provide your output in JSON format as follows:
{
  "prompt": "<detailed_prompt>"
}

# INSTRUCTIONS #
1. Read and understand the simple user prompt.
2. Expand the prompt with specific details about the subject and scene, ensuring to cover the following elements:

   a) Subject Description:
      - Gender ${gender}
      - Age ${age} (if relevant, e.g., "young," "middle-aged," "elderly")
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
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      response_format: zodResponseFormat(PromptSchema, 'particulars'),
    });

    if (completion?.choices?.[0]?.message?.parsed) {
      return completion.choices[0].message.parsed as PromptSchemaType;
    }
    console.warn('Parsed response is not available');
    return { prompt };
  } catch (error) {
    console.error('Error processing the image:', error);
    return { prompt };
  }
}

const ImagePromptSchema = z.object({
  promptType: z.enum([
    'closeup',
    'person_in_scene',
    'scene_or_artwork',
    'garment',
  ]),
  promptText: z.string(),
});
export type ImagePromptSchemaType = z.infer<typeof ImagePromptSchema>;

export async function getPromptFromImageURLUsingOpenAI(
  imageURL: string,
  caption?: string,
): Promise<ImagePromptSchemaType | null> {
  try {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `# CONTEXT #
You are an AI agent designed to analyze images and create detailed, descriptive prompts for an advanced AI Image Generator. This generator specializes in creating photorealistic portraits and scenes involving human subjects. Users will provide an image, and your task is to describe the image in a way that the AI Image Generator can use to produce a high-quality, lifelike image incorporating the user into the scene, style, or garment.

# OBJECTIVE #
Analyze the provided IMAGE INPUT and generate a detailed, vivid description that the AI Image Generator can use to create a photorealistic image. The prompt should capture the essence of the original image while incorporating the user as the main subject.

# INPUT FORMAT #
The input will be an image, which may fall into one of four categories:
1. Close-up of a face
2. Person in a specific scenario
3. Scene or artwork without a person
4. Garment or outfit focus

# STYLE #
- Specificity: Provide clear, detailed descriptions of the relevant elements in the image.
- Adaptability: Adjust your description based on the type of image provided.
- Creativity: Seamlessly incorporate the user into the scene, style, or garment of the image.
- Clarity: Use precise, descriptive language that the AI Image Generator can interpret accurately.

# TONE #
Maintain a neutral, descriptive tone. Focus on objective details rather than subjective interpretations.

# AUDIENCE #
Users seeking to create photorealistic images of themselves in various scenarios, styles, poses, or specific garments based on reference images.

# RESPONSE FORMAT #
Provide your output in JSON format as follows:
{
  "type": "<image_type>",
  "prompt": "<detailed_prompt>"
}
Where <image_type> is one of: "closeup", "person_in_scene", "scene_or_artwork", or "garment".

# INSTRUCTIONS #
1. Analyze the provided image carefully.
2. Determine which of the four cases the image falls into.
3. Generate a detailed prompt based on the following guidelines for each case:

---

**Case 1: Close-up of a face (type: "closeup")**
- Focus on describing hairstyle, piercings, tattoos, beard style, or other distinctive features.
- Do not mention specific facial features, age, or ethnicity, as these will be replaced by the user's own.
- Example: "A person with an edgy, asymmetrical haircut dyed electric blue. Multiple silver hoop earrings adorn their ears, and a small nose stud catches the light. A delicate, intricate mandala tattoo is visible on the side of their neck."

**Case 2: Person in a specific scenario (type: "person_in_scene")**
- Begin the prompt by describing the person, ensuring they are facing the camera and looking directly into it.
- Mention their pose, clothing style, and any props or accessories, highlighting that they are the main focus.
- The person should be visible and in focus; the scene serves as a background.
- Avoid describing specific facial features, age, or ethnicity.
- Example: "A person stands atop a snow-covered mountain peak, facing the camera with arms raised triumphantly, looking directly into the lens. They're wearing high-performance winter gear in bright red and black, with a backpack and ice axe. The breathtaking vista of jagged, snow-capped mountains unfolds behind them under a clear blue sky."

**Case 3: Scene or artwork without a person (type: "scene_or_artwork")**
- Introduce a person into the scene from the torso up, ensuring they are facing the camera and looking directly into it.
- Start by describing the person, including attire and posture, making them the focal point.
- The background is the original scene or artwork, detailed in style, colors, and mood.
- If it's an artwork, match the art style in your description.
- Example: "A person appears in a surreal, Dali-esque landscape, shown from the torso up, facing the camera and gazing directly into it. Their body blends with the melting clocks and barren tree branches around them, wearing attire that complements the dreamlike environment. The sky swirls with vibrant purples and oranges, enhancing the surreal mood of the scene."

**Case 4: Garment or outfit focus (type: "garment")**
- Describe the garment or outfit in great detail, including fabric, color, style, and unique features.
- Create a scenario where the user is wearing this garment, facing the camera and looking into it.
- The setting is a background; focus remains on the person and the garment.
- Example: "A person stands on a grand staircase in an opulent ballroom, facing the camera and looking directly into it while wearing an exquisite evening gown made of shimmering emerald green silk. The dress features a plunging neckline, a fitted bodice with intricate beadwork, and a flowing skirt with a high slit. Crystal chandeliers cast a warm, golden light, making the beadwork on the dress sparkle. Their confident pose exudes elegance and sophistication."

4. Ensure your description is vivid and detailed, providing enough information for the AI Image Generator to create a compelling image.
5. Use language that is clear, specific, and easily interpretable by an AI system. Avoid abstract concepts or subjective terms that may be ambiguous.
6. The first line of the prompt must always focus on the person; background scene or other details come later.
7. The person should be the focal point, facing the camera and looking directly into it, never showing their back.
8. If the original image lacks a person, include the person in the scene from the torso up to keep the focus on them rather than the background.
9. Aim for a length of 3-5 sentences for the expanded prompt.

# EXAMPLES OF INTERPRETABLE LANGUAGE #
- Instead of "cool hairstyle": "hair styled in a messy faux hawk with shaved sides"
- Instead of "interesting outfit": "wearing a steampunk-inspired outfit with a brown leather corset, brass goggles on top of the head, and a floor-length skirt with gear patterns"
- Instead of "beautiful scenery": "a panoramic view of a lush green valley with a winding river, snow-capped mountains in the distance, and a vibrant rainbow arching across the sky"

# EXAMPLES #
**Input:** [Image of a person with an elaborate face painting at a festival]

**Output:**
{
  "type": "closeup",
  "prompt": "A person at a vibrant festival, their face adorned with an intricate, colorful design of swirling patterns and geometric shapes. The face paint uses bold hues of teal, gold, and magenta that shimmer in the sunlight. They're wearing a flower crown made of vivid tropical blooms and peacock feathers. The background is blurred but shows glimpses of other festival-goers and colorful banners fluttering in the breeze. The image captures the joyful, free-spirited atmosphere of the event."
}

**Input:** [Image of a serene Japanese garden without any people]

**Output:**
{
  "type": "scene_or_artwork",
  "prompt": "A person stands in a tranquil Japanese garden, shown from the torso up, facing the camera and gazing directly into it. They are wearing a flowing kimono adorned with delicate cherry blossom patterns. Behind them, a winding stone path leads to a traditional wooden tea house. Perfectly manicured bonsai trees and flowering cherry blossoms frame the scene. A small arched bridge crosses over a koi pond, with mist rising gently from the water's surface. The soft, diffused lighting suggests early morning, enhancing the peaceful, meditative atmosphere."
}

**Input:** [Image of a haute couture jacket on a mannequin]

**Output:**
{
  "type": "garment",
  "prompt": "A person faces the camera, looking directly into it while wearing an avant-garde haute couture jacket with exaggerated, sculptural shoulders and a nipped-in waist. The jacket is crafted from a luxurious, iridescent fabric that shifts from deep purple to midnight blue depending on the light. Intricate, hand-sewn beadwork in silver and crystal adorns the collar and cuffs, creating a starry night effect. They stand in an ultra-modern art gallery, with abstract sculptures and minimalist paintings serving as a backdrop. Soft, directional lighting highlights the jacket's unique texture and embellishments, creating a captivating interplay of light and shadow."
}`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageURL,
            },
          },
        ],
      },
    ];

    // Add the caption if it exists
    if (caption && messages[1]?.content) {
      (messages[1].content as Array<{ type: string; text?: string }>).push({
        type: 'text',
        text: caption,
      });
    }

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages,
      response_format: zodResponseFormat(ImagePromptSchema, 'particulars'),
    });

    if (completion?.choices?.[0]?.message?.parsed) {
      return completion.choices[0].message.parsed as ImagePromptSchemaType;
    }
    console.warn('Parsed response is not available');
    return null;
  } catch (error) {
    console.error('Error processing the image:', error);
    return null;
  }
}
