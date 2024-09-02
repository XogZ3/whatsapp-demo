import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const GenderAndAge = z.object({
  gender: z.enum(['male', 'female']),
  age: z.number(),
});
export type GenderAndAgeType = z.infer<typeof GenderAndAge>;

export async function getAgeAndGenderFromImageURL(
  imageURL: string,
): Promise<GenderAndAgeType | null> {
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
      response_format: zodResponseFormat(GenderAndAge, 'particulars'),
    });

    if (completion?.choices?.[0]?.message?.parsed) {
      return completion.choices[0].message.parsed as GenderAndAgeType;
    }
    console.warn('Parsed response is not available');
    return null;
  } catch (error) {
    console.error('Error processing the image:', error);
    return null;
  }
}
