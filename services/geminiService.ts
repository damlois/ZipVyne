
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFoodRecommendations = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the AI engine for ZipVyne, a local town delivery app in Nigeria. A user is looking for: "${query}". Based on local Nigerian preferences (like Pounded Yam, Amala, Jollof, small chops) and town-specific vibes, give 3 concise, mouth-watering suggestions. Return only the names of the dishes and a 1-sentence reason for each.`,
      config: {
        temperature: 0.8,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not fetch local favorites. Try our Signature Pounded Yam!";
  }
};

export const estimateLogisticsPrice = async (from: string, to: string, item: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Estimate a fair delivery price in Naira (NGN) for moving "${item}" from "${from}" to "${to}" in a typical Nigerian town context. Return ONLY the number (between 500 and 3500).`,
    });
    const text = response.text || "1000";
    const price = parseInt(text.replace(/[^0-9]/g, '')) || 1000;
    return price;
  } catch (error) {
    return 1000;
  }
};
