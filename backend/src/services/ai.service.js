import axios from "axios";
import { config } from "../config/env.js";

let cachedModels = null;
let cacheTime = 0;
const CACHE_TTL = 300000;

export const getFreeModels = async () => {
  if (cachedModels && Date.now() - cacheTime < CACHE_TTL) return cachedModels;

  try {
    const res = await axios.get("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${config.openRouterApiKey}` },
    });

    cachedModels = res.data.data
      .filter((m) => m.pricing?.prompt === "0" || m.id.endsWith(":free"))
      .map((m) => ({ id: m.id, name: m.name }));
    cacheTime = Date.now();
    return cachedModels;
  } catch (error) {
    return [];
  }
};

export const askAIService = async (prompt, modelId = null) => {
  const models = modelId ? [{ id: modelId }] : await getFreeModels();
  
  for (const model of models) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model.id,
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${config.openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "FlowAI Builder",
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      if (modelId) {
        throw new Error(error.response?.data?.error?.message || "Model currently unavailable.");
      }
    }
  }

  throw new Error(modelId ? "Selected model is currently unavailable." : "All free model attempts failed. Please try again later.");
};