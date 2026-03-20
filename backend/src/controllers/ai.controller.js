import { askAIService } from "../services/ai.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const askAI = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
  }

  const result = await askAIService(prompt);

  res.status(200).json({
    success: true,
    data: result,
  });
});