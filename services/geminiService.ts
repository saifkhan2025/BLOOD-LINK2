
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateThankYouMessage = async (donorName: string): Promise<string> => {
    if (!process.env.API_KEY) {
        // Fallback for when API key is not available
        return `Thank you, ${donorName}, for your willingness to donate blood and help save lives. Your generosity is greatly appreciated!`;
    }

    try {
        const prompt = `You are a helpful assistant for a blood bank application. Write a short, polite, and encouraging thank you message to a potential blood donor named ${donorName}. The message should be warm and express gratitude for their willingness to help save lives. Keep it under 40 words and do not use hashtags or markdown.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 1,
                topK: 32,
                maxOutputTokens: 100,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating message with Gemini:", error);
        // Provide a graceful fallback message
        return `Thank you, ${donorName}, for your willingness to help. We appreciate you!`;
    }
};
