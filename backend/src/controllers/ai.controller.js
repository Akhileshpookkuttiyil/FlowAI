import { askAIService, getAvailableModels } from "../services/ai.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Response } from "../models/response.model.js";

export const askAI = asyncHandler(async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, error: "Unauthorized access" });
  }
  const { prompt, modelId } = req.body;

  try {
    const stream = await askAIService(prompt, modelId);

    // Set headers for Server-Sent Events (Streaming)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    stream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      response: null,
      error: error.message || "Failed to start AI stream",
    });
  }
});

export const getModels = asyncHandler(async (req, res) => {
  const models = await getAvailableModels();
  res.status(200).json({
    success: true,
    response: models,
    error: null,
  });
});

export const saveResponse = asyncHandler(async (req, res) => {
  const { prompt, response } = req.body;

  const saved = await Response.create({
    userId: req.userId,
    prompt,
    response,
  });

  res.status(201).json({
    success: true,
    response: saved,
    error: null,
  });
});

export const getAllResponses = asyncHandler(async (req, res) => {
  const history = await Response.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    response: history,
    error: null,
  });
});

