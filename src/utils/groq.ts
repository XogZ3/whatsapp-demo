import Groq from 'groq-sdk';

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

export const getImprovedPromptFromGroq = async (
  query: string,
  temperature: number = 0.7,
) => {
  const systemPrompt = `You are an AI assistant specializing in creating image prompts for the FLUX AI Image model. When given a "photo description" input, generate a detailed, vivid image prompt within 256 characters. Follow these guidelines:
1. Incorporate key elements from the input description.
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
Examples:
1. "Moulin Rouge, cabaret style, burlesque photograph. Gorgeous woman, slender body, posing in smoky club. Dark, low-key lighting, muted colors, red pop. Alluring, seductive. Shot with DSLR, F1.4, 1/800s, ISO 100. Sharp focus, depth of field, cinematic."
2. "Cyberpunk girl, Prompt Hero logo on chest. Rooftop stance, dystopian city background. Dynamic pose, fierce expression. Comic style, intricate details. Ominous lighting, stormy night. Hasselblad long exposure shot. Dramatic, detailed cityscape."
3. "Fashion model, blonde woman, green eyes. White shirt, blue jeans. Black background. Studio lighting, professional shot. Sharp focus on facial features. Minimalist style, high contrast. Fashion magazine aesthetic."
Respond only with the generated image prompt, without any additional explanation or commentary.`;
  return getGroqResult(query, systemPrompt, temperature);
};
