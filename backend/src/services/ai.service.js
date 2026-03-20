import axios from "axios";
import { config } from "../config/env.js";

export const askAIService = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-lite-001",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${config.openRouterApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter Error:", error.response?.data || error.message);
    throw new Error("AI request failed");
  }
};