import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { askAI, saveResponse, getModels, getAllResponses } from "../controllers/ai.controller.js";
import { validateRequest, askAISchema, saveResponseSchema } from "../validators/ai.validator.js";

const router = express.Router();

router.get("/models", getModels);
router.get("/history", requireAuth, getAllResponses);

router.post("/ask-ai", validateRequest(askAISchema), askAI);
router.post("/save", requireAuth, validateRequest(saveResponseSchema), saveResponse);

export default router;