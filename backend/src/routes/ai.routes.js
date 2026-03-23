import express from "express";
import { askAI, saveResponse, getModels } from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/models", getModels);

router.post("/ask-ai", askAI);
router.post("/save", saveResponse);

export default router;