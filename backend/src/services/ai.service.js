import axios from "axios";
import { config } from "../config/env.js";

const MODEL_CACHE_TTL = 3600000;
let cachedModels = null;
let lastFetchTime = 0;

// Primary stable models to use as defaults/routers
const DEFAULT_MODELS = [
  "openrouter/free"
];

const buildHeaders = () => {
  if (!config.openRouterApiKey) {
    throw new Error("API Key missing. Please check your environment configuration.");
  }
  return {
    Authorization: `Bearer ${config.openRouterApiKey}`,
    "Content-Type": "application/json",
    "X-Title": "FlowAI Professional",
    "HTTP-Referer": config.openRouterSiteUrl || "http://localhost:5173",
  };
};

export const getAvailableModels = async () => {
  if (cachedModels && Date.now() - lastFetchTime < MODEL_CACHE_TTL) {
    return cachedModels;
  }

  try {
    const res = await axios.get("https://openrouter.ai/api/v1/models", {
      headers: buildHeaders(),
      timeout: 10000,
    });

    const models = res.data.data
      .filter((m) => {
        const isFree = m.id.endsWith(":free") || m.pricing?.prompt === "0";
        // Google Lyria yields 402; heavy Llama 3 models often yield 429
        const isReliable = !m.id.includes("lyria") && !m.id.includes("llama-3.1-405b") && !m.id.includes("llama-3.3-70b");
        return isFree && isReliable;
      })
      .map((m) => ({
        id: m.id,
        name: m.name,
        isDefault: DEFAULT_MODELS.includes(m.id),
      }))
      .sort((a, b) => {
        if (a.id === "openrouter/free") return -1;
        if (b.id === "openrouter/free") return 1;

        // Then prioritize Google Gemma 3 as they are stable
        if (a.id.includes("google/gemma-3") && !b.id.includes("google/gemma-3")) return -1;
        if (!a.id.includes("google/gemma-3") && b.id.includes("google/gemma-3")) return 1;
        
        return (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0);
      });

    cachedModels = models;
    lastFetchTime = Date.now();
    return models;
  } catch (error) {
    console.error("Model Fetch Error:", error.message);
    return DEFAULT_MODELS.map(id => ({ id, name: id.split('/')[1] || id, isDefault: true }));
  }
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const askAIService = async (prompt, modelId = null) => {
  const availableModels = await getAvailableModels();
  const targetModels = modelId ? [modelId] : availableModels.map(m => m.id);
  
  let lastAppError = null;

  for (const model of targetModels) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          stream: true,
        },
        {
          headers: buildHeaders(),
          responseType: "stream",
          timeout: 45000,
        }
      );

      return response.data;
    } catch (error) {
      lastAppError = error;
      if (modelId) break; 
      console.warn(`Model ${model} failed (${error.message}). Falling back...`);
      await delay(1000);
    }
  }

  const errorDetail = lastAppError?.response?.data?.error?.message || lastAppError?.message;
  throw new Error(errorDetail || "AI Service unavailable across all free models.");
};
