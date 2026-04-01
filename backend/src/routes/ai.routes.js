import express from "express";
import { askAI, saveResponse, getModels, getAllResponses } from "../controllers/ai.controller.js";
import { validateRequest, askAISchema, saveResponseSchema } from "../validators/ai.validator.js";

const router = express.Router();

router.get("/models", getModels);
router.get("/history", getAllResponses);

router.post("/ask-ai", validateRequest(askAISchema), askAI);
router.post("/save", validateRequest(saveResponseSchema), saveResponse);

export default router;