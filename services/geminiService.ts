import { GoogleGenAI, Modality, Type } from "@google/genai";

interface ImageData {
  data: string;
  mimeType: string;
}

export const describeImageStyle = async (image: ImageData): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const textPart = {
    text: "Describe this image's visual style in detail. Focus on the lighting, color palette, composition, mood, and overall aesthetic. Be descriptive and concise, as if writing an art director's brief. Do not mention the subject of the image, only the style.",
  };
  const imagePart = {
    inlineData: image,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [textPart, imagePart] },
  });

  return response.text;
};


export const generateImageWithNano = async (
  productImage: ImageData,
  prompt: string,
  styleImage?: ImageData | null
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [{ inlineData: productImage }];

  if (styleImage) {
    parts.push({ inlineData: styleImage });
  }

  // Ensure prompt is the last part
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image was generated. The model may have refused the request.");
};


interface PromptGenerationOptions {
  aspectRatio: string;
  lightingStyle: string;
  cameraPerspective: string;
  styleDescription?: string;
}

export const generatePromptSuggestions = async ({
  aspectRatio,
  lightingStyle,
  cameraPerspective,
  styleDescription
}: PromptGenerationOptions): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const metaPrompt = `You are an expert art director specializing in product photography. Generate 3 distinct and highly creative photo prompts for a product photoshoot. The subject of the photo will be provided separately in an image.

Each prompt must adhere strictly to the following constraints:
- Aspect Ratio: ${aspectRatio}
- Lighting Style: ${lightingStyle}
- Camera Perspective: ${cameraPerspective} shot

${styleDescription
    ? `Crucially, the aesthetic must be heavily inspired by this style description: "${styleDescription.trim()}"`
    : 'The aesthetic should be clean, modern, and suitable for high-end e-commerce.'
}

Focus on creating compelling scenes, backgrounds, and moods. The prompts should be detailed enough to guide an AI image generator effectively. Do not mention the subject of the image in the prompt.

Return the response as a JSON array of strings. For example: ["prompt 1", "prompt 2", "prompt 3"]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: metaPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A creative and detailed prompt for image generation.",
          },
        },
      },
    });
    
    const suggestions = JSON.parse(response.text);
    if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
      return suggestions;
    }
    throw new Error("Invalid response format from API.");

  } catch (error) {
    console.error("Error generating prompt suggestions:", error);
    // Fallback in case of API or parsing error
    return [
      `A professional product photograph. Aspect Ratio: ${aspectRatio}. Lighting: ${lightingStyle}. Camera Perspective: ${cameraPerspective}.`,
      `A clean, minimalist product shot with ${lightingStyle.toLowerCase()} lighting, taken from a ${cameraPerspective.toLowerCase()} angle in ${aspectRatio} format.`,
      `An eye-catching advertisement style image for a product, using a ${cameraPerspective.toLowerCase()} perspective and ${lightingStyle.toLowerCase()} lighting. The aspect ratio is ${aspectRatio}.`
    ];
  }
};
