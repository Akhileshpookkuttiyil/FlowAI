import axios from "axios";
import { config } from "../config/env.js";

let cachedModels = null;
let cacheTime = 0;
const CACHE_TTL = 300000;
const MODEL_FETCH_RETRIES = 3;
const MODEL_FETCH_RETRY_DELAY_MS = 1200;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildOpenRouterHeaders = () => {
  if (!config.openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const headers = {
    Authorization: `Bearer ${config.openRouterApiKey}`,
    "Content-Type": "application/json",
    "X-Title": config.openRouterAppName,
  };

  if (config.openRouterSiteUrl) {
    headers["HTTP-Referer"] = config.openRouterSiteUrl;
  }

  return headers;
};

export const getFreeModels = async () => {
  if (cachedModels && Date.now() - cacheTime < CACHE_TTL) return cachedModels;

  const headers = buildOpenRouterHeaders();

  let lastError = null;

  for (let attempt = 1; attempt <= MODEL_FETCH_RETRIES; attempt += 1) {
    try {
      const res = await axios.get("https://openrouter.ai/api/v1/models", {
        headers,
        timeout: 15000,
      });

      const models = res.data.data
        .filter((m) => m.pricing?.prompt === "0" || m.id.endsWith(":free"))
        .map((m) => ({ id: m.id, name: m.name }));

      if (models.length === 0) {
        throw new Error("No free models returned from OpenRouter.");
      }

      cachedModels = models;
      cacheTime = Date.now();
      return cachedModels;
    } catch (error) {
      lastError = error;

      if (attempt < MODEL_FETCH_RETRIES) {
        await wait(MODEL_FETCH_RETRY_DELAY_MS);
      }
    }
  }

  throw new Error(
    lastError?.response?.data?.error?.message ||
      lastError?.message ||
      "Failed to load available models."
  );
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
            ...buildOpenRouterHeaders(),
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
