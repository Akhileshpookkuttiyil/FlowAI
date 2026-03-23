import { askAIService, getFreeModels } from "../services/ai.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Response } from "../models/response.model.js";

export const askAI = asyncHandler(async (req, res) => {
  const { prompt, modelId } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
  }

  const result = await askAIService(prompt, modelId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getModels = asyncHandler(async (req, res) => {
  const models = await getFreeModels();
  res.status(200).json({
    success: true,
    data: models,
  });
});

export const saveResponse = asyncHandler(async (req, res) => {
  const { prompt, response } = req.body;

  if (!prompt || !response) {
    return res.status(400).json({
      success: false,
      message: "Prompt and response are required",
    });
  }

  const saved = await Response.create({
    prompt,
    response,
  });

  res.status(201).json({
    success: true,
    data: saved,
  });
});