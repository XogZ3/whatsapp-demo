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
  promptType: z.enum([
    'closeup',
    'person_in_scene',
    'scene_or_artwork',
    'garment',
  ]),
  promptText: z.string(),
});
export type PromptSchemaType = z.infer<typeof PromptSchema>;

export async function getPromptFromImageURLUsingOpenAI(
  imageURL: string,
  caption?: string,
): Promise<PromptSchemaType | null> {
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
json
{
"type": "<image_type>",
"prompt": "<detailed_prompt>"
}

Where <image_type> is one of: "closeup", "person_in_scene", "scene_or_artwork", or "garment".

# INSTRUCTIONS #
1. Analyze the provided image carefully.
2. Determine which of the four cases the image falls into.
3. Generate a detailed prompt based on the following guidelines for each case:

 Case 1: Close-up of a face (type: "closeup")
 - Focus on describing hairstyle, piercings, tattoos, beard style, or other distinctive features.
 - Do not mention specific facial features, age, or ethnicity, as these will be replaced by the user's own.
 - Example: "A person with an edgy, asymmetrical haircut dyed electric blue. Multiple silver hoop earrings adorn their ears, and a small nose stud catches the light. A delicate, intricate mandala tattoo is visible on the side of their neck."

 Case 2: Person in a specific scenario (type: "person_in_scene")
 - Describe the scene, setting, and activity in detail.
 - Mention the pose, clothing style, and any props or accessories, but avoid describing specific facial features.
 - Example: "A person stands atop a snow-covered mountain peak, arms raised triumphantly. They're wearing high-performance winter gear in bright red and black, with a backpack and ice axe. The background shows a breathtaking vista of jagged, snow-capped mountains under a clear blue sky."

 Case 3: Scene or artwork without a person (type: "scene_or_artwork")
 - Describe the scene or artwork in detail, including style, colors, and mood.
 - Seamlessly incorporate a person (the user) into the scene in a logical way.
 - If it's an artwork, try to match the art style in your description.
 - Example: "A surreal, Dali-esque landscape with melting clocks draped over barren tree branches. The sky is a swirl of vibrant purples and oranges. In the foreground, a person stands contemplatively, their body elongated and fluid like the surrounding elements, seamlessly integrated into this dreamlike scene."

 Case 4: Garment or outfit focus (type: "garment")
 - Describe the garment or outfit in great detail, including fabric, color, style, and any unique features.
 - Create a scenario where the user is wearing this garment in an appropriate setting.
 - Example: "An exquisite evening gown made of shimmering emerald green silk. The dress features a plunging neckline, a fitted bodice with intricate beadwork, and a flowing skirt with a high slit. A person wearing this stunning gown stands on a grand staircase in an opulent ballroom. Crystal chandeliers cast a warm, golden light, making the beadwork on the dress sparkle. The wearer strikes a confident pose, one hand on the ornate banister, exuding elegance and sophistication."

4. Ensure your description is vivid and detailed, providing enough information for the AI Image Generator to create a compelling image.
5. Use language that is clear, specific, and easily interpretable by an AI system. Avoid abstract concepts or subjective terms that may be ambiguous.
6. Aim for a length of 3-5 sentences for the expanded prompt.

# EXAMPLES OF INTERPRETABLE LANGUAGE #
- Instead of "cool hairstyle": "hair styled in a messy faux hawk with shaved sides"
- Instead of "interesting outfit": "wearing a steampunk-inspired outfit with a brown leather corset, brass goggles on top of the head, and a floor-length skirt with gear patterns"
- Instead of "beautiful scenery": "a panoramic view of a lush green valley with a winding river, snow-capped mountains in the distance, and a vibrant rainbow arching across the sky"

# EXAMPLES #
Input: [Image of a person with an elaborate face painting at a festival]
JSON Output:
{
"type": "closeup",
"prompt": "A person at a vibrant festival, their face adorned with an intricate, colorful design of swirling patterns and geometric shapes. The face paint uses bold hues of teal, gold, and magenta that shimmer in the sunlight. They're wearing a flower crown made of vivid tropical blooms and peacock feathers. The background is blurred but shows glimpses of other festival-goers and colorful banners fluttering in the breeze. The image captures the joyful, free-spirited atmosphere of the event."
}

Input: [Image of a serene Japanese garden without any people]
JSON Output:
{
"type": "scene_or_artwork",
"prompt": "A tranquil Japanese garden with a winding stone path leading to a traditional wooden tea house. Perfectly manicured bonsai trees and flowering cherry blossoms frame the scene. A small arched bridge crosses over a koi pond, its surface broken by ripples from jumping fish. Amidst this serene setting, a person in a flowing kimono stands on the bridge, gazing contemplatively at the water below. Their posture and attire harmonize with the peaceful, meditative atmosphere of the garden. Soft, diffused lighting suggests early morning, with mist rising gently from the pond's surface."
}

Input: [Image of a haute couture jacket on a mannequin]
JSON Output:
{
"type": "garment",
"prompt": "An avant-garde haute couture jacket with exaggerated, sculptural shoulders and a nipped-in waist. The jacket is crafted from a luxurious, iridescent fabric that shifts from deep purple to midnight blue depending on the light. Intricate, hand-sewn beadwork in silver and crystal adorns the collar and cuffs, creating a starry night effect. A person wearing this statement piece stands in an ultra-modern art gallery, surrounded by abstract sculptures and minimalist paintings. The wearer strikes a confident pose, one hand on hip, showcasing the jacket's dramatic silhouette against the stark white walls. Soft, directional lighting highlights the jacket's unique texture and embellishments, creating a captivating interplay of light and shadow."
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
      response_format: zodResponseFormat(PromptSchema, 'particulars'),
    });

    if (completion?.choices?.[0]?.message?.parsed) {
      return completion.choices[0].message.parsed as PromptSchemaType;
    }
    console.warn('Parsed response is not available');
    return null;
  } catch (error) {
    console.error('Error processing the image:', error);
    return null;
  }
}
